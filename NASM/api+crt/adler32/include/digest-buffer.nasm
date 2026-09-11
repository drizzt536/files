%ifndef DIGEST_BUFFER_NASM
%define DIGEST_BUFFER_NASM

;; TODO: add documentation to the internal buffer digest functions

;; Variables:
	;; a              : rbx
	;; b              : rbp
	;; i              : r8d
	;; bytes_read     : eax
	;; scratch_buffer : r13, [rel scratch_buffer]
	;; tmp1           : rdx
	;; tmp2           : rcx (only if UNROLL_N > 1)

	;; return values: bytes_read (r8d), a (ebx), b (ebp)

;; NOTE: technically, r13 doesn't need to be [rel scratch_buffer], but it probably
;;       will be for most input methods, except maybe for immedate value strings.
;;       for immediate value strings, `bytes_read` is really `data_length`.
;;       it should be fine as long as it is less than ~362 MiB.

;; perform a checksum of the given buffer with a single modulo at the end.

;; this is defined as a macro because it is inlined if -DBARE_BONES is given.
%macro _adler32_digest_buffer_fw_macro 0
	xor 	r8d, r8d	; uint32_t i = 0;
%if UNROLL_N == 1 ;; start of for loop
%%for@start:
	cmp 	r8d, eax
	je  	%%done		; if (i == bytes_read) break; // while (i < bytes_read) { ... }

	movzx	edx, byte [r13 + r8]
	add 	rbx, rdx	; a += scratch_buffer[i]
	add 	rbp, rbx	; b += a
%%for@inc: ;; unused label. for clarity
	inc 	r8d
	jmp 	%%for@start
%else ;; end UNROLL_N == 1 branch.
%%for@start:
	add 	r8d, UNROLL_N
	cmp 	r8d, eax
	ja  	%%for@done	; if (i + N >= bytes_read) break; // while (i + N < bytes_read) { ... }

	;; these use subtraction instead of addition them because of the `i += N` at the start of the loop.
	;; NOTE: the order matters, so this has to be i = N...1, and can't be i = 1...N
%assign i UNROLL_N
%rep UNROLL_N
	movzx	edx, byte [r13 + r8 - i]	; tmp = scratch_buffer[i]
	add 	rbx, rdx					; a += scratch_buffer[i]
	add 	rbp, rbx					; b += a
	%assign i i - 1
%endrep

	jmp 	%%for@start
%%for@done:
	sub 	r8d, UNROLL_N		;; counteract the `add r8d, N` at the start of the loop.

	;; setup jump address
	mov 	edx, r8d			; tmp = i;
	sub 	edx, eax			; tmp = i - bytes_read == -(bytes_read - i);
	add 	edx, UNROLL_N - 1	; tmp = (N - (bytes_read - i));
	shl 	edx, 4				; tmp = 16*(N - (bytes_read - i));
	mov 	rcx, $				;; 10 byte instruction
	lea 	rdx, [rcx + (10 + 5 + 2) + rdx] ;; 5 byte instruction

	; rip + distance to .case_%[N-1] + 16*((N - 1) - (bytes_read - i))
	jmp 	rdx ;; 2 byte instruction
	;; NOTE: the mov instruction is 10 bytes, the lea instruction is 4 bytes, and `jmp rdx` is 2 bytes.
	;; this assumes that `.case_%[N - 1]` is directly after `jmp rdx`. this should be the case.
	;; the 16*(N - 1) comes from the constant term of 16*(N - 1 - (bytes_read - 1)),
	;; which in turn comes from how the cases are in reverse (e.g. case N-1 is 0th, case N-2 is 1st, etc.)
%assign i UNROLL_N - 1

;; the cases are intended to fall through to the next case.
;; handle the last remaining (N-1 to 1) bytes.
%rep UNROLL_N - 1
%%case_%[i]_leftover: ;; i is the number of bytes left to be processed
	movzx	edx, byte [r13 + r8] ; tmp = scratch_buffer[i]
	add 	rbx, rdx	; a += tmp
	add 	rbp, rbx	; b += a
	add 	r8d, 1		;; `inc r8d` but one byte longer for alignment. avoids `nop` instruction.

	%assign i i - 1
%endrep
%%case_0_leftover:
	;; do modulos, etc.

%undef i
%endif ;; end UNROLL_N != 1 branch. end of for loop
%%done:
	mov 	r8d, eax	; save bytes_read into r8d

	modbase_u64 rbx
	modbase_u64 rbp
%endm ; _adler32_digest_buffer_fw_macro

%ifndef BARE_BONES
%cond(%isndef(NO_ALIGN), align 64) ;; align to the next cache line. hot function.
_adler32_digest_buffer_fw:
_adler32_digest_buffer_fw_macro
	ret
%endif ; %ifndef BARE_BONES


%ifndef NO_DIRECTIONS
;; Variables:
	;; a              : rbx
	;; b              : rbp
	;; bytes_read / i : rax
	;; tmp            : rdx
	;; BASE (65521)   : r12
	;; scratch_buffer : r13

%cond(%isndef(NO_ALIGN), align 64) ;; the last function should be close to a boundary already
_adler32_digest_buffer_bw:
.loop:
	test	eax, eax				; while (i > 0) {
	jz  	.done
	dec 	eax						;     i--;

	movzx	edx, byte [r13 + rax]	;     tmp = scratch_buffer[i];
	sub 	rbp, rbx				;     b  -= a;
	sub 	rbx, rdx				;     a  -= tmp;

	jmp 	.loop					; }
.done:
	;; a = a % BASE + (a < 0)*BASE;
	modbase_i64 rbx, rcx
	lea 	rdx, [r12 + rbx]		; tmp = a + BASE;
	test	rbx, rbx				; if (a < 0)
	cmovs	rbx, rdx				;     a += BASE;

	;; b = b % BASE + (b < 0)*BASE;
	;; TODO: perhaps use a different clobber than rcx for this for better pipelinability?
	modbase_i64 rbp, rcx
	lea 	rdx, [r12 + rbp]		; tmp = b + BASE;
	test	rbp, rbp				; if (b < 0)
	cmovs	rbp, rdx				;     b += BASE;
	ret
%endif ; %ifndef NO_DIRECTIONS

%endif ;; DIGEST_BUFFER_NASM
