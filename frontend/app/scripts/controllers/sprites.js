'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, SpriteService, FunctionService) {
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
 		$scope.play = false;
 		//console.log("Finished");
 	});

 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 		//console.log(JSON.stringify($scope.list));
 	});

 	$scope.runCommands = function(){
		//console.log(JSON.stringify($scope.list));
 		for(var i = 0; i < $scope.list.length; i++) {
 			console.log($scope.list[i].data);
 			for(var j = 0; j < $scope.list[i].data.length; j++){
 				runDataCommands(i, $scope.list[i].data[j]);
 			}
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
 		SpriteService.updateSpriteList($scope.list);
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
 		for(var j = 0; j < data.value; j++) {
	 		console.log("Repeating ", j, "th time");
	 		for(var i = 0; i < data.nodes.length; i++) {
				runDataCommands(index, data.nodes[i]);	
			}
		}
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
