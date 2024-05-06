// gcc -std=c99 -Wall -Wextra -Ofast assemble.c -o assemble && strip assemble.exe

/** exit codes:
 * 0: success
 *
 * 2: not enough arguments
 * 3: out of memory
 * 4: invalid input file
 * 5: assembler error
 * 6: linker error
 * 7: strip error
 * 8: remove error
 * 9: execution error
**/



#ifndef __GNUC__
	#error "This program only works with GCC or compilers that allow GCC extensions."
#endif

#if __GNUC__ < 5
	#error "Use GCC 5.1 or newer"
#endif


//## inclusions ##//

// NULL, strnlen, memcpy, strlen, strcmp, strdup, strerror
#include <string.h>

// uLong, ANSI_COLOR, ANSI_RESET, ANSI_RED, ANSI_GREEN, ANSI_YELLOW,
// CON_COLOR, CON_RESET, printf_color, puts_color, eprintf, eputs,
// OUT_OF_MEMORY, VALIDATE_FILE, (stdio.h: printf, puts, sprintf),
// (stdlib.h: malloc, calloc, exit, free, system, remove)
#include "../C/error-print.h"

// size_t
#include <stddef.h>

// bool, false, true
#include <stdbool.h>

//## macros and types ##//

#define cleanup_free_fn_char cleanup_free_fn_

#define FREE_T(x) __attribute__((cleanup(cleanup_free_fn_##x))) x

typedef struct {
	char *s; // string
	size_t l; // length
} string;

typedef struct {
	string libs;
	size_t paramslen;

	bool rm;
	bool link;
	bool strip;
	bool exec;
} Params;

//## functions ##//

char* strnkdup(const char *s, size_t n, size_t k) {
	// strndup(s, n) with k extra null bytes at the end.
	// if n + k < MIN(n, k), overflow

	size_t len = strnlen(s, n);
	char *outstr = malloc(len + k + 1);

	if (outstr == NULL)
		return NULL;

	memcpy(outstr, s, len);

	for (size_t i = k + 1; i --> 0 ;)
		outstr[len + i] = '\0';

	return outstr;
}

char *strjoin(char *strs[], size_t num) {
	// join strings with a space. returns a pointer to the heap.

	char *res;

	if (num == 0) {
		// O(1)
		res = calloc(1, 1);

		OUT_OF_MEMORY(res, 1);
		return res;
	}

	// O(2n), where `n` is the combined length of the strings (without joining spaces)
	size_t i = num;
	size_t length = num; // room for spaces between args, and null byte

	while (i --> 0)
		length += strlen(strs[i]);

	res = malloc(length);

	OUT_OF_MEMORY(res, 2);

	i = 0;

	char *current = strs[0];

	// `strcpy(res, *strs)` and `i = strlen(*strs)` at the same time
	for (; current[i]; i++)
		res[i] = current[i];

	for (size_t n = 1, iPrevious = 0; n < num; n++) {
		// if there are no more strings, break

		res[iPrevious + i] = ' ';
		current = strs[n];
		iPrevious += i + 1;

		// strcat(res, strs[n]) without having to find the end of `res` first.
		// O( strlen(strs[n]) ).
		for (i = 0; current[i]; i++)
			res[iPrevious + i] = current[i];
	}

	res[length - 1] = '\0';

	return res;
}

size_t extensionIndex(const char *const filename, size_t n /*length*/) {
	// return filename.indexOf(".")

	while (n --> 0)
		if (filename[n] == '.')
			return n;
		else if (filename[n] == '/')
			break;

	eprintf("file '%s' doesn't have an extension. An extension is required.", filename);
	exit(4);
}

Params parseParameters(char *params) {
	size_t i = 0;
	size_t libsLength;
	char *libs = NULL;

	bool
		R = false,
		L = false,
		S = false,
		e = false;

	for (; params[i] != '\0'; i++) {

		if (params[i] != '-')
			continue;

		// "-"

		if (params[i + 1] == '\0') // "-\0"
			break;

		if (params[i + 1] != '-') { //"-?"
			i++;
			continue;
		}

		// "--"

		if (params[i + 2] == '\0')
			// "--\0"
			break;

		if (params[i + 3] != ' ' && params[i + 3] != '\0') {
			// "-- " or "--\0"
			i += 2;
			continue;
		}

		switch (params[i + 2]) {
			case 'R': R = true; break;
			case 'L': L = true; break;
			case 'S': S = true; break;
			case 'e': e = true; break;
			case 'l':
				if (params[i + 3] == '\0')
					goto done;

				params[i + 0] =
				params[i + 1] =
				params[i + 2] = ' ';

				i += 4;
				size_t stt = i;
				uLong items = 1;

				while (params[i] != ' ' && params[i] != '\0') {
					if (params[i] == ',')
						items++;

					i++;
				}

				size_t end = i;

				libsLength = 2llu*items + end - stt;

				libs = malloc(libsLength + 1);
				OUT_OF_MEMORY(libs, 3);

				libs[0] = '-';
				libs[1] = 'l';

				size_t j = 2;
				for (i = stt; i < end; i++) {
					if (params[i] == ',') {
						libs[j++] = ' ';
						libs[j++] = '-';
						libs[j++] = 'l';
					}
					else
						libs[j++] = params[i];

					params[i] = ' ';
				}

				continue;
		}

		params[i + 0] =
		params[i + 1] =
		params[i + 2] = ' ';
	}

done:
	if (libs == NULL) {
		libs = malloc(1);
		OUT_OF_MEMORY(libs, 4);

		libsLength = 0;
	}

	libs[libsLength] = '\0';


	return (Params) {
		.libs = (string) {libs, libsLength},
		.paramslen = i - 1,
		.rm = !R, // remove
		.link = !L, // link
		.strip = !S, // strip
		.exec = e, // execute
	};
}

static inline void cleanup_free_fn_(const void *p) {
	free(*(void **) p);
	// *(void **) p = NULL;
}

static inline void cleanup_free_fn_Params(Params *p) {
	free(p->libs.s);
	p->libs.s = NULL;
}

static inline int help(void) {
	puts(
		"\n./assemble.exe infile [params]"
		"\n"
		"\n"
		"\noverview of process:"
		"\n    nasm -fwin64 -Werror infile -o object params"
		"\n    ld object libs -o outfile --entry main"
		"\n    if strip, strip -s -R .comment -R comment -R .note -R note hello.exe"
		"\n    if remove, rm object"
		"\n    if exec, run outfile"
		"\n"
		"\nexamples:"
		"\n    ./assemble hello.nasm --S --R"
		"\n        input = ./hello.nasm"
		"\n        don't strip remove object or execute"
		"\n        no extra arguments to nasm."
		"\n        no libraries passed to ld"
		"\n"
		"\n    ./assemble ../file.asm --e -g --l msvcrt,kernel32"
		"\n        input = ./../file.asm"
		"\n        strip, remove object file, execute"
		"\n        pass `-g` to nasm"
		"\n        pass `-lmsvcrt -lkernel32` to ld."
		"\n"
		"\n    ./assemble --help"
		"\n        print the help message"
		"\n"
		"\narguments:"
		"\n    --R           do not remove object file (default is to remove)"
		"\n    --L           do not link object file (default is to link)"
		"\n    --S           do not strip executable (default is to strip)"
		"\n    --e           run executable"
		"\n    --l [list]    includes comma-separated libraries in linking"
		"\n    --help        print this message. only works as the first argument"
		"\n"
		"\n    all other arguments are given to nasm."
		"\n"
	);

	return 0;
}



int main(int argc, char *argv[]) {

	argc--; argv++; // the path to the current file is not needed

	if (!argc) {
		eputs("No command-line arguments provided. Filename is required.");

		return 2;
	}

	const char *const infile = *argv; argc--; argv++;

	if (strcmp(infile, "--help") == 0)
		return help() /* 0 */;

	const size_t inflen = strlen(infile); // this is used again later on.
	const size_t extnIndex = extensionIndex(infile, inflen);

	FREE_T(char) *const params = strjoin(argv, argc); // this is accessed in parseParameters.
	FREE_T(char) *const ofile  = strnkdup(infile, extnIndex, 4); // space for 3-character file extension

	OUT_OF_MEMORY(params, 5);
	OUT_OF_MEMORY(ofile, 6);

	ofile[extnIndex + 0] = '.';
	ofile[extnIndex + 1] = 'o';

	FREE_T(char) *object = strdup(ofile);
	OUT_OF_MEMORY(object, 7);

	// ofile still allows 3-char extension
	ofile[extnIndex + 1] = 'e';
	ofile[extnIndex + 2] = 'x';
	ofile[extnIndex + 3] = 'e';

	FREE_T(Params) parsedParams = parseParameters(params);

	printf("validating : "); VALIDATE_FILE(infile, 1);


	/* NASM */ {
		// 25 + inflen + 4 + (extnIndex + 2) + 1 + parsedParams.paramslen + 1
		char *restrict const nasm = malloc(inflen + extnIndex + parsedParams.paramslen + 33);

		OUT_OF_MEMORY(nasm, 8);
		sprintf(nasm, "nasm.exe -fwin64 -Werror %s -o %s %s", infile, object, params);
		printf("assembling : ");
		puts_color(ANSI_GREEN, nasm);

		CON_COLOR(ANSI_YELLOW);
		const int exitCode = system(nasm);
		CON_RESET();

		free(nasm);

		if (exitCode) {
			exitCode == -1 ?
				eprintf("\nassembler error. Couldn't execute command\n") :
				eprintf("\nassembler error. exit status: %i\n", exitCode);

			return 5;
		}
	}

	printf("validating : "); VALIDATE_FILE(object, 2);


	if (!parsedParams.link) {
		puts("linking    : (skipped)");

		return 0;
	}

	/* ld */ {
		// 7 + (extnIndex + 2) + 1 + parsedParams.libs.l + 4 + (extnIndex + 4) + 13 + 1
		char *restrict ld = malloc(2*extnIndex + parsedParams.libs.l + 32);

		OUT_OF_MEMORY(ld, 9);
		sprintf(ld, "ld.exe %s %s -o %s --entry main", object, parsedParams.libs.s, ofile);
		printf("linking    : ");
		puts_color(ANSI_GREEN, ld);

		CON_COLOR(ANSI_YELLOW);
		int exitCode = system(ld);
		CON_RESET();

		free(ld);

		if (exitCode) {
			exitCode == -1 ?
				eprintf("\nlinker error. Couldn't execute command\n") :
				eprintf("\nlinker error. exit status: %i\n", exitCode);

			return 6;
		}
	}


	printf("validating : "); VALIDATE_FILE(ofile, 3);

	printf("stripping  : ");
	if (parsedParams.strip) {
		// 53 + (extnIndex + 4) + 1
		char *restrict strip = malloc(extnIndex + 58);

		OUT_OF_MEMORY(strip, 10);
		sprintf(strip, "strip.exe -s -R .comment -R comment -R .note -R note %s", ofile);
		puts_color(ANSI_GREEN, strip);

		CON_COLOR(ANSI_YELLOW);
		int exitCode = system(strip);
		CON_RESET();

		free(strip);

		if (exitCode) {
			exitCode == -1 ?
				eprintf("\nstrip error. Couldn't execute command\n") :
				eprintf("\nstrip error. exit status: %i\n", exitCode);

			return 7;
		}
	}
	else
		puts("(skipped)");



	printf("remove obj : ");
	if (parsedParams.rm) {

		int exitCode = remove(object);
		printf_color(ANSI_GREEN, "rm.exe %s\n", object);

		if (exitCode) {
			printf(
				ANSI_COLOR(ANSI_RED) "\nFile removal error: %s\n" ANSI_RESET(),
				strerror(errno)
			);

			return 8;
		}
	}
	else
		puts("(skipped)");

	printf("executing  : ");
	if (parsedParams.exec) {
		puts_color(ANSI_GREEN, ofile);

		// for some reason, CMD doesn't like "./folder/file.exe"
		for (size_t i = 0; ofile[i] != '\0'; i++)
			if (ofile[i] == '/')
				ofile[i] = '\\';

		int exitCode = system(ofile);

		if (exitCode) {
			eprintf("\nexit status: %i\n", exitCode);
			return 9;
		}
		else
			puts("\nexit status: 0");
	}
	else
		puts("(skipped)");

	return 0;
}
