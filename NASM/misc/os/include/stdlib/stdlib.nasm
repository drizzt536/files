%ifndef STDLIB_NASM
%define STDLIB_NASM
;; NOTE: `err` as a type is just u32, and means that is the error value.
;; NOTE: `%pragma ignore` stuff is for the stdlib function table generation

%include "stdmem.nasm"
%include "stdcurs.nasm"
%include "stdprint.nasm"

%pragma ignore stdlib.nasm

;; returns scancode, scancode idx
;; clobbers: al, rbx
;; returns al=0 on failure.
;; set up so `call next_scancode` can immediately be followed by
;; either `jz .error` or `jnz .no_error` for fast processing.
;; the other flags aren't guaranteed, only the zero flag.
next_scancode: ; u8, u8 next_scancode(void);
	movzx	ebx, byte [rel keyring_read]
_next_scancode: ; u8, u8 _next_scancode(void _, u32 keyring_read);

	xor 	al, al
	cmp 	bl, byte [rel keyring_write]
	je  	.ret

	mov 	al, byte [keyring + ebx]

	inc 	bl
	mov 	byte [rel keyring_read], bl
	test	al, al
.ret:
	ret

%endif ; %ifndef STDLIB_NASM
