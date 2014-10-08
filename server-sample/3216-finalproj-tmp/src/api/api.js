/* Event stream format:
{
	eventType: string
	eventData: obj
}
*/

'use strict';
var fb_app = require('./app_details');
var superJson = require('./super-json');
//migrate to lodash some-day.
var _ = require('underscore');
var needle = require('needle');
var async = require('async');
var Bacon = require('baconjs');

//Globals:
var eventStream = new Bacon.Bus();

//Consts:
var EVERYONE_GROUP_ID = 1;
var SELF_DATA_SOURCE = 1;
var GROUP_PERMISSIONS = ['read','readWrite'];

//Util
//TODO: move this.
var clone = function(obj) { var myJson = superJson.create(); return myJson.parse(myJson.stringify(obj)); };

function urlParamsToAssoc(params)
{ //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript #answer 2.
	var match,
	pl     = /\+/g,  // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g,
	decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
	params = params.trim();
	var urlParams = {};
    while (match = search.exec(params))
       urlParams[decode(match[1])] = decode(match[2]);
	return urlParams;
}

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
var debug = false;
function debug_log()
{
	if(debug)
		console.log.apply(this, arguments);
}

// --------------------------------------------------------------------------------------------------
//API helpers.
function handleOverallError(err, resp)
{
	debug_log(err);
	if(!err)
		resp.send("200 ok");
	else
		resp.send(err);
}
function handleQueryError(err, result, callback){
	if(err)
	{
		debug_log(err);
		callback(err);
	}
	else
		callback(err, result.insertId); 
}


function getClientData(access_token, callback) //callback(err, validity, data)
{	  
	//First we check if we can query the graph
	var req = needle.get("https://graph.facebook.com/me?access_token=" + access_token, function(error, resp){
		var data = resp.body;
		if(data.error && data.error.type == "OAuthException")
			callback(null, false, data);
		else
			callback(null, true, data);
	});
}

function getUserByFBID(fbid, cb) //cb(err, user)
{
	debug_log("Getting: "+fbid);
	var getUserQuery = "SELECT * FROM users JOIN datasources "
		+"ON datasources.UserID = users.UserID "
		+"WHERE SourceType='FACEBOOK' AND ExternalID="+connection.escape(fbid)+" "
		+"LIMIT 1";
	connection.query(getUserQuery, function(err, rows)
	{
		if(err)
			cb(err);
		else
			cb(null, rows[0]);
	});
}

function getUserFromToken(access_token, callback) //callback(err, data, user)
{
	async.waterfall([getClientData.curry(access_token),
	function(valid, data, cb){
		debug_log(valid, data);
		if(!valid)
			cb(Error('y ur token not valid'));
		else
		{
			//check if user logged in.
			getUserByFBID(data.id, 
				function (err, user) { 
					cb(err, data, user); 
				} 
			);
		}
	}], 
	callback);
}

// --------------------------------------------------------------------------------------------------

var handlers = {};


	
//test
handlers["eventTest"] = function(req, resp)
{
	resp.send("eventTest");
};


function INSERT_USER(first_name, last_name, callback) //cb(err, lastinsertedID)
{
	var query = "INSERT INTO users (firstName, lastName) VALUES (?, ?)";
	connection.query(query, [first_name, last_name], 
		function(err, result) { 
			debug_log("Inserted user", first_name, last_name);
			handleQueryError(err, result, callback)
		});
}

function INSERT_GROUP(group_name, group_desc, callback){ //cb(err, lastInsertedID)
	var query = "INSERT INTO groups (groupName, groupDesc) VALUES (?, ?)";
	connection.query(query, [group_name, group_desc], 
		function(err, result) { 
			debug_log("Inserted group", group_name, group_desc);
			handleQueryError(err, result, callback);
		});
}

function INSERT_DATASOURCE(uID, extID, sourceType, accessToken, expiry, callback){ //cb(err, lastInsertedID)
	var query = "INSERT INTO datasources (userID, ExternalID, SourceType, AccessToken, TokenExpiresBy) VALUES (?, ?, ?, ?, ?)";
	
	connection.query(query, [uID, extID, sourceType, accessToken, expiry], 
		function(err, result){ 
			debug_log("Datasource", uID, extID, sourceType, accessToken, expiry);
			handleQueryError(err, result, callback);
		});
}

function INSERT_USERGROUP(uID, groupID, permission, isSelfGroup, callback){ //cb(err, lastInsertedID
	var query = "INSERT INTO usergroup (userID, groupID, MembershipLevel, isSelfGroup) VALUES (?, ?, ?, ?)"
	connection.query(query, [uID, groupID, permission, isSelfGroup], 
		function(err, result){ 
			debug_log("UserGroup", uID, groupID, permission, isSelfGroup);
			handleQueryError(err, result, callback);
		});
}

function INSERT_TAGS(tagName, IssueID) {
	var query = "INSERT INTO tags (tagName, IssueID) VALUES (?, ?)";
	connection.query(query, [tagName, IssueID],
		function(err, result) {
			debug_log("Tags", tagName, IssueID);
			handleQueryError(err, result, callback);
		});
}

function INSERT_SOFTDEADLINES(IssueID, deadLine) {
	var query = "INSERT INTO softdeadlines (IssueID, deadLine) VALUES (?,?)";
	connection.query(query, [IssueID, deadLine],
		function(err, result) {
			debug_log("Tags", IssueID, deadLine);
			handleQueryError(err, result, callback);
		});
}

function INSERT_ISSUELOG(IssueLogId, IssueId, ActionType, ActionDetails) {
	var query = "INSERT INTO issuelog (IssueLogId, IssueId, ActionType, ActionDetails) VALUES (?,?,?,?)";
	connection.query(query, [IssueLogId, IssueId, ActionType, ActionDetails],
		function(err, result) {
			debug_log("IssueLog", IssueLogId, IssueId, ActionType, ActionDetails);
			handleQueryError(err, result, callback);
		});
}

function INSERT_ISSUERELATION(parentID, childID, relationType) {
	var query = "INSERT INTO issuerelation (parentID, childID, relationType) VALUES (?,?,?)";
	connection.query(query, [parentID, childID, relationType],
		function(err, result) {
			debug_log("IssueRelation", parentID, childID, relationType);
			handleQueryError(err, result, callback);
		});
}

//This is as pretty as i can make it. Believe me, i tried.
function createUser(first_name, last_name, fbUID, longTermToken, tokenExpr, callback) //callback(err, uID)
{
	var uID;
	//i need 2 things: uID, selfGroupID
	async.waterfall([
		async.map.curry([INSERT_USER.curry(first_name, last_name), INSERT_GROUP.curry("My Calendar", "Self-group")], apply),
		function(results, callback)
		{
			uID = results[0];
			var self_group_id = results[1];
			async.parallel([
				INSERT_DATASOURCE.curry(uID, fbUID, 'FACEBOOK', longTermToken, tokenExpr), //Insert INTO users.
				INSERT_USERGROUP.curry(uID, EVERYONE_GROUP_ID , 'ReadWrite', false),
				INSERT_USERGROUP.curry(uID, self_group_id , 'Admin', true)
			], callback);
		}
	],
	function (err) { callback(err, uID); });
}


//When a user is created, store the following information:
	//Long access token.
		//See https://developers.facebook.com/docs/facebook-login/access-tokens - Expiration and Extending Tokens
				
// -------- CUD queries --------
	//User related -------------
	//This is before i learnt how to make it pretty.
	
	handlers["createUser"] = function(req, resp)
	{
		//what do i need?
			//Short-lived-token
		var access_token = req.cookies.fbtoken;
		debug_log("createUser: "+access_token);
		async.waterfall([
			getClientData.curry(access_token),
			function(valid, data, callback){
				if(!valid)
				{
					//poke the user.
					callback("Invalid user token", null);
				}
				callback(null, data);
			},
			//we know its valid
			function(data, callback){
				//get the long term token.
				var oauth_url = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id="+fb_app.id+"&client_secret="+fb_app.secret+"&fb_exchange_token="+access_token;
				needle.get(oauth_url, function(error, resp)
				{
					var token = resp.body;
					debug_log("perm token:");
					debug_log(token);
					callback(error, data, token);
				});
			}
		], function (err, data, token) {
			//At this stage, we should just create the new user.
			var token_assoc = urlParamsToAssoc(token);
			var access_token = token_assoc["access_token"];
			var expires = new Date((new Date).getTime() + parseInt(token_assoc["expires"]));
			createUser(data.first_name, data.last_name, data.id, access_token, expires, 
				function (err, uID) { if(err) resp.send(err); else resp.send("Created user: "+uID+" - "+data.first_name +" "+ data.last_name ) });
		});
		
		//In addition, the user is given the token EVERYONE.
	};
	
	
	handlers["loginHandler"] = function(req, resp){
		//assume we have: userToken.
		var access_token = req.cookies.fbtoken;
		
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err) {
				resp.send("wtf:"+err);
			}
			else if(user)
			{
				debug_log(user);
				eventStream.push({
					eventType: "LOGIN",
					eventData: {
						user: user,
						data: data
					}
				});
				//TODO: //Ensure that long term token is still valid, else regenerate it.
				resp.send("Welcome back, "+data.first_name + " "+data.last_name);
			}
			else
				handlers["createUser"](req, resp);
		});
	}


	//Group related  -----------
	handlers["createGroup"] = function(req, resp) //TODO: test.
	{
		//ASSERT NON-ANON-USER.
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err)
				resp.send(err);
			else if(user)
			{
				async.waterfall([
					INSERT_GROUP.curry(group_name, group_desc), //cb(err, lastInsertedID)
					function(groupID, callback){ INSERT_USERGROUP(uID, groupID, permission, isSelfGroup, callback); }
				], function(err, lastInsertedID){
					handleOverallError(err, resp);
				});
			}
			else
			{
				resp.send(403);
			}
		});
	};

 
	//Issue related  -----------
	function opts_to_querystring(opts, allowedOpts)
	{
		var keys = Object.keys(opts);
		var s = "";
		debug_log(keys);
		for(var i = 0;i<keys.length;i++)
		{
			if(! keys[i] in allowedOpts)
				throw "Invalid option";
			s+=keys[i]+"="+connection.escape(opts[keys[i]]);
			if(i < keys.length-1)
				s+=", ";
		}
		return s;
	}
	
	function listOpts(opts, allowedOpts) 
	{
		var str = "";
		var keys = Object.keys(opts);
		for(var i = 0;i<keys.length;i++)
		{
			if(!keys[i] in allowedOpts)
				throw "Invalid option";
			str +=keys[i];
			if(i < keys.length-1)
				str+=", ";
		}
		return str;
	}
	
	function listVals(opts, allowedOpts)
	{
		var str = "";
		var keys = Object.keys(opts);
		for(var i = 0;i<keys.length;i++)
		{
			if(!keys[i] in allowedOpts)
				throw "Invalid option";
			str+=connection.escape(opts[keys[i]]);
			if(i < keys.length-1)
				str+=", ";
		}
		return str;
	}
	
	var ISSUE_ALLOWED_OPTS = ['IssueName', 'description', 'startDate', 'endDate', 'description', 'parentID'];
	function CREATE_ISSUE(datasource, userid, opts, callback) //callback(err, issueID)
	{
		if(!('IssueName' in opts))
			callback('IssueName is a required field');
		//assert that the required fields are present.
		var query = "INSERT INTO issues (dataSource, "+listOpts(opts, ISSUE_ALLOWED_OPTS)+") "
		+"VALUES ("+datasource+", "+listVals(opts, ISSUE_ALLOWED_OPTS)+")";
		connection.query(query,function(err, result)
		{
			handleQueryError(err, result, callback);
		});
	}
	
	function CREATE_GPERMISSION(IssueID, group_permission, callback) //callback(err, affected rows) //how to composite key?
	{
		var groupID = group_permission[0];
		var permission = group_permission[1];
		if(!permission in GROUP_PERMISSIONS)
			callback("Incorrect permission: "+permission);
		//TODO: ensure that the user can actually insert that permission.
			//i.e. has writeaccess to group.
		var query = "INSERT INTO grouppermissions (groupID, IssueID, permissionLevel) VALUES (? ,? ,?)";
		debug_log(query, [groupID, IssueID, permission]);
		connection.query(query, [groupID, IssueID, permission], function(err, result)
		{
			debug_log("TEST WTF",err,result);
			if(err)
				callback(err);
			else
				callback(null, result.affectedRows);
		});
	}
	
	//Stuff created through this branch are USER CREATED.
		//Test case: $.post('/api/createIssue', { options: {IssueName: "test" }, groups:[[1,'readWrite']] }, function(data) { debug_log(data) });
		//returns the issueID.
	handlers["createIssue"] = function(req, resp)
	{
		//ASSERT NON-ANON-USER.
		//userID, options:{key: value}, groups:{id, permission}
		var access_token = req.cookies.fbtoken;
		var opts = req.body.options;
		var groups = req.body.groups;
		function validateInput(groups)
		{
			try{
			return _.every(groups, function(group)
			{
				debug_log(group);
				if( _.isNumber(parseInt(group[0])) && GROUP_PERMISSIONS.indexOf(group[1]) != -1)
					return true;
				else
					return false;
			});
			}
			catch(e)
			{
				return false;
			}
		}
		if(!validateInput(groups))
			resp.send("invalid groups", 400);
		else
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err)
				resp.send(err);
			else if(user)
			{
				var userid = user.userID;
				debug_log(opts);
				var iid;
				async.waterfall([
				CREATE_ISSUE.curry(SELF_DATA_SOURCE,userid,opts), //If you want to create one with a different data source, copy and change this.
				function(issueID, callback)
				{ iid = issueID; async.map(groups, CREATE_GPERMISSION.curry(issueID), callback); }
				],
				function(err)
				{
					//handleOverallError(err, resp);
					
					if(err)
						resp.send(err, 400);
					else
					{
						debug_log("created issue ", iid);
						resp.send({id: iid}); //if u simply send the id, jquery will treat it as a resp code.
					}
				});
			}
			else
				resp.send(403);
		});
	};
	
	/* Outline:
			Users can only update issues which they have some write token to.
			//This query 
			SELECT * FROM users 
			INNER JOIN usergroup USING (userID) 
			INNER JOIN groups USING (groupID) 
			INNER JOIN grouppermissions using (groupID) 
			INNER JOIN issues USING (issueID) 
			WHERE userID = <userID>;
		*/
	function UPDATE_ISSUE(issueID, userID, opts, callback) //callback(err)
	{
		//Oh lol. If there's a ? inside the strings, connection.escape will not hide it.
			//This causes the ? to be interpreted again.
				//Basically he doesn't expect you to escape twice.
		var query = "UPDATE users "+
				"INNER JOIN usergroup USING (userID) "+
				"INNER JOIN groups USING (groupID) "+
				"INNER JOIN grouppermissions using (groupID) "+
				"INNER JOIN issues USING (issueID) "+
			"SET "+opts_to_querystring(opts, ISSUE_ALLOWED_OPTS)+ " "+
			"WHERE userID = "+connection.escape(userID)+" AND issueID = "+connection.escape(issueID)+" AND permissionLevel = 'readWrite'";
		connection.query(query, function(err, result)
		{
			debug_log(result);
			if(err)
				callback(err);
			else
				callback(null, result.affectedRows);
		});
	}

	/* Test case:
	$.post('/api/updateIssue', { id: 8, opts: {startDate: (new Date()).toJSON() } },
	function (data) { 
	   debug_log(data);
	});
	*/
	handlers["updateIssue"] = function(req, resp)
	{
		//ASSERT NON-ANON-USER.
		//userID, IssueId, options:{key: value}
		var access_token = req.cookies.fbtoken;
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err)
				resp.send(err);
			else
			{
				var userid = user.userID;
				var issueID = req.body.id;
				var opts = req.body.options;
				UPDATE_ISSUE(issueID, userid, opts, function(err, rows)
				{
					debug_log("updateIssue",issueID, opts);
					debug_log("Rows updated:",rows);
					if(err) resp.send(err);
					else if (rows == 0) resp.send(403);
					else resp.send("Success - "+rows+" updated");
				});
			}
		});
	};
	
	function DELETE_ISSUE(userID, issueID, callback) //cb(err, rows affected)
	{
		var query = 
		"DELETE FROM issues where  "+
		"issues.issueID in "+
			"(SELECT issueID FROM "+
				"(SELECT issueID FROM users "+
					"INNER JOIN usergroup USING (userID) "+
					"INNER JOIN groups USING (groupID) "+
					"INNER JOIN grouppermissions using (groupID) "+
					"INNER JOIN issues USING (issueID) "+
					"WHERE userID = "+connection.escape(userID)+" AND permissionLevel = 'readWrite' "+
					"AND issueID = "+connection.escape(issueID)+") "+
			"as Temp)";
		debug_log(query);
		connection.query(query, function(err, result)
		{
			debug_log(result);
			if(err)
				callback(err);
			else
				callback(null, result.affectedRows);
		});
	
	}

	handlers["deleteIssue"] = function(req, resp)
	{
		var access_token = req.cookies.fbtoken;
		getUserFromToken(access_token, function(err, data, user)
		{
			
			if(err)
				resp.send(err);
			else
			{
				var userid = user.userID;
				var issueID = req.body.id;
				debug_log("--------------------DELETE ISSUE ---------------", userid, issueID);
				DELETE_ISSUE(userid, issueID, function(err, rows)
				{
					debug_log("deleteIssue",issueID, userid);
					debug_log("Rows updated:",rows);
					if(err) resp.send(err);
					else if (rows == 0) resp.send(403);
					else resp.send("Success - "+rows+" deleted");
				});
			}
		});
	};
	
//Read queries
	//User related -------------


	//Group related  -----------

 
	//Issue related  -----------
	//temporary stand in.
	function GET_ALL_USER_ISSUES(uID, callback) //callback(err, rows)
	{
		var query = "SELECT * FROM users "+
			"INNER JOIN usergroup USING (userID) "+
			"INNER JOIN groups USING (groupID) "+
			"INNER JOIN grouppermissions using (groupID) "+
			"INNER JOIN issues USING (issueID) "+
			"WHERE userID = ?; ";
		connection.query(query, [uID],callback);
	}
	
	handlers["getAllUserIssues"] = function(req, resp)
	{
		var access_token = req.cookies.fbtoken;
		if(!req.body && req.body.start && req.body.end)
			resp.send('Invalid usage - start/end');
		else
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err)
				resp.send(err);
			else if(user)
			{
				var userid = user.userID;
				GET_ALL_USER_ISSUES(userid, 
				function (err, rows)
				{
					debug_log(err, rows);
					if(err)
						resp.send(err);
					else
						resp.send(rows);
				});
			}
			else
			{
				resp.send(403);
			}
		});
	};
	
	//TODO: ASSIGNED TO TACK KIAN - restrict to stuff the user can access.
	function GET_ISSUES_IN_RANGE(uID, rangeStart, rangeEnd, callback) //callback(err, rows)
	{
		//TODO: put in UID.
		var D1 = connection.escape(rangeStart);
		var D2 = connection.escape(rangeEnd);
		var query = "select issueID from issues "+
		"where (startDate >= "+D1+" and startDate <= "+D2+") or (endDate >= "+D1+" and endDate <= "+D2+") or (startDate <= "+D1+" and endDate >= "+D2+") "+
		"union select issueID from issuesmeta where (repeatstart >= "+D1+" and repeatstart <= "+D2+") or (repeatend >= "+D1+" and repeatend <= "+D2+") "+
		"or (repeatstart <= "+D1+" and repeatend >= "+D1+" and (ceil(("+D1+"-repeatstart)/repeat_interval) <= floor(("+D2+"-repeatstart)/repeat_interval) "+
		"or ceil(("+D1+"-repeatstart+((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID)))/repeat_interval) <= floor(("+D2+"-repeatstart+((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID)))/repeat_interval) "+
		"or (floor(("+D1+"-repeatstart)/repeat_interval) + ((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID))/repeat_interval > ("+D2+"-repeatstart)/repeat_interval)))";
		connection.query(query, callback);
	}
	/*handlers["getIssuesDateRange"] = function(req, resp) //TODO: INCOMPLETE
	{
		//ASSERT NON-ANON-USER.
		var access_token = req.cookies.fbtoken;
		if(!req.body && req.body.start && req.body.end)
			resp.send('Invalid usage - start/end');
		else
		getUserFromToken(access_token, function(err, data, user)
		{
			if(err)
				resp.send(err);
			else
			{
				var userid = user.userID;
				var rangeStart = req.body.start;
				var rangeEnd = req.body.end;
				GET_ISSUES_IN_RANGE(userid, rangeStart, rangeEnd, 
				function (err, rows)
				{
					if(err)
						resp.send(err);
					else
						resp.send(rows);
				});
			}
		});
	};*/
	
	handlers["getAllDataSrc"] = function(req, resp)
	{
		//ASSERT NON-ANON-USER.
	
	};

module.exports = {
	handlers:handlers,
	eventStream: eventStream
};