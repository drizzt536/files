;; ../assemble adler32 --l kernel32,shell32,ucrtbase

%ifndef SCRATCH_BUF_LEN
	%define SCRATCH_BUF_LEN %eval(1024*64)
%endif

%define BASE			65521

%define SEQ_BIT_VAL		1
%define PIPE_BIT_VAL	2
%define DIR_BIT_VAL		4

segment .bss
	scratch_buffer	resb SCRATCH_BUF_LEN

segment data
	pstderr			dq 0 ; pointer to stderr. using `.bss` is not necessary for only 8 bytes

	;; these two values are updated at runtime when `-r` is passed.
	valid_line_fmt		db `%08x\t%s\n\0`
	invalid_line_fmt	db `\e[31m[MISSING]\e[0m\t%s\n\0`

segment rdata
	prev_no_arg_str			db `\e[31mERROR: argument \`-p\` given with no value.\e[0m\n\0`
	prev_invalid_arg_str	db `\e[31mERROR: argument \`-p\` given with an invalid value \`%.8s\`.\e[0m\n\0`
	comb_no_args_str		db `\e[31mERROR: argument \`-c\` given with no values.\e[0m\n\0`
	comb_one_arg_str		db `\e[31mERROR: argument \`-c\` given with only one argument.\e[0m\n\0`
	comb_invalid_arg1_str	db `\e[31mERROR: argument \`-c\` given with an invalid first argument \`%.8s\`.\e[0m\n\0`
	unknown_arg_str			db `\e[31mERROR: unknown argument \`%s\`.\e[0m\n`
							db `Use \`--help\` for more information.\0`
	pipeline_available_str	db `the pipeline is available\n\0`
	file_read_modifier		db `rb\0`
	pipeline_filename_str	db `[PIPE]\0`
	comb_filename_str		db `[COMBINE]\0`
;	test_string				db `test string %d\n\0`
	undo_not_implemented	db `\e[31mERROR: undo mode (\`adler32_fp_bw\`) is not implemented\e[0m\n\0`

	help_arg1		db `--help\0`
	help_arg2		db `-h\0`
	help_arg3		db `-?\0`

	comb_arg		db `-c\0`
	do_arg			db `-d\0`
	inc_arg			db `-i\0`
	long_arg		db `-l\0`
	prev_arg		db `-p\0`
	raw_arg			db `-r\0`
	undo_arg		db `-u\0`

	help_text:
		db `Usage: [pipe input] | adler32 [--help | -h | -?] [-p VALUE | -[dlrsu] | FILENAME]...\n`
		db `\n`
		db `Options:\n`
		db `    -h, -?, --help    Print this message. Must be the first argument.\n`
		db `    -i                Toggle incremental mode. When enabled, automatically carries over the checksum\n`
		db `                      between files. Defaults to off. Missing files do not update the checksum.\n`
		db `    -p CKSM           Set the starting checksum for subsequent files. Only the first 8 characters of\n`
		db `                      the value are read. If an invalid value is passed, the program exits immediately.\n`
		db `                      The value should be given in hexadecimal (either \`0xXXXXXXXX\` or \`XXXXXXXX\`).\n`
		db `    -r                Use raw formatting: print only the checksum for subsequent files.\n`
		db `    -l                Use long formatting: print the checksum and filename for subsequent files. (default)\n`
		db `    -d                Switch to forwards/do mode. (default)\n`
		db `    -u                Switch to backwards/undo mode. Not implemented (except for with \`-c\`).\n`
		db `    -c CKSM2 LEN2     Combines two checksums as if the data was contiguous. Uses the previously set checksum\n`
		db `                      (from \`-p\` or \`-i\`) as the first checksum. LEN2 is the length of the data that CKSM2\n`
		db `                      represents. To pass two arguments, use: \`-p CKSM1 -c CKSM2 LEN2\`.\n`
		db `                      For an undo, use: \`-u -p CKSM1 -c CKSM2 LEN2\`.\n`
		db `                      CKSM2 must be in hexadecimal (same as for \`-p\`), and LEN2 should be in decimal.\n`
		db `\n`
		db `If input is piped, arguments before the first file will also apply to the pipeline.\n`
		db `All arguments can be passed multiple times. The most recent value is used.\n`
		db `Arguments are processed in one pass, so argument order matters.\n`
		db `\n`
		db `Exit Codes:\n`
		db `    0   success\n`
		db `    1   unknown argument\n`
		db `    2   \`-p\` was given without a value\n`
		db `    3   \`-p\` was given with an invalid value\n`
		db `    4   \`-c\` was given with no values\n`
		db `    5   \`-c\` was given with only one value\n`
		db `    6   \`-c\` was given with an invalid first value\n`
		db `   -1   something is not implemented. see error message for details\0`

segment text
	global main

	extern PeekNamedPipe, GetStdHandle, GetFileType
	extern GetCommandLineW								; kernel32.dll
	extern CommandLineToArgvW							; shell32.dll
	extern fprintf, printf, puts, _access_s, strtoul
	extern __acrt_iob_func, fopen, fclose, fread, exit	; ucrtbase.dll

%include "../winapi/setup_argc_argv.nasm"

%include "../libasm/callconv.mac" ; required for streq.nasm
%include "../libasm/streq.nasm"
%include "../libasm/hex_to_u32.nasm"

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

	asm volatile("mov asm eax, %0" : : "r" (a));
	asm volatile("mov asm edx, %0" : : "r" (b));
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

	asm volatile("mov asm eax, %0" : : "r" (a));
	asm volatile("mov asm edx, %0" : : "r" (b));
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
%endif

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
unsigned adler32_fp_v2(FILE *fp, unsigned prev) {
	unsigned long a = prev & 0xffff, b = prev >> 16;
	unsigned bytes_read;

	do {
		bytes_read = fread(scratch_buffer, sizeof(char), 1024*1024, fp);

		for (unsigned i = 0; i < bytes_read; i++)
			b += a += scratch_buffer[i];

		a %= 65521;
		b %= 65521;
	} while (bytes_read == 1024*1024);

#if 0
	// sometimes windows adds an extra newline to the pipe input.
	// maybe assume if the last character is a newline that it was added?
	// or add an option to decide?
	if (fp == stdin) {
		b -= a;
		a -= '\n';

		if (b > 65521) b += 65521; // underflow
		if (a > 65521) a += 65521; // underflow
	}
#endif

	return b << 16 | a;
}
%endif

;; Variables and locations stored
	;; a              : rbx
	;; b              : rbp
	;; BASE (65521)   : r12
	;; fp             : r13
	;; scratch_buffer : r14, [rel scratch_buffer]
	;; bytes_read     : r8d
	;; i              : r9d

;; buffered adler32 given a file pointer as input. reads in 64 KiB at a time
;; this should work for stdin since `fread` doesn't lock if there are no more characters
;; returns the file checksum.
;; forwards version
adler32_fp_fw: ;; uint32_t adler32_fp_v2_fw(FILE *const fp, uint32_t prev_cksm);
	push	rbx	; a
	push	rbp	; b
	push	r12	; BASE
	push	r13	; fp
	push	r14	; scratch buffer
	sub 	rsp, 32

	;; set a and b
	movzx 	rbx, dx
	rol 	edx, 16
	movzx 	rbp, dx

	mov 	r12d, BASE
	mov 	r13, rcx
	lea 	r14, [rel scratch_buffer]
.do_start:
	; bytes_read = fread(scratch_buffer, sizeof(char), BUF_LEN, fp);
	mov 	rcx, r14
	mov 	edx, 1
	mov 	r8d, SCRATCH_BUF_LEN
	mov 	r9, r13
	call	fread
	mov 	r8d, eax	; bytes_read = fread(...)

	xor 	r9d, r9d	; uint32_t i = 0;
.for_start:
	cmp 	r9d, r8d
	je  	.for_done	; if (i == bytes_read) break; // while (i < bytes_read) { ... }

	movzx	edx, byte [r14 + r9]
	add 	rbx, rdx	; a += scratch_buffer[i]
	add 	rbp, rbx	; b += a
.for_inc:
	inc 	r9d
	jmp 	.for_start
.for_done:
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

;; TODO: implement the backwards/undo version of adler32_fp.
adler32_fp_bw: ; uint32_t adler32_fp(FILE *fp, uint32_t prev_cksm);
	; fprintf(stderr, "\e[31mERROR: undo mode not implemented\e[0m\n"); exit(-1);
	; mov 	rcx, [rel pstderr]
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	lea 	rcx, [rel undo_not_implemented]
	call	printf

	mov 	ecx, -1
	call	exit

adler32_fp: ; uint32_t adler32_fp(FILE *fp, uint32_t prev_cksm);
	;; wrapper for the other two implementations.
	;; uses tail calling because both versions have the same arguments as this
	test	r14b, DIR_BIT_VAL
	jz  	adler32_fp_fw ;; forwards / normal. hot path is first
	jmp 	adler32_fp_bw ;; backwards / undo.

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

	mov 	rdx, 100b	; read access
	call	_access_s

	test	rax, rax	; test for nonzero exit code
	jnz 	.invalid_file

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
.exit:
	leave
	pop 	r13
	pop 	r12
	ret
.invalid_file:
	;; give an invalid value, the max valid value is 0xfff0fff0
	; mov 	eax, -1		; 5 bytes, 1 instruction
	xor 	eax, eax	; 4 bytes, 2 instructions
	dec 	eax

	jmp 	.exit		; leave, pop r12, ret

%macro process_arg__ret 0
	;; this has shorter total opcodes than `jmp .done` and is faster.
	inc 	ebx
	leave
	ret
%endm

;; Variables:
	;; i      = ebx
	;; argc   = edi
	;; argv   = rsi
	;; prev   = r12d
	;; arg[i] = r13
	;; flags  = r14d
process_arg: ; void process_arg(register char *str asm("r13"));
	;; this function has side effects and doesn't follow the ABI
	;; assume the argument starts with '-'
	;; assume `mov r13, [rsi + 8*rbx]` before this is called

	push 	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	;; -c
	mov 	rcx, r13
	lea 	rdx, [rel comb_arg]
	call	streq
	je  	.arg_match_c

	;; -d
	mov 	rcx, r13
	lea 	rdx, [rel do_arg]
	call	streq
	je  	.arg_match_d

	;; -i
	mov 	rcx, r13
	lea 	rdx, [rel inc_arg]
	call	streq
	je  	.arg_match_i

	;; -l
	mov 	rcx, r13
	lea 	rdx, [rel long_arg]
	call	streq
	je  	.arg_match_l

	;; -p
	mov 	rcx, r13
	lea 	rdx, [rel prev_arg]
	call	streq
	je  	.arg_match_p

	;; -r
	mov 	rcx, r13
	lea 	rdx, [rel raw_arg]
	call	streq
	je  	.arg_match_r

	;; -u
	mov 	rcx, r13
	lea 	rdx, [rel undo_arg]
	call	streq
	je  	.arg_match_u

	;; no more cases to test for. unknown argument
	jmp 	.unknown_argument
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

	test	r14b, SEQ_BIT_VAL	; if (seq_bit_set)
	cmovnz	r12d, eax			;     prev_cksm = checksum;

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	lea 	r8 , [rel comb_filename_str]
	call	printf		; printf(valid_line_fmt, checksum, "[COMBINED]")

	process_arg__ret
.arg_match_d:
	test	r14b, DIR_BIT_VAL	; if (undo_bit_active == 1)
	jnz 	.switch_direction	;     goto switch_direction;

	process_arg__ret			; return;
.arg_match_i:
	xor  	r14, SEQ_BIT_VAL

	process_arg__ret
.arg_match_l:
	mov 	word [rel valid_line_fmt + 4], `\t%`
	mov 	word [rel invalid_line_fmt + 18], `\t%`

	process_arg__ret
.arg_match_r:
	mov 	word [rel valid_line_fmt + 4], `\n\0`
	mov 	word [rel invalid_line_fmt + 18], `\n\0`

	process_arg__ret
.arg_match_u:
	test	r14, DIR_BIT_VAL	; if (undo_bit_active == 0)
	jz  	.switch_direction	;     goto switch_direction;

	process_arg__ret			; return;
.arg_match_p:
	inc 	ebx

	cmp 	ebx, edi		;; if (i == argc)
	je  	.prev_no_arg	;;     goto prev_no_arg;

	mov 	rcx, [rsi + 8*rbx]		;; TODO: ?? I don't think this is correct
	call	hex_to_u32	; convert string to uint32_t

	;; make sure the hex value is in the correct range
	cmp 	ax, BASE - 1
	ja  	.prev_invalid_arg

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.prev_invalid_arg

	mov 	r12d, eax	; prev = checksum

	process_arg__ret
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
.switch_direction:
	xor 	r14, DIR_BIT_VAL

	process_arg__ret
.unknown_argument:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unknown_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 1
	call	exit
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

%unmacro process_arg__ret 0

;; Variables:
	;; i       = ebx
	;; argc    = edi
	;; argv    = rsi
	;; prev    = r12d
	;; argv[i] = r13
	; flags    = r14.
		;; NOTE: "bit N" means use `r14 & (1 << n)` to get the value.
		;; bit 0: sequential.
		;; bit 1: pipe given.
		;; bit 2: do/undo mode. 1 for backwards/undo, 0 for forwards/do.
	; prev     = r12d
main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	xor 	r14d, r14d	; clear flags
	mov 	r12d, 1		; default input checksum
	xor 	ebx, ebx	; int i = 0;

	call	setup_argc_argv
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
	jz  	.process_pipe
.test_arg1: ;; test for things that only work as the first argument
	test 	edi, edi
	jz  	.help

	mov 	rcx, [rsi]	; --help
	lea 	rdx, [rel help_arg1]
	call	streq
	je  	.help

	mov 	rcx, [rsi]	; -h
	lea 	rdx, [rel help_arg2]
	call	streq
	je  	.help

	mov 	rcx, [rsi]	; -?
	lea 	rdx, [rel help_arg2]
	call	streq
	je  	.help
.arg_pass_1:	; go through the arguments until there is a non-option argument
	cmp 	ebx, edi
	je  	.process_pipe

	mov 	r13, [rsi + 8*rbx]

	;; only process options. no files
	cmp 	byte [r13], '-'
	jne 	.process_pipe

	call	process_arg	; NOTE: always increments ebx at the end
	jmp 	.arg_pass_1
.process_pipe:
	test	r14b, PIPE_BIT_VAL	; if the pipe-given flag isn't set, skip this part.
	jz  	.arg_pass_2

	mov 	rcx, 0
	call	__acrt_iob_func

	mov 	rcx, rax
	mov 	edx, r12d
	call	adler32_fp		; uint32_t checksum = adler32_fp(stdin, prev);

	test	r14b, SEQ_BIT_VAL

	;; if the sequential flag bit is set, update the input checksum
	cmovnz	r12d, eax	; prev = checksum

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	lea 	r8 , [rel pipeline_filename_str]
	call	printf		; printf(valid_line_fmt, checksum, "[PIPE]")
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

	cmp 	eax, -1		; adler32_fname returns -1 on file-not-found errors
	jne 	.file_found	; NOTE: -1 is not a valid adler32 checksum.

	;; the file was not readable or does not exist
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel invalid_line_fmt]
	mov 	r8 , r13
	call	fprintf		; fprintf(stderr, invalid_line_fmt, argv[i])

	;; go to the next argument and keep iterating
	inc 	ebx
	jmp 	.arg_pass_2	; continue
.file_found:
	test	r14b, SEQ_BIT_VAL

	;; if the sequential flag bit is set, update the input checksum
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
.help:
	lea 	rcx, [rel help_text]
	call	puts
	jmp 	.done
