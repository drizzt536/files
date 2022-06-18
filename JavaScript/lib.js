#!/usr/bin/env js
// TODO: Fix rMath.set() for 1 argument
void (() => { "use strict";
	{  // Customization

		const onConflict_Options = [
			"log", "throw" , "trw", "return", "ret", "error",
			"err", "warn"  , "wrn", "debug" , "dbg", "info" ,
			"inf", "assert", "ast", "alert" , "alt", "None" ,
		];
		// if something not in the options is used, it will act as if "None" was chosen instead

		var
		ALERT_FINISHED = false,
		ON_CONFLICT = "dbg",
		Alert_Conflict_For_Math = false,
		Alert_Conflict_OverWritten_Functions = true,
		Alert_Conflict_Unused_Functions = false, // "??=" is used instead of "=" to create these functions.
		Output_Math_Variable = "Math",
		MATH_LOG_DEFAULT_BASE = 10, // for rMath.log and rMath.logbase
		MATH_DEFAULT_END_TEMPERATURE_SYSTEM = "celcius", // for rMath.tempConv
		// math arguments should be booleans or "default". The default value is true.
		aMath_Help_Argument = "default",
		bMath_Help_Argument = "default",
		cMath_DegTrig_Argument = "default",
		cMath_Help_Argument = "default",
		fMath_Help_Argument = "default",
		sMath_Help_Argument = "default",
		sMath_Comparatives_Argument = "default",
		rMath_DegTrig_Argument = "default",
		rMath_Help_Argument = "default",
		rMath_Comparatives_Argument = "default",
		rMath_Constants_Argument = "default",
		Logic_BitWise_Argument = "default",
		Logic_Comparatives_Argument = "default",
		Logic_Help_Argument = "default",
		π = 3.141592653589793,
		pi = π,
		𝑒 = 2.718281828459045,
		e = 𝑒, 
		ϕ = 1.618033988749895, // -2 sin 666°
		phi = ϕ,
		γ = .5772156649015329,
		emc = γ,
		Ω = .5671432904097838, // Ωe^Ω = 1
		omega = Ω,
		α = 1.187452351126501, // https://en.wikipedia.org/wiki/Foias_constant
		𝜏 = 6.283185307179586,
		tau = 𝜏;
	} {// Conflict and Library Functions
		var LIBRARY_FUNCTIONS = [
			"infinity","$qs","isIterable","isArr","sizeof","len","dim","π","𝑒",Symbol.for("<0x200b>"),
			Symbol.for("<0x08>"),"json","rand","randInt","randint","complex","constr","copy","assert","help",
			"dir","nSub","reverseLList","findDayOfWeek","type","round","parseDec","fpart","floor",
			"ceil","int","str","numToAccStr","range","numToWords","numToStrW_s",
			"Errors","strMul","LinkedList","Types","numStrNorm","ipart","aMath","bMath","cMath","fMath",
			"sMath","rMath","Logic"
		]
		, NOT_ACTIVE_ARR = ["$","revArr","timeThrow","quine","convertType"].map(
				e => [ this[e] != null , e ]
			).filter( e => e[0] ).map( e => e[1] )
		, CONFLICT_ARR = LIBRARY_FUNCTIONS.map(e=>[this[e] == null, e]).filter(e => !e[0]).map(e => e[1]);
		
		this[Output_Math_Variable] !== void 0 && (
			Output_Math_Variable === "Math" ?
				Alert_Conflict_For_Math === true :
				Output_Math_Variable === undefined ?
					false :
					true
		) && CONFLICT_ARR.push(Output_Math_Variable);
	} {// Variables
		var alphabetL = "abcdefghijklmnopqrstuvwxyz",
			alphabet = alphabetL,
			alphabetU = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
			numbers = "0123456789",
			base62Numbers = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
			characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]{}|;:',.<>/?-_=+ \"\\";
		this.infinity = Infinity;
		this.$qs = function $qs(element, one=false) {
			return one ?
				document.querySelector(element) :
				document.querySelectorAll(element);
		}; this.isIterable = function isIterable(arg) {
			try { for (const i of arg) break }
			catch { return !1 }
			return !0;
		}; this.isArr = arr => type(arr) === "object" && isIterable(arr) && constr(arr) === "Array";
		this.sizeof = function sizeof(obj) {
			if (obj == null) return 0;
			var length = len(obj);
			if (length != null) return length;
			if (constr(obj) === "Object") return len( Object.keys(obj) );
			return 0;
		}; this.len = e => e.length;
		this.dim = (e, n=1) => e.length - n;
		this.π = 3.141592653589793;
		this.𝑒 = 2.718281828459045;
		this[Symbol.for("<0x200b>")] = "​"; // zero width space
		this[Symbol.for("<0x08>")] = ""; // \b
		this.json = JSON;
		this.rand = Math.random;
		this.randint = this.randInt = function randomInt(min=0, max=1) {
			if ( isNaN(min) || isNaN(max) ) return round( rand() );
			min < 0 && min--;
			return round( rand() * Math.abs(min - max) + min );
		}; this.complex = (re=0, im=0) => cMath.new(re, im);
		this.constr = function constructorName(input, name=true) {
			if (input == null) return input;
			if (name) return input?.constructor.name;
			const output = `${input.constructor}`.
				remove(/\s*\{(.|\s)*|class\s*|function\s*|\(\)/g).
					remove(/\s(.|\s)*/g);
			return output === "(" ?
				input.constructor.name :
				output;
		}; this.copy = object => json.parse(json.stringify(object));
		this.assert = function assert(condition, message="false") {
			return !condition &&
				Errors("Failed Assertion", message);
		}; this.help = function help(str) {
			// TODO: Fix help function.  help("rMath.int") is broken
			try { eval(str) }
			catch (err) {
				// str is a keyword
				if (/SyntaxError: Unexpected token '.+'/.test(`${err}`)) {
					open(`https://developer.mozilla.org/en-US/search?q=${/'(.+)'/.exec(`${err}`)[1]}`, "_blank");
					return "Keyword";
				}
				// str is a keyword like 'function' or 'new'
				if (`${err}` === "SyntaxError: Unexpected end of input") {
					open(`https://developer.mozilla.org/en-US/search?q=${str}`, "_blank");
					return "Keyword";
				}
			} try {
				var func = eval(str);
				if (type(func) === "function") {
					if (`${func}`.includes(/\(\) { \[native code\] }/))
						// () was added below without testing
						open(`https://developer.mozilla.org/en-US/search?q=${str}()`, "_blank");
					return `Function: arguments -> ${`${func}`.replace(/\s+/g, " ").remove(/\s*{.*|\s*=>.*|function\s*[^(]*/g).remove(/^\(|\)$/g).start("(None)").replace(/,(?!\s)/g, ", ")}`;
				}
			} catch {}
			try { return "Value: " + new Function(`return ${str}`)() } catch { return "Variable not Found" }	
		}; this.dir = function currentDirectory(loc=new Error().stack) {
			return `${loc}`
				.substr(13)
				.remove(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g);
		}; this.nSub = function substituteNInBigIntegers(num, n=1) {
			return type(num) === "bigint" ?
				Number(num) * n :
				num;
		}; this.revArr ??= function reverseArray(array) {
			for (var left = 0, length = len(array), right = length - 1, tmp; left < right; left++, right--) {
				tmp = array[left];
				array[left] = array[right];
				array[right] = tmp;
			}
			return array;
		}; this.revLList = function reverseLinkedList(list) {
			for (let cur = list.head, prev = null, next; current;) {
				next = cur.next;
				cur.next = prev;
				prev = cur;
				cur = next;
			}
			list.head = prev || list.head;
			return list;
		}; this.convertType ??= function convertType(input, Type, fail="throw", handle=!1) {
			if (Type == null || input == null) throw Error(`No type or input given. input: ${e}. type: ${E}`);
			if (type(input) == Type) return input;
			switch (Type) {
				case "string": return `${input}`;
				case "boolean": return !!(input);
				case "undefined": return;
				case "number":
					input = Number(input);
					if (rMath.isNaN(input)) {
						if (fail !== "throw") return;
						throw Error(`cannot convert ${type(input)} to number`);
					}
					return input;
				case "bigint":
					if (type(input) === "number" || rMath.isAN(input)) return BigInt(input);
					if (type(input) === "bigint") return input;
					if (fail !== "throw") return;
					throw Error(`cannot convert ${type(input)} to bigint`);
				case "function":
					if (type(input) === "function") return input;
					return Function(input);
				case "symbol":
					if (handle !== !1) return Symbol.for(input);
					if (fail !== "throw") return;
					throw Error(`cannot convert ${type(input)} to symbol`);
				case "object":
					if (type(input) === "object") return input;
					if (handle !== !1) return{data: input};
					if (fail !== "throw") return;
					throw Error(`cannot convert ${type(input)} to object`);
				default:
					if (fail !== "throw") return;
					throw Error(`Invalid Type: ${Type}`);
			}
		}; this.findDayOfWeek = function findDayOfWeek(day=0, month=0, year=0, order="dd/mm/yyyy", str=true) {
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
					used = [false, false, false];
				for (var i = 0; i < 3; i++) {
					switch (order[i]) {
						case "dd":
							if (used[0]) throw Error("Invalid input for argument 5");
							used[0] = true;
							day = tmp[i];
							break;
						case "mm":
							if (used[1]) throw Error("Invalid input for argument 5");
							used[1] = true;
							month = tmp[i];
							break;
						case "yyyy":
							if (used[2]) throw Error("Invalid input for argument 5");
							used[2] = true;
							year = tmp[i];
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
		}; this.type = function type(a, b) {
			// TODO: add nodelist to function
			return b == null || typeof a === "bigint" || typeof a === "symbol" || a === undefined ?
				typeof a :
				typeof a === "number" ?
					isNaN(a) ?
						"nan" :
						isNaN(a - a) ?
							"inf" :
							"num" :
					typeof a === "object" ?
						`${a.constructor}` === 'function NodeList() { [native code] }' ?
							"nodelist" :
							`${a.test}` === 'function test() { [native code] }' ?
								"regex" :
								a === null ?
									"null" :
									/^type\(\){return("|'|`)linkedlist\1}$/.test(`${a.type}`.remove(/\s|;/g)) ?
										"linkedlist" :
										/^type\(\){return("|'|`)complex\1}$/.test(`${a.type}`.remove(/\s|;/g)) ?
											"complex" :
											/^type\(\){return("|'|`)fraction\1}$/.test(`${a.type}`.remove(/\s|;/g)) ?
												"fraction" :
												/^type\(\){return("|'|`)set\1}$/.test(`${a.type}`.remove(/\s|;/g)) ?
													"set" :
													isArr(a) ?
														"arr" :
														"obj" :
						typeof a === "string" ?
							"str" :
							typeof a === "boolean" ?
								"bool" :
							/^class /.test(a+"") ?
								"class" :
								"func"
		}; this.timeThrow ??= function timeThrow(message="Error Message Here.", run=false) {
			let date = new Date().getHours();
			if (date > 22 || date < 4) throw Error("Go to Sleep.");
			if (run === false) throw Error(`${message}`);
			type(run, 1) === "func" && run();
		}; this.quine ??= function quine() {
			return {
				fn_1: '$=$=>`$=${$},$($)`,$($)',
				fn_2: '$=$=>`$=${$};$($)`;$($)',
				instructions: "copy the string contents to the console."
			};
		}; this.round = function round(n) {
			return type(n) === "number" ?
				fpart(n) * (n<0?-1:1) < .5 ?
					int(n) :
					int(n) + (n<0?-1:1) :
				NaN;
		}; this.parseDec = this.fpart = Number.parseDec = Number.fpart = function fPart(n, number=true) {
			if ( isNaN(n) ) return NaN;
			if ( n.isInt() ) return 0;
			return number ? Number( `${n}`.slc(".") ) : `0${`${n}`.slc(".")}`;
		}; this.floor = function floor(n) {
			return type(n) === "number" ?
				int(n) - (n<0 && fpart(n) ? 1 : 0) :
				NaN;
		}; this.ceil = function ceil(n) {
			return type(n) === "number" ?
				int(n) + (n>0 && fpart(n) ? 1 : 0) :
				NaN;
		}; this.int = Number.parseInt;
		this.str = function String(a, b) {
			return b <= 36 && b >= 2 ?
				a.toString( int(b) ) :
				a + "";
		}; this.list = Array.from;
		this.numToAccStr = function numberToAccountingString(n) { return n<0 ? `(${-n})` : n+"" };
		this.range = function range(start, stop, step=1) {
			// this function is mostly from the offical JavaScript documentation with small changes
			stop == null && (stop = start - 1, start = 0);
			return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + i * step);
		}; this.numToWords = function numberToWords(number) {
			// numToWords("2001") is "broken".
			if (rMath.isNaN(number)) throw Error(`Expected a number, and found a(n) ${type(number)}`);
			var string = number.toString().remove(/\.$/);
			number = Number(number);
			switch (true) {
				case /\./.test(string):
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
				case string < 1e3:return `${numberToWords(string[0])} hundred and ${numberToWords(string.substr(1,2))}`;
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
		}; this.numToStrW_s = function numberToStringWith_s(number) {
			for (var i = 0, str2 = "", str = `${number}`.reverse(); i < len(str); i++) {
				(!(i % 3) && i) && (str2 += "_");
				str2 += str[i];
			}
			return str2.reverse();
		}; this.Errors = function customErrors(name="Error", text="") {
			Error.prototype.name = `${name}`;
			throw Error(text).stack.remove(/ {4}at(.|\s)*\n/);
		}; this.strMul = function stringMultiplication(s1="", num=1) {
			if (isNaN(num) || type(s1, 1) !== "str") return "";
			for (var i = num, s2 = ""; i --> 0 ;) s2 += s1;
			return s2;
		}; this.LinkedList = class LinkedList {
			constructor(head) {
				this.size = 0;
				this.Node = class Node {
					constructor(value, next=null) {
						this.value = value;
						this.next = next;
					}
				};
				if (head === undefined) this.head = null;
				else this.head = new this.Node(head);
			}
			insertLast(value) {
				if (!this.size) return this.insertFirst(value);
				this.size++;
				for (var current = this.head; current.next;)
					current = current.next;
				current.next = new this.Node(value)
			}
			insertAt(value, index=0) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				if (!index) return this.insertFirst(value);
				if (index === this.size) return this.insertLast(value);
				for (var i = 0, current = this.head; i + 1 < index; i++)
					current = current.next;
				this.size++;
				current.next = new this.Node(value, current.next)
			}
			getAt(index=0) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				for (var i = 0, current = this.head; i < index; i++)
					current = current.next;
				return current;
			}
			removeAt(index) {
				if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
				for (var i = 0, current = this.head; i + 1 < index; i++)
					current = current.next;
				current.next = current.next.next;
				this.size--;
			}
			insertFirst(value) {
				this.head = new this.Node(value, this.head);
				this.size++;
			}
			reverse() {
				for (var cur = this.head, prev = null, next; cur;) {
					next = cur.next;
					cur.next = prev;
					prev = cur;
					cur = next;
				}
				this.head = prev || this.head;
			}
			toArray() {
				for (let current = this.head, a = []; current;) {
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
		}; this.Types = {
			Boolean: Boolean,
			Number: Number,
			String: String,
			BigInt: BigInt,
			Function: Function,
			Array: Array,
			Object(input, handle=!1) {
				return type(input) === "object" ? input : handle == !0 ? {data: input} : void 0
			},
			undefined: ()=>{},
			Symbol(input, handle=!1) {
				return type(input) === "symbol" ? input : handle == !0 ? Symbol.for(input) : void 0
			}
		}; this.numStrNorm = function NormalizeNumberString(snum="0.0") {
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
		}; this.ipart = Number.parseInt;
		this.passwordGenerator = function passwordGenerator(
			length=18,
			charsToRemove=undefined,
			chars=characters
		) {
			if (isNaN( length = Number(length))) return false;
			if (length < 0) return false;
			length = int(length);
			if (type(charsToRemove, 1) === "arr")
			if (charsToRemove.every( e => type(e) === "string" )) charsToRemove = charsToRemove.join("");
			else return false;
			else if (
				type(charsToRemove) !== "string" &&
				charsToRemove !== void 0 &&
				charsToRemove !== null
			) return false;
			if (chars === characters && charsToRemove !== void 0 && charsToRemove !== null)
				for (const char in charsToRemove)
					chars = chars.remove(char);
			for (var i = length, password = ""; i --> 0 ;) password += chars.rand();
			return password;
		}; Number.EPSILON == null && (Number.EPSILON = 2**-52);
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
	} {// Math and Logic Variables
		this.sMath = new (class stringRealMath {
			constructor(help="default", comparatives="default") {
				help === "default" && (help = true);
				comparatives === "default" && (comparatives = true);
				if (help) this.help = {
					add: "3 arguments. (string number or number, string number or number, precision). addition",
					sub: "3 arguments. (string number or number, string number or number, precision). subtraction",
					div: "3 arguments. (string number or number, string number or number, precision). division",
					idiv: "3 arguments. the same as div() but only for integers. should be faster, and doesn't check for invalid inputs",
					mod: "2 string number arguments. modulo operator",
					ipow: "2 string number arguments. power but only for integer powers",
					ifact: "1 string number argument. integer factorial",
					neg: "Takes 1 string number argument. negates the input",
					sgn: "1 string number argument. returns the sign of the input. NOTE: sgn(0) = 0.",
					sign: "1 string number argument. returns the sign of the input. NOTE: sgn(0) = 0.",
					abs: "1 string number argument. returns the absolute value of the input.",
				}; if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") {// >
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return false;
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
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] > 1*b[i]) return true;
							if (1*a[i] < 1*b[i]) return false;
						}
						return false;
					}, ge(a="0.0", b="0.0") {// >=
						return this.gt(a, b) ||
							this.seq(a, b);
					}, lt(a="0.0", b="0.0") {// <
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return false;
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
						} if ( a.io(".") - a_index < b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] < 1*b[i]) return true;
							if (1*a[i] > 1*b[i]) return false;
						}
						return false;
					}, le(a="0.0", b="0.0") {/* <= */ return this.lt(a, b) || this.seq(a, b) },
					seq(a="0.0", b="0.0") {// strict equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return false;
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
						if ( a.io(".") - a_index !== b.io(".") - b_index ) return false;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] !== 1*b[i]) return false;
						}
						return true;
					}, sneq(a="0.0", b="0.0") {// strict not equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return true;
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
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] !== 1*b[i]) return true;
						}
						return false;
					},
				};
			} add(a="0.0", b="0.0") {
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
				if (a.startsW("-") && b.startsW("-"))
					return this.neg( this.add(a.substr(1), b.substr(1)) );
				if (a.startsW("-")  && !b.startsW("-")) return this.sub(b, a.substr(1));
				if (!a.startsW("-") &&  b.startsW("-")) return this.sub(a, b.substr(1));
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", len(b) - len(a));
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", len(a) - len(b));
				a = a.split("."); b = b.split(".");

				let c = [
					[ a[0], b[0] ],
					[ a[1], b[1] ],
				].map(
					e => e.map( f => f.split("") )
				).map(
					o => o[0].map( (e, i) => 1*e + 1*o[1][i] )
				);
				for (var i = 2; i --> 0 ;) {
					for (var j = len(c[i]), tmp; j --> 0 ;) {
						tmp = floor( c[i][j] / 10 );
						c[i][j] -= 10*tmp;
						if (tmp) {
							if (j) c[i][j-1] += tmp;
							else i === 1 ? c[0][len(c[0]) - 1] += tmp : c[i].unshift(tmp);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".").remove(/\.0+$/);
				return c.incl(".") ? c : `${c}.0`;
			} sub(a="0.0", b="0.0", precision=Infinity) {
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
				if (!a.startsW("-") && b.startsW("-")) return this.add(a, b.substr(1));
				if (a.startsW("-") && b.startsW("-")) return this.sub(b.substr(1), a);
				if (a.startsW("-") && !b.startsW("-"))
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
					o => o[0].map( (e, i) => 1*e - 1*o[1][i] )
				), neg = c[0][0] < 0;
				for (var i = 2, j, tmp; i --> 0 ;) { // c[1] then c[0]
					for (j = len( c[i] ) ; j --> 0 ;) { // for each element in c[i]
						tmp = rMath.abs( floor(c[i][j] / 10) );
						while (c[i][j] < 0) {
							i + j && (c[i][j] += 10);
							if (j) c[i][j-1] -= tmp;
							else if (i === 1) c[0][len(c[0]) - 1] -= tmp;
							else throw Error(`Broken. End value shouldn't be negative.`);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".");
				return c.imcl(".") ? c : `${c}.0`;
			} mul(a="0.0", b="0.0") {
				// TODO: Might still be broken
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
				const sign = this.sgn(a) === this.sgn(b) ? 1 : -1;
				a = this.abs(a); b = this.abs(b);
				if (this.eq.seq(a, "0.0") || this.eq.seq(b, "0.0")) return "0.0";

				a = a.remove(/\.?0+$/g); b = b.remove(/\.?0+$/g);
				var dec = 0;
				a.io(".") > 0 && (dec += len(a) - a.io(".") - 1);
				b.io(".") > 0 && (dec += len(b) - b.io(".") - 1);
				a = a.remove("."); b = b.remove(".");
				for (var i = len(b), arr = [], carryover, tmp, str, j; i --> 0 ;) {
					for (j = len(a), str = "", carryover = 0; j --> 0 ;) {
						tmp = (multable[ b[i] ][ a[j] ] + carryover).toString();
						carryover = dim(tmp) ? Number(tmp[0]) : 0;
						tmp = Number( tmp[dim(tmp)] );
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
			} div(num="0.0", denom="1.0", precision=18) {
				// NOTE: Will probably break the denominator is "-0"
				type(num) === "bigint" && (num = `${num}`); type(denom) === "bigint" && (denom = `${denom}`);
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				isNaN(precision) && (precision = 18);
				if ( this.eq.seq(denom, 0) )
					return this.eq.seq(num, 0) ?
						NaN :
						Infinity;
				if ( this.eq.seq(num, 0) ) return "0.0";
				num = numStrNorm( num.toString() ); denom = numStrNorm( denom.toString() );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				while (this.eq.sneq(this.fpart(num), 0)) {
					num = this.mul(num, 10);
					denom = this.mul(num, 10);
				} while (this.eq.sneq(this.fpart(denom), 0)) {
					num = this.mul(num, 10);
					denom = this.mul(num, 10);
				}
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while (this.eq.ge(tmp3 = this.sub(tmp1, tmp2), 0)) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision < 1) return `${ansString}.0`;
				var remainder = this.mul( this.sub(num, this.mul(ans, denom)), 10 );
				if (this.eq.sneq(remainder, 0)) ansString += ".";
				for (var i = 0, j; this.eq.sneq(remainder, 0) && i++ < precision ;) {
					for (j = 9; this.eq.lt(this.sub(remainder, table[j]), 0) ;) j--;
					remainder = this.mul( this.sub(remainder, table[j]), 10 );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sign === -1 ? `-${ansString}` : ansString;
			} idiv(num="0.0", denom="1.0", precision=18) {
				// assumes correct input. (sNumber, sNumber, Positive-Integer)
				if ( this.eq.seq(denom, 0) )
					return this.eq.seq(num, 0) ?
						NaN :
						Infinity;
				if ( this.eq.seq(num, 0) ) return "0.0";
				num = numStrNorm( num.toString() ); denom = numStrNorm( denom.toString() );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while (this.eq.ge(tmp3 = this.sub(tmp1, tmp2), 0)) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision < 1) return `${ansString}.0`;
				var remainder = this.mul( this.sub(num, this.mul(ans, denom)), 10 );
				if (this.eq.sneq(remainder, 0)) ansString += ".";
				for (var i = 0, j; this.eq.sneq(remainder, 0) && i++ < precision ;) {
					for (j = 9; this.eq.lt(this.sub(remainder, table[j]), 0) ;) j--;
					remainder = this.mul( this.sub(remainder, table[j]), 10 );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sign === -1 ? `-${ansString}` : ansString;
			} mod() {
			} ipow(a="0.0", b="1.0") {
				type(a) === "bigint" && (a = a.toString()); type(b) === "bigint" && (b = b.toString());
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
				if ( this.eq.sneq(fpart(b), 0) ) throw Error("no decimals allowed for exponent.");
				var t = "1.0";
				if (this.sgn(b) >= 0) for (; b > 0; b = this.sub(b, 1)) t = this.mul(t, a);
				else for (; b < 0; b = this.add(b, 1)) t = this.div(t, a);
				return t;
			} ifact(n="0.0") {
				if ( this.eq.sneq(fpart(n), 0) ) throw Error("no decimals allowed.");
				for (var i = n.toString(), total = "1.0"; i > 0; i = this.sub(i, 1))
					total = this.mul(i, total);
				return this.ipart(total);
			} neg(snum="0.0") {
				// negate
				return snum[0] === "-" ?
					snum.substr(1) :
					`-${snum}`;
			} sgn(snum="0.0") {
				// string sign
				return snum[0] === "-" ?
					-1 :
					/0+\.?0*/.test(snum) ?
						0 :
						1;
			} sign(snum="0.0") {
				return this.sgn(snum);
				;
			} abs(snum="0.0") {
				return snum[0] === "-" ?
					snum.substr(1) :
					snum;
			} fpart(n="0.0") {
				return isNaN(n) ?
					NaN :
					n.isInt() ?
						0 :
						`0${`${n}`.slc(".")}`;
			} ipart(n="0") {
				return n.slc(0, ".", 0, -1);
				;
			} square(n="0") {
				return this.mul(n, n);
				;
			} cube(n="0") {
				return this.mul(
					this.square(n),
					n
				);
			} norm/*alize*/(snum="0.0") {
				return numStrNorm(snum);
				;
			}
		})(
			sMath_Help_Argument,
			sMath_Comparatives_Argument,
		); this.rMath = new (class RealMath {
			constructor(degTrig="default", help="default", comparatives="default", constants="default") {
				degTrig === "default" && (degTrig = true);
				help         === "default" && (help = true);
				comparatives === "default" && (comparatives = true);
				constants    === "default" && (constants = true);
				this.Set = class RealSet extends Array {
					// Probably not constant time lookup.
					constructor(...args) {
						args = args.flatten().filter(e => type(e) === "number");
						super(...args.sort());
					}
					add(number=0) {
						if (type(number) !== "number") return false;
						for (const n of this) if (n === number) return false;
						this.push(number);
						this.sort();
						return true;
					}
					delete(number=0) {
						;
						return this.remove(number);
					}
					has(number=0) {
						;
						return this.incl(number);
					}
					check() {
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
						catch { return false }
					}
					union(set, New=true) {
						if (type(set, 1) !== "set") return false;
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
				this.sqrt5 = 2.23606797749979; this.π_2 = 1.5707963267948966;
				this.Math = Math;
				/*
					G = 6.67m³/(10¹¹ kg s²)
					∑∏Δ×∙÷±∓∀∃∄∤⌈⌉⌊⌋⋯〈〉√∛∜≤≥≠≈≋≍≔≟≡≢≶≷⋚⋛⁽°⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁾∞
					∫∬∭⨌∮∯∰∱∲∳⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚⨛⨜⌀∠∡⦜∢⦝⦞⦟⟂∟∥∦△□▭▱○◊⋄
					→↛⇒⇔⇋⇏⊕⊝∧⋀∨⋁⋂⋃¬∴∵∶∷∼⊨⊽⊻⊯⊮⊭⊬⊫⊪⋎⋏
					ℵƒ∂𝜕ℶℕℝℚℙℤℍℂ∅∁∈∉∋∌∖∩∪⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋⊍⊎⋐⋑⋒⋓⋔⋲⋳⋴⋵⋶⋷⋹⋺⋻⋼⋽⋾
				*/// TODO: Update rMath.help
				if (help) this.help = {
					null: "If a value is null, then you could just directly check what the function does.",
					trig: {
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
					},
					Ω: "Takes 2 arguments.  1: number (x).  2: accuracy. returns Ω where Ωx^Ω = 1",
					ζ: "1 argument. riemann zeta function. summation from 1 to infinity of 1/n^x, where x is the input to the function",
					P: "takes any amount of arguments either in an array, multiple arrays, or directly.  can only use number arguments. returns the set of all subsets of the inputed sets.  if any of the arcuments is \"strict\" then it will return a strict subset (the set itself is not included).",
					expm1: "1 argument. returns e^x - 1",
					log2: "1 argument. base 2 logarithm",
					log10: "1 argument. base 10 logarithm",
					log1p: "1 argument. returns ln(1 + x)",
					clz32: "takes one parameter.  same as original Math.clz32. count leading zeros 32 [bit]",
					clbz: "takes one parameter.  same as original Math.clz32. stands for count leading binary zeros",
					fact: "takes one parameter.  returns the factorial of a number. Also works for floats.",
					sgn: "takes one parameter.  returns the sign of a number.  If input is NaN, returns NaN.  If  input == 0, returns the input.  If the input is positive, returns 1.  If the input is negative, returns -1.",
					abs: "takes one parameter.  returns sign(input) * input, which always returns a positive number or zero.",
					sum: "stands for summation.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to sum each time, in the form of a function that takes in one parameter. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end parameters are inclusive.",
					infsum: "Takes 3 arguments. 1: start.  2: function.  3: increment.  start is defaulted to 0, function is defaulted to n=>1/n, and the increment is defaulted to 1.  Stands for infinite summation.  Will only return an answer if it converges, otherwise it will kepp calculating eternally",
					prod: "stands for product operator.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to multiply by each time, in the form of a function with an input and output. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end parameters are inclusive.",
					gamma: "stands for gamma function. gamma(x) = factorial(x-1).  Takes three parameters.  1: the number to take the gamma function of.  2: accuracy of the function (default is 1000). 3: rest parameter that does nothing.  if the number is an integer returns ifact(n-1). else, it does the integral from 0 to a, of x**(n-1)/𝑒**x.  if this is Infinity, return NaN, otherwise, it returns the answer.",
					igammal: null,
					igammau: null,
					_: "Takes 1 argument. returns 1 / argument",
					inverse: "Takes 1 argument. returns 1 / argument",
					int: "stands for integral.  Takes 4 arguments.  1: starting value (inclusive).  2: ending value (exclusive).  3: what you are taking the integral of, in the form of a function with an input, and an output.  4: rectangle size, or in other words, the accuracy, where smaller is more accurate.  the accuracy is defaulted to 0.001, and it is defaulted to taking the integral of y=x.",
					hypot: "Stands for hypotenuse.  Takes in any amount of parameters, either directly or in one or many array(s).  for each argument, adds the square to the total.  then takes the square root of the total.",
					log: "Takes 3 parameters.  1: number you are taking the logarithm of.  2: base of the logarithm. eg: log(3,6) = log₆(3).  3: number of iterations. the base is defaulted to 10.  The number of iterations is defaulted to 50",
					logbase: "Takes 3 parameters (base, number, number of iterations), returns log(number, base, iterations).  the first parameters flipped. The number of iterations is defaulted to 50",
					ln: "Takes 1 parameter, and returns the natural logarithm of the number.  the same as the original Math.log. returns log(input, 𝑒).",
					max: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the largest number inputed.  Although, if the last parameter is not either a number or a bigint, that value will be returned instead.",
					min: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the smallest number inputed.  Although, if the last parameter is not either a number or a bigint, that value will be returned instead.",
					nthrt: "Takes 2 parameters (x, n).  returns x**(1/n).  the root defaults to 2.",
					mean: "Takes any amount of arguments, either directly or in one or many array(s).  adds up the arguments, and divides by the number of arguments present. and returns the answer.",
					median: "Takes any amount of arguments, either directly or in one or many array(s).  it removes items from the end and beginning until there are either one or two elements remaining. if there is one, it returns it.  if there are two, it returns the average of them.",
					mad: "Stands for mean absolute deviation.  takes any amount of arguments, either directly or in one or many array(s).  gets the mean of the arguments.  then finds the mean of the absolute deviation from the mean.",
					isPrime: "Takes 1 input, and returns true if it is prime, false if it is composite.",
					lmgf: "stands for lcm gcf.  Takes at least two arguments.  if the first argument is equal tp \"lcm\" or \"l\" (lowercase L), it will perform the least common multiple. otherwise,  it will do the greatest common factor.  the rest of the parameters can be inputed either directly, or as one or many arrays.  any arguments that are not numbers or bigInts are ignored, as long as it is not the second argument.",
					linReg: "Takes 3 paramates. finds the line of best fit (y = mx + b), given the x and y coordinates as arrays. 1: x-coordinates.  2: y-coordinates.  3: if this is \"obj\", then it returns an object, otherwise it returns it as a string",
					pascal: "Takes 2 arguments.  1: row.  2: col in row.  if the column is less than 1 or greater than row + 1, it will return NaN. otherwise, if col is not \"all\", it will return nCr(row,col-1). if col is equal to \"all\", it will return an array of all the numbers in that row of pascals triangle.",
					fib: "Stands for fibonacci. returns the fibonacci sequence number of the inputed index.  If floats are inputed, then it will effectively return fib(ceil(input)).  Currently negative indexes are not implemented.  fib(0) returns 0, fib(1) returns 1, fib(2) returns 1, fib(3) returns 2, etc.",
					primeFactorInt: "Takes 1 numberic argument, and returns a list of the prime factors",
					findFactors: "Takes 1 integer argument and finds all integer factors of said integer.",
					iMaxFactor: "Takes 1 integer argument and returns the largest factor of said integer",
					synthDiv: "Takes 2 arguments. 1: coefficients of the variables. 2: the divisor.  the equation should take the form of ax^n + bx^(n-1) + cx^(n-2) + ... + constant",
					simpRad: "Takes 1 integer argument (number under radical) and returns, as a string, the radical in simplified form",
					PythagTriple: "Takes one argument. 1: max size. finds all principle pythagorean triples such that a**2 + b**2 = c**2, a < max size, and b < max size, and a, b, and c are all integers.",
					add: "Takes 4 arguments.  1: a number (a).  2: a number (b).  3:boolean, true returns a number, false returns a string.  4:number, decimal precision. returns a + b with no floating point arithmetic errors. if number is false, it returns a string with the precision of the last argument. a and b default to 0. if precsion is not a number, it becomes infinity.",
					sub: null,
					mul: null,
					div: "Takes 4 arguments.  1:number, numerator.  2:number, denominator.  3:boolean, true returns a number, false returns a string.  4:number, decimal precision.  returns the numerator divided by the denominator with no floating point errors.  numerator defaults to 0, and denominator defaults to 1",
					parity: "Takes any amount of arguments directly, or in an array.  if there is one argument, it will return even or odd as a string.  if there 2 or more arguments, it will return an array of strings.",
					nCr: "Stands for n Choose r. takes 2 arguments. same as python's math.comb()",
					nPr: "Stands for n Permute r. takes 2 arguments.",
					isClose: "Takes 3 arguments. 1: number a. 2: number b.  3: number c. if a third argument is not provided, it will be set to Number.EPSILON (2^-52).  returns true if number a is in range c of number b, otherwise it returns false.",
					complex: "Creates a complex number",
					erf: "Takes one numeric argument \"z\". returns 2/√π ∫(0, z, 1/𝑒^t^2)dt. In mathematics, it is called the \"Gauss error function\"",
					erfc: "Takes 1 numeric argument \"z\". return 1 - erf(z).",
					dist: "Takes 4 arguments: (x1, y1, x2, y2). retrns the distance between the two points",
					copySign: "takes 2 arguments. 1: number to keep the value of (x). 2: number to keep the sign of (y). returns |x|sign(y)",
					trunc: "Takes any amount of parameters, either directly or in one or many array(s).  If there is only one input, it will truncate it, and return it, otherwise, it will return an array of truncated values.",
					isNaN: "Similar to isNaN(). takes one parameter.  if it can be coerced to be a number, it returns false.  the difference is that it returns false for bigints instead of throwing an error.",
					isAN: "Takes one argument.  returns the opposite of rMath.isNaN()",
					imul: "returns the result of the C-like 32-bit multiplication of the two parameters.",
					lcm: "returns the least common multiple of a list of numbers",
					gcf: "retirns the greatest common factor of a list of numbers",
					gcd: "Alternate spelling of gcf",
					fround: "returns the nearest 32-bit single precision float representation of a number.",
					sqrt: "Takes one argument. returns nthrt(arg)",
					cbrt: "Takes one argument.  returns the cube root of the argument.",
					degrees: "Takes 1 argument. 1: angle in radians. converts radians to degrees",
					radians: "Takes 1 argument. 1: angle in degrees. converts degrees to radians",
					ln1p: "Takes one argument.  returns ln(1+arg). the same as original Math.log1p",
					sign: "Alternate spelling for sgn",
					exp: "Takes two arguments (n, x=Math.E).  returns x^n",
					round: "returns round(argument)",
					floor: "returns floor(argument)",
					ceil: "returns ceil(argument)",
					random: "returns a random number in the range [0,1)",
					pow: "Takes two arguments (a,b).  similar to a**b.",
					mod: "Takes two arguments (a,b).  similar to a%b.",
					ifact: "Returns the factorial of a number, and disregards all numbers in decimal places.",
					findPrimes: "Takes two parameters.  1: maximum number of primes to be returned.  2: maximum size (inclusive) for the desired numbers",
					// TODO: Fix li() and li2() documentation
					li: "logarithmic integral version 1",
					li2: "logarithmic integral version 2",
					Li: null,
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
					Tanc : "Takes 1 numeric argument (x) and returns tan(x) / x using radians",
					Coshc: "Takes 1 numeric argument (z) and returns cosh(z) / z",
					H: "Takes 1 argument. Heaveside step function. returns 1 if it is a non-zero positive number, and 0 otherwise.",
					// W: null,
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
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return false;
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
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] > 1*b[i]) return true;
							if (1*a[i] < 1*b[i]) return false;
						}
						return false;
					}, ge(a="0.0", b="0.0") {// >=
						return this.gt(a, b) ||
							this.seq(a, b);
					}, lt(a="0.0", b="0.0") {// <
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) < 0) {
							a = a.substr(1); b = b.substr(1);
							if (this.seq(a, b)) return false;
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
						} if ( a.io(".") - a_index < b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] < 1*b[i]) return true;
							if (1*a[i] > 1*b[i]) return false;
						}
						return false;
					}, le(a="0.0", b="0.0") {/* <= */
						return this.lt(a, b) ||
							this.seq(a, b);
					}, leq(a=0, b=0) { // loose equal to. regular decimal place number
						return Number(a) ===
							Number(b);
					}, seq(a="0.0", b="0.0") {// strict equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return false;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return false;
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
						if ( a.io(".") - a_index !== b.io(".") - b_index ) return false;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] !== 1*b[i]) return false;
						}
						return true;
					}, lneq(a=0, b=0) {// loose not equal to. normal number of decimal places
						return Number(a) !==
							Number(b);
					}, sneq(a="0.0", b="0.0") {// strict not equal to. infinite decimal places
						if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
						a = a.toString(); !a.incl(".") && ( a += ".0" );
						b = b.toString(); !b.incl(".") && ( b += ".0" );
						if (sMath.sgn(a) >= 0 && sMath.sgn(b) < 0) return true;
						if (sMath.sgn(a) < 0 && sMath.sgn(b) >= 0) return true;
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
						} if ( a.io(".") - a_index > b.io(".") - b_index ) return true;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", len(b) - len(a) );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", len(a) - len(b) );
						for (var i = 0, n = len(a); i < n; i++) {
							if (a[i] === ".") continue;
							if (1*a[i] !== 1*b[i]) return true;
						}
						return false;
					},
				}; if (constants) {
					this.ɡ = this.gravity = 9.80665;
					this.avogadro = 6.02214076e+23;
					this.bohrMagneton = 9.2740100783e-24;
					this.bohrRadius = 5.29177210903e-11;
					this.boltzmann = 1.380649e-23;
					this.classicalElectronRadius = 2.8179403262e-15;
					this.deuteronMass = 3.3435830926e-27;
					this.efimovFactor = 22.7;
					this.electronMass = 9.1093837015e-31;
					this.electronicConstant = 8.8541878128e-12;
					this.faraday = 96485.33212331001;
					this.fermiCoupling = 454379605398214.1;
					this.fineStructure = 0.0072973525693;
					this.firstRadiation = 3.7417718521927573e-16;
					this.gasConstant = 8.31446261815324;
					this.inverseConductanceQuantum = 12906.403729652257;
					this.klitzing = 25812.807459304513;
					this.loschmidt = 2.686780111798444e+25;
					this.magneticConstant = 0.00000125663706212;
					this.magneticFluxQuantum = 2.0678338484619295e-15;
					this.molarMass = 0.00099999999965;
					this.molarMassC12 = 0.0119999999958;
					this.molarPlanckConstant = 3.990312712893431e-10;
					this.molarVolume = 0.022413969545014137;
					this.neutronMass = 1.6749271613e-27;
					this.nuclearMagneton = 5.0507837461e-27;
					this.planckCharge = 1.87554603778e-18;
					this.planckConstant = 6.62607015e-34;
					this.planckLength = 1.616255e-35;
					this.planckMass = 2.176435e-8;
					this.planckTemperature = 1.416785e+32;
					this.planckTime = 5.391245e-44;
					this.reducedPlanckConstant = 1.0545718176461565e-34;
					this.rydberg = 10973731.56816;
					this.sackurTetrode = -1.16487052358;
					this.secondRadiation = 0.014387768775039337;
					this.speedOfLight = this.c = 299792458;
					this.stefanBoltzmann = 5.67037441918443e-8;
					this.weakMixingAngle = 0.2229;
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
				var strict = false;
				if (set.incl("strict")) {
					set.remove("strict");
					strict = true;
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
						e => e.split(",").map(e => 1*e).sort()
					).map( e => e.sort().join() ).remrep().map( // double check is required
						e => e.split(",").map(e => 1*e).sort()
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
				// TODO: Fix for negative numbers
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
			} log(n, base, acy=50) {
				base = base == null ? MATH_LOG_DEFAULT_BASE : base;
				if (isNaN( n = Number(n) )) return NaN;
				if (isNaN( base = Number(base) )) return NaN;
				if (isNaN( acy = Number(acy) )) acy = 50;
				if (base === Infinity) return n === Infinity ? NaN : 0;
				if (base <= 0 || n <= 0 || base === 1 || isNaN(n)) return NaN;
				if (n === Infinity) return Infinity;
				if (base === n) return 1;
				if (n === 1) return 0;
				for (var pow = 1, notClosestInt = !0, tmp, frac = 1, i = acy; notClosestInt ;) {
					tmp = this.abs(n - base ** pow);
					tmp > this.abs(n - base ** (pow + 1)) ?
						++pow :
						tmp > this.abs(n - base ** (pow - 1)) ?
							--pow :
							notClosestInt = !1;
				}
				while ( i --> 0 ) {
					tmp = this.abs( n - base ** pow );
					tmp > this.abs( n - base ** (pow + (frac /= 2)) ) ?
						pow += frac :
						tmp > this.abs( n - base ** (pow - frac) ) && (pow -= frac);
				}
				return pow;
			} logbase(base, n, acy=50) {
				return isNaN( base = Number(base) ) ||
				isNaN( n = Number(n) ) ||
				isNaN( acy = Number(acy) ) ?
					NaN :
					this.log( n, base, acy );
			} ln(n, acy=50) {
				return isNaN( n = Number(n) ) ||
					isNaN( acy = Number(acy) ) ?
					NaN : this.log( n, 𝑒, acy );
			} max(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				let max = ns[0];
				for (let i of ns) max = i > max ? i : max;
				return max;
			} min(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				let min = ns[0];
				for (let i of ns) min = i < min ? i : min;
				return min;
			} mean(...ns) {
				ns = ns.flatten();
				if ( ns.isNaN() ) return NaN;
				return ns.reduce( (t, n) => t + n, 0 ) / len(ns);
			} median(...ns) {
				if ( ns.isNaN() ) return NaN;
				for (ns = ns.flatten().sort(); len(ns) > 2 ;)
					ns.pop2().shift();
				return len(ns) === 1 ? ns[0] : (ns[0] + ns[1]) / 2
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
			} lmgf(t="lcm", ...ns) {
				// least commond multiple and greatest common factor
				ns = ns.flatten();
				type(t) !== "string" && (t = "lcm");
				if ( ns.isNaN() ) return NaN;
				ns = ns.map(b => this.abs( int(b) ));
				for (let c, i = t[0] === "l" ? this.max(ns) : this.min(ns); ; t[0] === "l" ? i++ : i-- ) {
					for (let j = len(ns) - 1; j >= 0; --j) {
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
						) {
							triples.push([a, b, c]);
						}
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
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				if ( isNaN(precision) ) precision = Infinity;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
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
					o => o[0].map( (e, i) => 1*e + 1*o[1][i] )
				);
				for (var i = 2; i --> 0 ;) {
					for (var j = len(c[i]), tmp; j --> 0 ;) {
						tmp = floor( c[i][j] / 10 );
						c[i][j] -= 10*tmp;
						if (tmp) {
							if (j) c[i][j-1] += tmp;
							else i === 1 ? c[0][len(c[0]) - 1] += tmp : c[i].unshift(tmp);
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
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				if ( isNaN(precision) ) precision = Infinity;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
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
					o => o[0].map( (e, i) => 1*e - 1*o[1][i] )
				), neg = c[0][0] < 0;
				for (var i = 2, j, tmp; i --> 0 ;) { // c[1] then c[0]
				for (j = len( c[i] ) ; j --> 0 ;) { // for each element in c[i]
						tmp = this.abs( floor(c[i][j] / 10) );
						while (c[i][j] < 0) {
							i + j && (c[i][j] += 10);
							if (j) c[i][j-1] -= tmp;
							else if (i === 1) c[0][len(c[0]) - 1] -= tmp;
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
				// TODO: Might still be broken
				type(a) === "bigint" && (a = Number(a)); type(b) === "bigint" && (b = Number(b));
				if (this.isNaN(a) || this.isNaN(b)) return NaN;
				a = numStrNorm( a.toString() ); b = numStrNorm( b.toString() );
				const sign = this.ssgn(a) === this.ssgn(b) ? 1 : -1;
				a = this.sabs(a); b = this.sabs(b);
				if (this.eq.seq(a, 0) || this.eq.seq(b, 0)) return number ? 0 : "0.0";

				a = a.remove(/\.?0+$/g); b = b.remove(/\.?0+$/g);
				var dec = 0;
				a.io(".") > 0 && (dec += len(a) - a.io(".") - 1);
				b.io(".") > 0 && (dec += len(b) - b.io(".") - 1);
				a = a.remove("."); b = b.remove(".");
				for (var i = len(b), arr = [], carryover, tmp, str, j; i --> 0 ;) {
					for (j = len(a), str = "", carryover = 0; j --> 0 ;) {
						tmp = (multable[ b[i] ][ a[j] ] + carryover).toString();
						carryover = dim(tmp) ? Number(tmp[0]) : 0;
						tmp = Number( tmp[dim(tmp)] );
						str = tmp + str;
						!j && carryover && (str = carryover + str);
					}
					arr.push(str);
				}
				for (var i = len(arr); i --> 0 ;) arr[i] += strMul("0", i);
				for (var total = "0.0", i = len(arr); i --> 0 ;)
					total = this.add(arr[i], total, false, precision)
						.remove(/\.0+$/);
				total = (total.substr(0, len(total) - dec) + "." + total.substr(len(total) - dec)).replace(/\.$/, ".0");
				return sign === -1 ?
					this.neg( total , number ) :
					number ? Number(total) : total;
			} div(num="0.0", denom="1.0", number=true, precision=18) {
				// NOTE: Will probably break the denominator is "-0"
				type(num) === "bigint" && (num = `${num}`); type(denom) === "bigint" && (denom = `${denom}`);
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				isNaN(precision) && (precision = 18);
				if ( this.eq.seq(denom, 0) )
					return this.eq.seq(num, 0) ?
						NaN :
						Infinity;
				if ( this.eq.seq(num, 0) )
					return number ?
						0 :
						"0.0";
				num = numStrNorm( num.toString() ); denom = numStrNorm( denom.toString() );
				const sign = this.ssgn(num) * this.ssgn(denom);
				num = this.sabs(num); denom = this.sabs(denom);
				while (this.eq.sneq(fpart(num, false), 0)) {
					num = this.mul(num, 10, false);
					denom = this.mul(num, 10, false);
				} while (this.eq.sneq(fpart(denom, false), 0)) {
					num = this.mul(num, 10, false);
					denom = this.mul(num, 10, false);
				}
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom, false);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while (this.eq.ge(tmp3 = this.sub(tmp1, tmp2, false), 0)) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision === 0) return `${ansString}.0`;
				var remainder = this.mul(
					this.sub(num, this.mul(ans, denom, false), false),
					"10.0", false
				);
				if (this.eq.sneq(remainder, 0)) ansString += ".";
				for (var i = 0, j; this.eq.sneq(remainder, 0) && i++ < precision ;) {
					for (j = 9; this.eq.lt(this.sub(remainder, table[j], false), 0) ;) j--;
					remainder = this.mul(
						this.sub(remainder, table[j], false),
						"10.0", false
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
			} comb(m, k) {
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
			} isNNaN(e) {
				// is not not a number
				return this.isAN(e);
			} isaN(e) {
				// is a number
				return this.isAN(e);
			} imul(a, b) {
				return isNaN( a = Number(a) ) ||
					isNaN( b = Number(b) ) ?
						NaN :
						this.Math.imul(a, b);
			} lcm(...ns) {
				return ns.isNaN() ?
					NaN :
					this.lmgf("lcm", ns);
			} gcf(...ns) {
				return ns.isNaN() ?
					NaN :
					this.lmgf("gcf", ns);
			} gcd(...ns) {
				return ns.isNaN() ?
					NaN :
					this.lmgf("gcd", ns);
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
			} exp(n, x) {
				return isNaN( n = Number(n) ) ||
					isNaN( x = Number(x) ) ?
					NaN :
					(x === void 0 ? 𝑒 : x) ** n;
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
			} nthrt(x, rt=2, acy=100) {
				if (isNaN( x = Number(x) )) return NaN;
				if (isNaN( rt = Number(rt) )) return NaN;
				if (rt < 0) return this.pow(x, rt);
				if (!rt || !(rt % 2) && x < 0) return NaN;
				if (!x) return 0;
				if (isNaN( acy = Number(acy) )) return NaN;
				for (var pow, cur = x, i = 0; pow !== cur && i < acy; i++) {
					pow = cur;
					cur = ((rt - 1) * pow**rt + x) / (rt * pow**(rt - 1));
				}
				return cur;
			} square(n) {
				if (isNaN( n = Number(n) )) return NaN;
				return n ** 2;
			} cube(n) {
				if (isNaN( n = Number(n) )) return NaN;
				return n ** 3;
			} ifact(n) {
				// TODO: Fix for negative numbers
				if (isNaN( n = Number(n) )) return NaN;
				if (!n) return 1;
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
					Switch: false,
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
				if (flipArgs) return this.atan2(y, x, false);
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
				return Number(x > 0);
			} W(x) {
				// TODO: Implement Lambert W function
				// Lambert W function, product log
				if (isNaN( x = Number(x) )) return NaN;
				if (x < -1 / e) return NaN;
			} deriv(f=x=>2*x+1, x=1, dx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used.
					const VARIABLE = f.slc(0, ":", 0, -1).remove(/\s+/g);
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
					const VARIABLE = f.slc(0, ":", 0, -1).remove(/\s+/g);
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
				if (/^cos\d+x$/.test(str)) str = `cos(${str.match(/\d+/)[0]}x)`;

				for (var tmp; /\(\d+x\)/.test(str) ;) {
				    str = str.replace(/\(-?1x\)/g, "(x)");
					str = str.replace(/cos\(-?0x\)/g, "1");
					tmp = /cos\((\d+)x\)/.exec(str);
					if (tmp[1])str = str.replace(/cos\((\d+)x\)/, `[2cosxcos(${tmp[1]*1-1}x)-cos(${tmp[1]*1-2}x)]`);
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
			} tempConv(value=0, startSystem="fahrenheit", endSystem=void 0) {
				// temperature converter
				if (this.isNaN(value)) return NaN;
				if (type(startSystem) !== "string") return NaN;
				if (type(endSystem) !== "string") return NaN;
				endSystem === void 0 && (endSystem = MATH_DEFAULT_END_TEMPERATURE_SYSTEM);
				startSystem.lower() === "celcius"       && (startSystem = "c");
				startSystem.lower() === "fahrenheit"    && (startSystem = "f");
				startSystem.lower() === "kelvin"        && (startSystem = "k");
				/ra(nkine)?/i.test(startSystem.lower()) && (startSystem = "r");
				endSystem  .lower() === "celcius"       && (endSystem   = "c");
				endSystem  .lower() === "fahrenheit"    && (endSystem   = "f");
				endSystem  .lower() === "kelvin"        && (endSystem   = "k");
				/ra(nkine)?/i.test(endSystem  .lower()) && (endSystem   = "r");
				startSystem = startSystem.lower(); endSystem = endSystem.lower();
				if (startSystem === endSystem) return value;
				if (startSystem === "c") {
					switch (endSystem) {
						case "f": return 1.8*value + 32;
						case "k": return x + 273.15;
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
						false :
						set2 :
					type(set2, 1) !== "set" ?
						set1 :
						len(set1) >= len(set2) ?
							set1.union( set2, false ) :
							set2.union( set1, false );
			} piApprox(max=1) {
				const C = '42698670.666333395817712889160659608273320884002509082800838007178852605157457594216301799911455668601345737167494080411392292736181266728193136882170582563460066798766483460795735983552333985484854583276247377491250754585032578219745675991212400392015323321276835446296485837355697306012123458758049143216640427423547978510448221162836911053807235838159872646304853335987865686269706977445355835599133539678641902312391523829877481108898664622249006021331236404750043178521385802944662855665612876640849908660806684778002991357625433646133139055099023131780968145833996701200122389012154421724362284068629329420050521419015939092569907194340029444433951848629766397465505895098872676970688044372715257280235227382872383401509275515634457705197803145721985414408323372552767448562562388318221196367736544745016258054251434084686038802841060911418502815704983841331432095161566844429229281236234645670268734321517159131712143438348676514584576378735574108814073595022482261786305917060682396330756892805473449402143277237931963516369435685352365092484541942462092883877763497113840189835579188041015469199214591024464903812082236674251398135427633950703414918564398535902451835963329225993094620996776194600147027518785996432474421327664632559849828968208314238939908213288668864505307989237416790602042952155002363560107213852002818389447886529373647927435261622722659693610242183125434324402807272654881841337046021962005588671753995076464157748420706705788081555586601814528305826561147446525072540899979985469021440538232652735986871049579313454125256756946817498547980109520705620147393364518915878961023099880380883220356686938001604251001097944277105210370465860016431253036935588532610954757711019149238441320499873270033926280773104106978137183054470529244857536182559624515180184010151683243473408729742661899059223630893035500823027679849232721173165309525717280482325139339840211758636278297842552703166603606422904201823794913202045464937402255689393016703066065957563645962943734140254955172545497921577727315867693791497225501164635912351343416452812552266016504250267265';
				const M = q => sMath.div(
						sMath.ifact( sMath.mul(6, q) ),
						sMath.mul(
							sMath.ifact( sMath.mul(3, q) ),
							sMath.cube( sMath.ifact(q) )
						)
					);
				const L = q => sMath.add( sMath.mul("545140134", q), "13591409" );
				const X = q => sMath.ipow("-262537412640768000", q);
			}
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
			// cumulative sum of list
			// line intersection
			// scalar operations
			// eigs
			// fix (round towards zero)
			// matrix identity thing
			// inverse of matrix
			// Kullback-Leibler (KL) divergence  between two distributions.
			// kronecker product of 2 matrices or vectors.
			// nthrts
			// compareText
			// coulomb
			// electrical things
			// norm
		})(
			rMath_DegTrig_Argument,
			rMath_Help_Argument,
			rMath_Comparatives_Argument,
			rMath_Constants_Argument
		); this.bMath = new (class BigIntRealMath {
			constructor(help="default") {
				help === "default" && (help = true);

				if (help) this.help = {
				};
			}
			method() {}
		})(bMath_Help_Argument);
		this.cMath = new (class ComplexMath {
			constructor(degTrig="default", help="default") {
				degTrig === "default" && (degTrig = true);
				help === "default" && (help = true);
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
						return form === "degrees" || form === "deg" || form === "degree" ?
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

						const r = (this.re**2+this.im**2) ** (num.re/2) / Math.E ** ( num.im*this.arg(this) ),
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
						const r = Math.E ** this.re;
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
			add(...zs) {
				zs = zs.flatten().map(e =>
					type(e) === "number" ? this.new(e, 0) : e
				).filter(e => type(e, 1) === "complex");
				let re = 0, im = 0;
				for (const z of zs) {
					re += z.re;
					im += z.im;
				}
				return this.new(re, im);
			}
			sub(...zs) {
				zs = zs.flatten().map(e =>
					type(e) === "number" ? this.new(e, 0) : e
				).filter(e => type(e, 1) === "complex");
				let re = zs[0].re, im = zs[0].im;
				zs = zs.slc(1);
				for (const z of zs) {
					re -= z.re;
					im -= z.im;
				}
				return this.new(re, im);
			}
			mul(...zs)  {
				zs = zs.flatten().map(e =>
					type(e) === "number" ? this.new(e, 0) : e
				).filter(e => type(e, 1) === "complex");

				for (var i = len(zs), n1, n2 = zs.pop(); i --> 1 ;) {
					n1 = zs.pop();
					n2 = this.new(n1.re*n2.re - n1.im*n2.im, n1.re*n2.im + n2.re*n1.im);
				}
				return n2;
			}
			div(...zs) {
				zs = zs.flatten().map(e =>
					type(e) === "number" ? this.new(e, 0) : e
				).filter(e => type(e, 1) === "complex");

				for (var i = len(zs), n1, n2 = zs.pop(); i --> 1;) {
					n1 = zs.pop();
					n2 = this.new(
						(n1.re*n2.re + n1.im*n2.im) / (n2.re**2 + n2.im**2),
						(n1.im*n2.re - n1.re*n2.im) / (n2.re**2 + n2.im**2)
					);
				}
				return n2;
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
				// ln(a + bi) = ln(sqrt(a^2 + b^2)) + i arg(a + bi)
			}
			log(z, base=null, n=0) {
				type(z) === "number" && (z = this.new(z, 0));
				type(base) === "number" && (base = this.new(base, 0));
				if (base === null) return this.ln(z, n);
				if (type(z, 1) !== "complex") throw TypeError("Invalid first argument");
				if (type(base, 1) !== "complex") throw TypeError("Invalid second argument");
				return this.ln(z, n).div( this.ln(base, n) );
				// log_(a+bi)(c+di) = ln(c+di) / ln(a+bi)
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

				const r = (z1.re**2 + z1.im**2) ** (z2.re / 2)  /  Math.E ** ( z2.im*this.arg(z1, n) ),
					θ = z2.re*this.arg(z1, n) + z2.im*rMath.ln(this.abs(z1))
				//re^iθ = rcosθ + risinθ
				return this.new(r*rMath.cos(θ), r*rMath.sin(θ));
			}
			exp(z) {
				type(z) === "number" && (z = this.new(z, 0));
				const r = Math.E ** z.re;
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
				if (type(z, 1) === "num") z = this.new(z, 0);
				if (type(z, 1) !== "complex") throw TypeError("cMath.isPrime() requires a complex argument");

			}
		})(
			cMath_DegTrig_Argument,
			cMath_Help_Argument
		); this.fMath = new (class fractionalRealMath {
			constructor(help="default") {
				help === "default" && (help = true);
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
				};
			}
			// do something about non-numbers and 0 denominators
			fraction(numerator=0, denominator=0) { return new this.Fraction(numerator, denominator) }
			new(numerator=0, denominator=0) { return new this.Fraction(numerator, denominator) }
			simplify(fraction) {
				["number", "bigint", "string"].incl(type(fraction)) && (fraction = this.new(fraction, 1));
				if (type(fraction, 1) !== "fraction") return NaN;
				if (!["number", "bigint", "string"].incl(type(fraction.numer)) || rMath.isNaN(fraction.numer)) return NaN;
				if (!["number", "bigint", "string"].incl(type(fraction.denom)) || rMath.isNaN(fraction.denom)) return NaN;
				if (type(fraction, 1) !== "fraction") fraction = this.new(fraction, 1);
				var gcd = rMath.gcd(fraction.numer, fraction.denom);
				fraction.numer = window[type(fraction.numer).upper(1)](rMath.div(fraction.numer, gcd));
				fraction.denom = window[type(fraction.denom).upper(1)](rMath.div(fraction.denom, gcd));
				return fraction;
			}
			simp(frac) { return this.simplify(frac) }
		})(fMath_Help_Argument);
		this.aMath = new (class AllMath {
			// aMath will call the correct function based upon the input
			constructor(help="default") {
				help === "default" && (help = true);
				// constants

				if (help) this.help = {
				};
			}
		})(aMath_Help_Argument);
		this.MathObjects = {
			aMath: aMath, bMath: bMath, cMath: cMath,
			fMath: fMath, sMath: sMath, rMath: rMath,
		}; this.Logic = new (class Logic {
			constructor(bitwise, comparatives, help) {
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
								for (; len(e) < maxlen ;) e = `0${e}`;
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
								output += Number(bits[str_i]).inRange(range[0], range[1]) ? 1 : 0;

							return `0b${output}` * 1;
						},

						nxor: function xnor(a, b) {
							return this.not(

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
				if (json.stringify(a = a.flatten()) === "[]") 
					return !1;
				for (var i = len(a) - 1; i >= 0; --i) {
					if (a[i] == !1) return !1;
				}
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
				for (var i = len(a) - 1; i >= 0; --i) {
					if (a[i] == !0) return !0;
				}
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
				return len(a.filter(b => b == true)) == len(a) % 2 > 0
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
				for (var i = len(a) - 1; i >= 0; --i) {
					if (a[i] !== a[0]) return !1;
				}
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
		})(
			Logic_BitWise_Argument,
			Logic_Comparatives_Argument,
			Logic_Help_Argument
		); aMath.aMath = aMath; aMath.bMath = bMath; aMath.cMath = cMath; aMath.fMath = fMath;
			aMath.sMath = sMath; aMath.rMath = rMath; bMath.aMath = aMath; bMath.bMath = bMath;
			bMath.cMath = cMath; bMath.fMath = fMath; bMath.sMath = sMath; bMath.rMath = rMath;
			cMath.aMath = aMath; cMath.bMath = bMath; cMath.cMath = cMath; cMath.fMath = fMath;
			cMath.sMath = sMath; cMath.rMath = rMath; fMath.aMath = aMath; fMath.bMath = bMath;
			fMath.cMath = cMath; fMath.fMath = fMath; fMath.sMath = sMath; fMath.rMath = rMath;
			sMath.aMath = aMath; sMath.bMath = bMath; sMath.cMath = cMath; sMath.fMath = fMath;
			sMath.sMath = sMath; sMath.rMath = rMath; rMath.aMath = aMath; rMath.bMath = bMath;
			rMath.cMath = cMath; rMath.fMath = fMath; rMath.sMath = sMath; rMath.rMath = rMath;
		this[Output_Math_Variable] = rMath;
	} {// Prototypes
		// NOTE: Maximum Array length allowed: 4,294,967,295 (2^32 - 1)
		// NOTE: Maximum BigInt value allowed: 2^1,073,741,823
		function lastElement() {
			const A = this.valueOf();
			return A[len(A) - 1];
		}; this.jQuery && (jQuery.prototype.for = Array.prototype.for);
		NodeList.prototype.last = lastElement
		,  HTMLCollection.prototype.last = lastElement
		,  Object.prototype.tofar = function toFlatArray() {
			// TODO: Fix for 'Arguments' objects and HTML elements
			var val = this.valueOf();
			if (
				["number", "string", "symbol", "boolean", "bigint", "function"].incl(type(val)) ||
				val == null ||
				val?.constructor == 'function Object() { [native code] }'
			)
				return [this.valueOf()].flatten();
			return list(this.valueOf()).flatten();
		}, Object.copy = copy
		,  Object.keyof = function keyof(obj, value) {
			for (const key of Object.keys(obj)) {
				if (obj[key] === value) return key;
			}
			return null;
		}, HTMLElement.prototype.ael = HTMLElement.prototype.addEventListener
		,  HTMLElement.prototype.rel = HTMLElement.prototype.removeEventListener
		,  RegExp.prototype.in = RegExp.prototype.test
		,  RegExp.prototype.toRegex = function toRegex() {
			return this.
				valueOf();
		}, RegExp.prototype.all = function all(str="") {
			var a = `${this.valueOf()}`;
			return RegExp(`^${a.substr(1, dim(a, 2))}$`).test(str);
		}, Array.prototype.io = Array.prototype.indexOf
		,  Array.prototype.rev = Array.prototype.reverse
		,  Array.prototype.lio = Array.prototype.lastIndexOf
		,  Array.prototype.incl = Array.prototype.includes
		,  Array.prototype.last = lastElement
		,  Array.prototype.sortOld = Array.prototype.sort
		,  Array.prototype.for = function forEachReturn(func, ret) {
			for (var a = this.valueOf(), i = 0, n = len(a); i < n ;) func(a[i], i++, a);
			return ret;
		}, Array.prototype.shift2 = function shift2(num=1) {
			let a = this.valueOf();
			for (var i = 0; i++ < num;)
				[].shift.call(a);
			return a;
		}, Array.prototype.pop2 = function pop2(num=1) {
			let a = this.valueOf();
			for (var i = 0; i++ < num;)
				[].pop.call(a);
			return a;
		}, Array.prototype.splice2 = function splice2(a, b, ...c) {
			var d = this.valueOf();
			d.splice(a, b);
			return c.flatten().for((e, i) => d.splice(a + i, 0, e), d);
		}, Array.prototype.push2 = function push2(e, ...i) {
			// TODO: Finish implementing pushing multiple values for other methods
			let a = this.valueOf(), j, n;
			i = i.tofar();
			if (e === void 0) {
				for (j = 0, n = len(i); j < n; j++) {
					if (type(i[j], 1) === "num") a.push(a[i[j]]);
				}
			}
			else {
				if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.push(void 0);
				else a.push(e);
				for (j = 0, n = len(i); j < n; j++)
					a.push(i[j]);
			}
			return a;
		}, Array.prototype.unshift2 = function unshift2(e, ...i) {
			let a = this.valueOf(), j, n;
			i = i.tofar();
			if (e === void 0) {
				for (j = 0, n = len(i); j < n; j++) {
					if (type(i[j], 1) === "num") a.unshift(a[i[j]]);
				}
			}
			else {
				if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.unshift(void 0);
				else a.unshift(e);
				for (j = 0, n = len(i); j < n; j++)
					a.unshift(i[j]);
			}
			return a;
		}, Array.prototype.toLList = function toLinkedList() {
			let a = new LinkedList(), b = this.valueOf().reverse();
			for (let i of b) a.insertFirst(i);
			return a;
		}, Array.prototype.remove = function remove(e) {
			var a = this.valueOf();
			a.incl(e) && a.splice(a.io(e), 1);
			return a;
		}, Array.prototype.removeAll = function removeAll(e) {
			var a = this.valueOf();
			while ( a.incl(e) )
				a.splice( a.io(e), 1 );
			return a;
		}, Array.prototype.hasDupes = function hasDuplicates() {
			for (var a = copy(this.valueOf()), i = len(a); i --> 0 ;) {
				if (a.incl(a.pop())) return true;
			}
			return false;
		}, Array.prototype.mod = function modify(indexes, func) {
			indexes = indexes.tofar();
			let a = this.valueOf(), n = len(indexes);
			if (type(func, 1) === "arr") func = func.flatten();
			else func = [].len(n).fill(func);
			func = func.extend(len(indexes) - len(func), e => e);

			for (var i = 0; i < n; i++)
				a[indexes[i]] = func[i](a[indexes[i]], indexes[i]);
			return a;
		}, Array.prototype.remrep = function removeRepeats() {
			return Array.from(
				new Set( this.valueOf() )
			);
		}, Array.prototype.rand = function random() {
			var a = this.valueOf();
			return a[ randint(0, dim(a)) ];
		}, Array.prototype.slc = function slice(start=0, end=Infinity) {
			for (var a = this.valueOf(), b = [], i = 0, n = len(a); i < n && i <= end; i++)
				i >= start && b.push( a[i] );
			return b;
		}, Array.prototype.print = function print() {
			let a = this.valueOf();
			console.log(a);
			return a;
		}, Array.prototype.swap = function swap(i1=0, i2=1) {
			const A = this.valueOf(), B = A[i1];
			A[i1] = A[i2];
			A[i2] = B;
			return A;
		}, Array.prototype.smap = function setMap(f=(e, i, a)=>e) {
			// array.smap also counts empty indexes as existing unlike array.map.
			for (var arr = this.valueOf(), i = len(arr); i --> 0 ;)
				arr[i] = f(arr[i], i, arr);
			return arr;
		}, Array.prototype.rotr3 = function rotate3itemsRight(i1=0, i2=1, i3=2) {
			const A = this.valueOf(), TMP = A[i1];
			A[i1] = A[i3];
			A[i3] = A[i2];
			A[i2] = TMP;
			return A;
		}, Array.prototype.dupf = function duplicateFromFirst(num=1, newindex=0) {
			return this.valueOf().dup(
				num, 0, newindex
			);
		}, Array.prototype.duptf = function duplicateToFirst(num=1, index=0) {
			return this.valueOf().dup(
				num, index, 0
			);
		}, Array.prototype.dupl = function duplicateFromLast(num=1, newindex=0) {
			var a = this.valueOf();
			return a.dup(num, len(a)-1, newindex);
		}, Array.prototype.duptl = function duplicateToLast(num=1, index=0) {
			var a = this.valueOf();
			return a.dup(num, index, len(a)-1);
		}, Array.prototype.dup = function duplicate(num=1, from=null, newindex=Infinity) {
			// by default duplicates the last element in the array
			var a = this.valueOf();
			for (var b = a[from === null ? len(a)-1 : from], j = 0; j++ < num;)
				a.splice(newindex, 0, b);
			return a;
		}, Array.prototype.rotr = function rotateRight(num=1) {
			var a = this.valueOf();
			for (num %= len(a); num --> 0;)
				a.unshift(a.pop());
			return a;
		}, Array.prototype.rotl = function rotateRight(num=1) {
			var a = this.valueOf();
			for (num %= len(a); num --> 0;)
				a.push(a.shift());
			return a;
		}, Array.prototype.rotl3 = function rotate3itemsLeft(i1=0, i2=1, i3=2) {
			var a = this.valueOf(), b = a[i1];
			a[i1] = a[i2];
			a[i2] = a[i3];
			a[i3] = b;
			return a;
		}, Array.prototype.len = function setLength(num) {
			var a = this.valueOf();
			a.length = num > 0 ? num : 0;
			return a;
		}, Array.prototype.extend = function extend(length, filler, form="new") {
			var a = this.valueOf();
			if (form === "new") return a.concat([].len(length).fill(filler));
			else if (form === "total") {
				if (length <= len(a)) return a;
				else return a.concat([].len(length).fill(filler));
			}
			else return a;
		}, Array.prototype.startsW = function startsWith(item) {
			return this.valueOf()[0] ===
			item;
		}, Array.prototype.endsW = function endsWith(item) {
			return this.valueOf().last() ===
				item;
		}, Array.prototype.flatten = function flatten() {
			return this.valueOf().flat(
				Infinity
			);
		}, Array.prototype.sort = function sort() {
			var list = this.valueOf();
			if (rMath.isNaN(list.join(""))) return list.sortOld();
			for (var output = []; len(list) > 0;) {
				output.push(rMath.min(list));
				list.splice(list.io(rMath.min(list)), 1);
			} return output;
		}, Array.prototype.shuffle = function shuffle(times=1) {
			var arr = this.valueOf();
			for (var i = 0; i < times; i++)
				for (var j = 0, n = len(arr), arr2 = []; j < n; j++)
					arr2.splice(round(rand() * len(arr2)), 0, arr.pop());
			return arr2;
		}, Array.prototype.isNaN = function isNaN(strict=false) {
			const fn = strict ? window.isNaN : rMath.isNaN;
			for (const val of this)
				if (fn(val)) return !0;
			return !1;
		}, Array.prototype.clear = function clear() {
			this.valueOf()
				.length = 0;
		}, String.prototype.io = String.prototype.indexOf
		,  String.prototype.lio = String.prototype.lastIndexOf
		,  String.prototype.startsW = String.prototype.startsWith
		,  String.prototype.endsW = String.prototype.endsWith
		,  String.prototype.strip = String.prototype.trim
		,  String.prototype.lstrip = String.prototype.trimLeft
		,  String.prototype.rstrip = String.prototype.trimRight
		,  String.prototype.slc = function slc(start=0, end=Infinity, startOffset=0, endOffset=0, substr=false, includeEnd=true) {
			var a = this.valueOf();
			if (type(start) === "string") start = a.io(start);
			if (type(end) === "string") end = a.io(end);
			return Array.from(a).slc(
				start + startOffset,
				end + endOffset
			).join("");
		}, String.prototype.tag = function tag(tagName="") {
			var a = this.valueOf();
			if (type(tagName, 1) !== "str" || tagName === "") return a;
			return `<${tagName}>${a}</${tagName}>`;
		}, String.prototype.rand = function random() {
			return Array.prototype.rand.call(
				this.valueOf()
			);
		}, String.prototype.upper = function upper(length=Infinity, start=0, end=-1) {
			var a = this.valueOf(), str = "";
			return !isFinite(Number(length)) || isNaN(length) ? a.toUpperCase() :
			end === -1 ?
				a.substr(0, start) +
					a.substr(start, length).toUpperCase() +
					a.substr(start + length) :
				a.substring(0, start) +
					a.substring(start, end).toUpperCase() +
					a.substring(end);
		}, String.prototype.lower = function lower(length=Infinity, start=0, end=-1) {
			var a = this.valueOf(), str = "";
			return !isFinite(Number(length)) || isNaN(length) ? a.toLowerCase() :
			end === -1 ?
				a.substr(0, start) +
					a.substr(start, length).toLowerCase() +
					a.substr(start + length) :
				a.substring(0, start) +
					a.substring(start, end).toLowerCase() +
					a.substring(end);
		}, String.prototype.toObj = function toObj(obj=window) {
			this.valueOf().split(/[.[\]'"]/).filter(e=>e).for(e => obj=obj[e]);
			return obj;
		}, String.prototype.hasDupesA = function hasDuplicatesAll() {
			return/(.)\1+/.test(
				this.valueOf().split("").sort().join("")
			);
		}, String.prototype.hasDupesL = function hasDuplicateLetters() {
			return/(\w)\1+/.test(
				this.valueOf().split("").sort().join("")
			);
		}, String.prototype.reverse = function reverse() {
			return this.valueOf().split("").
			reverse().join("");
		}, String.prototype.remove = function remove(arg) {
			return this.valueOf().replace(
				arg, ""
			);
		}, String.prototype.remrep = function removeRepeats() {
			return Array.from(
				new Set( this.valueOf() )
			).join("");
		}, String.prototype.each = function putArgBetweenEachCharacter(arg="") {
			return Array.from(
				this.valueOf()
			).join(`${arg}`);
		}, String.prototype.toFunc = function toNamedFunction(name="anonymous") {
			var s = this.valueOf();
			if (s.substring(0,7) === "Symbol(" && s.substring(len(s) - 1) === ")") throw Error("Can't parse Symbol().");
			s = (""+s).replace(/^(\s*function\s*\w*\s*\(\s*)/,"");
			var args = s.substring(0, s.io(")"));
			return (
				(fn, name) => (new Function(
					`return function(call){return function ${name}() { return call (this, arguments) }}`
				)())(Function.apply.bind(fn))
			)(new Function(args, s.replace(
				new RegExp(`^(${(z=>{
					for (var i=0, l=len(z), g=""; i<l; ++i) g += (/[$^()+*|[\]{}?.]/.test(z[i]) && "\\") + z[i];
					return g;
			})(args)}\\)\\s*\\{)`,"g"), "").replace(/\s*;*\s*}\s*;*\s*/, "")), name);
		}, String.prototype.toFun = function toNamelessFunction() {
			return (
				(...a) => () => a[0](this, a)
			)(
				Function.apply.bind( new Function(this.valueOf()) )
			);
		}, String.prototype.toRegex = function toRegularExpression(f="", form="escaped") {
			var a = this.valueOf();
			if (form === "escaped" || form === "excape" || form === "e")
				for (var i = 0, b = "", l = len(a); i < l; i++)
					b += /[$^()+*\\|[\]{}?.]/.in(a[i]) ?
						`\\${a[i]}` :
						a[i];
			else return new RegExp(a, f);
			return new RegExp(b, f);
		}, String.prototype.toNumber = String.prototype.toNum = function toNumber() {
			return 1 *
				this.valueOf();
		}, String.prototype.toBigInt = function toBigInt() {
			let a = this.valueOf();
			try { return BigInt(a) }
			catch { throw TypeError(`Cannot convert input to BigInt. input: '${a}'`) }
		}, String.prototype.pop2 = function pop2() {
			var s = this.valueOf();
			return s.substring(0, s.length - 1);
		}, String.prototype.unescape = function unescape() {
			return this.valueOf().split("").map(
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
			return input.toRegex().in(
				this.valueOf()
			);
		}, String.prototype.start = function start(start="") { // if the string is empty it becomes the argument
			return this.valueOf() ||
				`${start}`;
		}, String.prototype.begin = function begin(text="") { // basically Array.unshift2
			return `${text}${
				this.valueOf()
			}`;
		}, String.prototype.splitn = function splitNTimes(input, times=1, joinUsingInput=true, customJoiner="") {
			var joiner = joinUsingInput ? input : customJoiner;
			assert(type(input, 1) === "regex" || type(input, 1) === "str", "function requires a regular expression or a string");
			for (var i = 0, arr = this.valueOf().split(input), arr2 = [], n = len(arr); i < n && i < times; i++)
				arr2.push(arr.shift());
			if (len(arr)) arr2.push(arr.join(joiner));
			return arr2;
		}, String.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			return isNaN(this.valueOf()) ?
				false :
				Number(this.valueOf()).inRange(n1, n2, include);
		}, String.prototype.isInt = function isInt() {
			var a = this.valueOf();
			if ( isNaN(a) ) return false;
			a = a.slc(".");
			if (a.io(".") === -1) return true;
			for (var i = len(a); i --> 1 ;)
				if (a[i] !== "0") return false;
			return true;
		}, String.prototype.exists = function exists() {
			return this !=
				"";
		}, Number.prototype.isPrime = function isPrime() {// can probably be optimized
			var n = int(this.valueOf());
			if (n === 2) return !0;
			if (n < 2 || !(n % 2)) return !1;
			for (var i = 3, a = n / 3; i <= a; i += 2) {
				if (!(n % i)) return !1;
			}
			return !0;
		}, Number.prototype.shl = function shl(num) {
			return this.valueOf() <<
				Number(num);
		}, Number.prototype.shr = function shr(num) {
			return this.valueOf() >>
				Number(num);
		}, Number.prototype.shr2 = function shr2(num) {
			return this.valueOf() >>>
				Number(num);
		}, Number.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			let a = this.valueOf();
			return include ?
				a >= n1 && a <= n2 :
				a > n1 && a < n2;
		}, Number.prototype.isInt = function isInt() {
			var n = this.valueOf();
			return n === int(n);
		}, Number.prototype.add = function add(arg) {
			return this +
				Number(arg);
		}, Number.prototype.sub = function sub(arg) {
			return this -
				Number(arg);
		}, Number.prototype.mul = function mul(arg) {
			return this *
				Number(arg);
		}, Number.prototype.div = function div(arg) {
			return this /
				Number(arg);
		}, Number.prototype.mod = function mod(arg) {
			return this %
				Number(arg);
		}, Number.prototype.pow = function pow(arg) {
			return this **
				Number(arg);
		}, BigInt.prototype.shl = function shl(num) {
			return this.valueOf() <<
				BigInt(num);
		}, BigInt.prototype.shr = function shr(num) {
			return this.valueOf() >>
				BigInt(num);
		}, BigInt.prototype.shr2 = function shr2(num) {
			return this.valueOf() >>>
			BigInt(num);
		}, BigInt.prototype.isPrime = function isPrime() {
			var n = this.valueOf();
			if (n === 2n) return !0;
			if (n < 2n || !(n % 2n)) return !1;
			for (var i = 3n, a = n / 3n; i <= a; i += 2n)
				if (!(n % i)) return !1;
			return !0;
		}, BigInt.prototype.inRange = function inRange(n1, n2=arguments[0], include=true) {
			n2 == null && (n2 = n1);
			var a = this.valueOf();
			return include ?
				a >= n1 && a <= n2 :
				a > n1 && a < n2;
		}, BigInt.prototype.toExponential = function toExponential(maxDigits=16, form=String) {
			var a = `${this.valueOf()}`;
			maxDigits < 0 && (maxDigits = 0);
			var decimal = maxDigits && len(a) > 1 && a.substr(1)*1 ? "." : "";
			var rest = a.substr(1, maxDigits);
			rest = 1 * rest ? rest : "";
			if (["string", "str", "s", String].incl(form))      return `${a[0]}${decimal}${rest}e+${len(a) - 1}`;
			else if (["number", "num", "n", Number].incl(form)) return 1 * `${a[0]}.${a.substr(1, 50)}e+${len(a) - 1}`;
		}, BigInt.prototype.add = function add(arg) {
			return this +
				BigInt(arg);
		}, BigInt.prototype.sub = function sub(arg) {
			return this -
				BigInt(arg);
		}, BigInt.prototype.mul = function mul(arg) {
			return this *
				BigInt(arg);
		}, BigInt.prototype.div = function div(arg) {
			return this /
				BigInt(arg);
		}, BigInt.prototype.mod = function mod(arg) {
			return this %
				BigInt(arg);
		}, BigInt.prototype.pow = function pow(arg) {
			return this **
				BigInt(arg);
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
			return ODD+(numstr+(ODD?"0":"")).match(/../g).map(e=>`${e[0]}${len(`${1*e[0]+1*e[1]}`)===1?1*e[0]+1*e[1]:`${1*e[0]+1*e[1]}`[1]}`).join("");

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
				c = isNaN(c) ? c : (c*1).toString(2);
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
					if (check(a[i])) return [false, i , a[i]];
				return true;
			}
			// base 11 but replace the stuff with these:
			"յͿΡЈ𝗉pJРрPȷ";
			"1234567890a";
		}
	} {// Error Handling
		let exit1 = false;
		ON_CONFLICT = ON_CONFLICT.lower();
		if (len(CONFLICT_ARR)) {
			switch (ON_CONFLICT && Alert_Conflict_OverWritten_Functions) {
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
			exit1 = true;
		} if (len(NOT_ACTIVE_ARR) && Alert_Conflict_Unused_Functions) {
			switch (ON_CONFLICT) {
				case "ast":
				case "assert": console.assert(!1, "Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "err":
				case "error": console.error("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "dbg":
				case "debug": console.debug("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "inf":
				case "info": console.info("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "wrn":
				case "warn": console.warn("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "log": console.log("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
				case "alt":
				case "alert": alert(`Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`); break;
				case "ret":
				case "return": return `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
				case "trw":
				case "throw": throw `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
			}
			exit1 = true;
		}
		if (exit1) return 1;
		ALERT_FINISHED && console.log("lib.js loaded");
		return 0;
	}
})(); function dQuery(e, typ, prev) {
	// some dQuery things also support jQquery things
	assert( typeof e === "string" || typeof e === "object" || e == null || isArr(e),
		"function requires a string, an object, or undefined argument"
	);
	// arguments.callee is used here because I want the function and class to have the same name
	// and I need to use the function inside the class.
	var func = arguments.callee;
	class dQuery extends Array {
		constructor(values=[], typ="", prev=document) {
			super(...Array.from(values));
			this.type = typ;
			this.prev = prev;
		}
		// TODO: Add css handling
		// TODO: Add event handling
		// TODO: Add hasClass, addClass, removeClass, and hasId functions
		// TODO: Add replace function

		set(keys, newVals, ...indexes) {
			// ex: set("innerHTML", "Hello World", 0);
			if (this[0] == null || keys == null || newVals == null) return null;

			!len(indexes) && (indexes = [0]);
			indexes = indexes.tofar();
			newVals = newVals.tofar();
			keys = keys.tofar();
			if (len(newVals) === 1) newVals = newVals.len(len(indexes)).fill(newVals[0]);
			if (len(keys) === 1) keys = keys.len(len(indexes)).fill(keys[0]);

			for (var i = 0, n = len(indexes); i < n; i++)
				this[i][keys[i]] = newVals[i];

			return this;
		}

		get(...keys) {
			// ex: get("innerHTML")
			// to get css values, use .css() method
			
			if (len(keys) === 1) return this.map(e => e[keys[0]]);
			return this.map((e, i) => e[key[i]]);
		}

		html(texts=null, ...indexes) {
			return texts == null?
				this.get("innerHTML") :
				this.set("innerHTML", texts, indexes);
		}
		ohtml(texts=null, ...indexes) {
			return texts === null?
				this.get("outerHTML") :
				this.set("outerHTML", texts, indexes);
		}
		val(texts=null, ...indexes) {
			return texts === null?
				this.get("value") :
				this.set("value", texts, indexes);
		}
		id(names=null, ...indexes) {
			return names === null?
				this.set("id", names, indexes) :
				this.get("id");
		}
		class(names=null, ...indexes) {
			return names === null?
				this.get("className") :
				this.set("className", names, indexes);
		}
		// hide() {}
		// show() {}

		// TODO: Fix css
		css(keys) {
			//throw Error("dQuery.css() is broken");
			if (keys == null) return null;
			
			type(keys, 1) !== "arr" && (keys = keys.tofar());
			if (this[0] == null || keys == null) return null;
			keys = keys.filter( e => type(e, 1) === "str" && isNaN(e) ).map(name => {
				const MATCH = /-([a-zA-Z])/.exec(name);
				name = MATCH == null ?
					name :
					name?.replace( MATCH[0], MATCH[1].upper() );
				return name;
			});
			// TODO: Make it set instead of get, and get if keys is undefined
			let obj = this.map((e, index) => {
				e = [e].len( len(keys) ).fill(e);
				for (var i = 0, n = len(e); i < n ;)
					e[i] = e[i].style[ keys[i++] ];
				return e;
			});
			delete obj.prev;
			delete obj.type;
			return obj.tofar();

			/* dQuery.set():
				if (this[0] == null || keys == null || newVals == null) return null;

				!len(indexes) && (indexes = [0]);
				indexes = indexes.tofar();
				newVals = newVals.tofar();
				keys = keys.tofar();
				if (len(newVals) === 1) newVals = newVals.len(len(indexes)).fill(newVals[0]);
				if (len(keys) === 1) keys = keys.len(len(indexes)).fill(keys[0]);

				for (var i = 0, n = len(indexes); i < n; i++)
					this[i][keys[i]] = newVals[i];

				return this;
			*/
			// essentially 'get' but for css
			const MATCH = /-([a-zA-Z])/.exec(name);
			name = MATCH == null ? name : name?.replace(MATCH[0], MATCH[1].upper());
			return this.value == null ? null :
				/class|querySelectorAll/.in(this.type) ?
					name == null ? this.value?.style : this.value?.map(e => e.style[name]) :
					name == null ? this.value?.style : this.value.style[name];
		}
		extend(obj) {
			this.prev = this.copy();

			if (constr(obj) !== "dQuery" && obj?.constructor?.name !== "jQuery")
				throw Error("dQuery.extend() requires a dQuery or jQuery object");
			// dQuery is already easier to use than jQuery. 2 lines of code? ridiculous, and deplorable
			if (obj?.constructor?.name === "jQuery") {
				obj.each((i, e) => this.push(e));
				return this;
			} else return obj.for(e => this.push(e), this);
		}
		copy(dQueryObj) {
			dQueryObj == null && (dQueryObj = this);
			return new this.constructor(Array.from(dQueryObj), dQueryObj.type, dQueryObj.prev);
		}
		// regular array methods
		push(...HTML_Elements) {
			for (const obj of HTML_Elements.flatten()) {
				if (/^\[object HTML\w*Element\]$/.in(obj.toString()))
					Array.prototype.push.call(this, obj);
			}
			return this;
		}
		pop(num=1) {
			Array.prototype.pop2.call(this, num);
			return this;
		}
		shift(num=1) {
			Array.prototype.shift2.call(this, num);
			return this;
		}
		unshift(...HTML_Elements) {
			for (const obj of HTML_Elements.flatten()) {
				if (/^\[object HTML\w*Element\]$/.in(obj.toString()))
					Array.prototype.unshift.call(this, obj);
			}
			return this;
		}
		map(fn=e=>e) {
			for (var obj = this.copy(), index = 0, n = len(obj); index < n; index++)
				obj[index] = fn(obj[index], index, this);

			return obj;
		}
		/*slc(start=0, end=Infinity) {

		}*/
	}
	if (typeof e?.constructor === "function" && constr(e) === "dQuery") return e;
	if (isArr(e)) return new dQuery(e, typ || "", prev || document).flat();
	if (e === "*") return new dQuery(document.querySelectorAll("*"), "querySelectorAll").flat();
	if (e == null || e === "") return new dQuery().flat();

	let values, end = true,
		str = ` ${e}`.splitn(/(?=\.|#)|(?<=\.|#)/, 2).map(e => e.trim()).filter(e => e);

	if (len(str) > 3 || !len(str)) throw Error(`invalid input: \`${e}\``);

	switch (str[0]) {
		case "#":
			// TODO fix Object.tofar() for HTMLScriptElements
			values = [document.getElementById(str[1])];
			typ = "id";    break;
		case ".":
			values = Array.from(document.getElementsByClassName(str[1]));
			typ = "class"; break;
		default: // query selector and (id=all or class=all)
			end = false;
			values = Array.from(document.querySelectorAll(str[0]));
			typ = "querySelectorAll";
	}

	if (end || len(str) === 1) return new dQuery(values, typ).flat();
	
	// some input like "tagname." with no class
	if (len(str) === 2) throw Error(`Invalid input: ${e}`);

	switch (str[1]) {
		case "#":
			values = Array.from(values).filter(e => e.id === str[2]);
			break;
		case ".":
			values = Array.from(values).filter(e => e.className === str[2]);
			break;
		default: throw Error("Unreachable");
	}

	return new dQuery(values, typ).flat();
} this.$ ??= dQuery; /**
 * (function fixCodeHS( progress, points, badges, days, streak, moduleIndex, name, avatar, returnUserData ) {
 for(var i=5,A=$(".module-info").toArray(),S=$(".user-stat").toArray();i-->0;)arguments[i]=arguments[i].toString();A[0].click(),A[0].click();const fix=()=>{const f="finalized",s="submitted",o={icon:f,challenge:f,quiz:f,"chs-badge":f,video:f,connection:f,example:f,"lesson-status":f,exercise:s,"free-response":s};$(".unopened").toArray().concat($(`.not-${s}`).toArray()).forEach((e,i,a)=>a[i].className=e.className.replace(/unopened|not-submitted/g,o[e.className.split(/ +/)[0]]));$(".bg-slate").toArray().filter(e=>e.className.trim()=="bg-slate").forEach((e,i,a)=>{a[i].style.width="100%";a[i].className=e.className.replace(/progressBar/g,"bg-slate")});$(".percent-box").toArray().forEach((e,i,a)=>{a[i].innerHTML=e.innerHTML.replace(/\d+%/g,"100%");a[i].className=e.className.replace(/percent-\d+/g,"percent-100")})};for(let m of A)m.click(),fix();points!="def"&&(S[1].children[1].innerHTML=points);badges!="def"&&(S[2].children[1].innerHTML=badges);days!="def"&&(S[3].children[1].innerHTML=days);streak!="def"&&(S[4].children[1].innerHTML=streak);moduleIndex!="def"&&A[moduleIndex].click();if(name!="def")$(".nav-user-name-text")[0].innerHTML=name;if(avatar!="def")$(".nav-user-name-text")[0].innerHTML=avatar;if(progress!="def"){const p=Array.from($(".user-stat")[0].children[0].children);p[1].innerHTML=`${progress}%`;p[2].children[0].children[0].style.width=`${progress}%`}clear();return returnUserData?userData:!0
 })(100, "def", "def", "def", "def", "def", "def", "def", false);

	good codehs images:
	https://codehs.com/identicon/image/%7D
	https://codehs.com/identicon/image/1g
	https://codehs.com/identicon/image/1P
	https://codehs.com/identicon/image/1$
	https://codehs.com/identicon/image/2G
	https://codehs.com/identicon/image/2(
	https://codehs.com/identicon/image/3h
	https://codehs.com/identicon/image/3H
	https://codehs.com/identicon/image/3L
	https://codehs.com/identicon/image/44
	https://codehs.com/identicon/image/5H
	https://codehs.com/identicon/image/5K
	https://codehs.com/identicon/image/5O
	https://codehs.com/identicon/image/5P
	https://codehs.com/identicon/image/65
	https://codehs.com/identicon/image/6h
	https://codehs.com/identicon/image/6o
	https://codehs.com/identicon/image/6t
	https://codehs.com/identicon/image/6v
	https://codehs.com/identicon/image/6F


	1.7320508075688773
	9999999999999999
	1 ** Infinity
	2.8 - 1
	(0.3).toPrecision(100)
	1.4 + 0.7
	0.1 + 0.2
	1 + 0.3333333333333333
*/
