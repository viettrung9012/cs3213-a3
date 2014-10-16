'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(sName, sImage, x, y) {
  		SpriteService.addSpriteList(sName, sImage, 0, 0);
  	}
  });
