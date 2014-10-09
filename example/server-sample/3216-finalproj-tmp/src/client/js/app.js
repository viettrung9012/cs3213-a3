$(function()
{	
// To toggle between view tabs
	$('.menu .item').tab();
	
	$(window).on('load resize', function(){
// To vary min-height for calendar on load or resize
		$('.minheight').css( "min-height", function( index ) {
			var index = $(window).height();
			return index - 120;
			}
		);
	});
  
});

var app = angular.module( "planendar" , ['destCalendar', 'destAgenda', 'destMonthly', 'IssueControllerService', 'destFilters', 'destSidebar']);
app.directive('header', function()
{
	return {
      templateUrl: "/templates/header.html",
      controller:"HeaderController",
      scope:true,
	  restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('#loggedin').hide();
		
		$('#login').click(function()
		{
			FB.login(statusChangeCallback, loginoptions);
		});
                
		$('.ui.dropdown').dropdown({ on:'hover' });
	  }
    };
});

app.controller('HeaderController', ['$scope', 'IssueController', function ($scope, IssueController) 
{
  function deleteEvent(issue) {
    IssueController.deleteIssue(issue.actual.id);
  }
  $scope.dropEvent = function(issue) {
    deleteEvent(issue);
  }
}]);

app.directive('filters', function()
{
	return {
      templateUrl: "/templates/filters.html",
	  restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('.ui.sidebar')
		  .sidebar();
		  
		$('.togglemenu').click(function()
		{
			$('.ui.sidebar')
			  .sidebar('toggle');
		});
	  }
    };
});


app.directive('footer', function()
{
	return {
      templateUrl: "/templates/footer.html",
	  restrict: 'E',
          link: function($scope, $elem, $attr)
          {
                      
        $('#friendsCount').click(function() 
        {
                $('#friendsPopup').modal('show');
        });
          }
    };
});

app.directive('sidebar', function()
{
	return {
      templateUrl: "/templates/sidebar.html",
	  restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('.popover').popup();
		
		$('.ui.dropdown')
			.dropdown({
				on:'hover',
				delay: { show: 50, hide: 200 },
				duration: 100
			});
	  }
    };
});

// <---------- Google Analytics ---------->

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-54480997-1', 'auto');
  ga('require', 'displayfeatures');
  ga('require', 'linkid', 'linkid.js');
  ga('send', 'pageview');

// <---------- Facebook Login ---------->

function statusChangeCallback(response) {

	// The response object is returned with a status field that lets the
	// app know the current login status of the person.
	// Full docs on the response object can be found in the documentation
	// for FB.getLoginStatus().
	if (response.status === 'connected') {
			// Logged into your app and Facebook.
			
			Cookies.set('fbtoken', response.authResponse.accessToken);
			loggingIn();
		} else if (response.status === 'not_authorized') {
		  // The person is logged into Facebook, but not your app.
		  document.getElementById('status').innerHTML = 'Please log ' +
			'into this app.';
		} else {
		  // The person is not logged into Facebook, so we're not sure if
		  // they are logged into this app or not.
		  document.getElementById('status').innerHTML = 'Please log into Facebook.';
		}
}

var loginoptions = {
	scope: 'public_profile, email, user_friends, user_groups, user_events'
};
  
window.fbAsyncInit = function() {
	FB.init({
		appId      : '757128931017445',
		cookie     : true,  // enable cookies to allow the server to access 
						// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.1' // use version 2.1
	});
        
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
};

// Load the SDK asynchronously
(function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Replace login button with UI
function loggingIn() {
	FB.api('/me/picture', function(response) {
		var profilePictureURL = response.data.url;
		document.getElementById('profile').innerHTML =
                '<img class="ui avatar image" src="' + profilePictureURL + '">';

	});

	FB.api('/me', function(response) {
		var userName = response.name;
		var userId = response.id;
		document.getElementById('status').innerHTML = userName;
		ga('set', '&uid', userId); // Google Analytics
		$('#login').hide();
		$('#loggedin').show();
	});

	$.post('/api/loginHandler',function(resp) { 
		console.log(resp); 
		getIssues();
	});
        
        
        //Get and display number of friends
        FB.api('/me/friends', function (response) {
                var userFriends = Object.keys(response.data).length;
                document.getElementById('friendsCount').innerHTML = 
                '<div class="smallfont">You have ' + userFriends + ' friends liking <br>Planendar</div>';
        
                //Creates the friends popup page
                
                for(var i=0; i<userFriends; i++) {
                    var friendName = response.data[i].name;
                    var friendId = response.data[i].id;
                    $('#friendsPopup').append( '<div class="ui animated divided list">\n\
                        <a class="item" href="https://www.facebook.com/' + friendId + '" target="_blank">\n\
                        <img class="ui avatar image" src="https://graph.facebook.com/' + friendId + '/picture">\n\
                        <div class="content">\n\
                            <div class="header">' + friendName + '</div>\n\
                        </div>\n\
                        </a></div>\n\
                    ');

                }

        });       



}
  
function logOut() {
	FB.logout(function(response){ location.reload(); });
	$('#loggedin').hide();
	$('#login').show();
}

// <---------- Facebook Custom Story ---------->

var currentLink = 'http://54.179.177.82/';
var ogOptions = {
    calendar: 'http://54.179.177.82/',
}


function checkPermission() {
    FB.login(
      function(response) {
            console.log(response);
      },
      {
            scope: 'publish_actions, user_friends',
            auth_type: 'rerequest'
      }
    );
}

function postCreate() {
    
    checkPermission();
    
    FB.api(
       '/me/planendar:create',
       'post',
       ogOptions,
       function(response) {
         if (!response) {
           alert('Error occurred.');
         } else if (response.error) {
             console.log('Error: ' + response.error.message);
         } else {
             console.log(
             'https://www.facebook.com/me/activity/' +
             response.id );
         }
       }
    );
}

function postShare() {
    
    FB.ui({
      method: 'send',
      link: currentLink
    });
	
	/*FB.ui({
      method: 'share_open_graph',
      action_type: 'planendar:share',
      action_properties: JSON.stringify(ogOptions)
      }, 
       function(response) {
         if (!response) {
           alert('Error occurred.');
         } else if (response.error) {
             console.log('Error: ' + response.error.message);
         } 
       }
    );*/
}

function postUpdate() {
    
    checkPermission();
    
    FB.api(
       '/me/planendar:update',
       'post',
       ogOptions,
       function(response) {
         if (!response) {
           alert('Error occurred.');
         } else if (response.error) {
             console.log('Error: ' + response.error.message);
         } else {
             console.log(
             'https://www.facebook.com/me/activity/' +
             response.id );
         }
       }
    );
}

// <---------- Facebook Invite Friends --------->

function postSend() {
    FB.ui({
      method: 'send',
      link: 'http://54.179.177.82/'
    });
}


