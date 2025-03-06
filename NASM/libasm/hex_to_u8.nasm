;; assumes `segment text` is already done.
;; does not require any external functions

%ifndef HEX_TO_U8_INC
%define HEX_TO_U8_INC

;; this file is almost the exact same as hex_to_u32.nasm, but with a
;; shorter loop, a different name, and a couple of extra optimizations.

;; returns qword -1 on error.
;; check the upper bits of rax to see if there was an error

;; convert hex string to unsigned 32-bit integer

;; clobbers: rax (return value), rcx, dl, r8
hex_to_u8: ; uint64_t hex_to_u8(const char *str) {
	jrcxz	.error ; null check

	cmp 	byte [rcx], `\0`
	je  	.error

%ifndef HEX_TO_U8_SKIP_PREFIX_CHECK
	;; skip past '0x' if applicable
	cmp 	word [rcx], '0x'
	jne 	.noprefix
	add 	rcx, 2
%endif
.noprefix: ;; the string doesn't have a prefix anymore.
	;; clear r8d and not r8b because r8 is used as an offset, and clearing r8b doesn't clear the upper bits.
	xor 	eax, eax	; register uint32_t x = 0;
	xor 	r8d, r8d	; register uint8_t  i = 0;
.loop: ;; loop up to 8 times (8 characters)
	mov 	dl, [rcx + r8]	; dl = c

	test 	dl, dl
	jz  	.done

	;; this might be a little strange for the invalid case, but just don't give invalid values.
	shl 	al, 4
.cond1: ; '0' <= c <= '9'
	cmp 	dl, '0'
	jb  	.error

	cmp 	dl, '9'
	ja  	.cond2

	;; c <= '9'
	sub 	dl, '0'
	jmp 	.endloop
.cond2: ; 'A' <= c <= 'F'
	cmp 	dl, 'A'
	jb  	.error

	cmp 	dl, 'F'
	ja  	.cond3

	;; c <= 'F'
	sub 	dl, 'A' - 10
	jmp 	.endloop
.cond3: ; 'a' <= c <= 'f'
	cmp 	dl, 'a'
	jb  	.error

	;; there are no more conditions to check, so after this it is invalid if it is greater
	cmp 	dl, 'f'
	ja  	.error

	;; c <= 'f'
	sub 	dl, 'a' - 10
.endloop:
	or  	al, dl
	inc 	r8b
	cmp 	r8b, 2
	jb  	.loop
.done:
	ret
.error:
	;; return `qword -1` on error.
	;; this is different than `-1` the value because the upper bits of `rax` are set.

	;; NOTE: using `al` instead of `eax` is okay because `eax` is zeroed out before the loop,
	;;       and only `al` is changed inside the loop.
	xor 	al, al
	dec 	eax	;; return dword -1

	;; use 32-bit value for error return instead of 64 or 16 because 64 bits
	;; are not required, and 16-bit instructions have longer opcodes.
	ret
%endif
