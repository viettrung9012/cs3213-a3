!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.it=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":3}],2:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],3:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":2,"_process":5,"inherits":4}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){

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
},{"algorithm-js":7,"assert":1}],7:[function(require,module,exports){
// -*- tab-width:4 -*- 

/*
 * Copyright (c) 2011 Dhruv Matani
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */


//
// Documentation for most of the stuff can be found here:
// http://www.sgi.com/tech/stl/table_of_contents.html
//

var assert = require('assert').ok;


//
// A queue made out of 2 stacks.
// 
// Amortized cost of push: O(1)
// Amortized cost of pop:  O(1)
// Amortized cost of top:  O(1)
// Cost of remove:         O(n)
//
function Queue() {
	this._push_stack = [];
	this._pop_stack  = [];

	this.push.apply(this, arguments);
}

Queue.prototype = {
	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._push_stack.push(arguments[i]);
		}
	}, 
	pop: function() {
		if (this.length === 0) {
			console.error("INVALID POP");
			throw { message: "Nothing in the Queue to pop" };
		}
		var _top = this.top;
		this._pop_stack.pop();
		return _top;
	}, 
	remove: function(elem) {
		var _tgt_stack = this._pop_stack;
		var _tgt_index = -1;

		_tgt_index = this._pop_stack.indexOf(elem);
		if (_tgt_index == -1) {
			_tgt_stack = this._push_stack;
			_tgt_index = this._push_stack.indexOf(elem);
		}

		if (_tgt_index != -1) {
			_tgt_stack.splice(_tgt_index, 1);
		}
	}, 
	_copy_push_to_pop: function() {
		this._push_stack.reverse();
		this._pop_stack = this._push_stack;
		this._push_stack = [ ];
	}
};

Queue.prototype.__defineGetter__('top', function() {
	if (this.length === 0) {
		return;
	}

	if (this._pop_stack.length === 0) {
		this._copy_push_to_pop();
	}

	return this._pop_stack.slice(-1)[0];
});

Queue.prototype.__defineGetter__('length', function() {
	return this._push_stack.length + this._pop_stack.length;
});


exports.Queue = Queue;
exports.FIFO  = Queue;


//
// A stack has the following operations:
// push: O(1)
// pop:  O(1)
// top:  O(1)
//
function Stack() {
}

Stack.prototype = Array;
Stack.prototype.__defineGetter__('top', function () {
	return this.slice(this.length - 1)[0];
});

exports.Stack = Stack;
exports.LIFO  = Stack;
exports.FILO  = Stack;


//
// Comparators:
// Generate GT(>) from LT(<)
//
function cmp_lt(lhs, rhs) {
	return lhs < rhs;
}

function cmp_gt_gen(cmp_lt) {
	return function(lhs, rhs) {
		return cmp_lt(rhs, lhs);
	};
}

function cmp_eq_gen(cmp_lt) {
	return function(lhs, rhs) {
		return !cmp_lt(lhs, rhs) && !cmp_lt(rhs, lhs);
	};
}

function cmp_lt_eq_gen(cmp_lt) {
	var cmp_eq = cmp_eq_gen(cmp_lt);
	return function(lhs, rhs) {
		return cmp_lt(lhs, rhs) || cmp_eq(rhs, lhs);
	};
}

function cmp_gt_eq_gen(cmp_lt) {
	return function(lhs, rhs) {
		return !cmp_lt(lhs, rhs);
	};
}


var cmp_gt    = cmp_gt_gen(cmp_lt);
var cmp_eq    = cmp_eq_gen(cmp_lt);
var cmp_lt_eq = cmp_lt_eq_gen(cmp_lt);
var cmp_gt_eq = cmp_gt_eq_gen(cmp_lt);



function js_cmp_gen(cmp_lt) {
	var cmp_gt = cmp_gt_gen(cmp_lt);
	return function(lhs, rhs) {
		return (cmp_lt(lhs, rhs) ? -1 : (cmp_gt(lhs, rhs) ? 1 : 0));
	};
}

exports.cmp_gt_gen = cmp_gt_gen;
exports.cmp_eq_gen = cmp_eq_gen;
exports.cmp_gt_eq_gen = cmp_gt_eq_gen;
exports.cmp_lt_eq_gen = cmp_lt_eq_gen;

exports.cmp_lt = cmp_lt;
exports.cmp_gt = cmp_gt;
exports.cmp_lt_eq = cmp_lt_eq;
exports.cmp_gt_eq = cmp_gt_eq;
exports.cmp_eq = cmp_eq;


exports.js_cmp_gen = js_cmp_gen;



//
// A heap has the following operations:
// push/insert: O(log n)
// pop:         O(log n)
// top:         O(1)
// constructor: O(n log n)
//
function Heap(cmp, repr) {
	this._cmp = cmp || cmp_lt;
	this._repr = repr || [ ];

	if (this._repr.length > 0) {
		this._make_heap();
	}
}

Heap.prototype = {
	pop: function() {
		var _top = this.top;

		// console.log("REPR:", this._repr);

		// We assume that there is at least 1 element in the heap
		var _bot = this._repr.pop();

		if (this.length > 0) {
			this._repr[0] = _bot;
			this._bubble_down(0);
		}
		return _top;
	}, 
	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._repr.push(arguments[i]);
			this._bubble_up(this.length - 1);
		}
	}, 
	_make_heap: function() {
		// Could be made O(n) later. Currently is O(n log n)
		for (var i = 1; i < this._repr.length; ++i) {
			this._bubble_up(i);
		}
	}, 
	_swap: function(pi, ci) {
		return _swap(this._repr, pi, ci);
	}, 
	_bubble_up: function(i) {
		// var don = this._repr[i] == 21;
		while (i > 0) {
			var pi = ((i % 2) === 0 ? i - 2 : i - 1) / 2;

			// If Value at Child is (lt) cmp value at Parent, we swap the 2.
			// if (don) { console.log("bubble up: parent", this._repr[pi], "child", this._repr[i]); }
			if (this._cmp(this._repr[i], this._repr[pi])) {
				// if (don) { console.log("swapped"); }
				this._swap(pi, i);
				i = pi;
			}
			else {
				i = 0;
			}
		}
		// if (don) { console.log("_repr:", this._repr); }
	},
	_bubble_down: function(i) {
		var _eof = false;
		var self = this;

		while (!_eof) {
			_eof = true;
			var ci1 = i * 2 + 1;
			var ci2 = i * 2 + 2;

			var candidates = [ 
				{ index: ci1, value: this._repr[ci1] }, 
				{ index: ci2, value: this._repr[ci2] }
			].filter(function(v) {
				return v.index < self._repr.length;
			});

			candidates.sort(function(lhs, rhs) {
				return js_cmp_gen(self._cmp)(lhs.value, rhs.value);
			});

			// console.log("Candidates:", candidates);

			if (candidates.length > 0) {
				var candidate = candidates[0];

				if (this._cmp(candidate.value, this._repr[i])) {
					// The smallest child is smaller than the value at 'i'.
					// We swap the 2.
					// console.log("swapping", this._repr[i], "with", candidate.value);
					this._swap(i, candidate.index);
					_eof = false;
					i = candidate.index;
				}
			}

		} // while (!_eof)

	} // _bubble_down()

};

Heap.prototype.__defineGetter__('top', function() {
	return this._repr[0];
});

Heap.prototype.__defineGetter__('length', function() {
	return this._repr.length;
});

Heap.prototype.insert = Heap.prototype.push;



exports.Heap = Heap;
exports.PriorityQueue = Heap;
exports.MinHeap = function(repr) {
	return new Heap(cmp_lt, repr);
};
exports.MaxHeap = function(repr) {
	return new Heap(cmp_gt, repr);
};

// Modifies the array in-place (uses extra memory though)
exports.heap_sort = function(repr, cmp) {
	cmp = cmp || cmp_lt;
	var h = new Heap(cmp, repr);
	var tmp = [ ];
	while (h.length > 0) {
		tmp.push(h.pop());
	}
	tmp.unshift(0, 0);
	repr.splice.apply(repr, tmp);
	return repr;
};

//
// A min-max-heap has the following operations:
// push/insert: O(log n)
// pop_min:     O(log n)
// min:         O(1)
// pop_max:     O(log n)
// max:         O(1)
// constructor: O(n log n)
//
// http://www.cs.otago.ac.nz/staffpriv/mike/Papers/MinMaxHeaps/MinMaxHeaps.pdf
// 
// Note: lt MUST be a < comparator
//
function MinMaxHeap(lt, repr) {
	this._lt   = lt || cmp_lt;
	this._gt   = cmp_gt_gen(this._lt);
	this._repr = repr || [ ];

	if (this._repr.length > 0) {
		this._make_heap();
	}
}

MinMaxHeap.prototype = {
	_make_heap: function() {
		for (var i = 0; i < this._repr.length; ++i) {
			this._bubble_up(i);
			// console.log(this._repr.slice(0, i+1).toString());
		}
	}, 

	_is_level_min_level: function(level) {
		return (level % 2) === 0;
	}, 

	_is_index_min_level: function(i) {
		return this._is_level_min_level(Math.floor(Math.log(i+1) / Math.log(2.0)));
	}, 

	_parent_index: function(i) {
		return ((i % 2) === 0 ? i - 2 : i - 1) / 2;
	}, 
	
	_grand_parent_index: function(i) {
		return this._parent_index(this._parent_index(i));
	},

	_bubble_up: function(i) {
		if (i === 0) {
			return;
		}

		var pi = this._parent_index(i);

		if (this._is_index_min_level(i)) {
			if (this._gt(this._repr[i], this._repr[pi])) {
				_swap(this._repr, i, pi);
				this._bubble_up_max(pi);
			}
			else {
				this._bubble_up_min(i);
			}
		}
		else {
			if (this._lt(this._repr[i], this._repr[pi])) {
				_swap(this._repr, i, pi);
				this._bubble_up_min(pi);
			}
			else {
				this._bubble_up_max(i);
			}
		}
	}, 

	_bubble_up_min: function(i) {
		var gpi = this._grand_parent_index(i);
		if (i == 0 || gpi < 0) {
			return;
		}

		if (this._lt(this._repr[i], this._repr[gpi])) {
			_swap(this._repr, i, gpi);
			this._bubble_up_min(gpi);
		}
	}, 

	_bubble_up_max: function(i) {
		var gpi = this._grand_parent_index(i);
		if (i == 0 || gpi < 0) {
			return;
		}

		if (this._gt(this._repr[i], this._repr[gpi])) {
			_swap(this._repr, i, gpi);
			this._bubble_up_max(gpi);
		}
	}, 

	_get_candidate_nodes: function() {
		var ret = [ ];
		for (var i = 0; i < arguments.length; ++i) {
			var index = arguments[i];
			ret.push({
				index: index, 
				value: this._repr[index]
			});
		}
		return ret;
	}, 

	_get_valid_children_and_grand_children: function(i) {
		var opts = this._get_candidate_nodes(i*2+1, i*2+2, 
			(i*2+1)*2 + 1, (i*2+1)*2 + 2, 
			(i*2+2)*2 + 1, (i*2+2)*2 + 2);

		var self = this;
		
		opts = opts.filter(function(opt) {
			return opt.index < self._repr.length;
		});

		return opts;
	}, 

	_bubble_down: function(i) {
		if (this._is_index_min_level(i)) {
			this._bubble_down_min(i);
		}
		else {
			this._bubble_down_max(i);
		}
	}, 

	_bubble_down_min: function(i) {
		var opts = this._get_valid_children_and_grand_children(i);
		var self = this;

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[0];

		if (opt.index < i*2+3 /* Is i a parent or grandparent of opt? */) {
			// Parent
			if (opt.value < this._repr[i]) {
				_swap(this._repr, opt.index, i);
			}
		}
		else {
			// Grandparent
			if (opt.value < this._repr[i]) {
				_swap(this._repr, opt.index, i);
				var _pi = this._parent_index(opt.index);
				if (this._repr[_pi] < this._repr[opt.index]) {
					_swap(this._repr, opt.index, _pi);
				}
				this._bubble_down_min(opt.index);
			}
		}
	}, 

	_bubble_down_max: function(i) {
		var opts = this._get_valid_children_and_grand_children(i);
		var self = this;

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[opts.length - 1];

		if (opt.index < i*2+3 /* Is i a parent or grandparent of opt? */) {
			// Parent
			if (opt.value > this._repr[i]) {
				_swap(this._repr, opt.index, i);
			}
		}
		else {
			// Grandparent
			if (opt.value > this._repr[i]) {
				_swap(this._repr, opt.index, i);
				var _pi = this._parent_index(opt.index);
				if (this._repr[_pi] > this._repr[opt.index]) {
					_swap(this._repr, opt.index, _pi);
				}
				this._bubble_down_max(opt.index);
			}
		}
	}, 
	
	_move_from_end: function(index) {
		if (index < this.length - 1) {
			this._repr[index] = this._repr[this._repr.length - 1];
		}
		this._repr.pop();
		if (index < this.length) {
			this._bubble_down(index);
		}
	},

	_min: function() {
		return { index: 0, value: this._repr[0] };
	}, 
	
	_max: function() {
		if (this.length == 1) {
			return this._min();
		}

		var opts = [
			{ index: 1, value: this._repr[1] }, 
			{ index: 2, value: this._repr[2] }
		];
		var self = this;

		opts = opts.filter(function(opt) {
			return opt.index < self._repr.length;
		});

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[opts.length - 1];

		return opt;
	},

	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._repr.push(arguments[i]);
			this._bubble_up(this._repr.length - 1);
		}
	},

	pop_min: function() {
		var _min = this._min();
		this._move_from_end(_min.index);
		return _min.value;
	}, 
	
	pop_max: function() {
		var _max = this._max();
		this._move_from_end(_max.index);
		return _max.value;
	}

};

MinMaxHeap.prototype.insert = MinMaxHeap.prototype.push;

MinMaxHeap.prototype.__defineGetter__('length', function() {
	return this._repr.length;
});

MinMaxHeap.prototype.__defineGetter__('min', function() {
	return this._min().value;
});

MinMaxHeap.prototype.__defineGetter__('max', function() {
	return this._max().value;
});


exports.MinMaxHeap      = MinMaxHeap;
exports.PriorityDequeue = MinMaxHeap;



//
// A Trie has the following operations:
// insert:      O(length of string to be inserted)
// remove:      O(length of string to be removed)
// remove_many: O(items to be removed * avg. length of each item)
// forEach:     O(n)
//
function Trie() {
	this.root = { lf: false };
	this._length = 0;
}

Trie.prototype = {
	insert: function() {
		for (var i = 0; i < arguments.length; ++i) {
			this._insert(arguments[i]);
		}
	}, 
	
	_insert: function(s) {
		var r = this.root;
		for (var i = 0; i < s.length; ++i) {
			var ch = s[i];
			if (!(ch in r)) {
				r[ch] = { lf: false };
			}
			r = r[ch];
		}

		if (!r.lf) {
			r.lf = true;
			this._length += 1;
		}

	}, 

	remove_many: function() {
		var ret = 0;
		for (var i = 0; i < arguments.length; ++i) {
			ret += (this.remove(arguments[i]) ? 1 : 0);
		}
		return ret;
	}, 

	remove: function(s) {
		var stat = this._remove(s, this.root);
		this._length -= (stat ? 1 : 0);
		return stat;
	}, 

	_remove: function(s, r) {
		if (!r) {
			// console.log("r is falsy, s ==", s);
			return false;
		}

		if (s.length == 0) {
			var lf = r.lf;
			r.lf = false;
			return lf;
		}

		var _r = r[s[0]];
		var stat = this._remove(s.substring(1), _r);

		if (!stat) {
			// console.log("Error removing:", s[0], "from", s, _r);
			return false;
		}

		if (Object.keys(_r).length == 1 && !_r.lf) {
			// We can drop this node
			delete r[s[0]];
		}

		return true;
	}, 

	exists: function(s) {
		return this._exists(s, this.root);
	}, 

	_exists: function(s, r) {
		if (!r) {
			return false;
		}

		if (s.length == 0) {
			return r.lf;
		}

		var _r = r[s[0]];
		return this._exists(s.substring(1), _r);
	}, 
	
	_forEach: function(r, proc, accum, i) {
		if (!r) {
			return 0;
		}

		var _i = 0;
		if (r.lf) {
			proc(accum.join(''), _i + i);
			_i += 1;
		}

		var keys = Object.keys(r);
		keys.sort();
		for (var index in keys) {
			var ch = keys[index];
			if (ch != 'lf') {
				accum.push(ch);
				_i += this._forEach(r[ch], proc, accum, _i + i);
				accum.pop();
			}
		}

		return _i;
	}, 

	forEach: function(proc) {
		this._forEach(this.root, proc, [], 0);
	}

};

Trie.prototype.__defineGetter__('length', function() {
	return this._length;
});

exports.Trie = Trie;


//
// The Disjoint Set Data Structure is explained here:
//
// https://secure.wikimedia.org/wikipedia/en/wiki/Disjoint-set_data_structure
// and here:
// http://www.topcoder.com/tc?module=Static&d1=tutorials&d2=disjointDataStructure
//
// and this implementation supports the following operations:
//
// create:         O(1) - The constructor create a DisjointSet with a single element
// representative: O(n) (worst case) - Returns the representative Set for this Set
// union:          O(1) - UNIONs 2 sets into one
//
function DisjointSet(value) {
    this._length = 1;
    this.value = value;
    this.parent = this;
    // console.log("Set ctor:", this);
}

DisjointSet.prototype = {
    representative: function() {
		if (this.parent === this) {
			return this;
		}

		var p = this.parent.representative();
		this.parent = p;
		return p;
    }, 

    union: function(other_set) {
		var this_rep  = this.representative();
		var other_rep = other_set.representative();
		// console.log("this_rep, other_rep:", this_rep, other_rep);
		
		if (this_rep === other_rep) {
			return this_rep;
		}

		// console.log("other_rep.length:", other_rep.length);
		this_rep._length += other_rep.length;
		other_rep.parent = this_rep;
		
		// console.log("union::returning:", this_rep);
		return this_rep;
    }

};

DisjointSet.prototype.__defineGetter__('length', function() {
	var len = this.representative()._length;
	// console.log("length:", len);
	return len;
});

exports.DisjointSet = DisjointSet;


// An AVL Tree Node
function AVLTreeNode(value, parent, height, weight, left, right) {
    this.value  = value;
    this.parent = parent;
    this.height = height;
    this.weight = weight;
    this.left   = left;
    this.right  = right;
}

//
// An AVL tree is a Height Balanced Binary Search Tree
// 
// insert: O(log n)
// remove: O(log g)
// find:   O(log g)
// min:    O(log g)
// max:    O(log g)
// successor: O(log n), amortized O(1)
// predecessor: O(log n), amortized O(1)
// lower_bound: O(log n)
// upper_bound: O(log n)
// find_by_rank: O(log n)
// clear:  O(1)
// length: O(1)
// height: O(1)
// forEach: O(n) (performs an in-order traversal)
// toGraphviz: O(n) Returns a string that can be fed to Graphviz to 
//                  draw a Tree
//
// References:
// http://en.wikipedia.org/wiki/AVL_tree
// http://en.wikipedia.org/wiki/Tree_rotation
// http://closure-library.googlecode.com/svn/docs/closure_goog_structs_avltree.js.source.html
// http://gcc.gnu.org/viewcvs/trunk/libstdc%2B%2B-v3/include/bits/stl_tree.h?revision=169899&view=markup
//
function AVLTree(_cmp_lt) {
    this.cmp_lt = _cmp_lt || cmp_lt;
    this.cmp_eq = cmp_eq_gen(this.cmp_lt);
    this.hooks = [ ];
	this._gw_ctr = 1;

    for (var i = 1; i < arguments.length; ++i) {
		this.hooks.push(arguments[i]);
    }
    this.root = null;
}

AVLTree.prototype = {
    insert: function(value) {
		if (!this.root) {
			this.root = new AVLTreeNode(value, null, 0, 1, null, null);
		}
		else {
			var node = this.root;
			var prev = null;

			while (node) {
				prev = node;
				if (this.cmp_lt(value, node.value)) {
					node = node.left;
				}
				else {
					node = node.right;
				}
			}

			// console.log("Actually inserting:", value);
			// console.log("\ninsert::nodes:", nodes);

			var nn = new AVLTreeNode(value, prev, 0, 1, null, null);
			if (this.cmp_lt(value, prev.value)) {
				// value < nodes.prev.value
				prev.left = nn;
			}
			else {
				// value > nodes.prev.value
				prev.right = nn;
			}

			this._rebalance_to_root(nn);
		}
    }, 

    remove: function(value) {
		var node = this._find_node(value);
		if (!node) {
			return;
		}

		this._remove(node);
    }, 
    
    find: function(value) {
		var node = this._find_node(value);
		return node;
    }, 

	lower_bound: function(value) {
		var node = this.root;
		var ret  = null;

		while (node) {
			if (!this.cmp_lt(node.value, value)) {
				// this.root.value >= value
				ret  = node;
				node = node.left;
			}
			else {
				node = node.right;
			}
		}
		return ret;
	}, 

	upper_bound: function(value) {
		var node = this.root;
		var ret  = null;

		while (node) {
			if (this.cmp_lt(value, node.value)) {
				// value < this.root.value
				ret  = node;
				node = node.left;
			}
			else {
				node = node.right;
			}
		}
		return ret;
	}, 

    find_by_rank: function(rank) {
		return this._find_by_rank(this.root, rank);
    }, 

    clear: function() {
		this.root = null;
    },

	items: function() {
		var _i = [ ];
		this.forEach(function(value) {
			_i.push(value);
		});
		return _i;
	}, 

    toGraphviz: function() {
		// Returns a grpahviz consumable tree for plotting
		var graph = [ 'fontname=arial', 'node [fontname=arial,fontsize=10]', 'digraph {' ];
		var nodes = [ ];
		var edges = [ ];

		this.forEach((function(value, node) {
			if (node.parent && !node.parent.id) {
				node.parent.id = this._gw_ctr++;
			}
			if (!node.id) {
				node.id = this._gw_ctr++;
			}
			if (node.parent) {
				edges.push('"' + node.parent.value + '-' + node.parent.id + '"->"' + node.value + '-' + node.id + '"');
			}
			nodes.push('"' + node.value + '-' + node.id + '"');
		}).bind(this));

		if (edges.length > 0) {
			edges.push('');
		}

		graph.push(nodes.join(', '), '}');
		graph.push(edges.join('; '), '');
		return graph.join('\n');
    }, 

    forEach: function(proc) {
		this._forEach(this.root, proc);
    }, 

    _forEach: function(node, proc) {
		if (node) {
			this._forEach(node.left, proc);
			proc(node.value, node);
			this._forEach(node.right, proc);
		}
    }, 

    _find_by_rank: function(node, rank) {
		if (rank > node.weight) {
			return null;
		}

		var lw = this._has_left_child(node) ? node.left.weight : 0;
		var rw = this._has_right_child(node) ? node.right.weight : 0;

		if (rank <= lw) {
			return this._find_by_rank(node.left, rank);
		}
		else if (rank > lw + 1) {
			return this._find_by_rank(node.right, rank - lw - 1);
		}
		else {
			// Must be the root
			return node.value;
		}
    }, 

    _remove: function(node) {
		// console.log("_remove::node:", node);

		var is_leaf = this._is_leaf(node);
		var has_one_child = this._has_one_child(node);

		// console.log("is_leaf, has_one_child:", is_leaf, has_one_child);

		if (is_leaf || has_one_child) {
			if (is_leaf) {
				// console.log("Node:", node, "is a leaf");
				if (this._is_root(node)) {
					this.root = null;
				}
				else {
					if (this._is_left_child(node)) {
						// console.log("Setting left child of:", node.parent, "to null");
						node.parent.left = null;
					}
					else {
						node.parent.right = null;
					}
					this._rebalance_to_root(node.parent);
				}
			}
			else {
				// Only 1 child
				var tgt_node = null;
				if (this._has_left_child(node)) {
					tgt_node = node.left;
				}
				else {
					tgt_node = node.right;
				}

				if (this._is_root(node)) {
					this.root = tgt_node;
					// No need to re-balance since this case can occur only 
					// if the tree has just 2 nodes
				}
				else {
					if (this._is_left_child(node)) {
						node.parent.left = tgt_node;
					}
					else {
						node.parent.right = tgt_node;
					}
				}
				if (tgt_node) {
					tgt_node.parent = node.parent;
				}
				this._rebalance_to_root(node.parent);
			}
		}
		else {
			// Has 2 children. Find the successor of this node, 
			// delete that node and replace the value of this 
			// node with that node's value
			var replacement = this.successor(node);
			// console.log("replacement:", replacement);
			this._remove(replacement);
			node.value = replacement.value;
		}
    }, 

	successor: function(node) {
		if (node.right) {
			node = node.right;
			while (node && node.left) {
				node = node.left;
			}
			return node;
		}
		else {
			while (node.parent && this._is_right_child(node)) {
				node = node.parent;
			}
			// node is node.parent's left child or null (if node is the root)
			node = node.parent;
			return node;
		}
	}, 

	predecessor: function(node) {
		if (node.left) {
			node = node.left;
			while (node && node.right) {
				node = node.right;
			}
			return node;
		}
		else {
			while (node.parent && this._is_left_child(node)) {
				node = node.parent;
			}
			// node is node.parent's right child or null (if node is the root)
			node = node.parent;
			return node;
		}
	}, 

    _is_leaf: function(node) {
		return !node.left && !node.right;
    }, 

    _has_one_child: function(node) {
		return this._has_left_child(node) + this._has_right_child(node) == 1;
    }, 

    _has_left_child: function(node) {
		return !!node.left;
    }, 

    _has_right_child: function(node) {
		return !!node.right;
    }, 

    _update_metadata: function(node) {
		if (!node) {
			return;
		}

		var height = Math.max(
			(node.left  ? node.left.height  : 0), 
			(node.right ? node.right.height : 0)
		) + 1;

		var weight = (node.left ? node.left.weight : 0) + 
			(node.right ? node.right.weight : 0) + 1;

		// console.log("\nvalue, height, weight:", node.value, height, weight);
		node.height = height;
		node.weight = weight;

		// Provide a set of "hook" methods to the user so that the user may
		// add custom fields to the AVLTreeNode. Useful for doing stuff like:
		// sum, min, max in O(1)
		this.hooks.forEach(function(hook) {
			hook(node);
		});

    }, 

    _update_metadata_upto_root: function(node) {
		while (node) {
			this._update_metadata(node);
			node = node.parent;
		}
    }, 

    _is_root: function(node) {
		return !node.parent;
    }, 

    _is_left_child: function(node) {
		if (!node) {
			return false;
		}
		return node.parent.left === node;
    }, 

    _is_right_child: function(node) {
		if (!node) {
			return false;
		}
		return node.parent.right === node;
    }, 

    _find_node: function(value) {
		var node = this.lower_bound(value);
		if (node && this.cmp_eq(node.value, value)) {
			return node;
		}
		else {
			return null;
		}
	}, 

    _rotate_left: function(node) {
		if (!node) {
			return;
		}
		assert(node.right !== null);
		var tmp = node.right;

		if (this._is_root(node)) {
			this.root = node.right;
			this.root.parent = null;
		}
		else if (this._is_left_child(node)) {
			node.parent.left = node.right;
			node.right.parent = node.parent;
		}
		else {
			// Must be a right child
			node.parent.right = node.right;
			node.right.parent = node.parent;
		}

		node.right = tmp.left;
		if (tmp.left) {
			tmp.left.parent = node;
		}
		tmp.left = node;
		node.parent = tmp;

		this._update_metadata(node);
		this._update_metadata(tmp);
    }, 

    _rotate_right: function(node) {
		if (!node) {
			return;
		}
		assert(node.left !== null);
		var tmp = node.left;

		if (this._is_root(node)) {
			this.root = tmp;
			this.root.parent = null;
		}
		else if (this._is_left_child(node)) {
			node.parent.left = tmp;
			tmp.parent       = node.parent;
		}
		else {
			// Must be a right child
			node.parent.right = tmp;
			tmp.parent        = node.parent;
		}

		node.left = tmp.right;
		if (tmp.right) {
			tmp.right.parent = node;
		}
		tmp.right = node;
		node.parent = tmp;

		this._update_metadata(node);
		this._update_metadata(tmp);
    }, 

    _balance_factor: function(node) {
		if (!node) {
			return 0;
		}

		var lh = node.left  ? node.left.height  : 0;
		var rh = node.right ? node.right.height : 0;

		// console.log("_balance_factor::of:", node.value, "is:", lh-rh);
		return lh - rh;
    }, 

    _rebalance_to_root: function(node) {
		while (node) {
			this._rebalance(node);
			node = node.parent;
		}
    }, 

    _rebalance: function(node) {
		this._update_metadata(node);
		var bf = this._balance_factor(node);
		var _bf;

		if (bf > 1) {
			// Do a right rotation since the left subtree is > the right subtree
			_bf = this._balance_factor(node.left);
			if (_bf < 0) {
				this._rotate_left(node.left);
			}
			this._update_metadata(node.left);
			this._rotate_right(node);
		}
		else if (bf < -1) {
			// Do a left rotation since the right subtree is > the left subtree
			_bf = this._balance_factor(node.right);
			if (_bf > 0) {
				this._rotate_right(node.right);
			}
			this._update_metadata(node.right);
			this._rotate_left(node);
		}

		// update metadata for 'node'
		this._update_metadata(node);
    }
};

AVLTree.prototype.__defineGetter__('height', function() {
	return this.root ? this.root.height : 0;
});

AVLTree.prototype.__defineGetter__('length', function() {
	return this.root ? this.root.weight : 0;
});

AVLTree.prototype.__defineGetter__('min', function() {
	return this.length ? this.find_by_rank(1) : null;
});

AVLTree.prototype.__defineGetter__('max', function() {
	return this.length ? this.find_by_rank(this.length) : null;
});

exports.AVLTree = AVLTree;





function _swap(range, i, j) {
	var t = range[i];
	range[i] = range[j];
	range[j] = t;
}

//
// A range [begin, end)
// 
// A range is a sub-range of another range.
// It just calls the slice function on the underlying range.
// Can be used on an array or an arguments object.
//
function range(range, begin, end) {
	return Array.prototype.slice.call(range, begin, end);
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function lower_bound(range, value, cmp_lt) {
	/* Returns the first index before which it is safe to insert 'value'
	 * such that 'range' remains sorted
	 */
	if (range.length === 0) {
		return 0;
	}

	cmp_lt = cmp_lt || exports.cmp_lt;
	var cmp_gt_eq = cmp_gt_eq_gen(cmp_lt);

	var b = 0;
	var e = range.length;
	var m = Math.floor(b + (e-b) / 2);
	var lb = e;

	while (b < e) {
		if (cmp_gt_eq(range[m], value)) {
			lb = m;
			e = m;
		}
		else {
			b = m + 1;
		}
		m = Math.floor(b + (e-b) / 2);
	}
	return lb;
}

// Time Complexity:  O(log n)
// Space Complexity: O(1)
function upper_bound(range, value, cmp_lt) {
	/* Returns the last index before which it is safe to insert 'value'
	 * such that 'range' remains sorted
	 */
	if (range.length === 0) {
		return 0;
	}

	cmp_lt = cmp_lt || exports.cmp_lt;

	var b = 0;
	var e = range.length;
	var m = Math.floor(b + (e-b) / 2);
	var ub = e;

	while (b < e) {
		// if (value < range[m]), go left
		if (cmp_lt(value, range[m])) {
			ub = m;
			// console.log("Setting ub to:", ub);
			e = m;
		}
		else {
			b = m + 1;
		}
		m = Math.floor(b + (e-b) / 2);
	}
	// console.log("ub:", ub);
	return ub;
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function equal_range(range, value, cmp_lt) {
	var lb = lower_bound(range, value, cmp_lt);
	var ub = upper_bound(range, value, cmp_lt);
	return [ lb, ub ];
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function binary_search(range, value, cmp_lt) {
	var lb = lower_bound(range, value, cmp_lt);
	if (lb == range.length) {
		return -1;
	}
	return cmp_eq_gen(cmp_lt)(range[lb], value) ? lb : -1;
}

// Time Complexity:  O(n)
// Space Complexity: O(1)
// Note: This function is unstable
function partition(range, pivot_index, cmp_lt) {
	cmp_lt = cmp_lt || exports.cmp_lt;

	assert(pivot_index < range.length);
	// Swap the pivot with the 1st element of the range
	_swap(range, 0, pivot_index);
	var pivot = range[0];

	var l = 1;
	var u = range.length - 1;

	while (true) {
		// console.log("while(true), l, u:", l, u);

		// range[l] <= pivot
		while (l < u && !cmp_lt(pivot, range[l])) {
			l += 1;
		}

		// console.log("range[u], pivot:", range[u], pivot);
		// range[u] > pivot
		while (l < u && cmp_lt(pivot, range[u])) {
			u -= 1;
		}

		if (l === u) {
			// console.log("partition::exiting:", l, "and", u);
			// range[u] > pivot
			if (cmp_lt(pivot, range[u])) {
				--u;
			}
			break;
		}

		// console.log("partition::swapping indexes:", l, "and", u);
		_swap(range, u, l);
		// l += 1;
		u -= 1;
	}

	// console.log("RET:", range.join(", "), "u:", u);
	_swap(range, 0, u);
	return u;
}

// Time Complexity:  O(n)
// Space Complexity: O(n)
function stable_partition(range, pivot_index, cmp_lt) {
	var p1 = [ ];
	var p2 = [ ];

	assert(pivot_index < range.length);

	// Swap the pivot with the 1st element of the range
	_swap(range, 0, pivot_index);
	var pivot = range[0];

	for (var i = 0; i < range.length; ++i) {
		// range[i] > pivot  -> p2
		// range[i] <= pivot -> p1
		(cmp_lt(pivot, range[i]) ? p2 : p1).push(range[i]);
	}

	// Invariant: p1.length > 0
	// console.log("p1.length:", p1.length);
	assert(p1.length > 0);

	_swap(p1, 0, p1.length - 1);
	range.splice(0, range.length);
	range.push.apply(range, p1.concat(p2));
	return p1.length - 1;
}

// Time Complexity:  O(n)
// Space Complexity: O(n)
function merge(range1, range2, cmp_lt) {
	cmp_lt = cmp_lt || exports.cmp_lt;
	var ret = [ ];
	var i1 = 0;
	var i2 = 0;

	while (i1 < range1.length && i2 < range2.length) {
		if (cmp_lt(range1[i1], range2[i2])) {
			ret.push(range1[i1]);
			i1 += 1;
		}
		else {
			ret.push(range2[i2]);
			i2 += 1;
		}
	}

	while (i1 < range1.length) {
		ret.push(range1[i1]);
		i1 += 1;
	}

	while (i2 < range2.length) {
		ret.push(range2[i2]);
		i2 += 1;
	}

	return ret;
}


function is_sorted(range, cmp) {
	cmp = cmp || cmp_lt;
	for (var i = 1; i < range.length; ++i) {
		if (cmp(range[i], range[i-1])) {
			return false;
		}
	}
	return true;
}

function is_heap(range, cmp) {
	cmp = cmp || cmp_lt;
	for (var i = 0; i < range.length; ++i) {
		var ci1 = i * 2 + 1;
		var ci2 = i * 2 + 2;

		if ((ci1 < range.length && cmp(range[ci1], range[i])) || 
			(ci2 < range.length && cmp(range[ci2], range[i]))) {
			return false;
		}
	}
	return true;
}

function _randomized_select(range, k, cmp) {
	// console.log("_randomized_select:", k);

	assert(range.length != 0);
	if (range.length == 1) {
		return range[0];
	}
	var ri = Math.floor(Math.random()*range.length);
	var pat = range[ri];
	// console.log("range1: [", range.join(", "), "]");
	var pi = partition(range, ri, cmp);
	// console.log("range2: [", range.join(", "), "]");
	// console.log("ri, pi, pat:", ri, pi, pat);
	// console.log("range[pi]:", range[pi], "pat:", pat);

	if (k == pi) {
		return range[pi];
	}
	else if (k < pi) {
		return _randomized_select(range.slice(0, pi+1), k, cmp);
	}
	else {
		return _randomized_select(range.slice(pi+1), k-pi-1, cmp);
	}
}

// Time Complexity:  O(n) [expected]
// Space Complexity: O(n) [expected]
function randomized_select(range, k, cmp) {
	cmp = cmp || cmp_lt;
	if (range.length === 0) {
		return null;
	}
	assert(k > 0 && k <= range.length);
	return _randomized_select(range, k-1, cmp);
}




exports.range            = range;
exports.lower_bound      = lower_bound;
exports.upper_bound      = upper_bound;
exports.equal_range      = equal_range;
exports.binary_search    = binary_search;
exports.partition        = partition;
exports.stable_partition = stable_partition;
exports.merge            = merge;
exports.is_sorted        = is_sorted;
exports.is_heap          = is_heap;
exports.randomized_select = randomized_select;

// TODO: String processing algorithms

},{"assert":1}]},{},[6])(6)
});