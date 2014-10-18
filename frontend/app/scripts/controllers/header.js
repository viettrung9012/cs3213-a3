'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('HeaderCtrl', function ($scope, $auth) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
	$scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function() {
          console.log('logged in');
        })
        .catch(function(response) {
		  console.log(response);
          console.log('logged in error');
        });
    };
	$auth.logout()
      .then(function() {
        console.log('logged out');
      });
});