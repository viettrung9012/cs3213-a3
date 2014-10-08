
/* Interval tree implemented on top of AVL tree.
Reference: CLRS.

Usage:
node ducktype properties:
{
	int: { low: number, high: number } low<=high
	id: string //you are welcome to pullrequest this if you want to support non-strings.
}

Supports multiple items with the same interval.
*/

'use strict';
var anal = true;

//Uses browserify. Meant to be used in browser with underscore js loaded.
var algorithms = require('algorithm-js');
var assert = require('assert').ok;
var clone = function(obj) { var myJson = superJson.create(); return myJson.parse(myJson.stringify(obj)); };

function interval_tree()
{
	var node_lt = function(node1, node2)
	{
		if(node1.int.low !== node2.int.low)
			return node1.int.low < node2.int.low;
		else
			return node1.int.high < node2.int.high;
	}
	function high_max(node){
		node.max = Math.max(node.value.int.high, (node.left ? node.left.max : 0), (node.right ? node.right.max : 0));
	}
	function overlaps(intA, intB) { return !(intA.high < intB.low || intB.high < intA.low); }
	
//private variables
	var avl = new algorithms.AVLTree(node_lt, high_max);
	var hashmap = []; //[id] -> node_containing_id //TODO.
	
	
	this.insert = function(item)
	{
		assert(item.int && item.int.low !== undefined && item.int.high !== undefined);
		var interval = item.int;
		var node = avl.find(item);
		//check if existing item
		if(node)
		{
			assert(!node.value.objs[item.id]);
			node.value.objs[item.id] = item;
		}
		else
		{
			var int_obj = { int: clone(interval), objs: {} };
			int_obj.objs[item.id] = item;
			avl.insert(int_obj);//new interval
		}
	}
	
	this.remove = function(item)
	{
		//check if existing item
		var interval = item.int;
		var node = avl.find(item); //TODO: switch to hashmap.
		assert(node); //assertion to kill bad programmers.
		assert(node.value.objs[item.id])
		delete node.value.objs[item.id];
		if(Object.keys(node.value.objs).length == 0)
			avl._remove(node);
	}
	
	//returns all intervals which overlap with this point.
	this.queryPoint = function(val) { return this.queryInterval(val, val);}
	
	//returns all intervals which overlap with this interval.
	this.queryInterval = function(low, high)
	{
		var results = [];
		var interval = {low: low, high: high};
		function recursiveQuery(node, interval)
		{
			if(node == null) return;
			if (node.max < interval.low) //if the node is too far to the right of the interval, no matches.
				return; 
			recursiveQuery(node.left, interval);
			if(overlaps(node.value.int, interval))
				for(var id in node.value.objs)
					results.push(node.value.objs[id]);
			if(interval.high < node.min) //if the node is too far to the left of the interval, no matches.
				return;
			recursiveQuery(node.right, interval);
		}
		recursiveQuery(avl.root, interval);
		return results;
	}
	
	this.avl = avl;
}

function node(low, high, id, data)
{
	this.int = {low: low, high: high};
	this.id = id;
	this.data = data;
}

module.exports.node = node;
module.exports.interval_tree = interval_tree;
/*
var x = new node(0, 100, "x");
var y = new node(0, 100, "y");
var z = new node(80, 120, "x");
var w = new node(-40, 120, "w");
var t = new interval_tree();
t.insert(x);*/