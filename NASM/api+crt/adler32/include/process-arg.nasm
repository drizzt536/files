%ifndef PROCESS_ARG_NASM
%define PROCESS_ARG_NASM

;; this has shorter total opcodes than `jmp near .done` and is faster. and it would be
;; really difficult to make each `jmp .done` be a jump short, and you can't guarantee
;; that any given return location will exist in any build. and if you use a single
;; `.done` point, it will require jump near in most locations.
%macro process_arg~ret 0
	; inc 	ebx
	leave
	ret
%endm

;; process_arg~test_short character
%macro process_arg~test_short 1
	cmp 	cx, %strcat(%1, `\0`)
	je  	.arg_match_%tok(%1)
%endm

; process_arg~test_long string_label
%macro process_arg~test_long 1
	mov 	rcx, r13
	lea 	rdx, [rel %1]
	call	streq
	je  	.arg_match_%tok(%substr(%str(%1), 1, 1))
%endm

;; Variables:
	;; i      = ebx
	;; argc   = edi
	;; argv   = rsi
	;; prev   = r12d
	;; arg[i] = r13
	;; flags  = r14
%ifndef BARE_BONES
	;; with -DBARE_BONES, this function is inlined
process_arg: ; void process_arg(register char *str asm("r13"));
	;; this function has side effects and doesn't follow the ABI
	;; assume the argument starts with '-'
	;; assume `mov r13, [rsi + 8*rbx]` before this is called

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	;; NOTE: for -s and -x, `-` as the argument is treated as if that is the actual data.

	;; if -DBARE_BONES is given, execution is guaranteed to end up in `.unknown_argument` anyway,
	;; so the comparison and value storage is not required.

	;; `-` means to process the pipe. but only if the pipe is enabled.
	cmp 	byte [r13 + 1], `\0`
	je  	%cond(%isdef(NO_PIPE), .unknown_argument, .pipe_arg)

	mov 	cx, word [r13 + 1] ;; next two characters after the '-'.
%endif ;; BARE_BONES

%ifndef NO_LONG_ARGS
	cmp 	byte [r13 + 2], `\0`
	jne 	.long_args
%endif

	;; TODO: consider using a binary search instead of a linear search for these

	;; the arguments are sorted by commonality, based on guessing.
	%cond(%isdef(NO_ARG_I),,		process_arg~test_short		'i')
	%cond(%isdef(NO_ARG_R),,		process_arg~test_short		'r')
	%cond(%isdef(NO_ARG_S),,		process_arg~test_short		's')
	%cond(%isdef(NO_ARG_X),,		process_arg~test_short		'x')
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_short		'u')
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_short		'd')
	%cond(%isdef(NO_ARG_P),,		process_arg~test_short		'p')
	%cond(%isdef(NO_ARG_C),,		process_arg~test_short		'c')
	%cond(%isdef(NO_ARG_L),,		process_arg~test_short		'l')
	%cond(%isdef(NO_ARG_F),,		process_arg~test_short		'f')
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_short		'D')
	%cond(%isdef(NO_FORMAT),,		process_arg~test_short		'F')
	%cond(%isdef(NO_ARG_O),,		process_arg~test_short		'o')
	%cond(%isdef(NO_ARG_E),,		process_arg~test_short		'e')
	%cond(%isdef(NO_ARG_V),,		process_arg~test_short		'v')
	%cond(%isdef(NO_ARG_H),,		process_arg~test_short		'h')
	%cond(%isdef(NO_ARG_H),,		process_arg~test_short		'?')

%ifndef NO_PIPE
	cmp 	cx, `!\0`
	je  	.arg_match_man_pipe
%endif

	;; NOTE: the long tests need to be after all the short tests.
	;;       this is because `streq` will clobber `cx`.

%ifndef NO_LONG_ARGS
.long_args:
	%cond(%isdef(NO_ARG_I),,		process_arg~test_long		incremental_arg)	; -i
	%cond(%isdef(NO_ARG_R),,		process_arg~test_long		raw_arg)			; -r
	%cond(%isdef(NO_ARG_S),, 		process_arg~test_long		str_data_arg)		; -s
	%cond(%isdef(NO_ARG_X),, 		process_arg~test_long		xhex_data_arg)		; -x
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_long		ubackwards_arg)		; -u
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_long		dforwards_arg)		; -d
	%cond(%isdef(NO_ARG_P),,		process_arg~test_long		prev_arg)			; -p
	%cond(%isdef(NO_ARG_C),,		process_arg~test_long		combine_arg)		; -c
	%cond(%isdef(NO_ARG_L),,		process_arg~test_long		long_arg)			; -l
	%cond(%isdef(NO_ARG_F),,		process_arg~test_long		file_arg)			; -f
	%cond(%isdef(NO_DIRECTIONS),,	process_arg~test_long		Dreverse_arg)		; -D
	%cond(%isdef(NO_FORMAT),,		process_arg~test_long		Fformatswap_arg)	; -F
	%cond(%isdef(NO_ARG_O),,		process_arg~test_long		outfile_arg)		; -o
	%cond(%isdef(NO_ARG_E),,		process_arg~test_long		errfile_arg)		; -e

%ifndef NO_PIPE
	mov 	rcx, r13
	lea 	rdx, [rel manual_pipe_arg]
	call	streq
	je  	.arg_match_manual_pipe
%endif ; %ifndef NO_PIPE
%endif ; %ifndef NO_LONG_ARGS

%ifndef NO_ARG_H
	mov 	rcx, r13
	lea 	rdx, [rel help_arg]
	call	streq
	je  	.arg_match_help
%endif ; %ifndef NO_ARG_H

%ifndef NO_ARG_V
	mov 	rcx, r13
	lea 	rdx, [rel ver_arg]
	call	streq
	je  	.arg_match_version
%endif ; %ifndef NO_ARG_H

	;; no more arguments to test against; unknown argument
	;; branch fallthrough
%ifndef BARE_BONES

.unknown_argument:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unknown_arg_str]
	mov 	r8, r13
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_UNKN_ARG
	call	exit
%endif ; %ifndef BARE_BONES

%ifndef NO_ARG_C
.arg_match_c:
	inc 	ebx
	cmp 	ebx, edi					; if (i == argc)
	je  	.arg_match_c@no_args		;     goto arg_match_c_no_args;

	mov 	rcx, qword [rsi + 8*rbx]	;; rcx = argv[i];
	mov 	r13, rcx

	cmp 	byte [rcx], `\0`
	je  	.arg_match_c@invalid_arg1	; empty string

%ifndef NO_PIPE
	cmp 	word [rcx], `-\0`
	jne 	.arg_match_c@parse_arg1
	; `-c - *`

	test	r14b, PIPE_BIT_VAL		; if (pipe not passed)
	jz  	.arg_match_p@no_pipe	;     throw an error;

	call	pipe_read_hex32
	mov 	rcx, rax				;; rcx = scratch_buffer
%endif ; %ifndef NO_PIPE
.arg_match_c@parse_arg1:
	call	hex_to_u32				;; convert string to uint32_t

	;; make sure the hex value is in the correct range
	cmp 	ax, BASE - 1
	ja  	.arg_match_c@invalid_arg1

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.arg_match_c@invalid_arg1

	mov 	r13d, eax	;; store CKSM2 in r13 because its value doesn't matter anymore.

	inc 	ebx
	cmp 	ebx, edi				; if (i == argc)
	je  	.arg_match_c@one_arg	;     goto arg_match_c_one_arg;
.arg_match_c@check_arg2:
	mov 	rcx, [rsi + 8*rbx]

%ifndef NO_PIPE
	cmp 	byte [rcx], `\0`
	je  	.arg_match_c@parse_arg2@normal	;; empty string. _strtoui64 will return 0.

	cmp 	word [rcx], `-\0`
	jne 	.arg_match_c@parse_arg2@normal

	;; parse the value from the pipeline
.arg_match_c@parse_arg2@pipe:
	call	pipe_read_u64

	jmp 	.arg_match_c@combine
%endif
.arg_match_c@parse_arg2@normal:
	xor 	edx, edx	;; I don't care about the pointer to the end of the string.
	mov 	r8d, 10		;; base 10
	call	_strtoui64	;; rax = len2

	;; TODO: maybe manually handle errors or something? Right now, no error checking happens,
	;;       it just passes the value directly into `adler32_combine`.

.arg_match_c@combine:
	mov 	ecx, r12d	;; cksm1 = prev_cksm
	mov 	edx, r13d	;; cksm2 = hex_to_u32(first argument)
	mov 	r8, rax		;; len2 = _strtoui64(second argument)
	call	adler32_combine

%ifndef NO_ARG_I
	test	r14b, INC_BIT_VAL	; if (flags & incrememtal_bit)
	cmovnz	r12d, eax			;     prev_cksm = checksum;
%endif

%ifdef NO_ARG_O
	lea 	rcx, [rel valid_line_fmt]
	lea 	%cond(%isdef(FMT_SWAP_ARGS), rdx, r8), [rel comb_filename_str]
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r8d, edx), eax
	call	printf		; printf(valid_line_fmt, checksum, "[COMBINE]") // or with swapped args
%else
	mov 	rcx, [rel poutfile]
	lea 	rdx, [rel valid_line_fmt]
	lea 	%cond(%isdef(FMT_SWAP_ARGS), r8, r9), [rel comb_filename_str]
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r9d, r8d), eax
	call	fprintf		; fprintf(*poutfile, valid_line_fmt, checksum, "[COMBINE]") // or with swapped args
%endif ; %ifdef NO_ARG_O (else branch)

	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ; output argument

	process_arg~ret
.arg_match_c@no_args:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_no_args_str]
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_CNOVAL
	call	exit
.arg_match_c@one_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_one_arg_str]
	mov 	r8, r13
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_C1VAL
	call	exit
.arg_match_c@invalid_arg1:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_invalid_arg_str]
	lea 	r8, [rel first_str]
	mov 	r9, r13
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_CINVAL1
	call	exit
%if 0
;; currently unused
;; TODO: use this.
.arg_match_c@invalid_arg2:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_invalid_arg_str]
	lea 	r8, [rel second_str]
	mov 	r9, r13
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_CINVAL2
	call	exit
%endif ; %if 0
%endif ; %ifndef NO_ARG_C

%ifndef NO_DIRECTIONS
.arg_match_u:
	test	r14b, DIR_BIT_VAL	; if (undo_bit_active == 0)
	jz  	.arg_match_D		;     switch_directions();

	process_arg~ret				; return;
.arg_match_d:
	;; the `jz` here is always a short jump because `.arg_match_D@ret` is less than 128 bytes away
	test	r14b, DIR_BIT_VAL	; if (undo_bit_active == 0)
	jz  	.arg_match_D@ret	;     return;
	;; branch fallthrough		; else switch_directions();
.arg_match_D:
	xor 	r14b, DIR_BIT_VAL
.arg_match_D@ret:
	process_arg~ret
%endif ; %ifndef NO_DIRECTIONS

%ifndef NO_ARG_I
.arg_match_i:
	xor 	r14b, INC_BIT_VAL

	process_arg~ret
%endif

%ifndef NO_FORMAT
;; all the branches have to exist unless -F is disabled too.

.arg_match_F:
%ifdef FMT_SWAP_ARGS
	;; if the filename is ignored (%.s), we are in raw mode.
	cmp 	byte [rel valid_line_fmt + FMT_OFFSET_VALID], '.'
%else
	;; if the string ends, it is in raw formatting.
	cmp 	word [rel valid_line_fmt + FMT_OFFSET_VALID], `\n\0`
%endif ; %ifdef FMT_SWAP_ARGS (else branch)
	je  	.arg_match_l
	;; branch fallthrough

.arg_match_r:
	;; make the first argument ignored

;; this implementation is beyond disgusting, but I don't really want to have to touch it, and I
;; don't even know if I can make it better without removing some of the optimizations/config options.
;; update: I don't even remember how this works anymore, so I think this is here to stay.

%ifdef FMT_SWAP_ARGS
	%if %strlen(DELIM) == 0
		;; %0s -> %.s
		mov 	byte [rel valid_line_fmt + FMT_OFFSET_VALID], '.'
		mov 	byte [rel invalid_line_fmt + FMT_OFFSET_INVALID], '.'
		%ifndef NO_FOLDER_CHECK
			mov 	byte [rel dir_passed_line_fmt + FMT_OFFSET_INVALID], '.'
		%endif ; %ifndef NO_FOLDER_CHECK
	%else ; %if %strlen(DELIM) == 0
		mov 	dword [rel valid_line_fmt + FMT_OFFSET_VALID + 0], %substr(RAWFMT_STR_VALID, FMT_OFFSET_VALID + 1, 4)
		mov 	dword [rel valid_line_fmt + FMT_OFFSET_VALID + 4], %substr(RAWFMT_STR_VALID, FMT_OFFSET_VALID + 5, 4)

		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 0], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 4)
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 4], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 5, 4)
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 8], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 9, 4)
		%ifndef NO_COLOR_ERROR
			mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 12], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 13, 4)
		%endif

		%ifndef NO_FOLDER_CHECK
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 0], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 4)
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 4], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 5, 4)
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 8], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 9, 4)
			%ifndef NO_COLOR_ERROR
				mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 12], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 13, 4)
			%endif ; %ifndef NO_COLOR_ERROR
		%endif ; %ifndef NO_FOLDER_CHECK
	%endif ; %if %strlen(DELIM) == 0 (else branch)
%else ; %ifdef FMT_SWAP_ARGS
	mov 	word [rel valid_line_fmt + FMT_OFFSET_VALID], %substr(RAWFMT_STR_VALID, FMT_OFFSET_VALID + 1, 2)

	%ifdef NO_COLOR_ERROR
		mov 	word [rel invalid_line_fmt + FMT_OFFSET_INVALID], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 2)
		%ifndef NO_FOLDER_CHECK
			mov 	word [rel dir_passed_line_fmt + FMT_OFFSET_INVALID], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 2)
		%endif ; %ifndef NO_FOLDER_CHECK
	%else ; %ifdef NO_COLOR_ERROR
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 0], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 4)
		mov 	word  [rel invalid_line_fmt + FMT_OFFSET_INVALID + 4], %substr(RAWFMT_STR_ABSENT, FMT_OFFSET_INVALID + 5, 2)

		%ifndef NO_FOLDER_CHECK
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 0], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 4)
			mov 	word  [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 4], %substr(RAWFMT_STR_FOLDER, FMT_OFFSET_INVALID + 5, 2)
		%endif ; %ifndef NO_FOLDER_CHECK
	%endif ; %ifdef NO_COLOR_ERROR (else branch)
%endif ; %ifdef FMT_SWAP_ARGS (else branch)

	process_arg~ret
.arg_match_l:
%ifdef FMT_SWAP_ARGS
	;; it has to move the entire checksum formatting back and forth, and swap between %0s and %.s,
	;; and add back the delimiter, so it has to be a full qword move (two dword moves is shorter).

	%if %strlen(DELIM) == 0
		;; the `mov qword` way works wit this too, but it isn't required.
		mov 	byte [rel valid_line_fmt + FMT_OFFSET_VALID], '0'
		mov 	byte [rel invalid_line_fmt + FMT_OFFSET_INVALID], '0'
		%ifndef NO_FOLDER_CHECK
			mov 	byte [rel dir_passed_line_fmt + FMT_OFFSET_INVALID], '0'
		%endif ; %ifndef NO_FOLDER_CHECK
	%else ; %if %strlen(DELIM) == 0
		;; `mov m64, imm64` doesn't exist, and `mov r64, imm64` is 10 bytes long, so I am using dwords.
		;; this is just the inverse operation of what `-r` does.

		mov 	dword [rel valid_line_fmt + FMT_OFFSET_VALID + 0], %substr(LONGFMT_STR_VALID, FMT_OFFSET_VALID + 1, 4)
		mov 	dword [rel valid_line_fmt + FMT_OFFSET_VALID + 4], %substr(LONGFMT_STR_VALID, FMT_OFFSET_VALID + 5, 4)

		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 0], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 4)
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 4], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 5, 4)
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 8], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 9, 4)
		%ifndef NO_COLOR_ERROR
			mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 12], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 13, 4)
		%endif

		%ifndef NO_FOLDER_CHECK
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 0], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 4)
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 4], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 5, 4)
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 8], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 9, 4)
			%ifndef NO_COLOR_ERROR
				mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 12], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 13, 4)
			%endif ; %ifndef NO_COLOR_ERROR
		%endif ; %ifndef NO_FOLDER_CHECK
	%endif ; %if %strlen(DELIM) == 0 (else branch)
%else ; %ifdef FMT_SWAP_ARGS
	;; the valid one only has to replace `\n\0`, but the invalid ones have to replace `\e[0m\n\0`
	mov 	word [rel valid_line_fmt + FMT_OFFSET_VALID], %substr(LONGFMT_STR_VALID, FMT_OFFSET_VALID + 1, 2)

	%ifdef NO_COLOR_ERROR
		mov 	word [rel invalid_line_fmt + FMT_OFFSET_INVALID], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 2)
		%ifndef NO_FOLDER_CHECK
			mov 	word [rel dir_passed_line_fmt + FMT_OFFSET_INVALID], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 2)
		%endif ; %ifndef NO_FOLDER_CHECK
	%else ; %ifdef NO_COLOR_ERROR
		mov 	dword [rel invalid_line_fmt + FMT_OFFSET_INVALID + 0], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 1, 4)
		mov 	word  [rel invalid_line_fmt + FMT_OFFSET_INVALID + 4], %substr(LONGFMT_STR_ABSENT, FMT_OFFSET_INVALID + 5, 2)

		%ifndef NO_FOLDER_CHECK
			mov 	dword [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 0], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 1, 4)
			mov 	word  [rel dir_passed_line_fmt + FMT_OFFSET_INVALID + 4], %substr(LONGFMT_STR_FOLDER, FMT_OFFSET_INVALID + 5, 2)
		%endif ; %ifndef NO_FOLDER_CHECK
	%endif ; %ifdef NO_COLOR_ERROR (else branch)
%endif ; %ifdef FMT_SWAP_ARGS (else branch)

	process_arg~ret
%endif ; %ifndef NO_FORMAT

%ifndef NO_ARG_X
.arg_match_x@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 'x'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_XNOVAL
	call	exit
.arg_match_x:
	inc 	ebx					; i++;
	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ;; output argument

	cmp 	ebx, edi			; if (i == argc)
	je  	.arg_match_x@no_arg	;     goto arg_match_x_no_arg;

	mov 	rcx, [rsi + 8*rbx]	;; argv[i]
	mov 	edx, r12d			;; prev_cksm
	call	adler32_hex

	; only do a jump if .arg_match_s actually exists.
	; otherwise there is nothing to jump over.
	%cond(%isdef(NO_ARG_S),, jmp 	.print_im_result)
	;; branch fallthrough (sometimes)
%endif ; %ifndef NO_ARG_X
%ifndef NO_ARG_S
.arg_match_s:
	inc 	ebx					; i++
	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ;; output argument

	cmp 	ebx, edi			; if (i == argc)
	je  	.arg_match_s@no_arg	;     goto arg_match_s_no_arg;

	mov 	rcx, [rsi + 8*rbx]	;; argv[i]
	mov 	edx, r12d			;; prev_cksm
	call	adler32_str
	;; branch fallthrough
%endif ; %ifndef NO_ARG_S
%ifndef NO_INLINE_INPUT ;; include if either -s or -x exist
.print_im_result:
	;; print immediate result
%ifndef NO_ARG_I
	test	r14b, INC_BIT_VAL	; if (flags & incremental_bit)
	cmovnz	r12d, eax			;     prev_cksm = cksm;
%endif

	;; do printing stuff
%ifdef NO_ARG_O
	lea 	rcx, [rel valid_line_fmt]	; NOTE: it will always be valid.
	lea 	%cond(%isdef(FMT_SWAP_ARGS), rdx, r8), [rel string_filename_str]	; filename
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r8d, edx), eax							; cksm
	call	printf		; printf(valid_line_fmt, checksum, filename)
%else
	mov 	rcx, [rel poutfile]
	lea 	rdx, [rel valid_line_fmt]	; NOTE: it will always be valid.
	lea 	%cond(%isdef(FMT_SWAP_ARGS), r8, r9), [rel string_filename_str]		; filename
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r9d, r8d), eax							; cksm
	call	fprintf		; fprintf(*poutfile, valid_line_fmt, checksum, filename)
%endif ; %ifdef NO_ARG_O (else branch)

	process_arg~ret
%endif ; %ifndef NO_INLINE_INPUT
%ifndef NO_ARG_S
.arg_match_s@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 's'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_SNOVAL
	call	exit
%endif ; %ifndef NO_ARG_S

%ifndef NO_ARG_O
.arg_match_o:
	inc 	ebx					; i++

	cmp 	ebx, edi			; if (i == argc)
	je  	.arg_match_o@no_arg	;     goto arg_match_o_no_arg;

	mov 	rcx, [rsi + 8*rbx]	; argv[i]
	mov 	r13, rcx			; save the filename for `fopen`

	cmp 	byte [rcx], `\0`
	je  	.arg_match_o@invalid_file

	cmp 	word [rcx], `-\0`
	jne 	.arg_match_o@test_filename
	;; branch fallthrough for `-o -`
.arg_match_o@stdout: ;; unused label. only for clarity
	;; pretend `fopen` returned `stdout`.
	mov 	rax, [rel pstdout]		; FILE *fp = *pstdout;
	jmp 	.arg_match_o@close_previous
.arg_match_o@test_filename:
%ifndef NO_FOLDER_CHECK
	call	GetFileAttributesA
	cmp 	eax, 0xffffffff			; if (attrs == INVALID_FILE_ATTRIBUTES)
	je  	.arg_match_o@try_open	;     goto try_open;

	test	al, 16 ; FILE_ATTRIBUTE_DIRECTORY
	jnz 	.arg_match_o@directory_passed
%endif
.arg_match_o@try_open:
	mov 	rcx, r13
	lea 	rdx, [rel file_a_mode]
	call	fopen

	test	rax, rax
	jz  	.arg_match_o@invalid_file
.arg_match_o@close_previous:
	;; inlined function
	push	rdi	; fp
	sub 	rsp, 32 + 8	; shadow space + alignment

	mov 	rdi, rax	; FILE *fp = fopen(filepath, "a");

	mov 	rcx, [rel poutfile]
	cmp 	rcx, [rel pstdout]
	je  	.arg_match_o@update

	call	fclose	; fclose(*poutfile)
.arg_match_o@update:
	mov 	[rel poutfile], rdi	; *poutfile = fp;

	add 	rsp, 32 + 8
	pop 	rdi
	process_arg~ret
.arg_match_o@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 'o'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_ONOVAL
	call	exit
%ifndef NO_FOLDER_CHECK
.arg_match_o@directory_passed:
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel option_file_is_directory_str]
		mov 	r8b, 'o'
		mov 	r9, r13 ; filename
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_OFOLDER
	call	exit
%endif ; %ifndef NO_FOLDER_CHECK
.arg_match_o@invalid_file:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_non_writable_file_str]
	mov 	r8b, 'o'
	mov 	r9, r13 ; filename
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_ONOPERM
	call	exit
%endif ; %ifndef NO_ARG_O

%ifndef NO_ARG_E
.arg_match_e:
	inc 	ebx					; i++

	cmp 	ebx, edi			; if (i == argc)
	je  	.arg_match_e@no_arg	;     goto arg_match_e_no_arg;

	mov 	rcx, [rsi + 8*rbx]	; argv[i]
	mov 	r13, rcx			; save the filename for `fopen`

	cmp 	byte [rcx], `\0`
	je  	.arg_match_e@invalid_file

	cmp 	word [rcx], `-\0`
	jne 	.arg_match_e@test_filename
	;; branch fallthrough for `-e -`
.arg_match_e@stderr: ;; unused label. only for clarity
	;; pretend `fopen` returned `stderr`.
	mov 	rax, [rel pstderr]		; FILE *fp = *pstderr;
	jmp 	.arg_match_e@close_previous
.arg_match_e@test_filename:
%ifndef NO_FOLDER_CHECK
	call	GetFileAttributesA
	cmp 	eax, 0xffffffff			; if (attrs == INVALID_FILE_ATTRIBUTES)
	je  	.arg_match_e@try_open	;     goto try_open;

	test	al, 16 ; FILE_ATTRIBUTE_DIRECTORY
	jnz 	.arg_match_e@directory_passed
%endif
.arg_match_e@try_open:
	mov 	rcx, r13
	lea 	rdx, [rel file_a_mode]
	call	fopen

	test	rax, rax
	jz  	.arg_match_e@invalid_file
.arg_match_e@close_previous:
	;; inlined function
	push	rdi	; fp
	sub 	rsp, 32 + 8	; shadow space + alignment

	mov 	rdi, rax	; FILE *fp = fopen(filepath, "a");

	mov 	rcx, [rel perrfile]
	cmp 	rcx, [rel pstderr]
	je  	.arg_match_e@update

	call	fclose	; fclose(*perrfile)
.arg_match_e@update:
	mov 	[rel perrfile], rdi	; *perrfile = fp;

	add 	rsp, 32 + 8
	pop 	rdi
	process_arg~ret
.arg_match_e@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 'e'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_ENOVAL
	call	exit
%ifndef NO_FOLDER_CHECK
.arg_match_e@directory_passed:
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel option_file_is_directory_str]
		mov 	r8b, 'e'
		mov 	r9, r13 ; filename
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_EFOLDER
	call	exit
%endif ; %ifndef NO_FOLDER_CHECK
.arg_match_e@invalid_file:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_non_writable_file_str]
	mov 	r8b, 'e'
	mov 	r9, r13 ; filename
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_ENOPERM
	call	exit
%endif ; %ifndef NO_ARG_E

%ifndef NO_ARG_P
.arg_match_p:
	inc 	ebx

	cmp 	ebx, edi			;; if (i == argc)
	je  	.arg_match_p@no_arg	;;     goto arg_match_p_no_arg;

	mov 	rcx, [rsi + 8*rbx]	;; rcx = argv[i];
	mov 	r13, rcx			;; save it in case of errors.

	cmp 	byte [rcx], `\0`
	je  	.arg_match_p@invalid_arg ; empty string

%ifndef NO_PIPE
	cmp 	word [rcx], `-\0`
	jne 	.arg_match_p@parse_argument
	; `-p -`

	test	r14b, PIPE_BIT_VAL		; if (pipe not passed)
	jz  	.arg_match_p@no_pipe	;     throw an error;

	call	pipe_read_hex32
	mov 	rcx, rax	; rcx = scratch_buffer
%endif ; %ifndef NO_PIPE
.arg_match_p@parse_argument:
	call	hex_to_u32	; convert string to uint32_t

	;; make sure the hex value is in the correct range
	cmp 	ax, BASE - 1
	ja  	.arg_match_p@invalid_arg

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.arg_match_p@invalid_arg

	mov 	r12d, eax	; prev = checksum

	process_arg~ret
.arg_match_p@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 'p'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_PNOVAL
	call	exit
.arg_match_p@invalid_arg:
%ifndef NO_FATAL_MESSAGES
	;; decide between `scratch_buffer` and `argv[i]` as the string.
	lea 	rax, [rel scratch_buffer]
	mov 	r8, r13

	test	r14b, PIPE_BIT_VAL
	cmovnz	r8, rax

	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_invalid_arg_str]
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_PINVAL
	call	exit
.arg_match_p@no_pipe:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_no_pipe_str]
	mov 	r8, r13
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_PNOPIPE
	call	exit
%endif ; %ifndef NO_ARG_P

%ifndef NO_ARG_F
.arg_match_f:
	inc 	ebx		; i++;
	;; don't worry about updating r15d.
	;; that is done in `mainCRTStartup.process_file`

	cmp 	ebx, edi
	je  	.arg_match_f@no_arg

	;; load the next argument into `r13` as `mainCRTStartup.process_file` expects.
	mov 	r13, [rsi + 8*rbx]

	;; return, but not to the call site.
	leave
	add 	rsp, 8	;; remove the return address from the stack
	jmp 	mainCRTStartup.process_file
.arg_match_f@no_arg:
%ifndef NO_FATAL_MESSAGES
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel option_no_arg_str]
	mov 	r8b, 'f'
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_FNOVAL
	call	exit
%endif ; %ifndef NO_ARG_F

%ifndef NO_PIPE
.pipe_arg:
	%cond(%isndef(NO_WARN_UNUSED), {mov r15d, ebx}) ; output argument
	call	process_pipe
	process_arg~ret
%endif ; %ifndef NO_PIPE

%if %isndef(NO_PIPE) || %isndef(NO_ARG_H) || %isndef(NO_ARG_V)
.arg_match_man_pipe:
.arg_match_h:
.arg_match_?:
.arg_match_v:
%ifndef NO_FATAL_MESSAGES
	mov 	r8b, cl
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel late_arg1_str]
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_LATE_ARG1
	call	exit

.arg_match_manual_pipe:
.arg_match_help:
.arg_match_version:
%ifndef NO_FATAL_MESSAGES
	mov 	byte [rel late_arg1_str_c], 's'
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel late_arg1_str]
	lea 	r8, [r13 + 1]
	call	fprintf
%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_LATE_ARG1
	call	exit
%endif ; %if %isndef(NO_PIPE) || %isndef(NO_ARG_H) || %isndef(NO_ARG_V)


%unmacro process_arg~ret 0
%unmacro process_arg~test_short 1
%unmacro process_arg~test_long 1

%endif ;; PROCESS_ARG_NASM
