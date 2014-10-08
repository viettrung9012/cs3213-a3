'use strict';
var app = angular.module('IssueControllerService', []); 
//TODO: pushNotifier Implementation
//require: pushNotifier
//pushNotifier is a service which connects to a push server, gets info on events changing and shighing it back up here.
	//pushNotifier uses modify(), add() and delete()
var getIssues;
//TODO: remove.
function packIssue(event)
{
	
	var packed = {
		description: event.description,
		IssueName: event.name,
		startDate: event.start? event.start.toJSON(): undefined,
		endDate: event.end? event.end.toJSON() : undefined,
		location: event.location,
		softdeadline: event.softdeadline? event.softdeadline.toJSON() : undefined
	};
	//allow deletion.
	if(event.start === null)
		packed.startDate = null;
	if(event.end === null)
		packed.endDate = null;
	return _.omit(JSON.parse(JSON.stringify(packed)), function(key, value, obj) { return _.isUndefined(value); } );
}

//The kind of sortedList you would never use in real algorithms.
	//Because blarrgh deadlines.
	//Has something like O(n^2) lookup worst case
function mostlySortedList(cmp)
{
	var stuff = [];
	this.stuff = stuff;
	this.insert = function(item)
	{
		stuff.push(item);
		stuff.sort(cmp);
	};
	this.remove = function(item){
		var index = stuff.indexOf(item);
		stuff.splice(index, 1);
		stuff.sort(cmp);
	};
	this.items = function(filters) //[ f(item) -> true => include, false => not include]
	{
		return _.filter(stuff,
			function(item) {	return _.every(filters, function(filter) { return filter(item); });  }
			);
	}
	

}

function unpackIssue(issue)
{
	if(issue.startDate == "0000-00-00 00:00:00")
		issue.startDate = null;
	if(issue.endDate == "0000-00-00 00:00:00")
		issue.endDate = null;
	var newissue = {
		//TODO: UNHACK THIS.
		start: issue.startDate? moment(issue.startDate).add(8, "hours")._d : undefined,
		end: issue.endDate? moment(issue.endDate).add(8, "hours")._d : undefined,
		name: issue.IssueName,
		description: issue.description,
		id: issue.issueID,
		permissionLevel: issue.permissionLevel,
		location: issue.location,
		softdeadline: issue.softdeadline? moment(issue.softdeadline).add(8, "hours")._d : undefined
	}
	console.log(issue, newissue);
	return newissue;
}

function resetMeta(issue){
	var meta = {cversion: 0, tversion: 0, deleted: false};
	issue.getNewTVersion = function()
	{
		var t = meta.tversion;
		meta.tversion +=1;
		console.log("tversion",t,meta.tversion);
		return t;
	}
	/*issue.getCversion = function()
	{
		return meta.cversion;
	}*/
	issue.updateCversion = function (v) {
		console.log("updateCversion", v, meta.cversion);
		if (v!= meta.cversion) 
		{
			throw Error("Incorrect event ordering - expected:"+meta.cversion+" got:"+v);
		}
		else
			meta.cversion = v+1;
	}
	issue.delete = function() { meta.deleted = true; };
	issue.undelete = function() { meta.deleted = false; };
	issue.isDeleted = function() { return meta.deleted; }
}

// Database stuff:
/*Transaction methodology:
Modify locally first:
Failure: -> backlog
Success: -> update local ID (creation only)
*/


/*
var objs = s.queryInterval(new Date(0), new Date(1000000000000000000000))
_.each(_.map(objs, packIssue), function(event) {  $.post('/api/createIssue', { options: event, groups:[[1,'readWrite']] }, function(data) { console.log(data) })} );
*/

function dbConstructor(ICS)
{
	var db = {};
	var backlog = [];
	var FATAL = true;
	var is_fataled = false;
	var UUID = 0;
	var locked = true;
	function getUUID(){
		return UUID++;
	}
	var notifyFailure = function(fatal) { 
		if(fatal) //stop this db forever.
			is_fataled = true;
	}
	var notifySuccess = function(lastAction) { 
		var action = backlog.shift();
		if(action != lastAction)
			throw Error("Somehow managed to screw up the processing order");
		if(backlog.length)
			syncnext();
		locked = false;
	}
	var syncnext = function() {
		console.log(locked, backlog);
		if(locked)
			return;
		if(is_fataled)
			throw Error("DB has died, please debug");
		backlog[0]();
		locked = true;
	}
	
	function tryUpdate()
	{
		if(backlog.length)
			syncnext();
	}
	
	setInterval(tryUpdate, 100);
	
	//TODO: add support for issues later.
	//TODO: add support for other tokens.
	//Public methods:
		//Tokens in format: [ [groupID,'permType'], ]
	db.unlock = function(){ locked = false; }
	db.createIssue = function(issue, tokens) //When done: update the ID of the local object.
	{
		if(is_fataled)
			throw Error("DB has died, please debug");
		var uuid = "T"+getUUID();
		var nIssue = packIssue(issue);
		var sendAction = function()
		{
			$.post('/api/createIssue', { options: nIssue, groups:tokens }, function(data) {
			   //If successful:
				ICS._relabelIssue(uuid, data.id);
				notifySuccess(sendAction)
			}).error(function(err) {
				//if failure
				console.error(err);
				notifyFailure();
			});
		};
		backlog.push(sendAction);
		//syncnext(); //TODO: remove, is temp.
		return uuid;
	}

	//TODO
	db.updateIssue = function(issue)
	{
		if(is_fataled)
			throw Error("DB has died, please debug");
		var nIssue = packIssue(issue);
		var tVersion = issue.getNewTVersion();
		var sendAction = function()
		{
			var id = issue.id;
			console.log("Update",id, tVersion);
			//check if its a T-id.
			if(id[0] == 'T') 
			{//This action should not be able to run - some previous action should have sent the data out.
				notifyFailure(FATAL);
				throw Error("ICS_DB - FATAL ERROR - SOMEHOW UPDATING A TEMPORARY");
			}
			$.post('/api/updateIssue', { id: id, options: nIssue}, function(data) {
				try{
					//If successful:
					console.log("UpdateD",id, tVersion);
					issue.updateCversion(tVersion); //increment version.
					notifySuccess(sendAction);
				} catch (e) //If this fails, we have a SYSTEM problem.
				{
					notifyFailure(FATAL);
					throw Error("ICS_DB - FATAL ERROR - SOMEONE MANAGED TO MESS UP THE EXECUTION ORDER "+e);
				}
			}).error(function(err) {
			   //if failure, nothing.
			   console.error(err);
			   notifyFailure()
			});
		};
		backlog.push(sendAction);
		//syncnext(); //TODO: remove, is temp.
	}
	
	//TODO: Test, wire up other side.
	db.deleteIssue = function(issue)
	{
		if(is_fataled)
			throw Error("DB has died, please debug");
		//syncnext(); //TODO: remove, is temp.
		
		var tVersion = issue.getNewTVersion();
		var sendAction = function()
		{
			var id = issue.id;
			//check if its a T-id.
			if(id[0] == 'T') 
			{//This action should not be able to run - some previous action should have sent the data out.
				notifyFailure(FATAL);
				throw Error("ICS_DB - FATAL ERROR - SOMEHOW UPDATING A TEMPORARY");
			}
			console.log("delete",id, tVersion);
			$.post('/api/deleteIssue', { id: id }, function(data) {
				console.log("deleteD",id, tVersion);
				try{
					//If successful:
					issue.updateCversion(tVersion); //increment version.
					notifySuccess(sendAction);
				} catch (e) //If this fails, we have a SYSTEM problem.
				{
					notifyFailure(FATAL);
					throw Error("ICS_DB - FATAL ERROR - SOMEONE MANAGED TO MESS UP THE EXECUTION ORDER "+e);
				}
			}).error(function(err) {
			   //if failure, nothing.
			   console.error(err);
			   notifyFailure()
			});
		};
		backlog.push(sendAction);
		//syncnext(); //TODO: remove, is temp.
	}
	return db;

};

//TODO: remove debug variable
var r,s,t,u;
app.factory('IssueController', ['$rootScope', '$http', function($rootScope, $http)
{
	//local variables
	var rangeWatch = []; //This holds all ranges that are being watched.
	var issueWatch = [];
	var IssueIntervalTree = new it.interval_tree();
	var IssueLookup = {};
	s = IssueIntervalTree; //TODO: remove DEBUG
	var wtfDataStructure = new mostlySortedList(
		function (a,b) //if the left is undefined, it is smaller than every other thing in the galaxy.
		{ if(a.start === undefined) return true; return a.start<b.start;  }
	, function(x) { return x.start == undefined && x.end == undefined });
	u = wtfDataStructure;
	
	
	var IssueController = { };
	var db = dbConstructor(IssueController);
	
	//local methods
	function overlaps(eventA, eventB) { return !(eventA.high <=eventB.low || eventB.high <= eventA.low); }
	function mergeOpts(obj, opts) //this function overrides obj with everything in opts.
	{ 
		for(var prop in opts)
			obj[prop] = opts[prop];
	}
	
	//These internal add, update and remove do not notify.
		//Instead they flag the watch as dirty.
		//assumes that they have permission to change the data.
	function _addIssue(issue, groups)
	{
		assert(!issue.id);
		issue.id = db.createIssue(issue, groups);
		return _addExistingIssue(issue);
	}
	function _addExistingIssue(issue) {  //issue format: {start, end, id, other stuff}
		//We need it in: { int: {low = number, high = number}, id = string, other stuff }
		//insert into lookup table.
		var id = issue.id;
		assert((!issue.start || issue.start.constructor == Date) && (!issue.end || issue.end.constructor == Date), "start/end are not valid javascript dates");
		assert(!IssueLookup[id] || IssueLookup[id].isDeleted(), "Attempting to add issue with same ID - " + id);
		resetMeta(issue);
		//console.log("Inserting issue "+id, issue);
		IssueLookup[id] = issue;
		if(isEvent(issue))
		{
			issue.int = {low: issue.start, high: issue.end};
			//insert into interval tree.
			IssueIntervalTree.insert(issue);
			//check if it clashes existing watches, if so mark as dirty.
			for(var i = 0;i<rangeWatch.length;i++)
			{
				if(overlaps(issue.int, rangeWatch[i].int))
					rangeWatch[i].dirty = true;
			}
		}
		else
		{
			wtfDataStructure.insert(issue);
		}
	}
	
	function _deleteIssue(id)
	{
		var issue = IssueLookup[id];
		assert(issue && !issue.isDeleted());
		db.deleteIssue(issue);
		return _TdeleteIssue(id);
	}
	
	function _TdeleteIssue(id){
		var issue = IssueLookup[id];
		assert(issue && !issue.isDeleted());
		IssueLookup[id].delete();
		if(isEvent(issue))
		{
			IssueIntervalTree.remove(issue);
			//delete IssueLookup[id];
			for(var i = 0;i<rangeWatch.length;i++)
			{
				if(overlaps(issue.int, rangeWatch[i].int))
					rangeWatch[i].dirty = true;
			}
		}
		else
		{
			wtfDataStructure.remove(issue);
		}
	}
	
	function _updateIssue(id, opts)
	{
		var issueBase = IssueLookup[id];
		if(!issueBase || issueBase.isDeleted())
			throw Error("Attempting to update, but unable to retrieve issue/issue deleted: "+id);
		_TdeleteIssue(id);
		//create new issue
		mergeOpts(issueBase, opts);
		db.updateIssue(issueBase);
		_addExistingIssue(issueBase);
		issueBase.undelete();
	}
	
	function notify_dirty()
	{
		for(var i = 0;i<rangeWatch.length;i++)
		{
			if(rangeWatch[i].dirty)
			{
				try{
					processRangeCallback(rangeWatch[i]);
				}
				catch(e)
				{
					console.error(e, e.stack);
				}
			}
			rangeWatch[i].dirty = false;
		}
	}
	
	function notify_dirty_issues(){
		for(var i = 0;i<issueWatch.length;i++)
		{
			try{
				processIssueCallback(issueWatch[i]);
			}
			catch(e)
			{
				console.error(e, e.stack);
			}
		}
	}
	
	function processRangeCallback(rangeWatch)//rangeWatch: {int: range, callback: cb, filters: filters};
	{
		//grab all events which intersect that range
		var events = IssueIntervalTree.queryInterval(rangeWatch.int.low, rangeWatch.int.high);
		var finalevents = _.chain(events)
		.filter(function(evt) { return !evt.isDeleted() })
		.value();
		//TODO: apply filters
		rangeWatch.callback(finalevents);
	}
	
	function processIssueCallback(issueWatch)
	{
		issueWatch.callback(wtfDataStructure.items(issueWatch.filters));
	}
	
	
	
	//Issue Modification API
	IssueController.addIssue = function(issue, groups) { this.addIssues([issue], groups); };
	IssueController.addIssues = function(issues, groups)  //-> promise.done(success_cb, failure_cb)
	{ 
		assert(groups, "Thou shalt specify who this event is visible to.");
		//TODO: check permissions
		for(var i = 0;i<issues.length;i++)
			_addIssue(issues[i], groups);
		notify_dirty();
		notify_dirty_issues();
	};
	IssueController.addExistingIssues = function(issues)  //-> promise.done(success_cb, failure_cb)
	{ 
		//TODO: check permissions
		for(var i = 0;i<issues.length;i++)
			_addExistingIssue(issues[i]);
		notify_dirty();
		notify_dirty_issues();
	};
	
	IssueController.updateIssue = function(id, opts) { this.updateIssues([[id, opts]]); };
	IssueController.updateIssues = function(issues /*[id, opts]*/) //-> promise.done(success_cb, failure_cb)
	{ 
		//TODO: check permissions
		for(var i = 0;i<issues.length;i++)
			_updateIssue(issues[i][0], issues[i][1]);
		notify_dirty();
		notify_dirty_issues();
	};
	IssueController.deleteIssue = function(id) { this.deleteIssues([id]); };
	IssueController.deleteIssues = function(ids) //-> promise.done(success_cb, failure_cb)
	{ 
		//TODO: check permissions
		for(var i = 0;i<ids.length;i++)
			_deleteIssue(ids[i]);
		notify_dirty();
		notify_dirty_issues();
	};
	
	IssueController._relabelIssue = function(from, to)
	{
		var issue = IssueLookup[from];
		assert(issue, "Can't find issue "+from +", relabling "+from+" - "+ to);
		//Check if its in the tree, if so, then re-add it.
		if(isEvent(issue))
			IssueIntervalTree.remove(issue);
		issue.id = to;
		delete IssueLookup[from];
		IssueLookup[to] = issue;
		if(isEvent(issue))
		{
			IssueIntervalTree.insert(issue);
			for(var i = 0;i<rangeWatch.length;i++)
			{
				if(overlaps(issue.int, rangeWatch[i].int))
					rangeWatch[i].dirty = true;
			}
		}
		notify_dirty();
		notify_dirty_issues();
	}
	
	//Watching API
		//Supports the following:
			//Watching date ranges for change.
			//(num, num, [<filter_obj>], function([<event_obj>])) -> function to cancel this watch.
	//Usage: watchRange(rangelow, rangehigh, [filters] , cb(newval)) //will apply global filters
	IssueController.watch = function(rangelow, rangehigh, filters, cb) //this will call cb(events) on change.
	{
		//register the callback.
		var range = {low: rangelow, high: rangehigh};
		var watch = {int: range, callback: cb, filters: filters, dirty: false};
		rangeWatch.push(watch);
		//immediately call the callback with the stuff in the rangetree.
		processRangeCallback(watch);
		
		//return a function to deregister the callback.
		return function()
		{
			var index = rangeWatch.indexOf(watch);
			rangeWatch.splice(index, 1);
		};
	}
		//Easy to implement, but not supported yet:
			//Watching event for change.
	IssueController.watchIssues = function(filters, cb)
	{
		var watch = {filters: filters, callback: cb};
		issueWatch.push(watch);
		processIssueCallback(watch);
		return function()
		{
			var index = issueWatch.indexOf(watch);
			issueWatch.splice(index, 1);
		};
	}
	
	IssueController.watchEVERYTHING = function(filters, cb)
	{
		function makesync(cb){ //Creates a function to sync 2 functions on.
			var t = {a: [], b: []};
			function sync(a,b)
			{
				t.a = (a!==null)?a:t.a;
				t.b = (b!==null)?b:t.b;
				if(t.a && t.b)
				{
					cb(t.a,t.b);
				}
			}
			return sync;
		}
		var sync = makesync(function(issues,moreissues) {
			console.log(issues, moreissues);
			var result = _.union(issues, moreissues);
			assert(issues.length + moreissues.length  == result.length);
			cb(result);
			});
		IssueController.watchIssues(filters, function(x) { return sync(x, null) })
		IssueController.watch(new Date(0), new Date(100000000000000), filters, function(x) { return sync(null, x) });
	}
	
	//get initial events.
	getIssues = function()
	{
		$http.post("/api/getAllUserIssues").success(function(data)
		{
			db.unlock();
			console.log(data);
			IssueController.addExistingIssues(_.map(data, unpackIssue));
		});
	}
	/*$http.get('/json/dummy-month.json').success(function(data)
	{
		data = _.map(data, function(event) { event.start = new Date(event.start); event.end = new Date(event.end); return event; });
		IssueController.addExistingIssues(data);
	});*/
	t = IssueController;
	return IssueController;
}]);

// Filters!
function isEvent(issue)
{
	return issue.start && issue.end;
}
function isNotDeleted(issue)
{
	return !issue.isDeleted();
}

function forSideBar(issue)
{
	return !issue.end;
}

//Utility for dates.

function todayRelative(count)
{
	return moment(0,"HH").add(count, "days");
}

function dateRelative(date, count)
{
	return moment(date).add(count, "days");
}


function endOfDay(day)
{
	return moment(day).add(1,"day").subtract(1,"second");
}
 
