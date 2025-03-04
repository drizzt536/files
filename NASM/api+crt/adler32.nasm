;; ../assemble adler32 --l kernel32,shell32,ucrtbase

%ifndef SCRATCH_BUF_LEN
	%define SCRATCH_BUF_LEN %eval(1024*64)
%endif

%ifndef UNROLL_N
	; after testing, I don't think unrolling changes anything.
	%define UNROLL_N 1
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
	non_seekable_large_file_undo_str	db `\e[31mERROR: file is not seekable and larger than`, %num(SCRATCH_BUF_LEN - 1), ` bytes\e[0m\n`

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
;	test_string				db `test string %ld\n\0`

	help_arg1		db `--help\0`
	help_arg2		db `-h\0`
	help_arg3		db `-?\0`

	comb_arg		db `-c\0`
	do_arg			db `-d\0`
	dir_arg			db `-D\0`
	form_arg		db `-F\0`
	inc_arg			db `-i\0`
	long_arg		db `-l\0`
	prev_arg		db `-p\0`
	raw_arg			db `-r\0`
	undo_arg		db `-u\0`

	help_text:
		db `Usage: [pipe input] | adler32 [--help | -h | -?] [-p VALUE | -[dDFilru] | FILENAME]...\n`
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
		db `    -F                Swap formatting modes. Equivalent to \`-l\` when in raw mode, and \`-r\` when in long mode.\n`
		db `    -d                Switch to forwards/do mode. (default)\n`
		db `    -u                Switch to backwards/undo mode.\n`
		db `    -D                Swap directions. Equivalent to \`-d\` when in undo mode, and \`-u\` when in do mode.\n`
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
		db `    7   non-seekable file or pipe larger than `, %num(SCRATCH_BUF_LEN - 1), ` bytes was used in undo mode\n`
		db `   -1   something is not implemented. see error message for details\0`

segment text
	global main

	extern PeekNamedPipe, GetStdHandle, GetFileType
	extern GetCommandLineW							; kernel32.dll
	extern CommandLineToArgvW						; shell32.dll
	extern fprintf, printf, puts, _access_s, exit
	extern __acrt_iob_func, fopen, fclose, fread
	extern strtoul, _fseeki64, _ftelli64			; ucrtbase.dll

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
adler32_fp_fw: ;; uint32_t adler32_fp_v2_fw(FILE *const fp, uint32_t prev_cksm);
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

	;; the arguments are sorted by commonality, based on guessing..

	;; -i
	mov 	rcx, r13
	lea 	rdx, [rel inc_arg]
	call	streq
	je  	.arg_match_i

	;; -r
	mov 	rcx, r13
	lea 	rdx, [rel raw_arg]
	call	streq
	je  	.arg_match_r

	;; -p
	mov 	rcx, r13
	lea 	rdx, [rel prev_arg]
	call	streq
	je  	.arg_match_p

	;; -c
	mov 	rcx, r13
	lea 	rdx, [rel comb_arg]
	call	streq
	je  	.arg_match_c

	;; -F
	mov 	rcx, r13
	lea 	rdx, [rel form_arg]
	call	streq
	je  	.arg_match_F

	;; -l
	mov 	rcx, r13
	lea 	rdx, [rel long_arg]
	call	streq
	je  	.arg_match_l

	;; -u
	mov 	rcx, r13
	lea 	rdx, [rel undo_arg]
	call	streq
	je  	.arg_match_u

	;; -d
	mov 	rcx, r13
	lea 	rdx, [rel do_arg]
	call	streq
	je  	.arg_match_d

	;; -D
	mov 	rcx, r13
	lea 	rdx, [rel dir_arg]
	call	streq
	je  	.switch_direction

	;; no more cases to test for. unknown argument
	;; fallthrough
.unknown_argument: ;; unused label. used for clarity.
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unknown_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	rcx, 1
	call	exit
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
.arg_match_F:
	cmp 	byte [rel valid_line_fmt + 4], `\t`
	je  	.arg_match_r
	;; branch fallthrough
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
.switch_direction:
	xor 	r14, DIR_BIT_VAL

	process_arg__ret
;;;;;;;;;;;;;;;;;;;; error cases 2-6 ;;;;;;;;;;;;;;;;;;;;
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

	xor 	eax, eax
	leave
	ret
