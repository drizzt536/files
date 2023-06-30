// gcc -Wall -Wextra -pedantic -Ofast ./assemble.c -o assemble
// strip ./assemble.exe

#include <io.h> // _access, (string.h: strlen)
#include <stdio.h> // printf, sprintf
#include <stdlib.h> // system, remove, exit, calloc, realloc, free
#include <stdbool.h> // bool, true, false
#include <windows.h> // HANDLE, WORD, FOREGROUND_RED, GetStdHandle, SetConsoleTextAttribute, GetConsoleScreenBufferInfo

#define RUN_FINAL_EXECUTABLE true
#define ERROR_FGCOLOR FOREGROUND_RED
#define file_nexists(filename) ((bool) _access(filename, 0)) // F_OK == 0. file doesn't exist
#define stringify_bool(boolean) (boolean ? "true" : "false")
#define set_cons_color(color) SetConsoleTextAttribute(cons, color)
#define reset_cons_colors() SetConsoleTextAttribute(cons, def_fgc | def_bgc)
#define eprintf(...) {                      \
	/*           error printf           */   \
	set_cons_color(ERROR_FGCOLOR | def_bgc);  \
	printf(__VA_ARGS__);                       \
	reset_cons_colors();                        \
}
#define if_null_alloc(string) if (string == NULL) {               \
	eprintf("could not allocate memory for the joined string.\n"); \
	exit(-1);                                                       \
}

static HANDLE cons; // console
static WORD def_fgc; // default foreground color
static WORD def_bgc; // default background color

static __attribute__((constructor)) void init(void) {
	CONSOLE_SCREEN_BUFFER_INFO consoleInfo;

	cons = GetStdHandle(STD_OUTPUT_HANDLE);
	GetConsoleScreenBufferInfo(cons, &consoleInfo);

	def_fgc = consoleInfo.wAttributes & 15;
	def_bgc = consoleInfo.wAttributes & 112;
}

bool has_param(char *parameters, char param_character) {
	char param[4] = {'-', '-', param_character, '\0'};
	char *position = strstr(parameters, param);

	if (position == NULL) return false;

	*position = position[1] = position[2] = ' ';

	return true;
}

char *strjoin(char *strs[], int num_strs) {
	if (num_strs <= 0) {
		char *out_str = (char *) calloc(1, sizeof(char)); // empty string
		if_null_alloc(out_str);

		return out_str; // no strings
	}

	// first string
	char *out_str = strdup(*strs);
	if_null_alloc(out_str);
	int length = strlen(out_str) + 1; // +1 for null byte

	for (int i = 1; i < num_strs; i++) {
		length += 1 + strlen(strs[i]); // +1 for the space
		out_str = realloc(out_str, length);
		if_null_alloc(out_str);
		strcat(out_str, " ");
		strcat(out_str, strs[i]);
	}

	return out_str;
}

int main(int argc, char *argv[]) {
	// nasm -fwin64 -Werror "./$name.$extn" $params
	// gcc "./$name.obj" -o $name
	// rm "./$name.obj"
	// iex "./$name.obj"

	// argv[0]:  path to this file
	// argv[1]:  file name     ; argc > 1 ==> name   included
	// argv[2]:  extension     ; argc > 2 ==> extn   included
	// argv[3+]: extra params  ; argc > 3 ==> params included

	// argv[3+] is concatenated to one string with a space in between each.

/*	*
	*	--R :	do not remove object file
	*	--L :	do not link object file
	*	--S :	do not strip executable
	*	--E :	do not run, prints exe name	, default, overrides e

	*	--r :	remove object file			, default, overrides R
	*	--l :	link object file			, default, overrides L
	*	--s :	strip executable			, default, overrides S
	*	--e :	run executable

	* the rest are passed on to nasm for assembling
*	*/
	

	if (argc == 1) {
		eprintf("No command-line arguments provided. File name is required.\n");
		exit(1);
	}
	char *_extn = argc > 2 ? argv[2] : ".nasm";
	char extn[2 + strlen(_extn)];
	sprintf(extn, *_extn == '.' ? "%s" : ".%s", _extn);

	char name[3 + strlen(argv[1])];
	sprintf(name, "./%s", argv[1]);

	char filestring[strlen(name) + strlen(extn) + 1];
	sprintf(filestring, "%s%s", name, extn);

	if (file_nexists(filestring)) {
		printf("validating : ");
		eprintf("file '%s' does not exist\n", filestring);
		exit(2);
	}
	printf("validating : file exists\n");

	// TODO: start checking buffers here
	char *params = argc > 3 ?
		strjoin(argv + 3, argc - 3) :
		strjoin((char **) NULL, 0);

	// these have to happen now. `has_param` is not a pure function.
	bool remove_obj = has_param(params, 'r') || !has_param(params, 'R')
		, link      = has_param(params, 'l') || !has_param(params, 'L')
		, strip     = has_param(params, 's') || !has_param(params, 'S')
		, execute   = has_param(params, 'e') && !has_param(params, 'E');

	// nasm
	{
		char cmd[27 + strlen(filestring) + strlen(params)];
		sprintf(cmd, "nasm.exe -fwin64 -Werror %s %s", filestring, params);
		printf("assembling : %s\n", cmd);

		int exit_code = system(cmd);
		if (exit_code != 0) {
			eprintf("nasm.exe returned an error while assembling\n");
			exit(3);
		}
	}

	// gcc, rm, strip, and execute
	if (link) {
		{
			char cmd[17 + 2*strlen(name)];
			sprintf(cmd, "%s.obj", name);
			if (file_nexists(cmd)) {
				// in case nasm doesn't return -1 on an error
				eprintf("nasm.exe returned an error while assembling\n");
				exit(3);
			}
			sprintf(cmd, "gcc.exe %s.obj -o %s", name, name);
			//  this cannot be    ^^^^^^  replaced with "%s" and cmd for the argument.
			printf("linking    : %s\n", cmd);
			int exit_code = system(cmd);
			if (exit_code != 0) {
				eprintf("gcc.exe returned an error while linking\n");
				exit(4);
			}
		}

		if (remove_obj) {
			char cmd[5 + strlen(name)];
			sprintf(cmd, "%s.exe", name);
			if (file_nexists(cmd)) {
				// in case gcc doesn't return -1 on an error
				eprintf("gcc.exe returned an error while linking\n");
				exit(4);
			}
			sprintf(cmd, "%s.obj", name);
			printf("cleaning   : Remove-Item -Path %s\n", cmd);
			int exit_code = remove(cmd);
			if (exit_code != 0) {
				eprintf("could not remove object file\n");
				exit(5);
			}
		}

		if (strip) {
			char cmd[18 + strlen(name)];
			sprintf(cmd, "strip.exe -S %s.exe", name);
			printf("stripping  : %s\n", cmd);
			int exit_code = system(cmd);
			if (exit_code == -1) {
				eprintf("could not strip executable\n");
				exit(6);
			}
		}

		if (execute) {
			char cmd[5 + strlen(name)];
			sprintf(cmd, "%s.exe", name);
			printf("executing  : %s\n\n", cmd);
			int exit_code = system(cmd + 2); // remove "./" from the beginning
			if (exit_code == -1) {
				eprintf("could not run executable\n");
				exit(7);
			}
		}
		else
			printf("\nfinal executable: %s.exe\n", name);
	}

	free(params);

	return 0;
}
