'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	var oSpriteList = [{
			name: "mainSprite",
			image: "images/yeoman.png",
			activityList: []
		}, {
			name: "secondSprite",
			image: "images/hoboman.png",
			activityList: []
		}
	];

	var spriteList = [];
	
	var broadcast = function(spriteList) {
		$rootScope.$broadcast('spriteList.update');
	};

	var addSpriteList = function(sName, sImage, x, y) {
		spriteList.push({
			name: sName,
			image: sImage,
			x: x,
			y: y,
			activityList: []
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
		/*
		addSpriteList : function(sName, sImage) {
			spriteList.push({
				name: sName,
				image: sImage,
				activityList: []
			});
		}
		*/
	}
});