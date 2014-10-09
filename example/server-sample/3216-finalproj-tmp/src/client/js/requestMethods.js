/*
var calendarGrabEventsIntersect = function(id, dateOne, dateTwo) {
	var queryRequestArray = [id, dateOne, dateTwo];
	var output;
	jQuery.post('/api/calendarGrabEventsIntersect', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
};

var agendaGrabEventsOverdue = function(id, date) {
	var queryRequestArray = [id, date];
	var output;
	jQuery.post('/api/agendaGrabEventsOverdue', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
};
*/

var createEvent = function(eventName, startDate, endDate, deadLine, repeatedInterval, description, dataSource, parentID, sourceID, userID, permissionLevel) {
	var queryRequestArray = [eventName, startDate, endDate, deadLine, repeatedInterval, description, dataSource, parentID, sourceID, userID, permissionLevel];
	var output;
	jQuery.post('/api/createEvent', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
	
}

var readEvent = function(userID) {
	var queryRequestArray = [userID];
	var output;
	jQuery.post('/api/readEvent', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
}

var updateEvent = function(eventID, eventName, startDate, endDate, deadLine, repeatedInterval, description, dataSource, parentID, sourceID, userID) {
	var queryRequestArray = [eventID, eventName, startDate, endDate, deadLine, repeatedInterval, description, dataSource, parentID, sourceID, userID];
	var output;
	jQuery.post('/api/updateEvent', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
}

var deleteEvent = function(eventID, userID) {
	var queryRequestArray = [eventID];
	var output;
	jQuery.post('/api/deleteEvent', {queryRequest:queryRequestArray}, function(data) {output = data});
	return output;
}