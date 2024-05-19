#ifndef STRING_JOIN_H_
	#define STRING_JOIN_H_

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

	string strjoinc(char *strs[], size_t num, const char joiner) {
		// join strings with a space. returns a pointer to the heap.
		// example: `const string args = strjoinc(++argv, --argc, ' ');`

		char *res;

		if (num == 0) {
			// O(1)
			res = malloc(1);
			*res = '\0';

			OUT_OF_MEMORY(res, 1);
			return (string) {res, 0};
		}

		/*if (num == 1) {
			res = strdup(*strs);
			OUT_OF_MEMORY(res, 2);

			return (string) {res, strlen(res)};
		}*/

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

			res[iPrevious + i] = joiner;
			current = strs[n];
			iPrevious += i + 1;

			// strcat(res, strs[n]) without having to find the end of `res` first.
			// O( strlen(strs[n]) ).
			for (i = 0; current[i]; i++)
				res[iPrevious + i] = current[i];
		}

		res[length - 1] = '\0';

		return (string) {res, length - 1};
	}

	string strjoin(char *strs[], size_t num) {
		return strjoinc(strs, num, ' ');
	}

#endif
