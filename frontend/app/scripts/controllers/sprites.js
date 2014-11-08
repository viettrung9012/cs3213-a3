'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, $timeout, SpriteService, FunctionService) {
 	$scope.sounds = SpriteService.getSoundList();
 	$scope.delay = 500;
 	$scope.timers = [];
 	$scope.varList = [];
 	$scope.varValue = [];
 	$scope.operators = ["+","-","*","/","|", "&", "=", ">", "<", "!"];
 	$scope.validOperators = ["+", "-", "*", "||", "&&", "==", "===", ">", ">=", "<", "<=", "!="];
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
			next = getNextCommand(com.functionList, com.functionIndex, true, com);
		} while(next != null && next.name === "stop");
		return next;
 	};
 	
 	var getNextCommand = function(list, index, base, com, objIndex) {
 		if(index >= list.length) return null;
 		var current = list[index];
 		if(current.value === -1) current.value = current.initialValue;
 		var next;

 		if(current.name.indexOf("repeat") > -1) {
 			if(current.degrees === 0) {current.nodes.push({name:"stop"}); current.degrees = 1;}
 			//if at the end of commands in current iteration of repeat
 			//go to next iteration
 			if(current.index >= current.nodes.length) {
 				current.index = 0;
 				current.value--;
 			}

 			//if not yet finished all repeats
 			if(current.value > 0) {
 				next = getNextCommand(current.nodes, current.index, false, com, objIndex);
 				//if the next command in the repeat is a nested repeat
 				if(current.nodes[current.index].name.indexOf("repeat") != -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				}  
				//next command is an "IF"
				else if(current.nodes[current.index].name === "if") {
					if(current.nodes[current.index].index >= current.nodes[current.index].nodes.length) {
						current.nodes[current.index].index = 0;
						current.index++;
					}	
				}
				// do next command
				else {
					current.index++;
				}
 			} 
 			// else, completed all repeat iterations in current nest level
 			else {
 				index++;
 				if(base) {com.functionIndex = index;}
 				next = getNextCommand(list, index, base, com, objIndex);
 				current.value = -1;
 			}
 		} else if (current.name === "if") {
 			if(current.degrees === 0) {current.nodes.push({name:"stop"});current.degrees = 1;}
 			//if expression evaluates to true, and not all commands in "IF" is completed
			if($scope.evaluate(current.expression, objIndex) && current.index < current.nodes.length) {
				next = getNextCommand(current.nodes, current.index, false, com, objIndex);
				//if the next command in the repeat is a nested repeat
				if(current.nodes[current.index].name.indexOf("repeat") > -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} else {
					current.index++;
				}
			} else {
				current.index = 0;
				index++;
				if(base) {
					com.functionIndex = index;
				}
				next = getNextCommand(list, index, base, com, objIndex);
				current.index = 0;
			}
 		} else if(current.name === "while") {
 			 if(current.degrees === 0) {current.nodes.push({name:"stop"}); current.degrees = 1;}
 			//if at the end of commands in current iteration of repeat
 			//go to next iteration
 			if(current.index >= current.nodes.length) {
 				current.index = 0;
 			}

 			//if not yet finished all repeats
 			if(current.value > 0) {
 				next = getNextCommand(current.nodes, current.index, false, com, objIndex);
 				//if the next command in the repeat is a nested repeat
 				if(current.nodes[current.index].name.indexOf("repeat") != -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				}  
				//next command is an "IF"
				else if(current.nodes[current.index].name === "if") {
					if(current.nodes[current.index].index >= current.nodes[current.index].nodes.length) {
						current.nodes[current.index].index = 0;
						current.index++;
					}	
				}
				// do next command
				else {
					current.index++;
				}
 			} 
 			// else, completed all repeat iterations in current nest level
 			else {
 				index++;
 				if(base) {com.functionIndex = index;}
 				next = getNextCommand(list, index, base, com, objIndex);
 				current.value = -1;
 			}
 		}else {
			next = current;
			if(base) {
				com.functionIndex++;
			}
		}

		return next;
 	}

	$scope.evaluate = function(expression, index) {
		var lexemes = new ExpressionLexer(expression);
		var token = lexemes.getNextToken();
		var exp = "";
		while(token !== "EOL") {
			if(!isNaN(token)) {
				exp += token;
			} else if ($scope.validOperators.indexOf(token) != -1) {
				exp += token;
			} else if (token === "posX" || token === "positionX") {
				exp += parseInt($scope.list[index].x).toString();
			} else if (token === "posY" || token === "positionY") {
				exp += parseInt($scope.list[index].y).toString();
			} else if (token === "true" || token === "false") {
				exp += token;
			} else {
				if($scope.varList.indexOf(token) != -1) {
					exp += $scope.varValue[$scope.varList.indexOf(token)];
				} else {
					$scope.varList.push(token);
					$scope.varValue.push(0);
					exp += 0;
				}
			}
			token = lexemes.getNextToken();
		}

		//console.log(exp);
		return eval(exp);
 	}

	function contains(a, obj) {
    	var i = a.length - 1;
    	while (i >= 0) {
       		if (a[i] === obj) {
           		return i;
       		}
    	}
    	return i;
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
 		} else if (data.name == "set costume") {
 			commandChangeCostume(index, data.value);
 		} else if (data.name == "set background") {
 			commandChangeBackground(data.value);
 		} else if (data.name == "=") {
 			commandAssign(index, data.expression2, data.expression);
 		} else if (data.name == 'play sound') {
 			commandPlaySound(data.value);
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

 	var commandPlaySound = function(value) {
 		var audio = new Audio($scope.sounds[value].image);
 		audio.play();
 	}

 	var commandAssign = function(index, op1, op2) {
 		var temp = $scope.evaluate(op2, index);
 		if($scope.varList.indexOf(op1) != -1) {
 			var i = $scope.varList.indexOf(op1);
 			$scope.varValue[i] = temp;
 		} else {
 			$scope.varList.push(op1);
 			$scope.varValue.push(temp);
 		}

 		console.log($scope.varList);
 		console.log($scope.varValue);
 	}

 	/*
 	var commandAssign = function(index, variable, expression) {
 		var temp = $scope.evaluateExpression(expression, index);
 		var arr = variable.trim().split(/\s+/);
 		if(arr.length > 1) {
 			$scope.stop();
 			alert("Syntax Error: " + variable + "is not a valid variable");
 		} else {
 			var arr2 = arr[0].split("!");
 			if(arr2.length > 1) {
 				$scope.stop();
 				alert("Syntax Error: " + variable + "is not a valid variable");
 			} else {
 				if(contains($scope.varList, variable) >= 0) {
 					$scope.varValue[$scope.varList.indexOf(variable)] = temp;
 				} else {
 					$scope.varList.push(variable);
 					$scope.varValue.push(temp);
 				}
 			}
 		} 
 		console.log("Assign START");
 		console.log($scope.varList);
 		console.log($scope.varValue);
 		console.log($scope.varList.indexOf(variable));
 		console.log("Assign END");
 	}
 	*/

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

 	var ExpressionLexer = function(expression) {
 		this.Lexemes = expression.split("");
 		this.LexemeTypes = (function(exp){
 			var foo = [];
 			var temp = expression.split("");
 			for(var i = 0; i < temp.length; i++) {
 				if($scope.operators.indexOf(temp[i]) != -1) {
 					foo.push(0);
 				} else if(!isNaN(temp[i])) {
 					foo.push(1);
 				} else if(temp[i] == ".") {
 					foo.push(3);
 				} else if(temp[i] == " ") {
 					foo.push(4);
 				} else if(temp[i] == "_") {
 					foo.push(5);
 				} else if(/^[a-zA-Z]{1}$/.test(temp[i])) {
 					foo.push(6);
 				} else if(temp[i] == "(" || temp[i] == ")") {
 					foo.push(7);
 				} else {
 					foo.push(-1);
 				}
 			}
 			return foo;
 		})(expression);
 		this.index = 0;
 	}
 	//-1: Error
 	// 0: Operators
 	// 1: INTEGER
 	// 2: !
 	// 3: .
 	// 4: WHITESPACE
 	// 5: _
 	// 6: Alphabet
 	// 7: BRACKETS
 	ExpressionLexer.prototype.getNextToken = function() {
 		if(this.index >= this.Lexemes.length) {
 			return "EOL";
 		}
 		while(this.LexemeTypes[this.index] === 4) {
 			this.index++;
 		}
 		var type = this.LexemeTypes[this.index];
 		var current = this.Lexemes[this.index++];
 		switch(type) {
 			case 2: case 7:
 				return current;
 			case 0:
 				while(this.LexemeTypes[this.index] === 0) {
 					current += this.Lexemes[this.index++];
 				} 
 				return current;
 			case 1:
 				while(this.LexemeTypes[this.index] === 1) {
 					current += this.Lexemes[this.index++];
 				}
 				if (this.LexemeTypes[this.index] === ".") {
 					current += "."
 					this.index++;
 					while(this.LexemeTypes[this.index] === 1) {
 						current += this.Lexemes[this.index++];
 					}
 				}
 				return current;
 			case 5: case 6:
 				while(this.LexemeTypes[this.index] === 1 || this.LexemeTypes[this.index] === 5 || this.LexemeTypes[this.index] === 6) {
 					current += this.Lexemes[this.index++];
 				}
 				return current;
 			default:
 				return "ERROR";
 		}
 	}

  });
