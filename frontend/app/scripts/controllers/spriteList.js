'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.cList = SpriteService.getCostumeList();
	$scope.bgList = SpriteService.getBackgroundList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(spr) {
  		SpriteService.addSpriteList(spr.name, spr.image, 0, 0);
  	}
  	$scope.onDragComplete=function(data,evt){
        console.log("drop success, data:", data);
        console.log(window.innerWidth + " " + window.innerHeight);
        var divTop = window.innerHeight*1/10+20;
        var divLeft = window.innerWidth*1/2;
        SpriteService.addSpriteList(data.name, data.image, evt.tx-divLeft, evt.ty-divTop);
        console.log(evt);
    }
  });
