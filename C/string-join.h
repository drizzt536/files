#ifndef STRING_JOIN_H
	#define STRING_JOIN_H

	// OUT_OF_MEMORY,
	// stdlib.h
		// malloc, size_t
	#include "./error-print.h"

	// strlen
	#include <string.h>

	typedef struct {
		char *s;   // string
		size_t l; // length
	} string;

	string strjoinc(const size_t argc, const char *const *const argv, const char joiner) {
		// join strings with a space. returns a pointer to the heap.
		// example: `const string args = strjoinc(--argc, ++argv, ' ');`

		char *res;

		if (argc == 0) {
			// O(1)
			res = malloc(1);
			*res = '\0';

			OUT_OF_MEMORY(res, 1);
			return (string) {res, 0};
		}

		// O(2n), where `n` is the combined length of the strings (without joining spaces)
		size_t i = argc;
		size_t length = argc; // room for spaces between args, and null byte

		while (i --> 0)
			length += strlen(argv[i]);

		res = malloc(length);

		OUT_OF_MEMORY(res, 2);

		i = 0;

		const char *current = argv[0];

		// `strcpy(res, *argv)` and `i = strlen(*argv)` at the same time
		for (; current[i]; i++)
			res[i] = current[i];

		for (size_t n = 1, iPrevious = 0; n < argc; n++) {
			// if there are no more strings, break

			res[iPrevious + i] = joiner;
			current = argv[n];
			iPrevious += i + 1;

			// strcat(res, argv[n]) without having to find the end of `res` first.
			// O( strlen(argv[n]) ).
			for (i = 0; current[i]; i++)
				res[iPrevious + i] = current[i];
		}

		res[length - 1] = '\0';

		return (string) {res, length - 1};
	}

	string strjoin(const size_t argc, const char *const *const argv) {
		return strjoinc(argc, argv, ' ');
	}

#endif
