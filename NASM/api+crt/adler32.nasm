;; ../assemble adler32 --l kernel32,shell32,ucrtbase

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; configuration macros ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;; SCRATCH_BUF_LEN
	;; UNROLL_N
	;; LEAN
	;; MINIMAL
	;; NO_INLINE_INPUT
	;; NO_DIRECTIONS
	;; NO_DOCS
	;; NO_ARG_C
	;; NO_ARG_H
	;; NO_ARG_P
	;; NO_ARG_S
	;; NO_ARG_X

%ifndef SCRATCH_BUF_LEN
	; default to 64 KiB
	%define SCRATCH_BUF_LEN %eval(1024*64)
%endif

%ifndef UNROLL_N
	; after testing, I don't think unrolling changes anything.
	%define UNROLL_N 1
%endif

%ifdef MINIMAL
	;; disable everything that can be disabled. minimal version of the program

	%ifndef LEAN
		%define LEAN
	%endif

	%ifndef NO_ARG_C
		%define NO_ARG_C
	%endif

	%ifndef NO_ARG_H
		%define NO_ARG_H
	%endif

	%ifndef NO_ARG_P
		%define NO_ARG_P
	%endif

	%ifdef UNROLL_N
		%undef UNROLL_N
	%endif

	%define UNROLL_N 1 ; force disable unrolling completely
%endif

%ifdef LEAN
	;; disable -s, -x, -d, -u, and -D

	%ifndef NO_INLINE_INPUT
		%define NO_INLINE_INPUT
	%endif

	%ifndef NO_DIRECTIONS
		%define NO_DIRECTIONS
	%endif
%endif

%ifdef NO_INLINE_INPUT
	%ifndef NO_ARG_S
		%define NO_ARG_S
	%endif

	%ifndef NO_ARG_X
		%define NO_ARG_X
	%endif
%endif

;; expansions. define the category if all sub things are defined

%if %isdef(NO_ARG_S) && %isdef(NO_ARG_X) && %isndef(NO_INLINE_INPUT)
	; if both are given separately, define NO_INLINE_INPUT.
	%define NO_INLINE_INPUT
%endif

%if %isdef(NO_ARG_H) && %isndef(NO_DOCS)
	; NO_ARG_H removes the help arguments, which in turn makes the doc string useless.
	%define NO_DOCS
%endif

%if %isdef(NO_INLINE_INPUT) && %isdef(NO_DIRECTIONS) && %isndef(LEAN)
	%define LEAN
%endif

%if %isdef(LEAN) && %isdef(NO_ARG_C) && %isdef(NO_ARG_H) && %isdef(NO_ARG_P) && UNROLL_N == 1 && %isndef(MINIMAL)
	%define MINIMAL
%endif

;;;;;;;;;;;;;;;;;;;;;;;; configuration macros bounds checks ;;;;;;;;;;;;;;;;;;;;;;;;

%if SCRATCH_BUF_LEN < 1
	%error scratch buffer size (%[SCRATCH_BUF_LEN]) must be at least 1.
%endif

%if SCRATCH_BUF_LEN >= 380_368_439
	; it can probably be equal, but I don't remember, but it can't hurt to be more restrictive
	; check the docs for `adler32_fp_fw`.
	%error scratch buffer size (%[SCRATCH_BUF_LEN]) must be less than 380,368,439.
%endif

%if UNROLL_N < 1
	%error unroll factor (%[UNROLL_N]) must be at least 1.
%endif

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; other macros ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
%defstr	VERSION 4.3
%xdefine BASE 65521

%define HEX_TO_U8_SKIP_PREFIX_CHECK ; don't allow `0x` in between each byte in `-x HEXDATA`

;; TODO: use a global register value for the number of bytes left in stdin.
%xdefine INC_BIT_VAL			1
%xdefine PIPE_BIT_VAL			2 ; 1 if a pipe is given, 0 if the pipe is not given.
%xdefine DIR_BIT_VAL			4

;; reserved bits, not implemented:
%xdefine CACHE_READ_BIT_VAL		8
%xdefine CACHE_WRITE_BIT_VAL	16

segment .bss
	scratch_buffer	resb SCRATCH_BUF_LEN
	pstderr			resq 1 ; pointer to stderr.

segment data
	;; these three values are updated at runtime when `-r` is passed.
	valid_line_fmt		db `%08x\t%s\n\0`
	invalid_line_fmt	db `\e[31m[ABSENT]\e[0m\t%s\n\0` ;; file doesn't exist
	dir_passed_line_fmt	db `\e[31m[FOLDER]\e[0m\t%s\n\0` ;; filename is a folder, not a file

segment rdata
	non_seekable_large_file_undo_str	db `\e[31mERROR: file is not seekable and larger than `, %num(SCRATCH_BUF_LEN - 1), ` bytes.\e[0m\n\0`

	%cond(%isdef(NO_ARG_P),, prev_no_arg_str		db `\e[31mERROR: argument \`-p\` given with no value.\e[0m\n\0`)
	%cond(%isdef(NO_ARG_P),, prev_invalid_arg_str	db `\e[31mERROR: argument \`-p\` given with an invalid value \`%.8s\`.\e[0m\n\0`)
	%cond(%isdef(NO_ARG_C),, comb_no_args_str		db `\e[31mERROR: argument \`-c\` given with no values.\e[0m\n\0`)
	%cond(%isdef(NO_ARG_C),, comb_one_arg_str		db `\e[31mERROR: argument \`-c\` given with only one argument.\e[0m\n\0`)
	%cond(%isdef(NO_ARG_C),, comb_invalid_arg1_str	db `\e[31mERROR: argument \`-c\` given with an invalid first argument \`%.8s\`.\e[0m\n\0`)
	unknown_arg_str			db `\e[31mERROR: unknown argument \`%s\`.\e[0m`
	%cond(%isndef(NO_DOCS), db `\nUse \`--help\` for more information.\0`, db `\0`)
	force_file_no_arg_str	db `\e[31mERROR: argument \`-f\` given with no value.\e[0m\n\0`
	pipeline_available_str	db `the pipeline is available\n\0`
	file_read_modifier		db `rb\0`
	pipeline_filename_str	db `[PIPE]\0`
	%cond(%isdef(NO_ARG_C),, comb_filename_str				db `[COMBINE]\0`)
	%cond(%isdef(NO_INLINE_INPUT),, string_filename_str		db `[STRING]\0`)
;	test_string				db `test string %ld\n\0`

	;; arguments longer than 1 character can't be easily inlined.
	;; the ones with a random letter at the start is because the first letter
	;; has to match the short argument for `process_arg__test_long` to work.

	%cond(%isdef(NO_ARG_H),, help_arg				db `--help\0`)
	ver_arg				db `--version\0`
	incremental_arg		db `--incremental\0`
	raw_arg				db `--format-raw\0`
	%cond(%isdef(NO_ARG_P),, prev_arg				db `--prev-cksm\0`)
	%cond(%isdef(NO_ARG_C),, combine_arg			db `--combine\0`)
	Fformatswap_arg		db `--format-swap\0`
	%cond(%isdef(NO_ARG_S),, str_data_arg			db `--str-data\0`)
	%cond(%isdef(NO_ARG_X),, xhex_data_arg			db `--hex-data\0`)
	long_arg			db `--format-long\0`
	%cond(%isdef(NO_DIRECTIONS),, ubackwards_arg	db `--backwards\0`)
	%cond(%isdef(NO_DIRECTIONS),, dforwards_arg		db `--forwards\0`)
	file_override_arg	db `--file-override\0`
	%cond(%isdef(NO_DIRECTIONS),, Dreverse_arg		db `--reverse\0`)

	version_str:
		db `adler32 v`, VERSION, `\n`
		db `assembled with buffer size `
;; don't worry about GiB, because the buffer can only be up to like 362 MiB
;; NOTE: if it is like 12.34 MiB, it will truncate it to 12 MiB.
%if SCRATCH_BUF_LEN >= 1024*1024
		db %num(SCRATCH_BUF_LEN >> 20), ` MiB`
%elif SCRATCH_BUF_LEN >= 1024
		db %num(SCRATCH_BUF_LEN >> 10), ` KiB`
%else
		db %num(SCRATCH_BUF_LEN), ` B`
%endif
		db `, `
%ifdef MINIMAL
		db `-DMINIMAL: `
%elifdef LEAN
		db `-DLEAN: `
%endif
		db `unroll factor `, %num(UNROLL_N)
		%cond(%isndef(NO_ARG_C),, db `, no combine (-c)`)
%if %isdef(NO_ARG_S) && %isdef(NO_ARG_X)
		db `, no inline input (-s/-x)`
%else
		%cond(%isndef(NO_ARG_S),, db `, no string input (-s)`)
		%cond(%isndef(NO_ARG_X),, db `, no hex input (-x)`)
%endif
		%cond(%isndef(NO_ARG_P),, db `, no prev-cksm update (-p)`)
		%cond(%isndef(NO_ARG_H),, db `, no help (-h/-?)`)
		%cond(%isndef(NO_DOCS) ,, db `, no docs`)
		%cond(%isndef(NO_DIRECTIONS),, db `, no directions (-d/-u/-D)`)
		db `\0`

%ifndef NO_ARG_H
	help_str:
		db `\n` ; buffer between the version and the help text
		db `Usage: [pipe input] | adler32 [--help | --version] [OPTION | FILENAME]...\n`
		db `\n`
%ifdef NO_DOCS
		db `help text disabled\0`
%else
		db `Options:\n`
		;db`0       10        20        30        40        50        60        70        80        90       100       110       120\n`
		;db`123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890\n`
		db `    -h, -?, --help      Print this message and exit. Must be the first argument.\n`
		db `    -v, --version       Print the version string and exit. Must be the first argument.\n`
		db `    -                   Process the pipe early. Example: \`adler32 - -i file1 file2\` processes the pipe before.\n`
		db `                        enabling incremental mode. Using \`-\` more than once, or after the first regular file, will\n`
		db `                        be treated as an empty file. Using the pipeline for options (e.g. \`-p -\`) is not implemented.\n`
		db `    -r, --format-raw    Use raw formatting: print only the checksum for subsequent files.\n`
		db `    -l, --format-long   Use long formatting: print the checksum and filename for subsequent files. (default)\n`
		db `    -F, --format-swap   Swap formatting modes. Equivalent to \`-l\` when in raw mode, and \`-r\` when in long mode.\n`
%ifndef NO_DIRECTIONS
		db `    -d, --forwards      Switch to forwards/do mode. (default)\n`
		db `    -u, --backwards     Switch to backwards/undo mode.\n`
		db `    -D, --reverse       Swap directions. Equivalent to \`-d\` when in undo mode, and \`-u\` when in do mode.\n`
%endif
		db `    -i, --incremental   Toggle incremental mode. When enabled, automatically carries over the checksum\n`
		db `                        between files. Defaults to off. Missing files do not update the checksum.\n`
		db `    -f, --file-override PATH\n`
		db `                        Force the next argument to be read as a file path, even if it looks like an option.\n`
		db `                        Useful for file names starting with \`-\` or for explicitly specifying a file.\n`
%ifndef NO_ARG_P
		db `    -p, --prev-cksm CHECKSUM\n`
		db `                        Set the starting checksum for subsequent files. Only the first 8 characters of the value are\n`
		db `                        read, but less is allowed too. If an invalid value is passed, the program exits immediately.\n`
		db `                        The value should be given in hexadecimal (either \`0xXXXXXXXX\` or \`XXXXXXXX\`).\n`
%endif
%ifndef NO_ARG_C
		db `    -c, --combine CKSM2 LEN2\n`
		db `                        Combines two checksums as if the data was contiguous. Uses the previously set checksum\n`
		db `                        (from \`-p\` or \`-i\`) as the first checksum. LEN2 is the length of the data that CKSM2\n`
		db `                        represents. To pass two arguments, use: \`-p CKSM1 -c CKSM2 LEN2\`.\n`
		db `                        For an undo, use: \`-u -p CKSM1 -c CKSM2 LEN2\`.\n`
		db `                        CKSM2 must be in hexadecimal (same as for \`-p\`), and LEN2 should be in decimal by default.\n`
		db `                        If LEN2 starts with \`0b\` it is binary, \`0x\` for hex, and \`0o\` or \`0\` is octal.\n`
%endif
%ifndef NO_ARG_S
		db `    -s, --str-data STR  Compute the checksum of data passed directly as a string. Stops at the first null byte.\n`
		db `                        Can only be 8192 characters before Windows truncates it.\n`
%endif
%ifndef NO_ARG_X
		db `    -x, --hex-data HEX  Compute the checksum of data passed as hexadecimal. Has the same length restriction as \`-s\`.\n`
		db `                        If an odd number of characters is passed, the last one is ignored. If an invalid byte value\n`
		db `                        (e.g. "ZZ") is passed, 0xff is used for the byte value. \`-x ffab0012\` is equivalent to a file\n`
		db `                        where the contents are \`\\xff\\xab\\x00\\x12\`. There cannot be \`0x\` at the start of the string.\n`
%endif
		db `\n`
		db `If input is piped, arguments before the first non-flag argument (\`-\`, \`-f\`, or a filename) will also apply to the pipe.\n`
		db `All arguments can be passed multiple times. The most recent value is used, for example \`-r -l\` is the same as \`-l\`.\n`
		db `Arguments are processed in one pass, so argument order matters, for example \`-r\` only applies to files after it.\n`
		db `Multi-character options like \`-abc\` are treated as a single entity, not as \`-a -b -c\`.\n`
		db `If a directory path is given instead of a file path, a non-fatal error is given.\n`
		db `NOTE: the pipeline (stdin) collapses \`\\r\\n\` into \`\\n\`, whereas nothing else does.\n`
		db `\n`
		db `Exit Codes:\n`
		db `    0   success\n`
		db `    1   unknown argument\n`
%ifndef NO_ARG_P
		db `    2   \`-p\` was given without a value\n`
		db `    3   \`-p\` was given with an invalid value\n`
%endif
%ifndef NO_ARG_C
		db `    4   \`-c\` was given with no values\n`
		db `    5   \`-c\` was given with only one value\n`
		db `    6   \`-c\` was given with an invalid first value\n`
%endif
%ifndef NO_DIRECTIONS
		db `    7   \`-u\` was used with a non-seekable file or pipe larger than `, %num(SCRATCH_BUF_LEN - 1), ` bytes\n`
%endif
		db `    8   \`-f\` was given without a value\n`
		db `   -1   something is not implemented. see error message for details\0`
%endif ; %ifdef NO_DOCS (else branch)
%endif ; %ifndef NO_ARG_H

segment text
	global main

	extern PeekNamedPipe, GetStdHandle, GetFileType
	extern GetCommandLineW, GetFileAttributesA		; kernel32.dll
	extern CommandLineToArgvW						; shell32.dll
	extern fprintf, printf, puts, _access, exit
	extern __acrt_iob_func, fopen, fclose, fread	; ucrtbase.dll

%ifndef NO_INLINE_INPUT
	; only used in adler32_str and adler32_hex, so only import it at least one of those exists.
	extern strlen
%endif
%ifndef NO_ARG_C
	; only used in parsing for `-c`, so only import it `-c` is enabled.
	extern strtoul
%endif
%ifndef NO_DIRECTIONS
	; only used in `adler32_fp_bw`, so only import it if directions are enabled.
	extern _fseeki64, _ftelli64
%endif

%include "../winapi/setup_argc_argv.nasm"

%include "../libasm/callconv.mac"		; required for streq.nasm
%include "../libasm/streq.nasm"			; for process_arg and main

%if %isndef(NO_ARG_C) || %isndef(NO_ARG_P)
	;; only include hex_to_u32 if at least one of -c or -p exists.
	%include "../libasm/hex_to_u32.nasm"	; for process_arg (-c and -p)
%endif
%ifndef NO_ARG_X
	%include "../libasm/hex_to_u8.nasm"	; for adler32_hex (-x)
%endif

pipeline_available:
	;; there might be a way to do this with libc functions.
	push	rbx	; stdin

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32 + 8*2 + 8 ; shadow space + 2 qwords + alignment

	mov 	ecx, -10
	call	GetStdHandle

	mov 	rbx, rax

	mov 	rcx, rax
	call	GetFileType

	cmp 	eax, 3	; FILE_TYPE_PIPE
	jne 	.no_input

	mov 	rcx, rbx			; arg 1. stdin
	xor 	edx, edx			; arg 2
	xor 	r8 , r8				; arg 3
	xor 	r9 , r9				; arg 4
	mov 	qword [rsp + 32], 0	; arg 5. put on the stack above the shadow space
	mov 	qword [rsp + 40], 0	; arg 6
	call	PeekNamedPipe

	test	eax, eax
	jnz 	.has_input
.no_input:
	xor 	eax, eax	; return false
	jmp 	.exit
.has_input:
	mov 	eax, 1		; return true
.exit:
	leave
	pop 	rbx
	ret

%ifndef NO_ARG_C
%ifdifi
static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_fw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	// output values, but start out as a2 and b3
	uint32_t a = cksm2 & 0xffff; // mov
	uint32_t b = cksm2 >> 16;
	a--;
	a += x1;
	x1--;

	x1 *= len2;

	b += x2;
	b += 65521u * 65521u + 225;
	b += x1;

	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_bw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	uint32_t a2 = cksm2 & 0xffff; // use the 16 bit register
	uint32_t b2 = cksm2 >> 16;

	a2--;
	x1 -= a2;

	uint32_t a = x1;
	x1--;
	x1 *= len2;

	x2 -= b2;

	uint32_t b = x2;
	b += 65521u *65521u;
	b -= x1;

	// intel syntax
	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

uint32_t adler32_combine(uint32_t cksm1, uint32_t cksm2, uint64_t len2, register uint8_t flags asm("r14b")) {
	uint32_t x1 = cksm1 & 0xffff;
	uint32_t x2 = cksm >> 16;

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

adler32_combine: ; uint32_t adler32_combine(uint32_t cksm1, uint32_t cksm2, uint64_t len2);
	;; implicitly uses `r14` as a fourth argument for the program flags
	;; len2 = r8

	;; NOTE: x1 (a1) = ecx
	;; NOTE: x2 (b1) = r9d
	;; temporary values, but start out as a1 and a2
	movzx	r9d, cx		; x2 = cksm1 & 0xffff // x2 = a1
	shr 	ecx, 16		; move the upper half into cx
	movzx	ecx, cx		; x1 = cksm1 >> 16 // x1 = b1
	xchg	ecx, r9d	; swap x1 and x2. x1 is used more often, so give it the shorter register opcode.

	;; `len2 %= BASE`, preserving edx.
	mov 	r10d, edx	; preserve edx
	xor 	edx, edx	; zero the upper input bits
	mov 	rax, r8		; x = len2
	mov 	r11d, BASE	; y = BASE
	div 	r11			; (rax, rdx) = (x // y, x % y)
	mov 	r8, rdx		; len2 = x % y; // len2 %= BASE;
	mov 	edx, r10d	; restore edx.

	;; ;; if ((flags & (1 << 3)) == 0) // if (backwards_flag_bit == 0)
	;; ;;     goto forwards;

	;; this makes the hot path (forwards) have one less jump instruction
	;; because of the implicit branch fallthrough at the end.

%ifndef NO_DIRECTIONS
	test	r14b, DIR_BIT_VAL
	jz  	.forwards

	;; implicit branch fallthrough
.backwards: ;; unused label. only for clarity
	;; input values
	movzx	r10d, dx		; a2 = cksm2 & 0xffff;
	shr 	edx , 16		; move upper half into dx
	movzx	r11d, dx		; b2 = cksm2 >> 16;

	;; actual algorithm
	dec 	r10d			; a2--;
	sub 	ecx, r10d		; x1 -= a2;

	mov 	eax, ecx		; a = x1;
	dec 	ecx				; x1--;
	imul	ecx, r8d		; x1 *= len2;
	sub 	r9d, r11d		; x2 -= b2;

	;; This `lea` instruction is equivalent to the next 2 commented out instructions.
	lea 	edx, [r9d + BASE*BASE]	; b = x2 + BASE*BASE;
	; mov 	edx, r9d		; b = x2;
	; add 	edx, BASE*BASE	; b += BASE*BASE;
	sub 	edx, ecx		; b -= x1;

	jmp 	.end
%endif ; %ifndef NO_DIRECTIONS
.forwards:
	;; input values
	movzx	eax, dx			; eax = a = cksm2 & 0xffff;
	shr 	edx, 16			; move cksm2 upper half into dx
	movzx	edx, dx			; edx = b = cksm2 >> 16;

	;; actual algorithm
	dec 	ecx				; x1--;
	add 	eax, ecx		; a += x1;

	imul	ecx, r8d		; x1 *= len2;

	;; TODO: I think there is another condition on when to add the 225.
	;;       I'm pretty sure that always adding it is not correct.

	;; I have no idea where the extra 225 came from. It is required though.
	;; This `lea` instruction is equivalent to the next 2 commented out instructions.
	lea 	edx, [edx + r9d + BASE*BASE + 225]	; b = x2 + BASE*BASE + 255;
	; add 	edx, r9d				; b += x2;
	; add 	edx, BASE*BASE + 225	; b += BASE*BASE + 225;
	add 	edx, ecx				; b += x1;
	;; implicit branch fallthrough
.end:
	;; new variables:
		; a    = r8d
		; b    = r9d
		; BASE = ecx
		; tmp1 = eax
		; tmp2 = edx

	mov 	r9d, edx	; r9d = b
	mov 	ecx, BASE	; modulo = BASE

	xor 	edx, edx	; clear input upper 32 bits
	div 	ecx			; (eax, edx) = (a // BASE, a % BASE)
	mov 	r8d, edx	; r8d = a % BASE

	xor 	edx, edx	; clear input upper 32 bits
	mov 	eax, r9d	; input = b
	div 	ecx			; (eax, edx) = (b // BASE, b % BASE)

	mov 	eax, edx	; retn_val = b;
	shl 	eax, 16		; retn_val <<= 16;
	or  	eax, r8d	; retn_val |= a;
	ret
%endif ; %ifndef NO_ARG_C

;; TODO: add documentation to the internal buffer digest functions

;; Variables
	;; a              : rbx
	;; b              : rbp
	;; i              : r8d
	;; bytes_read     : eax
	;; BASE (65521)   : r12
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; tmp            : rdx

;; NOTE: technically, r13 doesn't need to be [rel scratch_buffer], but it probably
;;       will be for most input methods, except maybe for immedate value strings.
;;       for immediate value strings, `bytes_read` is really `data_length`.
;;       it should be fine as long as it is less than ~362 MiB.

align 64	;; align to the next cache line. hot function.
_adler32_digest_buffer_fw:
	xor 	r8d, r8d	; uint32_t i = 0;
%if UNROLL_N == 1 ;; start of for loop
.for_start:
	cmp 	r8d, eax
	je  	.done		; if (i == bytes_read) break; // while (i < bytes_read) { ... }

	movzx	edx, byte [r13 + r8]
	add 	rbx, rdx	; a += scratch_buffer[i]
	add 	rbp, rbx	; b += a
.for_inc: ;; unused label. for clarity
	inc 	r8d
	jmp 	.for_start
%else ;; end UNROLL_N == 1 branch.
.for_start:
	add 	r8d, UNROLL_N
	cmp 	r8d, eax
	ja  	.for_done	; if (i + N >= bytes_read) break; // while (i + N < bytes_read) { ... }

	;; these use subtraction instead of addition them because of the `i += N` at the start of the loop.
	;; NOTE: the order matters, so this has to be i = N...1, and can't be i = 1...N
%assign i UNROLL_N
%rep UNROLL_N
	movzx	edx, byte [r13 + r8 - i]	; tmp = scratch_buffer[i]
	add 	rbx, rdx	; a += scratch_buffer[i]
	add 	rbp, rbx	; b += a
	%assign i i-1
%endrep

	jmp 	.for_start
.for_done:
	sub 	r8d, UNROLL_N	; counteract the `add r8d, N` at the start of the loop.

	;; setup jump address
	mov 	edx, r8d		; tmp = i
	sub 	edx, eax		; tmp = i - bytes_read == -(bytes_read - i)
	add 	edx, UNROLL_N-1	; tmp = (N - (bytes_read - i))
	shl 	edx, 4			; tmp = 16*(N - (bytes_read - i))
	mov 	rcx, $			;; 10 byte instruction
	lea 	rdx, [rcx + (10 + 5 + 2) + rdx]

	; rip + distance  to .case_%[N-1] + 16*((N - 1) - (bytes_read - i))
	jmp 	rdx
	;; NOTE: the mov instruction is 10 bytes, the lea instruction is 4 bytes, and `jmp rdx` is 2 bytes.
	;; this assumes that `.case_%[N - 1]` is directly after `jmp rdx`. this should be the case.
	;; the 16*(N - 1) comes from the constant term of 16*(N - 1 - (bytes_read - 1)),
	;; which in turn comes from how the cases are in reverse (e.g. case N-1 is 0th, case N-2 is 1st, etc.)
%assign i UNROLL_N - 1

;; the cases are intended to fall through to the next case.
;; handle the last remaining (N-1 to 1) bytes.
%rep UNROLL_N - 1
.%[i]_leftover: ;; i is the number of bytes left to be processed
	movzx	edx, byte [r13 + r8] ; tmp = scratch_buffer[i]
	add 	rbx, rdx	; a += tmp
	add 	rbp, rbx	; b += a
	add 	r8d, 1		; `inc r8d` but one byte longer for alignment. avoids `nop` instruction.

	%assign i i-1
%endrep
.0_leftover:
	;; do modulos, etc.

%undef i
%endif ;; end UNROLL_N != 1 branch. end of for loop
.done:
	mov 	r8d, eax	; save bytes_read into r8d

	;; a %= BASE
	xor 	edx, edx	; clear upper bits of modulo input
	mov 	rax, rbx
	div 	r12			; (rax, rdx) = (a // BASE, a % BASE)
	mov 	rbx, rdx	; a %= BASE

	;; b %= BASE
	xor 	edx, edx	; clear upper bits of modulo input
	mov 	rax, rbp
	div 	r12			; (rax, rdx) = (b // BASE, b % BASE)
	mov 	rbp, rdx	; b %= BASE
	ret

%ifndef NO_DIRECTIONS
;; Variables:
	;; a              : rbx
	;; b              : rbp
	;; bytes_read / i : rax
	;; tmp            : rdx
	;; BASE (65521)   : r12
	;; scratch_buffer : r13
;; TODO: add unrolling for this
align 64 ;; this shouldn't offset by too much. the last function should be close to a boundary
_adler32_digest_buffer_bw:
.loop_start:
	test 	eax, eax				; while (i --> 0)
	jz  	.done
	dec 	eax						; i--;

	movzx	edx, byte [r13 + rax]	; tmp = scratch_buffer[i];
	sub 	rbp, rbx				; b -= a;
	sub 	rbx, rdx				; a -= scratch_buffer[i];

	jmp 	.loop_start
.done:
	;; a = a % BASE + (a < 0)*BASE;
	mov 	rax, rbx	; rax = a
	cqo					; sign extend rax to rdx:rax
	idiv 	r12			; (rax, rdx) = (a // BASE, a % BASE)
	mov 	rbx, rdx	; a = a % BASE;

	lea 	rdx, [rbx + r12] ; tmp = a + BASE;
	test	rbx, rbx	;; if (a < 0)
	cmovs 	rbx, rdx	;;     a += BASE;

	;; b = b % BASE + (b < 0)*BASE;
	mov 	rax, rbp	; rax = b
	cqo					; sign extend rax to rdx:rax
	idiv 	r12			; (rax, rdx) = (b // BASE, b % BASE)
	mov 	rbp, rdx	; b = b % BASE;

	lea 	rdx, [rbp + r12] ; tmp = b + BASE;
	test	rbp, rbp	;; if (b < 0)
	cmovs 	rbp, rdx	;;     b += BASE;
	ret
%endif ; %ifndef NO_DIRECTIONS

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
uint32_t adler32_fp_v2(FILE *fp, uint32_t prev_cksm) {
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

		// this might be off by 1 here, but it isn't in the assembly version.
		switch (bytes_read - i) {
			default: __builtin_unreachable();
			case 3: b += a += scratch_buffer[i]; i++;
			case 2: b += a += scratch_buffer[i]; i++;
			case 1: b += a += scratch_buffer[i]; i++;
			case 0: // do nothing
		}

		a %= 65521;
		b %= 65521;
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
%cond(%isdef(NO_DIRECTIONS),adler32_fp,adler32_fp_fw):
	push	rbx	; a
	push	rbp	; b
	push	r12	; BASE
	push	r13	; scratch buffer
	push	r14	; fp
	sub 	rsp, 32

	;; set a and b
	movzx 	rbx, dx
	rol 	edx, 16
	movzx 	rbp, dx

	;; NOTE: a register is used for the scratch buffer because of `movzx edx, byte [r13 + r8]`.
	;;       you can't use a relative base address with a register offset.
	mov 	r12d, BASE
	mov 	r14, rcx
	lea 	r13, [rel scratch_buffer]
.do_start:
	; bytes_read = fread(scratch_buffer, sizeof(char), BUF_LEN, fp);
	mov 	rcx, r13				; scratch_buffer
	mov 	edx, 1					; sizeof(char)
	mov 	r8d, SCRATCH_BUF_LEN	; sizeof(scratch_buffer)
	mov 	r9, r14					; fp
	call	fread ;; eax = bytes_read

	call	_adler32_digest_buffer_fw
.do_cond:
	cmp 	r8d, SCRATCH_BUF_LEN
	je  	.do_start	; if (bytes_read == BUF_LEN) goto do_start;

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
;; Variables:
	;; bytes_read     : rax
	;; a              : rbx
	;; b              : rbp
	;; pos            : rdi
	;; len            : rsi / esi
	;; BASE (65521)   : r12
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; fp             : r14
adler32_fp_bw: ; uint32_t adler32_fp_bw(FILE *fp, uint32_t prev_cksm) {
	;; it is possible that the seeking and telling doesn't work for large files. idk.
	;; https://stackoverflow.com/questions/4034227

	push	rbx	; a
	push	rbp	; b
	push	rdi	; pos
	push	rsi	; len
	push	r12	; BASE
	push	r13	; scratch buffer
	push	r14	; fp
	sub 	rsp, 32	; shadow space

	movzx	ebx, dx		;; rbx = a; int64_t a = prev_cksm & 0xffff;
	shr 	edx, 16		;; shift upper half into lower half
	movzx	ebp, dx		;; rbp = b; int64_t b = prev_cksm >> 16;

	mov 	r12d, BASE					;; r12 = BASE
	lea 	r13, [rel scratch_buffer]	;; r13 = scratch_buffer
	mov 	r14, rcx					;; r14 = fp

	;; mov rcx, r14		;; redundant instruction.
	xor 	edx, edx	;; offset = 0
	mov 	r8d, 2		;; SEEK_END = 2
	call	_fseeki64

	test 	eax, eax
	jnz 	.non_seekable_file

	mov 	rcx, r14	;; fp
	call	_ftelli64
	mov 	rdi, rax	;; uint64_t pos = _ftelli64(fp);

	mov 	esi, SCRATCH_BUF_LEN	;; uint32_t len = SCRATCH_BUF_LEN;

	;; do-while loop. fallthrough on loop breaks at the expense of slightly worse performance for empty files.
.loop:
	;; TODO: make sure `cmp rdi, rsi` works. the commented out instruction is the previous version.
	; cmp 	rdi, SCRATCH_BUF_LEN	;; if (pos < SCRATCH_BUF_LEN)
	cmp 	rdi, rsi				;; if (pos < len) // NOTE: `len == SCRATCH_BUF_LEN`
	cmovb	esi, edi				;;     len = (uint32_t) pos;

	sub 	rdi, rsi	;; pos -= (uint64_t) len; // rewind one section, or the remaining distance

	mov 	rcx, r14	;; fp
	mov 	rdx, rdi	;; pos
	xor 	r8d, r8d	;; SEEK_SET = 0
	call	_fseeki64

	mov 	rcx, r13	;; scratch_buffer
	mov 	edx, 1		;; sizeof(char)
	mov 	r8d, esi	;; len. using 32-bits is fine here.
	mov 	r9, r14		;; fp
	call	fread		;; `mov rax, rsi`, bytes_read = fread(scratch_buffer, sizeof(char), len, fp)
	;; NOTE: fread will always return `len`. the reason is left as an exercise to the reader :|

	call	_adler32_digest_buffer_bw

	test	rdi, rdi	;; if (pos != 0)
	jnz 	.loop		;;     goto loop;
	;; implicit branch fallthrough for `pos == 0` (no more bytes left)
.done: ;; unused label. only for clarity.
	;; return b << 16 | a;
	mov 	eax, ebp	; rax = b
	shl 	eax, 16		; rax = b << 16
	or  	eax, ebx	; rax = b << 16 | a

	add 	rsp, 32
	pop 	r14	; fp
	pop 	r13	; scratch buffer
	pop 	r12	; BASE
	pop 	rsi	; len
	pop 	rdi	; pos
	pop 	rbp	; b
	pop 	rbx	; a
	ret
.non_seekable_file:
	;; technically there can also be OS errors that make `_fseeki64` return nonzero,
	;; but it should be fine probably, idk.

	;; just try it and see what happens.
	mov 	rcx, r13				; scratch_buffer
	mov 	edx, 1					; sizeof(char)
	mov 	r8d, SCRATCH_BUF_LEN	; sizeof(scratch_buffer)
	mov 	r9, r14					; fp
	call	fread ;; eax = bytes_read

	;; assume it is longer than one buffer if it filled the buffer. technically
	;; if the file is the same length as the buffer, this is an incorrect result,
	;; but that is such a tiny edge case that I don't really care.
	cmp 	eax, SCRATCH_BUF_LEN
	je  	.non_seekable_file_large_file

	call	_adler32_digest_buffer_bw
	jmp 	.done
.non_seekable_file_large_file: ;; unused label. only for clarity.
	;; file is non seekable and longer than a single scratch buffer.
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel non_seekable_large_file_undo_str]
	call	fprintf

	mov 	ecx, 7
	call	exit

;; decide between the forwards and backwards versions of adler32_fp.
adler32_fp: ; uint32_t adler32_fp(FILE *fp, uint32_t prev_cksm);
	;; wrapper for the other two implementations.
	;; uses tail calling because both versions have the same arguments as this
	test	r14b, DIR_BIT_VAL
	jz  	adler32_fp_fw ;; forwards / normal. hot path is first
	jmp 	adler32_fp_bw ;; backwards / undo.
%endif

;; compute the adler32 checksum of a file given the file name as a string
adler32_fname:
	;; uint32_t adler32_fname(char *filename, uint32_t previous_checksum);
	push	r12
	push 	r13

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32		; shadow space

	mov 	r12, rcx	; file name
	mov 	r13, rdx	; input checksum

	;; mov	rcx, rcx	;; redundant instruction.
	mov 	rdx, 100b	; read access
	call	_access

	test	eax, eax	; test for nonzero exit code
	jnz 	.invalid_file

	mov 	rcx, r12
	call	GetFileAttributesA

	;; technically, at this point, it is probably an OS error or something,
	;; so the error message saying it isn't readable is probably misleading.
	cmp 	eax, 0xffffffff ;; INVALID_FILE_ATTRIBUTES
	je  	.invalid_file

	test	al, 16 ; FILE_ATTRIBUTE_DIRECTORY
	jnz 	.directory_passed

	mov 	rcx, r12
	lea 	rdx, [rel file_read_modifier]
	call	fopen

	mov 	r12, rax	; r12 = fp;

	mov 	rcx, rax	; rcx = fp;
	mov 	rdx, r13	; rdx = input hash;
	call	adler32_fp	; rax = adler32_fp(fp, prev_cksm)

	xchg	rax, r12	; swap(&rax, &fp)

	mov 	rcx, rax
	call	fclose

	mov 	rax, r12	; rax = checksum
.done:
	leave
	pop 	r13
	pop 	r12
	ret
.invalid_file:
	;; give an invalid value (0xffffffff). the max valid value is 0xfff0fff0
	; mov 	eax, -1		; 5 bytes, 1 instruction
	xor 	eax, eax	; 4 bytes, 2 instructions
	dec 	eax

	jmp 	.done		; leave, pop r12, ret
.directory_passed:
	;; give an invalid value (0xfffffffe). the max valid value is 0xfff0fff0
	mov 	eax, -2

	jmp 	.done

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

	;;; which notes imply which optimizations is left as an excercise to the reader :|

	push	rbx
	push	rbp
	push	r12
	push	r13
	sub 	rsp, 40		;; shadow space + alignment

	movzx	ebx, dx		;; a = prev_cksm & 0xffff
	shr 	edx, 16		;; move upper half into lower half
	movzx	ebp, dx		;; b = prev_cksm >> 16;

	mov 	r12d, BASE	;; r12 = BASE
	mov 	r13, rcx	;; r13 = str

	;; mov 	rcx, rcx	;; reduntant instruction. included for clarity.
	call	strlen		;; eax = strlen(str);

%ifndef NO_DIRECTIONS
	test	r14b, DIR_BIT_VAL
	jz  	.forwards
.backwards: ;; unused label
	call	_adler32_digest_buffer_bw
	jmp 	.done
.forwards:
%endif
	call	_adler32_digest_buffer_fw
.done:
	mov 	eax, ebp	;; eax = b
	shl 	eax, 16		;; eax = b << 16
	or  	eax, ebx	;; eax = b << 16 | a

	add 	rsp, 40
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

	len >>= 1;

	for (uint32_t i = 0; i < len; i++)
		str[i] = hex_to_u8(str + 2*i);

	str[len] = '\0';

	if (r14b & 4)
		_adler32_digest_buffer_bw();
	else
		_adler32_digest_buffer_fw();

	return b << 16 | a;
}
%endif

;; TODO: make it error out if there is an odd length or invalid characters
adler32_hex: ; uint32_t adler32_hex(char *str, uint32_t prev_cksm);
	;; NOTE 1: clobbers the string, updating it to the actual byte data the original value represented.
	;; NOTE 2: if the length is odd, the last character is ignored.
	;; NOTE 3: if invalid hex values are given (e.g. `ZZ`), the byte value used is 0xff.
	push	rbx	; a
	push	rbp	; b
	push	r12	; BASE
	push	r13	; str
	sub 	rsp, 40	;; shadow space + alignment

	movzx	ebx, dx		; uint64_t a = prev_cksm & 0xffff;
	shr 	edx, 16		; move upper half into lower half
	movzx	ebp, dx		; uint64_t b = prev_cksm >> 16;
	mov 	r12d, BASE	; r12 = BASE
	mov 	r13, rcx	; r13 = str

	;; `len` is always less than one buffer size. On Linux, this wouldn't be guaranteed.
	;; see `adler32_str` for the reasoning.
	; mov 	rcx, rcx	;; redundant instruction
	call	strlen

	;; this next line drops off the least significant bit,
	;; which is why the last character is ignored for odd-length inputs.
	shr 	eax, 1		; len /= 2; // output length, not input length.
	mov 	r10d, eax	; preserve `len` because `eax` is clobbered by `hex_to_u8`
	xor 	r9d, r9d	; uint32_t r9d = 0; // r9d
.loop:
	cmp 	r9d, r10d	; while (i < len)
	je  	.endloop

	lea 	rcx, [r13 + 2*r9]	; tmp = str + 2*i

	;; NOTE: hex_to_u8 doesn't clobber r9 or r10.
	call	hex_to_u8			; al  = hex_to_u8(str + 2*i)
	mov 	byte [r13 + r9], al	; str[i] = hex_to_u8(str + 2*i);
	inc 	r9d					; i++

	jmp 	.loop
.endloop:
	mov 	byte [r13 + r9], `\0`	; str[i] = '\0';
	mov 	eax, r9d				; len = i; (but in eax now for the buffer digest functions.)

%ifndef NO_DIRECTIONS
	;; NOTE: all the variables should be set up now.
	test	r14b, DIR_BIT_VAL	;; if ((r14b & 4) == 0)
	jz  	.forwards			;;     goto forwards;
.backwards: ;; unused label. for clarity
	call	_adler32_digest_buffer_bw
	jmp 	.done
.forwards:
%endif
	call	_adler32_digest_buffer_fw
.done:
	mov 	eax, ebp	;; eax = b
	shl 	eax, 16		;; eax = b << 16
	or  	eax, ebx	;; eax = b << 16 | a

	add 	rsp, 40
	pop 	r13
	pop 	r12
	pop 	rbp
	pop 	rbx
	ret
%endif ; %ifndef NO_ARG_X

process_pipe: ; void process_pipe(uint32_t prev_cksm /*r12d*/, uint8_t flags /*r14b*/);
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	mov 	edx, r12d

	test	r14b, PIPE_BIT_VAL	; if the pipeline was not given,
	jz  	.print				;     just print the previous checksum

	mov 	rcx, 0
	call	__acrt_iob_func

	mov 	rcx, rax
	; mov 	rdx, r12d	;; redundant instruction
	call	adler32_fp	; uint32_t checksum = adler32_fp(stdin, prev);

	test	r14b, INC_BIT_VAL

	;; if the incremental flag bit is set, update the input checksum
	cmovnz	r12d, eax	; prev = checksum

	mov 	edx, eax	; arg2 = checksum
.print: ; assumes `edx` (checksum) has already been set
	lea 	rcx, [rel valid_line_fmt]
	lea 	r8 , [rel pipeline_filename_str]
	call	printf		; printf(valid_line_fmt, checksum, "[PIPE]")

	leave
	ret


;; this has shorter total opcodes than `jmp .done` and is faster.
%macro process_arg__ret 0
	inc 	ebx
	leave
	ret
%endm

%macro process_arg__test_short 1
	cmp 	cx, %strcat(%1, `\0`)
	je  	.arg_match_%tok(%1)
%endm

; process_arg__test_long string_label
%macro process_arg__test_long 1
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
process_arg: ; void process_arg(register char *str asm("r13"));
	;; this function has side effects and doesn't follow the ABI
	;; assume the argument starts with '-'
	;; assume `mov r13, [rsi + 8*rbx]` before this is called

	push 	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	;; TODO: make `-` work as arguments for -p and -c.
	;; NOTE: for -s and -x, `-` as the argument is treated as if that is the actual data.

	;; `-` means to process the arg
	cmp 	byte [r13 + 1], `\0`
	je  	.pipe_arg

	mov 	cx, word [r13 + 1] ;; next two characters after the '-'.

	;; the arguments are sorted by commonality, based on guessing.
	process_arg__test_short	'i'
	process_arg__test_short	'r'
	%cond(%isdef(NO_ARG_P),, process_arg__test_short	'p')
	%cond(%isdef(NO_ARG_C),, process_arg__test_short	'c')
	process_arg__test_short	'F'
	%cond(%isdef(NO_ARG_S),, process_arg__test_short	's')
	%cond(%isdef(NO_ARG_X),, process_arg__test_short	'x')
	process_arg__test_short	'l'
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_short	'u')
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_short	'd')
	process_arg__test_short	'f'
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_short	'D')

	;; NOTE: the long tests need to be after all the short tests.
	;;       this is because `streq` will clobber `cx`.

	process_arg__test_long	incremental_arg									; -i
	process_arg__test_long	raw_arg											; -r
	%cond(%isdef(NO_ARG_P),, process_arg__test_long	prev_arg)				; -p
	%cond(%isdef(NO_ARG_C),, process_arg__test_long	combine_arg)			; -c
	process_arg__test_long	Fformatswap_arg									; -F
	%cond(%isdef(NO_ARG_S),, process_arg__test_long	str_data_arg)			; -s
	process_arg__test_long	long_arg										; -l
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_long	ubackwards_arg)	; -u
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_long	dforwards_arg)	; -d
	process_arg__test_long	file_override_arg								; -f
	%cond(%isdef(NO_DIRECTIONS),, process_arg__test_long	Dreverse_arg)	; -D

	;; no more cases to test for. unknown argument
	;; fallthrough
.unknown_argument:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unknown_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 1
	call	exit
%ifndef NO_ARG_C
.arg_match_c:
	inc 	ebx
	cmp 	ebx, edi		;; if (i == argc)
	je  	.comb_no_args	;;     goto comb_no_args;

	mov 	rcx, [rsi + 8*rbx]
	call	hex_to_u32	; convert string to uint32_t

	;; make sure the hex value is in the correct range
	cmp 	ax, BASE - 1
	ja  	.comb_invalid_arg1

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.comb_invalid_arg1

	mov 	r13d, eax	; store CKSM2 in r13 because its value doesn't matter anymore.

	inc 	ebx
	cmp 	ebx, edi		;; if (i == argc)
	je  	.comb_one_arg	;;     goto comb_one_arg;

	mov 	rcx, [rsi + 8*rbx]
	xor 	edx, edx	;; NULL. I don't care about the pointer to the end of the string.
	xor 	r8d, r8d	;; figure out the base yourself.
	call	strtoul		;; rax = len2

	mov 	ecx, r12d	;; cksm1 = prev_cksm
	mov 	edx, r13d	;; cksm2 = hex_to_u32(first argument)
	mov 	r8 , rax	;; len2 = strtoul(second argument)
	call	adler32_combine

	test	r14b, INC_BIT_VAL	; if (inc_bit_set)
	cmovnz	r12d, eax			;     prev_cksm = checksum;

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	lea 	r8 , [rel comb_filename_str]
	call	printf		; printf(valid_line_fmt, checksum, "[COMBINED]")

	process_arg__ret
%endif
%ifndef NO_DIRECTIONS
.arg_match_u:
	test	r14b, DIR_BIT_VAL	; if (undo_bit_active == 0)
	jz  	.arg_match_D		;     switch_directions();

	process_arg__ret			; return;
.arg_match_d:
	test	r14b, DIR_BIT_VAL	; if (undo_bit_active == 1)
	jnz 	.arg_match_D		;     switch_directions();

	process_arg__ret			; return;
.arg_match_D:
	xor 	r14b, DIR_BIT_VAL

	process_arg__ret
%endif
.arg_match_i:
	xor  	r14b, INC_BIT_VAL

	process_arg__ret
.arg_match_F:
	cmp 	byte [rel valid_line_fmt + 4], `\t`
	je  	.arg_match_r
	;; branch fallthrough
.arg_match_l:
	mov 	word [rel valid_line_fmt + 4], `\t%`
	mov 	word [rel invalid_line_fmt + 17], `\t%`
	mov 	word [rel dir_passed_line_fmt + 17], `\t%`

	process_arg__ret
.arg_match_r:
	mov 	word [rel valid_line_fmt + 4], `\n\0`
	mov 	word [rel invalid_line_fmt + 17], `\n\0`
	mov 	word [rel dir_passed_line_fmt + 17], `\n\0`

	process_arg__ret
%ifndef NO_ARG_X
.arg_match_x:
	inc 	ebx					; i++
	mov 	rcx, [rsi + 8*rbx]	; argv[i]
	mov 	edx, r12d			; prev_cksm
	call	adler32_hex

	; only do a jump if .arg_match_s actually exists.
	; otherwise there is nothing to jump over.
	%ifndef NO_ARG_S
		jmp 	.print_im_result
	%endif
%endif
%ifndef NO_ARG_S
.arg_match_s:
	inc 	ebx					; i++
	mov 	rcx, [rsi + 8*rbx]	; argv[i]
	mov 	edx, r12d			; prev_cksm
	call	adler32_str
	;; branch fallthrough
%endif
%ifndef NO_INLINE_INPUT ;; include if either -s or -x exist
.print_im_result:
	;; print immediate result
	test	r14b, INC_BIT_VAL	; if (incremental_bit_set)
	cmovnz	r12d, eax			;     prev = checksum

	;; do printing stuff
	lea 	rcx, [rel valid_line_fmt]	; NOTE: it will always be valid.
	mov 	edx, eax
	lea 	r8 , [rel string_filename_str]
	call	printf		; printf(valid_line_fmt, checksum, filename)

	process_arg__ret
%endif
%ifndef NO_ARG_P
.arg_match_p:
	inc 	ebx

	cmp 	ebx, edi		;; if (i == argc)
	je  	.prev_no_arg	;;     goto prev_no_arg;

	mov 	rcx, [rsi + 8*rbx]
	call	hex_to_u32	; convert string to uint32_t

	;; make sure the hex value is in the correct range
	cmp 	ax, BASE - 1
	ja  	.prev_invalid_arg

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.prev_invalid_arg

	mov 	r12d, eax	; prev = checksum

	process_arg__ret
%endif
.arg_match_f:
	inc 	ebx		; i++

	cmp 	ebx, edi
	je  	.force_file_no_arg

	mov 	r13, [rsi + 8*rbx]

	leave
	add 	rsp, 8	;; remove the return address from the stack
	jmp 	main.process_file
	;; return, but not to the call site.
.pipe_arg:
	call	process_pipe
	process_arg__ret
;;;;;;;;;;;;;;;;;;;; error cases 2-6, 8 ;;;;;;;;;;;;;;;;;;;;
%ifndef NO_ARG_P
.prev_no_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_no_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 2
	call	exit
.prev_invalid_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_invalid_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 3
	call	exit
%endif
%ifndef NO_ARG_C
.comb_no_args:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_no_args_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 4
	call	exit
.comb_one_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_one_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 5
	call	exit
.comb_invalid_arg1:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel comb_invalid_arg1_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 6
	call	exit
%endif
.force_file_no_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel force_file_no_arg_str]
	call	fprintf

	mov 	ecx, 8
	call	exit

%unmacro process_arg__ret 0
%unmacro process_arg__test_short 1
%unmacro process_arg__test_long 2

;; Variables:
	;; i       = ebx
	;; argc    = edi
	;; argv    = rsi
	;; prev    = r12d
	;; argv[i] = r13
	;; flags   = r14
		;; NOTE: "bit N" means use `r14 & (1 << n)` to get the value.
		;; bit 0: incremental.
		;; bit 1: pipe given.
		;; bit 2: do/undo mode. 1 for backwards/undo, 0 for forwards/do.
		;; bit 3: (not implemented) cache read bit. 1 if caching reading is enabled, 0 if not.
		;; bit 4: (not implemented) cache write bit. 1 if caching writing is enabled, 0 if not.
	; prev     = r12d

; future values:
	; rbp  = bytes left in stdin
	; r15d = index of the last file argument, to print warnings for unused flags passed after the last file
main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	xor 	r14d, r14d	; clear global program flags
	mov 	r12d, 1		; default input checksum
	xor 	ebx, ebx	; int i = 0;

	;; NOTE: technically, the memory given by this should be freed at the end of the program,
	;;       but that adds extra complexity for basically no gain. The OS will reclaim it anyway.
	call	setup_argc_argv
	;; TODO: check if argv is null? I think the null check has to be in `setup_argc_argv`.

	dec 	edi			; skip past the path to the current executable
	add 	rsi, 8

	mov 	rcx, 2		; setup stderr
	call	__acrt_iob_func
	mov 	[rel pstderr], rax

	call	pipeline_available

	test 	al, al
	jz  	.test_arg1

	;; set the relevant flag bit if the pipeline is available
	or  	r14, PIPE_BIT_VAL

	test 	edi, edi	; skip testing arguments if there are no arguments
	jz  	.process_pipe_if_given
.test_arg1: ;; test for things that only work as the first argument
	;; NOTE: there is no ebx incrementing because currently all the options  only allowed as the first argument
	;;       exit the program early, and everything else should be processed in `process_arg`, or is a file.

	test 	edi, edi	;; if no arguments given
%ifdef NO_ARG_H			;;     if -DNO_ARG_H given
	jz  	.done		;;         return 0
%else					;;     else
	jz  	.help		;;         print help text
%endif

	;; TODO: the [rcx] and [rcx + 1] accesses can be changed into a single `word` access, and then
	;;       separate checks against `cl` and `ch`. I don't know which byte would be in which register though.

	;; if the first character is not '-', checking for arguments is useless because they will not match.
	mov 	rcx, [rsi]
	cmp 	byte [rcx], '-'
	jne 	.process_pipe_if_given

	;; '-' with nothing after it.
	cmp 	byte [rcx + 1], `\0`
	je  	.process_pipe_explicit

	;; long form arguments

	; lea 	rcx, [rsi]	;; redundant instruction
%ifndef NO_ARG_H
	lea 	rdx, [rel help_arg] ; --help
	call	streq
	je  	.help

	mov 	rcx, [rsi]
%endif

	lea 	rdx, [rel ver_arg] ; --version
	call	streq
	je  	.version

	mov 	rcx, [rsi]			; tmp = argv[0]
	mov 	cx, word [rcx + 1]	; tmp = (char []) {argv[0][1], argv[0][2]}

%ifndef NO_ARG_H
	cmp 	cx, `h\0`
	je  	.help

	cmp 	cx, `?\0`
	je  	.help
%endif

	cmp 	cx, `v\0`
	je  	.version
.arg_pass_1: ; go through the arguments until there is a non-option argument
	cmp 	ebx, edi				; if (i == argc)
	je  	.process_pipe_if_given	;     goto process_pipe_if_given;

	mov 	r13, [rsi + 8*rbx]	; r13 = argv[i];

	;; only process options. no files
	cmp 	byte [r13], '-'			; if (argv[i][0] != '-')
	jne 	.process_pipe_if_given	;     goto process_pipe_if_given;

	;; `-` argument means to process the pipe here.
	cmp 	byte [r13 + 1], `\0`
	je  	.process_pipe_explicit

	;; `-f` is an override option. the next option is always treated as a file name.
	cmp 	word [r13 + 1], `f\0`
	je  	.process_pipe_if_given

	call	process_arg	; NOTE: always increments ebx at the end
	jmp 	.arg_pass_1
.process_pipe_explicit:
	;; for if `-` was used explicitly beforet the first non-flag argument
	inc 	ebx				; skip past the `-` argument.
	jmp 	.process_pipe	; always process the pipe
.process_pipe_if_given:
	;; this is for when the first non-flag argument is encountered.
	;; like in `adler32 -r file1`, don't process the pipe if it wasn't given.
	test	r14b, PIPE_BIT_VAL	; if the pipe-given flag isn't set, skip this part.
	jz  	.arg_pass_2
	;; fall through if the pipe was given
.process_pipe:
	call	process_pipe
	;; fall through to the second argument pass
.arg_pass_2:	;; this time, iterate through everything, including file names
	; while (i < argc)
	cmp 	ebx, edi
	je  	.done

	mov 	r13, [rsi + 8*rbx]

	;; not an argument, so treat it as a file
	cmp 	byte [r13], '-'
	jne 	.process_file

	;; argument
	call	process_arg
	jmp 	.arg_pass_2	; continue
.process_file:
	mov 	rcx, r13		; filename
	mov 	edx, r12d		; prev
	call	adler32_fname	; checksum = adler32_fname(filename, prev);

	cmp 	eax, -2		; adler32_fname returns -2 if a directory is passed
	je  	.dir_passed

	cmp 	eax, -1		; adler32_fname returns -1 on file-not-found errors
	jne 	.file_found

	;; the file was not readable or does not exist
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel invalid_line_fmt]
	mov 	r8 , r13
	call	fprintf		; fprintf(stderr, invalid_line_fmt, argv[i])

	;; go to the next argument and keep iterating
	inc 	ebx
	jmp 	.arg_pass_2	; continue
.dir_passed:
	;; a directory was given instead of a file
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel dir_passed_line_fmt]
	mov 	r8 , r13
	call	fprintf		; fprintf(stderr, invalid_line_fmt, argv[i])

	inc 	ebx
	jmp 	.arg_pass_2	; continue
.file_found:
	test	r14b, INC_BIT_VAL

	;; if the incremental flag bit is set, update the input checksum
	cmovnz	r12d, eax	; prev = checksum

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax	; checksum
	mov 	r8 , r13	; filename
	call	printf		; printf(valid_line_fmt, checksum, filename)

	inc 	ebx
	jmp 	.arg_pass_2	; continue
.done:
	xor 	eax, eax
	leave
	ret
%ifndef NO_ARG_H
.help:
	lea 	rcx, [rel version_str]
	call	puts

	lea 	rcx, [rel help_str]
	call	puts

	xor 	eax, eax
	leave
	ret
%endif
.version:
	lea 	rcx, [rel version_str]
	call	puts

	xor 	eax, eax
	leave
	ret
