%ifndef ARGFILES_NASM
%define ARGFILES_NASM

%ifndef NO_ARGFILES
;; TODO: update the C for this so it is accurate.
%ifdifi
void process_argfile(char *_filename) {
	// I don't think this is accurate anymore.
	if (argfile_depth++ == 255)
		goto depth_exceeded;

	char *filename = _filename; // put into a nonvolatile register.

#ifndef NO_FOLDER_CHECK
	DWORD attrs = GetFileAttributesA(_filename);
	if (attrs == -1)
		goto invalid_file;

	if (attrs & 16)
		goto dir_passed;
#endif
	FILE *fp = fopen(filename, "rb");

	if (fp == NULL)
		goto invalid_file;

	if (_fseeki64_nolock(fp, 0, SEEK_END) != 0)
		goto not_seekable;

	uint64_t length = _ftelli64_nolock(fp);

	_fseeki64_nolock(fp, 0, SEEK_SET);

	// allocate space for the wide characters.
	char *cmdline = 2*length + 2 < SCRATCH_BUF_LEN ?
		scratch_buffer :
		malloc(2*length + 2);

	if (cmdline == NULL)
		goto file_too_large;

after_malloc:
	// initialize cmdline
	_fread_nolock(cmdline, sizeof(char), length, fp);
	cmdline[length] = '\0';

	_fclose_nolock(fp);

conv_loop_1:
	// convert from char * to wchar_t *
	do {
		*(short *) (cmdline + 2*length) = (short) cmdline[length];
		length--;
	} while (length > 0);

	// parse the arguments
	DWORD _argc;
	char *_argv = CommandLineToArgvW((wchar_t *) cmdline, &_argc);

	if (_argv == NULL)
		goto file_too_large;

	if (cmdline != scratch_buffer)
		free(cmdline);
after_free:
conv_loop_2:
	// convert wchar_t ** back to char **
	// idk if this C code is valid, but the assembly is.
	for (uint32_t i = 0; i < argc; i++) {
		union {
			wchar_t *w;
			char *a;
		} arg = { .w = argv[i] };

		uint64_t j = 0;
		for (wchar_t c; (c = arg.w[j]) != L'\0'; j++) {
			if (c > 0xff)
				c = '?';

			arg.a[j] = c;
		}

		arg.a[j] = '\0';
	}

	// NOTE: at this point, any variables that were in nonvolatile registers
	//       earlier in this function can now be restored so the function
	//       stack size here is zero

	// NOTE: the next stuff is not valid C and is annoying to do in C, so I
	//       just did partially in assembly. this is pseudocode anyway, so idc.
/*
	// 48 bytes of stack used per
	push r15 // index of the last output argument
	push rbx // i
	push rdi // argc
	push rsi // argv

	rdi = _argc;
	rsi = _argv;
	rbx = 0;
	r15 = 0;

	push mainCRTStartup_return_address
	sub rsp, 32
	jmp mainCRTStartup.arg_phase_2
	// this call clobbers most registers because it doesn't know that it is being called
	// from here rather that it being the main function itself.
	// argv and argc should stay the same.

main_return_address:
	LocalFree(_argv);

	pop rsi // restore argv
	pop rdi // restore argc
	pop rbx // restore i

	// if the argfile had output arguments, then
	// set the last output argument to the current argument
	test r15d, r15d
	pop r15 // NOTE: this deosn't effect flags
	cmovnz r15, rbx

	argfile_depth--;
	ret
*/

invalid_file:
	fprintf(*pstderr, "\e[31mERROR: argfile '@%s' could not be opened.\e[0m\n", filename);
	exit(EXIT_ARGFILE_INVAL);

dir_passed:
	fprintf(*pstderr, "\e[31mERROR: argfile '@%s' is a folder.\e[0m\n", filename);
	exit(EXIT_ARGFILE_FOLDER);

not_seekable:
	fprintf(*pstderr, "\e[31mERROR: argfile '@%s' is not seekable.\e[0m\n", filename);
	exit(EXIT_ARGFILE_NOSEEK);

file_too_large:
	fprintf(*pstderr, "\e[31mERROR: argfile '@%s' is too large; out of memory.\e[0m\n", filename);
	exit(EXIT_ARGFILE_SIZE);

depth_exceeded:
	fprintf(*pstderr, "\e[31mERROR: argfile '@%s' exceeded depth max of 255. maybe rethink your design :|\e[0m\n");
	exit(EXIT_ARGFILE_DEPTH);
}

int main(void) {
	{argc, argv} = setup_argc_argv();

	// skip the current executable path
	argc++;
	argv--;

	char *arg1 = *argv;

	if (*arg1 == '@')
		process_argfile(arg1 + 1);

	// ...
}
%endif ; %ifdifi

;; NOTE: [rsi + rbp] (length[cmdline]) has a shorter opcode than [rbp + rsi] for some reason. (cmdline[length])

;; variables
	;; filename = rdi
	;; length   = rsi
	;; fp       = rbx
	;; cmdline  = rbp
	;; _argc    = [rsp + 32], then edi

;; shadow space + variable space + alignment padding.
%assign process_argfile_stack_space 32 + 4 + 4

process_argfile: ; void process_argfile(char *_filename);
	inc 	byte [rel argfile_depth]	; if (argfile_depth++ == 255)
	jz  	.depth_exceeded				;     goto depth_exceeded;

	push	rbx ;; fp
	push	rbp ;; cmdline
	push	rdi ;; argc
	push	rsi ;; argv
	sub 	rsp, process_argfile_stack_space

	mov 	rdi, rcx	; filename = _filename;

%ifndef NO_FOLDER_CHECK
	call	GetFileAttributesA

	cmp 	eax, 0xffffffff
	je  	.invalid_file

	test	eax, 16
	jnz 	.dir_passed

	mov 	rcx, rdi	;; redundant instruction if GetFileAttributes isn't called.
%endif
	lea 	rdx, [rel file_r_mode]
	call	fopen

	test	rax, rax		; if (fp == NULL)
	jz  	.invalid_file	;     goto invalid_file;

	mov 	rbx, rax		; FILE *fp = fopen(filename, "rb");

	mov 	rcx, rax		;; fp
	xor 	edx, edx		;; 0
	mov 	r8d, 2			;; SEEK_END
	call	fseek

	test	rax, rax		; if (fseek(...) != 0)
	jnz 	.not_seekable	;     goto not_seekable;

	mov 	rcx, rbx		;; fp
	call	ftell

	mov 	rsi, rax		; uint64_t length = ftell(fp);

	mov 	rcx, rbx		;; fp
	xor 	edx, edx		;; 0
	xor 	r8d, r8d		;; SEEK_SET
	call	fseek

	lea 	rbp, [rel scratch_buffer]	; cmdline = scratch_buffer;
	lea 	rdx, [2*rsi + 2]			;; arg2 = 2*length + 2

	cmp 	rdx, SCRATCH_BUF_LEN	; if (2*length + 2 <= 65536)
	jbe 	.after_alloc			;     use the static buffer;

	xor 	ecx, ecx				;; arg1 = LMEM_FIXED
	call	LocalAlloc

	test	rax, rax		; if (cmdline == NULL)
	jz  	.file_too_large	;     goto file_too_large;

	mov 	rbp, rax		; cmdline = LocalAlloc(LMEM_FIXED, 2*length + 2)
.after_alloc:
	;; initialize the cmdline
	mov 	rcx, rbp	;; cmdline
	mov 	edx, 1		;; sizeof(char)
	mov 	r8, rsi		;; length
	mov 	r9, rbx		;; fp
	call	_fread_nolock

	mov 	byte [rsi + rbp], `\0`	; cmdline[length] = '\0'; // fread doesn't do this automatically.

	mov 	rcx, rbx	;; fp
	call	_fclose_nolock

	;; convert from char * to wchar_t *
	;; also replace newlines with spaces

	mov 	ax, ' '
.conv_loop_1:						; do {
	;; NOTE: this next line only works because Windows is always little endian.
	movzx	cx, byte [rsi + rbp]	;     short c = (short) length[cmdline];
	cmp 	cx, `\n`				;     if (c == '\n')
	cmove	cx, ax					;         c = ' ';
	mov 	word [rbp + 2*rsi], cx	;     *(short *) (cmdline + 2*length) = c;

	dec 	rsi
	jnz 	.conv_loop_1			; } while (--length != 0);

	;; handle the zero case since the loop skips it.
	mov 	byte [rbp + 1], 0		; *(short *) cmdline = (short) length[0];

	;; parse the arguments
	; wchar_t *_argvw = CommandLineToArgvW((wchar_t *) cmdline, &_argc);
	mov 	rcx, rbp		; cmdline
	lea 	rdx, [rsp + 32] ; &_argc
	call	CommandLineToArgvW

	test	rax, rax					; if (_argvw == NULL)
	jz  	.file_too_large				;     goto file_too_large;

	mov 	edi, dword [rsp + 32]		; argc = _argc
	mov 	rsi, rax					; argv = _argvw

	mov 	rcx, rbp					; arg1 = cmdline
	lea 	rdx, [rel scratch_buffer]	; tmp = scratch_buffer
	cmp 	rcx, rdx
	je  	.after_free
	call	LocalFree
.after_free:
	;; convert back from wchar_t ** to char **
	xor 	r9d, r9d			; int i = 0;
.conv_loop_2:
	cmp 	r9d, edi			; while (i < argc) {
	je  	.setup_done

	mov 	rcx, [rsi + 8*r9]	;     wstr_to_str_inplace(argv[i]);
	wstr_to_str_inplace_macro rcx

	inc 	r9d
	jmp 	.conv_loop_2		; }
.setup_done:
	mov 	ecx, edi	; save _argc
	mov 	rdx, rsi	; save _argv

	;; undo the function prologue from before.
	add 	rsp, process_argfile_stack_space
	pop 	rsi
	pop 	rdi
	pop 	rbp
	pop 	rbx

	;; set up the stack for jumping back to mainCRTStartup. basically fake
	;; the stack frame that mainCRTStartup.arg_phase_2 expects to see.
	push	r15		;; index of last output argument
	push	rbx		;; i
	push	rdi		;; argc
	push	rsi		;; argv
	sub 	rsp, 8	;; for alignment

	mov 	rsi, rdx	; argv = _argv;
	mov 	edi, ecx	; argc = _argc;
	xor 	ebx, ebx	; i = 0;
	xor 	r15d, r15d	; index of last output argument = 0 

	mov 	rax, rsp

	lea 	rax, [rel .main_return_address]
	push	rax		;; put the return address onto the stack
	sub 	rsp, main_stack_space
	jmp 	mainCRTStartup.arg_phase_2
.main_return_address:
	sub 	rsp, 32		;; shadow space for LocalFree

	;; NOTE: mainCRTStartup.arg_phase_2 doesn't modify rsi, so this is fine
	mov 	rcx, rsi	;; argv
	call	LocalFree

	add 	rsp, 32 + 8

	pop 	rsi		;; restore argv
	pop 	rdi		;; restore argc
	pop 	rbx		;; restore i

	;; if the argfile had output arguments, then set the last output argument to the current argument.
	test	r15d, r15d
	pop 	r15		;; NOTE: this doesn't effect flags
	cmovnz	r15, rbx

	dec 	byte [rel argfile_depth]
	ret

	;; these don't need to close the file because `exit()` already does that.
	;; similar idea with freeing the commandline string.
.invalid_file:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel argfile_invalid_file_str]
	mov 	r8, rdi
	call	fprintf

	mov 	ecx, EXIT_ARGFILE_INVAL
	jmp 	.exit
%ifndef NO_FOLDER_CHECK
.dir_passed:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel argfile_dir_passed_str]
	mov 	r8, rdi
	call	fprintf

	mov 	ecx, EXIT_ARGFILE_FOLDER
	jmp 	.exit
%endif ; %ifndef NO_FOLDER_CHECK
.not_seekable:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel argfile_not_seekable_str]
	mov 	r8, rdi
	call	fprintf

	mov 	ecx, EXIT_ARGFILE_NOSEEK
.exit:
	;; save 2 bytes per exit routine to jump to here instead of having `call exit` in each branch.
	;; a call is 5 bytes and jmp short is 2 bytes. this is placed approximately in the middle to
	;; increse the likelyhood that the other jumps distances fit in a short jump.
	call	exit
.file_too_large:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel argfile_too_large_str]
	mov 	r8, rdi
	call	fprintf

	mov 	ecx, EXIT_ARGFILE_SIZE
	jmp 	.exit
.depth_exceeded:
	and 	spl, -16	;; align the stack so fprintf doesn't crash
	mov 	r8, rcx
	lea 	rdx, [rel argfile_depth_exceeded_str]
	mov 	rcx, [rel pstderr]
	call	fprintf

	mov 	ecx, EXIT_ARGFILE_DEPTH
	jmp 	.exit
%endif ; %ifndef NO_ARGFILES

%endif ;; ARGFILES_NASM
