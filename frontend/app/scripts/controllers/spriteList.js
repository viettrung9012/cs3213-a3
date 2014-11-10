'use strict';

angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope, $rootScope, SpriteService) {
  	$scope.oList = SpriteService.getOriginalSpriteList();
  	$scope.cList = SpriteService.getCostumeList();
	$scope.bgList = SpriteService.getBackgroundList();
  	$scope.list = SpriteService.getSpriteList();
  	$scope.addSprite = function(spr) {
  		SpriteService.addSpriteList(spr.name, spr.image, 0, 0);
  	};
  	$scope.onDragComplete=function(data,evt){
        var divTop = window.innerHeight*1/10+20;
        var divLeft = window.innerWidth*1/2;
        SpriteService.addSpriteList(data.name, data.image, parseInt(evt.tx-divLeft), parseInt(evt.ty-divTop));
    };
    $scope.sounds = [
		{index: '0', name: 'cat'},
		{index: '1', name: 'cow'},
		{index: '2', name: 'goat'},
		{index: '3', name: 'elephant'},
		{index: '4', name: 'pig'},
		{index: '5', name: 'hello'},
	 ]
  });
