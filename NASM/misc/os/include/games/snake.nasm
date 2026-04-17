%ifndef GAMES@SNAKE.NASM
%define GAMES@SNAKE.NASM

%define snake_ring_base			stack_base
%assign ring_buf_size			896	;; this can be anything, so long as it is >= 874.
%assign SNAKE_VICTORY_THRESH	873	;; max score

;; void snake_place_apple(void);
;; sets the apple position register to the next offset
;; basically, this is the function for growing.
snake_place_apple:
	;; the old apple position will be a snake position,
	;; so put yellow there so it doesn't think it is empty.
	mov 	dword [ebp], VGA_DWORD(VGA_CLR_FILL(VGA_YELLOW), '  ')
.first:
	lea 	r13d, [ebp - VGA_BUF]
	call	next_rand
	mov 	rbp, rax

	mov 	rdx, 95f7cc72d1b887e9h
	mul 	rdx
	shr 	rdx, 73 - 64
	imul	rdx, 874	;; (TERM_COLS/2 - 2) * (TERM_ROWS - 2)
	sub 	rbp, rdx
	;; rbp = next_rand() % 874;

	zero	eax
	mov 	ebx, VGA_BUF + 2*TERM_COLS + 1	;; skip the top border row
	mov 	ecx, VGA_BUF + 2*TERM_COLS + 1
.scan:
	add 	ebx, 4
	jcne 	byte [ebx - 4], VGA_CLR_FILL(VGA_BLACK), .scan	;; the cell isn't empty

	;; wrap around if it reaches the end
	cmp 	ebx, VGA_BUF_END - 2*TERM_COLS + 4	;; skip the bottom border row
	cmovae	ebx, ecx

	inc 	eax
	jcne 	eax, ebp, .scan
	lea 	ebp, [ebx - 5]
	ret

snake_redraw:
	zero	ax
	call	move_cursor
	mov 	ax, VGA_CLR_FILL(VGA_BLACK) << 8 | ' '
	call	fill_scr

	sub 	esp, 16

	mov 	byte [puts_color], VGA_CLR_FILL(VGA_ORANGE)

	mov 	rax, strmul(' ', 8)
	mov 	qword [rsp + 8], rax

	mov 	r13b, 10
	mov 	qword [rsp], 8
.border_top:
	lea 	eax, [esp + 8]
	call	puts
	dec 	r13b
	jnz 	.border_top

	mov 	ax, -2*TERM_COLS
	call	add_cursor

	mov 	r13b, 10
	mov 	qword [rsp], 8
.border_bottom:
	lea 	eax, [esp + 8]
	call	puts
	dec 	r13b
	jnz 	.border_bottom

	add 	esp, 16

	mov 	dword [VGA_ADDR( 1, 0)], VGA_DWORD(VGA_CLR_FILL(VGA_ORANGE), '  ')
	mov 	dword [VGA_ADDR(23, 78)], VGA_DWORD(VGA_CLR_FILL(VGA_ORANGE), '  ')
	mov 	rax, VGA_QWORD(VGA_CLR_FILL(VGA_ORANGE), strmul(' ', 4))

	mov 	ebx, 4*(TERM_COLS - 1)
	mov 	ecx, 22
.border_sides:
	mov 	qword [VGA_BUF + rbx], rax
	add 	ebx, 2*TERM_COLS
	dec 	ecx
	jnz 	.border_sides
.apple:
	mov 	dword [ebp], VGA_DWORD(VGA_CLR_FILL(VGA_RED), '  ')
.snake:
	jce 	r10d, r11d, .snake@head
	mov 	eax, r10d
	zero	r13d
.snake@loop:
	movzx	ebx, word [r9 + 2*rax]
	mov 	dword [VGA_BUF + ebx], VGA_DWORD(VGA_CLR_FILL(VGA_YELLOW), '  ')

	inc 	eax
	cmp 	eax, ring_buf_size
	cmove	eax, r13d

	jcne 	eax, r11d, .snake@loop
.snake@head:
	movzx	ebx, word [r9 + 2*r11]
	mov 	dword [VGA_BUF + ebx], VGA_DWORD(VGA_CLR_FILL(VGA_YELLOW), '  ')
.score:
	;; NOTE: place the score after the snake so if you die on one of the score
	;;       cells, it doesn't overwrite it, so you still know what score you had.
	mov 	dword [VGA_ADDR(0, 0)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'SC')
	mov 	dword [VGA_ADDR(0, 2)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'OR')
	mov 	dword [VGA_ADDR(0, 4)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'E:')
	mov 	ax, 7
	call	move_cursor

	mov 	ax, r12w
	mov 	bl, VGA_CLR(VGA_WHITE, VGA_ORANGE)
	jmp 	print_u16hex

%xdefine SNAKE_HELP_MSG %strcat(                  \
	`\fKeybinds:\n`,                              \
	`  UP, RIGHT, DOWN, LEFT: move snake\n`,      \
	`  W, A, S, D: move snake\n`,                 \
	`  ESC: save scores to disk and exit game\n`, \
	`  P: pause/unpause\n`,                       \
	`  F1: show keybinds\n`,                      \
	`  F2: open speed select menu\n`,             \
	`  ENTER (on end screen): restart`            \
)

snake_help_msg:
.len: dq %strlen(SNAKE_HELP_MSG)
.ptr: db SNAKE_HELP_MSG

snake_help:
	mov 	eax, snake_help_msg.ptr
	call	puts

	keywait_mac
	call	cls
	jmp 	snake_entry.recall

snake_speed_menu:
	clear_keyring
	call	cls

	mov 	dword [VGA_ADDR( 0,  0)], DVGA_DWORD('SP')
	mov 	dword [VGA_ADDR( 0,  2)], DVGA_DWORD('EE')
	mov 	byte  [VGA_ADDR( 0,  4)], 'D'
	mov 	dword [VGA_ADDR( 0,  7)], DVGA_DWORD('HI')
	mov 	dword [VGA_ADDR( 0,  9)], DVGA_DWORD('GH')
	mov 	byte  [VGA_ADDR( 0, 12)], 'S'
	mov 	dword [VGA_ADDR( 0, 13)], DVGA_DWORD('CO')
	mov 	dword [VGA_ADDR( 0, 15)], DVGA_DWORD('RE')

	mov 	dword [VGA_ADDR( 1, 1)], DVGA_DWORD('01')
	mov 	dword [VGA_ADDR( 2, 1)], DVGA_DWORD('02')
	mov 	dword [VGA_ADDR( 3, 1)], DVGA_DWORD('03')
	mov 	dword [VGA_ADDR( 4, 1)], DVGA_DWORD('04')
	mov 	dword [VGA_ADDR( 5, 1)], DVGA_DWORD('05')
	mov 	dword [VGA_ADDR( 6, 1)], DVGA_DWORD('06')
	mov 	dword [VGA_ADDR( 7, 1)], DVGA_DWORD('07')
	mov 	dword [VGA_ADDR( 8, 1)], DVGA_DWORD('08')
	mov 	dword [VGA_ADDR( 9, 1)], DVGA_DWORD('09')
	mov 	dword [VGA_ADDR(10, 1)], DVGA_DWORD('10')

	mov 	r13b, r15b

%assign i 1
%rep 10
	mov 	ax, VGA_POS(11 - i, 8)
	call	move_cursor

	mov 	ax, word [snake_high_score_base + 2*i]
	mov 	bl, VGA_DEFAULT
	call	print_u16hex

	%assign i i + 1
%endrep

%undef i

	sub 	r15b, 11
	neg 	r15b
	imul	ecx, r15d, TERM_COLS

	mov 	byte [VGA_BUF + 2*(ecx + 1) + 1], VGA_HIGHLIGHT
	mov 	byte [VGA_BUF + 2*(ecx + 2) + 1], VGA_HIGHLIGHT
.spinloop:
	call	next_keycode
	jce 	al, KC_ENTER,	.done
	jce 	al, KC_UP,		.up
	jce 	al, KC_DOWN,	.down
	jce 	al, KC_ESC,		.escape

	jmp 	.spinloop
.escape:
	mov 	r15b, r13b
	jmp 	snake_entry.recall
.up:
	mov 	byte [VGA_BUF + 2*(ecx + 1) + 1], VGA_DEFAULT
	mov 	byte [VGA_BUF + 2*(ecx + 2) + 1], VGA_DEFAULT
	sub 	ecx, TERM_COLS

	mov 	ebx, 10*TERM_COLS
	test	ecx, ecx
	cmovz	ecx, ebx

	mov 	byte [VGA_BUF + 2*(ecx + 1) + 1], VGA_HIGHLIGHT
	mov 	byte [VGA_BUF + 2*(ecx + 2) + 1], VGA_HIGHLIGHT
	jmp 	.spinloop
.down:
	mov 	byte [VGA_BUF + 2*(ecx + 1) + 1], VGA_DEFAULT
	mov 	byte [VGA_BUF + 2*(ecx + 2) + 1], VGA_DEFAULT
	add 	ecx, TERM_COLS

	mov 	ebx, 1*TERM_COLS
	cmp 	ecx, 10*TERM_COLS
	cmova	ecx, ebx

	mov 	byte [VGA_BUF + 2*(ecx + 1) + 1], VGA_HIGHLIGHT
	mov 	byte [VGA_BUF + 2*(ecx + 2) + 1], VGA_HIGHLIGHT
	jmp 	.spinloop
.done:
	shr 	ecx, 4
	mov 	cl, byte [putchar_cr_table + ecx]
	neg 	cl
	add 	cl, 11
	mov 	r15b, cl
	;; r15b = 11 - (row / 80). (higher number => lower timer modulo)
	jmp 	snake_entry.recall

snake_high_score_base:
	;; indices 0-10. index 0 is unused.
	times 11 dw 0

snake_entry:
	;; rbp  = apple position
	;; r8d  = snake head increment value
	;; r9d  = ring base
	;; r10d = ring tail
	;; r11d = ring head
	;; r12w = score
	;; r13  = tmp1
	;; r14  = previous movement direction
	;; r15b = speed

	call	hide_cursor

	sub 	esp, 512
	inc 	qword [esp]
	mov 	eax, DISKFS_START
	mov 	bx, 1
	mov 	ecx, esp
	call	disk_read	; disk_write(u64 sector, u16 cnt, u16 *mem);

	mov 	rax, qword [esp + 10]
	mov 	qword [snake_high_score_base + 2], rax

	mov 	rax, qword [esp + 18]
	mov 	qword [snake_high_score_base + 10], rax

	mov 	eax, dword [esp + 26]
	mov 	dword [snake_high_score_base + 18], eax
	add 	esp, 512

	zero	r15d

	mov 	r15b, 6	;; start out at modulo 6 (speed 5)
.recall:
	mov 	r9d, snake_ring_base
	zero	r10d		;; tail starts at index 0
	zero	r11d		;; head starts at index 0
	zero	r12d		;; no apples eaten
	mov 	word [r9 + 2*r11], 2*VGA_POS(2, 4)

	mov 	ebp, 2*VGA_POS(12, 14)	;; use a default position that won't seg fault.
	call	snake_redraw

	;; replace the default apple position with a random one.
	mov 	dword [ebp], VGA_DWORD(VGA_CLR_FILL(VGA_BLACK), '  ')
	call	snake_place_apple.first
	mov 	dword [ebp], VGA_DWORD(VGA_CLR_FILL(VGA_RED), '  ')

	mov 	dword [VGA_ADDR(0,  0)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'HI')
	mov 	dword [VGA_ADDR(0,  2)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'GH')
	mov 	dword [VGA_ADDR(0,  4)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), ' S')
	mov 	dword [VGA_ADDR(0,  6)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'CO')
	mov 	dword [VGA_ADDR(0,  8)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), 'RE')
	mov 	dword [VGA_ADDR(0, 10)], VGA_DWORD(VGA_CLR(VGA_WHITE, VGA_ORANGE), ': ')

	mov 	ax, 12
	call	move_cursor

	mov 	ax, word [snake_high_score_base + 2*r15]
	mov 	bl, VGA_CLR(VGA_WHITE, VGA_ORANGE)
	call	print_u16hex

	zero	r8d
.wait_for_start:
	;; the snake doesn't move until you press an arrow key first
	call	next_keycode

	;; S/DOWN
	mov 	bx, +2*TERM_COLS
	cmp 	al, KC_DOWN
	cmove	r8w, bx
	je  	.pre_mainloop

	cmp 	al, KC_S
	cmove	r8w, bx
	je  	.pre_mainloop

	;; W/UP
	mov 	bx, -2*TERM_COLS
	cmp 	al, KC_UP
	cmove	r8w, bx
	je  	.pre_mainloop

	cmp 	al, KC_W
	cmove	r8w, bx
	je  	.pre_mainloop

	;; D/RIGHT
	mov 	bx, +2*2
	cmp 	al, KC_RIGHT
	cmove	r8w, bx
	je  	.pre_mainloop

	cmp 	al, KC_D
	cmove	r8w, bx
	je  	.pre_mainloop

	;; A/LEFT
	mov 	bx, -2*2
	cmp 	al, KC_LEFT
	cmove	r8w, bx
	je  	.pre_mainloop

	cmp 	al, KC_A
	cmove	r8w, bx
	je  	.pre_mainloop

	jce 	al, KC_F1, snake_help
	jce 	al, KC_F2, snake_speed_menu
	jce 	al, KC_ESC, .goto_start

	jmp 	.wait_for_start
.pre_mainloop:
	mov 	r14w, r8w
	mov 	r13w, r8w
.mainloop:
	call	get_keycode
	jz  	.check_timer

	;; S/DOWN
	mov 	bx, +2*TERM_COLS
	cmp 	al, KC_DOWN
	cmove	r8w, bx
	je  	.validate_key

	cmp 	al, KC_S
	cmove	r8w, bx
	je  	.validate_key

	;; W/UP
	mov 	bx, -2*TERM_COLS
	cmp 	al, KC_UP
	cmove	r8w, bx
	je  	.validate_key

	cmp 	al, KC_W
	cmove	r8w, bx
	je  	.validate_key

	;; D/RIGHT
	mov 	bx, +2*2
	cmp 	al, KC_RIGHT
	cmove	r8w, bx
	je  	.validate_key

	cmp 	al, KC_D
	cmove	r8w, bx
	je  	.validate_key

	;; A/LEFT
	mov 	bx, -2*2
	cmp 	al, KC_LEFT
	cmove	r8w, bx

	cmp 	al, KC_A
	cmove	r8w, bx

	jce 	al, KC_P, .paused
.validate_key:
	jtz 	r12d, r12d, .check_timer	;; if (snake size == 1) allow 180 degree rotations;
	add 	r8w, r14w
	cmovz	r8w, r13w		;; 180 degree rotations are invalid
	jz  	.check_timer

	sub 	r8w, r14w		;; not a 180 degree rotation. undo the addition.
	mov 	r13w, r8w
.check_timer:
	get_isr_timer8_mod r15b
	mov 	r13w, r14w
	jb  	.mainloop

	mov 	r14w, r8w

	movzx	eax, word [r9 + 2*r11]		;; get the old snake head position

	zero	r13d
	inc 	r11d						;; increment the ring head index
	cmp 	r11d, ring_buf_size			;; if the head overflowed the ring
	cmovae	r11d, r13d					;;     go back to the start of the ring

	add 	ax, r8w						;; get the new snake head position
	mov 	word [r9 + 2*r11], ax		;; write the new snake head position

	add 	eax, VGA_BUF
	;; if the head just landeded on the apple, place a new apple
	;; otherwise, increment the tail position
	jcne 	eax, ebp, .redraw

	call	snake_place_apple
	;; NOTE: snake_place_apple puts the old apple position into r13d
	dec 	r10d		;; counteract the tail increment after the fallthrough

	inc 	r12d
	jcae 	r12w, SNAKE_VICTORY_THRESH, .victory

	;; fallthrough
.redraw:
	movzx	eax, word [r9 + 2*r11]
	jcne 	byte [VGA_BUF + eax + 1], VGA_CLR_FILL(VGA_YELLOW), .redraw@for_real_this_time
	;; the head is about to enter a cell that currently contains the snake


	jce 	eax, r13d, .redraw@for_real_this_time ;; it just ate the apple
	movzx	ebx, word [r9 + 2*r10]
	jcne 	eax, ebx, .game_over_self	;; the head touched a cell in the snake that isn't the tail

	;; fallthrough
.redraw@for_real_this_time:
	zero	r13d
	inc 	r10d					;; increment the tail ring index
	cmp 	r10d, ring_buf_size		;; if the tail overflowed the ring
	cmovae	r10d, r13d				;;     go back to the start of the ring

	call	snake_redraw
.check_edge_collisions:
	movzx	eax, word [r9 + 2*r11]
	mov 	ebx, eax
	shr 	eax, 5
	mov 	al, byte [putchar_cr_table + eax]

	jce 	eax, 0, .game_over		;; top side collision
	jce 	eax, 24, .game_over		;; bottom side collision

	imul	eax, eax, 2*TERM_COLS
	jce 	eax, ebx, .game_over	;; left side collision

	lea 	eax, [eax + 2*(TERM_COLS - 2)]
	jce 	eax, ebx, .game_over	;; right side collision

	mov 	r13w, r14w
	jmp 	.mainloop
.paused:
	mov 	ax, VGA_POS(12, 34)
	call	move_cursor
	mov 	byte [puts_color], VGA_ALERT

	sub 	esp, 18
	mov 	qword [rsp], 10
	mov 	word [rsp + 8], '  '

	mov 	rax, 'PAUSED  '
	mov 	qword [rsp + 10], rax

	lea 	eax, [esp + 8]
	call	puts
	add 	esp, 18

	mov 	dword [VGA_ADDR(11, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 42)], VGA_DWORD(VGA_ALERT, '  ')

	mov 	dword [VGA_ADDR(13, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 42)], VGA_DWORD(VGA_ALERT, '  ')
.paused@loop:
	call	next_keycode
	mov 	r13w, r14w
	jcne 	al, KC_P, .paused@loop

	call	snake_redraw
	jmp 	.mainloop
.game_over_self:
	movzx	eax, word [r9 + 2*r11]
	mov 	dword [VGA_BUF + eax], VGA_DWORD(VGA_CLR_FILL(VGA_LGT_GRAY), '  ')
.game_over:
	mov 	ax, word [snake_high_score_base + 2*r15]
	cmp 	r12w, ax
	cmova	ax, r12w
	mov 	word [snake_high_score_base + 2*r15], ax

	mov 	ax, VGA_POS(12, 36)
	call	move_cursor
	mov 	byte [puts_color], VGA_ALERT

	sub 	esp, 16
	mov 	qword [rsp], 8
	mov 	rax, 'GAMEOVER'
	mov 	qword [rsp + 8], rax

	lea 	eax, [esp + 8]
	call	puts
	add 	esp, 16

	mov 	dword [VGA_ADDR(12, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(12, 44)], VGA_DWORD(VGA_ALERT, '  ')

	mov 	dword [VGA_ADDR(11, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 42)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 44)], VGA_DWORD(VGA_ALERT, '  ')

	mov 	dword [VGA_ADDR(13, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 42)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 44)], VGA_DWORD(VGA_ALERT, '  ')
.game_over@loop:
	call	next_keycode
	jce 	al, KC_ENTER, .recall
	jce 	al, KC_ESC, .goto_start
	jce 	al, KC_F1, snake_help
	jce 	al, KC_F2, snake_speed_menu
	jmp 	.game_over@loop
.victory:
	mov 	word [snake_high_score_base + 2*r15], r12w	;; max score, so unconditionally set high score

	mov 	ax, VGA_POS(12, 36)
	call	move_cursor
	mov 	byte [puts_color], VGA_ALERT

	sub 	esp, 16
	mov 	qword [rsp], 8
	mov 	rax, 'YOU WIN!'
	mov 	qword [rsp + 8], rax

	lea 	eax, [esp + 8]
	call	puts_color
	add 	esp, 16

	mov 	dword [VGA_ADDR(12, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(12, 44)], VGA_DWORD(VGA_ALERT, '  ')

	mov 	dword [VGA_ADDR(11, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 42)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(11, 44)], VGA_DWORD(VGA_ALERT, '  ')

	mov 	dword [VGA_ADDR(13, 34)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 36)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 38)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 40)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 42)], VGA_DWORD(VGA_ALERT, '  ')
	mov 	dword [VGA_ADDR(13, 44)], VGA_DWORD(VGA_ALERT, '  ')
	jmp 	.game_over@loop
.goto_start:
	sub 	esp, 512

	mov 	eax, DISKFS_START
	mov 	bx, 1
	mov 	ecx, esp
	call	disk_read	; disk_write(u64 sector, u16 cnt, u16 *mem);

	mov 	rax, qword [snake_high_score_base + 2]
	mov 	qword [esp + 10], rax

	mov 	rax, qword [snake_high_score_base + 10]
	mov 	qword [esp + 18], rax

	mov 	eax, dword [snake_high_score_base + 18]
	mov 	dword [esp + 26], eax

	mov 	eax, DISKFS_START
	mov 	bx, 1
	mov 	ecx, esp
	call	disk_write	; disk_write(u64 sector, u16 cnt, u16 *mem);
	add 	esp, 512

	jmp 	kernel_reset
%endif ; %ifndef GAMES@SNAKE.NASM
