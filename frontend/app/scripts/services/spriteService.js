'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	var spriteList = [];
	
	var broadcast = function(spriteList) {
		$rootScope.$broadcast('spriteList.update');
	};

	var update = function(newList) {
		spriteList = sList;
		broadcast(spriteLit);
	};


	return {
		spriteList : spriteList,
		update : update
	}
});