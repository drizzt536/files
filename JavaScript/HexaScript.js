#!/usr/bin/env js

// This file reqiures ./lib.js

var Intrinsics = (() => {
	class Intrinsics    {
		constructor()   {
			this.elif   = Symbol.for("JS.elif");
			this["("]   = Symbol.for("Intrinsic.jsmodeStart");
			this[")"]   = Symbol.for("Intrinsic.jsmodeEnd");
			this.lbl    = Symbol.for("Intrinsic.lbl");
			this.goto   = Symbol.for("Intrinsic.goto");
			this.push   = Symbol.for("Intrinsic.push");
			this.print  = Symbol.for("Intrinsic.print");
			this.if     = Symbol.for("Intrinsic.if");
			this.then   = Symbol.for("Intrinsic.then");
			this.stop   = Symbol.for("Intrinsic.stop");
			this.skip   = Symbol.for("Intrinsic.skip");
			this.pop    = Symbol.for("Intrinsic.pop");
			this.shift  = Symbol.for("Intrinsic.shift");// I know that shift is not for stacks. ignore it
		}
	}
	Intrinsics.prototype.length = Object.keys(new Intrinsics()).length;
	return new Intrinsics();
})();


var SupportedChars = (() => {
	class SupportedChars    {
		constructor()       {
			this["\\n"]  = Symbol.for("SupportedChars.\\n"); // newline character
			this["\\s"]  = Symbol.for("SupportedChars.\\s"); // other whitespace characters
			this["\\w"]  = Symbol.for("SupportedChars.\\w"); // alphanumeric charcters
			this["/**/"] = Symbol.for("SupportedChars./**/");
			this["/*"]   = Symbol.for("SupportedChars./*");
			this[")"]    = Symbol.for("SupportedChars.)");
			this["("]    = Symbol.for("SupportedChars.(");
			this["="]    = Symbol.for("SupportedChars.=");
			this[";"]    = Symbol.for("SupportedChars.;");
			this["'"]    = Symbol.for("SupportedChars.'");
			this['"']    = Symbol.for('SupportedChars."');
			this['`']    = Symbol.for('SupportedChars.`');
			this['{']    = Symbol.for('SupportedChars.{');
			this['}']    = Symbol.for('SupportedChars.}');
			this['[']    = Symbol.for('SupportedChars.[');
			this[']']    = Symbol.for('SupportedChars.]');
			this['<']    = Symbol.for('SupportedChars.<');
			this['>']    = Symbol.for('SupportedChars.>');
		}
	}
	SupportedChars.prototype.length = Object.keys(new SupportedChars).length;
	return new SupportedChars;
})();



// Compile HexaScript to a JavaScript function

function compileProgram(str, argnames=[], form="function", download=false, downloadFile="file.js", debug=false) {
	if (type(argnames) !== "string") argnames = [argnames];
	if (type(str) !== "string") throw `argument 1 in compileProgram() is not a string`;
	if (type(download, 1) !== "bool") throw `argument 3 in compileProgram() is not a boolean`;
	if (type(downloadFile, 1) !== "str") throw `argument 4 in compileProgram() is not a string`;
	if (type(debug, 1) !== "bool") throw `argument 5 in compileProgram() is not a boolean`;
	if (str.sW("hx:")) {
		debug && console.log("alternate hex compiler used");
		return (function alternateHexCompiler() {
			str = str.substr(3);
			function hexAsciiNumToChar(str) {
				switch (str) {
					case "00": return"\0"; case "08": return"\b"; case "09": return"\t"; case "0a": return"\n";
					case "0b": return"\v"; case "0c": return"\f"; case "0d": return"\r";
					case "20": return " "; case "21": return "!"; case "22": return '"'; case "23": return "#";
					case "24": return "$"; case "25": return "%"; case "26": return "&"; case "27": return "'";
					case "28": return "("; case "29": return ")"; case "2a": return "*"; case "2b": return "+";
					case "2c": return ","; case "2d": return "-"; case "2e": return "."; case "2f": return "/";
					case "30": return "0"; case "31": return "1"; case "32": return "2"; case "33": return "3";
					case "34": return "4"; case "35": return "5"; case "36": return "6"; case "37": return "7";
					case "38": return "8"; case "39": return "9"; case "3a": return ":"; case "3b": return ";";
					case "3c": return "<"; case "3d": return "="; case "3e": return ">"; case "3f": return "?";
					case "40": return "@"; case "41": return "A"; case "42": return "B";
					case "43": return "C"; case "44": return "D"; case "45": return "E"; case "46": return "F";
					case "47": return "G"; case "48": return "H"; case "49": return "I"; case "4a": return "J";
					case "4b": return "K"; case "4c": return "L"; case "4d": return "M"; case "4e": return "N";
					case "4f": return "O"; case "50": return "P"; case "51": return "Q"; case "52": return "R";
					case "53": return "S"; case "54": return "T"; case "55": return "U"; case "56": return "V";
					case "57": return "W"; case "58": return "X"; case "59": return "Y"; case "5a": return "Z";
					case "5b": return "["; case "5c":return "\\"; case "5d": return "]"; case "5e": return "^";
					case "5f": return "_"; case "60": return "`"; case "61": return "a"; case "62": return "b";
					case "63": return "c"; case "64": return "d"; case "65": return "e"; case "66": return "f";
					case "67": return "g"; case "68": return "h"; case "69": return "i"; case "6a": return "j";
					case "6b": return "k"; case "6c": return "l"; case "6d": return "m"; case "6e": return "n";
					case "6f": return "o"; case "70": return "p"; case "71": return "q"; case "72": return "r";
					case "73": return "s"; case "74": return "t"; case "75": return "u"; case "76": return "v";
					case "77": return "w"; case "78": return "x"; case "79": return "y"; case "7a": return "z";
					case "7b": return "{"; case "7c": return "|"; case "7d": return "}"; case "7e": return "~";
					default: return str[0];
				}
			}
			var n = len(str);
			if (n % 2) {
				if (debug) debugger;
				throw new Error("Invalid input");
			}
			for (var i = 0, code = ""; i < n; i += 2) code += hexAsciiNumToChar(str.substr(i, 2));
			debug && console.log("code evaluation finished");
			download && (function download(text, file, fileType="text/plain") {
				if (type(text, 1) + type(file, 1) !== "strstr") throw `Incorrect input types. expected 2 strings but found ${type(text)}, and ${type(file)}`;
				const link = document.createElement("a");
				link.download = `${file}`;
				link.href = URL.createObjectURL(new Blob([text], {type: filetype}));
				link.click();
			})(code, downloadFile);
			if (form === "s" || form === "str" || form === "string") return code;
			if (debug) debugger;
			return Function(...argnames, code);
		})();
	}
	function asciiNumToChar(str) {
		switch (true) {
			case /\b(000|0x00)\b/.in(str): return"\0"; case /\b(008|0x08)\b/.in(str): return"\b";
			case /\b(009|0x09)\b/.in(str): return"\t"; case /\b(010|0x0a)\b/.in(str): return"\n";
			case /\b(011|0x0b)\b/.in(str): return"\v"; case /\b(012|0x0c)\b/.in(str): return"\f";
			case /\b(013|0x0d)\b/.in(str): return"\r";

			case /\b(032|0x20)\b/.in(str): return " "; case /\b(033|0x21)\b/.in(str): return "!";
			case /\b(034|0x22)\b/.in(str): return '"'; case /\b(035|0x23)\b/.in(str): return "#";
			case /\b(036|0x24)\b/.in(str): return "$"; case /\b(037|0x25)\b/.in(str): return "%";
			case /\b(038|0x26)\b/.in(str): return "&"; case /\b(039|0x27)\b/.in(str): return "'";
			case /\b(040|0x28)\b/.in(str): return "("; case /\b(041|0x29)\b/.in(str): return ")";
			case /\b(042|0x2a)\b/.in(str): return "*"; case /\b(043|0x2b)\b/.in(str): return "+";
			case /\b(044|0x2c)\b/.in(str): return ","; case /\b(045|0x2d)\b/.in(str): return "-";
			case /\b(046|0x2e)\b/.in(str): return "."; case /\b(047|0x2f)\b/.in(str): return "/";

			case /\b(048|0x30)\b/.in(str): return "0"; case /\b(049|0x31)\b/.in(str): return "1";
			case /\b(050|0x32)\b/.in(str): return "2"; case /\b(051|0x33)\b/.in(str): return "3";
			case /\b(052|0x34)\b/.in(str): return "4"; case /\b(053|0x35)\b/.in(str): return "5";
			case /\b(054|0x36)\b/.in(str): return "6"; case /\b(055|0x37)\b/.in(str): return "7";
			case /\b(056|0x38)\b/.in(str): return "8"; case /\b(057|0x39)\b/.in(str): return "9";

			case /\b(058|0x3a)\b/.in(str): return ":"; case /\b(059|0x3b)\b/.in(str): return ";";
			case /\b(060|0x3c)\b/.in(str): return "<"; case /\b(061|0x3d)\b/.in(str): return "=";
			case /\b(062|0x3e)\b/.in(str): return ">"; case /\b(063|0x3f)\b/.in(str): return "?";
			case /\b(064|0x40)\b/.in(str): return "@";

			case /\b(065|0x41)\b/.in(str): return "A"; case /\b(066|0x42)\b/.in(str): return "B";
			case /\b(067|0x43)\b/.in(str): return "C"; case /\b(068|0x44)\b/.in(str): return "D";
			case /\b(069|0x45)\b/.in(str): return "E"; case /\b(070|0x46)\b/.in(str): return "F";
			case /\b(071|0x47)\b/.in(str): return "G"; case /\b(072|0x48)\b/.in(str): return "H";
			case /\b(073|0x49)\b/.in(str): return "I"; case /\b(074|0x4a)\b/.in(str): return "J";
			case /\b(075|0x4b)\b/.in(str): return "K"; case /\b(076|0x4c)\b/.in(str): return "L";
			case /\b(077|0x4d)\b/.in(str): return "M"; case /\b(078|0x4e)\b/.in(str): return "N";
			case /\b(079|0x4f)\b/.in(str): return "O"; case /\b(080|0x50)\b/.in(str): return "P";
			case /\b(081|0x51)\b/.in(str): return "Q"; case /\b(082|0x52)\b/.in(str): return "R";
			case /\b(083|0x53)\b/.in(str): return "S"; case /\b(084|0x54)\b/.in(str): return "T";
			case /\b(085|0x55)\b/.in(str): return "U"; case /\b(086|0x56)\b/.in(str): return "V";
			case /\b(087|0x57)\b/.in(str): return "W"; case /\b(088|0x58)\b/.in(str): return "X";
			case /\b(089|0x59)\b/.in(str): return "Y"; case /\b(090|0x5a)\b/.in(str): return "Z";

			case /\b(091|0x5b)\b/.in(str): return "["; case /\b(092|0x5c)\b/.in(str):return "\\";
			case /\b(093|0x5d)\b/.in(str): return "]"; case /\b(094|0x5e)\b/.in(str): return "^";
			case /\b(095|0x5f)\b/.in(str): return "_"; case /\b(096|0x60)\b/.in(str): return "`";

			case /\b(097|0x61)\b/.in(str): return "a"; case /\b(098|0x62)\b/.in(str): return "b";
			case /\b(099|0x63)\b/.in(str): return "c"; case /\b(100|0x64)\b/.in(str): return "d";
			case /\b(101|0x65)\b/.in(str): return "e"; case /\b(102|0x66)\b/.in(str): return "f";
			case /\b(103|0x67)\b/.in(str): return "g"; case /\b(104|0x68)\b/.in(str): return "h";
			case /\b(105|0x69)\b/.in(str): return "i"; case /\b(106|0x6a)\b/.in(str): return "j";
			case /\b(107|0x6b)\b/.in(str): return "k"; case /\b(108|0x6c)\b/.in(str): return "l";
			case /\b(109|0x6d)\b/.in(str): return "m"; case /\b(110|0x6e)\b/.in(str): return "n";
			case /\b(111|0x6f)\b/.in(str): return "o"; case /\b(112|0x70)\b/.in(str): return "p";
			case /\b(113|0x71)\b/.in(str): return "q"; case /\b(114|0x72)\b/.in(str): return "r";
			case /\b(115|0x73)\b/.in(str): return "s"; case /\b(116|0x74)\b/.in(str): return "t";
			case /\b(117|0x75)\b/.in(str): return "u"; case /\b(118|0x76)\b/.in(str): return "v";
			case /\b(119|0x77)\b/.in(str): return "w"; case /\b(120|0x78)\b/.in(str): return "x";
			case /\b(121|0x79)\b/.in(str): return "y"; case /\b(122|0x7a)\b/.in(str): return "z";

			case /\b(123|0x7b)\b/.in(str): return "{"; case /\b(124|0x7c)\b/.in(str): return "|";
			case /\b(125|0x7d)\b/.in(str): return "}"; case /\b(126|0x7e)\b/.in(str): return "~";
			default: return null;
		}
	}
	const newToken = () => {
		token.token && program.push(copy(token));
		token.token = "";
	}
	// the 'stop' is so it doesn't complain about skipping past the end, and the space is because it pushes the new token into the program if it encounters a space after it, and thus needs a space at the end.
	str = `${str.remove(/\/\/(.|\s)*$/gm)} stop `; // remove single-lined comments
	for (var [row, col] = [1, 1], i = 0, j = 0, n = len(str), program = [], token = {token: "", row: null, col: null}, code = "", tmp; i < n; i++) { // create the list of tokens
		if (debug) console.log("create program:", row, col, str[i], token);
		if (str[i] === "\n") row++, col = 0, newToken();
		else if (/\s/.test(str[i])) newToken();
		else if (/\w/.test(str[i])) {
			if (str[i-1] === void 0 || /\s/.test(str[i-1]) || str.substr(i-2, 2) === "*/")
				[token.row, token.col] = [row, col];
			token.token += str[i];
		} else if (str.substr(i, 2) === "/*") {
			if (str.substr(i, 4) === "/**/") {
				col += 4;
				i += 3;
				continue;
			}
			newToken();
			[token.row, token.col] = [row, col];
			col += 2, i += 2;
			while (str.substr(i, 2) !== "*/") {
				if (i > str.length) throw `CommentError:${token.row}:${token.col}:Multi-Line Comment not terminated, or another '/' is placed directly after with no whitespace.`;
				if (str[i] === "\n") col = 0, row++;
				col++, i++;
			}
			col++, i++;
		} else {
			if (str[i-1] === void 0 || /\s/.test(str[i-1]) || str.substr(i-2, 2) === "*/")
				[token.row, token.col] = [row, col];
			token.token += str[i];
		}
		col++;
	}

	// returns an array of objects with the token, and the row and column it was found at
	if (form === "object" || form === "obj" || form === "array" || form === "arr") return program;


	if (len(Intrinsics) !== 12) throw `Exhausive handling of Intrinsics in compileProgram(): ${len(Intrinsics)}`;
	var labels = {}, stack  = [], conditionalStack = [];
	for (i = 0, n = len(program); i < n; i++) { // loop over the tokens and interpret them
		if (debug) console.log("parsing: %o,  id: %o", program[i].token, i);
		if (program[i].token === "010" || program[i].token === "0x0a") code += "\n";
		else if (program[i].token === "009" || program[i].token === "0x09") code += "\t";
		else if (program[i].token === "lbl") {
			if (i+1 === len(program)) throw `LabelError:${program[i].row}:${program[i].col}: No label name given for 'lbl'`;
			if (!isNaN(program[++i].token)) throw `LabelError:${program[i].row}:${program[i].col}: label name cannot be an integer '${program[i].token}'`;
			if (program[i].token in labels) throw `LabelError:${program[i].row}:${program[i].col}: Re-definition of label '${program[i].token}'`;
			labels[program[i].token] = i;
		} else if (program[i].token === "goto") {
			// should be avoided inside of loops and conditionals to avoid annoying console warnings
			if (i+1 === len(program)) throw `GotoError:${program[i].row}:${program[i].col}: No label name given for 'goto'`;
			if (program[++i].token in labels) i = labels[program[i].token];
			else throw `GotoError:${program[i].row}:${program[i].col}: Cannot go to nonexistent label '${program[i].token}'`;
		} else if (program[i].token === "push") {
			if (++i === len(program)) throw `PushError:${program[i].row}:${program[i].col}: 'push' has nothing to push to the stack`;
			if (program[i].token === "true") stack.push([true, "bool"]);
			else if (program[i].token === "false") stack.push([false, "bool"]);
			else if (program[i].token === "infinity") stack.push([Infinity, "int"]);
			else if (isNaN(program[i].token)) stack.push([program[i].token, "str"]);
			else stack.push([Number(program[i].token), "int"]);
		} else if (program[i].token === "print") {
			if (!len(stack)) throw `PrintError:${program[i].row}:${program[i].col}: Cannot pop from an empty stack`;
			console.log(stack.pop()[0]);
		} else if (program[i].token === "if") {
			conditionalStack.push(i);
			if (!len(stack)) throw `StackError:${program[i].row}:${program[i].col}: 'if' requires an argument on the stack`;
			if (stack.pop()[0] == false) { // goto the corresponding 'end'
				var a = len(conditionalStack);
				while (program[i].token !== "end" || len(conditionalStack) !== a) {
					i++;
					if (program[i].token === "if") conditionalStack.push(i);
					else if (program[i].token === "end" && len(conditionalStack) !== a) conditionalStack.pop();
				}
				conditionalStack.pop();
			} //else do nothing
		} else if (program[i].token === "end") {
			if (!len(conditionalStack))
				throw `ConditionalStackError:${program[i].row}:${program[i].col}: Conditional Stack Underflow`;
			conditionalStack.pop();
		} else if (program[i].token === "stop") i = Infinity;
		else if (program[i].token === "skip") {
			var skipLoc = [program[i].row, program[i].col], skipNum = Number(program[++i].token);
			if (isNaN(skipNum)) throw `SkipError:${program[i].row}:${program[i].col}: 'skip' Expects a number of instructions to skip after it`;
			if (skipNum < 0) throw `SkipError:${program[i].row}:${program[i].col}: only positive integers are allowed as paramaters for skip`;
			if (skipNum === 0) continue;
			i++;
			while (skipNum > 0) {
				if (program[i].token === "(") {
					var openLoc = [program[i].row, program[i].col];
					while (i < len(program) && program[i].token !== ")") i++;
					if (i === len(program)) throw `ScriptError:${openLoc[0]}:${openLoc[1]}: '(' not closed, and can't be skipped`;
				}
				i++;
				skipNum--;
				if (i === len(program) && skipNum) throw `SkipError:${skipLoc.join(":")}: 'skip' cannot go past the end of the program. use 'stop' to end prematurely`;
			}
			i--;
		} else if (program[i].token === "pop") {
			if (!len(stack)) throw `StackError:${program[i].row}:${program[i].col}: Cannot pop from an empty stack`;
			code += stack.pop()[0];
		} else if (program[i].token === "shift") {// I know that shift is not for stacks. I don't care
			if (!len(stack)) throw `StackError:${program[i].row}:${program[i].col}: Cannot shift from an empty stack`;
			code += stack.shift()[0];
		}


		else if (program[i].token === "(") { // javascript mode
			var openLoc = [program[i].row, program[i].col];
			i++;
			while (i < len(program) && program[i].token !== ")") {
				if (debug) console.log("js: %o", program[i]);
				if (program[i].token === "elif") code += "else if";
				else {
					// if not needed, but makes output look nicer
					/*if (program[i - 1].token !== "(")*/ code += " ";
					code += program[i].token;
				}
				i++;
			}
			if (i === len(program)) throw `ScriptError:${openLoc[0]}:${openLoc[1]}: '(' not closed.`;
		} else if (program[i].token === ")") {
			throw `ScriptError:${program[i].row}:${program[i].col}: Extra closing parentheses`;
		} else { // non-intrinsic non (hexa)decimal tokens
			tmp = asciiNumToChar(program[i].token);
			if (tmp === null) throw `TokenError:${program[i].row}:${program[i].col}: Unknown token '${program[i].token}'`;
			code += tmp;
		}
	}
	if (len(conditionalStack)) console.warn(`StackError: ${len(conditionalStack)} Conditional statement${len(conditionalStack) === 1 ? "" : "s"} not terminated`);

	download && (function download(text, file, fileType="text/plain") {
		if (type(text, 1) + type(file, 1) !== "strstr") throw `Incorrect input types. expected 2 strings but found ${type(text)}, and ${type(file)}`;
		const link = document.createElement("a");
		link.download = `${file}`;
		link.href = URL.createObjectURL(new Blob([text], {type: filetype}));
		link.click();
	})(code, downloadFile);


	if (form === "s" || form === "str" || form === "string") return code;
	return Function(...argnames, code);
	// return (new Function(
	// 	"return program=>function Program() {return program(this, arguments)}"
	// )())(Function.apply.bind(new Function(code)))
}



// Compile HexaScript to a JavaScript function and run it.

function interpretProgram(
	str="",
	args=[],
	argnames=[],
	form="function",
	download=false,
	downloadFile="file.js",
	debug=false
) {
	const OUTPUT = compileProgram(str, argnames, form, download, downloadFile, debug);
	try { return OUTPUT(...args) } catch { return OUTPUT }
}



// Error line/token goto stuff

function gotoToken(s, r, c) {
	return c > len(s = s.split("\n")[r - 1].substr(c - 1)) || c < 0 || r < 0 ?
		void 0 :
		/\s/.in(s[0]) ?
			s[0] :
			s.remove(/\s.*/);
}

var gotoTokenLine = (str, row, col) => str.split("\n")[row - 1];



// Compiles JavaScript to hexadecimal-HexaScript and links them together if there are multiple inputs.

function compileJSToHex(...input) {
	function charToAsciiHex(str) {
		switch (str) {
			case"\0": return"00"; case"\b": return"08"; case"\t": return"09";
			case"\b": return"08"; case"\n": return"0a"; case"\v": return"0b"; case"\f": return"0c";
			case"\r": return"0d"; case " ": return 32 ; case "!": return 33 ; case '"': return 34 ;
			case "#": return 35 ; case "$": return 36 ; case "%": return 37 ; case "&": return 38 ;
			case "'": return 39 ; case "(": return 40 ; case ")": return 41 ; case "*": return 42 ;
			case "+": return 43 ; case ",": return 44 ; case "-": return 45 ; case ".": return 46 ;
			case "/": return 47 ; case "0": return 48 ; case "1": return 49 ; case "2": return 50 ;
			case "3": return 51 ; case "4": return 52 ; case "5": return 53 ; case "6": return 54 ;
			case "7": return 55 ; case "8": return 56 ; case "9": return 57 ; case ":": return 58 ;
			case ";": return 59 ; case "<": return 60 ; case "=": return 61 ; case ">": return 62 ;
			case "?": return 63 ; case "@": return 64 ; case "A": return 65 ; case "B": return 66 ;
			case "C": return 67 ; case "D": return 68 ; case "E": return 69 ; case "F": return 70 ;
			case "G": return 71 ; case "H": return 72 ; case "I": return 73 ; case "J": return 74 ;
			case "K": return 75 ; case "L": return 76 ; case "M": return 77 ; case "N": return 78 ;
			case "O": return 79 ; case "P": return 80 ; case "Q": return 81 ; case "R": return 82 ;
			case "S": return 83 ; case "T": return 84 ; case "U": return 85 ; case "V": return 86 ;
			case "W": return 87 ; case "X": return 88 ; case "Y": return 89 ; case "Z": return 90 ;
			case "[": return 91 ; case"\\": return 92 ; case "]": return 93 ; case "^": return 94 ;
			case "_": return 95 ; case "`": return 96 ; case "a": return 97 ; case "b": return 98 ;
			case "c": return 99 ; case "d": return 100; case "e": return 101; case "f": return 102;
			case "g": return 103; case "h": return 104; case "i": return 105; case "j": return 106;
			case "k": return 107; case "l": return 108; case "m": return 109; case "n": return 110;
			case "o": return 111; case "p": return 112; case "q": return 113; case "r": return 114;
			case "s": return 115; case "t": return 116; case "u": return 117; case "v": return 118;
			case "w": return 119; case "x": return 120; case "y": return 121; case "z": return 122;
			case "{": return 123; case "|": return 124; case "}": return 125; case "~": return 126;
			default: throw `InputError: Character not found: ${str}`;
		}
	}
	input = [input].flatten();
	for (var i = 0, n = input.length; i < n; i++) {
		input[i] = `${input[i]}`.split("").map(
			e => e === "\n" || e === "\t" ? e : e === "\f" ? "\f" :
				`0x${charToAsciiHex(e).toString(16)}`).join(" ").replace(/\n/g," 0x0a ").replace(/\t/g," 0x09 ").remove(/^\s*|\s*$/g).replace(/ +/g, " ");
	}
	return input.join(" ");
} function compileJSToHexV2(...input) {
	function charToAsciiHex(str) {
		switch (str) {
			case"\0": return"00"; case"\b": return"08"; case"\t": return"09";
			case"\b": return"08"; case"\n": return"0a"; case"\v": return"0b"; case"\f": return"0c";
			case"\r": return"0d"; case " ": return 32 ; case "!": return 33 ; case '"': return 34 ;
			case "#": return 35 ; case "$": return 36 ; case "%": return 37 ; case "&": return 38 ;
			case "'": return 39 ; case "(": return 40 ; case ")": return 41 ; case "*": return 42 ;
			case "+": return 43 ; case ",": return 44 ; case "-": return 45 ; case ".": return 46 ;
			case "/": return 47 ; case "0": return 48 ; case "1": return 49 ; case "2": return 50 ;
			case "3": return 51 ; case "4": return 52 ; case "5": return 53 ; case "6": return 54 ;
			case "7": return 55 ; case "8": return 56 ; case "9": return 57 ; case ":": return 58 ;
			case ";": return 59 ; case "<": return 60 ; case "=": return 61 ; case ">": return 62 ;
			case "?": return 63 ; case "@": return 64 ; case "A": return 65 ; case "B": return 66 ;
			case "C": return 67 ; case "D": return 68 ; case "E": return 69 ; case "F": return 70 ;
			case "G": return 71 ; case "H": return 72 ; case "I": return 73 ; case "J": return 74 ;
			case "K": return 75 ; case "L": return 76 ; case "M": return 77 ; case "N": return 78 ;
			case "O": return 79 ; case "P": return 80 ; case "Q": return 81 ; case "R": return 82 ;
			case "S": return 83 ; case "T": return 84 ; case "U": return 85 ; case "V": return 86 ;
			case "W": return 87 ; case "X": return 88 ; case "Y": return 89 ; case "Z": return 90 ;
			case "[": return 91 ; case"\\": return 92 ; case "]": return 93 ; case "^": return 94 ;
			case "_": return 95 ; case "`": return 96 ; case "a": return 97 ; case "b": return 98 ;
			case "c": return 99 ; case "d": return 100; case "e": return 101; case "f": return 102;
			case "g": return 103; case "h": return 104; case "i": return 105; case "j": return 106;
			case "k": return 107; case "l": return 108; case "m": return 109; case "n": return 110;
			case "o": return 111; case "p": return 112; case "q": return 113; case "r": return 114;
			case "s": return 115; case "t": return 116; case "u": return 117; case "v": return 118;
			case "w": return 119; case "x": return 120; case "y": return 121; case "z": return 122;
			case "{": return 123; case "|": return 124; case "}": return 125; case "~": return 126;
			default: return str + "0"
		}
	}
	for (var i = 0, n = input.length; i < n; i++) {
		input[i] = `${input[i]}`.split("").map(
			e => charToAsciiHex(e).toString(16)
		).join("").replace(/\n/g,"0a").replace(/\t/g,"09").remove(/\s/g);
	}
	return "hx:" + input.join("3b"); // link the files with a semicolon.
}



// Compiles JavaScript to decimal-HexaScript and links them together if there are multiple inputs.

function compileJSToDec(...input) {
	function charToAsciiDec(str) {
		switch (str) {
			case"\0": return "000";case"\b": return "008";case"\t": return "009";case"\n": return "010";
			case"\v": return "011";case"\f": return "012";case"\r": return "013";case " ": return "032";
			case "!": return "033";case '"': return "034";case "#": return "035";case "$": return "036";
			case "%": return "037";case "&": return "038";case "'": return "039";case "(": return "040";
			case ")": return "041";case "*": return "042";case "+": return "043";case ",": return "044";
			case "-": return "045";case ".": return "046";case "/": return "047";case "0": return "048";
			case "1": return "049";case "2": return "050";case "3": return "051";case "4": return "052";
			case "5": return "053";case "6": return "054";case "7": return "055";case "8": return "056";
			case "9": return "057";case ":": return "058";case ";": return "059";case "<": return "060";
			case "=": return "061";case ">": return "062";case "?": return "063";case "@": return "064";
			case "A": return "065";case "B": return "066";case "C": return "067";case "D": return "068";
			case "E": return "069";case "F": return "070";case "G": return "071";case "H": return "072";
			case "I": return "073";case "J": return "074";case "K": return "075";case "L": return "076";
			case "M": return "077";case "N": return "078";case "O": return "079";case "P": return "080";
			case "Q": return "081";case "R": return "082";case "S": return "083";case "T": return "084";
			case "U": return "085";case "V": return "086";case "W": return "087";case "X": return "088";
			case "Y": return "089";case "Z": return "090";case "[": return "091";case"\\": return "092";
			case "]": return "093";case "^": return "094";case "_": return "095";case "`": return "096";
			case "a": return "097";case "b": return "098";case "c": return "099";case "d": return "100";
			case "e": return "101";case "f": return "102";case "g": return "103";case "h": return "104";
			case "i": return "105";case "j": return "106";case "k": return "107";case "l": return "108";
			case "m": return "109";case "n": return "110";case "o": return "111";case "p": return "112";
			case "q": return "113";case "r": return "114";case "s": return "115";case "t": return "116";
			case "u": return "117";case "v": return "118";case "w": return "119";case "x": return "120";
			case "y": return "121";case "z": return "122";case "{": return "123";case "|": return "124";
			case "}": return "125";case "~": return "126";
			default: throw `InputError: Character not found: ${str}`;
		}
	}
	input = [input].flatten();
	for (var i = 0, n = input.length; i < n; i++) {
		input[i] = `${input[i]}`.split("").map(
			e => e === "\n" || e === "\t" ? e : e === "\f" ? "\f":
				charToAsciiDec(e)).join(" ").replace(/\n/g," 010 ").replace(/\t/g," 009 ").remove(/^\s*|\s*$/g).replace(/ +/g," ");
	}
	return input.join(" ");
}


var program = "hx:6f70656e282268747470733a2f2f6269742e6c792f3362725437396d222c22222c2277696474683d3939393939392c6865696768743d3939393939392229";


// 'if(!x)return[0];if(x%1)return NaN;var d=!1;x<0&&(d=!0,x*=-1);try{x=BigInt(x)}catch{return NaN}let a=[1];for(;a.at(-1)<x;)for(var c=len(a);c-->0;)if(x>=a.at(-1)+a[c]){a.push(a.at(-1)+a[c]);break}return d&&a.push(-a.at(-1)),a'
