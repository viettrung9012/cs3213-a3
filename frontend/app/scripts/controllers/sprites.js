'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, SpriteService, FunctionService) {
 	$scope.list = SpriteService.getSpriteList();
 	$scope.index = -1;
 	$scope.play = false;

 	$scope.$on('spriteListUpdate', function(){
 		FunctionService.updateTabs($scope.list);
 	});

 	$scope.remove = function(index) {
 		$scope.list.splice(index, 1);
 	};

 	$scope.$on('runCommands', function(){
 		$scope.play = true;
 		$scope.runCommands();
 		$scope.play = false;
 	});

 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 		//console.log(JSON.stringify($scope.list));
 	});

 	$scope.runCommands = function(){
 		//console.log(JSON.stringify($scope.list));
 		for(var i = 0; i < $scope.list.length; i++) {
 			//console.log($scope.list[i].data);
 			for(var j = 0; j < $scope.list[i].data.length; j++){
 				runDataCommands(i, $scope.list[i].data[j]);
 			}
 		}
 	};

 	var runDataCommands = function(index, data) {
 		if (data.name == "setX") {

 		} else if (data.name == "setY") {

 		} else if (data.name == "show") {
 			commandShow(index);
 		} else if (data.name == "hide") {
 			commandHide(index);
 		} else if (data.name == "move") {
 			
 		} else if (data.name == "repeat") {
 			commandRepeat(index, data);
 		} else if (data.name == "change costume") {
 			
 		}
 	}

 	var commandSetX = function(index, setX) {
 		$scope.list[index].x += setX;
 		console.log($scope.list[index].x);
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

  });
