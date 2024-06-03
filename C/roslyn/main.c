// assumes that the .NET SDK thing is installed: dotnet.microsoft.com/download
// I don't want to download Visual Studio or just do `dotnet csc.dll [args]`

#include "../string-join.h"

#ifndef ROOT
	#error "`-D ROOT=\"[dotnet root directory]\"` must be given to gcc for main.c"
#endif

#ifndef VERSION
	#error "`-D VERSION=\"[version]\"` must be given to gcc for main.c"
#endif

#ifndef LANG
	// C#, F#, or Visual Basic.NET
	#error "`-D LANG=[cs|fs|vb]` must be given to gcc for main.c"
#endif

#define STRINGIFY(x) #x
#define STRINGIFY2(y) STRINGIFY(y) // stringify expanded.

#define LANG_STR STRINGIFY2(LANG)

#define CONCATENATE(x, y) x ## y
#define CHECK_LANG(lang) CONCATENATE(LANG_, lang)

#define LANG_cs 1
#define LANG_vb 2
#define LANG_fs 3


#define DOTNET	"\"" ROOT "dotnet.exe\""

#if CHECK_LANG(LANG) == LANG_fs
	#define DLL "\"" ROOT "sdk/" VERSION "/FSharp/fsc.dll\""
#else
	#define DLL "\"" ROOT "sdk/" VERSION "/Roslyn/bincore/" LANG_STR "c.dll\""
#endif

int main(int argc, char **argv) {

	const string args = strjoin(++argv, --argc);

	char *const cmd = malloc(strlen(DOTNET) + strlen(DLL) + args.l + 5);

	OUT_OF_MEMORY(cmd, 3);

	sprintf(cmd, "\"" DOTNET " " DLL " %s\"", args.s);

	return system(cmd);
	// `free(args.s)` and `free(cmd)` happen automatically by the OS
}
