// make all

// the version number is given in the VERSION macro

// the build file for this program is ./Makefile
// the rest of the NASM development system is here:
	// - main syntax file: ../SublimeText/NASM.sublime-syntax
	// - other stuff     : ../SublimeText/NASM/

// TODO: collapse spaces in the command printouts.
// TODO: add `--aslr` option. (pass `--dynamicbase` to `ld`)
// TODO: if no extension is given and there is no `.nasm`, try other extensions
// TODO: allow other entry points. And consider making mainCRTStartup the default.
// TODO: make an argument to print everything without color.
// TODO: add something to use different libraries on different operating systems
	// specifically for the infer line, like `--l ucrtbase` on Windows, but `--l c` on Linux.
// TODO: make it so `--` by itself as an argument makes everything after it get passed
	// to the final executable with `--e`


#ifndef __GNUC__
	#error "This program only works with GCC or compilers that allow GCC extensions."
#elif __GNUC__ < 10
	// should this be __STDC_VERSION__?
	// I don't actually think all GCC 10.x versions even have C23
	#error "Use GCC 10 or newer. Required for C23 `__VA_OPT__`."
#endif


//## inclusions ##//

// string, strjoin, sstrjoin
// string.h
	// NULL, size_t, strnlen, memcpy, strlen, strcmp, strdup, strerror
// stdlib.h
	// malloc, exit, free, system, remove
#include "../C/string-join.h"

#define ERRLOG_OOM_EC           3
#define ERRLOG_INVALID_FILE_EC  4
#define ERRLOG_FILE_VAL_SPACES  "  "
// ANSI_COLOR, ANSI_RESET, ANSI_RED, ANSI_GREEN, ANSI_ORANGE,
// CON_COLOR, CON_RESET, printf_color, puts_color, eprintf, eputs,
// OOM, VALIDATE_FILE,
// stdio.h
	// printf, puts, sprintf
#include "../C/error-print.h"
// #undef ERRLOG_LEVEL
// #define ERRLOG_LEVEL ERRLOG_ALL

// bool, false, true
#include <stdbool.h>

//## macros and types ##//

#ifdef _WIN32
	#define IS_WINDOWS true
#else
	#define IS_WINDOWS false
#endif

#ifndef NASM_FORMAT
	#error "-D NASM_FORMAT=\"format\" must be given to GCC for assemble.c"
#endif

#if !defined(GIT_REPO) || !defined(GIT_HASH)
	#define GIT_DATA "no-git"
#else
	#define GIT_DATA GIT_REPO "\n" GIT_HASH
#endif

#define TIMESTAMP __DATE__ " " __TIME__
#define VERSION "NASM Build Tool v3.2\n" TIMESTAMP "\n" GIT_DATA

#define _VALIDATE_FILE(path, quoted, verbose, code) ({ \
	if (quoted) path.s[path.l - 1] = '\0';             \
	/*if (verbose) putchar(' ');*/                     \
	VALIDATE_FILE(path.s + quoted, code, verbose);     \
	if (quoted) path.s[path.l - 1] = '"';              \
})

#define cleanup_char cleanup_array
#define AUTO_FREE(x) __attribute__((cleanup(cleanup_##x))) x

#define AF_char         AUTO_FREE(char)
#define AF_string       AUTO_FREE(string)
#define AF_FILE         AUTO_FREE(FILE) // should be a `FILE *` variable and not just `FILE`
#define AF_Params       AUTO_FREE(Params)
#define AF_FilePathData AUTO_FREE(FilePathData)

#define FORCE_INLINE __attribute__((always_inline)) static inline

typedef struct {
	const string libs;

	const bool alwaysKeepObj
		, assembleOnly
		, exec
		, keepObjOnLinkerFail
		, normalizeSegments
		, strip
		, verbose;
} Params;

typedef struct {
	const string path;
	const size_t dotIndex;
	const bool quoted;
} FilePathData;

//## functions ##//

// these all assume you didn't free the values themselves. doing so may cause undefined behavior.
// these take in `const`s in case your variable was constant,
// but casts it away because `free` doesn't like it.
FORCE_INLINE void cleanup_array       (const void *p)         { free(* (void **) p); }
FORCE_INLINE void cleanup_Params      (const Params *p)       { free((void *) p->libs.s); }
FORCE_INLINE void cleanup_FILE        (FILE *const *fp)       { fclose(*fp); }
FORCE_INLINE void cleanup_string      (const string *p)       { free((void *) p->s); }
FORCE_INLINE void cleanup_FilePathData(const FilePathData *p) { free((void *) p->path.s); }

FORCE_INLINE void help(const unsigned char options) {
	bool
		include_usage                 = options & (1 << 7),
		include_overview              = options & (1 << 6),
		include_options               = options & (1 << 5),
		include_exit_codes            = options & (1 << 4),
		include_out_of_memory_codes   = options & (1 << 3),
		include_file_validation_codes = options & (1 << 2),
		include_examples              = options & (1 << 1),
		include_version               = options & (1 << 0);

	if (include_usage) puts(
		"Usage: assemble infile [options]\n"
	);
	if (include_overview) puts(
		"Rough Overview of Process:\n"
		"    # infer arguments from infile, when applicable\n"
		"    nasm -f" NASM_FORMAT " -Werror $infile -o $object $params\n"
		"\n"
		"    # the print-out will use `--rename` which should be the same.\n"
		"    objcopy --rename-section text=.text \\\n"
		"            --rename-section data=.data  \\\n"
		"            --rename-section rdata=.rdata \\\n"
		"            --rename-section rodata=.rdata \\\n"
		"            --rename-section .rodata=.rdata $object\n"
		"\n"
		"    ld $object $libs -o $outfile -e main --gc-sections\n"
		"    if stripFile, strip -s -R .comment -R comment -R .note -R note $outfile\n"
		"    if remove, rm $object\n"
		"    if exec, run $outfile\n"
	);
	if (include_exit_codes) puts(
		"Exit Codes:\n"
		"\n"
		"    code | description\n"
		"  -------+----------------------------------\n"
		"      0  | success\n"
		"      1  | (unused)\n"
		"      2  | invalid argument(s)\n"
		"      3  | out of memory\n"
		"      4  | invalid/nonexistent file\n"
		"      5  | assembler error\n"
		"      6  | segment renaming error\n"
		"      7  | linker error\n"
		"      8  | stripping error\n"
		"      9  | file removal error\n"
		"     10  | execution error (output program)\n"
	);
	if (include_out_of_memory_codes) puts(
		"Out of Memory Error Codes:\n"
		"\n"
		"    code | operation          | description/condition\n"
		"  -------+--------------------+---------------------------------------------\n"
		"      1  | filename parsing   | output string could not be created\n"
		"      2  | argument inferring | adding argument character to string\n"
		"      3  | argument inferring | adding null byte to string\n"
		"      4  | argument inferring | malformed argument line or no arguments\n"
		"      5  | argument inferring | joining CLI args\n"
		"      6  | argument inferring | joining inferred and CLI args together\n"
		"      7  | argument parsing   | `--l` is passed\n"
		"      8  | argument parsing   | `--l` is not passed\n"
		"      9  | setup              | creating output file string\n"
		"     10  | setup              | creating object file string\n"
		"     11  | setup              | argument parsing, `--infer` not passed.\n"
		"     12  | assembling         | creating command string\n"
		"     13  | segment renaming   | creating command string\n"
		"     14  | linking            | creating command string\n"
		"     15  | stripping          | creating command string\n"
	);
	if (include_file_validation_codes) puts(
		"File Validation Error Codes:\n"
		"\n"
		"    code | operation        | description\n"
		"  -------+------------------+--------------------------------\n"
		"      1  | setup            | input file doesn't exist\n"
		"      2  | setup            | object file doesn't exist\n"
		"      3  | setup            | output file doesn't exist\n"
		"      4  | filename parsing | input filename contains quotes\n"
		"      5  | filename parsing | path end quotes don't match.\n"
	);
	if (include_examples) puts(
		"Examples:\n"
		"    ./assemble hello --S --N --K\n"
		"        input = ./hello.nasm (.nasm is assumed if no extension is present)\n"
		"        don't strip, normalize segments, remove object, or execute\n"
		"        no extra arguments to nasm.\n"
		"        no libraries passed to ld\n"
		"\n"
		"    ./assemble ../file.asm --e -g --l ucrtbase,kernel32\n"
		"        input = ./../file.asm\n"
		"        strip, normalize segments, remove object file, and execute\n"
		"        pass `-g` to nasm\n"
		"        pass `-lmsvcrt -lkernel32` to ld.\n"
		"\n"
		"    ./assemble folder/main\n"
		"        input = ./folder/main.nasm\n"
		"        strip, normalize segments, remove object file, but don't execute\n"
		"        no extra arguments to nasm\n"
		"        no libraries to ld.\n"
		"\n"
		"    ./assemble -h\n"
		"        print the help message.\n"
		"        If your file is named `--help.nasm`, stop that.\n"
		"        or just do `./assemble --help.nasm`\n"
		"\n"
		"    ./assemble \"./folder with spaces/file.nasm\"\n"
		"        this will not work, and an error will be thrown.\n"
		"\n"
		"    ../assemble hello --infer --e\n"
		"        // first line: `;; ../assemble hello.nasm --l kernel32,user32`\n"
		"        this will act as if you ran this as the command instead:\n"
		"            `../assemble hello --l kernel32,user32 --e`\n"
		"        it essentially puts the arguments on the first line of the file\n"
		"        in place of the `--infer`.\n"
		"        the `../assemble` and `hello.nasm` in the file are ignored, but\n"
		"        they are required. they don't need to be accurate though.\n"
	);
	if (include_options) puts(
		"Options:\n"
		"    --a              assemble only. do not link or normalize segment names\n"
		"    --e              run final executable when done\n"
		"    -h, -?, --help   print this message. only works as the first argument\n"
		"    --help=GROUP     print extended help text. only works as the first argument\n"
		"                     group must be one of the following:\n"
		"                         - error codes: errors, codes, validation, memory, exit\n"
		"                         - compound groups: none, all, basic, default, extra\n"
		"                         - other groups: overview, usage, version, examples, options, arguments, args\n"
		"    --infer          infer arguments from the first line of the input file. only works\n"
		"                     as the first argument after the filename. other arguments can be\n"
		"                     passed after it. the line should be of the following format:\n"
		"                     `; [assemble] [filename] [args]`. It is lenient as to what is allowed.\n"
		"                     the `assemble` and `filename` can be any path (and sometimes invalid),\n"
		"                     and they aren't used; they can be quoted. there can be more than one\n"
		"                     semicolon at the start, but there has to be at least one.\n"
		"    --K              always keep object file (default is to remove)\n"
		"    --k              keep object file only on linker fail\n"
		"    --l LIST         includes comma-separated list of libraries in linking\n"
		"    --N              do not normalize segment names, leave them as the original\n"
		"    --S              do not strip executable (default is to strip everthing)\n"
		"    --s              don't print anything (silent), and\n"
		"                     don't print sub-program messages in color\n"
		"                     does not suppress messages for the following:\n"
		"                         - sub-program (nasm, ld, etc.) errors/warnings\n"
		"                         - out-of-memory error messages\n"
		"                         - when `--help` is given as the first argument\n"
		"                         - error messages when the input file path has spaces\n"
		"    -v, --version    print the compile date, git repository if known, and git commit hash if known\n"
		"\n"
		"    the double minus signs are required; i.e. `--e` will work, `-e` will not.\n"
		"    all other arguments are given to nasm in the same order as provided.\n"
	);
	if (include_version) puts(
		VERSION "\n"
	);

	exit(0);
}

FORCE_INLINE void version(void) {
	printf(VERSION);

	exit(0);
}

char *strnkdup(const char *const s, size_t n, const size_t k) {
	// str n,k dup
	// strndup(s, n) with k extra null bytes at the end.
	// if n + k < MAX(n, k), an overflow occured.
	// I feel like something here is off by one, but I don't know for sure.

	edprintf("DEBUG: strnkdup(\"%s\", %zu, %zu)\n", s, n, k);

	edprintf("DEBUG: n before `n = strnlen(s, n);`: %zu\n", n);
	n = strnlen(s, n);
	edprintf("DEBUG: n after `n = strnlen(s, n);`: %zu\n", n);

	edprintf("DEBUG: (n + 1) + (k) + 1 == %zu\n", n + k + 2);
	// I actually have no idea why this has to be n + k + 2, and not n + k + 1.
	char *const res = (char *) malloc(n + k + 2);
	edprintf("DEBUG: memory allocated: malloc(%zu) == %p\n", n + k + 2, res);

	if (res == NULL)
		return NULL;

	memcpy(res, s, n);
	memset(res + n, '\0', k + 1);

	return res;
}

FORCE_INLINE char *strkdup(const char *const s, const size_t k) {
	// strdup(s) with k extra null bytes at the end.
	return strnkdup(s, -1, k);
}

FilePathData parse_input_filename(const char *const filename) {

	// NOTE: if the input file is "main.", the extension is "".

	// TODO: maybe just always add quotes around file paths?

	char *outstr; // outstr is always set before usage, `= NULL` isn't required.

	const size_t n = strlen(filename);

	bool
		hasExtension = false,
		needsQuotes = false,
		hasQuotes = false;

	// determine if it has quotes or needs quotes.
	for (size_t j = 0; j < n; j++) switch (filename[j]) {
		case '"':
		case '\'':
			if (j == 0 || j == n - 1) {
				hasQuotes = true;
				break;
			}
			// I don't feel like implementing quoting within the string.
			// Double quotes are allowed on Linux, but not on Windows, So
			// it will be super annoying to allow double quotes but only
			// on Linux. I'm not doing that. and single quotes are allowed
			// everywhere, which is different behavior than double quotes,
			// which makes it even more annoying to implement.
			// If you want quotes in your string, then too bad.

			eputs("file paths cannot contain quotes. code: 4");
			exit(4);
		case ' ':
			needsQuotes = true;
		// default: break;
	}

	if (hasQuotes && filename[0] != filename[n - 1]) {
		eprintf("file path's end quotes (%c and %c) do not match, "
			"or quotes are only present on one side. code: 5\n",
			*filename,
			filename[n - 1]
		);
		exit(4);
	}

	// determine if it has an extension
	size_t i = n; // extension index
	while (i --> 0)
		if (filename[i] == '.') {
			hasExtension = true;
			break;
		}
		// `./a.b/file` doesn't have an extension.
		// `./a.b\file` only has an extension on linux.
		// stop looking for an extension if there is a path separator.
		else if (filename[i] == '/' || (IS_WINDOWS && filename[i] == '\\'))
			break;

	if (!hasExtension)
		i = n;

	char *new_ext = ".nasm\"";
	const int max_ext_len = 5;

	edprintf("DEBUG: filename    : %s\n", filename);
	edprintf("DEBUG: hasQuotes   : %s\n", hasQuotes    ? "true" : "false");
	edprintf("DEBUG: needsQuotes : %s\n", needsQuotes  ? "true" : "false");
	edprintf("DEBUG: hasExtension: %s\n", hasExtension ? "true" : "false");

	if (!hasQuotes && needsQuotes) {
		edprintf("DEBUG: !hasQuotes && needsQuotes is true\n");
		edprintf("DEBUG: malloc size: %zu\n", n + 3 + max_ext_len*!hasExtension);
		outstr = (char *) malloc(n + 3 + max_ext_len*!hasExtension);
	}
	else {
		edprintf("DEBUG: !hasQuotes && needsQuotes is false\n");
		outstr = strnkdup(filename, n, max_ext_len*!hasExtension);
	}

	OOM(outstr, 1);

	///////////////////////////////////////////////////////

	if (hasQuotes) {
		edprintf("DEBUG: if (hasQuotes)\n");
		// "f" -> f.nasm"0
		// "f.nasm" -> "f.nasm"
		*outstr = '"'; // normalize to double quotes

		if (hasExtension)
			outstr[n - 1] = '"'; // normalize to double quotes
		else
			strcpy(outstr + n - 1, new_ext);
	}
	else if (needsQuotes) {
		edprintf("DEBUG: else if (needsQuotes)\n");
		// needs quotes (has spaces), but doesn't have quotes.
		// "f.nasm"0 or "f"0

		*outstr = '"';
		memcpy(outstr + 1, filename, n); // shift everything over by one

		if (hasExtension) {
			outstr[n + 1] = '"';
			outstr[n + 2] = '\0';
		}
		else
			strcpy(outstr + n + 1, new_ext);
	}
	else {
		edprintf("DEBUG: else\n");
		// f.nasm0 or f
		const int new_ext_len = strlen(new_ext);

		if (!hasExtension) {
			// everything except the quote
			memcpy(outstr + n, new_ext, new_ext_len - 1);
			outstr[n + new_ext_len] = '\0'; // this may or may not be off by one
		}
	}
	edprintf("DEBUG: outstr has been created\n");
	edprintf("DEBUG: outstr: %s\n", outstr);
	edprintf("DEBUG: 1 + strlen(outstr) == %zu\n", 1 + strlen(outstr));
	edprintf("DEBUG: outstr size allocated: %zu\n", 1 + n + max_ext_len*!hasExtension);
///////////////////////////////////////////////////////

	// TODO: either check file validation here, or move this stuff into the main parsing.

#if IS_WINDOWS
	// \ path separators are yucky. change them to / for the command printouts.
	for (size_t j = 0; outstr[j]/* != '\0'*/; j++)
		if (outstr[j] == '\\')
			outstr[j] = '/';
#endif

	FilePathData fpd = (FilePathData) {
		.path = (string) {
			.s = outstr,
			// length of string + strlen(quotes added) + strlen(extension added)
			// TODO: ???
			.l = n + 2*(!hasQuotes && needsQuotes) + (strlen(new_ext) - 1)*!hasExtension
		},

		// extension index or end of string + (1 if a quote was added before it)
		//  - (1 if the extension was added before the end quote)
		.dotIndex = i + (!hasQuotes && needsQuotes) - (hasQuotes && !hasExtension),

		// NOTE: if quotes were already present but not required, they are kept anyway.
		.quoted = hasQuotes || needsQuotes,
	};

	edprintf("DEBUG: fpd.path.s               == %s\n", fpd.path.s);
	edprintf("DEBUG: fpd.path.l               == %zu\n", fpd.path.l);
	edprintf("DEBUG: fpd.dotIndex             == %zu\n", fpd.dotIndex);
	edprintf("DEBUG: fpd.path.s[fpd.dotIndex] == '%c'\n", fpd.path.s[fpd.dotIndex]);
	edprintf("DEBUG: fpd.quoted               == %s\n", fpd.quoted ? "true" : "false");

	return fpd;
}

Params parse_params(const string args) {
	size_t libsLength;
	char *libs = NULL;

	bool
		a = false,
		k = false,
		K = false,
		N = false,
		s = false,
		S = false,
		e = false;

	for (size_t i = 0; i < args.l; i++) {

		if (args.s[i] != '-')
			continue;

		// "-"

		if (args.s[i + 1] == '\0') // "-\0"
			break;

		if (args.s[i + 1] != '-') { // "-?"
			i++;
			continue;
		}

		// "--"

		if (args.s[i + 2] == '\0')
			// "--\0"
			break;

		if (args.s[i + 3] != ' ' && args.s[i + 3] != '\0') {
			// not "--?[ \0]"
			// if it is something like "--XY", it isn't valid
			i += 2;
			continue;
		}

		switch (args.s[i + 2]) {
			case 'a': a = true; break;
			case 'e': e = true; break;
			case 'k': k = true; break;
			case 'K': K = true; break;
			case 'N': N = true; break;
			case 's': s = true; break;
			case 'S': S = true; break;
			case 'l':
				// converts something like "--l AA,BB,CC" to "-lAA -lBB -lCC"

				// "--l\0".
				// consider adding a printf here?
				if (args.s[i + 3] == '\0')
					goto done; // double break;

				// remove the "--l"
				args.s[i + 0] =
				args.s[i + 1] =
				args.s[i + 2] = ' ';

				i += 4; // skip past "--l "
				const size_t stt = i;
				size_t items = 1;

				for (; args.s[i] != ' ' && args.s[i] != '\0'; i++)
					if (args.s[i] == ',')
						items++;

				const size_t end = i;

				// NOTE: there is no -4 because this is with the
				// "--l " part skipped past already
				libsLength = 2llu*items + end - stt;

				libs = (char *) malloc(libsLength + 1);
				OOM(libs, 7);

				libs[0] = '-';
				libs[1] = 'l';

				// add in the libraries to the string.
				size_t j = 2;
				for (i = stt; i < end; i++) {
					if (args.s[i] == ',') {
						libs[j++] = ' ';
						libs[j++] = '-';
						libs[j++] = 'l';
					}
					else
						libs[j++] = args.s[i];

					args.s[i] = ' ';
				}

				// fallthrough
				// continue;
			default:
				// unknown argument, pass to nasm
				// something like `--X`
				continue; // NOTE: `break;` is the wrong behavior here.
		}

		args.s[i + 0] =
		args.s[i + 1] =
		args.s[i + 2] = ' ';
	}

done:
	if (libs == NULL) {
		libs = malloc(1);
		OOM(libs, 8);

		libsLength = 0;
	}

	libs[libsLength] = '\0';

	return (Params) {
		.libs = (string) {
			.s = libs,
			.l = libsLength
		},
		.assembleOnly        = a,
		.keepObjOnLinkerFail = k,
		.alwaysKeepObj       = K,
		.normalizeSegments   = !N,
		.strip               = !S,
		.verbose             = !s,
		.exec                = e,
	};
}


bool nasm(
	const bool verbose,
	const string nasm_args,
	const FilePathData infile,
	const string object
) {
	// 7 + strlen(NASM_FORMAT) + 9 + infile.path.l + 4 + object.l + 1 + nasm_args.l + 1
	AF_char *const cmd = (char *) malloc(
		infile.path.l + object.l + nasm_args.l + strlen(NASM_FORMAT) + 22
	);
	OOM(cmd, 12);

	sprintf(cmd,
		"nasm -f" NASM_FORMAT " -Werror %s -o %s %s",
		infile.path.s, object.s, nasm_args.s
	);

	if (verbose) {
		printf("assembling  : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (verbose)
		CON_RESET();

	if (exitCode) {
		if (verbose)
			exitCode == -1 ?
				eputs("\nassembler error. Couldn't execute command") :
				eprintf("\nassembler error. exit status: " ANSI_COLOR(ANSI_YELLOW) "%i\n", exitCode);

		return true;
	}

	return false;
}
bool objcopy(const bool verbose, const string object) {
	if (verbose)
		printf("normalizing : ");

	// 117 + object.l + 1
	AF_char *const cmd = (char *) malloc(object.l + 118);
	OOM(cmd, 13);

	// --rename isn't in the help text, but should still work. It works on at least these versions:
	//     2.27-44.base.0.3.el7_9.1 (from 2016, on Red Hat Enterprise Linux 7.9)
	//     2.42 (from 2024, on Windows 11, from MinGW devkit)
	sprintf(
		cmd,						//
		"objcopy"					//    7
		" --rename text=.text"		// + 20
		" --rename data=.data"		// + 20
		" --rename rdata=.rdata"	// + 22
		" --rename rodata=.rdata"	// + 23
		" --rename .rodata=.rdata"	// + 24
		" %s",						// + 1, 1
		object.s					// = 117, 1
	);

	if (verbose) {
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (verbose)
		CON_RESET();

	if (exitCode) {
		if (verbose)
			exitCode == -1 ?
				eprintf("\nobjcopy error. Couldn't execute command\n") :
				eprintf("\nobjcopy error. exit status: " ANSI_COLOR(ANSI_YELLOW) "%i\n", exitCode);

		return true;
	}

	return false;
}
bool rm(const bool verbose, const string object) {
	if (verbose) {
		printf("purging obj : ");
		printf_color(ANSI_GREEN, "rm %s\n", object.s);
	}
	// it doesn't make sense to take the entire `infile` as an argument
	// because it is like 24 bytes long, when only one is used. And it
	// doesn't make sense to take `quoted` as an argument because `rm`
	// is called from `ld`, which doesn't have access to `infile.quoted`.
	const bool quoted = '"' == *object.s; // == infile.quoted

	// `remove` doesn't like paths enclosed in quotes.
	if (quoted)
		object.s[object.l - 1] = '\0';

	const int exitCode = remove(object.s + quoted);

	if (quoted)
		object.s[object.l - 1] = '"';

	if (exitCode) {
		if (verbose) printf(
			ANSI_COLOR(ANSI_RED) "\nFile removal error: %s\n" ANSI_RESET(),
			strerror(errno)
		);

		return true;
	}

	return false;
}
bool ld(const Params params, const string object, const string ofile) {
	// 3 + object.l + 1 + params.libs.l + 4 + ofile.l + 13 + 1
	AF_char *const cmd = (char *) malloc(object.l + params.libs.l + ofile.l + 22);
	OOM(cmd, 14);

	sprintf(cmd,
		"ld %s %s -o %s -e main --gc-sections",
		object.s, params.libs.s, ofile.s
	);

	if (params.verbose) {
		printf("linking     : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (params.verbose)
		CON_RESET();

	if (exitCode) {
		if (params.verbose)
			exitCode == -1 ?
				eprintf("\nlinker error. Couldn't execute command\n") :
				eprintf("\nlinker error. exit status: " ANSI_COLOR(ANSI_YELLOW) "%i\n", exitCode);

		if (!params.keepObjOnLinkerFail && !params.alwaysKeepObj)
			rm(params.verbose, object);

		return true;
	}

	return false;
}
bool strip(const bool verbose, const string ofile) {
	// 49 + ofile.l + 1
	AF_char *const cmd = (char *) malloc(ofile.l + 50);
	OOM(cmd, 15);

	sprintf(cmd, "strip -s -R .comment -R comment -R .note -R note %s", ofile.s);

	if (verbose) {
		printf("stripping   : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (verbose)
		CON_RESET();

	if (exitCode) {
		if (verbose)
			exitCode == -1 ?
				eprintf("\nstrip error. Couldn't execute command\n") :
				eprintf("\nstrip error. exit status: " ANSI_COLOR(ANSI_YELLOW) "%i\n", exitCode);

		return true;
	}

	return false;
}
bool execute(const bool verbose, const string ofile) {
	if (verbose) {
		printf("executing   : ");
		puts_color(ANSI_GREEN, ofile.s);
	}

#if IS_WINDOWS
	// for some reason, CMD doesn't like "./folder/file.exe".
	// stupid legacy systems.
	// If the default system terminal is PowerShell for some reason,
	// this shouldn't matter, because PowerShell likes both / and \.
	for (size_t i = 0; i < ofile.l; i++)
		if (ofile.s[i] == '/')
			ofile.s[i] = '\\';
#endif

	const int exitCode = system(ofile.s);

	if (exitCode) {
		if (verbose)
			eprintf("\nexit status: " ANSI_COLOR(ANSI_YELLOW) "%i\n", exitCode);

		return true;
	}
	else if (verbose)
		puts("\nexit status: " ANSI_COLOR(ANSI_GREEN) "0" ANSI_RESET());

	return false;
}

void infer_args(
	const FilePathData infile,
	int argc,
	const char *const *const argv,
	string *const out_nasm_args
) {
	// sample comment: `;; ../assemble --k --s --l msvcrt,kernel32,user32`.
	// return /^;+ *(?<path>".+?"|'.+?'|[^ ]+?) (?<args>.+)(?:$|\n)/
	//     .exec(fs.readSync(infile.path.s))[2];

	// TODO: maybe do something if `out_nasm_args` or `infile.s` are NULL?

	size_t len = 0;
	AF_char *str = NULL;
	char c;

	if (infile.quoted) infile.path.s[infile.path.l - 1] = '\0';
	AF_FILE *fp = fopen(infile.path.s + infile.quoted, "r");
	if (infile.quoted) infile.path.s[infile.path.l - 1] = '\"';


	c = fgetc(fp);
	if (c != ';')
		goto cleanup;

	while ((c = fgetc(fp)) == ';');
	if (c == '\n' || c == EOF)
		// there are no args to be inferred.
		goto cleanup;

	if (c == ' ') {
		while ((c = fgetc(fp)) == ' ');
		if (c == '\n' || c == EOF)
			goto cleanup;
	}

	// /^;+ */

	// TODO: this does not respect quote escaping.
	// should it allow `, ^, \, or some combination of them as escape characters?
	// if a quote isn't the first character, it allows nonsense paths with quotes.
	// it also allows nonsense characters like `&*?<>;`.
	for (char i = 1; i <= 2; i++) {
		// loop twice. once for the assemble path, and once for the nasm file path
		// both of them get ignored.

		char path_endquote = c == '"' || c == '\'' ? c : ' ';
		// pretend ' ' is an end-quote for non-quoted strings.

		while ((c = fgetc(fp)) != path_endquote)
			if (c == '\n' || c == EOF) {
				if (i == 1) {
					eputs("invalid argument inference line in input file. path never ends.");
					exit(2);
				}
				else {
					// there are no arguments.
					goto cleanup;
				}
			}

		if (path_endquote != ' ') {
			// disallow things like `;; "C:/abc/file"--l msvcrt
			// require a space after the end-quote
			c = fgetc(fp);

			if (c == '\n' || c == EOF)
				// there is an assemble path but no filename or args.
				goto cleanup;

			if (c != ' ') {
				eputs("invalid argument inference line in input file. non-space character after end quote.");
				exit(2);
			}
		}

		// after iteration 1: /;+ *{{assemble_path}} /
		// after iteration 2: /;+ *{{assemble_path}} {{infile_path}} /
	}

	// everything else on the line is the arguments.

	// TODO: possibly use a temporary buffer and `fgets` instead of `fgetc`
	//     to try and get less overhead with `realloc` and `fgetc`.
	//     or continue using `fgetc` but use a temporary buffer to reduce overhead.
	while (true) {
		char c = fgetc(fp);

		if (c == '\n' || c == EOF)
			break; // arguments over

		if (str != NULL && str[len - 1] == ' ' && c == ' ')
			continue; // collapse spaces together.

		str = realloc(str, ++len); // expand space
		OOM(str, 2);               // exit if no memory
		str[len - 1] = c;          // set the new character.
	}

	// previous to here, there was no null byte, so the length and size were the same.
	// execution only gets here on success.
	str = realloc(str, len + 1); // add the null byte.
	OOM(str, 3);

	str[len] = '\0';

cleanup:
	if (str == NULL) {
		str = malloc(1);
		// len = 0;
		OOM(str, 4);
		*str = '\0';
	}

	const AF_string cli_args = strjoin(argc, argv);
	OOM(cli_args.s, 5);

	// cli args override file args.
	const string nasm_args = sstrjoin2(
		((string) {str, len}),
		cli_args
	);
	OOM(nasm_args.s, 6);

	// don't worry about freeing the original nasm args string.
	// It should be cleaned up outside of this function.
	out_nasm_args->s = nasm_args.s;
	out_nasm_args->l = nasm_args.l;
}


int main(int argc, const char *const *argv) {

	argc--; argv++; // the path to the current file is not needed


	if (argc == 0) {
		eputs("No command-line arguments provided. Filename is required. Use `-h` for general help, or `--help=all` for all help.");

		return 2;
	}

	// help(basic, exit codes, memory codes, validation codes, examples, options, version);
	if (!strncmp(*argv, "--help=", 7)) {
		// 7 == strlen("--help=")
		const char *const group = 7 + *argv;

		if (!strcmp(group, "none"      )) help(0b00000000); //   0
		if (!strcmp(group, "version"   )) help(0b00000001); //   1
		if (!strcmp(group, "examples"  )) help(0b00000010); //   2
		if (!strcmp(group, "validation")) help(0b00000100); //   4
		if (!strcmp(group, "memory"    )) help(0b00001000); //   8
		if (!strcmp(group, "exit"      )) help(0b00010000); //  16
		if (!strcmp(group, "codes"     )) help(0b00011100); //  28
		if (!strcmp(group, "errors"    )) help(0b00011100); //  28
		if (!strcmp(group, "options"   ) ||
			!strcmp(group, "arguments" ) ||
			!strcmp(group, "args"      )) help(0b00100000); //  32
		if (!strcmp(group, "overview"  )) help(0b01000000); //  64
		if (!strcmp(group, "usage"     )) help(0b10000000); // 128
		if (!strcmp(group, "basic"     )) help(0b11000000); // 192
		if (!strcmp(group, "default"   )) help(0b11100000); // 224
		if (!strcmp(group, "extra"     )) help(0b11100011); // 227
		if (!strcmp(group, "all"       )) help(0b11111111); // 255

		eprintf("Invalid help group: '%s'\n", group);
		return 2;
	}


	if (!strcmp(*argv, "--help") || !strcmp(*argv, "-h") || !strcmp(*argv, "-?"))
		help(0b11100000); // same as `--help=default`

	if (!strcmp(*argv, "--version") || !strcmp(*argv, "-v"))
		version();

	const AF_FilePathData infile = parse_input_filename(*argv);

	argc--; argv++; // input file path is not needed anymore.

	// use `ofile` to create the object string, then move it to `object`,
	// then change `ofile` to be the output file path.
	edprintf("DEBUG: infile.path.s == %s\n", infile.path.s);
	edprintf("DEBUG: infile dot test: %s\n", infile.path.s[infile.dotIndex] == '.' ? "true" : "false");
	edprintf("DEBUG: infile.dotIndex + infile.quoted + 2 == %zu\n", infile.dotIndex + infile.quoted + 2);

	const AF_string ofile = (string) {
		.s = strnkdup(
			infile.path.s,
			infile.dotIndex + infile.quoted + 2 /* object.l */,
			3 + infile.quoted // leave space for a 3-character extension and possible end quote.
		),
		.l = infile.dotIndex + infile.quoted + 4*IS_WINDOWS // 4 == strlen(".exe")
	};
	OOM(ofile.s, 9);

	edprintf("DEBUG: ofile.s == %s\n", ofile.s);
	edprintf("DEBUG: ofile.l == %zu\n", ofile.l);

	ofile.s[infile.dotIndex + 1] = 'o';
	if (infile.quoted)
		ofile.s[infile.dotIndex + 2] = '"';

	const AF_string object = (string) {
		.s = strdup(ofile.s),
		.l = infile.dotIndex + infile.quoted + 2
	};
	OOM(object.s, 10);

#if IS_WINDOWS
	ofile.s[infile.dotIndex + 1] = 'e';
	ofile.s[infile.dotIndex + 2] = 'x';
	ofile.s[infile.dotIndex + 3] = 'e';
	if (infile.quoted)
		ofile.s[infile.dotIndex + 4] = '"';
	// the next character will already be null because of strnkdup.
#else
	// this condition is technically not necessary. the next line is though.
	if (infile.quoted)
		ofile.s[infile.dotIndex] = '"';

	ofile.s[infile.dotIndex + infile.quoted] = '\0';
#endif

	// at this point, ofile and object are set up.
	AF_string nasm_args;

	edprintf("DEBUG: input file: \"%s\"\n", infile.path.s);

	if (argc && !strcmp(*argv, "--infer"))
		// NOTE: don't include --e in the comment line for --infer.
		// use `--infer --e` in the command line to execute.
		infer_args(infile, --argc, ++argv, &nasm_args);
	else {
		nasm_args = strjoin(argc, argv);
		OOM(nasm_args.s, 11);
	}


	const AF_Params params = parse_params(nasm_args);

	_VALIDATE_FILE(infile.path, infile.quoted, params.verbose, 1);

	if (nasm(params.verbose, nasm_args, infile, object))
		return 5;

	_VALIDATE_FILE(object, infile.quoted, params.verbose, 2);

	if (params.normalizeSegments && !params.assembleOnly) {
		if (objcopy(params.verbose, object))
			return 6;
	}
	else puts("normalizing : (skipped)");

	///////////////////////////////////

	if (params.assembleOnly) {
		if (params.verbose)
			puts("linking     : (skipped)");

		return 0;
	}

	if (ld(params, object, ofile))
		return 7;

	_VALIDATE_FILE(ofile, infile.quoted, params.verbose, 3);

	///////////////////////////////////

	if (params.strip) {
		if (strip(params.verbose, ofile))
			return 8;
	}
	else if (params.verbose)
		puts("stripping   : (skipped)");

	///////////////////////////////////

	if (!params.alwaysKeepObj) {
		if (rm(params.verbose, object))
			return 9;
	}
	else if (params.verbose)
		puts("purging obj : (skipped)");

	///////////////////////////////////

	if (params.exec) {
		if (execute(params.verbose, ofile))
			return 10;
	}
	else if (params.verbose)
		puts("executing   : (skipped)");

	return 0;
}
