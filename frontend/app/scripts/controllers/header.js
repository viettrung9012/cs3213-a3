'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('HeaderCtrl', function ($scope, uuid4, SpriteService, $modal, $log, $rootScope, SweetAlert, $http) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
	$scope.serverURL = "http://localhost:8000"; // to be updated
	$scope.userId;
	$scope.projectName = "Untitled";
	$scope.inputObject = {name: $scope.projectName};
	$scope.isEditing = false;
	$scope.editTitle = function(){
		$scope.isEditing = true;
	}
	$scope.saveTitle = function(text){
		$scope.projectName = text;
		$scope.isEditing = false;
	}
	var lastSaved;
	window.localStorage['KodelessStorage']="[]"
	$scope.projectId = uuid4.generate();
	$scope.save = function(){
		var content = SpriteService.getSpriteList();
		var saveData = {
			userId: $scope.userId,
			projectName: $scope.projectName,
			projectId: $scope.projectId,
			data: content,
			lastModified: Date()
		}
		$http.post($scope.serverURL+"/users/save", saveData).
			success(function(res){
				console.log("SUCCESS POST");
				lastSaved = saveData;
				SweetAlert.swal("Success!", $scope.projectName+" saved successfully!", "success");
			}).
			error(function(res){
				console.log("ERROR POST");
				SweetAlert.swal("Oops!", "Something went wrong.. "+console.log(res), "error");
				//log error
		});
	};
	$scope.load = function () {
		$http.get($scope.serverURL+"/users/", {params: { userId: $scope.userId }}).
		success(function (res) {
			console.log("SUCCESS LOAD");
			$scope.loadedData = res;
			var modalInstance = $modal.open({
					templateUrl : 'myModalContent.html',
					controller : 'ModalInstanceCtrl',
					size : 'lg',
					resolve : {
						items : function () {
							return $scope.loadedData;
						}
					}
				});
			modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
				SpriteService.replaceSpriteList(selectedItem.data);
				$scope.projectId = selectedItem.projectId;
				$scope.projectName = selectedItem.projectName;
				$scope.inputObject = {
					name : $scope.projectName
				};
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		}).
		error(function (res) {
			console.log("ERROR LOAD");
			SweetAlert.swal("Oops!", "Something went wrong.. " + console.log(res), "error");
			//log error
		});
	};
	$scope.signOut = function(){
		gapi.auth.signOut();
		document.getElementById('save-load-buttons').setAttribute('style', 'display: none');
	}
	$scope.newProject = function () {
		var showAlert = function(){
			SweetAlert.swal({
				title : "Do you want to save current project?",
				text : "Your will not be able to recover this imaginary file!",
				type : "warning",
				showCancelButton : true,
				cancelButtonText : "No, discard it",
				confirmButtonColor : "#428bca",
				confirmButtonText : "Yes, save it"
			}, function (isConfirm) {
				if (isConfirm){
					doSaveThenInitialize(initialize);
				} else {
					initialize();
				}
			});
		}
		var initialize = function(){
			SpriteService.replaceSpriteList([]);
			SpriteService.updateBackground(0);
			$scope.projectId = uuid4.generate();
			$scope.$apply(function() {
				$scope.projectName = "Untitled";
			});
			$scope.inputObject = {name: $scope.projectName};
		}
		var doSaveThenInitialize = function(callback){
			$scope.save();
			callback();
		}
		if ($scope.userId !== undefined&&lastSaved!==undefined&&
		(lastSaved.data!==SpriteService.getSpriteList()
			|| lastSaved.userId !== $scope.userId
			|| lastSaved.projectId !== $scope.projectId
			|| lastSaved.projectName !== $scope.projectName)
		){
				showAlert();
		} else {
			SpriteService.replaceSpriteList([]);
			SpriteService.updateBackground(0);
			$scope.projectId = uuid4.generate();
			$scope.projectName = "Untitled";
			$scope.inputObject = {name: $scope.projectName};
		}
	}
	$scope.$on('event:google-plus-signin-success', function (event,authResult) {
		// Send login to server or save into cookie
		$scope.authResult = authResult;
		gapi.client.load('plus', 'v1', onGapiLoaded);
		function onGapiLoaded() {
			// now you can request Google+ api
			gapi.client.plus.people.get({userId: 'me'}).execute(handleEmailResponse);
		}
		function handleEmailResponse(resp) {
			$scope.userId = resp.id;
		}
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		// Auth failure or signout detected
	});
});