// This file is for testing ./lib.js, and thus requires it.
// ./lib.js Library Function Used for this file: dir


// TODO: Make functions of the same name able to be tested with separate inputs and outputs
// TODO: Make different arguments take separate inputs
// TODO: Remove this function when the other one is finished
(function run_tests() {
	let dir = globalThis.LIBRARY_VARIABLES?.dir; // in case "dir" is not globalized
	dir ??= () => ""; // in case LIBRARY_VARIABLES is not globalized
	// error code 0 is pass, and 1 is fail
	// if the input is supposed to fail, put the error message as the output
	var tmpLL = new LinkedList;
	tmpLL.insertLast( 0 ); tmpLL.insertLast( 1 );
	tmpLL.insertLast( 2 ); tmpLL.insertLast( 3 );
	var inputs = [
		[],
		[0, 1, 2, 3, 4],
		"",
		"13",
		"1234123471283479128374912837489127384971829374897128937489",
		"asdf",
		"asdhf9q43yhihfoh934y8r23hj ih3489ryq9w8uerpo123iu4\t\n\r\f\b\vr18290u3r213r\0",
		{},
		0n,
		-2n,
		4n,
		true,
		false,
		(()=>1),
		(function() { return 2 }),
		24.7215623492039402,
		-26.5671432904097838,
		0,
		-0,
		Infinity,
		-Infinity,
		NaN,
		document.querySelector("p"), // HTMLElement
		Symbol.for("asdf"),
		Symbol.iterator, // idk what this is but whatever
		Symbol(),
		undefined,
		null,
		document.getElementsByClassName("script"), // HTMLCollection
		document.querySelectorAll("script"), // NodeList
		tmpLL, // LinkedList
		cMath.new(Infinity, Infinity),
		cMath.new(Infinity, 1.5),
		cMath.new(Infinity, 0),
		cMath.new(Infinity, -0),
		cMath.new(Infinity, -1.5),
		cMath.new(Infinity, -Infinity),
		cMath.new(1.5, Infinity),
		cMath.new(1.5, 1.5),
		cMath.new(1.5, 0),
		cMath.new(1.5, -0),
		cMath.new(1.5, -1.5),
		cMath.new(1.5, -Infinity),
		cMath.new(0, Infinity),
		cMath.new(0, 1.5),
		cMath.new(0, 0),
		cMath.new(0, -0),
		cMath.new(0, -1.5),
		cMath.new(0, -Infinity),
		cMath.new(-0, Infinity),
		cMath.new(-0, 1.5),
		cMath.new(-0, 0),
		cMath.new(-0, -0),
		cMath.new(-0, -1.5),
		cMath.new(-0, -Infinity),
		cMath.new(-1.5, Infinity),
		cMath.new(-1.5, 1.5),
		cMath.new(-1.5, 0),
		cMath.new(-1.5, -0),
		cMath.new(-1.5, -1.5),
		cMath.new(-1.5, -Infinity),
		cMath.new(-Infinity, Infinity),
		cMath.new(-Infinity, 1.5),
		cMath.new(-Infinity, 0),
		cMath.new(-Infinity, -0),
		cMath.new(-Infinity, -1.5),
		cMath.new(-Infinity, -Infinity),
		/asdf(?=12){2,}\+(?<name>3-4).\/ \k<name>\\k`g<>`'~%\^/,
	], O = (output, err) => new class Output {
		constructor() {
			if (err === void 0) throw Error("err is missing");
			this.out = output;
			this.err = err;
		}
	}; function TestError(
		f = "(function not given)",
		input = "(input not given)",
		output = "(output not given)",
		indexes = "(indexes not given)",
		loc = dir(),
		debug = false,
	) {
		var name = Error.prototype.name;
		Error.prototype.name = "TestError";
		try {
			if (debug) debugger;
			return Error(`Error is probably at '${loc}'\n\tfailed function: '${f}'\n\tfailed input: '${typeof input === "symbol" ? "(symbol)" : input}'\n\tfailed output: '${output}'\n\tfailed indexes: '${JSON.stringify(indexes)}'\n`);
		} catch { throw Error("???!?...") }
		finally { Error.prototype.name = name }
	} function fn() {
		// used for the objects' `fn` properties
		// basically just tests for the specific function
		const args = this.args,
			inputs = this.inputs,
			outputs = this.outputs,
			name = this.name,
			fn = this.fn,
			objs = this.objs;
		var exit = false;
		if (isNaN(args)) {
			console.error(`Uncaught Error: 'args' object property is missing from '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (!inputs) {
			console.error(`Uncaught Error: 'inputs' object property is missing from '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (!outputs) {
			console.error(`Uncaught Error: 'outputs' object property is missing from '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (!name) {
			console.error(`Uncaught Error: 'name' object property is missing from '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (!fn) {
			console.error(`Uncaught Error: 'fn' object property is missing from '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (!(objs instanceof Array)) {
			console.error(`Uncaught Error: 'objs' object property is not an array for '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (exit) return false;
		for (const obj of objs) {
			if (!obj || obj?.constructor?.name !== "Object" && obj !== globalThis)
				throw Error(`object in 'objs' object property is missing or invalid for '${name}' in lib_tests.js run_tests()\n\tobjs: ${JSON.stringify(objs)}\n`);
		} let fs = [];
		// test all the functions with the same name in different namespaces
		fs.length = objs.length;
		fs = fs.fill().map( (e, i) => objs[i][name] );
		if (inputs.length**args !== outputs.length) {
			// remove this once different arguments have different inputs
			throw `Assertion Failed: Inputs and Outputs are incompatible lengths for '${name}'\n\tlen(inputs): ${inputs.length}\n\tlen(outputs): ${outputs.length}\n\targuments: ${args}`;
		}
		for (const f of fs) testfs[args] (f, outputs, name, inputs, args);
	} let testfs = [
		function test_0_arg_fn(f, output, name, inputs, numArguments) {
			var out, err;
			try {
				out = f(inputs[0]);
				err = 0;
			} catch (e) { out = e; err = 1 }

			if (out !== output.out || err !== output.err) {
				console.log(`function: '${f}'\nname: '${name}'\ninput: '${inputs[0]}'\nexpected output: 'out:${output.out}, err:${output.err}'\nactual output: 'out: ${out}, err: ${err}'\nindex: '0'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '0'\nerror code: ${output.err}`);
				throw TestError(name, inputs[0], output, 0, dir() );
			}
		}, function test_1_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;) {
				try {
					out = f(inputs[i]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninput: '${inputs[i]}'\nexpected output: 'out:${outputs[absolute_index].out}, err:${outputs[absolute_index].err}'\nactual output: 'out:${out}, err:${err}'\nindex: '${i}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], i, dir() );
				}
			}
		}, function test_2_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;)
			for (var j = inputs.length; j --> 0 ;) {

				try {
					out = f(inputs[i], inputs[j]);
					err = 0;
				} catch (e) { out = e; err = 1 }
	
				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${JSON.stringify([i, j])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j], dir() );
				}
			}
		}, function test_3_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;)
			for (var j = inputs.length; j --> 0 ;)
			for (var k = inputs.length; k --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${JSON.stringify([i, j, k])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k], dir() );
				}
			}
		}, function test_4_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;)
			for (var j = inputs.length; j --> 0 ;)
			for (var k = inputs.length; k --> 0 ;)
			for (var l = inputs.length; l --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${JSON.stringify([i, j, k, l])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l], dir() );
				}
			}
		}, function test_5_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;)
			for (var j = inputs.length; j --> 0 ;)
			for (var k = inputs.length; k --> 0 ;)
			for (var l = inputs.length; l --> 0 ;)
			for (var m = inputs.length; m --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l], inputs[m]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${JSON.stringify([i, j, k, l, m])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l, m], dir() );
				}
			}
		}, function test_6_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = inputs.length, absolute_index = i; i --> 0 ;)
			for (var j = inputs.length; j --> 0 ;)
			for (var k = inputs.length; k --> 0 ;)
			for (var l = inputs.length; l --> 0 ;)
			for (var m = inputs.length; m --> 0 ;)
			for (var n = inputs.length; n --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l], inputs[m], inputs[n]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${JSON.stringify([i, j, k, l, m, n])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l, m, n], dir() );
				}
			}
		},
	], tests = { // length of in**args === length of out
		isIterable: {
			fn: fn,
			args: 1,
			objs: [globalThis],
			inputs: inputs,
			outputs: [
				O(true , 0),O(true , 0),O(true , 0),O(true , 0),O(true , 0),O(true , 0),O(true , 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(true , 0),O(true , 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
			],
			ignore: false,
		}, isArr: {
			fn: fn,
			args: 1,
			objs: [globalThis],
			inputs: inputs,
			outputs: [
				O( true, 0),O( true, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
				O(false, 0),O(false, 0),O(false, 0),O(false, 0),O(false, 0),
			],
			ignore: false,
		}, sizeof: {
			fn: fn,
			args: 1,
			objs: [globalThis],
			inputs: [
				2, undefined, "asdfasdf", [1, 2, 3, 4],
				{a:1, b:2, c:3}, (()=>{}), 2n, true, false,
				Symbol.for("a"), -17n, 5.76, [,,], {}, [[1,1], [2], [3], [4,4]],
			], outputs: [
				O(0, 0), O(0, 0), O(8, 0), O(4, 0), O(3, 0), O(0, 0),
				O(BigInt.prototype.length, 0), O(0, 0), O(0, 0), O(0, 0),
				O(BigInt.prototype.length, 0), O(0, 0),	O(2, 0), O(0, 0), O(4, 0)
			],
			ignore: false,
		}, len: {
			fn: fn,
			args: 1,
			objs: [globalThis],
			inputs: [
				2, undefined, "asdfasdf", [1, 2, 3, 4],
				{a:1, b:2, c:3}, (()=>{}), 2n, true, false,
				Symbol.for("a"), -12n, 5.76, "", [], [,,,], [[1,1], [2], [3], [4,4]],
			], outputs: [
				O(undefined, 0), O(undefined, 0), O(8, 0), O(4, 0), O(undefined, 0), O(0, 0),
				O(BigInt.prototype.length, 0), O(undefined, 0), O(undefined, 0), O(undefined, 0), O(BigInt.prototype.length, 0),
				O(undefined, 0), O(0, 0), O(0, 0), O(3, 0), O(4, 0),
			],
			ignore: false,
		}, dim: {
			fn: fn,
			args: 2,
			objs: [globalThis],
			inputs: null,
			outputs: null,
			ignore: true,
		},
	};
	for (const key of Object.keys(tests)) tests[key].name = key;
	for (var testvals = Object.values(tests), i = testvals.length; i --> 0 ;) {
		if (!(testvals[i].args < testfs.length)) throw `Failed Assertion: Unsupported number of arguments for testing.\n\tfunction name: '${testvals[i].name}'\n\tfunction index: '${i}'\n\tnumber of arguments: '${testvals[i].args}'\n\tmax supported arguments: '${testfs.length - 1}'\n`;
		!testvals[i].ignore && testvals[i].fn();
	}
})();



/*
New way that might get introduced
If the new way is introduced, there can be 1 function to test all functions regardless of the amount of arguments

2 argument function
{
	name: "amogus"
	, args: 2
	, scopes: [
		// TODO: think of a way that it will do "global" for NodeJS
		"window" // so it works w/ strToObj().
		"rMath",
	], inputs: {
		window: [
			// the 0th item is always the value for "this".
			// if undefined, don't use .call() and just call the function like normal
			[thisArg, arg1, arg2],
			[thisArg, arg1, arg2],
		], rMath: [
			[thisArg, arg1, arg2],
			[thisArg, arg1, arg2],
		],
	}, outputs: {
		window: [
			[output, error], // error is either 1 or 0, like in C. if 1, output will the error message
			[output, error],
		], rMath: [
			[output, error],
			[output, error],
		],
	}, ignore: false, // if true, it skips the function over
}
if objs in null or undefined it should default to "window"
*/


(function run_tests_v2(sto /* str -> obj */, sts /* symbol -> str */, zip /* array zip*/) {
	return "Not Finished"; // TODO: Remove this line when finished.

	function TestingError(msg, debug=false) {
		if (debug) debugger;
		const prevname = Error.prototype.name;
		try {
			Error.prototype.name = "TestingError";
			return this instanceof TestingError ? // shouldn't matter
				new Error(msg) :
				Error(msg);
		} finally { Error.prototype.name = prevname } // in case the error is caught
	}

	function testFunction(obj, debug=false) {
		// obj is the object with the testing information. ie: function name, scopes, inputs, outputs, etc.
		if (obj.ignore) return;
		if (obj.scopes == null) throw TestingError(`function ${obj.name} does not have a "scopes" attribute`, debug);
		if (!obj.scopes.length) throw TestingError(`function ${obj.name} does not have any scopes`, debug);
		for (const scope of obj.scopes) {
			// make sure the scope is valid
			if (!["string", "symbol", "number", "bigint"].nincl(typeof scope))
				throw TestingError(`function "${obj.name
				}" has an invalid scope "${scope}" and needs to be a string or symbol`);
			if (obj.inputs[scope]?.length !== obj.outputs[scope]?.length)
				throw TestingError(`function ${obj.name} scope ${scope} has different lengths for #o/ inputs and outputs`);
			// loop through the inputs and check against the outputs for the specific scope
			for (const [inputs, outputs] of zip(obj.inputs, obj.outputs)) {
				// do the testing things
				// TODO: Finish
				try {
					sto(scope)
				}
			}
		}
	}
})(globalThis.strToObj == null ? globalThis.LIBRARY_VARIABLES.strToObj == null ?
	function strToObj(str, obj=globalThis) {
		if (typeof str !== "string") return;
		str.split(/[.[\]'"`]/).filter(e=>e).forEach(e => obj = obj?.[e]);
		return obj;
	} : globalThis.LIBRARY_VARIABLES.strToObj :
	globalThis.strToObj,
	globalThis.symbToStr == null ? globalThis.LIBRARY_VARIABLES.symbToStr == null ?
	function symbToStr(symbol) {
		if (typeof symbol !== "symbol") throw Error("argument to symbToStr() is not a symbol");
		return `Symbol${Symbol.keyFor(symbol) === void 0 ? "" : ".for"}(${symbol.description})`;
	} : globalThis.LIBRARY_VARIABLES.symbToStr :
	globalThis.symbToStr,
	globalThis.arrzip == null ? globalThis.LIBRARY_VARIABLES.arrzip == null ?
	function arrzip(arr1, arr2) {
		// array zip. basically just zip() from python but not as extensive
		// ie: it only works with arrays and finite generators
		function isIterable(thing) { try { for (const e of thing) break } catch { return !1 } return !0 }
		if (arr1?.constructor?.prototype?.[Symbol.toStringTag] === "Generator") arr1 = Array.from(arr1);
		if (arr2?.constructor?.prototype?.[Symbol.toStringTag] === "Generator") arr2 = Array.from(arr2);
		if (!isIterable(arr1) || !isIterable(arr2)) return [arr1, arr2];
		for (var output = [], length = Math.min(arr1.length, arr2.length), i = 0; i < length; i++)
			output.push([ arr1[i] , arr2[i] ]);
		return output;
	} : globalThis.LIBRARY_VARIABLES.arrzip :
globalThis.arrzip);
