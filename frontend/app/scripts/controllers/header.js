'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('HeaderCtrl', function ($scope, uuid4, SpriteService, $modal, $log, $rootScope, SweetAlert) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
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
	window.localStorage['KodelessStorage']="[]"
	$scope.projectId = uuid4.generate();
	$scope.save = function(){
		var content = SpriteService.getSpriteList();
		var saveData = {
			userId: $scope.userId,
			projectName: $scope.projectName,
			projectId: $scope.projectId,
			lastModified: Date(),
			data: content
		}
		var data = JSON.parse(window.localStorage['KodelessStorage']);
		var alreadyExisted = false;
		for (var i=0; i<data.length; i++){
			var tempData = data[i];
			if (tempData.userId===saveData.userId
			&&tempData.projectId===saveData.projectId){
				data.splice(i, 1, saveData);
				alreadyExisted = true;
			}
		}
		if (!alreadyExisted){
			data.push(saveData);
		}
		window.localStorage['KodelessStorage']=JSON.stringify(data);
		console.log(window.localStorage['KodelessStorage']);
	};
	$scope.load = function () {
		var savedData = JSON.parse(window.localStorage['KodelessStorage']);
		console.log(JSON.stringify(savedData));
		$scope.loadedData = [];
		for (var i = 0; i < savedData.length; i++) {
			if (savedData[i]['userId'] === $scope.userId) {
				$scope.loadedData.push(savedData[i]);
				console.log($scope.loadedData);
			}
		}
		var modalInstance = $modal.open({
				templateUrl : 'myModalContent.html',
				controller : 'ModalInstanceCtrl',
				size: 'lg',
				resolve : {
					items : function () {
						console.log(JSON.stringify($scope.loadedData));
						return $scope.loadedData;
					}
				}
			});
		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
			SpriteService.updateSpriteList(selectedItem.data);
			$scope.projectId = selectedItem.projectId;
			$scope.projectName = selectedItem.projectName;
			$scope.inputObject = {name: $scope.projectName};
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
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
			SpriteService.updateSpriteList([]);
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
		if ($scope.userId !== undefined) {
				showAlert();
		} else {
			SpriteService.updateSpriteList([]);
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