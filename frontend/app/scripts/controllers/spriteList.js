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
  	$scope.onDragComplete=function(data,evt,index){
        var divTop = window.innerHeight*1/10+20;
        var divLeft = window.innerWidth*1/2;
        var objPosX = parseInt(evt.tx-divLeft);
        var objPosY = parseInt(evt.ty-divTop);
        if (data.name!=='costume'&&data.name!=='background'){
          SpriteService.addSpriteList(data.name, data.image, objPosX, objPosY);
        } else if (data.name==='costume'){
          var list = SpriteService.getSpriteList();
          for (var i = 0; i<list.length; i++){
            if (list[i].x-50<=objPosX&&objPosX<=(list[i].x+50)
            && list[i].y-50<=objPosY&&objPosY<=(list[i].y+50)){
              list[i].costume = SpriteService.getCostumeList()[index].image;
            }
          }
          SpriteService.replaceSpriteList(list);
        } else if (data.name==='background'){
          if(divLeft>=0&&divTop>=0){
            SpriteService.updateBackground(index);
          }
        }   
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
