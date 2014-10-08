
(function (){
	var app = angular.module('destStaticEvent', []);

	//angular.module('agenda', [])
    app.controller("EventViewController", ["$scope", function ($scope) {
    	var that = this;
        $scope.dummyData = {
            "name": "Single Event 99",  
            "description": "This is an event that starts and ends on the same day.",
            "start": new Date("Wed Sep 12 2014 8:00:00 GMT+0800 (Malay Peninsula Standard Time)"),   
            "end": new Date("Wed Sep 12 2014 10:00:00 GMT+0800 (Malay Peninsula Standard Time)")
        }

    	$scope.init = function(event) {
    		that.event = $scope.dummyData;
            $scope.seStartD = formatDate(that.event.start);
            $scope.seStartT = formatTime(that.event.start.getHours(), that.event.start.getMinutes(), true);
            if ($scope.seEndD) {
                $scope.seEndD = formatDate(that.event.end);
                $scope.seEndT = formatTime(that.event.end.getHours(), that.event.end.getMinutes(), true);
            }
            else {
                $scope.seEndD = "";
                $scope.seEndT = "";
            }
    	}

        $scope.determineTitle = function() {
            if ($scope.seEndD) {
                return "Event";
            }
            else {
                return "Issue";
            }
        }

        $scope.showDate = function() {
            var tStart =  $scope.seStartD + " " + $scope.seStartT;
            var tEnd;
            if (that.event.end) {
                tEnd = $scope.seEndD + " " + $scope.seEndT;
                if (that.event.end.getDate() != that.event.start.getDate()) {
                    return "From " + tStart + " to "+ $scope.seEndD + " " + $scope.seEndT;
                }
                else if (that.event.end.getFullYear() == that.event.start.getFullYear() 
                    && that.event.end.getMonth() == that.event.start.getMonth()) {
                    return "From " + tStart + " to " +  $scope.seEndT;
                }
            }
            else {
                return "On " + tStart;
            }
        }

        function formatDate(date)
        {
            var year;
            var month;
            var day;

            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDay();

            return cal_days_labels[day] + " " + date.getDate() + " " + cal_months_labels[month] + " " + year;
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

    // these are labels for the days of the week
    cal_days_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // these are human-readable month name labels, in order
    cal_months_labels = ['January', 'February', 'March', 'April',
                     'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
})();