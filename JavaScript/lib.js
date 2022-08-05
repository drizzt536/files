#!/usr/bin/env js
void (() => { "use strict";
	{// Customization & Constants

		const onConflict_Options = [
			"log", "throw" , "trw", "return", "ret", "error",
			"err", "warn"  , "wrn", "debug" , "dbg", "info" ,
			"inf", "assert", "ast", "alert" , "alt", "None" ,
		];

		/**
		 * If something not in the options is used for ON_CONFLICT, excluding "default",
		 * "None" will be chosen instead.
		 * The defaults are the boolean value true, unless otherwise noted on the same line in a comment
		 * All alerts happen using console.log except for conflict stuff.

		 * Input Math Variable Options:
		   - aMath   (all)
		   - bMath   (bigint)
		   - cMath   (complex)
		   - cfsMath (complex fractional string)
		   - fMath   (fraction)
		   - rMath   (real numbers)
		   - sMath   (string)
		**/

		var
		Alert_Library_Load_Finished   = "default" // false
		, ON_CONFLICT                 = "default" // "debug"
		, Alert_Conflict_For_Math     = "default" // false
		, Alert_Conflict_OverWritten  = "default"
		, Library_Startup_Message     = "default" // "lib.js loaded"
		, Library_Startup_Function    = "default" // console.log
		, Output_Math_Variable        = "default" // "Math"
		, Input_Math_Variable         = "default" // "rMath"
		, MATH_LOG_DEFAULT_BASE       = "default" // 10. for rMath.log
		, MATH_DEFAULT_END_SYSTEM     = "default" // for rMath.tempConv
		, aMath_Help_Argument         = "default"
		, aMath_Trig_Argument         = "default"
		, aMath_Comparatives_Argument = "default"
		, bMath_Help_Argument         = "default"
		, bMath_DegTrig_Argument      = "default"
		, cMath_DegTrig_Argument      = "default"
		, cMath_Help_Argument         = "default"
		, fMath_Help_Argument         = "default"
		, fMath_DegTrig_Argument      = "default"
		, sMath_Help_Argument         = "default"
		, sMath_Comparatives_Argument = "default" // only recommended to be false if you are planning to never use sMath at all
		, rMath_DegTrig_Argument      = "default"
		, rMath_Help_Argument         = "default"
		, rMath_Comparatives_Argument = "default"
		, rMath_Constants_Argument    = "default"
		, cfsMath_Help_Argument       = "default"
		, Logic_BitWise_Argument      = "default"
		, Logic_Comparatives_Argument = "default"
		, Logic_Help_Argument         = "default"
		, Run_KeyLogger               = "default" // false
		, KeyLogger_Debug_Argument    = "default" // false
		, KeyLogger_Alert_Start_Stop  = "default"
		, KeyLogger_Alert_Unused      = "default" // false
		, KeyLogger_Variable_Argument = "default" // Symbol.for('keys')
		, KeyLogger_Copy_Obj_Argument = "default"
		, KeyLogger_Type_Argument     = "default" // "keydown"
		, Clear_LocalStorage          = "default" // false
		, Clear_SessionStorage        = "default" // false
		, Creepily_Watch_Every_Action = "default" // false

		;

		Clear_LocalStorage   && Clear_LocalStorage   !== "default" && localStorage  .clear();
		Clear_SessionStorage && Clear_SessionStorage !== "default" && sessionStorage.clear();
		MATH_LOG_DEFAULT_BASE   === "default" && (MATH_LOG_DEFAULT_BASE   = 10 );
		MATH_DEFAULT_END_SYSTEM === "default" && (MATH_DEFAULT_END_SYSTEM = "c");
		// TODO: clear cookies and caches if the library user wants
	} {// Variables & Functions
		// Array().fill([]) does a different thing than [[],[],[],[],[],[],[],[],[],[]]
		for (var i=10,j,multable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
			for (j=10; j --> 0 ;)
				multable[i][j] = i * j;
		for (var i=10,j,addtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
			for (j=10; j --> 0 ;)
				addtable[i][j] = i + j;
		for (var i=10,j,subtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
			for (j=10; j --> 0 ;)
				subtable[i][j] = i - j;
		for (var i=10,j,divtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
			for (j=10; j --> 0 ;)
				divtable[i][j] = i / j;
		var
		alphabetL       = "abcdefghijklmnopqrstuvwxyz"
		, alphabet      = alphabetL
		, alphabetU     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		, numbers       = "0123456789"
		, base62Numbers = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
		, characters    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]{}|;:',.<>/?-_=+ \"\\"
		, π             = 3.141592653589793
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
		, LIBRARY_FUNCTIONS = {
		"isArr": Array.isArray
		, "list": Array.from
		, "int": Number.parseInt
		, "abs": Math.abs
		, "sgn": Math.sign
		, "rand": Math.random
		, "json": JSON
		, "infinity": Infinity
		, "literal symbol.for <0x200b>": "​" // zero width space
		, "literal symbol.for <0x08>": "" // \b
		, "π": π
		, "𝜏": 𝜏
		, "𝑒": 𝑒
		, "ϕ": ϕ
		, "γ": γ
		, "Ω": Ω
		, "Types": {
			Boolean  : Boolean,
			Number   : Number,
			String   : String,
			BigInt   : BigInt,
			Function : Function,
			Array    : Array,
			Object(input, handle=!1) {
				return type(input) === "object" ?
					input :
					handle == !0 ?
						{ data: input } :
						void 0
			}, Symbol(input, handle=!1) {
				return type(input) === "symbol" ?
					input :
					handle == !0 ?
						Symbol.for(input) :
						void 0
			}, undefined() { return void 0 }
		}, "LinkedList": class LinkedList {
			constructor(head) {
				this.size = 0;
				this.Node = class Node {
					constructor(value, next=null) {
						this.value = value;
						this.next = next;
					}
				};
				this.head = head == null ? null : new this.Node(head);
			}
			insertLast(value) {
				if (!this.size) return this.insertFirst(value);
				this.size++;
				for (var current = this.head; current.next ;)
					current = current.next;
				current.next = new this.Node(value);
			}
			insertAt(value, index=0) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				if (!index) return this.insertFirst(value);
				if (index === this.size) return this.insertLast(value);
				for (var current = this.head; index --> 0 ;)
					current = current.next;
				this.size++;
				current.next = new this.Node(value, current.next)
			}
			getAt(index=0) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				for (var current = this.head; index --> 0 ;)
					current = current.next;
				return current;
			}
			removeAt(index) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				for (var current = this.head; index --> 1 ;)
					current = current.next;
				current.next = current.next.next;
				this.size--;
			}
			insertFirst(value) {
				this.head = new this.Node(value, this.head);
				this.size++;
			}
			reverse() {
				for (var cur = this.head, prev = null, next; cur ;)
					[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
				this.head = prev || this.head;
			}
			toArray() {
				for (let current = this.head, a = []; current ;) {
					a.push(current.value);
					current = current.next;
				}
				return a;
			}
			clear() {
				this.head = null;
				this.size = 0;
			}
			type() {
				return "linkedlist";
			}
		}, "Image": (function create_Image() {
			// the function can still be used the same as before
			var _Image = window.Image;
			return function Image(width, height, options={}) {
				var image = new _Image(width, height);
				for (const e of Object.keys(options)) image[e] = options[e];
				return image;
			};
		})(), "dict": (function create_dict() {
			// So I can add prototype methods and not have it on literally every object in existance
			var Dictionary = class dict extends Object {
				constructor(dict) {
					super();
					for (const e of Object.keys(dict))
						this[e] = dict[e];
				} keys()            { return Object.keys(this)              }
				values()            { return Object.values(this)            }
				entries()           { return Object.entries(this)           }
				freeze()            { return Object.freeze(this)            }
				isFrozen()          { return Object.isFrozen(this)          }
				isExtensible()      { return Object.isExtensible(this)      }
				preventExtensions() { return Object.preventExtensions(this) }
				seal()              { return Object.seal(this)              }
				isSealed()          { return Object.isSealed(this)          }
				size()              { return len(Object.keys(this))         }
				type()              { return "dict";                        }
			}
			function dict(obj={}) { return new Dictionary(obj) }
			dict.fromEntries = function fromEntries(entries=[]) { return dict(Object.fromEntries(entries)) }
			return dict;
		})(), "MutableString": (function create_MutableString() {
			// TODO: Make safety things for the functions so the user doesn't add non-character things
			var MutStr = class MutableString extends Array {
				constructor() {
					super();
					this.pop(); // there shouldn't be anything, but indexes were off before, so idk.
					for (const e of arguments)
						// type() and not typeof so mutable strings also work
						type(e) === "string" && this.union(e.split(""));
				}
				type() { return "mutstr" }
				push(chars) {
					if (type(chars, 1) === "str" || false);
				}
				toString() { return this.join("") }
			};
			let protoArray = Object.getOwnPropertyNames(MutStr.prototype);
			
			for (const s of Object.getOwnPropertyNames(String.prototype))
				!protoArray.includes(s) && (MutStr.prototype[s] = String.prototype[s]);

			MutStr.prototype.concat = Array.prototype.concat;

			function MutableString(/*arguments*/) { return new MutStr(...arguments) }
			MutableString.fromString
			return MutableString;
		})(), isIterable(arg) {
			try { for (const e of arg) break; return !0 }
			catch { return !1 }
		}, sizeof(obj) {
			if (obj == null) return 0;
			var length = len(obj);
			if (length != null) return length;
			if (constr(obj) === "Object") return len( Object.keys(obj) );
			return 0;
		}, assert(condition, message="false") {
			return !condition &&
				Errors?.("Failed Assertion", message);
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
				if (type(fn) === "function") {
					if (`${fn}`.incl(/\(\) { \[native code\] }/)) {
						open(`https://developer.mozilla.org/en-US/search?q=${str}()`, "_blank");
						return "native function. arguments can't be retrieved";
					}
					return `Function: arguments = ${getArguments?.(fn)}`;
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
		}, type(a, specific=!1) {
			return specific == !1 || typeof a === "bigint" || typeof a === "symbol" || a === void 0 ?
				/^type\(\){return("|'|`)mutstr\1}$/.test(`${a?.type}`.replace(/\s|;/g, "")) ?
					"string" :
					typeof a :
				typeof a === "number" ?
					isNaN(a) ?
						"nan" :
						isNaN(a - a) ?
							"inf" :
							"num" :
					typeof a === "object" ?
						constr(a) === 'NodeList' ?
							"nodelist" :
							a.test === /a/?.test ?
								"regex" :
								a === null ?
									"null" :
									/^type\(\){return("|'|`)linkedlist\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
										"linkedlist" :
										/^type\(\){return("|'|`)complex\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
											"complex" :
											/^type\(\){return("|'|`)fraction\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
												"fraction" :
												/^type\(\){return("|'|`)set\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
													"set" :
													/^type\(\){return("|'|`)dict\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
														"dict" :
														/^type\(\){return("|'|`)mutstr\1}$/.in(`${a.type}`.remove(/\s|;/g)) ?
															"mutstr" :
															isArr(a) ?
																"arr" :
																"obj" :
						typeof a === "string" ?
							"str" :
							typeof a === "boolean" ?
								"bool" :
							/^class/.in(a+"") ?
								"class" :
								"func"
		}, round(n) {
			return type(n) === "number" ?
				fpart(n) < .5 ?
					int(n) :
					int(n) + sgn(n) :
				type(n) === "bigint" ?
					n :
					NaN;
		}, floor(n) {
			return type(n) === "number" ?
				int(n) - (n<0 && n != int(n)) :
				type(n) === "bigint" ?
					n :
					NaN;
		}, ceil(n) {
			return type(n) === "number" ?
				int(n) + (n>0 && n != int(n)) :
				type(n) === "bigint" ?
					n :
					NaN;
		}, *range(start, stop, step=1) {
			stop == null ? [stop, start] = [start, 0] : stop++;
			for (var i = start; i < stop; i += step) yield i;
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
			if (type(charsToRemove, 1) === "arr")
			if (charsToRemove.every( e => type(e) === "string" )) charsToRemove = charsToRemove.join("");
			else return !1;
			else if (
				type(charsToRemove) !== "string" &&
				charsToRemove !== void 0 &&
				charsToRemove !== null
			) return !1;
			if (chars === characters && charsToRemove !== void 0 && charsToRemove !== null)
				for (const char in charsToRemove)
					chars = chars.remove(char);
			for (var i = length, password = ""; i --> 0 ;) password += chars.rand();
			return password;
		}, getAllDocumentObjects() {
			var objs = [document];
			document.doctype && objs.push(document.doctype);
			objs.union(document.all);
			return objs;
		}, dQuery(selector="*", {doctype=true, one=false, oneIndex=0}={}) {
			if (constr(selector) === "dQuery") return selector;
			if (type(selector) !== "string") throw TypeError("dQuery() requires a string or dQuery object for the first argument");
			try {
				var values = Array.from(document.querySelectorAll(selector));
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
						this.previous = constr(previous) === "dQuery" ?
							previous :
							new dQuery(document);
					}
					selector !== void 0 && (this.selector = selector);
				}
			})(values, selector, void 0);
		}, getArguments(fn) {
			// any comments inside the argument parens acts as a docstring like in python.
			// works for all functions
			if (type(fn) !== "function") return !1;
			fn += ""; // fn = fn.toString()
			if (fn.incl("{ [native code] }")) return "native function. can't get arguments";
			if (fn.sW("class")) return a.slc(0, "{").trim();
			if (/^\s*function/.in(fn) && /^\s*\(/.in(fn)) return fn.match(/^\w+/)[0];
			for (var i = 0, fn = fn.slc("("), n = len(fn), count = 0; i < n; i++) {
				if (fn[i] === "(") count++;
				else if (fn[i] === ")") count--;
				if (!count) break;
			}
			return fn.substr(0, i + 1);
		}, createElement(element="p", options={}) {
			var element = document.createElement(element), objects = null, click = null;
			for (const e of Object.keys(options)) {
				if (e === "children") {
					type(options[e], 1) === "arr" ?
						options[e].forEach(c => element.appendChild(c)) :
						element.appendChild(options[e]);
				} else if (e === "onClick") { // not "onclick"
					type(options[e]) === "function" ?
						element.ael("click", options[e]) :
						element.ael("click", ...options[e]);
				} else if (e === "on") {
					e.listener ??= e.handler;
					element.ael( e.type, e.listener, {
						capture : e.capture ,
						passive : e.passive ,
						once    : e.once    ,
					});

				} else if (["object", "objects"].incl(e)) {
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
		}, css(text="", options={}, append=true) {
			options.innerHTML ??= text;
			options.type ??= "text/css";
			var element = createElement("style", options);
			if (append) document.head.appendChild(element);
			return element;
		}, bisectLeft(arr, x, lo=0, hi=null) {
			hi === null && (hi = len(arr));
			if (lo < 0 || hi < lo || hi > len(arr)) return false;
			while (lo != hi) {
				mid = low + floor((hi-low)/2);
				if (arr[mid] < x) lo = mid + 1; else hi = mid;
			}
			return lo;
		}, bisectRight(arr, x, lo=0, hi=null) {
			hi === null && (hi = len(arr));
			if (lo < 0 || hi < lo || hi > len(arr)) return false;
			while (lo != hi) {
				mid = low + floor((hi-low)/2);
				if (arr[mid] <= x) lo = mid + 1;
				else hi = mid;
			}
			return lo;
		}, bisect(arr, x, lo=0, hi=null, orientation="left", use=true) {
			return (orientation === "left" ?
				bisectLeft : bisectRight
			)(arr, x, lo, hi);
		}, "randint"     : function randomInt(min=1, max=null) {
			if (max == null) {
				max = min;
				min = 0;
			}
			if (type(min) !== "number" || type(max) !== "number") return round( rand() );
			min < 0 && min--;
			return round( rand() * abs(min - max) + min );
		}, "constr"      : function constructorName(input, name=true) {
			if (input === null || input === void 0) return input; // document.all == null ????!!/? what!?!?
			return input?.constructor?.name;
		}, "dir"         : function currentDirectory(loc=new Error().stack) {
			// sometimes doesn't work
			return `${loc}`
				.substr(13)
				.remove(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g);
		}, "nsub"        : function substituteNInBigIntegers(num, n=1) {
			return type(num) === "bigint" ?
				n * Number(num) :
				num;
		}, "revLList"    : function reverseLinkedList(list) {
			for (let cur = list.head, prev = null, next; current ;) 
				[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
			list.head = prev || list.head;
			return list;
		}, "fpart"       : function fPart(n, number=true) {
			if ( rMath.isNaN(n) ) return NaN;
			if ( n.isInt() ) return number ? 0 : "0.0";
			if ((n+"").incl("e+")) n = n.toPrecision(100);
			else if ((n+"").incl("e-")) n = sMath.div10( (n+"").slc(0, "e"), Number((n+"").slc("-", void 0, 1)) );
			return number ?
				Number( (n+"").slc(".") ) :
				`0${`${n}`.slc(".")}`;
		}, "str"         : function String(a) {
			return a?.toString?.(
				...Array.from(arguments).slc(1)
			);
			// return a?.toString?.apply?.(
			// 	Array.from(arguments).slc(1)
			// );
		}, "numToWords"  : function numberToWords(number, fancyInfinity=true) {
			if (abs(number) === Infinity) return `${number<0?"negative ":""}${fancyInfinity?"apeirogintillion":"infinity"}`;
			// TODO: Update to use a loop or something to expand to as close to infinity as possible
			if (rMath.isNaN(number)) throw Error(`Expected a number, and found a(n) ${type(number)}`);
			var string = number.toString().remove(/\.$/);
			number = Number(number);
			switch (!0) {
				case /\./.in(string):
					var decimals = `${numberToWords(string.substring(0, string.io(".")))} point`;
					for (var i = string.io(".") + 1; i < len(string); i++)
						decimals += ` ${numberToWords(string[i])}`;
					return decimals;
				case string < 0 || Object.is(Number(string), -0): return `negative ${numberToWords(string.substr(1))}`;
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
				case string < 1e5: return`${numberToWords(string.substr(0,2))} thousand ${numberToWords(string.substr(2))}`;
				case string % 1e3===0 && len(string)===6: return `${numberToWords(string.substr(0,3))} thousand`;
				case string < 1e6: return`${numberToWords(string.substr(0,3))} thousand ${numberToWords(string.substr(3))}`;
				case string % 1e6===0 && len(string)===7: return `${numberToWords(string[0])} million`;
				case string < 1e7: return`${numberToWords(string[0])} million ${numberToWords(string.substr(1))}`;
				case string % 1e6===0 && len(string)===8: return `${numberToWords(string.substr(0,2))} million`;
				case string < 1e8: return `${numberToWords(string.substr(0,2))} million ${numberToWords(string.substr(2))}`;
				case string % 1e6===0 && len(string)===9: return `${numberToWords(string.substr(0,3))} million`;
				case string < 1e9: return `${numberToWords(string.substr(0,3))} million ${numberToWords(string.substr(3))}`;
				case string % 1e9===0 && len(string)===10: return `${numberToWords(string[0])} billion`;
				case string < 1e10: return `${numberToWords(string[0])} billion ${numberToWords(string.substr(1))}`;
				case string % 1e9===0 && len(string)===11: return `${numberToWords(string.substr(0,2))} billion`;
				case string < 1e11: return `${numberToWords(string.substr(0,2))} billion ${numberToWords(string.substr(2))}`;
				default: throw Error(`Invalid Number. The function Only works for {x:|x| < 1e11}\n\t\tinput: ${numToStrW_s(number)}`);
			}
		}, "numToStrW_s" : function numberToStringWithUnderscores(number) {
			for (var i = 0, str2 = "", str = `${number}`.reverse(); i < len(str); i++) {
				(!(i % 3) && i) && (str2 += "_");
				str2 += str[i];
			}
			return str2.reverse();
		}, "Errors"      : function customErrors(name="Error", text="") {
			Error.prototype.name = `${name}`;
			throw new Error(text).stack.remove(/ {4}at(.|\s)*\n/);
		}, "strMul"      : function stringMultiplication(s1="", num=1) {
			// the same as regular string multiplication in Python
			if (isNaN(num) || type(s1, 1) !== "str") return "";
			for (var i = num, s2 = ""; i --> 0 ;) s2 += s1;
			return s2;
		}, "numStrNorm"  : function NormalizeNumberString(snum="0.0") {
			if (isNaN(snum)) return NaN;
			snum = snum.toString();
			if (rMath.eq.seq(snum, "0.0")) return "0.0";
			!snum.incl(".") && (snum += ".0");
			if (snum[0] === "-")
				while (snum[1] === "0" && snum[2] !== ".")
					snum = `-${snum.substr(2)}`;
			else while (snum[0] === "0" && snum[1] !== ".")
					snum = snum.substr(1);
			while (snum[dim(snum)] === "0" && snum[dim(snum, 2)] !== ".")
				snum = snum.substr(0, dim(snum));
			return snum + (snum.endsW(".") ? "0" : "");
		}, "formatjson"  : function formatJSON(json="{}", {
			objectNewline = true,
			tab = "\t",
			newline = "\n",
			space = " ",
			arrayOneLine = true,
			arrayAlwaysOneLine = false, // doesn't do anything yet
			arrayOneLineSpace = " ", // if " ", [ ITEM ]. if "\t", [\tITEM\t]. etc
		}={}) {
			if (typeof json !== "string") throw TypeError("formatjson() requires a string");
			try {JSON.parse(json) } catch { throw TypeError("formatjson() requires a JSON string") }
			if (json.remove(/\s/g) === "{}") return "{}";
			if (json.remove(/\s/g) === "[]") return `[${newline}${newline}]`;
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
					let s = json.substr(i);
					output += json[i] + (!objectNewline && json[i + 1 + len(s) - len(s.remove(/^\s+/))] === "{" ? `${space}` : `${newline}${strMul(tab, tabs)}`);
				} else output += json[i];
			}
			return output;
		}, "minifyjson"  : function minifyJSON(json) {
			// removes all the unnecessary spaces and things
			return formatjson(json, {
				objectNewline      : true, // less conditionals are checked if this is set to true
				tab                : "",
				newline            : "",
				space              : "",
				arrayOneLine       : false, // less conditionals
				arrayAlwaysOneLine : false,
				arrayOneLineSpace  : "",
			})
		}, dim(e, n=1) { return e?.length - n }
		, len(e) { return e?.length }
		, complex(re=0, im=0) { return cMath?.new?.(re, im) }
		, copy(object) { return JSON.parse( JSON.stringify(obj) ) }
		, async getIp() { return (await fetch("https://api.ipify.org/")).text() }
		, "instance Logic": class Logic {
			constructor(bitwise=Logic_BitWise_Argument, comparatives=Logic_Comparatives_Argument, help=Logic_Help_Argument) {
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
						iff: "Takes 2 arguments. retruns true if both arguments coerce to the same boolean value, otherwise it returns false. ",
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
			}
			not(...a) {// NOT gate
				// +---+-----+
				// | p | ¬ p |
				// +---+-----+
				// | T |  F  |
				// | F |  T  |
				// +---+-----+
				return len(a) == 1 ? !a[0] : a.map(b=>!b);
			}
			and(...a) {// AND gate
				// +---+---+-------+
				// | p | q | p ∧ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   F   |
				// +---+---+-------+
				if (json?.stringify?.(a = a?.flatten?.()) === "[]") 
					return !1;
				for (var i = len(a); i --> 0 ;)
					if (a[i] == !1) return !1;
				return !0;
			}
			nand(...a) {// not (p and q)
				// +---+---+-------+
				// | p | q | p ⊼ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.and(a);
			}
			or(...a) {// OR gate
				// +---+---+-------+
				// | p | q | p ∨ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (json.stringify(a = a.flatten()) === "[]") return !1;
				for (var i = len(a); i --> 0 ;)
					if (a[i] == !0) return !0;
				return !1;
			}
			nor(...a) {// not (p or q)
				// +---+---+-------+
				// | p | q | p ⊽ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.or(a);
			}
			xor(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (json.stringify(a = a.flatten()) === "[]")
					return !1;
				return len(a.filter(b => b == !0)) == len(a) / 2
			}
			xor2(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (json.stringify(a = a.flatten()) === "[]")
					return !1;
				return len(a.filter(b => b == !0)) == len(a) % 2 > 0
			}
			nxor(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
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
			}
			nxor2(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
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
			}
			iff(...a) {// boolean algebra name for 'if and only if' (↔, <-->); not(p xor q)
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				return !this.xor(a);
			}
			if(a, b) {// boolean algebra name for 'IMPLY gate'.
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return this.imply(a, b);
			}
			imply(a, b) {// IMPLY gate; P --> Q
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return a ? b == !0 : !0;
			}
			nimply(a, b) {// not (P --> Q)
				// +---+---+---------+
				// | p | q | p ->/ q |
				// +---+---+---------+
				// | T | T |    F    |
				// | T | F |    T    |
				// | F | T |    F    |
				// | F | F |    F    |
				// +---+---+---------+
				return !this.if(a, b);
			}
			xnor() {// exclusive-nor but what it does what it says it does
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
			}
			is(...a) {// Object.is() but more than 2 inputs
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = len(a); i --> 0 ;)
					if (a[i] !== a[0]) return !1;
				return !0;
			}
			isnt(...a) {// !Object.is() but more than 2 inputs and broken
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = len(a) - 1; i --> 0;) {
					if ( len(a.filter(b => b === a.last())) !== 1 )
						return !1;
					a.pop();
				}
				return !0;
			}
			near(n1, n2, range=Number.EPSILON) {// same as python math.isclose() with different default range
				return n1 > n2 - range && n1 < n2 + range ?
					!0 :
					!1;
			}
		}, "instance sMath": class stringRealMath {
			constructor(help=sMath_Help_Argument, comparatives=sMath_Comparatives_Argument) {
				help === "default" && (help = !0);
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
				}; if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") {// >
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
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
						return this.gt(a, b) ||
							this.eq(a, b);
					}, lt(a="0.0", b="0.0") {// <
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
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
							return this.eq( a.substr(1), b.substr(1) );

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
							return this.ne( a.substr(1), b.substr(1) );


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
							if (snum[i] !== "0" && snum[i] !== ".") return false;
						return true;
					}, nz(snum="0.0") {
						// x != 0
						for (var i = 0, n = len(snum); i < n; i++)
							if (snum[i] !== "0" && snum[i] !== ".") return true;
						return false;
					}, ng(snum="0.0") { /*x < 0*/ return snum[0] === "-" },
					nn(snum="0.0") { /*x >= 0*/ return snum[0] !== "-" },
					ps(snum="0.0") { /*x > 0*/ return snum[0] !== "-" && this.nz(snum) },
					np(snum="0.0") { /*x <= 0*/ return snum[0] === "-" || this.ez(snum) },
				};
			} add(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				if (a.startsW("-") && b.startsW("-"))
					return this.neg( this.add(a.substr(1), b.substr(1)) );
				if (a.sW("-")  && !b.sW("-")) return this.sub(b, a.substr(1));
				if (!a.sW("-") &&  b.sW("-")) return this.sub(a, b.substr(1));
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b) - len(a));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a) - len(b));
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
				return c.incl(".") ? c : `${c}.0`;
			} sub(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				if (!a.sW("-") && b.sW("-")) return this.add(a, b.substr(1));
				if (a.sW("-") && b.sW("-")) return this.sub(b.substr(1), a);
				if (a.sW("-") && !b.sW("-"))
					return this.neg( this.add(a.substr(1), b) );
				if (this.eq.gt(b, a)) return this.neg( this.sub(b, a) );
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b) - len(a));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a) - len(b));
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
				return c.incl(".") ? c : `${c}.0`;
			} mul(a="0.0", b="0.0") {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
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
				total = (total.substr(0, len(total) - dec) + "." + total.substr(len(total) - dec)).replace(/\.$/, ".0");
				return sign === -1 ? this.neg( total ) : total;
			} mul10(snum="0.0", x=1) {
				if (rMath.isNaN(snum)) return NaN;
				if (isNaN( x = int(Number(x)) )) return NaN;
				if (!x) return snum;
				if (x < 0) return this.div10(snum, -x);
				snum = numStrNorm( snum+"" );
				let i = snum.io("."),
					tmp = snum.slc(0, i) + snum.slc(i + 1, i + x + 1),
					output = tmp + strMul("0", i + x - len(tmp)) + "." + snum.slc(i+x+1);
				return numStrNorm(output + (output.last() === "." ? "0" : ""));
			} div(num="0.0", denom="1.0", precision=18) {
				// NOTE: Will probably break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				isNaN(precision = Number(precision)) && (precision = 18);
				if ( this.eq.ez(denom) )
					return this.eq.ez(num) ?
						NaN :
						Infinity;
				if ( this.eq.ez(num) ) return "0.0";
				num = numStrNorm( num+"" ); denom = numStrNorm( denom+"" );
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
				num = numStrNorm( num+"" ); denom = numStrNorm( denom+"" );
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
				snum = numStrNorm( snum+"" );
				var i = snum.io("."),
					tmp = snum.slc(0, i - x),
					output = tmp + "." + strMul("0", len(tmp) + x - i) + snum.slc(i - x, i) + snum.slc(i + 1);
				return numStrNorm((output[0] == "." ? "0" : "") + output);
			} idiv(num="0.0", denom="1.0", precision=18) {
				// assumes correct input. (sNumber, sNumber, Positive-Integer)
				if ( this.eq.ez(denom) )
					return this.eq.ez(num) ?
						NaN :
						Infinity;
				if ( this.eq.ez(num) ) return "0.0";
				num = numStrNorm( num+"" ); denom = numStrNorm( denom+"" );
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
			} mod(a="0.0", b="0.0", precision=18) {
				return this.sub(
					a, this.mul( b, this.fdiv(a, b, precision) )
				)
				throw Error("Not Implemented");
			} ipow(a="0.0", b="1.0") {
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				if ( this.eq.nz(fpart(b, !1)) ) throw Error("no decimals allowed for exponent.");
				var t = "1.0";
				if (this.sgn(b) >= 0) for (; b > 0; b = this.decr(b)) t = this.mul(t, a);
				else for (; b < 0; b = this.add(b, 1)) t = this.div(t, a);
				return t;
			} ifact(n="0.0") {
				if ( this.eq.nz(fpart(n, !1)) ) throw Error("no decimals allowed.");
				for (var i = n+"", total = "1.0"; i > 0; i = this.decr(i))
					total = this.mul(i, total);
				return this.ipart(total);
			} neg(snum="0.0") {
				// negate
				return snum[0] === "-" ?
					snum.substr(1) :
					`-${snum}`;
			} sgn(snum="0.0") {
				// string sign. sMath.sgn("-0") => -1
				return snum[0] === "-" ?
					-1 :
					/^0+\.?0*$/.test(snum) ?
						0 :
						1;
			} sign(snum="0.0") {
				return this.sgn(snum);
				;
			} ssgn(snum="0.0") {
				// string sign. sMath.sgn("-0") => -1
				return snum[0] === "-" ?
					"-1.0" :
					/^0+\.?0*$/.test(snum) ?
						"0.0" :
						"1.0";
			} ssign(snum="0.0") {
				return this.ssgn(snum);
				;
			} abs(snum="0.0") {
				return snum[0] === "-" ?
					snum.substr(1) :
					snum;
			} fpart(n="0.0") {
				return isNaN(n) ?
					NaN :
					fpart(n, !1);
			} ipart(n="0.0") {
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
				var ans = this.ipart(snum+".0");
				snum[0] === "-" && this.isFloat(snum) && (ans = this.decr(ans));
				return ans;
			} ceil(snum="0.0") {
				var ans = this.ipart(snum+".0");
				this.eq.ps(snum) && this.isFloat(snum) && (ans = this.add(ans, 1));
				return ans;
			} round(snum="0.0") {
				return this.eq.lt(this.fpart(snum+".0"), "0.5") ?
					this.ipart(snum) :
					this.add(this.ipart(snum), this.sgn(snum)+"")
			} trunc(snum="0.0") {
				return this.ipart(
					snum
				);
			} new(number=1) {
				return number === int(number) ?
					number + ".0" :
					number + "";
			} lcm(...snums) {
				return this._lmgf(
					"lcm", ...snums
				)
			} gcd(...snums) {
				return this._lmgf(
					"gcd", ...snums
				)
			} gcf(...snums) {
				return this._lmgf(
					"gcf", ...snums
				)
			}
		}, "instance rMath": class RealMath {
			constructor(
				degTrig = rMath_DegTrig_Argument,
				help = rMath_Help_Argument,
				comparatives = rMath_Comparatives_Argument,
				constants = rMath_Constants_Argument,
			) {
				degTrig === "default" && (degTrig = !0);
				help         === "default" && (help = !0);
				comparatives === "default" && (comparatives = !0);
				constants    === "default" && (constants = !0);
				this.Set = class RealSet extends Array {
					// Probably not constant time lookup.
					constructor(...args) {
						args = args.flatten().filter(e => type(e) === "number");
						if (len(args) === 1) {
							super(...args.concat([null]));
							this.pop();
						} else super(...args.sort());
					}
					add(number=0) {
						if (type(number) !== "number") return !1;
						for (const n of this) if (n === number) return !1;
						this.push(number);
						this.sort();
						return !0;
					}
					delete(number=0) {
						;
						return this.remove(number);
					}
					has(number=0) {
						;
						return this.incl(number);
					}
					check() { // checks to make sure everything is a number and non-repeating
						// fix in case the user used push or unshift instead of add.
						// because that defeats the purpose
						for (var i = len(this); i --> 0 ;)
							type(this[i]) !== "number" && this.splice(i, 1);
						return this.sort();
					}
					cumsum() {
						var t = 0;
						for (const n of this) t += n;
						return t;
					}
					type() {
						return "set";
						;
					}
					sortA() {
						var list = this.valueOf();
						for (var output = []; len(list) > 0 ;) {
							output.push( rMath.min(list) );
							list.splice(
								list.io(rMath.min(list)), 1
							);
						}
						for (const n of output) this.push(n);
						return this;
					}
					sortD() {
						;
						return this.sortA().reverse();
					}
					sort(type="A") {
						try { return this[`sort${type[0].upper()}`] }
						catch { return !1 }
					}
					union(set, New=true) {
						if (type(set, 1) !== "set") return !1;
						return "Not finished";
					}
				};
				this.phi = this.PHI = this.ϕ = ϕ; this.e = this.E = this.𝑒 = 𝑒;
				this.ec    = this.γ = γ; this.pi  = this.PI  = π;
				this.foias = this.α = α; this.tau = this.TAU = this.𝜏 = 𝜏;
				this.Phi = -0.6180339887498949; this.sqrt3 = 1.7320508075688772;
				this.omega   = 0.5671432904097838 ; this.LN2     = 0.6931471805599453;
				this.ln2     = .69314718055994531 ; this.LN10    = 2.3025850929940450;
				this.ln10    = 2.3025850929940456 ; this.LOG2E   = 1.4426950408889634;
				this.log2e   = 1.4426950408889634 ; this.LOG10E  = 0.4342944819032518;
				this.loge    = .43429448190325183 ; this.SQRT1_2 = 0.7071067811865476;
				this.sqrt1_2 = .70710678118654752 ; this.SQRT2   = 1.4142135623730951;
				this.sqrt2   = 1.4142135623730951 ; this.logpi10 = 2.0114658675880609;
				this.dtor = .01745329251994329576 ; this.rtod = 57.295779513082320876;
				this.sqrt5 = 2.23606797749979; this.π_2 = 1.5707963267948966; // Math.π_2 == Math.π/2 but faster
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
					undefined: "If a value is undefined, It means that it was added and not comleted, than removed, but it is planned to reimplement it at a later date.",
					trig: { // update trig
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
					mod2: "Takes 3 arguments (a, n, k). returns a % n + k through iteration. mod() is better in every way. the built in '%' operator is probably even faster as well.",
					mod: "Takes 3 arguments (a, n, k).  similar to a%n + k.",
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
					// TODO: Fix li() documentation
					li: "3 arguments. 1: number to take li of. 2: increment or accuracy depending on the form. 3: form number. form 1 uses an integral. form 2 uses a summation. form 3 does π(x) because it is asymptotic to it. form 3 is the fastest",
					Li: null,
					Ei: null,
					tetrate: "Takes 2 numeric arguments (a and b).  returns a to the power of a, n times. look up tetration for more information",
					hyper0: "Takes 1 argument and returns 1 + the argument",
					hyper1: "Takes 2 numeric arguments and returns the sum of the arguments",
					hyper2: "Takes 2 numeric arguments and returns the product of the arguments",
					hyper3: "Takes 2 numeric arguments and returns the first argument to the power of the second argument",
					hyper4: "Takes 2 numeric arguments (a and b).  returns a to the power of a, n times. look up tetration for more information",
					Si: null,
					si: null,
					Cin: null,
					Ci: null,
					Shi: null,
					Chi: null,
					tanhc: "Takes 1 numeric argument (z) and returns tanh(z) / z",
					sinhc: "Takes 1 numeric argument (z) and returns sinh(z) / z",
					Tanc : "Takes 1 numeric argument (x) and returns tanx / x using radians",
					Coshc: "Takes 1 numeric argument (z) and returns cosh(z) / z",
					H: null,
					W: null,
					deriv: null,
					tanLine: null,
					gd: null,
					lam: null,
					base10Conv: null,
					bin: null,
					oct: null,
					hex: null,
					timesTable: null,
					cosNxSimplify: null,
					heron: null,
					tempConv: null,
					coprime: null,
					ncoprime: null,
					cumsum: null,
					set: null,
					setUnion: null,
					piApprox: undefined,
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
					excst: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.cot(x)), // sqrt(exsec^2 + cot^2)
					// aexcst: x => Error("not implemented"),
					exset: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.tan(x)), // sqrt(exsec^2 + tan^2)
					// aexset: x => Error("not implemented"),
					vcs: x => isNaN( x = Number(x) ) ? x : this.hypot(this.deg.verc(x), this.deg.sin(x)), // sqrt(vercos^2 + sin^2)
					// avcs: x => Error("not implemented"),
					cvs: x => isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.sin(x)), // sqrt(1 + sin^2)
					acvs: x => isNaN( x = Number(x) ) ? x : this.deg.asin(x**2 - 1), // asin(x^2 - 1)
					ccvs: x => isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.cos(x)), // sqrt(1 + cos^2)
					accvs: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x**2 - 1), // acos(x^2 - 1)
					crd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.sin(x / 2), // chord
					acrd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.asin(x / 2), // arc-chord
					ccrd: x => isNaN( x = Number(x) ) ? x : 2 * this.deg.cos(x / 2), // co-chord
					accrd: x => isNaN( x = Number(x) ) ? x : π/2 - this.deg.acrd(x), // arc-co-chord
					exsec: x => isNaN( x = Number(x) ) ? x : this.deg.sec(x) - 1, // external-secant
					aexsec: x => isNaN( x = Number(x) ) ? x : this.deg.asec(x + 1), // arc-exsecant
					excsc: x => isNaN( x = Number(x) ) ? x : this.deg.csc(x) - 1, // external-cosecant
					aexcsc: x => isNaN( x = Number(x) ) ? x : this.deg.acsc(x + 1), // arc-ex-cosecant
					vers: x => isNaN( x = Number(x) ) ? x : 1 - this.deg.cos(x), // versine
					avers: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x + 1), // arc-versine
					verc: x => isNaN( x = Number(x) ) ? x : 1 + this.deg.cos(x), // vercosine
					averc: x => isNaN( x = Number(x) ) ? x : this.deg.acos(x - 1), // arc-vercosine
					cvers: x => isNaN( x = Number(x) ) ? x : 1 - this.deg.sin(x), // coversine
					acvers: x => isNaN( x = Number(x) ) ? x : this.deg.asin(1 - x), // arc-coversine
					cverc: x => isNaN( x = Number(x) ) ? x : 1 + this.deg.sin(x), // covercosine
					acverc: x => isNaN( x = Number(x) ) ? x : this.deg.asin(x - 1), // arc-covercosine
					hav: x => isNaN( x = Number(x) ) ? x : this.deg.vers(x) / 2, // haversine
					ahav: x => isNaN( x = Number(x) ) ? x : this.acos(1 - 2*x), // arc-haversine
					hverc: x => isNaN( x = Number(x) ) ? x : this.deg.verc(x) / 2, // havercosine
					ahverc: x => isNaN( x = Number(x) ) ? x : this.deg.acos(2*x - 1), // arc-havercosine
					hcvers: x => isNaN( x = Number(x) ) ? x : this.deg.cvers(x) / 2, // hacoversine
					ahcvers: x => isNaN( x = Number(x) ) ? x : this.deg.asin(1 - 2*x), // arc-hacoversine
					hcverc: x => isNaN( x = Number(x) ) ? x : this.deg.cverc(x) / 2, // hacovercosine
					ahcverc: x => isNaN( x = Number(x) ) ? x : this.deg.asin(2*x - 1), // arc-hacovercosine
				}; if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") {// >
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return !1;
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
						return this.gt(a, b) || this.seq(a, b);
					}, lt(a="0.0", b="0.0") {// <
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return !1;
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
					}, le(a="0.0", b="0.0") {/* <= */
						return this.lt(a, b) ||
							this.seq(a, b);
					}, leq(a=0, b=0) { // loose equal to. regular decimal place number
						return Number(a) === Number(b);
					}, seq(a="0.0", b="0.0") {// strict equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !1;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0)
							return this.seq( a.substr(1), b.substr(1) );

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
					}, lneq(a=0, b=0) {// loose not equal to. normal number of decimal places
						return Number(a) !== Number(b);
					}, sneq(a="0.0", b="0.0") {// strict not equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a += ""; !a.incl(".") && ( a += ".0" );
						b += ""; !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return !0;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0)
							return this.sneq( a.substr(1), b.substr(1) );


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
					},
				}; if (constants) {
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
					this.speedOfLight = this.c = 299792458             ;
					this.stefanBoltzmann = 5.67037441918443e-8         ;
					this.weakMixingAngle = 0.2229                      ;
					this.solarConstants = {
						Earth: 1380,
						Venus: 2613,
						Mars : 589
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
				}
				else {
					while ( i --> 0 ) {
						prev = ans;
						ans = (1 + ans) / (1 + x**ans)
						if (prev === ans) break;
					}
				}
				return ans;
			} ζ(s, a, acy=1000) {
				if (s === Infinity) return 1;
				if (s === 0) return -.5;
				if (s === 1) return Infinity;
				return isNaN( s = Number(s) ) ||
					s <= 1 ||
					isNaN( acy = Number(acy) ) ?
						NaN :
						this.sum(1, acy, n => (n + a)**-s);
			} Rzeta(s, acy=1000, a=0) {
				// Reimann zeta function
				// TODO: Use the analytic continuation expansion for s < 1
				return this.ζ(s, a, acy);
			} Hzeta(s, a, acy=1000) {
				// Hurwitz zeta function
				return this.Rzeta(s, acy, a);
			} π(x, form=1) {
				if (isNaN( x = round(Number(x)) )) return NaN;
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
			} primeCount(x, form=1) {
				;
				return this.π(x, form);
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
			} expm(x, n) {
				;
				return 𝑒 ** x - n;
			} expm1(x) {
				;
				return 𝑒 ** x - 1;
			} log2(x) {
				;
				return this.logbase(2, x);
			} log10(x) {
				;
				return this.logbase(10, x);
			} logpi(x) {
				;
				return this.logbase(π, x);
			} log1p(x) {
				;
				return this.ln1p(x);
			} clz32(n) {
				;
				return this.clbz(n);
			} clbz(n) {
				if (isNaN( n = Number(n) )) return NaN;
				if (n < 0 || n > 2_147_483_647) return 0; // 2^31 - 1
				n = n.toString(2);
				while ( len(n) < 32 ) n = `0${n}`;
				return len( n.remove(/1.*/) );
			} fact(n, acy=1e3, inc=.1) {
				// TODO: Fix for negative non-integer numbers
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( acy = Number(acy) )) return NaN;
				if (isNaN( inc = Number(inc) ) || !inc) return NaN;
				if ( n.isInt() ) return this.ifact(n);
				var ans = this.int(0, acy, x=>x**n/𝑒**x, inc);
				return type(ans, 1) === "inf" ? NaN : ans;
			} factorial(n) {
				;
				return this.fact(n);
			} sgn(n) {
				return isNaN( n = Number(n) ) ?
					NaN :
					!n ?
						n :
						n<0 ?
							-1 :
							1;
			} abs(n) {
				return isNaN( n = Number(n) ) ?
					NaN :
					this.sgn(n) * n;
			} cabs(cnum) {
				return cMath.abs(
					cnum
				);
			} sum(n, last, fn=n=>n, inc=1) {
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func")
					throw TypeError("rMath.sum() requires a function third argument");
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
			} infsum(start=0/*, last=Infinity*/, fn=n=>1/n, inc=1) {
				if (isNaN( start = Number(start) )) return NaN;
				if (type(fn, 1) !== "func")
					throw TypeError("rMath.infsum() requires a function second argument");
				if (isNaN( inc = Number(inc) )) return NaN;
				return this.sum(start, Infinity, fn, inc);
			} prod(n, last, fn=n=>n, inc=1) {
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func") throw TypeError("rMath.prod() requires a function third argument");
				if (isNaN( inc = Number(inc) )) return NaN;
				for (var total = 1; n <= last; n += inc)
					total *= fn(n);
				return total;
			} gamma(n, acy=1e3, inc=.1) {
				if (isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (isNaN( acy = Number(acy) )) return NaN;
				if (isNaN( inc = Number(inc) )) return NaN;
				n--;
				var ans = this.int(0, acy, t=>t**n/𝑒**t, inc);
				return type(ans, 1) === "inf" ? NaN : n;
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
			} _(n) {
				return isNaN( n = Number(n) ) ?
					NaN :
					1 / n;
			} inverse(n) {
				return isNaN( n = Number(n) ) ?
					NaN :
					1 / n;
			} int(x/*start*/, end, fn=x=>x, inc=.001) {
				// start and end are included.
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( end = Number(end) )) return NaN;
				if (type(fn, 1) !== "func")
					throw TypeError("rMath.int() requires a function third argument");
				if (isNaN( inc = Number(inc) )) return NaN;
				let ans = 0;
				if (end > x)
					for (; x <= end; x += inc)
						ans += (fn(x) + fn(x + inc)) / 2 * inc;
				else if (x > end) return -this.int(end, x, fn, inc);
				return ans;
			} hypot(...ns) {
				ns = ns.flatten().map(e => Number(e));
				if ( ns.isNaN() ) return NaN;
				for (var a = 0, i = 0, n = len(ns); i < n; i++)
					a += ns[i]**2;
				return a**.5;
			} log(x, base=MATH_LOG_DEFAULT_BASE) {
				// TODO: Fix.
				if (isNaN( x = Number(x) ) || isNaN( base = Number(base) ) || base <= 0 || x <= 0 || base === 1)
					return NaN;
				if (base === Infinity) return x === Infinity ? NaN : 0;
				if (x === Infinity) return Infinity;
				for (var ans = floor(x / 2 / base), tmp = 1, i = 1000; i --> 0 && ans != ans + tmp; tmp /= 10) while (
					ans !=(ans += abs(x - base**(ans - tmp)) < abs(x - base**ans) ? -tmp :
						abs(x - base**(ans + tmp)) < abs(x - base**ans) ? tmp : 0)
				);
				return ans;
			} logbase(base, n) {
				return isNaN( base = Number(base) ) ||
				isNaN( n = Number(n) ) ?
					NaN :
					this.log( n, base );
			} ln(n) {
				return isNaN( n = n ) ?
					NaN : this.log( n, 𝑒 );
			} max(...ns) {
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
			} mean(/*arguments*/) {
				return Array.from(arguments).reduce((t, e) => t + e, 0) /
					len(arguments);
			} median(/*arguments*/) {
				let arr = Array.from(arguments).flatten();
				return len(arr) % 2 ?
					arr[dim(arr) / 2] :
					(arr[len(arr)/2 - 1] + arr[len(arr)/2]) / 2
			} mode(...ns) {
				// TODO: Finish
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				var obj = {};
				for (const n of ns) {
					if (n in obj) obj[n]++;
					else obj[n] = 1;
				}
				const max = this.max( Object.values(obj) );
				// get max value
				// return all keys with that value
			} mad(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				const MEAN = this.mean(ns);
				return ns.reduce((absDev, n) => absDev + this.abs(n - MEAN), 0) / len(ns);
			} isPrime(n) {
				return this.isNaN(n) ?
					NaN :
					n.isPrime();
			} _lmgf(t="lcm", ...ns) {
				// least commond multiple and greatest common factor
				ns = ns.flatten();
				type(t) !== "string" && (t = "lcm");
				if ( ns.isNaN() ) return NaN;
				if (t[0] === "g") {
					for (const e of ns)
						if (!e?.isInt?.())
							return 1;
				} else if (t[0] === "l")
					for (const e of ns)
						if (!e?.isInt?.())
							return ns.reduce((t, e) => t*e, 1);
				for (var c, i = t[0] === "l" ? this.max(ns) : this.min(ns); ; t[0] === "l" ? i++ : i-- ) {
					for (var j = dim(ns); j >= 0; --j) {
						if (t[0] === "l" ? i % ns[j] : ns[j] % i) {
							c = !1;
							break;
						}
						c = !0;
					}
					if (c) return i;
				}
			} linReg(xs, ys, Return="obj") {
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
					for (; len(xs) > MIN;) xs.pop();
					for (; len(ys) > MIN;) ys.pop();
				}
				var m = (
					len(xs) * this.sum(0, len(xs)-1, n=>xs[n]*ys[n]) -
					this.sum(0, dim(xs), n=>xs[n]) * this.sum(0, dim(ys), n=>ys[n])
				)/(len(xs) * this.sum(0, dim(xs), n=>xs[n]**2) - this.sum(0, dim(xs), n=>xs[n])**2),
				b = (this.sum(0, dim(xs), n=>ys[n]) - m * this.sum(0, dim(xs), n=>xs[n])) / len(xs);
				if (Return === "obj") return {m: m, b: b};
				return `y = ${m}x + ${b}`;
			} pascal(row, col) {
				// pascal's triangle
				if (isNaN( row = Number(row) )) return NaN;
				if (col !== "all") col = Number(all);
				if (type(col, 1) !== "num" && col !== "all") return NaN;
				row--;
				if (col?.lower() !== "all") return this.nCr(row, col-1);
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
			} fibonacci(n=1) {
				return isNaN( n = Number(n) ) ?
					NaN :
					this.fib(n);
			} lucas(n=1) {
				return isNaN( n = Number(n) ) ?
					NaN :
					round( ϕ**n + this.Phi**n );
				// ⌊ϕⁿ⌉ ∀ n∈ℕ > 1
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
				for (var i = 2, factors = [1, n], n = this.sqrt(n); i <= n; i++) {
					if (!(n % i)) factors.push(i, n / i);
				}
				return factors;
			} iMaxFactor(n) {
				if (isNaN( n = Number(n) )) return NaN;
				for (var i = n;;)
					if (!(n % --i))
						return i;
			} synthDiv(coeffs, /*x-*/divisor, includeRemainder=true, remainderType="string") {
				if (type(coeffs, 1) !== "arr") throw TypeError("rMath.synthDiv() requires a array first argument");
				if (type(remainderType) !== "string") throw TypeError("rMath.synthDiv() requires a string fourth argument");
				if (isNaN( divisor = Number(divisor) )) return NaN;
				for (var coeff = coeffs[0], coeffs2 = [coeffs[0]], n = len(coeffs), i = 1; i < n; i++) {
					coeff = coeff * divisor + coeffs[i];
					coeffs2.push(coeff);
				}
				coeffs = ["string", "str"].incl(remainderType.lower()) ?
					coeffs2.mod(len(coeffs2)-1, e => this.isClose(e, 0, 1e-11) ?
						0 :
						`${e}/${divisor < 0 ?
							`(x-${-divisor})` :
							`(x+${divisor})`}`) :
					coeffs2;
				return includeRemainder ? coeffs : coeffs.pop2();
			} simpRad(rad) {
				if (isNaN( rad = Number(rad) )) return NaN;
				for (var factor = 1, i = 2, sqrt = this.sqrt(this.abs(rad)); i <= sqrt; i += 1 + (i > 2))
					while ( !(rad % (i*i)) ) {
						rad /= i*i;
						factor *= i;
					}
				return `${factor}${rad < 0 ? "i" : ""}√${this.abs(rad)}`.remove(/^1|√1$/);
			} PythagTriple(maxSize=1000) {
				// TODO: Fix
				if (type(maxSize, 1) !== "num") maxSize = 1000;
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
				if (fpart(a) || fpart(m)) return "No Solution";
				if (this.mod(a+m, 2))     return "No Solution";

				var b = (a**2 - m**2) / (2*m),
					c = b + m;
				if (fpart(b) || fpart(c)) return "No Solution";
				return form === Array ?
					[a, b, c] :
					{ a: a, b: b, c: c };
			} neg(num=0, number=false) {
				// negate
				return number ?
					-num :
					num.startsW("-") ?
						num.substr(1) :
						`-${num}`;
			} ssgn(snum="0.0") {
				// string sign
				return snum[0] === "-" ?
					-1 :
					/0+\.?0*/.test(snum) ?
						0 :
						1;
			} ssign(snum="0.0") {
				// string sign
				return this.ssgn(snum);
			} sabs(snum="0.0") {
				// string absolute value
				return snum[0] === "-" ?
					snum.substr(1) :
					snum;
			} add(a="0.0", b="0.0", number=true, precision=Infinity) {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				if ( isNaN(precision) ) precision = Infinity;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				if (a.startsW("-") && b.startsW("-"))
					return this.neg(this.add(a.substr(1), b.substr(1), number, precision) , number);
				if (a.startsW("-")  && !b.startsW("-")) return this.sub(b, a.substr(1), number, precision);
				if (!a.startsW("-") &&  b.startsW("-")) return this.sub(a, b.substr(1), number, precision);
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b) - len(a));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a) - len(b));
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
				if (number) return Number(c);
				return c.io(".") < 0 ?
					c + ".0" :
					c.substr(
						0, c.io(".") + (isNaN(precision) ? Infinity : precision + 1)
					);
			} sub(a="0.0", b="0.0", number=true, precision=Infinity) {
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				if (isNaN( precision )) precision = Infinity;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				if (!a.startsW("-") && b.startsW("-")) return this.add(a, b.substr(1), number, precision);
				if (a.startsW("-") && b.startsW("-")) return this.sub(b.substr(1), a, number, precision);
				if (a.startsW("-") && !b.startsW("-"))
					return this.neg( this.add(a.substr(1), b, number, precision) , number);
				if (this.eq.gt(b, a)) return this.neg( this.sub(b, a, number, precision) , number );
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b) - len(a));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a) - len(b));
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
						tmp = this.abs( floor(c[i][j] / 10) );
						while (c[i][j] < 0) {
							i + j && (c[i][j] += 10);
							if (j) c[i][j-1] -= tmp;
							else if (i === 1) c[0][dim(c[0])] -= tmp;
							else throw Error(`Broken. End value shouldn't be negative.`);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".");
				if (number) return Number(c);
				return c.io(".") < 0 ?
					c + ".0" :
					c.substr(
						0, c.io(".") + (isNaN(precision) ? Infinity : precision + 1)
					);
			} mul(a="0.0", b="0.0", number=true, precision=Infinity) {
				if (this.isNaN(a) || this.isNaN(b)) return NaN;
				a = numStrNorm( a+"" ); b = numStrNorm( b+"" );
				const sign = this.ssgn(a) === this.ssgn(b) ? 1 : -1;
				a = this.sabs(a); b = this.sabs(b);
				if (this.eq.seq(a, 0) || this.eq.seq(b, 0)) return number ? 0 : "0.0";

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
					total = this.add(arr[i], total, !1, precision)
						.remove(/\.0+$/);
				total = (total.substr(0, len(total) - dec) + "." + total.substr(len(total) - dec)).replace(/\.$/, ".0");
				return sign === -1 ?
					this.neg( total , number ) :
					number ? Number(total) : total;
			} div(num="0.0", denom="1.0", number=true, precision=18) {
				// NOTE: Will probably break the denominator is "-0"
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				isNaN(precision) && (precision = 18);
				if ( this.eq.seq(denom, 0) )
					return this.eq.seq(num, 0) ?
						NaN : Infinity;
				if ( this.eq.seq(num, 0) )
					return number ?
						0 :
						"0.0";
				num = numStrNorm( num+"" ); denom = numStrNorm( denom+"" );
				const sign = this.ssgn(num) * this.ssgn(denom);
				num = this.sabs(num); denom = this.sabs(denom);

				let exponent = this.max(
					len(fpart(num, !1)),
					len(fpart(denom, !1))
				) - 2;
				num = sMath.mul10(num, exponent);
				denom = sMath.mul10(denom, exponent);

				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom, !1);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while (this.eq.ge(tmp3 = this.sub(tmp1, tmp2, !1), 0)) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision === 0) return `${ansString}.0`;
				var remainder = this.mul(
					this.sub(num, this.mul(ans, denom, !1), !1),
					"10.0", !1
				);
				if (this.eq.sneq(remainder, 0)) ansString += ".";
				for (var i = 0, j; this.eq.sneq(remainder, 0) && i++ < precision ;) {
					for (j = 9; this.eq.lt(this.sub(remainder, table[j], !1), 0) ;) j--;
					remainder = this.mul(
						this.sub(remainder, table[j], !1),
						"10.0", !1
					);
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				ansString = sign === -1 ? `-${ansString}` : ansString;
				return number ? Number(ansString) : ansString;
			} mod2(a, n=1, k=0) {
				// modulo using iteration
				// it is rMath.mod2 because it is slower than rMath.mod
				// a modₖ n
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( k = Number(k) )) return NaN;
				if (!n) return NaN;
				if (a >= 0 && n > 0) for (; a - n >= 0 ;) a -= n;
				else if (a < 0 && n > 0) for (; a < 0 ;) a += n;
				else if (a > 0 && n < 0) for (; a > 0 ;) a += n;
				else if (a < 0 && n < 0) for (; a - n < 0 ;) a -= n;
				return a + k;
			} mod(a, n=1, k=0) {
				// a modₖ n
				// modulo using the formula
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( d = Number(d) )) return NaN;
				if (!n) return NaN;
				return a - n*floor(a/n) + k;
			} parity(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				return len(ns)-1 ?
					ns.map(b => b%2 ? "odd" : "even") :
					ns[0]%2 ? "odd" : "even";
			} nCr(n, k) {
				return isNaN( n = Number(n) ) ||
					isNaN( k = Number(k) ) ?
					NaN :
					this.nPr(n, k) / this.fact(k);
			} comb(n, k) {
				// idk, python uses "comb" for some reason. probably means "combination"
				return this.nCr(n, k);
			} nPr(n, k) {
				return isNaN( n = Number(n) ) ||
					isNaN( k = Number(k) ) ?
					NaN :
					this.fact(n) / this.fact(n - k);
			} perm(n, k) {
				// permuation
				return this.nPr(n, k);
			} isClose(n1, n2, range=Number.EPSILON) {
				return isNaN( n1 = Number(n1) ) ||
					isNaN( n2 = Number(n2) ) ||
					isNaN( range = Number(range) ) ?
						NaN :
						n1 > n2 - range && n1 < n2 + range;
			} erf(z) {
				return isNaN( z = Number(z) ) ?
					NaN :
					1.1283791670955126 * this.int(0, z, t => 1 / 𝑒**t**2);
			} erfc(z) {
				return isNaN( z = Number(z) ) ?
					NaN :
					1 - this.erf(z);
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
			} copysign(a, b) {
				return isNaN( a = Number(a) ) ||
					isNaN( b = Number(b) ) ?
					NaN :
					this.abs(a) * this.sgn(b);
			} trunc(n) {
				return isNaN( n = Number(n) ) ?
					n :
					int(n);
			} isNaN(e) {
				// is not a number
				return isNaN( Number(e) );
			} isAN(e) {
				// is a number
				return !this.isNaN(e);
			} isaN(e) {
				// is a number
				return this.isAN(e);
			} isNNaN(e) {
				// is not not a number. isaN, isAN
				return this.isAN(e);
			} imul(a, b) {
				return isNaN( a = Number(a) ) ||
					isNaN( b = Number(b) ) ?
						NaN :
						this.Math.imul(a, b);
			} lcm(...ns) {
				return ns.isNaN() ?
					NaN :
					this._lmgf("lcm", ns);
			} gcf(...ns) {
				return ns.isNaN() ?
					NaN :
					this._lmgf("gcf", ns);
			} gcd(...ns) {
				return ns.isNaN() ?
					NaN :
					this._lmgf("gcd", ns);
			} fround(n) {
				return isNaN( n = Number(n) ) ?
					n :
					this.Math.fround(n);
			} sqrt(n) {
				return isNaN( n = Number(n) ) ?
					n :
					this.nthrt(n, 2);
			} cbrt(n) {
				return isNaN( n = Number(n) ) ?
					n :
					this.nthrt(n, 3);
			} lnnp(x, n=1) {
				return isNaN( x = Number(x) ) ?
					x :
					this.ln(n + x);
			} ln1p(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.ln(1 + x);
			} degrees(n) {
				return isNaN( n = Number(n) ) ?
					n :
					n * this.rtod;
			} radians(n) {
				return isNaN( n = Number(n) ) ?
					n :
					n * this.dtor;
			} sign(n) {
				return isNaN( n = Number(n) ) ?
					n :
					this.sgn(n);
			} exp(n, x=𝑒) {
				return isNaN( n = Number(n) ) ||
					isNaN( x = Number(x) ) ?
					NaN :
					x ** n;
			} round(n) {
				return isNaN( n = Number(n) ) ?
					n :
					round(n);
			} floor(n) {
				return isNaN( n = Number(n) ) ?
					n :
					floor(n);
			} ceil(n) {
				return isNaN( n = Number(n) ) ?
					n :
					ceil(n);
			} rand() {
				;
				return rand();
			} random() {
				;
				return rand();
			} pow(a=1, b=1) {
				// TODO: Make "pow" and "nthrt" faster
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( b = Number(b) )) return NaN;
				for (var y = 1, c = b, d = a ; true ; a *= a) {
					b & 1 && (y *= a);
					b >>= 1;
					if (b === 0) return (this.nthrt(d, 1 / fpart(c)) || 1) * y;
				}
			} nthrt(x, rt=2) {
				if (isNaN( x = Number(x) ) || isNaN( rt = Number(rt) ) || x < 0) return NaN;
				if (rt < 0) return this.pow(x, rt);
				if (!rt || !(rt % 2) && x < 0) return NaN;
				if (!x) return 0;
				for (var ans = floor(x/2/rt), tmp=1, i=1000; i --> 0 && ans != ans + tmp; tmp /= 10) while (
					ans != (ans += abs(x - (ans - tmp)**rt) < abs(x - ans**rt) ? -tmp :
						abs(x - (ans + tmp)**rt) < abs(x - ans**rt) ? tmp : 0)
				);
				return ans;
			} square(n) {
				if (isNaN( n = Number(n) )) return NaN;
				return n ** 2;
			} cube(n) {
				if (isNaN( n = Number(n) )) return NaN;
				return n ** 3;
			} tesseract(n) {
				if (isNaN( n = Number(n) )) return NaN;
				return n ** 4;
			} ifact(n) {
				if (isNaN( n = Number(n) )) return NaN;
				if (!n) return 1;
				if (n < 0) return NaN;
				for (var ans = 1, cur = 1; cur <= n; cur++)
					ans *= cur;
				return ans;
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
				return isNaN( x = Number(x) ) ||
					isNaN( incOrAcy = Number(incOrAcy) ) ?
					NaN :
					this.li(x, incOrAcy, form) - 1.045163780117493;
			} Ei(x, incOrAcy=.001, form=1) {
				// Exponential integral
				// Ei(x) = li(e^x) ∀ -π < Im(x) ≤ π
				if (isNaN( x = Number(x) )) return NaN;
				return this.li(e**x, incOrAcy, form);
			} tetrate(a, n, {Switch=false, number=false}={}) {
				return this.hyper4(a, n, {
					Switch: Switch,
					number: number
				});
			} hyper0(n) {
				return isNaN(n) ?
					NaN :
					this.add(n, 1);
			} hyper1(a, n) {
				return isNaN(a) ||
					isNaN(n) ?
					NaN :
					this.add(a, n);
			} hyper2(a, n) {
				return isNaN(a) ||
					isNaN(n) ?
					NaN :
					this.mul(a, n);
			} hyper3(a, n) {
				return isNaN(a) ||
					isNaN(n) ?
					NaN :
					a ** n;
			} hyper4(a, n, {Switch=false, number=false}={}) {
				// a ↑↑ n = a^^n = a^a^a n times = ⁿa = a ↑² n
				if (this.isNaN( n = BigInt(n) )) return NaN;
				if (this.isNaN( n = BigInt(n) )) return NaN;
				if (Switch) return this.hyper4(n, a, {
					Switch: !1,
					number: number
				});
				const A = a;
				while ( n --> 1 )
					a = A ** a;
				return number ? Number(a) : a;
			} sin(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.sum(0, 25, n=>(-1)**n /
						this.fact(2*n+1)*(θ%(2*π))**(2*n+1)
					);
			} cos(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.sum(0, 25, n=>(-1)**n /
						this.fact(2*n)*(θ%(2*π))**(2*n)
					);
			} tan(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.sin(θ) /
						this.cos(θ);
			} csc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 / this.sin(θ);
			} sec(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 / this.cos(θ);
			} cot(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 / this.tan(θ);
			} asin(x) {
				return isNaN( x = Number(x) ) || x > 1 || x < -1 ?
					NaN :
					this.sum(0, 80, n=>this.fact(2*n) /
						(4**n*this.fact(n)**2 * (2*n+1))*(θ**(2*n+1)));
			} acos(x) {
				return isNaN( x = Number(x) ) ?
					z :
					π/2 - this.asin(x);
			} atan(x) {
				return isNaN( x = Number(x) ) ?
					z :
					this.Math.atan(x);
			} atan2(x, y, flipArgs=false) {
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( y = Number(y) )) return NaN;
				if (flipArgs) return this.atan2(y, x, !1);
				const output = this.atan(y / x);
				return x > 0 ?
					output :
					!x ?
						this.sgn(y)**2 / this.sgn(y) * π/2 :
						y >= 0 ? output + π : output - π;
			} acsc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(1/x);
			} asec(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(1/x);
			} acot(x) {
				return isNaN( x = Number(x) ) ?
					x :
					!x ?
						π/2 :
						this.atan(1/x) + π*(x < 0);
			} excst(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.hypot(
						this.exsec(θ),
						this.cot(θ)
					);
			} exset(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.hypot(
						this.exsec(θ),
						this.tan(θ)
					);
			} vcs(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.hypot(
						this.verc(θ),
						this.sin(θ)
					);
			} cvs(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.hypot(
						1,
						this.sin(θ)
					);
			} acvs(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(x**2 - 1);
			} ccvs(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.hypot(
						1,
						this.cos(θ)
					);
			} accvs(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(x**2 - 1);
			} crd(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					2 * this.sin(θ / 2);
			} acrd(x) {
				return isNaN( x = Number(x) ) ?
					x :
					2 * this.asin(x / 2);
			} ccrd(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					2 * this.cos(θ / 2);
			} accrd(x) {
				return isNaN( x = Number(x) ) ?
					x :
					π/2 - this.acrd(x);
			} exsec(x) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.sec(θ) - 1;
			} aexsec(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asec(x + 1);
			} excsc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.csc(θ) - 1;
			} aexcsc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acsc(x + 1);
			} vers(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 - this.cos(θ);
			} avers(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(x + 1);
			} verc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 + this.cos(θ);
			} averc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(x - 1);
			} cvers(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 - this.sin(θ);
			} acvers(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(1 - x);
			} cverc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					1 + this.sin(θ);
			} acverc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(x - 1);
			} hav(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.vers(θ) / 2;
			} ahav(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(1 - 2*x);
			} hverc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.verc(θ) / 2;
			} ahverc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acos(2*x - 1);
			} hcvers(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.cvers(θ) / 2;
			} ahcvers(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(1 - 2*x);
			} hcverc(θ) {
				return isNaN( θ = Number(θ) ) ?
					θ :
					this.cverc(θ) / 2;
			} ahcverc(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asin(2*x - 1);
			} sinh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					(𝑒**x - 𝑒**-x) / 2;
			} cosh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					(𝑒**x + 𝑒**-x) / 2;
			} tanh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.sinh(x) /
						this.cosh(x);
			} csch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 / this.sinh(x);
			} sech(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 / this.cosh(x);
			} coth(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 / this.tanh(x);
			} asinh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.ln( x + this.sqrt(x**2+1) );
			} acosh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.ln( x + this.sqrt(x**2-1) );
			} atanh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.ln( (x+1) / (1-x) ) / 2;
			} acsch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(1/x);
			} asech(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(1/x);
			} acoth(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.atanh(1/x);
			} excsth(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.hypot(
						this.coth(x),
						this.exsech(x)
					);
			} exseth(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.hypot(
						this.exsech(x),
						this.tanh(x)
					);
			} vcsh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.hypot(
						this.verch(x),
						this.sinh(x)
					);
			} cvsh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.hypot(
						1,
						this.sinh(x)
					);
			} acvsh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(x**2 - 1);
			} ccvsh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.hypot( 1, this.cosh(x) );
			} accvsh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(x**2 - 1);
			} crdh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					2*this.sinh(x / 2);
			} acrdh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					2*this.asinh(x / 2);
			} ccrdh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					2*this.cosh(x / 2);
			} accrdh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					π/2 -
						2*this.asinh(x / 2);
			} exsech(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.sech(x) - 1;
			} aexsech(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asech(x + 1);
			} excsch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.csch(x) - 1;
			} aexcsch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acsch(x + 1);
			} versh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 - this.cosh(x);
			} aversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(x + 1);
			} verch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 + this.cosh(x);
			} averch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(x - 1);
			} cversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 - this.sinh(x);
			} acversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(1 - x);
			} cverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					1 + this.sinh(x);
			} acverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(x - 1);
			} hversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.versh(x) / 2;
			} ahversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(1 - 2*x);
			} hverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.verch(x) / 2;
			} ahverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.acosh(2*x - 1);
			} hcversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.cversh(x) / 2;
			} ahcversh(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(1 - 2*x);
			} hcverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.cverch(x) / 2;
			} ahcverch(x) {
				return isNaN( x = Number(x) ) ?
					x :
					this.asinh(2*x - 1);
			} Si(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.int(0, x, t => this.sin(t) / t, inc);
			} si(x, inc=.001) {
				return isNaN( x = Number(x) ) || isNaN( inc = Number(inc) ) ?
					NaN :
					this.Si(x) - π/2;
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
			} H(x, form=1) {
				// Heaveside step function
				// Heaveside theta function
				if (isNaN( x = Number(x) )) return NaN;
				if (form === 1) return this.sgn( 1 + this.sgn(x) );
				if (form === 2) return (1 + this.sgn(x)) / 2
				return +(x > 0);
			} W(x) {
				// TODO: Implement Lambert W function
				// Lambert W function, product log
				if (isNaN( x = Number(x) )) return NaN;
				if (x < -1 / e) return NaN;
				throw Error("Not Implemented");
			} deriv(f=x=>2*x+1, x=1, dx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used.
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "" || /\s+/.in(VARIABLE))
						throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = new RegExp(`\\d+${VARIABLE}`, "g"),
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
						f.substr(a[1] + len(a[0]))
					}
					try { f = Function(`${VARIABLE}`,`return ${f.replace(/\^/g, "**")}`) }
					catch { throw Error("Variable name declaration is missing, and `x` was not used.") }
				}

				if (!( f(x) || f(x + dx) )) return 0;
				let numerator = f(x + dx) - f(x);
				while ( !numerator ) {
					dx *= 10;
					numerator = f(x + dx) - f(x);
				}
				return numerator / dx;
			} tanLine(f=x=>x, x=1, ret=Object, dx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used.
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "" || /\s+/.in(VARIABLE))
						throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = new RegExp(`\\d+${VARIABLE}`, "g"),
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
				if (!( f(x) || f(x + dx) )) {
					m = 0;
				} else {
					let numerator = f(x + dx) - f(x);
					while ( !numerator ) {
						dx *= 2;
						numerator = f(x + dx) - f(x);
					}
					m = numerator / dx;
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
			} gd(x, inc=.001) {
				// gudermannian function
				return isNaN( x = Number(x) ) ?
					x :
					this.int(0, x, t=>this.sech(t), inc)
			} lam(x, inc=.001) {
				// inverse gudermannian function
				// Lambertian function
				if (isNaN( x = Number(x) )) return NaN;
				if (x <= -π/2 || x >= π/2) return NaN;
				return this.int(0, x, t=>this.sec(t), inc);
			} base10Conv(n, base, decAcy=54, numberOnly=false) {
				// only works for base <= 10
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( n = Number(n) ) || base < 2) return NaN;
				if (isNaN( base = Number(base) )) return NaN;
				if (base < 2) throw Error("Base must be greater than 2");
				if (base > 10) throw Error("base x > 10 is not supported");
				var iPart = int(n).toString(),
					fPart = `${fpart(n)}`.toString();
				var str = "";
				while (iPart != 0) {
					str += iPart % base;
					iPart = floor(iPart / base);
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
			} bin(x, zeroB=true, twoColon=false) {
				return isNaN( x = Number(x) ) ? x :
					`${zeroB ? "0b" : twoColon ? "2:" : ""}${his.base10Conv(x)}`;
			} oct(x, zeroO=true) {
				return isNaN( x = Number(x) ) ? x :
					`${zeroO ? "0o" : ""}${x.toString(8)}`;
			} hex(x, zeroX=true) {
				return isNaN( x = Number(x) ) ? x :
					`${zeroX ? "0x" : ""}${ x.toString(16) }`;
			} timesTable(start=0, end=9) {
				for (var i = ++end, j, table = []; i --> start ;)
				for (j = end, table[i] = []; j --> start ;)
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
				str = str.replaceAll("(x)", "x").replaceAll("cosxcosx", "cos^2x");
				return str.substring( 1, dim(str) ).replace(/^os$/, "cosx");
			} heron(a=1, b=1, c=1) {
				if (isNaN( a = Number(a) )) return NaN;
				if (isNaN( b = Number(b) )) return NaN;
				if (isNaN( c = Number(c) )) return NaN;
				const s = (a + b + c) / 2;
				return this.sqrt(s * (s-a) * (s-b) * (s-c));
			} tempConv(value=0, startSystem="f", endSystem) {
				// temperature converter
				if (this.isNaN(value)) return NaN;
				if (type(startSystem) !== "string") return NaN;
				if (type(endSystem) !== "string" && endSystem != null) return NaN;
				endSystem == null && (endSystem = MATH_DEFAULT_END_SYSTEM);
				startSystem.lower() === "celcius"     && (startSystem = "c");
				startSystem.lower() === "fahrenheit"  && (startSystem = "f");
				startSystem.lower() === "kelvin"      && (startSystem = "k");
				/ra(nkine)?/i.in(startSystem.lower()) && (startSystem = "r");
				endSystem  .lower() === "celcius"     && (  endSystem = "c");
				endSystem  .lower() === "fahrenheit"  && (  endSystem = "f");
				endSystem  .lower() === "kelvin"      && (  endSystem = "k");
				/ra(nkine)?/i.in(  endSystem.lower()) && (  endSystem = "r");
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
			} coprime(a, b) {
				// returns coprimality of a and b
				return this.gcd(a, b) === 1;
			} ncoprime(a, b) {
				// returns inverse coprimality of a and b
				return this.gcd(a, b) !== 1;
			} cumsum(set) {
				// cumulative sum
				return type(set, 1) === "set" ? 
					set.cumsum() :
					NaN;
			} set(...args) {
				return new this.Set(
					...args.flatten()
				);
			} setUnion(set1, set2) {
				return type(set1, 1) !== "set" ?
					type(set2, 1) !== "set" ?
						!1 :
						set2 :
					type(set2, 1) !== "set" ?
						set1 :
						len(set1) >= len(set2) ?
							set1.union( set2, !1 ) :
							set2.union( set1, !1 );
			} harmonic(n=1, decimals=18) {
				return this.sum(
					1,
					int( Number(n) ),
					n => this.div(1, n, !0, 18)
				)
			} fraction(numer=0, denom=0) {
				return fMath?.new?.(
					numer,
					denom,
				);
			} complex(re=0, im=0) {
				return cMath?.new?.(
					re,
					im,
				);
			} bigint(value=0) {
				try { return BigInt(value) }
				catch { return NaN }
			} number(value=0) {
				try { return Number(value) }
				catch { return NaN }
			} toAccountingStr(n = 0) {
				return this.isNaN(n) ?
					NaN :
					n < 0 ?
						`(${-n})` :
						n+""
			}
			// piApprox
			// simplify sin(nx)
			// simplify tan(nx)
			// bell numbers
			// pell numbers
			// harmonic series
			// polylogarithms
			// Beta function
			// geometry
			// law of sines
			// law of cosines
			// law of tangents
			// law of cotangents
			// Bernoulli numbers
			// K-function
			// vector dot product
			// vector cross product
			// setIntersection
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
			// nthrts // probably for aMath or cMath
			// compareText
			// coulomb
			// electrical things
		}, "instance bMath": class BigIntRealMath {
			constructor(help=bMath_Help_Argument, degTrig=bMath_DegTrig_Argument) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);

				if (help) this.help = {
				}; if (degTrig) this.deg = {
				};
			}
			add(a, b) { return a + b }
			sub(a, b) { return a - b }
			mul(a, b) { return a * b }
			div(a, b) { return a / b }
			pow(a, b) { return a ** b }
		}, "instance cMath": class ComplexMath {
			constructor(degTrig=cMath_DegTrig_Argument, help=cMath_Help_Argument) {
				degTrig === "default" && (degTrig = !0);
				help === "default" && (help = !0);
				this.ComplexNumber = class Complex {
					// TODO: Add customization so the functions don't always modify the state
					constructor(re=0, im=0) {
						this.re = re;
						this.im = im;
					}
					type() {
						return "complex";
					}
					isComplex() {
						return !!this.im;
					}
					toPolar(doubleStar=false) {
						return `${cMath.abs(this)}e${doubleStar ? "**" : "^"}(${this.arg()}i)`;
					}
					toString( {polar=false, char="i", parens=true}={} ) {
						char = char[0] || "i";
						return polar ?
							`${cMath.abs(this)}e^${parens ? "(" : ""}${this.arg()}${char}${parens ? ")" : ""}`.remove(
								new RegExp(`^1(?=e)|e\\^\\(0${char}\\)`, "g")
							).start("1").replace(/^0.*/, "0").replace(/0\./g, ".") :
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
					}
					toArr() {
						return [this.re, this.im];
					}
					toLList() {
						return this.toArr().toLList();
					}
					toRegObj() { // because for...of doesn't work with class objects
						return {
							re: this.re,
							im: this.im
						}
					}
					arg(form="radians") {
						return ["d", "deg", "degree", "degrees"].incl(form) ?
							rMath.deg.atan2(this.re, this.im) :
							rMath.atan2(this.re, this.im);
					}
					add(num, New=true) {
						assert(type(num) === "number" || type(num, 1) === "complex", "invalid input to function");
						type(num) === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re + num.re,
							this.im + num.im
						);
						this.re += num.re;
						this.im += num.im;
						return this;
					}
					sub(num, New=true) {
						assert(type(num) === "number" || type(num, 1) === "complex", "invalid input to function");
						type(num) === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re - num.re,
							this.im - num.im
						);
						this.re -= num.re;
						this.im -= num.im;
						return this;
					}
					mul(num, New=true) {
						assert(type(num) === "number" || type(num, 1) === "complex", "invalid input to function");
						type(num) === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re*num.re - this.im*num.im,
							this.re*num.im + this.im*num.re
						);
						const tmp = this.re;
						this.re = tmp*num.re - this.im*num.im;
						this.im = tmp*num.im + this.im*num.re;
						return this;
					}
					div(num, New=true) {
						assert(type(num) === "number" || type(num, 1) === "complex", "invalid input to function");
						type(num) === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							(this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2),
							(this.im*num.re - this.re*num.im) / (num.re**2 + num.im**2)
						);
						const tmp = this.re;
						this.re = (this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2);
						this.im = (this.im*num.re - tmp*num.im) / (num.re**2 + num.im**2);
						return this;
					}
					floor(New=true) {
						if (New) return new this.constructor(
							floor(this.re),
							floor(this.im)
						);
						this.re = floor(this.re);
						this.im = floor(this.im);
						return this;
					}
					ceil(New=true) {
						if (New) return new this.constructor(
							ceil(this.re),
							ceil(this.im)
						);
						this.re = ceil(this.re);
						this.im = ceil(this.im);
						return this;
					}
					round(New=true) {
						if (New) return new this.constructor(
							round(this.re),
							round(this.im)
						);
						this.re = round(this.re);
						this.im = round(this.im);
						return this;
					}
					frac(New=true) {
						if (New) return new this.constructor(
							fpart(this.re),
							fpart(this.im)
						);
						this.re = fpart(this.re);
						this.im = fpart(this.im);
						return this;
					}
					pow(num, New=true) {
						type(num) === "number" && (num = new this.constructor(num, 0));

						if (!this.im && !num.im) return new this.constructor(this.re ** num.re, 0);
						if (type(num, 1) !== "complex") throw TypeError("Invalid type for Complex.pow() argument");

						const r = (this.re**2+this.im**2) ** (num.re/2) / rMath.e ** ( num.im*this.arg(this) ),
							θ = num.re*this.arg(this) + num.im*rMath.ln( rMath.hypot(this.re, this.im) )
						if (New) return new this.constructor(
							r * rMath.cos(θ),
							r * rMath.sin(θ)
						);
						this.re = r * rMath.cos(θ);
						this.im = r * rMath.sin(θ);
						return this;
					}
					exp(New=true) {
						const r = rMath.e ** this.re;
						if (New) return new this.constructor(
							r * rMath.cos(this.im),
							r * rMath.sin(this.im)
						);
						this.re = r * rMath.cos(this.im);
						this.im = r * rMath.sin(this.im);
					}
					fpart(New=true) { return this.frac(New) }
				};
				this.lnNeg1 = this.new(0, π);
				this.lni    = this.new(0, π/2);
				this.i      = this.new(0, 1);

				if (degTrig) this.deg = {
				}; if (help) this.help = {
				};
			}
			new(re=0, im=0) {
				if (type(re, 1) === "complex") return re;
				if (isArr(re)) {
					im = re[1];
					re = re[0];
				}
				if (rMath.isNaN(re) || rMath.isNaN(im))
					throw TypeError(`Invalid types for cMath.new() arguments: ${re}, ${im}`);

				if (type(re) === "bigint" && type(im) === "bigint" ) {
					throw Error("not implemented");
					return new this.ComplexNumber(re, im);
				}
				if (type(re) === "number" && type(im) === "number" )
					return new this.ComplexNumber(re, im);
				throw TypeError(`Invalid types for cMath.new() arguments: ${re}, ${im}`);
			}
			complex(re=0, im=0) { return this.new(re, im) }
			add(a, b) {
				if (type(a, 1) !== "complex" && type(b, 1) !== "complex")
					throw TypeError("cMath.add requires complex arguments");
				return this.new(a.re + b.re, a.im + b.im);
			}
			sub(a, b) {
				if (type(a, 1) !== "complex" && type(b, 1) !== "complex")
					throw TypeError("cMath.add requires complex arguments");
				return this.new(a.re + b.re, a.im + b.im);
			}
			mul(a, b)  {
				if (type(a, 1) !== "complex" && type(b, 1) !== "complex")
					throw TypeError("cMath.add requires complex arguments");
				return this.new(a.re*b.re - a.im*b.im, a.re*b.im + b.re*a.im);
			}
			div(a, b) {
				if (type(a, 1) !== "complex" && type(b, 1) !== "complex")
					throw TypeError("cMath.add requires complex arguments");

				return this.new(
					(a.re*b.re + a.im*b.im) / (b.re**2 + b.im**2),
					(a.im*b.re - a.re*b.im) / (b.re**2 + b.im**2)
				);
			}
			floor(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Invalid type for cMath.floor()");
				return this.new(
					floor(z.re),
					floor(z.im),
				);
			}
			ceil(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Invalid type for cMath.ceil()");
				return this.new(
					ceil(z.re),
					ceil(z.im),
				);
			}
			round(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Invalid type for cMath.round()");
				return this.new(
					round(z.re),
					round(z.im),
				);
			}
			arg(z, n=0, form="radians") {
				if (type(z, 1) !== "complex") throw TypeError("Invalid type for cMath.arg()");
				return form === "degrees" || form === "deg" || form === "degree" ?
					rMath.deg.atan2(z.re, z.im) + 2*π*int(n) :
					rMath.atan2(z.re, z.im) + 2*π*int(n);
			}
			ln(z, n=0) {
				if (type(z) === "number") {
					return z < 0 ?
						this.new( rMath.ln(-z), π ) :
						!z ?
							NaN :
							this.new( rMath.ln(z), 0 );
				}
				if (type(z, 1) !== "complex") throw TypeError("Invalid type for cMath.ln()");
				return this.new(
					rMath.ln( this.abs(z) ),
					this.arg(z, int(n))
				);
				// ln(0 + bi) = ln|b| + isgn(b)π/2
				// ln(z) = ln|z| + Arg(z)i
			}
			log(z, base=null, n=0) {
				type(z) === "number" && (z = this.new(z, 0));
				type(base) === "number" && (base = this.new(base, 0));
				if (base === null) return this.ln(z, n);
				if (type(z, 1) !== "complex") throw TypeError("Invalid first argument");
				if (type(base, 1) !== "complex") throw TypeError("Invalid second argument");
				return this.ln(z, n).div( this.ln(base, n) );
				// log_{a+bi}(c+di) = ln(c+di) / ln(a+bi)
			}
			logbase(base, z, n=0) {
				type(base) === "number" && (base = this.new(base, 0));
				type(z) === "number" && (z = this.new(z, 0));
				if (type(base, 1) !== "complex") throw TypeError("Incorrect first argument");
				if (type(z, 1) !== "complex") throw TypeError("Incorrect second argument");
				return this.log( z, base, n );
			}
			pow(z1, z2, n=0) {
				type(z1) === "number" && (z1 = this.new(z1, 0));
				type(z2) === "number" && (z2 = this.new(z2, 0));

				if (!z1.im && !z2.im) {
					let pow = z1.re ** z2.re;
					if (isNaN(pow)) return this.new(0, (-z1.re) ** z2.re);
					return this.new(z1.re ** z2.re, 0);
				}
				if (type(z1, 1) !== "complex") throw TypeError("Invalid type for Complex.pow() argument 1");
				if (type(z2, 1) !== "complex") throw TypeError("Invalid type for Complex.pow() argument 2");

				const r = (z1.re**2 + z1.im**2) ** (z2.re / 2)  /  rMath.e ** ( z2.im*this.arg(z1, n) ),
					θ = z2.re*this.arg(z1, n) + z2.im*rMath.ln(this.abs(z1))
				//re^iθ = rcosθ + risinθ
				return this.new(r*rMath.cos(θ), r*rMath.sin(θ));
			}
			exp(z) {
				type(z) === "number" && (z = this.new(z, 0));
				const r = rMath.e ** z.re;
				return this.new(r * rMath.cos(z.im), r * rMath.sin(z.im))
			}
			abs(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Incorrect argument type");
				return rMath.hypot(z.re, z.im);
			}
			sgn(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Incorrect argument type");
				return z.div( this.abs(z) );
				// exp(i arg num);
			}
			sign(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Incorrect argument type");
				return this.sgn(z);
			}
			nthrt(z, rt=2, n=0) {
				// no longer broken for z ∧ rt ∈ ℝ
				type(z) === "number" && (z = this.new(z, 0));
				type(rt) === "number" && (rt = this.new(rt, 0));
				if (type(z, 1) !== "complex") throw TypeError("Incorrect type for second argument");

				if (type(rt, 1) === "complex") {
					let c2d2 = rt.re**2 + rt.im**2;
					return this.pow(z, this.new(rt.re/c2d2, -rt.im/c2d2));
				}
				if (type(rt) !== "number") throw TypeError("Incorrect type for first argument");

				return this.exp(
					this.new( 0, this.arg(z, n) / rt )
				).mul(
					rMath.nthrt( this.abs(z), rt )
				);
			}
			sqrt(z) {
				if (type(z) !== "number" && type(z, 1) !== "complex") throw TypeError("Invalid type");
				return this.nthrt(z, 2);
			}
			cbrt(z) {
				type(z) === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") throw TypeError("Invalid type");
				return this.nthrt(z, 3);
			}
			rect(r, θ) {
				/* polar to rectangular */
				type(r) === "number" && (r = this.new(r, 0));
				type(θ) === "number" && (θ = this.new(θ, 0));
				if (type(r, 1) !== "complex") throw TypeError("Invalid type for first argument");
				if (type(θ, 1) !== "complex") throw TypeError("Invalid type for second argument");
				return this.exp(θ).mul(r);
			}
			isClose(z1, z2, range=Number.EPSILON) {
				type(z1) === "number" && (z1 = this.new(z1, 0));
				type(z2) === "number" && (z2 = this.new(z2, 0));
				if (type(z1, 1) !== "complex") throw TypeError("Invalid type for first argument");
				if (type(z2, 1) !== "complex") throw TypeError("Invalid type for second argument");
				return rMath.isClose(this.abs(z1), this.abs(z2), range) &&
					rMath.isClose(z1.re, z2,re, range) &&
					rMath.isClose(z1.im, z2,im, range);
			}
			sum(n, last, func=z=>z, inc=1) {
				type(n) === "number" && (n = this.new(n, 0));
				type(last) === "number" && (last = this.new(last, 0));
				type(inc) === "number" && (inc = this.new(inc, 0));
				// complex less than or equal to
				const complet = (a, b) => !a.im && !b.im ? a.re <= b.re : this.abs(a) <= this.abs(b);
				
				if (type(n, 1) !== "complex") throw TypeError("sum() requires a complex first argument");
				if (type(last, 1) !== "complex") throw TypeError("sum() requires a complex second argument");
				if (type(func, 1) !== "func") throw TypeError("sum() requires a function third argument");
				if (type(inc, 1) !== "complex") throw TypeError("sum() requires a complex fourth argument");
				
				for ( var total = this.new(0, 0) ; complet(n, last) ; n.add(inc, 0) )
					total.add( func(n, 0), 0 );
				return total;
			}
			conjugate(z) {
				if (type(z, 1) !== "complex") throw TypeError("conjugate() requires a complex argument");
				return this.new(z.re, -z.im);
			}
			inverse(z) {
				if (type(z, 1) !== "complex") throw TypeError("conjugate() requires a complex argument");
				return this.new(1/z.re, 1/z.im);
			}
			isPrime(z) {
				// TODO: Start
				if (type(z, 1) === "num") z = this.new(z, 0);
				if (type(z, 1) !== "complex") throw TypeError("cMath.isPrime() requires a complex argument");
				throw Error("Not Implemented");
			}
		}, "instance fMath": class FractionalRealMath {
			// TODO: Make the functions convert numbers into fractions if they are inputed instead
			constructor(help=fMath_Help_Argument, degTrig=fMath_DegTrig_Argument) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				this.Fraction = class Fraction {
					constructor(numerator=1, denominator=1) {
						 this.numer = numerator;
						 this.denom = denominator;
					}
					type() {
						return "fraction";
					}
				};
				this.one = this.new(1, 1);

				if (help) this.help = {
				}; if (degTrig) this.deg = {
				};
			}
			// do something about non-numbers and 0 denominators
			fraction(numerator=0, denominator=0) {
				return new this.Fraction(numerator, denominator);
				;
			} new(numerator=0, denominator=0) {
				return new this.Fraction(numerator, denominator);
				;
			} simplify(fraction) {
				["number", "bigint", "string"].incl(type(fraction)) && (fraction = this.new(fraction, 1));
				if (type(fraction, 1) !== "fraction") return NaN;
				if (!["number", "bigint", "string"].incl(type(fraction.numer)) || rMath.isNaN(fraction.numer)) return NaN;
				if (!["number", "bigint", "string"].incl(type(fraction.denom)) || rMath.isNaN(fraction.denom)) return NaN;
				if (type(fraction, 1) !== "fraction") fraction = this.new(fraction, 1);
				var gcd = rMath.gcd(fraction.numer, fraction.denom);
				fraction.numer = window[type(fraction.numer).upper(1)](rMath.div(fraction.numer, gcd));
				fraction.denom = window[type(fraction.denom).upper(1)](rMath.div(fraction.denom, gcd));
				return fraction;
			} simp(fraction) {
				return this.simplify(fraction);
				;
			} add(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(this.new(a.numer*b.denom + b.numer*a.denom, a.denom*b.denom));
			} sub(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(this.new(a.numer*b.denom - b.numer*a.denom, a.denom*b.denom));
			} mul(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(this.new(a.numer*b.numer, a.denom*b.denom));
			} div(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(this.new(a.numer*b.denom, a.denom*b.numer));
			}
		}, "instance aMath": class AllMath {
			// aMath will call the correct function based upon the input
			constructor(help=aMath_Help_Argument, trig=aMath_Trig_Argument, comparatives=aMath_Comparatives_Argument) {
				help === "default" && (help = !0);
				trig === "default" && (trig = !0);
				comparatives === "default" && (comparatives = !0);
				// constants
				if (help) this.help = {
					_call: "used internally for calling the functions. takes 2 named (string) arguments for the function name and type. if no type is given, it is decided by the first argument. the rest of the arguments are passed into the function being called via Function.apply.",
					_getNameOf: "used internally for getting the names of math objects. returns Object.keyof(window, argument);",
					add: "calls the add method of whatever math object is the correct one",
				}; if (trig) this.trig = {
				}; if (comparatives) this.eq = {
				};
			}
			add() { return this._call("add", ...arguments) }
			sub() { return this._call("sub", ...arguments) }
			mul() { return this._call("mul", ...arguments) }
			div() { return this._call("div", ...arguments) }
			_call(fname, typ=null, ...args) {
				typ === null && (typ = type(args[0], 1));
				var fns = {
					bigint   : bMath,
					complex  : cMath,
					fraction : fMath,
					num      : rMath,
					number   : rMath,
					str      : sMath,
					string   : sMath,
				}, fn = fns?.[typ?.lower?.()]?.[fname];
				if (fn) return fn.apply( fns[typ], args ); // just using fn() makes "this" inside the function undefined.
				if (fns[typ] !== void 0)
				throw Error(`${this._getNameOf(fns[typ])}["${fname}"] doesn't exist`);
				throw Error(`there is no Math object for type '${typ}'. (type(x, 1) was used). see window.MathObjects for all Math objects`);
			} _getNameOf(MathObect) { return Object.keyof(window.MathObjects, MathObect) }
		}, "instance cfsMath": class ComplexFractionalStringMath {
			constructor(help=cfsMath_Help_Argument) {
				help === "default" && (help = !0);
				this.CSFraction = class ComplexStringFraction {
					constructor(rn="0.0", rd="0.0", cn="0.0", cd="0.0") {
						if (sMath.isNaN(rn) || sMath.isNaN(rd) || sMath.isNaN(cn) || sMath.isNaN(cd))
							throw ValueError("cfsMath.CSFraction requires 4 string numbers.");
						var rgcd = 1, igcd = 1;
						if (sMath.isInt(rn) && sMath.isInt(rd)) {
							//gcd = 
						}
						this.re = {
							numer: numStrNorm(rn),
							denom: numStrNorm(rd),
						};
						this.im = {
							numer: numStrNorm(cn),
							denom: numStrNorm(cd),
						};
					}
				};
				if (help) this.help = {
					CSFraction: null,
				};
			}
		}
		};

	} {// Conflict & assignment
		var CONFLICT_ARR = Object.keys(LIBRARY_FUNCTIONS).concat( ["MathObjects"] ).filter(
			e => e != "Image" && this[e] != null
		), MathObjects = {};
		for (const s of Object.keys(LIBRARY_FUNCTIONS)) {
			if (s.startsWith("instance ")) {
				let tmp = s.substr(9)
				this[tmp] = new LIBRARY_FUNCTIONS[s];
				s.includes("Math") && (MathObjects[tmp] = this[tmp]);
			} else if (s.startsWith("literal symbol.for "))
				this[Symbol.for(s.substr(19))] = LIBRARY_FUNCTIONS[s];
			else this[s] = LIBRARY_FUNCTIONS[s];
		}
		Alert_Conflict_For_Math === "default" && (Alert_Conflict_For_Math = !1     );
		Output_Math_Variable    === "default" && (Output_Math_Variable    = "Math" );
		Input_Math_Variable     === "default" && (Input_Math_Variable     = "rMath");
		this[Output_Math_Variable] !== void 0 && (
			Output_Math_Variable === "Math" ?
				Alert_Conflict_For_Math === !0 :
				Output_Math_Variable === void 0 ?
					!1 : !0
		) && CONFLICT_ARR.push(Output_Math_Variable);
		let maths = Object.keys(MathObjects);
		for (const obj of Object.values(MathObjects)) {
			for (const s of maths) obj[s] = MathObjects[s];
			obj["+"]  = obj.add;  obj["-"]  = obj.sub;
			obj["*"]  = obj.mul;  obj["/"]  = obj.div;
			obj["**"] = obj.pow;  obj["e^"] = obj.exp;
			obj["%"]  = obj.mod;  obj["∫"]  = obj.int;
			obj["√"]  = obj.sqrt; obj["∛"] = obj.cbrt;
		}
		rMath.ℙ = rMath.P;
		this[Output_Math_Variable] = this[Input_Math_Variable];
		this.MathObjects = MathObjects;
	} {// Event and Document things
		
		let _ael = EventTarget.prototype.addEventListener
		, _rel = EventTarget.prototype.removeEventListener
		, listeners = dict()
		, _click = HTMLElement.prototype.click;
		EventTarget.prototype._ael = _ael;
		EventTarget.prototype._rel = _rel;

		function addEventListener(Type, listener=null, options={
			capture  : false,
			passive  : false,
			once     : false,
			type     : arguments[0],
			listener : arguments[1] }) {

			typeof options === "boolean" && (options = {
				capture  : options,
				passive  : false,
				once     : false,
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
				passive  : false,
				once     : false,
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
		} function getEventListeners() {
			// gets all event listeners for all objects.
			return listeners;
		} function getMyEventListeners() {
			// gets all event listeners on the current EventTarget object the function is called from
			return dict(Object.fromEntries(
				listeners.entries().map( e => {
					const value = e[1].filter(e => e.object === (this || window));
					return len(value) ? [e[0], value] : [];
				}).filter(e => len(e))
			));
		} function click(times=1) {
			if (isNaN( times = Number(times) )) times = 1;
			while (times --> 0) _click.call(this);
			return this;
		}

		EventTarget.prototype.ael   = EventTarget.prototype.addEventListener    = addEventListener   ;
		EventTarget.prototype.rel   = EventTarget.prototype.removeEventListener = removeEventListener;
		EventTarget.prototype.gel   = EventTarget.prototype.getEventListeners   = getEventListeners  ;
		EventTarget.prototype.gml   = EventTarget.prototype.getMyEventListeners = getMyEventListeners;
		HTMLElement.prototype.click = click;
		Document.prototype.click = function click(times=1) { return document.head.click(times) }
		// document.all == null for some reason.
		document.doctype && document.all !== void 0 && (document.all.doctype = document.doctype);

		if (Creepily_Watch_Every_Action && Creepily_Watch_Every_Action !== "default") {
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
		}
		if (Run_KeyLogger === "default" ? !1 : Run_KeyLogger) {
			let debug     = KeyLogger_Debug_Argument === "default" ?
				!1 :
				KeyLogger_Debug_Argument
			, variable    = KeyLogger_Variable_Argument === "default" ?
				Symbol.for('keys') :
				KeyLogger_Variable_Argument
			, copy_object = KeyLogger_Copy_Obj_Argument === "default" ?
				!0 :
				KeyLogger_Copy_Obj_Argument
			, type        = KeyLogger_Type_Argument === "default" ?
				"keydown" :
				KeyLogger_Type_Argument;
			const handler = e => {
				window[variable] += e.key;
				debug && console.log(`${typ} detected: \`${e.key}\`\nkeys: \`${window[variable]}\`\nKeyboardEvent Object: %o`, e);
				copy_object && (window.keypressObj = e);
			}; this.stopKeylogger = function stopKeylogger() {
				var alert =  KeyLogger_Alert_Start_Stop || KeyLogger_Debug_Argument
				, type = KeyLogger_Debug_Argument;
				type === "default" && (type = "keydown");
				alert && console.log("keylogger manually terminated.");
				document.body.removeEventListener(type, handler);
				return !0;
			}; (function key_logger_v3() {
				if (window[variable] !== void 0) return debug &&
					console.log("window[${variable}] is already defined.\nkeylogger launch failed");
				window[variable] = "";
				document.body.ael(type, handler);
				(debug || KeyLogger_Alert_Start_Stop) && console.log(`Keylogger started\nSettings:\n\tdebug: ${KeyLogger_Debug_Argument}${KeyLogger_Debug_Argument === "default" ? ` (${debug})` : ""}\n\tvariable: ${KeyLogger_Variable_Argument === "default" ? "default (window[Symbol.for('keys')])" : `window[${KeyLogger_Variable_Argument}]`}\n\tcopy obj to window.keypressObj: ${KeyLogger_Copy_Obj_Argument}${KeyLogger_Copy_Obj_Argument === "default" ? ` (${copy_object})` : ""}\n\ttype: ${KeyLogger_Type_Argument}${KeyLogger_Type_Argument === "default" ? ` (${type})` : ""}`);
			})();
		} else if (KeyLogger_Alert_Unused && KeyLogger_Alert_Unused !== "default")
			console.log("keylogger launch failed due to library settings");
	} {// Prototypes
		// NOTE: Maximum Array length allowed: 4,294,967,295 (2^32 - 1)
		// NOTE: Maximum BigInt value allowed: 2^1,073,741,823
		function lastElement() { return this[dim(this)] } // can't be an arrow function because of "this"
		// NodeList prototype
		NodeList.prototype.last = lastElement
		; // HTMLCollection prototype
		HTMLCollection.prototype.last = lastElement
		; // HTMLAllCollection prototype
		HTMLAllCollection.prototype.last = lastElement
		; // Object prototype
		Object.prototype.tofar = function toFlatArray() {
			// TODO: Fix for 'Arguments' objects and HTML elements
			var val = this;
			if (
				["number", "string", "symbol", "boolean", "bigint", "function"].incl(type(val)) ||
				val == null ||
				constr(val) === 'Object'
			)
				return [this.valueOf()].flatten();
			return Array.from(this.valueOf()).flatten();
		}, Object.copy = copy
		,  Object.keyof = function keyof(obj, value) {
			for (const key of Object.keys(obj))
				if (obj[key] === value) return key;
			return null;
		}; // RegExp prototype
		RegExp.prototype.in = RegExp.prototype.test
		,  RegExp.prototype.toRegex = function toRegex() {
			return this;
		}, RegExp.prototype.all = function all(str="") {
			var a = `${this}`;
			return RegExp(`^(${a.substr(1, dim(a, 2))})$`, "").in(str);
		}; // Array prototype
		Array.prototype.any = Array.prototype.some
		, Array.prototype.append = Array.prototype.push
		, Array.prototype.io = Array.prototype.indexOf
		,  Array.prototype.rev = Array.prototype.reverse
		,  Array.prototype.lio = Array.prototype.lastIndexOf
		,  Array.prototype.incl = Array.prototype.includes
		,  Array.prototype.last = lastElement
		,  Array.prototype.sortOld = Array.prototype.sort
		, delete Array.prototype.some
		, Array.prototype.some = function some(fn) {
			// "some" implies that it has to be plural. use any for any. some != any
			var num = 0;
			for (var i = len(this); i --> 0 ;) {
				num += !!fn(this);
				if (num > 1) return !0;
			}
			return !1;
		},  Array.prototype.for = function forEachReturn(f=(e, i, a)=>e, ret) {
			// don't change order from ltr to rtl
			for (var a = this, i = 0, n = len(a); i < n ;)
				f(a[i], i++, a);
			return ret;
		}, Array.prototype.shift2 = function shift2(num=1) {
			while ( num --> 0 ) this.shift();
			return this;
		}, Array.prototype.union = function union(array) {
			["NodeList", "HTMLAllCollection", "HTMLCollection"].incl(constr(array)) &&
				(array = Array.from(array));
			for (var arr = this.concat(array), i = len(arr); i --> 0 ;)
				this[i] = arr[i];
			return this;
		}
		// TODO: Add Array.prototype.fconcat. basically a mixture between concat and unshift
		// TODO: Add Array.prototype.funion. basically a mixture between union and unshift
		, Array.prototype.pop2 = function pop2(num=1) {
			while ( num --> 0 ) this.pop();
			return this;
		}, Array.prototype.splice2 = function splice2(a, b, ...c) {
			var d = this;
			d.splice(a, b);
			return c.flatten().for((e, i) => d.splice(a + i, 0, e), d);
		}, Array.prototype.push2 = function push2(e, ...i) {
			// TODO: Finish implementing pushing multiple values for other methods
			let a = this, j, n;
			i = i.tofar();
			if (e === void 0) {
				for (j = 0, n = len(i); j < n; j++)
					if (type(i[j], 1) === "num") a.push(a[i[j]]);
			}
			else {
				if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.push(void 0);
				else a.push(e);
				for (j = 0, n = len(i); j < n; j++)
					a.push(i[j]);
			}
			return a;
		}, Array.prototype.unshift2 = function unshift2(e, ...i) {
			let a = this, j, n;
			i = i.tofar();
			if (e === void 0) {
				for (j = 0, n = len(i); j < n; j++)
					if (type(i[j], 1) === "num")
						a.unshift(a[i[j]]);
			}
			else {
				if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.unshift(void 0);
				else a.unshift(e);
				for (j = 0, n = len(i); j < n; j++)
					a.unshift(i[j]);
			}
			return a;
		}, Array.prototype.toLList = function toLinkedList() {
			if (window.LinkedList == null) throw Error("window.LinkedList == null");
			let a = new window.LinkedList();
			for (const i of this.rev()) a.insertFirst(i);
			return a;
		}, Array.prototype.remove = function remove(e) {
			var a = this;
			a.incl(e) && a.splice(a.io(e), 1);
			return a;
		}, Array.prototype.removeAll = function removeAll(e) {
			var a = this;
			while (a.incl(e)) a.splice(a.io(e), 1);
			return a;
		}, Array.prototype.hasDupes = function hasDuplicates() {
			for (var a = copy(this), i = len(a); i --> 0 ;)
				if (a.incl(a.pop())) return !0;
			return !1;
		}, Array.prototype.mod = function modify(indexes, func) {
			indexes = indexes.tofar();
			let a = this, n = len(indexes);
			if (type(func, 1) === "arr") func = func.flatten();
			else func = [].len(n).fill(func);
			func = func.extend(len(indexes) - len(func), e => e);

			for (var i = 0; i < n; i++)
				a[indexes[i]] = func[i](a[indexes[i]], indexes[i]);
			return a;
		}, Array.prototype.remrep = function removeRepeats() {
			return Array.from(new Set(this));
			// probably changes the order of the array
		}, Array.prototype.rand = function random() {
			var a = this;
			return a[ randint(0, dim(a)) ];
		}, Array.prototype.insrand = function insertRandomLocation(thing) {
			this.splice(randint(len(this)), 0, thing);
			return this;
		}, Array.prototype.insrands = function insertThingsRandomLocation(...things) {
			for (const thing of things) this.insrand(thing);
			return this;
		}
		, Array.prototype.slc = function slice(first=0, end=Infinity) {
			// last index = end - 1
			for (var a = this, b = [], i = 0, n = len(a); i < n && i < end; i++)
				i >= first && b.push( a[i] );
			return b;
		}, Array.prototype.print = function print(print=console.log) {
			print(this);
			return this;
		}, Array.prototype.printEach = function printEach(print=console.log) {
			for (const e of this) print(e);
			return this;
		}, Array.prototype.swap = function swap(i1=0, i2=1) {
			const A = this, B = A[i1];
			A[i1] = A[i2];
			A[i2] = B;
			return A;
		}, Array.prototype.smap = function setMap(f=(e, i)=>e) {
			// array.smap also counts empty indexes as existing unlike array.map.
			for (var arr = this, i = len(arr); i --> 0 ;)
				arr[i] = f(arr[i], i, arr);
			return arr;
		}, Array.prototype.sfilter = function setFilter(f=(e, i)=>e) {
			for (var i = len(this); i --> 0 ;) !f(this[i]) && this.splice(i, 1);
			return this;
		}, Array.prototype.mapf = function setMapThenFilter(f1=(e, i, a)=>e, f2=(e, i, a)=>e) {
			return this.map(f1).filter(f2);
		}, Array.prototype.smapf = function setMapThenFilter(f1=(e, i, a)=>e, f2=(e, i, a)=>e) {
			return this.smap(f1).sfilter(f2);
		}, Array.prototype.rotr3 = function rotate3itemsRight(i1=0, i2=1, i3=2) {
			const A = this, TMP = A[i1];
			A[i1] = A[i3];
			A[i3] = A[i2];
			A[i2] = TMP;
			return A;
		}, Array.prototype.dupf = function duplicateFromFirst(num=1, newindex=0) {
			return this.dup(num, 0, newindex);
		}, Array.prototype.duptf = function duplicateToFirst(num=1, index=0) {
			return this.dup(num, index, 0);
		}, Array.prototype.dupl = function duplicateFromLast(num=1, newindex=0) {
			return this.dup(num, dim(this), newindex);
		}, Array.prototype.duptl = function duplicateToLast(num=1, index=0) {
			return this.dup(num, index, dim(this));
		}, Array.prototype.dup = function duplicate(num=1, from=null, newindex=Infinity) {
			// by default duplicates the last element in the array
			var a = this;
			for (var b = a[from === null ? dim(a) : from], j = 0; j++ < num ;)
				a.splice(newindex, 0, b);
			return a;
		}, Array.prototype.rotr = function rotateRight(num=1) {
			for (num %= len(this); num --> 0 ;)
				this.unshift(this.pop());
			return this;
		}, Array.prototype.rotl = function rotateRight(num=1) {
			for (num %= len(this); num --> 0 ;)
				this.push(this.shift());
			return this;
		}, Array.prototype.rotl3 = function rotate3itemsLeft(i1=0, i2=1, i3=2) {
			var a = this, b = a[i1];
			a[i1] = a[i2];
			a[i2] = a[i3];
			a[i3] = b;
			return a;
		}, Array.prototype.len = function setLength(num) {
			this.length = rMath.max(num, 0);
			return this;
		}, Array.prototype.extend = function extend(length, filler, form="new") {
			if (form === "new") return this.concat(Array(length).fill(filler));
			else if (form === "total") {
				if (length <= len(this)) return this;
				else return this.concat(Array(length).fill(filler));
			}
			/*else */return a;
		}, Array.prototype.sW = Array.prototype.startsW = function startsWith(item) {
			return this[0] === item;
		}, Array.prototype.eW = Array.prototype.endsW = Array.prototype.endsWith = function endsWith(item) {
			return this.last() === item;
		}, Array.prototype.flatten = function flatten() {
			return this.flat(Infinity);
		}, delete Array.prototype.sort
		, Array.prototype.sort = function sort() {
			var list = this;
			if (rMath.isNaN(list.join(""))) return list.sortOld();
			for (var output = []; len(list) ;) {
				output.push(rMath.min(list));
				list.splice(list.io(rMath.min(list)), 1);
			}
			return output;
		}, Array.prototype.shuffle = function shuffle(times=1) {
			var arr = this;
			for (var i = times; i --> 0 ;)
				for (var j = 0, n = len(arr), arr2 = []; j < n; j++)
					// arr2.splice(round(rand() * len(arr2)), 0, arr.pop());
					arr2.splice(randint(len(arr2)), 0, arr.pop());
			return arr2;
		}, Array.prototype.isNaN = function isNaN(strict=false) {
			const fn = strict ? window.isNaN : rMath.isNaN;
			for (const val of this)
				if (fn(val)) return !0;
			return !1;
		}, Array.prototype.clear = function clear() {
			this.length = 0;
			return this;
		}, Array.prototype.getDupes = function getDupes() {
			for (var arr = copy(this), dupes = [], i = len(arr), val; i --> 0 ;)
				arr.incl(val = arr.pop()) && dupes.push([i, val]);
			return len(dupes) ? dupes : null;
		}; // String prototype
		String.prototype.io = String.prototype.indexOf
		,  String.prototype.lio = String.prototype.lastIndexOf
		,  String.prototype.strip = String.prototype.trim
		,  String.prototype.lstrip = String.prototype.trimLeft
		,  String.prototype.rstrip = String.prototype.trimRight
		,  String.prototype.sW = String.prototype.startsW = String.prototype.startsWith
		,  String.prototype.eW = String.prototype.endsW = String.prototype.endsWith
		,  String.prototype.last = lastElement
		,  String.prototype.sL = String.prototype.startsL = String.prototype.startsLike =
		function startsLike(strOrArr="", position=0) { // TODO: Finish
			if (!["str", "arr"].incl(type(strOrArr, 1))) return !1;
			if (type(strOrArr) === "string") {

			}
		}, String.prototype.slc = function slc(start=0, end=Infinity, startOffset=0, endOffset=0, substr=false, includeEnd=true) {
			// last index = end - 1
			type(start) === "string" && (start = this.io(start));
			type( end ) === "string" && (end   = this.io( end ));
			return Array.from(this).slc(
				start + startOffset,
				end + endOffset
			).join("");
		}, String.prototype.tag = function tag(tagName) {
			if (type(tagName, 1) !== "str" || !tagName) return this;
			return `<${tagName}>${this}</${tagName}>`;
		}, String.prototype.rand = function random() {
			return Array.prototype.rand.call(this);
		}, String.prototype.upper = function upper(length=Infinity, start=0, end=-1) {
			return !isFinite(Number(length)) || isNaN(length) ? this.upper() :
			end === -1 ?
				this.substr(0, start) +
					this.substr(start, length).toUpperCase() +
					this.substr(start + length) :
				this.substr(0, start) +
					this.substring(start, end).toUpperCase() +
					this.substr(end);
		}, String.prototype.lower = function lower(length=Infinity, start=0, end=-1) {
			return !isFinite(Number(length)) || isNaN(length) ? this.toLowerCase() :
			end === -1 ?
				this.substr(0, start) +
					this.substr(start, length).toLowerCase() +
					this.substr(start + length) :
				this.substr(0, start) +
					this.substring(start, end).toLowerCase() +
					this.substr(end);
		}, String.prototype.toObj = function toObj(obj=window) {
			this.split(/[.[\]'"]/).filter(e=>e).for(e => obj=obj[e]);
			return obj;
		}, String.prototype.hasDupesA = function hasDuplicatesAll() {
			return /(.|\n)\1+/.in(
				this.split("").sort().join("")
			);
		}, String.prototype.hasDupesL = function hasDuplicateLetters() {
			return /(\w)\1+/.in(
				this.split("").sort().join("")
			);
		}, String.prototype.reverse = function reverse() {
			return this.split("").reverse().join("");
		}, String.prototype.remove = function remove(arg) {
			return this.replace(arg, "");
		}, String.prototype.remrep = function removeRepeats() {
			return Array.from( // this also sorts the string. *shrugs*, whatever idc
				new Set(this)
			).join("");
		}, String.prototype.each = function putArgBetweenEachCharacter(arg="") {
			return Array.from(this).join(`${arg}`);
		}, String.prototype.toFunc = function toNamedFunction(name="anonymous") {
			var s = this.valueOf();
			if (s.sW("Symbol(") && s.eW(")")) throw Error("Can't parse Symbol().");
			s = (""+s).remove(/^(\s*function\s*\w*\s*\(\s*)/);
			var args = s.substr(0, s.io(")"));
			return (
				(fn, name) => (Function(
					`return function(call){return function ${name}() { return call (this, arguments) }}`
				)())(Function.apply.bind(fn))
			)(Function(args, s.replace(
				RegExp(`^(${(z=>{
					for (var i=len(z), g=""; i --> 0 ;) g += (/[$^()+*|[\]{}?.]/.in(z[i]) && "\\") + z[i];
					return g;
			})(args)}\\)\\s*\\{)`,"g"), "").remove(/\s*;*\s*}\s*;*\s*/)), name);
		}, String.prototype.toFun = function toNamelessFunction() {
			var f = () => Function(this).call(this)
			return () => f();
		}, String.prototype.toRegex = function toRegularExpression(f="", form="escaped") {
			if (form === "escaped" || form === "escape" || form === "e")
				for (var i = 0, b = "", l = len(this); i < l; i++)
					b += /[$^()+*\\|[\]{}?.]/.in(this[i]) ?
						`\\${this[i]}` :
						this[i];
			else return RegExp(this, f);
			return RegExp(b, f);
		}, String.prototype.toNumber = String.prototype.toNum = function toNumber() {
			return +this;
		}, String.prototype.toBigInt = function toBigInt() {
			try { return BigInt(this) }
			catch { throw TypeError(`Cannot convert input to BigInt. input: '${this}'`) }
		}, String.prototype.pop2 = function pop2() {
			return this.substr(0, dim(this));
		}, String.prototype.unescape = function unescape() {
			return this.split("").map(
				e => e === "\n" ?
					"\\n" :
					e === "\t" ?
						"\\t" :
						e === "\f" ?
							"\\f" :
							e === "\r" ?
								"\\r" :
								e === "\v" ?
									"\\v" :
									e === "\b" ?
										"\\b" :
										e
			).join("");
		}, String.prototype.includes = String.prototype.incl = function includes(input) {
			return input.toRegex().in(this);
		}, String.prototype.start = function start(start="") {
			// if the string is empty it returns the argument
			return this || `${start}`;
		}, String.prototype.begin = function begin(text="") { // basically Array.unshift2 for strings
			return `${text}${this}`;
		}, String.prototype.splitn = function splitNTimes(input, times=1, joinUsingInput=true, customJoiner="") {
			var joiner = joinUsingInput ? input : customJoiner;
			assert(type(input, 1) === "regex" || type(input, 1) === "str", "function requires a regular expression or a string");
			for (var i = 0, arr = this.split(input), arr2 = [], n = len(arr); i < n && i++ < times ;)
				arr2.push(arr.shift());
			if (len(arr)) arr2.push(arr.join(joiner));
			return arr2;
		}, String.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			return isNaN(this) ?
				!1 :
				(+this).inRange(n1, n2, include);
		}, String.prototype.isInt = function isInt() {
			var a = this;
			if ( isNaN(a) ) return !1;
			if (a.io(".") === -1) return !0;
			a = a.slc(".");
			for (var i = len(a); i --> 1 ;)
				if (a[i] !== "0") return !1;
			return !0;
		}, String.prototype.exists = function exists() {
			return this != "";
		}; // Number prototype
		Number.prototype.bitLength = function bitLength() {
			return len(str(abs(this), 2));
		}, Number.prototype.isPrime = function isPrime() {// can probably be optimized
			var n = int(this);
			if (this !== n) return !1;
			if (n === 2) return !0;
			if (n < 2 || !(n % 2)) return !1;
			for (var i = 3, a = n / 3; i <= a; i += 2)
				if (!(n % i)) return !1;
			return !0;
		}, Number.prototype.shl = function shl(num) {
			return this << Number(num);
		}, Number.prototype.shr = function shr(num) {
			return this >> Number(num);
		}, Number.prototype.shr2 = function shr2(num) {
			return this >>> Number(num);
		}, Number.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			return include ?
				this >= n1 && this <= n2 :
				this > n1 && this < n2;
		}, Number.prototype.isInt = function isInt() {
			return this === int(this);
		}, Number.prototype.add = function add(arg) {
			return this + Number(arg);
		}, Number.prototype.sub = function sub(arg) {
			return this - Number(arg);
		}, Number.prototype.mul = function mul(arg) {
			return this * Number(arg);
		}, Number.prototype.div = function div(arg) {
			return this / Number(arg);
		}, Number.prototype.mod = function mod(arg) {
			return this % Number(arg);
		}, Number.prototype.pow = function pow(arg) {
			return this ** Number(arg);
		}; // BigInt prototype
		BigInt.prototype.shl = function shl(num) {
			return this << BigInt(num);
		}, BigInt.prototype.shr = function shr(num) {
			return this >> BigInt(num);
		}, BigInt.prototype.shr2 = function shr2(num) {
			return this >>> BigInt(num);
		}, BigInt.prototype.isPrime = function isPrime() {
			var n = this.valueOf();
			if (n === 2n) return !0;
			if (n < 2n || !(n % 2n)) return !1;
			for (var i = 3n, a = n / 3n; i <= a; i += 2n)
				if (!(n % i)) return !1;
			return !0;
		}, BigInt.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			n2 == null && (n2 = n1);
			return include ?
				this >= n1 && this <= n2 :
				this > n1 && this < n2;
		}, BigInt.prototype.toExponential = function toExponential(maxDigits=16, form=String) {
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
		}, BigInt.prototype.add = function add(arg) {
			return this + BigInt(arg);
		}, BigInt.prototype.sub = function sub(arg) {
			return this - BigInt(arg);
		}, BigInt.prototype.mul = function mul(arg) {
			return this * BigInt(arg);
		}, BigInt.prototype.div = function div(arg) {
			return this / BigInt(arg);
		}, BigInt.prototype.mod = function mod(arg) {
			return this % BigInt(arg);
		}, BigInt.prototype.pow = function pow(arg) {
			return this ** BigInt(arg);
		}, BigInt.prototype.length = function length(n=0) {
			return dim(`${this}`, n);
		};
	} {// bad text encoders
		function asciiToChar(number) {
			switch (number) {
				case   0: return "\x00"; case   1: return "\x01"; case   2: return "\x02";
				case   3: return "\x03"; case   4: return "\x04"; case   5: return "\x05";
				case   6: return "\x06"; case   7: return "\x07"; case   8: return "\b"  ;
				case   9: return "\t"  ; case  10: return "\n"  ; case  11: return "\x0b";
				case  12: return "\x0c"; case  13: return "\r"  ; case  14: return "\x0E";
				case  15: return "\x0F"; case  16: return "\x10"; case  17: return "\x11";
				case  18: return "\x12"; case  19: return "\x13"; case  20: return "\x14";
				case  21: return "\x15"; case  22: return "\x16"; case  23: return "\x17";
				case  24: return "\x18"; case  25: return "\x19"; case  26: return "\x1A";
				case  27: return "\x1B"; case  28: return "\x1C"; case  29: return "\x1D";
				case  30: return "\x1E"; case  31: return "\x1F"; case  32: return    " ";
				case  33: return    "!"; case  34: return    '"'; case  35: return    "#";
				case  36: return    "$"; case  37: return    "%"; case  38: return    "&"; case  39: return "'";
				case  40: return    "("; case  41: return    ")"; case  42: return    "*"; case  43: return "+";
				case  44: return    ","; case  45: return    "-"; case  46: return    "."; case  47: return "/";
				case  48: return    "0"; case  49: return    "1"; case  50: return    "2"; case  51: return "3";
				case  52: return    "4"; case  53: return    "5"; case  54: return    "6"; case  55: return "7";
				case  56: return    "8"; case  57: return    "9"; case  58: return    ":"; case  59: return ";";
				case  60: return    "<"; case  61: return    "="; case  62: return    ">"; case  63: return "?";
				case  64: return    "@"; case  65: return    "A"; case  66: return    "B"; case  67: return "C";
				case  68: return    "D"; case  69: return    "E"; case  70: return    "F"; case  71: return "G";
				case  72: return    "H"; case  73: return    "I"; case  74: return    "J"; case  75: return "K";
				case  76: return    "L"; case  77: return    "M"; case  78: return    "N"; case  79: return "O";
				case  80: return    "P"; case  81: return    "Q"; case  82: return    "R"; case  83: return "S";
				case  84: return    "T"; case  85: return    "U"; case  86: return    "V"; case  87: return "W";
				case  88: return    "X"; case  89: return    "Y"; case  90: return    "Z"; case  91: return "[";
				case  92: return   "\\"; case  93: return    "]"; case  94: return    "^"; case  95: return "_"; 
				case  96: return    "`"; case  97: return    "a"; case  98: return    "b"; case  99: return "c";
				case 100: return    "d"; case 101: return    "e"; case 102: return    "f"; case 103: return "g";
				case 104: return    "h"; case 105: return    "i"; case 106: return    "j"; case 107: return "k";
				case 108: return    "l"; case 109: return    "m"; case 110: return    "n"; case 111: return "o";
				case 112: return    "p"; case 113: return    "q"; case 114: return    "r"; case 115: return "s";
				case 116: return    "t"; case 117: return    "u"; case 118: return    "v"; case 119: return "w";
				case 120: return    "x"; case 121: return    "y"; case 122: return    "z"; case 123: return "{";
				case 124: return    "|"; case 125: return    "}"; case 126: return    "~"; default: throw Error(number);
			}
		} function charToAscii(str) {
			switch (str) {
				case "\x00" : return   0; case "\x01" : return   1; case "\x02" : return  2;
				case "\x03" : return   3; case "\x04" : return   4; case "\x05" : return  5;
				case "\x06" : return   6; case "\x07" : return   7; case "\b"   : return  8;
				case "\t"   : return   9; case "\n"   : return  10; case "\x0b" : return 11;
				case "\x0c" : return  12; case "\r"   : return  13; case "\x0E" : return 14;
				case "\x0F" : return  15; case "\x10" : return  16; case "\x11" : return 17;
				case "\x12" : return  18; case "\x13" : return  19; case "\x14" : return 20;
				case "\x15" : return  21; case "\x16" : return  22; case "\x17" : return 23;
				case "\x18" : return  24; case "\x19" : return  25; case "\x1A" : return 26;
				case "\x1B" : return  27; case "\x1C" : return  28; case "\x1D" : return 29;
				case "\x1E" : return  30; case "\x1F" : return  31;
				case     " ": return  32; case     "!": return  33; case '"': return  34; case "#": return  35;
				case     "$": return  36; case     "%": return  37; case "&": return  38; case "'": return  39;
				case     "(": return  40; case     ")": return  41; case "*": return  42; case "+": return  43;
				case     ",": return  44; case     "-": return  45; case ".": return  46; case "/": return  47;
				case     "0": return  48; case     "1": return  49; case "2": return  50; case "3": return  51;
				case     "4": return  52; case     "5": return  53; case "6": return  54; case "7": return  55;
				case     "8": return  56; case     "9": return  57; case ":": return  58; case ";": return  59;
				case     "<": return  60; case     "=": return  61; case ">": return  62; case "?": return  63;
				case     "@": return  64; case     "A": return  65; case "B": return  66; case "C": return  67;
				case     "D": return  68; case     "E": return  69; case "F": return  70; case "G": return  71;
				case     "H": return  72; case     "I": return  73; case "J": return  74; case "K": return  75;
				case     "L": return  76; case     "M": return  77; case "N": return  78; case "O": return  79;
				case     "P": return  80; case     "Q": return  81; case "R": return  82; case "S": return  83;
				case     "T": return  84; case     "U": return  85; case "V": return  86; case "W": return  87;
				case     "X": return  88; case     "Y": return  89; case "Z": return  90; case "[": return  91;
				case    "\\": return  92; case     "]": return  93; case "^": return  94; case "_": return  95;
				case     "`": return  96; case     "a": return  97; case "b": return  98; case "c": return  99;
				case     "d": return 100; case     "e": return 101; case "f": return 102; case "g": return 103;
				case     "h": return 104; case     "i": return 105; case "j": return 106; case "k": return 107;
				case     "l": return 108; case     "m": return 109; case "n": return 110; case "o": return 111;
				case     "p": return 112; case     "q": return 113; case "r": return 114; case "s": return 115;
				case     "t": return 116; case     "u": return 117; case "v": return 118; case "w": return 119;
				case     "x": return 120; case     "y": return 121; case "z": return 122; case "{": return 123;
				case     "|": return 124; case     "}": return 125; case "~": return 126; default: throw Error(str);
			}
		} function num_encoder(numstr, warn=false) {
			const ODD = len(numstr) % 2;
			warn && isNaN(numstr) && console.warn("using non-numbers in num_encoder() causes loss of information");
			return ODD+(numstr+(ODD?"0":"")).match(/../g).map(e=>`${e[0]}${len(`${+e[0]+ +e[1]}`)===1?+e[0]+ +e[1]:`${+e[0]+ +e[1]}`[1]}`).join("");

			// output starts with 0 --> even input string length
			// output starts with 1 --> odd input string length
			// if string is odd, add zero on the end

			// split into groups of 2 numbers
			// keep 1st number, and second becomes the sum mod 10.
		} function bin_encoder(str) {
			// binary but per character
			str = `${str}`;
			let newstr = "";
			for (let c of str) {
				c = isNaN(c) ? c : Number(c).toString(2);
				while (len(c) < 4) c = `0${c}`;
				newstr += c;
			}
			return newstr;
		} function qwerty_encoder(key, type="encode") {
			// /(?<shift>[01])(?<row>[1-5])(?<col>\d\d)/
			// ignore side keys, and special keys
			const obj = {
				"`": "0101", "~": "1101", "1": "0102", "!": "1103", "2": "0103", "@": "1104", "3": "0104",
				"#": "1105", "4": "0105", "$": "1106", "5": "0106", "%": "1107", "6": "0107", "^": "1108",
				"7": "0108", "&": "1109", "8": "0109", "*": "1110", "9": "0110", "(": "1111", "0": "0111",
				")": "1112", "-": "0112", "_": "1113", "=": "0113", "+": "1114","\b": "0114","\t": "0201",
				"q": "0202", "Q": "1202", "w": "0203", "W": "1203", "e": "0204", "E": "1204", "r": "0205",
				"R": "1205", "t": "0206", "T": "1206", "y": "0207", "Y": "1207", "u": "0208", "U": "1208",
				"i": "0209", "I": "1209", "o": "0210", "O": "1210", "p": "0211", "P": "1211", "[": "0212",
				"{": "1212", "]": "0213", "}": "1213","\\": "0214", "|": "1214", "a": "0302", "A": "1302",
				"s": "0303", "S": "1303", "d": "0304", "D": "1304", "f": "0305", "F": "1305", "g": "0306",
				"G": "1306", "h": "0307", "H": "1307", "j": "0308", "J": "1308", "k": "0309", "K": "1309",
				"l": "0310", "L": "1310", ";": "0311", ":": "1311", "'": "0312","\"": "1312", "z": "0402",
				"Z": "1402", "x": "0403", "X": "1403", "c": "0404", "C": "1404", "v": "0405", "V": "1405",
				"b": "0406", "B": "1406", "n": "0407", "N": "1407", "m": "0408", "M": "1408", ",": "0409",
				"<": "1409", ".": "0410", ">": "1410", "/": "0411", "?": "1411", " ": "0504",
			}
			return type === "encode" || type === "encoder" ? obj[key] : Object.keyof(obj, key);
		} function caesar_encoder(str, offset=1) {
			// not exactly a caesar cipher, but same idea.
			const ASCII_LAST_NUM = 127;
			let newstr = "";
			for (const c of str) {
				let num = (charToAscii(c) + offset) % ASCII_LAST_NUM;
				while (num.inRange(1, 8) || num.inRange(11, 12) || num.inRange(14, 31))
					num += rMath.sgn(offset);
				newstr += asciiToChar(num);
			}
			return newstr;
		} function let_encoder(str, type="encode") {
			// letter encoder
			const obj = {
				"1": "Ϳ", "2": "J", "3": "Ρ", "4": "Ј", "5": "𝗉",
				"6": "p", "7": "Р", "8": "р", "9": "P", "0": "յ",
			}
			var i = 0, n = len(str), str2 = "";

			if (type === "encode" || type === "encoder")
				for (; i < n; i++)
					str2 += obj[str[i]];

			else
				for (; i < n; i++)
					str2 += Object.keyof(obj, str[i]);

			return str2;
		} function random_encoder(input="") {
			return input.split(" ").map(
				e => alphabet.rand() + e + alphabet.rand()
			).join(" ");
		} function shift_encoder(s1="", shifts=[1], mod=127) {
			if (type(shifts, 1) !== "arr" && isNaN(shifts)) shifts = 1;
			shifts = shifts.tofar().len(len(s1));
			for (var i = 0, n = len(s1), s2 = "", tmp; i < n; i++)
				s2 += asciiToChar(rMath.mod( charToAscii(s1[i]) + (shifts[i] == null ? 1 : shifts[i]), mod ));
			return s2;
		} () => {
			const arr = [
				"аa", "ΑA", "ϲc", "𝗁h", "հh", "іi", "ϳj", "јj",
				"ͿJ", "ЈJ", "յȷ", "𝗄k", "ΚK", "КK", "ΜM", "МM",
				"ոn", "ΟO", "ՕO", "𝗉p", "рp", "ΡP", "РP", "ԛq",
				"ѕs", "ЅS", "ΤT", "ТT", "սu", "ᴠv", "ԜW", "хx",
			],
			check = s => s[0] === s[1],
			checks = a => {
				for (var i = 0, n = len(a); i < n; i++)
					if (check(a[i])) return [!1, i , a[i]];
				return !0;
			}
			// base 11 but replace the stuff with these:
			"յͿΡЈ𝗉pJРрPȷ";
			"1234567890a";
		}
	} {// Error Handling
		try { ON_CONFLICT = ON_CONFLICT.lower() }
		catch { ON_CONFLICT = "None" }
		
		ON_CONFLICT === "default" && (ON_CONFLICT = "dbg");
		if (Alert_Conflict_OverWritten && len(CONFLICT_ARR)) {
			switch (ON_CONFLICT) {
				case "ast":
				case "assert": console.assert(!1, "Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "dbg":
				case "debug": console.debug("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "inf":
				case "info": console.info("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "wrn":
				case "warn": console.warn("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "log": console.log("Global Variables Overwritten: %o", CONFLICT_ARR); break;
				case "alt":
				case "alert": alert(`Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`); break;
				case "ret":
				case "return": return `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
				case "trw":
				case "throw": throw `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
			}
			console.debug("lib.js load failed");
			return 1;
		}
		Alert_Library_Load_Finished && Alert_Library_Load_Finished !== "default" && (
			Library_Startup_Function === "default" ?
				console.log :
				Library_Startup_Function
		)(
			Library_Startup_Message === "default" ?
				"lib.js loaded" :
				Library_Startup_Message
		);
		return 0;
	} {// Comments
		/**
			!function codehs(b="100%",d=$("#nav-photo-wrapper")[0].children[0].src,e=userData.name){var a=$$(".module-info"),c=($$(".user-stat"),$$(".user-stat")[0].children[0].children);function f(){var a="finalized",b="submitted",c={icon:a,challenge:a,quiz:a,"chs-badge":a,video:a,connection:a,example:a,"lesson-status":a,exercise:b,"free-response":b};$$(`.unopened,.not-${b}`).forEach((a,b,d)=>d[b].className=a.className.replace(/unopened|not-submitted/g,c[a.className.split(/ +/)[0]])),$$(".bg-slate").filter(a=>"bg-slate"==a.className.trim()).forEach((c,a,b)=>{b[a].style.width="100%",b[a].className=c.className.replace(/progressBar/g,"bg-slate")}),$$(".percent-box").forEach((a,b,c)=>{c[b].innerHTML=a.innerHTML.replace(/\d+%/g,"100%"),c[b].className=a.className.replace(/(progress-)\d+/,"$1100")})}for(let g of(a[0].click(),a[0].click(),a))g.click(),f();$(".nav-user-name-text")[0].innerHTML=e,$("#nav-photo-wrapper")[0].children[0].src=d,c[1].innerHTML=b,c[2].children[0].children[0].style.width=b,clear()}()
			https://codehs.com/identicon/image/
			1P 1$ 2( 3h 3H 3L 44 5H 5K 5O 5P 65 6h 6o 6t 6v 6F
			last seen: 7R
		*/
		// ×: atob(10)
		// ß: atob(30)
		// ç: atob(60)
		// ÷: atob(90)
		// ½: atob(170)[1]
		// Í: atob(180)[1]
	}
})();

void function _pow(x) {
	if (!x) return [0];
	if (x % 1) return NaN;
	var negative = false;
	if (x < 0) {
		negative = true;
		x *= -1;
	}
	try { x = BigInt(x) } catch { return NaN }
	let arr = [1];
	while (arr.at(-1) < x) for (var i = len(arr); i --> 0 ;) if (x >= arr.at(-1) + arr[i]) {
		arr.push( arr.at(-1) + arr[i] );
		break;
	}
	negative && arr.push(-arr.at(-1));
	return arr;
}
/*var pow = */ void (function create_pow() {
	// TODO: Make dynamic
	const pows = [
		function pow0(x) {
			const x0 = 1;
			return x0;
		}, function pow2(x) {
			const x2 = x * x; // 1 * x2
			return x2;
		}, function pow4(x) {
			const x2 = x  * x;
			const x4 = x2 * x2;
			return x4;
		}, function pow8(x) {
			const x2 = x  * x;
			const x4 = x2 * x2;
			const x8 = x4 * x4;
			return x8;
		}, function pow12(x) {
			const x2  = x  * x;
			const x4  = x2 * x2;
			const x8  = x4 * x4;
			const x12 = x8 * x4;
			return x12;
		}, function pow16(x) {
			const x2  = x  * x;
			const x4  = x2 * x2;
			const x8  = x4 * x4;
			const x16 = x8 * x8;
			return x16;
		}, function pow20(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x20 = x16 * x4;
			return x20;
		}, function pow24(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x24 = x16 * x8;
			return x24;
		}, function pow28(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x24 = x16 * x8;
			const x28 = x24 * x4;
			return x28;
		}, function pow32(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x32 = x16 * x16;
			return x32;
		}, function pow36(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x32 = x16 * x16;
			const x36 = x32 * x4;
			return x36;
		}, function pow40(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x32 = x16 * x16;
			const x40 = x32 * x8;
			return x40;
		}, function pow44(x) {
			const x2  = x   * x;
			const x4  = x2  * x2;
			const x8  = x4  * x4;
			const x16 = x8  * x8;
			const x32 = x16 * x16;
			const x40 = x32 * x8;
			const x44 = x40 * x4;
			return x44;
		},
	]; return function pow(x, y) {
		// the following observations are general. faster means less multiplications.
		// exponents closer to 2^x are faster
		// even exponents are faster than odd
		// smaller exponents are faster
		if (y % 1) return NaN;
		var negative = false;
		if (y < 0) {
			negative = true;
			y *= -1;
		}
		var odd = !!(y % 2), output, index, multiply = false;
		if (!y || y === 1) index = 0;
		else if (y === 2 || y === 3) index = 1;
		else if (!odd) {
			index = y/4 + 1;
			if (index % 1) {
				index = floor(index);
				multiply = true;
			}
		} else { // y is odd
			index = y/4 + 1;
			if (index % 1) {
				index % 1 === .75 && (multiply = true);
				index = floor(index);
			}
		}
		if (x > 9 && [2, 6, 10, 14, 18].incl(x % 20)) output = pows[ index ] (x);
		else {
			if (index >= len(pows)) {
				// default
				var output = pows.at(-1) (x); // use as much of the efficiency as possible
				for (index = 2 * (index - dim(pows)); index --> 0 ; output *= x);
				return negative ? 1 / output : output;
			}
			output = pows[ index ] (x);
		}
		output *= (multiply ? x * x : 1) * (odd ? x : 1);
		return negative ? 1 / output : output;
	}
})();
