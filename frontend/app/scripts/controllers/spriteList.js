'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, $rootScope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.cList = SpriteService.getCostumeList();
	$scope.bgList = SpriteService.getBackgroundList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(spr) {
  		SpriteService.addSpriteList(spr.name, spr.image, 0, 0);
  	}
  	$scope.onDragComplete=function(data,evt){
        var divTop = window.innerHeight*1/10+20;
        var divLeft = window.innerWidth*1/2;
        SpriteService.addSpriteList(data.name, data.image, parseInt(evt.tx-divLeft), parseInt(evt.ty-divTop));
    }
  });
