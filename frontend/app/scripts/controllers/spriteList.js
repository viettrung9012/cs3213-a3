'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.list = SpriteService.spriteList;
  	$scope.addSprite = function(newSprite) {
  		$scope.list.push(newSprite);
  		SpriteService.update($scope.list);
  	}
  });
