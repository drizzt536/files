#pragma once
#define ERROR_PRINT_H

// requires C23 for __VA_OPT__

#ifndef ERROR_PRINT_NOINCLUDE
	// in case you are using `-nostdlib` and want to manually prototype everything.
	// this way it won't double include "stdio.h" and <stdio.h>, for example.
	#include <stdlib.h> // exit
	#include <stdio.h> // printf, fprintf, stdout, stderr

	#ifdef _WIN32
		#include <fcntl.h> // io.h but with exta stuff
		#ifdef _UCRT
			// this version is just objectively better when available.
			#define access _access_s
		#else
			#define access _access
		#endif
	#else
		#include <unistd.h> // access
	#endif
#endif

#ifdef ERROR_PRINT_NO_ANSI
	// use empty strings for the same semantics
	#define RGB_STR(r, g, b) ""
	#define ANSI_COLOR(color) ""
	#define ANSI_RESET() ""

	// `(void) 0` instead of nothing so you still need to use a semicolon.
	#define CON_COLOR(color) ((void) 0)
	#define CON_RESET()      ((void) 0)
#else
	#define RGB_STR(r, g, b) #r ";" #g ";" #b
	#define ANSI_COLOR(color) "\e[38;2;" color "m"
	#define ANSI_RESET() "\e[0m"

	#define CON_COLOR(color) printf(ANSI_COLOR(color))
	#define CON_RESET()      printf(ANSI_RESET())
#endif

#define ANSI_RED    RGB_STR(166,  12,  26) // #A60C1A
#define ANSI_ORANGE RGB_STR(180, 100,   0) // #B46400
#define ANSI_YELLOW RGB_STR(160, 160,   0) // #A0A000
#define ANSI_GREEN  RGB_STR( 10, 128,  10) // #0A800A
#define ANSI_BLUE   RGB_STR(25 , 127, 250) // #197FFA
#define ANSI_WHITE  RGB_STR(255, 255, 255) // #FFFFFF
#define ANSI_BLACK  RGB_STR(  0,   0,   0) // #000000

// this is basically the same as the values in Python's `logging` package.
#define ERRLOG_NONE  5u // don't print any error messages
#define ERRLOG_FATAL 4u // only print fatal error messages
#define ERRLOG_WARN  3u // print fatal error messages and warnings
#define ERRLOG_NOTE  2u // print fatal, warning, and note error messages
#define ERRLOG_DEBUG 1u // print fatal, warning, note, and debug error messages
#define ERRLOG_ALL   0u // print everything. functionally equivalent to ERRLOG_DEBUG

#ifdef ERRLOG_USE_RUNTIME_LOG_LEVEL
	// this has to be explicitly turned on, mostly because *I* don't want it on.
	unsigned char ERRLOG_LEVEL = ERRLOG_NOTE;
#else
	#define ERRLOG_LEVEL ERRLOG_NOTE
#endif

#ifndef ERRLOG_FILE_VAL_SPACES
	// the string with the spaces before the colon in `VALIDATE_FILE_V`
	// technically they can be things other than spaces, but that is weird.

	// printf("validating" ERRLOG_FILE_VAL_SPACES ": ");
	#define ERRLOG_FILE_VAL_SPACES ""
#endif

#ifndef ERRLOG_OOM_EC
	// the program return code to be given on out-of-memory errors.
	#define ERRLOG_OOM_EC 12 // same as ENOMEM from <errno.h>
#endif

#ifndef ERRLOG_INVALID_FILE_EC
	// the program exit code to be given on invalid file errors.
	#define ERRLOG_INVALID_FILE_EC 1 // EXIT_FAILURE from <stdlib.h>
#endif

// internal color print versions
#define _FPRINTF_COLOR(fp, color, loglvl, args...) ({ \
	ERRLOG_LEVEL > (loglvl) ? 0 : ({                  \
		CON_COLOR(color);                             \
		const int return_code = fprintf((fp), args);  \
		CON_RESET();                                  \
		return_code;                                  \
	});                                               \
})

// external color print versions
#define fprintf_color(fp, color, args...) \
	_FPRINTF_COLOR(fp, color, /* true */ ERRLOG_LEVEL + 1, args)
#define printf_color(color, args...) fprintf_color(stdout, color, args)

#define fputs_color(fp, color, str) ({      \
	CON_COLOR(color);                       \
	const int e = fprintf(fp, "%s\n", str); \
	/* fputs doesn't add a newline. And  */ \
	/* has the string before the stream? */ \
	/* That is retarded so I fixed it.   */ \
	CON_RESET();                            \
	e;                                      \
})
#define puts_color(color, str) fputs_color(stdout, color, str)

#define efprintf(fp, args...)  _FPRINTF_COLOR(fp, ANSI_RED   , ERRLOG_FATAL, args)
#define ewfprintf(fp, args...) _FPRINTF_COLOR(fp, ANSI_ORANGE, ERRLOG_WARN , args)
#define enfprintf(fp, args...) _FPRINTF_COLOR(fp, ANSI_YELLOW, ERRLOG_NOTE , args)
#define edfprintf(fp, args...) _FPRINTF_COLOR(fp, ANSI_BLUE  , ERRLOG_DEBUG, args)

#define eprintf(args...)   efprintf(stderr, args)
#define ewprintf(args...) ewfprintf(stderr, args)
#define enprintf(args...) enfprintf(stderr, args)
#define edprintf(args...) edfprintf(stderr, args)

#define efputs(fp, str)  _FPRINTF_COLOR(fp, ANSI_RED   , ERRLOG_FATAL, "%s\n", str)
#define ewfputs(fp, str) _FPRINTF_COLOR(fp, ANSI_ORANGE, ERRLOG_WARN , "%s\n", str)
#define enfputs(fp, str) _FPRINTF_COLOR(fp, ANSI_YELLOW, ERRLOG_NOTE , "%s\n", str)
#define edfputs(fp, str) _FPRINTF_COLOR(fp, ANSI_BLUE  , ERRLOG_DEBUG, "%s\n", str)

#define eputs(str)   efputs(stderr, str)
#define ewputs(str) ewfputs(stderr, str)
#define enputs(str) enfputs(stderr, str)
#define edputs(str) edfputs(stderr, str)


// verbose. might not even print anything if there isn't space for a stack frame.
#define OUT_OF_MEMORY_V(mem, code) ({        \
	if ((mem) == NULL) {                      \
		eprintf("Out of Memory. code: %llu\n", \
			(unsigned long long int) (code));   \
		exit(ERRLOG_OOM_EC);                     \
	}                                             \
})

// silent
#define OUT_OF_MEMORY_S(mem) ({ \
	if ((mem) == NULL)           \
		exit(ERRLOG_OOM_EC);      \
})

#define OUT_OF_MEMORY(mem, code, v) ( \
	v /* verbose */ ?                  \
		OUT_OF_MEMORY_V(mem, code) :    \
		OUT_OF_MEMORY_S(mem)             \
)

#define _VA_ID_IGNORED(...)
#define _VA_ID(x...) x
#define _VA_ID_IF(suffix, x...) _VA_ID ## suffix(x)
#define VA_IF(t, f, ...) __VA_OPT__(t) _VA_ID_IF(__VA_OPT__(_IGNORED), f)
// use VA_IF for macro overloading, like for 1-arg and a 2-arg versions of a macro.
// e.g. #define f(x, y...) VA_IF(f2(x, y), f1(x), y)

#define OOM(mem, code...) VA_IF(OUT_OF_MEMORY_V(mem, code), OUT_OF_MEMORY_S(mem), code)

// verbose
#define VALIDATE_FILE_V(path, code) ({               \
	printf("validating" ERRLOG_FILE_VAL_SPACES ": "); \
	                                                   \
	if (access((path), 0 /* F_OK on POSIX */) == -1) {  \
		eprintf("'%s' cannot be accessed. code: %llu\n", \
			(path), (unsigned long long int) (code));     \
		exit(ERRLOG_INVALID_FILE_EC);                      \
	}                                                       \
	                                                         \
	printf("'%s' available\n", (path));                       \
})

// silent
#define VALIDATE_FILE_S(path) ({    \
	if (access((path), 0) == -1)     \
		exit(ERRLOG_INVALID_FILE_EC); \
})

// I don't remember why I implemented this like this, but I am sure I had a good reason.
#define VALIDATE_FILE(path, code, v) ( \
	v /* verbose */ ?                   \
		VALIDATE_FILE_V(path, code) :    \
		VALIDATE_FILE_S(path)             \
)

/*#define VALIDATE_FILE(path, code...) \
	VA_IF(VALIDATE_FILE_V(path, code), VALIDATE_FILE_S(path), code)
*/
