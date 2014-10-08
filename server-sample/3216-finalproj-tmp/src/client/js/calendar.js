 "use strict";
 
 /* Description: china clone of google calendars. */
 /* TODO List.
 -Remap space for "reduced hours".
 -Rip events out into another space >.<
	-which can scroll independently.
 */

var clone = function(obj) { var myJson = superJson.create(); return myJson.parse(myJson.stringify(obj)); };

function overlaps(eventA, eventB)
{
	return !(eventA.end <=eventB.start || eventB.end <= eventA.start);
}

//assumes they overlap
function intersection(eventA, eventB) 
{
	if(overlaps(eventA, eventB))
		return {start: Math.max(eventA.start, eventB.start), 
				end:  Math.min(eventA.end, eventB.end)};
	return null;
}

var app = angular.module( "destCalendar" , ['nsPopover', 'ngDialog', 'dragAndDrop', 'IssueControllerService']);
app.filter('range', function() {

  return function(input, start, stop, step) {
	if(arguments.length == 2)
		return _.range(parseInt(start));
	if(arguments.length == 3)
		return _.range(parseInt(start), parseInt(stop));
	else
	{
		return _.range(parseInt(start), parseInt(stop), parseFloat(step));
	}
  };
});

app.filter('calTime', function() {
  return function(input, date) {
	return moment(date).add(input, "minutes").format("HHmm");
  };
});

app.directive('calendar', ['$compile', function($compile) {
	return {
      templateUrl: "/templates/calendar-base.html",
	  controller: "CalendarController",
	  scope: true,
	  restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('.transitleft').click(function()
		{
			$('.CalendarDaysContainer')
                                .transition('fade left', '100ms')
                                .transition('fade left', '100ms')
                        ;
		});
		$('.transitright').click(function()
		{
			$('.CalendarDaysContainer')
                                .transition('fade right', '100ms')
                                .transition('fade right', '100ms')
                        ;
		});
	  }
    };
}]);

//must be in camelCase.
app.directive('calendarEvent', ['$compile', function($compile) {
	return {
      templateUrl: "/templates/calendar-event.html",
	  restrict: 'E'
    };
}]);

app.directive('observeHeight', function($timeout){
 return function($scope, element, attrs){
      attrs.$observe('observeHeight',function(){
		$scope.$watch( function() {
                $scope.header.dayheights[$scope.$index] = element.height();
				var max = 0;
				for(var i = 0;i<$scope.header.dayheights.length;i++)
					max = Math.max(max, $scope.header.dayheights[i]);
				 $scope.header.height = max;
            } );
         
      });
  }
});

app.directive('resize', function($window) {
	return function (scope, element) {
		var w = angular.element($window);
		scope.getWindowWidth = function () {
			return {
				'w': w.width()
			};
		};
		scope.$watch(scope.getWindowWidth, function(newValue, oldValue) {
			scope.days = (newValue.w < 1200) ? 3 : 4;
			scope.colWidthBase = (((0.955 * 0.75 * newValue.w) - 32 - scope.timeMarkerWidth) / scope.days) - 1;
		}, true);
		
		w.bind('resize', function() {
			scope.$apply();
		});
	}
});

app.controller('CalendarController',  ['$scope', 'IssueController', function($scope, IssueController)
{
	var calendar = this;
	$scope.events = [];
	$scope.days = 4;
	$scope.colWidthBase = 360;
	$scope.dayevents = [];
	$scope.totalhours = 24;
	$scope.pixelsperhour = 60;
	$scope.timeMarkerWidth = 60; //For clarity purposes (because Dat doesn't think this is maintainable), 
	//this describes the width of the time marker on the left of the calendar.
	$scope.headerheightDefault = 45;
	$scope.dayRangeStart = todayRelative(0); //today
	$scope.double = function()
	{
		$scope.pixelsperhour*=2;
	}
	$scope.header = { 
		height: $scope.headerheightDefault,
		dayheights: []
		};
	
	$scope.timeheaderheight = function()
	{
		return {
			"height": $scope.header.height
		};
	};
	
	$scope.timeHourHeight = function()
	{
		return {height: ($scope.pixelsperhour)+'px'};
	}
	$scope.timeHalfHourHeight = function()
	{
		return {height: ($scope.pixelsperhour/2)+'px'};
	}
	
	$scope.options = function(option)
	{
		console.log(option);
		for(var i in option)
		{
			$scope[i] = option[i];
		}
	};
	
	$scope.calendarShift = function(sign)
	{
		var amt = sign*Math.max(1, Math.floor($scope.days/2));
		$scope.dayRangeStart.add(amt, "days");
		calendar.currWatch();
		calendar.currWatch = reWatch();
	}
	/*$http.get('/json/testEvents1.json').success(function(data)*/
	//IssueController.Events.update(function(data, olddata)
	
	function reWatch()
	{
		function watchCallback(events)
		{
			//extract the days.
			var eventsByDay = [];
			
			for(var j = 0;j<$scope.days;j++)
			{
				eventsByDay[j] = [];
				for(var i = 0;i<events.length;i++)
				{
					var event = events[i];
					var day_interval = {start: dateRelative($scope.dayRangeStart, j)._d, end: dateRelative($scope.dayRangeStart, j+1)._d};
					//check if they overlap
					var _intersect = intersection(day_interval, event);
					if(_intersect)
					{
						var e = clone(event);
						e.actual = event;
						e.start = moment(_intersect.start).diff(dateRelative($scope.dayRangeStart, j), "minutes");
						e.end = moment(_intersect.end).diff(dateRelative($scope.dayRangeStart, j), "minutes");
						eventsByDay[j].push(e);
					}
				}
			}
			$scope.dayevents = [];
			for(var i = 0;i<$scope.days;i++)
			{
				var t = layoutDayEvents(eventsByDay[i], $scope);
				t.date = dateRelative($scope.dayRangeStart, i)._d;
				$scope.dayevents.push(t);
			}
		}
		return IssueController.watch($scope.dayRangeStart._d, dateRelative($scope.dayRangeStart, $scope.days+1)._d, undefined, watchCallback);
	
	}
	
	calendar.currWatch = reWatch();
	$scope.dropTime = function(item, tgtelement, tgtdata)
	{
		var duration = moment(item.actual.end).diff(moment(item.actual.start), "minutes");
		var newstart = moment (tgtdata.date).minutes(tgtdata.hour * 60);
		var newend = moment(newstart).add(duration, "minutes");
		if (!item.actual.end) {
			newend = moment(newstart).add(1, "hours");
		}
		IssueController.updateIssue(item.actual.id, {start: newstart._d, end: newend._d});
	}
}]);

app.controller('CalendarDayController', ['$scope', '$http', 'ngDialog', 'IssueController', function($scope, $http, ngDialog, IssueController)
{
	$scope.mode = "fatten";
	$scope.eventposition = function(event)
	{
		var col_len = $scope.dayevents[$scope.day].lastcol + 1;
		var _colwidth = col_len? $scope.colWidthBase/col_len: $scope.colWidthBase;
		////colWidth: columns.length? $scope.colWidthBase/columns.length: $scope.colWidthBase, 
		var colWidth = _colwidth * 0.94;
		return {
			"left": event.col*colWidth + "px",
			"top": ($scope.header.height + ($scope.pixelsperhour/60.0)*event.start)+"px",
			"height": ($scope.pixelsperhour/60.0)*(event.end-event.start)+"px",
			"width": ($scope.mode == "fatten" && (event.col + event.colspan) <= $scope.dayevents[$scope.day].lastcol)? 
						(event.colspan*colWidth +0.61803398875*colWidth)+"px":
						event.colspan*colWidth+"px"
		};
	};
	$scope.dayposition = function()
	{
		return {
			"left": ($scope.$index * $scope.colWidthBase + $scope.timeMarkerWidth)+"px",
			"height": ($scope.header.height + $scope.totalhours * $scope.pixelsperhour)+"px",
			"width": $scope.colWidthBase+"px"
		};
	};
	$scope.viewEvent = function(scope){
		ngDialog.open({
			template: 'templates/calendar-event-full.html',
			scope: scope

		})
	};

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

	$scope.eventName = function(event) {
		return event.name;
	};
	$scope.eventDesc = function(event) {
		return event.description;
	};
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
		if (endD == "") {
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

		return year +'-'+ month +'-'+ day + "T" + time;
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


function layoutDayEvents(events, $scope)
{
	events = _.sortBy(events, function(event) { return event.end }); 
	events = _.sortBy(events, function(event) { return event.start }); 
	function Column() {
		this.last = 0;
		this.items = [];
		this.add_event = function(event)
		{
			if(!this.can_fit(event))
				throw new Error("Unable to add event "+event.start+" to "+this.last);
			this.last = event.end;
			this.items.push(event);
		}
		this.can_fit = function(event)
		{
			return event.start >= this.last;
		}
		return this;
	}
	//Greedily pack as many items as possible in each column
	var columns = [];
	columns.push(new Column());
	//for each event, find the left most column it would fit in.
	_.each(events, function(event)
	{
		var found = false;
		for(var i = 0;i<columns.length;i++)
		{
			var column = columns[i];
			if(column.can_fit(event))
			{
				found = true;
				column.add_event(event);
				break;
			}
		}
		if(!found)
		{
			//create new column, dump it there.
			var column = new Column();
			column.add_event(event);
			columns.push(column);
		}
	});
	
	
	_.map(columns, function(column, index){
		return _.map(column.items, function(event){
			event.col = index;
			return event;
		});
	});
	

	
	_.map(columns, function(column, index){
		return _.map(column.items, function(event){
			var colspan = 1;
			for(var i = event.col+1;i<columns.length;i++)
			{
				if(!_.every(columns[i].items, function(otherevent) { return !overlaps(event, otherevent); })) //some event overlaps
					break;
				colspan++;
			}
			event.colspan = colspan;
			return event;
		});
	});
	
	return {events: _.flatten(_.map(columns, function(column) { return column.items })), 
		//colWidth: columns.length? $scope.colWidthBase/columns.length: $scope.colWidthBase, 
		lastcol: columns.length-1 };
}
