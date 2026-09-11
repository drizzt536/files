%ifndef ADLER32_FP_NASM
%define ADLER32_FP_NASM

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

%endif ;; ADLER32_FP_NASM
