// window.constructor is Window, and idk if that is bad to overwrite that so I used const
const constructor = input => {
	const output = `${input.constructor}`.remove(/\s*\{(.|\s)*|class\s*|function\s*|\(\)/g).remove(/\s.*/g);
	return output === "(" ? "No Name" : output
}
((onConflict, MathVar, alertForMath) => {"use strict";
	onConflict = "debug", MathVar = true, alertForMath = false;
	(()=>{const onConflict_Options = ["log","throw","return","warn","debug","info","assert","alert","None"];})();
		const LIBRARY_FUNCTIONS = ["$qs","isIterable","len","π","𝑒",Symbol.for("<0x200b>"),Symbol.for("<0x08>"),"json","rand","constr","copy","assert","help","dir","nSub","reverseLList","convertType","firstDayOfYear","type","round","floor","ceil","int","str","numToAccountingStr","range","asciiToChar","charToAscii","numToWords","numToStrW_s","Logic","LinkedList","Types"]
		, NOT_ACTIVE_ARR = ["$","revArr","timeThrow","funny"].map(e=>[this[e] != null, e]).filter(e=>e[0]).map(e=>e[1])
		, CONFLICT_ARR = LIBRARY_FUNCTIONS.map(e=>[this[e] == null, e]).filter(e => !e[0]).map(e => e[1]);
		(MathVar === !0 && alertForMath === !0) && CONFLICT_ARR.push("Math");
	const math = Math;
	this.$ ??= function $(e) {return document.getElementById(e)};
	this.$qs = function $qs(element, one=false) {
		return one ? document.querySelector(element) : document.querySelectorAll(element);
	};
	this.isIterable = function isIterable(arg) {
		try { for (const i of arg) break } catch { return !1 } return !0;
	};
	this.len = function length(e) {return e?.length};
	this.π = 3.141592653589793;
	this.𝑒 = 2.718281828459045;
	this[Symbol.for("<0x200b>")] = "​";
	this[Symbol.for("<0x08>")] = "";
	this.json = JSON;
	this.rand = Math.random;
	this.constr = constructor;
	this.copy = function copy(object) {return json.parse(json.stringify(object))};
	this.assert = function(condition, message="No Message Given", loc="") {
		if (!condition) throw `failed assertion at ${loc === "" ? "No Location Given" : loc}: ${message}`;
		return 0;
	};
	// TODO: Fix help function.  help("Math.int") is broken
	this.help = function help(str) {
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
					open(`https://developer.mozilla.org/en-US/search?q=${str}()`, "_blank"); // () was added without testing
				return `Function: arguments -> ${`${func}`.replace(/\s+/g, " ").remove(/\s*{.*|\s*=>.*|function\s*[^(]*/g).remove(/^\(|\)$/g).start("(None)").replace(/,(?!\s)/g, ", ")}`;
			}
		} catch {}
		try { return "Value: " + new Function(`return ${str}`)() } catch { return "Variable not Found" }	
	};
	this.dir = function currentDirectory(loc=new Error().stack) {
		return `${loc}`.substr(13).remove(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g);
	};
	this.nSub = function substituteNInBigIntegers(num, n=1) {
		return type(num) === "bigint" ? Number(num) * n : num;
	};
	this.revArr ??= function reverseArray(array) {
		for (var left = 0, length = len(array), right = length - 1, tmp; left < right; left++, right--) {
			tmp = array[left];
			array[left] = array[right];
			array[right] = tmp;
		}
		return array;
	};
	this.revLList = function reverseLinkedList(list) {
		for (let cur = list.head, prev = null, next; current;) {
			next = cur.next;
			cur.next = prev;
			prev = cur;
			cur = next;
		}
		list.head = prev || list.head;
		return list;
	};
	this.convertType = function convertType(input, Type, fail="throw", handle=!1) {
		if (Type == null || input == null) throw Error(`No type or input given. input: ${e}. type: ${E}`);
		if (type(input) == Type) return input;
		switch (Type) {
			case "string": return `${input}`;
			case "boolean": return !!(input);
			case "undefined": return;
			case "number":
				input = Number(input);
				if (Math.isNaN(input)) {
					if (fail !== "throw") return;
					throw Error(`cannot convert ${type(input)} to number`);
				}
				return input;
			case "bigint":
				if (type(input) === "number" || Math.isAN(input)) return BigInt(input);
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
	};
	this.firstDayOfYear = function findWeekDayNameOfFirstDayOfYear(year, form="number") {
		if (type(form, 1) !== "str")
			throw Error(`Invalid input for second paramater: ${form}. Expected a string but found a(n) ${type(form)}`);
		var ans = (1 + --year % 4 * 5 + year % 100 * 4 + year % 400 * 6) % 7;
		form = form.toLowerCase(), year = ~~year;
		return form === "number"?
			ans:
			form[0] === "s"?
				ans === 0?
					"Sunday":
					ans === 1?
						"Monday":
						ans === 2?
							"Tuesday":
							ans === 3?
								"Wednesday":
								ans === 4?
									"Thursday":
									ans === 5?
										"Friday":
										ans === 6?
											"Saturday":
											Error(`Invalid Input: (year: ${year+1}). output: ${ans}.`):
				Error(`Invalid output form: ${form}. try "number" or "string"`)
	};
	this.type = function type(a, b) {
		// TODO: add nodelist to function
		return b == null || typeof a === "bigint" || typeof a === "symbol" || a === undefined?
			typeof a:
			typeof a === "number"?
				isNaN(a)?
					"nan":
					isNaN(a-a)?
						"inf":
						"num":
				typeof a === "object"?
					false?
						"nodelist":
						`${a?.test}` === 'function test() { [native code] }'?
							"regex":
							a === null?
								"null":
								`${a?.type}`.remove(/\s|;/g) === 'type(){return"linkedlist"}'?
									"linkedlist":
									`${a?.type}`.remove(/\s|;/g) === 'type(){return"complexnum"}'?
										"complexnum":
										json.stringify(a).startsWith("[")?
											"arr":
											"obj":
					typeof a === "string"?
						"str":
						typeof a === "boolean"?
							"bool":
						/^class /.test(a+"")?
							"class":
							"func"
	};
	this.timeThrow ??= function timeThrow(message="Error Message Here.", run=false) {
		let date = new Date().getHours();
		if (date > 22 || date < 4) throw Error("Go to Sleep.");
		if (run === false) throw Error(`${message}`);
		type(run, 1) === "func" && run();
	};
	this.funny ??= function funny() { return $=$$=>`$=${$},$($)`,$($) };
	this.round = function round(n) {return type(n, 1) !== "num" ? n : n%1*(n<0?-1:1)<.5 ? ~~n : ~~n+(n<0?-1:1)};
	this.floor = function floor(n) {return type(n, 1) !== "num" ? n : ~~n-(n<0&&n%1!=0?1:0)};
	this.ceil = function ceil(n) {return type(n, 1) !== "num" ? n : ~~n+(n>0&&n%1!=0?1:0)};
	this.int = parseInt;
	this.str = function String(a, b) {return b < 36 && b >= 2 ? a.toString(int(b)) : a+""};
	this.list = Array.from;
	this.numToAccStr = function numberToAccountingString(n) {return n<0 ? `(${-n})` : n+""};
	this.range = function range(start, stop, step=1) {
		// this function is mostly from the offical JavaScript documentation with small changes
		stop == null && (stop = start - 1, start = 0);
		return list({ length: (stop - start) / step + 1}, (_, i) => start + i * step);
	},
	this.asciiToChar = function asciiNumToChar(number) {
		switch (number) {
			case 0  : return"\0"; case 9  : return"\t"; case 10 : return"\n"; case 13 : return"\r";
			case 32 : return " "; case 33 : return "!"; case 34 : return '"'; case 35 : return "#";
			case 36 : return "$"; case 37 : return "%"; case 38 : return "&"; case 39 : return "'";
			case 40 : return "("; case 41 : return ")"; case 42 : return "*"; case 43 : return "+";
			case 44 : return ","; case 45 : return "-"; case 46 : return "."; case 47 : return "/";
			case 48 : return "0"; case 49 : return "1"; case 50 : return "2"; case 51 : return "3";
			case 52 : return "4"; case 53 : return "5"; case 54 : return "6"; case 55 : return "7";
			case 56 : return "8"; case 57 : return "9"; case 58 : return ":"; case 59 : return ";";
			case 60 : return "<"; case 61 : return "="; case 62 : return ">"; case 63 : return "?";
			case 64 : return "@"; case 65 : return "A"; case 66 : return "B"; case 67 : return "C";
			case 68 : return "D"; case 69 : return "E"; case 70 : return "F"; case 71 : return "G";
			case 72 : return "H"; case 73 : return "I"; case 74 : return "J"; case 75 : return "K";
			case 76 : return "L"; case 77 : return "M"; case 78 : return "N"; case 79 : return "O";
			case 80 : return "P"; case 81 : return "Q"; case 82 : return "R"; case 83 : return "S";
			case 84 : return "T"; case 85 : return "U"; case 86 : return "V"; case 87 : return "W";
			case 88 : return "X"; case 89 : return "Y"; case 90 : return "Z"; case 91 : return "[";
			case 92 : return"\\"; case 93 : return "]"; case 94 : return "^"; case 95 : return "_"; 
			case 96 : return "`"; case 97 : return "a"; case 98 : return "b"; case 99 : return "c";
			case 100: return "d"; case 101: return "e"; case 102: return "f"; case 103: return "g";
			case 104: return "h"; case 105: return "i"; case 106: return "j"; case 107: return "k";
			case 108: return "l"; case 109: return "m"; case 110: return "n"; case 111: return "o";
			case 112: return "p"; case 113: return "q"; case 114: return "r"; case 115: return "s";
			case 116: return "t"; case 117: return "u"; case 118: return "v"; case 119: return "w";
			case 120: return "x"; case 121: return "y"; case 122: return "z"; case 123: return "{";
			case 124: return "|"; case 125: return "}"; case 126: return "~"; default: return null;
		}
	},
	this.charToAscii = function charToAscii(str) {
		switch (str) {
			case"\0": return 0  ; case"\t": return 9  ; case"\n": return 10 ; case"\r": return 13 ;
			case " ": return 32 ; case "!": return 33 ; case '"': return 34 ; case "#": return 35 ;
			case "$": return 36 ; case "%": return 37 ; case "&": return 38 ; case "'": return 39 ;
			case "(": return 40 ; case ")": return 41 ; case "*": return 42 ; case "+": return 43 ;
			case ",": return 44 ; case "-": return 45 ; case ".": return 46 ; case "/": return 47 ;
			case "0": return 48 ; case "1": return 49 ; case "2": return 50 ; case "3": return 51 ;
			case "4": return 52 ; case "5": return 53 ; case "6": return 54 ; case "7": return 55 ;
			case "8": return 56 ; case "9": return 57 ; case ":": return 58 ; case ";": return 59 ;
			case "<": return 60 ; case "=": return 61 ; case ">": return 62 ; case "?": return 63 ;
			case "@": return 64 ; case "A": return 65 ; case "B": return 66 ; case "C": return 67 ;
			case "D": return 68 ; case "E": return 69 ; case "F": return 70 ; case "G": return 71 ;
			case "H": return 72 ; case "I": return 73 ; case "J": return 74 ; case "K": return 75 ;
			case "L": return 76 ; case "M": return 77 ; case "N": return 78 ; case "O": return 79 ;
			case "P": return 80 ; case "Q": return 81 ; case "R": return 82 ; case "S": return 83 ;
			case "T": return 84 ; case "U": return 85 ; case "V": return 86 ; case "W": return 87 ;
			case "X": return 88 ; case "Y": return 89 ; case "Z": return 90 ; case "[": return 91 ;
			case"\\": return 92 ; case "]": return 93 ; case "^": return 94 ; case "_": return 95 ;
			case "`": return 96 ; case "a": return 97 ; case "b": return 98 ; case "c": return 99 ;
			case "d": return 100; case "e": return 101; case "f": return 102; case "g": return 103;
			case "h": return 104; case "i": return 105; case "j": return 106; case "k": return 107;
			case "l": return 108; case "m": return 109; case "n": return 110; case "o": return 111;
			case "p": return 112; case "q": return 113; case "r": return 114; case "s": return 115;
			case "t": return 116; case "u": return 117; case "v": return 118; case "w": return 119;
			case "x": return 120; case "y": return 121; case "z": return 122; case "{": return 123;
			case "|": return 124; case "}": return 125; case "~": return 126; default: return null;
		}
	},
	this.qwerty_encoder = function qwerty_encoder(key, typ="encode") {
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
			"<": "1409", ".": "0410", ">": "1410", "/": "0411", "?": "1411", " ": "054",
		}
		return typ === "encode" || typ === "encoder" ? obj[key] : Object.keyof(obj, key);
	},
	this.numToWords = function numberToWords(number) {
		if (Math.isNaN(number)) throw Error(`Expected a number, and found a(n) ${type(number)}`);
		number = Number(number);
		var string = `${number}`;
		switch (true) {
			case /\./.test(string):
				var decimals = `${numberToWords(string.substring(0,string.io(".")))} point`;
				for (var i = string.io(".") + 1; i < len(string); i++)
					decimals += ` ${numberToWords(string[i])}`;
				return decimals;
			case number < 0 || Logic.is(number, -0): return `negative ${numberToWords(-number)}`;
			case number == 0: return "zero";
			case number == 1: return "one";
			case number == 2: return "two";
			case number == 3: return "three";
			case number == 4: return "four";
			case number == 5: return "five";
			case number == 6: return "six";
			case number == 7: return "seven";
			case number == 8: return "eight";
			case number == 9: return "nine";
			case number == 10: return "ten";
			case number == 11: return "eleven";
			case number == 12: return "twelve";
			case number == 13: return "thirteen";
			case number == 15: return "fifteen";
			case number == 18: return "eighteen";
			case number < 20: return `${numberToWords(string[1]*1)}teen`;
			case number == 20: return "twenty";
			case number < 30: return `twenty-${numberToWords(string[1]*1)}`;
			case number == 30: return "thirty";
			case number < 40: return `thirty-${numberToWords(string[1]*1)}`;
			case number == 40: return "forty";
			case number < 50: return `forty-${numberToWords(string[1]*1)}`;
			case number == 50: return "fifty";
			case number < 60: return `fifty-${numberToWords(string[1]*1)}`;
			case number == 60: return "sixty";
			case number < 70: return `sixty-${numberToWords(string[1]*1)}`;
			case number == 70: return "seventy";
			case number < 80: return `seventy-${numberToWords(string[1]*1)}`;
			case number == 80: return "eighty";
			case number < 90: return `eighty-${numberToWords(string[1]*1)}`;
			case number == 90: return "ninety";
			case number < 100: return `ninety-${numberToWords(string[1]*1)}`;
			case number % 100===0 && len(string)===3: return `${numberToWords(1*string[0])} hundred`;
			case number < 1e3:
				return `${numberToWords(string[0]*1)} hundred and ${numberToWords(1*string.substr(1,2))}`;
			case number % 1e3===0 && len(string)===4: return `${numberToWords(1*string[0])} thousand`;
			case number < 1e4:
				return `${numberToWords(1*string[0])} thousand ${numberToWords(1*string.substr(1,3))}`;
			case number % 1e3===0 && len(string)===5: return `${numberToWords(1*string.substr(0,2))} thousand`;
			case number < 1e5:
				return `${numberToWords(1*string.substr(0,2))} thousand ${numberToWords(1*string.substr(2))}`;
			case number % 1e3===0 && len(string)===6: return `${numberToWords(1*(string).substr(0,3))} thousand`;
			case number < 1e6:
				return `${numberToWords(1*string.substr(0,3))} thousand ${numberToWords(1*string.substr(3))}`;
			case number % 1e6===0 && len(string)===7: return `${numberToWords(1*string[0])} million`;
			case number < 1e7:
				return`${numberToWords(1*string[0])} million ${numberToWords(1*string.substr(1))}`;
			case number % 1e6===0 && len(string)===8: return `${numberToWords(1*string.substr(0,2))} million`;
			case number < 1e8:
				return `${numberToWords(1*string.substr(0,2))} million ${numberToWords(1*string.substr(2))}`;
			default: throw Error(`Invalid Number. function Only works for {x:|x| < 1e8}\n\t\t\tinput: ${numToStrW_s(number)}`);
		}
	},
	this.numToStrW_s = function numberToStringWith_s(number) {
		for (var i = 0, str2 = "", str = `${number}`.reverse(); i < len(str); i++) {
			(!(i % 3) && i) && (str2 += "_");
			str2 += str[i];
		}
		return str2.reverse();
	};
	var Math2 = {
		// TODO: add back original functions
		// TODO: make all the functions their own methods
		Math: class Math {
			// for the following class, 'n' and 'x' both denote any arbitrary real number.
			// for the remainder of the file, 'a' and 'b' refer to any arbitrary input to a function.
			constructor(A, B) {
				this.e = 𝑒,
				this.E = 𝑒,
				this.phi = 1.618033988749895,
				this.pi = π,
				this.PI = π,
				this.fround = math.fround,
				this.random = rand,
				this.imul = math.imul;
				if (B != null) {
					this[B] = {
						fround: "returns the nearest 32-bit single precision float representation of a number.",
						random: "returns a random number in the range [0,1)",
						imul: "returns the result of the C-like 32-bit multiplication of the two parameters.",
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
							atan2: "Takes 2 numeric arguments (x, and y), and returns atan2(x, y) in radians. see 'https://bit.ly/3j5X03W' or 'https://bit.ly/3DzmCQq' for a better explanation",
							acsc: "1 argument. returns asin(1/arg) (radians)",
							asec: "1 argument. returns acos(1/arg) (radians)",
							acot: "1 argument. if the argument == 0, returns π/2.  if the argument is less than zero, returns π + arctangent(1/argument). otherwise, returns atan(1/argument).  (radians)",
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
								atan2: "Takes 2 numeric arguments (x, and y), and returns atan2(x, y) in degrees. see 'https://bit.ly/3j5X03W' or 'https://bit.ly/3DzmCQq' for a better explanation",
								acsc: "1 argument. returns asin(1/arg)",
								asec: "1 argument. returns acos(1/arg)",
								acot: "1 argument. if the argument is loosely equal to zero, returns 90.  if the argument is less than zero, returns 180 + atan(arg), otherwise it returns atan(arg)."
							}
						},
						clbz: "takes one paramater.  same as original Math.clz32. stands for count leading binary zeros",
						fact: "takes one paramater.  returns the factorial of a number. Also works for floats.",
						sgn: "takes one paramater.  returns the sign of a number.  If input is NaN, returns NaN.  If  input == 0, returns the input.  If the input is positive, returns 1.  If the input is negative, returns -1.",
						abs: "takes one paramater.  returns sign(input) * input, which always returns a positive number or zero.",
						sum: "stands for summation.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to sum each time, in the form of a function that takes in one paramater. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
						prod: "stands for product operator.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to multiply by each time, in the form of a function with an input and output. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
						gamma: "stands for gamma function. gamma(x) = factorial(x-1).  Takes three paramaters.  1: the number to take the gamma function of.  2: accuracy of the function (default is 1000). 3: rest parameter that does nothing.  if the number is an integer returns ifact(n-1). else, it does the integral from 0 to a, of x**(n-1)/𝑒**x.  if this is Infinity, return NaN, otherwise, it returns the answer.",
						int: "stands for integral.  Takes 4 arguments.  1: starting value (inclusive).  2: ending value (exclusive).  3: what you are taking the integral of, in the form of a function with an input, and an output.  4: rectangle size, or in other words, the accuracy, where smaller is more accurate.  the accuracy is defaulted to 0.001, and it is defaulted to taking the integral of y=x.",
						hypot: "Stands for hypotenuse.  Takes in any amount of parameters, either directly or in one or many array(s).  for each argument, adds the square to the total.  then takes the square root of the total.",
						log: "Takes 2 paramaters.  1: number you are taking the logarithm of.  2: base of the logarithm. eg: log(3,6) = log₆(3). the base is defaulted to 10.",
						ln: "Takes 1 paramater, and returns the natural logarithm of the number.  the same as the original Math.log. returns log(input, 𝑒).",
						max: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the largest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
						min: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the smallest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
						nthrt: "Takes 2 paramaters (x, n).  returns x**(1/n).  the root defaults to 2.",
						mean: "Takes any amount of arguments, either directly or in one or many array(s).  adds up the arguments, and divides by the number of arguments present. and returns the answer.",
						median: "Takes any amount of arguments, either directly or in one or many array(s).  it removes items from the end and beginning until there are either one or two elements remaining. if there is one, it returns it.  if there are two, it returns the average of them.",
						mad: "Stands for mean absolute deviation.  takes any amount of arguments, either directly or in one or many array(s).  gets the mean of the arguments.  then finds the mean of the absolute deviation from the mean.",
						isPrime: "Takes 1 input, and returns true if it is prime, false if it is composite.",
						lmgf: "stands for lcm gcf.  Takes at least two arguments.  if the first argument is equal tp \"lcm\" or \"l\" (lowercase L), it will perform the least common multiple. otherwise,  it will do the greatest common factor.  the rest of the paramaters can be inputed either directly, or as one or many arrays.  any arguments that are not numbers or bigInts are ignored, as long as it is not the second argument.",
						linReg: "Takes 3 paramates. finds the line of best fit (y = mx + b), given the x and y coordinates as arrays. 1: x-coordinates.  2: y-coordinates.  3: if this is \"obj\", then it returns an object, otherwise it returns it as a string",
						pascal: "Takes 2 arguments.  1: row.  2: col in row.  if the column is less than 1 or greater than row + 1, it will return NaN. otherwise, if col is not \"all\", it will return nCr(row,col-1). if col is equal to \"all\", it will return an array of all the numbers in that row of pascals triangle.",
						fib: "Stands for fibonacci. returns the fibonacci sequence number of the inputed index.  If floats are inputed, then it will effectively return fib(ceil(input)).  Currently negative indexes are not implemented.  fib(0) returns 0, fib(1) returns 1, fib(2) returns 1, fib(3) returns 2, etc.",
						primeFactorInt: "Takes 1 numberic argument, and returns a list of the prime factors",
						findFactors: "Takes 1 integer argument and finds all integer factors of said integer.",
						iMaxFactor: "Takes 1 integer argument and returns the largest factor of said integer",
						synthDiv: "Takes 2 arguments. 1: coefficients of the variables. 2: the divisor.  the equation should take the form of ax^n + bx^(n-1) + cx^(n-2) + ... + constant",
						simpRad: "Takes 1 integer argument (number under radical) and returns, as a string, the radical in simplified form",
						PythagTriple: "Takes one argument. 1: max size. finds all principle pythagorean triples such that a**2 + b**2 = c**2, a < max size, and b < max size, and a, b, and c are all integers.",
						add: "Takes any amount of arguments, either directly or in one or many array(s).  adds all of the arguments together and returns the answer.",
						trunc: "Takes any amount of parameters, either directly or in one or many array(s).  If there is only one input, it will truncate it, and return it, otherwise, it will return an array of truncated values.",
						complex: "Creates a complex number",
						nCr: "Stands for n Choose r. takes 2 arguments. same as python's math.comb()",
						nPr: "Stands for n Permute r. takes 2 arguments.",
						copySign: "takes 2 arguments. 1: number to keep the value of (x). 2: number to keep the sign of (y). returns |x|sign(y)",
						degrees: "Takes 1 argument. 1: angle in radians. converts radians to degrees",
						radians: "Takes 1 argument. 1: angle in degrees. converts degrees to radians",
						isNaN: "Similar to isNaN(). takes one paramater.  if it can be coerced to be a number, it returns false.  the difference is that it returns false for bigints instead of throwing an error.",
						isAN: "Takes one argument.  returns the opposite of Math.isNaN()",
						dist: "Takes 4 arguments: (x1, y1, x2, y2). retrns the distance between the two points",
						erf: "Takes one numeric argument \"z\". returns 2/√π ∫(0, z, 1/𝑒^t^2)dt. In mathematics, it is called the \"Gauss error function\"",
						erfc: "Takes 1 numeric argument \"z\". return 1 - erf(z).",
						isClose: "Takes 3 arguments. 1: number a. 2: number b.  3: number c. if a third argument is not provided, it will be set to 1e-16.  returns true if number a is in range c of number b, otherwise it returns false.",
						parity: "Takes any amount of arguments directly, or in an array.  if there is one argument, it will return even or odd as a string.  if there 2 or more arguments, it will return an array of strings.",
						lcm: "returns the least common multiple of a list of numbers",
						gcf: "retirns the greatest common factor of a list of numbers",
						gcd: "Alternate spelling of gcf",
						ln1p: "Takes one argument.  returns ln(1+arg). the same as original Math.log1p",
						sign: "Alternate spelling for sgn",
						round: "returns round(argument)",
						ceil: "returns ceil(argument)",
						floor: "returns floor(argument)",
						pow: "Takes two arguments (a,b).  similar to a**b.",
						mod: "Takes two arguments (a,b).  similar to a%b.",
						exp: "Takes one argument (n, x=Math.E).  returns x ** n",
						sqrt: "Takes one argument. returns nthrt(arg)",
						cbrt: "Takes one argument.  returns the cube root of the argument.",
						ifact: "Returns the factorial of a number, and disregards all numbers in decimal places.",
						findPrimes: "Takes two paramaters.  1: maximum number of primes to be returned.  2: maximum size (inclusive) for the desired numbers"
					}
				}
				if (A != null && A !== "default") {
					this[A] = {
						sin: x=>this.sum(0, 25, n => (-1)**n / this.fact(2*n + 1) * (x % (2*π))**(2*n + 1)),
						cos: x=>this.sum(0, 25, n => (-1)**n / this.fact(2*n) * (x % (2*π))**(2*n)),
						tan: function tan(n) { return this.sin(n) / this.cos(n) },
						csc: function csc(n) { return 1 / this.sin(n) },
						sec: function sec(n) { return 1 / this.cos(n) },
						cot: function cot(n) { return 1 / this.tan(n) },
						asin: x=>x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n => this.fact(2*n) / (4**n * this.fact(n)**2 * (2*n+1)) * (x**(2*n+1))),
						acos: function acos(n) { return π/2 - this.asin(n) },
						atan: math.atan,
						atan2: function atan2(x, y) {
							const output = this.atan(y / x);
							return x > 0 ?
								output :
								!x ?
									Math.sgn(y)**2 / Math.sgn(y) * π/2:
									y >= 0 ? output + π : output - π;
						},
						acsc: function acsc(n) { return this.asin(1 / n) },
						asec: function asec(n) { return this.acos(1 / n) },
						acot: function acot(n) { return n === 0 ? π/2 : n < 0 ? π + this.atan(1/n) : this.atan(1/n) },
						sinh: function sinh(x) { return (𝑒**x - 𝑒**-x) / 2 },
						cosh: function cosh(x) { return (𝑒**x + 𝑒**-x) / 2 },
						tanh: function tanh(n) { return this.sinh(n) / this.cosh(n) },
						csch: function csch(n) { return 1 / this.sinh(n) },
						sech: function sech(n) { return 1 / this.cosh(n) },
						coth: function coth(n) { return 1 / this.tanh(n) },
						asinh: n => this.ln(n + this.sqrt(n**2 + 1)),
						acosh: n => this.ln(n + this.sqrt(n**2 - 1)),
						atanh: n => this.ln((n+1) / (1-n)) / 2,
						acsch: function acsch(n) { return this.asinh(1/n) },
						asech: function asech(n) { return this.acosh(1/n) },
						acoth: function acoth(n) { return this.atanh(1/n) },
						deg: {
							sin: x => this.sum(0, 25, n => (-1)**n / this.fact(2*n+1)*((x*π/180)%(2*π))**(2*n+1)),
							cos: x => this.sum(0, 25, n => (-1)**n / this.fact(2*n)*((x*π/180)%(2*π))**(2*n)),
							tan: function tan(n) { return this.sin(n) / this.cos(n) },
							csc: function csc(n) { return 1 / this.sin(n) },
							sec: function sec(n) { return 1 / this.cos(n) },
							cot: function cot(n) { return 1 / this.tan(n) },
							asin: x => x > 1 || x < -1?
								NaN:
								this.sum(0, 80, n => this.fact(2*n) / (4**n*this.fact(n)**2 * (2*n+1)) * (x**(2*n+1))) * 180 / π,
							acos: function acos(n) { return 90 - this.asin(n) },
							atan: n => this[A].atan(n) * 180 / π,
							atan2: (a, b) => this[A].atan2(a,b) * 180 / π,
							acsc: function acsc(n) { return this.asin(1/n) },
							asec: function asec(n) { return this.acos(1/n) },
							acot: function acot(n) {
								return !n ? 90 : n < 0 ? 180 + this.atan(1/n) : this.atan(1/n)
							}
						}
					}
				} else {
					this.sin = function sin(x) { return this.sum(0, 25, n=>(-1)**n/this.fact(2*n+1)*(x%(2*π))**(2*n+1)) },
					this.cos = function cos(x) { return this.sum(0, 25, n=>(-1)**n/this.fact(2*n)*(x%(2*π))**(2*n)) },
					this.tan = function tan(n) { return this.sin(n)/this.cos(n) },
					this.csc = function csc(n) { return 1 / this.sin(n) },
					this.sec = function sec(n) { return 1 / this.cos(n) },
					this.cot = function cot(n) { return 1 / this.tan(n) },
					this.asin = function asin(x) {
						return x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n=>this.fact(2*n) / (4**n*this.fact(n)**2 * (2*n+1))*(x**(2*n+1)));
					},
					this.acos = function acos(n) { return π/2 - this.asin(n) },
					this.atan = math.atan,
					this.atan2 = function atan2(x, y) {
						const output = this.atan(y / x);
						return x > 0 ?
							output :
							!x ?
								Math.sgn(y)**2 / Math.sgn(y) * π/2 :
								y >= 0 ? output + π : output - π;
					},
					this.acsc = function acsc(n) { return this.asin(1/n) },
					this.asec = function asec(n) { return this.acos(1/n) },
					this.acot = function acot(n) { return n === 0 ? π/2 : n < 0 ? π + this.atan(1/n) : this.atan(1/n) },
					this.sinh = function sinh(x) { return (𝑒**x - 𝑒**-x) / 2  },
					this.cosh = function cosh(x) { return (𝑒**x + 𝑒**-x) / 2  },
					this.tanh = function tanh(n) { return this.sinh(n) / this.cosh(n) },
					this.csch = function csch(n) { return 1 / this.sinh(n) },
					this.sech = function sech(n) { return 1 / this.cosh(n) },
					this.coth = function coth(n) { return 1 / this.tanh(n) },
					this.asinh = function asinh(n) { return this.ln(n + this.sqrt(n**2+1)) },
					this.acosh = function acosh(n) { return this.ln(n + this.sqrt(n**2-1)) },
					this.atanh = function atanh(n) { return this.ln((n+1) / (1-n)) / 2 },
					this.acsch = function acsch(n) { return this.asinh(1/n) },
					this.asech = function asech(n) { return this.acosh(1/n) },
					this.acoth = function acoth(n) { return this.atanh(1/n) },
					this.degTrig = {
						sin: x=> this.sum(0, 25, n => (-1)**n / this.fact(2*n+1) * ((x*π/180) % (2*π))**(2*n+1)),
						cos: x=>this.sum(0, 25, n => (-1)**n / this.fact(2*n) * ((x*π/180) % (2*π))**(2*n)),
						tan: function tan(n) { return this.sin(n) / this.cos(n) },
						csc: function csc(n) { return 1 / this.sin(n) },
						sec: function sec(n) { return 1 / this.cos(n) },
						cot: function cot(n) { return 1 / this.tan(n) },
						asin: x => x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n=>this.fact(2*n)/(4**n*this.fact(n)**2*(2*n+1))*x**(2*n+1))*180/π,
						acos: function acos(n) { return 90 - this.asin(n) },
						atan: function atan(n) { return this.atan(n) * 180 / π },
						atan2: (a, b) => this.atan2(a, b) * 180 / π,
						acsc: function acsc(n) { return this.asin(1/n) },
						asec: function asec(n) { return this.acos(1/n) },
						acot: function acot(n) { return n === 0 ? 90 : n < 0 ? 180 + this.atan(1/n) : this.atan(1/n )}
					};
				}
			}
			clbz(n) {
				if (type(n, 1) !== "num") return NaN;
				if (n < 0 || n > 2**31-1) return 0;
				n = n.toString(2);
				for (;len(n) < 32; n = `0${n}`);
				return len(n.remove(/1.*/))
			}
			fact(n, bigint=false, acy=1e3) {
				if (~~n === n) return this.ifact(n, bigint);
				if (type(n = this.int(0, acy, x=>x**n/𝑒**x, .1), 1) === "inf") return NaN;
				return n;
			}
			sgn(n) { return type(n) !== "number" ? NaN : n == 0 ? n : n<0 ? -1 : 1 }
			abs(n) { return this.sgn(n) * n }
			sum(n, last, func=n=>n, inc=1) {
				for (var total = 0; n <= last; n += inc)
					total += func(n);
				return total;
			}
			prod(n, last, func=n=>n, inc=1) {
				for (var total = 1; n <= last; n += inc)
					total *= func(n);
				return total;
			}
			gamma(n, acy=1e3) {
				if (~~n === n) return this.ifact(n-1);
				if (type(n = this.int(0, acy, x=>x**(n-1)/𝑒**x, .1), 1) === "inf") return NaN;
				return n;
			}
			int(x, end, func=x=>x, inc=.001) {
				for (var ans = 0; x < end; x += inc)
					ans += (func(x) + func(x + inc)) / 2 * inc;
				return ans;
			}
			hypot(...ns) {
				ns = ns.flatten();
				for (var a = 0, i = 0, n = len(ns); i < n; i++)
					a += ns[i]**2;
				return a**.5;
			}
			log(n, base=10, acy=50) {
				if (base <= 0 || base === 1 || n <= 0 || type(n, 1) !== "num") return NaN;
				type(acy, 1) !== "num" && (acy = 50), type(base, 1) !== "num" && (base = 10);
				if (base == n) return 1;
				if (n == 1) return 0;
				for (var pow = 1, closestInt = !0, tmp, frac = 1, i = 0; closestInt;)
					(tmp = this.abs(n - base**pow)) > this.abs(n - base**(pow + 1))?
						++pow:
						tmp > this.abs(n - base**(pow - 1))?
							--pow:
							closestInt = !1;
				for (;i < acy; ++i)
					(tmp = this.abs(n - base**pow)) > this.abs(n-base**(pow+(frac /= 2)))?
						pow += frac:
						tmp > this.abs(n - base**(pow - frac)) && (pow -= frac);
				return pow;
			}
			ln(n) { return this.log(n, 𝑒) }
			max(...ns) {
				ns = ns.flatten();
				let max = ns[0];
				for (let i of ns) max = i > max ? i : max;
				return max;
			}
			min(...ns) {
				ns = ns.flatten();
				let min = ns[0];
				for (let i of ns) min = i < min ? i : min;
				return min;
			}
			nthrt(x, rt=2) {
				assert(type(x) + type(rt) === "numbernumber", "nthrt() expects two number arguments", dir());
				if (rt < 0) return x**rt;
				if (!rt || !(rt % 2) && x < 0) return NaN;
				if (!x) return 0;
				for (var pow, cur = x, i = 0; pow !== cur && i < 100; i++) {
					pow = cur;
					cur = ((rt - 1) * pow**rt + x) / (rt * pow**(rt - 1));
				}
				return cur;
			}
			mean(...ns) {
				ns = ns.flatten();
				var total = 0;
				ns.forEach(b => total += b);
				return total / len(ns);
			}
			median(...ns) {
				for (ns = ns.flatten().sort(); len(ns) > 2;)
					ns.pop2().shift();
				return len(ns) == 1 ? ns[0] : ns.slc(0, 1) / 2
			}
			mad(...ns) {
				var absDeviation = 0, mean = this.mean(ns = ns.flatten());
				ns.forEach(b => absDeviation += this.abs(b - mean));
				return absDeviation / len(ns);
			}
			isPrime(n) {
				return type(n) !== "number" && type(n) !== "bigint" ? false : n.isPrime();
			}
			lmgf(t="lcm", ...a) {
				// least commond multiple and greatest common factor
				a = a.flatten().map(b => int(b) * (b<0 ? -1 : 1));
				for (let c, i = t[0] === "l" ? this.max(a) : this.min(a); ; t[0] === "l" ? i++ : i-- ) {
					for (let j = len(a) - 1; j >= 0; --j) {
						if (t[0] === "l" ? i % a[j] : a[j] % i) {
							c = !1;
							break;
						}
						c = !0;
					}
					if (c) return i;
				}
			}
			linReg(xs, ys, Return="obj") {
				xs = xs.tofar();
				ys = ys.tofar();
				const dim = list => len(list) - 1;
				if (!len(xs)) throw Error("No elements given for first paramater");
				if (!len(ys)) throw Error("No elements given for second paramater");
				if (isNaN(xs.join(""))) throw Error(`array of numbers req. for first paramater. Inputs: ${xs}`);
				if (isNaN(ys.join(""))) throw Error(`array of numbers req. for second paramater. Inputs: ${ys}`);
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
			}
			pascal(row, col) {
				if (null == (row = convertType(row, "number", "return"))) throw Error(`Number Required for first paramater.`);
				if ("all" !== col) col = convertType(col, "number", "return");
				if (type(col, 1) !== "num" && col !== "all")
					throw Error(`Number or String "all" Required for second paramater. Input:${col}`);
				if (col?.toLowerCase() !== "all") return this.nCr(row-1, col-1);
				for (var i = 0, arr = []; i <= row - 1;) arr.push(this.nCr(row-1, i++));
				return arr;
			}
			fib(index, bigint=false) {
				if (index > 1475 && !bigint) return Infinity;
				for (var j = 0, s = [0n, 1n]; j < index; ++j)
					s.push(s[1] + s.shift());
				return bigint ?
					index > 2 ? s[1] : s[0] :
					index > 2 ? Number(s[1]) : Number(s[0]);
			}
			primeFactorInt(number) {
				if (type(number) !== "number") return NaN;
				if (number.isPrime()) return number;
				for (var i = 2, primeFactors = []; i <= number; ++i) {
					if (!(number % i)) {
						primeFactors = primeFactors.push2(this.primeFactorInt(i)).flatten();
						number /= i;
						i = 1;
					}
				}
				return primeFactors;
			}
			findFactors(number) {
				for (var i = 2, factors = [1, number], n = Math.sqrt(number); i <= n; i++) {
					if (!(number % i)) factors.push(i, number / i);
				}
				return factors;
			}
			iMaxFactor(number) {
				if (this.isNaN(number)) return NaN;
				for (var i = number; i >= 0;) {
					if (!(number % --i)) return i;
				}
			}
			synthDiv(coeffs, /*x+*/divisor, includeRemainder=true, remainderType="string") {
				if (type(remainderType) !== "string") throw Error("4th parameter requires a string");
				for (var coeff = coeffs[0], coeffs2 = [coeffs[0]], n = len(coeffs), i = 1; i < n; i++) {
					coeff = coeff * divisor + coeffs[i];
					coeffs2.push(coeff);
				}
				coeffs = ["string", "str"].includes(remainderType.toLowerCase()) ?
					coeffs2.mod(len(coeffs2)-1, e => this.isClose(e, 0, 1e-11) ?
						0 : `${e}/${divisor < 0 ? `(x-${-divisor})` : `(x+${divisor})`}`) :
					coeffs2;
				return includeRemainder ? coeffs : coeffs.pop2();
			}
			simpRad(rad) {
				for (var factor = 1, i = 2, sqrt = this.sqrt(this.abs(rad)); i < sqrt; i += 1 + (i > 2))
					for (;!(rad % i**2);)
						rad /= i*i, factor *= i;
				return `${factor}${rad < 0 ? "i" : ""}√${this.abs(rad)}`.remove(/^1|√1$/);
			}
			PythagTriple(maxSize=1000) {
				for (var a = 1, b = 1, c, triples = []; a < maxSize; a++)
					for (b = 1, c = Math.hypot(a, b); b < maxSize; b++)
						if (c === ~~c && !len(triples.filter(e => !(c%e[2] && (a%e[0] && b%e[1] || a%e[1] && b%e[0])))))
							triples.push([a, b, c]);
				return triples;
			}
			add(...a) {
				for (var i = len(a = a.flatten()), t = 0; i --> 0;)
					t += a[i];
				return t;
			}
			trunc(n) { return type(n, 1) !== "num" ? n : ~~n }
			complex(a,b) { return new this.ComplexNumber(a,b) }
			nCr(n, k, big=false) { return this.fact(n, big) / (this.fact(k, big) * this.fact(n-k, big)) }
			nPr(n, k, big=false) { return this.fact(n, big) / this.fact(n-k, big) }
			copysign(a,b) { return this.abs(a) * this.sgn(b) }
			degrees(n) { return n * π / 180 }
			radians(n) { return n * 180 / π }
			isNaN(e) { return Logic.is(Number(e), NaN) ? !0 : !1 }
			isAN(e) { return !this.isNaN(e) }
			dist(x1, y1, x2, y2) { return this.sqrt((x2-x1)**2 + (y2-y1)**2) }
			erf(z) { return 2 / this.sqrt(π) * this.int(0, z, t=>1 / 𝑒**t**2) }
			erfc(n) { return 1 - this.erf(n) }
			isClose(n1, n2, range=3e-16) { return n1 > n2 - range && n1 < n2 + range ? !0 : !1 }
			parity(...a) { return len(a)-1 ? a.flatten().map(b=>b%2?"odd":"even") : a[0]%2?"odd":"even" }
			lcm(...ns) { return this.lmgf("lcm", ns) }
			gcf(...ns) { return this.lmgf("gcf", ns) }
			gcd(...ns) { return this.lmgf("gcd", ns) }
			ln1p(n) { return this.ln(n + 1) }
			sign(n) { return this.sgn(n) }
			round(n) { return round(n) }
			ceil(n) { return ceil(n) }
			floor(n) { return floor(n) }
			pow (a=1, b=1) {
				for (var y = 1, c = b;; a **= 2) {
					b & 1 && (y *= a);
					b >>= 1;
					if (!b) return (this.nthrt(a, 1 / (c - ~~c)) || 1) * y;
				}
			}
			mod(a, b) {//TODO: test Math.mod function
				if (!b || this.isNaN(a + b)) return NaN;
				if (a >= 0 && b > 0) {
					for (;a - b >= 0;)
						a -= b;
				} else if (a < 0 && b > 0) {
					for (;a < 0;) a += b;
				} else if (a >/*>=?*/ 0 && b < 0) {
					for (;a > 0;) a += b;
				} else if (a < 0 && b < 0) {
					for (;a - b < 0;)
						a -= b;
				}
				return a;
			}
			exp(n, x=𝑒) { return x ** n }
			sqrt(n) { return n >= 0 ? this.nthrt(n) : n == null ? 0 : `0+${this.nthrt(-n)}i` }
			cbrt(n) { return this.nthrt(n, 3) }
			ifact(n, bigint=false) {
				if (this.isNaN(n)) return NaN;
				if (!n) return bigint ? 1n : 1;
				for (var ans = 1n, cur = 1n; cur <= n; cur++)
					ans *= cur;
				return bigint ? ans : Number(ans);
			}
			findPrimes(l=100, s=Infinity) {
				for (var i = 3, primes = [1, 2]; len(primes) < l && i <= s; i += 2)
					i.isPrime() && primes.push(i);
				return primes;
			}
		}
	};
	var Logic = {
		Logic: class Logic {
			constructor(A, B, C) {
				if (A != null) {// bitwise
					// TODO: Add the other logic gates to bitwise
					this[A] = {
						right: (a, b) => a >> b,
						right2: (a, b) => a >>> b,
						left: (a, b) => a << b,
						or: (a, b) => this.xor([a, b], [1, 2]),
						and: (...a) => type(a[0], 1) !== "arr" ? this.xor(a, len(a)) : this.xor(a[0], len(a[0])),
						not: (...a) => len(a = a.flatten()) == 1 ? ~a[0] : a.map(b => ~b),
						nil: (...b) => this.xor(b, [0]),
						xor: (a, n=[1]) => {
							if (isNaN((a = [a].flatten()).join(""))) throw Error("numbers req. for 1st array");
							if (isNaN((n = [n].flatten()).join(""))) throw Error("numbers req. for 2nd paramater");
							for (var i = len(n) - 1, n1, c, t, j, l; i >= 0; --i)
								(n[i] = Math.abs(~~n[i])) > len(a) && (n[i] = len(a));
							n = n.sort() && (n[0] == n[len(n) - 1] ? [n[0], n[0]] : [n[0], n[len(n) - 1]]);
							var d = Math.max((a = a.map(b => b.toString(2))).map(b => len(b)));
							for (i = j = t = 0, n1 = c = ""; i < d; ++i, n1 += t, t = 0) {
								for (; a[i] != null && len(a[i]) < d;)
									a[i] = `0${a[i]}`;
								for (j = 0, l = len(a); j < l; ++j)
									t += a[j][i] == 1;
							}
							for (i = 0; i < len(n1); ++i)
								c += n[0] <= n1[i] && n1[i] <= n[1] ? 1 : 0;
							return `0b${c.substr(c.io(1))}` * 1
						}
					}
				}
				if (B != null) {// comparatives
					this[B] = {
						gt: (a, b) => a > b,
						get: (a, b) => a >= b,
						lt: (a, b) => a < b,
						let: (a, b) => a <= b,
						leq: (a, b) => a == b,
						seq: (a, b) => a === b,
						lneq: (a, b) => a != b,
						sneq: (a, b) => a !== b,
					}
				}
				if (C != null) {// help
					// TODO: finish Logic help text
					this[C] = {
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
				return a == !1 ? b == !1 : !1;
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
			near(n1, n2, range=1e-16) {// same as python math.isclose()
				return n1 > n2 - range && n1 < n2 + range ? !0 : !1;
			}
		}
	};
	this.LinkedList = class LinkedList {
		constructor() {
			this.head = null;
			this.size = 0;
			this.Node = class Node {
				constructor(value, next=null) {
					this.value = value;
					this.next = next;
				}
			};
		}
		insertLast(value) {
			if (!this.size) return this.insertFirst(value);
			this.size++;
			for (var current = this.head; current.next;)
				current = current.next;
			current.next = new this.Node(value)
		}
		insertAt(value, index=Infinity) {
			if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
			if (!index) return this.insertFirst(value);
			if (index === this.size) return this.insertLast(value);
			for (var i = 0, current = this.head; i + 1 < index; i++)
				current = current.next;
			this.size++;
			current.next = new this.Node(value, current.next)
		}
		getAt(index) {
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
	};
	this.Types = {
		Boolean: Boolean,
		Number: Number,
		String: String,
		BigInt: BigInt,
		Function: Function,
		Array: Array,
		Object: function Object(input, h=!1) {
			return type(input) === "object" ? input : h == !0 ? {data: input} : void 0
		},
		undefined: ()=>{},
		Symbol: function Symbol(input, h=!1) {
			return type(input) === "symbol" ? input : h == !0 ? Symbol.for(input) : void 0
		}
	};
	{
		const lastElement = () => {
			const A = this.valueOf();
			return A[len(A) - 1];
		};
		NodeList.prototype.last = lastElement,
		HTMLCollection.prototype.last = lastElement,
		Object.prototype.tofar = function toFlatArray() {
			var val = this.valueOf();
			if (["number", "string", "symbol", "boolean", "bigint", "function"].includes(type(val)) || val == null || val?.constructor == 'function Object() { [native code] }')
				return [this.valueOf()].flatten();
			return list(this.valueOf()).flatten();
		},
		Object.copy = copy,
		Object.keyof = function keyof(obj, value) {
			for (const k of Object.keys(obj)) {
				if (obj[k] === value) return k;
			}
			return null;
		},
		Math2.Math.prototype.ComplexNumber = class ComplexNumber {
			constructor(re=0, im=0) {
				this.re = re;
				this.im = im;
			}
			type() {
				return "complexnum";
			}
			isComplex() {
				return this.im === 0 ? !1 : !0;
			}
			toString(char="i") {
				return `${this.re}+${this.im}${char[0]}`;
			}
			toArray() {
				return [this.re, this.im];
			}
		},
		Math2.Math.prototype.Math = math,
		HTMLElement.prototype.ael = HTMLElement.prototype.addEventListener,
		HTMLElement.prototype.rel = HTMLElement.prototype.removeEventListener,
		RegExp.prototype.in = RegExp.prototype.test,
		RegExp.prototype.toRegex = function toRegex() { return this.valueOf() },
		Array.prototype.io = [].indexOf,
		Array.prototype.lio = [].lastIndexOf,
		Array.prototype.sort.sort = [].sort,
		Array.prototype.incl = [].includes,
		Array.prototype.for = function forEachReturn(func, ret) {
			let a = this.valueOf();
			for (var i = 0, n = len(a); i < n; i++)
				func(a[i], i);
			return ret;
		},
		Array.prototype.shift2 = function shift2(num=1) {
			let a = this.valueOf();
			for (var i = 0; i++ < num;)
				a.shift();
			return a;
		},
		Array.prototype.pop2 = function pop2(num=1) {
			let a = this.valueOf();
			for (var i = 0; i++ < num;)
				a.pop();
			return a;
		},
		Array.prototype.splice2 = function splice2(a, b, ...c) {
			var d = this.valueOf();
			d.splice(a, b);
			return c.flatten().for((e, i) => d.splice(a + i, 0, e), d);
		},
		Array.prototype.push2 = function push2(e, ...i) {
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
		},
		Array.prototype.unshift2 = function unshift2(e, ...i) {
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
		},
		Array.prototype.toLList = function toLinkedList() {
			let a = new LinkedList(), b = this.valueOf().reverse();
			for (let i of b) a.insertFirst(i);
			return a;
		},
		Array.prototype.mod = function modify(indexes, func) {
			indexes = indexes.tofar();
			let a = this.valueOf(), n = len(indexes);
			if (type(func, 1) === "arr") func = func.flatten();
			else func = [].len(n).fill(func);
			func = func.extend(len(indexes) - len(func), e => e);

			for (var i = 0; i < n; i++)
				a[indexes[i]] = func[i](a[indexes[i]], indexes[i]);
			return a;
		},
		Array.prototype.remrep = function removeRepeats() {
			return list(new Set(this.valueOf()));
		},
		Array.prototype.slc = function slice(start=0, end=Infinity) {
			for (var a = this.valueOf(), b = [], i = 0, n = len(a); i < n && i <= end; ++i) {
				i >= start && b.push(a[i]);
			}
			return b;
		},
		Array.prototype.swap = function swap(i1=0, i2=1) {
			const A = this.valueOf(), B = A[i1];
			A[i1] = A[i2];
			A[i2] = B;
			return A;
		},
		Array.prototype.rotr3 = function rotate3itemsRight(i1=0, i2=1, i3=2) {
			const A = this.valueOf(), TMP = A[i1];
			A[i1] = A[i3];
			A[i3] = A[i2];
			A[i2] = TMP;
			return A;
		},
		Array.prototype.dupf = function duplicateFromFirst(num=1, newindex=0) {
			return this.valueOf().dup(num, 0, newindex);
		},
		Array.prototype.duptf = function duplicateToFirst(num=1, index=0) {
			return this.valueOf().dup(num, index, 0);
		},
		Array.prototype.dupl = function duplicateFromLast(num=1, newindex=0) {
			var a = this.valueOf();
			return a.dup(num, len(a)-1, newindex);
		},
		Array.prototype.duptl = function duplicateToLast(num=1, index=0) {
			var a = this.valueOf();
			return a.dup(num, index, len(a)-1);
		},
		Array.prototype.dup = function duplicate(num=1, from=null, newindex=Infinity) {
			// by default duplicates the last element in the array
			var a = this.valueOf();
			for (var b = a[from === null ? len(a)-1 : from], j = 0; j++ < num;)
				a.splice(newindex, 0, b);
			return a;
		},
		Array.prototype.rotr = function rotateRight(num=1) {
			var a = this.valueOf();
			for (num %= len(a); num --> 0;)
				a.unshift(a.pop());
			return a;
		},
		Array.prototype.rotl = function rotateRight(num=1) {
			var a = this.valueOf();
			for (num %= len(a); num --> 0;)
				a.push(a.shift());
			return a;
		},
		Array.prototype.rotl3 = function rotate3itemsLeft(i1=0, i2=1, i3=2) {
			var a = this.valueOf(), b = a[i1];
			a[i1] = a[i2];
			a[i2] = a[i3];
			a[i3] = b;
			return a;
		},
		Array.prototype.len = function length(num) {
			var a = this.valueOf();
			a.length = num > 0 ? num : 0;
			return a;
		},
		Array.prototype.extend = function extend(length, filler, form="new") {
			var a = this.valueOf();
			if (form === "new") return a.concat([].len(length).fill(filler));
			else if (form === "total") {
				if (length <= len(a)) return a;
				else return a.concat([].len(length).fill(filler));
			}
			else return a;
		},
		Array.prototype.last = lastElement,
		Array.prototype.startsW = function startsWith(item) {return this.valueOf()[0] === item},
		Array.prototype.endsW = function endsWith(item) {return this.valueOf().last() === item},
		Array.prototype.rev = [].reverse,
		Array.prototype.flatten = function flatten() {return this.valueOf().flat(Infinity)},
		Array.prototype.sortOld = Array.prototype.sort;
		Array.prototype.sort = function sort() {
			var list = this.valueOf();
			if (Math.isNaN(list.join(""))) return list.sortOld();
			for (var output = []; len(list) > 0;) {
				output.push(Math.min(list));
				list.splice(list.io(Math.min(list)), 1);
			} return output;
		},
		Array.prototype.shuffle = function shuffle(times=1) {
			var arr = this.valueOf();
			for (var i = 0; i < times; i++)
				for (var j = 0, n = len(arr), arr2 = []; j < n; j++)
					arr2.splice(round(rand() * len(arr2)), 0, arr.pop());
			return arr2;
		},
		String.prototype.io = "".indexOf,
		String.prototype.lio = "".lastIndexOf,
		String.prototype.startsW = "".startsWith,
		String.prototype.endsW = "".endsWith,
		String.prototype.incl  = "".includes,
		String.prototype.upper = "".toUpperCase,
		String.prototype.lower = "".toLowerCase,
		String.prototype.toObj = function toObj(obj=window) {
			this.valueOf().split(/[.[\]'"]/).filter(e=>e).for(e=>obj=obj[e]);
			return obj;
		},
		String.prototype.hasDupesA = function hasDuplicatesAll() {
			return/(.)\1+/.test(this.valueOf().split("").sort().join(""));
		},
		String.prototype.hasDupesL = function hasDuplicateLetters() {
			return/(\w)\1+/.test(this.valueOf().split("").sort().join(""));
		},
		String.prototype.reverse = function reverse() {return this.valueOf().split("").reverse().join("")},
		String.prototype.remove = function(arg) {return this.valueOf().replace(arg,"")},
		String.prototype.remrep = function removeRepeats() {
			return list(new Set(this.valueOf().split(""))).join("");
		},
		String.prototype.each = function putArgBetweenEachCharacter(arg="") {
			return list(this.valueOf()).join(`${arg}`);
		},
		String.prototype.toFunc = function toNamedFunction(name="anonymous") {
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
		},
		String.prototype.toFun = function toNamelessFunction() {
			return((...a) => () => a[0](this, a))(Function.apply.bind(new Function(this.valueOf())));
		}
		String.prototype.toRegex = function toRegularExpression(f="", form="escaped") {
			var a = this.valueOf();
			if (form === "escaped" || form === "excape" || form === "e")
				for (var i = 0, b = "", l = len(a); i < l; i++)
					b += /[$^()+*\\|[\]{}?.]/.in(a[i])?
						`\\${a[i]}`:
						a[i];
			else return new RegExp(a, f);
			return new RegExp(b, f);
		},
		String.prototype.toNumber = function toNumber() { return 1 * this.valueOf() },
		String.prototype.toNum = "".toNumber,
		String.prototype.toBigInt = function toBigInt() {
			var a = this.valueOf();
			try { return BigInt(a) } catch { throw TypeError(`Cannot convert input to BigInt. input: '${a}'`) }
		},
		String.prototype.pop2 = function pop2() {
			var s = this.valueOf();
			return s.substring(0, s.length - 1);
		},
		String.prototype.unescape = function unescape() {
			return this.valueOf().split("").map(e=>e=="\n"?"\\n":e=="\t"?"\\t":e=="\f"?"\\f":e=="\r"?"\\r":e=="\v"?"\\v":e=="\b"?"\\b":e).join("");
		},
		String.prototype.includes = function(input) {return input.toRegex().in(this.valueOf())},
		String.prototype.start = function start(start="") { // if the string is empty it becomes the argument
			var a = this.valueOf();
			return a ? a : `${start}`;
		},
		String.prototype.begin = function begin(text="") { // basically Array.unshift2
			return `${text}${this.valueOf()}`;
		},
		String.prototype.splitn = function splitNTimes(input, times=1) {
			assert(type(input, 1) === "regex" || type(input, 1) === "str", "function requires a regular expression or a string", dir());
			for (var i = 0, arr = this.valueOf().split(input), arr2 = [], n = len(arr); i < n && i < times; i++)
				arr2.push(arr.shift());
			if (len(arr)) arr2.push(arr.join(""));
			return arr2;
		},
		Number.prototype.isPrime = function isPrime() {// can probably be optimized
			var n = ~~this.valueOf();
			if (n === 2) return !0;
			if (n < 2 || !(n % 2)) return !1;
			for (var i = 3, a = n / 3; i <= a; i += 2) {
				if (!(n % i)) return !1;
			}
			return !0;
		},
		Number.prototype.shl = function(num) {return this.valueOf() << Number(num)},
		Number.prototype.shr = function shr(num) {return this.valueOf() >> Number(num)},
		Number.prototype.shr2 = function(num) {return this.valueOf() >>> Number(num)},
		Number.prototype.inRange = function inRange(n1, n2=arguments[0]) {
			var a = this.valueOf();
			return a >= n1 && a <= n2;
		},
		Number.prototype.isInt = function isInt() {
			var n = this.valueOf();
			return n === int(n);
		},
		BigInt.prototype.shl = function(num) {return this.valueOf() << BigInt(num)},
		BigInt.prototype.shr = function shr(num) {return this.valueOf() >> BigInt(num)},
		BigInt.prototype.shr2 = function(num) {return this.valueOf() >>> BigInt(num)},
		BigInt.prototype.isPrime = function isPrime() {
			var n = this.valueOf();
			if (n === 2n) return !0;
			if (n < 2n || !(n % 2n)) return !1;
			for (var i = 3n, a = n / 3n; i <= a; i += 2n)
				if (!(n % i)) return !1;
			return !0;
		},
		BigInt.prototype.inRange = function inRange(n1, n2) {
			n2 == null && (n2 = n1);
			var a = this.valueOf();
			return a >= n1 && a <= n2;
		};
	}
	(MathVar === true) &&
	(this.Math = new Math2.Math("trig", "help"));
	this.Logic = new Logic.Logic("bit", "eq", "help");
	var exit_1 = false;
	onConflict = onConflict.toLowerCase();
	if (len(CONFLICT_ARR)) {
		switch (onConflict) {
			case "assert": console.assert(!1, "Global Variables Overwritten: %o", CONFLICT_ARR); break;
			case "debug": console.debug("Global Variables Overwritten: %o", CONFLICT_ARR); break;
			case "info": console.info("Global Variables Overwritten: %o", CONFLICT_ARR); break;
			case "warn": console.warn("Global Variables Overwritten: %o", CONFLICT_ARR); break;
			case "log": console.log("Global Variables Overwritten: %o", CONFLICT_ARR); break;
			case "alert": alert(`Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`); break;
			case "return": return `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
			case "throw": throw `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
		}
		exit_1 = true;
	}
	if (len(NOT_ACTIVE_ARR)) {
		switch (onConflict) {
			case "assert": console.assert(!1, "Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
			case "debug": console.debug("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
			case "info": console.info("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
			case "warn": console.warn("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
			case "log": console.log("Not Active Global Variables: %o", NOT_ACTIVE_ARR); break;
			case "alert": alert(`Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`); break;
			case "return": return `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
			case "throw": throw `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
		}
		exit_1 = true;
	}
	return exit_1 ? 1 : 0;
})();
{//bad text encoders
	function num_encoder(numstr, warn=false) {
		const ODD = len(numstr) % 2;
		warn && isNaN(numstr) && console.warn("using non-numbers in num_encoder() causes loss of information");
		return ODD+(numstr+(ODD?"0":"")).match(/../g).map(e=>`${e[0]}${len(`${1*e[0]+1*e[1]}`)===1?1*e[0]+1*e[1]:`${1*e[0]+1*e[1]}`[1]}`).join("");

		// starts with 0 --> even string length
		// starts with 1 --> odd string length
		// if string is odd, add zero on the end

		// split into groups of 2 numbers
		// keep 1st number, and second becomes the sum mod 10.
	}

	function bin_encoder(str) {
		// binary but per character
		str = `${str}`;
		let newstr = "";
		for (let c of str) {
			c = isNaN(c) ? c : (c*1).toString(2);
			while (len(c) < 4) c = `0${c}`;
			newstr += c;
		}
		return newstr;
	}

	function qwerty_encoder(key, type="encode") {
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
			"<": "1409", ".": "0410", ">": "1410", "/": "0411", "?": "1411", " ": "054",
		}
		return type === "encode" || type === "encoder" ? obj[key] : Object.keyof(obj, key);
	} // dvorak encoder?

	function caesar_encoder(str, offset=1) {
		// not exactly a caesar cipher, but same idea.
		const ASCII_LAST_NUM = 127;
		let newstr = "";
		for (const c of str) {
			let num = (charToAscii(c) + offset) % ASCII_LAST_NUM;
			while (num.inRange(1, 8) || num.inRange(11, 12) || num.inRange(14, 31))
				num += Math.sgn(offset);
			newstr += asciiToChar(num);
		}
		return newstr;
	}

	function let_encoder(str, type="encode") {
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
	}

	() => {
		const arr = [
			"аa", "ΑA", "ϲc", "𝗁h", "հh", "іi", "ϳj", "јj",
			"ͿJ", "ЈJ", "յȷ", "𝗄k", "ΚK", "КK", "ΜM", "МM",
			"ոn", "ΟO", "ՕO", "𝗉p", "рp", "ΡP", "РP", "ԛq",
			"ѕs", "ЅS", "ΤT", "ТT", "սu", "ᴠv", "ԜW", "хx",
		],
		check = s => s[0] === s[1],
		checks = a => {
			for (var i = 0, n = len(a); i < n; i++) {
				if (check(a[i])) return [false, i , a[i]];
			}
			return true;
		}
		// base 11 but replace the stuff with these:
		"յͿΡЈ𝗉pJРрPȷ";
		"1234567890a";
	}
}
function dQuery(e) {
	assert(typeof e === "string" || typeof e === "object" || e == null, "function requires a string, an object, or undefined argument", dir());

	class DQuery extends Array {// TODO: refactor the methods
		constructor(value=[], type="") {
			super();
			for (const e of value)
				this.push(e);
			this.type = type;
		}
		// TODO: Add css handling
		// TODO: Add event handling
		// TODO: Add hasClass, addClass, removeClass, and hasId functions
		// TODO: Add replace function

		// TODO: Fix
		set(key, newVal, index) {
			// ex: set("innerHTML", "Hello World");
			if (this.value == null || key == null || newVal == null) return null;
			if (/class|querySelectorAll/.in(this.type)) {
				// TODO: Add support for multiple indexes
				if (index !== undefined) this.value[index][key] = newVal;
				else for (var i = 0, n = len(this.value); i < n; i++)
					this.value[i][key] = newVal;
			} else this.value[key] = newVal;

			return this;
		}

		get(value) {
			return Math.isAN(value) && /class|querySelectorAll/.in(this.type)?
				(value = int(value)) >= 0 ? this.value[value] : this.value[len(this.value) + value]:
				this.value == null || value == null?
					null:
					/class|querySelectorAll/.in(this.type)?
						this.value.map(e => e[value]) : this.value[value];
		}

		html  (text) { return text === undefined ? this.get("innerHTML") : this.set("innerHTML", text) }
		ohtml (text) { return text === undefined ? this.get("outerHTML") : this.set("outerHTML", text) }
		val   (text) { return text === undefined ? this.get(  "value"  ) : this.set(  "value"  , text) }
		id    (name) { return text === undefined ? this.get(   "id"    ) : this.set(   "id"    , name) }
		class (name) { return text === undefined ? this.get("className") : this.set("className", name) }
		// hide() {}
		// show() {}
		
		css   (name) {
			// essentially 'get' but for css
			const MATCH = /-([a-zA-Z])/.exec(name);
			name = MATCH == null ? name : name?.replace(MATCH[0], MATCH[1].toUpperCase());
			return this.value == null ? null :
				/class|querySelectorAll/.in(this.type)?
					name == null ? this.value?.style : this.value?.map(e => e.style[name]):
					name == null ? this.value?.style : this.value.style[name];
		}
	}

	if (typeof e?.constructor === "function" && constr(e) === "DQuery") return e;
	if (e == null || e === "") return new DQuery();

	let value, type, end = true,
		str = ` ${e}`.splitn(/(?=\.|#)|(?<=\.|#)/, 2).map(e => e.trim()).filter(e => e);

	if (len(str) > 3 || !len(str)) throw Error(`invalid input: \`${e}\``);

	switch (str[0]) {
		case "#":
			// TODO fix Object.tofar() for HTMLScriptElements
			value = [document.getElementById(str[1])];
			type = "id";    break;
		case ".":
			value = list(document.getElementsByClassName(str[1]));
			type = "class"; break;
		default: // query selector and (id=all or class=all)
			end = false;
			value = list(document.querySelectorAll(str[0]));
			type = "querySelectorAll";
	}

	if (end || len(str) === 1) return new DQuery(value, type);
	
	// some input like "tagname." with no class
	if (len(str) === 2) throw Error("Invalid input");

	switch (str[1]) {
		case "#":
			value = list(value).filter(e => e.id === str[2]);
			break;
		case ".":
			value = list(value).filter(e => e.className === str[2]);
			break;
		//default: throw "Error: Unreachable";
	}

	return new DQuery(value, type);
}
!this.$ && (this.$ = dQuery);                                                                   
