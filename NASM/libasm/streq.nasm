%ifndef CALLCONV_MAC
	%include "callconv.mac"
%endif

;; NOTE: the zero flag is always set after `streq` runs.
;; this way you don't need `test al, al`. just jump.

;; NOTE: returns 0 on true and 1 on false. this way,
;; you can do `je .if_equal` or `jne .if_unequal`.

%if %isnidni(callconv, "Microsoft ABI") || __?BITS?__ != 16
	;; the main implementation:
	streq:						; bool streq(uint8_t *a, uint8_t *b) {
		cmp 	arg1, arg2		;     if (a == b)
		je  	.true			;         return true;
	.loop:						; do {
		mov 	al, byte [arg1]	; // NOTE: al's opcodes are shorter than r8b's.
		cmp 	al, byte [arg2]	; // NOTE: `cmp reg, mem` works, but `cmp mem, mem` doesn't.
		jne 	.false			;     if (*a != *b) return false;
		inc 	arg1			; // argument registers are always volatile, so this is fine
		inc 	arg2			;     b++;
		test	al, al
		jnz 	.loop			; } while (*a++);
	.true:
		xor 	%cond(__?BITS?__ == 64, {eax, eax}, {rx, rx})
		ret
	.false:
		; basically `mov eax, 1` but also update the zero flag
		xor 	%cond(__?BITS?__ == 64, {eax, eax}, {rx, rx})
		inc 	al
		ret
%else
	;; 16-bit Microsoft ABI implementation:
	;; for some reason, cx and dx don't work as pointers, you have to use di and si.
	streq:
		push	di	;; di and si are non-volatile in Microsoft ABI
		push	si
		cmp 	cx, dx
		je  	.true
		mov 	di, cx
		mov 	si, dx
	.loop:
		mov 	al, byte [di]
		cmp 	al, byte [si]
		jne 	.false
		inc 	di
		inc 	si
		test	al, al
		jnz 	.loop
	.true:
		xor 	ax, ax
		jmp 	.exit
	.false:
		xor 	ax, ax
		inc 	al
	.exit:
		pop 	si
		pop 	di
		ret
%endif
