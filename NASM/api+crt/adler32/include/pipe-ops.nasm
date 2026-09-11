%ifndef PIPE_OPS_NASM
%define PIPE_OPS_NASM

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
	scanf("%zu", &x);
	return x;
}
%endif
pipe_read_u64:
	sub 	rsp, 48

	mov 	qword [rsp + 32], 0
	lea 	rcx, [rel fmt_zu]
	lea 	rdx, [rsp + 32]
	call	scanf			; scanf("%zu", &x);

	mov		rax, [rsp + 32]	; return x;
	add 	rsp, 48
	ret
%endif ;; NO_PIPE

%endif ;; PIPE_OPS_NASM
