/* This service is a reactor
-It polls loaded data sources for tasks to do.
-It also implements a pipeline to stream tasks around. */
var DSS = require('./dataSourceService_impl.js');
var mysql = require('mysql');
var database = mysql.createConnection({
	host     : 'localhost',
	user     : 'desk_user',
	password : 'desk_password',
	database : 'cs3216a1_schema',
	supportBigNumbers: true 
});

//Initialize all data sources here.
var facebook = require('./DS_facebook.js');
facebook.options({});
DSS.connect(facebook, database);

function shutdown(cb)
{
	console.log("DSS shutdown success");
	cb();
}

module.exports = {
	shutdown: shutdown,
	forceUpdate: DSS.forceUpdate,
	changeStream: DSS.changeStream
}

/* How to create a data source.
//TODO: Please tell me to go write this.


*/