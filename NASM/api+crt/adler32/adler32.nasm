;; `make adler32.exe` or `make adler32.o` or `make adler32.dll`

;; to compile as a standalone program, use the above command, or the following:
	;; nasm -fwin64 -Werror adler32.nasm -o adler32.o.tmp -DEFAULT
	;; ld adler32.o.tmp -lkernel32 -lshell32 -lucrtbase -s --gc-sections -o adler32.exe
	;; rm adler32.o.tmp

;; for the DLL form, do this instead of the previous command:
	;; nasm -fwin64 -Werror adler32.nasm -o adler32.o.tmp -DLL -DEFAULT
	;; ld adler32.o.tmp -lucrtbase -shared -s --gc-sections -o adler32.dll
	;; rm adler32.o.tmp

;; how to link into other programs:
	;; option 1 (DLL, link directly with the `.dll`):
		;; (use previous steps to get adler32.dll)
		;; gcc main -L. -ladler32 -o main

	;; option 2 (DLL, link with the `.a` file):
		;; (use previous steps to get adler32.dll)
		;; gendef adler32.dll
		;; dlltool -d adler32.def -l libadler32.a
		;; rm adler32.def
		;; gcc main.c -L. -ladler32 -o main
		;; (use the functions like normal)

	;; option 3 (statically link):
		;; nasm -fwin64 -Werror adler32.nasm -o adler32.o -DSTATIC -DEFAULT
		;; (you might also want `-DMSVCRT` too, depending on where you got GCC from)
		;; gcc main.c adler32.o -o main

;; TODO: give special exit messages and an exit code for -!, -h, and -v used after
;;       the first argument.
;; TODO: make -DLL API smoother:
;;       maybe make `adler32_hex` not update the buffer inline?
;;       add null pointer checks. these only matter in DLL mode
;;       inline `return -1` for `adler32_fname.invalid_file` if `-DNO_FOLDER_CHECK` is given.
;;       maybe use a non-ucrt strlen if -DLL_NO_FP -DNO_DIRECTIONS -DNO_FOLDER_CHECK?
;; TODO: try using SIMD for the forwards implementation. Currently, the code is faster than
;;       zlib's code, unless zlib's code is compiled with -O3 -march=native -ftree-vectorize,
;;       at which point they are about the same speed. SIMD could improve performance.
;;       (only tested with for adler32_buf_fw with <=16 GiB buffers)

%if __NASM_VERSION_ID__ < 2100000h
	;; for preprocessor functions.
	%fatal NASM 2.16.0 or higher is required to assemble this program.
%endif

;; turn on warnings for everything
[warning all]

;; these will just add unnecessary errors, so dont warn for theses.
[warning -reloc]

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; configuration macros ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;; formatting/internal configuration macros:
	;; NO_FATAL_MESSAGES (don't print messages on fatal errors, just exit)
	;; SCRATCH_BUF_LEN / BUF_LEN
	;; UNROLL_N / UNROLL (only unrolls the loop in forwards mode)
	;; DELIM / ELIM, SPACE_DELIM, TAB_DELIM, LF_DELIM, COLON_DELIM, COLON_SPACE_DELIM
	;; CKSM_UPPER (print the checksum in uppercase)
	;; FMT_SWAP_ARGS (put the filename before the checksum)
	;; FMT_RAW_DEFAULT (use raw formatting as the default. use -l or -F to change it)
	;; NO_COLOR (remove the color from all error printouts, fatal and non-fatal)
		;; NO_COLOR_FATAL (remove color from stuff like "unknown argument" errors)
		;; NO_COLOR_ERROR (remove color from missing file / directory printouts)
		;; NO_COLOR_WARNG (remove color from warnings)
	;; NO_ALIGN (don't align hot functions to 64-byte boundaries)
	;; MODE_UNDO_DEFAULT (use -u mode by default, disallowed if NO_DIRECTIONS is defined)
	;; NO_DOCS_EXIT_CODE_TABLE (remove just the exit code table from the documentation)
	;; NO_FOLDER_CHECK (collapse [FOLDER] errors into [MISSING])
	;; MSVCRT (use msvcrt.dll function names instead of ucrtbase.dll function names)
	;; ASCII_ONLY_DATA (assume the max byte value is 0x7e)

	;; DLL macros:
	;; DLL / LL / SHARED (implies -DNO_ALIGN, and removes features that only make sense in EXE mode)
	;; DLL_NO_ENTRY / LL_NO_ENTRY / SHARED_NO_ENTRY / STATIC (removes DllMain from the program)
	;; DLL_EXPORT_SUBIMPLS / LL_EXPORT_SUBIMPLS / SHARED_EXPORT_SUBIMPLS (export *_[bf]w implementations)
	;; DLL_NO_FP / LL_NO_FP / SHARED_NO_FP (remove adler32_fp* and adler32_fname)
	;; DLL_NO_FNAME / LL_NO_FNAME / SHARED_NO_FNAME (remove adler32_fname)
	;; STATIC_EXPORT_SUBIMPLS (alias to -DLL_NO_ENTRY -DLL_EXPORT_SUBIMPLS)
	;; NO_MEMZERO (remove adler32_memzero)

	;; hierarchy of feature-exclusion configuration macros:
	;; DEFAULT/EFAULT (default configuration)
		;; NO_COLOR_ERROR
		;; NO_LONG_ARGS
	;; BARE_BONES (default buffer size = 2 KiB, super aggressive function inlining)
		;; MINIMAL (default buffer size = 32 KiB)
			;; LEAN
				;; NO_ARGFILES
				;; NO_LONG_ARGS
				;; NO_INLINE_INPUT
					;; NO_ARG_S (-s)
					;; NO_ARG_X (-x)
				;; NO_DIRECTIONS (-d, -u, -D)
				;; NO_REDIRECTS
					;; NO_ARG_O (-o)
					;; NO_ARG_E (-e)
				;; NO_COLOR_ERROR
			;; NO_WARN_UNUSED
			;; NO_COLOR
			;; NO_ARG_C (-c)
			;; NO_ARG_H (completely remove doc string and --help arguments)
				;; NO_DOCS (replace the doc string with a simple message)
			;; NO_ARG_P (-p)
		;; NO_FORMAT (-F, removes implementation for runtime format mode switching)
			;; NO_ARG_R (-r, removes the option but not the underlying implementation)
			;; NO_ARG_L (-l, removes the option but not the underlying implementation)
		;; NO_PIPE (-, -!, and pipe input processing)
		;; NO_ARG_F (-f)
		;; NO_ARG_I (-i)
		;; NO_ARG_V (-v, requires -DNO_ARG_H to be given as well)

%include "include/config.nasm"

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; other macros ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
%assign MAJOR_VER	6
%assign MINOR_VER	0
%xdefine VERSION_STRING %strcat(%num(MAJOR_VER), '.', %num(MINOR_VER))
%assign BASE 65521

%define HEX_TO_U8_SKIP_PREFIX_CHECK	;; don't allow `0x` in between each byte in `-x HEXDATA`

%assign INC_BIT		0	;; 1 if incremental mode is on, 0 if it is off
%assign PIPE_BIT	1	;; 1 if the pipe is given, 0 if the pipe is not given.
%assign DIR_BIT		2	;; 1 if backwards, 0 if forwards
%assign MAN_BIT		3	;; 1 if `-!` is passed, 0 otherwise

%assign INC_BIT_VAL			1 << INC_BIT
%assign PIPE_BIT_VAL		1 << PIPE_BIT
%assign DIR_BIT_VAL			1 << DIR_BIT
%assign MAN_BIT_VAL			1 << MAN_BIT

;; exit codes:
%assign EXIT_SUCCESS		0	;; no errors
%assign EXIT_INTERNAL		1	;; miscellaneous/internal/mysterious/generic error.
%assign EXIT_UNKN_ARG		2	;; unknown/invalid argument
%assign EXIT_LATE_ARG1		3	;; first arg only flag (e.g. h,?,v,!) given after the first arg.
%assign EXIT_PNOVAL			4	;; `-p` with no value.
%assign EXIT_PINVAL			5	;; `-p` with invalid value.
%assign EXIT_PNOPIPE		6	;; `-p -` with no pipeline.
%assign EXIT_CNOVAL			7	;; `-c` with no value
%assign EXIT_C1VAL			8	;; `-c` with only one value.
%assign EXIT_CINVAL1		9	;; `-c` with invalid 1st value
%assign EXIT_CINVAL2		10	;; `-c` with invalid 2nd value
%assign EXIT_FNOVAL			11	;; `-f` with no value
%assign EXIT_UNOSEEK		12	;; `-u` with non-seekable file larger than one buffer.
%assign EXIT_SNOVAL			13	;; `-s` with no value.
%assign EXIT_XNOVAL			14	;; `-x` with no value.
%assign EXIT_XODDLEN		15	;; `-x` with an odd-length value.
%assign EXIT_XINVAL			16	;; `-x` with an invalid byte value.
%assign EXIT_ONOVAL			17	;; `-o` with no value.
%assign EXIT_OFOLDER		18	;; `-o` given a folder (invalid value).
%assign EXIT_ONOPERM		19	;; `-o` could not open (no permissions).
%assign EXIT_ENOVAL			20	;; `-e` with no value.
%assign EXIT_EFOLDER		21	;; `-e` given a folder (invalid value).
%assign EXIT_ENOPERM		22	;; `-e` could not open (no permissions).
%assign EXIT_ARGFILE_INVAL	23	;; `@argfile` could not be opened
%assign EXIT_ARGFILE_NOSEEK	24	;; `@argfile` is not seekable (this should basically never happen)
%assign EXIT_ARGFILE_FOLDER	25	;; `@argfile` is a folder and not a file
%assign EXIT_ARGFILE_SIZE	26	;; `@argfile` is too large, malloc returned NULL.
%assign EXIT_ARGFILE_DEPTH	27	;; `@argfile` call depth exceeded 255
%assign EXIT_NOTIMPL		(1 << 32) - 1 ;; generic not implemented. (dword -1)

;; exit code string padding. left pads to length 5, and then adds 3 spaces after it.
%xdefine spad~5spaces "     "
%define exitcode_spad(code) %strcat(%substr(spad~5spaces, 1 + %strlen(%num(code))), %num(code), "   ")

;; color macros
;; ANSI escape sequences.
%xdefine FATAL_RED		%cond(%isdef(NO_COLOR_FATAL), "", `\e[31m`)
%xdefine FATAL_CLEAR	%cond(%isdef(NO_COLOR_FATAL), "", `\e[0m`)

%xdefine ERROR_RED		%cond(%isdef(NO_COLOR_ERROR), "", `\e[31m`)
%xdefine ERROR_CLEAR	%cond(%isdef(NO_COLOR_ERROR), "", `\e[0m`)

%xdefine WARNING_ORANGE	%cond(%isdef(NO_COLOR_WARNG), "", `\e[38;5;172m`)
;; NOTE: WARNING_CLEAR doesn't need to exist.

%xdefine CKSM_X %cond(%isdef(CKSM_UPPER), "X", "x")

%ifdef MSVCRT
	;; no fread transformation
	;; no fclose transformation
	%define fseek		_fseeki64
	%define ftell		_ftelli64
	%define iob_func	__iob_func
%else
	%define fread		_fread_nolock
	%define fclose		_fclose_nolock
	%define fseek		_fseeki64_nolock
	%define ftell		_ftelli64_nolock
	%define iob_func	__acrt_iob_func
%endif

%include "include/data.nasm"

segment .text

%ifdifi
def compute_magic(n: int, y: int) -> tuple[int, int]:
	for extra in range(n + 1):
		s = n + extra
		m = -(-(1 << s) // y)
		k_lc = ((1 << n) - y) // y
		x1   = (k_lc + 1) * y - 1
		x2   = (1 << n) - 1

		if all(m * x < (x // y + 1) * (1 << s) for x in [x1, x2]):
			return (m, s)
%endif

%macro modbase_u64 1
	;; this won't work if the argument is either rax or rdx since it clobbers both of them.

	;; NOTE: x // 65521 = ((x*4223091239536077 >> 64) + x) >> 16
	;;       this comes from x // 65521 == x * 18450967164949087693 >> 80,
	;;       but that multiplier doesn't fit in 64 bits.
	;;       x % y == x - (x // y) * y
	mov 	rax, %1		; tmp = x;
	mov 	rdx, 000f00e10d2fc5cdh
	mul 	rdx			;; rdx:rax = rdx * rax.
	add 	rdx, %1		;; use rdx for an implicit `>> 64`.
	shr 	rdx, 16
	imul	rdx, BASE	; rdx = x % BASE;
	sub 	%1, rdx		; x -= x % BASE;
%endm

%macro modbase_u32 1
	;; this won't work if the argument is either eax or edx since it clobbers both of them.
	mov 	eax, %1		; tmp = x;
	mov 	edx, 80078071h
	mul 	edx			;; edx:eax = edx * eax.
	shr 	edx, 15
	imul	edx, BASE	;; edx = x % BASE;
	sub 	%1, edx		; x -= x % BASE;
%endm

%macro modbase_i64 2
	;; `modbase_i64 dividend, clobber`
	;; NOTE: (-x) % BASE == -(x % BASE)
	;; this clobbers rax, %2, and rdx.
	;; both arguments should be registers.
	;; neither argument should be rax or rdx, or this will not work.

	mov 	%2, %1
	neg 	%2		;; start out with the negated value

	test	%1, %1	;; un negate if the value isn't actually negative
	cmovns	%2, %1

	modbase_u64 %2

	;; NOTE: the {nf} on the NEG is required so it doesn't overwrite the flags.
	;;       CMOVS on the next line needs to see the flags from TEST.
%ifdef APX
	test	%1, %1
	mov 	%1, %2	;; move back the unsigned version
{nf}neg 	%2
	cmovs	%1, %2	;; move back the negated version if rbx was originally signed
%else
	test	%1, %1
	cmovns	%1, %2	;; move back the unsigned version
	neg 	%2
	test	%1, %1	;; this line is a bit sketch. I promise it works.
	cmovs	%1, %2	;; move back the negated version if rbx was originally signed
%endif ; APX
%endm

%macro debug_print_str 2
	pushfq
	push	rax
	push	rbx
	push	rcx
	push	rdx
	push	r8
	push	r9
	push	r10
	push	r11

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32
	and 	rsp, -16

	jmp 	%%call ;; skip over the inlined message string

%%msg: db %1
%%call:
	mov 	rdx, %2
	lea 	rcx, [rel %%msg]
	call 	printf

	leave
	pop 	r11
	pop 	r10
	pop 	r9
	pop 	r8
	pop 	rdx
	pop 	rcx
	pop 	rbx
	pop 	rax
	popfq
%endm

%macro debug_print_str 1
	debug_print_str `%s\n\0`, %1
%endm

%macro debug_print_reg64 1
	debug_print_str `x = %zu\n\0`, %1
%endm

%ifdef DLL
	;; for each of the ones that doesn't exist, it just doesn't globalize it.
	global adler32_combine, adler32_str, adler32_hex, adler32_fname, adler32_fp, adler32_buf
	global adler32_reverse, adler32_direction, adler32_version, adler32_memzero

	%cond(%isdef(DLL_EXPORT_SUBIMPLS), {global adler32_fp_fw, adler32_fp_bw, adler32_buf_fw, adler32_buf_bw})
	global DllMain
%else
	global mainCRTStartup
%endif

%cond(%isndef(DLL_NO_FNAME), {extern fopen, fclose}) ;; ucrtbase.dll
%cond(%isndef(DLL_NO_FP), {extern fread}) ;; ucrtbase.dll

%ifndef NO_INLINE_INPUT
	;; only used in adler32_str and adler32_hex.
	;; ucrtbase.dll
	extern strlen
%endif

%if %isndef(NO_DIRECTIONS) || %isndef(NO_ARGFILES)
	;; only used in `adler32_fp_bw`; only import if directions are enabled.
	;; ucrtbase.dll
	extern fseek, ftell
%endif

%ifndef NO_ARGFILES
	;; kernel32.dll
	extern LocalAlloc, LocalFree
%endif

%ifndef NO_FOLDER_CHECK
	;; used for `-o`, `-e`, and in `adler32_fname`. disabled if -DNO_FOLDER_CHECK is given.
	;; kernel32.dll
	extern GetFileAttributesA
%endif

%ifndef DLL
	;; kernel32.dll
	extern GetCommandLineW

	;; shell32.dll
	extern CommandLineToArgvW

	;; ucrtbase.dll
	extern fprintf, puts, iob_func, exit

	%ifdef NO_ARG_O
		;; only used if `-o` is disabled
		;; ucrtbase.dll
		extern printf
	%endif

	%ifndef NO_ARG_C
		;; only used in parsing for `-c`.
		;; ucrtbase.dll
		extern _strtoui64
	%endif

	%ifndef NO_PIPE
		;; DLL mode coincidentally doesn't have any of these.

		;; only used in `pipeline_available`; only import if pipes are enabled.
		;; kernel32.dll
		extern GetStdHandle, GetFileType, PeekNamedPipe

		;; only used in `pipe_read_hex32`.
		;; ucrtbase.dll
		extern getchar, isxdigit

		;; only used in `pipe_read_u64`
		;; ucrtbase.dll
		extern scanf

		;; used in `mainCRTStartup` to set stdin/pipeline to binary mode.
		;; ucrtbase.dll
		extern _setmode
	%endif ; %ifndef NO_PIPE


	%ifdef BARE_BONES
		%define SETUP_ARGC_ARGV_MACRO_ONLY
	%endif

	;; this is only used in `mainCRTStartup`, which doesn't exit in DLL mode.
	%include "../../winapi/setup_argc_argv.nasm"

	%if %isndef(NO_ARG_V) || %isndef(NO_ARG_H) || %isndef(NO_LONG_ARGS)
		;; streq can be disabled if NO_ARG_V, NO_ARG_H, and NO_LONG_ARGS are all given
		;; include it if at least one of them is not passed
		;; in DLL mode, these are not required.
		%include "../../libasm/callconv.mac"		;; required for streq.nasm
		%include "../../libasm/streq.nasm"			;; for process_arg and mainCRTStartup
	%endif

	;; in DLL mode, this function is not required.
	%if %isndef(NO_ARG_C) || %isndef(NO_ARG_P)
		;; only include hex_to_u32 if at least one of -c or -p exists.
		%include "../../libasm/hex_to_u32.nasm"	;; for process_arg (-c and -p)
	%endif
%endif ; %ifndef DLL

%ifndef NO_ARG_X
	%include "../../libasm/hex_to_u8.nasm"	;; for adler32_hex (-x)
%endif

%ifndef NO_PIPE
pipeline_available:
	;; there might be a way to do this with libc functions.
	push	rbx	; stdin
	sub 	rsp, 32 + 8*2		;; shadow space + 2 qwords

	mov 	ecx, -10
	call	GetStdHandle

	mov 	rbx, rax

	mov 	rcx, rax
	call	GetFileType

	cmp 	eax, 3				;; FILE_TYPE_PIPE
	jne 	.no_input

	mov 	rcx, rbx			;; arg 1. stdin
	xor 	edx, edx			;; arg 2
	xor 	r8d, r8d			;; arg 3
	xor 	r9d, r9d			;; arg 4
	mov 	qword [rsp + 32], 0	;; arg 5. put on the stack above the shadow space
	mov 	qword [rsp + 40], 0	;; arg 6
	call	PeekNamedPipe

	test	eax, eax
	jnz 	.has_input
	jmp 	.exit		;; this saves an instruction at the cost of 2 bytes
.no_input:
	xor 	eax, eax	; return false;
	jmp 	.exit
.has_input:
	mov 	eax, 1		; return true;
.exit:
	add 	rsp, 32 + 8*2
	pop 	rbx
	ret
%endif

%include "include/adler32-combine.nasm"
%include "include/digest-buffer.nasm"
%include "include/adler32-fp.nasm"
%include "include/adler32-str.nasm"

%ifndef DLL
	%include "include/pipe-ops.nasm"
	%include "include/process-arg.nasm"

	%ifdef BARE_BONES
		;; 32 for shadow space, 16 for variables, and 8 more instead of `push rbp`
		%assign main_stack_space 56
	%else
		;; 32 for shadow space + 8 more instead of `push rbp`
		%assign main_stack_space 40
	%endif

	%include "include/argfiles.nasm"
	%include "include/main.nasm"
%else ; %ifndef DLL
	%include "include/dll.nasm"
%endif ; %ifndef DLL (else branch)
