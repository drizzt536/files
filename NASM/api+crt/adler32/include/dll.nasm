%ifndef DLL_NASM
%define DLL_NASM

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
	; debug_print_str `size left: %zu\n\0`, len
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
%xdefine len	rcx
%xdefine len32	ecx

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

%endif ;; DLL_NASM
