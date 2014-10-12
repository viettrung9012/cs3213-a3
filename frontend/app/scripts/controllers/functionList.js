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
	$scope.data = FunctionService.getFunctionList();
	$scope.log = function(){
		console.log(JSON.stringify($scope.data));
		console.log(JSON.stringify(FunctionService.getFunctionList()));
	}
	$scope.addNewFunction = function(name, value){
		FunctionService.addDisplayFunction(name, value);
	}
  });
