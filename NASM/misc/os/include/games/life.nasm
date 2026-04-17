%ifndef GAMES@LIFE.NASM
%define GAMES@LIFE.NASM

;; NOTE: the secondary buffer is at `stack_base` and the recall buffer is at `stack_base + VGA_BUF_LEN`
;; TODO: perhaps make an F3 menu to select the randomization threshold to be other than ~50%

%xdefine LIFE_HELP_TEXT %strcat(                         \
	`\fSetup Keybinds:`,                                 \
	`\n  UP      - move cursor up one row.`,             \
	`\n  RIGHT   - move cursor right one column`,        \
	`\n  DOWN    - move cursor down one row`,            \
	`\n  LEFT    - move cursor left one column`,         \
	`\n       SHIFT to move by 5, CTRL to draw.`,        \
	`\n  C       - clear all cells`,                     \
	`\n  SHIFT+C - move cursor to the left center cell`, \
	`\n  I       - invert all cells`,                    \
	`\n  R       - randomize all cells`,                 \
	`\n  S       - step once`,                           \
	`\n  F1      - open help menu`,                      \
	`\n  F2      - open speed select menu`,              \
	`\n  SPACE   - toggle selected cell`,                \
	`\n  ENTER   - go to running mode`,                  \
	`\n  DELETE  - toggle the cursor`,                   \
	`\n  ESC     - exit to kernel entrypoint`,           \
	`\n  CTRL+S  - save the current state`,              \
	`\n  CTRL+R  - recall the last saved state`,         \
	`\n  CTRL+C  - clear screen and clear save state`,   \
	`\n`,                                                \
	`\nRunning keybinds:`,                               \
	`\n  ESC | SPACE | P | X - go to setup mode`,        \
	`\n`,                                                \
	`\npress any key to return.`                         \
)

%xdefine LIFE_SPEED_MENU %strcat( \
	`\fSpeed Select  `,           \
	`\n  01 - 0.950Hz`,           \
	`\n  02 - 1.000Hz`,           \
	`\n  03 - 1.056Hz`,           \
	`\n  04 - 1.118Hz`,           \
	`\n  05 - 1.188Hz`,           \
	`\n  06 - 1.267Hz`,           \
	`\n  07 - 1.358Hz`,           \
	`\n  08 - 1.462Hz`,           \
	`\n  09 - 1.583Hz`,           \
	`\n  10 - 1.727Hz`,           \
	`\n  11 - 1.900Hz`,           \
	`\n  12 - 2.111Hz`,           \
	`\n  13 - 2.375Hz`,           \
	`\n  14 - 2.714Hz`,           \
	`\n  15 - 3.167Hz`,           \
	`\n  16 - 3.800Hz`,           \
	`\n  17 - 4.750Hz`,           \
	`\n  18 - 6.333Hz`,           \
	`\n  19 - 9.500Hz`,           \
	`\n  20 - 19.00Hz`,           \
	`\n`,                         \
	`\nENTER to select`,          \
	`\nESC to cancel`,            \
	`\nUP & DOWN to move lines`   \
)

life_help_text:
.len: dq %strlen(LIFE_HELP_TEXT)
.ptr: db LIFE_HELP_TEXT

life_speed_menu:
.len: dq %strlen(LIFE_SPEED_MENU)
.ptr: db LIFE_SPEED_MENU

life_entry:
	zero	ax
	call	move_cursor
	mov 	byte [puts_color], VGA_DEFAULT
	mov 	r15w, 21 - 11		;; start off at speed 11 (1.9Hz)
	kbd_reset

	;; fallthrough
.reset:
	;; NOTE: don't use `cls` so as not to lose the cursor position
	mov 	ax, VGA_DEFAULT << 8 | ' '
	call	fill_scr

	;; make sure the secondary buffer matches the video buffer
	mov 	eax, stack_base
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	;; clear the recall buffer
	mov 	eax, stack_base + VGA_BUF_SIZE
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	;; fallthrough
.setup:
	mov 	al, CURS_SQUARE | CURS_SHOWN
	call	set_cursor

	;; fallthrough
.setup@keyloop:
	call	next_keycode
	call	keycode_to_ascii

	keymod_jce	bl, KBD_STATE_SHFT, .setup@shift
	keymod_jce	bl, KBD_STATE_CTRL, .setup@ctrl
	keymod_jce	bl, KBD_STATE_CTRL | KBD_STATE_SHFT, .setup@ctrl_shift
	keymod_jcne	bl, 0, .setup@keyloop

	jce 	al, ASCII_UP,		.setup@up
	jce 	al, ASCII_RIGHT,	.setup@right
	jce 	al, ASCII_DOWN,		.setup@down
	jce 	al, ASCII_LEFT,		.setup@left

	jce 	al, 'c',			.setup@clear			;; clear all cells to dead
	jce 	al, 'i',			.setup@invert			;; invert all cells
	jce 	al, 'r',			.setup@randomize		;; randomize all cells
	jce 	al, 's',			.step					;; step once
	jce 	al, ASCII_F1,		.setup@help				;; open help menu
	jce 	al, ASCII_F2,		.setup@speed_select		;; open speed select menu
	jce 	al, ASCII_DELETE,	.setup@toggle_cursor	;; toggle cursor visibility
	jce 	al, ' ',			.setup@toggle			;; toggle the current cell
	jce 	al, `\n`,			.running				;; go to the running state
	jce 	al, ASCII_ESC,		kernel_reset

	jmp 	.setup@keyloop
.setup@up:
	mov 	ax, -TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@right:
	mov 	ax, +1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@down:
	mov 	ax, +TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@left:
	mov 	ax, -1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@save:
	;; make sure the secondary buffer matches the video buffer
	mov 	eax, stack_base + VGA_BUF_SIZE
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	jmp 	.setup@keyloop
.setup@recall:
	;; make sure the secondary buffer matches the video buffer
	mov 	eax, VGA_BUF
	mov 	ebx, stack_base + VGA_BUF_SIZE
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	jmp 	.setup@keyloop
.setup@toggle_cursor:
	call	toggle_cursor
	jmp 	.setup@keyloop
.setup@clear:
	mov 	ax, VGA_DEFAULT << 8 | ' '
	call	fill_scr

	;; make sure the secondary buffer matches the video buffer
	mov 	eax, stack_base
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	jmp 	.setup@keyloop
.setup@invert:
	zero	eax
.setup@invert@loop:
	jce 	eax, TERM_SIZE, .setup@keyloop
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)
	inc 	eax
	jmp 	.setup@invert@loop
.setup@toggle:
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)
	jmp 	.setup@keyloop
.setup@randomize:
	zero	edi

	;; fallthrough
.setup@randomize@loop:
	jce 	edi, 2*TERM_SIZE, .setup@keyloop

	call	next_rand

	;; take 4 bits from the random number and ignore the rest.
	mov 	rbx, 1 << 8 | 1 << 24 | 1 << 40 | 1 << 56
	pdep	rcx, rax, rbx
	imul	rcx, VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	;; one-time pad type thing. xor the state with a random state to get the new state
	xor 	qword [VGA_BUF + edi], rcx
	add 	edi, 8

	jmp 	.setup@randomize@loop
.setup@center:
	mov 	ax, VGA_POS(12, 39)
	call	move_cursor
	jmp 	.setup@keyloop
.setup@shift:
	jce 	al, ASCII_UP,		.setup@shift@up
	jce 	al, ASCII_RIGHT,	.setup@shift@right
	jce 	al, ASCII_DOWN,		.setup@shift@down
	jce 	al, ASCII_LEFT,		.setup@shift@left
	jce 	al, 'C',			.setup@center	;; move the cursor to the left center cell.
	jmp 	.setup@keyloop
.setup@shift@up:
	mov 	ax, -5*TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@shift@right:
	mov 	ax, +5*1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@shift@down:
	mov 	ax, +5*TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@shift@left:
	mov 	ax, -5*1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@ctrl:
	jce 	al, ASCII_UP,		.setup@ctrl@up
	jce 	al, ASCII_RIGHT,	.setup@ctrl@right
	jce 	al, ASCII_DOWN,		.setup@ctrl@down
	jce 	al, ASCII_LEFT,		.setup@ctrl@left
	jce 	al, 's',			.setup@save
	jce 	al, 'r',			.setup@recall
	jce 	al, 'c',			.reset
	jmp 	.setup@keyloop
.setup@ctrl@up:
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, -TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@ctrl@right:
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, +1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@ctrl@down:
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, +TERM_COLS
	call	add_cursor
	jmp 	.setup@keyloop
.setup@ctrl@left:
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, -1
	call	add_cursor
	jmp 	.setup@keyloop
.setup@ctrl_shift:
	jce 	al, ASCII_UP,		.setup@ctrl_shift@up
	jce 	al, ASCII_RIGHT,	.setup@ctrl_shift@right
	jce 	al, ASCII_DOWN,		.setup@ctrl_shift@down
	jce 	al, ASCII_LEFT,		.setup@ctrl_shift@left
	jmp 	.setup@keyloop
.setup@ctrl_shift@up:
	;; there is probably a better way to implement these, but I don't care enough to find out.
%rep 5
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, -TERM_COLS
	call	add_cursor
%endrep

	jmp 	.setup@keyloop
.setup@ctrl_shift@right:
%rep 5
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, +1
	call	add_cursor
%endrep

	jmp 	.setup@keyloop
.setup@ctrl_shift@down:
%rep 5
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, +TERM_COLS
	call	add_cursor
%endrep

	jmp 	.setup@keyloop
.setup@ctrl_shift@left:
%rep 5
	mov 	eax, dword [rel cursor_pos]
	xor 	byte [VGA_BUF + 2*eax + 1], VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)

	mov 	ax, -1
	call	add_cursor
%endrep

	jmp 	.setup@keyloop
.setup@help:
	call	hide_cursor

	mov 	eax, stack_base
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	mov 	r8w, word [rel cursor_pos]

	mov 	eax, life_help_text.ptr
	call	puts

	mov 	ax, r8w
	call	move_cursor
.setup@help@keyloop:
	call	next_keycode
	jts 	al, al, .setup@help@keyloop

	mov 	ebx, stack_base
	mov 	eax, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	jmp 	.setup
.setup@speed_select:
	call	hide_cursor

	mov 	eax, stack_base
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	mov 	r8w, word [rel cursor_pos]

	mov 	eax, life_speed_menu.ptr
	call	puts

	mov 	ax, r8w
	call	move_cursor

	neg 	r15b
	add 	r15b, 21

	zero	eax
	imul	ax, r15w, TERM_COLS
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)
.setup@speed_select@keyloop:
	call	next_keycode

	jce 	al, KC_ESC,		.setup@speed_select@cancel
	jce 	al, KC_UP,		.setup@speed_select@up
	jce 	al, KC_DOWN,	.setup@speed_select@down
	jce 	al, KC_ENTER,	.setup@speed_select@done

	jmp 	.setup@speed_select@keyloop
.setup@speed_select@done:
	neg 	r15b
	add 	r15b, 21
	;; fallthrough
.setup@speed_select@cancel:
	mov 	ebx, stack_base
	mov 	eax, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	jmp 	.setup
.setup@speed_select@up:
	zero	eax
	imul	ax, r15w, TERM_COLS
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	mov 	bx, 20
	dec 	r15b
	cmovz	r15w, bx

	imul	ax, r15w, TERM_COLS
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	jmp 	.setup@speed_select@keyloop
.setup@speed_select@down:
	zero	eax
	imul	ax, r15w, TERM_COLS
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	mov 	bx, 1
	inc 	r15b
	cmp 	r15b, 21
	cmove	r15w, bx

	imul	ax, r15w, TERM_COLS
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	jmp 	.setup@speed_select@keyloop
.step:
	mov 	r14b, 1
	jmp 	.running@preloop
.running:
	zero	r14b
	call	hide_cursor
	reset_isr_timer
.running@keyloop:
	call	get_keycode

	jce 	al, KC_ESC, 	.setup
	jce 	al, KC_SPACE,	.setup
	jce 	al, KC_P,		.setup	;; P for Pause
	jce 	al, KC_X,		.setup	;; X for eXit

	get_isr_timer8_mod r15b
	jb  	.running@keyloop
.running@preloop:
	zero	edi									;; row
.running@row_loop:
	zero	esi									;; col
	lea 	r9d,  [edi - 2*TERM_COLS]			;; row - 1
	lea 	r10d, [edi + 2*TERM_COLS]			;; row + 1

	mov 	edx, 2*(TERM_ROWS - 1)*TERM_COLS
	test	edi, edi							; if (row == 0)
	cmovz	r9d, edx							;     row - 1 => 24

	zero	edx
	cmp 	edi, 2*(TERM_ROWS - 1)*TERM_COLS	; if (col == 79)
	cmove	r10d, edx							;     col + 1 => 0
.running@col_loop:
	lea 	r11d, [esi - 2*1]					;; col - 1
	lea 	r12d, [esi + 2*1]					;; col + 1

	mov 	edx, 2*(TERM_COLS - 1)
	test	esi, esi							; if (col == 0)
	cmovz	r11d, edx							;     col - 1 => 79

	zero	edx
	cmp 	esi, 2*(TERM_COLS - 1)				; if (col == 79)
	cmove	r12d, edx							;     col + 1 => 0
.running@inner_stuff:
	;; NOTE: each color byte is either 0xF8 or 0x08
	;; color sum = 0xF8*N + 0x08*(8 - N)
	;; `b = 0` as the magic number was determined by trial and error,
	;; and it is not the only number that gives correct results.
	;; it works for -16 <= b <= 191
	; count = floor((color sum + 8) / 256)
	zero	cx
	movzx	ax, byte [VGA_BUF + 1 + r11d + r9d]
	movzx	bx, byte [VGA_BUF + 1 + esi  + r9d]
	movzx	dx, byte [VGA_BUF + 1 + r12d + r9d]
	add 	cx, ax
	add 	cx, bx
	add 	cx, dx

	movzx	ax, byte [VGA_BUF + 1 + r11d + edi]
	movzx	bx, byte [VGA_BUF + 1 + r12d + edi]
	add 	cx, ax
	add 	cx, bx

	movzx	ax, byte [VGA_BUF + 1 + r11d + r10d]
	movzx	bx, byte [VGA_BUF + 1 + esi  + r10d]
	movzx	dx, byte [VGA_BUF + 1 + r12d + r10d]
	add 	cx, ax
	add 	cx, bx
	add 	cx, dx

	mov 	cl, ch	;; shr cx, 8

	mov 	bl, byte [VGA_BUF + 1 + esi + edi]
	shr 	bl, 4
	and 	bl, 1	;; dl = alive

	zero	dl		; false = 0;
	mov 	ax, 1	; result = 1;

	cmp 	cl, 3	; if (n > 3)
	cmova	ax, dx	;     result = false;

	test	cl, 2	; if ((n & 2) == 0)
	cmovz	ax, dx	;     result = false;

	and 	cl, 1	; // n &= 1;
	or  	bl, cl	; // tmp = alive || (n & 1);
	and 	al, bl	; result &= alive || (n & 1);

	imul	ax, VGA_WHITE << 4
	or  	al, VGA_DRK_GRAY

	mov 	byte [stack_base + 1 + esi + edi], al
.running@loop_end:
	add 	esi, 2

	jcb 	esi, 2*TERM_COLS, .running@col_loop
	add 	edi, 2*TERM_COLS
	jcb 	edi, VGA_BUF_SIZE, .running@row_loop

	mov 	eax, VGA_BUF
	mov 	ebx, stack_base
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	;; go to the next state
	test	r14b, r14b
	mov 	r14b, 0
	jnz 	.setup@keyloop
	jmp 	.running@keyloop
%endif ; %ifndef GAMES@LIFE.NASM
