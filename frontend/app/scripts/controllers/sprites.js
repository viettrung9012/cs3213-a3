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
 		$scope.play = true;
 		$scope.runCommands();
 	});

 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 	});

 	var executeDelayedFunction = function(index, data, isMain) {
 		var iter = 0;
		var wait = 500;
		var cancel = false;
		console.log(data);
		var linearData = getLinearFunctionsArray(data);
		console.log(linearData);
		var doActions = function(delay, j){
			$timeout.cancel(cancel);
			if(!cancel) {
				$timeout(function(){
	 				if(j < linearData.length) {
		 				runDataCommands(index, linearData[j]);
		 				j++;
		 			} else {
		 				cancel = true;
		 				if(isMain) {
		 					$scope.play = false;
		 				}
		 			}
	 				doActions(delay, j);
				}, delay);
			}
		};
		doActions(wait, iter);
 	}

 	var getLinearFunctionsArray = function(array){
 		var linear = [];
 		for(var i = 0; i < array.length; i++) {
 			if(array[i].name === "repeat") {
 				for(var j = 0; j < array[i].value; j++) {
 					linear = linear.concat(getLinearFunctionsArray(array[i].nodes));
 				}
 			} else {
 				linear.push(array[i]);
 			}
 		}
 		return linear;
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
