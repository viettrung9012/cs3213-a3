var app = angular.module('console', ['EventStreamService']);

var es;
app.controller('consoleCtrl', ['$scope' , 'EventStream', function($scope, EventStream)
{
	es = EventStream;
	es.exec = function(cmd)
	{
		es.inStream.push({
			type: "COMMAND",
			data: cmd
		});
	};
}]);