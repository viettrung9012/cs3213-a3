var app = angular.module('destMonthly', ['nsPopover', 'ngDialog', 'IssueControllerService']);

app.directive('monthTable', ['$compile', function($compile) {
	return {
      templateUrl: "/templates/month-table.html",
	  controller: "MonthController",
	  scope: true,
	  restrict: 'E',
	  link: function($scope, $elem, $attr)
	  {
		$('.transitleft').click(function()
		{
			$('.CalendarMonthContainer')
                                .transition('fade left', '100ms')
                                .transition('fade left', '100ms')
                        ;
		});
		$('.transitright').click(function()
		{
			$('.CalendarMonthContainer')
                                .transition('fade right', '100ms')
                                .transition('fade right', '100ms')
                        ;
		});
	  }
    };
}]);

app.directive('monthEvent', ['$compile', function($compile) {
	return {
      templateUrl: "/templates/month-event.html",
	  restrict: 'E'
    };
}]);

app.directive('resize', function($window) {
	return function (scope, element) {
		var w = angular.element($window);
		scope.getWindowWidth = function () {
			return {
				'w': w.width()
			};
		};
		scope.$watch(scope.getWindowWidth, function(newValue, oldValue) {
			scope.cellWidth = Math.floor(((0.955 * 0.75 * newValue.w) - 32) / 7);
		}, true);
		
		w.bind('resize', function() {
			scope.$apply();
		});
	}
});

app.controller('MonthController', [ '$scope', 'ngDialog', '$window', 'IssueController', function ($scope, ngDialog, $window, IssueController) {
	// Constants
	$scope.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	$scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	$scope.cellWidth = (((0.955 * 0.75 * $window.innerWidth) - 32) / 7);
	$scope.titleHeight = 25;
	$scope.rowHeight = 100;
	$scope.borderWidth = 1;
	$scope.contentHeight = 24;
	$scope.topMargin = 21;
	$scope.bottomMargin = 0;
	$scope.eventPadding = 4;
	$scope.styleRadius = 5;
	$scope.marginWidth = 3;
	
	// Styling
	$scope.borderStyle = $scope.borderWidth + "px solid #EEE";
	$scope.weekDayRowStyle = 'position:relative; height:' + $scope.titleHeight + 'px; border-bottom: ' + $scope.borderStyle + ';'; // width: + ($scope.cellWidth + $scope.borderWidth) 
	$scope.dayStyle = 'width:' + $scope.cellWidth + 'px; height:auto; border-bottom: ' + $scope.borderStyle + '; border-left: ' + $scope.borderStyle + '; border-right: ' + $scope.borderStyle + ';';
	$scope.eventStyle = 'margin-bottom:' + $scope.bottomMargin + 'px; margin-top:' + $scope.topMargin + 'px; color:white; padding-left:' + $scope.eventPadding + 'px; padding-right:' + $scope.eventPadding + 'px;';
	
	// First day of the relevant *calendar* month
	$scope.firstDayNextMonth = [];
	
	// State variable for current month
	// Change using $scope.setMonth and $scope.setYear
	$scope.today = new Date();
	$scope.month = $scope.today.getMonth();
	$scope.year = $scope.today.getFullYear();
	
	// For IssueController
	var currWatch = [];
	
	// Original data store
	$scope.events = [];
	
	// Meaningful data stores
	$scope.eventsMonth = [];
	$scope.weeks = [];
	$scope.displayedEvents = [];
	
	buildMonth($scope.year, $scope.month);
	
	// Builds $scope.weeks to contain Date data for each day in calendar (not events)
	function buildMonth(year, month) {
		$scope.weeks = [];
		var daysInMonth = new Date(year, month + 1, 0).getDate();
		var firstDay = new Date(year, month, 1).getDay(); //get the weekday of the first day of this month
		var dayCount = -(firstDay - 1);
		var weekCount = 0;
		$scope.weeks[0] = [];
		
		while (dayCount <= daysInMonth) {
			// Give the appropriate rows for other array for use in buildEvents 
			$scope.eventsMonth[weekCount] = [];
			
			// Give appropriate rows for $scope.weeks and $scope.effectiveLength
			$scope.weeks[weekCount] = [];
			
			for (var i = 0; i < 7; i++) {
				$scope.weeks[weekCount][i] = new Date(year, month, dayCount);
				dayCount++;
			}
			weekCount++;
		}
		$scope.firstDayNextMonth = new Date($scope.weeks[$scope.weeks.length - 1][6].getFullYear(), $scope.weeks[$scope.weeks.length - 1][6].getMonth(), $scope.weeks[$scope.weeks.length - 1][6].getDate() + 1);
	}
	
	// Sorts events based on start date
	function initialSort() {
		$scope.events.sort(compareEvents);
	}
	function compareEvents(event1, event2) {
		return Date.parse(event1.start) - Date.parse(event2.start);
	}
	
	// Build $scope.eventsMonth as parallel array to $scope.weeks
	function buildEvents() {
		// Reinitialize every time buildEvents is run
		for (var i = 0; i < $scope.eventsMonth.length; i++) {
			$scope.eventsMonth[i] = [];
		}
		initialSort();
		for (var i = 0; i < $scope.events.length; i++) {
			var event = $scope.events[i];
			
			// Get Date data about event
			var eventDay = new Date(Date.parse(event.start));
			var endDay = new Date(Date.parse(event.end));
			// Check if event data is relevant. If not, skip it.
			if (endDay.getTime() < $scope.weeks[0][0].getTime() || eventDay.getTime() > $scope.firstDayNextMonth.getTime()) continue;
			var startDate = eventDay.getDate();
			var startWeekDay = eventDay.getDay();
			var durationInDays = $scope.countDays(event);
			var week = 0;
			
			// Adjust if event is leftover from previous month(s).
			if (eventDay.getTime() < $scope.weeks[0][0].getTime()) {
				startWeekDay = 0;
				durationInDays = $scope.countDays(event, $scope.weeks[0][0]);
			}
			
			while (week < $scope.weeks.length - 1 && eventDay.getTime() > $scope.weeks[week + 1][0].getTime()) week++;
			if (!$scope.eventsMonth[week][startWeekDay]) $scope.eventsMonth[week][startWeekDay] = [];
			var dayArray = $scope.eventsMonth[week][startWeekDay];
			
			// ...in the right slot (avoid collision with existing event)
			var posInDay = 0;
			while (dayArray[posInDay]) posInDay++;
			
			// We don't place the event itself into the array. Instead, we place an object that references to the event.
			var thisWeekLength = Math.min(durationInDays, (7 - startWeekDay));
			dayArray[posInDay] = {origin:event, effectiveLength:thisWeekLength, remaining:durationInDays};
			
			for (var j = 0; j < durationInDays; j++) {
				// Place copies of reference objects into other weeks (if necessary)...
				if (startWeekDay+j >= 7) {
					week++;
					durationInDays = durationInDays - j;
					j = 0;
					startWeekDay = 0;
					if (week >= $scope.weeks.length) break;
					if (!$scope.eventsMonth[week][0]) $scope.eventsMonth[week][0] = [];
					thisWeekLength = Math.min(durationInDays, 7);
					$scope.eventsMonth[week][0][posInDay] = {origin:event, effectiveLength:thisWeekLength, remaining:durationInDays};
				}
				// ...and dummy data into following days.
				if (j == 0) continue;
				if (!$scope.eventsMonth[week][startWeekDay+j]) $scope.eventsMonth[week][startWeekDay+j] = [];
				$scope.eventsMonth[week][startWeekDay+j][posInDay] = {createdby:event};
			}
		}
		$scope.displayedEvents = $scope.eventsMonth;
	}
	
	// Various set methods
	$scope.setMonth = function(monthNumber) {
		$scope.month = monthNumber;
	};
	$scope.setYear = function(yearNumber) {
		$scope.year = yearNumber;
	};
	$scope.setCurrentWeek = function(week) {
		$scope.currentWeek = week;
	};
	$scope.setCurrentDay = function(day) {
		$scope.currentDay = day;
	};
	
	// For the ngDialog
	$scope.viewEvent = function(scope) {
		ngDialog.open({
			template: 'templates/calendar-full.html',
			scope: scope
		});
	};
	
	// Count event days
	$scope.countDays = function(event, start) {
		var startDate = start? start : (new Date(Date.parse(event.start)));
		var endDate = new Date(Date.parse(event.end));
		
		// Only count days, not hours or minutes
		var effectiveStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		var effectiveEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
		
		var durationInDays = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 3600 * 24)) + 1;
		return durationInDays;
	};
	
	// For displaying the event divs
	$scope.eventWidth = function(event) {
		if (!event || !event.effectiveLength) {
			return ($scope.cellWidth + $scope.borderWidth);
		} else {
			var total = ($scope.cellWidth) * event.effectiveLength - $scope.eventPadding*2 + (event.effectiveLength - 3) * $scope.borderWidth;
			if (event.remaining === event.effectiveLength) {
				total = total - $scope.marginWidth; // right margin
			}
			if ($scope.countDays(event.origin) === event.remaining) {
				total = total - $scope.marginWidth; // left margin
			}
			if (event.remaining !== event.effectiveLength && $scope.countDays(event.origin) !== event.remaining) total = total + $scope.borderWidth; //don't ask
			return total;
		}
	};
	$scope.eventMargin = function(event) {
		if (!event || !event.effectiveLength) {
			return ($scope.cellWidth + $scope.borderWidth);
		} else {
			if ($scope.countDays(event.origin) === event.remaining) {
				return $scope.marginWidth;
			} else {
				return 0;
			}
		}
	};
	
	// Parsing hours and minutes for DOM display
	$scope.startTime = function(event) {
		if (!event || !event.origin) return "";
		
		// If not located on start date of event, don't display start time
		if ($scope.countDays(event.origin) === event.remaining) {
			var startDate = new Date(Date.parse(event.origin.start));
			var hour = startDate.getHours();
			var minute = startDate.getMinutes();
			if (hour < 10) hour = "0" + hour;
			if (minute < 10) minute = "0" + minute;
			return hour + ":" + minute + " ";
		}
		return "";
	};
	$scope.startHour = function(event) {
		if (!event || !event.origin) return "";
		var hour = (new Date(Date.parse(event.origin.start))).getHours();
		if (hour < 10) {
			return "0" + hour;
		} else {
			return "" + hour;
		}
	};
	$scope.startMinute = function(event) {
		if (!event || !event.origin) return "";
		var minute = (new Date(Date.parse(event.origin.start))).getMinutes();
		if (minute < 10) {
			return "0" + minute;
		} else {
			return "" + minute;
		}
	};
	
	// Highlight magic!
	$scope.highlighted = function(event) {
		if (!event || !event.origin || !event.origin.highlighted) {
			return "#6cc777"; //used to be green
		} else {
			return "#9de3a5"; // used to be red
		}
	};
	$scope.highlightOn = function(event) {
		event.highlighted = true;
	};
	$scope.highlightOff = function(event) {
		event.highlighted = false;
	};
	$scope.isSoft = function(event) {
		return event && event.origin && event.origin.softdeadline;
	}
	
	// Corner magic!
	$scope.borderRadius = function(event) {
		if (!event || !event.origin) {
			return "0px 0px 0px 0px";
		} else {
			var border = "0px 0px";
			if (event.remaining === event.effectiveLength) {
				border = $scope.styleRadius + "px " + $scope.styleRadius + "px"; // THIS ENDS HERE
			}
			if ($scope.countDays(event.origin) === event.remaining) {
				border = $scope.styleRadius + "px " + border + " " + $scope.styleRadius + "px";
			} else {
				border = "0px " + border + " 0px";
			}
			return border;
		}
	};
	
	// Paranoid checking
	$scope.eventExists = function(event) {
		if (!event) return false;
		if (!event.origin) return false;
		return true;
	};
	
	// Event drop handling
	$scope.dropEvent = function(item, tgtelement, tgtdata) {
		var originEvent = item.actual;
		var droppedDay = $scope.weeks[tgtdata.week][tgtdata.day];
		if (droppedDay) {
			var eventStartExact = new Date(Date.parse(originEvent.start));
			var eventEndExact = new Date(Date.parse(originEvent.end));
			var eventStartDay = new Date(eventStartExact.getFullYear(), eventStartExact.getMonth(), eventStartExact.getDate()); //same day, 00:00
			
			var dayDifference = droppedDay.getTime() - eventStartDay.getTime();
			
			var newEventStart = new Date(eventStartExact.getTime() + dayDifference);
			var newEventEnd = new Date(eventEndExact.getTime() + dayDifference);
			if (!originEvent.end) { 
				newEventEnd = new Date(eventStartExact.getTime() + dayDifference);
				newEventEnd.setTime(newEventEnd.getTime() + (60*60*1000));
			}
			$scope.highlightOff(originEvent);
			IssueController.updateIssue(originEvent.id, {start: newEventStart, end: newEventEnd});
		}
	};
	
	$scope.shiftCal = function(offset) {
		var currentMonth = new Date($scope.year, $scope.month + offset);
		$scope.setYear(currentMonth.getFullYear());
		$scope.setMonth(currentMonth.getMonth());
		buildMonth($scope.year, $scope.month);
		currWatch();
		currWatch = redoWatch();
	};
	
	function redoWatch() {
		var watchCallback = function(newEvents) {
			$scope.events = newEvents;
			buildMonth($scope.year, $scope.month);
			buildEvents();
		};
		return IssueController.watch($scope.weeks[0][0], $scope.firstDayNextMonth, undefined, watchCallback);
	}
	
	// Data getter methods for an event. Prevents ng-repeat from counting empty spots in the array.
	$scope.eventName = function(event) {
		if (!event || !event.origin) return "";
		return event.origin.name;
	};
	$scope.eventDesc = function(event) {
		if (!event || !event.origin) return "";
		return event.origin.description;
	};
	$scope.eventStart = function(event) {
		if (!event || !event.origin) return "";
		return event.origin.start.toString();
	};
	$scope.eventEnd = function(event) {
		if (!event || !event.origin) return "";
		return event.origin.end.toString();
	};
	$scope.showDate = function(item) {
		if (!event || !event.origin) return "";
	var event = item.origin;
        var seStartD = formatReadableDate(event.start);
        var seStartT = formatTime(event.start.getHours(), event.start.getMinutes(), true);
        var seEndD = formatReadableDate(event.end);
       	var seEndT = formatTime(event.end.getHours(), event.end.getMinutes(), true);
        var tStart =  seStartD + " " + seStartT;
        var tEnd;
        if (event.end) {
            tEnd = seEndD + " " + seEndT;
            if (event.end.getDate() != event.start.getDate()) {
                return "From " + tStart + " to "+ seEndD + " " + seEndT;
            }
            else if (event.end.getFullYear() == event.start.getFullYear() 
                && event.end.getMonth() == event.start.getMonth()) {
                return "From " + tStart + " to " +  seEndT;
            }
        }
        else {
            return "On " + tStart;
        }
    }
    $scope.showLocation = function(event) {
    	if (!event || !event.origin || !event.origin.location) return "";
    	return event.origin.location;
    }
    $scope.softDeadline = function(event) {
    	if (!event || !event.origin || !event.origin.softdeadline) return "";
    	var sDate = event.origin.softdeadline;
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
    function formatReadableDate(date)
    {
        var year;
        var month;
        var day;

        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDay();

        return cal_days_labels[day] + " " + date.getDate() + " " + cal_months_labels[month] + " " + year;
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
    			$scope.eViewStart = formatDate(item.start, false);
    			$scope.eViewEnd = formatDate(item.end, false);
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
		if (startD == "" || startD == undefined || startD == null) {
			$scope.eErrorMsg = "Please enter start date";
			return;
		}	
		startD = startD.substr(0, 10) + ' ' + startD.substr(11)  + " " + timeZone;
		var passedEndDate;
		var passedStartDate = new Date(startD);
		if (updateFB) {
			postUpdate();
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
	
	currWatch = redoWatch();
} ]);
