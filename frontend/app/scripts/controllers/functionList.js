'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FunctionListCtrl
 * @description
 * # FunctionListCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('FunctionListCtrl', function ($scope, FunctionService) {
	$scope.functions = FunctionService.getFunctionList();
	$scope.addNewFunction = function(name, value){
		FunctionService.addDisplayFunction(name, value);
	}
  });
