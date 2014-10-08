var Bacon = require('baconjs');
var async = require('async');
//Warning: staring too much into this code can lead to nightmares. Because of the above.
var _ = require('underscore');

//Util

function assert(pred, msg)
{
	msg = msg || "Assertion failed";
	if(!pred)
		console.log(msg);
	
}

/* Multi-phase execution for retrieval tasks:
	This is the server side mirror to ## A general algorithm for storing a subgraph
Poll DS for tasks -> many [Retrieve object] tasks
<Retrieve object> -> [Decompose] tasks.
<Decompose, transform> -> Many [insert objects] tasks.
All the [insert objects] run in parallel, subsequently generating a single re-pointer task
<Re-pointer>

*/
//Bacon.sequentially(interval, values)
//Bacon.repeatedly(interval, values) //This for telling things to do what to do.

var poll = new Bacon.Bus(); //This is an internal bus for looping over the data sources periodically.
var retriever = new Bacon.Bus();
var decomposer = new Bacon.Bus();
var re_pointer = new Bacon.Bus();
var changed = new Bacon.Bus(); //This just pipes out all the changes.
var datasources = ["RESET"];

//Phase 1: polling.
var pollLoop;

//pollLoop = poll.plug(Bacon.sequentially(500, datasources))

poll.onValue(function(val)
{
	//console.log(val);
	if(val === "RESET")
	{
		pollLoop(); //removes the previous thing, just in case.
		pollLoop = poll.plug(Bacon.sequentially(500, datasources));
	}
	else if(val.isDS) //go poll the DS - it returns a function to get many values.
	{
		//For safety, this prevents multiple-execution.
		var pollRetFunction = function(objs) //obj = [{action: function(cb), objType: string}] //cb(err, result)
		{
			assert(_.every(objs, function(obj){ return _.isFunction(obj.action) && _.isString(obj.objType);  }, "Incorrect typing on objs"));
			//Insert into objects to retriever.
			//console.log("Retrieving ", objs);
			objs = _.map(objs, function(obj) { obj.DS = val; return obj }); //attach the DS.
			retriever.plug(Bacon.fromArray(objs));
		};
		val.getUpdateRequests(pollRetFunction);
	}
	else //else ignore.
		console.log("poll ignored",val);
})

//Phase 2: retrieving stuff.
//Essentially retrievers stuff, then passes self contained stuff down the pipe.
	//Each insert task is a command, in the following format.
		//{ objType: OBJTYPE, id: "string" , types}
retriever.onValue(function(retrieval)
{
	var objType = retrieval.objType;
	var DS = retrieval.DS;
	//TODO: check if ID is already stored.
	retrieval.action(function(err, results) //Array of objects. Each object is supposed to be self contained.
	{
		if(results) //send the results down the pipe.
		{
			var t = _.map (results, function(item){ return {obj: item, objType: objType, DS: DS }; });
			decomposer.plug(Bacon.fromArray(t));
		}
		else
			console.log(err, err.stack);
	});
});

//Phase 3: decomposition
//Each self contained component is broken down into multiple insert tasks.
decomposer.onValue(function(task)
{
	var DS = task.DS;
	var objType = task.objType;
	if(! DS.decomposer[objType].isComplete(task) ) //Check if its complete.
	{//No? Ask for the next stuff to get.
		//-Retrieve functional
			//-Same as part B), but with a parameter, the current data.
		/*var newTask = DS.decomposer[objType].extender(task, function (err, result)
		{
			var newType = result.objType;
			var newItem = DS.decomposer[objType].combiner[newType](task.obj, result.obj);
			//Combine and push back into this module.
			//Assume exactly 1 item is created.
			decomposer.push({ obj: newItem, DS: DS, objType: (objType+newType) });
		});*/
		retriever.push(newTask);
	}
	else
	{ //Yes? Actually decomposer.
		console.log("DISMANTLE PHASE, unimplemented");
	/*C) Dismantling things which you have gotten. For each <objType>,
		-There are 3 functionals here:
			-Is complete?
				-<IMPLEMENT isComplete>
			
			-Method for combination of both types of data.
				-<IMPLEMENT combiner<oldType, newType> >  */

	} 
});
//Phase 4: re_pointer

//Phase 5:


function connect(DS, db)
{ 
	//Give them the db.
	DS.registerDatabase(db);
	datasources.unshift(DS);
}

//forcefully updates a user's data.
	//Restrict to services. If not specified, any service will do.
function forceUpdate(userID, services)
{
	console.log("Forcing update?");
	_.each(_.filter(datasources, function(src){ return !services || src.id in services}), 
	function(datasource)
	{
		if(datasource.isDS)
		{
			var pollRetFunction = (function(err, objs) //obj = [{action: function(cb), objType: string}] //cb({item: retrieved, objType: objType})
			{
				assert(_.every(objs, function(obj){ return _.isFunction(obj.action) && _.isString(obj.objType);  }, "Incorrect typing on objs"));
				//Insert into objects to retriever.
				console.log("Retrieving ", objs);
				objs = _.map(objs, function(obj) { obj.DS = datasource; return obj }); //attach the DS.
				retriever.plug(Bacon.fromArray(objs));
			});
			datasource.forceUpdate(userID, pollRetFunction);
		}
	});
}

//Not fully implemented
//Essentially end everything, clear the pipeline.
//Callback on pipeline cleared.
function shutdown(callback)
{
	poll.end();
}

module.exports = {
	//internals
	connect: connect,
	shutdown: shutdown,
	//globals
	
	forceUpdate: forceUpdate,
	changeStream: changed
};