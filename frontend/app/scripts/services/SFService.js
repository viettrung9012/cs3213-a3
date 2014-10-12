'use strict';

angular.module('frontendapp')
.service('SFService', function(){
	var spriteList = [];
	//contains the boxes which contains the functions for each sprite
	var functionBox = [];

	return {
		var getSpriteList = function() {
			return spriteList;
		},

		var getFunctionBox = function() {
			return functionBox;
		}

		var updateSpriteList = function(list) {
			spriteList = list;
		}

		var updateFunctionBox = function(list) {
			functionBox = list;
			//update spriteList in sprite controller
		}
	}
});