%ifndef ADLER32_CONFIG_NASM
%define ADLER32_CONFIG_NASM

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

%endif ;; ADLER32_CONFIG_NASM
