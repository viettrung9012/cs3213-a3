'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('HeaderCtrl', function ($scope, uuid4) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
	$scope.userId;
	$scope.projectName = "Untitled";
	$scope.isEditing = false;
	$scope.editTitle = function(){
		$scope.isEditing = true;
	}
	$scope.saveTitle = function(){
		$scope.isEditing = false;
	}
	$scope.projectId;
	$scope.save = function(){
		
	};
	$scope.load = function(){
		
	};
	$scope.$on('event:google-plus-signin-success', function (event,authResult) {
		// Send login to server or save into cookie
		gapi.client.load('plus', 'v1', onGapiLoaded);
		function onGapiLoaded() {
			// now you can request Google+ api
			gapi.client.plus.people.get({userId: 'me'}).execute(handleEmailResponse);
		}
		function handleEmailResponse(resp) {
			console.log(resp.id);
			$scope.userId = resp.id;
			if ($scope.projectId === undefined){
				$scope.projectId = uuid4.generate();
			}
			console.log($scope.projectId);
		}
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		// Auth failure or signout detected
	});
});