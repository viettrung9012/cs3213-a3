'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FunctionsCtrl
 * @description
 * # FunctionsCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('FunctionsCtrl', function ($scope, FunctionService) {
    $scope.displayFunctions = FunctionService.getDisplayFunctionList();
	$scope.updateDisplayFunction = function(index, funcVal){
		FunctionService.setDisplayFunctionValue(index, funcVal);
		console.log(JSON.stringify($scope.displayFunctions));
	}
  });
