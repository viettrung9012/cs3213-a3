'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	function useableObject(name, image) {
		this.name = name;
		this.image = image;
	}

	var oSpriteList = [
		new useableObject("mainSprite", "images/yeoman.png"),
		new useableObject("secondSprite", "images/hoboman.png")
	];

	var costumeList = [
		new useableObject("costume", "images/costume1.png")
	];

	var backgroundList = [
		new useableObject("background", "images/BG.jpg")
	];

	var spriteList = [];
	
	var broadcastSpriteList = function() {
		$rootScope.$broadcast('spriteListUpdate');
	};

	var addSpriteList = function(sName, sImage, x, y) {
		spriteList.push({
			name: sName + spriteList.length,
			image: sImage,
			show: true,
			x: x,
			y: y,
			data: [],
			costume: null
		});
		
		for(var i = 0; i < spriteList.length; i++) {
			if(spriteList[i].x == "auto") {
				spriteList[i].x = 0;
				spriteList[i].y = 0;
			}
		}
		
		broadcastSpriteList();
	};
	
	var replaceSpriteList = function(list){
		spriteList = list;
		broadcastSpriteList();
	}

	var updateSpriteList = function(index, list) {
		spriteList[index] = list;
		broadcastSpriteList();
	}

	return {
		getOriginalSpriteList : function(){
			return oSpriteList;
		},

		getCostumeList : function(){
			return costumeList;
		},

		getBackgroundList: function(){
			return backgroundList;
		},

		getSpriteList : function(){
			return spriteList;
		},
		
		removeSpriteList : function(obj){
			spriteList.splice(spriteList.indexOf(obj), 1);
			broadcast(spriteList);
 		},

		addSpriteList : addSpriteList,

		updateSpriteList : updateSpriteList,
		
		replaceSpriteList : replaceSpriteList
	}
});