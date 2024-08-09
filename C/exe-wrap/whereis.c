// gcc -std=c99 -Wall -Wextra -Ofast whereis.c -o whereis

#define FILE_PATH "%%MINGW_BIN%%/which"

#ifdef v1
	#include "./exe-wrap.c"
#else
	#include "./exe-wrap-v2.c"
#endif
