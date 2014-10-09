'use strict';

/* This service is a (mostly) one way pipe from the server.
Additionally, we provide a few functions for identifying yourself to the server:
TBD (to be defined).

For the stream, please subscribe to it as follows:
EventStreams.stream.filter ( pred(event) ) //where pred(event) -> true <=> you are interested in it
.onValue (function(event)
{
	//deal with it.
});

*/
var app = angular.module('EventStreamService', []); 

app.factory('EventStream', ['$rootScope', '$http', function($rootScope, $http)
{
	var EventStream = {};
	EventStream.stream = new Bacon.Bus();
	EventStream.inStream = new Bacon.Bus();
	
	EventStream.inStream.onValue(function(value)
	{
		if(!_.isObject(value))
			throw Error('inStream only accepts objects, got: ', value);
		value._sid = $.cookie('connect.sid');
		primus.write(value);
	})
	
	console.log('EventStream created');
	var primus = Primus.connect('/', { });
	
	primus.on('open', function open() {
		console.log('Connection is alive and kicking');
	});
	
	primus.on('data', function message(data) {
		EventStream.stream.push(data);
		console.log(data);
	});
	
	return EventStream;
}]);

//Usage: 
//	Include EventStreamService in module requirements.
//	In the controller (or other?) that needs it, inject scope using [blahblah, 'EventStream' , function(blahblah, EventStream) { ... } ]

console.log('EventStreamService loaded');