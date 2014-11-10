'use strict';

/**
 * @ngdoc function
 * @name frontendApp.service:FunctionService
 * @description
 * # FunctionService
 * FunctionService class model of the frontendApp
 */
angular.module('frontendApp')
.service('FunctionService', function ($rootScope, SpriteService) {
	function functionObject(name, value, delay, color) {
		this.name = name;
		this.initialValue = value;
		this.value = -1;
		this.degrees = 0;
		this.index = 0;
		this.expression2 = "x";
		this.expression = "true";
		this.delay = delay;
		this.color = color;
		this.evaluated = false;
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
		new functionObject("if collision", 0, 100, "#c9302c"),
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
	};

	var vars = [];

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
		getVars : function(){
			return vars;
		},
		updateVars : function(v, t){
			var newArr = [];
			var objectList = SpriteService.getSpriteList();
			console.log(objectList);
			for (var i = 0; i<objectList.length; i++){
				newArr.push({name: objectList[i].name+"-x", value: objectList[i].x});
				newArr.push({name: objectList[i].name+"-y", value: objectList[i].y});
			}
			for (var i = 0; i < v.length; i++){
				newArr.push({name: v[i], value: t[i]});
			}
			vars = newArr;
			$rootScope.$broadcast('updateVars');
		},

		updateTabs : updateTabs,
		broadcastRun : broadcastRun,
		broadcastStop : broadcastStop
	}
});