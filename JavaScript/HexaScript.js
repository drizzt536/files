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
	SupportedChars.prototype.length = Object.keys(new SupportedChars()).length;
	return new SupportedChars();
})();



// Compile HexaScript to a JavaScript function

function compileProgram(str, form="function", download=false, downloadFile="file.js", debug=false) {
	assert(type(str, 1) === "str", `argument 1 in compileProgram() is not a string`, dir());
	assert(type(download, 1) === "bool", `argument 3 in compileProgram() is not a boolean`, dir());
	assert(type(downloadFile, 1) === "str", `argument 4 in compileProgram() is not a string`, dir());
	assert(type(debug, 1) === "bool", `argument 5 in compileProgram() is not a boolean`, dir());
	function asciiNumToChar(str) {
		switch (true) {
			case /\b(000|0x00)\b/.test(str): return"\0";case /\b(008|0x08)\b/.test(str): return"\b";
			case /\b(009|0x09)\b/.test(str): return"\t";case /\b(010|0x0a)\b/.test(str): return"\n";
			case /\b(011|0x0b)\b/.test(str): return"\v";case /\b(012|0x0c)\b/.test(str): return"\f";
			case /\b(013|0x0d)\b/.test(str): return"\r";

			case /\b(032|0x20)\b/.test(str): return " "; case /\b(033|0x21)\b/.test(str): return "!";
			case /\b(034|0x22)\b/.test(str): return '"'; case /\b(035|0x23)\b/.test(str): return "#";
			case /\b(036|0x24)\b/.test(str): return "$"; case /\b(037|0x25)\b/.test(str): return "%";
			case /\b(038|0x26)\b/.test(str): return "&"; case /\b(039|0x27)\b/.test(str): return "'";
			case /\b(040|0x28)\b/.test(str): return "("; case /\b(041|0x29)\b/.test(str): return ")";
			case /\b(042|0x2a)\b/.test(str): return "*"; case /\b(043|0x2b)\b/.test(str): return "+";
			case /\b(044|0x2c)\b/.test(str): return ","; case /\b(045|0x2d)\b/.test(str): return "-";
			case /\b(046|0x2e)\b/.test(str): return "."; case /\b(047|0x2f)\b/.test(str): return "/";

			case /\b(048|0x30)\b/.test(str): return "0"; case /\b(049|0x31)\b/.test(str): return "1";
			case /\b(050|0x32)\b/.test(str): return "2"; case /\b(051|0x33)\b/.test(str): return "3";
			case /\b(052|0x34)\b/.test(str): return "4"; case /\b(053|0x35)\b/.test(str): return "5";
			case /\b(054|0x36)\b/.test(str): return "6"; case /\b(055|0x37)\b/.test(str): return "7";
			case /\b(056|0x38)\b/.test(str): return "8"; case /\b(057|0x39)\b/.test(str): return "9";

			case /\b(058|0x3a)\b/.test(str): return ":"; case /\b(059|0x3b)\b/.test(str): return ";";
			case /\b(060|0x3c)\b/.test(str): return "<"; case /\b(061|0x3d)\b/.test(str): return "=";
			case /\b(062|0x3e)\b/.test(str): return ">"; case /\b(063|0x3f)\b/.test(str): return "?";
			case /\b(064|0x40)\b/.test(str): return "@";

			case /\b(065|0x41)\b/.test(str): return "A"; case /\b(066|0x42)\b/.test(str): return "B";
			case /\b(067|0x43)\b/.test(str): return "C"; case /\b(068|0x44)\b/.test(str): return "D";
			case /\b(069|0x45)\b/.test(str): return "E"; case /\b(070|0x46)\b/.test(str): return "F";
			case /\b(071|0x47)\b/.test(str): return "G"; case /\b(072|0x48)\b/.test(str): return "H";
			case /\b(073|0x49)\b/.test(str): return "I"; case /\b(074|0x4a)\b/.test(str): return "J";
			case /\b(075|0x4b)\b/.test(str): return "K"; case /\b(076|0x4c)\b/.test(str): return "L";
			case /\b(077|0x4d)\b/.test(str): return "M"; case /\b(078|0x4e)\b/.test(str): return "N";
			case /\b(079|0x4f)\b/.test(str): return "O"; case /\b(080|0x50)\b/.test(str): return "P";
			case /\b(081|0x51)\b/.test(str): return "Q"; case /\b(082|0x52)\b/.test(str): return "R";
			case /\b(083|0x53)\b/.test(str): return "S"; case /\b(084|0x54)\b/.test(str): return "T";
			case /\b(085|0x55)\b/.test(str): return "U"; case /\b(086|0x56)\b/.test(str): return "V";
			case /\b(087|0x57)\b/.test(str): return "W"; case /\b(088|0x58)\b/.test(str): return "X";
			case /\b(089|0x59)\b/.test(str): return "Y"; case /\b(090|0x5a)\b/.test(str): return "Z";

			case /\b(091|0x5b)\b/.test(str): return "["; case /\b(092|0x5c)\b/.test(str):return "\\";
			case /\b(093|0x5d)\b/.test(str): return "]"; case /\b(094|0x5e)\b/.test(str): return "^";
			case /\b(095|0x5f)\b/.test(str): return "_"; case /\b(096|0x60)\b/.test(str): return "`";

			case /\b(097|0x61)\b/.test(str): return "a"; case /\b(098|0x62)\b/.test(str): return "b";
			case /\b(099|0x63)\b/.test(str): return "c"; case /\b(100|0x64)\b/.test(str): return "d";
			case /\b(101|0x65)\b/.test(str): return "e"; case /\b(102|0x66)\b/.test(str): return "f";
			case /\b(103|0x67)\b/.test(str): return "g"; case /\b(104|0x68)\b/.test(str): return "h";
			case /\b(105|0x69)\b/.test(str): return "i"; case /\b(106|0x6a)\b/.test(str): return "j";
			case /\b(107|0x6b)\b/.test(str): return "k"; case /\b(108|0x6c)\b/.test(str): return "l";
			case /\b(109|0x6d)\b/.test(str): return "m"; case /\b(110|0x6e)\b/.test(str): return "n";
			case /\b(111|0x6f)\b/.test(str): return "o"; case /\b(112|0x70)\b/.test(str): return "p";
			case /\b(113|0x71)\b/.test(str): return "q"; case /\b(114|0x72)\b/.test(str): return "r";
			case /\b(115|0x73)\b/.test(str): return "s"; case /\b(116|0x74)\b/.test(str): return "t";
			case /\b(117|0x75)\b/.test(str): return "u"; case /\b(118|0x76)\b/.test(str): return "v";
			case /\b(119|0x77)\b/.test(str): return "w"; case /\b(120|0x78)\b/.test(str): return "x";
			case /\b(121|0x79)\b/.test(str): return "y"; case /\b(122|0x7a)\b/.test(str): return "z";

			case /\b(123|0x7b)\b/.test(str): return "{"; case /\b(124|0x7c)\b/.test(str): return "|";
			case /\b(125|0x7d)\b/.in(str): return "}"; case /\b(126|0x7e)\b/.in(str): return "~";
			default: return null;
		}
	}
	assert(len(SupportedChars) === 18, `Exhausive handling of Supported characters in compileProgram(): ${SupportedChars.length}`, dir());
	const newToken = () => {
		if (token.token/* !== ""*/) {
			//token.id = j++;
			program.push(copy(token));
		}
		token.token = "";
	}
	// the 'stop' is so it doesn't complain about skipping past the end, and the space is because it pushes the new token into the program if it encounters a space after it and thus needs a space at the end. 
	str = `${str.remove(/\/\/(.|[\f\t\r ])*$/gm)} stop `; // remove single-lined comments
	for (var [row, col] = [1, 1], i = 0, j = 0, n = len(str), program = [], token = { token: "", row: null, col: null/*, id: null*/}, code = "", tmp; i < n; i++) {//create the list of tokens
		if (debug) console.log(row, col, str[i], token);
		if (str[i] === "\n") row++, col = 0, newToken();
		else if (/\s/.test(str[i])) newToken();
		else if (/\w/.test(str[i])) {
			if (str[i-1] === void 0 || /\s/.test(str[i-1]) || str.substring(i-2, i) === "*/")
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
			i += 2, col += 2;
			while (str.substr(i, 2) !== "*/") {
				if (i > str.length) throw `CommentError:${token.row}:${token.col}:Multi-Line Comment not terminated, or another '/' is placed directly after with no whitespace.`;
				if (str[i] === "\n") row++, col = 0;
				col++, i++;
			}
			col++, i++;
		} else if(str[i] in SupportedChars) {
			if (str[i-1] === void 0 || /\s/.test(str[i-1]) || str.substring(i-2, i) === "*/")
				[token.row, token.col] = [row, col];
			token.token += str[i];
		}
		else throw `CharacterError: Unsupported character '${str[i]}'`;
		col++;
	}
	if (form === "object" || form === "obj" || form === "array" || form === "arr") return program;

	var labels = {}, stack  = [], conditionalStack = [];

	assert(len(Intrinsics) === 13, `Exhausive handling of Intrinsics in compileProgram(): ${Intrinsics.length}`, dir());
	for (i = 0, n = len(program); i < n; i++) { // loop over the tokens and interpret them
		if (debug) console.log("parsing: %o,  id: %o", program[i].token, i);
		if (program[i].token === "010" || program[i].token === "0x0a") code += "\n";
		else if (program[i].token === "009" || program[i].token === "0x09") code += "\t";
		else if (program[i].token === "lbl") {
			if (i+1 === len(program)) throw `LabelError:${program[i].row}:${program[i].col}: No label name given for 'lbl'`;
			if (!isNaN(program[++i].token)) throw `LabelError:${program[i].row}:${program[i].col}: label name cannot be an integer '${program[i].token}'`;
			if (program[i].token in labels) throw `LabelError:${program[i].row}:${program[i].col}: Re-definition of label '${program[i].token}'`;
			labels[program[i].token] = i;
		} else if (program[i].token === "goto") { // should be avoided inside of loops and conditionals
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
			if (len(stack) === 0) throw `PrintError:${program[i].row}:${program[i].col}: Cannot pop from an empty stack`;
			console.log(stack.pop()[0]);
		} else if (program[i].token === "if") conditionalStack.push(i);
		else if (program[i].token === "then") {
			if (!len(stack)) throw `StackError:${program[i].row}:${program[i].col}: 'then' requires an argument on the stack`;
			if (!len(conditionalStack)) throw `ConditionalStackError:${program[i].row}:${program[i].col}: 'then' requires an if before it`
			if (stack.pop()[0] !== true) { // goto the corresponding 'end'
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
			if (isNaN(skipNum)) throw `SkipError:${program[i].row}:${program[i].col}: Expected a number of instructions to skip`;
			if (skipNum < 0) throw `SkipError:${program[i].row}:${program[i].col}: only positive integers are allowed as paramaters for skip`;
			if (skipNum === 0) continue;
			i++;
			while (skipNum > 0) {
				if (program[i].token === "(") {
					var openLoc = [program[i].row, program[i].col];
					while (i < len(program) && program[i].token !== ")") i++;
					if (i === len(program)) throw `ScriptError:${openLoc[0]}:${openLoc[1]}: '(' not closed, and can't be skipped`;
					i++;
				} else i++;
				skipNum--;
				if (i === len(program) && skipNum) throw `SkipError:${skipLoc.join(":")}: 'skip' cannot go past the end of the program. use 'stop' to end prematurely`;
			}
			i--;
		} else if (program[i].token === "pop") {
			if (!len(stack)) throw `StackError:${program[i].row}:${program[i].col}: Cannot pop from an empty stack`;
			code += stack.pop()[0];
		} else if (program[i].token === "shift") {// I know that shift is not for stacks. ignore it
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
					if (program[i - 1].token !== "(") code += " ";
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
	// console.log(conditionalStack);
	if (len(conditionalStack)) console.warn(`StackError: ${len(conditionalStack)} Conditional ${len(conditionalStack)===1? "statement" : "statements"} not terminated`);



	if (download) {
		(function download(text, file) {
			assert(type(text,1) + type(file,1) === "strstr", `Incorrect input types. expected 2 strings but found ${type(text)}, and ${type(file)}`, dir());
			const link = document.createElement("a");
			link.download = `${file}`;
			link.href = URL.createObjectURL(new Blob([text], {type: 'text/plain'}));
			link.click();
		})(code, downloadFile);
	}


	if (form === "str" || form === "string") return code;
	return new Function(code);
	// return (new Function(
	// 	"return program=>function Program() {return program(this, arguments)}"
	// )())(Function.apply.bind(new Function(code)))
}



// Compile HexaScript to a JavaScript function and run it.

function interpretProgram(str, form="function", download=false, downloadFile="file.js", debug=false) {
	try { return compileProgram(str, form, download, downloadFile, debug)() }
	catch { return compileProgram(str, form, download, downloadFile, debug) }
}



// Error stuff

function gotoToken(s, r, c) {
	return c > len(s = s.split("\n")[r - 1].substring(c - 1)) || c < 0 || r < 0 ?
		void 0:
		/\s/.in(s[0])?
			s[0]:
			s.remove(/\s.*/);
}

const gotoTokenLine = (str, row, col) => str.split("\n")[row - 1];



// Compile JavaScript to hexadecimal-HexaScript and links them together if there are multiple inputs.

function compileJSToHex(...input) {
	function charToAsciiHex(str) {
		switch (str) {
			case"\0": return"00";case"\b":return"08";case"\t":return"09";
			case"\b":return "08";case"\n":return"0a";case "\v":return "0b";case"\f":return "0c";
			case "\r":return"0d";case" ": return 32;case "!": return 33;case '"': return 34;
			case "#": return 35;case "$": return 36;case "%": return 37;case "&": return 38;
			case "'": return 39;case "(": return 40;case ")": return 41;case "*": return 42;
			case "+": return 43;case ",": return 44;case "-": return 45;case ".": return 46;
			case "/": return 47;case "0": return 48;case "1": return 49;case "2": return 50;
			case "3": return 51;case "4": return 52;case "5": return 53;case "6": return 54;
			case "7": return 55;case "8": return 56;case "9": return 57;case ":": return 58;
			case ";": return 59;case "<": return 60;case "=": return 61;case ">": return 62;
			case "?": return 63;case "@": return 64;case "A": return 65;case "B": return 66;
			case "C": return 67;case "D": return 68;case "E": return 69;case "F": return 70;
			case "G": return 71;case "H": return 72;case "I": return 73;case "J": return 74;
			case "K": return 75;case "L": return 76;case "M": return 77;case "N": return 78;
			case "O": return 79;case "P": return 80;case "Q": return 81;case "R": return 82;
			case "S": return 83;case "T": return 84;case "U": return 85;case "V": return 86;
			case "W": return 87;case "X": return 88;case "Y": return 89;case "Z": return 90;
			case "[": return 91;case"\\": return 92;case "]": return 93;case "^": return 94;
			case "_": return 95;case "`": return 96;case "a": return 97;case "b": return 98;
			case "c": return 99;case "d": return 100;case"e": return 101;case "f": return 102;
			case "g": return 103;case"h": return 104;case"i": return 105;case "j": return 106;
			case "k": return 107;case"l": return 108;case"m": return 109;case "n": return 110;
			case "o": return 111;case"p": return 112;case"q": return 113;case "r": return 114;
			case "s": return 115;case"t": return 116;case"u": return 117;case "v": return 118;
			case "w": return 119;case"x": return 120;case"y": return 121;case "z": return 122;
			case "{": return 123;case"|": return 124;case"}": return 125;case "~": return 126;
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
}



// Compile JavaScript to decimal-HexaScript and links them together if there are multiple inputs.

function compileJSToDec(...input) {
	function charToAsciiDec(str) {
		switch (str) {
			case"\0": return "000";case "\b":return "008";case "\t":return "009";case "\n":return "010";
			case "\v":return "011";case "\f":return "012";
			case "\r":return "013";case " ": return "032";case "!": return "033";case '"': return "034";
			case "#": return "035";case "$": return "036";case "%": return "037";case "&": return "038";
			case "'": return "039";case "(": return "040";case ")": return "041";case "*": return "042";
			case "+": return "043";case ",": return "044";case "-": return "045";case ".": return "046";
			case "/": return "047";case "0": return "048";case "1": return "049";case "2": return "050";
			case "3": return "051";case "4": return "052";case "5": return "053";case "6": return "054";
			case "7": return "055";case "8": return "056";case "9": return "057";case ":": return "058";
			case ";": return "059";case "<": return "060";case "=": return "061";case ">": return "062";
			case "?": return "063";case "@": return "064";case "A": return "065";case "B": return "066";
			case "C": return "067";case "D": return "068";case "E": return "069";case "F": return "070";
			case "G": return "071";case "H": return "072";case "I": return "073";case "J": return "074";
			case "K": return "075";case "L": return "076";case "M": return "077";case "N": return "078";
			case "O": return "079";case "P": return "080";case "Q": return "081";case "R": return "082";
			case "S": return "083";case "T": return "084";case "U": return "085";case "V": return "086";
			case "W": return "087";case "X": return "088";case "Y": return "089";case "Z": return "090";
			case "[": return "091";case"\\": return "092";case "]": return "093";case "^": return "094";
			case "_": return "095";case "`": return "096";case "a": return "097";case "b": return "098";
			case "c": return "099";case "d": return "100";case "e": return "101";case "f": return "102";
			case "g": return "103";case "h": return "104";case "i": return "105";case "j": return "106";
			case "k": return "107";case "l": return "108";case "m": return "109";case "n": return "110";
			case "o": return "111";case "p": return "112";case "q": return "113";case "r": return "114";
			case "s": return "115";case "t": return "116";case "u": return "117";case "v": return "118";
			case "w": return "119";case "x": return "120";case "y": return "121";case "z": return "122";
			case "{": return "123";case "|": return "124";case "}": return "125";case "~": return "126";
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
