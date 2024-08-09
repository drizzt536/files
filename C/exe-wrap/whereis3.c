// gcc -std=c99 -Wall -Wextra -Ofast whereis3.c -o whereis3

#define FILE_PATH "%%ComSpec%%/../where"

#ifdef v1
	#include "./exe-wrap.c"
#else
	#include "./exe-wrap-v2.c"
#endif
