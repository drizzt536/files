#ifndef ERROR_PRINT_H
	#define ERROR_PRINT_H

	#include <stdlib.h> // exit
	#include <stdio.h> // printf, fprintf, stdout, stderr

	#ifdef _WIN32
		#include <io.h>
		#define access _access
	#else
		#include <unistd.h>
	#endif

	typedef unsigned long long uLong;

	#define RGB_STR(r, g, b) #r ";" #g ";" #b
	#define ANSI_COLOR(color) "\x1b[38;2;" color "m"
	#define ANSI_RESET() "\x1b[0m"

	#define ANSI_RED    RGB_STR(197,  15, 31)
	#define ANSI_GREEN  RGB_STR(  0, 128,  0)
	#define ANSI_YELLOW RGB_STR(128, 128,  0)

	#define CON_COLOR(color) printf(ANSI_COLOR(color))
	#define CON_RESET()      printf(ANSI_RESET())

	#define fprintf_color(fp, color, ...) ({ \
		CON_COLOR(color);                     \
		int __tmp = fprintf(fp, __VA_ARGS__);  \
		CON_RESET();                            \
		__tmp;                                   \
	})

	#define fputs_color(fp, color, s) ({  \
		CON_COLOR(color);                  \
		int __tmp = fprintf(fp, "%s\n", s); \
		/* fputs doesn't add a newline :( */ \
		/* that is retarded so I fixed it */  \
		CON_RESET();                           \
		__tmp;                                  \
	})

	#define printf_color(...)      fprintf_color(stdout, __VA_ARGS__)
	#define puts_color(color, str) fputs_color(stdout, color, str)
	#define eprintf(...)           fprintf_color(stderr, ANSI_RED, __VA_ARGS__)
	#define eputs(str)             fputs_color(stderr, ANSI_RED, str)

	#define OUT_OF_MEMORY(string, code) ({                      \
		if ((string) == NULL) {                                  \
			eprintf("Out of memory. code: %llu", (uLong) (code)); \
			exit(3); /* code for out of memory */                  \
		}                                                           \
	})

	#define VALIDATE_FILE(path, code) ({                   \
		if (access(path, 0 /* F_OK on POSIX */) == -1) {    \
			eprintf("'%s' cannot be accessed. code: %llu\n", \
				path, (uLong) (code));                        \
			exit(4); /* code for invalid input file */         \
		}                                                       \
		                                                         \
		printf("'%s' available\n", path);                         \
	})

#endif
