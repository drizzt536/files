%ifndef ADLER32_STR_NASM
%define ADLER32_STR_NASM

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

%endif ;; ADLER32_STR_NASM
