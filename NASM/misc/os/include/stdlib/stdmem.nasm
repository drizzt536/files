%ifndef STD_MEM_NASM
%define STD_MEM_NASM
%pragma ignore stdmem.nasm

; memcpy: ; void *memcpy(u8 *dst, u8 *src, u64 count);
	;; memcpy is an alias of memmove.forwards, kind of.

;; TODO: this can be made to use movsd or movsq under the following conditions:
	;; movsq: (src - dst) >= 8 && count % 8 == 0 // or do the rest of the count % 8 separately
	;; movsd: (src - dst) >= 4 && count % 4 == 0 // or do the rest of the count % 8 separately
	;; don't even bother with movsw
	;; instead of forcing the divisibility, you can also do the rest separately.
	;; the difference only matters in the first place if the data is longer than like 100 bytes

memmove: ; void *memmove(u8 *dst, u8 *src, u64 count);
	jca 	rax, rbx, memcpy.backwards	; if (dst > src) goto backwards;

	;; fallthrough
%pragma ignore NOTE: forwards copy
memcpy:
.forwards: ; unused label. for clarity
	;; iterate forwards. move to lower memory
	cld 				;; forwards move
	mov 	rdi, rax
	mov 	rsi, rbx
	rep 	movsb
	ret
.backwards:
	;; iterate backwards. move to higher memory
	std					;; backwards move
	lea 	rdi, [rax + rcx - 1]
	lea 	rsi, [rbx + rcx - 1]
	rep 	movsb
	ret

memset: ; void *memset(void *ptr, u8 value, u64 num);
	cld 				; clear direction for forwards move
	mov 	rdi, rax	; destination
	xchg	rax, rbx	; `mov al, bl`, but preserve ptr
;	mov 	rcx, rcx	; redundant instruction
	rep 	stosb

	mov 	rax, rbx	; restore rax.
	ret

;; NOTE: _memscan is not safe unless you know 100% that the byte appears at least once.
cstrlen: ; char *, err, u64 cstrlen(const char *str);
	;; returns a pointer to the end of a string
	xor 	bl, bl		; search for null byte
_memscan: ; void *, err, u64 _memscan(const void *ptr, u8 c);
	;; basically `memchr`, but without the length end condition.
	cld 				; forwards
	mov 	rdi, rax
	xor 	ecx, ecx	; start with index 0
	xchg	al, bl		; `mov al, bl`, but preserve the pointer lower byte
	repne	scasb		; sets rcx to be the index of te null byte
	not 	rcx			; rcx = -rcx - 1

	mov 	al, bl
	add 	rax, rcx	; new ptr
	xor 	ebx, ebx	; no errors
	ret					; return (new ptr, err code, index)

%pragma ignore NOTE: dont use this function
strlen: ; u64 strlen(char *str);
	mov 	rax, qword [rax - 8]
	ret

%pragma ignore NOTE: dont use this function
strend: ; void * strend(char *str);
	add 	rax, qword [rax - 8]
	ret
%endif ; %ifndef STD_MEM_NASM
