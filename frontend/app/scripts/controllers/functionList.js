'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FunctionListCtrl
 * @description
 * # FunctionListCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('FunctionListCtrl', function ($scope, FunctionService, SpriteService) {
	$scope.vars = SpriteService.getVariables();
	
	$scope.$on('varUpdate', function(){
		$scope.vars = SpriteService.getVariables();
	});

	var reinitializeData = function(){
		$scope.data = JSON.parse(JSON.stringify(FunctionService.getFunctionList()))
	}
	reinitializeData();
	$scope.log = function () {
		console.log(JSON.stringify($scope.data));
		console.log(JSON.stringify(FunctionService.getFunctionList()));
	};
	$scope.addNewFunction = function (name, value, bool) {
		$scope.activeIndex = FunctionService.getActive();
		FunctionService.addDisplayFunction(name, value, bool, $scope.activeIndex);
	};
	$scope.functionTree = {
		dragStart: function(event) {
			reinitializeData();
		},
		dragStop: function(event) {
			reinitializeData();
		}
	};
});