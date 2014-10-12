'use strict';
angular.module('frontendApp')
.service('SpriteService', function () {
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

	return {
		getOriginalSpriteList : function(){
			return oSpriteList;
		},

		getSpriteList : function(){
			return spriteList;
		},
		
		var addSpriteList = function(sName, sImage) {
			spriteList.push({
				name: sName,
				image: sImage,
				activityList: []
			});
			broadcast(spriteList);
		};

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