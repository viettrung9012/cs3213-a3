'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.oList = SpriteService.oSpriteList;
  	$scope.list = SpriteService.spriteList;

  	$scope.addSprite = function(sName, sImage) {
  		$scope.list.push({name:sName, image:sImage});
  		SpriteService.update($scope.list);
  	}
  });
