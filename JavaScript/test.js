#!/usr/bin/env js
// test.js v1.2.0 (c) | Copyright 2023 Daniel E. Janusch

/** DOCUMENTATION:
 * The tests can be passed via a global object or the override ...
 * (2nd 1-indexed) parameter of the run_tests() function.
 * This library was made to interface well with lib.js but is its own standalone library.

 Test object attributes default values:

 * ignore = false // ignore is just for unfinished tests
 * name = (key in the tests object)

 * changeThis = false // only does anything if same === true
 * same = false
 *		bool | array[bool, ...]
 * args = null // number of arguments the function(s) take(s).
 *		number | bigint | array[number | bigint, ...]
 * inputs // required fields
 * outputs // required fields
 * scope/scopes // at least one is required
**/

// TODO: Maybe zip together the inputs and outputs in the testing object so they are easier to use.
// TODO: Maybe let test object have optional function arguments. It might be better the way it is.
// TODO: Update Error Codes

(function run_tests(
	testsGlobalName = Symbol.for("Test.js") // the testing object is globalThis?.[testsGlobalName]
	, debugMode = false // if true, debugger then throw on errors.
	, objectOverride = null
) {

	debugMode = !!debugMode; // Boolean(debugMode)

	// setup  variables and functions
	const libraryTests = objectOverride === null ? globalThis?.[testsGlobalName] : objectOverride
	, deepCopy = (basicObject, options={}) => eval( stringify(basicObject, options) ) // safe eval.
	, stringToObject = (function create_sto() {
		function isInvalidString(str, nextCharacter="]") {
			// returns [isInvalid, endBracketIndex (nextCharacter)]
			for (var i = 1; i < str.length; i++) {
				if (str[i] === str[0]) {
					if (str[i-1] !== "\\" || str[i-2] === "\\")
						return str[i+1] !== nextCharacter ? [!0, i] : [!1, i+1];
				}
				else if (str[i] === nextCharacter) return [!0, i];
			}
		}
		function isInvalidSymbolDotFor(str="", nextCharacter="]") {
			// returns [isInvalid, endBracketIndex (nextCharacter)]
			let [isInvalid, endBracketIndex] = isInvalidString(str.slice(11), ")");
			endBracketIndex += 12;
			return [str[endBracketIndex] !== nextCharacter ? !1 : isInvalid, endBracketIndex];
		}
		function stringToObject(str="globalThis", scope=globalThis, removeSpaces=true, optionalStart=true) {
			// converts strings to objects in 4 steps. 1 of which is optional sometimes.
			// uses eval, but safely.
			// stage 1: remove unneccessary extra whitespace
			// only skip stage 1 if you are positive it was already done.
			if (removeSpaces) {
				// all whitespace characters that are not contained by strings get removed as unnecessary.
				// problem?: "asdf.a sdf" maps to "asdf.asdf"
					// It is too complicated to make that an error, and I don't care enough, and it doesn't matter anyway. just don't input that if you don't want it to work.
				str = str.split("");
				let i = 0, inString = !1;
				for (; i < str.length; i++) {
					if (inString) inString === str[i] && (inString = !1);
					else if ( "'`\"".includes(str[i]) ) inString = str[i];
					else /\s/.test(str[i]) && str.splice(i--, 1);
				}
				str = str.join("");
			}

			// stage 2: fix the beginning part

			if ( /^[^?.]/.test(str[0]) )
				str = (optionalStart ? "?." : ".") + str;

			// stage 3: split the string correctly into an array

			for (var i = 0, output = [], n = str.length; i < n ;) {
				if (str[i] === "?") {
					if (str[i+1] !== ".") throw Error(`invalid optional member access at index ${i}`);
					str[i+2] === "[" && i++;
					output.push("?.");
					i++;
				}
				if (str[i] === "[") {
					i++;
					let tmpstr = str.substr(i);
					switch (!0) {
						// Boolean:
						case tmpstr.substr(0, 6) === "false]":
						case tmpstr.substr(0, 5) === "true]":
						// nullish:
						case tmpstr.substr(0, 5) === "null]":
						case tmpstr.substr(0, 10) === "undefined]":
						// Number, NaN:
						case tmpstr.substr(0, 4) === "NaN]":
						case !isNaN(+tmpstr.slice(0, tmpstr.indexOf("]"))):
						// BigInt:
						case tmpstr[tmpstr.indexOf("]")-1] === "n" && !isNaN( +tmpstr.slice(0, tmpstr.indexOf("]")-1) ):
							tmpstr = `"${tmpstr.slice(0, tmpstr.indexOf("]"))}"${tmpstr.slice(tmpstr.indexOf("]"))}`;
							// there is intentionally no break here.
						// String:
						case "\"'`".includes(tmpstr[0]):
							var [isInvalid, endBracketIndex] = isInvalidString(tmpstr, "]");
							if (isInvalid) throw Error(`invalid string computed member access at index ${i}`);
							output.push( tmpstr.slice(0, endBracketIndex) );
							i += endBracketIndex + 1;
							break;
						// Symbol.for:
						case tmpstr.substr(0, 11) === "Symbol.for(":
							var [isInvalid, endBracketIndex] = isInvalidSymbolDotFor(tmpstr, "]");
							if (isInvalid)
								throw Error(`invalid Symbol.for(...) computed member access at index ${i}`)
							output.push( tmpstr.slice(0, endBracketIndex) );
							i += endBracketIndex + 1;
							break;
						// other Symbol attribute:
						case /^Symbol\.\w+]/.test(tmpstr):
							const match = /^Symbol\.\w+]/.exec(tmpstr);
							output.push( match[0] );
							i += match[0].length;
							break;
						// something else:
						default:
							throw Error(`invalid type for computed member access at index ${i}`);
					}
				}
				else if (str[i] === ".") {
					i++;
					if (/\d/.test(str[i]))
						throw Error(`invalid dot operator member acces at index ${i}. cannot start with a number.`);
					let match = /\w+/.exec( str.slice(i) );
					output.push(`"${match[0]}"`);
					i += match[0].length;
				}
				else throw Error("Probably Not supposed to happen.");
			}

			// stage 4: turn the array into an object

			// these evals are guaranteed to be safe.
			// either they are something like "'string'", "Symbol.attribute", or "Symbol.for('string')".
			output.forEach( (e, i) => e === "?." ?
				null :
				( scope = output[i-1] === "?." ? scope?.[eval(e)] : scope[eval(e)] )
			);
			return scope;
		}
		return stringToObject._isInvalidString = isInvalidString,
			stringToObject._isInvalidSymbolDotFor = isInvalidSymbolDotFor,
			stringToObject;
	})()
	, zip = (function create_zip() {
		// different from enumerable
		function isNotIterable(thing) { try { for (const e of thing) break } catch { return !0 } return !1 }
		function arrzip(arr1, arr2) {
			if (isNotIterable(arr1) || isNotIterable(arr2)) return [arr1, arr2];
			if (arr1.length !== arr2.length){
				debugger;
				throw Error(`inputs and outputs are different lengths. this is supposed to be impossible to reach.`);
			}

			// the input lengths are always the same.
			for (var output = [], i = 0, length = arr1.length; i < length; i++)
				output.push([ arr1[i] , arr2[i] ]);

			return output;
		}
		return arrzip.isIterable = isIterable, arrzip;
	})()
	, TestingError = (function create_TestingError() {
		const testingError = class TestingError extends globalThis.Error {
			constructor() {
				super(...arguments);
				this.name = "TestingError";
			}
		}
		function TestingError() { return new testingError(...arguments) }
		return TestingError._self = testingError, TestingError;
	})()
	, symbToStr = function symbolToString(symbol) {
		return `Symbol${ Symbol.keyFor(symbol) == null ? "" : ".for"
		}("${ symbol.description.replace(/"/g, '\\"') }")`;
	}
	function toRegex(str) {
		for (var i = 0, b = ""; i < str.length; i++)
			b += `${"$^()+*\\|[]{}?.".includes(str[i]) ? "\\" : ""}${str[i]}`;
		return RegExp(b);
	}
	function stringify(
		object, {
			space = " "
			, spacesAtEnds = false
			, onlyEnumProps = true
		} = {}
	) {
		// works better than JSON.stringify

		switch (object == null ?
			"nullish" :
			object?.constructor?.name === "Array" ?
				"array" :
				object.test === /1/.test ?
					"regexp" :
					typeof object
		) {
			case "boolean": return `${object}`;
			case "regexp": return `${object}`;
			case "string": return `"${ object.replace(/\\/g, "\\\\").replace(/"/g, '\\"') }"`;
			case "bigint": return `${object}n`;
			case "function": return void 0; // can't be serialized. maybe can be treated as a regular object.
			case "number": return Object.is(object, -0) ? "-0" : `${object}`;
			case "nullish": return object === null ? "null" : "undefined";
			case "symbol": return `Symbol${ Symbol.keyFor(object) === void 0 ? "" : ".for"
				}("${ object.description.replace(/"/g, "\\\"") }")`;
			// the "array" and "object" cases might be able to be combined due to their similarity
			case "array":
				if (!object.length) return `[${spacesAtEnds ? space : ""}${spacesAtEnds ? space : ""}]`;

				for (var output = `[${spacesAtEnds ? space : ""}`, i = 0 ;;) {
					// can probably be a do..while, but I don't care.
					output += stringify(
						object[i++]
						, {
							space: space
							, spacesAtEnds: spacesAtEnds
							, onlyEnumProps: onlyEnumProps
						}
					);
					if (i < object.length) output += `,${space}`;
					else break;
				}
				return output + `${spacesAtEnds ? space : ""}]`;
			case "object":
				var keys = Object[onlyEnumProps ? "keys" : "getOwnPropertyNames"](object);
				// symbols always come last since they are concatonated to the end.
				keys = keys.concat(
					onlyEnumProps ?
						Object.getOwnPropertySymbols(object)
							.filter( key => Object.propertyIsEnumerable.call(object, key) ) :
						Object.getOwnPropertySymbols(object)
				);
				if (!keys.length) return `{${spacesAtEnds ? space : ""}${spacesAtEnds ? space : ""}}`;
				for (var output = `{${spacesAtEnds ? space : ""}`, i = 0 ;;) {
					// can probably be a do..while, but I don't care.
					output += `${
						typeof keys[i] === "symbol" ? "[" : '"'
					}${
						typeof keys[i] === "symbol" ? symbToStr(keys[i]) : keys[i]
					}${
						typeof keys[i] === "symbol" ? "]" : '"'
					}:${
						space
					}${stringify(
						object[ keys[i] ]
						, {
							space: space
							, spacesAtEnds: spacesAtEnds
							, onlyEnumProps: onlyEnumProps
						}
					)}`;
					if (++i < keys.length) output += `,${space}`;
					else break;
				}
				return output + `${spacesAtEnds ? space : ""}}`;
			default: throw Error("that type is not supposed to exist.");
		}
		debugger;
		throw Error("It is supposed to be impossible to get here.");
	}
	function testFunction(obj, name) {

		if (obj?.ignore === !0) return;
		if (obj == null) {
			if (debugMode) debugger;
			throw TestingError(`nullish testing objects are invalid. function name "${name}".\n\tError Code: 1\n`);
		}

		name = obj.name ?? name; // name overwrite. different from "name ??= obj.name"
		obj.ignore ??= false;
		obj.changeThis ??= !1;
		obj.args ??= null;
		obj.same ??= !1;
		/**
		 * Idk if this comment is up to date or not.
		 *
		 * be careful when using same. it can cause problems...
		 * attributes that weren't enumerable, configurable, or writable become so.
		 * (or whatever the default is).
		 * prototype attributes aren't converted except for the thisArg
		 * special classes change to default objects and may be broken.
		 * native functions don't convert and instead get set to undefined.
		 * all the problems that come with same are from deepCopy.
		 * all the problems can be avoided by not using same.
		 * same is just an ease of use tool.
		**/

		if ( obj.same === !1 && (
			obj.inputs ?.constructor?.name === "Array" ||
			obj.outputs?.constructor?.name === "Array"
		) ) obj.same = !0;

		// obj.scope / obj.scopes
		if (["string", "symbol", "number", "bigint"].includes(typeof obj.scope)) {
			if (obj.scopes == null) obj.scopes = [obj.scope];
			else if (obj.scopes?.constructor?.name === "Array") obj.scopes.push(obj.scope);
			else throw TestingError(`"scopes" attribute is not an array.\n\tError Code: 2\n`);
			delete obj.scope;
		}
		if (obj.scopes == null) {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" does not have a "scopes" attribute.\n\tError Code: 3\n`);
		}
		if (obj.scopes?.constructor?.name !== "Array") {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" "scopes" attribute is not an array.\n\tError Code: 4\n`);
		}
		if (!obj.scopes.length) {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" does not have any scopes.\n\tError Code: 5\n`);
		}

		// change scopes that reference globalThis into globalThis
		for (var i = 0; i < obj.scopes.length ;) {
			const scope = obj.scopes[i];

			if ( ["window", "global", "frames", "self"].includes(scope) ) {
				obj.scopes.splice(i, 1);
				obj.scopes.includes("globalThis") || obj.scopes.push("globalThis");

				if (obj.same !== !0) {
					const tmp_outputs = obj.outputs[scope], tmp_inputs = obj.inputs[scope];
					delete obj.outputs[scope];
					delete obj.inputs[scope];
					obj.outputs.globalThis ??= tmp_outputs;
					obj.inputs.globalThis ??= tmp_inputs;
				}
			}
			else i++;
		}

		// change the inputs for different scopes to be the same if they are supposed to be.
		if (obj.same === !0) { // strict equals on purpose

			const tmp_inputs = obj.inputs, tmp_outputs = obj.outputs;
			obj.inputs = {}; obj.outputs = {}; // these must set to different objects.

			for (const scope of obj.scopes) {
				obj.inputs[scope] = deepCopy(tmp_inputs, {onlyEnumProps: false});
				obj.outputs[scope] = tmp_outputs;

				if (obj.changeThis === !0)
					for (var i = 0; i < obj.inputs[scope].length; i++)
						obj.inputs[scope][i][0] = scope === "globalThis" ?
							void 0 :
							stringToObject(scope);
				else
					for (var i = 0; i < obj.inputs[scope].length; i++)
						obj.inputs[scope][i][0] = tmp_inputs[i][0];
			}
		}

		// obj.name
		if (name == null) {
			if (debugMode) debugger;
			throw TestingError("undefined names are invalid.\n\tError Code: 6\n");
		}

		// obj.args

		if (typeof obj.args === "number") obj.args = BigInt(Math.round(obj.args));
		if (typeof obj.args === "bigint" || obj.args === null) {
			if (obj.args < 0n)
				throw TestingError(`function "${name}" has an invalid "args" attribute. Must be positive.\n\tError Code: 7\n`);
			const argsValue = obj.args;
			obj.args = {};
			for (const scope of obj.scopes) obj.args[scope] = argsValue;
		}
		else for (let [scope, value] of Object.entries(obj.args)) {
			if (!obj.scopes.includes(scope)) throw TestingError(`function "${name}" has an args scope "${scope.toString()}" that is not in obj.scopes.\n\tError Code: 8`);
			if (typeof value === "number") obj.args[scope] = BigInt(Math.round(value));
			if (typeof value !== "bigint" && value !== null || value < 0n) throw TestingError(`function "${name}" has an invalid args attribute for scope "${scope.toString()}"\n\tError Code: 9`);
		}

		// obj.ignore
		if (typeof obj.ignore === "boolean") {
			const ignoreValue = obj.ignore;
			obj.ignore = {};
			for (const scope of obj.scopes) obj.ignore[scope] = ignoreValue;
		}
		else for (const [scope, value] of Object.entries(obj.ignore)) {
			if (!obj.scopes.includes(scope)) throw TestingError(`function "${name}" has an "ignore" scope "${key.toString()}" that is not in obj.scopes.\n\tError Code: A`);
			if (typeof value !== "boolean") obj.ignore[scope] = !!value; // Boolean(value)
		}

		// obj.inputs, obj.outputs
		if (obj.inputs == null) {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" does not have an "inputs" attribute.\n\tError Code: B\n`);
		}
		if (obj.outputs == null) {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" does not have an "outputs" attribute.\n\tError Code: C\n`);
		}
		if (Object.keys(obj.inputs).length !== Object.keys(obj.outputs).length) {
			if (debugMode) debugger;
			throw TestingError(`function "${name}" has different amounts of scopes for input and output scopes.\n\tError Code: D\n`);
		}

		/*
		for each scope:
			foreach input-output pair:
				test inputs against outputs
		*/
		for (const scope of obj.scopes) {

			if (!["string", "symbol", "number", "bigint"].includes(typeof scope)) {
				if (debugMode) debugger;
				throw TestingError(`function "${name}" has an invalid scope "${scope}" and needs to be a string, symbol, number, or bigint.\n\tError Code: E\n`);
			}
			if (obj.inputs[scope].length !== obj.outputs[scope].length) {
				if (debugMode) debugger;
				throw Error(`function "${name}" in scope "${scope} has different numbers of inputs and outputs.\n\tError Code: F\n`);
			}

			for (var zippedObject = zip(obj.inputs[scope], obj.outputs[scope]), index = 0
				; index < zippedObject.length; index++) {
				const [inputs, outputs] = zippedObject[index];
				if (obj.args[scope] !== null && BigInt(inputs.length)-1n !== obj.args[scope]) {
					if (debugMode) debugger;
					throw TestingError(`function "${name}" in scope "${scope}" index ${index} has different number of expected arguments than were provided. ${obj.args[scope]} expected and ${BigInt(inputs.length) - 1n} provided.\n\tError Code: 10\n`);
				}
				if (outputs.length !== 2) {
					if (debugMode) debugger;
					throw TestingError(`function "${name}" in scope "${scope}", index ${index} doesn't have the correct amount of outputs.\n\tError Code: 11\n`);
				}
				const scopeObject = stringToObject(scope);

				try {
					const outputValue = inputs[0] === void 0 ? scopeObject[name](...inputs.slice(1)) : scopeObject[name].call(...inputs);
					if (outputs[1] !== 0 && outputs[1] !== !1) {
						if (debugMode) debugger;
						throw TestingError(`function "${name}" in scope "${scope}", index ${index} is supposed to have an error and did not.\n\tError Code: 12\n`);
					}
					if (outputs[0] !== outputValue && stringify(outputs[0]) !== stringify(outputValue)) {
						// TODO: Make it work for things other than primitives and regular objects.
						// example: image HTML tags don't work. the won't be the same object, and they stringify to "{}".
						// try jQuery.ext
						// TODO: Figure out what the previous comment was supposed to say
						if (debugMode) debugger;
						throw TestingError(`function "${name}" in scope "${scope}", index ${index} had an incorrect output value.\n\tError Code: 13\n`);
					}
				}
				catch (err) {
					if (err instanceof TestingError._self) {
						if (debugMode) debugger;
						throw err; // bubble up error from above.
					}
					if (outputs[1] !== 1 && outputs[1] !== !0) {
						if (debugMode) debugger;
						throw TestingError(`function "${name}" in scope "${scope}", index ${index} encountered an unexpected error.\n\tError Code: 14\n`);
					}
					if (outputs[0] !== err+"") {
						if (debugMode) debugger;
						throw TestingError(`function "${name}" in scope "${scope}", index ${index} encountered the wrong error.\n\tError Code: 15\n`);
					}
				}
			}
		}
	}
	function testLibrary(tests={}) {
		if (tests == null || !Object.getOwnPropertyNames(tests).length) return;
		for (const key of Object.keys(tests))
			testFunction(tests[key], key);
	}

	if (libraryTests?.constructor?.name === "Array")
		for (const tests of libraryTests)
			testLibrary(tests);
	else if (libraryTests?.constructor?.name === "Object")
		for (const tests of Object.values(libraryTests))
			testLibrary(tests);
	else
		testLibrary(libraryTests);
})("Test.js");
