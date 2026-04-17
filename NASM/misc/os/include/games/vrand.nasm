%ifndef GAMES@VRAND.NASM
%define GAMES@VRAND.NASM

vrand_entry:
	call	hide_cursor
	kbd_reset
.loop:
	call	get_keycode
	jz  	.randomize
	call	keycode_to_ascii

	keymod_jcne bl, 0, .randomize

	jce 	al, ASCII_ESC, kernel_reset

	;; fallthrough
.randomize:
	mov 	eax, VGA_BUF_SIZE
	mov 	ebx, VGA_BUF
	call	rand_fill

	jmp 	.loop

%endif ; %ifndef GAMES@VRAND.NASM
