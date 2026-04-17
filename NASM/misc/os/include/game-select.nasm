%ifndef GAME_MENU.NASM
%define GAME_MENU.NASM

%include "games/snake.nasm"
%include "games/life.nasm"
%include "games/vrand.nasm"

;; for now, assume there is only one page (<= 24 games)

game_names:
.snake@len:		dq  5
.snake@ptr:		db "Snake"
.life@len:		dq 21
.life@ptr:		db "Conway's Game of Life"
.vrand@len:		dq  5
.vrand@ptr:		db "VRAND"
.array:
	.array@1:	dq .snake@ptr
	.array@2:	dq .life@ptr
	.array@3:	dq .vrand@ptr


games:
	.1:		dq snake_entry
	.2:		dq life_entry
	.3:		dq vrand_entry
	.count:	equ ($ - games) / 8

%macro gamelist_println 0
	imul	ax, r8w, 80
	add 	ax, 2
	call	move_cursor

	mov 	rax, qword [game_names.array + 8*(r8d - 1)]
	call	puts
%endm

%macro gamelist_call 0
	kbd_reset
	jmp 	qword [games + 8*(r8d - 1)]
%endm

game_select_entry:
	call	cls
	call	hide_cursor
	clear_keyring

	mov 	dword [VGA_ADDR(0,  0)], DVGA_DWORD('GA')
	mov 	dword [VGA_ADDR(0,  2)], DVGA_DWORD('ME')
	mov 	byte  [VGA_ADDR(0,  5)], 'S'
	mov 	dword [VGA_ADDR(0,  6)], DVGA_DWORD('EL')
	mov 	dword [VGA_ADDR(0,  8)], DVGA_DWORD('EC')
	mov 	byte  [VGA_ADDR(0, 10)], 'T'

	mov 	r8d, 1
.loop:
	jca 	r8w, games.count, .setup_highlight

	gamelist_println
	inc 	r8d
	jmp 	.loop
.setup_highlight:
	;; highlight the first name
	mov 	r8w, 1

	mov 	byte [puts_color], VGA_HIGHLIGHT
	gamelist_println
.keyloop:
	call	next_keycode
	jce 	al, KC_ENTER,	.done
	jce 	al, KC_UP,		.up
	jce 	al, KC_DOWN,	.down
	jce 	al, KC_ESC,		kernel_reset

	;; TODO: do these next two once pages exist.
	;;       they should move by one page and keep the same screen row
	;;       act as a ring, so left on the first page goes to the last page, etc.
;	jce 	al, KC_LEFT, .left		;; TODO: do this once pages exist
;	jce 	al, KC_RIGHT, .right	;; TODO: do this once pages exist

	jmp 	.keyloop

.up:
	;; TODO: once pages exist, make this wrap between pages instead of within the same page

	;; remove highlight on the old item
	mov 	byte [puts_color], VGA_DEFAULT
	gamelist_println

	;; switch to the new item
	mov 	ax, games.count
	dec 	r8w
	cmovz	r8w, ax

	;; highlight the new item
	mov 	byte [puts_color], VGA_HIGHLIGHT
	gamelist_println

	jmp 	.keyloop
.down:
	;; TODO: once pages exist, make this wrap between pages instead of within the same page

	;; remove highlight on the old item
	mov 	byte [puts_color], VGA_DEFAULT
	gamelist_println

	;; switch to the new item
	inc 	r8w
	mov 	ax, 1
	cmp 	r8w, games.count + 1
	cmove	r8w, ax

	;; highlight the new item
	mov 	byte [puts_color], VGA_HIGHLIGHT
	gamelist_println

	jmp 	.keyloop
.done:
	gamelist_call
.escape:
	jmp 	kernel_reset

%endif ; %ifndef GAME_MENU.NASM
