'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	var oSpriteList = [{
			name: "mainSprite",
			image: "images/yeoman.png"
		}, {
			name: "secondSprite",
			image: "images/hoboman.png"
		}
	];

	var spriteList = [];
	
	var broadcast = function(spriteList) {
		$rootScope.$broadcast('spriteListUpdate');
	};

	var addSpriteList = function(sName, sImage, x, y) {
		spriteList.push({
			name: sName + spriteList.length,
			image: sImage,
			show: true,
			x: x,
			y: y,
			data: []
		});
		broadcast(spriteList);
	};

	return {
		getOriginalSpriteList : function(){
			return oSpriteList;
		},

		getSpriteList : function(){
			return spriteList;
		},
		
		removeSpriteList : function(obj){
			spriteList.splice(spriteList.indexOf(obj), 1);
			broadcast(spriteList);
 		},

		addSpriteList : addSpriteList
	}
});