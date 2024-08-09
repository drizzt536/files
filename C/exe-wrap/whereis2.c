// gcc -std=c99 -Wall -Wextra -Ofast whereis2.c -o whereis2

#define FILE_PATH "%%_MSYS2_BASH%%/../whereis"

#ifdef v1
	#include "./exe-wrap.c"
#else
	#include "./exe-wrap-v2.c"
#endif
