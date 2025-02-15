; ../assemble print-argc --l kernel32,shell32,ucrtbase

;; NOTE: there are a couple main differences between this and the actual `cat` utility
;;     1. it does not work with the pipeline, so `echo asdf | cat` will print nothing
;;     2. for no arguments, it exits immediately instead of reading from stdin
;;     3. it prints the error messages in red, and with different wording.

;; approximate C version:
%if 0
#include <io.h> // _access_s
#include <stdio.h> // stderr, fprintf, fopen, fclose, putchar, fgetc, EOF

void catfile(char *filename) {
	if (_access_s(filename, 4) != 0) {
		fprintf(stderr, "\e[31minput file "%s" does not exist or is not readable\e[0m\n", filename);
		return;
	}

	register FILE *fp = fopen(filename, "r");
	register char c;

	while ((c = fgetc(fp)) != EOF)
		putchar(c);

	fclose(fp);
	return;
}

int main(int argc, char **argv) {
	for (register int i = 1; i < argc; i++)
		catfile(argv[i]);

	return 0;
}
%endif

segment rdata
	file_modifier		db `r\0`
	file_nexists_str	db `\e[31minput file "%s" does not exist or is not readable\e[0m\n\0`

segment text
	global main

	extern GetCommandLineW						; kernel32.dll
	extern CommandLineToArgvW					; shell32.dll
	extern _access_s, fopen, fgetc, putchar
	extern fclose, fprintf, __acrt_iob_func		; ucrtbase.dll

%include "../winapi/setup_argc_argv.nasm"

catfile: ; void catfile(char *filename);
	;; don't bother saving the old r12, since the main function doesn't use it.
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32		; shadow space

	mov 	r12, rcx

;	mov 	rcx, r12	; redundant instruction
	mov 	rdx, 100b	; read access
	call	_access_s

	test	rax, rax	; test for nonzero exit code
	jnz  	.invalid_file

	mov 	rcx, r12
	lea 	rdx, [rel file_modifier]
	call 	fopen

	mov 	r12, rax	; r12 = fp;
.loop:
	;; this would be faster if it used some kind of buffer, and reads/writes in blocks. 
	mov 	rcx, r12
	call	fgetc

	cmp 	eax, -1		; NOTE: eax and not rax because fgetc returns int and not long.
	jz  	.cleanup

	mov 	ecx, eax	; this is fine because `fgetc` reurns a 32-bit value, not 64-bit
	call	putchar

	jmp 	.loop
.cleanup:
	mov 	rcx, r12
	call	fclose
.exit:
	leave
	ret
.invalid_file:
	mov 	rcx, 2
	call	__acrt_iob_func

	mov 	rcx, rax	; print to stderr
	lea 	rdx, [rel file_nexists_str]
	mov 	r8 , r12
	call	fprintf
	; closing the file is unnecessary since it was never opened.
	jmp 	.exit

main:
	; `push rbp` and `mov rbp, rsp` is not necessary here.
	sub 	rsp, 8 ; for alignment purposes, otherwise it crashes with access violation (0xC0000005)

	call	setup_argc_argv

	mov 	ebx, 1 ; start at the first argument. ignore the current executable path.
.loop:
	cmp 	ebx, edi
	je  	.done

	mov 	rcx, [rsi + 8*rbx] ; rcx = argv[i].
	call	catfile

	inc 	ebx
	jmp 	.loop

.done:
	add 	rsp, 8
	xor 	eax, eax
	ret
