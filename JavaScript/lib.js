console.assert(!((onConflict, MathVar, alertForMath) => {"use strict";
	onConflict = "debug", MathVar = true, alertForMath = false;
	(()=>{const onConflict_Options = ["log","throw","return","warn","debug","info","assert","alert","None"];})();
		const LIBRARY_FUNCTIONS = ["$qs","len","π","𝑒",Symbol.for("<0x200b>"),Symbol.for("<0x08>"),"json","copy","assert","help","dir","nSub","reverseLList","convertType","firstDayOfYear","type","round","floor","ceil","int","str","numToAccountingStr","range","asciiToChar","charToAscii","numToWords","numToStrW_s","Logic","LinkedList","Types"]
		, NOT_ACTIVE_ARR = ["$","revArr","timeThrow"].map(e=>[this[e]!=null,e]).filter(e=>e[0]).map(e=>e[1])
		, CONFLICT_ARR = LIBRARY_FUNCTIONS.map(e=>[this[e]==null,e]).filter(e=>!e[0]).map(e=>e[1]);
		(MathVar === !0 && alertForMath === !0) && CONFLICT_ARR.push("Math");
	const math = Math;
	this.$ ??= function $(e) {return document.getElementById(e)};
	this.$qs = function $qs(e, b=null) {return b ? document.querySelector(e) : document.querySelectorAll(e)};
	this.len = function length(e) {return e?.length};
	this.π = 3.141592653589793;
	this.𝑒 = 2.718281828459045;
	this[Symbol.for("<0x200b>")] = "​";
	this[Symbol.for("<0x08>")] = "";
	this.json = JSON;
	this.copy = function copy(object) {return json.parse(json.stringify(object))};
	this.assert = function(condition, message="No Message Given", loc="") {
		if (!condition) throw `failed assertion at ${loc===""?"No Location Given":loc}: ${message}`;
		return 0;
	};
	this.help = function help(str) {
		try { eval(str) }
		catch (e) {
			// str is a keyword
			if (/SyntaxError: Unexpected token '.+'/.test(`${e}`)) {
				open(`https://developer.mozilla.org/en-US/search?q=${/'(.+)'/.exec(`${e}`)[1]}`, "_blank");
				return "Keyword";
			}
			// str is a keyword like 'function' or 'new'
			if (`${e}` === "SyntaxError: Unexpected end of input") {
				open(`https://developer.mozilla.org/en-US/search?q=${str}`, "_blank");
				return "Keyword";
			}
		}
		try {
			if (`${new Function(`return ${str}`)()}`.includes(/\(\) { \[native code\] }/))
				open(`https://developer.mozilla.org/en-US/search?q=${str}`, "_blank");
			return `Function: arguments -> ${`${new Function(`return ${str}`)()}`.remove(/\s*{(.|\s)*|\s*=>(.|\s)*|function\s*\w*/g).substr(1).pop2().start("None")}`;
		} catch { return "Variable not found" }
	};
	this.dir = function currentDirectory(loc=new Error().stack) {
		return `${loc}`.substr(13).remove(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g)
	};
	this.nSub = function substituteNInBigIntegers(a, n=1) {return type(a) === "bigint" ? Number(a) * n : a};
	this.revArr ??= function reverseArray(a) {
		for (var l = 0, L = len(a), r = L - 1, t; l < r; ++l, --r)
			t = a[l], a[l] = a[r], a[r] = t;
		return a;
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
	this.convertType = function convertType(e, E, f="throw", h=!1) {
		/*  e: the input.  E: the type you want.  if f == "throw", throw an error if there is one, else return undefined upon an error.  if h is true, it will convert things to symbols or objects if needed, otherwise it will give an error*/
		if (E == null || e == null) throw Error(`No type or input given. input: ${e}. type: ${E}`);
		if (type(e) == E) return e;
		switch (E) {
			case "string": return `${e}`;
			case "boolean": return !!(e);
			case "undefined": return;
			case "number":
				e = Number(e);
				if (Math.isNaN(e)) {
					if (f !== "throw") return;
					throw Error(`cannot convert ${type(e)} to number`);
				}
				return e;
			case "bigint":
				if (type(e) === "number" || Math.isAN(Number(e))) return BigInt(e);
				if (type(e) === "bigint") return e;
				if (f !== "throw") return;
				throw Error(`cannot convert ${type(e)} to bigint`);
			case "function":
				if (type(e) === "function") return e;
				return Function(e);
			case "symbol":
				if (h !== !1) return Symbol.for(e);
				if (f !== "throw") return;
				throw Error(`cannot convert ${type(e)} to symbol`);
			case "object":
				if (type(e) === "object") return e;
				if (h !== !1) return{data: e};
				if (f !== "throw") return;
				throw Error(`cannot convert ${type(e)} to object`);
			default:
				if (f !== "throw") return;
				throw Error(`Invalid Type: ${E}`);
		}
	};
	this.firstDayOfYear = function findWeekDayNameOfFirstDayOfYear(Year, form="number") {
		if(type(form, 1) !== "str")
			throw Error(`Invalid input for second paramater: ${form}. Expected a string but found a(n) ${type(form)}`);
		var a = (1 + --Year % 4 * 5 + Year % 100 * 4 + Year % 400 * 6) % 7;
		form = form.toLowerCase(), Year = ~~Year;
		return form === "number"?
			a:
			form[0] === "s"?
				a === 0?
					"Sunday":
					a === 1?
						"Monday":
						a === 2?
							"Tuesday":
							a === 3?
								"Wednesday":
								a === 4?
									"Thursday":
									a === 5?
										"Friday":
										a === 6?
											"Saturday":
											Error(`Invalid Input: (Year: ${Year+1}). output: ${a}.`):
				Error(`Invalid output form: ${form}. try "number" or "string"`)
	};
	this.type = function type(a, b) {
		return b == null || typeof a !== "number" && typeof a !== "object" && typeof a !== "function" && typeof a !== "string" && typeof a !== "boolean"?
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
	this.timeThrow ??= function timeThrow(message="Error Message Here.", run=false){
		let a = new Date().getHours();
		if (a > 22 || a < 4) throw Error("Go to Sleep.");
		if (run === false) throw Error(`${message}`);
		type(run, 1) === "func" && run();
	};
	this.round = function round(n) {return type(n, 1) !== "num" ? n : n%1*(n<0?-1:1)<.5 ? ~~n : ~~n+(n<0?-1:1)};
	this.floor = function floor(n) {return type(n, 1) !== "num" ? n : ~~n-(n<0&&n%1!=0?1:0)};
	this.ceil = function ceil(n) {return type(n, 1) !== "num" ? n : ~~n+(n>0&&n%1!=0?1:0)};
	this.int = parseInt;
	this.str = function String(a, b) {return b < 36 && b >= 2 ? a.toString(int(b)) : a+""};
	this.list = Array.from;
	this.numToAccStr = function numberToAccountingString(n) {return n<0 ? `(${-n})` : n+""};
	this.range = function range(start, stop, step=1) {
		stop == null && (stop = start - 1, start = 0);
		return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
	},
	this.asciiToChar = function asciiNumToChar(num) {
		switch (num) {// change back to original.
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
	this.numToWords = function numberToWords(number) {
		if (isNaN(Number(number))) throw Error(`Expected a number, and found a(n) ${type(number)}`);
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
		for (var i = 0, str2 = "", str = `${number}`.reverse(); i < len(str); i++)
			(i % 3 === 0 && i !== 0) && (str2 += "_"), str2 += str[i];
		return str2.reverse();
	};
	var Math2 = {
		Math: class Math {
			constructor(A, B) {
				this.e = 𝑒,
				this.phi = 1.618033988749895,
				this.pi = π,
				this.fround = math.fround,
				this.random = math.random,
				this.imul = math.imul,
				this.clbz = function clz32(n) {
					if (type(n, 1) !== "num") return NaN;
					if (n < 0 || n > 2**31-1) return 0;
					n = n.toString(2);
					for (;len(n) < 32; n = `0${n}`);
					return len(n.remove(/1.*/))
				},
				this.fact = function floatFactorial(n, bigint=false, acy=1e3) {
					if (~~n===n) return this.ifact(n, bigint);
					if (type(n = this.int(0, acy, x=>x**n/𝑒**x, .1), 1) === "inf") return NaN;
					return n;
				},
				this.sgn = function sign(n) {return type(n, 1) !== "num" ? NaN : n == 0 ? n : n<0 ? -1 : 1},
				this.abs = function abs(n) {return this.sgn(n)*n},
				this.sum = function summation(n, l, s=n=>n, r=1) {
					for (var t = 0; n <= l; n += r)
						t += s(n);
					return t;
				},
				this.prod = function piProductFunction(n, l, s=n=>n, r=1) {
					for (var t = 1; n <= l; n += r)
						t *= s(n);
					return t;
				},
				this.gamma = function gammaFunction(n, a=1e3) {
					if (~~n === n) return this.ifact(n-1);
					if (type(n = this.int(0, a, x=>x**(n-1)/𝑒**x, .1), 1) === "inf") return NaN;
					return n;
				},
				this.int = function integral(x, e, q=x=>x, t=.001) {
					for (var a = 0; x < e; x += t)
						a += (q(x) + q(x + t)) / 2 * t;
					return a;
				},
				this.hypot = function hypotenuse(...n) {
					n = n.flatten();
					for (var a = 0, i = 0; i < len(n); i++)
						a += n[i]**2;
					return a**.5;
				},
				this.ln = function ln(n) {return this.log(n, 𝑒)},
				this.log = function log(a, b=10, g=50) {
					if (b <= 0 || b === 1 || a <= 0 || type(a, 1) !== "num") return NaN;
					type(g, 1) !== "num" && (g = 50), type(b, 1) !== "num" && (b = 10);
					if (b == a) return 1;
					if (a == 1) return 0;
					for (var e = 1, c = !0, d, f = 1, i = 0; c;)
						(d = this.abs(a-b**e)) > this.abs(a-b**(e+1))?
							++e:
							d > this.abs(a-b**(e-1))?
								--e:
								c = !1;
					for (;i < g; ++i)
						(d = this.abs(a-b**e)) > this.abs(a-b**(e+(f/=2)))?
							e += f:
							d > this.abs(a-b**(e-f)) && (e -= f);
					return e;
				},
				this.max = function max(...n) {
					n = n.flatten();
					let m = n[0];
					for (let i of n) m = i > m ? i : m;
					return m;
				},
				this.min = function min(...n) {
					n = n.flatten();
					let m = n[0];
					for (let i of n) m = i < m ? i : m;
					return m;
				},
				this.trunc = function truncate(n) {return type(a[0], 1) !== "num" ? a[0] : ~~a[0]},
				this.nthrt = function nthRoot(x,n=2) {
					if (n < 0)return x**n;
					if (n === 0 || n % 2 === 0 && x < 0) return NaN;
					if (x === 0) return 0;
					for (var p, c = x, i = 0; p !== c && i < 100; i++)
						p = c, c = ((n-1)*p**n+x) / (n*p**(n-1));
					return c;
				},
				this.complex = function complexNumber(a,b) {return new this.ComplexNumber(a,b)},
				this.mad = function meanAbsoluteDeviation(...a) {
					var m, l = this.mean(a = a.flatten());
					a.forEach(b => m += this.abs(b-l));
					return m / len(a);
				},
				this.mean = function mean(...a) {
					a = a.flatten();
					var l = 0;
					a.forEach(b => l += b);
					return l / len(a);
				},
				this.median = function median(...a) {
					a = a.flatten().sort();
					for (; len(a) > 2;)
						a.pop(), a.shift();
					return len(a) == 1 ? a[0] : a.slc(0,2) / 2
				},
				this.isPrime = function isPrime(n) {
					return type(n) !== "number" && type(n) !== "bigint" ? false : n.isPrime();
				},
				this.lmgf = function leastCommonMultipleGreatestCommonFactor(t,...a) {
					a = a.flatten().map(b => int(b) * (b<0 ? -1 : 1));
					for (let c, i = t[0] === "l" ? this.max(a) : this.min(a); ; t[0] === "l" ? ++i : --i ) {
						for (let j = len(a) - 1; j >= 0; --j) {
							if (t[0] === "l" ? i % a[j] : a[j] % i) {
								c = !1;
								break;
							}
							c = !0;
						}
						if (c) return i;
					}
					throw Error("unreachable");
				},
				this.linReg = function linearRegression(x1, y1, Return="obj") {
					x1 = [x1].flatten();
					y1 = [y1].flatten();
					const dim = list => len(list) - 1;
					if (len(x1) === 0) throw Error("No elements given for first paramater");
					if (len(y1) === 0) throw Error("No elements given for second paramater");
					if (isNaN(x1.join("")*1)) throw Error(`array of numbers req. for first paramater. Inputs: ${x1}`);
					if (isNaN(y1.join("")*1)) throw Error(`array of numbers req. for second paramater. Inputs: ${y1}`);
					if (len(x1) === 1 || len(y1) === 1) {
						if (Return === "obj") return {
							m: y1[0] / x1[0],
							b: 0
						};
						return `y = ${y1[0] / x1[0]}x + 0`;
					}
					if (len(x1) !== len(y1)) {
						var min = this.min(len(x1), len(y1));
						for (; len(x1) > min;) x1.pop();
						for (; len(y1) > min;) y1.pop();
					}
					var m = (
						len(x1) * this.sum(0, len(x1)-1, n=>x1[n]*y1[n]) -
						this.sum(0, dim(x1), n=>x1[n]) * this.sum(0, dim(y1), n=>y1[n])
					)/(len(x1) * this.sum(0, dim(x1), n=>x1[n]**2) - this.sum(0, dim(x1), n=>x1[n])**2),
					b = (this.sum(0, dim(x1), n=>y1[n]) - m * this.sum(0, dim(x1), n=>x1[n])) / len(x1);
					if (Return === "obj") return {m: m, b: b};
					return `y = ${m}x + ${b}`;
				},
				this.pascal = function pascalTriangle(row, col) {
					if (null == (row = convertType(row, "number", "return")))
						throw Error(`Number Required for first paramater. Input:${row}`);
					if ("all" !== col) col = convertType(col, "number", "return");
					if (type(col, 1) !== "num" && col !== "all")
						throw Error(`Number or String "all" Required for second paramater. Input:${col}`);
					if (col?.toLowerCase() !== "all") return this.nCr(row, col-1);
					for (var i = 0, arr = []; i <= row;) arr.push(this.nCr(row, i++));
					return arr;
				},
				this.fib = function fibonacciNumbers(index) {
					if (index > 1475) return Infinity;
					for (var j = 0, s = [0, 1]; j < index; ++j)
						s.push(s[1] + s.shift());
					return index > 2 ? s[1] : s[0];
				},
				this.primeFactorInt = function factorIntPrime(number) {
					var primeFactors = [];
					if (type(number) !== "number") return NaN;
					if (number.isPrime()) return number;
					for (var i = 2; i <= number; ++i)
						if (number % i === 0)
							primeFactors = primeFactors.push2(factorIntPrime(i)).flatten(),
							number /= i,
							i = 1;
					return primeFactors;
				},
				this.factorIntAll = function findAllFactors(number) {
					for (var i = 2, factors = [1]; i <= number; i++)
						if (number % i === 0)
							factors.push(i);
					return factors;
				},
				this.intLargestFactor = function largestFactor(number) {
					if(this.isNaN(number)) return NaN;
					for (var i = number; i >= 0;) {
						if (number % --i === 0) return i;
					}
				},
				this.synthDiv = function syntheticDivision(coeffs, /*(x=*/divisor) {
					for (var coeff = coeffs[0] * divisor + coeffs[1], newCoeffs = [coeffs[0], coeff], n = coeffs.length-1, i = 1; i < n; i++) {
						coeff = coeff * divisor + coeffs[i + 1];
						newCoeffs.push(coeff);
					}
					return newCoeffs;
				},
				this.polynomial = function polynomialRealRationalSolutions(L1) {
					return "unfinished";
					const dim = list => len(list) - 1;
					var L2, A = 0, B = 1-1, C, L4, X, L3, L5;
					// store factors of L1[0] into LQ
					// store factors of L1[len(L1)-1] into LP
					// continue at line 65
					L2 = [1, 1];
					if (L1[dim(L1)] === 0) {
						L2.unshift(0);
					}
					while (dim(LP) - A > 0) {
						while (dim(LQ) - B > 0) {
							C = LP[dim(LP) - A] / LQ(dim(LQ) - B);
							if (L2.every(e => e === 0)) {
								L2.push(C);
								L2.push(-C);
							}
							B++;
						}
						A++;
						B = 0;
					}
					A = 1-1;
					L4 = [0];
					B = dim(L2) - 2;
					while (A < dim(L2)) {
						X = L2[A];
						C = L1[1-1]*X + L1[2-1];
						L3 = [L1[1-1], C];
						for (var D = 1-1; D < B; D++) {
							C = C*X + L1[D + 2];
							L3.push(C);
						}
						if (L3[dim(L3)] < 1e-10 && L3[dim(L3)] > 1e-10) {
							L4.push(L2[A]);
						}
						A++
					}
					if (1 === dim(L4)) {
						//Goto D;
					}
					B = dim(L4);
				},
				this.areaRegPoly = function areaOfRegularPolygon() {
					return "unfinished";
				},
				this.simpRad  =function simpRads(R) {
					for (var A = 1, i = 2, N = Math.sqrt(Math.abs(R)); i < N; i += 1 + (i > 2))
						for (;!(R % i**2);) R /= i**2, A *= i;
					return `${A}${R < 0 ? "i" : ""}√${Math.abs(R)}`.remove(/^1|√1$/);
				}
				this.PythagoreanTriples = function principlePythagoreanTripleFinder(maxSize=1000) {
					for (var a = 1, b = 1, c, triples = []; a < maxSize; a++) {
						for (b = 1; b < maxSize; b++) {
							c = Math.sqrt(a**2 + b**2);
							if (c === ~~c && !triples.filter(item => !(a % item[0] !== 0 && b % item[1] !== 0 && c % item[2] !== 0) && !(a % item[1] !== 0 && b % item[0] !== 0 && c % item[2] !== 0)).length) triples.push([a, b, c]);
						}
					}
					return triples;
				},
				this.add = function add(...a) {
					a = a.flatten();
					for (var i = len(a) - 1, t = 0; i >= 0; --i)
						t += a[i];
					return t;
				},
				this.nCr = function nCr(n,k, bigint=false) {
					return this.fact(n, bigint) / (this.fact(k, bigint) * this.fact(n-k, bigint))
				},
				this.nPr = function nPr(n,k) {return this.fact(n) / this.fact(n-k)},
				this.isNaN = function isNaN(e) {return Logic.is(Number(e),NaN) ? !0 : !1},
				this.isAN = function isANumber(e) {return !this.isNaN(e)},
				this.copySign = function copysign(a,b) {return this.abs(a) * this.sgn(b)},
				this.degrees = function convertRadiansToDegrees(n) {return n * π / 180},
				this.dist = function dist(x1, y1, x2, y2) {return this.sqrt((x2-x1)**2 + (y2-y1)**2)},
				this.erf = function erf(z) {return 2 / this.sqrt(π) * this.int(0, z, t=>1 / 𝑒**(t**2))},
				this.erfc = function erfc(n) {return 1 - this.erf(n)},
				this.isClose = function isClose(a, b, c=1e-16) {return a > b - c && a < b + c ? !0 : !1},
				this.radians = function convertDegreesToRadians(n) {return n * 180 / π},
				this.parity = function parity(...a) {
					return len(a)-1  ?  a.flatten().map(b=>b%2 ? "odd" : "even")  :  a[0]%2 ? "odd" : "even";
				};
				if (B != null) {
					this[B] = {
						fround: "returns the nearest 32-bit single precision float representation of a number.",
						imul: "returns the result of the C-like 32-bit multiplication of the two parameters.",
						random: "returns a random number in the range (0,1]",
						clbz: "takes one paramater.  same as original Math.clz32. stands for count leading binary zeros",
						fact: "takes one paramater.  returns the factorial of a number. Also works for floats.",
						sgn: "takes one paramater.  returns the sign of a number.  If input is NaN, returns NaN.  If  input == 0, returns the input.  If the input is positive, returns 1.  If the input is negative, returns -1.",
						abs: "takes one paramater.  returns sign(input) * input, which always returns a positive number or zero.",
						sum: "stands for summation.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to sum each time, in the form of a function that takes in one paramater. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
						prod: "stands for product operator.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to multiply by each time, in the form of a function with an input and output. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
						gamma: "stands for gamma function. gamma(x) = factorial(x-1).  Takes three paramaters.  1: the number to take the gamma function of.  2: accuracy of the function (default is 1000). 3: rest parameter that does nothing.  if the number is an integer returns ifact(n-1). else, it does the integral from 0 to a, of x**(n-1)/𝑒**x.  if this is Infinity, return NaN, otherwise, it returns the answer.",
						int: "stands for integral.  Takes 4 arguments.  1: starting value (inclusive).  2: ending value (exclusive).  3: what you are taking the integral of, in the form of a function with an input, and an output.  4: rectangle size, or in other words, the accuracy, where smaller is more accurate.  the accuracy is defaulted to 0.001, and it is defaulted to taking the integral of y=x.",
						hypot: "Stands for hypotenuse.  Takes in any amount of parameters, either directly or in one or many array(s).  for each argument, adds the square to the total.  then takes the square root of the total.",
						ln: "Takes 1 paramater, and returns the natural logarithm of the number.  the same as the original Math.log. returns log(input, 𝑒).",
						log: "Takes 2 paramaters.  1: number you are taking the logarithm of.  2: base of the logarithm. eg: log(3,6) = log₆(3). the base is defaulted to 10.",
						max: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the largest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
						min: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the smallest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
						trunc: "Takes any amount of parameters, either directly or in one or many array(s).  If there is only one input, it will truncate it, and return it, otherwise, it will return an array of truncated values.",
						nthrt: "Takes 2 paramaters (x, n).  returns x**(1/n).  the root defaults to 2.",
						complex: "Creates a complex number",
						mad: "Stands for mean absolute deviation.  takes any amount of arguments, either directly or in one or many array(s).  gets the mean of the arguments.  then finds the mean of the absolute deviation from the mean.",
						mean: "Takes any amount of arguments, either directly or in one or many array(s).  adds up the arguments, and divides by the number of arguments present. and returns the answer.",
						median: "Takes any amount of arguments, either directly or in one or many array(s).  it removes items from the end and beginning until there are either one or two elements remaining. if there is one, it returns it.  if there are two, it returns the average of them.",
						isPrime: "Takes 1 input, and returns true if it is prime, false if it is composite.",
						lmgf: "stands for lcm gcf.  Takes at least two arguments.  if the first argument is equal tp \"lcm\" or \"l\" (lowercase L), it will perform the least common multiple. otherwise,  it will do the greatest common factor.  the rest of the paramaters can be inputed either directly, or as one or many arrays.  any arguments that are not numbers or bigInts are ignored, as long as it is not the second argument.",
						linReg: "Takes 3 paramates. finds the line of best fit (y = mx + b), given the x and y coordinates as arrays. 1: x-coordinates.  2: y-coordinates.  3: if this is \"obj\", then it returns an object, otherwise it returns it as a string",
						pascal: "Takes 2 arguments.  1: row.  2: col in row.  if the column is less than 1 or greater than row + 1, it will return NaN. otherwise, if col is not \"all\", it will return nCr(row,col-1). if col is equal to \"all\", it will return an array of all the numbers in that row of pascals triangle.",
						fib: "Stands for fibonacci. returns the fibonacci sequence number of the inputed index.  If floats are inputed, then it will effectively return fib(ceil(input)).  Currently negative indexes are not implemented.  fib(0) returns 0, fib(1) returns 1, fib(2) returns 1, fib(3) returns 2, etc.",
						factorIntAll: "Takes 1 argument. 1: a number. finds all integer factors of said number",
						intLargestFactor: "Takes 1 argument. 1: a number. returns the largest factor of said number",
						synthDiv: "Takes 2 arguments. 1: coefficients of the variables. 2: the divisor.  the equation should take the form of ax^n + bx^(n-1) + cx^(n-2) + ... + constant",
						PythagoreanTriples: "Takes one argument. 1: max size. finds all principle pythagorean triples such that a**2 + b**2 = c**2, a < max size, and b < max size, and a, b, and c are all integers.",
						add: "Takes any amount of arguments, either directly or in one or many array(s).  adds all of the arguments together and returns the answer.",
						nCr: "Stands for n Choose r. takes 2 arguments.",
						nPr: "Stands for n Permute r. takes 2 arguments.",
						isNaN: "Similar to isNaN(). takes one paramater.  if it can be coerced to be a number, it returns false.  the difference is that it returns false for bigints instead of throwing an error.",
						isAN: "Takes one argument.  returns the opposite of Math.isNaN()",
						copySign: "takes 2 arguments. 1: number to keep the value of (x). 2: number to keep the sign of (y). returns |x|sign(y)",
						degrees: "Takes 1 argument. 1: angle in radians. converts radians to degrees",
						dist: "Takes 4 arguments: (x1, y1, x2, y2). retrns the distance between the two points",
						erf: "Takes one numeric argument \"z\". returns 2/√(π)*∫(0, z, 𝑒^-(t^2))dt. In mathematics, it is called the \"Gauss error function\"",
						erfc: "Takes 1 numeric argument \"z\". return 1 - erf(z).",
						isClose: "Takes 3 arguments. 1: number a. 2: number b.  3: number c. if a third argument is not provided, it will be set to 1e-16.  returns true if number a is in range c of number b, otherwise it returns false.",
						radians: "Takes 1 argument. 1: angle in degrees. converts degrees to radians",
						parity: "Takes any amount of arguments directly, or in an array.  if there is one argument, it will return even or odd as a string.  if there 2 or more arguments, it will return an array of strings.",
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
							atan2: "takes two arguments a and b.  returns cos(a) / sin(b) (radians)",
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
								atan: "1 argument. returns 180/π atan argument",
								atan2: "2 arguments. returns cos(arg1) / sin(arg2) (degrees)",
								acsc: "1 argument. returns asin(1/arg)",
								asec: "1 argument. returns acos(1/arg)",
								acot: "1 argument. if the argument is loosely equal to zero, returns 90.  if the argument is less than zero, returns 180 + atan(arg), otherwise it returns atan(arg)."
							}
						},
						lcm: "returns the least common multiple of a list of numbers",
						gcf: "retirns the greatest common factor of a list of numbers",
						ln1p: "Takes one argument.  returns ln(1+arg). the same as original Math.log1p",
						sign: "Alternate spelling for sgn",
						pow: "Takes two arguments (a,b).  similar to a**b.",
						mod: "Takes two arguments (a,b).  similar to a%b.",
						exp: "Takes one argument (n, x=Math.E).  returns x ** n",
						gcd: "Alternate spelling of gcf",
						sqrt: "Takes one argument. returns nthrt(arg)",
						cbrt: "Takes one argument.  returns the cube root of the argument.",
						ifact: "Returns the factorial of a number, and disregards all numbers in decimal places.",
						findPrimes: "Takes two paramaters.  1: maximum number of primes to be returned.  2: maximum size (inclusive) for the desired numbers"
					}
				}
				if (A != null && A !== "default") {
					this[A] = {
						sin:x=>this.sum(0, 25, n=>(-1)**n / this.fact(2*n+1) * (x%(2*π))**(2*n+1)),
						cos:x=>this.sum(0, 25, n => (-1)**n / this.fact(2*n) * (x%(2*π))**(2*n)),
						tan:function tan(n) {return this.sin(n) / this.cos(n)},
						csc:function csc(n) {return 1 / this.sin(n)},
						sec:function sec(n) {return 1 / this.cos(n)},
						cot:function cot(n) {return 1 / this.tan(n)},
						asin:x=>x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n => this.fact(2*n) / (4**n * this.fact(n)**2 * (2*n+1)) * (x**(2*n+1))),
						acos:function acos(n) {return π/2 - this.asin(n)},
						atan:math.atan,
						atan2:function atan2(a,b) {return this.atan(a / b)},
						acsc:function acsc(n) {return this.asin(1 / n)},
						asec:function asec(n) {return this.acos(1 / n)},
						acot:function acot(n) {return n === 0 ? π/2 : n < 0 ? π + this.atan(1/n) : this.atan(1/n)},
						sinh:x => this.sum(0, 10, n => x**(2*n+1) / this.fact(2*n+1)),
						cosh:x => this.sum(0, 10, n => x**(2*n) / this.fact(2*n)),
						tanh:function tanh(n) {return this.sinh(n) / this.cosh(n)},
						csch:function csch(n) {return 1 / this.sinh(n)},
						sech:function sech(n) {return 1 / this.cosh(n)},
						coth:function coth(n) {return 1 / this.tanh(n)},
						asinh:n=>this.ln(n + this.sqrt(n**2 + 1)),
						acosh:n=>this.ln(n + this.sqrt(n**2 - 1)),
						atanh:n=>this.ln((n+1) / (1-n)) / 2,
						acsch:function acsch(n) {return this.asinh(1/n)},
						asech:function asech(n) {return this.acosh(1/n)},
						acoth:function acoth(n) {return this.atanh(1/n)},
						deg: {
							sin:x=>this.sum(0, 25, n=>(-1)**n/this.fact(2*n+1)*((x*π/180)%(2*π))**(2*n+1)),
							cos:x=>this.sum(0, 25, n=>(-1)**n/this.fact(2*n)*((x*π/180)%(2*π))**(2*n)),
							tan:function tan(n) {return this.sin(n)/this.cos(n)},
							csc:function csc(n) {return 1/this.sin(n)},
							sec:function sec(n) {return 1/this.cos(n)},
							cot:function cot(n) {return 1/this.tan(n)},
							asin:x => x > 1 || x < -1?
								NaN:
								this.sum(0,80,n=>this.fact(2*n)/(4**n*this.fact(n)**2*(2*n+1))*(x**(2*n+1)))*180/π,
							acos:function acos(n) {return 90 - this.asin(n)},
							atan:n => this[A].atan(n) * 180 / π,
							atan2:(a,b) => this[A].atan2(a,b) * 180 / π,
							acsc:function acsc(n) {return this.asin(1/n)},
							asec:function asec(n) {return this.acos(1/n)},
							acot:function acot(n) {return n === 0 ? 90 : n < 0 ? 180 + this.atan(1/n) : this.atan(1/n)}
						}
					}
				} else {
					this.sin = function sin(x) {return this.sum(0,25,n=>(-1)**n/this.fact(2*n+1)*(x%(2*π))**(2*n+1))},
					this.cos = function cos(x) {return this.sum(0,25,n=>(-1)**n/this.fact(2*n)*(x%(2*π))**(2*n))},
					this.tan = function tan(n) {return this.sin(n)/this.cos(n)},
					this.csc = function csc(n) {return 1 / this.sin(n)},
					this.sec = function sec(n) {return 1 / this.cos(n)},
					this.cot = function cot(n) {return 1 / this.tan(n)},
					this.asin = function asin(x) {
						return x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n=>this.fact(2*n) / (4**n*this.fact(n)**2 * (2*n+1))*(x**(2*n+1)));
					},
					this.acos = function acos(n) {return π/2 - this.asin(n)},
					this.atan = math.atan,
					this.atan2 = function atan2(a,b) {return this.atan(a/b)},
					this.acsc = function acsc(n) {return this.asin(1/n)},
					this.asec = function asec(n) {return this.acos(1/n)},
					this.acot = function acot(n) {return n === 0 ? π/2 : n < 0 ? π + this.atan(1/n) : this.atan(1/n)},
					this.sinh = function sinh(x) {return this.sum(0, 10, n => x**(2*n+1) / this.fact(2*n+1))},
					this.cosh = function cosh(x) {return this.sum(0, 10, n => x**(2*n) / this.fact(2*n))},
					this.tanh = function tanh(n) {return this.sinh(n) / this.cosh(n)},
					this.csch = function csch(n) {return 1 / this.sinh(n)},
					this.sech = function sech(n) {return 1 / this.cosh(n)},
					this.coth = function coth(n) {return 1 / this.tanh(n)},
					this.asinh = function asinh(n) {return this.ln(n + this.sqrt(n**2+1))},
					this.acosh = function acosh(n) {return this.ln(n + this.sqrt(n**2-1))},
					this.atanh = function atanh(n) {return this.ln((n+1) / (1-n)) / 2},
					this.acsch = function acsch(n) {return this.asinh(1/n)},
					this.asech = function asech(n) {return this.acosh(1/n)},
					this.acoth = function acoth(n) {return this.atanh(1/n)},
					this.degTrig = {
						sin: x=> this.sum(0, 25, n=>(-1)**n/this.fact(2*n+1)*((x*π/180)%(2*π))**(2*n+1)),
						cos: x=>this.sum(0, 25, n=>(-1)**n/this.fact(2*n)*((x*π/180)%(2*π))**(2*n)),
						tan: function tan(n) {return this.sin(n)/this.cos(n)},
						csc: function csc(n) {return 1 / this.sin(n)},
						sec: function sec(n) {return 1 / this.cos(n)},
						cot: function cot(n) {return 1 / this.tan(n)},
						asin: x => x > 1 || x < -1?
							NaN:
							this.sum(0, 80, n=>this.fact(2*n)/(4**n*this.fact(n)**2*(2*n+1))*x**(2*n+1))*180/π,
						acos: function acos(n) {return 90 - this.asin(n)},
						atan: function atan(n) {return this.atan(n) * 180 / π},
						atan2: (a, b) => this.atan2(a, b) * 180 / π,
						acsc: function acsc(n) {return this.asin(1/n)},
						asec: function asec(n) {return this.acos(1/n)},
						acot: function acot(n) {return n === 0 ? 90 : n < 0 ? 180 + this.atan(1/n) : this.atan(1/n)}
					};
				}
			}
			lcm(...a) {return this.lmgf("lcm", a)}
			gcf(...a) {return this.lmgf("gcf", a)}
			ln1p(n) {return this.ln(n + 1)}
			sign(n) {return this.sgn(n)}
			pow (a=1, b=1) {
				for (var y = 1, c = b;; a **= 2) {
					(b & 1) != 0 && (y *= a), b >>= 1;
					if (b == 0) return (this.nthrt(a, 1 / (c - ~~c)) || 1) * y;
				}
			}
			mod(a,b) {/*untested*/
				if (b == 0 || this.isNaN(a + b)) return NaN;
				if (a >= 0 && b > 0)
					for (;a - b >= 0;) a -= b;
				if (a < 0 && b > 0)
					for (;a < 0;) a += b;
				if (a > 0 && b < 0)
					for (;a > 0;) a += b;
				if (a < 0 && b < 0)
					for (;a - b < 0;) a -= b;
				return a;
			}
			exp(n, x=𝑒) {return x ** n}
			gcd(...a) {return this.lmgf("gcd", a)}
			sqrt(n) {return n >= 0 ? this.nthrt(n) : n == null ? 0 : `0+${this.nthrt(-n)}i`}
			cbrt(x) {return this.nthrt(x, 3)}
			ifact(n, bigint=false) {
				if (this.isNaN(Number(n))) return NaN;
				if (n === 0) return bigint === true ? 1n : 1;
				for (var ans = 1n, cur = 1n; cur <= n; cur++) ans *= cur;
				return bigint === true ? ans : Number(ans);
			}
			findPrimes(l=100,s=Infinity) {
				for (var i = 3, p = [1,2]; len(p) < l && i <= s; i += 2)
					i.isPrime() && p.push(i);
				return p;
			}
		}
	};
	this.Logic = {
		Logic: class Logic {
			constructor(A, B, C) {
				if (A != null) {
					this[A] = {
						right:function bitwiseRightShift(a,b) {return a >> b},
						right2:function bitwiseUnsignedRightShift(a,b) {return a >>> b},
						left:function bitwiseLeftShift(a,b) {return a << b},
						or:function bitwiseOr(a,b) {return this.xor([a,b], [1,2])},
						and:function bitwiseAnd(...a) {return type(a[0], 1) !== "arr" ? this.xor(a, len(a)) : this.xor(a[0], len(a[0]))},
						not:function bitwiseNot(...a) {return (a = a.flatten()) && len(a) == 1 ? ~a[0] : a.map(b => ~b)},
						nil:function bitwiseNil(...b) {return (b = b.flatten()) && this.xor(b, [0])},
						xor:function BitwiseXor(a,n=[1]) {
							if (isNaN((a = [a].flatten()).join("") * 1)) throw Error("numbers req. for 1st array");
							if (isNaN((n = [n].flatten()).join("") * 1)) throw Error("numbers req. for 2nd paramater");
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
				if (B != null) {
					this[B] = {
						gt:function greaterThan(a, b) {return a > b},
						get:function greaterThanOrEqualTo(a, b) {return a >= b},
						lt:function lessThan(a, b) {return a < b},
						let:function lessThanOrEqualTo(a, b) {return a <= b},
						leq:function looseEquality(a, b) {return a == b},
						seq:function strictEquality(a, b) {return a === b},
						lneq:function looseInequality(a, b) {return a != b},
						sneq:function strictInequality(a, b) {return a !== b},
					}
				}
				if (C != null){
					this[C] = {
						not: "returns true for each input that is false.",
						nil: "returns true if all paramaters coerce to false. similar to an inverse &&",
						or : "returns true if at least one input coerces to true. similar to ||.",
						and: "returns true if all paramaters coerce to true. similar to &&.",
						nor: "returns true if any input coerces to false. similar to an inverse ||",
						xor: "returns true if half of the paramaters coerce to true.",
						is : "returns true if all paramaters are exactly equal to the first paramater. including objects.",
						isnt:"returns true if all paramaters are unequal to all others. broken for NaN and null together.",
						near:"returns true if the first parameter is within a small range of the second paramater. (±3e-16)",
						bitwise: {
							xor:"adds up the numbers in the first array bitwise, and returns 1 for bits in range of, or equal to the second array, returns zero for the others, and returns the answer in base 10. xor([a,b])==a^b.",
							not:   "if there is one argument, returns ~argument.  if there is more than 1 argument, returns an array. example: Logic.bit.not(4,5,-1) returns [~4,~5,~-1]",
							right2:"unsigned right shift. (a>>>b)",
							nil:   "if all of the inputs are zero for a given bit, it outputs one. Inverse &.",
							right: "a>>b",
							left:  "a<<b",
							or:    "a|b",
							and:   "same as a&b, but can have more arguments"
						},
						equality: {
							gt: "greater than (>)",
							get: "greater / equal to (>=)",
							lt: "less than (<)",
							let: "less / equal to (<=)",
							leq: "loose equality (==)",
							seq: "strict equality (===)",
							lneq: "loose non-equality (!=)",
							sneq: "strict non-equality (!==)"
						}
					}
				}
				this.not = function not(...a) {return len(a) == 1 ? !a[0] : a.map(b=>!b)},
				this.nil = function nil(...a) {
					a = a.flatten();
					if (json.stringify(a) === "[]") return !1;
					for (var i = len(a) - 1; i >= 0; --i)
						if (a[i] == !0) return !1;
					return !0;
				},
				this.or = function or(...a) {
					a = a.flatten();
					if (json.stringify(a) === "[]") return !1;
					for (var i = len(a) - 1; i >= 0; --i)
						if (a[i] == !0) return !0;
					return !1;
				},
				this.and = function and(...a) {
					a = a.flatten();
					if (json.stringify(a) === "[]") return !1;
					for (var i = len(a) - 1; i >= 0; --i)
						if (a[i] == !1) return !1;
					return !0;
				},
				this.nor = function nor(...a) {
					a = a.flatten();
					if (json.stringify(a) === "[]") return !1;
					for (var i = len(a) - 1; i >= 0; --i)
						if (a[i] == !1) return !0;
					return !1;
				},
				this.xor = function xor(...a) {
					a = a.flatten();
					if (json.stringify(a) === "[]") return !1;
					return len(a.filter(b => b == !0)) == len(a) / 2
				},
				this.isnt = function isnt(...a) {//Logic.isnt() is bugged for NaN and null as it says they are equal. this is due to JSON.stringify(NaN) returning "null".
					for (var i = len(a) - 1; i > 0; --i) {
						if (len(a.map(b => json.stringify(b)).filter(b => b === json.stringify(a[0]))) != 1) return !1;
						a.shift();
					}
					return !0;
				},
				this.is = function is(...a) {
					a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
					for (var i = len(a) - 1; i >= 0; --i) if (a[i] != a[0]) return !1;
					return !0;
				},
				this.near = function near(a, b, c=1e-16) {
					return a > b - c && a < b + c ? !0 : !1;
				}
			}
		}
	};
	this.LinkedList = class LinkedList {
		constructor() {
			this.head = null;
			this.size = 0;
			this.Node = class Node {
				constructor(data, next=null) {
					this.data = data;
					this.next = next;
				}
			};
		}
		insertLast(data) {
			if (this.size === 0) return this.insertFirst(data);
			this.size++;
			for (var current = this.head; current.next;)
				current = current.next;
			current.next = new this.Node(data)
		}
		insertAt(data, index=Infinity) {
			if (index < 0 || index > this.size) throw Error(`Index out of range: (index: ${index})`);
			if (index === 0) return this.insertFirst(data);
			if (index === this.size) return this.insertLast(data);
			for (var i = 0, current = this.head; i + 1 < index; i++)
				current = current.next;
			this.size++;
			current.next = new this.Node(data, current.next)
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
		insertFirst(data) {
			this.head = new this.Node(data, this.head);
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
				a.push(current.data);
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
		Object: function Object(e, h=!1) {
			return type(e) === "object" ? e : h == !0 ? {data: e} : void 0
		},
		undefined:()=>{},
		Symbol: function Symbol(e, h=!1) {
			return type(e) === "symbol" ? e : h == !0 ? Symbol.for(e) : void 0
		}
	};
	function lastElement() { // not a global function
		var a = this.valueOf();
		return a[len(a)-1];
	};
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
		toString() {
			return `${this.re}+${this.im}i`;
		}
		toArray() {
			return [this.re, this.im];
		}
	},
	Math2.Math.prototype.Math = math,
	HTMLElement.prototype.ael = HTMLElement.prototype.addEventListener,
	HTMLElement.prototype.rel = HTMLElement.prototype.removeEventListener,
	NodeList.prototype.last = lastElement,
	HTMLCollection.prototype.last = lastElement,
	RegExp.prototype.in = RegExp.prototype.test,
	RegExp.prototype.toRegex = function toRegex() { return this.valueOf() },
	Array.prototype.io = Array.prototype.indexOf,
	Array.prototype.lio = Array.prototype.lastIndexOf,
	Array.prototype.sort.sort = Array.prototype.sort,
	Array.prototype.for = function forEachReturn(func, ret) {
		var a = this.valueOf();
		a.forEach(func);
		return ret;
	},
	Array.prototype.shift2 = function shift2(b=1) {
		let a = this.valueOf();
		for (var i = 0; i++ < b; a.shift());
			return a;
	},
	Array.prototype.pop2 = function pop2(b=1) {
		let a = this.valueOf();
		for (var i = 0; i++ < b;)
			a.pop();
		return a;
	},
	Array.prototype.splice2 = function splice2(a,b,...c) {
		var d = this.valueOf(), i = 0;
		d.splice(a, b);
		return c.flatten().for(e => d.splice(a + i++, 0, e), d);
	},
	Array.prototype.push2 = function push2(e, ...i) {// finish implementing pushing multiple values for other methods
		let a = this.valueOf(), j, n;
		i = [i].flatten();
		if (e === void 0)
			for (j = 0, n = len(i); j < n; j++)
				if (type(i[j], 1) === "num")
					a.push(a[i[j]]);
		else {
			if (Array(`${e}`.trim().remove(/(function)?\s*\w*\s*=?\s*\((.|\s)*\)\s*(=>)?\s*{?\s*(return\s*)?/)).dup().mod([0,1],[e=>len(e)<13,e=>/void \d+|undefined/.test(e)]).reduce((t,e)=>t+e)===2)a.push(void 0);
			else a.push(e);
			for (j = 0, n = len(i); j < n; j++) a.push(i[j]);
		}
		return a;
	},
	Array.prototype.unshift2 = function unshift2(e, ...i) {
		let a = this.valueOf(), j, n;
		i = [i].flatten();
		if (e === void 0)
			for (j = 0, n = len(i); j < n; j++)
				if (type(i[j], 1) === "num")
					a.unshift(a[i[j]]);
		else {
			if (Array(`${e}`.trim().remove(/(function)?\s*\w*\s*=?\s*\((.|\s)*\)\s*(=>)?\s*{?\s*(return\s*)?/)).dup().mod([0,1],[e=>len(e)<13,e=>/void \d+|undefined/.in(e)]).reduce((t,e)=>t+e)===2)a.unshift(void 0);
			else a.unshift(e);
			for (j = 0, n = len(i); j < n; j++) a.unshift(i[j]);
		}
		return a;
	},
	Array.prototype.toLList = function toLinkedList() {
		let a = new LinkedList(), b = this.valueOf().reverse();
		for (let i of b) a.insertFirst(i);
		return a;
	},
	Array.prototype.mod = function modify(index, func) {
		index = [index].flatten();
		let a = this.valueOf(), n = len(index);
		if (type(func, 1) === "arr") func = func.flatten();
		else func = [].len(n).fill(func);
		func = func.extend(len(index) - len(func), e=>e);
		for (var i = 0; i < n; i++) a[index[i]] = func[i](a[index[i]]);
		return a;
	},
	Array.prototype.remrep = function removeRepeats() {return Array.from(new Set(this.valueOf()))},
	Array.prototype.slc = function slice(start=0, end=Infinity) {
		for (var a = this.valueOf(), b = [], i = 0, n = len(a); i < n && i <= end; ++i)
			i >= start && b.push(a[i]);
		return b;
	},
	Array.prototype.swap = function swap(i1=0, i2=1) {
		var a = this.valueOf(), b = a[i1];
		a[i1] = a[i2], a[i2] = b;
		return a;
	},
	Array.prototype.rotr3 = function rotate3itemsRight(i1=0, i2=1, i3=2) {
		var a = this.valueOf(), b = a[i1];
		a[i1] = a[i3], a[i3] = a[i2], a[i2] = b;
		return a;
	},
	Array.prototype.dupf = function duplicateToFirst(num=1, i=0) {return this.valueOf().dup(num, 0, i)},
	Array.prototype.dup = function duplicate(num=1, from=null, newindex=Infinity) {
		// by default duplicates the last element in the array
		var a = this.valueOf();
		for (var b = a[from === null ? len(a)-1 : from], j = 0; j++ < num;) a.splice(newindex, 0, b);
		return a;
	},
	Array.prototype.rotr = function rotateRight(num=1) {
		var a = this.valueOf();
		for (const i of range(num % len(a))) a.unshift(a.pop());
		return a;
	},
	Array.prototype.rotl = function rotateRight(num=1) {
		var a = this.valueOf();
		for (const i of range(num % len(a))) a.push(a.shift());
		return a;
	},
	Array.prototype.rotl3 = function rotate3itemsLeft(i1=0, i2=1, i3=2) {
		var a = this.valueOf(), b = a[i1];
		a[i1] = a[i2], a[i2] = a[i3], a[i3] = b;
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
		} else return a;
	},
	Array.prototype.last = lastElement,
	Array.prototype.startsW = function startsWith(item) {return this.valueOf()[0] === item},
	Array.prototype.endsW = function endsWith(item) {return this.valueOf().last() === item},
	Array.prototype.rev = [].reverse,
	Array.prototype.flatten = function flatten() {return this.valueOf().flat(Infinity)},
	(() => {
		var sortOld = Array.prototype.sort;
		Array.prototype.sort = function sort() {
			var list = this.valueOf();
			if (Math.isNaN(list.join(""))) return list.sortOld();
			for (var output = []; len(list) > 0;) {
				output.push(Math.min(list));
				list.splice(list.io(Math.min(list)), 1);
			} return output;
		};
		Array.prototype.sortOld = sortOld;
	})();
	String.prototype.io = String.prototype.indexOf,
	String.prototype.lio = String.prototype.lastIndexOf,
	String.prototype.endsW = "".endsWith,
	String.prototype.toObj = function toObj(a=window) {
		return this.valueOf().split(/[.[\]'"]/).filter(e=>e).forEach(e=>a=a[e]);
	},
	String.prototype.hasDupesA = function hasDuplicatesAll() {
		return/(.)\1+/.test(this.valueOf().split("").sort().join(""));
	},
	String.prototype.hasDupesL = function hasDuplicateLetters() {
		return/(\w)\1+/.test(this.valueOf().split("").sort().join(""));
	},
	String.prototype.reverse = function reverse() {return this.valueOf().split("").reverse().join("")},
	String.prototype.remove = function(arg) {return this.valueOf().replace(arg,"")},
	String.prototype.removeRepeats = function removeRepeats() {
		return Array.from(new Set(this.valueOf().split(""))).join("");
	},
	// String.prototype.toBinary = function toBinary() {
	// 	return this.valueOf().split("").map(b=>!isNaN(int(b)) ? 1*!!int(b) : 1*!!b).join("")
	// },
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
		return((...a)=>()=>a[0](this,a))(Function.apply.bind(new Function(this.valueOf())));
	}
	String.prototype.toRegex = function toRegularExpression(f="", form="escaped") {
		var a = this.valueOf();
		if (form === "escaped")
			for (var i = 0, b = "", l = len(a); i < l; i++) b += /[$^()+*\\|[\]{}?.]/.in(a[i]) ? `\\${a[i]}` : a[i];
		else return new RegExp(a, f);
		return new RegExp(b, f);
	},
	String.prototype.toNumber = function toNumber() {return 1*this.valueOf()},
	String.prototype.toBigInt = function toBigInt() {
		var a = this.valueOf();
		try { return BigInt(a) } catch { throw `TypeError: Cannot convert input to BigInt. input: '${a}'` }
	},
	String.prototype.pop2 = function pop2() {
		var s = this.valueOf();
		return s.substring(0, s.length-1);
	},
	String.prototype.unescape = function unescape() {
		return this.valueOf().split("").map(e=>e=="\n"?"\\n":e=="\t"?"\\t":e=="\f"?"\\f":e=="\r"?"\\r":e=="\v"?"\\v":e=="\b"?"\\b":e).join("")
	},
	String.prototype.includes = function(input) {
		return input.toRegex().in(this.valueOf());
	},
	String.prototype.start = function start(start) {
		var a = this.valueOf();
		if (a !== "") return a;
		return `${start}`;
	},
	Number.prototype.isPrime = function isPrime() {
		var n = ~~this.valueOf();
		if (n === 2) return !0;
		if (n < 2 || n % 2 === 0) return !1;
		for (var i = 3, a = n / 3; i <= a; i += 2)
			if (n % i === 0) return !1;
		return !0;
	},
	Number.prototype.shl = function(num) {return this.valueOf() << Number(num)},
	Number.prototype.shr = function shr(num) {return this.valueOf() >> Number(num)},
	Number.prototype.shr2 = function(num) {return this.valueOf() >>> Number(num)},
	BigInt.prototype.shl = function(num) {return this.valueOf() << BigInt(num)},
	BigInt.prototype.shr = function shr(num) {return this.valueOf() >> BigInt(num)},
	BigInt.prototype.shr2 = function(num) {return this.valueOf() >>> BigInt(num)},
	BigInt.prototype.isPrime = function isPrime() {
		var n = this.valueOf();
		if (n === 2n) return !0;
		if (n < 2n || !(n % 2n)) return !1;
		for (var i = 3n, a = n / 3n; i <= a; i += 2n)
			if (!(n%i)) return !1;
		return !0;
	};
	if (MathVar === true) this.Math = new Math2.Math("trig"/*,"help"*/);
	this.Logic = new Logic.Logic("bit"/*,"eq","help"*/);
	var exit = false;
	if (CONFLICT_ARR.length) {
		if (onConflict.toLowerCase() === "assert") console.assert(!1, "Global Variables Overwritten: %o", CONFLICT_ARR);
		else if (onConflict.toLowerCase() === "debug") console.debug("Global Variables Overwritten: %o", CONFLICT_ARR);
		else if (onConflict.toLowerCase() === "info") console.info("Global Variables Overwritten: %o", CONFLICT_ARR);
		else if (onConflict.toLowerCase() === "warn") console.warn("Global Variables Overwritten: %o", CONFLICT_ARR);
		else if (onConflict.toLowerCase() === "log") console.log("Global Variables Overwritten: %o", CONFLICT_ARR);
		else if (onConflict.toLowerCase() === "alert") alert(`Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`);
		else if (onConflict.toLowerCase() === "return") return `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
		else if (onConflict.toLowerCase() === "throw") throw `Global Variables Overwritten: ${CONFLICT_ARR.join(", ")}`;
		exit = true;
	}
	if (NOT_ACTIVE_ARR.length) {
		if (onConflict.toLowerCase() === "assert") console.assert(!1, "Not Active Global Variables: %o", NOT_ACTIVE_ARR);
		else if (onConflict.toLowerCase() === "debug") console.debug("Not Active Global Variables: %o", NOT_ACTIVE_ARR);
		else if (onConflict.toLowerCase() === "info") console.info("Not Active Global Variables: %o", NOT_ACTIVE_ARR);
		else if (onConflict.toLowerCase() === "warn") console.warn("Not Active Global Variables: %o", NOT_ACTIVE_ARR);
		else if (onConflict.toLowerCase() === "log") console.log("Not Active Global Variables: %o", NOT_ACTIVE_ARR);
		else if (onConflict.toLowerCase() === "alert") alert(`Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`);
		else if (onConflict.toLowerCase() === "return") return `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
		else if (onConflict.toLowerCase() === "throw") throw `Not Active Global Variables: ${NOT_ACTIVE_ARR.join(", ")}`;
		exit = true;
	}
	if (exit) return 1;
	return 0;
})(), `Library Function exited prematurely at ${document.currentScript.src} with non-zero exit code`);
