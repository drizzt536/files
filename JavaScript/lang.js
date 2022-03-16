function compileProgram(str) {
	function asciiNumToChar(str) {
		if (str[1] === "x") str = (h => {
			let hex = "";
			for (const i of h) hex += isNaN(i) ? i.toLowerCase() : i;
			return hex;
		})(str);
		switch (!0) {
			case str?.length === 1 || str === "//" || str === "\\eJavascript)": return;
			case /\b(000|0x00)\b/.test(str):return "\0"; case /\b(009|0x09)\b/.test(str):return "\t";
			case /\b(010|0x0a)\b/.test(str):return "\n"; case /\b(013|0x0d)\b/.test(str):return "\r";
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
			case /\b(125|0x7d)\b/.test(str): return "}"; case /\b(126|0x7e)\b/.test(str): return "~";
			default: return null;
		}
	}
	for (var i = 0, asciicode = str.replace(/^\n+|\n+$/g, "").replace(/^([\n\t])+/, "").replace(/\n/g," \n ").split(/[ \t\r\f]+/g).filter(e=>e), code = "", tmp, row = 1, col = 1; i < asciicode.length; i++) {// for each token
		//return [str, asciicode][1];

		if (/\/\//.test(asciicode[i])) {// if the current token is a comment
			var temp = asciicode[i].match(/.*(?=\/\/)/)[0] || "//";
			while (asciicode[i] !== void 0 && asciicode[i] !== "\n") // remove the code up to the next newline
				asciicode.splice(i, 1);
			asciicode.splice(i, 0, temp);//put back what was before the "//" in the same word ex: 0x5f//0x00 puts back 0x5f
			if (asciicode[i] === void 0) return code;

		} else if (asciicode[i] === "\\sJavascript(") {//Javascript mode
			var loc = [row, col];
			code += " "
			while (asciicode[i] !== void 0 && asciicode[i+1] !== "\\eJavascript)") {
				i++;
				code += `${asciicode[i]} `;
				if (asciicode[i] === "\n" && asciicode[i - 1] !== "\n") col = 0, row++;
				if (asciicode[i] !== "\n") col++;
			}

			if (asciicode[i] === void 0)
				throw `JavascriptError: Javascript function not closed. function opened at (${loc[0]}, ${loc[1]})`;
		}
		var tmp = asciiNumToChar(asciicode[i].replace(/;/g, ""));
		if (tmp === null) throw `TokenError: Unknown token at location (${row}, ${col}): '${asciicode[i]}'`;
		if (tmp != null) code += tmp;
		else if (asciicode[i] === "\n" && asciicode[i - 1] !== "\n") col = 1, row++;
		if (asciicode[i] !== "\n") col++;
	}
	// optional, just for the visuals
	code = code.replace(/ +/g, " ").replace(/\n(\s)*/, "\n\t").replace(/^\s*/, "\t").replace(/\s+$/, "");
	//return code;

	return (new Function(
		"return function(program){return function Program() {return program(this, arguments)}}"
	)())(Function.apply.bind(new Function(code)))
}

var interpretProgram = str => compileProgram(str)();

function compileToHex(input) {
	function charToAscii(str) {
		switch (str) {
			case"\0": return 0;case "\t": return 9;case "\n":return 10;case "\r": return 13;
			case " ": return 32;case "!": return 33;case '"': return 34;
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
			case "c": return 99;case "d": return 100;case "e": return 101;case "f": return 102;
			case "g": return 103;case "h": return 104;case "i": return 105;case "j": return 106;
			case "k": return 107;case "l": return 108;case "m": return 109;case "n": return 110;
			case "o": return 111;case "p": return 112;case "q": return 113;case "r": return 114;
			case "s": return 115;case "t": return 116;case "u": return 117;case "v": return 118;
			case "w": return 119;case "x": return 120;case "y": return 121;case "z": return 122;
			case "{": return 123;case "|": return 124;case "}": return 125;case "~": return 126;
			default: throw `InputError: Character not found: ${str}`;
		}
	}
	return String(input).split("").map(e=>e==="\n"||e==="\t"?e:`0x${charToAscii(e).toString(16)}`).join(" ").replace(/(?<=[\n\t]) | (?=[\n\t])/g, "")
}

/*
Hello World Programs:
interpretProgram(`\\sJavascript( var i = 2; \n console.log("Hello World"); \n return 3; \\eJavascript)`;)

interpretProgram(`099 111 110 115 111 108 101 046 108 111 103 040 034 072 101 108 108 111 032 087 111 114 108 100 034 041 059`)

interpretProgram(`0x63 0x6f 0x6e 0x73 0x6f 0x6c 0x65 0x2e 0x6c 0x6f 0x67 0x28 0x22 0x48 0x65 0x6c 0x6c 0x6f 0x20 0x57 0x6f 0x72 0x6c 0x64 0x22 0x29 0x3b`)
*/
