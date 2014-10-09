//This thing routes stuff everywhere.
//The stuff in the folder /app is static.

//Requirements, and the like.
var async = require('async');

var app_details =  require('./api/app_details.js');
var api = require('./api/api.js');
//var DSS = require('./datasource/dataSourceService.js');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
//For sanity purposes, don't change the order of app.use.
app.use(express.cookieParser());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies


//TODO: One ton of passport stuff.
/*var passport = require('passport');
var login = { handlers: {}, callbacks: {}};

require('./auth/passport_base.js')(passport, login, eventStreams); //Also provides eventStream.login
require('./auth/passport_facebook.js')(passport, login);
require('./auth/passport_linkedin.js')(passport, login);
require('./auth/passport_github.js')(passport, login, eventStreams);

*/
//Conditional redirect.
/*app.use(function(req, res, next){
	if(app_details.allowed_hosts.indexOf(req.get('host')) == -1)
		res.redirect("http://"+app_details.allowed_hosts[0]);
	else
		next();
});*/

/* Software architecture.
-This software is split into 3 parts.

a) Services
This is for the data sources, storage, operations, etc.
Examples of things which go here:
-login
-retrieve user data */

app.post('/api/:apiname', function(request, response) {
	//response.send("API test: "+request.params.apiname);
	var handler = api.handlers[request.params.apiname]
	if(!handler)
		response.send("Incorrect API usage:"+request.params.apiname);
	else
		handler(request, response);
});

/*b) "static" app
This contains the frontend - its static, in the sense that what's sent out is always the same.
The app queries services for stuff. */

app.use("/lib", express.static(__dirname + "/bower_components"))
app.use("/", express.static(__dirname + "/client"))

/*c) Periodic ops.
These are for non-real-time operations.
This is currently un-implemented.

These stuff are implemented in components above:
DSS <- this implements retrieval systems.
*/

// Piping.
//TODO: CREATE_USER is not published yet. LOGIN is not published for CREATE_USER events.
var loginStream = api.eventStream.filter(function(event) { return event.eventType == "LOGIN" ||  event.eventType == "CREATE_USER"; }); 
loginStream.onValue(function(evt)
{
	console.log(evt);
	//Force retrieval of data.
	DSS.forceUpdate(evt.eventData.user.userID);
});

//actually launch
var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});

function cleanup()
{
	function die() { console.log("Shutdown complete"); process.exit(0); }
	
	console.log("Shutting down gracefully"); 
	async.waterfall([
		DSS.shutdown
	],die);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
