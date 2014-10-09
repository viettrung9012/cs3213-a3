"use strict";
 
var app = angular.module( "destFilters" , ['IssueControllerService','ngToggle']);
//just determines which filter flags are set.
app.controller('filterController', ['$scope','IssueController', function($scope, IssueController)
{
	$scope.filters = [{name:"Main", id:"main"}, {name:"Semester Deadlines", id:"semesterDeadlines"},
		{name:"Timetable", id:"timetable"}]
	$scope.filtersothers = [{name: "Facebook birthdays and events", id:"facebookBirthdaysAndEvents" },{name:"Holidays in Singapore", id:"holidaysInSingapore"},
			{name:"CS3216 Deadlines", id:"cs3216Deadlines"}];

}]);