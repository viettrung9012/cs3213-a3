interval-tree-browser.js is generated using browserify and algorithms-js 0.0.7

Like this:
browserify interval-tree.js --standalone it > interval-tree-browser.js
Do regenerate whenever you edit interval-tree.js

Usage:
var node = new it.node(start, end, id, data);
var intervaltree = new it.interval_tree();
var intervaltree.insert(node);
intervaltree.queryInterval(start, end)
intervaltree.queryPoint(pt)