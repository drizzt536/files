// gcc -std=c99 -Wall -Wextra -Ofast -nostdlib -lkernel32 -lshlwapi -lmsvcrt -D FILE_PATH=\"path\" exe-wrap-v2.c -o name && strip -s name

// produces much smaller binaries than exe-wrap.c, but still larger than exe-wrap.nasm

#ifndef FILE_PATH
	// -D FILE_PATH=\"...\" or #define FILE_PATH "..."
	#error "`FILE_PATH` macro must be defined for exe-wrap.c to work"
#endif

typedef unsigned long long int size_t;

// msvcrt.dll
int printf(const char *fmt, ...);
int sprintf(char *str, const char *fmt, ...);
size_t strlen(const char *str);
int system(const char *cmd);

// kernel32.dll
char *GetCommandLineA();

// shlwapi.dll
char *PathGetArgsA(char *path);

void ___chkstk_ms(void) {
	// I don't know what this is for.
	// But it won't compile without this function.
	// check stack something?
}

int mainCRTStartup(void) {
	char *args_s = PathGetArgsA(GetCommandLineA());
	size_t args_l = strlen(args_s);

	// 2 + strlen(FILE_PATH) + 6 + args_l + 2
	char cmd[args_l + sizeof(FILE_PATH) + 9];

	sprintf(cmd, "\"\"" FILE_PATH ".exe\" %s\"", args_s);

	return system(cmd);
}
