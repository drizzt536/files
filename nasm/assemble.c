// gcc -Wall -Wextra -pedantic -Ofast ./assemble.c -o assemble
// strip ./assemble.exe

#include <io.h> // _access, (string.h: strlen)
#include <stdio.h> // printf, sprintf
#include <stdlib.h> // system, remove, exit
#include <windows.h> // HANDLE, WORD, FOREGROUND_RED, GetStdHandle, SetConsoleTextAttribute, GetConsoleScreenBufferInfo

#define ERROR_FGCOLOR FOREGROUND_RED
#define file_nexists(filename) ((_Bool) _access(filename, 0)) // F_OK == 0. file doesn't exist
#define set_cons_color(color) SetConsoleTextAttribute(cons, color)
#define reset_cons_colors() SetConsoleTextAttribute(cons, def_fgc | def_bgc)
#define eprintf(...) {                      \
	/*           error printf           */   \
	set_cons_color(ERROR_FGCOLOR | def_bgc);  \
	printf(__VA_ARGS__);                       \
	reset_cons_colors();                        \
}

static HANDLE cons; // console
static WORD def_fgc; // default foreground color
static WORD def_bgc; // default background color

__attribute__((constructor)) void init(void) {
	CONSOLE_SCREEN_BUFFER_INFO consoleInfo;

	cons = GetStdHandle(STD_OUTPUT_HANDLE);
	GetConsoleScreenBufferInfo(cons, &consoleInfo);

	def_fgc = consoleInfo.wAttributes & 15;
	def_bgc = consoleInfo.wAttributes & 112;
}



int main(int argc, char *argv[]) {
	/*
		all buffers allocate twice what should be required because
		it didn't work for file names longer than 18 characters and I
		am not skilled enough to figure out why. It works now though
	*/
	// nasm -fwin64 -Werror "./$name.$extn" $params
	// gcc "./$name.obj" -o $name
	// rm "./$name.obj"

	// argv[0]: path to this file
	// argv[1]: file name    ; argc > 1 ==> name   included
	// argv[2]: extension    ; argc > 2 ==> extn   included
	// argv[3]: extra params ; argc > 3 ==> params included

	if (argc == 1) {
		eprintf("No command-line arguments provided. File name is required.\n");
		exit(1);
	}
	char *_extn = argc > 2 ? argv[2] : ".nasm";
	char extn[1 + strlen(_extn)];
	sprintf(extn, *_extn == '.' ? "%s" : ".%s", _extn);

	char name[2 + strlen(argv[1])];
	sprintf(name, "./%s", argv[1]);

	char filestring[2*(strlen(name) + strlen(extn))];
	sprintf(filestring, "%s%s", name, extn);

	if (file_nexists(filestring)) {
		printf("validating : ");
		eprintf("file '%s' does not exist\n", filestring);
		exit(2);
	}
	printf("validating : file exists\n");

	char *params = argc > 3 ? argv[3] : "";

	/* nasm */ {
		char cmd[2*(22 + strlen(filestring) + strlen(params))];
		sprintf(cmd, "nasm.exe -fwin64 -Werror %s %s", filestring, params);
		printf("assembling : %s\n", cmd);
		int exit_code = system(cmd);
		if (exit_code == -1) {
			eprintf("nasm.exe returned an error while assembling\n");
			exit(3);
		}
	}
	/* gcc  */ {
		char cmd[2*(12 + 2*strlen(name))];
		sprintf(cmd, "gcc.exe %s.obj -o %s", name, name);
		printf("linking    : %s\n", cmd);
		int exit_code = system(cmd);
		if (exit_code == -1) {
			eprintf("gcc.exe returned an error while linking\n");
			exit(4);
		}
	}
	/* rm   */ {
		char cmd[2*(2 + strlen(name))];
		sprintf(cmd, "%s.obj", name);
		printf("cleaning   : Remove-Item -Path %s\n", cmd);
		int exit_code = remove(cmd);
		if (exit_code == -1) {
			eprintf("could not remove object file\n");
			exit(5);
		}
	}

	printf("finished   : executable at: %s.exe\n", name);

	return 0;
}
