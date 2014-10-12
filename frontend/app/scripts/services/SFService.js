'use strict';

angular.module('frontendApp')
.service('SFService', function(){
	var spriteList = [];
	//contains the boxes which contains the functions for each sprite
	var functionBox = [];

	return {
		getSpriteList : function() {
			return spriteList;
		},

		getFunctionBox : function() {
			return functionBox;
		},

		updateSpriteList : function(spr) {
			spriteList.push(spr);
		},

		updateFunctionBox : function(spr) {
			functionBox.push(spr);
			//update spriteList in sprite controller
		}
	};
});