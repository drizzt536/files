%ifndef STD_MEM_NASM
%define STD_MEM_NASM
%pragma ignore stdmem.nasm

; memcpy: ; void *, err memcpy(u8 *dst, u8 *src, u64 count);
	;; memcpy is an alias of memmove.forwards, kind of.

;; NOTE: this can be made to use movsd or movsq under the following conditions:
	;; movsq: (src - dst) >= 8 && count % 8 == 0 // or do the rest of the count % 8 separately
	;; movsd: (src - dst) >= 4 && count % 4 == 0 // or do the rest of the count % 8 separately
	;; don't even bother with movsw
	;; instead of forcing the divisibility, you can also do the rest separately.
	;; the difference only matters in the first place if the data is longer than like 100 bytes

memmove: ; void *, err memmove(u8 *dst, u8 *src, u64 count);
	cmp 	rax, rbx	; if (dst > src)
	ja  	memcpy.backwards	;     goto backwards;
memcpy:
.forwards: ; unused label. for clarity
	;; iterate forwards. move to lower memory
	cld					;; forwards move
	mov 	rdi, rax
	mov 	rsi, rbx
	rep 	movsb

	xor 	ebx, ebx	;; no errors
	ret
.backwards:
	;; iterate backwards. move to higher memory
	std					;; backwards move
	lea 	rdi, [rax + rcx - 1]
	lea 	rsi, [rbx + rcx - 1]
	rep 	movsb

	xor 	ebx, ebx	;; no errors
	ret

memset: ; void *, err memset(void *ptr, u8 value, u64 num);
	cld					; clear direction for forwards move
	mov 	rdi, rax	; destination
	xchg	rax, rbx	; `mov al, bl`, but preserve ptr
;	mov 	rcx, rcx	; redundant instruction
	rep 	stosb

	mov 	rax, rbx	; restore rax.
	xor 	ebx, ebx	; no errors
	ret

;; it is recommended to use `strend` and `_memscan` over `strlen` and `_memfind`
;; all of the functions return both values, just the locations are swapped based on what the main value is.
;; NOTE: _memscan and _memfind are not safe unless you know 100% that the value appears at least once.

%pragma ignore NOTE: use strend
strlen: ; u64, err, char * strlen(const char *str);
	call	strend
	xchg 	rax, rcx
	ret					; return (index, err code, new ptr)

strend: ; char *, err, u64 strend(const char *str); // not std C
	;; returns a pointer to the end of a string
	xor 	bl, bl		; search for null byte
_memscan: ; void *, err, u64 _memscan(const void *ptr, u8 c); // not std C
	;; basically `memchr`, but without the length end condition.
	cld					; forwards
	mov 	rdi, rax
	xor 	ecx, ecx	; start with index 0
	xchg 	al, bl		; `mov al, bl`, but preserve the pointer lower byte
	repne	scasb		; sets rcx to be the index of 
	not 	rcx			; rcx = -rcx - 1

	mov 	al, bl
	add 	rax, rcx	; new ptr
	xor 	ebx, ebx	; no errors
	ret					; return (new ptr, err code, index)

%endif ; %ifndef STD_MEM_NASM
