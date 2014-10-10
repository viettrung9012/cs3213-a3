'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FunctionsCtrl
 * @description
 * # FunctionsCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('FunctionsCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
