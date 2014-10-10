'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:ObjectListCtrl
 * @description
 * # ObjectListCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('SpriteListCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
