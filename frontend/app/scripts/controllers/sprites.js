'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, SpriteService, SFService) {
 	$scope.list = SpriteService.getSpriteList();
 	
 	$scope.setPosition = function(event, index) {
 		//$scope.list[$scope.list.length - 1].posX = event.offsetX;
 		//$scope.list[$scope.list.length - 1].posY = event.offsetY;
 	}

 	$scope.$on('spriteListUpdate', function(){
 		SFService.updateSpriteList($scope.list);
 	});

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
