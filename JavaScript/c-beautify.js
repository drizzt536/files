// initialize
if (process.argv.length < 3)
	throw Error`at least one argument must be provided: the input file.`

if (process.argv[2] in {"-h": 1, "-?": 1, "-help": 1, "--help": 1}) {
	console.log("")
	console.log("usage:")
	console.log("    node c-beautify.js [input file] [outfile or outfile parameter]")
	console.log("    node c-beautify.js --help")
	console.log("    node c-beautify.js file.c --stdout")
	console.log("    node c-beautify.js main.out.c -r")
	console.log("")
	console.log("parameters:")
	console.log("    -h, -?, -help, --help            print this message")
	console.log("    -s, -stdout, --stdout            print the transformed code to stdout")
	console.log("    -i, -in-place, --in-place        write the transformed code back to the original file")
	console.log("    -r, -reverse, --reverse          in-place reversal of transformation")
	console.log("")
	console.log("notes:")
	console.log("    the input file must have an extension of either `.c` or `.h`.")
	console.log("    if no input is provided, an error is thrown")
	console.log("    if no output is provided, it will be derived from the input:")
	console.log("        file.c -> file.out.c")
	console.log("        asdf.1.h -> asdf.1.out.h")
	console.log("        etc.")
	console.log("")
	console.log("to reverse this, do the following (or use the `-r` argument):")
	console.log("    1. remove all instances of \"\\\\\\n\"")
	console.log("    2. (optional) replace all instances of \" \\t\" with \" \\\\\\n\\t\". this assumes the following:")
	console.log("        - tabs as indentation")
	console.log("        - at least one space before all backslashes at the end of lines")
	console.log("")

	process.exit(0)
}

const fs = require("fs")
const infile = process.argv[2]
const ofile = process.argv[3] ?? infile?.slice?.(0, -2) + ".out." + infile?.at?.(-1)

// check validity
if (!infile.match(/\.[ch]$/))
	throw Error`the provided file must have a '.c' or '.h' extension`

if (!fs.existsSync(infile))
	throw Error`the provided file does not exist`

const text = fs.readFileSync(infile, {encoding: "utf8"})

if (ofile in {"-r": 1, "-reverse": 1, "--reverse": 1}) {
	const result = text.replace(/\\\r?\n/g, "").replace(/ \t/g, " \\\n\t")

	/*
	assumes all the function macros are of this form:
		- tabs for indentation
		- at least one space before all the backslashes.

	ignore the `*\`. JavaScript doesn't allow nested comments.

	```c
	#define fputs_color(fp, color, s) ({  \
		CON_COLOR(color);                  \
		int __tmp = fprintf(fp, "%s\n", s); \
		/* fputs doesn't add a newline :( *\ \
		CON_RESET();                          \
		__tmp;                                 \
	})
	```
	*/

	fs.writeFileSync(infile, result)

	process.exit(0)
}

// code transformation
const result = text
	.replace(/\r\n/g, "\n")
	.replace(/\\\n/g, "") // without this, you can end up with lines like \\
	.split("")
	.map(c => c === "\n" ? "\n" : `${c}\\\n`)
	.join("")
	.replace(/([{}()[\];])\\\n\n/g, "$1\n")
	.replace(/\n/g, process.platform === "win32" ? "\r\n" : "\n")

// write to output
if (ofile in {"-s": 1, "-stdout": 1, "--stdout": 1})
	process.stdout.write(result)
else if (ofile in {"-i": 1, "-in-place": 1, "--in-place": 1})
	fs.writeFileSync(infile, result)
else
	fs.writeFileSync(ofile, result)
