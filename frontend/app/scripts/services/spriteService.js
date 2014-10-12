'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	var oSpriteList = [{
			name: "mainSprite",
			image: "images/yeoman.png",
			activityList: []
		}, {
			name: "secondSprite",
			image: "images/yeoman.png",
			activityList: []
		}
	];

	var spriteList = [];
	
	var broadcast = function(spriteList) {
		$rootScope.$broadcast('spriteList.update');
	};

	var addSpriteList = function(sName, sImage) {
		spriteList.push({
			name: sName,
			image: sImage,
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