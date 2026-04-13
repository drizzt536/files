%ifndef LIFE.NASM
%define LIFE.NASM

;; NOTE: the secondary buffer is at `stack_base`

%xdefine LIFE_HELP_TEXT %strcat(                \
	`\fKeybinds:\n`,                            \
	`  UP    - move cursor up one row\n`,       \
	`  RIGHT - move cursor right one column\n`, \
	`  DOWN  - move cursor down one row\n`,     \
	`  LEFT  - move cursor left one column\n`,  \
	`  C     - clear all cells\n`,              \
	`  I     - invert all cells\n`,             \
	`  R     - randomize all cells\n`,          \
	`  S     - step once\n`,                    \
	`  F1    - open help menu\n`,               \
	`  F2    - open speed select menu\n`,       \
	`  SPACE - toggle selected cell\n`,         \
	`  ENTER - start simulation\n`,             \
	`  ESC   - exit to kernel entrypoint\n`,    \
	`\n`,                                       \
	`press any key to return.`                  \
)

%xdefine LIFE_SPEED_MENU %strcat( \
	`\fSpeed Select  \n`,         \
	`  01 - 0.950Hz\n`,           \
	`  02 - 1.000Hz\n`,           \
	`  03 - 1.056Hz\n`,           \
	`  04 - 1.118Hz\n`,           \
	`  05 - 1.188Hz\n`,           \
	`  06 - 1.267Hz\n`,           \
	`  07 - 1.358Hz\n`,           \
	`  08 - 1.462Hz\n`,           \
	`  09 - 1.583Hz\n`,           \
	`  10 - 1.727Hz\n`,           \
	`  11 - 1.900Hz\n`,           \
	`  12 - 2.111Hz\n`,           \
	`  13 - 2.375Hz\n`,           \
	`  14 - 2.714Hz\n`,           \
	`  15 - 3.167Hz\n`,           \
	`  16 - 3.800Hz\n`,           \
	`  17 - 4.750Hz\n`,           \
	`  18 - 6.333Hz\n`,           \
	`  19 - 9.500Hz\n`,           \
	`  20 - 19.00Hz\n`,           \
	`\n`,                         \
	`ENTER to select\n`,          \
	`ESC to cancel\n`,            \
	`UP & DOWN to move lines`     \
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
	mov 	r15w, 11		;; start off at 1.9Hz
.reset:
	;; NOTE: don't use `cls` so as not to lose the cursor position
	mov 	ax, VGA_DEFAULT << 8 | ' '
	call	fill_scr

	;; make sure the secondary buffer
	mov 	eax, stack_base
	mov 	ebx, VGA_BUF
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy
.setup:
	mov 	al, CURS_SQUARE | CURS_SHOWN
	call	set_cursor
.setup@keyloop:
	call	next_keycode

	jce 	al, KC_UP,		.setup@up
	jce 	al, KC_RIGHT,	.setup@right
	jce 	al, KC_DOWN,	.setup@down
	jce 	al, KC_LEFT,	.setup@left

	jce 	al, KC_C,		.reset				;; clear all cells
	jce 	al, KC_I,		.setup@invert		;; invert all cells
	jce 	al, KC_R,		.setup@randomize	;; randomize all cells
	jce 	al, KC_S,		.step				;; step once
	jce 	al, KC_F1,		.setup@help			;; open help menu
	jce 	al, KC_F2,		.setup@speed_select	;; open speed select menu
	jce 	al, KC_SPACE,	.setup@toggle	;; toggle the current cell
	jce 	al, KC_ENTER,	.running		;; go to the running state
	jce 	al, KC_ESC,		kernel_reset

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
.setup@randomize@loop:
	jce 	edi, 2*TERM_SIZE, .setup@keyloop

	call	next_rand
	mov 	rbx, 1 << 8 | 1 << 24 | 1 << 40 | 1 << 56
	pdep	rcx, rax, rbx
	imul	rcx, VGA_CLR(0, VGA_WHITE ^ VGA_BLACK)
	xor 	qword [VGA_BUF + edi], rcx
	add 	edi, 8
	jmp 	.setup@randomize@loop
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
	test	al, al
	js  	.setup@help@keyloop

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
	imul	ax, r15w, 80
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
	imul	ax, r15w, 80
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	mov 	bx, 20
	dec 	r15b
	cmovz	r15w, bx

	imul	ax, r15w, 80
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	jmp 	.setup@speed_select@keyloop
.setup@speed_select@down:
	zero	eax
	imul	ax, r15w, 80
	xor 	dword [VGA_BUF + 2*(eax + 2)], (VGA_DEFAULT ^ VGA_HIGHLIGHT) * (1 << 8 | 1 << 24)

	mov 	bx, 1
	inc 	r15b
	cmp 	r15b, 21
	cmove	r15w, bx

	imul	ax, r15w, 80
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
	jce 	al, KC_ESC, .setup

	get_isr_timer8_mod r15b
	jb  	.running@keyloop
.running@preloop:
	zero	edi					;; row
.running@row_loop:
	zero	esi					;; col
	lea 	r9d,  [edi - 2*80]	;; row - 1
	lea 	r10d, [edi + 2*80]	;; row + 1

	mov 	edx, 2*24*80
	test	edi, edi			; if (row == 0)
	cmovz	r9d, edx			;     row - 1 => 24

	zero	edx
	cmp 	edi, 2*24*80		; if (col == 79)
	cmove	r10d, edx			;     col + 1 => 0
.running@col_loop:
	lea 	r11d, [esi - 2*1]		;; col - 1
	lea 	r12d, [esi + 2*1]		;; col + 1

	mov 	edx, 2*79
	test	esi, esi			; if (col == 0)
	cmovz	r11d, edx			;     col - 1 => 79

	zero	edx
	cmp 	esi, 2*79			; if (col == 79)
	cmove	r12d, edx			;     col + 1 => 0
.running@inner_stuff:
	mov 	cx, 8
	; count = floor((8 + color sum) / 256)
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

	cmp 	esi, 2*80
	jb  	.running@col_loop

	add 	edi, 2*80

	cmp 	edi, 2*25*80
	jb  	.running@row_loop

	mov 	eax, VGA_BUF
	mov 	ebx, stack_base
	mov 	ecx, VGA_BUF_SIZE
	call	memcpy

	;; go to the next state
	;; TODO: implement the running state
	test	r14b, r14b
	mov 	r14b, 0
	jnz 	.setup@keyloop
	jmp 	.running@keyloop

%endif ; %ifndef LIFE.NASM
