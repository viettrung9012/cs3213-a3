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
		new useableObject("background", "images/empty-bg.png"),
		new useableObject("background", "images/BG.jpg"),
		new useableObject("background", "images/BG2.jpg"),
		new useableObject("background", "images/BG3.jpg"),
		new useableObject("background", "images/BG4.jpg"),
		new useableObject("background", "images/BG5.png"),
		new useableObject("background", "images/BG6.png"),
		new useableObject("background", "images/BG7.jpg"),
		new useableObject("background", "images/BG8.jpg"),
		new useableObject("background", "images/BG9.jpg"),
		new useableObject("background", "images/BG10.jpg")
	];

	var soundList = [
		new useableObject("cat", "sound/cat.wav"),
		new useableObject("cow", "sound/cow.wav"),
		new useableObject("goat", "sound/goat.wav"),
		new useableObject("elephant", "sound/elephant.wav"),
		new useableObject("pig", "sound/pig.wav"),
		new useableObject("hello", "sound/hello.wav"),
	];

	var spriteList = [];
	var background = 0;
	var varNames = [];
	var varValues = [];

	var broadcastSpriteList = function() {
		$rootScope.$broadcast('spriteListUpdate');
		$rootScope.$broadcast('varUpdate');
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

	var removeSpriteFromList = function(index) {
		spriteList.splice(index, 1);
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

	var updateVariables = function(name, values) {
		varNames = name;
		varValues = values;
		$rootScope.$broadcast('varUpdate');
	}

	var getVariables = function() {
		var temp = [];
		for(var j = 0; j < varNames.length; j++) {
			temp.push([varNames[j], varValues[j]]);
		}
		return temp;
	}

	return {
		getOriginalSpriteList : function(){
			return oSpriteList;
		},

		getCostumeList : function(){
			return costumeList;
		},

		getSoundList : function() {
			return soundList;
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

		removeSpriteFromList: removeSpriteFromList,

		updateBackground : updateBackground,

		updateVariables: updateVariables,

		getVariables: getVariables,
	}
});