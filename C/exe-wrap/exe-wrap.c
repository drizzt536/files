// gcc -std=c99 -Wall -Wextra -D FILE_PATH=\"path\" -Ofast exe-wrap.c -o name

#ifndef FILE_PATH
	// -D FILE_PATH=\"...\" or #define FILE_PATH "..."
	#error "`FILE_PATH` macro must be defined for exe-wrap.c to work"
#endif

#include "../string-join.h"

int main(int argc, char *argv[]) {
	const string args = strjoin(--argc, ++argv);

	// 2 + strlen(FILE_PATH) + 6 + args.l + 2
	char *const cmd = malloc(args.l + sizeof(FILE_PATH) + 5);

	sprintf(cmd, "\"\"" FILE_PATH ".exe\" %s\"", args.s);

	return system(cmd);
	// free(cmd) will happen automatically by the OS.
}
