var _ = require('underscore');
var async = require('async');
var _db;
var options = { };

var FB = require('fb');
var app = require('../api/app_details.js');
FB.options({appId:app.id, appSecret:app.secret});

var FB_EVENT = "FB_EVENT";


//Util
function toArray(stuff) {
    return Array.prototype.slice.call(stuff);
}

Function.prototype.curry = function() {
    if (arguments.length<1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = toArray(arguments);
    return function() {
        return __method.apply(this, args.concat(toArray(arguments)));
    }
}

function apply(f, cb)
{
	f(cb);
}


/*RetrieveTask:
{action: function(cb), objType: string, id: string}, //cb(err, {items: retrieved})
*/

function getUpdateRequests(callback)// callback( retrieveTasks )
{
	//Determine, at this point in time, who needs to be updated 
		//There are two types of people:
	var query = "";
	console.log("NOT IMPLEMENTED YET, DS_facebook - getUpdateRequests");
}

function forceUpdate(userID, callback) //callback([RetrieveTask]) 
{
	console.log("Forcing update for user ",userID);
	//Grab the user's data, generate the calls to retrieval service.
	getAccessTokenFromID(userID, function(err, token)
	{
		if(token)
		{
			var FB_EVENTS = make_FB_EVENT_requester(token);
			//TODO: Another callback to retrieve groups
			callback(null, [FB_EVENTS]);
		}
		else
			callback(new Error("No such datasource for"+userID));
	});
}

function registerDB(db)
{
	_db = db;
	console.log("fb, got db");
}

function setOptions(opts)
{
	options = _.extend(options, opts);
}


//Phase 2:
//Write the following:
	//DS.decomposer[objType].isComplete(task.obj);
	//DS.decomposer[objType].combiner[newType](oldObj, newObj)
	//DS.decomposer[objType].extender(task, function (err, result) ) -> [retrieval task].
	//Where objType = "FB_EVENT" and newType = "USER"
var decomposer = {
	"FB_EVENT": { //Always combine with USER
		isComplete: function(objs){
			return false;
		},
		extender: function(task, cb) //cb([retrieval task])???
		{
			var objs = task.obj;
			console.log("EXTENDER");
			console.log(objs);
		},
		combiner: {
			"USER": function(oldObj, newObj)
			{
				
			
			}
		}
	}
}
module.exports = {
	//common stuff
	id:"DS_facebook",
	registerDatabase: registerDB,
	isDS: true,
	options: setOptions,
	//DS Specific
	forceUpdate: forceUpdate,
	getUpdateRequests: getUpdateRequests,
	//Functionals
	
	//Decomposers 
	decomposer: decomposer
}

//Internal requests
function getAccessTokenFromID(userid, callback) //callback(error, token)
{
	var query = "SELECT AccessToken FROM users JOIN datasources USING (userID) where SourceType = 'FACEBOOK' AND userID = "+_db.escape(userid)+";";
	_db.query(query, function(err, rows, fields)
	{
		if(err)
			callback(err);
		else if(rows.length)
			callback(err, rows[0].AccessToken);
		else
			callback(new Error("User "+userid+" does not exist!"));
	
	});
}


//External Requests
//TODO: detect failure to retrieve due to faulty access token.

function REQUEST_EVENTS_ALL(token, cb)
{
	// FB.api(path, method: string, params: obj, callback: function) 
	FB.api('/me/events',
		{access_token: token, fields: ["name","start_time","end_time","description","rsvp_status","updated_time","admins","location"]},
		function(response) {
			if (response.error)
				cb(response.error)
			else
				cb(null, response);
		});
}

//Request generators
//TODO: error handling.
//TODO: support paging. But currently ignoring it.
	//I doubt anyone has 5000 events.
function make_FB_EVENT_requester(token)
{
	function FB_EVENTS(callback){
		REQUEST_EVENTS_ALL(token, function(err, results)
		{
			//console.log(err, results);
			//console.log("NOT FULLY IMPLEMENTED - FB_EVENTS");
			callback(null, {items: results.data});
		});
	}
	return { action: FB_EVENTS, objType: FB_EVENT, id: "/me/events/"+token };
}