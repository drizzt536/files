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


;;;;;;;;;;;;;;;;;;;;;;;;;;;; configuration macro aliases ;;;;;;;;;;;;;;;;;;;;;;;;;;;

%ifdef UNROLL
	;; allow `-DUNROLL=N` as an alias to `-DUNROLL_N=N`.

	%if %isdef(UNROLL_N) && %isnidn(UNROLL, UNROLL_N)
		%error both -DUNROLL_N and its alias -DUNROLL were given with conflicting values.
	%endif

	%xdefine UNROLL_N UNROLL
	%undef UNROLL
%endif

%ifdef UNROLL_N
	;; for some reason `%if %isdef(UNROLL_N) && UNROLL_N == 0` doesn't work.
	%if UNROLL_N == 0
		;; use -DUNROLL=0 as an alias of not giving it at all.
		%undef UNROLL_N
	%endif
%endif

%ifdef BUF_LEN
	;; allow `-DBUF_LEN=N` as an alias to `-DSCRATCH_BUF_LEN=N`.

	%if %isdef(SCRATCH_BUF_LEN) && %isnidn(BUF_LEN, SCRATCH_BUF_LEN)
		%error both -DSCRATCH_BUF_LEN and its alias -DBUF_LEN were given with conflicting values.
	%endif

	%xdefine SCRATCH_BUF_LEN BUF_LEN
	%undef BUF_LEN
%endif

%ifdef EFAULT
	;; allow -DEFAULT as an alias to -DDEFAULT
	;; if they are both defined, ignore the second one.

	%define DEFAULT
	%undef EFAULT
%endif

%ifdef STATIC_EXPORT_SUBIMPLS
	%define DLL_NO_ENTRY
	%define DLL_EXPORT_SUBIMPLS
%endif

;; DLL aliases
%ifdef LL
	%define DLL
	%undef LL
%endif

%ifdef SHARED
	%define DLL
	%undef SHARED
%endif

;; DLL_NO_ENTRY aliases
%ifdef LL_NO_ENTRY
	%define DLL_NO_ENTRY
	%undef LL_NO_ENTRY
%endif

%ifdef SHARED_NO_ENTRY
	%define DLL_NO_ENTRY
	%undef SHARED_NO_ENTRY
%endif

%ifdef STATIC
	;; for static linking.
	%define DLL_NO_ENTRY
	%undef STATIC
%endif

;; DLL_EXPORT_SUBIMPLS aliases
%ifdef LL_EXPORT_SUBIMPLS
	%define DLL_EXPORT_SUBIMPLS
	%undef LL_EXPORT_SUBIMPLS
%endif

%ifdef SHARED_EXPORT_SUBIMPLS
	%define DLL_EXPORT_SUBIMPLS
	%undef SHARED_EXPORT_SUBIMPLS
%endif

;; DLL_NO_FP aliases
%ifdef LL_NO_FP
	%define DLL_NO_FP
	%undef LL_NO_FP
%endif

%ifdef SHARED_NO_FP
	%define DLL_NO_FP
	%undef SHARED_NO_FP
%endif

;; DLL_NO_FNAME aliases
%ifdef LL_NO_FNAME
	%define DLL_NO_FNAME
	%undef LL_NO_FNAME
%endif

%ifdef SHARED_NO_FNAME
	%define DLL_NO_FNAME
	%undef SHARED_NO_FNAME
%endif

;; DELIM aliases
%ifdef ELIM
	%if %isdef(DELIM) && %isnidn(ELIM, DELIM)
		%error both -DDELIM and its alias -DELIM were given with conflicting values.
	%endif

	%xdefine DELIM ELIM
	%undef ELIM
%endif

%ifdef SPACE_DELIM
	%if %isdef(DELIM) && %isnidn(DELIM, ' ')
		%error -DSPACE_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM ' '
	%undef SPACE_DELIM
%endif

%ifdef TAB_DELIM
	;; essentially useless because tab delimiters is the default.
	%if %isdef(DELIM) && %isnidn(DELIM, `\t`)
		%error -DTAB_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM `\t`
	%undef TAB_DELIM
%endif

%ifdef LF_DELIM
	%if %isdef(DELIM) && %isnidn(DELIM, `\n`)
		%error -DLF_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM `\n`
	%undef LF_DELIM
%endif

%ifdef PIPE_DELIM
	%if %isdef(DELIM) && %isnidn(DELIM, '|')
		%error -DPIPE_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM '|'
	%undef PIPE_DELIM
%endif

%ifdef COLON_DELIM
	%if %isdef(DELIM) && %isnidn(DELIM, ':')
		%error -DCOLON_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM ':'
	%undef COLON_DELIM
%endif

%ifdef COLON_SPACE_DELIM
	%if %isdef(DELIM) && %isnidn(DELIM, ': ')
		%error -DCOLON_SPACE_DELIM conflicts with existing delimiter definition.
	%endif

	%xdefine DELIM ': '
	%undef COLON_SPACE_DELIM
%endif

%ifndef DELIM
	;; default to a tab
	%define DELIM `\t`
%endif

;;;;;;;;;;;;;;;;;;;;;;;;;; configuration macro expansions ;;;;;;;;;;;;;;;;;;;;;;;;;;

%if %isdef(DLL_NO_ENTRY) || %isdef(DLL_EXPORT_SUBIMPLS) || %isdef(DLL_NO_FP) || %isdef(DLL_NO_FNAME)
	%define DLL
%endif

%ifdef DLL_NO_FP
	%define DLL_NO_FNAME
%endif

%ifdef DLL
	%define NO_ALIGN
	%define NO_PIPE
%endif

%ifdef DEFAULT
	%ifdef DLL
		;; DLL or STATIC mode
		%define NO_FOLDER_CHECK

		%ifdef DLL_NO_ENTRY
			%define DLL_EXPORT_SUBIMPLS
		%endif
	%else
		;; EXE mode
		%define NO_LONG_ARGS
		%define NO_COLOR_ERROR
	%endif ; %ifdef DLL (else branch)
%endif ; %ifdef DEFAULT

%ifdef BARE_BONES
	;; completely stripped down version of the program. only basic functionality is provided.
	;; only parsing for regular files remains. everything else is removed.
	%define MINIMAL
	%define NO_FORMAT
	%define NO_PIPE
	%define NO_ARG_F
	%define NO_ARG_I
	%define NO_ARG_V
%endif

%ifdef MINIMAL
	;; disable almost everything that can be disabled. minimal version of the program
	%define LEAN
	%define NO_WARN_UNUSED
	%define NO_COLOR
	%define NO_ARG_C
	%define NO_ARG_H
	%define NO_ARG_P
%endif

%ifdef LEAN
	;; disable @argfile -s, -x, -d, -u, -D, and long-form arguments
	%define NO_ARGFILES
	%define NO_LONG_ARGS
	%define NO_REDIRECTS
	%define NO_INLINE_INPUT
	%define NO_DIRECTIONS
	%define NO_COLOR_ERROR
%endif

%ifdef NO_COLOR
	%define NO_COLOR_FATAL
	%define NO_COLOR_ERROR
	%define NO_COLOR_WARNG
%endif

%ifdef NO_REDIRECTS
	;; disable -o and -e
	%define NO_ARG_O
	%define NO_ARG_E
%endif

%ifdef NO_INLINE_INPUT
	;; disable -s and -x
	%define NO_ARG_S
	%define NO_ARG_X
%endif

%ifdef NO_FORMAT
	;; disable -r, -l, and -F
	%define NO_ARG_R
	%define NO_ARG_L
%endif

%if %isdef(NO_ARG_V) && %isndef(NO_ARG_H)
	%fatal -DNO_ARG_V without -DNO_ARG_H is an error.
%endif

%ifdef NO_ARG_H
	;; NO_ARG_H removes the help arguments, which in turn makes the doc string useless.
	%define NO_DOCS
%endif

%ifndef UNROLL_N
	;; after testing, I don't think unrolling changes anything.
	;; test results: https://www.desmos.com/calculator/0c6ycxdzc7

	;; to be fair, this is with file arguments, so it probably does change
	;; for adler32_buf_fw with -DLL and -DSTATIC
	%define UNROLL_N 1
%endif

;; expansions. define the whole category if all sub macros are defined

;; NOTE: -DNO_ARG_L -DNO_ARG_R is not equivalent to -DNO_FORMAT

%if %isdef(NO_ARG_S) && %isdef(NO_ARG_X)
	;; if both are given separately, define NO_INLINE_INPUT.
	%define NO_INLINE_INPUT
%endif

%if %isdef(NO_ARG_O) && %isdef(NO_ARG_E)
	%define NO_REDIRECTS
%endif

%if %isdef(NO_COLOR_FATAL) && %isdef(NO_COLOR_ERROR) && %isdef(NO_COLOR_WARNG)
	%define NO_COLOR
%endif

%if %isdef(NO_LONG_ARGS) && %isdef(NO_INLINE_INPUT) && %isdef(NO_DIRECTIONS) && \
	%isdef(NO_COLOR_ERROR) && %isdef(NO_REDIRECTS)
	%define LEAN
%endif

%if %isdef(LEAN) && %isdef(NO_ARG_C) && %isdef(NO_ARG_H) && %isdef(NO_ARG_P) && \
	%isdef(NO_COLOR) && %isdef(NO_WARN_UNUSED)
	%define MINIMAL
%endif

%if %isdef(MINIMAL) && %isdef(NO_FORMAT) && %isdef(NO_PIPE) && %isdef(NO_ARG_F) \
	&& %isdef(NO_ARG_I) && %isdef(NO_ARG_V)
	%define BARE_BONES
%endif

%ifndef SCRATCH_BUF_LEN
	%ifdef BARE_BONES ;; default to 1 KiB
		%assign SCRATCH_BUF_LEN 1024
	%elifdef MINIMAL ;; default to 32 KiB
		%assign SCRATCH_BUF_LEN 1024*32
	%else ;; default to 64 KiB (LEAN, DEFAULT or normal)
		%assign SCRATCH_BUF_LEN 1024*64
	%endif
%endif

;;;;;;;;;;;;;;;;;;;;;;;; configuration macros bounds checks ;;;;;;;;;;;;;;;;;;;;;;;;

;; the string max buf size macro isn't actually used anywhere.
;; k = 64
;; nmax = Floor[ n /. Solve[{b n (n + 1) / 2 + (n + 1) (65521 - 1) == 2^k - 1, n > 0}][[1]] ]
%ifdef ASCII_ONLY_DATA
	;; b = 126
	;; NMAX assuming the max value is 0x7e ('~')
	%assign MAX_BUF_SIZE	541_114_496
%else
	;; b = 255
	;; NMAX assuming the max value is 0xff (arbitrary byte values)
	%assign MAX_BUF_SIZE	380_368_439
%endif

%ifnnum SCRATCH_BUF_LEN
	%fatal scratch buffer size (-DSCRATCH_BUF_LEN) must be a number.
%endif

%ifnnum UNROLL_N
	%fatal unroll factor (-DUNROLL_N) must be a number.
%endif

%ifnstr DELIM
	%fatal output format delimiter (-DDELIM) must be a string.
%endif

%if SCRATCH_BUF_LEN < 1
	%fatal scratch buffer size (%[SCRATCH_BUF_LEN]) must be at least 1.
%endif

%if SCRATCH_BUF_LEN > MAX_BUF_SIZE
	%warning %strcat(`scratch buffer size (`, %num(SCRATCH_BUF_LEN), \
		`) exceeds maximum size of %[MAX_BUF_SIZE] bytes.\n`, \
		`\tCorrectness of program outputs is no longer guaranteed.`)
%endif

%if SCRATCH_BUF_LEN > (1 << 32) - 1
	%fatal %strcat(`scratch buffer size (`, %num(SCRATCH_BUF_LEN), `) does not fit in 32 bits.`)
%endif

%if UNROLL_N < 1
	%fatal unroll factor (%[UNROLL_N]) must be at least 1.
%endif

%ifdef DLL
	%ifdef MODE_UNDO_DEFAULT
		%fatal -DMODE_UNDO_DEFAULT cannot be given with -DLL
	%endif

	;; -DNO_ARG_X, -DNO_ARG_S, -DNO_INLINE_INPUT, -DNO_ARG_C, and -DNO_DIRECTION still work.
	;; the rest of the config macros do nothing in DLL mode.

	%if UNROLL_N > 255
		%fatal unroll factor (%[UNROLL_N]) greater than 255. this will not return correctly in adler32_version.
	%endif
%endif

%if UNROLL_N > SCRATCH_BUF_LEN
	;; protect against `-DUNROLL=-1`, which is actually the same thing as `-DUNROLL=18446744073709551615`.
	%fatal unroll factor (%[UNROLL_N]) cannot be greater than the buffer size (%[SCRATCH_BUF_LEN])
%elif UNROLL_N > 4096
	;; this is beyond the point where there is no way unrolling is giving any kind of speed up.
	%fatal unroll factor (%[UNROLL_N]) greater than 4096. this is almost certainly a misconfiguration.
%elif UNROLL_N > 255
	;; from 256 to 4096, it is probably a misconfiguration, but it isn't immediately an issue.
	%warning unroll factor (%[UNROLL_N]) greater than 255. this is likely a mistake.
%endif

%if %strlen(DELIM) > 64
	%warning delimiter is longer than 64 characters. this is likely a mistake.
%elif %strlen(DELIM) > 1024
	%fatal delimiter is longer than 1024 characters. this is almost certainly a misconfiguration
%endif

%assign i 1
%rep %strlen(DELIM)
	%substr c DELIM i

	%if c > '~' || c < 32 && c != `\t` && c != `\n`
		%fatal output format delimiter invalid character at position i: cannot contain control or special characters.
	%endif

	%assign i i + 1
%endrep
%undef c
%undef i

%if %isdef(MODE_UNDO_DEFAULT) && %isdef(NO_DIRECTIONS)
	%fatal -DMODE_UNDO_DEFAULT and -DNO_DIRECTIONS cannot both be provided.
%endif

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

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; data segments ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

segment .bss

%ifndef NO_ARGFILES	
	argfile_depth		resq 1	; uint8_t[8]; // only one of these is used
%endif

%ifdef DLL
	%assign SCRATCH_BUF_LEN_PADDED (SCRATCH_BUF_LEN + 7) & ~8
	scratch_buffer		resb SCRATCH_BUF_LEN_PADDED

	;; this only needs to be a single byte, but it uses a qword for alignment concerns
	;; the only bit used is the (1 << 2) bit for the direction.
%ifndef NO_DIRECTIONS
	adler32_flags		resq 1	; uint64_t
%endif

%ifndef DLL_NO_FNAME
segment .rdata
	file_rb_mode	db `rb\0`
%endif ; %ifndef DLL_NO_FNAME

%else ; %ifdef DLL
	scratch_buffer		resb SCRATCH_BUF_LEN

	pstderr		resq 1 ; FILE **pstderr; // for printing generic fatal errors like "unknown argument"

	%cond(%isndef(NO_PIPE),  pstdin		resq 1) ; FILE **pstdin;   // only used for the pipeline
	%cond(%isndef(NO_ARG_O), pstdout	resq 1) ; FILE **pstdout;  // only used for comparison in `process_arg`.
	%cond(%isndef(NO_ARG_O), poutfile	resq 1) ; FILE **poutfile; // write the output here instead of to stdout
	%cond(%isndef(NO_ARG_E), perrfile	resq 1) ; FILE **perrfile; // write non-fatal errors here instead of to stderr.

;; the .data section is not required for the DLL version.
;; it is only sometimes required in the EXE version.
%if %isndef(NO_FORMAT) || %isndef(NO_ARG_H) || %isndef(NO_ARG_V) || %isndef(NO_PIPE)
	segment .data
%else
	segment .rdata
%endif

%if %isndef(NO_ARG_H) || %isndef(NO_ARG_V) || %isndef(NO_PIPE)
	late_arg1_str		db FATAL_RED, "ERROR: argument `-%"
	late_arg1_str_c		db "c` can only be given as the first argument", FATAL_CLEAR, `\n\0`
%endif

%ifdef FMT_SWAP_ARGS
	;; these have to use `%0s` to be the same length as `%.s`, which ignores the argument. this
	;; makes it so I don't have to change the implementation to have conditions everywhere to pass
	;; the checksum as the first argument in raw formatting mode. %0s has the same functionality
	;; as %s because it prints a string and left pads with spaces it to at least 0 characers
	%xdefine LONGFMT_STR_VALID	%strcat("%0s", DELIM, "%08", CKSM_X, `\n\0`)
	%xdefine LONGFMT_STR_ABSENT	%strcat(ERROR_RED, "%0s", DELIM, "[ABSENT]", ERROR_CLEAR, `\n\0`)
	%xdefine LONGFMT_STR_FOLDER	%strcat(ERROR_RED, "%0s", DELIM, "[FOLDER]", ERROR_CLEAR, `\n\0`)

	;; these are basically the long form ones but with %0s replaced with %.s, and the delimiter removed.
	;; these don't include the required padding characters after it to make `-l` work properly.
	%xdefine RAWFMT_STR_VALID	%strcat("%.s%08", CKSM_X, `\n\0`)
	%xdefine RAWFMT_STR_ABSENT	%strcat(ERROR_RED, "%.s[ABSENT]", ERROR_CLEAR, `\n\0`)
	%xdefine RAWFMT_STR_FOLDER	%strcat(ERROR_RED, "%.s[FOLDER]", ERROR_CLEAR, `\n\0`)

	;; offsets to the character after the % in the `%.s` / `%0s` part
	%xdefine FMT_OFFSET_INVALID	%strlen(%strcat(ERROR_RED, '%'))
	%xdefine FMT_OFFSET_VALID	%strlen("%")
%else ; %ifdef FMT_SWAP_ARGS
	%xdefine LONGFMT_STR_VALID	%strcat("%08", CKSM_X, DELIM, `%s\n\0`)
	%xdefine LONGFMT_STR_ABSENT	%strcat(ERROR_RED, "[ABSENT]", DELIM, "%s", ERROR_CLEAR, `\n\0`) ;; file doesn't exist
	%xdefine LONGFMT_STR_FOLDER	%strcat(ERROR_RED, "[FOLDER]", DELIM, "%s", ERROR_CLEAR, `\n\0`) ;; filename is a folder, not a file

	;; these don't include the required padding characters after it to make `-l` work properly.
	%xdefine RAWFMT_STR_VALID	%strcat("%08", CKSM_X, `\n\0`)
	%xdefine RAWFMT_STR_ABSENT	%strcat(ERROR_RED, "[ABSENT]", ERROR_CLEAR, `\n\0`)
	%xdefine RAWFMT_STR_FOLDER	%strcat(ERROR_RED, "[FOLDER]", ERROR_CLEAR, `\n\0`)

	;; offsets to the delimiter.
	;; [ABSENT] and [FOLDER] are the same length, and %08x and %08X are the same length.
	%xdefine FMT_OFFSET_INVALID	%strlen(%strcat(ERROR_RED, "[ABSENT]"))
	%xdefine FMT_OFFSET_VALID	%strlen("%08x")
%endif ; %ifdef FMT_SWAP_ARGS (else branch)

;; these three values are updated at runtime when `-r`, `-l`, and `-F` are passed.
;; if those are disabled, then these don't have to be in a .data section, and .rdata will work too.
%ifdef FMT_RAW_DEFAULT
	%ifdef NO_FORMAT
		;; no characters are required after the raw format part, because -r, -l, and -F don't exist.
		;; the string can just exist as it is with no data after the null byte.
		valid_line_fmt		db RAWFMT_STR_VALID
		invalid_line_fmt	db RAWFMT_STR_ABSENT
		%cond(%isndef(NO_FOLDER_CHECK), dir_passed_line_fmt db RAWFMT_STR_FOLDER)
	%else ; %ifdef NO_FORMAT
		;; put the short format string, but put the remaining characters from the long form one after it.
		valid_line_fmt		db %strcat(RAWFMT_STR_VALID, %substr(LONGFMT_STR_VALID, %strlen(RAWFMT_STR_VALID) + 1))
		invalid_line_fmt	db %strcat(RAWFMT_STR_ABSENT, %substr(LONGFMT_STR_ABSENT, %strlen(RAWFMT_STR_ABSENT) + 1))
		%cond(%isndef(NO_FOLDER_CHECK), dir_passed_line_fmt db %strcat(RAWFMT_STR_FOLDER, %substr(LONGFMT_STR_FOLDER, %strlen(RAWFMT_STR_FOLDER) + 1)))
	%endif ; %ifdef NO_FORMAT (else branch)
%else ; %ifdef FMT_RAW_DEFAULT
	valid_line_fmt		db LONGFMT_STR_VALID
	invalid_line_fmt	db LONGFMT_STR_ABSENT ;; file doesn't exist
	%cond(%isndef(NO_FOLDER_CHECK), dir_passed_line_fmt db LONGFMT_STR_FOLDER) ;; filename is a folder, not a file
%endif ; %ifdef FMT_RAW_DEFAULT (else branch)

%if %isndef(NO_FORMAT) || %isndef(NO_ARG_H) || %isndef(NO_ARG_V) || %isndef(NO_PIPE)
	segment .rdata
%endif
	;; miscellaneous strings
	file_rb_mode	db `rb\0`

	;; nothing else in the rdata section is unconditionally required.
%ifndef NO_ARGFILES
	file_r_mode	db `r\0`
%endif

	%cond(%isdef(NO_REDIRECTS),, file_a_mode			db `a\0`)
	%cond(%isdef(NO_PIPE),, fmt_llu						db `%llu\0`)
	%cond(%isdef(NO_PIPE),, pipeline_filename_str		db `[PIPE]\0`)
	%cond(%isdef(NO_ARG_C),, comb_filename_str			db `[COMBINE]\0`)
	%cond(%isdef(NO_INLINE_INPUT),, string_filename_str	db `[STRING]\0`)

	;; error strings
%ifndef NO_FATAL_MESSAGES
	%cond(%isndef(NO_PIPE), internal_error_str	db %strcat(FATAL_RED, "ERROR: internal error %hhu", FATAL_CLEAR, `\n\0`))
	%cond(%isndef(NO_DIRECTIONS), non_seekable_large_file_undo_str	db %strcat(FATAL_RED, "ERROR: file is not seekable and larger than ", %num(SCRATCH_BUF_LEN - 1), " bytes.", FATAL_CLEAR, `\n\0`))

	%cond(%isndef(NO_ARG_P), prev_invalid_arg_str	db %strcat(FATAL_RED, "ERROR: argument `-p` given with an invalid value `%.8s`.", FATAL_CLEAR, `\n\0`))
	%cond(%isndef(NO_ARG_P), prev_no_pipe_str		db %strcat(FATAL_RED, "ERROR: argument `-p` given with value `-` when there is no pipeline.", FATAL_CLEAR, `\n\0`))
	%cond(%isndef(NO_ARG_X), hex_odd_length_str		db %strcat(FATAL_RED, "ERROR: argument `-x` given with an odd-length value.", FATAL_CLEAR, `\n\0`))
	%cond(%isndef(NO_ARG_X), hex_invalid_byte_str	db %strcat(FATAL_RED, "ERROR: argument `-x` given with an invalid value at hex-pair index %u.", FATAL_CLEAR, `\n\0`))

%ifndef NO_REDIRECTS
	;; error strings specific to `-o` and `-e`
	option_non_writable_file_str	db FATAL_RED, "ERROR: invalid path given for `-%c`: file '%s' could not be opened for writing.", FATAL_CLEAR, `\n\0`
	option_file_is_directory_str	db FATAL_RED, "ERROR: invalid path given for `-%c`: '%s' is a directory.", FATAL_CLEAR, `\n\0`
%endif ; %ifndef NO_REDIRECTS

%if %isndef(NO_ARG_X) || %isndef(NO_ARG_S) || %isndef(NO_ARG_P) || \
	%isndef(NO_ARG_F) || %isndef(NO_ARG_O) || %isndef(NO_ARG_E)
	option_no_arg_str	db FATAL_RED, "ERROR: argument `-%c` given with no value.", FATAL_CLEAR, `\n\0`
%endif ; %if at least one of -[xspfoe] exists.

%ifndef NO_ARG_C
	comb_no_args_str		db FATAL_RED, "ERROR: argument `-c` given with no values.", FATAL_CLEAR, `\n\0`
	comb_one_arg_str		db FATAL_RED, "ERROR: argument `-c` given with only one argument.", FATAL_CLEAR, `\n\0`
	comb_invalid_arg_str	db FATAL_RED, "ERROR: argument `-c` given with an invalid %s argument `%.8s`.", FATAL_CLEAR, `\n\0`
	first_str				db `first\0`
	second_str				db `second\0`
	;; TODO: there should be a `comb_no_pipe_str` I think. there is probably
	;;       a bug if you if you do `-c * -` or `-c - *` without piping anything
%endif ; %ifndef NO_ARG_C

	unknown_arg_str			db FATAL_RED, "ERROR: unknown argument `%s`.", FATAL_CLEAR
	%cond(%isndef(NO_DOCS), db `\nUse \`--help\` for more information.\0`, db `\0`)
%endif ; %ifndef NO_FATAL_MESSAGES

%ifndef NO_WARN_UNUSED
	;; NOTE: for the unused warning, it is reset back to the default format later.
	unused_warning_str	db WARNING_ORANGE, `WARNING: %u misplaced argument(s) after the last output argument\n         unused flags:\0`
	unused_arg_str		db " %s", `\0`
	ansi_clear_str		db `\e[0m\0`
%endif

%ifndef NO_ARGFILES
	argfile_too_large_str		db FATAL_RED, "ERROR: argfile '@%s' is too large; out of memory.", FATAL_CLEAR, `\n\0`
	argfile_not_seekable_str	db FATAL_RED, "ERROR: argfile '@%s' is not seekable.", FATAL_CLEAR, `\n\0`
	argfile_dir_passed_str		db FATAL_RED, "ERROR: argfile '@%s' is a folder.", FATAL_CLEAR, `\n\0`
	argfile_invalid_file_str	db FATAL_RED, "ERROR: argfile '@%s' could not be opened.", FATAL_CLEAR, `\n\0`
	argfile_depth_exceeded_str	db FATAL_RED, "ERROR: argfile '@%s' exceeded depth max of 255. maybe rethink your design :|", FATAL_CLEAR, `\n\0`
%endif


	;; arguments longer than 1 character can't be easily inlined.
	;; the ones with a random letter at the start is because the first letter
	;; has to match the short argument for `process_arg~test_long` to work.

	;; NOTE: --help and --version are still allowed even if long form arguments are disabled.
	;;       to disable these ones, you need to give -DNO_ARG_H and -DNO_ARG_V specifically.
	%cond(%isdef(NO_ARG_H),, help_arg				db `--help\0`)
	%cond(%isdef(NO_ARG_V),, ver_arg				db `--version\0`)

%ifndef NO_LONG_ARGS
	%cond(%isdef(NO_PIPE),, manual_pipe_arg			db `--manual-pipe\0`)

	%cond(%isdef(NO_ARG_C),, combine_arg			db `--combine\0`)
	%cond(%isdef(NO_ARG_F),, file_arg				db `--file\0`)
	%cond(%isdef(NO_ARG_I),, incremental_arg		db `--incremental\0`)
	%cond(%isdef(NO_ARG_P),, prev_arg				db `--prev-cksm\0`)

	%cond(%isdef(NO_ARG_R),, raw_arg				db `--format-raw\0`)
	%cond(%isdef(NO_ARG_L),, long_arg				db `--format-long\0`)
	%cond(%isdef(NO_FORMAT),, Fformatswap_arg		db `--format-swap\0`)

	%cond(%isdef(NO_ARG_O),, outfile_arg			db `--outfile\0`)
	%cond(%isdef(NO_ARG_E),, errfile_arg			db `--errfile\0`)

	%cond(%isdef(NO_ARG_S),, str_data_arg			db `--str-data\0`)
	%cond(%isdef(NO_ARG_X),, xhex_data_arg			db `--hex-data\0`)

	%cond(%isdef(NO_DIRECTIONS),, ubackwards_arg	db `--backwards\0`)
	%cond(%isdef(NO_DIRECTIONS),, dforwards_arg		db `--forwards\0`)
	%cond(%isdef(NO_DIRECTIONS),, Dreverse_arg		db `--reverse\0`)
%endif ; %ifndef NO_LONG_ARGS

%ifndef NO_ARG_V
	version_str:
		db "adler32 v", VERSION_STRING, `\n`
		db "assembled with: buffer="
;; don't worry about GiB, because the buffer can only be up to like 362 MiB
;; NOTE: if it is like 12.34 MiB, it will truncate it to 12 MiB.
%if SCRATCH_BUF_LEN >= 1024*1024
		db %num(SCRATCH_BUF_LEN >> 20), " MiB"
%elif SCRATCH_BUF_LEN >= 1024
		db %num(SCRATCH_BUF_LEN >> 10), " KiB"
%else
		db %num(SCRATCH_BUF_LEN), " B"
%endif
		%cond(SCRATCH_BUF_LEN > MAX_BUF_SIZE, db " (excessive size)") ; checksum accuracy is not guaranteed.

		db ", unroll=", %cond(UNROLL_N == 1, "off", %num(UNROLL_N))

%ifdef ASCII_ONLY_DATA
		db ", ASCII-only data"
%endif
		db ", output-format=(", %cond(%isdef(FMT_SWAP_ARGS), "filename", "checksum"), " first"
%if %isdef(NO_COLOR_ERROR) && %isndef(NO_COLOR)
		;; don't output this if it will output "no color" for the whole program.
		db ", no color" ;; no color for stuff like [ABSENT]	
%endif
		db ", ", %cond(%isdef(CKSM_UPPER), "upper", "lower"), "case checksums"
		db ", default=", %cond(%isdef(FMT_RAW_DEFAULT), "raw", "long")
		db ", delim=", '"', %substr(%str(DELIM), 2, -2), `")`

%ifdef NO_COLOR
		db ", no color"	;; no color like at all, even for errors
%else
		%cond(%isdef(NO_COLOR_FATAL) && %isndef(NO_FATAL_MESSAGES), db ", no fatal error color")
		%cond(%isdef(NO_COLOR_WARNG), db ", no warning color")
%endif ; %ifdef NO_COLOR (else branch)

		%cond(%isdef(NO_FATAL_MESSAGES), db ", no fatal error messages")

		%cond(%isdef(MODE_UNDO_DEFAULT), ", undo mode default")

		%cond(%isdef(NO_ARG_C), db ", no combine (-c)")
		%cond(%isdef(NO_ARG_F), db ", no file override (-f)")
		%cond(%isdef(NO_ARG_I), db ", no incremental mode (-i)")
		%cond(%isdef(NO_ARG_P), db ", no prev-cksm update (-p)")

%ifdef NO_FORMAT
		db ", no formatting (-r/-l/-F)"
%else
		%cond(%isdef(NO_ARG_R), db ", no raw format (-r)")
		%cond(%isdef(NO_ARG_L), db ", no long format (-l)")
%endif

%ifdef NO_REDIRECTS
		db ", no file redirects (-o/-e)"
%else
		%cond(%isdef(NO_ARG_O), db ", no outfile redirects (-o)")
		%cond(%isdef(NO_ARG_E), db ", no errfile redirects (-e)")
%endif

%ifdef NO_INLINE_INPUT
		db ", no inline input (-s/-x)"
%else
		%cond(%isdef(NO_ARG_S), db ", no string input (-s)")
		%cond(%isdef(NO_ARG_X), db ", no hex input (-x)")
%endif

		%cond(%isdef(NO_DIRECTIONS), db ", no directions (-d/-u/-D)")
		%cond(%isdef(NO_ARG_V), db ", no version (-v)") ;; NOTE: this never evaluates to anything
		%cond(%isdef(NO_ARG_H), db ", no help (-h/-?)")
		%cond(%isdef(NO_PIPE), db ", no pipeline")
%ifdef NO_DOCS
		db ", no docs"
%elifdef NO_DOCS_EXIT_CODE_TABLE
		db ", no docs exit code table"
%endif
		%cond(%isdef(NO_LONG_ARGS), db ", no long-form arguments")
		%cond(%isdef(NO_WARN_UNUSED), db ", no unused argument warnings")
		db `\0`
%endif ; %ifndef NO_ARG_V

;; 24 spaces. this is not dynamic, it cannot be changed.
%define DOC_PAD "                        "

%ifndef NO_ARG_H
	help_str:
		db `\n` ;; buffer between the version and the help text
		db `Usage: `
		%cond(%isdef(NO_PIPE),, db `[pipe input] | `)
		db `adler32 [-h | -v`
		%cond(%isdef(NO_PIPE),, db ` | -!`)
		db `] [OPTION | FILENAME]...\n`
		db `\n`
%ifdef NO_DOCS
		db `help text disabled\0`
%else
		db `Options:\n`
		;db`0       10        20        30        40        50        60        70        80        90       100       110       120\n`
		;db`123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890\n`
		;; NOTE: if this part of the program is generated, --help exists.
		db `    -h, -?, --help      Print this message and exit. Must be the first argument.\n`
		;; NOTE: if -h exists, then -v also must exist.
		db `    -v, --version       Print the version string and exit. Must be the first argument.\n`

%ifndef NO_PIPE
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -!                  `, \
			`    -!, --manual-pipe   `)
		db          `Disable automatic pipeline processing; normally this happens right before the first input\n`
		db DOC_PAD, `source option (\`FILENAME\``
		%cond(%isndef(NO_ARG_S), db " | `-s`")
		%cond(%isndef(NO_ARG_X), db " | `-x`")
		%cond(%isndef(NO_ARG_F), db " | `-f`")
		%cond(%isndef(NO_PIPE),  db " | `-`")
		db `). Must be given as the first argument.\n`

		db `    -                   Process the pipe early. Example: \`adler32 - -i file1 file2\` processes the pipe before\n`
		db DOC_PAD, `enabling incremental mode. Using \`-\` more than once, or after the first regular file, will\n`
		db DOC_PAD, `be treated as an empty file. The pipeline can also be used for options (e.g. \`-p -\`). Using \`-\`\n`
		;;           ^^^^^^^^^^^^^^^^^^^^^^^^^^^ (only as standalone `-`, not as an argument). Should I mention this?
		db DOC_PAD, `as an operand for \`-p\` or \`-c\` without a pipeline results in an error. \`-p -\`, and the first\n`
		db DOC_PAD, `argument of \`-c\` skip whitespace and control characters (c < 33), and then read the next 8\n`
		db DOC_PAD, `characters after it. It terminates the string at the first invalid character. The second\n`
		db DOC_PAD, `argument of \`-c\` reads at most 20 characters as an unsigned 64-bit integer, and stops at the\n`
		db DOC_PAD, `first invalid character, leaving it in stdin.\n`
%endif ; %ifndef NO_PIPE

%ifndef NO_ARG_R
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -r                  `, \
			`    -r, --format-raw    `)
		db `Use raw formatting: print only the checksum for subsequent files.`
		db %cond(%isdef(FMT_RAW_DEFAULT), ` (default)\n`, `\n`)
%endif ; %ifndef NO_ARG_R

%ifndef NO_ARG_L
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -l                  `, \
			`    -l, --format-long   `)
		db `Use long formatting: print the checksum and filename for subsequent files.`
		db %cond(%isdef(FMT_RAW_DEFAULT), `\n`, ` (default)\n`)
%endif ; %ifndef NO_ARG_L

%ifndef NO_FORMAT
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -F                  `, \
			`    -F, --format-swap   `)
		db `Swap formatting modes. Equivalent to \`-l\` when in raw mode, and \`-r\` when in long mode.\n`
%endif ; %ifndef NO_FORMAT

%ifndef NO_DIRECTIONS
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -d                  `, \
			`    -d, --forwards      `)
		db `Switch to forwards/do mode.`
		db %cond(%isdef(MODE_UNDO_DEFAULT), `\n`, ` (default)\n`)

		db %cond(%isdef(NO_LONG_ARGS), \
			`    -u                  `, \
			`    -u, --backwards     `)
		db `Switch to backwards/undo mode.`
		db %cond(%isdef(MODE_UNDO_DEFAULT), ` (default)\n`, `\n`)

		db %cond(%isdef(NO_LONG_ARGS), \
			`    -D                  `, \
			`    -D, --reverse       `)
		db `Swap directions. Equivalent to \`-d\` when in undo mode, and \`-u\` when in do mode.\n`
%endif ; %ifndef NO_DIRECTIONS

%ifndef NO_ARG_I
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -i                  `, \
			`    -i, --incremental   `)
		db          `Toggle incremental mode. When enabled, automatically carries over the checksum\n`
		db DOC_PAD, `between files. Defaults to off. Missing files and folders do not update the checksum.\n`
%endif ; %ifndef NO_ARG_I

%ifndef NO_ARG_F
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -f PATH             `, \
			`    -f, --file PATH     `)
		db          `Force the next argument to be read as a file path, even if it looks like an option.\n`
		db DOC_PAD, `Useful for file names starting with \`-\`, or for explicitly specifying a file.\n`
%endif ; %ifndef NO_ARG_F

%ifndef NO_ARG_P
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -p CHECKSUM         `, { \
			`    -p, --prev-cksm CHECKSUM\n`, DOC_PAD })
		db          `Set the starting checksum for subsequent files. Only the first 8 characters of the value are\n`
		db DOC_PAD, `read, but less is allowed too. If an invalid value is passed, the program exits immediately.\n`
		db DOC_PAD, `The value should be given in hexadecimal. \`0x\` prefix is allowed.\n`
%endif ; %ifndef NO_ARG_P

%ifndef NO_ARG_C
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -c CKSM2 LEN2       `, { \
			`    -c, --combine CKSM2 LEN2\n`, DOC_PAD })
		db          `Combines two checksums as if the data was contiguous. Uses the previously set checksum\n`
		db DOC_PAD, `(from \`-p\` or \`-i\`) as the first checksum. LEN2 is the length of the data that CKSM2\n`
		db DOC_PAD, `represents. To pass two arguments, use: \`-p CKSM1 -c CKSM2 LEN2\`.\n`
		db DOC_PAD, `For an undo, use: \`-u -p CKSM1 -c CKSM2 LEN2\`.\n`
		db DOC_PAD, `CKSM2 must be in hexadecimal (same as for \`-p\`), and LEN2 must be in decimal.\n`
%endif ; %ifndef NO_ARG_C

%ifndef NO_ARG_S
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -s STR              `, \
			`    -s, --str-data STR  `)
		db          `Compute the checksum of data passed directly as a string. Stops at the first null byte.\n`
		db DOC_PAD, `Windows only allows the input to be so long, usually 8192 or 32768 across the whole command.\n`
%endif ; %ifndef NO_ARG_S

%ifndef NO_ARG_X
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -x HEX              `, \
			`    -x, --hex-data HEX  `)
		db          `Compute the checksum of data passed as hexadecimal. NOTE: Windows only allows it to be so long.\n`
		db DOC_PAD, `If an odd number of characters or invalid data is given, an error is thrown. \`-x ffab0012\` is\n`
		db DOC_PAD, `equivalent to a file where the contents are \`\\xff\\xab\\x00\\x12\`. There cannot be \`0x\` at the\n`
		db DOC_PAD, `start of the string. There can not be spaces in between any of the bytes either.\n`
%endif ; %ifndef NO_ARG_X

%ifndef NO_ARG_O
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -o PATH             `, \
			`    -o, --outfile PATH  `)
		db          `Specify a file path for output redirection. An error is thrown if the file can't be opened for\n`
		db DOC_PAD, `writing. Use \`-o NUL\` to discard output entirely. The file is opened in append mode,\n`
		db DOC_PAD, `so it does not clear existing file content. If the file does not exist, it is created even if\n`
		db DOC_PAD, `no content is written to it. \n`
%endif ; %ifndef NO_ARG_O

%ifndef NO_ARG_E
		db %cond(%isdef(NO_LONG_ARGS), \
			`    -e PATH             `, \
			`    -e, --errfile PATH  `)
	%ifndef NO_ARG_O
		db          `Specify a file path for error output redirection. Fatal error messagess always use stderr,\n`
		db DOC_PAD, `regardless of if \`-e\` is passed. \`-e -\` resets the error output file to stderr.\n`
		db DOC_PAD, `Otherwise, \`-e\` has the same edge case behavior as \`-o\`.\n`
	%else
		db          `Specify a file path for error redirection. An error is thrown if the file can't be opened for\n`
		db DOC_PAD, `writing. Use \`-e NUL\` to discard non-fatal errors entirely. fatal errors always use stderr,\n`
		db DOC_PAD, `regardless of \`-e\`. The file is opened in append mode, so it does not clear existing file content.\n`
		db DOC_PAD, `If the file does not exist, it is created even if no content is written to it.\n`
		db DOC_PAD, `\`-e -\` resets the error output file to stderr.\n`
	%endif
%endif ; %ifndef NO_ARG_E

%ifndef NO_ARGFILES
		db `    @argfile            specify a file to read arguments from as if they were copy/pasted into the commandline.\n`
%endif
	
		db `\n` ;; space between the options and exit codes


%ifndef NO_DOCS_EXIT_CODE_TABLE
		db `Exit Codes:\n`
		db exitcode_spad(EXIT_SUCCESS),  `success\n`
		db exitcode_spad(EXIT_INTERNAL), `generic error\n`
		db exitcode_spad(EXIT_UNKN_ARG), `unknown argument\n`
		db exitcode_spad(EXIT_LATE_ARG1), `first-arg-only argument was given after the first argument\n`

%ifndef NO_ARG_P
		db exitcode_spad(EXIT_PNOVAL),   `\`-p\` was given without a value\n`
		db exitcode_spad(EXIT_PINVAL),   `\`-p\` was given with an invalid value\n`
		db exitcode_spad(EXIT_PNOPIPE),  `\`-p\` was given with value \`-\` when there is no pipeline\n`
%elif %isndef(NO_ARG_C) || %isndef(NO_ARG_F) || %isndef(NO_DIRECTIONS) || %isndef(NO_ARG_S) \
	|| %isndef(NO_ARG_X) || %isndef(NO_ARG_O) || %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_PNOVAL),   `unused\n`
		db exitcode_spad(EXIT_PINVAL),   `unused\n`
		db exitcode_spad(EXIT_PNOPIPE),  `unused\n`
%endif

%ifndef NO_ARG_C
		db exitcode_spad(EXIT_CNOVAL),   `\`-c\` was given with no values\n`
		db exitcode_spad(EXIT_C1VAL),    `\`-c\` was given with only one value\n`
		db exitcode_spad(EXIT_CINVAL1),  `\`-c\` was given with an invalid first value\n`
		db exitcode_spad(EXIT_CINVAL2),  `\`-c\` was given with an invalid second value\n`
%elif %isndef(NO_ARG_F) || %isndef(NO_DIRECTIONS) || %isndef(NO_ARG_S) || %isndef(NO_ARG_X) \
	|| %isndef(NO_ARG_O) || %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_CNOVAL),   `unused\n`
		db exitcode_spad(EXIT_C1VAL),    `unused\n`
		db exitcode_spad(EXIT_CINVAL1),  `unused\n`
		db exitcode_spad(EXIT_CINVAL2),  `unused\n`
%endif

%ifndef NO_ARG_F
		db exitcode_spad(EXIT_FNOVAL),   `\`-f\` was given without a value\n`
%elif %isndef(NO_DIRECTIONS) || %isndef(NO_ARG_S) || %isndef(NO_ARG_X) || %isndef(NO_ARG_O) \
	|| %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_FNOVAL),   `unused\n`
%endif

%ifndef NO_DIRECTIONS
		db exitcode_spad(EXIT_UNOSEEK),  `\`-u\` was used with a pipe or non-seekable file larger than `, %num(SCRATCH_BUF_LEN - 1), ` bytes\n`
%elif %isndef(NO_ARG_S) || %isndef(NO_ARG_X) || %isndef(NO_ARG_O) || %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_UNOSEEK),  `unused\n`
%endif

%ifndef NO_ARG_S
		db exitcode_spad(EXIT_SNOVAL),   `\`-s\` was given without a value\n`
%elif %isndef(NO_ARG_X) || %isndef(NO_ARG_O) || %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_SNOVAL),   `unused\n`
%endif

%ifndef NO_ARG_X
		db exitcode_spad(EXIT_XNOVAL),   `\`-x\` was given without a value\n`
		db exitcode_spad(EXIT_XODDLEN),  `\`-x\` was given with an odd-length value\n`
		db exitcode_spad(EXIT_XINVAL),   `\`-x\` was given with an invalid value\n`
%elif %isndef(NO_ARG_O) || %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_XNOVAL),   `unused\n`
		db exitcode_spad(EXIT_XODDLEN),  `unused\n`
		db exitcode_spad(EXIT_XINVAL),   `unused\n`
%endif

%ifndef NO_ARG_O
		db exitcode_spad(EXIT_ONOVAL),   `\`-o\` was given without a value\n`
		db exitcode_spad(EXIT_OFOLDER), %cond(%isdef(NO_FOLDER_CHECK), "unused", `\`-o\` was given a directory`), `\n`
		db exitcode_spad(EXIT_ONOPERM),  `\`-o\` could not open the file (miscellaneous/permission error)\n`
%elif %isndef(NO_ARG_E) || %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_ONOVAL),   `unused\n`
		db exitcode_spad(EXIT_OFOLDER),  `unused\n`
		db exitcode_spad(EXIT_ONOPERM),  `unused\n`
%endif

%ifndef NO_ARG_E
		db exitcode_spad(EXIT_ENOVAL),   `\`-e\` was given without a value\n`
		db exitcode_spad(EXIT_EFOLDER), %cond(%isdef(NO_FOLDER_CHECK), "unused", `\`-e\` was given a directory`), `\n`
		db exitcode_spad(EXIT_ENOPERM),  `\`-e\` could not open the file (miscellaneous/permission error)\n`
%elif %isndef(NO_ARGFILES)
		db exitcode_spad(EXIT_ENOVAL),   `unused\n`
		db exitcode_spad(EXIT_EFOLDER),  `unused\n`
		db exitcode_spad(EXIT_ENOPERM),  `unused\n`
%endif ; %ifndef NO_ARG_E

%ifndef NO_ARGFILES
		db exitcode_spad(EXIT_ARGFILE_INVAL),  `\`@argfile\` could not be opened.\n`
		db exitcode_spad(EXIT_ARGFILE_NOSEEK), `\`@argfile\` is not seekable.\n`
		db exitcode_spad(EXIT_ARGFILE_FOLDER), `\`@argfile\` is a folder and not a file.\n`
		db exitcode_spad(EXIT_ARGFILE_SIZE),   `\`@argfile\` is too large, malloc returned NULL\n`
		db exitcode_spad(EXIT_ARGFILE_DEPTH),  `\`@argfile\` exceeded depth max of 255\n`
%elif 0
		;; don't output anything because there are no exit codes after these ones.
		db exitcode_spad(EXIT_ARGFILE_INVAL),  `unused\n`
		db exitcode_spad(EXIT_ARGFILE_NOSEEK), `unused\n`
		db exitcode_spad(EXIT_ARGFILE_FOLDER), `unused\n`
		db exitcode_spad(EXIT_ARGFILE_SIZE),   `unused\n`
		db exitcode_spad(EXIT_ARGFILE_DEPTH),  `unused\n`
%endif ; %ifndef NO_ARGFILES

		; db `   -1   something is not implemented. see the error message for details\n`

		db `\n` ;; space between the exit codes and generic information.
%endif ; %ifndef NO_DOCS_EXIT_CODE_TABLE

%ifndef NO_PIPE
		db `By default, if input is piped, arguments before the first non input source argument will also\n`
		db `apply to the pipe. This can be changed by manually specifying \`-\` and/or \`-!\`.\n`
%endif
		;; TODO: maybe change the examples if -r or -l are disabled? or remove the examples entirely?
		db `All arguments can be passed multiple times. The most recent value is used, for example \`-r -l\` is the same as \`-l\`.\n`
		db `Arguments are processed in one pass, so argument order matters. Flags only apply to files after it.\n`
		db `Multi-character options like \`-abc\` are treated as a single entity, not as \`-a -b -c\`.\n`
%ifndef NO_WARN_UNUSED
		;; NOTE: an output argument is an argument that produces output.
		db `A warning is given for misplaced arguments after the last output argument. This does not change the exit code.\n`
%endif
		db `If a directory path is given instead of a file path, an error is given, but processing continues.\0`
%endif ; %ifdef NO_DOCS (else branch)
%endif ; %ifndef NO_ARG_H

%undef DOC_PAD
%endif ; %ifdef DLL. ;; this happened a long time ago

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
	debug_print_str `x = %llu\n\0`, %1
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

%ifndef NO_ARG_C
%ifdifi
static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_fw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	// output values, but start out as a2 and b2
	uint32_t a = cksm2 & 0xffff;
	uint32_t b = cksm2 >> 16;

	// aout = a1 + a2 + BASE - 1
	// bout = b1 + b2 + len2*(a1 - 1) + BASE

	// the `+ 65521u`s are to counteract negatives. For example, if a = 0 and x1 > 0, then
	// (a + x1) % BASE will be the wrong value, and (a + x1 + BASE) % BASE is the real value.
	// e.g. 15 % 65521 = 15, but (15 + 2^64 - 65521) % 65521 = 50640.
	x1--;
	a  += x1 + 65521u;
	x1 *= len2;
	b  += x1;
	b  += x2 + 65521u;

	// intel syntax
	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_bw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	// x1 = a3, x2 = b3

	// start as a2 and b2
	uint32_t a = cksm2 & 0xffff;
	uint32_t b = cksm2 >> 16;

	// aout = (a3 - a2 + 1 + BASE) % BASE
	// bout = (b3 - b2 - len2*(a1 - 1) + BASE*BASE) % BASE

	uint32_t a1 = (a3 - a2 + 1 + BASE) % BASE;
	uint32_t b1 = (b3 - b2 - len2*(a1 - 1) + BASE*BASE) % BASE;

	// intel syntax
	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

uint32_t adler32_combine(uint32_t cksm1, uint32_t cksm2, uint64_t len2, register uint8_t flags asm("r14b")) {
	uint32_t x1 = cksm1 & 0xffff;
	uint32_t x2 = cksm1 >> 16;

	len2 %= 65521u;

	// call them with no arguments to signify not changing any of the arguments.
	if ((flags & 4) == 0)
		adler32_combine_fw();
	else
		adler32_combine_bw();

	uint32_t a, b;

	asm volatile("mov %0, eax" : "=r" (a));
	asm volatile("mov %0, edx" : "=r" (b));

	a %= 65521u;
	b %= 65521u;

	return b << 16 | a;
}
%endif ; %ifdifi

adler32_combine: ; uint32_t adler32_combine(uint32_t cksm1 (or cksm3), uint32_t cksm2, uint64_t len2);
	;; NOTE: implicitly uses `r14` as a fourth argument for the program flags
	;;       except for in DLL mode, where it is a memory location
	;; len2 = r8
	;; temporary values, but start out as a1 and b1
	movzx	r9d, cx		; x2 = cksm1 & 0xffff // x1 = b1
	shr 	ecx, 16		;; move the upper half into cx
	movzx	ecx, cx		; x1 = cksm1 >> 16 // x2 = a1
	xchg	ecx, r9d	;; swap x1 and x2. x1 is used more often, so give it the shorter register opcode.

	;; NOTE: x1 (a1 or a3) = ecx
	;; NOTE: x2 (b1 or b3) = r9d

	mov 	r10d, edx	; preserve edx (cksm2)
	modbase_u64 r8		; len2 %= BASE;
	mov 	edx, r10d	; restore edx

%ifndef NO_DIRECTIONS
	;; if ((flags & (1 << 3)) == 0) // if (backwards_flag_bit == 0)
	;;     goto forwards;

	;; this makes the hot path (forwards) have one less jump instruction
	;; because of the branch fallthrough at the end.

%ifdef DLL
	bt  	dword [rel adler32_flags], DIR_BIT
	jc  	.backwards
%else
	test	r14b, DIR_BIT_VAL
	jnz 	.backwards
%endif ; %ifdef

	;; branch fallthrough
%endif ; %ifndef NO_DIRECTIONS
.forwards: ;; unused label. only for clarity
	;; input values
	movzx	eax, dx		; eax = a = cksm2 & 0xffff;
	shr 	edx, 16		; move cksm2 upper half into dx
	movzx	edx, dx		; edx = b = cksm2 >> 16;

	;; ecx = x1 (a1)
	;; r9d = x2 (b1)
	;; eax = a
	;; edx = b
	;; r8d = len2

	;; actual algorithm
	dec 	ecx							; x1--;
	lea 	eax, [eax + ecx + BASE]		; a += x1 + BASE;
	imul	ecx, r8d					; x1 *= len2; // very close to 32-bit overflow
	lea 	edx, [edx + r9d + BASE]		; b = x2 + BASE;
	add 	edx, ecx					; b += x1;

	;; r8d = a
	;; r9d = b
	;; eax = tmp a
	;; edx = tmp b

	mov 	r9d, edx	;; r9d = b
	mov 	ecx, eax	;; ecx = a

	modbase_u32 ecx
	modbase_u32 r9d

	mov 	eax, r9d	; retn_val = b;
	shl 	eax, 16		; retn_val <<= 16;
	or  	eax, ecx	; retn_val |= a;
	ret

%ifndef NO_DIRECTIONS
.backwards:
	;; input values
	movzx	r10d, dx	; a2 = cksm2 & 0xffff;
	shr 	edx, 16		;; move upper half into dx
	movzx	r11d, dx	; b2 = cksm2 >> 16;

	;; rcx = x1 (a3)
	;; r9  = x2 (b3)
	;; r10 = a2, then a1
	;; r11 = b2, then b1
	;; r8  = len2

	;; actual algorithm
	neg 	r10d							; a2 = -a2;
	lea 	r10d, [r10 + rcx + BASE + 1]	; a2 += x1 + BASE + 1; // use 64-bit inputs for shorter opcodes
	modbase_u32 r10d						; a2 %= BASE;

	;; NOTE: I honestly have no idea why it is + 2^32 - BASE*BASE rather than
	;;       + BASE*BASE - 2^32, but this passes the tests and the other way doesn't. :|
	lea 	ecx, [r10d - 1]					; x1 = a2 - 1;
	imul	ecx, r8d						; x1 *= len2;
	lea 	ecx, [rcx + r11 + 0x1dff1f]		; x1 += b2 + (1 << 32) - BASE*BASE
	sub 	r9d, ecx						; x2 -= x1;
	modbase_u32 r9d

	mov 	eax, r9d	; retn_val = x2;
	shl 	eax, 16		; retn_val <<= 16;
	or  	eax, r10d	; retn_val |= a2;
	ret
%endif ; %ifndef NO_DIRECTIONS
%endif ; %ifndef NO_ARG_C

;; TODO: add documentation to the internal buffer digest functions

;; Variables:
	;; a              : rbx
	;; b              : rbp
	;; i              : r8d
	;; bytes_read     : eax
	;; BASE (65521)   : r12
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; tmp1           : rdx
	;; tmp2           : rcx (only if UNROLL_N > 1)

	;; return values: bytes_read (r8d), a (ebx), b (ebp)

;; NOTE: technically, r13 doesn't need to be [rel scratch_buffer], but it probably
;;       will be for most input methods, except maybe for immedate value strings.
;;       for immediate value strings, `bytes_read` is really `data_length`.
;;       it should be fine as long as it is less than ~362 MiB.

;; perform a checksum of the given buffer with a single modulo at the end.

;; this is defined as a macro because it is inlined if -DBARE_BONES is given.
%macro _adler32_digest_buffer_fw_macro 0
	xor 	r8d, r8d	; uint32_t i = 0;
%if UNROLL_N == 1 ;; start of for loop
%%for@start:
	cmp 	r8d, eax
	je  	%%done		; if (i == bytes_read) break; // while (i < bytes_read) { ... }

	movzx	edx, byte [r13 + r8]
	add 	rbx, rdx	; a += scratch_buffer[i]
	add 	rbp, rbx	; b += a
%%for@inc: ;; unused label. for clarity
	inc 	r8d
	jmp 	%%for@start
%else ;; end UNROLL_N == 1 branch.
%%for@start:
	add 	r8d, UNROLL_N
	cmp 	r8d, eax
	ja  	%%for@done	; if (i + N >= bytes_read) break; // while (i + N < bytes_read) { ... }

	;; these use subtraction instead of addition them because of the `i += N` at the start of the loop.
	;; NOTE: the order matters, so this has to be i = N...1, and can't be i = 1...N
%assign i UNROLL_N
%rep UNROLL_N
	movzx	edx, byte [r13 + r8 - i]	; tmp = scratch_buffer[i]
	add 	rbx, rdx					; a += scratch_buffer[i]
	add 	rbp, rbx					; b += a
	%assign i i - 1
%endrep

	jmp 	%%for@start
%%for@done:
	sub 	r8d, UNROLL_N		;; counteract the `add r8d, N` at the start of the loop.

	;; setup jump address
	mov 	edx, r8d			; tmp = i;
	sub 	edx, eax			; tmp = i - bytes_read == -(bytes_read - i);
	add 	edx, UNROLL_N - 1	; tmp = (N - (bytes_read - i));
	shl 	edx, 4				; tmp = 16*(N - (bytes_read - i));
	mov 	rcx, $				;; 10 byte instruction
	lea 	rdx, [rcx + (10 + 5 + 2) + rdx] ;; 5 byte instruction

	; rip + distance to .case_%[N-1] + 16*((N - 1) - (bytes_read - i))
	jmp 	rdx ;; 2 byte instruction
	;; NOTE: the mov instruction is 10 bytes, the lea instruction is 4 bytes, and `jmp rdx` is 2 bytes.
	;; this assumes that `.case_%[N - 1]` is directly after `jmp rdx`. this should be the case.
	;; the 16*(N - 1) comes from the constant term of 16*(N - 1 - (bytes_read - 1)),
	;; which in turn comes from how the cases are in reverse (e.g. case N-1 is 0th, case N-2 is 1st, etc.)
%assign i UNROLL_N - 1

;; the cases are intended to fall through to the next case.
;; handle the last remaining (N-1 to 1) bytes.
%rep UNROLL_N - 1
%%case_%[i]_leftover: ;; i is the number of bytes left to be processed
	movzx	edx, byte [r13 + r8] ; tmp = scratch_buffer[i]
	add 	rbx, rdx	; a += tmp
	add 	rbp, rbx	; b += a
	add 	r8d, 1		;; `inc r8d` but one byte longer for alignment. avoids `nop` instruction.

	%assign i i - 1
%endrep
%%case_0_leftover:
	;; do modulos, etc.

%undef i
%endif ;; end UNROLL_N != 1 branch. end of for loop
%%done:
	mov 	r8d, eax	; save bytes_read into r8d

	modbase_u64 rbx
	modbase_u64 rbp
%endm ; _adler32_digest_buffer_fw_macro

%ifndef BARE_BONES
%cond(%isndef(NO_ALIGN), align 64) ;; align to the next cache line. hot function.
_adler32_digest_buffer_fw:
_adler32_digest_buffer_fw_macro
	ret
%endif ; %ifndef BARE_BONES


%ifndef NO_DIRECTIONS
;; Variables:
	;; a              : rbx
	;; b              : rbp
	;; bytes_read / i : rax
	;; tmp            : rdx
	;; BASE (65521)   : r12
	;; scratch_buffer : r13

%cond(%isndef(NO_ALIGN), align 64) ;; the last function should be close to a boundary already
_adler32_digest_buffer_bw:
.loop:
	test	eax, eax				; while (i > 0) {
	jz  	.done
	dec 	eax						;     i--;

	movzx	edx, byte [r13 + rax]	;     tmp = scratch_buffer[i];
	sub 	rbp, rbx				;     b  -= a;
	sub 	rbx, rdx				;     a  -= tmp;

	jmp 	.loop					; }
.done:
	;; a = a % BASE + (a < 0)*BASE;
	modbase_i64 rbx, rcx
	lea 	rdx, [r12 + rbx]		; tmp = a + BASE;
	test	rbx, rbx				; if (a < 0)
	cmovs	rbx, rdx				;     a += BASE;

	;; b = b % BASE + (b < 0)*BASE;
	;; TODO: perhaps use a different clobber than rcx for this for better pipelinability?
	modbase_i64 rbp, rcx
	lea 	rdx, [r12 + rbp]		; tmp = b + BASE;
	test	rbp, rbp				; if (b < 0)
	cmovs	rbp, rdx				;     b += BASE;
	ret
%endif ; %ifndef NO_DIRECTIONS

%ifndef DLL_NO_FP
;; remove adler32_fp, adler32_fp_fw, adler32_fp_bw, and adler32_fname if -DLL_NO_FP is given.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; adler32_fp_fw ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; NOTE: nmax is the number of bytes that can be processed before a modulo is required.
;; nmax for 32 bits  : 5,552                     (5 KiB   ≈ 2^12)
;; nmax for 64 bits  : 380,368,439               (363 MiB ≈ 2^28)
;; nmax for 128 bits : 1,633,671,114,142,571,306 (1 EiB   ≈ 2^60)

;; with 64-bit intermediate values, a modulo is only required every 363 MiB to prevent
;; overflow, but that is too much memory to use at once, so this implementation applies
;; the modulo at the end of every 64 KiB block instead. using 128-bit intermediate values,
;; you can ignore doing modulos until the end. the methodology in finding the NMAX values is
;; this function: `nmax_f = lambda n, bits: 255*n*(n + 1)//2 + (n + 1)*(BASE - 1) - 2**bits + 1`
;; and then you maximize the `n` while ensuring `nmax_f(n, bits) < 0`. This formula is from zlib
;; and then I just expanded it to also work with different bit widths. you can also use the
;; explicit formula: `Floor[(Sqrt[17104714185 + 2040 2^bits] - 131295)/510]`
;; https://github.com/madler/zlib/blob/e9d5486e6635141f589e110fd789648aa08e9544/adler32.c#L12

;; the buffer size of 64 KiB was chosen as a balance between speed and memory.
;; this probably has something to do with the size of the L1 cache. (64 KiB/core on my machine)
;; Use `./adler32-perftest-bufsize.ps1` to verify the optimal buffer size on your machine.
;; It doesn't actually give statistics, so you have to analyze it yourself.

;; a register is required for the scratch buffer because `byte [rel scratch_buffer + rdi]`
;; doesn't work (RIP address with register offset). and you can't do `[scratch_buffer + rdi]`
;; because Windows uses 32-bit addressing for some brain-dead reason.

%ifdifi
uint32_t adler32_fp_fw_v2(FILE *fp, uint32_t prev_cksm) {
	uint64_t a = prev_cksm & 0xffff, b = prev_cksm >> 16;
	uint32_t bytes_read;

	do {
		bytes_read = fread(scratch_buffer, sizeof(char), SCRATCH_BUF_LEN, fp);

		// this is for UNROLL_N=4
		uint32_t i = 0;
		for (; i + 4 < bytes_read; i += 4) {
			b += a += scratch_buffer[i + 0];
			b += a += scratch_buffer[i + 1];
			b += a += scratch_buffer[i + 2];
			b += a += scratch_buffer[i + 3];
		}

		// this switch argument might be off by 1 here, but it isn't in the assembly version.
		switch (bytes_read - i) {
			default: __builtin_unreachable();
			case 3: b += a += scratch_buffer[i]; i++;
			case 2: b += a += scratch_buffer[i]; i++;
			case 1: b += a += scratch_buffer[i]; i++;
			case 0: // do nothing
		}

		a %= 65521u;
		b %= 65521u;
	} while (bytes_read == SCRATCH_BUF_LEN);

	return b << 16 | a;
}
%endif

;; buffered adler32 given a file pointer as input. reads in 64 KiB at a time
;; this should work for stdin since `fread` doesn't lock if there are no more characters
;; returns the file checksum.
;; forwards version

;; Variables and locations stored
	;; a              : rbx
	;; b              : rbp
	;; bytes_read     : r8d
	;; BASE (65521)   : r12
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; fp             : r14
;; uint32_t adler32_fp_v2_fw(FILE *const fp, uint32_t prev_cksm);
;; if -u/-d/-D are disabled, rename this function to adler32_fp.
%cond(%isdef(NO_DIRECTIONS),adler32_fp,adler32_fp_fw):
	push	rbx	; a
	push	rbp	; b
	push	r12	; BASE. ;; NOTE: this function doesn't need prev_cksm, so overwriting r12d is okay.
	push	r13	; scratch buffer
	push	r14	; fp
	sub 	rsp, 32

	;; set a and b
	movzx	ebx, dx
	shr 	edx, 16
	movzx	ebp, dx

	;; NOTE: a register is used for the scratch buffer because of `movzx edx, byte [r13 + r8]`.
	;;       you can't use a relative base address with a register offset.
	mov 	r12d, BASE
	mov 	r14, rcx
	lea 	r13, [rel scratch_buffer]
.do@start:
	; bytes_read = fread(scratch_buffer, sizeof(char), BUF_LEN, fp);
	mov 	rcx, r13				; scratch_buffer
	mov 	edx, 1					; sizeof(char)
	mov 	r8d, SCRATCH_BUF_LEN	; sizeof(scratch_buffer)
	mov 	r9, r14					; fp
	call	fread ;; eax = bytes_read

%ifdef BARE_BONES
	_adler32_digest_buffer_fw_macro
%else
	call	_adler32_digest_buffer_fw ; `mov r8d, eax` (among other side-effects)
%endif
.do@cond: ; unused label. only for clarity
	cmp 	r8d, SCRATCH_BUF_LEN
	je  	.do@start	; if (bytes_read == BUF_LEN) goto do_start;

	mov 	eax, ebp	; b
	shl 	eax, 16
	or  	eax, ebx	; a
.done:
	add 	rsp, 32
	pop 	r14
	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
	ret

%ifndef NO_DIRECTIONS
;; decide between the forwards and backwards versions of adler32_fp.
;; put this one before `adler32_fp_bw` so the jumps can both be short jumps instead of near jumps.
adler32_fp:
	; if ((r14b & 4) == 0)
	;     goto adler32_fp_fw;
%ifdef DLL
	bt  	dword [rel adler32_flags], DIR_BIT
	jnc 	adler32_fp_fw
%else
	test	r14b, DIR_BIT_VAL	; if ((r14b & 4) == 0)
	jz  	adler32_fp_fw		;     goto adler32_fp_fw;
%endif ; %ifdef
	;; fallthrough into adler32_fp_bw

;; Variables:
	;; bytes_read     : rax
	;; a              : rbx
	;; b              : rbp
	;; pos            : rdi
	;; len            : rsi / esi
	;; BASE (65521)   : r12
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; fp             : r14
adler32_fp_bw: ; uint32_t adler32_fp_bw(FILE *fp, uint32_t prev_cksm);
	;; it is possible that the seeking and telling doesn't work for large files. idk.
	;; https://stackoverflow.com/questions/4034227

	;; NOTE: this function doesn't need `prev_cksm`, so overwriting r12d is okay.
	push	rbx			;; a
	push	rbp			;; b
	push	rdi			;; pos
	push	rsi			;; len
	push	r12			;; BASE
	push	r13			;; scratch buffer
	push	r14			;; fp
	sub 	rsp, 32		;; shadow space

	movzx	ebx, dx		;; rbx = a; int64_t a = prev_cksm & 0xffff;
	shr 	edx, 16		;; shift upper half into lower half
	movzx	ebp, dx		;; rbp = b; int64_t b = prev_cksm >> 16;

	mov 	r12d, BASE					;; r12 = BASE
	lea 	r13, [rel scratch_buffer]	;; r13 = scratch_buffer
	mov 	r14, rcx					;; r14 = fp

;	mov rcx, r14		;; redundant instruction.
	xor 	edx, edx	;; offset = 0
	mov 	r8d, 2		;; SEEK_END = 2
	call	fseek

	test	eax, eax
	jnz 	.non_seekable_file

	mov 	rcx, r14	;; fp
	call	ftell
	mov 	rdi, rax				; uint64_t pos = ftell(fp);

	mov 	esi, SCRATCH_BUF_LEN	; uint32_t len = SCRATCH_BUF_LEN;

	;; do-while loop. fallthrough on loop breaks at the expense of slightly worse performance for empty files.
.loop:
	cmp 	rdi, rsi	; if (pos < len) // NOTE: `len == SCRATCH_BUF_LEN`
	cmovb	esi, edi	;     len = (uint32_t) pos;

	sub 	rdi, rsi	; pos -= (uint64_t) len; // rewind one section, or the remaining distance

	mov 	rcx, r14	;; fp
	mov 	rdx, rdi	;; pos
	xor 	r8d, r8d	;; SEEK_SET = 0
	call	fseek

	mov 	rcx, r13	;; scratch_buffer
	mov 	edx, 1		;; sizeof(char)
	mov 	r8d, esi	;; len. using 32-bits is fine here.
	mov 	r9, r14		;; fp
	call	fread		; bytes_read = fread(scratch_buffer, sizeof(char), len, fp)
	;; NOTE: fread will always return `len`. the reason is left as an exercise to the reader :|

	call	_adler32_digest_buffer_bw

	test	rdi, rdi	; if (pos != 0)
	jnz 	.loop		;     goto loop;
	;; branch fallthrough for `pos == 0` (no more bytes left)
.done: ;; unused label. only for clarity.
	;; return b << 16 | a;
	mov 	eax, ebp	; tmp = b
	shl 	eax, 16		; tmp = b << 16
	or  	eax, ebx	; tmp = b << 16 | a
.exit:
	add 	rsp, 32
	pop 	r14		;; fp
	pop 	r13		;; scratch buffer
	pop 	r12		;; BASE
	pop 	rsi		;; len
	pop 	rdi		;; pos
	pop 	rbp		;; b
	pop 	rbx		;; a
	ret
.non_seekable_file:
	;; technically there can also be OS errors that make `fseek` return nonzero,
	;; but it should be fine probably, idk. whatever I guess.

	;; just try it and see what happens.
	mov 	rcx, r13				;; scratch_buffer
	mov 	edx, 1					;; sizeof(char)
	mov 	r8d, SCRATCH_BUF_LEN	;; sizeof(scratch_buffer)
	mov 	r9, r14					;; fp
	call	fread					;; eax = bytes_read

	;; assume it is longer than one buffer if it filled the buffer. technically
	;; if the file is the same length as the buffer, this is an incorrect result,
	;; but that is such a tiny edge case that I don't really care.

	;; For DLL/STATIC, return an error code, and for EXE, exit the program.
%ifdef DLL
	xor 	ecx, ecx
	dec 	ecx			;; ecx = -1;
	cmp 	eax, SCRATCH_BUF_LEN
	cmove	eax, ecx
	je  	.exit
%else ; %ifdef DLL
	cmp 	eax, SCRATCH_BUF_LEN
	je  	.non_seekable_large_file
%endif ; %ifdef DLL (else branch)

	call	_adler32_digest_buffer_bw
	jmp 	.done

%ifndef DLL
.non_seekable_large_file: ;; unused label. only for clarity.
	;; file is non seekable and longer than a single scratch buffer.
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel non_seekable_large_file_undo_str]
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_UNOSEEK
	call	exit
%endif ; %ifndef DLL
%endif ; %ifndef NO_DIRECTIONS

;; compute the adler32 checksum of a file given the file name as a string
%ifndef DLL_NO_FNAME
adler32_fname:
	;; uint32_t adler32_fname(char *filename, uint32_t previous_checksum);
	push	r12
	push	r13

	sub 	rsp, 40		;; shadow space

	mov 	r12, rcx	;; file name
	mov 	r13d, edx	;; input checksum

%ifndef NO_FOLDER_CHECK
;	mov 	rcx, r12	;; redundant instruction
	call	GetFileAttributesA

	cmp 	eax, 0xffffffff ;; GetFileAttributesA returns -1 on errors.
	je  	.invalid_file

	test	al, 16 ; FILE_ATTRIBUTE_DIRECTORY
	jnz 	.directory_passed

	mov 	rcx, r12 ; this argument restoration is only needed if `GetFileAttributesA` is called.
%endif ; %ifndef NO_FOLDER_CHECK
	lea 	rdx, [rel file_rb_mode]
	call	fopen

	;; this probably gives a slightly misleading error message, but it shouldn't matter.
	test	rax, rax		;; if (fopen(filename, "rb") == NULL)
	jz  	.invalid_file	;;     goto invalid_file;

	mov 	r12, rax	; r12 = fp;

	mov 	rcx, rax	; rcx = fp;
	mov 	edx, r13d	; rdx = input hash;
	call	adler32_fp	; rax = adler32_fp(fp, prev_cksm)

	xchg	rax, r12	; swap(&checksum, &fp)

	mov 	rcx, rax
	call	fclose

	mov 	eax, r12d	; rax = checksum
.done:
	add 	rsp, 40
	pop 	r13
	pop 	r12
	ret
.invalid_file:
	;; give an invalid value (0xffffffff). the max valid value is 0xfff0fff0
	xor 	eax, eax
	dec 	eax

	jmp 	.done		; leave, pop r12, ret
%ifndef NO_FOLDER_CHECK
.directory_passed:
	;; give an invalid value (0xfffffffe). the max valid value is 0xfff0fff0
	mov 	eax, -2

	jmp 	.done
%endif ; %ifndef NO_FOLDER_CHECK
%endif ; %ifndef DLL_NO_FNAME
%endif ; %ifndef NLL_NO_FP

%ifndef NO_ARG_S
%ifdifi
uint32_t adler32_str(char *str, uint32_t prev_cksm) {
	// approximate C version, without the extra setup for r12 and r13.
	uint64_t
		a = prev_cksm & 0xffff,
		b = prev_cksm >> 16;

	uint32_t len = strlen(str);

	if (r14b & 4)
		_adler32_digest_buffer_bw();
	else
		_adler32_digest_buffer_fw();

	return b << 16 | a;
}
%endif

;; calculates the checksum of a string given through `argv`.
adler32_str: ; uint32_t adler32_str(char *str, uint32_t prev_cksm);
	;; implicitly takes r14b as a third argument

	;; NOTE 1: `_adler32_digest_buffer_fw` relies on `r13`, not `[rel scratch_buffer]`.
	;; NOTE 2: since the string is already loaded into memory, use 362 MiB blocks instead of 64 KiB.
	;; NOTE 3: 362 MiB < 2^32 bytes.
	;; NOTE 4: you can safely assume that `strlen(str)` is less than 362 MiB.
	;;         on Windows, the max is 2^15 characters, and not ~2^28 characters (362 MiB worth).
	;;         on Linux, the max is like 2 MiB or something, still less than 362 MiB though.
	;;         either way, it only requires one modulo, and thus one call to `_adler32_digest_buffer_fw`.

	;; which notes imply which optimizations is left as an excercise to the reader :|

	push	rbx			;; a
	push	rbp			;; b
	push	r12			;; BASE
	push	r13			;; str
	sub 	rsp, 32 + 8	;; shadow space + alignment

	movzx	ebx, dx		; a = prev_cksm & 0xffff
	shr 	edx, 16		;; move upper half into lower half
	movzx	ebp, dx		; b = prev_cksm >> 16;

	mov 	r12d, BASE	;; r12 = BASE
	mov 	r13, rcx	;; r13 = str

;	mov 	rcx, rcx	;; reduntant instruction. included for clarity.
	call	strlen		;; eax = strlen(str);

%ifndef NO_DIRECTIONS
%ifdef DLL
	bt  	dword [rel adler32_flags], DIR_BIT
	jnc 	.forwards
%else	
	test	r14b, DIR_BIT_VAL
	jz  	.forwards
%endif ; %ifdef DLL
.backwards: ;; unused label
	call	_adler32_digest_buffer_bw
	jmp 	.done
.forwards:
%endif ; %ifndef NO_DIRECTIONS
	call	_adler32_digest_buffer_fw
.done:
	mov 	eax, ebp	;; eax = b
	shl 	eax, 16		;; eax = b << 16
	or  	eax, ebx	;; eax = b << 16 | a

	add 	rsp, 32 + 8
	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
	ret
%endif ; %ifndef NO_ARG_S

%ifndef NO_ARG_X
%ifdifi
uint32_t adler32_hex(char *str, uint32_t prev_cksm) {
	// approximate C version, without the extra setup for r12 and r13.
	uint64_t
		a = prev_cksm & 0xffff,
		b = prev_cksm >> 16;

	uint32_t len = strlen(str);

	if (len & 1) {
		fprintf(stderr, "\e[31mERROR: argument `-x` given with an odd-length value.\e[0m\n");
		exit(EXIT_XODDLEN);
	}

	len >>= 1;

	for (uint32_t i = 0; i < len; i++) {
		uint32_t c = hex_to_u8(str + 2*i);

		if (c == -1) {
			fprintf(stderr, "\e[31mERROR: argument `-x` given with an invalid value at byte index %u.\e[0m\n");
			exit(EXIT_XINVAL);
		}

		str[i] = c & 0xff;
	}

	str[len] = '\0';

	if (r14b & 4)
		_adler32_digest_buffer_bw();
	else
		_adler32_digest_buffer_fw();

	return b << 16 | a;
}
%endif

;; NOTE: the program exits from here, where in most places the exiting happens in process_arg.
adler32_hex: ; uint32_t adler32_hex(char *str, uint32_t prev_cksm);
	;; NOTE: clobbers the string, updating it to the actual byte data the original value represented.
	push	rbx			;; a
	push	rbp			;; b
	push	r12			;; BASE
	push	r13			;; str
	sub 	rsp, 32 + 8	;; shadow space + alignment

	movzx	ebx, dx		; uint64_t a = prev_cksm & 0xffff;
	shr 	edx, 16		;; move upper half into lower half
	movzx	ebp, dx		; uint64_t b = prev_cksm >> 16;

	mov 	r12d, BASE	;; r12 = BASE
	mov 	r13, rcx	;; r13 = str

	;; `len` is always less than one buffer size. On Linux, this wouldn't be guaranteed (I think, idk).
	;; see `adler32_str` for the reasoning.
	;; ^^^ this is also only true if the scratch buffer is 32 KiB or longer.
;	mov 	rcx, rcx	;; redundant instruction
	call	strlen

%ifdef DLL
	mov 	ecx, -1
	test	al, 1		; if (length & 1)
	cmovnz	eax, ecx	;     return -1;
	jnz 	.exit
%else
	test	al, 1		; if (length & 1)
	jnz 	.odd_length	;     goto odd_length;
%endif

	;; this next line drops off the least significant bit,
	;; which is why the last character is ignored for odd-length inputs.
	shr 	eax, 1				; len /= 2; // output length, not input length.
	mov 	r10d, eax			;; preserve `len` because `eax` is clobbered by `hex_to_u8`
	xor 	r9d, r9d			; uint32_t r9d = 0; // r9d
.loop:
	cmp 	r9d, r10d			; while (i < len) {
	je  	.endloop

	lea 	rcx, [r13 + 2*r9]	;     tmp = str + 2*i;

	;; NOTE: hex_to_u8 doesn't clobber r9 or r10.
	call	hex_to_u8			;     tmp2 = hex_to_u8(str + 2*i);
%ifdef DLL						; #ifdef DLL
	mov 	ecx, -2
	cmp 	eax, 0xffffffff		;     if (hex_to_u8(str + 2*i) == -1)
	cmove	eax, ecx			;         return -1;
	je  	.exit
%else							; #else
	cmp 	eax, 0xffffffff		;     if (hex_to_u8(str + 2*i) == -1)
	je  	.invalid_byte_value	;         goto invalid_byte_value;
%endif ; %ifdef DLL				; #endif

	mov 	byte [r13 + r9], al	;     str[i] = hex_to_u8(str + 2*i);
	inc 	r9d					;     i++;

	jmp 	.loop				; }
.endloop:
	mov 	byte [r13 + r9], `\0`	; str[i] = '\0';
	mov 	eax, r9d				; len = i; // (but in eax now for the buffer digest functions.)
%ifndef NO_DIRECTIONS
	;; NOTE: all the variables should be set up now.
%ifdef DLL
	bt  	dword [rel adler32_flags], DIR_BIT	; if ((r14b & 4) == 0)
	jnc 	.forwards							;     goto forwards;
%else
	test	r14b, DIR_BIT_VAL	; if ((r14b & 4) == 0)
	jz  	.forwards			;     goto forwards;
%endif ; %ifdef
	;; branch fallthrough
.backwards: ;; unused label. for clarity
	call	_adler32_digest_buffer_bw
	jmp 	.done
.forwards:
%endif ; %ifndef NO_DIRECTIONS
	call	_adler32_digest_buffer_fw
.done:
	mov 	eax, ebp	; ret = b;
	shl 	eax, 16		; ret = b << 16;
	or  	eax, ebx	; ret = b << 16 | a;
.exit:
	add 	rsp, 40
	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
	ret
%ifndef DLL
.odd_length:
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel hex_odd_length_str]
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_XODDLEN
	call	exit
.invalid_byte_value:
	%ifndef NO_FATAL_MESSAGES
		mov 	rcx, [rel pstderr]
		lea 	rdx, [rel hex_invalid_byte_str]
		mov 	r8d, r9d	; NOTE: r9d is the loop index register
		call	fprintf
	%endif ; %ifndef NO_FATAL_MESSAGES

	mov 	ecx, EXIT_XINVAL
	call	exit
%endif ; %ifdef DLL (else branch)
%endif ; %ifndef NO_ARG_X

%ifndef DLL
	;; with -DLL, ignore everything after this point up until `DllMain`

%ifndef NO_PIPE
process_pipe: ; void process_pipe(uint32_t prev_cksm /*r12d*/, uint8_t flags /*r14b*/);
	sub 	rsp, 32 + 8

	mov 	eax, r12d			;; in case the pipe bit isn't set.

	test	r14b, PIPE_BIT_VAL	;; if the pipeline was not given,
	jz  	.print				;;     just print the previous checksum

	mov 	rcx, [rel pstdin]
	mov 	edx, r12d			;; prev
	call	adler32_fp			; uint32_t checksum = adler32_fp(stdin, prev);

%ifndef NO_ARG_I
	test	r14b, INC_BIT_VAL	; if (flags & incremental_bit)
	cmovnz	r12d, eax			;     prev_cksm = cksm;
%endif

	;; branch fallthrough
.print: ; assumes `edx` (checksum) has already been set
;; NOTE: this can be optimized slightly more to eek out a couple more bytes, but it requires like
;;       double the comptime complexity. It follows the same optimization used in v5.0 and earlier.
;;       because of this, I don't think it is worth it anymore. previously it was just like two extra lines.
%ifdef NO_ARG_O
	lea 	rcx, [rel valid_line_fmt]
	lea 	%cond(%isdef(FMT_SWAP_ARGS), rdx, r8), [rel pipeline_filename_str]
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r8d, edx), eax
	call	printf		; printf(valid_line_fmt, checksum, "[PIPE]") // or with swapped args
%else
	mov 	rcx, [rel poutfile]
	lea 	rdx, [rel valid_line_fmt]
	lea 	%cond(%isdef(FMT_SWAP_ARGS), r8, r9), [rel pipeline_filename_str]
	mov 	%cond(%isdef(FMT_SWAP_ARGS), r9d, r8d), eax
	call	fprintf		; fprintf(*poutfile, valid_line_fmt, checksum, "[PIPE]") // or with swapped args
%endif ; %ifdef NO_ARG_O (else branch)

	add 	rsp, 32 + 8
	ret

;; reads the value into the scratch buffer.
;; skips past whitespace (c < 33) at the start of stdin, and then reads at most 8 characters after it.
;; returns a pointer to the scratch buffer

pipe_read_hex32: ; void *pipe_read_hex32(void);
	push	rbx
	push	rdi
	push	rsi
	sub 	rsp, 32

	xor 	ebx, ebx		; uint8_t i = 0;
	lea 	rdi, [rel scratch_buffer]
.skip_whitespace@loop:
	call	getchar

	cmp 	eax, 0xffffffff	; if (c == EOF)
	je  	.done			;     goto done;

	cmp 	al, ' ' + 1
	jb  	.skip_whitespace@loop
	;; branch fallthrough
.skip_whitespace@done:
	mov 	byte [rdi], al	; scratch_buffer[0] = c;
	inc 	bl				; i = 1; // the first character was just read.

	lea 	rcx, [rdi + 1]	;; scratch_buffer + 1
	mov 	edx, 1			;; sizeof(char)
	mov 	r8d, 7			;; 7 characters (the first character was already read)
	mov 	r9, [rel pstdin]
	call	fread			; tmp = fread(scratch_buffer, 1, 7, stdin);

	inc 	al
	mov 	sil, al			; uint8_t length = 1 + fread(...)
.pipe_read@loop:
	cmp 	bl, sil
	je  	.done

	movzx	ecx, byte [rdi + rbx]
	call	isxdigit

	test	al, al
	jz  	.done

	inc 	bl

	jmp 	.pipe_read@loop
.done:
	mov 	byte [rdi + rbx], `\0` ; scratch_buffer[i] = '\0';
	mov 	rax, rdi	; return scratch_buffer

	add 	rsp, 32
	pop 	rsi
	pop 	rdi
	pop 	rbx
	ret

%ifdifi
uint64_t pipe_read_u64(void) {
	uint64_t x;
	scanf("%llu", &x);
	return x;
}
%endif
pipe_read_u64:
	sub 	rsp, 48

	mov 	qword [rsp + 32], 0
	lea 	rcx, [rel fmt_llu]
	lea 	rdx, [rsp + 32]
	call	scanf			; scanf("%llu", &x);

	mov		rax, [rsp + 32]	; return x;
	add 	rsp, 48
	ret
%endif

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
%endif

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

%ifdef BARE_BONES
	;; 32 for shadow space, 16 for variables, and 8 more instead of `push rbp`
	%assign main_stack_space 56
%else
	;; 32 for shadow space + 8 more instead of `push rbp`
	%assign main_stack_space 40
%endif

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
%else ; %ifndef DLL

%ifdifi
uint32_t adler32_buf_fw(uint8_t *_buf, uint32_t prev, uint64_t _length) {
	if (_length == 0)
		return prev;

	uint64_t a = prev & 0xffff; // rbx
	uint64_t b = prev >> 16;    // rbp

	r12d = 65521;
	uint8_t *buf = _buf; // r13
	uint64_t total_len = _length; // r9

loop:
	uint64_t tmp = 380368439; // r10d
	do {
		uint64_t cur_len = tmp; // eax

		if (total_len < cur_len)
			cur_len = total_len;

		total_len -= cur_len;

		_adler32_buffer_digest_fw(); // takes arguments in weird places.
			// rbx = a, rbp = b, eax = data length, r12 = 65521, r13 = buffer

		// `_adler32_buffer_digest_fw` moves eax to r8d
		buf += cur_len; // r13 += r8
	} while (total_len != 0);

	return b << 16 | a;
}

uint32_t adler32_buf_bw(uint8_t *_buf, uint32_t prev, uint64_t _length) {
	if (_length == 0)
		return prev;

	uint64_t a = prev & 0xffff; // rbx
	uint64_t b = prev >> 16;    // rbp

	r12d = 65521;
	uint8_t *buf = _buf + _length; // r13. point to the end of the buffer
	uint64_t total_len = _length; // r9
	uint64_t tmp = 380368439; // r10d

	do {
		uint64_t cur_len = tmp; // eax

		if (total_len < cur_len)
			cur_len = total_len;

		total_len -= cur_len;
		buf -= cur_len; // move the pointer to the start of the section

		_adler32_buffer_digest_bw(); // takes arguments in weird places.
			// rbx = a, rbp = b, eax = data length, r12 = 65521, r13 = buffer
	} while (total_len != 0);

	return b << 16 | a;
}
%endif

;; _adler32_digest_buffer_fw only clobbers rcx if UNROLL_N > 1.
%xdefine len	%cond(UNROLL_N == 1, rcx, r9 )
%xdefine len32	%cond(UNROLL_N == 1, ecx, r9d)

extern printf

%cond(%isdef(NO_DIRECTIONS),adler32_buf,adler32_buf_fw):
	; uint32_t adler32_buf_fw(uint32_t prev_cksm, uint8_t *buffer, uint64_t length);
	; swap rcx and rdx
	;; do the zero length test before the function prologue to avoid extra instructions
	test	r8, r8		; if (len2 == 0)
	cmovz	eax, ecx	;     return prev_cksm;
	jz  	.ret

	test	rdx, rdx	; if (buffer == NULL)
	cmovz	eax, ecx	;     return prev_cksm;
	jz  	.ret

	push	rbx
	push	rbp
	push	r12
	push	r13
	;; no extra stack aligmnent is required because no Windows API functions are used

	movzx	ebx, cx		; uint64_t a = prev_cksm & 0xffff;
	shr 	ecx, 16
	movzx	ebp, cx		; uint64_t b = prev_cksm >> 16;

	mov 	r10d, MAX_BUF_SIZE	;; NOTE: MAX_BUF_SIZE fits in 32 bits
	mov 	r12d, BASE
	mov 	r13, rdx	; buf = buffer;
	mov 	len, r8		; total_length = length;
.loop:
	; debug_print_str `size left: %llu\n\0`, len
	mov 	eax, r10d	; current_length = MAX_BUF_SIZE

	;; use them both as 64-bit unless total_length < MAX_BUF_SIZE, in which case they are both 32-bit
	cmp 	len, rax	; if (total_length < MAX_BUF_SIZE)
	cmovb	eax, len32	;     current_length = total_length;
	sub 	len, rax	; total_length -= current_length;

	call	_adler32_digest_buffer_fw ;; moves current_length from eax into r8d

	add 	r13, r8		; buf += current_length

	test	len, len	; if (total_length != 0)
	jnz 	.loop		;     goto loop;

	mov 	eax, ebp
	shl 	eax, 16
	or  	eax, ebx

	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
.ret:
	ret

%ifndef NO_DIRECTIONS
adler32_buf: ; uint32_t adler32_buf(uint32_t prev_cksm, uint8_t *buffer, uint64_t length);
	bt  	dword [rel adler32_flags], DIR_BIT
	jnc 	adler32_buf_fw
	;; branch fallthrough into adler32_buf_bw

;; currently, _adler32_digest_buffer_bw doesn't support unrolling so it never clobbers rcx.
%define len		rcx
%define len32	ecx

adler32_buf_bw: ; uint32_t adler32_buf_bw(uint32_t prev_cksm, uint8_t *buffer, uint64_t length);
	test	r8, r8		; if (len2 == 0)
	cmovz	eax, ecx	;     return prev_cksm;
	jz  	.ret

	test	rdx, rdx	; if (buffer == NULL)
	cmovz	eax, ecx	;     return prev_cksm;
	jz  	.ret

	;; prologue
	push	rbx
	push	rbp
	push	r12
	push	r13
	;; no extra stack aligmnent is required because no Windows API functions are used

	movzx	ebx, cx		; uint64_t a = prev_cksm & 0xffff;
	shr 	ecx, 16
	movzx	rbp, cx		; uint64_t b = prev_cksm >> 16;

	mov 	r10d, MAX_BUF_SIZE
	mov 	r12d, BASE
	lea 	r13, [rdx + r8]	; buf = buffer + length. point to the end of the buffer
	mov 	len, r8			; total_len
.loop:
	mov 	eax, r10d	; cur_len = tmp

	cmp 	len, rax	; if (total_len < cur_len)
	cmovb	eax, len32	;     cur_len = total_len;
	sub 	len, rax	; total_len -= cur_len;
	sub 	r13, rax	; buf -= cur_len; // move the pointer to the start of the section

	call	_adler32_digest_buffer_bw

	test	len, len	; if (total_len != 0)
	jnz 	.loop		;     goto loop;

	mov 	eax, ebp
	shl 	eax, 16
	or  	eax, ebx

	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
.ret:
	ret

;; NOTE: these don't have to zero the upper 56 bits of rax.
;;       GCC takes care of it already.
adler32_reverse: ; bool adler32_reverse(void);
	;; switches directions and returns the bit value for the new direction
	;; 1 is backwards, 0 is forwards
	xor 	byte [rel adler32_flags], DIR_BIT_VAL
	setnz	al
	ret

adler32_direction: ; bool adler32_direction(void);
	;; returns the bit value for the direction
	bt  	dword [rel adler32_flags], DIR_BIT
	setc	al
	ret
%endif ; %ifndef NO_DIRECTIONS

%undef len32
%undef len

;; feature removals aren't useful here because you can tell they aren't there when it won't compile
;; ^^^ by this I mean it doesn't make a lot of sense to put stuff like NO_DIRECTIONS or NO_MEMZERO in here
%assign VERSION_FLAGS %isdef(NO_FOLDER_CHECK)

adler32_version: ; adler32_version_t version(void);
	mov 	rax, MINOR_VER | MAJOR_VER << 8 | SCRATCH_BUF_LEN << 16 | UNROLL_N << 48 | VERSION_FLAGS << 56
	ret

%ifndef NO_MEMZERO
adler32_memzero: ; void adler32_memzero(void);
	;; clears the scratch buffer
	push	rdi

	mov 	ecx, SCRATCH_BUF_LEN_PADDED >> 3
	xor 	eax, eax
	lea 	rdi, [rel scratch_buffer]
	rep stosq

	pop 	rdi
	ret
%endif ; %ifndef NO_MEMZERO

%assign DLL_PROCESS_DETACH	0
%assign DLL_PROCESS_ATTACH	1
%assign DLL_THREAD_ATTACH	2
%assign DLL_THREAD_DETACH	3

%ifndef DLL_NO_ENTRY
DllMain:
	cmp 	dl, DLL_PROCESS_ATTACH
	je  	.done

	cmp 	dl, DLL_THREAD_ATTACH
	je  	.done

	;; DLL_*_DETACH
.done:
	mov 	eax, 1
	ret
%endif ; %ifndef DLL_NO_ENTRY
%endif ; %ifndef DLL (else branch)
