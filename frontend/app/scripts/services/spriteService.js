'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	var oSpriteList = [{
		name: "mainSprite",
		image: "images/yeoman.png",
		activityList: []
	}];

	var spriteList = [];
	
	var broadcast = function(spriteList) {
		$rootScope.$broadcast('spriteList.update');
	};

	var updateSpriteList = function(newList) {
		spriteList = newList;
		broadcast(spriteList);
	};

	return {
		oSpriteList : oSpriteList,
		spriteList : spriteList,
		update : updateSpriteList
	}
});