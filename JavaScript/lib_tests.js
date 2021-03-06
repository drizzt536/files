// This file is for testing ./lib.js, and thus requires it.


// TODO: Make functions of the same name able to be tested with separate inputs and outputs
(function run_tests() {
	// error code 0 is pass, and 1 is fail
	// if the input is supposed to fail, put the error as the output
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
		dQuery("p")[0], // HTML\w+Element
		Symbol.for("asdf"),
		Symbol.iterator,
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
			if (err     === void 0) throw Error("err is missing"   );
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
			return Error(`Error is probably at '${loc}'\n\tfailed function: '${f}'\n\tfailed input: '${type(input) === "symbol" ? "(symbol)" : input}'\n\tfailed output: '${output}'\n\tfailed indexes: '${json.stringify(indexes)}'\n`);
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
		} if (!isArr(objs)) {
			console.error(`Uncaught Error: 'objs' object property is not an array for '${name}' in lib_tests.js run_tests()`);
			exit = true;
		} if (exit) return false;
		for (const obj of objs) {
			if (!obj || obj?.constructor.name !== "Object" && obj !== window)
				throw Error(`object in 'objs' object property is missing or invalid for '${name}' in lib_tests.js run_tests()\n\tobjs: ${json.stringify(objs)}\n`);
		} const fs = [];
		// test all the functions with the same name in different namespaces
		fs.len( len(objs) ).smap( (e, i) => objs[i][name] ); // ??
		assert( len(inputs)**args === len(outputs), `inputs and outputs are incompatible lengths for '${name}'\n\tlen(inputs): ${len(inputs)}\n\tlen(outputs): ${len(outputs)}\n\targuments: ${args}` );
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
			for (var i = len(inputs), absolute_index = i; i --> 0 ;) {
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
			for (var i = len(inputs), absolute_index = i; i --> 0 ;)
			for (var j = len(inputs); j --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j]);
					err = 0;
				} catch (e) { out = e; err = 1 }
	
				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${json.stringify([i, j])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j], dir() );
				}
			}
		}, function test_3_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = len(inputs), absolute_index = i; i --> 0 ;)
			for (var j = len(inputs); j --> 0 ;)
			for (var k = len(inputs); k --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${json.stringify([i, j, k])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k], dir() );
				}
			}
		}, function test_4_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = len(inputs), absolute_index = i; i --> 0 ;)
			for (var j = len(inputs); j --> 0 ;)
			for (var k = len(inputs); k --> 0 ;)
			for (var l = len(inputs); l --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${json.stringify([i, j, k, l])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l], dir() );
				}
			}
		}, function test_5_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = len(inputs), absolute_index = i; i --> 0 ;)
			for (var j = len(inputs); j --> 0 ;)
			for (var k = len(inputs); k --> 0 ;)
			for (var l = len(inputs); l --> 0 ;)
			for (var m = len(inputs); m --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l], inputs[m]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${json.stringify([i, j, k, l, m])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l, m], dir() );
				}
			}
		}, function test_6_arg_fn(f, outputs, name, inputs, numArguments) {
			var out, err;
			for (var i = len(inputs), absolute_index = i; i --> 0 ;)
			for (var j = len(inputs); j --> 0 ;)
			for (var k = len(inputs); k --> 0 ;)
			for (var l = len(inputs); l --> 0 ;)
			for (var m = len(inputs); m --> 0 ;)
			for (var n = len(inputs); n --> 0 ;) {
				try {
					out = f(inputs[i], inputs[j], inputs[k], inputs[l], inputs[m], inputs[n]);
					err = 0;
				} catch (e) { out = e; err = 1 }

				if (out !== outputs[--absolute_index].out || err !== outputs[absolute_index].err) {
					console.log(`function: '${f}'\nname: '${name}'\ninputs: '${inputs[i]}', '${inputs[j]}', '${inputs[k]}', '${inputs[l]}'\nexpected output: 'out:${outputs[absolute_index].out},err:${outputs[absolute_index].err}'\nactual output: 'out:${out},err:${err}'\nindexes: '${json.stringify([i, j, k, l, m, n])}'\ndir(): '${dir()}'\nnumber of arguments: '${numArguments}'\nabsolute index: '${absolute_index}'`);
					throw TestError(name, inputs[i], outputs[i], [i, j, k, l, m, n], dir() );
				}
			}
		},
	], tests = { // len in^args = len out
		isIterable: {
			fn: fn,
			args: 1,
			objs: [window],
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
			objs: [window],
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
			objs: [window],
			inputs: [
				2, undefined, "asdfasdf", [1, 2, 3, 4],
				{a:1, b:2, c:3}, (()=>{}), 2n, true, false,
				Symbol.for("a"), 2n, 5.76, [,,], {}, [[1,1], [2], [3], [4,4]],
			], outputs: [
				O(0, 0), O(0, 0), O(8, 0), O(4, 0), O(3, 0), O(0, 0),
				O(0, 0), O(0, 0), O(0, 0), O(0, 0), O(0, 0), O(0, 0),
				O(2, 0), O(0, 0), O(4, 0)
			],
			ignore: false,
		}, len: {
			fn: fn,
			args: 1,
			objs: [window],
			inputs: [
				2, undefined, "asdfasdf", [1, 2, 3, 4],
				{a:1, b:2, c:3}, (()=>{}), 2n, true, false,
				Symbol.for("a"), 2n, 5.76, "", [], [,,,], [[1,1], [2], [3], [4,4]],
			], outputs: [
				O(undefined, 0), O(undefined, 0), O(8, 0), O(4, 0), O(undefined, 0), O(0, 0),
				O(undefined, 0), O(undefined, 0), O(undefined, 0), O(undefined, 0), O(undefined, 0),
				O(undefined, 0), O(0, 0), O(0, 0), O(3, 0), O(4, 0),
			],
			ignore: false,
		}, dim: {
			fn: fn,
			args: 2,
			objs: [window],
			inputs: null,
			outputs: null,
			ignore: true,
		},
	};
	for (const key of Object.keys(tests)) tests[key].name = key;
	for (var testvals = Object.values(tests), i = len(testvals); i --> 0 ;) {
		assert(testvals[i].args < len(testfs), `Unsupported number of arguments for testing.\n\tfunction name: '${testvals[i].name}'\n\tfunction index: '${i}'\n\tnumber of arguments: '${testvals[i].args}'\n\tmax supported arguments: '${len(testfs) - 1}'\n`);
		!testvals[i].ignore && testvals[i].fn();
	}
})();
