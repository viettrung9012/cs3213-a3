// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('quizit', ['ionic','quizit.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/app/loading');

  $stateProvider.state('app',{
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'sidebarCtrl'
  })

  .state('app.loading',{
    url:'/loading',
    views:{
      content:{
        templateUrl:"templates/loading.html",
        controller:"loadingCtrl"
      }
    }
  })

  .state('app.logout',{
    url:'/logout',
    views:{
      content:{
        templateUrl:"templates/logout.html",
        controller:"logoutCtrl"
      }
    }
  })

  .state('app.home',{
    url: '/home',
    views:{
      content:{
        templateUrl:'templates/home.html',
        controller:'homeCtrl'
      }
    }
  })

  .state('app.questions',{
    url: '/questions',
    views:{
      content:{
        templateUrl:"templates/questions.html"
      }
    }
  })
  
  .state('app.challenge',{
    url: '/challenge',
    views:{
      content:{
        templateUrl:"templates/chat.html",
		    controller: 'ChatCtrl'
      }
    }
  })

  .state('app.notifications',{
    url:'/notification',
    views:{
      content:{
        templateUrl:"templates/notification.html",
        controller:'NotificationCtrl'
      }
    }
  })

  .state('app.friendlist',{
    url:'/friends',
    views:{
      content:{
        templateUrl:"templates/friendList.html",
        controller:'FriendListCtrl'
      }
    }
  })

  .state('app.leaderboard',{
    url:'/leaderboard',
    views:{
      content:{
        templateUrl:"templates/leaderboard.html",
        controller:"LeaderboardCtrl"
      }
    }
  })

  .state('app.history',{
    url:'/history',
    views:{
      content:{
        templateUrl:"templates/history.html",
        controller:'HistoryCtrl'
      }
    }
  })
})