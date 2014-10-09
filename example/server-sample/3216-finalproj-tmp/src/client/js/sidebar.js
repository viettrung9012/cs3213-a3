var app = angular.module('destSidebar', ['nsPopover', 'ngDialog', 'IssueControllerService']);
// 0: doesn't belong
// 1: no deadlines
// 2: today
// 3: tmr
// 4: a week
// 5: two weeks
// 6: this month
	
app.controller('SidebarController', [ '$scope', 'IssueController', 'ngDialog', function($scope, IssueController, ngDialog) {
	$scope.events = [];
	
	$scope.today = new Date();
	$scope.year = $scope.today.getFullYear();
	$scope.month = $scope.today.getMonth();
	$scope.day = $scope.today.getDate();
	
	// For IssueController
	$scope.currWatch = reWatch();
	
	// Main data store
	$scope.categories = [];
	$scope.categoryNames = ['No Deadlines', 'Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month'];
	
	function buildEvents() {
		$scope.categories = [];
		for (var i = 0; i < $scope.events.length; i++) {
			var event = $scope.events[i];
			categorizeEvent(event);
			if (!$scope.categories[event.cat]) $scope.categories[event.cat] = [];
			$scope.categories[event.cat].push(event);
		}
	}

	function categorizeEvent(event) {
		var today = new Date();
		var sDate = null;
		if (event.end) {
			if (event.softdeadline) {
				sDate = event.softdeadline;
				event.sidebarType = 1;
			}
			else {
				event.cat = 0;
			}
		}
		else {
			if (!event.softdeadline && !event.start && !event.end) {
				event.cat = 1;
			}
			else if (!event.softdeadline) {
				sDate = event.start;
				event.sidebarType = 0;
			}
			else {
				sDate = event.softdeadline;
			}
		}
		console.log(event.start +" "+ event.end +" "+ event.softdeadline);
		if (sDate) {
			if ((sDate*1 - today*1) < 1*24*60*60*1000) {
				event.cat = 2;
			}
			else if ((sDate*1 - today*1) < 2*24*60*60*1000) {
				event.cat = 3;
			}
			else if ((sDate*1 - today*1) < 7*24*60*60*1000) {
				event.cat = 4;
			}
			else if ((sDate*1 - today*1) < 14*24*60*60*1000) {
				event.cat = 5;
			}
			else if ((sDate*1 - today*1) < 30*24*60*60*1000) {
				event.cat = 6;
			}
			else {
				console.log("WRONG SDATE IN CATEGORIZATION : " + sDate*1);
			}
		}
	}
	
	function reWatch() {
		function watchCallback(events) {
			console.log(events);
			$scope.events = events;
			buildEvents();
		}
		//return IssueController.watch($scope.today, new Date($scope.year, $scope.month, $scope.day + 60), undefined, watchCallback);
		//return IssueController.watchIssues([forSideBar], watchCallback);
		return IssueController.watchEVERYTHING([isNotDeleted],watchCallback);
	}
	
	$scope.dropEvent = function(item, tgtelement, tgtdata) { // item: {event:eventObject}, tgtdata: {cat:droppedCategory}
		var event;
		var today = new Date();
		event = item.actual;
		event.highlight = false;

		if (tgtdata.cat == 0) {
			IssueController.updateIssue(event.id, {cat:tgtdata.cat, softdeadline:null, start:null, end:null});
			return;
		}
		if (tgtdata.cat == 1) {
			//today;
		}
		else if (tgtdata.cat == 2) {
			today.setTime(today.getTime() + (25*60*60*1000));
		}
		else if (tgtdata.cat == 3) {
			today.setTime(today.getTime() + (7*24*60*60*1000));
		}
		else if (tgtdata.cat == 4) {
			today.setTime(today.getTime() + (14*24*60*60*1000));
		}
		else if (tgtdata.cat == 5) {
			today.setTime(today.getTime() + (29*24*60*60*1000));
		}

		if (event.end) {
			IssueController.updateIssue(event.id, {cat:tgtdata.cat, softdeadline:today});
		}
		else {
			IssueController.updateIssue(event.id, {cat:tgtdata.cat, start:today});
		}
		//var todayD = today.toString().substr(0, 10) + ' ' + today.toString().substr(11);//  + " " + timeZone;
		
	};

	function templateIssue() {
		var sDate = new Date();
		sDate.setHours(sDate.getHours() + 1)
		var eDate = new Date();
		eDate.setHours(eDate.getHours() + 2);
		return {name:"Event Name", description:"Event Description", start:sDate, end:eDate};
	}

	$scope.createEvent = function(isIssue)
	{
		item = templateIssue();
		$scope.window = ngDialog.open({
			template: '/templates/event-view.html',
			className: 'ngdialog-theme-dest',
			//plain: false,
			closeByDocument: true,
			scope: $scope,
			controller: ['$scope', function($scope) {
				$scope.eHideEnd = isIssue;
				$scope.eCreation = true;
    			$scope.eventViewItem = item;
    			$scope.eFB = true;
    			//$scope.eViewLoc 
    			if (!isIssue)
    			{
    				//$scope.eViewName = item.name;
	    			//$scope.eViewDesc = item.description;
	    			$scope.eViewEnd = formatDate(item.end, false);
	    		}
	    		/*else {
	    			$scope.eViewName = "Issue Name";
	    			//$scope.eViewDesc = "Issue Description";
	    		}*/
    			$scope.eViewStart = formatDate(item.start, false);
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
    					return "Issue";
    				}
    			}
			}]
		})
	}

	$scope.getErrorMsg = function() {
		return $scope.eErrorMsg;
	}

	function closeDialog() {
		ngDialog.close($scope.window);
		//$scope.window = null;
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
	$scope.createEventFromView = function(item, name, desc, startD, endD, loc, period, updateFB)
 	{ 		
 		var timeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
 		var passedStartDate = new Date(startD);
 		if (updateFB) {
			postCreate();
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
		/*console.log("PERIOD: " + period);
		if (period) {
			var today = new Date();
			if (tgtdata.cat == 0) {
				closeDialog();
		 		$scope.eCreation = false;
		 		IssueController.addIssue({name:name, description:desc,
		 		 start:null, end:null, softdeadline:null, location:loc}, [[1,'readWrite']]);
 				return;
			}
			if (tgtdata.cat == 2) {
				today.setTime(today.getTime() + (25*60*60*1000));
			}
			else if (tgtdata.cat == 3) {
				today.setTime(today.getTime() + (7*24*60*60*1000));
			}
			else if (tgtdata.cat == 4) {
				today.setTime(today.getTime() + (14*24*60*60*1000));
			}
			else if (tgtdata.cat == 5) {
				today.setTime(today.getTime() + (29*24*60*60*1000));
			}
			startD = today.toString();
		}*/
		closeDialog();
 		$scope.eCreation = false;
 		IssueController.addIssue({name:name, description:desc, start:passedStartDate, end:passedEndDate, location:loc}, [[1,'readWrite']]);
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
}]);