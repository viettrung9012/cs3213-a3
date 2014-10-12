'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(sName, sImage) {
  		SpriteService.addSpriteList(sName, sImage);
  	}
  });
