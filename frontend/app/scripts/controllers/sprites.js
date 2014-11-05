'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, $timeout, SpriteService, FunctionService) {
 	$scope.delay = 500;
 	$scope.timers = [];
 	$scope.varList = [];
 	$scope.varValue = [];
 	$scope.operators = ["+","-","*","/","||", "&&", "==", ">", "<", ">=", "<=", "!=", "/="];
 	$scope.stopPlay = false;
 	$scope.totalPlay = 0;
 	$scope.list = SpriteService.getSpriteList();
 	$scope.background = SpriteService.getBackgroundList()[SpriteService.getBackground()].image;
 	$scope.$watch(
 		function() {return SpriteService.getBackground();},
 		function() {
 			$scope.background = SpriteService.getBackgroundList()[SpriteService.getBackground()].image;
 		}
 	);

 	$scope.$watch(
 		function() {return $scope.totalPlay;},
 		function() {
 			if($scope.totalPlay <= $scope.list.length) {
 				$scope.play = false;
 				$scope.totalPlay = 0;
 			}
 		}
 	);

 	$scope.background = null;
 	$scope.index = -1;
 	$scope.steps = 10;
 	$scope.play = false;

 	$scope.$on('spriteListUpdate', function(){
 		FunctionService.updateTabs($scope.list);
 		$scope.list=SpriteService.getSpriteList();
		//console.log(JSON.stringify($scope.list));
 	});

 	$scope.remove = function(index) {
 		$scope.list.splice(index, 1);
 		FunctionService.updateTabs($scope.list);
 	};

 	$scope.$on('runCommands', function(){
 		$scope.play = true;
 		$scope.runCommands();
 	});

 	$scope.$on('stopCommands', function(){
 		$scope.stop();
 	});
	
 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 	});
	

 	var CommandStream = function(SpriteObject) {
 		this.functionIndex = 0;
 		this.functionList = JSON.parse(JSON.stringify(SpriteObject.data));
 	};

 	var getNext = function(com){
		if(com.functionIndex >= com.functionList.length) {
			return null;
		}

		var next;
		do {
			next = getNextCom(com.functionList, com.functionIndex, true, com);
		} while(next != null && next.name === "stop");
		return next;
 	};

 	var getNextCom = function(list, index, base, com, objIndex) {
		if(index >= list.length) {
			return null;
		}
		var current = list[index];
		if(current.value === -1) {
			current.value = current.initialValue;
		}
		var next;

		if(current.name.indexOf("repeat") > -1) {
			if(current.degrees == 0) {
				current.nodes.push({name:"stop"});
				current.degrees = 1;
			}

			if(current.index >= current.nodes.length) {
				current.index = 0;
				current.value--;
			}

			if(current.value > 0) {
				next = getNextCom(current.nodes, current.index, false, com, objIndex);
				if(current.nodes[current.index].name.indexOf("repeat") > -1) {
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} else {
					current.index++;
				}
			} else {
				index++;
				if(base) {
					com.functionIndex = index;
				}
				next = getNextCom(list, index, base, com, objIndex);
				current.value = -1;
			}
		} else if (current.name == "if") {
			console.log(current);
			console.log($scope.evaluateExpression(current.expression, objIndex));
			if($scope.evaluateExpression(current.expression, objIndex) && current.index < current.nodes.length) {
				next = getNextCom(current.nodes, current.index, false, com, objIndex);
				if(current.nodes[current.index].name.indexOf("repeat") > -1) {
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} else {
					current.index++;
				}
			} else {
				index++;
				if(base) {
					com.functionIndex = index;
				}
				next = getNextCom(list, index, base, com, objIndex);
			}
		} else {
			next = current;
			if(base) {
				com.functionIndex++;
			}
		}

		return next;
	};

	$scope.evaluateExpression = function(expression, index) {
		var arr = expression.trim().split(/\s+/);
		var exp = "";

		for(var i = 0; i < arr.length; i++) {
			if(!isNaN(arr[i]) || contains($scope.operators, arr[i])) {
				exp += arr[i];
			} else if (arr[i] === "true" || arr[i] === "false"){
				exp += arr[i];
			} else if (arr[i] === "pos.x" || arr[i] === "position.x") {
				exp += $scope.list[index].x.toString();
			} else if(arr[i] === "pos.y" || arr[i] === "position.y")  {
				exp += $scope.list[index].y.toString();
			} else {
				var temp = arr[i].split("!");
				for(var j = 0; j < temp.length - 1; j++) {
					exp += "!";
				}

				if(contains($scope.varList)) {
					exp += $scope.varValue.indexOf(arr[i]);
				} else {
					$scope.varList.push(arr[i]);
					$scope.varValue.push(0);
					exp += "0";
				}
			}
		}

		try {
			return eval(exp);
		} catch (e) {
			if (e instanceof SyntaxError) {
       			alert("Syntax Error at expression: " + expression);
   			}
		}
	}

	function contains(a, obj) {
    	var i = a.length;
    	while (i--) {
       		if (a[i] === obj) {
           		return true;
       		}
    	}
    	return false;
	}

 	$scope.stop = function() {
 		$scope.stopPlay = true;
 		$scope.totalPlay = $scope.list.length;
 		while($scope.timers.length > 0) {
 			$timeout.cancel($scope.timers.pop());
 		}
 	}
 	

 	$scope.runCommands = function() {
 		$scope.totalPlay = 0;
 		$scope.stopPlay = false;
 		for(var i = 0; i < $scope.list.length; i++) {
 			$scope.executeFunctions(i);
 		}
 	}

	$scope.executeFunctions = function(spriteIndex) {
		var sprite = $scope.list[spriteIndex];
		var functionQueue = new CommandStream(sprite);
		var doActions = function() {
			$scope.timers.push($timeout(function(){
				var data = getNext(functionQueue);
				if(data != null && $scope.stopPlay == false) {
					runDataCommands(spriteIndex, data);
					doActions();
				} else {
					$scope.totalPlay++;
				}
			}, $scope.delay));
		};

		doActions();
	}

 	var runDataCommands = function(index, data) {
 		if (data.name == "setX") {
 			commandSetX(index, data.value);
 		} else if (data.name == "setY") {
 			commandSetY(index, data.value);
 		} else if (data.name == "show") {
 			commandShow(index);
 		} else if (data.name == "hide") {
 			commandHide(index);
 		} else if (data.name == "move") {
 			commandMove(index, data.value, data.degrees);
 		} else if (data.name == "change costume") {
 			commandChangeCostume(index, data.value);
 		} else if (data.name == "change background") {
 			commandChangeBackground(data.value);
 		} 
 		SpriteService.updateSpriteList(index, $scope.list[index]);
 	}

 	var commandSetX = function(index, setX) {
		$scope.list[index].x = parseInt(setX);
 	}
	
 	var commandSetY = function(index, setY) {
 		$scope.list[index].y = parseInt(setY);
 	}

 	var commandShow = function(index) {
 		$scope.list[index].show = true;	
 	}

 	var commandHide = function(index) {
	 	$scope.list[index].show = false;
 	}

 	var commandChangeCostume = function(index, value) {
 		$scope.list[index].costume = SpriteService.getCostumeList()[value].image;
 	}

 	var commandMove = function(index, value, degrees) {
 		$scope.list[index].moving = true;
 		var distance = value * $scope.steps;
 		degrees = (degrees + 180) * -1;
 		var angle = degrees - 360 * Math.floor(degrees/360);
 		var horizontal = Math.floor(Math.sin(angle * (Math.PI / 180)) * distance);
 		var vertical = Math.floor(Math.cos(angle * (Math.PI / 180)) * distance);
 		
 		if($scope.list[index].x === "auto") {
 			$scope.list[index].x = horizontal;
 		} else {
 			$scope.list[index].x = parseInt($scope.list[index].x) + horizontal;
 		}

 		if($scope.list[index].y === "auto") {
 			$scope.list[index].y = vertical;
 		} else {
 			$scope.list[index].y = parseInt($scope.list[index].y) + vertical;
 		}
 	}

 	var commandChangeBackground = function(value) {
 		SpriteService.updateBackground(value);
 	}

  });
