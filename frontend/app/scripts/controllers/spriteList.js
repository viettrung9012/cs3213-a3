'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.cList = SpriteService.getCostumeList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(spr) {
  		SpriteService.addSpriteList(spr.name, spr.image, 0, 0);
  	}
  });
