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
	var functionList = [{
			name : "setX",
			value : 0
		}, {
			name : "setY",
			value : 0
		}, {
			name : "show",
			value : 0
		}, {
			name : "hide",
			value : 0
		}, {
			name : "move",
			value : 0
		}, {
			name : "change costume",
			value : 0
		}, {
			name : "change background",
			value : 0
		}, {
			name : "repeat",
			value : 0
		}
	]
	
	var alltabs = [];
	var activeIndex = 0;

	var updateTabs = function(list){
		alltabs = list;
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
				alltabs[tabIndex]['data'].push({
					name : fName,
					value : fValue
				});
			}
			$rootScope.$broadcast('updateDisplayFunction');
		},
		setDisplayFunctionValue : function (index, fValue) {
			displayFunctionList[index]['value'] = (fValue == undefined || fValue == '') ? "0" : fValue;
		},

		updateTabs : updateTabs,

		broadcastRun : broadcastRun
	}
});