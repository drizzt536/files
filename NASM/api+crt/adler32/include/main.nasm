%ifndef MAIN_NASM
%define MAIN_NASM

;; Variables:
	;; i       = ebx
	;; argc    = edi
	;; argv    = rsi
	;; prev    = r12d
	;; argv[i] = r13
	;; flags   = r14
		;; NOTE: "bit N" means use `r14 & (1 << N)` to get the value
		;; bit 0: incremental
		;; bit 1: pipe given
		;; bit 2: do/undo mode. 1 for backwards/undo, 0 for forwards/do
		;; bit 3: manual pipe bit (-! passed or not). only used if -DNO_WARN_UNUSED is not given

	;; r15d = index of the last seen output argument

mainCRTStartup:
;; mainCRTStartup doesn't preserve any nonvolatile registers because I don't care about that.
	sub 	rsp, main_stack_space

%ifndef BARE_BONES
	;; there are no flags, so this is not required.
	xor 	r14d, r14d	; clear global program flags
%endif

	;; put it into undo mode if, for some reason, you want it to do that.
	%cond(%isdef(MODE_UNDO_DEFAULT), {or r14b, DIR_BIT_VAL})

%if %isndef(NO_ARG_I) || %isndef(NO_ARG_P)
	;; if -i and -p both do not exist, this doesn't need to happen
	mov 	r12d, 1		; default input checksum
%endif
	xor 	ebx, ebx	; int i = 0;

%ifndef NO_WARN_UNUSED
	;; index of the last output argument
	;; this sentinel value is checked later to see if r15 was ever set.
	mov 	r15d, -1
%endif ; %ifndef NO_WARN_UNUSED

	;; NOTE: technically, the memory given by this should be freed at the end of the program,
	;;       but that adds extra complexity for basically no gain. The OS will reclaim it anyway.
%ifdef BARE_BONES
	setup_argc_argv_macro
%else
	call	setup_argc_argv
%endif

	dec 	edi			;; skip past the path to the current executable
	add 	rsi, 8

%ifdef MSVCRT
	call	iob_func

	%ifndef NO_PIPE
		;; stdin is only ever used with pipes.
		;; setup stdin, and output file defaults
		mov 	[rel pstdin], rax
	%endif

	%ifndef NO_ARG_O
		add 	rax, 8				;; stdin + 8 bytes = stdout
		mov 	[rel poutfile], rax	;; actually used for writing
		mov 	[rel pstdout], rax	;; used for `if (fp == stdout) { ... }`
		add 	rax, 8				;; stdout + 8 bytes = stderr
	%else
		;; go directly from stdin to stderr.
		add 	rax, 16
	%endif ; %ifndef NO_ARG_O
%else
	;; ucrtbase
	%ifndef NO_PIPE
		mov 	ecx, 0		; setup stdin
		call	iob_func
		mov 	[rel pstdin], rax
	%endif

	%ifndef NO_ARG_O
		mov 	ecx, 1		; setup the default output file
		call	iob_func
		mov 	[rel poutfile], rax	; actually used for writing
		mov 	[rel pstdout], rax	; used for `if (fp == stdout) { ... }`
	%endif

		mov 	ecx, 2		; setup error file
		call	iob_func
%endif ; %ifdef MSVCRT

	mov 	[rel pstderr], rax	;; fatal errors
%ifndef NO_ARG_E
	mov 	[rel perrfile], rax	;; non-fatal errors
%endif

%ifndef NO_PIPE
	call	pipeline_available

	test	al, al		; if (pipeline is not available)
	jz  	.test_arg1	;     don't set the pipe bit and stuff

	;; set the relevant flag bit if the pipeline is available
	or  	r14, PIPE_BIT_VAL

	xor 	ecx, ecx	;; NOTE: _fileno(*pstdin) == 0
	mov 	edx, 0x8000	;; _O_BINARY
	call	_setmode	; _setmode(*pstdin, _O_BINARY);

	mov 	r8b, 1
	;; using `inc` makes this one byte shorter.
	inc 	eax				; cmp 	eax, 0xffffffff
	jz  	.internal_error

	test	edi, edi				;; skip testing arguments if there are no arguments
	jz  	.process_pipe_if_given	;; don't jump to .args_done in case the pipeline was given.
%endif ; %ifndef NO_PIPE

%ifndef BARE_BONES
	;; for -DBARE_BONES, this is all unnecessary, because it just jumps past nothing,
	;; and the `test edi, edi` case is the same as the `test ebx, edi` at the start of the loop.

.test_arg1: ;; test for things that only work as the first argument
	;; NOTE: there is no ebx incrementing because currently all the options only allowed as the first argument
	;;       exit the program early, and everything else should be processed in `process_arg`, or is a file.
	test	edi, edi	;; if no arguments given
	jz  	%cond(%isdef(NO_ARG_H), .args_done, .help)

	mov 	rcx, [rsi]

	;; if the first character is not '-', checking for arguments is useless because they will not match.
	cmp 	byte [rcx], '-'
	jne 	%cond(%isdef(NO_PIPE), .arg_phase_2, .process_pipe_if_given)

	;; '-' with nothing after it. only has any meaning if the pipe is enabled.
	cmp 	byte [rcx + 1], `\0`
	je  	%cond(%isdef(NO_PIPE), .arg_phase_2, .process_pipe_explicit)
%endif ; %ifndef BARE_BONES

%ifndef NO_PIPE
	;; `-!`
	cmp 	word [rcx + 1], `!\0`
	jne 	.test_arg1@after_man_pipe

	%ifndef NO_WARN_UNUSED
		or  	r14b, MAN_BIT_VAL

		;; NOTE: technically, -! isn't an output value, but it is used more as a measure
		;;       of if arguments do anything, rather than if they actually cause output
		test	r14b, PIPE_BIT_VAL	; if (arg == "-!" && pipe given)
		cmovnz	r15d, ebx			;     last_output_arg = 0;
	%endif
	inc 	ebx		;; ebx = 1

	jmp 	.arg_phase_2
%endif ; %ifndef NO_PIPE

.test_arg1@after_man_pipe:
	;; long arguments
;	lea 	rcx, [rsi]	;; redundant instruction
%ifndef NO_ARG_H
	lea 	rdx, [rel help_arg]	;; --help
	call	streq
	je  	.help

	;; NO_ARG_V requires NO_ARG_H
	%ifndef NO_ARG_V
		;; if --version doesn't exist, reloading `rcx` is a redundant instruction.
		mov 	rcx, qword [rsi]

		lea 	rdx, [rel ver_arg] ;; --version
		call	streq
		je  	.version
	%endif ; %ifndef NO_ARG_V
%endif ; %ifndef NO_ARG_H

%if %isndef(NO_PIPE) && %isndef(NO_LONG_ARGS)
	;; if --help exists, then rcx needs to be reloaded
	%cond(%isndef(NO_ARG_H), {mov	rcx, qword [rsi]})

	lea 	rdx, [rel manual_pipe_arg]
	call	streq
	lea 	edx, [rbx + 1] ; shorter than `lea edx, [ebx + 1]` by one byte
	cmove	ebx, edx
	je  	.arg_phase_2
%endif ; !NO_PIPE && !NO_LONG_ARGS

%if %isndef(NO_ARG_H) || %isndef(NO_ARG_V)
	;; this doesn't need to be here if neither of the next things exist.

	mov 	rcx, [rsi]			; tmp = argv[0];
	mov 	cx, word [rcx + 1]	; tmp = (char []) {argv[0][1], argv[0][2]};
%endif

%ifndef NO_ARG_H
	cmp 	cx, `h\0`
	je  	.help

	cmp 	cx, `?\0`
	je  	.help
%endif

%ifndef NO_ARG_V
	cmp 	cx, `v\0`
	je  	.version
%endif

%ifndef NO_PIPE
;; if the pipe is disabled, skip the first pass and the pipe processing
.arg_phase_1: ; go through the arguments until there is an input source argument
	cmp 	ebx, edi				; if (i == argc)
	je  	.process_pipe_if_given	;     goto process_pipe_if_given;

	mov 	r13, [rsi + 8*rbx]		; r13 = argv[i];

	;; only process options. no files
	cmp 	byte [r13], '-'			; if (argv[i][0] != '-')
	jne 	.process_pipe_if_given	;     goto process_pipe_if_given;

	;; `-` argument means to process the pipe here.
	cmp 	byte [r13 + 1], `\0`
	je  	.process_pipe_explicit

%if %isndef(NO_ARG_F) && %isndef(NO_INLINE_INPUT) || %isndef(NO_ARG_S) && %isndef(NO_ARG_X)
	;; use a register as an intermediate value if at least 2 of the following options exist.
	mov 	cx, word [r13 + 1]
	%define tmp cx
%else
	%define tmp word [r13 + 1]
%endif

	;; `-f`, `-s`, and `-x` are input source operands.
%ifndef NO_ARG_F
	cmp 	tmp, `f\0`
	je  	.process_pipe_if_given
%endif

%ifndef NO_ARG_S
	cmp 	tmp, `s\0`
	je  	.process_pipe_if_given
%endif

%ifndef NO_ARG_X
	cmp 	tmp, `x\0`
	je  	.process_pipe_if_given
%endif

%undef tmp

	call	process_arg
	inc 	ebx
	jmp 	.arg_phase_1
.process_pipe_explicit:
	;; for if `-` was used explicitly before the first input source argument
	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ; output argument
	inc 	ebx				;; skip past the `-` argument.
	jmp 	.process_pipe	;; always process the pipe
.process_pipe_if_given:
	;; this is for when the first input source argument is encountered.
	;; like in `adler32 -r file`, don't process the pipe if it wasn't given.
	test	r14b, PIPE_BIT_VAL	;; if the pipe-given flag isn't set, skip this part.
	jz  	.arg_phase_2
	;; fall through if the pipe was given
.process_pipe:
	call	process_pipe
	;; fall through to the second argument pass
%endif ; %ifndef NO_PIPE
.arg_phase_2:	;; this time, iterate through everything, including file names
	; while (i < argc)
	cmp 	ebx, edi
	je  	.args_done

	mov 	r13, [rsi + 8*rbx]

%ifndef NO_ARGFILES
	cmp 	byte [r13], '@'
	jne 	.after_argfile
	;; branch fallthrough
.process_argfile:
	lea 	rcx, [r13 + 1]
	call	process_argfile
	inc 	ebx		; i++
	jmp 	.arg_phase_2
.after_argfile:
%endif ; %ifndef NO_ARGFILES

	;; not an argument, so treat it as a file
	cmp 	byte [r13], '-'
	jne 	.process_file

	;; argument

%ifdef BARE_BONES
	;; inline the call to `process_arg` for -DBARE_BONES.
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel unknown_arg_str]
		mov 	r8,  r13
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_UNKN_ARG
	call	exit
%else ; %ifdef BARE_BONES
	call	process_arg
	inc 	ebx
	jmp 	.arg_phase_2	; continue;
%endif ; %ifdef BARE_BONES (else branch)

.process_file:
	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ; output argument
	mov 	rcx, r13		;; filename
%if %isdef(NO_ARG_I) && %isdef(NO_ARG_P)
	;; r12 is not set to 1 at the start of the program if it is not needed.
	mov 	edx, 1
%else
	mov 	edx, r12d		;; prev
%endif
	call	adler32_fname	; checksum = adler32_fname(filename, prev);

	%ifdef NO_FOLDER_CHECK
		cmp 	eax, 0xffffffff
	%else ; %ifdef NO_FOLDER_CHECK
		cmp 	eax, 0xfffffffe
		je  	.dir_passed ;; adler32_fnam returns `dword -2` if a directory is passed
	%endif ; %ifdef NO_FOLDER_CHECK (else branch)

	jb  	.file_found		;; adler32_fnam returns `dword -1` on file-not-found errors
	;; NOTE: the only other error code is -1, which is above -2 when treated as unsigend.

	;; the file was not readable or does not exist
	mov 	rcx, [rel %cond(%isdef(NO_ARG_E), pstderr, perrfile)]
	lea 	rdx, [rel invalid_line_fmt]
%if %isndef(NO_FORMAT) || %isndef(FMT_RAW_DEFAULT)
	;; the argument won't be used so it doesn't need to be passed.
	mov 	r8, r13
%endif
	call	fprintf		; fprintf(stderr, invalid_line_fmt, argv[i]);

	;; go to the next argument and keep iterating
	inc 	ebx
	jmp 	.arg_phase_2	; continue;
%ifndef NO_FOLDER_CHECK
.dir_passed:
	;; a directory was given instead of a file
	mov 	rcx, [rel %cond(%isdef(NO_ARG_E), pstderr, perrfile)]
	lea 	rdx, [rel dir_passed_line_fmt]
%if %isndef(NO_FORMAT) || %isndef(FMT_RAW_DEFAULT)
	;; with -DNO_FORMAT and -DFMT_RAW_DEFAULT, the argument doesn't need to be passed because it isn't used
	mov 	r8, r13
%endif
	call	fprintf		; fprintf(*perrfile, invalid_line_fmt, argv[i]);

	inc 	ebx
	jmp 	.arg_phase_2	; continue;
%endif ; %ifndef NO_FOLDER_CHECK

.file_found:
%ifndef NO_ARG_I
	test	r14b, INC_BIT_VAL	; if (flags & incremental_bit)
	cmovnz	r12d, eax			;     prev_cksm = cksm;
%endif

%ifdef NO_ARG_O
	lea 	rcx, [rel valid_line_fmt]
	%if %isndef(NO_FORMAT) || %isndef(FMT_RAW_DEFAULT) || %isdef(FMT_SWAP_ARGS)
		;; with -DNO_FORMAT and -DFMT_RAW_DEFAULT, the argument doesn't need to be passed because it isn't used
		;; if -DFMT_SWAP_ARGS is given, this is still required to prevent access violations.
		mov 	%cond(%isdef(FMT_SWAP_ARGS), rdx, r8), r13	;; filename
	%endif
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r8d, edx), eax	;; cksm
	call	printf		; printf(valid_line_fmt, checksum, filename) // or with swapped args
%else
	mov 	rcx, [rel poutfile]
	lea 	rdx, [rel valid_line_fmt]
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r8, r9), r13	;; filename
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r9d, r8d), eax	;; cksm
	call	fprintf		; fprintf(*poutfile, valid_line_fmt, checksum, filename); // or with swapped args
%endif ; %ifdef NO_ARG_O (else branch)

	inc 	ebx
	jmp 	.arg_phase_2	; continue;
.args_done:
%ifndef NO_ARGFILES
	cmp 	byte [rel argfile_depth], 0
	je  	.done

	;; go back to parse_argfiles if the argfile depth is not 0
	;; skip the warning stuff and also use ret instead of exit

	;; no return value
	add 	rsp, main_stack_space
	ret
.done:
%endif ; %ifndef NO_ARGFILES

%ifndef NO_WARN_UNUSED
	;; NOTE: input source arguments are a subset of output arguments.
	;;       output arguments encompass anything that gives output to stdout or stderr.

	;; NOTE: if the pipe was given and no other sources are given, the pipe happens last.
	;;      this means that no warning should be given. (this also requires that -! was not given)
	test	r14b, PIPE_BIT_VAL
	jz  	.possibly_warn_unused

	test	r14b, MAN_BIT_VAL
	jz  	.actually_done

	;; branch fallthrough
.possibly_warn_unused:
	mov 	ecx, -1
	cmp 	r15d, ecx			;; check for the sentinel value
	je  	.no_output_args		;; no output arguments were given if it is still the sentinel value.

	dec 	ebx

	sub 	ebx, r15d	;; the result of this is always 0 or positive
	jnz 	.warn_unused

	jmp 	.actually_done
.no_output_args:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unused_warning_str]
	mov 	r8d, ebx
	call	fprintf

	mov 	r15d, ebx
	xor 	ebx, ebx

	jmp 	.warn_unused@loop
.warn_unused:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unused_warning_str]
	mov 	r8d, ebx
	call	fprintf

	inc 	r15d
	add 	ebx, r15d		;; counteract the subraction from before.
	xchg	ebx, r15d
.warn_unused@loop:
	cmp 	ebx, r15d			; while (i < argc) {
	je  	.warn_unused@done

	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unused_arg_str]
	mov 	r8, qword [rsi + 8*rbx]
	call	fprintf				;     fprintf(stderr, " %s", argv[i]);

	inc 	ebx
	jmp 	.warn_unused@loop	; }
.warn_unused@done:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel ansi_clear_str]
	call	fprintf			; fprintf(stderr, "\e[0m");
.actually_done:
%endif ; %ifndef NO_WARN_UNUSED

%ifdef BARE_BONES
	xor 	eax, eax
	add 	rsp, main_stack_space
	ret
%else
	;; explicitly call `exit(0)` so it will close open files.
	xor 	ecx, ecx
	call	exit
%endif

;; `exit(0)` is never required for `.help` or `.version` because if they are given, no files are opened
;; and the buffer is already zeroed on startup, so it doesn't need to be re-zeroed.
;; the only consideration are the pointers to stdin, stderr, and stdout, but those don't matter that much.

;; these don't need to be `exit(0)` because `-e` and `-o` can't happen before the first argument.
;; and they don't require `fprintf` either for the same reason.
%ifndef NO_ARG_H
.help:
	lea 	rcx, [rel version_str]
	call	puts

	lea 	rcx, [rel help_str]
	call	puts

	xor 	eax, eax
	add 	rsp, main_stack_space
	ret
%endif

%ifndef NO_ARG_V
.version:
	lea 	rcx, [rel version_str]
	call	puts

	xor 	eax, eax
	add 	rsp, main_stack_space
	ret
%endif

%if %isndef(NO_PIPE)
;; currently only used from branches that only exist if pipeline operations exist
.internal_error:
%ifndef NO_FATAL_MESSAGES
	;; assume the error code was already given in r8b.
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel internal_error_str]
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_INTERNAL
	call	exit
%endif ; %if %isndef(NO_PIPE)

%endif ;; MAIN_NASM
