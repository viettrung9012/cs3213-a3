'use strict';

/**
 * @ngdoc function
 * @name frontendApp.service:FunctionService
 * @description
 * # FunctionService
 * FunctionService class model of the frontendApp
 */
angular.module('frontendApp')
.service('FunctionService', function ($rootScope) {
	function functionObject(name, value, delay, color) {
		this.name = name;
		this.initialValue = value;
		this.value = -1;
		this.degrees = 0;
		this.index = 0;
		this.expression2 = "x";
		this.expression = "true";
		this.delay = delay
		this.color = color;
	}

	var functionList = [
		new functionObject("setX", 0, 500, "#428bca"),
		new functionObject("setY", 0, 500, "#428bca"),
		new functionObject("move", 0, 500, "#428bca"),
		new functionObject("show", 0, 300, "#ec971f"),
		new functionObject("hide", 0, 300, "#ec971f"),
		new functionObject("set costume", 0, 100, "#449d44"),
		new functionObject("set background", 0, 100, "#449d44"),
		new functionObject("play sound", 0, 500, "#449d44"),
		new functionObject("repeat", 0, 100, "#c9302c"),
		new functionObject("repeat forever", 1000000, 10, "#c9302c"),
		new functionObject("while", 0, 100, "#c9302c"),
		new functionObject("if", 0, 100, "#c9302c"),
		new functionObject("=", 0, 50, "#31b0d5"),
	];
	
	var alltabs = [];
	var activeIndex = 0;

	var updateTabs = function(list){
		alltabs = list;
		if(activeIndex >= alltabs.length) {
			activeIndex = alltabs.length - 1;
		}
	}

	var broadcastRun = function(spriteList) {
		$rootScope.$broadcast('runCommands');
	};

	var broadcastStop = function() {
		$rootScope.$broadcast('stopCommands');
	}

	return {
		getActive : function(){
			return activeIndex;
		},
		setActive : function(index){
			activeIndex = index;
		},
		getFunctionList : function () {
			return functionList;
		},
		getDisplayFunctionList : function () {
			return alltabs;
		},
		addDisplayFunction : function (fName, fValue, isGlobal, tabIndex) {
			if(alltabs.length > 0) {
				alltabs[tabIndex]['data'].push(new functionObject(fName, fValue));
				$rootScope.$broadcast('updateDisplayFunction');
			}
		},
		setDisplayFunctionValue : function (index, fValue) {
			displayFunctionList[index]['value'] = (fValue == undefined || fValue == '') ? "0" : fValue;
		},

		updateTabs : updateTabs,
		broadcastRun : broadcastRun,
		broadcastStop : broadcastStop
	}
});