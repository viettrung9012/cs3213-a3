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
    $scope.data = FunctionService.getDisplayFunctionList();
	$scope.log = function(){
		console.log(JSON.stringify($scope.data));
		console.log(JSON.stringify(FunctionService.getDisplayFunctionList()));
	};
	/*$scope.updateDisplayFunction = function(index, funcVal){
		FunctionService.setDisplayFunctionValue(index, funcVal);
		console.log(JSON.stringify($scope.displayFunctions));
	}*/
	/*Copy*/
	$scope.remove = function(scope) {
      scope.remove();
    };
	
	$scope.toggle = function(scope) {
      scope.toggle();
    };
	
	$scope.activity = function(){
		swal({   title: "I will do the following:",   text: JSON.stringify($scope.data),   imageUrl: "images/yeoman.png" });
	}
  });
