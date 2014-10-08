//Requirements, and the like.
var async = require('async');
var fs = require('fs'); 

var express = require('express');
var Primus = require('primus');
var app = express();

//Event streams
var Bacon = require('baconjs');
var eventStreams = {
	all: new Bacon.Bus()
}

//primus stuff
app.set('port', process.env.PORT || 8888);
var server = require('http').createServer(app);
var primus = new Primus(server, {transformer: 'engine.io'});

primus.save(__dirname +'/app/js/primus.js');

var push_notifier = require('./realtime/handlers')(primus, null, eventStreams);
var cmdstream = eventStreams.all.filter(function(event) { return event.type == 'COMMAND'; });
var exec = require('child_process').exec;
//TODO: fix big security breach.
	//Need to make sure that the only code which can access this is authorized IDE code.
cmdstream.onValue(function(event)
{
	var sid = event.sparkid;
	var cmd = event.data;
	var child = exec(event.data, function(err, stdout, stderr)
	{
		console.log(sid, 'exec', event.data);
	});
	child.stdout.on('data', function(chunk) {
		push_notifier.message(sid, {
			type: "EXEC_STDOUT",
			data: chunk
		});
	});
	child.stderr.on('data', function(chunk) {
		push_notifier.message(sid, {
			type: "EXEC_STDERR",
			data: chunk
		});
	});
	child.stdout.on('end', function()
	{
		//console.log("done")
		push_notifier.message(sid, {
			type: "EXEC_DONE",
			data: cmd
		});
	});
}) 

//List of paths that are allowed on the browser.
app.use("/lib", express.static(__dirname + "/bower_components"));
app.use("/js", express.static(__dirname + "/app/js"));
app.use("/json", express.static(__dirname + "/app/json"));
app.use("/templates", express.static(__dirname + "/app/templates"));
app.use("/styles", express.static(__dirname + "/.tmp/styles/"));

app.use("/", function(req, resp, next)
{
	//setUserCookie(req, resp); 
	
	//technically duplicates the above static functionality
		//However, makes development significantly easier.
		//TODO: remove for production.
	var requested = __dirname + "/app"+ req.path;
	fs.exists(requested, function(exists) {  
		if(exists)
			resp.sendFile(requested);
		else
			resp.sendFile(__dirname + "/app/index.html");
	});
	
	//app_static(req, resp, next);
});

server.listen(app.get('port'), function(){ //actually launch the server
	console.log('Listening on port %d', server.address().port);
});

//This section helps your code die properly.
	//In particular, you need to wait for all pipes to flush.
function cleanup()
{
	function die() { console.log("Shutdown complete"); process.exit(0); }
	
	console.log("Shutting down gracefully"); 
	/*async.waterfall([
		DSS.shutdown
	],die);*/
	die();
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
