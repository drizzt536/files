;; ../assemble adler32 --l kernel32,shell32,ucrtbase

%define SCRATCH_BUF_LEN	%eval(1024*1024)
%define BASE 65521

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
	unknown_arg_str			db `\e[31mERROR: unknown argument \`%s\`.\e[0m\n`
							db `Use \`--help\` for more information.\0`
	pipeline_available_str	db `the pipeline is available\0`
	file_read_modifier		db `r\0`
	pipeline_filename_str	db `[PIPE]\0`

	help_arg1		db `--help\0`
	help_arg2		db `-h\0`
	help_arg3		db `-?\0`
	prev_arg		db `-p\0`
	raw_arg			db `-r\0`
	seq_arg			db `-s\0`

	help_text:
		db `Usage: adler32 [-s] [-p VALUE | -r | filename]...\n`
		db `\n`
		db `Options:\n`
		db `    -h, -?, --help    print this message. must be the first argument.\n`
		db `    -s                sequential mode. automatically carry over the checksum between files.\n`
		db `                      must be the first argument. Missing files do not update the checksum.\n`
		db `    -p [value]        set the starting checksum for the next group of files.\n`
		db `                      can be used multiple times. Only the first 8 chars of the value are read.\n`
		db `                      if an invalid value is passed, the program exits immediately.\n`
		db `    -r                print only the checksum for subsequent files.\n`
		db `\n`
		db `Exit Codes:\n`
		db `    0: success\n`
		db `    1: \`-p\` given without a value\n`
		db `    2: \`-p\` given with an invalid value\n`
		db `    3: unknown argument\0`

segment text
	global main

	extern PeekNamedPipe, GetStdHandle, GetFileType
	extern GetCommandLineW							; kernel32.dll
	extern CommandLineToArgvW						; shell32.dll
	extern fprintf, printf, puts, _access_s
	extern __acrt_iob_func, fopen, fclose, fread	; ucrtbase.dll

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

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; adler32_fp ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; NOTE: nmax is the number of bytes that can be processed before a modulo is required.
;; nmax for 32 bits  : 5,552                     (5 KiB   ≈ 2^12)
;; nmax for 64 bits  : 380,368,439               (363 MiB ≈ 2^28)
;; nmax for 128 bits : 1,633,671,114,142,571,306 (1 EiB   ≈ 2^60)

;; with 64-bit intermediate values, a modulo is only required every 363 MiB to prevent
;; overflow, but that is too much memory to use at once, so this implementation applies
;; the modulo at the end of every 1 MiB block instead. using 128-bit intermediate values,
;; you can ignore doing modulos until the end. the methodology in finding the values is
;; this function: `nmax_f = lambda n, bits: 255*n*(n + 1)//2 + (n + 1)*(BASE - 1) - 2**bits + 1`
;; and then you maximize the `n` while ensuring `nmax_f(n, bits) < 0`. This formula came
;; from zlib, and then I just expanded it to also work with different bit widths.
;; you can also use the explicit formula: `Floor[(Sqrt[17104714185 + 2040 2^bits] - 131295)/510]`

;; https://github.com/madler/zlib/blob/e9d5486e6635141f589e110fd789648aa08e9544/adler32.c#L12

;; a register is required for the scratch buffer because `byte [rel scratch_buffer + rdi]`
;; doesn't work (RIP address with register offset). and you can't do `[scratch_buffer + rdi]`
;; because Windows uses 32-bit addressing for some brain-dead reason.

%if 0
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

;; buffered adler32 given a file pointer as input. reads in 1 MiB at a time
;; this should work for stdin since `fread` doesn't lock if there are no more characters
;; returns the file checksum.
adler32_fp: ;; uint32_t adler32_fp_v2(FILE *const fp, uint32_t prev);
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
	cmp 	r8d, dword SCRATCH_BUF_LEN
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

;; compute the adler32 checksum of a file given the file name as a string
adler32_fname:
	;; uint32_t adler32_fname(char *filename, uint32_t previous_checksum);
	push	r12
	push 	r13

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32		; shadow space

	mov 	r12, rcx	; file name
	mov 	r13, rdx	; input hash

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
	call	adler32_fp	; rax = adler32_fp(fp)

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

main:
	push	rbx	; loop index
	push	r12	; previous checksum
	push	r13 ; current file path
	push	r14	; flags (currently only -s and pipeline given)

	xor 	r14d, r14d	; clear the flags
	xor 	ebx, ebx	; int i = 0;

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	call	setup_argc_argv
	dec 	edi ; ignore the current executable path argument
	add 	rsi, 8

	;; static FILE *const pstderr = __acrt_iob_func(2);
	mov 	rcx, 2
	call	__acrt_iob_func
	mov 	[rel pstderr], rax

	;; TODO: minor bug: `echo asdf | ./adler32` will print the help text.
	call	pipeline_available

	test 	al, al
	jz  	.after_pipeline

	mov 	rcx, 0
	call	__acrt_iob_func

	mov 	rcx, rax
	mov 	edx, 1
	call	adler32_fp

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	lea 	r8 , [rel pipeline_filename_str]
	call	printf
.after_pipeline:
	test	edi, edi
	jz  	.help		; print help text if there are no arguments
	test	edi, edi
	jz  	.help		; print help text if there are no arguments

	mov 	r12d, 1		; default value for the previous hash
	mov 	rcx, [rsi]
.test_for_help_arg: ;; unused label
	; if the first argument doesn't start with `-`, it can't be --help, -h, -?, or -s.
	cmp 	byte [rcx], '-'
	jne 	.main_loop

	; NOTE: streq always updates ZF
	lea 	rdx, [rel help_arg1]
	call	streq
	je  	.help

	mov 	rcx, [rsi]
	lea 	rdx, [rel help_arg2]
	call	streq
	je  	.help

	mov 	rcx, [rsi]
	lea 	rdx, [rel help_arg3]
	call	streq
	je  	.help
.test_for_sequential_arg: ;; unused label
	mov 	rcx, [rsi]
	lea 	rdx, [rel seq_arg]
	call	streq

	sete	r14b		; if (arg == "-s") r14 = 1;
	jne 	.main_loop	; don't go to the next argument if it isn't `-s`

	inc 	ebx
	cmp 	ebx, edi
	je  	.done ;; -s with nothing after it
.main_loop:
	mov 	r13, [rsi + 8*rbx] ; r13 = argv[i]

	;; check for -r
	mov 	rcx, r13
	lea 	rdx, [rel raw_arg]
	call	streq
	je  	.process_raw ;; arg == -r

	;; check for -p
	mov 	rcx, r13
	lea 	rdx, [rel prev_arg]
	call	streq
	jne 	.process_file ;; jump away if arg != -p
.process_prev: ;; unused label
	;; process -p [prev]
	;; expect another argument for the previous checksum

	inc 	ebx
	cmp 	ebx, edi
	je  	.prev_no_arg ;; -p with nothing after it

	mov 	r13, [rsi + 8*rbx]
	mov 	rcx, r13
	call	hex_to_u32

	cmp 	ax, BASE - 1
	ja  	.prev_invalid_arg

	cmp 	eax, BASE - 1 << 16 | BASE - 1
	ja  	.prev_invalid_arg

	inc 	ebx
	cmp 	ebx, edi
	je  	.done ;; -p [prev] with nothing after it

	mov 	r12d, eax
	jmp 	.main_loop
.process_raw:
	inc 	ebx
	cmp 	ebx, edi
	je  	.done ;; -r with nothing after it
	;; increment ebx first to make it slightly faster if there is nothing after -r

	;; TODO: maybe throw an error or give a warning if -r is passed more than once
	;; TODO: make these not be magic numbers
	mov 	word [rel valid_line_fmt + 4], `\n\0`
	mov 	word [rel invalid_line_fmt + 18], `\n\0`

	jmp 	.main_loop
.process_file:
	mov 	rcx, r13

	cmp 	byte [rcx], '-'	; use rcx instead of r13 for the shorter opcode.
	je  	.unknown_arg

	mov 	edx, r12d
	call	adler32_fname

	;; if the file was invalid, don't pass into the next call.
	cmp 	eax, -1 ;; invalid file. error message already printed.
	je  	.invalid_file

	test	r14b, r14b	;; r14b != 0 ==> sequential
	jz  	.print_value

	mov 	r12d, eax
.print_value:
	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	mov 	r8 , r13
	call	printf

	jmp 	.loop_inc
.invalid_file:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel invalid_line_fmt]
	mov 	r8 , r13
	call	fprintf
	; implicit `jmp .loop_inc`
.loop_inc:
	inc 	ebx

	cmp 	ebx, edi
	jne  	.main_loop
.done:
	xor 	eax, eax
.exit:
	leave
	pop 	r14
	pop 	r13
	pop 	r12
	pop 	rbx
	ret
.help:
	lea 	rcx, [rel help_text]
	call	puts

	jmp 	.done
.prev_no_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_no_arg_str]
	call 	fprintf

	mov 	eax, 1
	jmp 	.exit
.prev_invalid_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel prev_invalid_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	eax, 2
	jmp 	.exit
.unknown_arg:
	mov 	rcx, [rel pstderr]
	lea 	rdx, [rel unknown_arg_str]
	mov 	r8 , r13
	call	fprintf

	mov 	eax, 3
	jmp 	.exit
