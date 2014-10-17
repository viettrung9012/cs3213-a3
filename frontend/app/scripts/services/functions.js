'use strict';

/**
 * @ngdoc function
 * @name frontendApp.service:FunctionService
 * @description
 * # FunctionService
 * FunctionService class model of the frontendApp
 */
angular.module('frontendApp')
.service('FunctionService', function () {
	var functionList = [{
			name : "setX",
			isGlobal : false,
			value : 0
		}, {
			name : "setY",
			isGlobal : false,
			value : 0
		}, {
			name : "show",
			isGlobal : true,
			value : 0
		}, {
			name : "hide",
			isGlobal : true,
			value : 0
		}, {
			name : "move",
			isGlobal : false,
			value : 0
		}, {
			name : "change costume",
			isGlobal : false,
			value : 0
		}, {
			name : "change background",
			isGlobal : true,
			value : 0
		}, {
			name : "repeat",
			isGlobal : true,
			value : 0
		}
	]
	var global = {
		"name" : "global",
		"data" : []
	};
	var tempObj = {
		"name" : "temp",
		"data" : []
	};
	var tempObj1 = {
		"name" : "temp1",
		"data" : []
	}
	
	var alltabs = [];
	alltabs.push(global);
	alltabs.push(tempObj);
	alltabs.push(tempObj1);
	
	var activeIndex = 0;

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
			if (tabIndex == 0) {
				if (isGlobal) {
					alltabs[tabIndex]["data"].push({
						name : fName,
						value : fValue
					});
				}
			} else {
				if (fName !== "change background") {
					alltabs[tabIndex]["data"].push({
						name : fName,
						value : fValue
					});
				}
			}
		},
		setDisplayFunctionValue : function (index, fValue) {
			displayFunctionList[index]['value'] = (fValue == undefined || fValue == '') ? "0" : fValue;
		}
	}
});