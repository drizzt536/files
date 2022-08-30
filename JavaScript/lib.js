#!/usr/bin/env js

void (() => { "use strict";
	{// Customization & Constants

		const onConflictOptions = [
			"log", "throw" , "trw", "return", "ret", "error",
			"err", "warn"  , "wrn", "debug" , "dbg", "info" ,
			"inf", "assert", "ast", "alert" , "alt", "none" ,
			"crash", "cry", "dont-use", "warning", "default",
			"debugger",
			// cry just logs every time something is overwritten instead of all at the end in one message.
			// none just ignores the error and overwrites it anyway.
		];

		/**
		 * OnConflict Options (ones in parentheses are aliases for the same thing):
		   - log: console.log (default value)
		   - throw (trw)
		   - return (ret)
		   - error (err): console.error
		   - warning (warn, wrn): console.warn
		   - debug (dbg, default): console.debug
		   - debugger: causes a debugger where the overwrite happens. then it acts the same as cry
		   - info (inf)
		   - assert (ast)
		   - alert (alt)
		   - crash
		   - cry
		   - dont-use: doesn't overwrite anything
		   - none: ignores the error and overwrites the value anyway
		 * Library Settings:
		   - The defaults are the boolean value true, unless otherwise noted on the same line in a comment
		   - if there is a comment that is not on the same line as a variable, it is for the variable directly below it
		   - All alerts happen using console.log except for conflict stuff.
		 * ignore list
		   - should be an array of strings that corresponds with keys in LIBRARY_VARIABLES
		   - LIBRARY_VARIABLES is defined in the next section of the code.
		   - for each item in the ignore list, the function will NOT be added to the global scope
		   - if it, the ignore list variable, is a string, then that singular key will not be brought to the global scope.
		   - if it is an array, the none of the corresponding elements will be globalized.
		   - otherwise, nothing changes.
		   - functions on the global ignore list can still be accessed through LIBRARY_VARIABLES if it is globalized
		**/

		var LibSettings = {
			onConflictOptions                   : onConflictOptions
			, Alert_Library_Load_Finished       : "default" // false
			, Global_Ignore_List                : ["help", "Errors", "dQuery", "getIp", "dir", "numToStrW_s"]
			, Globlize_Library_Variables_Object : "default" // true
			, Global_Library_Object_Name        : "default" // "LIBRARY_VARIABLES". if nullish. no key will be set
			, ON_CONFLICT                       : "default" // "debug"
			, Alert_Conflict_For_Math           : "default" // false
			, Alert_Conflict_OverWritten        : "default"
			, Library_Startup_Message           : "default" // "lib.js loaded"
			// console.log. function for logging that the startup finished without any errors.
			, Library_Startup_Function          : "default"
			, Output_Math_Variable              : "default" // "Math"
			, Input_Math_Variable               : "default" // "rMath" (MathObjects object key)
			, MATH_LOG_DEFAULT_BASE             : "default" // 10. for rMath.log and rMath.logbase
			, MATH_TEMPCONV_DEFAULT_END_SYSTEM  : "default" // "c", for rMath.tempConv (temperature converter between systems)
			, aMath_Help_Argument               : "default"
			, aMath_DegTrig_Argument            : "default"
			, aMath_Comparatives_Argument       : "default"
			, aMath_Internals_Argument          : "default"
			, bMath_Help_Argument               : "default"
			, bMath_DegTrig_Argument            : "default"
			, bMath_Comparatives_Argument       : "default"
			, cMath_DegTrig_Argument            : "default"
			, cMath_Help_Argument               : "default"
			, fMath_Help_Argument               : "default"
			, fMath_DegTrig_Argument            : "default"
			, sMath_Help_Argument               : "default"
			, sMath_DegTrig_Argument            : "default"
			// true, only recommended to be false if you plan to never use sMath or anything that uses it.
			, sMath_Comparatives_Argument       : "default"
			, rMath_DegTrig_Argument            : "default"
			, rMath_Help_Argument               : "default"
			, rMath_Comparatives_Argument       : "default"
			, rMath_Constants_Argument          : "default"
			, cfMath_Help_Argument              : "default"
			, Logic_BitWise_Argument            : "default"
			, Logic_Comparatives_Argument       : "default"
			, Logic_Help_Argument               : "default"
			, Run_KeyLogger                     : "default" // false
			, KeyLogger_Debug_Argument          : "default" // false
			, KeyLogger_Alert_Start_Stop        : "default"
			, KeyLogger_Alert_Unused            : "default" // false
			, KeyLogger_Variable_Argument       : "default" // Symbol.for('keys')
			, KeyLogger_Copy_Obj_Argument       : "default"
			, KeyLogger_Type_Argument           : "default" // "keydown"
			, Clear_LocalStorage                : "default" // false
			, Clear_SessionStorage              : "default" // false
			, Creepily_Watch_Every_Action       : "default" // false
			, Freeze_Everything                 : "default" // false
			, Freeze_Instance_Objects           : "default" // false, only matters if Freeze_Everything is not truthy
			// developer settings
			, Define_Fn_Previous_Getter_String  : "default" // "\\previous".
		};

		LibSettings.Clear_LocalStorage   && LibSettings.Clear_LocalStorage   !== "default" && localStorage  .clear();
		LibSettings.Clear_SessionStorage && LibSettings.Clear_SessionStorage !== "default" && sessionStorage.clear();
		LibSettings.MATH_LOG_DEFAULT_BASE   === "default" && (LibSettings.MATH_LOG_DEFAULT_BASE   = 10 );
		LibSettings.MATH_DEFAULT_END_SYSTEM === "default" && (LibSettings.MATH_DEFAULT_END_SYSTEM = "c");

		onConflictOptions.includes(LibSettings.ON_CONFLICT) || (LibSettings.ON_CONFLICT = "dbg");
		LibSettings.ON_CONFLICT === "default" && (LibSettings.ON_CONFLICT = "dbg");
		LibSettings.ON_CONFLICT = LibSettings.ON_CONFLICT.toLowerCase();
		// TODO: clear cookies and caches if the library user wants
	} {// Variables & Functions definitions
		{// Local Variables (may also be global)
			// NOTE: Maximum Array length allowed: 4,294,967,295 (2^32 - 1)
			// NOTE: Maximum BigInt value allowed: 2^1,073,741,823
			// Array(10).fill([]) does a different thing than [[],[],[],[],[],[],[],[],[],[]]
			for (var i = 10, j, multable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					multable[i][j] = i * j;
			for (var i = 10, j, addtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					addtable[i][j] = i + j;
			for (var i = 10, j, subtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					subtable[i][j] = i - j;
			for (var i = 10, j, divtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					divtable[i][j] = i / j;
			var CONFLICT_ARR = [];
			CONFLICT_ARR.push = function push(val, scope/*name*/) { return Array.prototype.push.call(
				this, (scope.startsWith("object ") ? scope.slice(7) : scope.startsWith("prototype ") ?
					scope.slice(10) + ".prototype" : "window") + "." + val
			)}; var DEFER_ARR = [] , MathObjects = {}
			//////////////////////////////// START OF CONSTANTS ////////////////////////////////
			, list = Array.from
			, int = Number.parseInt
			, abs = Math.abs
			, sgn = Math.sign
			, rand = Math.random
			, json = JSON
			, alphabetL     = "abcdefghijklmnopqrstuvwxyz"
			, alphabet      = alphabetL
			, alphabetU     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			, numbers       = "0123456789"
			, base62Numbers = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
			, characters    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]{}|;:',.<>/?-_=+ \"\\"
			, π             = 3.141592653589793   , π_2           = 1.5707963267948966
			, π_3           = 1.0471975511965979  , π2_3          = 2.0943951023931957
			, π_4           = 0.7853981633974483  , π3_4          = 2.356194490192345
			, π5_4          = 3.9269908169872414  , π7_4          = 5.497787143782138
			, π_5           = 0.6283185307179586  , π_6           = 0.5235987755982989
			, π5_6          = 2.6179938779914944  , π7_6          = 3.6651914291880923
			, π11_6         = 5.759586531581288   , π_7           = 0.4487989505128276
			, π_8           = 0.39269908169872414 , π_9           = 0.3490658503988659
			, π_10          = 0.3141592653589793  , π_11          = 0.28559933214452665
			, π_12          = 0.26179938779914946
			, 𝜏             = 6.283185307179586
			, 𝑒             = 2.718281828459045
			, ϕ             = 1.618033988749895 // -2 sin 666°
			, α             = 1.187452351126501 // wikipedia.org/wiki/Foias_constant
			, γ             = .5772156649015329
			, Ω             = .5671432904097838 // Ωe^Ω = 1
			, pi            = π
			, tau           = 𝜏
			, e             = 𝑒
			, phi           = ϕ
			, foia          = α
			, emc           = γ // Euler-Mascheroni Constant
			, omega         = Ω
			//////////////////////////////// END OF CONSTANTS ////////////////////////////////
			, lastElement = function lastElement() { return this[dim(this)] }
			, isArr = function isArray(thing) { return thing?.constructor?.name === "Array" }
			, chr = function chr(integer) { return String.fromCharCode( Number(integer) ) }
			, copy = function copy(object) { return json.parse( json.stringify(object) ) }
			, dim = function dim(e, n=1) { return e?.length - n }
			, len = function length(e) { return e?.length }
			, range = function* range(start, stop, step=1) {
				stop == null ? [stop, start] = [start, 0] : stop++;
				for (var i = start; i < stop; i += step) yield i;
			}, isIterable = function isIterable(arg) {
				try { for (const e of arg) break; return !0 }
				catch { return !1 }
			}, arrzip = function arrzip(arr1, arr2) {
				// array zip
				if (arr1?.constructor?.prototype?.[Symbol.toStringTag] === "Generator") arr1 = list(arr1);
				if (arr2?.constructor?.prototype?.[Symbol.toStringTag] === "Generator") arr2 = list(arr2);
				if (!isIterable(arr1) || !isIterable(arr2)) return [arr1, arr2];
				for (var output = [], length = Math.min(arr1.length, arr2.length), i = 0; i < length; i++)
					output.push([ arr1[i] , arr2[i] ]);
				return output;
			}, numStrNorm = function NormalizeNumberString(snum="0.0", defaultValue=NaN) {
				if (typeof snum === "bigint") return snum + ".0";
				if (isNaN(snum)) return defaultValue;
				if (sMath.eq.ez(snum += "")) return "0.0";
				!snum.includes(".") && (snum += ".0");
				return (snum[0] === "-" ? "-" : "") +
					snum.substring( (snum[0] === "-") +
						len(snum.match(/^-?(0+\B)/)?.[1]), // can evaluate to NaN, but it doesn't matter
						snum.match(/\B0+$/)?.index || Infinity
				);
			}, type = function type(a, specific=!1) {
				return specific == !1 || typeof a === "bigint" || typeof a === "symbol" ?
					/^type\(\){return("|'|`)mutstr\1}$/.test(`${a?.type}`.replace(/\s|;/g, "")) ?
						"string" :
						typeof a :
					a === void 0 ?
						"und" :
						typeof a === "number" ?
							isNaN(a) ?
								"nan" :
								isNaN(a - a) ?
									"inf" :
									"num" :
							typeof a === "object" ?
								a?.constructor?.name === 'NodeList' ?
									"nodelist" :
									a.test === /a/.test ?
										"regex" :
										a === null ?
											"null" :
											/^type\(\){return("|'|`)linkedlist\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
												"linkedlist" :
												/^type\(\){return("|'|`)complex\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
													"complex" :
													/^type\(\){return("|'|`)fraction\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
														"fraction" :
														/^type\(\){return("|'|`)set\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
															"set" :
															/^type\(\){return("|'|`)dict\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
																"dict" :
																/^type\(\){return("|'|`)mutstr\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
																	"mutstr" :
																	isArr(a) ?
																		"arr" :
																		"obj" :
								typeof a === "string" ?
									"str" :
									typeof a === "boolean" ?
										"bool" :
									/^class/.test(a+"") ?
										"class" :
										"func"
			}, strToObj = function strToObj(str, obj=window) {
				if (type(str) !== "string") return;
				str.split(/[.[\]'"]/).filter(e=>e).forEach(e => obj = obj?.[e]);
				return obj;
			}, define = (function create_define(previousGetterString="\\previous") {
				function error(val, scopename) {
					CONFLICT_ARR.push(val/*tmp*/, scopename);
					if (LibSettings.ON_CONFLICT === "crash") throw Error(`scope[${String(val)}] is already defined and LibSettings.ON_CONFLICT is set to 'crash'`);
					if (LibSettings.ON_CONFLICT === "cry") console.log(`scope[${String(val)}] overwritten and LibSettings.ON_CONFLICT is set to cry.`);
					if (LibSettings.ON_CONFLICT === "debugger") debugger;
					if (LibSettings.ON_CONFLICT === "dont-use") return !1;
					return !0;
				}
				var previous = null;
				return function define(
					s /*key*/,
					section /*for defer*/,
					scope = window,
					customValue = void 0,
					scopename = void 0,
				) {
					// section 0 stores the defer functions in DEFER_ARR
					// section 1 calls the defer functions
					// "s" is the string for the name of the function/variable.
					// a better name would have been "key", but that is used for the object and prototype things.
					// the return value is whether or not the function worked.
					// returns the new length of DEFER_ARR if it section 0 for defer variables
					// custom values of null mean do nothing, while undefined means use LIBRARY_VARIABLES[s]
					if (
						typeof s !== "string" || !s || scope == null ||
						(Array.isArray(LibSettings.Global_Ignore_List) ?
							LibSettings.Global_Ignore_List.includes(s) :
							LibSettings.Global_Ignore_List === s) ||
						customValue === null || scope != scope /*NaN*/
					) return !1;
					if (!Object.hasOwn(LIBRARY_VARIABLES, s)) LIBRARY_VARIABLES[`local ${s}`] = customValue;
					if (customValue === previousGetterString) { define(s, section, scope, previous, scopename);
					} else if (s.indexOf(" ") < 0) {
						if (scope[s] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(s, scopename)) return !1;
						previous = scope[s] = customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue;
					} else if (s.startsWith("delete ")) {
						let tmp = s.slice(7);
						delete scope[tmp];
						return scope[tmp] === void 0
					} else if (s.startsWith("literal symbol.for ")) {
						let tmp = Symbol.for(s.slice(19));
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[Symbol.for(s.slice(19))] = customValue === void 0 ?
							LIBRARY_VARIABLES[s] :
							customValue;
					} else if (s.startsWith("instance ")) {
						let tmp = s.slice(9);
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[tmp] = new (customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue);
						tmp.includes("Math") && (MathObjects[tmp] = scope[tmp]);
					} else if (s.startsWith("defer_instance ")) {
						if (!section) return DEFER_ARR.push(s);
						let tmp = s.slice(15);
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[tmp] = new (customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue);
						tmp.includes("Math") && (MathObjects[tmp] = scope[tmp]);
					} else if (s.startsWith("defer ")) {
						if (!section) return DEFER_ARR.push(s);
						let tmp = s.slice(6);
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[tmp] = customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue;
					} else if (s.startsWith("defer_call ")) {
						if (!section) return DEFER_ARR.push(s);
						let tmp = s.slice(11);
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[tmp] = (customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue)();
					} else if (s.startsWith("defer_call_local ")) {
						if (!section) return DEFER_ARR.push(s);
						previous = (customValue === void 0 ? LIBRARY_VARIABLES[s] : customValue)();
					} else if (s.startsWith("overwrite ")) {
						previous = scope[s.slice(10)] = customValue === void 0 ?
							LIBRARY_VARIABLES[s] :
							customValue;
					} else if (s.startsWith("overwrite_call ")) {
						previous = scope[s.slice(15)] = (customValue === void 0 ?
							LIBRARY_VARIABLES[s] : customValue
						)();
					} else if (s.startsWith("call ")) {
						let tmp = s.slice(5);
						if (scope[tmp] !== void 0 && LibSettings.ON_CONFLICT !== "none" && !error(tmp, scopename)) return !1;
						previous = scope[tmp] = (customValue === void 0 ?
							LIBRARY_VARIABLES[s] : customValue
						)();
					} else if (s.startsWith("object ")) {
						let newScope = strToObj(s.slice(7), scope);
						for (let [key, value] of Object.entries( LIBRARY_VARIABLES[s] ))
							define(key, section, newScope, value, s);
					} else if (s.startsWith("prototype ")) {
						let newScope = strToObj(s.slice(10), scope).prototype;
						for (let [key, value] of Object.entries( LIBRARY_VARIABLES[s] ))
							define(key, section, newScope, value, s);
					} // else { local variable, do nothing }
					return !0;
				}
			})(
				LibSettings.Define_Fn_Previous_Getter_String === "default" ?
					"\\previous" :
					LibSettings.Define_Fn_Previous_Getter_String
			), keyof = function keyof(obj, value) {
				for (const key of Object.keys(obj))
					if (obj[key] === value) return key;
				return null;
			}, ord = function ord(string) {
				return type(string) === "string" && len(string) ?
					dim(string) ?
						string.split("").map(c => c.charCodeAt(0)) :
						string.charCodeAt(0) :
					0
			}, fpart = function fPart(n, number=true) {
				if (typeof n === "bigint") return number ? 0 : "0.0";
				if ( rMath.isNaN(n) ) return NaN;
				if ( Number.isInteger(n) ) return number ? 0 : "0.0";
				if ((n+"").includes("e+")) n = n.toPrecision(100);
				else if ((n+"").incl("e-")) n = sMath.div10( (n+"").slc(0, "e"), Number((n+"").slc("-", void 0, 1)) );
				return number ?
					Number( (n+"").slc(".") ) :
					`0${`${n}`.slc(".")}`;
			}, round = function round(n) {
				return typeof n === "number" ?
					fpart(n) < .5 ?
						Number.parseInt(n) :
						Number.parseInt(n) + sgn(n) :
					typeof n === "bigint" ?
						n :
						NaN;
			}, randint = function randomInt(min=1, max=null) {
				if (max == null) {
					max = min;
					min = 0;
				}
				if (typeof min !== "number" || typeof max !== "number") return round( rand() );
				min < 0 && min--;
				return round( rand() * abs(min - max) + min );
			}, floor = function floor(n) {
				return typeof n === "number" ?
					Number.parseInt(n) - (n<0 && n != Number.parseInt(n)) :
					typeof n === "bigint" ?
						n :
						NaN;
			}, ceil = function ceil(n) {
				return typeof n === "number" ?
					Number.parseInt(n) + (n>0 && n != Number.parseInt(n)) :
					typeof n === "bigint" ?
						n :
						NaN;
			}, getArguments = function getArguments(fn) {
				// any comments inside the argument parens acts as a docstring like in python.
				// works for all functions
				if (typeof fn !== "function") return !1;
				fn += ""; // fn = fn.toString()
				if (/^function \w+\(\)\s*{\s*\[native code\]\s*$/.in(fn)) return "native function. can't get arguments";
				if (fn.sW("class")) return a.slc(0, "{").trim();
				if (/^function/.in(fn) && /^\s*\(/.in(fn)) return fn.match(/^\w+/)[0]; // ??? idk
				for (var i = 0, fn = fn.slc("("), n = fn.length, count = 0; i < n; i++) {
					if (fn[i] === "(") count++;
					else if (fn[i] === ")") count--;
					if (!count) break;
				}
				return fn.substring(1, i);
			}, createElement = function createElement(element="p", options={}) {
				var element = document.createElement(element), objects = null, click = null;
				for (const e of Object.keys(options)) {
					if (e === "children") {
						type(options[e], 1) === "arr" ?
							options[e].forEach(c => element.appendChild(c)) :
							element.appendChild(options[e]);
					} else if (e === "onClick") { // not "onclick"
						typeof options[e] === "function" ?
							element.ael("click", options[e]) :
							element.ael("click", ...options[e]);
					} else if (e === "on") {
						e.listener ??= e.handler;
						element.ael( e.type, e.listener, {
							capture : e.capture ,
							passive : e.passive ,
							once    : e.once    ,
						});

					} else if (["object", "objects"].includes(e)) {
						objects = options[e];
					} else if (e === "style") {
						for (const stl of Object.keys(options[e]))
							element.style[stl] = options[e][stl];
					} else if (e === "click") {
						click = options[e];
					} else element[e] = options[e];
				}
				if (objects !== null) {
					if (objects instanceof Array)
						for (var i = len(objects); i --> 0 ;)
							object[i].appendChild(element);
					else object.appendChild(element);
				}
				element.click(click);
				return element;
			}, numToStrW_s = function numberToStringWithUnderscores(number) {
				for (var i = 0, str2 = "", str = `${number}`.reverse(); i < len(str); i++) {
					(!(i % 3) && i) && (str2 += "_");
					str2 += str[i];
				}
				return str2.reverse();
			}, strMul = function stringMultiplication(s1="", num=1) {
				// the same as regular string multiplication in Python
				if (rMath.isNaN(num) || type(s1) !== "string") return "";
				for (var i = num, s2 = ""; i --> 0 ;) s2 += s1;
				return s2;
			}, formatjson = function formatJSON(json="{}", {
				objectNewline = true,
				tab = "\t",
				newline = "\n",
				space = " ",
				arrayOneLine = true,
				// arrayAlwaysOneLine = false, // doesn't do anything yet
				arrayOneLineSpace = " ", // if " ", [ ITEM ]. if "\t", [\tITEM\t]. etc
			}={}) {
				if (type(json) !== "string") throw TypeError("formatjson() requires a string");
				try { JSON.parse(json) } catch { throw TypeError("formatjson() requires a JSON string") }
				if (json.remove(/\s/g) === "{}") return "{}";
				if (json.remove(/\s/g) === "[]") return "[]";
				if (/\s*("|'|`)(.|\n)*\1\s*/.in(json.remove(/\s/g))) return json.remove(/(^\s*)|(\s*$)/g);
				for (var i = 0, n = len(json), tabs = 0, output = "", inString = !1; i < n; i++) {
					if (json[i] === '"' && json[i - 1] !== '\\') inString = !inString;
					if (inString) output += json[i];
					else if (/\s/.in(json[i])) continue;
					else if (json[i] === "{") output += `${json[i]}${newline}${strMul(tab, ++tabs)}`;
					else if (json[i] === "[") {
						if (!arrayOneLine) {
							output += `${json[i]}${newline}${strMul(tab, ++tabs)}`;
							continue;
						}
						for (let arrayInString = !1, index = i + 1 ;; index++) {
							if (json[index] === '"' && json[index - 1] !== '\\')
								arrayInString = !arrayInString;
							if (arrayInString) continue;
							if (["{", "[", ","].incl(json[index])) {
								output += `${json[i]}${newline}${strMul(tab, ++tabs)}`;
								break;
							} else if (json[index] === "]") {
								output += `[${arrayOneLineSpace}${
									json.substring(i + 1, index)
								}${arrayOneLineSpace}]`;
								i = index;
								break;
							}
						}
					} else if (["}", "]"].incl(json[i])) output += `${newline}${strMul(tab, --tabs)}${json[i]}`;
					else if (json[i] === ":") output += `${json[i]}${space}`;
					else if (json[i] === ",") {
						// objectNewline === true : }, {
						// objectNewline === false: },\n\t{
						let s = json.slice(i);
						output += json[i] + (!objectNewline && json[i + 1 + len(s) - len(s.remove(/^\s+/))] === "{" ? `${space}` : `${newline}${strMul(tab, tabs)}`);
					} else output += json[i];
				}
				return output;
			}, bisectLeft = function bisectLeft(arr, x, lo=0, hi=null) {
				hi === null && (hi = len(arr) || 0);
				if (lo < 0 || hi < lo || hi > len(arr)) return false;
				let mid;
				while (lo != hi) {
					mid = lo + floor((hi-lo)/2);
					if (arr[mid] < x) lo = mid + 1; else hi = mid;
				}
				return lo;
			}, bisectRight = function bisectRight(arr, x, lo=0, hi=null) {
				hi === null && (hi = len(arr) || 0);
				if (lo < 0 || hi < lo || hi > len(arr)) return false;
				let mid;
				while (lo != hi) {
					mid = lo + floor((hi-lo)/2);
					if (arr[mid] <= x) lo = mid + 1; else hi = mid;
				}
				return lo;
			}, bisect = function bisect(arr, x, orientation="left", lo=0, hi=null) {
				return (orientation === "left" ?
					bisectLeft : bisectRight
				)(arr, x, lo, hi);
			}, qsort = (function create_quickSort() {
				function partition(arr, low, high) {
					let pivot = arr[high];
					for (var i = low - 1, j = low; j <= high - 1; j++)
						if (arr[j] < pivot)
							i++,
							[arr[i], arr[j]] = [arr[j], arr[i]];
					i++;
					[arr[i], arr[high]] = [arr[high], arr[i]];
					return i;
				} return function qsort(arr, low=0, high=dim(arguments[0])) {
					if (low >= high) return arr;
					let pi = partition(arr, low, high);
					qsort(arr, low, pi - 1);
					qsort(arr, pi + 1, high);
					return arr;
				}
			})(), msort = (function create_mergeSort() {
				// doesn't affect original variable, unlike qsort
				function merge(left, right) {
					let arr = [];
					while (len(left) && len(right)) arr.push( (left[0] < right[0] ? left : right).shift() );
					return [ ...arr, ...left, ...right ];
				} return function msort(arr) {
					if (len(arr) < 2) return arr;
					return merge(
						msort( arr.slice(0, len(arr) / 2) ),
						msort( arr.slice(len(arr) / 2) )
					)
				}
			})(), dict = (function create_dict() {
				// So I can add prototype methods and not have it on literally every object in existance
				var Dictionary = class dict extends Object {
					// I think "extends Object" here might be redundant, but whatever.
					constructor(dict) {
						super();
						for (const e of Object.keys(dict))
							this[e] = dict[e];
					} keys()            { return Object.keys(this)              }
					keyof(thing)        { return keyof(this, thing)             }
					values()            { return Object.values(this)            }
					entries()           { return Object.entries(this)           }
					freeze()            { return Object.freeze(this)            }
					isFrozen()          { return Object.isFrozen(this)          }
					isExtensible()      { return Object.isExtensible(this)      }
					preventExtensions() { return Object.preventExtensions(this) }
					seal()              { return Object.seal(this)              }
					isSealed()          { return Object.isSealed(this)          }
					size()              { return len(Object.keys(this))         }
					__type__()          { return "dict";                        }
				}
				function dict(obj={}) { return new Dictionary(obj) }
				dict.fromEntries = function fromEntries(entries=[]) { return this( Object.fromEntries(entries) ) }
				return dict;
			})();

			--> Interval things

			let intervals = dict()
				, _setInterval = window.setInterval
				, _clearInterval = window.clearInterval;
			var setInterval = function setInterval(/*arguments*/) {
				var interval = _setInterval.apply(window, arguments);
				intervals[interval] = arguments;
				return interval;
			}, clearInterval = function clearInterval(/*code*/) {
				_clearInterval.apply(window, arguments);
				delete intervals[code];
			}
			setInterval._setInterval = _setInterval;
			clearInterval._clearInterval = _clearInterval;

			LibSettings.DEFER_ARR = DEFER_ARR;
			LibSettings.CONFLICT_ARR = CONFLICT_ARR;
		} // variables to be globalized:
		var LIBRARY_VARIABLES = {
		"literal symbol.for <0x200b>": "​" // zero width space
		, "literal symbol.for <0x08>": "" // \b
		, "call LinkedList"() {
			class Node {
				constructor(value, next=null) {
					this.value = value;
					this.next = next;
				}
			}
			return class LinkedList {
				constructor(head) {
					this.size = 0;
					this.head = head == null ? null : new Node(head);
				} insertLast(value) {
					if (!this.size) return this.insertFirst(value);
					this.size++;
					for (var current = this.head; current.next ;)
						current = current.next;
					current.next = new Node(value);
					return this;
				} insertAt(value, index=0) {
					if (index < 0 || index > this.size) throw Error(`Index out of range: index: ${index}`);
					if (!index) return this.insertFirst(value);
					if (index === this.size) return this.insertLast(value);
					for (var current = this.head; index --> 0 ;)
						current = current.next;
					this.size++;
					current.next = new Node(value, current.next)
					return this;
				} getAt(index=0) {
					if (index < 0 || index > this.size) throw Error(`Index out of range. index: ${index}`);
					for (var current = this.head; index --> 0 ;)
						current = current.next;
					return current;
				} removeAt(index) {
					if (index < 0 || index > this.size) throw Error(`Index out of range. index: ${index}`);
					for (var current = this.head; index --> 1 ;)
						current = current.next;
					current.next = current.next.next; // Garbage Collector Will worry about this
					this.size--;
					return this;
				} insertFirst(value) {
					this.head = new Node(value, this.head);
					this.size++;
					return this;
				} reverse() {
					for (var cur = this.head, prev = null, next; cur ;)
						[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
					this.head = prev || this.head;
					return this;
				} toArray() {
					for (var current = this.head, a = []; current ;) {
						a.push(current.value);
						current = current.next;
					}
					return a;
				} clear() {
					this.head = null;
					this.size = 0;
					return this;
				} Node() { return new Node(...arguments);
				} __type__() { return "linkedlist" }
			}
		}, "overwrite_call Image"() {
			// the function can still be used the same as before
			var _Image = window.Image;
			function Image(width, height, options={}) {
				var image = new _Image(width, height);
				for (const e of Object.keys(options)) image[e] = options[e];
				return image;
			}
			Image._Image = _Image;
			return Image;
		}, "call md5"(n) {
			function r(n, r) {
				var t = (65535 & n) + (65535 & r);
				return (n >> 16) + (r >> 16) + (t >> 16) << 16 | 65535 & t
			} function t(n, t, e, u, o, c) { return r((f = r(r(t, n), r(u, c))) << (i = o) | f >>> 32 - i, e);
			} function e(n, r, e, u, o, c, f) { return t(r & e | ~r & u, n, r, o, c, f)
			} function u(n, r, e, u, o, c, f) { return t(r & u | e & ~u, n, r, o, c, f)
			} function o(n, r, e, u, o, c, f) { return t(r ^ e ^ u, n, r, o, c, f)
			} function c(n, r, e, u, o, c, f) { return t(e ^ (r | ~u), n, r, o, c, f)
			} function f(n, t) {
				n[t >> 5] |= 128 << t % 32, n[14 + (t + 64 >>> 9 << 4)] = t;
				for (var f=0,i,a,h,l,v=1732584193, d=-271733879, g=-1732584194, s=271733878; f < n.length; f += 16)
					i = v, a = d, h = g, l = s,
					v = e(v, d, g, s, n[f], 7, -680876936), s = e(s, v, d, g, n[f + 1], 12, -389564586),
					g = e(g, s, v, d, n[f + 2], 17, 606105819), d = e(d, g, s, v, n[f + 3], 22, -1044525330),
					v = e(v, d, g, s, n[f + 4], 7, -176418897), s = e(s, v, d, g, n[f + 5], 12, 1200080426),
					g = e(g, s, v, d, n[f + 6], 17, -1473231341), d = e(d, g, s, v, n[f + 7], 22, -45705983),
					v = e(v, d, g, s, n[f + 8], 7, 1770035416), s = e(s, v, d, g, n[f + 9], 12, -1958414417),
					g = e(g, s, v, d, n[f + 10], 17, -42063), d = e(d, g, s, v, n[f + 11], 22, -1990404162),
					v = e(v, d, g, s, n[f + 12], 7, 1804603682), s = e(s, v, d, g, n[f + 13], 12, -40341101),
					g = e(g, s, v, d, n[f + 14], 17, -1502002290),
					v = u(v, d = e(d, g, s, v, n[f + 15], 22, 1236535329), g, s, n[f + 1], 5, -165796510),
					s = u(s, v, d, g, n[f + 6], 9, -1069501632), g = u(g, s, v, d, n[f + 11], 14, 643717713),
					d = u(d, g, s, v, n[f], 20, -373897302), v = u(v, d, g, s, n[f + 5], 5, -701558691),
					s = u(s, v, d, g, n[f + 10], 9, 38016083), g = u(g, s, v, d, n[f + 15], 14, -660478335),
					d = u(d, g, s, v, n[f + 4], 20, -405537848), v = u(v, d, g, s, n[f + 9], 5, 568446438),
					s = u(s, v, d, g, n[f + 14], 9, -1019803690), g = u(g, s, v, d, n[f + 3], 14, -187363961),
					d = u(d, g, s, v, n[f + 8], 20, 1163531501), v = u(v, d, g, s, n[f + 13], 5, -1444681467),
					s = u(s, v, d, g, n[f + 2], 9, -51403784), g = u(g, s, v, d, n[f + 7], 14, 1735328473),
					v = o(v, d = u(d, g, s, v, n[f + 12], 20, -1926607734), g, s, n[f + 5], 4, -378558),
					s = o(s, v, d, g, n[f + 8], 11, -2022574463), g = o(g, s, v, d, n[f + 11], 16, 1839030562),
					d = o(d, g, s, v, n[f + 14], 23, -35309556), v = o(v, d, g, s, n[f + 1], 4, -1530992060),
					s = o(s, v, d, g, n[f + 4], 11, 1272893353), g = o(g, s, v, d, n[f + 7], 16, -155497632),
					d = o(d, g, s, v, n[f + 10], 23, -1094730640), v = o(v, d, g, s, n[f + 13], 4, 681279174),
					s = o(s, v, d, g, n[f], 11, -358537222), g = o(g, s, v, d, n[f + 3], 16, -722521979),
					d = o(d, g, s, v, n[f + 6], 23, 76029189), v = o(v, d, g, s, n[f + 9], 4, -640364487),
					s = o(s, v, d, g, n[f + 12], 11, -421815835), g = o(g, s, v, d, n[f + 15], 16, 530742520),
					v = c(v, d = o(d, g, s, v, n[f + 2], 23, -995338651), g, s, n[f], 6, -198630844),
					s = c(s, v, d, g, n[f + 7], 10, 1126891415), g = c(g, s, v, d, n[f + 14], 15, -1416354905),
					d = c(d, g, s, v, n[f + 5], 21, -57434055), v = c(v, d, g, s, n[f + 12], 6, 1700485571),
					s = c(s, v, d, g, n[f + 3], 10, -1894986606), g = c(g, s, v, d, n[f + 10], 15, -1051523),
					d = c(d, g, s, v, n[f + 1], 21, -2054922799), v = c(v, d, g, s, n[f + 8], 6, 1873313359),
					s = c(s, v, d, g, n[f + 15], 10, -30611744), g = c(g, s, v, d, n[f + 6], 15, -1560198380),
					d = c(d, g, s, v, n[f + 13], 21, 1309151649), v = c(v, d, g, s, n[f + 4], 6, -145523070),
					s = c(s, v, d, g, n[f + 11], 10, -1120210379), g = c(g, s, v, d, n[f + 2], 15, 718787259),
					d = c(d, g, s, v, n[f + 9], 21, -343485551), v = r(v, i), d = r(d, a), g = r(g, h), s = r(s, l);
				return [v, d, g, s]
			} function i(n) {
				for (var r = 0, t = "", e = 32 * n.length; r < e; r += 8)
					t += String.fromCharCode(n[r >> 5] >>> r % 32 & 255);
				return t
			} function a(n) {
				var r, t = [];
				for (t[(n.length >> 2) - 1] = void 0, r = 0; r < t.length; r++) t[r] = 0;
				var e = 8 * n.length;
				for (r = 0; r < e; r += 8) t[r >> 5] |= (255 & n.charCodeAt(r / 8)) << r % 32;
				return t
			} function h(n) {
				var r, t, e = "0123456789abcdef", u = "";
				for (t = 0; t < n.length; t++)
					r = n.charCodeAt(t),
					u += e.charAt(r >>> 4 & 15) + e.charAt(15 & r);
				return u
			} function l(n) { return unescape(encodeURIComponent(n))
			} function v(n) { return function(n) { return i(f(a(n), 8 * n.length)) }(l(n))
			} function d(n, r) {
				return function(n, r) {
					var t, e, u = a(n), o = [], c = [];
					for (o[15] = c[15] = void 0, u.length > 16 && (u = f(u, 8 * n.length)), t = 0; t < 16; t++)
						o[t] = 909522486 ^ u[t], c[t] = 1549556828 ^ u[t];
					return e = f(o.concat(a(r)), 512 + 8 * r.length),
					i(f(c.concat(e), 640))
				}(l(n), l(r))
			} return function md5(n, r, t) {
				return r !== void 0 ?
					t !== void 0 ?
						d(r, n) :
						h( d(r, n) ) :
					t !== void 0 ?
						v(n) :
						h(v(n));
			}
		}, sizeof(obj) {
			if (obj == null) return 0;
			var length = len(obj);
			if (length != null) return length;
			if (obj?.constructor?.name === "Object") return len( Object.keys(obj) );
			return 0;
		}, enumerate(iterable) {
			if (!isIterable(iterable)) return [0, iterable];
			return arrzip( Object.keys(iterable).map(e => +e), iterable );
		}, help(str) {
			// eval doesn't matter here because this function is for developer use only.
			try { eval(str) }
			catch (err) {
				if (/SyntaxError: Unexpected token '.+'/.in(`${err}`)) {
					open(`https://developer.mozilla.org/en-US/search?q=${/'(.+)'/.exec(`${err}`)[1]}`, "_blank");
					return "Keyword";
				}
				if (`${err}` === "SyntaxError: Unexpected end of input") {
					open(`https://developer.mozilla.org/en-US/search?q=${str}`, "_blank");
					return "Keyword";
				}
			} try {
				var fn = eval(str);
				if (typeof fn === "function") {
					if (`${fn}`.incl(/\(\) { \[native code\] }/)) {
						open(`https://developer.mozilla.org/en-US/search?q=${str}()`, "_blank");
						return "native function. arguments can't be retrieved";
					}
					return `Function: arguments = ${getArguments(fn)}`;
				}
			} catch {}
			try { return "Variable: value = " + Function(`return ${str}`)() }
			catch { return "Variable not Found" }	
		}, findDayOfWeek(day=0, month=0, year=0, order="dd/mm/yyyy", str=!0){
			// dd-mm-yyyy makes more sense in the current context. 
			if (isNaN( day = Number(day) ) || !isFinite(day))
				throw TypeError(`argument 1 either isn't finite or isn't a number`);
			if (isNaN( month = Number(month) ) || !isFinite(month))
				throw TypeError(`argument 2 either isn't finite or isn't a number`);
			if (isNaN( year = Number(year) ) || !isFinite(year))
				throw TypeError(`argument 3 either isn't finite or isn't a number`);
			if (type(order) !== "string" ) throw TypeError(`argument 5 isn't a string`);
			if (order !== "dd/mm/yyyy") {
				order = order.lower().split(/\/|-/);
				const tmp = [day, month, year],
					used = [!1, !1, !1];
				for (var i = 0; i < 3; i++) {
					switch (order[i]) {
						case "dd":
							if (used[0]) throw Error("Invalid input for argument 5");
							[used[0], day] = [!0, tmp[i]];
							break;
						case "mm":
							if (used[1]) throw Error("Invalid input for argument 5");
							[used[1], month] = [!0, tmp[i]];
							break;
						case "yyyy":
							if (used[2]) throw Error("Invalid input for argument 5");
							[used[2], year] = [!0, tmp[i]];
							break;
						default: throw Error("Invalid input for argument 5");
					}
				}
			}
			day += !day - 1;
			month += !month - 1;
			const LEAP = !(year % 4);
			// 'days' is the number of days in the month
			// 'offset' is the offset from the beginning of the year to the beginning of the month in days
			const Months = [
				{ days: 31,        offset: 0   },
				{ days: 28 + LEAP, offset: 31  },
				{ days: 31, offset: 59  + LEAP },
				{ days: 30, offset: 90  + LEAP },
				{ days: 31, offset: 120 + LEAP },
				{ days: 30, offset: 151 + LEAP },
				{ days: 31, offset: 181 + LEAP },
				{ days: 31, offset: 212 + LEAP },
				{ days: 30, offset: 243 + LEAP },
				{ days: 31, offset: 273 + LEAP },
				{ days: 30, offset: 304 + LEAP },
				{ days: 31, offset: 334 + LEAP }
			];
			for (; day > Months[month % 12].days; month++)
				day -= Months[month % 12].days;
			let ans = (1 + (year += floor(month / 12) - 1) % 4 * 5 +
				year % 100 * 4 + year % 400 * 6 + day +
				Months[month % 12].offset
			) % 7;
			return str ?
				["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] [ans] :
				ans;
		}, simulateKeypress({
			key = "",
			code = "",
			ctrl = false,
			alt = false,
			shift = false,
			ctrlKey = undefined,
			altKey = undefined,
			shiftKey = undefined,
			type = "keypress",
			view = window,
			isTrusted = true,
			path = [],
			bubbles = true,
			cancelable = true,
			cancelBubble = false,
			which = null,
			charCode = null,
			composed = null,
			currentTarget = null,
			defaultPrevented = null,
			detail = null,
			eventPhase = null,
			isComposing = null,
			keyCode = null,
			location = null,
			metaKey = null,
			repeat = null,
			returnValue = null,
			sourceCapabilities = null,
			srcElement = null,
			target = null,
			timeStamp = null,
		}={}) {
			return document.body.dispatchEvent(
				new KeyboardEvent({
					isTrusted            : isTrusted // sets to false anyway
					, key                : key
					, code               : code
					, ctrlKey            : ctrlKey  === void 0 ? ctrl  : ctrlKey
					, altKey             : altKey   === void 0 ? alt   : altKey
					, shiftKey           : shiftKey === void 0 ? shift : shiftKey
					, view               : view
					, which              : which
					, bubbles            : bubbles
					, cancelBubble       : cancelBubble
					, cancelable         : cancelable
					, charCode           : charCode
					, composed           : composed
					, currentTarget      : currentTarget
					, defaultPrevented   : defaultPrevented
					, detail             : detail
					, eventPhase         : eventPhase
					, isComposing        : isComposing
					, keyCode            : keyCode
					, location           : location
					, metaKey            : metaKey
					, path               : path
					, repeat             : repeat
					, returnValue        : returnValue
					, sourceCapabilities : sourceCapabilities
					, srcElement         : srcElement
					, target             : target
					, timeStamp          : timeStamp
					, type               : type
				})
			);
		}, passwordGenerator(length=18, charsToRemove=void 0, chars=characters) {
			if (isNaN( length = Number(length)) || length < 0) return !1;
			length = int(length);
			if (type(charsToRemove, 1) === "arr") {
				if (charsToRemove.every( e => type(e) === "string" ))
					charsToRemove = charsToRemove.join("");
				else return !1;
			} else if (
				type(charsToRemove) !== "string" &&
				charsToRemove !== void 0 &&
				charsToRemove !== null
			) return !1;
			if (chars === characters && charsToRemove !== void 0 && charsToRemove !== null)
				for (const char in charsToRemove)
					chars = chars.remove(char);
			for (var i = length, password = ""; i --> 0 ;)
				password += chars.rand();
			return password;
		}, getAllDocumentObjects() {
			var objs = [document];
			document.doctype && objs.push(document.doctype);
			objs.union(document.all);
			return objs;
		}, dQuery(selector="*", {doctype=true, one=false, oneIndex=0}={}) {
			if (selector?.constructor?.name === "dQuery") return selector;
			if (type(selector) !== "string") throw TypeError("dQuery() requires a string or dQuery object for the first argument");
			try {
				var values = list(document.querySelectorAll(selector));
				doctype && document.doctype && values.unshift(document.doctype);
			} catch { throw Error(`Invalid selector (in single quotes): '${selector}'`) }
			return one ?
			values[oneIndex] :
			new (class dQuery extends Array {
				constructor(values, selector, previous) {
					values === void 0 ?
						super() :
						isIterable(values) ?
							super(...values) :
							super(values);
					if (values !== document) {
						this.previous = previous?.constructor?.name === "dQuery" ?
							previous :
							new dQuery(document);
					}
					selector !== void 0 && (this.selector = selector);
				}
			})(values, selector, void 0);
		}, css(text="", options={}, append=true) {
			options.innerHTML ??= text;
			options.type ??= "text/css";
			var element = createElement("style", options);
			if (append) document.head.appendChild(element);
			return element;
		}, stringifyMath(fn/*function or string*/, variable="x", defaultArgValue='"1.0"', precision=18) {
			// ^ means exponent now.
			if (type(variable) !== "string" || !len(variable)) return !1;
			defaultArgValue = String(defaultArgValue);
			var code = (type(fn) === "function" ? fn.code() : fn).remove(/^\s*return\s*/)
				.replace([/(\d*\.\d+|\d+\.\d*)/g, /\[/g, /\]/g], ['"$1"', "(", ")"]);
			while (!0) {
				// stringify non-stringified number literals
				let m = code.match(/(?<!")(\b(?<!\.)\d+(?!\.)\b)(?!")/);
				if (m === null) break;
				code = code.slc(0, m.index) + `"${m[0]}"` + code.slc(m.index + len(m[0]));
			}
			// replace things line 5x with (5 * x)
			code = `(${code.replace(RegExp(`(\\d+\\.?\\d*)${variable}`, "g"), `sMath.mul[$1,${variable}]`)})`;

			while (code.io("⌈") !== -1 || code.io("⌊") !== -1) {
				// find the cases for flooring, ceiling, and rounding, and parentheses errors
				let i = rMath.min([code.io("⌈"), code.io("⌊")].filter(e => e !== -1));
				let index = i + 1, count = 1;
				for (; count ; index++) {
					if (index === code.length) throw Error(`parentheses starting at ${i} not closed.`);
					if ( "(⌈⌊".incl(code[index]) ) count++;
					else if ( ")⌉⌋".incl(code[index]) ) count--;
				}
				index--;
				if (code[index] === ")") throw Error(`invalid parentheses set at ${i} through ${index}`);
				code = `${code.slc(0, i)}sMath.${
					code[i] === "⌈" ?
						code[index] === "⌉" ?
							"ceil" :
							"round" :
						code[index] === "⌋" ?
							"floor" :
							"round"
				}[(${code.slc(i + 1, index).strip()})]${code.slc(index + 1)}`;
			}
			while (code.io("(") !== -1) {
				for (var index = 0, i = 0, n = len(code), p = 0, highest = 0; i < n; i++) {
					// find the deepest parentheses
					if (code[i] === "(") p++; else
					if (code[i] === ")") p--;
					if (p > highest) highest = p, index = i;
				}
				var arr = code.slc(index, ")", 0, 1).replace(/([^\s()]+)/g, "($1)")
					.slc(1, -1).strip().split(/(?=\()/g).map(e => e.strip().slc(1, -1));
				if (len(arr) === 1) {
					code = code.replace(
						code.slc(index, ")", -1, 1).toRegex(),
						`[${arr}]`
					)
				}
				if (len(arr) > 3) {
					var i = rMath.min([ arr.io("**"), arr.io("^") ].filter(e => e !== -1));
					if (i === Infinity) {
						i = rMath.min([ arr.io("*"), arr.io("/"), arr.io("%"), arr.io("//") ].filter(e => e !== -1));
						if (i === Infinity) {
							i = rMath.min([ arr.io("+"), arr.io("-") ].filter(e => e !== -1));
							if (i === Infinity) throw Error("Invalid input. either operators are missing between values, or operator that is not supported was used, or something else, idk.");
						}
					}
					code = code.replace(
						code.slc(index + 1, ")").toRegex(),
						`${arr.slc(0, i-1).join(" ")} (${
							arr.slc(i - 1, i + 2).join(" ")
						}) ${arr.slc(i + 2).join(" ")}`.strip()
					);
					continue;
				}
				let tmp = `sMath.${sMath[arr[1]].name}[${arr[0]},${arr[2]}`;
				tmp.sW("sMath.div") && (tmp += `,"${precision}"`);
				code = code.replace(code.slc(index, ")", 0, 1).toRegex(), tmp + "]");
			}
			return Function(
				variable + " = " + defaultArgValue,
				`\treturn ${
					code.replace([/\[/g, /\]/g], ["(", ")"])
				};`.replace(/,/g, ", ")
			);
		}, *genzip(gen1, gen2) {
			// generator zip
			gen1 = toGenerator(gen1); gen2 = toGenerator(gen2);
			var a = gen1.next(), b = gen2.next();
			while (!a.done && !b.done) {
				let output = [a.value, b.value];
				yield output;
				a = gen1.next();
				b = gen2.next();
			}
		}, "call toGenerator"() {
			function *Generator() {
				if (isIterable(thing))
					for (const e of thing)
						yield e;
				else yield thing;
			} return function toGenerator(thing) {
				return thing?.constructor?.prototype?.[Symbol.toStringTag] === "Generator" ?
					thing :
					Generator(thing);
			}
		}, "fstrdiff"   : function firstStringDifferenceIndex(s1, s2) {
			// returns the index of the first difference in two strings.
			// returns NaN if either input is not a string.
			// it is considered a string if it is the built-in string or...
			// if input.__type__() returns "string"
			// returns -1 if there is no difference
			if (type(s1) !== "string" || type(s2) !== "string") return NaN;
			for (var i = 0, n = Math.min(len(s1), len(s2)) - 1 ; i < n; i++)
				if (s1[i] !== s2[i]) return i;
			return -1;
		}, "lstrdiff"   : function lastStringDifferenceIndex(s1, s2) {
			// returns the index of the last difference in two strings.
			// otherwise, same rules as fstrdiff(a, b)
			if (type(s1) !== "string" || type(s2) !== "string") return NaN;
			for (var i = Math.min(len(s1), len(s2)); i --> 0 ;)
				if (s1[i] !== s2[i]) return i;
			return -1;
		}, "constr"     : function constructorName(input, name=true) {
			if (input === null || input === void 0) return input; // document.all == null ????!!/? what!?!?
			return input?.constructor?.name;
		}, "dir"        : function currentDirectory(loc=new Error().stack) {
			// sometimes doesn't work
			return `${loc}`
				.slice(13)
				.remove(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g);
		}, "nsub"       : function substituteNInBigIntegers(num, n=1) {
			return typeof num === "bigint" ?
				n * Number(num) :
				num;
		}, "revLList"   : function reverseLinkedList(list) {
			for (let cur = list.head, prev = null, next; current ;) 
				[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
			list.head = prev || list.head;
			return list;
		}, "numToWords" : function numberToWords(number, fancyInfinity=true) {
			if (abs(number) === Infinity) return `${number<0?"negative ":""}${fancyInfinity?"apeirogintillion":"infinity"}`;
			// TODO: Update to use a loop or something to expand to as close to infinity as possible
			if (rMath.isNaN(number)) throw Error(`Expected a number, and found a(n) ${type(number)}`);
			var string = `${number}`.remove(/\.$/);
			number = Number(number);
			switch (!0) {
				case /\./.in(string):
					var decimals = `${numberToWords(string.substring(0, string.io(".")))} point`;
					for (var i = string.io(".") + 1; i < len(string); i++)
						decimals += ` ${numberToWords(string[i])}`;
					return decimals;
				case string < 0 || Object.is(Number(string), -0): return `negative ${numberToWords(string.slice(1))}`;
				case string ==  0: return "zero";
				case string ==  1: return "one";
				case string ==  2: return "two";
				case string ==  3: return "three";
				case string ==  4: return "four";
				case string ==  5: return "five";
				case string ==  6: return "six";
				case string ==  7: return "seven";
				case string ==  8: return "eight";
				case string ==  9: return "nine";
				case string == 10: return "ten";
				case string == 11: return "eleven";
				case string == 12: return "twelve";
				case string == 13: return "thirteen";
				case string == 15: return "fifteen";
				case string == 18: return "eighteen";
				case string  < 20: return `${numberToWords(string[1])}teen`;
				case string == 20: return "twenty";
				case string  < 30: return `twenty-${numberToWords(string[1])}`;
				case string == 30: return "thirty";
				case string  < 40: return `thirty-${numberToWords(string[1])}`;
				case string == 40: return "forty";
				case string  < 50: return `forty-${numberToWords(string[1])}`;
				case string == 50: return "fifty";
				case string  < 60: return `fifty-${numberToWords(string[1])}`;
				case string == 60: return "sixty";
				case string  < 70: return `sixty-${numberToWords(string[1])}`;
				case string == 70: return "seventy";
				case string  < 80: return `seventy-${numberToWords(string[1])}`;
				case string == 80: return "eighty";
				case string  < 90: return `eighty-${numberToWords(string[1])}`;
				case string == 90: return "ninety";
				case string < 100: return `ninety-${numberToWords(string[1])}`;
				case string % 100===0 && len(string)===3: return `${numberToWords(string[0])} hundred`;
				case string < 1e3: return `${numberToWords(string[0])} hundred and ${numberToWords(string.substr(1,2))}`;
				case string % 1e3===0 && len(string)===4: return `${numberToWords(string[0])} thousand`;
				case string < 1e4: return `${numberToWords(string[0])} thousand ${numberToWords(string.substr(1,3))}`;
				case string % 1e3===0 && len(string)===5: return `${numberToWords(string.substr(0,2))} thousand`;
				case string < 1e5: return`${numberToWords(string.substr(0,2))} thousand ${numberToWords(string.slice(2))}`;
				case string % 1e3===0 && len(string)===6: return `${numberToWords(string.substr(0,3))} thousand`;
				case string < 1e6: return`${numberToWords(string.substr(0,3))} thousand ${numberToWords(string.slice(3))}`;
				case string % 1e6===0 && len(string)===7: return `${numberToWords(string[0])} million`;
				case string < 1e7: return`${numberToWords(string[0])} million ${numberToWords(string.slice(1))}`;
				case string % 1e6===0 && len(string)===8: return `${numberToWords(string.substr(0,2))} million`;
				case string < 1e8: return `${numberToWords(string.substr(0,2))} million ${numberToWords(string.slice(2))}`;
				case string % 1e6===0 && len(string)===9: return `${numberToWords(string.substr(0,3))} million`;
				case string < 1e9: return `${numberToWords(string.substr(0,3))} million ${numberToWords(string.slice(3))}`;
				case string % 1e9===0 && len(string)===10: return `${numberToWords(string[0])} billion`;
				case string < 1e10: return `${numberToWords(string[0])} billion ${numberToWords(string.slice(1))}`;
				case string % 1e9===0 && len(string)===11: return `${numberToWords(string.substr(0,2))} billion`;
				case string < 1e11: return `${numberToWords(string.substr(0,2))} billion ${numberToWords(string.slice(2))}`;
				default: throw Error(`Invalid Number. The function Only works for {x:|x| < 1e11}\n\t\tinput: ${numToStrW_s(number)}`);
			}
		}, "Errors"     : function customErrors(name="Error", text="") {
			Error.prototype.name = `${name}`;
			throw new Error(text).stack.replace(/ {4}at(.|\s)*\n/, "");
		}, "minifyjson" : function minifyJSON(json) {
			// removes all the unnecessary spaces and things
			return formatjson(json, {
				objectNewline      : !0, // less conditionals are checked if this is set to true
				tab                : "",
				newline            : "",
				space              : "",
				arrayOneLine       : !1, // less conditionals
				arrayAlwaysOneLine : !1,
				arrayOneLineSpace  : "",
			})
		}, "defer_call MutableString"() {
			// TODO: Make safety things for the functions so the user doesn't add non-character things
			var MutStr = class MutableString extends Array {
				constructor() {
					super();
					this.pop(); // there shouldn't be anything, but indexes were off before, so idk.
					for (const e of arguments) {
						// type() and not typeof so mutable strings also work
						type(e) === "string" && this.union(e.split(""));
						if (isArr(e) && e.every(e => type(e) === "string"))
							this.union(e);
					}
				}
				__type__() { return "mutstr" }
				toString(arg="") { return this.join(arg) }
				valueOf(/*arguments*/) { return Array.prototype.valueOf.apply(this, arguments) }
				concat() { return Array.prototype.concat.apply(this, arguments) }
			};
			let protoArray = Object.getOwnPropertyNames(MutStr.prototype);

			for (const s of Object.getOwnPropertyNames(String.prototype))
				!protoArray.incl(s) && (MutStr.prototype[s] = String.prototype[s]);

			function MutableString(/*arguments*/) { return new MutStr(...arguments) }
			MutableString.fromCharCode = function fromCharCode(code) {
				return this (isArr(code) ? code.map(e => chr(e)) : chr(code));
			}
			return MutableString;
		}, "str"        : function String(a) { return a?.toString?.call?.( [].slice.call(arguments, 1) );
		}, async getIp()       { return (await fetch("https://api.ipify.org/")).text();
		}, complex(re=0, im=0) { return cMath.new(re, im);
		}, createElement : createElement
		, getArguments   : getArguments
		, bisectRight    : bisectRight
		, numToStrW_s    : numToStrW_s
		, isIterable     : isIterable
		, bisectLeft     : bisectLeft
		, numStrNorm     : numStrNorm
		, formatjson     : formatjson
		, strToObj       : strToObj
		, randint        : randint
		, strMul         : strMul
		, bisect         : bisect
		, arrzip         : arrzip
		, qsort          : qsort
		, msort          : msort
		, round          : round
		, floor          : floor
		, fpart          : fpart
		, isArr          : isArr
		, range          : range
		, type           : type
		, ceil           : ceil
		, dict           : dict
		, json           : json
		, list           : list
		, rand           : rand
		, copy           : copy
		, abs            : abs
		, sgn            : sgn
		, int            : int
		, dim            : dim
		, len            : len
		, chr            : chr
		, ord            : ord
		, Ω              : Ω
		, π              : π
		, ϕ              : ϕ
		, α              : α
		, γ              : γ
		, 𝑒              : 𝑒
		, 𝜏              : 𝜏
		, "local base62Numbers": base62Numbers
		, "local LibSettings": LibSettings
		, "local characters": characters
		, "local alphabetL": alphabetL
		, "local alphabetU": alphabetU
		, "local alphabet": alphabet
		, "local numbers": numbers
		, "local π_2": π_2
		, "local π_3": π_3
		, "local π2_3": π2_3
		, "local π_4": π_4
		, "local π3_4": π3_4
		, "local π5_4": π5_4
		, "local π7_4": π7_4
		, "local π_5": π_5
		, "local π_6": π_6
		, "local π5_6": π5_6
		, "local π7_6": π7_6
		, "local π11_6": π11_6
		, "local π_7": π_7
		, "local π_8": π_8
		, "local π_9": π_9
		, "local π_10": π_10
		, "local π_11": π_11
		, "local π_12": π_12
		, "local pi": pi
		, "local tau": 𝜏
		, "local e": 𝑒
		, "local phi": ϕ
		, "local foia": α
		, "local emc": γ
		, "local omega": Ω
		, "local define": define
		, "MathObjects": MathObjects
		, "object Object": {
			copy : copy,
			keyof: keyof
		}, "prototype Object": {
			tofar: function toFlatArray() {
				// TODO: Fix for 'Arguments' objects and HTML elements
				var val = this;
				if (
					["number", "string", "symbol", "boolean", "bigint", "function"].incl(type(val)) ||
					val == null ||
					val?.constructor?.name === 'Object'
				)
					return [this].flatten();
				return list(this).flatten();
			},
		}, "prototype RegExp": {
			in: RegExp.prototype.test
			, all(str="") {
				var a = `${this}`;
				return RegExp(`^(${a.substr(1, len(a) - 2)})$`, "").in(str);
			}, toRegex() { return this;
			},
		}, "prototype Array": {
			append: Array.prototype.push
			, io: Array.prototype.indexOf
			, rev: Array.prototype.reverse
			, lio: Array.prototype.lastIndexOf
			, incl: Array.prototype.includes
			, last: lastElement
			, any: (function create_any() {
				var _some = Array.prototype.some;
				return function any(callback=e=>e, thisArg=void 0) { return _some.call(this, callback, thisArg) }
			})(), "overwrite some": function some(fn) {
				// "some" implies that it has to be plural. use any for any. some != any
				var num = 0;
				for (var i = len(this); i --> 0 ;) {
					num += !!fn(this);
					if (num > 1) return !0;
				}
				return !1;
			}, for: function forEachReturn(f=(e, i, a)=>e, ret) {
				// don't change order from ltr to rtl
				for (var a = this, i = 0, n = len(a); i < n ;)
					f(a[i], i++, a);
				return ret;
			}, shift2(num=1) {
				while ( num --> 0 ) this.shift();
				return this;
			}, union(array) {
				["NodeList", "HTMLAllCollection", "HTMLCollection"].incl(array?.constructor?.name) &&
					(array = list(array));
				for (var arr = this.concat(array), i = len(arr); i --> 0 ;)
					this[i] = arr[i];
				return this;
			}// TODO: Add Array.prototype.fconcat. basically a mixture between concat and unshift
			// TODO: Add Array.prototype.funion. basically a mixture between union and unshift
			, pop2(num=1) {
				while ( num --> 0 ) Array.prototype.pop.call(this);
				return this;
			}, splice2(a, b, ...c) {
				var d = this;
				d.splice(a, b);
				return c.flatten().for((e, i) => d.splice(a + i, 0, e), d);
			}, push2(e, ...i) {
				// TODO: Finish implementing pushing multiple values for other methods
				let a = this, j, n;
				i = i.tofar();
				if (e === void 0) {
					for (j = 0, n = len(i); j < n; j++)
						if (typeof i[j] === "number") a.push(a[i[j]]);
				}
				else {
					if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.push(void 0);
					else a.push(e);
					for (j = 0, n = len(i); j < n; j++)
						a.push(i[j]);
				}
				return a;
			}, unshift2(e, ...i) {
				let a = this, j, n;
				i = i.tofar();
				if (e === void 0) {
					for (j = 0, n = len(i); j < n; j++)
						if (typeof i[j] === "number")
							a.unshift(a[i[j]]);
				} else {
					if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.unshift(void 0);
					else a.unshift(e);
					for (j = 0, n = len(i); j < n; j++)
						a.unshift(i[j]);
				}
				return a;
			}, toLList: function toLinkedList() {
				if (window.LinkedList == null) throw Error("window.LinkedList == null");
				let a = new window.LinkedList();
				for (const e of this.rev()) a.insertFirst(e);
				return a;
			}, toGen: function* toGenerator() {
				for (const e of this)
					yield e;
			}, remove(e) {
				this.incl(e) && this.splice(this.io(e), 1);
				return this;
			}, removeAll(e) {
				while (this.incl(e)) this.splice(this.io(e), 1);
				return this;
			}, hasDupes: function hasDuplicates() {
				for (var a = copy(this), i = len(a); i --> 0 ;)
					if (a.incl(a.pop())) return !0;
				return !1;
			}, mod: function modify(indexes, func) {
				indexes = indexes.tofar();
				let a = this, n = len(indexes);
				if (type(func, 1) === "arr") func = func.flatten();
				else func = [].len(n).fill(func);
				func = func.extend(len(indexes) - len(func), e => e);

				for (var i = 0; i < n; i++)
					a[indexes[i]] = func[i](a[indexes[i]], indexes[i]);
				return a;
			}, remrep: function removeRepeats() {
				return list(new Set(this));
				// probably changes the order of the array
			}, random() { return this[ randint(0, dim(this)) ];
			}, rand: "\\previous"
			, insrand: function insertRandomLocation(thing) {
				this.splice(randint(len(this)), 0, thing);
				return this;
			}, insrands: function insertThingsRandomLocation(...things) {
				for (const thing of things) this.insrand(thing);
				return this;
			}, insSorted: function insertSorted(thing) {
				return this.splice2(
					this.bisectLeft(thing),
					0,
					thing
				);
			}, insertSorted: "\\previous"
			, insSorteds: function insertThingsSorted(...things) {
				for (let thing of things)
					this.insSorted(thing);
				return this;
			}, slc: function slice(start=0, end=Infinity, startOffset=0, endOffset=0, includeEnd=false) {
				// last index = end - 1
				end < 0 && (end += len(this));
				end += endOffset + includeEnd;
				for (var a = this, b = [], i = start + startOffset, n = rMath.min(len(a), end); i < n; i++)
					b.push( a[i] );
				return b;
			}, print(print=console.log) {
				print(this);
				return this;
			}, printEach(print=console.log) {
				for (const e of this) print(e);
				return this;
			}, printStr(joiner=",", log=console.log) {
				log(this.map(e => String(e)).join(joiner))
				return this;
			}, swap(i1=0, i2=1) {
				const A = this, B = A[i1];
				A[i1] = A[i2];
				A[i2] = B;
				return A;
			}, smap: function setMap(f=(e, i)=>e) {
				// array.smap also counts empty indexes as existing unlike array.map.
				for (var arr = this, i = len(arr); i --> 0 ;)
					arr[i] = f(arr[i], i, arr);
				return arr;
			}, sfilter: function setFilter(f=(e, i)=>e) {
				for (var i = len(this); i --> 0 ;) !f(this[i]) && this.splice(i, 1);
				return this;
			}, mapf: function mapThenFilter(f1=(e, i, a)=>e, f2=(e, i, a)=>e) { return this.map(f1).filter(f2);
			}, fmap: function filterThenMap(f1=(e, i, a)=>e, f2=(e, i, a)=>e) { return this.filter(f1).map(f2);
			}, fsmap: function filterThenMap(f1=(e, i, a)=>e, f2=(e, i, a)=>e) { return this.sfilter(f1).smap(f2);
			}, smapf: function setMapThenFilter(f1=(e, i, a)=>e, f2=(e, i, a)=>e) { return this.smap(f1).sfilter(f2);
			}, rotr3: function rotate3itemsRight(i1=0, i2=1, i3=2) {
				const A = this, TMP = A[i1];
				A[i1] = A[i3];
				A[i3] = A[i2];
				A[i2] = TMP;
				return A;
			}, dupf: function duplicateFromFirst(num=1, newindex=0) { return this.dup(num, 0, newindex);
			}, duptf: function duplicateToFirst(num=1, index=0) { return this.dup(num, index, 0);
			}, dupl: function duplicateFromLast(num=1, newindex=0) { return this.dup(num, dim(this), newindex);
			}, duptl: function duplicateToLast(num=1, index=0) { return this.dup(num, index, dim(this));
			}, dup: function duplicate(num=1, from=null, newindex=Infinity) {
				// by default duplicates the last element in the array
				var a = this;
				for (var b = a[from === null ? dim(a) : from], j = 0; j++ < num ;)
					a.splice(newindex, 0, b);
				return a;
			}, rotr: function rotateRight(num=1) {
				for (num %= len(this); num --> 0 ;)
					this.unshift(this.pop());
				return this;
			}, rotl: function rotateRight(num=1) {
				for (num %= len(this); num --> 0 ;)
					this.push(this.shift());
				return this;
			}, rotl3: function rotate3itemsLeft(i1=0, i2=1, i3=2) {
				var a = this, b = a[i1];
				a[i1] = a[i2];
				a[i2] = a[i3];
				a[i3] = b;
				return a;
			}, len: function setLength(num) {
				this.length = isIterable(num) ?
					len(num) :
					isNaN(num = Number(num)) ?
						NaN :
						rMath.max(num, 0)
				return this;
			}, extend: function extend(length, filler, form="new") {
				if (form === "new") return this.concat(Array(length).fill(filler));
				else if (form === "total") {
					if (length <= len(this)) return this;
					else return this.concat(Array(length).fill(filler));
				}
				/*else */return a;
			}, sW: function startsWith(item) { return this[0] === item;
			}, startsW: "\\previous"
			, sW: "\\previous"
			, endsWith(item) { return this.last() === item }
			, eW: "\\previous"
			, endsW: "previous"
			, flatten() { return this.flat(Infinity);
			}, "overwrite sort": (function create_sort() {
				const _sort = Array.prototype.sort;
				return function sort(update=true) {
					return Array.prototype.any.call(this, e => typeof e !== "bigint" && typeof e !== "number") ?
						_sort.call(this) :
						update ?
							qsort(this) : // quick-sort, O(n^2), Ω(nlogn)
							msort(this); // merge-sort, Ө(nlogn)
				}
			})(), shuffle(times=1) {
				var arr = this;
				for (var i = times; i --> 0 ;)
					for (var j = 0, n = len(arr), arr2 = []; j < n; j++)
						// arr2.splice(round(rand() * len(arr2)), 0, arr.pop());
						arr2.splice(randint(len(arr2)), 0, arr.pop());
				return arr2;
			}, isNaN(strict=false) {
				const fn = (strict ? window : rMath).isNaN;
				for (const val of list(this))
					if (fn(val)) return !0;
				return !1;
			}, clear() {
				this.length = 0;
				return this;
			}, getDupes() {
				for (var arr = copy(this), dupes = [], i = len(arr), val; i --> 0 ;)
					arr.incl(val = arr.pop()) && dupes.push([i, val]);
				return len(dupes) ? dupes : null;
			}, bisectLeft: function bisectLeftArray(x, low=0, high=null) { return bisectLeft(this, x, low, high);
			}, bisectRight: function bisectRightArray(x, low=0, high=null) { return bisectRight(this, x, low, high);
			}, bisect: function bisectArray(x, orientation="left", low=0, high=null) { return bisect(this, x, orientation, low, high);
			},
		}, "prototype NodeList": { last: lastElement
		}, "prototype HTMLCollection": { last: lastElement
		}, "prototype HTMLAllCollection": { last: lastElement
		}, "prototype Function": {
			args: function getArguments() { return window.getArguments(this);
			}, code() {
				var s = this + "";
				if (s.sW("class")) return false;
				else if (s.sW("function")) {
					s = s.slc("(", void 0, 1);
					for (var parenCount = 1, i = 0, n = len(s); parenCount && i < n; i++) {
						if (s[i] === "(") parenCount++; else
						if (s[i] === ")") parenCount--;
					}
					while ( /^\s$/.in(s[i]) ) i++;
					return s.substring(i + 1, dim(s));
				} else if (s[0] === "(") { // arrow function with perens around arguments
					s = s.slice(1);
					for (var parenCount = 1, i = 0, n = len(s); parenCount && i < n; i++) {
						if (s[i] === "(") parenCount++; else
						if (s[i] === ")") parenCount--;
					}
					while ( /^\s$/.in(s[i]) ) i++;
					i += 2;
					while ( /^\s$/.in(s[i]) ) i++;
					return s[i] === "{" ?
						s.substring(i + 1, dim(s)) :
						s.slice(i);
				} else { // arrow function without perens around arguments
					s = s.remove(/^\w+\s*=>\s*/);
					return s[0] === "{" ?
						s.substring(1, dim(s)) :
						s;
				}
			}, isArrow: function isArrowFunction() {
				var s = this + "";
				return !s.sW("function") && !s.sW("class");
			}, isClass() { return (this + "").sW("class");
			}, isRegular: function isRegularFunction() { return (this + "").sW("function");
			}
		}, "prototype String": {
			io        : String.prototype.indexOf
			, lio     : String.prototype.lastIndexOf
			, strip   : String.prototype.trim
			, lstrip  : String.prototype.trimLeft
			, rstrip  : String.prototype.trimRight
			, startsW : String.prototype.startsWith
			, sW      : "\\previous"
			, endsW   : String.prototype.endsWith
			, eW      : "\\previous"
			, last    : lastElement
			, "overwrite replace" : (function create_replace() {
				const _replace = String.prototype.replace;
				return function replace(search, replacer) {
					!isArr(search) && (search = [search]);
					!isArr(replacer) && (replacer = [replacer]);
					var output = this;
					for (let [a, b] of arrzip(search, replacer))
						output = _replace.call(output, a, b);
					return output;
				}
			})(), startsLike(strOrArr="", position=0) { // TODO: Finish
				if (!["str", "mutstr", "arr"].incl(type(strOrArr, 1))) return !1;
				if (type(strOrArr) === "string") {

				}
			}, startsL: "\\previous"
			, sL      : "\\previous"
			, shuffle(times=1) { return this.split("").shuffle(times).join("");
			}, ios: function indexesOf(chars="") {
				return type(chars) === "string" ?
					Object.keys(this).filter( i => chars?.incl?.(this[i]) ).map(s => +s) :
					[];
			}, slc(
				start = 0,
				end = Infinity,
				startOffset = 0,
				endOffset = 0,
				substr = false,
				includeEnd = false,
				outOfBoundsStringEndInfinity = false
			) {
				// last index = end - 1
				if (type(start) === "string") {
					start = this.io(String(start));
					if (start < 0) start = 0;
				}
				if (type(end) === "string") {
					end = this.io(String(end));
					if (end < 0) end = outOfBoundsStringEndInfinity ? Infinity : 0;
				}
				return list(this).slc(
					start,
					end,
					startOffset,
					endOffset,
					includeEnd
				).join("");
			}, tag(tagName) {
				if (!tagName || type(tagName) !== "string") return this;
				return `<${tagName}>${this}</${tagName}>`;
			}, rand: function random() { return Array.prototype.rand.call(this);
			}, upper(length=Infinity, start=0, end=-1) {
				return !isFinite(Number(length)) || isNaN(length) ? this.toUpperCase() :
				end === -1 ?
					this.substr(0, start) +
						this.substr(start, length).toUpperCase() +
						this.substr(start + length) :
					this.substr(0, start) +
						this.substring(start, end).toUpperCase() +
						this.substr(end);
			}, lower(length=Infinity, start=0, end=-1) {
				return !isFinite(Number(length)) || isNaN(length) ? this.toLowerCase() :
				end === -1 ?
					this.substr(0, start) +
						this.substr(start, length).toLowerCase() +
						this.substr(start + length) :
					this.substr(0, start) +
						this.substring(start, end).toLowerCase() +
						this.substr(end);
			}, toObj(obj=window) { return strToObj(this, obj);
			}, hasDupesA: function hasDuplicatesAll() { return /(.|\n)\1/.in( this.split("").sort().join("") );
			}, hasDupesL: function hasDuplicateLetters() { return /(\w)\1/.in( this.split("").sort().join("") );
			}, reverse() { return this.split("").reverse().join("");
			}, remove(arg) { return this.replace(arg, "");
			}, remrep: function removeRepeats() {
				// this also sorts the string. *shrugs*, whatever idc
				return list( new Set(this) ).join("");
			}, each: function putArgBetweenEachCharacter(arg="") { return list(this).join(`${arg}`);
			}, toFunc: function toNamedFunction(name="anonymous") {
				var s = this.valueOf();
				if (s.sW("Symbol(") && s.eW(")")) throw Error("Can't parse Symbol().");
				s = (""+s).remove(/^(\s*function\s*\w*\s*\(\s*)/);
				var args = s.slc(0, ")");
				return (
					(fn, name) => (Function(
						`return function(call){return function ${name}() { return call (this, arguments) }}`
					)())(Function.apply.bind(fn))
				)(Function(args, s.replace(
					RegExp(`^(${(z=>{
						for (var i=len(z), g=""; i --> 0 ;) g += (/[$^()+*|[\]{}?.]/.in(z[i]) && "\\") + z[i];
						return g;
				})(args)}\\)\\s*\\{)`,"g"), "").remove(/\s*;*\s*}\s*;*\s*/)), name);
			}, toFun: function toNamelessFunction() {
				var f = () => Function(this).call(this)
				return () => f();
			}, toRegex: function toRegularExpression(f="", form="escaped") {
				if (form === "escaped" || form === "escape" || form === "e")
					for (var i = 0, b = "", l = len(this); i < l; i++)
						b += /[$^()+*\\|[\]{}?.]/.in(this[i]) ?
							`\\${this[i]}` :
							this[i];
				else return RegExp(this, f);
				return RegExp(b, f);
			}, toNumber() { return +this;
			}, toNum: "\\previous"
			, toBigInt() {
				try { return BigInt(this) }
				catch { throw TypeError(`Cannot convert input to BigInt. input: '${this}'`) }
			}, pop2() { return this.substr(0, dim(this));
			}, unescape() {
				return this.split("").map(
					e => e === "\n" ? "\\n" : e === "\0" ? "\\0" : e === "\t" ? "\\t" : e === "\f" ? "\\f" :
						e === "\r" ? "\\r" : e === "\v" ? "\\v" : e === "\b" ? "\\b" : e === "\\" ? "\\\\" :
							ord(e) < 127 && ord(e) > 31 ? e :
								ord(e) < 32 ?
									(s => "\\x" + strMul("0", 2 - len(s)) + s)(ord(e).toString(16)) :
									(s => "\\u" + strMul("0", 4 - len(s)) + s)(ord(e).toString(16))
				).join("");
			}, incl: function includes(input) { return input.toRegex().in(this);
			}, start(start="") { return this || `${start}`;// if the string is empty it returns the argument
			}, begin(text="") { return `${text}${this}`; // basically Array.unshift2 for strings
			}, splitn: function splitNTimes(input, times=1, joinUsingInput=true, customJoiner="") {
				var joiner = joinUsingInput ? input : customJoiner;
				if (type(input, 1) !== "regex" && type(input) !== "string")
					throw Error("function requires a regular expression or a string");
				for (var i = 0, arr = this.split(input), arr2 = [], n = len(arr); i < n && i++ < times ;)
					arr2.push(arr.shift());
				if (len(arr)) arr2.push(arr.join(joiner));
				return arr2;
			}, inRange(n1, n2=arguments[0], include=true) {
				return isNaN(this) ?
					!1 :
					(+this).inRange(n1, n2, include);
			}, isInteger() {
				var a = this;
				if ( isNaN(a) ) return !1;
				if (a.io(".") === -1) return !0;
				a = a.slc(".");
				for (var i = len(a); i --> 1 ;)
					if (a[i] !== "0") return !1;
				return !0;
			}, isInt: "\\previous"
			, exists() { return this !== "";
			}, line(index=Infinity) {
				if (rMath.isNaN(index)) return false;
				for (var line = 1, i = 0; i < this.length; this[i] === "\n" && line++, i++)
					if (i === index) return line;
				return line;
			},
		}, "prototype Number": {
			bitLength() { return len(str(abs(this), 2));
			}, isPrime() {// can probably be optimized
				var n = int(this);
				if (this !== n) return !1;
				if (n === 2) return !0;
				if (n < 2 || !(n % 2)) return !1;
				for (var i = 3, a = n / 3; i <= a; i += 2)
					if (!(n % i)) return !1;
				return !0;
			}, inRange(n1, n2=arguments[0], include=true) {
				return include ?
					this >= n1 && this <= n2 :
					this > n1 && this < n2;
			}, shl(num) { return this << Number(num);
			}, shr(num) { return this >> Number(num);
			}, shr2(num) { return this >>> Number(num);
			}, isInteger() { return this === int(this);
			}, isInt: "\\previous"
			, add(arg) { return this + Number(arg);
			}, sub(arg) { return this - Number(arg);
			}, mul(arg) { return this * Number(arg);
			}, div(arg) { return this / Number(arg);
			}, mod(arg) { return this % Number(arg);
			}, pow(arg) { return this ** Number(arg);
			},
		}, "prototype BigInt": {
			isPrime() {
				var n = this.valueOf();
				if (n === 2n) return !0;
				if (n < 2n || !(n % 2n)) return !1;
				for (var i = 3n, a = n / 3n; i <= a; i += 2n)
					if (!(n % i)) return !1;
				return !0;
			}, inRange(n1, n2=arguments[0], include=true) {
				n2 == null && (n2 = n1);
				return include ?
					this >= n1 && this <= n2 :
					this > n1 && this < n2;
			}, toExponential(maxDigits=16, form=String) {
				var a = `${this}`;
				maxDigits < 0 && (maxDigits = 0);
				var decimal = maxDigits && len(a) > 1 && +a.slc(1) ? "." : "",
					rest = a.substr(1, maxDigits);
				rest = +rest ? rest : "";
				if (["string", "str", "s", String].incl(form?.lower?.() || form))
					return `${a[0]}${decimal}${rest}e+${dim(a)}`.replace(".e", "e");
				else if (["number", "num", "n", Number].incl(form?.lower?.() || form))
					return +`${a[0]}.${a.substr(1, 50)}e+${dim(a)}`;
				else throw Error`Invalid second argument to BigInt.prototype.toExponential`;
			}, shl(num) { return this << BigInt(num);
			}, shr(num) { return this >> BigInt(num);
			}, add(arg) { return this + BigInt(arg);
			}, sub(arg) { return this - BigInt(arg);
			}, mul(arg) { return this * BigInt(arg);
			}, div(arg) { return this / BigInt(arg);
			}, mod(arg) { return this % BigInt(arg);
			}, pow(arg) { return this ** BigInt(arg);
			}, length(n=0) { return dim(`${this}`, n);
			}, isInteger() { return true}
			, isInt: "\\previous"
		}, "instance Logic": class Logic {
			constructor(
				bitwise = LibSettings.Logic_BitWise_Argument,
				comparatives = LibSettings.Logic_Comparatives_Argument,
				help = LibSettings.Logic_Help_Argument
			) {
				bitwise === "default" && (bitwise = "bit");
				comparatives === "default" && (comparatives = null);
				help === "default" && (help = "help");

				if (bitwise != null) {
					// TODO: Add the other logic gates to bitwise
					this[bitwise] = {
						shr: (a, b) => a >> b,
						shr2: (a, b) => a >>> b,
						shl: (a, b) => a << b,
						not: (...a) => len(a = a.flatten()) == 1 ? ~a[0] : a.map(b => ~b),
						and: function and(...a) {
							return type(a[0], 1) !== "arr" ?
								this.xor(a, len(a)) :
								this.xor(a[0], len(a[0]));
						},
						nand: (a, b) => null,
						or: function or(a, b) { return this.xor([a, b], [1, 2]) },
						nor: function nor(...b) { return this.xor(b, [0]) },
						xor: (ns, range=[1]) => {
							if (isNaN( (ns = ns.tofar()).join("") )) throw TypeError("numbers req. for 1st parameter");
							if (isNaN( (range = range.tofar()).join("") )) throw TypeError("numbers req. for 2nd parameter");
							// fix range
							const min = rMath.min(range), max = rMath.max(range);
							range = [
								min < 0 ? 0 : int(min),
								max > len(ns) - 1 ? len(ns) - 1 : int(max)
							];
							ns = ns.map(b => b.toString(2));
							const maxlen = rMath.max( ns.map(b => len(b)) );
							// normalize the string lengths
							ns.for((e, i) => {
								while (len(e) < maxlen)
									e = `0${e}`;
								ns[i] = e;
							});
							// get the totals per bit, and store into 'bits'
							for (var str_i = 0, arr_i = 0, bits = "", total, output = "";
								str_i < maxlen;
								str_i++, bits += total
							) {
								for (arr_i = 0, total = 0; arr_i < len(ns); arr_i++)
									total += ns[arr_i][str_i] == 1;
							}

							// get the true or false per bit ans stor into 'output'
							for (str_i = 0; str_i < len(bits); str_i++)
								output += (Number(bits[str_i])).inRange(range[0], range[1]) ? 1 : 0;

							return Number(`0b${output}`);
						},

						nxor: function xnor(a, b) {
							return this.not(// TODO: Figure out what this is supposed to be for

							);
						},
						imply: null,
						nimply: null,
					}
				}
				if (comparatives != null) {
					this[comparatives] = {
						gt: (a, b) => a > b,
						lt: (a, b) => a < b,
						get: (a, b) => a >= b,
						let: (a, b) => a <= b,
						leq: (a, b) => a == b,
						seq: (a, b) => a === b,
						lneq: (a, b) => a != b,
						sneq: (a, b) => a !== b,
					}
				}
				if (help != null) {
					// TODO: finish Logic help text
					this[help] = {
						not: "Logical NOT gate. takes any amount of arguments either directly or in an array. if there is only 1 argument, it returns !arg, otherwise it returns an array, where each element is not of the corresponding argument.",
						and: "Takes any number of arguments either directly or in an array. returns true if all of the arguments coerce to true. Logical AND gate",
						nand: "Takes any number of arguments either directly or in an array. returns true as long as not all the arguments coerce to true",
						or: "takes any amount of arguments either directly or in an array. returns true if any of the arguments coerce to true. Logical OR gate",
						nor: "Takes any amount of arguments either directly or in an array. returns true if all the inputs are false. Logical NOR gate",
						xor: "Takes any amount of arguments either directly or in an array.  returns true if half of the arguments coerce to true. Logical XOR gate.",
						xor2: "Takes any amount of arguments either directly or in an array.  returns true if an odd number of the arguments coerce to true. Logical XOR gate.",
						nxor: "Takes any amount of arguments either directly or in an array. returns false if half of the arguments coerce to true, otherwise it returns true. Boolean Algebra 'if and only if'. Logical XNOR gate.",
						nxor2: "Takes any amount of arguments either directly or in an array. returns false if an odd number of the inputs coerce to false, otherwise it returns true. Boolean Algebra 'if and only if'. Logical XNOR gate.",
						iff: "Takes 2 arguments. returns true if both arguments coerce to the same boolean value, otherwise it returns false. ",
						if: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra if. Logical IMPLY gate.",
						imply: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra if. Logical IMPLY gate.",
						nimply: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra '-->/'. Logical NIMPLY gate.",
						xnor: "returns false",
						is: "Takes any number of arguments. returns true if all the inputs are exactly equal to the first argument, although, objects can be different objects with the same values",
						isnt: "Takes any number of arguments. returns true as long as any of the arguments is different from any other",
						near: "Takes 3 paramaters.  1: fist number.  2: second number.  3?: range.  returns true if the numbers are in the range of eachother. the default range is ±3e-16, which should be enough to account for rounding errors. the same as python's math.isclose() function but with a different default range.",
						bitwise: {
							xor: "adds up the numbers in the first array bitwise, and returns 1 for bits in range of, or equal to the second array, returns zero for the others, and returns the answer in base 10. xor([a,b])==a^b.",
							not:    "if there is one argument, returns ~argument.  if there is more than 1 argument, returns an array. example: Logic.bit.not(4,5,-1) returns [~4,~5,~-1]",
							nil:    "if all of the inputs are zero for a given bit, it outputs one. Inverse &.",
							and:    "a & b",
							or:     "a | b",
							left:   "a << b",
							right:  "a >> b",
							right2: "a >>> b",
						},
						equality: {
							gt: "greater than (>)",
							get: "greater than or equal to (>=)",
							lt: "less than (<)",
							let: "less than or equal to (<=)",
							leq: "loose equality (==)",
							seq: "strict equality (===)",
							lneq: "loose non-equality (!=)",
							sneq: "strict non-equality (!==)"
						}
					}
				}
			} not(...a) {// NOT gate
				// +---+-----+
				// | p | ¬ p |
				// +---+-----+
				// | T |  F  |
				// | F |  T  |
				// +---+-----+
				return len(a) === 1 ? !a[0] : a.map(b=>!b);
			} and(...a) {// AND gate
				// +---+---+-------+
				// | p | q | p ∧ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!len(a = a.flatten())) return !1;
				for (var i = len(a); i --> 0 ;)
					if (!a[i]) return !1;
				return !0;
			} nand(...a) {// not (p and q)
				// +---+---+-------+
				// | p | q | p ⊼ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.and(a);
			} or(...a) {// OR gate
				// +---+---+-------+
				// | p | q | p ∨ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!len(a = a.flatten())) return !1;
				for (var i = len(a); i --> 0 ;)
					if (!!a[i]) return !0;
				return !1;
			} nor(...a) {// not (p or q)
				// +---+---+-------+
				// | p | q | p ⊽ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.or(a);
			} xor(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!len(a = a.flatten())) return !1;
				return len(a.filter(b => b)) === len(a) / 2
			} xor2(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!len(a = a.flatten())) return !1;
				return len(a.filter(b => b)) === len(a) % 2 > 0
			} nxor(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				// should be nxor because it is not xor and not exclusive nor
				return !this.xor(a);
			} nxor2(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				// should be nxor because it is not xor and not exclusive nor
				return !this.xor2(a);
			} iff(...a) {// boolean algebra name for 'if and only if' (↔, <-->); not(p xor q)
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				return !this.xor(a);
			} if(a, b) {// boolean algebra name for 'IMPLY gate'.
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return this.imply(a, b);
			} imply(a, b) {// IMPLY gate; P --> Q
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return a ? !!b : !0;
			} nimply(a, b) {// not (P --> Q)
				// +---+---+---------+
				// | p | q | p ->/ q |
				// +---+---+---------+
				// | T | T |    F    |
				// | T | F |    T    |
				// | F | T |    F    |
				// | F | F |    F    |
				// +---+---+---------+
				return !this.if(a, b);
			} xnor() {// exclusive-nor but what it does what it says it does
				// for xnor to return true:
				// the inputs have to both be false, hence the 'nor' part.
				// the inputs have to both be different, hence the 'exclusive' part.
				// +---+---+-------------+---------+
				// | p | q | p nor q (r) | excls r |
				// +---+---+-------------+---------+
				// | T | T |    False    |  False  |
				// | T | F |    False    |  False  |
				// | F | T |    False    |  False  |
				// | F | F |    True     |  False  |
				// +---+---+-------------+---------+
				return !1;
			} is(...a) {// Object.is() but more than 2 inputs
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = len(a); i --> 0 ;)
					if (a[i] !== a[0]) return !1;
				return !0;
			} isnt(...a) {// returns true if any item is different from any other item
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = len(a); i --> 1 ;) {
					const tmp = a.pop();
					if ( len(a.filter(b => Object.is(b, tmp))) )
						return !1;
				}
				return !0;
			} near(n1, n2, range=Number.EPSILON) {// same as python math.isclose() with different default range
				return n1 > n2 - range && n1 < n2 + range ?
					!0 :
					!1;
			}
		}, "defer_instance bMath": class BigIntRealMath {
			constructor(
				help = LibSettings.bMath_Help_Argument,
				degTrig = LibSettings.bMath_DegTrig_Argument,
				comparatives = LibSettings.bMath_Comparatives_Argument
			) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				comparatives === "default" && (comparatives = !0);

				if (help) this.help = {
				}; if (degTrig) this.deg = {
				}; if (comparatives) this.eq = {
				};
			} pow(x, y) {
				return this.isNaN(x) || this.isNaN(y) ?
					NaN :
					y < 0 ? 1n / x ** -y : x ** y;
			} isNaN(x)  { return typeof x !== "bigint" }
			sgn(x)    { return x < 0 ? -1n : x === 0n ? 0n : 1n }
			sign(x)   { return x < 0 ? -1n : x === 0n ? 0n : 1n }
			abs(x)    { return x * this.sgn(x) }
			add(a, b) { return a + b }
			sub(a, b) { return a - b }
			mul(a, b) { return a * b }
			div(a, b) { return a / b }
		}, "defer_instance sMath": class stringRealMath {
			constructor(
				help = LibSettings.sMath_Help_Argument,
				degTrig = LibSettings.sMath_DegTrig_Argument,
				comparatives = LibSettings.sMath_Comparatives_Argument
			) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				comparatives === "default" && (comparatives = !0);
				this.zero = "0.0"; // cannonical format for 0.
				this.one = "1.0"; // cannonical format for 1.
				if (help) this.help = {
					add: "Takes 2 string number arguments (a and b). returns a + b as a string with maximum precision and no floating point errors",
					sub: "Takes 2 string number arguments (a and b). returns a - b as a string with maximum precision and no floating point errors",
					mul: "Takes 2 string number arguments (a and b). returns a * b as a string with maximum precision and no floating point errors",
					mul10: "Takes 2 arguments. 1: string number (n).  2: integer (x).  returns n * 10^x as a string more efficiently than mul(n, 10) would. see mul, div10",
					div: "Takes 3 arguments. (string number or number, string number or number, precision). division",
					fdiv: "Takes 2 string number arguments. returns the floored division of the two numbers faster than flooring the result of div() would. see div, div10. basically just Python's '//' operator. the argument order is numerator then denominator.",
					div10: "Takes 2 arguments. 1: string number (n).  2: integer (x).  returns n / 10^x as a string more efficiently than div(n, 10) would. see div, fdiv, mul10",
					idiv: "Takes 3 arguments. the same as div() but only for integers. should be faster, and doesn't check for invalid inputs",
					mod: "Takes 3 arguments. 2 string number arguments and 1 positive integer argument for the precision of tge division. modulo operator.",
					ipow: "2 string number arguments. power but only for integer powers",
					ifact: "1 string number argument. integer factorial",
					neg: "Takes 1 string number argument. negates the input",
					sgn: "1 string number argument. returns the sign of the input. sgn(0) = 0.  see sign, abs, neg",
					sign: "1 string number argument. returns the sign of the input. sgn(0) = 0. see sgn, abs, neg",
					ssgn: "Takes 1 argument. returns the sign as a string. see sgn, sign, ssign",
					ssign: "Takes 1 argument. returns the sign as a string. see sgn, sign, ssgn",
					abs: "1 string number argument. returns the absolute value of the input.",
					fpart: "Takes 1 string number argument. returns the fractional part of the input as a string. the output is always positive.",
					ipart: "takes 1 string number argument. returns the truncated version. same as Math.trunc, but for strings. rounds towards zero. see trunc, floor, ceil, round",
					square: "Takes 1 string number argument. squares the argument and returns it.",
					cube: "Takes 1 string number argument. cubes the argument and returns it.",
					tesseract: "Takes 1 string number argument. raises it the the fourth power and returns it.",
					norm: "Takes 1 string number argument. calls window.numStrNorm(argument). normalizes the number, ie: remove leading zeros, remove trailing decimal zeros.",
					decr: "Takes 1 string number argument (x). returns x - 1 as a string, more efficiently (I think), than sub(x, 1) would. see incr, sub",
					incr: "Takes 1 string number argument (x). as of aug 4, 2022, this function just calls add(x, 1). see decr, add",
					isNaN: "Takes 1 string number argument. returns true, if it is NOT a number, and false if it is a number. the cases that it will return false in are if it has characters outside of the decimal numerals (and period), it has multiple periods, or it is't a string all together",
					isInt: "Takes 1 string number argument. returns whether or not the input is an integer. It does not assume the argument is normalized.",
					isIntN: "Takes 1 string number argument. returns whether or not the input is an integer. It assumes the argument is correct and normalized as per sMath.norm or window.numStrNorm (they're the same function). In this case it is faster to use this function than the regular isInt",
					isFloat: "Takes 1 string number argument. returns whether or not the input has non-zero decimal places. It does not assume the argument is normalized.",
					isFloatN: "Takes 1 string number argument. returns whether or not the input has non-zero decimal places. It assumes the argument is correct and normalized as per sMath.norm or window.numStrNorm (they're the same function). In this case it is faster to use this function than the regular isFloat",
					min: "Takes any amount of string number arguments. the arguments can be passed in via an array or directly. the minimum value will be returned. if no arguments are given, the default return value is 0, or more specificly, \"0.0\". see sMath.zero, max",
					max: "Takes any amount of string number arguments. the arguments can be passed in via an array or directly. the maximum value will be returned. if no arguments are given, the default return value is 0, or more specificly, \"0.0\". see sMath.zero, min",
					_lmgf: "This function is used internally to act as both gcf/gcd and lcm in one function. Takes 1 named argument for either lcm or gcf/gcd. the rest of the arguments should be string numbers that are normalized with either sMath.norm or window.numStrNorm.",
					floor: "Takes 1 string number argument. returns the floored version of it. (round towards negative infinity)",
					ceil: "Takes 1 string number argument. returns the ceilinged version of it. (round towards positive infinity)",
					round: "Takes 1 string number argument. returns number rounded to the nearest integer.",
					trunc: "takes 1 string number argument. returns the truncated version. same as Math.trunc, but for strings. rounds towards zero. see ipart, floor, ceil, round",
					new: "Takes 1 numerical argument. returns the input in the canonical string form. It also works if the input isn't a number. In this case, it just returns (input+\"\")",
					lcm: null,
					gcf: null,
					gcd: null,
					eq: {
						gt: "Takes 2 string number arguments (a, b). returns a > b",
						ge: "Takes 2 string number arguments (a, b). returns a ≥ b",
						lt: "Takes 2 string number arguments (a, b). returns a < b",
						le: "Takes 2 string number arguments (a, b). returns a ≤ b",
						eq: "Takes 2 string number arguments (a, b). returns a == b",
						ne: "Takes 2 string number arguments (a, b). returns a ≠ b",
						ez: "Takes 1 string number argument (x). returns x == 0. using this function is more efficient than using the two argumented counterpart.",
						nz: "Takes 1 string number argument (x). returns x ≠ 0. using this function is more efficient than using the two argumented counterpart.",
						ng: "Takes 1 string number argument (x). returns x < 0. negative. using this function is more efficient than using the two argumented counterpart.",
						nn: "Takes 1 string number argument (x). returns x ≥ 0. not negative. using this function is more efficient than using the two argumented counterpart.",
						ps: "Takes 1 string number argument (x). returns x > 0. positive. using this function is more efficient than using the two argumented counterpart.",
						np: "Takes 1 string number argument (x). returns x ≤ 0. not positive. using this function is more efficient than using the two argumented counterpart.",
					},
				}; if (degTrig) this.deg = {
				}; if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") {// >
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.slice(1); b = b.slice(1);
							if (this.eq(a, b)) return !1;
							return !this.gt(a, b);
						}
						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						} for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) > Number(b[i])) return !0;
							if (Number(a[i]) < Number(b[i])) return !1;
						}
						return !1;
					}, ge(a="0.0", b="0.0") {// >=
						return this.gt(a, b) || this.eq(a, b);
					}, lt(a="0.0", b="0.0") {// <
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.slice(1); b = b.slice(1);
							if (this.eq(a, b)) return !1;
							return !this.lt(a, b);
						}

						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						} for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						} if ( a.io(".") - a_index < b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) < Number(b[i])) return !0;
							if (Number(a[i]) > Number(b[i])) return !1;
						}
						return !1;
					}, le(a="0.0", b="0.0") {/* <= */ return this.lt(a, b) || this.eq(a, b) },
					eq(a="0.0", b="0.0") { // strict equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0)
							return this.eq( a.slice(1), b.slice(1) );

						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						} for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						}
						if ( a.io(".") - a_index !== b.io(".") - b_index ) return !1;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) !== Number(b[i])) return !1;
						}
						return !0;
					}, ne(a="0.0", b="0.0") {// strict not equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0)
							return this.ne( a.slice(1), b.slice(1) );


						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						} for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) !== Number(b[i])) return !0;
						}
						return !1;
					}, ez(snum="0.0") {
						// x == 0
						for (var i = 0, n = len(snum); i < n; i++)
							if (snum[i] !== "0" && snum[i] !== ".") return !1;
						return !0;
					}, nz(snum="0.0") {
						// x != 0
						for (var i = 0, n = len(snum); i < n; i++)
							if (snum[i] !== "0" && snum[i] !== ".") return !0;
						return !1;
					}, ng(snum="0.0") { /*x < 0*/ return snum[0] === "-" },
					nn(snum="0.0") { /*x >= 0*/ return snum[0] !== "-" },
					ps(snum="0.0") { /*x > 0*/ return snum[0] !== "-" && this.nz(snum) },
					np(snum="0.0") { /*x <= 0*/ return snum[0] === "-" || this.ez(snum) },
				};
			} add(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a+"" ); b = this.norm( b+"" );
				if (a.startsW("-") && b.startsW("-"))
					return this.neg( this.add(a.slice(1), b.slice(1)) );
				if (a.sW("-")  && !b.sW("-")) return this.sub(b, a.slice(1));
				if (!a.sW("-") &&  b.sW("-")) return this.sub(a, b.slice(1));
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b.slc(".")) - len(a.slc(".")));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a.slc(".")) - len(b.slc(".")));
				a = a.split("."); b = b.split(".");

				let c = [
					[ a[0], b[0] ],
					[ a[1], b[1] ],
				].map(
					e => e.map( f => f.split("") )
				).map(
					o => o[0].map( (e, i) => Number(e) + Number(o[1][i]) )
				);
				for (var i = 2; i --> 0 ;) {
					for (var j = len(c[i]), tmp; j --> 0 ;) {
						tmp = floor( c[i][j] / 10 );
						c[i][j] -= 10*tmp;
						if (tmp) {
							if (j) c[i][j-1] += tmp;
							else i === 1 ? c[0][dim(c[0])] += tmp : c[i].unshift(tmp);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".").remove(/\.0+$/);
				return this.norm( c.incl(".") ? c : `${c}.0` );
			} sub(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a+"" ); b = this.norm( b+"" );
				if (!a.sW("-") && b.sW("-")) return this.add(a, b.slice(1));
				if (a.sW("-") && b.sW("-")) return this.sub(b.slice(1), a);
				if (a.sW("-") && !b.sW("-"))
					return this.neg( this.add(a.slice(1), b) );
				if (this.eq.gt(b, a)) return this.neg( this.sub(b, a) );
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b.slc(".")) - len(a.slc(".")));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a.slc(".")) - len(b.slc(".")));
				a = a.split("."); b = b.split(".");

				let c = [
					[ a[0], b[0] ],
					[ a[1], b[1] ],
				].map(
					e => e.map( f => f.split("") )
				).map(
					o => o[0].map( (e, i) => Number(e) - Number(o[1][i]) )
				), neg = c[0][0] < 0;
				for (var i = 2, j, tmp; i --> 0 ;) { // c[1] then c[0]
					for (j = len( c[i] ) ; j --> 0 ;) { // for each element in c[i]
						tmp = rMath.abs( floor(c[i][j] / 10) );
						while (c[i][j] < 0) {
							i + j && (c[i][j] += 10);
							if (j) c[i][j-1] -= tmp;
							else if (i === 1) c[0][dim(c[0])] -= tmp;
							else throw Error(`Broken. End value shouldn't be negative.`);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".");
				return this.norm( c.incl(".") ? c : `${c}.0` );
			} mul(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a+"" ); b = this.norm( b+"" );
				const sign = this.sgn(a) === this.sgn(b) ? 1 : -1;
				a = this.abs(a); b = this.abs(b);
				if (this.eq.ez(a) || this.eq.ez(b)) return "0.0";

				a = a.remove(/\.?0+$/g); b = b.remove(/\.?0+$/g);
				var dec = 0;
				a.io(".") > 0 && (dec += dim(a) - a.io("."));
				b.io(".") > 0 && (dec += dim(b) - b.io("."));
				a = a.remove("."); b = b.remove(".");
				for (var i = len(b), arr = [], carryover, tmp, str, j; i --> 0 ;) {
					for (j = len(a), str = "", carryover = 0; j --> 0 ;) {
						tmp = multable[ b[i] ][ a[j] ] + carryover + "";
						carryover = dim(tmp) ? Number(tmp[0]) : 0;
						tmp = Number(tmp[dim(tmp)]);
						str = tmp + str;
						!j && carryover && (str = carryover + str);
					}
					arr.push(str);
				}
				for (var i = len(arr); i --> 0 ;) arr[i] += strMul("0", i);
				for (var total = "0.0", i = len(arr); i --> 0 ;)
					total = this.add(arr[i], total).remove(/\.0+$/);
				total = (total.substr(0, len(total) - dec) + "." + total.slice(len(total) - dec)).replace(/\.$/, ".0");
				return sign === -1 ? this.neg( total ) : total;
			} mul10(snum="0.0", x=1) {
				if (rMath.isNaN(snum)) return NaN;
				if (isNaN( x = int(Number(x)) )) return NaN;
				if (!x) return snum;
				if (x < 0) return this.div10(snum, -x);
				snum = this.norm( snum+"" );
				let i = snum.io("."),
					tmp = snum.slc(0, i) + snum.slc(i + 1, i + x + 1),
					output = tmp + strMul("0", i + x - len(tmp)) + "." + snum.slc(i+x+1);
				return this.norm(output + (output.last() === "." ? "0" : ""));
			} div(num="0.0", denom="1.0", precision=18) {
				// NOTE: Will probably break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				isNaN(precision = Number(precision)) && (precision = 18);
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				if ( this.eq.ez(denom) )
					return this.eq.ez(num) ?
						NaN :
						Infinity;
				if ( this.eq.ez(num) ) return "0.0";
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(len(this.fpart(num)), len(this.fpart(denom))) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);
				// return this.idiv(num, denom); // extra checks for the same cases.
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (!precision) return `${ansString}.0`;
				var remainder = this.mul10( this.sub(num, this.mul(ans, denom)) );
				if (this.eq.nz(remainder)) ansString += ".";
				for (var i = 0, j; this.eq.nz(remainder) && i++ < precision ;) {
					for (j = 9; this.eq.ng(this.sub(remainder, table[j])) ;) j--;
					remainder = this.mul10( this.sub(remainder, table[j]) );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sgn === -1 ? `-${ansString}` : ansString;
			} fdiv(num="0.0", denom="1.0") {
				// floor division
				// NOTE: Will probably break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				if ( this.eq.ez(denom) )
					return this.eq.ez(num) ?
						NaN :
						Infinity;
				if ( this.eq.ez(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(len(this.fpart(num)), len(this.fpart(denom))) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);

				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				return `${sign === -1 && this.mul10( this.sub(num, this.mul(ans, denom)) ) ?
					-++ans :
					ans
				}.0`;
			} div10(snum="0.0", x=1) {
				if (rMath.isNaN(snum)) return NaN;
				if (isNaN( x = int(Number(x)) )) return NaN;
				if (!x) return snum;
				if (x < 0) return this.mul10(snum, -x);
				snum = this.norm( snum+"" );
				var i = snum.io("."),
					tmp = snum.slc(0, i - x),
					output = tmp + "." + strMul("0", len(tmp) + x - i) + snum.slc(i - x, i) + snum.slc(i + 1);
				return this.norm((output[0] == "." ? "0" : "") + output);
			} idiv(num="0.0", denom="1.0", precision=18) {
				// assumes correct input. (sNumber, sNumber, Positive-Integer)
				if ( this.eq.ez(denom) )
					return this.eq.ez(num) ?
						NaN :
						Infinity;
				if ( this.eq.ez(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision < 1) return `${ansString}.0`;
				var remainder = this.mul10( this.sub(num, this.mul(ans, denom)) );
				if (this.eq.nz(remainder)) ansString += ".";
				for (var i = 0, j; this.eq.nz(remainder) && i++ < precision ;) {
					for (j = 9; this.eq.ng(this.sub(remainder, table[j])) ;) j--;
					remainder = this.mul10( this.sub(remainder, table[j]) );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sign === -1 ? `-${ansString}` : ansString;
			} mod(a="0.0", b="0.0") {
				return this.sub(
					a, this.mul( b, this.fdiv(a, b) )
				)
			} ipow(a="0.0", b="1.0") {
				a = this.norm( a+"" ); b = this.norm( b+"" );
				if ( this.eq.nz(this.fpart(b)) ) throw Error("no decimals allowed for exponent.");
				var t = "1.0";
				if (this.sgn(b) >= 0) for (; b > 0; b = this.decr(b)) t = this.mul(t, a);
				else for (; b < 0; b = this.add(b, 1)) t = this.div(t, a);
				return t;
			} ifact(n="0.0") {
				if ( this.eq.nz(this.fpart(n)) ) throw Error("no decimals allowed.");
				for (var i = n+"", total = "1.0"; i > 0; i = this.decr(i))
					total = this.mul(i, total);
				return this.ipart(total);
			} neg(snum="0.0") {
				// negate
				return snum[0] === "-" ?
					snum.slice(1) :
					`-${snum}`;
			} sgn(snum="0.0") {
				// string sign. sMath.sgn("-0") => -1
				return snum[0] === "-" ?
					-1 :
					/0+\.?0*/.all(snum) ?
						0 :
						1;
			} sign(snum="0.0") {
				return this.sgn(snum);
			} ssgn(snum="0.0") {
				// string sign. sMath.ssgn("-0") => "-1.0"
				return snum[0] === "-" ?
					"-1.0" :
					/0+\.?0*/.all(snum) ?
						"0.0" :
						"1.0";
			} ssign(snum="0.0") {
				return this.ssgn(snum);
			} abs(snum="0.0") {
				return snum[0] === "-" ?
					snum.slice(1) :
					snum;
			} fpart(n="0.0") {
				n = this.norm(n);
				return isNaN(n) ?
					NaN :
					fpart(n, !1);
			} ipart(n="0.0") {
				n = this.norm(n);
				return n.slc(
					0, "."
				) + ".0";
			} square(n="0.0") {
				return this.mul(
					n, n
				);
			} cube(n="0.0") {
				return this.mul(
					this.square(n),
					n
				);
			} tesseract(n="0.0") {
				return this.square(
					this.square(n)
				);
			} norm/*alize*/(snum="0.0") {
				return numStrNorm(
					snum
				);
			} decr(snum="1.0") {
				// probably faster than sMath.sub(x, 1) because there is less array manipulation
				// the drawback is there is more string manipulation, which is probably slower.
				if ("0-.".incl(snum[0])) return this.sub(snum, "1.0");
				var i1 = snum.io("."), i2;
				if (i1 < 0) throw Error("sMath.decrp's argument had no '.'");
				for (i2 = i1; snum[--i1] === "0" ;);
				snum = snum.slc(0, i1) + (Number(snum[i1])-1) + snum.slc(i1+1);
				for (; ++i1 < i2 ;)
					snum = snum.slc(0, i1) + "9" + snum.slc(i1+1);
				return snum;
			} incr(snum="0.0") {
				return this.add(snum, "1.0");
				// return x + 1
			} isNaN(snum="0.0") {
				if (type(snum) !== "string") return !0;
				for (var i = 0, n = len(snum), period = !1; i < n; i++) {
					if (snum[i] === ".") {
						if (period) return !0;
						period = !0;
					} else if ( !"0123456789".incl(snum[i]) ) return !0;
				}
				return !1;
			} isInt(snum="0.0") {
				if (type(snum) !== "string") return false;
				var i = snum.io(".");
				if (i === -1 || i === dim(snum)) return true;
				for (var n = len(snum); ++i < n ;)
					if (snum[i] !== "0") return false;
				return true;
			} isIntN(snum="0.0") {
				return snum.at(-2) +
					snum.at(-1) === ".0";
			} isFloat(snum="0.0") {
				// not actually a float, but floats have decimals and it checks for decimals, so whatever
				if (type(snum) !== "string") return false;
				var i = snum.io(".");
				if (i === -1 || i === dim(snum)) return false;
				for (var n = len(snum); ++i < n ;)
					if (snum[i] !== "0") return true;
				return false;
			} isFloatN(snum="0.0") {
				return snum.at(-2) +
					snum.at(-1) !== ".0";
			} min(...snums) {
				if (!len(snums)) return "0.0";
				snums = snums.flatten();
				for (var min = snums[0], i = len(snums); i --> 1 ;)
					if (this.eq.lt(snums[i], min))
						min = snums[i];
				return min;
			} max(...snums) {
				if (!len(snums)) return "0.0";
				var snums = snums.flatten();
				for (var max = snums[0], i = len(snums); i --> 1 ;)
					if (this.eq.gt(snums[i], max))
						max = snums[i];
				return max;
			} _lmgf(t="lcm", ...ns) {
				// throw Error("not implemented");
				// least commond multiple and greatest common factor
				// the arguments should be correctly formatted, or it will not always work
				ns = ns.flatten();
				["l", "lcm", "g", "gcf", "gcd"].incl(t) || (t = "lcm");
				if (t[0] === "g") {
					for (const e of ns)
						if (this.isFloatN(e))
							return "1.0";
				} else if (t[0] === "l") {
					for (const e of ns) {
						if (this.isFloatN(e))
							return ns.reduce((t, e) => this.mul(t, e), "1.0");
					}
				} else throw Error("invalid first argument for sMath.lmgf");
				for (var
					i = t[0] === "l" ? this.max(ns) : this.min(ns),
					c
					; true ;
					i = t[0] === "l" ? this.incr(i) : this.decr(i)
				) {
					for (var j = len(ns); j --> 0 ;) {
						if (this.eq.nz(t[0] === "l" ? this.mod(i, ns[j]) : this.mod(ns[j], i))) {
							c = false;
							break;
						}
						c = true;
					}
					if (c) return i;
				}
			} floor(snum="0.0") {
				snum = this.norm(snum);
				var ans = this.ipart(snum);
				snum[0] === "-" && this.isFloat(snum) && (ans = this.decr(ans));
				return ans;
			} ceil(snum="0.0") {
				snum = this.norm(snum);
				var ans = this.ipart(snum);
				this.eq.ps(snum) && this.isFloat(snum) && (ans = this.add(ans, 1));
				return ans;
			} round(snum="0.0") {
				snum = this.norm(snum);
				return this.eq.lt(this.fpart(snum), "0.5") ?
					this.ipart(snum) :
					this.add(this.ipart(snum), this.sgn(snum)+"")
			} trunc(snum="0.0") {
				return this.ipart(
					snum
				);
			} new(number=1, defaultValue=NaN) {
				return typeof number === "bigint" ?
					number + ".0" :
					typeof number === "number" ?
						number === Number.parseInt(number) ?
							number + ".0" :
							this.norm(number + "") :
						typeof number === "string" ?
							this.isNaN(number) ?
								defaultValue :
								this.norm(number) :
							defaultValue;
			} snum(number=1) { return this.new(number);
			} lcm(...snums) { return this._lmgf("lcm", ...snums);
			} gcd(...snums) { return this._lmgf("gcd", ...snums);
			} gcf(...snums) { return this._lmgf("gcf", ...snums);
			}
		}, "defer_instance rMath": class RealMath {
			constructor(
				degTrig = LibSettings.rMath_DegTrig_Argument,
				help = LibSettings.rMath_Help_Argument,
				comparatives = LibSettings.rMath_Comparatives_Argument,
				constants = LibSettings.rMath_Constants_Argument,
			) {
				degTrig === "default" && (degTrig = !0);
				help         === "default" && (help = !0);
				comparatives === "default" && (comparatives = !0);
				constants    === "default" && (constants = !0);
				this.Set = class RealSet {
					// Probably not constant time lookup.
					constructor(...args) {
						args = args.flatten().filter(e => typeof e === "number").sort();
						for (let x of args) Array.prototype.push.call(this, x);
						this.length ??= 0;
					} add(number=0) {
						if (typeof number !== "number") return this;
						!this.has(number) && Array.prototype.push.call(this, number);
						return this;
					} delete(number=0) { return Array.prototype.remove.call(this, number);
					} has(number=0) { return Array.prototype.incl.call(this, number);
					} cumsum() {
						var sum = 0;
						for (const x of this) sum += x;
						return sum;
					} __type__() { return "set";
					} sortA() { return qsort(this);
					} sortD() { return this.sortA().reverse();
					} reverse() { return Array.prototype.reverse.call(this); // also changes the object
					} sort(type="A") { try { return this[`sort${type[0].upper()}`] } catch { return !1 }
					} union(set, New=true) {
						if (type(set, 1) !== "set") return this;
						if (New) {
							let output = new this.constructor;
							for (var i = len(this); i --> 0 ;) this.output(this[i]);
							for (var i = len(set); i --> 0 ;) this.output(set[i]);
								return output;
						} else for (var i = len(set); i --> 0 ;) this.add(set[i]);
						return this;
					} intersection(set, New=true) {
						if (type(set, 1) !== "set") return this;
						throw Error("Not Implemented");
					} difference(set, New=true) {
						if (type(set, 1) !== "set") return this;
						throw Error("Not Implemented");
					} isSuperset(set, New=true) {
						if (type(set, 1) !== "set") return !0;
						throw Error("Not Implemented");
					} isSubset(set, New=true) {
						if (type(set, 1) !== "set") return !1;
						throw Error("Not Implemented");
					}
				};
				Set.prototype["⋃"] = Set.prototype.union;
				Set.prototype["⋂"] = Set.prototype.intersection;
				this.phi = this.ϕ = ϕ; this.e  = this.E  = this.𝑒 = 𝑒;
				this.ec  = this.γ = γ; this.pi = this.PI = π;
				this.tau = this.𝜏 = 𝜏;
				this.Phi      = -.6180339887498949  ; this.sqrt3    = 1.7320508075688772 ;
				this.omega    = 0.5671432904097838  ; this.LN2      = 0.6931471805599453 ;
				this.ln2      = .69314718055994531  ; this.LN10     = 2.3025850929940450 ;
				this.ln10     = 2.3025850929940456  ; this.LOG2E    = 1.4426950408889634 ;
				this.log2e    = 1.4426950408889634  ; this.LOG10E   = 0.4342944819032518 ;
				this.loge     = .43429448190325183  ; this.SQRT1_2  = 0.7071067811865476 ;
				this.sqrt1_2  = .70710678118654752  ; this.SQRT2    = 1.4142135623730951 ;
				this.sqrt2    = 1.4142135623730951  ; this.logpi10  = 2.0114658675880609 ;
				this.sqrt5    = 2.2360679774997894  ; this.logtaupi = .62285443720447269 ;
				this.dtor     = .017453292519943295 ; this.rtod     = 57.29577951308232  ;
				this.π_2 = π_2; // Math.π_2 == Math.π/2 but faster
				this.Math = Math;
				/*
					G = 6.67m³/(10¹¹ kg s²)
					∑∏Δ×∙÷±∓∀∃∄∤⌈⌉⌊⌋⋯〈〉√∛∜≤≥≠≈≋≍≔≟≡≢≶≷⋚⋛⁽°⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁾∞
					∫∬∭⨌∮∯∰∱∲∳⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚⨛⨜⌀∠∡⦜∢⦝⦞⦟⟂∟∥∦△□▭▱○◊⋄
					→↛⇒⇔⇋⇏⊕⊝∧⋀∨⋁⋂⋃¬∴∵∶∷∼⊨⊽⊻⊯⊮⊭⊬⊫⊪⋎⋏
					ℵƒ∂𝜕ℶℕℝℚℙℤℍℂ∅∁∈∉∋∌∖∩∪⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋⊍⊎⋐⋑⋒⋓⋔⋲⋳⋴⋵⋶⋷⋹⋺⋻⋼⋽⋾
				*/// TODO: Update rMath.help
				if (help) this.help = {
					null: "If a value is null or missing, then you should just directly check what the function does.",
					undefined: "If a value is undefined, It means that it was added and not comleted, then removed, but it is planned to be re-implemented at a later date.",
					trig: { // TODO: update trig
						sin: "1 argument. returns sin(angle), using the taylor series definition of sin. (radians)",
						cos: "1 argument. returns cos(angle), using the taylor series definition of cos. (radians)",
						tan: "1 argument. returns sin(angle) / cos(angle) (radians)",
						csc: "1 argument. returns 1 / sin(angle) (radians)",
						sec: "1 argument. returns 1 / cos(angle) (radians)",
						cot: "1 argument. returns 1 / tan(angle (radians)",
						asin: "1 argument. returns asin(argument) using the taylor series definition of arcsin. (radians)",
						acos: "1 argument. returns π/2 - arcsine(argument) (radians)",
						atan: "returns the original Math.atan(argument) because the taylor function was too inaccurate.",
						atan2: "Takes 2 numeric arguments (x, and y) and 1 boolean argument, and returns atan2(x, y) in radians. If the third argument is true, the arguments of the function will be reversed, being atan2(y, x) instead, but this argument is defaulted to false. see 'https://bit.ly/3j5X03W' or 'https://bit.ly/3DzmCQq' for a better explanation.",
						acsc: "1 argument. returns asin(1/arg) (radians)",
						asec: "1 argument. returns acos(1/arg) (radians)",
						acot: "1 argument. if the argument == 0, returns π/2.  if the argument is less than zero, returns π + arctangent(1/argument). otherwise, returns atan(1/argument).  (radians)",
						excst: "1 argument. returns √( exsec^2(x) +  cot^2(x) ) in radians",
						exset: "1 argument. returns √( exsec^2(x) +  tan^2(x) ) in radians",
						vcs: "1 argument. returns √( vercosin^2(x) +  sin^2(x) ) in radians",
						cvs: "1 argument. returns √( 1 +  sin^2(x) ) in radians",
						acvs: "1 argument. returns asin( x^2 - 1 ) with an input in radians",
						ccvs: "1 argument. returns √( 1 +  cos^2(x) ) in radians",
						accvs: "1 argument. returns acos( x^2 - 1 ) with an input in radians",
						crd: "1 argument. returns sin(x/2) in radians",
						acrd: "1 argument. returns 2asin(x/2) with an input in radians",
						ccrd: "1 argument. returns cos(x/2) in radians",
						accrd: "1 argument. returns π/2 - acrdx in radians",
						exsec: "1 argument. returns secx - 1 in radians",
						aexsec: "1 argument. returns asec(x + 1) with an input in radians",
						excsc: "1 argument. returns cscx - 1 in radians",
						aexcsc: "1 argument. returns acsc(x + 1) with an input in radians",
						vers: "1 argument. returns 1 - cosx in radians",
						avers: "1 argument. returns acos(x + 1) with an input in radians",
						verc: "1 argument. returns 1 + cosx in radians",
						averc: "1 argument. returns acos(x - 1) with an input in radians",
						cvers: "1 argument. returns 1 - sinx in radians",
						acvers: "1 argument. returns asin(1 - x) with an input in radians",
						cverc: "1 argument. returns 1 + sinx in radians",
						acverc: "1 argument. returns asin(x - 1) with an input in radians",
						hav: "1 argument. returns versx / 2 in radians",
						ahav: "1 argument. returns acos(1 - 2x) with an input in radians",
						hverc: "1 argument. returns vercx / 2 in radians",
						ahverc: "1 argument. returns acos(2x - 1) with an input in radians",
						hcvers: "1 argument. returns cversx / 2 in radians",
						ahcvers: "1 argument. returns asin(1 - 2x) in radians",
						hcverc: "1 argument. returns cversx / 2 in radians",
						ahcverc: "1 argument. returns asin(2x - 1) with an input in radians",
						sinh: "1 argument. returns sinh(angle) using the taylor series definition of sinh.",
						cosh: "1 argument. returns cosh(angle) using the taylor series definition of cosh",
						tanh: "1 argument. returns sinh(angle) / cosh(angle)",
						csch: "1 argument. returns 1 / sinh(angle)",
						sech: "1 argument. returns 1 / cosh(angle)",
						coth: "1 argument. returns 1 / tanh(angle)",
						asinh: "1 argument. returns ln(x + √(x**2 + 1))",
						acosh: "1 argument. returns ln(x + √(x**2 - 1))",
						atanh: "the same as the original Math.atanh.",
						acsch: "1 argument. returns asinh(1/arg)",
						asech: "1 argument. returns acosh(1/arg)",
						acoth: "1 argument. returns atanh(1/arg)",
						excsth: "1 argument. returns √( exsech^2(x) +  coth^2(x) )",
						exseth: "1 argument. returns √( exsech^2(x) +  tanh^2(x) )",
						vcsh: "1 argument. returns √( vercosinh^2(x) +  sinh^2(x) )",
						cvsh: "1 argument. returns √( 1 +  sinh^2(x) )",
						acvsh: "1 argument. returns asinh( x^2 - 1 )",
						ccvsh: "1 argument. returns √( 1 +  cosh^2(x) )",
						accvsh: "1 argument. returns acosh( x^2 - 1 )",
						crdh: "1 argument. returns sinh(x/2)",
						acrdh: "1 argument. returns 2asinh(x/2)",
						ccrdh: "1 argument. returns cosh(x/2)",
						accrdh: "1 argument. returns π/2 - acrdhx",
						exsech: "1 argument. returns sechx - 1",
						aexsech: "1 argument. returns asech(x + 1)",
						excsch: "1 argument. returns cschx - 1",
						aexcsch: "1 argument. returns acsch(x + 1)",
						versh: "1 argument. returns 1 - coshx",
						aversh: "1 argument. returns acosh(x + 1)",
						verch: "1 argument. returns 1 + coshx",
						averch: "1 argument. returns acosh(x - 1)",
						cversh: "1 argument. returns 1 - sinhx",
						acversh: "1 argument. returns asinh(1 - x)",
						cverch: "1 argument. returns 1 + sinhx",
						acverch: "1 argument. returns asinh(x - 1)",
						hversh: "1 argument. returns vershx / 2",
						ahversh: "1 argument. returns acosh(1 - 2x)",
						hverch: "1 argument. returns verchx / 2",
						ahverch: "1 argument. returns acosh(2x - 1)",
						hcversh: "1 argument. returns cvershx / 2",
						ahcversh: "1 argument. returns asinh(1 - 2x)",
						hcverch: "1 argument. returns cvershx / 2",
						ahcverch: "1 argument. returns asinh(2x - 1)",
						deg: {
							sin: "1 argument. returns sin(angle°), using the taylor series definition of sin.",
							cos: "1 argument. returns cos(angle°), using the taylor series definition of cos.",
							tan: "1 argument. returns sin(angle°) / cos(angle°)",
							csc: "1 argument. returns 1 / sin(angle°)",
							sec: "1 argument. returns 1 / cos(angle°)",
							cot: "1 argument. returns 1 / tan(angle°)",
							asin: "1 argument. returns arcsine(argument) using the taylor series definition of arcsine.",
							acos: "1 argument. returns 90 - asin(argument)",
							atan: "1 argument. returns 180/π atan(argument)",
							atan2: "Takes 2 numeric arguments (x, and y) and 1 boolean argument, and returns atan2(x, y) in degrees. If the third argument is true, the arguments of the function will be reversed, being atan2(y, x) instead, but this argument is defaulted to false. see 'https://bit.ly/3j5X03W' or 'https://bit.ly/3DzmCQq' for a better explanation.",
							acsc: "1 argument. returns asin(1/arg)",
							asec: "1 argument. returns acos(1/arg)",
							acot: "1 argument. if the argument is loosely equal to zero, returns 90.  if the argument is less than zero, returns 180 + atan(arg), otherwise it returns atan(arg).",
							excst: "1 argument. returns √( exsec^2(x) +  cot^2(x) ) in degrees",
							exset: "1 argument. returns √( exsec^2(x) +  tan^2(x) ) in degrees",
							vcs: "1 argument. returns √( vercosin^2(x) +  sin^2(x) ) in degrees",
							cvs: "1 argument. returns √( 1 +  sin^2(x) ) in degrees",
							acvs: "1 argument. returns asin( x^2 - 1 ) with an input in degrees",
							ccvs: "1 argument. returns √( 1 +  cos^2(x) ) in degrees",
							accvs: "1 argument. returns acos( x^2 - 1 ) with an input in degrees",
							crd: "1 argument. returns sin(x/2) in degrees",
							acrd: "1 argument. returns 2asin(x/2) with an input in degrees",
							ccrd: "1 argument. returns cos(x/2) in degrees",
							accrd: "1 argument. returns π/2 - acrdx in degrees",
							exsec: "1 argument. returns secx - 1 in degrees",
							aexsec: "1 argument. returns asec(x + 1) with an input in degrees",
							excsc: "1 argument. returns cscx - 1 in degrees",
							aexcsc: "1 argument. returns acsc(x + 1) with an input in degrees",
							vers: "1 argument. returns 1 - cosx in degrees",
							avers: "1 argument. returns acos(x + 1) with an input in degrees",
							verc: "1 argument. returns 1 + cosx in degrees",
							averc: "1 argument. returns acos(x - 1) with an input in degrees",
							cvers: "1 argument. returns 1 - sinx in degrees",
							acvers: "1 argument. returns asin(1 - x) with an input in degrees",
							cverc: "1 argument. returns 1 + sinx in degrees",
							acverc: "1 argument. returns asin(x - 1) with an input in degrees",
							hav: "1 argument. returns versx / 2 in degrees",
							ahav: "1 argument. returns acos(1 - 2x) with an input in degrees",
							hverc: "1 argument. returns vercx / 2 in degrees",
							ahverc: "1 argument. returns acos(2x - 1) with an input in degrees",
							hcvers: "1 argument. returns cversx / 2 in degrees",
							ahcvers: "1 argument. returns asin(1 - 2x) in degrees",
							hcverc: "1 argument. returns cversx / 2 in degrees",
							ahcverc: "1 argument. returns asin(2x - 1) with an input in degrees"
						}
					}, Ω: "Takes 2 arguments.  1: number (x=e).  2: (accuracy=1e4). returns Ω where Ωx^Ω = 1. see omega constant",
					ζ: "3 arguments. 1: input (s). 2: other input (a). 3: accuracy=1000 returns the hurwitz zeta function of s,a. summation from 0 to accuracy of (n+a)^-s. see Rzeta, Hzeta",
					Rzeta: "3 arguments. 1: input (s). 2: accuracy=1000. 3: other input (a) returns the hurwitz zeta function of s,a. summation from 0 to accuracy of (n+a)^-s. see ζ, Hzeta",
					Hzeta: "3 arguments. hurwitz zeta function. same function as ζ. see ζ, Rzeta",
					π: "2 arguments. 1: Number (x). 2: Natuarl Number (form). form 1 uses iteration. form 2 use li(x). form 3 uses x/lnx. for the constant, use pi, for pi/2 use π_2 see primeCount.",
					primeCount: "2 arguments. same as π function",
					P: "takes any amount of arguments either in an array, multiple arrays, or directly.  can only use number arguments. returns the set of all subsets of the inputed sets.  if any of the arguments is \"strict\" then it will return a strict subset (the set itself is not included).",
					expm: "2 arguments. 1: Number (x). 2: Number (n). returns e^x - n. see expm1",
					expm1: "1 argument. returns e^x - 1. see expm",
					log2: "1 argument. base 2 logarithm",
					log10: "1 argument. base 10 logarithm",
					logpi: "1 argument. base π logarithm",
					log1p: "1 argument. returns ln(1 + x)",
					clz32: "takes one parameter.  same as original Math.clz32. count leading zeros for a 32 bit integer. -2147483647 (1 - 2^31) and 4294967295 (2^32 - 1) both return zero.",
					clbz: "takes one parameter.  same as original Math.clz32. stands for count leading binary zeros",
					fact: "takes one parameter.  returns the factorial of a number. Also works for floats.",
					factorial: "1 numeric argument (x). returns x!. see fact and ifact",
					sgn: "takes one parameter.  returns the sign of a number.  If input is NaN, returns NaN. If  input == 0, returns the input.  If the input is positive, returns 1.  If the input is negative, returns -1. sgn(-0) == -0.",
					abs: "takes one parameter.  returns sign(input) * input, which always returns a positive number or zero.",
					cabs: "Takes 1 complex argument. returns cMath.abs(argument). returns a real number",
					sum: "stands for summation.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to sum each time, in the form of a function that takes in one parameter. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end parameters are inclusive.",
					infsum: "Takes 3 arguments. 1: start.  2: function.  3: increment.  start is defaulted to 0, function is defaulted to n=>1/n, and the increment is defaulted to 1.  Stands for infinite summation.  Will only return an answer if it converges, otherwise it will kepp calculating eternally",
					prod: "stands for product operator.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to multiply by each time, in the form of a function with an input and output. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end parameters are inclusive.",
					gamma: "stands for gamma function. gamma(x) = factorial(x-1).  Takes three parameters.  1: the number to take the gamma function of.  2: accuracy of the function (default is 1000). 3: rest parameter that does nothing.  if the number is an integer returns ifact(n-1). else, it does the integral from 0 to a, of x**(n-1)/𝑒**x.  if this is Infinity, it returns NaN, otherwise, it returns the answer.",
					igammal: "Takes 2 arguments. a number and the increment for the integral. lower incomplete gamma function.",
					igammau: "Takes 2 arguments. a number and the increment for the integral. upper incomplete gamma function.",
					_: "Takes 1 argument. returns 1 / argument",
					inverse: "Takes 1 argument. returns 1 / argument",
					int: "stands for integral.  Takes 4 arguments.  1: starting value (inclusive).  2: ending value (exclusive).  3: what you are taking the integral of, in the form of a function with an input, and an output.  4: rectangle size, or in other words, the accuracy, where smaller is more accurate.  the accuracy is defaulted to 0.001, and it is defaulted to taking the integral of y=x.",
					hypot: "Stands for hypotenuse.  Takes in any amount of parameters, either directly or in one or many array(s).  for each argument, adds the square to the total.  then takes the square root of the total.",
					log: "Takes 3 parameters.  1: number you are taking the logarithm of.  2: base of the logarithm. eg: log(3,6) = log₆(3).  3: number of iterations. the base is defaulted to 10.  The number of iterations is defaulted to 50",
					logbase: "Takes 3 parameters (base, number, number of iterations), returns log(number, base, iterations).  the first parameters flipped. The number of iterations is defaulted to 50",
					ln: "Takes 1 parameter, and returns the natural logarithm of the number.  the same as the original Math.log. returns log(input, 𝑒).",
					max: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the largest number inputed.  Although, if the last parameter is not either a number or a bigint, that value will be returned instead.",
					min: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the smallest number inputed.  Although, if the last parameter is not either a number or a bigint, that value will be returned instead.",
					mean: "Takes any amount of arguments, either directly or in one or many array(s).  adds up the arguments, and divides by the number of arguments present. and returns the answer.",
					median: "Takes any amount of arguments, either directly or in one or many array(s).  it removes items from the end and beginning until there are either one or two elements remaining. if there is one, it returns it.  if there are two, it returns the average of them.",
					mode: "takes any amount of arguments either directly or in an array. returns the value that is the most common of the arguments.",
					mad: "Stands for mean absolute deviation.  takes any amount of arguments, either directly or in one or many array(s).  gets the mean of the arguments.  then finds the mean of the absolute deviation from the mean.",
					isPrime: "Takes 1 input, and returns true if it is prime, false if it is composite.",
					_lmgf: "stands for lcm gcf.  Takes at least two arguments.  if the first argument is equal tp \"lcm\" or \"l\" (lowercase L), it will perform the least common multiple. otherwise,  it will do the greatest common factor.  the rest of the parameters can be inputed either directly, or as one or many arrays.  any arguments that are not numbers or bigInts are ignored, as long as it is not the second argument.",
					linReg: "Takes 3 paramates. finds the line of best fit (y = mx + b), given the x and y coordinates as arrays. 1: x-coordinates.  2: y-coordinates.  3: if this is \"obj\", then it returns an object, otherwise it returns it as a string",
					pascal: "Takes 2 arguments.  1: row.  2: col in row.  if the column is less than 1 or greater than row + 1, it will return NaN. otherwise, if col is not \"all\", it will return nCr(row,col-1). if col is equal to \"all\", it will return an array of all the numbers in that row of pascals triangle.",
					fib: "Stands for fibonacci. returns the fibonacci sequence number of the inputed index.  If floats are inputed, then it will effectively return fib(ceil(input)).  Currently negative indexes are not implemented.  fib(0) returns 0, fib(1) returns 1, fib(2) returns 1, fib(3) returns 2, etc.",
					fibonacci: "Takes 1 numerical argument (n). returns rMath.fib(n).",
					lucas: "Takes 1 numerical argument (n). returns the nth number in the lucas series.",
					primeFactorInt: "Takes 1 numberic argument, and returns a list of the prime factors",
					findFactors: "Takes 1 integer argument and finds all integer factors of said integer.",
					iMaxFactor: "Takes 1 integer argument and returns the largest factor of said integer",
					synthDiv: "Takes 2 arguments. 1: coefficients of the variables. 2: the divisor.  the equation should take the form of ax^n + bx^(n-1) + cx^(n-2) + ... + constant, with the '^'s here standing in for exponentiation.",
					simpRad: "Takes 1 integer argument (number under radical) and returns, as a string, the radical in simplified form",
					PythagTriple: "Takes one argument. 1: max size. finds all principle pythagorean triples such that a**2 + b**2 = c**2, a < max size, and b < max size, and a, b, and c are all integers.",
					iPythagorean: "Takes 3 arguments. the first 2 are just generic variables for the function (a, m). the last argument is the form. if the form is Array, it returns an array of [a,b,c], otherwise it returns an object. solves for a^2 + b^2 = (b+m)^2. only returns integer pythagorean triples. (a+m) mod₀ 2 = 0  <==>  formula works. or in english, if (a+m) is even, the formula works, and vice verca.",
					neg: "takes 2 arguments. the first is the number to negate and the second argument is whether or not to return a number or a string. true returns a number, false returns a string.",
					ssgn: "Takes 1 string number argument. returns as a number, the sign of the input. sgn('-0.0') == -1",
					ssign: "Takes 1 string number argument. returns as a number, the sign of the input. sgn('-0.0') == -1",
					sabs: "Takes 1 string number argument. returns the absolute value of the input. see sMath.abs",
					add: "Takes 4 arguments.  1: a number (a).  2: a number (b).  3:boolean, true returns a number, false returns a string.  4:number, decimal precision. returns a + b with no floating point arithmetic errors. if number is false, it returns a string with the precision of the last argument. a and b default to 0. if precsion is not a number, it becomes infinity.",
					sub: null,
					mul: null,
					div: "Takes 4 arguments.  1:number, numerator.  2:number, denominator.  3:boolean, true returns a number, false returns a string.  4:number, decimal precision.  returns the numerator divided by the denominator with no floating point errors.  numerator defaults to 0, and denominator defaults to 1",
					mod2: "Takes 3 arguments (a, n, k). returns a % n + k through iteration. mod() is better in every way. the built in '%' operator is probably even faster as well. will return different answers from % if the second argument is negative due to the formula. see mod for more information",
					mod: "Takes 3 arguments (a, n, k).  similar to a%n, the difference being the formula used. mod(a, b, 0) => a - b⌊a/b⌋. a%b => a - b*Math.trunc(a/b). see mod2",
					parity: "Takes any amount of arguments directly, or in an array.  if there is one argument, it will return even or odd as a string.  if there 2 or more arguments, it will return an array of strings.",
					nCr: "Stands for n Choose r. takes 2 arguments. same as python's math.comb()",
					comb: "2 arguments. n, k. returns nCr(n, k). stands for combination",
					nPr: "Stands for n Permute r. takes 2 arguments.",
					perm: "2 arguments. n, k. returns nPr(n, k). stands for permutation",
					isClose: "Takes 3 arguments. 1: number a. 2: number b.  3: number c. if a third argument is not provided, it will be set to Number.EPSILON (2^-52).  returns true if number a is in range c of number b, otherwise it returns false.",
					complex: "Creates a complex number",
					erf: "Takes one numeric argument \"z\". returns 2/√π ∫(0, z, 1/𝑒^t^2)dt. In mathematics, it is called the \"Gauss error function\"",
					erfc: "Takes 1 numeric argument \"z\". return 1 - erf(z).",
					dist: "Takes 4 arguments: (x1, y1, x2, y2). retrns the distance between the two points",
					dist2: null,
					copySign: "takes 2 arguments. 1: number to keep the value of (x). 2: number to keep the sign of (y). returns |x|sign(y)",
					trunc: "Takes any amount of parameters, either directly or in one or many array(s).  If there is only one input, it will truncate it, and return it, otherwise, it will return an array of truncated values.",
					isNaN: "Similar to isNaN(). takes one parameter.  if it can be coerced to be a number, it returns false.  the difference is that it returns false for bigints instead of throwing an error.",
					isAN: "Takes one argument.  returns the opposite of rMath.isNaN. see isaN, isNNaN",
					isaN: "Takes one argument.  returns the opposite of rMath.isNaN. see isAN, isNNaN",
					isNNaN: "Takes one argument.  is not not a number. returns the opposite of rMath.isNaN. see isAN, isaN",
					imul: "returns the result of the C-like 32-bit multiplication of the two parameters.",
					lcm: "returns the least common multiple of a list of numbers. see _lmgf",
					gcf: "returns the greatest common factor of a list of numbers. see _lmgf, gcd",
					gcd: "see gcf, _lmgf",
					fround: "returns the nearest 32-bit single precision float representation of a number.",
					sqrt: "Takes one argument. returns nthrt(arg)",
					cbrt: "Takes one argument.  returns the cube root of the argument.",
					lnnp: null,
					ln1p: "Takes one argument.  returns ln(1+arg). see log1p",
					degrees: "Takes 1 argument. 1: angle in radians. converts radians to degrees",
					radians: "Takes 1 argument. 1: angle in degrees. converts degrees to radians",
					sign: "Alternate spelling for sgn",
					exp: "Takes two arguments (n, x=Math.E).  returns x^n",
					round: "returns round(argument)",
					floor: "returns floor(argument)",
					ceil: "returns ceil(argument)",
					rand: "0 arguments. returns window.rand(), which is the original Math.random",
					random: "returns a random number in the range [0,1)",
					pow: "Takes two arguments (a,b). similar to a**b.",
					nthrt: "Takes 2 parameters (x, n). returns x**(1/n). the root defaults to 2.",
					square: "1 argument (x). returns x^2. see pow, cube, tesseract, hyper3",
					cube: "1 argument (x). returns x^3. see pow, square, hyper3, tesseract",
					tesseract: "1 argument (x). returns x^4. see pow, square, hyper3, cube",
					ifact: "Returns the factorial of a number, and disregards all numbers in decimal places.",
					findPrimes: "Takes two parameters.  1: maximum number of primes to be returned.  2: maximum size (inclusive) for the desired numbers",
					// TODO: update li() documentation
					li: "3 arguments. 1: number to take li of. 2: increment or accuracy depending on the form. 3: form number. form 1 uses an integral. form 2 uses a summation of summations. form 3 does π(x) because it is asymptotic to it. form 3 is the fastest",
					Li: "Takes 3 arguments. (x, incrementOrAccuracy=.001, form=1). returns rMath.li of the same arguments subtracted by li(2) or ~1.045163780117493. if either of the first 2 arguments are not a number, NaN is returned instead. see li",
					Ei: null,
					tetrate: "Takes 2 numeric arguments (a and b).  returns a to the power of a, n times. look up tetration for more information see hyper4",
					hyper0: "Takes 1 argument and returns 1 + the argument",
					hyper1: "Takes 2 numeric arguments and returns the sum of the arguments",
					hyper2: "Takes 2 numeric arguments and returns the product of the arguments",
					hyper3: "Takes 2 numeric arguments and returns the first argument to the power of the second argument",
					hyper4: "Takes 2 numeric arguments (a and b).  returns a to the power of a, n times. look up tetration for more information. see tetrate",
					Si: null,
					si: null,
					Cin: null,
					Ci: null,
					Shi: null,
					Chi: null,
					tanhc: "Takes 1 numeric argument (z) and returns tanh(z) / z",
					sinhc: "Takes 1 numeric argument (z) and returns sinh(z) / z",
					Tanc : "Takes 1 numeric argument (x) and returns tan(x) / x using radians",
					Coshc: "Takes 1 numeric argument (z) and returns cosh(z) / z",
					H: null,
					W: null,
					deriv: null,
					tanLine: null,
					gd: null,
					lam: null,
					base10Conv: null,
					bin: "Takes 3 arguments. the first argument is the number you want to convert to binary. if this is not a number, it gets returned. if the second argument is truthy, the output has '0b' at the beginning. if the third argument is truthy the output has '2:' at the end. this is because rMath.base10Conv uses this syntax for the output for the base. the second argument is more important than the third in deciding which thing happens. the output is a string.",
					oct: "Takes 3 arguments. the first argument is the number you want to convert to octal. if this is not a number, it gets returned. if the second argument is truthy, the output has '0o' at the beginning. if the third argument is truthy the output has '8:' at the end. this is because rMath.base10Conv uses this syntax for the output for the base. the second argument is more important than the third in deciding which thing happens. the output is a string.",
					hex: "Takes 3 arguments. the first argument is the number you want to convert to hexadecimal. if this is not a number, it gets returned. if the second argument is truthy, the output has '0x' at the beginning. if the third argument is truthy the output has '16:' at the end. this is because rMath.base10Conv uses this syntax for the output for the base. the second argument is more important than the third in deciding which thing happens. the output is a string.",
					timesTable: null,
					cosNxSimplify: null,
					heron: "Take 3 numeric arguments (a, b, c). returns herons formula, using the inputs as the sides. with s := (a+b+c)/2, it returns √[ s (s-a) (s-b) (s-c) ]",
					tempConv: null,
					coprime: null,
					ncoprime: null,
					cumsum: "Takes 1 set argument. returns the cumulative sum of all the items in the set.",
					set: "Takes any amount of numeric arguments. returns a new Set object. this functions is not a constructor. the constructor is at rMath.Set.",
					setUnion: null,
					piApprox: undefined,
					_pow: "Takes 1 integer argument (n). returns an array of integers that represent the optimal route in exponentiating to the Nth power",
				}; if (degTrig) this.deg = {
					sin: θ => isNaN( θ = Number(θ) ) ? θ : this.sin(θ*π/180),
					cos: θ => isNaN( θ = Number(θ) ) ? θ : this.cos(θ*π/180),
					tan: θ => isNaN( θ = Number(θ) ) ? θ : this.deg.sin(θ) / this.deg.cos(θ),
					csc: θ => isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.sin(θ),
					sec: θ => isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.cos(θ),
					cot: θ => isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.tan(θ),
					asin: x => isNaN( x = Number(x) ) ? x :
						x > 1 || x < -1 ? NaN :
							this.sum(0, 80, n => this.fact(2*n) /
								(4**n*this.fact(n)**2 * (2*n+1)) * x**(2*n+1)
							) * 180/π,
					acos: x => isNaN( x = Number(x) ) ? x : 90 - this.deg.asin(x),
					atan: x => isNaN( x = Number(x) ) ? x : this.atan(x) * 180/π,
					atan2: (x, y, flipArgs=false) =>
						isNaN( x = Number(x) ) || isNaN( y = Number(y) ) ? NaN : (
							flipArgs ? this.atan2(y, x) : this.atan2(x, y)
						) * 180/π,
					acsc: x => isNaN( x = Number(x) ) ? x : this.deg.asin(1/x),
					asec: x => isNaN( x = Number(x) ) ? x : this.deg.acos(1/x),
					acot: x => isNaN( x = Number(x) ) ? x : !x ? 90 : this.deg.atan(1/x) + 180*(x < 0),
					excst: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.cot(x)),
					// aexcst: x => Error("not implemented"),
					exset: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.tan(x)),
					// aexset: x => Error("not implemented"),
					vcs: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.verc(x), this.deg.sin(x)),
					// avcs: x => Error("not implemented"),
					cvs: x => isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.sin(x)),
					acvs: x => isNaN( x = Number(x) ) ? x : this.deg.asin(x**2 - 1),
					ccvs: x => isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.cos(x)),
					accvs: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x**2 - 1),
					crd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.sin(x / 2),
					acrd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.asin(x / 2),
					ccrd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.cos(x / 2),
					accrd: x => isNaN( x = Number(x) ) ? x : π_2 - this.deg.acrd(x),
					exsec: x => isNaN( x = Number(x) ) ? x : this.deg.sec(x) - 1,
					aexsec: x => isNaN( x = Number(x) ) ? x : this.deg.asec(x + 1),
					excsc: x => isNaN( x = Number(x) ) ? x : this.deg.csc(x) - 1,
					aexcsc: x => isNaN( x = Number(x) ) ? x : this.deg.acsc(x + 1),
					vers: x => isNaN( x = Number(x) ) ? x : 1 - this.deg.cos(x),
					avers: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x + 1),
					verc: x => isNaN( x = Number(x) ) ? x : 1 + this.deg.cos(x),
					averc: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x - 1),
					cvers: x => isNaN( x = Number(x) ) ? x : 1 - this.deg.sin(x),
					acvers: x => isNaN( x = Number(x) ) ? x : this.deg.asin(1 - x),
					cverc: x => isNaN( x = Number(x) ) ? x : 1 + this.deg.sin(x),
					acverc: x => isNaN( x = Number(x) ) ? x : this.deg.asin(x - 1),
					hav: x => isNaN( x = Number(x) ) ? x : this.deg.vers(x) / 2,
					ahav: x => isNaN( x = Number(x) ) ? x : this.acos(1 - 2*x),
					hverc: x => isNaN( x = Number(x) ) ? x : this.deg.verc(x) / 2,
					ahverc: x => isNaN( x = Number(x) ) ? x : this.deg.acos(2*x - 1),
					hcvers: x => isNaN( x = Number(x) ) ? x : this.deg.cvers(x) / 2,
					ahcvers: x => isNaN( x = Number(x) ) ? x : this.deg.asin(1 - 2*x),
					hcverc: x => isNaN( x = Number(x) ) ? x : this.deg.cverc(x) / 2,
					ahcverc: x => isNaN( x = Number(x) ) ? x : this.deg.asin(2*x - 1),
				}; if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") { return sMath.eq.gt(a, b);
					}, ge(a="0.0", b="0.0") { return this.gt(a, b) || this.seq(a, b);
					}, lt(a="0.0", b="0.0") { return sMath.eq.lt(a, b);
					}, le(a="0.0", b="0.0") { return this.lt(a, b) || this.seq(a, b);
					}, leq(a=0, b=0) { return Number(a) === Number(b);
					}, seq(a="0.0", b="0.0") { return sMath.eq.eq(a, b);
					}, lneq(a=0, b=0) { return Number(a) !== Number(b);
					}, sneq(a="0.0", b="0.0") { return sMath.eq.ne(a, b);
					},
				}; if (constants) {
					this.foia = this.α = α                             ;
					this.ɡ = this.gravity = 9.80665                    ;
					this.avogadro = 6.02214076e+23                     ;
					this.bohrMagneton = 9.2740100783e-24               ;
					this.bohrRadius = 5.29177210903e-11                ;
					this.boltzmann = 1.380649e-23                      ;
					this.classicalElectronRadius = 2.8179403262e-15    ;
					this.deuteronMass = 3.3435830926e-27               ;
					this.efimovFactor = 22.7                           ;
					this.electronMass = 9.1093837015e-31               ;
					this.electronicConstant = 8.8541878128e-12         ;
					this.faraday = 96485.33212331001                   ;
					this.fermiCoupling = 454379605398214.1             ;
					this.fineStructure = 0.0072973525693               ;
					this.firstRadiation = 3.7417718521927573e-16       ;
					this.gasConstant = 8.31446261815324                ;
					this.inverseConductanceQuantum = 12906.403729652257;
					this.klitzing = 25812.807459304513                 ;
					this.loschmidt = 2.686780111798444e+25             ;
					this.magneticConstant = 0.00000125663706212        ;
					this.magneticFluxQuantum = 2.0678338484619295e-15  ;
					this.molarMass = 0.00099999999965                  ;
					this.molarMassC12 = 0.0119999999958                ;
					this.molarPlanckConstant = 3.990312712893431e-10   ;
					this.molarVolume = 0.022413969545014137            ;
					this.neutronMass = 1.6749271613e-27                ;
					this.nuclearMagneton = 5.0507837461e-27            ;
					this.planckCharge = 1.87554603778e-18              ;
					this.planckConstant = 6.62607015e-34               ;
					this.planckLength = 1.616255e-35                   ;
					this.planckMass = 2.176435e-8                      ;
					this.planckTemperature = 1.416785e+32              ;
					this.planckTime = 5.391245e-44                     ;
					this.reducedPlanckConstant = 1.0545718176461565e-34;
					this.rydberg = 10973731.56816                      ;
					this.sackurTetrode = -1.16487052358                ;
					this.secondRadiation = 0.014387768775039337        ;
					this.speedOfLight = this.c = 299_792_458           ;
					this.stefanBoltzmann = 5.67037441918443e-8         ;
					this.weakMixingAngle = 0.2229                      ;
					this.solarConstants = {
						Earth: 1380,
						Venus: 2613,
						Mars : 589,
					};
				};
			} Ω(x=Math.E, i=10_000) {
				// Ω(x) * x^Ω(x) ≈ 1
				// approximate because some inputs oscilate between outputs, such as Ω(349)
				// "i" cannot default to Infinity due to this oscilation
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( i = Number(i) )) return NaN;
				var ans = x, prev;
				if (x < 142) {
					while ( i --> 0 ) {
						prev = ans;
						ans -= (ans*x**ans-1) / (x**ans*(ans+1)-(ans+2)*(ans*x**ans-1)/(2*ans+2));
						if (prev === ans) break;
					}
				} else {
					while ( i --> 0 ) {
						prev = ans;
						ans = (1 + ans) / (1 + x**ans)
						if (prev === ans) break;
					}
				}
				return ans;
			} ζ(s, a=0, acy=1000, gAcy=1e3, gInc=.1) {
				return isNaN(s = Number(s)) || isNaN(a = Number(a)) || isNaN( acy = Number(acy) ) ?
					NaN :
				s === Infinity ?
					1 :
				!s ?
					-0.5 :
				s === 1 ?
					Infinity :
				s < 1 ?
					2**s * π**(s-1) * this.sin(π_2*s) * this.gamma(1-s, gAcy, gInc) * this.ζ(1-s, a, acy) :
				this.sum(1, acy, n => (n + a)**-s);
			} Rzeta(s, acy=1000, gAcy=1e3, gInc=.1) { return this.ζ(s, 0, acy, gAcy, gInc); // Reimann zeta function
			} Hzeta(s, a=0, acy=1e3, gAcy=1e3, gInc=.1) { return this.ζ(s, a, acy, gAcy, gInc); // Hurwitz zeta function
			} π(x, form=1) {
				if (isNaN( x = floor(Number(x)) )) return NaN;
				if (x < 2) return 0;
				if (x === Infinity) return x;
				if (form === 1) {
					for (var i = x + 1, total = 0; i --> 1 ;)
						total += i.isPrime();
					return total;
				}
				if (form === 2) return this.li(x);
				if (form === 3) return x / this.ln(x);
				return NaN;
			} primeCount(x, form=1) { return this.π(x, form);
			} P(...set) {
				// power set, set of all subsets
				set = set.flatten();
				var strict = !1;
				if (set.incl("strict")) {
					set.remove("strict");
					strict = !0;
				}
				if ( set.hasDupes() ) throw Error("rMath.P() cannot have duplicate arguments");
				set = set.map( e => [e] );
				if ( set.isNaN() ) throw TypeError("rMath.P() can only have numeric arguments");
				function subP(set) {
					return set.map(
						e => {
							for (var i = 0, n = len(set), arr = []; i < n ; i++)
								arr.push( [e[0], set[i]] );
							return arr;
						}
					).flat().map( e => e.sort().join() ).remrep().map(
						e => e.split(",").map(e => Number(e)).sort()
					).map( e => e.sort().join() ).remrep().map( // double check is required
						e => e.split(",").map(e => Number(e)).sort()
					).filter( e => !e.hasDupes() );
				}
				var out = [[null]];
				do {
					out = out.concat(set);
					set = subP(set);
				} while (json.stringify(set) !== "[]");
				strict && len(out) > 1 && out.pop();
				return out;
			} expm(x, n) { return 𝑒 ** x - n;
			} expm1(x) { return this.expm(x, 1);
			} clz32(n) { return this.clbz(n);
			} clbz(n) {
				// count leading binary zeros
				if (isNaN( n = Number(n) )) return NaN;
				if (n < 0 || n > 2_147_483_647) return 0; // 2^31 - 1. max uint32 value
				n = n.toString(2);
				return len( (strMul("0", 32 - len(n)) + n).remove(/1.*/) );
			} cebz(x) {
				// count ending binary zeros
				// log2(x & -x)  for |x| < 2^32
				if (this.isNaN(x)) return NaN;
				x = BigInt(x).toString(2);
				return dim(x) - x.lio("1");
			} sgn(n) { return isNaN( n = Number(n) ) ? NaN : !n ? n : n < 0 ? -1 : 1;
			} abs(n) { return isNaN( n = Number(n) ) ? NaN : this.sgn(n) * n;
			} cabs(cnum) { return cMath.abs(cnum);
			} sum(n, last, fn=n=>n, inc=1) {
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func") return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				var total = 0;
				if (last === Infinity) {
					for (var prev; n <= last; n += inc) {
						if (total === prev) break;
						prev = total;
						total += fn(n);
					}
				} else for (; n <= last; n += inc)
					total += fn(n);
				return total;
			} total(...args) { return args.flatten().reduce((t, e) => t + e, 0);
			} product(...args) {return args.flatten().reduce((t, e) => t * e, 1);
			} infsum(start=0/*, last=Infinity*/, fn=n=>1/n, inc=1) { return this.sum(start, Infinity, fn, inc);
			} prod(n, last, fn=n=>n, inc=1) {
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func") return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				for (var total = 1; n <= last; n += inc)
					total *= fn(n);
				return total;
			} _(n) { 1 / Number(n);
			} inverse(n) { 1 / Number(n);
			} conjugate(x) {
				// complex conjugate
				// TODO: Expand to CFractions
				return type(x, 1) === "complex" ? cMath.conjugate(x) : x;
			} int(x/*start*/, end, f=x=>x, inc=.001) {
				// start and end are included.
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( end = Number(end) )) return NaN;
				if (type(f, 1) !== "func") return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				let ans = 0;
				if (end > x) {
					if (isNaN(f(x))) {
						// if f(x) is not defined for the starting point, ev
						let chng = Number.EPSILON;
						while ( isNaN(f(x)) )
							x += chng,
							chng = this.nextUp(chng);
					}
					if (isNaN(f(end))) for (; x < end; x += inc) ans += (f(x) + f(x + inc)) / 2 * inc;
					else for (; x <= end; x += inc) ans += (f(x) + f(x + inc)) / 2 * inc;
				}
				else if (x > end) return -this.int(end, x, f, inc);
				/*else */return ans;
			} integral() { return this.int.apply(this, arguments);
			} hypot(...args) {
				args = args.flatten();
				for (var total = 0, i = len(args); i --> 0 ;)
					total += args[i]**2;
				return this.sqrt(a);
			} log(x, base=LibSettings.MATH_LOG_DEFAULT_BASE, number=true) {
				// really slow for large Xs
				if (isNaN(x = Number(x)) || isNaN(base = Number(base)) || base <= 0 || x <= 0 || base == 1) return NaN;
				if (base === Infinity) return x === Infinity  ?  NaN  :  number ? 0 : 0n;
				if (x == base) return number ? 1 : 1n;
				if (x === Infinity) return Infinity;
				var x2 = BigInt(int(x)), b2 = BigInt(int(base)), ans = floor(x2 / b2), chng = x2, i;
				while (chng /= 10n) {
					while (ans != (
						ans += bMath.abs( x2 - bMath.pow(b2, ans - chng) ) < bMath.abs( x2 - bMath.pow(b2, ans) ) ? -chng :
							bMath.abs( x2 - bMath.pow(b2, ans + chng) ) < bMath.abs( x2 - bMath.pow(b2, ans) ) ? chng : 0n
					));
					if (ans < 0n && x > base) ans = 1n;
				}
				if (!number) return ans;
				for (ans = Number(ans), chng = 0.1; ans != ans + chng; chng /= 10) while (
					ans != (ans += abs(x - base**(ans - chng)) < abs(x - base**ans) ? -chng :
						abs(x - base**(ans + chng)) < abs(x - base**ans) ? chng : 0)
				);
				return ans;
			} logbase(base, x) {
				return isNaN( base = Number(base) ) || isNaN( x = Number(x) ) ?
					NaN :
					this.log( x, base );
			} ln(n) { return isNaN( n = n ) ? NaN : this.log( n, e );
			} log2(x) { return this.log(x, 2);
			} log10(x) { return this.log(x, 10);
			} logpi(x) { return this.log(x, π);
			} log1p() { return this.ln1p.apply(this, arguments);
			} lnnp(x, n=1) { return isNaN( x = Number(x) ) ? x : this.ln(n + x);
			} ln1p(x) { return isNaN( x = Number(x) ) ? x : this.ln(1 + x);
			}
			/////////////////////////////////////// STATISTICS START ///////////////////////////////////////
			max(...ns) {
				ns = ns.flatten();
				if (!len(ns)) return -Infinity;
				if ( ns.isNaN() ) return NaN;
				let max = ns[0];
				for (let i of ns) max = i > max ? i : max;
				return max;
			} min(...ns) {
				ns = ns.flatten();
				if (!len(ns)) return Infinity;
				if ( ns.isNaN() ) return NaN;
				let min = ns[0];
				for (let i of ns) min = i < min ? i : min;
				return min;
			} range(...ns) { return this.max(ns = ns.flatten()) - this.min(ns);
			} mean(...args) {
				args = args.flatten();
				return args.reduce((t, e) => t + e, 0) / len(args);
			} median(/*arguments*/) {
				let arr = list(arguments).flatten().sort();
				return len(arr) % 2 ?
					arr[dim(arr) / 2] :
					(arr[len(arr) / 2 - 1] + arr[len(arr) / 2]) / 2;
			} mode(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				let obj = {};
				for (const n of ns) n in obj ? obj[n]++ : (obj[n] = 1);
				return keyof( obj, this.max(Object.values(obj)) );
			} mad(...ns) {
				ns = ns.flatten();
				return this.absdev(ns) / len(ns);
			} trimean() { return this.TM.apply(this, arguments);
			} lfence(...args) {
				// lower fence. (for determining outliers)
				args = args.flatten();
				return this.Q1(arguments) - 1.5*this.IQR(args);
			} ufence(...args) {
				// upper fence. (for determining outliers)
				args = args.flatten();
				return this.Q3(arguments) + 1.5*this.IQR(args);
			} med() { return this.median.apply(this, arguments);
			} medianindex() { return dim( list(arguments).flatten() ) / 2;
			} quartile(q, ...args) {
				return !q ? this.Q0(args) :
				q === 1 ? this.Q1(args) :
				q === 2 ? this.Q2(args) :
				q === 3 ? this.Q3(args) :
				q === 4 ? this.Q4(args) :
				NaN;
			} quartile0() { return this.Q0.apply(this, arguments);
			} quartile1() { return this.Q1.apply(this, arguments);
			} quartile2() { return this.Q2.apply(this, arguments);
			} quartile3() { return this.Q3.apply(this, arguments);
			} quartile4() { return this.Q4.apply(this, arguments);
			} Q0(/* ...args */) { return this.min.apply(this, arguments);
			} Q1(...args) {
				// https://en.wikipedia.org/wiki/Quartile method 4
				args = args.flatten().sort();
				return this.median( args.slice( 0, ceil(dim(args) / 2) ) );
			} Q2(/* ...args */) { return this.median.apply(this, arguments);
			} Q3(...args) {
				// https://en.wikipedia.org/wiki/Quartile method 4
				args = args.flatten().sort();
				return this.median( args.slice( ceil(len(args) / 2) ) );
			} Q4(/* ...args */) { return this.max.apply(this, arguments);
			} IQR(...args) {
				// inter-quantile range
				args = args.flatten().sort();
				return this.Q3(args) - this.Q1(args);
			} IQM(...args) {
				// interquartile mean
				args = args.flatten().sort();
				const n = len(args);
				return 2/n * this.sum(1+n/4, 3*n/4, i => args[i], 1 )
			} TM(...args) {
				// trimean
				args = args.flatten().sort();
				return (this.Q1(args) + 2*this.Q2(args) + this.Q3(args)) / 4
			} CHM(...args) {
				// contraharmonic mean
				args = args.flatten();
				return args.reduce((t, e) => t + e**2, 0) / this.total(args);
			} AM(/*...args*/) { return this.mean.apply(this, arguments); // arithmetic mean
			} GM(...args) {
				// geometric mean
				args = args.flatten();
				return this.nthrt( abs(this.product(args)), len(args) );
			} HM(...args) {
				// harmonic mean
				args = args.flatten();
				return len(args) / args.reduce((t, x) => t + 1 / x, 0);
			} MR(...args) {
				// mid-range
				args = args.flatten();
				return (this.min(args) + this.max(args)) / 2;
			} MH(...args) {
				// mid-hinge
				args = args.flatten().sort();
				return (this.Q1(args) + this.Q3(args)) / 2;
			} MS(...args) {
				// mean square
				args = args.flatten();
				return args.reduce((t, e) => t + e**2, 0) / len(args);
			} RMS(...args) { return this.sqrt( this.MS(args) ); // root mean square
			} MAE(Ys, Xs) {
				// mean absolute error
				Ys = Ys.flatten();
				Xs = Xs.flatten();
				return Ys.reduce((t, e, i) => t + abs(e + Xs[i]), 0) / len(Ys);
			} ME(Ys, Xs) {
				// mean error
				Ys = Ys.flatten();
				Xs = Xs.flatten();
				return Ys.reduce((t, e, i) => t + e + Xs[i], 0) / len(Ys);
			} EV(list=[], probabilities=[]) {
				// expected value.
				list = list.flatten();
				probabilities = probabilities.flatten();
				return list.reduce((t, e, i) => t + (probabilities[i] === void 0 ? 1 : probabilities[i]) * e, 0);
			} SD(...args) { return this.sqrt( this.var(args) ); // standard deviation
			} SE(...args) {
				// standard error
				args = args.flatten();
				return this.SD(args) / this.sqrt( len(args) );
			} var(...args) {
				args = args.flatten();
				const MEAN = this.mean(args);
				return this.sum(0, dim(args), n => (args[n] - MEAN)**2, 1) / dim(args);
			} cov(X, Y) {
				X = X.flatten(); Y = Y.flatten();
				const Ex = this.EV(X), Ey = this.EV(Y);
				return this.EV( X.map((e, i) => (e - Ex)*(Y[i]-Ey)) );
			} absdev(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				const MEAN = this.mean(ns);
				return ns.reduce((absDev, n) => absDev + this.abs(n - MEAN), 0);
			} stdev() { return this.SD.apply(this, arguments);
			} stddev() { return this.SD.apply(this, arguments);
			} midrange() { return this.MR.apply(this, arguments);
			} midhinge() { return this.MH.apply(this, arguments);
			} heronian(a, b) { return (a + b + this.sqrt(a*b)) / 3; // heronian mean
			} lehmer(p, ...args) {
				args = args.flatten();
				return args.reduce((t, e) => t + e**p, 0) / args.reduce((t, e) => t + e**(p-1), 0)
			} quadraticmean(...args) { return this.sqrt( args.reduce((t, e) => t + e**2, 0) / len(args) );
			} cubicmean(...args) { return this.cbrt( args.reduce((t, e) => t + e**3, 0) / len(args) );
			} quarticmean(...args) { return this.nthrt( args.reduce((t, e) => t + e**4, 0) / len(args), 4 );
			} quinticmean(...args) { return this.nthrt( args.reduce((t, e) => t + e**5, 0) / len(args), 5 );
			} powmean(power, ...args) { return this.nthrt( args.reduce((t, e) => t + e**power, 0) / len(args), power );
			} linReg(xs, ys, Return="obj") {
				// linear regression
				xs = xs.tofar(); ys = ys.tofar();
				if (!len(xs)) throw Error("No elements given for first parameter of rMath.linReg()");
				if (!len(ys)) throw Error("No elements given for second parameter of rMath.linReg()");
				if ( xs.isNaN() ) throw TypeError(`array of numbers req. for first parameter of rMath.linReg(). Inputs: ${xs}`);
				if ( ys.isNaN() ) throw TypeError(`array of numbers req. for second parameter of rMath.linReg(). Inputs: ${ys}`);
				if (len(xs) === 1 || len(ys) === 1) {
					return Return === "obj" ? {
						m: ys[0] / xs[0],
						b: 0
					} : `y = ${ys[0] / xs[0]}x + 0`;
				}
				if (len(xs) !== len(ys)) {
					const MIN = this.min(len(xs), len(ys));
					for (; len(xs) > MIN ;) xs.pop();
					for (; len(ys) > MIN ;) ys.pop();
				}
				var m = (
					len(xs) * this.sum(0, dim(xs), n=>xs[n]*ys[n]) - this.total(xs) * this.total(ys)
				) / (len(xs) * this.total(xs.map(e => e**2)) - this.total(xs)**2),
				b = (this.total(ys) - m * this.total(xs)) / len(xs);
				if (Return === "obj") return {m: m, b: b};
				return `y = ${m}x + ${b}`;
			} erf(z) {
				return isNaN( z = Number(z) ) ?
					NaN :
					1.1283791670955126 * this.int(0, z, t => 1 / 𝑒**t**2);
					// 2 / sqrt(pi) * ...
				// erf(x) ≈ 3126/3125 sgn(x)sqrt(1-exp(-x^2))
			} erfc(z) {
				return isNaN( z = Number(z) ) ?
					NaN :
					1 - this.erf(z);
			} nCr(n, k) { return isNaN( n = Number(n) ) || isNaN( k = Number(k) ) ? NaN : this.nPr(n, k) / this.fact(k);
			} comb(n, k) { return this.nCr(n, k); // combination
			} nPr(n, k) { return isNaN( n = Number(n) ) || isNaN( k = Number(k) ) ? NaN : this.fact(n) / this.fact(n - k);
			} perm(n, k) { return this.nPr(n, k); // permuation
			} ifact(n) {
				if (isNaN( n = Number(n) )) return NaN;
				if (!n) return 1;
				if (n < 0) return NaN;
				for (var ans = 1, cur = 1; cur <= n; cur++)
					ans *= cur;
				return ans;
			} fact(x, acy=1e3, inc=.1) {
				// TODO: Fix for negative non-integer numbers
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( acy = Number(acy) )) return NaN;
				if (isNaN( inc = Number(inc) ) || !inc) return NaN;
				if ( x.isInt() ) return x < 0 ? NaN : this.ifact(x);
				if (x < 0) return this.fact(this.mod(x, 1), acy, inc) / this.prod(1, -floor(x),  j => x+j);
				if (x > 1) {
					let xm1 = this.mod(x, 1);
					return this.prod(1, floor(x), n => n + xm1) *
						this.fact(xm1, acy, inc);
				}
				var ans = this.int(0, acy, t=>t**x/𝑒**t, inc);
				return type(ans, 1) === "inf" ? NaN : ans;
			} factorial() { return this.fact.apply(this, arguments);
			} lcm(...args) {
				if (isArr(args[0])) args = args[0];
				return !len(args) ?
					0 :
				args.isNaN() ?
					NaN :
				!dim(args) ?
					args[0] :
				len(args) > 2 ?
					this.lcm( args[0], this.lcm(args.slice(1)) ) :
					abs(args[0] * args[1]) / this.gcd(args);
			} gcd(...args) {
				if (isArr(args[0])) args = args[0];
				if (!len(args)) return 0;
				if (args.isNaN()) return NaN;
				if (!dim(args)) return args[0];
				if (len(args) > 2) return this.gcd( args[0], this.gcd(args.slice(1)) );
				while (args[1]) args = [args[1], this.mod(...args)];
				return args[0];
			} gcf() { return this.gcd.apply(this, arguments);
			}
			//////////////////////////////////////// STATISTICS END ////////////////////////////////////////
			gamma(n, acy=1e3, inc=.1) {
				if (isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (isNaN( acy = Number(acy) )) return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				return this.fact(n-1, acy, inc);
			} beta(m, n, acy=1e3, inc=.1) {
				// Beta Function
				//           Γ(m)Γ(n)
				// β(m, n) = --------
				//           Γ(m + n)

				// β(m, n) = β(n, m)
				// β(x, 0) = 1
				// β(x, 1) = 1/x
				// β(m, -n) = undefined

				//               Γ(m)√π
				// β(m, 1/2) = ----------
				//             Γ(m + 1/2)
				// ∫_0^{π/2} sin^m(x)cos^n(x)dx = β((m+1)/2, (n+1/2))/2
				// \frac12\int_0^{π/2}\sin^{2m-1}\theta\cos^{2n-1}d\theta=\Beta\left(m, n\right)
				return this.gamma(m, acy, inc) * this.gamma(n, acy, inc) /
					this.gamma(m + n, acy, inc);
			} igammal(n, inc=.1) {
				// lower incomplete gamma function
				if (isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (isNaN( inc = Number(inc) )) return NaN;
				n--;
				var ans = this.int(0, n, t=>t**n/𝑒**t, inc);
				return type(ans, 1) === "inf" ? NaN : n;
			} igammau(n, acy=1000, inc=.1) {
				// upper incomplete gamma function
				if (isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (isNaN( acy = Number(acy) )) return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				n--;
				var ans = this.int(n, acy, t=>t**n/𝑒**t, inc);
				return type(ans, 1) === "inf" ? NaN : n;
			} isPrime(n) { return this.isNaN(n) ? NaN : n?.isPrime?.();
			} pascal(row, col) {
				// pascal's triangle
				if (isNaN( row = Number(row) )) return NaN;
				if (col !== "all") col = Number(col);
				if (typeof col !== "number" && col !== "all") return NaN;
				row--;
				if (col?.lower?.() !== "all") return this.nCr(row, col-1);
				for (var i = 0, arr = []; i <= row ;)
					arr.push( this.nCr(row, i++) );
				return arr;
			} fib(n=1) {
				// nth fibonacci number
				// "round" is needed to counteract the floating point rounding errors.
				return isNaN( n = Number(n) ) ? NaN : round(
					( ϕ**n - this.Phi**n ) / this.sqrt5
				);
				// ⌊ ϕⁿ/√5 ⌉ ∀ n∈ℤ > -1
			} fibonacci(/*n*/) { return this.fib.apply(this, arguments);
			} lucas(n=1) {
				return isNaN( n = Number(n) ) ?
					NaN :
					round( ϕ**n + this.Phi**n );
				// ⌊ϕⁿ⌉, n ∈ ℕ>1
			} primeFactorInt(n) {
				if (isNaN( n = Number(n) )) return NaN;
				if ( n.isPrime() ) return n;
				for (var i = 2, primeFactors = []; i <= n; ++i) {
					if (!(n % i)) {
						primeFactors.push( this.primeFactorInt(i).flatten() );
						n /= i;
						i = 1;
					}
				}
				return primeFactors;
			} findFactors(n) {
				if (isNaN( n = Number(n) )) return NaN;
				for (var i = 2, factors = [1, n], n = this.sqrt(n); i <= n; i++)
					if (!(n % i)) factors.push(i, n / i);
				return factors;
			} iMaxFactor(n) {
				if (isNaN( n = Number(n) )) return NaN;
				for (var i = n;;)
					if (!(n % --i))
						return i;
			} synthDiv(coeffs, /*x-*/divisor, includeRemainder=true, remainderType="string") {
				if (type(coeffs, 1) !== "arr") return NaN;
				if (type(remainderType) !== "string") return NaN;
				if (isNaN( divisor = Number(divisor) )) return NaN;
				for (var coeff = coeffs[0], coeffs2 = [coeffs[0]], n = len(coeffs), i = 1; i < n; i++) {
					coeff = coeff * divisor + coeffs[i];
					coeffs2.push(coeff);
				}
				coeffs = ["string", "str"].incl(remainderType.lower()) ?
					coeffs2.mod(dim(coeffs2), e => this.isClose(e, 0, 1e-11) ?
						0 :
						`${e}/${divisor < 0 ?
							`(x+${-divisor})` :
							`(x-${divisor})`}`) :
					coeffs2;
				return includeRemainder ? coeffs : coeffs.pop2();
			} simpRad(rad) {
				if (isNaN( rad = Number(rad) )) return NaN;
				for (var factor = 1, i = 2, sqrt = this.sqrt(this.abs(rad)); i <= sqrt; i += 1 + (i > 2))
					while ( !(rad % i**2) ) {
						rad /= i**2;
						factor *= i;
					}
				return `${factor}${rad < 0 ? "i" : ""}√${this.abs(rad)}`.remove(/^1|√1$/);
			} PythagTriple(maxSize=1000) {
				// TODO: Fix
				if (typeof maxSize !== "number") maxSize = 1000;
				for (var a = 1, b = 1, c, triples = []; a < maxSize; a++) {
					for (b = 1; b < maxSize; b++) {
						c = this.hypot(a, b);
						if (!c.isInt()) continue;
						if (
							!len(
								triples.filter(
									e => c%e[2] && ( a%e[0] && b%e[1] || a%e[1] && b%e[0] )
								)
							)
						) triples.push([a, b, c]);
					}
				}
				return triples;
			} iPythagorean(a=1, m=1, form=Array) {
				// only finds integer pythagorean triples
				// (a+m) mod₀ 2 = 0  <-->  formula works
				// (a+b) modₖ 2 = (a-b) modₖ 2
				// a^2 + b^2 = (b+m)^2
				if (isNaN( a = Number(a) )) return "No Solution";
				if (isNaN( m = Number(m) )) return "No Solution";
				if (fpart(a) || fpart(m))   return "No Solution";
				if (this.mod(a+m, 2))       return "No Solution";

				var b = (a**2 - m**2) / (2*m),
					c = b + m;
				if (fpart(b) || fpart(c)) return "No Solution";
				return form === Array ?
					[a, b, c] :
					{ a: a, b: b, c: c };
			} neg(num=0, number=false) { return number ? -num : num[0] === "-" ? num.slice(1) : `-${num}`; // negate
			} ssgn(snum="0.0") { return snum[0] === "-" ? -1 : +!/0+\.?0*/.in(snum); // string sign
			} ssign(snum="0.0") { return this.ssgn(snum); // string sign
			} sabs(snum="0.0") { return snum[0] === "-" ? snum.slice(1) : snum; // string absolute value
			} add(a="0.0", b="0.0", number=true) { return number ? Number(sMath.add(a, b)) : sMath.add(a, b);
			} sub(a="0.0", b="0.0", number=true) { return number ? Number(sMath.sub(a, b)) : sMath.sub(a, b);
			} mul(a="0.0", b="0.0", number=true) { return number ? Number(sMath.mul(a, b)) : sMath.mul(a, b);
			} div(num="0.0", denom="1.0", number=true, precision=18) {
				return number ?
					Number(sMath.div(a, b, precision)) :
					sMath.div(a, b, precision);
			} cdiv(num="0.0", denom="1.0", number=true) { return this.ceil ( this.div( num, denom, number, 1 ) );
			} fdiv(num="0.0", denom="1.0", number=true) { return this.floor( this.div( num, denom, number, 1 ) );
			} rdiv(num="0.0", denom="1.0", number=true) { return this.round( this.div( num, denom, number, 1 ) );
			} tdiv(num="0.0", denom="1.0", number=true) { return this.trunc( this.div( num, denom, number, 1 ) );
			} mod(a, n=1, k=0) {
				// a modₖ n
				// modulo using the formula
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( k = Number(k) )) return NaN;
				return a - n*floor(a/n) + k;
			} rem(a, n=1, k=0) {
				// a remₖ n
				// different from mod()
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( k = Number(k) )) return NaN;
				return a - n*int(a/n) + k;
			} remainder(/*a, n, k*/) { return this.rem.apply(this, arguments);
			} parity(x=0) { return x % 2 ? "odd" : "even";
			} isClose(n1, n2, range=Number.EPSILON) {
				return isNaN( n1 = Number(n1) ) ||
					isNaN( n2 = Number(n2) ) ||
					isNaN( range = Number(range) ) ?
						NaN :
						n1 > n2 - range && n1 < n2 + range;
			} dist(x1=0, y1=0, x2=0, y2=0) {
				if (isNaN( x1 = Number(x1) )) return NaN;
				if (isNaN( y1 = Number(y1) )) return NaN;
				if (isNaN( x2 = Number(x2) )) return NaN;
				if (isNaN( y2 = Number(y2) )) return NaN;
				return this.hypot(x2-x1, y2-y1);
			} dist2(x_0, y_0, a, b, c) {
				// minimum distance from a line to a point
				// (x₀, y₀) , ax+by=c
				if (isNaN( x_0 = Number(x_0) )) return NaN;
				if (isNaN( y_0 = Number(y_0) )) return NaN;
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( b = Number(b) )) return NaN;
				if (isNaN( c = Number(c) )) return NaN;
				return this.abs(a*x_0 + b*y_0 + c) / this.hypot(a, b);
			} copysign(a, b) { return isNaN( a = Number(a) ) || isNaN( b = Number(b) ) ? NaN : this.abs(a) * this.sgn(b);
			} trunc(n) { return isNaN( n = Number(n) ) ? n : int(n);
			} truncate(n) { return this.trunc.apply(this, arguments);
			} isNaN(e) { return isNaN( Number(e) ); // is not a number
			} isAN(e) { return !this.isNaN(e); // is a number
			} isaN(e) { return this.isAN(e); // is a number
			} isNNaN(e) { return this.isAN(e); // is not not a number. isaN, isAN
			} imul(a, b) { return isNaN( a = Number(a) ) || isNaN( b = Number(b) ) ? NaN : this.Math.imul(a, b);
			} fround(n) { return isNaN( n = Number(n) ) ? n : this.Math.fround(n);
			} sqrt(n) { return isNaN( n = Number(n) ) ? n : this.nthrt(n, 2);
			} cbrt(n) { return isNaN( n = Number(n) ) ? n : this.nthrt(n, 3);
			} sign(n) { return isNaN( n = Number(n) ) ? n : this.sgn(n);
			} exp(n, x=𝑒) { return isNaN( n = Number(n) ) || isNaN( x = Number(x) ) ? NaN : x ** n;
			} round(n) { return isNaN( n = Number(n) ) ? n : round(n);
			} floor(n) { return isNaN( n = Number(n) ) ? n : floor(n);
			} ceil(n) { return isNaN( n = Number(n) ) ? n : ceil(n);
			} rand() { return rand();
			} random() { return rand();
			} pow(a=1, b=1) {
				// TODO: Make "pow" and "nthrt" faster
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( b = Number(b) )) return NaN;
				for (var y = 1, c = b, d = a ;; a *= a) {
					b & 1 && (y *= a);
					b >>= 1;
					if (!b) return (this.nthrt(d, 1 / fpart(c)) || 1) * y;
				}
			} nthrt(x, rt=2) {
				if (isNaN( x = Number(x) ) || isNaN( rt = Number(rt) )) return NaN;
				if (rt < 0) return this.pow(x, rt);
				if (!rt || !(rt % 2) && x < 0) return NaN;
				if (!x) return 0;
				for (var ans = floor(x/2/rt), tmp=1, i=1000; i --> 0 && ans != ans + tmp; tmp /= 10) while (
					ans != (ans += abs(x - (ans - tmp)**rt) < abs(x - ans**rt) ? -tmp :
						abs(x - (ans + tmp)**rt) < abs(x - ans**rt) ? tmp : 0)
				);
				return this.copysign(ans, x);
			} square(n) { return isNaN( n = Number(n) ) ? NaN : n ** 2;
			} cube(n) { return isNaN( n = Number(n) ) ? NaN : n ** 3;
			} tesseract(n) { return isNaN( n = Number(n) ) ? NaN : n ** 4;
			} findPrimes(l=100, s=Infinity) {
				if (isNaN( l = Number(l) )) return NaN;
				if (isNaN( s = Number(s) )) return NaN;
				for (var i = 3, primes = [2]; len(primes) < l && i <= s; i += 2)
					i.isPrime() && primes.push(i);
				return primes;
			} li(x, incOrAcy=.001, form=1) {
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( incOrAcy = Number(incOrAcy) )) return NaN;
				if (x < 0) return NaN;
				if (form === 3) { // fast mode uses the following: li(x) ~ π(x)
					// not 100% accurate, but with large values,
					// it is so much faster that the inaccuracy doesn't matter
					return this.π(x);
				} else if (form === 1) { // uses increment for integrals
					return x === Infinity || !x ?
						x :
						x.inRange(0, 1, false) ?
							this.int(1e-20, x, x => 1/this.ln(x), incOrAcy) :
							1.045163780117493 + this.int(2, x, t => 1/this.ln(t), incOrAcy);
				} else if (form === 2) { // uses accuracy for infinite summation
					const f = x => this.γ + this.ln(this.ln(x)) + this.sqrt(x) * 
						this.sum(1, incOrAcy, n=>((-1)**(n-1) * this.ln(x)**n) / (this.fact(n) * 2**(n-1)) * 
							this.sum(0, floor( (n-1) / 2), k=>1/(2*k+1), 1), 1),
						ans = f(x);
					while (isNaN(ans)) {
						incOrAcy /= 2;
						ans = f(x);
					}
					return ans;
				}
			} Li(x, incOrAcy=.001, form=1) {
				return isNaN( x = Number(x) ) || isNaN( incOrAcy = Number(incOrAcy) ) ?
					NaN :
					this.li.apply(this, arguments) - 1.045163780117493;
			} Ei(x, incOrAcy=.001, form=1) {
				return isNaN( x = Number(x) ) ? NaN : this.li(e**x, incOrAcy, form);
				// Exponential integral
				// Ei(x) = li(e^x) ∀ -π < Im(x) ≤ π
			} tetrate(a, n, {Switch=false, number=false}={}) {
				return this.hyper4(a, n, {
					Switch: Switch,
					number: number
				});
			} hyper0(n) { return isNaN(n = Number(n)) ? NaN : this.add(n, 1);
			} hyper1(a, n) { return isNaN(a = Number(a)) || isNaN(n = Number(n)) ? NaN : this.add(a, n);
			} hyper2(a, n) { return isNaN(a = Number(a)) || isNaN(n = Number(n)) ? NaN : this.mul(a, n);
			} hyper3(a, n) { return isNaN(a = Number(a)) || isNaN(n = Number(n)) ? NaN : a ** n;
			} hyper4(a, n, {Switch=false, number=false}={}) {
				// a ↑↑ n = a^^n = a^a^a^... n times = ⁿa = a ↑² n
				if (this.isNaN( a = BigInt(a) )) return NaN;
				if (this.isNaN( n = BigInt(n) )) return NaN;
				if (Switch) return this.hyper4(n, a, {
					Switch: !1,
					number: number
				});
				const A = a;
				while ( n --> 1 )
					a = A ** a;
				return number ? Number(a) : a;
			}
			////////////////////////////////////// TRIGONOMETRY START //////////////////////////////////////
			sin(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ : this.sum(0, 25, n => (-1)**n / this.fact(2*n+1)*(θ%(2*π))**(2*n+1) );
			} cos(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ : this.sum(0, 25, n => (-1)**n / this.fact(2*n)*(θ%(2*π))**(2*n) );
			} tan(θ) { return isNaN( θ = Number(θ) ) ? θ : this.sin(θ) / this.cos(θ);
			} csc(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 / this.sin(θ);
			} sec(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 / this.cos(θ);
			} cot(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 / this.tan(θ);
			} asin(x) {
				return isNaN( x = Number(x) ) || x > 1 || x < -1 ? NaN :
					this.sum(0, 80, n=>this.ifact(2*n) / (4**n*this.ifact(n)**2 * (2*n+1))*(x**(2*n+1)));
			} acos(x) { return isNaN( x = Number(x) ) ? z : π_2 - this.asin(x);
			} atan(x) { return isNaN( x = Number(x) ) ? z : this.asin(x / this.hypot(x, 1));
			} atan2(x, y, flipArgs=false) {
				// most places use atan2(y, x), but that is stupid.
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( y = Number(y) )) return NaN;
				if (flipArgs) return this.atan2(y, x, !1);
				const output = this.atan(y / x);
				return x > 0 ?
					output :
					!x ?
						this.sgn(y)**2 / this.sgn(y) * π_2 :
						y >= 0 ? output + π : output - π;
			} acsc(x) { return isNaN( x = Number(x) ) ? x : this.asin(1/x);
			} asec(x) { return isNaN( x = Number(x) ) ? x : this.acos(1/x);
			} acot(x) { return isNaN( x = Number(x) ) ? x : !x ? π_2 : this.atan(1/x) + π*(x < 0);
			} excst(θ) { return isNaN( θ = Number(θ) ) ? θ : this.hypot( this.exsec(θ), this.cot(θ) );
			} exset(θ) { return isNaN( θ = Number(θ) ) ? θ : this.hypot( this.exsec(θ), this.tan(θ) );
			} vcs(θ) { return isNaN( θ = Number(θ) ) ? θ : this.hypot( this.verc(θ), this.sin(θ) );
			} cvs(θ) { return isNaN( θ = Number(θ) ) ? θ : this.hypot( 1, this.sin(θ) );
			} acvs(x) { return isNaN( x = Number(x) ) ? x : this.asin(x**2 - 1);
			} ccvs(θ) { return isNaN( θ = Number(θ) ) ? θ : this.hypot( 1, this.cos(θ) );
			} accvs(x) { return isNaN( x = Number(x) ) ? x : this.acos(x**2 - 1);
			} crd(θ) { return isNaN( θ = Number(θ) ) ? θ : 2 * this.sin(θ / 2);
			} acrd(x) { return isNaN( x = Number(x) ) ? x : 2 * this.asin(x / 2);
			} ccrd(θ) { return isNaN( θ = Number(θ) ) ? θ : 2 * this.cos(θ / 2);
			} accrd(x) { return isNaN( x = Number(x) ) ? x : π_2 - this.acrd(x);
			} exsec(x) { return isNaN( θ = Number(θ) ) ? θ : this.sec(θ) - 1;
			} aexsec(x) { return isNaN( x = Number(x) ) ? x : this.asec(x + 1);
			} excsc(θ) { return isNaN( θ = Number(θ) ) ? θ : this.csc(θ) - 1;
			} aexcsc(x) { return isNaN( x = Number(x) ) ? x : this.acsc(x + 1);
			} vers(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 - this.cos(θ);
			} avers(x) { return isNaN( x = Number(x) ) ? x : this.acos(x + 1);
			} verc(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 + this.cos(θ);
			} averc(x) { return isNaN( x = Number(x) ) ? x : this.acos(x - 1);
			} cvers(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 - this.sin(θ);
			} acvers(x) { return isNaN( x = Number(x) ) ? x : this.asin(1 - x);
			} cverc(θ) { return isNaN( θ = Number(θ) ) ? θ : 1 + this.sin(θ);
			} acverc(x) { return isNaN( x = Number(x) ) ? x : this.asin(x - 1);
			} hav(θ) { return isNaN( θ = Number(θ) ) ? θ : this.vers(θ) / 2;
			} ahav(x) { return isNaN( x = Number(x) ) ? x : this.acos(1 - 2*x);
			} hverc(θ) { return isNaN( θ = Number(θ) ) ? θ : this.verc(θ) / 2;
			} ahverc(x) { return isNaN( x = Number(x) ) ? x : this.acos(2*x - 1);
			} hcvers(θ) { return isNaN( θ = Number(θ) ) ? θ : this.cvers(θ) / 2;
			} ahcvers(x) { return isNaN( x = Number(x) ) ? x : this.asin(1 - 2*x);
			} hcverc(θ) { return isNaN( θ = Number(θ) ) ? θ : this.cverc(θ) / 2;
			} ahcverc(x) { return isNaN( x = Number(x) ) ? x : this.asin(2*x - 1);
			} //// HYPERBOLIC TRIG
			sinh(x) { return isNaN( x = Number(x) ) ? x : (𝑒**x - 𝑒**-x) / 2;
			} cosh(x) { return isNaN( x = Number(x) ) ? x : (𝑒**x + 𝑒**-x) / 2;
			} tanh(x) { return isNaN( x = Number(x) ) ? x : this.sinh(x) / this.cosh(x);
			} csch(x) { return isNaN( x = Number(x) ) ? x : 1 / this.sinh(x);
			} sech(x) { return isNaN( x = Number(x) ) ? x : 1 / this.cosh(x);
			} coth(x) { return isNaN( x = Number(x) ) ? x : 1 / this.tanh(x);
			} asinh(x) { return isNaN( x = Number(x) ) ? x : this.ln( x + this.hypot(x, 1) );
			} acosh(x) { return isNaN( x = Number(x) ) ? x : this.ln( x + this.sqrt(x**2-1) );
			} atanh(x) { return isNaN( x = Number(x) ) ? x : this.ln( (x+1) / (1-x) ) / 2;
			} acsch(x) { return isNaN( x = Number(x) ) ? x : this.asinh(1/x);
			} asech(x) { return isNaN( x = Number(x) ) ? x : this.acosh(1/x);
			} acoth(x) { return isNaN( x = Number(x) ) ? x : this.atanh(1/x);
			} excsth(x) { return isNaN( x = Number(x) ) ? x : this.hypot( this.coth(x), this.exsech(x) );
			} exseth(x) { return isNaN( x = Number(x) ) ? x : this.hypot( this.exsech(x), this.tanh(x) );
			} vcsh(x) { return isNaN( x = Number(x) ) ? x : this.hypot( this.verch(x), this.sinh(x) );
			} cvsh(x) { return isNaN( x = Number(x) ) ? x : this.hypot( 1, this.sinh(x) );
			} acvsh(x) { return isNaN( x = Number(x) ) ? x : this.asinh(x**2 - 1);
			} ccvsh(x) { return isNaN( x = Number(x) ) ? x : this.hypot( 1, this.cosh(x) );
			} accvsh(x) { return isNaN( x = Number(x) ) ? x : this.acosh(x**2 - 1);
			} crdh(x) { return isNaN( x = Number(x) ) ? x : 2*this.sinh(x / 2);
			} acrdh(x) { return isNaN( x = Number(x) ) ? x : 2*this.asinh(x / 2);
			} ccrdh(x) { return isNaN( x = Number(x) ) ? x : 2*this.cosh(x / 2);
			} accrdh(x) { return isNaN( x = Number(x) ) ? x : π_2 - 2*this.asinh(x / 2);
			} exsech(x) { return isNaN( x = Number(x) ) ? x : this.sech(x) - 1;
			} aexsech(x) { return isNaN( x = Number(x) ) ? x : this.asech(x + 1);
			} excsch(x) { return isNaN( x = Number(x) ) ? x : this.csch(x) - 1;
			} aexcsch(x) { return isNaN( x = Number(x) ) ? x : this.acsch(x + 1);
			} versh(x) { return isNaN( x = Number(x) ) ? x : 1 - this.cosh(x);
			} aversh(x) { return isNaN( x = Number(x) ) ? x : this.acosh(x + 1);
			} verch(x) { return isNaN( x = Number(x) ) ? x : 1 + this.cosh(x);
			} averch(x) { return isNaN( x = Number(x) ) ? x : this.acosh(x - 1);
			} cversh(x) { return isNaN( x = Number(x) ) ? x : 1 - this.sinh(x);
			} acversh(x) { return isNaN( x = Number(x) ) ? x : this.asinh(1 - x);
			} cverch(x) { return isNaN( x = Number(x) ) ? x : 1 + this.sinh(x);
			} acverch(x) { return isNaN( x = Number(x) ) ? x : this.asinh(x - 1);
			} hversh(x) { return isNaN( x = Number(x) ) ? x : this.versh(x) / 2;
			} ahversh(x) { return isNaN( x = Number(x) ) ? x : this.acosh(1 - 2*x);
			} hverch(x) { return isNaN( x = Number(x) ) ? x : this.verch(x) / 2;
			} ahverch(x) { return isNaN( x = Number(x) ) ? x : this.acosh(2*x - 1);
			} hcversh(x) { return isNaN( x = Number(x) ) ? x : this.cversh(x) / 2;
			} ahcversh(x) { return isNaN( x = Number(x) ) ? x : this.asinh(1 - 2*x);
			} hcverch(x) { return isNaN( x = Number(x) ) ? x : this.cverch(x) / 2;
			} ahcverch(x) { return isNaN( x = Number(x) ) ? x : this.asinh(2*x - 1);
			} // integral trig functions
			Si(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.int(0, x, t => this.sin(t) / t, inc);
			} si(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.Si(x) - this.π_2;
			} Cin(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.int(0, x, t => ( 1 - this.cos(t) ) / t, inc );
			} Ci(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					γ + this.ln(x) - this.Cin(x, inc);
			} Shi(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.int(0, x, t => this.sinh(t) / t, inc );
			} Chi(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					γ + this.ln(x) + this.int(0, x, t => (this.cosh(t) - 1) / t, inc );
			} tanhc(z) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.tanh(z) / z;
			} sinhc(z) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.sinh(z) / z;
			} Tanc(z) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.tan (z) / z;
			} Coshc(z) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.cosh(z) / z;
			} gd(x, inc=.001) {
				return isNaN( x = Number(x) ) ? x : this.int(0, x, t => this.sech(t), inc);
				// gudermannian function
			} lam(x, inc=.001) {
				// inverse gudermannian function
				// Lambertian function
				return isNaN( x = Number(x) ) || abs(x) >= π_2 ?
					NaN :
					this.int(0, x, t => this.sec(t), inc);
			} degrees(n) { return isNaN( n = Number(n) ) ? n : n * this.rtod;
			} radians(n) { return isNaN( n = Number(n) ) ? n : n * this.dtor;
			}
			/////////////////////////////////////// TRIGONOMETRY END ///////////////////////////////////////
			H(x, form=1) {
				// Heaveside step function
				// Heaveside theta function
				if (isNaN( x = Number(x) )) return NaN;
				if (form === 1) return this.sgn( this.sgn(x) + 1 )
				if (form === 2) return (1 + this.sgn(x)) / 2
				return +(x > 0);
			} W(x, acy=Infinity) {
				// Lambert W function, product log
				if (isNaN( x = Number(x) )) return NaN;
				if (x < -1 / e) return NaN;
				if (x < e) {
					if (acy === Infinity) {
						for (var total = e**-x, prev;;) if ( (prev = total) === (total = e**-(x*total)) ) break
					} else for (var total = e**-x; acy --> 0 ;) total = e**-(x*total);
					return x * total;
				} else {
					if (acy === Infinity) {
						for (var total = this.ln(x), prev;;) if ( (prev = total) === (total = this.ln( x / total )) ) break
					} else for (var total = this.ln(x); acy --> 0 ;) total = this.ln( x / total );
					return total;
				}
			} productLog(/*x, acy*/) { return this.W.apply(this, arguments);
			} deriv(f=x=>2*x+1, x=1, Δx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used as the variable
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "") throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = RegExp(`\\d+${VARIABLE}`, "g"),
						arr = [];
					let values = f.matchAll(regex);
					let value = values.next();
					while (!value.done) {
						arr.push(value.value);
						value = values.next();
					}
					arr = arr.filter(e=>e.index > 0).smap(e=>[e[0], e.index]);
					for (const a of arr) {
						f = f.substr(0, a[1]) +
						a[0].replace(/(?<=\d+)/, "*") +
						f.slice(a[1] + len(a[0]))
					}
					try { f = Function(`${VARIABLE}`,`return ${f.replace(/\^/g, "**")}`) }
					catch { throw Error("Variable name declaration is missing, and `x` was not used.") }
				}

				if (!( f(x) || f(x + Δx) )) return 0;
				let numerator = f(x + Δx) - f(x);
				while ( !numerator ) {
					Δx *= 10;
					numerator = f(x + Δx) - f(x);
				}
				return numerator / Δx;
			} tanLine(f=x=>x, x=1, ret=Object, Δx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used.
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "") throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = RegExp(`\\d+${VARIABLE}`, "g"),
						arr = [];
					let values = f.matchAll(regex);
					let value = values.next();
					while (!value.done) {
						arr.push(value.value);
						value = values.next();
					}
					for (const a of arr.smap(e=>[e[0], e.index]).reverse()) {
						f = f.substr(0, a[1]) +
						a[0].replace(/(?<=\d+)/, "*") +
						f.substr(a[1] + len(a[0]))
					}
					try { f = Function(`${VARIABLE}`,`return ${f.replace(/\^/g, "**")}`) }
					catch { throw Error("Variable name declaration is missing, and `x` was not used.") }
				}

				var m;
				if (!( f(x) || f(x + Δx) )) m = 0;
				else {
					let numerator = f(x + Δx) - f(x);
					while ( !numerator ) {
						Δx *= 2;
						numerator = f(x + Δx) - f(x);
					}
					m = numerator / Δx;
				}
				const b = f(x) - x*m;
				type(ret, 1) === "str" && (ret = ret.lower());
				if ( [Object, "o", "obj", "object"].incl(ret) ) return {
					m: m,
					b: b
				}
				else if ( [String, "s", "str", "string"].incl(ret) )
					return `${ m ? `${m}x` : "" }${ b<0 ? `${b}` : b ? `${m ? "+" : ""}${b}` : "" }`.
						start("0").remove(/1(?=x)/);
			} base10Conv(n, base, decAcy=54, numberOnly=false) {
				// only works for base <= 10
				// TODO: Fix
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( n = Number(n) ) || base < 2) return NaN;
				if (isNaN( base = Number(base) )) return NaN;
				if (base < 2) throw Error("Base must be greater than 2");
				if (base > 10) throw Error("base x > 10 is not supported yet");
				var iPart = sMath.ipart(`${n}`),
					fPart = `${fpart(n, 0)}`;
				var str = "";
				while (sMath.eq.nz(iPart)) {
					str += sMath.mod(iPart, base);
					iPart = sMath.fdiv(iPart, base);
				}
				str = str.reverse();
				fPart && (str += ".");
				var str_len = len(str);
				while (fPart !== 0) {
					fPart *= base;
					str += base > 10 ?
						this.base10Conv(floor(fPart)) :
						floor(fPart);
					fPart = fpart(fPart);
					if (len(str) - str_len >= decAcy) break;
				}
				return `${numberOnly ? "" : `${base}:`}${str}`.remove(/\.?0*$/);
			} bin(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0b" : colon ? "2:" : ""}${this.base10Conv(x, 2).slc(2)}`;
			} oct(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0o" : colon ? "8:" : ""}${this.base10Conv(x, 8).slc(2)}`;
			} hex(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0x" : colon ? "16:" : ""}${this.base10Conv(x, 16).slc(3)}`;
			} timesTable(start=0, end=9) {
				for (var i = floor(++end), j, table = []; i --> start ;)
					for (j = floor(end), table[i] = []; j --> start ;)
						table[i][j] = i * j;
				return table;
			} cosNxSimplify(str="cos(x)") {
				typeof str === "number" && !(str % 1) && (str = `cos(${str}x)`);
				if (typeof str !== "string") return "";
				if (/^cos\d+x$/.in(str)) str = `cos(${str.match(/\d+/)[0]}x)`;

				for (var tmp; /\(\d+x\)/.in(str) ;) {
					str = str.replace(/\(-?1x\)/g, "(x)");
					str = str.replace(/cos\(-?0x\)/g, "1");
					tmp = /cos\((\d+)x\)/.exec(str);
					if (tmp[1])str = str.replace(/cos\((\d+)x\)/, `[2cosxcos(${+tmp[1]-1}x)-cos(${+tmp[1]-2}x)]`);
					str = str.replace(/\(-?1x\)/g, "(x)").replace(/cos\(-?0x\)/g, "1");
				}
				str = str.replace(/\(x\)/g, "x").replace(/cosxcosx/g, "cos^2x");
				return str.substring( 1, dim(str) ).replace(/^os$/, "cosx");
			} heron(a=1, b=1, c=1) {
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( b = Number(b) )) return NaN;
				if (isNaN( c = Number(c) )) return NaN;
				const s = (a + b + c) / 2;
				return this.sqrt(s * (s-a) * (s-b) * (s-c));
			} tempConv(value=0, startSystem="f", endSystem=LibSettings.MATH_TEMPCONV_DEFAULT_END_SYSTEM) {
				// temperature converter
				if (this.isNaN(value)) return NaN;
				if (type(startSystem) !== "string") return NaN;
				if (type(endSystem) !== "string") return NaN;
				startSystem.lower() === "celcius"     && (startSystem = "c");
				startSystem.lower() === "fahrenheit"  && (startSystem = "f");
				startSystem.lower() === "kelvin"      && (startSystem = "k");
				/ra(nkine)?/i.in(startSystem.lower()) && (startSystem = "r");
				endSystem  .lower() === "celcius"     && ( endSystem  = "c");
				endSystem  .lower() === "fahrenheit"  && ( endSystem  = "f");
				endSystem  .lower() === "kelvin"      && ( endSystem  = "k");
				/ra(nkine)?/i.in( endSystem .lower()) && ( endSystem  = "r");
				startSystem = startSystem.lower(); endSystem = endSystem.lower();
				if (startSystem === endSystem) return value;
				if (startSystem === "c") {
					switch (endSystem) {
						case "f": return 1.8*value + 32;
						case "k": return value + 273.15;
						case "r": return 1.8*value + 491.67;
						default: throw Error("Invalid 3rd Input to function");
					}
				} else if (startSystem === "f") {
					switch (endSystem) {
						case "c": return 5/9*(value - 32);
						case "k": return 5/9*(value - 32) + 273.15;
						case "r": return value + 459.67;
						default: throw Error("Invalid 3rd Input to function");
					}
				} else if (startSystem === "k") {
					switch (endSystem) {
						case "c": return value - 273.15;
						case "f": return 1.8*value - 459.67;
						case "r": return 1.8*value;
						default: throw Error("Invalid 3rd Input to function");
					}
				} else if (startSystem === "r") {
					switch (endSystem) {
						case "c": return 5/9*value - 273.15;
						case "f": return value - 459.67;
						case "k": return 5/9*value;
						default: throw Error("Invalid 3rd Input to function");
					}
				} else throw Error("Invalid 2nd Input to function");
			} coprime(a, b) { return this.gcd(a, b) === 1; // returns coprimality of a and b
			} ncoprime(a, b) { return this.gcd(a, b) !== 1; // returns inverse coprimality of a and b
			}
			///////////////////////////////////// SET OPERATIONS START /////////////////////////////////////
			cumsum(set) { return type(set, 1) === "set" ? set.cumsum() : NaN; // cumulative sum
			} set(...args) { return new this.Set(...args.flatten() );
			} setUnion(set1, set2) {
				return type(set1, 1) === "set" ?
					type(set2, 1) === "set" ?
						len(set1) >= len(set2) ?
							set1.union( set2, 1 ) :
							set2.union( set1, 1 ) :
						set1 :
					type(set2, 1) === "set" ?
						set2 :
						!1;
			} setIntersection(set1, set2) {
				return type(set1, 1) === "set" ?
					type(set2, 1) === "set" ?
						len(set1) >= len(set2) ?
							set1.intersection( set2, 1 ) :
							set2.intersection( set1, 1 ) :
						set1 :
					type(set2, 1) === "set" ?
						set2 :
						!1;
			}
			////////////////////////////////////// SET OPERATIONS END //////////////////////////////////////
			harmonic(n=1, decimals=18) {
				// harmonic series
				return this.sum(
					1,
					int(n),
					n => this.div(1, n, !0, 18)
				)
			} fraction(numer=0, denom=0) { return fMath.new(numer, denom);
			} complex(re=0, im=0) { return cMath.new(re, im);
			} bigint(value=0) { try { return BigInt(value) } catch { return NaN }
			} number(value=0) { try { return Number(value) } catch { return NaN }
			} toAccountingStr(n=0) { return this.isNaN(n) ? NaN : n < 0 ? `(${-n})` : n+""
			} collatz(x=2, ltx=true) {
				if (this.isNaN(x) || x < 0) return NaN;
				x = BigInt(int(x));
				const infinity = 10n**312n;
				if (ltx) {
					if (x === 1n) return 0n; 
					let y = x;
					for (var i = 0n; x >= y && i < infinity; i++)
						x = x % 2n ? 3n*x+1n : x >> 1n;
				} else {
					for (var i = 0n; x !== 1n && i < infinity; i++)
						x = x % 2n ? 3n*x+1n : x >> 1n;
				}
				return i === infinity ? Infinity : i;
			} _pow(x=0) {
				if (!x) return [0];
				if (fpart(x) || this.isNaN(x)) return NaN;
				x = int(x);
				var negative = !1;
				if (x < 0) {
					negative = !0;
					x *= -1;
				}
				let arr = [1];
				while (arr.last() < x) for (var i = len(arr); i --> 0 ;) if (x >= arr.last() + arr[i]) {
					arr.push( arr.last() + arr[i] );
					break;
				}
				negative && arr.push(-arr.last());
				return arr;
			} nextUp(x=0) {
				if (isNaN(x)) return NaN;
				if (x === -Infinity) return -Number.MAX_VALUE;
				if (x === Infinity) return Infinity;
				if (x === Number.MAX_VALUE) return Infinity;
				var y = x * (x < 0 ? 1 - Number.EPSILON / 2 : 1 + Number.EPSILON);
				if (y === x)
					y = Number.MIN_VALUE * Number.EPSILON > 0 ? x + Number.MIN_VALUE * Number.EPSILON : x + Number.MIN_VALUE;
				if (y === Infinity) y = Number.MAX_VALUE;
				var b = x + (y - x) / 2;
				if (x < b && b < y) y = b;
				var c = (y + x) / 2;
				if (x < c && c < y) y = c;
				return y === 0 ? -0 : y;
			} nextDown(x=0) { return -this.nextUp(-x);
			} nextAfter(x=0, y=Infinity) { return x === y ? x : x > y ? this.nextDown(x) : this.nextUp(x);
			} ulp(x=1) { return x < 0 ? this.nextUp(x) - x : x - this.nextDown(x);
			} midpoint([x1, y1], [x2, y2]) { return [(x1+x2)/2, (y1+y2)/2];
			}
			// piApprox
			// simplify sin(nx)
			// simplify tan(nx)
			// bell numbers
			// pell numbers
			// polylogarithms
			// Beta function
			// Bernoulli numbers
			// K-function
			// vector dot product
			// vector cross product
			// setDifference
			// isSubset
			// isSuperset
			// isSameSet
			// catalan
			// determinant
			// line intersection
			// scalar operations
			// eigs
			// fix (round towards zero)
			// matrix identity thing
			// inverse of matrix
			// Kullback-Leibler (KL) divergence  between two distributions.
			// kronecker product of 2 matrices or vectors.
			// nthrts, probably for cMath
			// coulomb
			// electrical things
			// p-adic integers
		}, "defer_instance cMath": class ComplexMath {
			constructor(degTrig=LibSettings.cMath_DegTrig_Argument, help=LibSettings.cMath_Help_Argument) {
				degTrig === "default" && (degTrig = !0);
				help === "default" && (help = !0);
				this.Complex = class Complex {
					// TODO: Add customization so the functions don't always modify the state
					constructor(re=0, im=0) {
						Object.is(re, -0) && (re = 0);
						Object.is(im, -0) && (im = 0);
						this.re = re;
						this.im = im;
					} __type__() { return "complex";
					} isComplex() { return !!this.im;
					} toPolar(doubleStar=false) { return `${cMath.abs(this)}e${doubleStar?"**":"^"}(${this.arg()}i)`;
					} toString( {polar=false, char="i", parens=true}={} ) {
						char = char[0] || "i";
						return polar ?
							`${cMath.abs(this)}e^${parens ? "(" : ""}${this.arg()}${char}${parens ? ")" : ""}`.remove(
								new RegExp(`^1(?=e)|e\\^\\(0${char}\\)`, "g")
							).start("1").replace([/^0.*/, /0\./g], ["0", "."]) :
							this.re ? // rectangular
								this.im ?
									this.im > 0 ?
										`${this.re}+${this.im ===  1 ? ""  : this.im}${char}` :
										`${this.re}${ this.im === -1 ? "-" : this.im}${char}` :
									`${this.re}` :
								this.im ?
									this.im > 0 ?
										`${this.im ===  1  ? ""  : this.im}${char}` :
										`${this.im === -1  ? "-" : this.im}${char}` :
									"0";
					} toArr() { return [this.re, this.im];
					} toLList() { return this.toArr().toLList();
					} toRegObj() { return { re: this.re, im: this.im }; // because for...of doesn't work with class objects
					} arg(form="radians") {
						return ["d", "deg", "degree", "degrees"].incl(form?.lower?.()) ?
							rMath.deg.atan2(this.re, this.im) :
							rMath.atan2(this.re, this.im);
					} add(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re + num.re,
							this.im + num.im
						);
						this.re += num.re;
						this.im += num.im;
						return this;
					} sub(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re - num.re,
							this.im - num.im
						);
						this.re -= num.re;
						this.im -= num.im;
						return this;
					} mul(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re*num.re - this.im*num.im,
							this.re*num.im + this.im*num.re
						);
						const tmp = this.re;
						this.re = tmp*num.re - this.im*num.im;
						this.im = tmp*num.im + this.im*num.re;
						return this;
					} div(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							(this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2),
							(this.im*num.re - this.re*num.im) / (num.re**2 + num.im**2)
						);
						const tmp = this.re;
						this.re = (this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2);
						this.im = (this.im*num.re - tmp*num.im) / (num.re**2 + num.im**2);
						return this;
					} floor(New=true) {
						if (New) return new this.constructor(
							floor(this.re),
							floor(this.im)
						);
						this.re = floor(this.re);
						this.im = floor(this.im);
						return this;
					} ceil(New=true) {
						if (New) return new this.constructor(
							ceil(this.re),
							ceil(this.im)
						);
						this.re = ceil(this.re);
						this.im = ceil(this.im);
						return this;
					} round(New=true) {
						if (New) return new this.constructor(
							round(this.re),
							round(this.im)
						);
						this.re = round(this.re);
						this.im = round(this.im);
						return this;
					} frac(New=true) {
						if (New) return new this.constructor(
							fpart(this.re),
							fpart(this.im)
						);
						this.re = fpart(this.re);
						this.im = fpart(this.im);
						return this;
					} pow(num, New=true) {
						typeof num === "number" && (num = new this.constructor(num, 0));

						if (!this.im && !num.im) return new this.constructor(this.re ** num.re, 0);
						if (type(num, 1) !== "complex") return NaN;

						const r = (this.re**2+this.im**2) ** (num.re/2) / e ** ( num.im*this.arg(this) ),
							θ = num.re*this.arg() + num.im*rMath.ln( this.abs() )
						if (New) return new this.constructor(
							r * rMath.cos(θ),
							r * rMath.sin(θ)
						);
						this.re = r * rMath.cos(θ);
						this.im = r * rMath.sin(θ);
						return this;
					} exp(New=true) {
						const r = e ** this.re;
						if (New) return new this.constructor(
							r * rMath.cos(this.im),
							r * rMath.sin(this.im)
						);
						this.re = r * rMath.cos(this.im);
						this.im = r * rMath.sin(this.im);
					} fpart(New=true) { return this.frac(New) }
					abs() { return cMath.abs(this) }
				};
				this.lnNeg1       = this.new(0, π);
				this.lni          = this.new(0, π_2);
				this.i            = this.new(0, 1);
				this.e   = this.𝑒 = this.new(e, 0);
				this.pi  = this.π = this.new(π, 0);
				this.tau = this.𝜏 = this.new(𝜏, 0);

				if (degTrig) this.deg = {
				}; if (help) this.help = {
				};
			} new(re=0, im=0) {
				if (type(re, 1) === "complex") return re;
				isArr(re) && ([re, im] = re);
				if (rMath.isNaN(re) || rMath.isNaN(im)) return NaN;

				if (typeof re === "bigint" && typeof im === "bigint") {
					throw Error("not implemented");
					return new this.Complex(re, im);
				}
				if (typeof re === "number" && typeof im === "number")
					return new this.Complex(re, im);
				return NaN;
			} complex(re=0, im=0) { return this.new(re, im) }
			add(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re + b.re, a.im + b.im);
			} sub(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re + b.re, a.im + b.im);
			} mul(a, b)  {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re*b.re - a.im*b.im, a.re*b.im + b.re*a.im);
			} div(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(
						(a.re*b.re + a.im*b.im) / (b.re**2 + b.im**2),
						(a.im*b.re - a.re*b.im) / (b.re**2 + b.im**2)
					);
			} fdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.div(a, b).floor();
			} cdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.div(a, b).ceil();
			} rdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.div(a, b).round();
			} mod(a, b) {
				typeof a === "number" && (a = this.new(a, 0)); typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.sub(
						a,
						this.mul(
							b,
							this.floor(
								this.div(a, b).floor
							)
						)
					)
			} floor(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					floor(z.re),
					floor(z.im),
				);
			} ceil(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					ceil(z.re),
					ceil(z.im),
				);
			} round(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					round(z.re),
					round(z.im),
				);
			} arg(z, n=0, form="rad") {
				if (type(z, 1) !== "complex") return NaN;
				return form === "degrees" || form === "deg" || form === "degree" ?
					rMath.deg.atan2(z.re, z.im) + 𝜏*int(n) :
					rMath.atan2(z.re, z.im) + 𝜏*int(n);
			} ln(z, n=0) {
				if (typeof z === "number") {
					return z < 0 ?
						this.new( rMath.ln(-z), π ) :
						!z ?
							NaN :
							this.new( rMath.ln(z), 0 );
				}
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					rMath.ln( this.abs(z) ),
					this.arg(z, int(n))
				);
				// ln(0 + bi) = ln|b| + isgn(b)π/2
				// ln(z) = ln|z| + Arg(z)i
			} log(z, base=null, n=0) {
				typeof z === "number" && (z = this.new(z, 0));
				typeof base === "number" && (base = this.new(base, 0));
				if (base === null) return this.ln(z, n);
				if (type(z, 1) !== "complex") return NaN;
				if (type(base, 1) !== "complex") return NaN;
				return this.ln(z, n).div( this.ln(base, n) );
				// log_{a+bi}(c+di) = ln(c+di) / ln(a+bi)
			} logbase(base, z, n=0) {
				typeof base === "number" && (base = this.new(base, 0));
				typeof z === "number" && (z = this.new(z, 0));
				if (type(base, 1) !== "complex") return NaN;
				if (type(z, 1) !== "complex") return NaN;
				return this.log( z, base, n );
			} pow(z1, z2, n=0) {
				typeof z1 === "number" && (z1 = this.new(z1, 0));
				typeof z2 === "number" && (z2 = this.new(z2, 0));

				if (!z1.im && !z2.im) {
					let pow = z1.re ** z2.re;
					if (isNaN(pow)) return this.new(0, (-z1.re) ** z2.re);
					return this.new(z1.re ** z2.re, 0);
				}
				if (type(z1, 1) !== "complex") return NaN;
				if (type(z2, 1) !== "complex") return NaN;

				const r = (z1.re**2 + z1.im**2) ** (z2.re / 2)  /  rMath.e ** ( z2.im*this.arg(z1, n) ),
					θ = z2.re*this.arg(z1, n) + z2.im*rMath.ln(this.abs(z1))
				//re^iθ = rcosθ + risinθ
				return this.new(r*rMath.cos(θ), r*rMath.sin(θ));
			} exp(z) {
				typeof z === "number" && (z = this.new(z, 0));
				return this.pow(z, this.e)
			} expi(z) {
				typeof z === "number" && (z = this.new(z, 0));
				const r = e ** z.re;
				return this.new(r * rMath.cos(z.im), r * rMath.sin(z.im))
			} abs(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return rMath.hypot(z.re, z.im);
			} sgn(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return z.div( this.abs(z) );
				// exp(i arg num);
			} sign(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.sgn(z);
			} nthrt(z, rt=2, n=0) {
				typeof z === "number" && (z = this.new(z, 0));
				typeof rt === "number" && (rt = this.new(rt, 0));
				if (type(z, 1) !== "complex") return NaN;
				if (type(rt, 1) === "complex") {
					let c2d2 = rt.re**2 + rt.im**2;
					return this.pow(z, this.new(rt.re/c2d2, -rt.im/c2d2));
				}
				if (typeof rt !== "number") return NaN;

				return this.exp(
					this.new( 0, this.arg(z, n) / rt )
				).mul(
					rMath.nthrt( this.abs(z), rt )
				);
			} sqrt(z) { return typeof z !== "number" && type(z, 1) !== "complex" ? NaN : this.nthrt(z, 2);
			} cbrt(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.nthrt(z, 3);
			} rect(r, θ) {
				/* polar to rectangular */
				typeof r === "number" && (r = this.new(r, 0));
				typeof θ === "number" && (θ = this.new(θ, 0));
				if (type(r, 1) !== "complex") return NaN;
				if (type(θ, 1) !== "complex") return NaN;
				return this.exp(θ).mul(r);
			} isClose(z1, z2, range=Number.EPSILON) {
				typeof z1 === "number" && (z1 = this.new(z1, 0));
				typeof z2 === "number" && (z2 = this.new(z2, 0));
				if (type(z1, 1) !== "complex") return NaN;
				if (type(z2, 1) !== "complex") return NaN;
				return rMath.isClose(this.abs(z1), this.abs(z2), range) &&
					rMath.isClose(z1.re, z2,re, range) &&
					rMath.isClose(z1.im, z2,im, range);
			} sum(n, last, func=z=>z, inc=1) {
				typeof n === "number" && (n = this.new(n, 0));
				typeof last === "number" && (last = this.new(last, 0));
				typeof inc === "number" && (inc = this.new(inc, 0));
				// complex less than or equal to
				const complet = (a, b) => !a.im && !b.im ? a.re <= b.re : this.abs(a) <= this.abs(b);
				
				if (type(n, 1) !== "complex") return NaN;
				if (type(last, 1) !== "complex") return NaN;
				if (type(func, 1) !== "func") return NaN;
				if (type(inc, 1) !== "complex") return NaN;

				for ( var total = this.new(0, 0) ; complet(n, last) ; n.add(inc, 0) )
					total.add( func(n, 0), 0 );
				return total;
			} conjugate(z) { return type(z, 1) !== "complex" ? NaN : this.new(z.re, -z.im);
			} inverse(z) { return type(z, 1) !== "complex" ? NaN : this.new(1/z.re, 1/z.im);
			} isPrime(z) {
				// TODO: Start
				if (typeof z === "number") z = this.new(z, 0);
				if (type(z, 1) !== "complex") return NaN;
				throw Error("Not Implemented");
			}
		}, "defer_instance fMath": class FractionalStringMath {
			// TODO: Make the functions convert numbers into fractions if they are inputed instead
			constructor(help=LibSettings.fMath_Help_Argument, degTrig=LibSettings.fMath_DegTrig_Argument) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				this.Fraction = class Fraction {
					constructor(numerator="1.0", denominator="1.0") {
						if (isNaN(numerator = sMath.new(numerator, NaN)) ||
							isNaN(denominator = sMath.new(denominator, NaN)))
							throw Error("fMath.Fraction() requires string number arguments.");
						if (sMath.eq.ez(denominator)) throw Error("fMath.Fraction() cannot have a zero denominator");
						var gcd = sMath.gcd(numerator, denominator);
						this.numer = sMath.div(numerator, gcd);
						this.denom = sMath.div(denominator, gcd);
					}
					__type__() {
						return "fraction";
					}
				};
				this.one = this.new("1.0", "1.0"); // can't move to before the class declaration
				if (help) this.help = {
					"Fraction": "create a new fraction. takes 2 string number arguments. for the numerator then denominator.",
				}; if (degTrig) this.deg = {
				};
			} new(numerator="1.0", denominator="1.0") { return new this.Fraction(numerator, denominator);
			} fraction(numerator="1.0", denominator="1.0") { return this.new(numerator, denominator);
			} simplify(fraction) { return this.simp(fraction);
			} simp(fraction) {
				["number", "bigint", "string"].incl( type(fraction) ) && (fraction = this.new(numStrNorm(fraction), "1.0"));
				if (type(fraction, 1) !== "fraction") return NaN;
				if ( sMath.isNaN(fraction.numer) ) return NaN;
				if ( sMath.isNaN(fraction.denom) ) return NaN;
				var gcd = sMath.gcd(fraction.numer, fraction.denom);
				return this.new( sMath.div(fraction.numer, gcd), sMath.div(fraction.denom, gcd) );
			} add(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(
					this.new(
						sMath.add( sMath.mul(a.numer, b.denom), sMath.mul(b.numer, a.denom) ),
						sMath.mul(a.denom, b.denom)
					)
				);
			} sub(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(
					this.new(
						sMath.sub( sMath.mul(a.numer, b.denom), sMath.mul(b.numer, a.denom) ),
						sMath.mul(a.denom, b.denom),
					)
				);
			} mul(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp( this.new(sMath.mul(a.numer, b.numer), sMath.mul(a.denom, b.denom)) );
			} div(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp( this.new(sMath.mul(a.numer, b.denom), sMath.mul(a.denom, b.numer)) );
			}
		}, "defer_instance cfMath": class ComplexFractionalStringMath {
			constructor(help=LibSettings.cfMath_Help_Argument) {
				help === "default" && (help = !0);
				this.CFraction = class ComplexFraction {
					constructor(re=fMath.one, im=fMath.one) {
						if (type(re, 1) !== "fraction" || type(im, 1) !== "fraction")
							throw ValueError("cfMath.CFraction requires 2 fractional arguments.");
						this.re = fMath.simp(re);
						this.im = fMath.simp(im);
					}
				};
				if (help) this.help = {
					CFraction: null,
				};
			}
			new(re=fMath.one, im=fMath.one) { return new this.CFraction(re, im);
			}
		}, "defer_call aMath"() {
			var _getNameOf = obj => keyof(window.MathObjects, obj)
			, protoProps = e => Object.getOwnPropertyNames(e.constructor.prototype)
			, fns = {
				bigint   : bMath, complex  : cMath, fraction : fMath, num      : rMath,
				number   : rMath, str      : sMath, string   : sMath, mutstr   : sMath,
			};
			function _call(fname, typ=null, ...args) {
				typ === null && (typ = type(args[0], 1));
				var fn = fns?.[typ?.lower?.()]?.[fname];
				if (fn) return fn.apply( fns[typ], args );
				if (fns[typ] !== void 0) throw Error(`${_getNameOf(fns[typ])}["${fname}"] doesn't exist`);
				/*else*/
				throw Error(`there is no Math object for type '${typ}'. (type(x, 1) was used). see window.MathObjects for all Math objects`);
			} function _call_attr(fname, attr, typ=null, ...args) {
				typ === null && (typ = type(args[0], 1));
				var fn = fns?.[typ?.lower?.()]?.[attr]?.[fname];
				if (fn) return fn.apply( fns[typ], args );
				if (fns[typ] !== void 0) throw Error(`${_getNameOf(fns[typ])}["${fname}"] doesn't exist`);
				/*else*/
				throw Error(`there is no Math object for type '${typ}'. (type(x, 1) was used). see window.MathObjects for all Math objects`);
			}

			class AllMath { // aMath will call the correct function based upon the inputs' types
				constructor() {
					if (LibSettings.aMath_Help_Argument) this.help = "see the help attributes of the other math functions, which you can find at 'window.MathObjects'.  this.internals.call, this.internals.call_eq, and this.internals.call_deg just call functions from the correct math object. call_eq uses the eq attribute of the math object, and call_deg uses the deg attribute of the math object.  not all the functions are guaranteed to work for all types.";
				}
			}
			for (const fname of Object.values(MathObjects).map(e => protoProps(e)).flat().remrep().remove("constructor"))
				AllMath.prototype[fname] = function () { return _call(fname, null, ...arguments) }
			if (LibSettings.aMath_DegTrig_Argument) {
				AllMath.prototype.deg = {};
				for (const fname of Object.getOwnPropertyNames(rMath.deg))
					AllMath.prototype.deg[fname] = function () { return _call_attr(fname, "deg", null, ...arguments) }
			}
			if (LibSettings.aMath_Comparatives_Argument) {
				AllMath.prototype.eq = {};
				for (const fname of [].concat(
					Object.getOwnPropertyNames(rMath.deg),
					Object.getOwnPropertyNames(sMath.deg),
					Object.getOwnPropertyNames(bMath.deg),
				)) AllMath.prototype.eq[fname] = function () { return _call_attr(fname, "eq", null, ...arguments) }
			}
			if (LibSettings.aMath_Internals_Argument) AllMath.prototype.internals = {
				call      : _call,
				call_attr : _call_attr,
				getNameOf : _getNameOf,
			};
			return new AllMath;
		}, "defer_call Types"() {
			return {
				Boolean  : Boolean,
				Number   : Number,
				String   : String,
				BigInt   : BigInt,
				Function : Function,
				Array    : Array,
				Object(input, handle=!1) {
					return typeof input === "object" ?
						input :
						handle == !0 ?
							{ data: input } :
							void 0
				}, Symbol(input, handle=!1) {
					return typeof input === "symbol" ?
						input :
						handle == !0 ?
							Symbol.for(input) :
							void 0
				}, undefined() {},
				null() { return null },
				Fraction: fMath.Fraction,
				CFraction: cfMath.CFraction,
				Set: rMath.Set,
				Complex: cMath.Complex,
				dict: dict,
				LinkedList: LinkedList,
				MutableString: MutableString,
			}
		}, "defer_call_local finalize_math"() {
			LibSettings.Output_Math_Variable === "default" && (LibSettings.Output_Math_Variable = "Math");
			for (const obj of Object.values(MathObjects)) {
				Object.keys(MathObjects).forEach(s => obj[s] = MathObjects[s]);
				obj["+"]  = obj.add;  obj["-"]  = obj.sub;
				obj["*"]  = obj.mul;  obj["/"]  = obj.div;
				obj["**"] = obj.pow;  obj["e^"] = obj.exp;
				obj["%"]  = obj.mod;  obj["∫"]  = obj.int;
				obj["√"]  = obj.sqrt; obj["∛"] = obj.cbrt;
				obj.Σ = obj.sum; obj.Π = obj.prod; obj.Γ = obj.gamma;
			}
			sMath["//"] = sMath.fdiv;
			sMath["**"] = sMath.ipow; // TODO: remove this after sMath.pow exists
			rMath.ℙ = rMath.P; // power set
			define( (LibSettings.Alert_Conflict_For_Math !== "default" &&
				LibSettings.Alert_Conflict_For_Math ? "" : "overwrite ") + LibSettings.Output_Math_Variable, 0, window,
				MathObjects[ LibSettings.Input_Math_Variable === "default" ?
					"rMath" :
					LibSettings.Input_Math_Variable ]
			);
			return void 0;
		}
		}; if (LibSettings.Global_Library_Object_Name != null) LIBRARY_VARIABLES [
			LibSettings.Global_Library_Object_Name === "default" ?
				"LIBRARY_VARIABLES" :
				LibSettings.Global_Library_Object_Name 
		] = LIBRARY_VARIABLES;
	} {// Conflict & Assignment

		--> assignment and conflict things

		for (const key of Object.keys(LIBRARY_VARIABLES)) define(key, 0);

		--> document things

		let _ael = EventTarget.prototype.addEventListener
		, _rel = EventTarget.prototype.removeEventListener
		, listeners = dict()
		, _click = HTMLElement.prototype.click;

		function addEventListener(Type, listener=null, options={
			capture  : false,
			passive  : false,
			once     : false,
			type     : arguments[0],
			listener : arguments[1] }) {

			typeof options === "boolean" && (options = {
				capture  : options,
				passive  : !1,
				once     : !1,
				type     : Type,
				listener : listener
			});
			_ael.call(this, Type, listener, options);
			if (listeners[Type] === void 0) listeners[Type] = [];
			listeners[Type].push({
				object   : this,
				capture  : options.capture,
				passive  : options.passive,
				once     : options.once,
				type     : options.type,
				listener : options.listener
			});
			return this;
		} function removeEventListener(Type, listener=null, options={
			capture  : false,
			passive  : false,
			once     : false,
			type     : arguments[0],
			listener : arguments[1] }) {

			typeof options === "boolean" && (options = {
				capture  : options,
				passive  : !1,
				once     : !1,
				type     : Type,
				listener : listener
			});
			_rel.call(this, Type, listener, options);
			for (var i = listeners[Type]?.length; i --> 0 ;) {
				if (listeners[Type][i].capture  === options.capture  &&
					listeners[Type][i].passive  === options.passive  &&
					listeners[Type][i].once     === options.once     &&
					listeners[Type][i].type     === options.type     &&
					listeners[Type][i].listener === options.listener
				) listeners[Type].splice(i, 1);
			}
			return this;
		} function getEventListeners() { return listeners; // gets all event listeners for all objects.
		} function getMyEventListeners() {
			// gets all event listeners on the current EventTarget object the function is called from
			return dict.fromEntries(
				listeners.entries().map( e => {
					const value = e[1].filter(e => e.object === (this || window));
					return len(value) ? [e[0], value] : [];
				}).filter(e => len(e))
			);
		} function click(times=1) {
			if (isNaN( times = Number(times) )) times = 1;
			while (times --> 0) _click.call(this);
			return this;
		}
		addEventListener._ael = _ael; // doesn't actually work. just for storing purposes
		removeEventListener._rel = _rel; // doesn't actually work. just for storing purposes
		click._click = _click; // doesn't actually work. just for storing purposes

		EventTarget.prototype.ael   = EventTarget.prototype.addEventListener    = addEventListener    ;
		EventTarget.prototype.rel   = EventTarget.prototype.removeEventListener = removeEventListener ;
		EventTarget.prototype.gel   = EventTarget.prototype.getEventListeners   = getEventListeners   ;
		EventTarget.prototype.gml   = EventTarget.prototype.getMyEventListeners = getMyEventListeners ;
		HTMLElement.prototype.click = click;
		Document.prototype.click = function click(times=1) { return window.document.head.click(times) }
		// document.all == null for some reason.
		document.doctype && document.all !== void 0 && (document.all.doctype = document.doctype);

		if (LibSettings.Creepily_Watch_Every_Action && LibSettings.Creepily_Watch_Every_Action !== "default") {
			let log = console.log;
			document.ael("click"            , e => { log(e.type); this[e.type] = e });
			document.ael("dblclick"         , e => { log(e.type); this[e.type] = e });
			document.ael("auxclick"         , e => { log(e.type); this[e.type] = e });
			document.ael("contextmenu"      , e => { log(e.type); this[e.type] = e });
			document.ael("mousemove"        , e => { log(e.type); this[e.type] = e });
			document.ael("mousedown"        , e => { log(e.type); this[e.type] = e });
			document.ael("mouseup"          , e => { log(e.type); this[e.type] = e });
			document.ael("mouseover"        , e => { log(e.type); this[e.type] = e });
			document.ael("mouseout"         , e => { log(e.type); this[e.type] = e });
			document.ael("mouseenter"       , e => { log(e.type); this[e.type] = e });
			document.ael("mouseleave"       , e => { log(e.type); this[e.type] = e });
			document.ael("wheel"            , e => { log(e.type); this[e.type] = e });
			document.ael("pointerover"      , e => { log(e.type); this[e.type] = e });
			document.ael("pointerout"       , e => { log(e.type); this[e.type] = e });
			document.ael("pointerenter"     , e => { log(e.type); this[e.type] = e });
			document.ael("pointerleave"     , e => { log(e.type); this[e.type] = e });
			document.ael("pointerdown"      , e => { log(e.type); this[e.type] = e });
			document.ael("pointerup"        , e => { log(e.type); this[e.type] = e });
			document.ael("pointermove"      , e => { log(e.type); this[e.type] = e });
			document.ael("pointercancel"    , e => { log(e.type); this[e.type] = e });
			document.ael("gotpointercapture", e => { log(e.type); this[e.type] = e });
			document.ael("drag"             , e => { log(e.type); this[e.type] = e });
			document.ael("dragstart"        , e => { log(e.type); this[e.type] = e });
			document.ael("dragend"          , e => { log(e.type); this[e.type] = e });
			document.ael("dragover"         , e => { log(e.type); this[e.type] = e });
			document.ael("dragenter"        , e => { log(e.type); this[e.type] = e });
			document.ael("dragleave"        , e => { log(e.type); this[e.type] = e });
			document.ael("drop"             , e => { log(e.type); this[e.type] = e });
			document.ael("keypress"         , e => { log(e.type); this[e.type] = e });
			document.ael("keydown"          , e => { log(e.type); this[e.type] = e });
			document.ael("keyup"            , e => { log(e.type); this[e.type] = e });
			document.ael("copy"             , e => { log(e.type); this[e.type] = e });
			document.ael("paste"            , e => { log(e.type); this[e.type] = e });
			document.ael("beforecopy"       , e => { log(e.type); this[e.type] = e });
			document.ael("beforepaste"      , e => { log(e.type); this[e.type] = e });
			document.ael("beforecut"        , e => { log(e.type); this[e.type] = e });
			document.ael("input"            , e => { log(e.type); this[e.type] = e });
			document.ael("devicemotion"     , e => { log(e.type); this[e.type] = e });
			document.ael("deviceorientation", e => { log(e.type); this[e.type] = e });
			document.ael("DOMContentLoaded" , e => { log(e.type); this[e.type] = e });
			document.ael("scroll"           , e => { log(e.type); this[e.type] = e });
			document.ael("touchstart"       , e => { log(e.type); this[e.type] = e });
			document.ael("touchmove"        , e => { log(e.type); this[e.type] = e });
			document.ael("touchend"         , e => { log(e.type); this[e.type] = e });
			document.ael("touchcancel"      , e => { log(e.type); this[e.type] = e });
			this    .ael("load"             , e => { log(e.type); this[e.type] = e });
			this    .ael("focus"            , e => { log(e.type); this[e.type] = e });
			this    .ael("resize"           , e => { log(e.type); this[e.type] = e });
			this    .ael("blur"             , e => { log(e.type); this.blurevt = e });
		} if (LibSettings.Run_KeyLogger === "default" ? !1 : LibSettings.Run_KeyLogger) {
			let debug = LibSettings.KeyLogger_Debug_Argument === "default" ?
				!1 : LibSettings.KeyLogger_Debug_Argument
			, variable = LibSettings.KeyLogger_Variable_Argument === "default" ?
				Symbol.for('keys') :
				LibSettings.KeyLogger_Variable_Argument
			, copy_object = LibSettings.KeyLogger_Copy_Obj_Argument === "default" ?
				!0 : LibSettings.KeyLogger_Copy_Obj_Argument
			, type = LibSettings.KeyLogger_Type_Argument === "default" ?
				"keydown" : LibSettings.KeyLogger_Type_Argument;
			const handler = e => {
				window[variable] += e.key;
				debug && console.log(`${typ} detected: \`${e.key}\`\nkeys: \`${window[variable]}\`\nKeyboardEvent Object: %o`, e);
				copy_object && (window.keypressObj = e);
			};
			define("stopKeylogger", 0, window, function stopKeylogger() {
				var alert =  LibSettings.KeyLogger_Alert_Start_Stop || LibSettings.KeyLogger_Debug_Argument
				, type = LibSettings.KeyLogger_Debug_Argument;
				type === "default" && (type = "keydown");
				alert && console.log("keylogger manually terminated.");
				document.body.removeEventListener(type, handler);
				return !0;
			});
			(function key_logger_v3() {
				if (window[variable] !== void 0) return debug &&
					console.log("window[${variable}] is already defined.\nkeylogger launch failed");
				window[variable] = "";
				document.body.ael(type, handler);
				(debug || LibSettings.KeyLogger_Alert_Start_Stop) && console.log(`Keylogger started\nSettings:\n\tdebug: ${LibSettings.KeyLogger_Debug_Argument}${LibSettings.KeyLogger_Debug_Argument === "default" ? ` (${debug})` : ""}\n\tvariable: ${LibSettings.KeyLogger_Variable_Argument === "default" ? "default (window[Symbol.for('keys')])" : `window[${LibSettings.KeyLogger_Variable_Argument}]`}\n\tcopy obj to window.keypressObj: ${LibSettings.KeyLogger_Copy_Obj_Argument}${LibSettings.KeyLogger_Copy_Obj_Argument === "default" ? ` (${copy_object})` : ""}\n\ttype: ${LibSettings.KeyLogger_Type_Argument}${LibSettings.KeyLogger_Type_Argument === "default" ? ` (${type})` : ""}`);
			})();
		} else if (LibSettings.KeyLogger_Alert_Unused && LibSettings.KeyLogger_Alert_Unused !== "default")
			console.log("keylogger launch failed due to library settings");
	} {// Error Handling & Exiting
		for (const s of DEFER_ARR) define(s, 1);
		if (LibSettings.Freeze_Everything && LibSettings.Freeze_Everything !== "default") {
			for (let name of Object.keys(LIBRARY_VARIABLES)) {
				console.log(name);
				Object.freeze(window[ name.match(/\S+$/)?.[0] || "" ]);
			}
		} else if (LibSettings.Freeze_Instance_Objects && LibSettings.Freeze_Instance_Objects !== "default") {
			Object.freeze(Types);
			Object.freeze(MathObjects);
			for (let o of Object.values(MathObjects))
				Object.freeze(o);
		}

		delete CONFLICT_ARR.push;

		if (LibSettings.Alert_Conflict_OverWritten && len(CONFLICT_ARR)) {
			switch (LibSettings.ON_CONFLICT) {
				case "crash": throw Error("there was a conflict and the program hasn't crashed yet.");
				case "ast":
				case "assert": console.assert(!1, "Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "dbg":
				case "debug": console.debug("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "inf":
				case "info": console.info("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "wrn":
				case "warning":
				case "warn": console.warn("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "err":
				case "error": console.error("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "log": console.log("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "alt":
				case "alert": alert(`Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`); break;
				case "ret":
				case "return": return `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
				case "trw":
				case "throw": throw `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
				// case "ignore": break;
				// case "cry": break;
				// case "debugger": break;
				// case "none": break;
				// default: break;
			}
			if (LibSettings.ON_CONFLICT !== "cry" && LibSettings.ON_CONFLICT !== "debugger") {
				LibSettings.ON_CONFLICT !== "none" && console.debug("lib.js encountered variable conflicts");
				return 1;
			}
		}
		LibSettings.Alert_Library_Load_Finished && LibSettings.Alert_Library_Load_Finished !== "default" && (
			LibSettings.Library_Startup_Function === "default" ? console.log : LibSettings.Library_Startup_Function
		)( LibSettings.Library_Startup_Message === "default" ? "lib.js loaded" : LibSettings.Library_Startup_Message );
		return 0;
	}
})();

/*
	var piApprox = (function create_piApprox() {
		var a = n => n ? (a(n-1) + b(n-1)) / 2 : 1
		, b = n => n ? (a(n-1) * b(n-1))**.5 : Math.SQRT1_2
		, t = n => n ? t(n-1) - 2**(n-1) * (a(n-1) - a(n))**2 : .25
		, piApprox = n => a(n+1)**2 / t(n);
		return piApprox;
	})();


	// sMath.sqrt, sMath.pow



	var piApproxStr = (function create_piApproxStr() {
		var a = n => n ? sMath.div( sMath.add(a(n-1), b(n-1)) , 2 ) : "1.0"
		, b = n => n ? sMath.sqrt(sMath.mul(a(n-1), b(n-1))) : "0.7071067811865476"
		, t = n => n ? t(n-1) - sMath.mul(sMath.ipow("2.0", sMath.new(n-1)), sMath.square(sMath.sub(a(n-1), a(n)))) : "0.25"
		, piApproxStr = n => sMath.div(sMath.square(a(n+1)), t(n));
		return piApproxStr;
	})();
*/
