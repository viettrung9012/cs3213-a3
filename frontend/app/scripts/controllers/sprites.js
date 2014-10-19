'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, $timeout, SpriteService, FunctionService) {
 	$scope.list = SpriteService.getSpriteList();
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
 	};

 	$scope.$on('runCommands', function(){
 		//console.log("Running");
 		$scope.play = true;
 		$scope.runCommands();
 		//console.log("Finished");
 	});

 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 		//console.log(JSON.stringify($scope.list));
 	});

 	var executeDelayedFunction = function(index, data, isMain) {
 		var iter = 0;
		var wait = 500;
		var cancel = false;
		var doActions = function(delay, j){
			//console.log("Delay", delay, ",", j);
			$timeout.cancel(cancel);

			if(!cancel) {
		 		//console.log("J: ", j, " doActions(", delay , ")");
				$timeout(function(){
	 				if(j < data.length) {
		 				//console.log(data[j].name);
		 				if(data[j].name == "repeat") {
		 					//console.log(data[j].nodes.length, ",", data[j].value);
		 					//delay = data[j].nodes.length * 500 * parseInt(data[j].value);
		 					delay = getRepeatLength(data[j]) * 550;
		 					//console.log("Before Repeat, RepeatLength: ", getRepeatLength(data[j]));
		 				} else {
		 					delay = 400;
		 				}
		 				runDataCommands(index, data[j]);
		 				j++;
		 			} else {
		 				cancel = true;
		 				if(isMain) {
		 					$scope.play = false;
		 				}
		 			}
		 			//console.log(" Delay: ", delay);
	 				doActions(delay, j);
				}, delay);
			}
		};
		//console.log(isMain, " ", wait);
		doActions(wait, iter);
 	}

 	var getRepeatLength = function(repeatData){
 		console.log(JSON.stringify(repeatData));
 		var total = 0;
 		for(var i = 0; i < repeatData.nodes.length; i++) {
 			if(repeatData.nodes[i].name == "repeat") {
 				total += getRepeatLength(repeatData.nodes[i]);
 			} else {
 				total++;
 			}
 		}

 		return total * repeatData.value;
 	}

 	$scope.runCommands = function(){
		//console.log(JSON.stringify($scope.list));
 		for(var i = 0; i < $scope.list.length; i++) {
 			executeDelayedFunction(i, $scope.list[i].data, true);
 		}
 	};

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
 		} else if (data.name == "repeat") {
 			commandRepeat(index, data);
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

 	var commandRepeat = function(index, data) {
 		var wait = (getRepeatLength(data) / data.nodes.length) * 400;
 		var repeatMoves = function(j, delay) {
 			$timeout(function() {
	 			if(j < data.value) {
	 				executeDelayedFunction(index, data.nodes, false);
	 				j++;
	 				repeatMoves(j);
	 			}
 			}, 400);
 		};

 		repeatMoves(0, wait);
 	}

 	var commandChangeCostume = function(index, value) {
 		$scope.list[index].costume = SpriteService.getCostumeList()[value].image;
 	}

 	var commandMove = function(index, value, degrees) {
	 	//console.log("Before Move: ", $scope.list[index].x, $scope.list[index].y);
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
 		$scope.background = SpriteService.getBackgroundList()[value].image;
 	}

  });
