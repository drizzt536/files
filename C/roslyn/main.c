// assumes that the .NET SDK thing is installed: dotnet.microsoft.com/download
// I don't want to download Visual Studio or just do `dotnet csc.dll [args]`

#include "../string-join.h"

#ifndef ROOT
	#error "`-D ROOT=[dotnet root directory]` must be given to gcc for main.c"
#endif

#ifndef VERSION
	#error "`-D VERSION=[version]` must be given to gcc for main.c"
#endif

#ifndef LANG
	#error "`-D LANG=[csc|vbc]` must be given to gcc for main.c"
#endif


#define DOTNET	ROOT "dotnet.exe\""
#define DLL		ROOT "sdk/" VERSION "/Roslyn/bincore/" LANG ".dll\""

int main(int argc, char **argv) {

	const string args = strjoin(++argv, --argc);

	char *const cmd = malloc(strlen(DOTNET) + strlen(DLL) + args.l + 5);

	OUT_OF_MEMORY(cmd, 3);

	sprintf(cmd, "\"%s %s %s\"", DOTNET, DLL, args.s);

	return system(cmd);
	// `free(args.s)` and `free(cmd)` happen automatically by the OS
}
