'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, SpriteService, SFService) {
 	$scope.list = SpriteService.getSpriteList();
 	$scope.index = -1;

 	$scope.setPosition = function(that) {
 		//console.log($index);
 		//console.log(that);
 		//$scope.list[$scope.list.length - 1].posX = event.offsetX;
 		//$scope.list[$scope.list.length - 1].posY = event.offsetY;

 		//console.log($scope.list[$scope.list.length - 1].posX );
 		//console.log($scope.list[$scope.list.length - 1].posY );
 	}

 	$scope.$on('spriteListUpdate', function(){
 		SFService.updateSpriteList($scope.list);
 	});
	

 	$scope.remove = function(index) {
 		$scope.list.splice(index, 1);
 	}

 	$scope.onDragHandler = function(event, index) {
 		//$scope.index = index;
 		//console.log(index);
 	}

 	$scope.runCommands = function(func){
 		var activityList = func.activityList;
 		for(activity in activityList) {
 			switch(activity.name) {
 				case "setX":
 					break;
 				case "setY":
 					break;
 				case "show":
 					break;
 				case "hide":
 					break;
 				case "move":
 					break;
 				case "repeat":
 					//runCommands(activity.activity);
 					break;
 				default:
 			}
 		}

 	}

  });
