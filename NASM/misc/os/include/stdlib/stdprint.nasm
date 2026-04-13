%ifndef STDPRINT.NASM
%define STDPRINT.NASM

%include "stdcurs.nasm"

%pragma ignore file stdprint.nasm

;; clobbers rax, rbx, rcx, rdi
cls: ; void cls(void);
	;; clear the screen.
	zero	ax
	call	move_cursor
	mov 	byte [puts_color], VGA_DEFAULT
	mov 	al, ' '
fill_scr_def: ; void fill_scr_def(u8 charcode);
	;; print using the default console color
	mov 	ah, VGA_DEFAULT
fill_scr: ; void fill_scr(u16 vga_char);
	cld 	;; clear direction bit for forwards

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
;; NOTE: ax = color << 8 | value
;; returns an error code and the new cursor position? I don't think it actually does this anymore.
_print_u8hex: ; void? _print_u8hex(u16 vga_char);
	mov 	edi, dword [rel cursor_pos]
	lea 	edi, [VGA_BUF + 2*edi]
	;; print in big endian, so upper nibble first
.high:
	movzx	eax, ax					;; zero the upper 48 bits for later use
	mov 	cl, al					;; store the value in cl for later

	shr 	al, 4
	add 	al, '0'							; putchar(
	lea 	ebx, [rax + 'A' - ('9' + 1)]	;     (x >> 4) > 9 ? '0' + x :
	cmp 	al, '9'							;     'A' + x - 10
	cmova	eax, ebx						; );

	mov 	byte [edi], al

	jtz 	ah, ah, .low					; if (color != 0x00)
	mov 	byte [edi + 1], ah				;     vga_buf[i + 1] = color;
.low:
	add 	rdi, 2

	;; wrap back on buffer overflow
	mov 	ebx, VGA_BUF
	cmp 	edi, VGA_BUF_END
	cmovae	edi, ebx

	mov 	al, cl

	and 	al, 0fh
	add 	al, '0'		;; this might be skipable. same with the other al += '0'.
	lea 	ebx, [rax + 'A' - ('9' + 1)]
	cmp 	al, '9'
	cmova	eax, ebx

	mov 	byte [rdi], al

	jtz 	ah, ah, .ret					; if (color != 0x00)
	mov 	byte [rdi + 1], ah				;     vga_buf[i + 1] = color;
.ret:
	ret

;; clobbers: rax, rbx, cl, dx, rdi
print_u8hex: ; err, u16 print_u8hex(u16 vga_char);
	call	_print_u8hex
	mov 	ax, 2
	jmp 	add_cursor

;; clobbers: rax, rbx, cx, dx, rdi
print_u16hex: ; err, u16 print_u16hex(u16 x, u8 color);
	mov 	ch, bl	;; print_u8hex doesn't touch ch.
	mov 	dl, al	;; save the lower 8 bits for after the call

	mov 	al, ah	;; upper 8-bits
	mov 	ah, ch	;; color
	call	_print_u8hex

	mov 	ax, 2
	call	_add_cursor

	mov 	al, dl	;; lower 8-bits
	mov 	ah, ch	;; color
	call	_print_u8hex

	mov 	ax, 2
	jmp 	add_cursor

;; clobbers: rax, rbx, cx, rdx, rdi
print_u32hex: ; err, u16 print_u32hex(u32 x, u8 color);
	mov 	ch, bl	;; print_u8hex doesn't touch ch
	;; eax = [31:24] [23:16] [15:8] [7:0]
	bswap	eax
	mov 	edx, eax
	;; edx = [7:0] [15:8] [23:16] [31:24]

	;; implicitly, al = x[31:24]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	mov 	al, dh	;; al = x[23:16]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	shr 	edx, 16
	;; edx = [ 00h ] [ 00h ] [7:0] [15:8]
	mov 	al, dl	;; al = x[15:8]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	mov 	al, dh	;; al = x[7:0]
	mov 	ah, ch
	call	_print_u8hex

	mov 	ax, 2
	jmp 	add_cursor

;; clobbers: rax, rbx, cx, rdx, rdi
print_u64hex: ; err, u16 print_u64hex(u64 x, u8 color);
	mov 	ch, bl	;; print_u8hex doesn't touch ch
	;; rax = [63:56] [55:48] [47:38] [39:32] [31:24] [23:16] [15:8] [7:0]
	bswap	rax
	mov 	rdx, rax
	;; rdx = [7:0] [15:8] [23:16] [31:24] [39:32] [47:38] [55:48] [63:56]

	;; implicitly, al = x[63:56]
	mov 	ah, ch
	call	_print_u8hex
	add 	word [rel cursor_pos], 2

	mov 	al, dh	;; al = x[55:48]
	mov 	ah, ch
	call	_print_u8hex
	add 	word [rel cursor_pos], 2

	shr 	rdx, 16
	;; rdx = [ 00h ] [ 00h ] [7:0] [15:8] [23:16] [31:24] [39:32] [47:38]
	mov 	al, dl	;; al = x[47:38]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	mov 	al, dh	;; al = x[39:32]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	shr 	rdx, 16
	;; rdx = [ 00h ] [ 00h ] [ 00h ] [ 00h ] [7:0] [15:8] [23:16] [31:24]
	mov 	al, dl	;; al = x[31:24]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	mov 	al, dh	;; al = x[23:16]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	shr 	edx, 16
	;; rdx = [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 00h ] [7:0] [15:8]
	mov 	al, dl	;; al = x[15:8]
	mov 	ah, ch
	call	_print_u8hex
	mov 	ax, 2
	call	_add_cursor

	mov 	al, dh	;; al = x[7:0]
	mov 	ah, ch
	call	_print_u8hex

	mov 	ax, 2
	jmp 	add_cursor

%pragma ignore variable
putchar_cr_table:
	times 5 db 0

%pragma ignore variable
putchar_nl_table:
; 1-24, 0
%assign i 1
%rep 25
	times 5 db i
	%assign i i + 1
%endrep
	times 5 db 0
%undef i

;; clobbers: rax, rbx, rcx, dx
putchar: ; err, u16 putchar(u16 vga_char);
	mov 	ecx, dword [rel cursor_pos]
	jcb 	al, ' ', .control
.print:
	lea 	ecx, [VGA_BUF + 2*ecx]

	mov 	byte [ecx], al
	jtz 	ah, ah, inc_cursor
	mov 	byte [ecx + 1], ah
	jmp 	inc_cursor
.control:
	jtz 	al, al,		.null	;; don't print anything for null characters
	jce 	al, `\n`,	.newline
	jce 	al, `\b`,	.backspace
	jce 	al, `\r`,	.carriage_return
	jce 	al, `\t`,	.tab
	jce 	al, `\x07`,	.bell
	jce 	al, `\f`,	.formfeed
	jce 	al, `\v`,	.vtab
	;; fall back to just printing it normally.
	jmp 	.print
.carriage_return:
	shr 	ecx, 4
	mov 	cl, byte [putchar_cr_table + ecx]
	imul	eax, ecx, TERM_COLS
	jmp 	move_cursor
.newline:
	shr 	ecx, 4
	mov 	cl, byte [putchar_nl_table + ecx]
	imul	eax, ecx, TERM_COLS
	jmp 	move_cursor
.backspace:
	mov 	bx, TERM_SIZE - 1
	dec 	cx
	cmovs	cx, bx

	mov 	byte [VGA_BUF + 2*ecx], ' '
	jtz 	ah, ah, .backspace@end
	mov 	byte [VGA_BUF + 2*ecx + 1], ah
.backspace@end:
	mov 	eax, ecx
	jmp 	move_cursor
.tab:
	lea 	eax, [ecx + 4]
	and 	eax, ~0b11
	lea 	ecx, [eax - TERM_SIZE]
	cmp 	eax, TERM_SIZE
	cmovae	eax, ecx
	jmp 	move_cursor
.bell:
	in  	al, IOPT_SYSCTRLB		;; enable speaker
	or  	al, 0b11
	out 	IOPT_SYSCTRLB, al
	timewait_mac8	4, 1
	in  	al, IOPT_SYSCTRLB		;; disable speaker
	and 	al, ~0b11
	out 	IOPT_SYSCTRLB, al
.null:
	ret
.formfeed:
	push	rdi
	call	cls
	pop 	rdi
	ret
.vtab:
	;; go down one line without returning to the start of the line.
	mov 	ax, TERM_COLS
	jmp 	add_cursor

%pragma ignore variable
puts_color: db VGA_DEFAULT

;; clobbers: rax, rbx, rcx, dx, rdi, rsi
puts: ; void puts(string str);
	cld					;; forwards
	strlen	rdi, rax	;; rdi = strlen(str);
	mov 	rsi, rax	;; rsi = str;
	test	rdi, rdi
.loop:
	jz  	.ret
	lodsb
	jce 	al, `\e`, .esc

	mov 	ah, byte [puts_color]
	call	putchar
	dec 	rdi
	jmp 	.loop
.esc:
	dec 	rdi
	jz  	.ret

	lodsb
	mov 	byte [puts_color], al
	dec 	rdi
	jmp 	.loop
.ret:
	ret

;; TODO: add `putsv` to print a string view
%endif ; %ifndef STDPRINT.NASM
