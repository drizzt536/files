#include <stdio.h>
#include <string.h>
#include <stdlib.h>
// gcc ./assemble.c -o assemble -Ofast
// strip ./assemble.exe


int main(int argc, char *argv[]) {
	// nasm -fwin64 -Werror "./$name.$extn" $params
	// gcc "./$name.obj" -o $name
	// rm "./$name.obj"
	// iex "./$name.exe"

	// argv[0]: path to this file
	// argv[1]: file name    ; argc > 1 ==> name   included
	// argv[2]: extension    ; argc > 2 ==> extn   included
	// argv[3]: extra params ; argc > 3 ==> params included

	if (argc == 1) {
		puts("no arguments provided");
		return 1;
	}
	
	char *_extn = argc > 2 ? argv[2] : ".nasm";
	char extn[1 + strlen(_extn)];
	sprintf(extn, *_extn == '.' ? "%s" : ".%s", _extn);

	char name[2 + strlen(argv[1])];
	sprintf(name, "./%s", argv[1]);

	char *params = argc > 3 ? argv[3] : "";

	{
		char cmd[2*(22 + strlen(name) + strlen(extn) + strlen(params))];
		sprintf(cmd, "nasm -fwin64 -Werror %s%s %s", name, extn, params);
		printf("running nasm: %s\n", cmd);
		system(cmd);
	}
	{
		char cmd[2*(12 + 2*strlen(name))];
		sprintf(cmd, "gcc %s.obj -o %s", name, name);
		printf("linking with gcc: %s\n", cmd);
		system(cmd);
	}
	char cmd[2*(2 + strlen(name))];
	sprintf(cmd, "%s.obj", name);
	printf("removing intermediate %s\n", cmd);
	remove(cmd);

	return 0;
}
