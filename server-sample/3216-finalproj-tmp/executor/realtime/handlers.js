'use strict';
var _ = require('lodash');
var Bacon = require('baconjs')
//var app_details = require('../api/app_details');
var async = require('async');
//var User = require('../models/user');


//var cookieParser = require('cookie-parser')

/* This module is a realtime communications layer between the server and the client.

This module provides the following services:
-Every event with a user authenticated will have the sessionID with it.

Room registration
register('sparkid', 'roomid') - binds a user to a room. Returns the unregister function.
	Unregister is called automatically when the user disconnects.

Room broadcast.
broadcast(room, msg)

messageByUID('uid', msg)

TODO: Room feed.
*/

//Helpers	
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

var eventStream = new Bacon.Bus();
var inStream = new Bacon.Bus();
var rooms = { all: [] };
var sparks = { }; // [id] -> {spark: spark, rooms: []}. Room is a string.
//var sparkUIDLookup = {};
//var userSIDLookup = {};
var actions = [ ]; // [{pred: pred, action: function(data, done) { }}]
var sessionStore;
//default configured actions.
//actions.push( { pred: _.constant(true), action: authenticate } ); //This attaches the session.
//actions.push( { pred: _.constant(true), action: deserialize } ); //This attaches the user data, for "Compatability" with passport.js
//actions.push( { pred: _.constant(true), action: linkUserToSpark } ); //This allows us to lookup spark by User ID.
//actions.push( { pred: _.constant(true), action: function(obj, done) { console.log(obj); done(); } } ); //For debugging the state.


module.exports = function(primus, _sessionStore, eventStreams){
	eventStreams.all.plug(eventStream);
	eventStreams.RTevents = eventStream;
	eventStreams.all.plug(inStream);
	eventStreams.RTinput = inStream;
	//sessionStore = _sessionStore;
	//Filter inStream for events you want to listen for
		//Deal with them
		
	//Actual Primus related stuff.
		//Other useful methods:
		//spark.write(data)
		//spark.end(data, options)
	
	primus.on('connection', function (spark) {
		console.log('connected spark');
		// spark is the new connection.
		// spark.query contains the query string you used to connect to the server
		// spark.id is a unique id that we use to identify this single connection with
		var event = {
			type: "CONNECTION",
			src: ['PRIMUS', 'CONNECTION'],
			data: { query: spark.query, id: spark.id }
		}
		r_connect(spark);
		
		eventStream.push(event);
		primus.write(event);
		
		spark.on('data', function message(data) {
			// the message we've received.
			if(validMessage(data))
			{
				data.sparkid = spark.id;
				data.rooms = _.clone(sparks[spark.id].rooms); //Augment: Room info
				//Check if we should deal with it.
				var actionsSatisfying = _.filter(actions, function(request) { return request.pred(data); });
				/*_.each(requestsSatisfying, function(request){
					request.action(data);
				});*/
				async.applyEachSeries(_.map(actionsSatisfying, function(req) { return req.action; }),
					data,
					function()
					{
						//Object.freeze(data); //should i?
						eventStream.push(data);
					});
			}
			else
				spark.end('Invalid command '+JSON.stringify(data));
		});
		
		/*spark.on('end', function message() {
			//Probably don't need this unless i know what's the difference between disconnect/end
		});
		*/
	});
	
	primus.on('disconnection', function (spark) {
		console.log('disconnected spark');
		// the spark that disconnected
		// spark.query contains the query string you used to connect to the server
		// spark.id is a unique id that we use to identify this single connection with
		spark._id = spark.id; //hack, because will be cleaned up.
			//So undead sparks have a _id, because id is too mainstream.
		setTimeout(r_disconnect.curry(spark), 5000); //TODO: unhack.
	});

	return {
		//RTevents: eventStream, //events which you may want to know about come out from here.
		//inStream: inStream, //Push events you want the push notifier to know about here.
		register: register,
		//registerUID: registerUID,
		//deregisterUID: deregisterUID,
		//deregister: deregister, //Sorry, i won't let you deregister unless via the function i gave you.
			//This is so that you don't accidentally remove someone else
			//And if someone gets removed incorrectly, its completely my fault.
		broadcast: broadcast,
		//broadcastRoomsByUID: broadcastRoomsByUID,
		message: message,
		//messageByUID: messageByUID,
		//getRoomsByUID: getRoomsByUID,
		//getUIDsByRoom: getUIDsByRoom,
		addAction: function addAction(pred, action){ actions.push({ pred: pred, action: action }); }
	};
}

//Service functions
function r_connect(spark){
	sparks[spark.id] = { spark: spark, rooms: [] };
	register('all', spark); //the all spark.
}

function r_disconnect(spark){
	var sparkcontainer = sparks[spark._id];
	if(!sparkcontainer)
		throw Error('y u trying to disconnect twice?');
	_.each(sparkcontainer.rooms, function(room){
		deregister(room, spark);
	});
	delete sparks[spark.id];
}

function register(room, spark)
{
	var id = spark.id;
	var sparkcont = sparks[id];
	if(!_.contains(rooms[room], spark) && !_.contains(sparkcont.rooms, room))
	{
		sparks[id].rooms.push(room);
		if(!_.isArray(rooms[room]))
			rooms[room] = [];
		rooms[room].push(spark);
		return _.once(function(){ deregister(room, spark, true); });
	}
	else
		throw Error('y u trying to register twice to '+room+'?');
}

function registerUID(room, UID)
{
	var sid = getSparkIDByUserID(UID);
	if(!sid)
		throw new Error('No such user registered: '+ UID);
	var sparkcont = sparks[sid];
	
	return register(room, sparkcont.spark);
}

function deregisterUID(room, UID)
{
	var sid = getSparkIDByUserID(UID);
	var sparkcont = sparks[sid];
	return deregister(room, sparkcont.spark);
}

function deregister(room, spark, supress)
{
	var id = spark.id||spark._id;
	var sparkcont = sparks[id];
	if(_.contains(rooms[room], spark) && _.contains(sparkcont.rooms, room))
	{
		sparks[id].rooms = _.without(sparks[id].rooms, room);
		rooms[room] = _.without(rooms[room], spark);
	}
	else if(!supress)
		throw Error('y u trying to deregister unregistered sparks from '+room+'?');
}

function broadcast(room, message)
{
	_.each(rooms[room], function(spark)
	{
		spark.write(message);
	});
}

function message(sid, msg){
	var sparkcont = sparks[sid];
	sparkcont.spark.write(msg);
}
function messageByUID(UID, msg)
{
	var sid = getSparkIDByUserID(UID);
	message(sid, msg);
}

//Validation code:
/*
function authenticate(obj, done)
{
	var _sid = obj._sid;
	if(_sid)
	{
		var realid = cookieParser.signedCookie(_sid, app_details.session.secret);
		if(realid == _sid)
		{
			obj.sessionID = "INVALID";
			done();
		}
		else
		{
			obj.sessionID = realid;
			//console.log('realid', realid); //Reference count
			sessionStore.get(realid, function(err, data){
				//console.log('attach data', data); //This seems to be called twice (the reference count) as long as obj.session = data is not commented out.
				//console.log(obj); //But i have determined that the data is attached by the second call.
				//Maybe a stack trace is in order.
				if(data) //So this is an ugly workaround.
					obj.session = data; //<---- Why you f!@!@$ my code?
				done();
			});
		}
	}
	else
	{
		obj.sessionID = null;
		done();
	}
}

function deserialize(obj, done)
{
	if(!obj.session || !obj.session.passport.user)
		done();
	else
	{
		var id = obj.session.passport.user;
		User.findById(id, function(err, user) { //please update this if you change passport_base -> deserializeUser
			userSIDLookup[obj.sparkid] = user.id; //TODO: cleanup. On disconnect. Actually probably not very important.
			obj.user = user;
			done();
		});
	}
}

function linkUserToSpark(obj, done)
{
	//TODO: figure out how to cleanup.
		//Probably check for a) change of SID, b) disconnect.
	if(!obj.user)
		done();
	else
	{
		var id = obj.user.id;
		sparkUIDLookup[id] = obj.sparkid;
		done();
	}
}

function getSparkIDByUserID(uid)
{
	return sparkUIDLookup[uid];
}

function getUserIDBySparkID(sid)
{
	return userSIDLookup[sid];
}

function _getRoomsBySpark(_spark) //_spark to tell you its a little different from the usual spark.
{
	if(!_spark)
		return [];
	return _spark.rooms;
}

function getRoomsByUID(uid)
{
	return _getRoomsBySpark(sparks[getSparkIDByUserID(uid)]);
}

function getUIDsByRoom(room)
{
	var sids = _.map(rooms[room], function(spark) { return spark.id; });
	var uids = _.map(sids, getUserIDBySparkID);
	return uids;
}

function broadcastRoomsByUID(uid, msg){
	var rooms = getRoomsByUID(uid);
	_.each(rooms, function(room) { broadcast(room, msg); } );
}*/

//TODO: implement.
function validMessage(data)
{
	return _.isObject(data);
}