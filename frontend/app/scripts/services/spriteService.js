'use strict';
angular.module('frontendApp')
.service('SpriteService', function ($rootScope) {
	function useableObject(name, image) {
		this.name = name;
		this.image = image;
	}

	var oSpriteList = [
		new useableObject("YeoMan", "images/yeoman.png"),
		new useableObject("HoboMan", "images/hoboman.png"),
		new useableObject("ChocoMan", "images/chocoman.png"),
		new useableObject("WhiteMan", "images/whiteman.png"),
		new useableObject("Baldwin", "images/baldwin.png"),
		new useableObject("Machamp", "images/machamp.png")
	];

	var costumeList = [
		new useableObject("costume", "images/empty.png"),
		new useableObject("costume", "images/costume1.png"),
		new useableObject("costume", "images/costume2.png"),
		new useableObject("costume", "images/costume3.png"),
		new useableObject("costume", "images/costume4.png"),
		new useableObject("costume", "images/costume5.png")
	];

	var backgroundList = [
		new useableObject("empty", "images/empty-bg.png"),
		new useableObject("background 1", "images/BG.jpg"),
		new useableObject("background 2", "images/BG2.jpg"),
		new useableObject("background 3", "images/BG3.jpg"),
		new useableObject("background 4", "images/BG4.jpg"),
		new useableObject("background 5", "images/BG5.png"),
		new useableObject("background 6", "images/BG6.png"),
		new useableObject("background 7", "images/BG7.jpg"),
		new useableObject("background 8", "images/BG8.jpg"),
		new useableObject("background 9", "images/BG9.jpg"),
		new useableObject("background 10", "images/BG10.jpg")
	];

	var soundList = [
		new useableObject("sound 1", "sound/elephant1.wav")
	];

	var spriteList = [];
	var background = 0;

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
			moving: false,
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

	var updateBackground = function(index) {
		background = index;
	}

	var resetProject = function(indec) {
		spriteList = [];
		background = backgroundList[0];
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
		
		getBackground : function(){
			return background;
		},

		removeSpriteList : function(obj){
			spriteList.splice(spriteList.indexOf(obj), 1);
			broadcast(spriteList);
 		},

		addSpriteList : addSpriteList,

		updateSpriteList : updateSpriteList,
		
		replaceSpriteList : replaceSpriteList,

		updateBackground : updateBackground
	}
});