%ifndef STD_MEM_NASM
%define STD_MEM_NASM

%pragma ignore file stdmem.nasm

;; NOTE: _memscan is not safe unless you know 100% that the byte appears at least once.

%pragma ignore NOTE: likely to be removed
cstrlen: ; string, u64 cstrlen(const string str);
	;; returns a pointer to the end of a string
	zero	bl			;; search for null byte

%pragma ignore NOTE: unsafe unless character is guaranteed to exist
_memscan: ; void *, u64 _memscan(const void *ptr, u8 c);
	;; basically `memchr`, but without the length end condition.
	cld 				;; forwards
	mov 	rdi, rax
	zero	ecx			;; start with index 0
	xchg	al, bl		;; `mov al, bl`, but preserve the pointer lower byte
	repne	scasb		;; sets rcx to be the index of te null byte
	not 	rcx			;; rcx = -rcx - 1

	mov 	al, bl
	add 	rax, rcx	;; new ptr
	mov 	rbx, rcx	;; no errors
	ret					;; return (new ptr, index)

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
string strncpy(string dst, string src, u64 maxlen) {
	return (string) memmove(dst - 8, src - 8, strnlen(src, maxlen) + 8);
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
string strcpy(string dst, string src) {
	return (string) memmove(dst - 8, src - 8, strlen(src) + 8);
}
%endif

strcpy:
	strlen	rcx, rbx

	sub 	rax, 8	; dst -= 8;
	sub 	rbx, 8	; src -= 8;
	add 	rcx, 8	; len += 8;
	;; fallthrough

; void *memcpy(u8 *dst, u8 *src, u64 count);
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
	cld 				;; clear direction for forwards move
	mov 	rdi, rax	;; destination
	xchg	rax, rbx	;; `mov al, bl`, but preserve ptr
	rep 	stosb

	mov 	rax, rbx	;; restore rax
	ret

%ifdifi
i8 strcmp(string a, string b) {
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

	zero	al				; return 0;
	ret
.less:
	zero	al
	dec 	al
	ret
.greater:
	zero	al
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
	zero	al
	ret
.less:
	zero	al
	dec 	al
	ret
.greater:
	zero	al
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
	zero	al
	ret
.ne:
	zero	al
	inc 	al
	ret
.greater:
	zero	al
	inc 	al
	ret

%ifdifi
string strrev(string s) {
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

strrev: ; string strrev(string s);
	;; rbx =  left index
	;; rcx = right index
	zero	ebx
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

%ifdifi
vstring strtok(string str, vstring tok, string delims) {
	tok.n = tok.p + tok.n + 1;

	if (tok.p == NULL)
		tok.n = str;

	tok.p = tok.n
	tok.n = 0;

	const u64 slen = strlen(str);
	const u64 dlen = strlen(delims);

	// slen -= tok.p - str;
	slen += str;
	slen -= tok.p;

	for (; tok.n < slen; tok.n++) {
		for (u64 j = 0; j < dlen; j++) {
			char tmp = tok.p[tok.n];

			if (tmp == delims[j])
				return tok;
		}
	}

	if (tok.n != 0)
		return tok;

	// empty
	return (vstring) {.n = 0, .p = NULL};
}
%endif

strtok: ; vstring strtok(string str, vstring tok, string delims);
	push	rbp
	lea 	rbx, [rcx + rbx + 1]	; tok.n = tok.p + tok.n + 1;	// skip the token and delim

	test	rcx, rcx				; if (tok.p == NULL)
	cmovz	rbx, rax				;     tok.n = str;

	mov 	rcx, rbx				; tok.p = tok.n;
	zero	ebx						; tok.n = 0;

	strlen	rdi, rax				; u64 slen = strlen(str);
	strlen	rsi, rdx				; u64 dlen = strlen(delims);

	;; make slen relative to tok.p	; // slen -= tok.p - str;
	add 	rdi, rax				; slen += str;
	sub 	rdi, rcx				; slen -= tok.p;

	;; rax = j
	;; rbx = tok.n
	;; rcx = tok.p
	;; rdx = delims
	;; rdi = slen
	;; rsi = dlen
	;; bpl = tmp

.str_iter:							; while (tok.n < slen) {
	jcae	rbx, rdi, .empty

	zero	eax						;     u64 j = 0;
.delim_iter:						;     while (j < dlen) {
	jcae	rax, rsi, .delim_iter@done

	mov 	bpl, byte [rcx + rbx]	;         char tmp = tok.p[tok.n];
	jce 	bpl, byte [rdx + rax], .ret	;     if (tmp == delims[j]) goto ret;

	inc 	rax						;         j++;
	jmp 	.delim_iter				;     }
.delim_iter@done:
	inc 	rbx						;     tok.n++;
	jmp 	.str_iter				; }

.empty:
	jtnz 	rbx, rbx, .ret			; if (tok.n != 0) return tok;

	;; NOTE: if you pass this back into strtok, it will find the first token again.
	pop 	rbp						; return (vstring) {
	zero	eax						;     .n = 0,
	zero	ebx						;     .p = NULL
	ret								; };
.ret:
	pop 	rbp
	mov 	rax, rbx
	mov 	rbx, rcx
	ret								; return tok;



;; TODO: stricmp, strnicmp, strchr, strrchr, strstr, strrstr, strcat, strncat,
;;      strdup, strndup, strcspn?, strspn?, strpbrk?, strtok, strtoupper, strtolower
%endif ; %ifndef STD_MEM_NASM
