
(function (){
	var app = angular.module('destAgenda', ['nsPopover', 'dragAndDrop', 'ngDialog', 'IssueControllerService']);//, 'ui.bootstrap']);

	app.directive('agenda', ['$compile', function($compile) {
		return {
      		templateUrl: "/templates/agenda-base.html",
	  		controller: "AgendaController",
	  		scope: true,
	  		restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('.popover').popup();
	  }
    	};
	}]);

	//angular.module('agenda', [])
    app.controller("AgendaController", ["$scope", "ngDialog", "IssueController", function ($scope, ngDialog, IssueController) {
        var date = new Date();
        var that = this;
        $scope.dummyData = {
			"name": "Single Event 99",	
			"description": "This is an event that starts and ends on the same day.",
			"start": new Date(),//new Date("Wed Sep 12 2014 8:00:00 GMT+0800 (Malay Peninsula Standard Time)"),	
			"end": new Date()//new Date("Wed Sep 12 2014 10:00:00 GMT+0800 (Malay Peninsula Standard Time)")
        }
        $scope.dateDay = date.getDay();
        $scope.dateDate = date.getDate();
        $scope.dateMonth = date.getMonth();
        $scope.dateYear = date.getFullYear();
        $scope.dayRangeStart = todayRelative(0);

		$scope.dayLabels = cal_days_labels;
        $scope.monthLabels = cal_months_labels;

		reWatch();
		//TODO: if end time is on another day, show date as well

		function reWatch()
		{
			function watchCallback(events)
			{
				that.issues = events;
			}
			return IssueController.watch($scope.dayRangeStart._d, dateRelative($scope.dayRangeStart, 60)._d, [IssueController.isEvent], watchCallback);
		}

		function closeDialog() {
			ngDialog.close($scope.window);
			//$scope.window = null;
		}

		$scope.insertItemAtDate = function(item, newDate, hours)
		{
			var timeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
			newDate = newDate.substr(0, 10) + ' ' + newDate.substr(11)  + " " + timeZone;
			/*item.start = new Date(newDate);
			item.end = new Date(newDate);
			item.end.setTime(item.end.getTime() + (hours*60*60*1000));*/
			var dStart = new Date(newDate);
			var dEnd = new Date(newDate);
			dEnd.setTime(dEnd.getTime() + (hours*60*60*1000));
			closeDialog();
			/*if (that.issues.indexOf(item) == -1) {
				item.id = null; //----------------REMOVE ON ACTUAL IMPLEMENTATION----------------
				$scope.addEvent(item);	
			}
			else {*/
			IssueController.updateIssue(item.id, {start:dStart, end:dEnd});
			//}
		}

		$scope.addEvent = function(item){
			closeDialog();
			IssueController.addIssues([item], [[1, 'readWrite']]);
		}

		$scope.insertDate = function (item, tgtdata) {
			/*if ($scope.window) {
				console.log($scope.window);
				return;
			}*/
			$scope.window = ngDialog.open({
				template: '/templates/agenda-insert.html',
				className: 'ngdialog-theme-dest',
				//plain: false,
				closeByDocument: true,
				scope: $scope,
				controller: ['$scope', function($scope) {
        			$scope.passedItem = item;
        			$scope.onTopOf = tgtdata;
        			$scope.enterHours = 1;
        			$scope.enterDate = formatDate($scope.onTopOf.start, false);
    			}]
			})
		};
		$scope.dropEvent = function(item, tgtelement, tgtdata)
		{
			if (item.actual.id != tgtdata.actual.id)
			{
				$scope.insertDate(item.actual, tgtdata.actual);
			}
		}
		$scope.openEvent = function(item)
		{
			//if ($scope.window) return;
			$scope.window = ngDialog.open({
				template: '/templates/event-view.html',
				className: 'ngdialog-theme-dest',
				//plain: false,
				closeByDocument: true,
				scope: $scope,
				controller: ['$scope', function($scope) {
        			$scope.eventViewItem = item;
        			$scope.eViewName = item.name;
        			$scope.eViewDesc = item.description;
        			$scope.eViewLoc = item.location;
        			$scope.eFB = true;
        			if (item.start) $scope.eViewStart = formatDate(item.start, false);
        			if (item.end) $scope.eViewEnd = formatDate(item.end, false);
        			$scope.eErrorMsg = "";


        			$scope.determineTitle = function() {
        				if ($scope.eViewEnd) {
        					return "Event";
        				}
        				else {
        					return "Task";
        				}
        			}
    			}]
			})
		}

		$scope.getErrorMsg = function() {
			return $scope.eErrorMsg;
		}
		$scope.eventName = function(event) {
			return event.name;
		}
		$scope.eventDesc = function(event) {
			return event.description;
		}
		$scope.showDate = function(event) {
			return "";
	    }
	    $scope.showLocation = function(event) {
	    	if (!event.location) return "";
	    	return event.location;
	    }
	    $scope.softDeadline = function(event) {
	    	if (!event.softdeadline) return "";
	    	var sDate = event.softdeadline;
	    	var today = new Date();
	    	if ((sDate*1 - today*1) < 1*24*60*60*1000) {
				return "Today";
			}
			else if ((sDate*1 - today*1) < 2*24*60*60*1000) {
				return "Tomorrow";
			}
			else if ((sDate*1 - today*1) < 7*24*60*60*1000) {
				return "This Week";
			}
			else if ((sDate*1 - today*1) < 14*24*60*60*1000) {
				return "Next Week";
			}
			else if ((sDate*1 - today*1) < 30*24*60*60*1000) {
				return "This Month";
			}
	    }

		$scope.updateEventFromView = function(item, name, desc, startD, endD, loc, updateFB)
		{
			$scope.eErrorMsg = "";
			var timeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
			var passedEndDate;
			var passedStartDate = new Date(startD);
			if (updateFB) {
				postUpdate();
			}
			if (startD == "" || startD == undefined || startD == null) {
				passedStartDate = null; 
			}
			else {
				startD = startD.substr(0, 10) + ' ' + startD.substr(11)  + " " + timeZone;
				passedStartDate = new Date(startD);
			}
			if (name == undefined || name == "" || name == null) {
				$scope.eErrorMsg = "Please enter an event name.";
				return;
			}
			if (endD == "" || endD == undefined || endD == null) {
				passedEndDate = null; 
			}
			else {
				endD = endD.substr(0, 10) + ' ' + endD.substr(11)  + " " + timeZone;
				passedEndDate = new Date(endD);
			}
			if (passedEndDate != null) {
				if (passedEndDate*1 < passedStartDate*1) { 
					$scope.eErrorMsg = "End date should be after start date";
					return;
				}
				else if (passedEndDate*1 == passedStartDate*1) {
					$scope.eErrorMsg = "If end and start date are the same, this should be an issue instead of an event. Clear end date to continue."
					return;
				}
			}	
			closeDialog();
			IssueController.updateIssue(item.id, {name:name, description:desc, start:passedStartDate, end:passedEndDate, location:loc});
		}

		$scope.ATimeString = function(issue) {
			if (issue.start.getFullYear() == issue.end.getFullYear() && issue.start.getMonth() == issue.end.getMonth()
				&& issue.start.getDate() == issue.end.getDate()) {
				return $scope.AgetTime(issue.start) + " to " + $scope.AgetTime(issue.end);
			} 
			else if (getWeek(issue.start) == getWeek(issue.end)) {
				return $scope.AgetTime(issue.start) + " to " + cal_days_labels[$scope.AgetDay(issue.end)] + " " + $scope.AgetTime(issue.end);
			}
			else {
				return $scope.AgetTime(issue.start) + " to " + $scope.AgetDayNum(issue.end) + " of " + cal_months_labels[$scope.AgetMonth(issue.end)]
				 + " " + $scope.AgetTime(issue.end);
			}
		}
		
		$scope.AgetID = function(issue)
		{
			return issue.id;
		}
		$scope.AgetDay = function(fDate)
		{
			return new Date(fDate).getDay();
		}
		$scope.AgetDayNum = function(fDate)
		{
			return new Date(fDate).getDate();
		}
		$scope.AgetMonth = function(fDate)
		{
			return new Date(fDate).getMonth();
		}
		$scope.AgetYear = function(fDate)
		{
			return new Date(fDate).getFullYear();
		}
		$scope.AgetTime = function(fDate)
		{
			var tDate = new Date(fDate);
			return formatTime(tDate.getHours(), tDate.getMinutes(), true);
		}

		function getWeek(date) {
			var onejan = new Date(date.getFullYear(),0,1);
			onejan.setDate(onejan.getDate() - onejan.getDay());
			return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()-1)/7);
		}

		function formatDate(date, readable)
		{
			var year;
			var month;
			var day;
			var time = formatTime(date.getHours(), date.getMinutes(), false);

			year = date.getFullYear();
			month = date.getMonth() + 1;
			if (month < 10) {
				month = "0" + month;
			}
			day = date.getDate();
			if (day < 10) {
				day = "0" + day;
			}
			if (!readable) {
				return year +'-'+ month +'-'+ day + "T" + time;
			}
			else {
				return year +'-'+ month +'-'+ day; 
			}
		}

		function formatTime(hours, minutes, twelve) {
			var hh;
			var mm;
			var ending = "";
			if (twelve) {
				if (hours >= 12) {
					if (hours > 12) {
						hh = hours - 12;
					}
					else {
						hh = hours;
					}
					ending = " pm";
				}
				else {
					hh = hours;
					ending = " am";
				}
			}
			else {
				hh = hours;
			}
			if (hh < 10) {
				hh = "0" + hh;
			}
			if (minutes < 10) {
				mm = "0" + minutes;			
			}
			else {
				mm = minutes;
			}
			return hh + ":" + mm + ending;
		}

		//$scope.addEvent($scope.dummyData);
    }]);



	// these are labels for the days of the week
	cal_days_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	// these are human-readable month name labels, in order
	cal_months_labels = ['January', 'February', 'March', 'April',
                     'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
  	// these are the days of the week for each month, in order
	cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

})();