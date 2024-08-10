// make all

// TODO: if no extension is given and there is no `.nasm`, try other extensions

#ifndef __GNUC__
	#error "This program only works with GCC or compilers that allow GCC extensions."
#endif

#if __GNUC__ < 5
	#error "Use GCC 5.1 or newer. :|"
#endif


//## inclusions ##//

// string, strjoin
// ../C/error-print.h
	// ANSI_COLOR, ANSI_RESET, ANSI_RED, ANSI_GREEN, ANSI_ORANGE,
	// CON_COLOR, CON_RESET, printf_color, puts_color, eprintf, eputs,
	// OUT_OF_MEMORY, VALIDATE_FILE,
	// stdio.h
		// printf, puts, sprintf
	// stdlib.h
		// malloc, calloc, exit, free, system, remove
// string.h
	// NULL, size_t, strnlen, memcpy, strlen, strcmp, strdup, strerror
#include "../C/string-join.h"

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
	#define GIT_DATA "standalone"
#else
	#define GIT_DATA GIT_REPO "\n" GIT_HASH
#endif

#define TIMESTAMP __DATE__ " " __TIME__
#define VERSION TIMESTAMP "\n" GIT_DATA

#define cleanup_char cleanup_

#define _VALIDATE_FILE(path, code) ({       \
	if (params.verbose)                      \
		putchar(' ');                         \
	VALIDATE_FILE(path, code, params.verbose); \
})

#define FREE_T(x) __attribute__((cleanup(cleanup_##x))) x

typedef struct {
	string libs;

	bool assembleOnly;
	bool keepObjOnLDFail;
	bool alwaysKeepObj;
	bool normalizeSegments;
	bool strip;
	bool verbose;
	bool exec;
} Params;

typedef struct {
	char *const path;
	const size_t dotIndex;
	const size_t len; // as given by `strlen(this.path)`.
} FilePathData;

//## functions ##//

char *strnkdup(const char *const s, size_t n, size_t k) {
	// strndup(s, n) with k extra null bytes at the end.
	// if n + k < MIN(n, k), overflow

	size_t l = strnlen(s, n);
	char *res = malloc(l + k + 1);

	if (res == NULL)
		return NULL;

	memcpy(res, s, l);

	for (size_t i = k + 1; i --> 0 ;)
		res[l + i] = '\0';

	return res;
}

static inline char *strkdup(const char *s, size_t k) {
	// strdup(s) with k extra null bytes at the end.
	return strnkdup(s, -1, k);
}

FilePathData extensionIndex(const char *const filename) {
	// not actually a string object, but it does return a `char *` and a `size_t`
	// return {"s": new_filename, "l": filename.indexOf(".")}

	// if the input file is "main.", the extension is "".

	// TODO: figure out how to make file paths with spaces work.
		// in situations like "C:/Program Files/folder/file.exe"
		// just add quotes around it when required.
		// or always add quotes around file paths?

	size_t n = strlen(filename);
	size_t i = n;

	for (size_t j = n; j --> 0 ;)
		if (filename[j] == ' ') {
			eputs("file paths cannot have spaces in them.");
			exit(4);
		}


	while (i --> 0)
		if (filename[i] == '.') {
			// move string to heap
			char *const tmp_str = strdup(filename);
			OUT_OF_MEMORY(tmp_str, 3);

			return (FilePathData) {
				.path = tmp_str,
				.dotIndex = i,
				.len = n
			};
		}
		// `./a.b/file` doesn't actually have an extension.
		// `./a.b\file` only has an extension on linux.
#if IS_WINDOWS
		else if (filename[i] == '/' || filename[i] == '\\')
#else
		else if (filename[i] == '/')
#endif
			break;

	// if no extension is given, assume it is `.nasm`
	char *const str = strkdup(filename, 5);
	OUT_OF_MEMORY(str, 4);

	str[n + 0] = '.';
	str[n + 1] = 'n';
	str[n + 2] = 'a';
	str[n + 3] = 's';
	str[n + 4] = 'm';

	return (FilePathData) {
		.path = str,
		.dotIndex = n,
		.len = n + 5
	};
}

Params parseParameters(string args) {
	size_t libsLength;
	char *libs = NULL;

	bool
		a = false,
		k = false,
		K = false,
		S = false,
		N = false,
		s = false,
		e = false;

	for (size_t i = 0; i < args.l; i++) {

		if (args.s[i] != '-')
			continue;

		// "-"

		if (args.s[i + 1] == '\0') // "-\0"
			break;

		if (args.s[i + 1] != '-') { //"-?"
			i++;
			continue;
		}

		// "--"

		if (args.s[i + 2] == '\0')
			// "--\0"
			break;

		if (args.s[i + 3] != ' ' && args.s[i + 3] != '\0') {
			// "-- " or "--\0"
			i += 2;
			continue;
		}

		switch (args.s[i + 2]) {
			case 'a': a = true; break;
			case 'k': k = true; break;
			case 'K': K = true; break;
			case 'S': S = true; break;
			case 'N': N = true; break;
			case 's': s = true; break;
			case 'e': e = true; break;
			case 'l':
				if (args.s[i + 3] == '\0')
					goto done; // double break;

				args.s[i + 0] =
				args.s[i + 1] =
				args.s[i + 2] = ' ';

				i += 4;
				size_t stt = i;
				size_t items = 1;

				while (args.s[i] != ' ' && args.s[i] != '\0') {
					if (args.s[i] == ',')
						items++;

					i++;
				}

				size_t end = i;

				libsLength = 2llu*items + end - stt;

				libs = malloc(libsLength + 1);
				OUT_OF_MEMORY(libs, 5);

				libs[0] = '-';
				libs[1] = 'l';

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
				// continue
			default:
				// unknown argument, pass to nasm
				// something like `--X`
				continue;
		}

		args.s[i + 0] =
		args.s[i + 1] =
		args.s[i + 2] = ' ';
	}

done:
	if (libs == NULL) {
		libs = malloc(1);
		OUT_OF_MEMORY(libs, 6);

		libsLength = 0;
	}

	libs[libsLength] = '\0';


	return (Params) {
		.libs = (string) {libs, libsLength},
		.assembleOnly = a,
		.keepObjOnLDFail = k,
		.alwaysKeepObj = K,
		.normalizeSegments = !N,
		.strip = !S,
		.verbose = !s,
		.exec = e, // execute
	};
}

static inline void cleanup_(const void *p) { free(* (void **) p); }
static inline void cleanup_Params(const Params *p) { free(p->libs.s); }
static inline void cleanup_string(const string *p) { free(p->s); }
static inline void cleanup_FilePathData(const FilePathData *p) { free(p->path); }

__declspec(noreturn) static inline void help(void) {
	puts(
		"\n./assemble infile [params]"
		"\n"
		"\n"
		"\nRough overview of process:"
		"\n    nasm -fwin64 -Werror $infile -o $object $params"
		"\n"
		"\n    # the print-out will use `--rename` which is the same."
		"\n    objcopy --rename-section text=.text \\"
		"\n            --rename-section data=.data  \\"
		"\n            --rename-section rdata=.rdata \\"
		"\n            --rename-section rodata=.rdata \\"
		"\n            --rename-section .rodata=.rdata $object"
		"\n"
		"\n    ld $object $libs -o $outfile --entry main"
		"\n    if stripFile, strip -s -R .comment -R comment -R .note -R note $outfile"
		"\n    if remove, rm $object"
		"\n    if exec, run $outfile"
		"\n"
		"\nExit Codes:"
		"\n     0 - success"
		"\n     1 - (unused)"
		"\n     2 - not enough arguments"
		"\n     3 - out of memory"
		"\n     4 - invalid/nonexistent file"
		"\n     5 - assembler error"
		"\n     6 - objcopy error"
		"\n     7 - linker error"
		"\n     8 - strip error"
		"\n     9 - file removal error"
		"\n    10 - execution error"
		"\n"
		"\nExamples:"
		"\n    ./assemble hello --S --N --K"
		"\n        input = ./hello.nasm (.nasm is assumed if no extension is present)"
		"\n        don't strip, normalize segments, remove object, or execute"
		"\n        no extra arguments to nasm."
		"\n        no libraries passed to ld"
		"\n"
		"\n    ./assemble ../file.asm --e -g --l msvcrt,kernel32"
		"\n        input = ./../file.asm"
		"\n        strip, normalize segments, remove object file, and execute"
		"\n        pass `-g` to nasm"
		"\n        pass `-lmsvcrt -lkernel32` to ld."
		"\n"
		"\n    ./assemble folder/main"
		"\n        input = ./folder/main.nasm"
		"\n        strip, normalize segments, remove object file, but don't execute"
		"\n        no extra arguments to nasm"
		"\n        no libraries to ld."
		"\n"
		"\n    ./assemble --help"
		"\n        print the help message."
		"\n        If your file is named `--help.nasm`, stop that."
		"\n        or just do `./assemble --help.nasm`"
		"\n"
		"\n    ./assemble \"./folder with spaces/file.nasm\""
		"\n        this will not work, and an error will be thrown."
		"\n"
		"\nOptions:"
		"\n    --a              assemble only. do not link or normalize segment names"
		"\n    --e              run final executable when done"
		"\n    -h, -?, --help   print this message. only works as the first argument"
		"\n    --K              always keep object file (default is to remove)"
		"\n    --k              keep object file on linker fail"
		"\n    --l [list]       includes comma-separated libraries in linking"
		"\n    --N              do not normalize segment names, leave them as the original"
		"\n    --S              do not strip executable (default is to strip everthing)"
		"\n    --s              don't print anything (silent), and"
		"\n                     don't print sub-program messages in color"
		"\n                     does not suppress messages for the following:"
		"\n                         - sub-program (nasm, ld, etc.) errors/warnings"
		"\n                         - out-of-memory error messages"
		"\n                         - when `--help` is given as the first argument"
		"\n                         - error messages when the input file path has spaces"
		"\n    -v, --version    print the compile date, git repository if known, and git commit hash if known"
		"\n"
		"\n    the double minus signs are required; i.e. `--e` will work, `-e` will not."
		"\n    all other arguments are given to nasm in the same order as provided."
		"\n"
	);

	exit(0);
}

__declspec(noreturn) static inline void version(void) {
	printf(VERSION);

	exit(0);
}


bool nasm(
	Params params,
	FilePathData infile,
	string nasmArgs,
	const char *const object
) {
	// 21 + infile.len + 4 + (infile.dotIndex + 2) + 1 + nasmArgs.l + 1
	char *restrict const cmd = malloc(infile.len + infile.dotIndex + nasmArgs.l + 29);
	OUT_OF_MEMORY(cmd, 10);

	sprintf(cmd,
		"nasm -f" NASM_FORMAT " -Werror %s -o %s %s",
		infile.path, object, nasmArgs.s
	);

	if (params.verbose) {
		printf("assembling  : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (params.verbose)
		CON_RESET();

	free(cmd);

	if (exitCode) {
		if (params.verbose)
			exitCode == -1 ?
				eprintf("\nassembler error. Couldn't execute command\n") :
				eprintf("\nassembler error. exit status: %i\n", exitCode);

		return true;
	}

	return false;
}

bool objcopy(
	Params params,
	FilePathData infile,
	const char *const object
) {
	if (params.verbose)
		printf("normalizing : ");

	// 121 + (infile.dotIndex + 2) + 1
	char *restrict const cmd = malloc(infile.dotIndex + 120);
	OUT_OF_MEMORY(cmd, 11);

	sprintf(
		cmd,						//
		"objcopy"					//    7
		" --rename text=.text"		// + 20
		" --rename data=.data"		// + 20
		" --rename rdata=.rdata"	// + 22
		" --rename rodata=.rdata"	// + 23
		" --rename .rodata=.rdata"	// + 24
		" %s",						// + 1, 1
		object						// = 117, 1
	);

	if (params.verbose) {
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (params.verbose)
		CON_RESET();

	free(cmd);

	if (exitCode) {
		if (params.verbose)
			exitCode == -1 ?
				eprintf("\nobjcopy error. Couldn't execute command\n") :
				eprintf("\nobjcopy error. exit status: %i\n", exitCode);

		return true;
	}

	return false;
}

bool rm(
	Params params,
	const char *const object
) {
	if (params.verbose) {
		printf("purging obj : ");
		printf_color(ANSI_GREEN, "rm %s\n", object);
	}

	const int exitCode = remove(object);

	if (exitCode) {
		if (params.verbose) printf(
			ANSI_COLOR(ANSI_RED) "\nFile removal error: %s\n" ANSI_RESET(),
			strerror(errno)
		);

		return true;
	}

	return false;
}

bool ld(
	Params params,
	FilePathData infile,
	const char *const object,
	const char *const ofile
) {
	// 3 + (infile.dotIndex + 2) + 1 + params.libs.l + 4 + (infile.dotIndex + 4*IS_WINDOWS) + 13 + 1
	char *restrict const cmd = malloc(2*infile.dotIndex + params.libs.l + 4*IS_WINDOWS + 24);
	OUT_OF_MEMORY(cmd, 12);

	sprintf(cmd, "ld %s %s -o %s --entry main", object, params.libs.s, ofile);

	if (params.verbose) {
		printf("linking     : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (params.verbose)
		CON_RESET();

	free(cmd);

	if (exitCode) {
		if (params.verbose)
			exitCode == -1 ?
				eprintf("\nlinker error. Couldn't execute command\n") :
				eprintf("\nlinker error. exit status: %i\n", exitCode);

		if (!params.keepObjOnLDFail && !params.alwaysKeepObj)
			rm(params, object);

		return true;
	}

	return false;
}

bool strip(
	Params params,
	FilePathData infile,
	const char *const ofile
) {
	// 49 + (infile.dotIndex + 4*IS_WINDOWS) + 1
	char *restrict const cmd = malloc(infile.dotIndex + 4*IS_WINDOWS + 50);
	OUT_OF_MEMORY(cmd, 13);

	sprintf(cmd, "strip -s -R .comment -R comment -R .note -R note %s", ofile);

	if (params.verbose) {
		printf("stripping   : ");
		puts_color(ANSI_GREEN, cmd);

		CON_COLOR(ANSI_ORANGE);
	}

	const int exitCode = system(cmd);

	if (params.verbose)
		CON_RESET();

	free(cmd);

	if (exitCode) {
		if (params.verbose)
			exitCode == -1 ?
				eprintf("\nstrip error. Couldn't execute command\n") :
				eprintf("\nstrip error. exit status: %i\n", exitCode);

		return true;
	}

	return false;
}

bool execute(
	Params params,
#if IS_WINDOWS
	char *const ofile
#else
	const char *const ofile
#endif
) {
	if (params.verbose) {
		printf("executing   : ");
		puts_color(ANSI_GREEN, ofile);
	}

#if IS_WINDOWS
	// for some reason, CMD doesn't like "./folder/file.exe"
	for (size_t i = 0; ofile[i] != '\0'; i++)
		if (ofile[i] == '/')
			ofile[i] = '\\';
#endif

	const int exitCode = system(ofile);

	if (exitCode) {
		if (params.verbose)
			eprintf("\nexit status: %i\n", exitCode);

		return true;
	}
	else if (params.verbose)
		puts("\nexit status: 0");

	return false;
}



int main(int argc, const char *argv[]) {

	argc--; argv++; // the path to the current file is not needed

	if (argc == 0) {
		eputs("No command-line arguments provided. Filename is required. Use `-h` for help.");

		return 2;
	}

	if (!strcmp(*argv, "--help") || !strcmp(*argv, "-h") || !strcmp(*argv, "-?"))
		help();

	if (!strcmp(*argv, "--version") || !strcmp(*argv, "-v"))
		version();

	const FREE_T(FilePathData) infile = extensionIndex(*argv);

	argc--; argv++;

	// this is accessed in parseParameters.
	FREE_T(string) nasmArgs = strjoin(argc, argv);
	OUT_OF_MEMORY(nasmArgs.s, 7);

	// space for period and 3-character file extension
	FREE_T(char) *const ofile = strnkdup(infile.path, infile.dotIndex + 1, 3);
	OUT_OF_MEMORY(ofile, 8);

	ofile[infile.dotIndex + 1] = 'o';

	const FREE_T(char) *const object = strdup(ofile);
	OUT_OF_MEMORY(object, 9);

	// ofile still allows 3-char extension
#if IS_WINDOWS
	ofile[infile.dotIndex + 1] = 'e';
	ofile[infile.dotIndex + 2] = 'x';
	ofile[infile.dotIndex + 3] = 'e';
#else
	ofile[infile.dotIndex + 0] = '\0';
	// ofile[infile.dotIndex + 1] = '\0'; // this line is optional.
#endif
	const FREE_T(Params) params = parseParameters(nasmArgs);

	// strlen(object) == (infile.dotIndex + 2)
	// strlen(ofile ) == (infile.dotIndex + 4*IS_WINDOWS)

	_VALIDATE_FILE(infile.path, 1);

	if (nasm(params, infile, nasmArgs, object))
		return 5;

	_VALIDATE_FILE(object, 2);

	if (params.normalizeSegments) {
		if (objcopy(params, infile, object))
			return 6;
	}
	else puts("normalizing : (skipped)");

	///////////////////////////////////

	if (params.assembleOnly) {
		if (params.verbose)
			puts("linking     : (skipped)");

		return 0;
	}

	if (ld(params, infile, object, ofile))
		return 7;

	_VALIDATE_FILE(ofile, 3);
	///////////////////////////////////

	if (params.strip) {
		if (strip(params, infile, ofile))
			return 8;
	}
	else if (params.verbose)
		puts("stripping   : (skipped)");

	///////////////////////////////////

	if (!params.alwaysKeepObj) {
		if (rm(params, object))
			return 9;
	}
	else if (params.verbose)
		puts("purging obj : (skipped)");

	///////////////////////////////////

	if (params.exec) {
		if (execute(params, ofile))
			return 10;
	}
	else if (params.verbose)
		puts("executing   : (skipped)");

	return 0;
}
