%ifndef STD_PRINT_NASM
%define STD_PRINT_NASM

%include "stdcurs.nasm"

%pragma ignore stdprint.nasm

;; clobbers rax, rbx, rcx, rdi
cls: ; void cls(void);
	;; clear the screen.
	xor 	eax, eax
	call	move_cursor
	mov 	al, ' '
fill_scr_def: ; void fill_scr_def(u8 charcode);
	;; print using the default console color
	mov 	ah, VGA_DEFAULT
fill_scr: ; void fill_scr(u16 vga_char);
	cld		;; clear direction bit for forwards

	mov 	bx, ax
	shl 	eax, 16
	mov 	ax, bx			; eax = ax << 16 | ax

	mov 	ebx, eax
	shl 	rax, 32
	or  	rax, rbx		; rax = eax << 32 | eax

	mov 	ecx, TERM_SIZE >> 2
	mov 	edi, VGA_BUF	;; address fits in 32-bits so edi instead of rdi works.
	rep 	stosq			;; write to the buffer 4 characters at a time
	ret

;; clobbers: rax, rbx, cl, rdi
; NOTE: ax = color << 8 | value
print_u8hex: ; u32, err print_u8hex(u16 ax);
	mov 	edi, dword [rel cursor_pos]
	lea 	edi, [VGA_BUF + 2*rdi]
.print:
	cld
	movzx	eax, ax					; zero the upper 48 bits for later use
	mov 	cl, al					; store the value in cl for later

	;; print in big endian, so upper nibble first
	shr 	al, 4
	add 	al, '0'
	lea 	ebx, [rax + 'A' - ('9' + 1)]	; putchar(
	cmp 	al, '9'							;     (x >> 4) > 9 ? '0' + x :
	cmova 	eax, ebx						;     'A' + x - 10
	stosw	; *rdi++ = al					; );

	;; wrap back on buffer overflow
	mov 	ebx, VGA_BUF
	cmp 	edi, VGA_BUF_END
	cmovae	edi, ebx

	mov 	al, cl

	and 	al, 0fh
	add 	al, '0'	; this might be skipable. same with the other al += '0'.
	lea 	ebx, [rax + 'A' - ('9' + 1)]
	cmp 	al, '9'
	cmova 	eax, ebx
	stosw	; *rdi++ = al

	;; wrap back on buffer overflow
	mov 	ebx, VGA_BUF
	cmp 	edi, VGA_BUF_END
	cmovae	edi, ebx

	mov 	ax, 2		; increment the cursor by 2
	call	add_cursor
	mov 	ax, 2		; return 2. (2 characters printed)
	ret

%endif ; %ifndef STD_PRINT_NASM
