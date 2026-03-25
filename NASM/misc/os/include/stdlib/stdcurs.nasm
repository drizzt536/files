%ifndef STD_CURS_NASM
%define STD_CURS_NASM

%pragma ignore stdcurs.nasm

%assign CURS_SQUARE		0b0000
%assign CURS_UNDERLINE	0b1110
%assign CURS_HIDDEN		1 << 5	;; the hidden bit
%assign CURS_SHOWN		0 << 5	;; this is just for clarity and consistency.
%assign CURS_START_REG	0Ah
%assign CURS_HGPOS_REG	0Eh		;; high half of the cursor position
%assign CURS_LWPOS_REG	0Fh		;; low half of the cursor position

%pragma ignore variable
cursor_data: db 0

%pragma ignore variable
cursor_pos:
.lo		db 0
.hi		db 0
		dw 0 ;; just so you can load as a DWORD and have it work properly.

toggle_cursor: ; void toggle_cursor(void);
	;; VGA control port and cursor start register
	outb	IOPT_PS2_CRTCR, CURS_START_REG

	xor 	byte [rel cursor_data], CURS_HIDDEN
	inc 	dl			;; control port = 0x3D4. data port = 0x3D5
	outb	dx, byte [rel cursor_data]
	ret

hide_cursor: ; void hide_cursor(void);
	;; VGA control port and cursor start register
	outb	IOPT_PS2_CRTCR, CURS_START_REG

	or  	byte [rel cursor_data], CURS_HIDDEN
	inc 	dl			;; control port = 0x3D4. data port = 0x3D5
	outb	dx, byte [rel cursor_data]
	ret

show_cursor: ; u4 show_cursor(void);
	outb	IOPT_PS2_CRTCR, CURS_START_REG

	and 	byte [rel cursor_data], ~CURS_HIDDEN
	inc 	dl			;; control port = 0x3D4. data port = 0x3D5
	outb	dx, byte [rel cursor_data]
	ret					;; return height & 0xf;

;; TODO: perhaps validate the cursor value. I don't think bits 6 or 7 and maybe 4 do anything
set_cursor: ; u4 show_cursor(u8 height);
	mov 	byte [rel cursor_data], al
	mov 	bl, al

	outb	IOPT_PS2_CRTCR, CURS_START_REG

	inc 	dl			;; control port = 0x3D4. data port = 0x3D5
	outb	dx, bl
	ret					;; return height & 0xf;

;; update the cursor position internally, accounting for wrapping, but don't
;; actually update it. Basically, the point is so dx isn't clobbered.
;; returns the new cursor position that it just wrote to the internal structure.
_add_cursor: ; u16 _add_cursor(u16 ofs);
	mov 	bx, word [rel cursor_pos]
	add 	ax, bx					; pos += ofs;
	js  	.loop_neg				; if (pos > 0)
.loop_pos:
	jcb 	ax, TERM_SIZE, .exit	;     while (pos >= TERM_SIZE)

	sub 	ax, TERM_SIZE			;         pos -= TERM_SIZE;
	jmp 	.loop_pos
.loop_neg:							; else
	add 	ax, TERM_SIZE			;     while ((pos += TERM_SIZE) < 0);
	js  	.loop_neg
.exit:
	mov 	word [rel cursor_pos], ax
	ret


;; undefined for cursor_pos + ofs >= 32767 or cursor_pos + ofs <= -32768.
;; definitely won't work properly for ofs >= 32767 or ofs <= -32768.
;; for guaranteed correctness, don't pass anything with larger magnitude than 30768

;; clobbers: rax, rbx, dx
;; all three of these return the new cursor position in bx.
add_cursor: ; err, u16 add_cursor(u16 ofs);
	mov 	bx, word [rel cursor_pos]
	add 	ax, bx						; pos += ofs;
	js  	.loop_neg					; if (pos > 0)
.loop_pos:
	jcb 	ax, TERM_SIZE, move_cursor	;     while (pos >= TERM_SIZE)

	sub 	ax, TERM_SIZE				;         pos -= TERM_SIZE;
	jmp 	.loop_pos
.loop_neg:								; else
	add 	ax, TERM_SIZE				;     while ((pos += TERM_SIZE) < 0);
	jns 	move_cursor
	jmp 	.loop_neg

inc_cursor: ; err, u16 inc_cursor(void);
	mov 	ax, word [rel cursor_pos]
	inc 	ax				; pos++;
	xor 	ebx, ebx
	cmp 	ax, TERM_SIZE	; if (pos == TERM_SIZE)
	cmove	eax, ebx		;     pos = 0;

	;; fallthrough
move_cursor: ; err, u16 move_cursor(u16 pos);
	mov 	ebx, eax						; mov bx, ax

	; if ((pos & 0xff) == cursor_pos->lo) goto set_hi;
	jce 	byte [rel cursor_pos.lo], al, .set_hi
.set_lo:
	outb	IOPT_PS2_CRTCR, CURS_LWPOS_REG	;; cursor location low register

	inc 	dl								;; switch to data port
	outb	dx, bl
.set_hi:
	jce 	byte [rel cursor_pos.hi], bh, .exit	; if ((pos >> 8) == cursor_pos->hi) goto exit;

	dec 	dl								;; switch to control port
	outb	dx, CURS_HGPOS_REG				;; cursor location high register

	inc 	dl								;; switch to data port
	outb	dx, bh
.exit:
	mov 	word [rel cursor_pos], bx
	xor 	eax, eax	;; no errors
	ret
%endif ; %ifndef STD_CURS_NASM
