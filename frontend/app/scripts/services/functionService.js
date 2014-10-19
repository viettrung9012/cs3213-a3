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
	function functionObject(name, value) {
		this.name = name;
		this.value = value;
		this.degrees = 0;
	}

	var functionList = [
		new functionObject("setX", 0),
		new functionObject("setY", 0),
		new functionObject("show", 0),
		new functionObject("hide", 0),
		new functionObject("move", 0),
		new functionObject("change costume", 0),
		new functionObject("change background", 0),
		new functionObject("repeat", 0)
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

		broadcastRun : broadcastRun
	}
});