'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, SpriteService) {
 	$scope.list = SpriteService.spriteList;
 	$scope.$on('spriteList.update', function(){
 		$scope.list = SpriteService.spriteList;
 	});
  });
