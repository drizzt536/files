;; assumes `segment text` is already done.
;; does not require any external functions

%ifndef HEX_TO_U32_INC
%define HEX_TO_U32_INC

;; returns qword -1 on error.
;; check the upper bits of rax to see if there was an error

;; convert hex string to unsigned 32-bit integer

;; clobbers: rax, rcx, rdx, r8
hex_to_u32: ; uint64_t hex_to_u32(char *str);
	jrcxz	.error ; null check

	cmp 	byte [rcx], `\0`
	je  	.error

%ifndef HEX_TO_U32_SKIP_PREFIX_CHECK
	;; skip past '0x' if applicable
	cmp 	word [rcx], '0x'
	jne 	.noprefix
	add 	rcx, 2
.noprefix: ;; the string doesn't have a prefix anymore.
%endif
	;; clear r8d and not r8b because r8 is used as an offset, and clearing r8b doesn't clear the upper bits.
	xor 	eax, eax	; register uint32_t x = 0;
	xor 	r8d, r8d	; register uint8_t  i = 0;
	xor 	edx, edx	; clear all bits so `or eax, edx` works properly
.loop: ;; loop up to 8 times (8 characters)
	mov 	dl, [rcx + r8]	; dl = c

	test 	dl, dl
	jz  	.done

	;; this might be a little strange for the invalid case, but just don't give invalid values.
	shl 	eax, 4
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
	or  	eax, edx
	inc 	r8b
	cmp 	r8b, 8
	jb  	.loop
.done:
	ret
.error:
	;; return `qword -1` on error.
	;; this is different than `-1` the value because the upper bits of `rax` are set.
	xor 	eax, eax
	dec 	rax
	ret
%endif
