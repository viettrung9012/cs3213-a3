'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FunctionListCtrl
 * @description
 * # FunctionListCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('FunctionListCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
