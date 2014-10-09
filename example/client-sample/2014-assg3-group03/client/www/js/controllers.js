angular.module('quizit.controllers', [])

.service('quizitService', function () {
	var friendID;
	var friends = [];
	var serverURL = 'http://ec2-54-169-65-45.ap-southeast-1.compute.amazonaws.com:3000';
	var wrongAns = ["Hmm wrong. ", "No you should try again. ", "I don't usually say this, but you're wrong. ", "Everyone made mistake. ",
		"Oh well...", "I can't believe you can't get this correct. ", "I'm sad :( ", "This one you should be able to get correct, but why? ", "Life is hard, right?"];
	var correctAns = ["Correct. ", "Oh you know about this. ", "Good. ", "Well done! ", "That's right. ", "Very good. ", "Spectacular. ",
		"You seem to be good with this. "];
	var slowAns = ["You should answer faster. ", "Correct, but too slow. ", "You could've got some points if you answered faster. ", "Slow! "];
	var preQns = ["Ok here is the next question: ", "Next question: ", "Next: ", "Ok here is the next one: ", "Let's move on: ", "This is the next question: "];
	var lastQns = ["Ok this is the last question. ", "This is the last one: ", "Good work. Here is the last question: "];
	var isLoggedIn = true;
	return {
		friends : function (list) {
			friends = list
				return friends;
		},
		getFriends : function () {
			return friends;
		},
		selectFriend : function (friendId) {
			friendID = friendId;
			return friendID;
		},
		getFriendID : function () {
			return friendID;
		},
		getFriendName : function (id) {
			var name;
			friends.forEach(function (afriend) {
				if (afriend.id === id) {
					name = afriend.name;
				}
			});
			return name;
		},
		friend : function () {
			var friendr;
			friends.forEach(function (afriend) {
				if (afriend.id === friendID) {
					friendr = afriend;
				}
			});
			return friendr;
		},
		serverURL : function () {
			return serverURL;
		},
		getWrongAns : function () {
			return wrongAns;
		},
		getCorrectAns : function () {
			return correctAns;
		},
		getSlowAns : function () {
			return slowAns;
		},
		getPreQns : function () {
			return preQns;
		},
		getLastQns : function () {
			return lastQns;
		},
		toggleLoggedIn: function(){
			isLoggedIn = !isLoggedIn;
		},
		getLoggedIn: function(){
			return isLoggedIn;
		}
	};
})

.controller('bodyCtrl', function ($scope) {
	$scope.bodyBackground = {
		background : 'url(img/bg2.jpg)'
	};

	$scope.friends = new Array();
	$scope.leaderboardData = new Array();
	$scope.historyData = new Array();

	window.applicationCache.addEventListener('updateready', function(e){
    if(window.applicationCache.status ==  window.applicationCache.UPDATEREADY){
      if(confirm("A new version of this state is ready to update. Would you like to update?")){
        window.location.reload();
      }else{

      }
    }
  }, false);

  window.applicationCache.addEventListener('cached', function(e){
    console.log("Application Fully Cached!!!!");
  });
	// $scope.serverURL = 'ec2-54-169-65-45.ap-southeast-1.compute.amazonaws.com:3000';
})

.controller('sidebarCtrl', function ($scope, $ionicSideMenuDelegate) {
	$scope.sidebarData = [{
			linkId : "menu-item-1",
			imgSrc : "img/lightbulb-outline.png",
			title : "Quiz!t",
			linkAddress : "#/app/friends"
		}, {
			linkId : "menu-item-2",
			imgSrc : "img/star-outline.png",
			title : "Top Quizer",
			linkAddress : "#/app/leaderboard"
		}, {
			linkId : "menu-item-3",
			imgSrc : "img/glasses-outline.png",
			title : "History",
			linkAddress : "#/app/history"
		}, {
			linkId : "menu-item-5",
			imgSrc : "img/chatbubble-outline.png",
			title : "Notification",
			linkAddress : "#/app/notification"
		}, {
			linkId : "menu-item-4",
			imgSrc : "img/contact-outline.png",
			title : "Log Out",
			linkAddress : "#/app/logout"
		}
	];

	$scope.toggleSidebar = function () {
		$ionicSideMenuDelegate.toggleLeft();
	};

	$scope.selectSideItem = function (index) {
		$scope.activeIndex = index;
		$ionicSideMenuDelegate.toggleLeft(false);
		if (index == 4) {
			$scope.logoutFacebook();
		}
	};

	$scope.logoutFacebook = function () {
		FB.logout(function(response) {
			console.log("Trying to log out");
			FB.Auth.setAuthResponse(null, 'unknown');
			console.log('loggedOut');// user is now logged out
		});
	}

	$scope.activeIndex = undefined;
})

.controller('loadingCtrl', function ($scope, $location, $interval) {

	$scope.loadHome = function () {

		if(navigator.standalone){
			$location.path('/app/friends');
		}else if(navigator.onLine){
			FB.getLoginStatus(function (response) {
				if (response.status === "connected") {
					$location.path('/app/friends');
				} else {
					$location.path('/app/home');
				}
			});
		}else{
			$location.path('/app/friends');
		}

	};

	$interval($scope.loadHome, 2000, 1);
})

.controller('logoutCtrl', function ($scope, $location, $interval) {
	$scope.redirectToHome = function () {
		$location.path('/app/home');
	};

	$interval($scope.redirectToHome, 2000, 1);
})

.controller('homeCtrl', function ($scope, $ionicSideMenuDelegate, $http, $location, $interval, quizitService) {
	$ionicSideMenuDelegate.canDragContent(false);
	$ionicSideMenuDelegate.toggleLeft(false);

	$scope.redirectToFriends = function () {
		$ionicSideMenuDelegate.canDragContent(true);
		$location.path('/app/friends');
	}

	$scope.fb_login_callback = function (response) {
		$scope.initUserData(response);
		// $http.post("http://"+$scope.serverURL+"/users/init",userdata);
		$interval($scope.redirectToFriends, 3000, 1);
	};

	$scope.initUserData = function (token) {
		var access_token = token.authResponse.accessToken;
		var user_id = token.authResponse.userID;

		var serverURL = quizitService.serverURL();

		window.localStorage['access_token'] = access_token;
		window.localStorage['user_id'] = user_id;
		$scope.facebookData = [];
		var me, books, movies, music;
		$scope.getData = function () {
			FB.api('/me', function (response) {
				window.localStorage['user_name'] = response.name;
				me = response;
				FB.api('/me/books', function (response) {
					books = response;
					FB.api('/me/movies', function (response) {
						movies = response;
						FB.api('/me/music', function (response) {
							music = response;
							pushData();
						});
					});
				});
			});
		};
		
		var pushData = function(){
			$scope.facebookData.push(me);
			$scope.facebookData.push(books);
			$scope.facebookData.push(movies);
			$scope.facebookData.push(music);
			console.log($scope.facebookData);
			postData();
		}
		
		var postData = function(){
			$http.post(quizitService.serverURL()+'/users/userInit', $scope.facebookData).
			success(function(res){
				console.log("SUCCESS POST");
			}).
			error(function(res){
				console.log("ERROR POST");
				//log error
			});
		}
		
		$scope.getData();
						
		if ($scope.friends.length <= 0) {
			FB.api('/me/friends', function (response) {
				quizitService.friends(response.data);
				$scope.initFriends(response.data, new Array());
			});
		}

		if($scope.leaderboardData.length <= 0){
			$http.get(serverURL+"/challenges/leaderBoard")
			.success(function(response){
				console.log(JSON.stringify(response));
				$scope.initLeaderboardData(response, new Array());
			});
		}

		if($scope.historyData.length <= 0){
			$http.get(serverURL+'/challenges?userID='+user_id)
			.success(function(response){
				$scope.initHistoryData(response, new Array());
			});
		}
	}

	$scope.initHistoryData = function(history, result){
		var serverURL = quizitService.serverURL();

		if(history.length <= 0){

			result = result.reverse();

			for(var i=0; i<result.length; i++){
				$scope.historyData.push(result[i]);
			}

			window.localStorage["history"] = JSON.stringify(result);
		}else{
			var item = history.pop();
			var id = item.target_id;
			FB.api('/'+id+'/picture',function(response){
				item.profile_image = response.data.url;
				FB.api('/'+id+'?fields=name',function(response){
					item.name = response.name;
					item.score = item.score_max;
					result.push(item);
					$scope.initHistoryData(history,result);
				});
			});
		}
	}

	$scope.initLeaderboardData = function (leaderboard, result) {
		if (leaderboard.length <= 0) {
			result = result.reverse();

			for (var i = 0; i < result.length; i++) {
				$scope.leaderboardData.push(result[i]);
			}

			window.localStorage["leaderboard"] = JSON.stringify(result);

		} else {
			var item = leaderboard.pop();
			var id = item._id;
			FB.api('/' + id + '/picture', function (response) {
				item.profile_image = response.data.url;
				FB.api('/'+id+'?fields=name',function(response){
					item.name = response.name;
					item.score = item.total_maxscore;
					result.push(item);
					$scope.initLeaderboardData(leaderboard, result);
				});
			});
		}
	}

	$scope.initFriends = function (friendlist, result) {
		if (friendlist.length <= 0) {
			quizitService.friends(result);

			if ($scope.friends.length <= 0) {
				for (var i = 0; i < result.length; i++) {
					$scope.friends.push(result[i]);
				}
			}

			if (window.localStorage["friends"]) {
				window.localStorage["friends"] = JSON.stringify(result);
			}

			return;
		} else {
			var friend = friendlist.pop();
			var id = friend.id;
			FB.api('/' + id + '/picture', function (response) {
				friend.image = response.data.url;
				result.push(friend);
				$scope.initFriends(friendlist, result);
			})
		}
	};

	$scope.fblogin = function () {
		fb_login($scope.fb_login_callback);
	};
})

.controller('NotificationCtrl', function ($scope, quizitService, $location, $ionicPopup, $http, $ionicSideMenuDelegate) {
	// get data from server about notification: should be done when the app load - use homecontrol, then use quizitService to set data
	$ionicSideMenuDelegate.canDragContent(false);
	var serverURL = quizitService.serverURL();
	$scope.data = [];
	$scope.getData = function () {
		$http.get(serverURL + '/bonus?user_id=' + window.localStorage['user_id']).
		success(function (data, status, headers, config) {
			$ionicSideMenuDelegate.canDragContent(true);
			$scope.toSend = data;
			window.localStorage['notificationToSend'] = JSON.stringify($scope.toSend);
			for (var i = 0; i < data.length; i++) {
				if (data[i]['tag'] !== 'ignore' // notification is not ignored
					 && (!((data[i]['player_id'] === window.localStorage['user_id']) // do not get question sent by player
							 && (data[i]['answer'] === undefined))) // that has no answer yet
					 && (!((data[i]['target_id'] === window.localStorage['user_id']) // do not get question answered by player
							 && (data[i]['answer'] !== undefined)))) {
					var obj = {
						player_id : data[i]['player_id'],
						target_id : data[i]['target_id'],
						type : data[i]['player_id'] === window.localStorage['user_id'] ? 'answer' : 'question',
						question : data[i]['question'],
						answer : data[i]['answer'],
						name : quizitService.getFriendName(data[i]['target_id'])
					}
					$scope.data.push(obj);
					window.localStorage['notificationPending'] = JSON.stringify($scope.data);
				}
			}
			if ($scope.data.length === 0) {
				$scope.activeIndex = 0;
				$ionicPopup.show({
					title : '<div class="popup-title">It seems like you have no new notification.</div>',
					scope : $scope,
					buttons : [{
							text : '<b>Back to friendlist!</b>',
							type : 'button-positive',
							onTap : function (e) {
								$location.path('/app/friends');
							}
						},
					]
				});
				$ionicSideMenuDelegate.canDragContent(true);
			}
		}).
		error(function (data, status, headers, config) {
			$scope.activeIndex = 0;
			$ionicPopup.show({
				title : '<div class="popup-title">It seems like you have no new notification.</div>',
				scope : $scope,
				buttons : [{
						text : '<b>Back to friendlist!</b>',
						type : 'button-positive',
						onTap : function (e) {
							$location.path('/app/friends');
						}
					},
				]
			}); //log error
			$ionicSideMenuDelegate.canDragContent(true);
		});
	}
	$scope.getData();
	// push data back to server	and call quizitService to remove data
	$scope.userResponse = function (question, choice) {
		for (var i = 0; i < $scope.data.length; i++) {
			if ($scope.data[i]['question'] === question) {
				for (var j = 0; j < $scope.toSend.length; j++) {
					if ($scope.data[i]['player_id'] === $scope.toSend[j]['player_id'] &&
						$scope.data[i]['target_id'] === $scope.toSend[j]['target_id'] &&
						$scope.data[i]['question'] === $scope.toSend[j]['question']) {
						if (choice === 'I') {
							$scope.toSend[j]['tag'] = choice;
						} else {
							$scope.toSend[j]['answer'] = choice;
						}
					}
					window.localStorage['notificationToSend'] = JSON.stringify($scope.toSend);
					console.log(JSON.parse(window.localStorage['notificationPending']));
					console.log(JSON.parse(window.localStorage['notificationToSend']));
				}
				$scope.data.splice(i, 1);
				window.localStorage['notificationPending'] = JSON.stringify($scope.data);
				if ($scope.data.length === 0) {
					$http.post(serverURL + '/bonus/response', JSON.parse(window.localStorage['notificationToSend']))
					.success(function (res) {
						console.log(JSON.parse(window.localStorage['notificationToSend']));
						console.log(res);
					})
					.error(function (res) {
						// log error
					});
					$scope.activeIndex = 0;
					$location.path('/app/friends');
				}
			}
		}
	}
})

.controller('FriendListCtrl', function ($scope, quizitService) {
	$scope.selectFriend = function (friend) {
		quizitService.selectFriend(friend);
	};

	if (!navigator.onLine) {
		if ($scope.friends.length <= 0) {
			var friendsDataStore = window.localStorage['friends'];
			if (friendsDataStore) {
				var friendsData = JSON.parse(friendsDataStore);
				for (var i = 0; i < friendsData.length; i++) {
					$scope.friends.push(friendsData[i]);
				}
				quizitService.friends(friendsData);
			}
		}
	}
})

.controller('HistoryCtrl', function ($scope, $http, quizitService) {
})

.controller('LeaderboardCtrl', function ($scope) {
	if (!navigator.onLine) {
		if ($scope.leaderboardData.length <= 0) {
			var leaderboardDataStore = window.localStorage['leaderboard'];
			if (leaderboardDataStore) {
				var leaderboard = JSON.parse(leaderboardDataStore);
				for (var i = 0; i < leaderboard.length; i++) {
					$scope.leaderboardData.push(leaderboard[i]);
				}
			}
		}
	}
})

.controller('ChatCtrl', function ($scope, $http, $ionicPopup, $timeout, $ionicScrollDelegate, $location, quizitService, $ionicSideMenuDelegate) {
	$ionicSideMenuDelegate.canDragContent(false);
	$scope.isButtonDisabled = true;
	var serverURL = quizitService.serverURL();
	var wrongAns = quizitService.getWrongAns();
	var correctAns = quizitService.getCorrectAns();
	var slowAns = quizitService.getSlowAns();
	var preQns = quizitService.getPreQns();
	var lastQns = quizitService.getLastQns();
	$scope.texts = [];
	$scope.QAindex = 0;
	$scope.deduct = 0;
	$scope.total = 0;
	var question = {};
	var readyTime = 5200;
	//$scope.imgSrc = 'img/notloading.png' + '?v=' + Date.now();
	$scope.showLoadingBar = false;
	var popupImgSource = 'img/countdown.gif' + '?v=' + Date.now();
	var popupTemplate = '<img style="width:100%" src="' + popupImgSource + '"/>';
	$scope.showReady = function () {
		var myPopup = $ionicPopup.show({
				title : '<div class="popup-title">Are you ready?</div>',
				subTitle : '<div class="popup-subtitle popup-big">The faster you answer, the higher score you get</div>',
				template : popupTemplate
			});
		$timeout(function () {
			myPopup.close();
			question = {
				index : $scope.QAindex,
				type : 'question',
				content : $scope.data[$scope.QAindex]['question'],
				answer : $scope.data[$scope.QAindex]['answer']
			};
			$scope.texts.push(question);
			$scope.isButtonDisabled = false;
			//$scope.imgSrc = 'img/loading.gif' + '?v=' + Date.now();
			$scope.showLoadingBar = true;
			$scope.timestamp = Date.now();
		}, readyTime);
	};
	$scope.getData = function () {
		$scope.friend = quizitService.friend();
		$http.get(serverURL + '/quiz?fb_account=' + $scope.friend.id).
		success(function (data, status, headers, config) {
			console.log(serverURL + '/quiz?fb_account=' + $scope.friend.id);
			$scope.data = data;
			if ($scope.data.length === 0) {
				$ionicPopup.show({
					title : '<div class="popup-title">It seems like your friend has no question to Quiz!t you.</div>',
					scope : $scope,
					buttons : [{
							text : '<b>Back to friendlist!</b>',
							type : 'button-positive',
							onTap : function (e) {
								$ionicSideMenuDelegate.canDragContent(true);
								$location.path('/app/friends');
							}
						},
					]
				});
			}
			$http.get(serverURL + '/quiz/bonus').
			success(function (data, status, headers, config) {
				$scope.bonus = data;
				$scope.showReady();
			}).
			error(function (data, status, headers, config) {
				//log error
			});
		}).
		error(function (data, status, headers, config) {
			$ionicPopup.show({
				title : '<div class="popup-title">It seems like your friend has no question to Quiz!t you.</div>',
				scope : $scope,
				buttons : [{
						text : '<b>Back to friendlist!</b>',
						type : 'button-positive',
						onTap : function (e) {
							$ionicSideMenuDelegate.canDragContent(true);
							$location.path('/app/friends');
						}
					},
				]
			});
			//log error
		});
	}
	$scope.getData();
	$scope.showPopup = function () {
		$scope.data = {}
		var report;
		if ($scope.deduct / $scope.total >= 0.75) {
			report = 'Are you really my friend?';
		} else if ($scope.deduct / $scope.total >= 0.50) {
			report = 'We should see each other more often';
		} else if ($scope.deduct / $scope.total >= 0.25) {
			report = 'You seem to know a number of things about me';
		} else if ($scope.deduct / $scope.total >= 0.10) {
			report = 'You know a lot about me!';
		} else {
			report = 'I think we are good friends :)';
		}
		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
				template : '',
				title : '<div class="popup-title">' + report + '</div>',
				subTitle : '<div class="highlight popup-subtitle">You got ' + (100 - Math.floor(($scope.deduct / $scope.total) * 100)) + '% correct</div>',
				scope : $scope,
				buttons : [{
						text : '<b>Ask Bonus Question</b>',
						type : 'button-energized',
						onTap : function (e1) {
							var titl = '<div class="popup-title">Hi, ' + $scope.friend.name + ' . I want to Quiz!t you. </div>';
							var templ = '<div class="popup-subtitle">' + $scope.bonus['question'] + '</div>';
							var myPopup = $ionicPopup.show({
									template : templ,
									title : titl,
									scope : $scope,
									buttons : [{
											text : '<b>Send with Quiz!t!</b>',
											type : 'button-balanced',
											onTap : function (e) {
												var sendData = {
													player_id : window.localStorage['user_id'],
													target_id : $scope.friend.id,
													question : $scope.bonus['question']
												}
												$http.post(serverURL + '/bonus/question', sendData)
												.success(function (res) {
													console.log(res);
												})
												.error(function (res) {
													// log error
												});
												$ionicSideMenuDelegate.canDragContent(true);
												$location.path('/app/friends');
											}
										},
									]
								});
						}
					}, {
						text : '<b>Back to Quiz!t</b>',
						type : 'button-positive',
						onTap : function (e2) {
							$ionicSideMenuDelegate.canDragContent(true);
							$location.path('/app/friends');
						}
					}
				]
			});
	};

	$scope.isIdleHidden = true;
	$scope.addAnswer = function (userAns) {
		var newDeduct = Math.floor((Date.now() - $scope.timestamp) / 1000) * 2 - 3;
		if (newDeduct < 0) {
			newDeduct = 0;
		} else if (newDeduct > 10) {
			newDeduct = 10;
		}
		$scope.isButtonDisabled = true;
		$scope.isIdleHidden = false;
		$scope.showLoadingBar = false;
		if ($scope.QAindex < $scope.data.length) {
			var answer = {
				index : $scope.QAindex,
				type : 'answer',
				content : (userAns == 'Y') ? 'Yes' : 'No',
				correct : (userAns === question.answer)
			};
			$scope.texts.push(answer);
			if (!answer.correct) {
				newDeduct = 10;
			}
			$scope.deduct += newDeduct;
			$scope.total += 10;
			var delay = 1000;
			$timeout(function () {
				$scope.QAindex++;
				if ($scope.QAindex < $scope.data.length) {
					var nextQnsContent;
					if (newDeduct < 10) {
						nextQnsContent = correctAns[Math.floor(Math.random() * correctAns.length)];
					} else if (newDeduct === 10 && answer.correct) {
						nextQnsContent = slowAns[Math.floor(Math.random() * slowAns.length)];
					} else {
						nextQnsContent = wrongAns[Math.floor(Math.random() * wrongAns.length)];
					}
					nextQnsContent = nextQnsContent + 'You got ' + (10 - newDeduct) + ((newDeduct >= 9) ? ' point. ' : ' points. ');
					if ($scope.QAindex === $scope.data.length - 1) {
						nextQnsContent = nextQnsContent + lastQns[Math.floor(Math.random() * lastQns.length)];
					} else {
						nextQnsContent = nextQnsContent + preQns[Math.floor(Math.random() * preQns.length)];
					}
					nextQnsContent = nextQnsContent + $scope.data[$scope.QAindex]['question'];
					question = {
						index : $scope.QAindex,
						type : 'question',
						content : nextQnsContent,
						answer : $scope.data[$scope.QAindex]['answer']
					};
					$scope.texts.push(question);
					//$scope.imgSrc = 'img/loading.gif' + '?v=' + Date.now();
					$scope.showLoadingBar = true;
				} else if ($scope.QAindex === $scope.data.length) {
					var lastResponse;
					if (newDeduct < 10) {
						lastResponse = correctAns[Math.floor(Math.random() * correctAns.length)];
					} else if (newDeduct === 10 && answer.correct) {
						lastResponse = slowAns[Math.floor(Math.random() * slowAns.length)];
					} else {
						lastResponse = wrongAns[Math.floor(Math.random() * wrongAns.length)];
					}
					lastResponse = lastResponse + 'You got ' + (10 - newDeduct) + ((newDeduct >= 9) ? ' point. ' : ' points. ');
					var lastRes = {
						index : $scope.QAindex,
						type : 'question',
						content : lastResponse
					};
					$scope.texts.push(lastRes);
					var sendData = {
						player_id : window.localStorage['user_id'],
						target_id : $scope.friend.id,
						score : (100 - Math.floor(($scope.deduct / $scope.total) * 100))
					}
					$http.post(serverURL + '/challenges', sendData)
					.success(function (res) {
						console.log(res);
					})
					.error(function (res) {
						// log error
					});
					$scope.showPopup();
					$scope.isIdlehidden = true;
				}
				$ionicScrollDelegate.scrollBottom();
			}, delay);
		}
		$ionicScrollDelegate.scrollBottom();
		$timeout(function () {
			$scope.isButtonDisabled = false;
			$scope.isIdleHidden = true;
			$scope.timestamp = Date.now();
		}, delay + 200);
	};
});
