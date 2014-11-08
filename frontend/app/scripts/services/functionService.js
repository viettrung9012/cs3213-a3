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
	function functionObject(name, value, delay) {
		this.name = name;
		this.initialValue = value;
		this.value = -1;
		this.degrees = 0;
		this.index = 0;
		this.expression2 = "x";
		this.expression = "true";
		this.delay = delay
	}

	var functionList = [
		new functionObject("setX", 0, 500),
		new functionObject("setY", 0, 500),
		new functionObject("show", 0, 300),
		new functionObject("hide", 0, 300),
		new functionObject("move", 0, 500),
		new functionObject("set costume", 0, 100),
		new functionObject("set background", 0, 100),
		new functionObject("repeat", 0, 100),
		new functionObject("repeat forever", 1000000, 10),
		new functionObject("while", 0, 100),
		new functionObject("if", 0, 100),
		new functionObject("=", 0, 50),
		new functionObject("play sound", 0, 500),

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