%ifndef ADLER32_DATA_NASM
%define ADLER32_DATA_NASM

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
	%cond(%isdef(NO_PIPE),, fmt_zu						db `%zu\0`)
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


%endif ;; ADLER32_DATA_NASM
