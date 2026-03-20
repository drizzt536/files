%ifndef STD_CURS_NASM
%define STD_CURS_NASM

%pragma ignore stdcurs.nasm

toggle_cursor: ; err toggle_cursor(void);
	mov 	dx, IOPT_PS2_CRTCR	;; VGA control port
	mov 	al, 0Ah				;; cursor start register
	out 	dx, al

	inc 	dl			;; 0x3D5 is data port. dx isn't required because no overflow.
	in  	al, dx

	xor 	al, 1 << 5	;; toggle bit 5
	out 	dx, al

	xor 	eax, eax	;; no error
	ret

;; hide_cursor should be used with show_cursor.
;; if you hide and then toggle, you will get incorrect results.
hide_cursor: ; err hide_cursor(void);
	mov 	dx, IOPT_PS2_CRTCR	;; VGA control port
	mov 	al, 0Ah				;; cursor start register
	out 	dx, al

	inc 	dl			;; 0x3D5 is data port. dx isn't required because no overflow.
	mov 	al, 1 << 5	;; Set bit 5 to disable the cursor
	out 	dx, al

	xor 	eax, eax	;; no error
	ret

;; use show_cursor(0b1110) for the underline cursor and show_cursor(0b0000) for the box cursor.
;; bits higher than the 4th bit are ignored.
show_cursor: ; u4, err show_cursor(u4 height);
	mov 	bl, al
	and 	bl, 0Fh				;; ignore higher than bit 3

	mov 	dx, IOPT_PS2_CRTCR
	mov 	al, 0Ah				;; cursor start register
	out 	dx, al

	inc 	dl			;; data port = 0x3D5, control port = 0x3D4. dx isn't required; no overflow.
	mov		al, bl		;; NOTE: bit 5 zero.
	out 	dx, al

	xor 	ebx, ebx	;; no error
	ret					;; return {height & 0xf, false};

;; NOTE: these macros don't touch the cursor position memory
%macro _move_cursor_mac 3
	;; _move_cursor_mac high part condition, high part, low part
	mov 	dx, IOPT_PS2_CRTCR

	%if %1
		mov 	al, 0Eh	;; select high byte register
		out 	dx, al
		inc 	dl		; dx = 03D5h
		mov 	al, %2	;; cursor position
		out 	dx, al

		dec 	dl		; dx = 03D4h
	%endif

	mov 	al, 0Fh		;; select low byte register
	out 	dx, al
	inc 	dl			; dx = 03D5h
	mov 	al, %3		;; low byte
	out 	dx, al
%endm

%macro move_cursor_mac 0
	;; takes argument through bx
	_move_cursor_mac 1, bh, bl
%endm

%macro move_cursor_mac 1
	;; takes argument as an immediate value
	_move_cursor_mac %is((%1) > 0xff), %eval((%1) >> 8), %eval((%1) & 0xff)
%endm

%macro move_cursor_mac 2
	;; takes the immediate values as row and column. wraps around to the start
	move_cursor_mac %eval((TERM_COLS * (%1) + (%2)) % TERM_SIZE)
%endm

%pragma ignore variable
cursor_pos:
.lo		db 0
.hi		db 0
dw 0 ;; just so you can load as a DWORD and have it work properly.

;; undefined for cursor_pos + ofs >= 32767 or cursor_pos + ofs <= -32768.
;; definitely won't work properly for ofs >= 32767 or ofs <= -32768.
;; for guaranteed correctness, don't pass anything with larger magnitude than 30768

;; all three of these return the new position in bx.
add_cursor: ; err, u16 add_cursor(u16 ofs);
	mov 	bx, word [rel cursor_pos]
	add 	ax, bx			; pos += ofs;
	js  	.loop_neg		; if (pos > 0)

.loop_pos:
	cmp 	ax, TERM_SIZE	;     while (pos >= TERM_SIZE)
	jb  	move_cursor

	sub 	ax, TERM_SIZE	;         pos -= TERM_SIZE;
	jmp 	.loop_pos
.loop_neg:					; else
	add 	ax, TERM_SIZE	;     while ((pos += TERM_SIZE) < 0);
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
	mov 	ebx, eax	; mov bx, ax

	cmp 	byte [rel cursor_pos.lo], al	; if ((pos & 0xff) == cursor_pos->lo)
	je  	.set_hi							;     goto set_hi;
.set_lo:
	mov 	dx, IOPT_PS2_CRTCR
	mov 	al, 0Fh		;; cursor location low register
	out 	dx, al

	inc 	dl			;; switch to data port
	mov 	al, bl
	out 	dx, al

.set_hi:
	cmp 	byte [rel cursor_pos.hi], bh	; if ((pos >> 8) == cursor_pos->hi)
	je  	.exit							;     goto exit;

	dec 	dl			;; switch to control port
	mov 	al, 0Eh		;; cursor location low register
	out 	dx, al

	inc 	dl			;; switch to data port
	mov 	al, bh
	out 	dx, al

.exit:
	mov 	word [rel cursor_pos], bx
	xor 	eax, eax	;; no errors
	ret

%endif ; %ifndef STD_CURS_NASM
