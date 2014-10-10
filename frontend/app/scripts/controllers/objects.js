'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:ObjectsCtrl
 * @description
 * # ObjectsCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('ObjectsCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
