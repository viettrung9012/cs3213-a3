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
			value : 0
		}, {
			name : "setY",
			value : 0
		}, {
			name : "show"
		}, {
			name : "hide"
		}, {
			name : "move",
			value : 0
		}, {
			name : "repeat",
			value : 0
		}
	]
	var displayFunctionList = [];
	return {
		getFunctionList : function () {
			return functionList;
		},
		getDisplayFunctionList : function () {
			return displayFunctionList;
		},
		addDisplayFunction : function (fName, fValue) {
			displayFunctionList.push({
				name : fName,
				value : fValue
			});
		},
		setDisplayFunctionValue : function (index, fValue) {
			displayFunctionList[index]['value'] = (fValue==undefined||fValue=='')?"0":fValue;
		}
	}
});