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
	$scope.alltabs = FunctionService.getDisplayFunctionList();
	$scope.log = function () {
		console.log(JSON.stringify($scope.data));
		console.log(JSON.stringify(FunctionService.getDisplayFunctionList()));
	};	
	$scope.activeIndex = FunctionService.getActive();
	$scope.setActive = function(index){
		FunctionService.setActive(index);
		$scope.activeIndex = FunctionService.getActive();
	};
	/*$scope.updateDisplayFunction = function(index, funcVal){
	FunctionService.setDisplayFunctionValue(index, funcVal);
	console.log(JSON.stringify($scope.displayFunctions));
	}*/
	/*Copy*/
	$scope.remove = function (scope) {
		scope.remove();
	};

	$scope.toggle = function (scope) {
		scope.toggle();
	};

	$scope.activity = function () {
		swal({
			title : "I will do the following:",
			text : JSON.stringify($scope.alltabs),
			imageUrl : "images/yeoman.png"
		});
	}
	
	$scope.numInputPattern = function(name){
		if (name === 'setX' || name === 'setY' || name === 'move') {
			return /^-?\d+$/;
		} else {
			return /^\d+$/;
		}
	}
});