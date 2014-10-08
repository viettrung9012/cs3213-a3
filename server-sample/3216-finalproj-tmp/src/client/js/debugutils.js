"use strict";

function assert(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}

function print(structure)
{
	function getErrorObject(){
		try { throw Error('') } catch(err) { return err; }
	}

	var err = getErrorObject();
	var caller_line = err.stack.split("\n")[4];
	var index = caller_line.indexOf("at ");
	var clean = caller_line.slice(index+2, caller_line.length);
	//var JSON = superJson.create();
	console.log(JSON.stringify(structure, null, '\t') + "\n"+clean);
}