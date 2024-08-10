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

	#define RGB_STR(r, g, b) #r ";" #g ";" #b
	#define ANSI_COLOR(color) "\x1b[38;2;" color "m"
	#define ANSI_RESET() "\x1b[0m"

	#define ANSI_RED    RGB_STR(166,  12,  26)
	#define ANSI_GREEN  RGB_STR( 10, 128,  10)
	#define ANSI_YELLOW RGB_STR(190, 190,   0)
	#define ANSI_ORANGE RGB_STR(180, 100,   0)
	#define ANSI_BLUE   RGB_STR(25 , 127, 250)


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
	#define efprintf(fp, ...)      fprintf_color(fp, ANSI_RED, __VA_ARGS__)
	#define eprintf(...)           efprintf(stderr, __VA_ARGS__)

	#define puts_color(color, str) fputs_color(stdout, color, str)
	#define efputs(fp, str)        fputs_color(fp, ANSI_RED, str)
	#define eputs(str)             efputs(stderr, str)

	#define OUT_OF_MEMORY(str, code) ({          \
		if ((str) == NULL) {                      \
			eprintf("Out of memory. code: %llu\n", \
				(unsigned long long int) (code));   \
			exit(3); /* code for out of memory */    \
		}                                             \
	})

	// verbose
	#define VALIDATE_FILE_V(path, code) ({               \
		printf("validating : ");                          \
		                                                   \
		if (access((path), 0 /* F_OK on POSIX */) == -1) {  \
			eprintf("'%s' cannot be accessed. code: %llu\n", \
				(path), (unsigned long long int) (code));     \
			exit(4); /* code for invalid file */               \
		}                                                       \
		                                                         \
		printf("'%s' available\n", (path));                       \
	})

	// silent
	#define VALIDATE_FILE_S(path) ({ \
		if (access((path), 0) == -1)  \
			exit(4);                   \
	})

	#define VALIDATE_FILE(path, code, v) ( \
		v /* verbose */ ?                   \
			VALIDATE_FILE_V(path, code) :    \
			VALIDATE_FILE_S(path)             \
	)
#endif
