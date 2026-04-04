%ifndef STD_MEM_NASM
%define STD_MEM_NASM

%pragma ignore file stdmem.nasm

;; NOTE: _memscan is not safe unless you know 100% that the byte appears at least once.

%pragma ignore NOTE: likely to be removed
cstrlen: ; char *, err, u64 cstrlen(const char *str);
	;; returns a pointer to the end of a string
	xor 	bl, bl		; search for null byte

%pragma ignore NOTE: unsafe unless character is guaranteed to exist
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

%macro strlen 2
	;; %1 = strlen(%2)
	mov 	%1, qword [%2 - 8]
%endm

%macro strlen 1
	strlen	%1, %1
%endm

%macro strend 2
	; %1 = %2 + strlen(%2)

	%if %isidn(%1, %2)
		add 	%1, qword [%2 - 8]
	%else
		strlen	%1, %2
		add 	%1, %2
	%endif
%endm

%macro strend 1
	strend	%1, %1
%endm

%macro strnlen 3
	;; %1 = result, %2 = str, %3 = maxlen.
	strlen	%1, %2	; result = strlen(str);

	cmp 	%1, %3	; if (result > maxlen)
	cmova	%1, %3	;     result = maxlen;
%endm

%macro strnlen 2
	;; %1 = result/str, %2 = maxlen.
	strlen	%1

	cmp 	%1, %2
	cmova	%1, %2
%endm

%ifdifi
char *strncpy(char *dst, char *src, u64 maxlen) {
	return (char *) memmove(dst - 8, src - 8, strnlen(src, maxlen) + 8);
}
%endif

strncpy:
	mov 	rdx, rcx
	strnlen	rcx, rbx, rdx

	sub 	rax, 8	; dst -= 8;
	sub 	rbx, 8	; src -= 8;
	add 	rcx, 8	; len += 8;
	jmp 	memmove

%ifdifi
char *strcpy(char *dst, char *src) {
	return (char *) memmove(dst - 8, src - 8, strlen(src) + 8);
}
%endif

strcpy:
	strlen	rcx, rbx

	sub 	rax, 8	; dst -= 8;
	sub 	rbx, 8	; src -= 8;
	add 	rcx, 8	; len += 8;
	;; fallthrough

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
	rep 	stosb

	mov 	rax, rbx	; restore rax.
	ret

%ifdifi
i8 strcmp(char *a, char *b) {
	const u64
		alen = *(u64 *)(a - 8),
		blen = *(u64 *)(b - 8);

	u64 len = alen;

	if (blen < len)
		len = blen;

	if (len != 0) {
		do {
			if (*a < *b) return -1;
			if (*a > *b) return +1;

			a++, b++;
		} while (--len);
	}

	if (alen < blen) return -1;
	if (alen > blen) return +1;

	return 0;
}
%endif

;; clobbers rax, rbx, rcx, rdx, dil, and rsi
;; sets up SF and ZF to use immediately after calling
strcmp: ; i8 strcmp(string a, string b);
	strlen	rcx, rax
	strlen	rdx, rbx
.preloop:
	cmp 	rcx, rdx
	cmova	rcx, rdx		; u64 len = min(strlen(a), strlen(b));
	jrcxz	.done			; if (len == 0) goto done;
	mov 	rsi, rcx
.loop:						; do {
	mov 	dil, byte [rax]
	cmp 	dil, byte [rbx]
	jb  	.less			;     if (*a < *b) return -1;
	ja  	.greater		;     if (*a > *b) return +1;

	inc 	rax, rbx		;     a++, b++;
	loop	.loop			; } while (--len != 0);

	mov 	rcx, rsi
.done:
	cmp 	rcx, rdx
	jb  	.less			; if (strlen(a) < strlen(b)) return -1;
	ja  	.greater		; if (strlen(a) > strlen(b)) return +1;

	xor 	al, al			; return 0;
	ret
.less:
	xor 	al, al
	dec 	al
	ret
.greater:
	xor 	al, al
	inc 	al
	ret

strncmp: ; i8 strncmp(string a, string b, u64 maxlen);
	mov 	rsi, rcx
	strnlen	rcx, rax, rsi	; u64 alen = strnlen(a, maxlen);
	strnlen	rdx, rbx, rsi	; u64 blen = strnlen(b, maxlen);
	jmp 	strcmp.preloop	;; strcmp.preloop(a, b, strnlen(a, maxlen), strnlen(b, maxlen));

;; clobbers rax, rbx, rcx, dl
memcmp: ; i8 memcmp(u8 *a, u8 *b, u64 len);
	jrcxz	.equal			; if (len == 0) return 0;
.loop:						; do {
	mov 	dl, byte [rax]
	cmp 	dl, byte [rbx]
	jb  	.less			;     if (*a < *b) return -1;
	ja  	.greater		;     if (*a > *b) return +1;

	inc 	rax, rbx		;     a++, b++;
	loop	.loop			; } while (--len != 0);
.equal:
	xor 	al, al
	ret
.less:
	xor 	al, al
	dec 	al
	ret
.greater:
	xor 	al, al
	inc 	al
	ret

;; sets ZF so the caller can do `call streq` followed by either `je label` or `jne label`
streq: ; u8 streq(string a, string b);
	strlen	rcx, rax		; u64 alen = strlen(a);
	strlen	rdx, rbx		; u64 blen = strlen(b);
	jcne	rcx, rdx, .ne	; if (alen != blen) return 1;
	jrcxz	.eq				; if (len == 0) return 0;
.loop:						; do {
	mov 	dl, byte [rax]
	cmp 	dl, byte [rbx]
	jne 	.ne				;     if (*a != *b) return 1;

	inc 	rax, rbx		;     a++, b++;
	loop	.loop			; } while (--len != 0);
.eq:
	xor 	al, al
	ret
.ne:
	xor 	al, al
	inc 	al
	ret
.greater:
	xor 	al, al
	inc 	al
	ret

%ifdifi
char *strrev(char *s) {
	u64 a = 0;
	u64 b = strlen(s);

	until (a > b) {
		char t = s[a];
		s[a]   = s[b - 1];
		s[b - 1] = t;

		a++;
		b--;
	}

	return s;
}
%endif

strrev: ; char *strrev(char *s);
	;; rbx =  left index
	;; rcx = right index
	xor 	ebx, ebx
	strlen	rcx, rax
.loop:
	jca 	rbx, rcx, .done
	mov 	dl, byte [rax + rbx]		; char t = s[a];
	xchg	dl, byte [rax + rcx - 1]	;; swap s[b - 1] and t
	mov 	byte [rax + rbx], dl		; s[a] = t;
	inc 	rbx
	dec 	rcx
	jmp 	.loop
.done:
	ret

;; TODO: stricmp, strnicmp, strchr, strrchr, strstr, strrstr, strcat, strncat,
;;      strdup, strndup, strcspn?, strspn?, strpbrk?, strtok, strtoupper, strtolower
%endif ; %ifndef STD_MEM_NASM
