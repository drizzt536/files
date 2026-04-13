%ifndef STDKBD.NASM
%define STDKBD.NASM

%pragma ignore file stdkbd.nasm

;; returns keycode, keycode idx
;; clobbers: al, rbx
;; returns al=0 on failure.
;; set up so `call get_keycode` can immediately be followed by
;; either `jz .error` or `jnz .no_error` for fast processing.
;; the other flags aren't guaranteed, only the zero flag.
get_keycode: ; u8 get_keycode(void);
	movzx	ebx, byte [rel keyring_read]
_get_keycode: ; u8 _get_keycode(void _, u32 keyring_read);
	zero	al
	cli
	jce 	bl, byte [rel keyring_write], .ret

	mov 	al, byte [keyring + ebx]

	inc 	byte [rel keyring_read]
	test	al, al
.ret:
	sti
	ret

;; returns the next keycode and the keyring index
;; if there isn't a keycode ready, it blocks until there is.
;; clobbers: al, rbx
next_keycode: ; u8 next_keycode(void);
	;; NOTE: this part doesn't need to be in a critical section
	;;       since the keyboard ISR doesn't write to it.
	movzx	ebx, byte [rel keyring_read]
_next_keycode: ; u8 next_keycode(void _, u32 keyring_read);
.loop:
	;; flush pending interrupts
	sti
	;; TODO: consider replacing these nops with io_wait so it checks at minimum every 30ns?
	nop
	nop
	cli

	jce 	bl, byte [rel keyring_write], .loop

	mov 	al, byte [keyring + ebx]
	inc 	byte [rel keyring_read]
	sti
	ret

;; clobbers: ax, rbx
keyring_has_keycode: ; bool keyring_has_keycode(u8 keycode);
	cli
	mov 	ah, al
	movzx	ebx, byte [rel keyring_read]
.loop:
	jce 	bl, byte [rel keyring_write], .ret_false

	mov 	al, byte [keyring + ebx]
	inc 	bl

	jce 	al, ah, .ret_true
	jmp 	.loop
.ret_false:
	zero	al
	sti
	ret
.ret_true:
	;; `mov al, 1`, but update ZF
	zero	al
	inc 	al
	sti
	ret

%macro clear_keyring 0
	cli
	mov 	word [rel keyring_rw_word], 0
	sti
%endm

%macro kbd_reset 0
	cli
	mov 	word [rel keyring_rw_word], 0
	mov 	byte [kbd_state], 0
	sti
%endm

;; see ./doc/ISR-scancode-flattening.txt or ./docs/keycode-to-ASCII.txt for more on the KC namespace

%assign KC_RELEASE	1 << 7	;; release keycode

%assign enum_idx 0x00

enum_next	KC_NULL		;; not a real code
enum_next	KC_SPACE
enum_next	KC_1
enum_next	KC_2
enum_next	KC_3
enum_next	KC_4
enum_next	KC_5
enum_next	KC_6
enum_next	KC_7
enum_next	KC_8
enum_next	KC_9
enum_next	KC_0
enum_next	KC_MINUS
enum_next	KC_EQUALS
enum_next	KC_BACKSPACE
enum_next	KC_TAB
enum_next	KC_Q
enum_next	KC_W
enum_next	KC_E
enum_next	KC_R
enum_next	KC_T
enum_next	KC_Y
enum_next	KC_U
enum_next	KC_I
enum_next	KC_O
enum_next	KC_P
enum_next	KC_LBRACKET
enum_next	KC_RBRACKET
enum_next	KC_FSLASH
enum_next	KC_NP_ASTERISK
enum_next	KC_A
enum_next	KC_S
enum_next	KC_D
enum_next	KC_F
enum_next	KC_G
enum_next	KC_H
enum_next	KC_J
enum_next	KC_K
enum_next	KC_L
enum_next	KC_SEMICOLON
enum_next	KC_QUOTE
enum_next	KC_BACKTICK
enum_next	KC_NP_PLUS
enum_next	KC_BSLASH
enum_next	KC_Z
enum_next	KC_X
enum_next	KC_C
enum_next	KC_V
enum_next	KC_B
enum_next	KC_N
enum_next	KC_M
enum_next	KC_COMMA
enum_next	KC_PERIOD
enum_next	KC_ENTER
enum_next	KC_SHIFT
enum_next	KC_CTRL
enum_next	KC_ALT
enum_next	KC_ESC
enum_next	KC_DELETE
enum_next	KC_F1
enum_next	KC_F2
enum_next	KC_F3
enum_next	KC_F4
enum_next	KC_F5
enum_next	KC_F6
enum_next	KC_F7
enum_next	KC_F8
enum_next	KC_F9
enum_next	KC_F10
enum_next	KC_NUMLK
enum_next	KC_SCRLK
enum_next	KC_WIN
enum_next	KC_F11
enum_next	KC_F12
enum_next	KC_UP
enum_next	KC_RIGHT
enum_next	KC_DOWN
enum_next	KC_LEFT
enum_next	KC_PGUP
enum_next	KC_PGDN
enum_next	KC_CTX	;; context menu
enum_next	KC_HOME
enum_next	KC_END
enum_next	KC_INSERT
enum_next	KC_PRTSC
enum_next	KC_BREAK
enum_next	KC_MEDIA_PREV
enum_next	KC_MEDIA_NEXT
enum_next	KC_MEDIA_MUTE
enum_next	KC_MEDIA_PAUSEPLAY
enum_next	KC_MEDIA_STOP
enum_next	KC_MEDIA_VOLDOWN
enum_next	KC_MEDIA_VOLUP

%assign KC_SYSRQ KC_PRTSC

%assign KBD_STATE_CTRL_BIT	0	;; lCtrl, rCtrl
%assign KBD_STATE_ALT_BIT	1	;; lAlt, rAlt
%assign KBD_STATE_SHFT_BIT	2	;; lShift, rShift, caps lock
%assign KBD_STATE_WIN_BIT	3	;; lGUI, rGUI (windows key)
%assign KBD_STATE_INS_BIT	4	;; insert
%assign KBD_STATE_NMLK_BIT	5	;; num lock
%assign KBD_STATE_SCLK_BIT	6	;; scroll lock
;; bit 7 is unused

%assign KBD_STATE_CTRL		1 << KBD_STATE_CTRL_BIT
%assign KBD_STATE_ALT		1 << KBD_STATE_ALT_BIT
%assign KBD_STATE_SHFT		1 << KBD_STATE_SHFT_BIT
%assign KBD_STATE_WIN		1 << KBD_STATE_WIN_BIT
%assign KBD_STATE_INS		1 << KBD_STATE_INS_BIT
%assign KBD_STATE_NMLK		1 << KBD_STATE_NMLK_BIT
%assign KBD_STATE_SCLK		1 << KBD_STATE_SCLK_BIT

%assign KBD_STATE_TOGGLES	KBD_STATE_INS | KBD_STATE_NMLK | KBD_STATE_SCLK
%assign KBD_STATE_MODIFIERS	KBD_STATE_WIN | KBD_STATE_CTRL | KBD_STATE_ALT | KBD_STATE_SHFT

%assign ASCII_BEL	`\x07`	;;   7
%assign ASCII_BS	`\b`	;;   8
%assign ASCII_TAB	`\t`	;;   9
%assign ASCII_LF	`\n`	;;  10
%assign ASCII_VT	`\v`	;;  11
%assign ASCII_FF	`\f`	;;  12
%assign ASCII_CR	`\r`	;;  13
%assign ASCII_DEL	`\x7F`	;; 127

;; not actually ASCII. non-printable codes
;; See ./docs/keycode-to-ASCII.txt for more.
%assign enum_idx 0x80

enum_next	ASCII_ESC				;; escape
enum_next	ASCII_CTRL				;; control
enum_next	ASCII_ALT				;; alt
enum_next	ASCII_DELETE			;; delete
enum_next	ASCII_SHIFT				;; shift
enum_next	ASCII_PGUP				;; page up
enum_next	ASCII_PGDN				;; page down
enum_next	ASCII_CTX				;; context menu
enum_next	ASCII_WIN				;; windows
enum_next	ASCII_UP				;; up arrow
enum_next	ASCII_RIGHT				;; right arrow
enum_next	ASCII_DOWN				;; down arrow
enum_next	ASCII_LEFT				;; left arrow
enum_next	ASCII_HOME
enum_next	ASCII_END
enum_next	ASCII_PRTSC				;; PrtSc/SysRq
enum_next	ASCII_INSERT			;; insert
enum_next	ASCII_F1
enum_next	ASCII_F2
enum_next	ASCII_F3
enum_next	ASCII_F4
enum_next	ASCII_F5
enum_next	ASCII_F6
enum_next	ASCII_F7
enum_next	ASCII_F8
enum_next	ASCII_F9
enum_next	ASCII_F10
enum_next	ASCII_F11
enum_next	ASCII_F12
enum_next	ASCII_BREAK
enum_next	ASCII_MEDIA_PREV		;; multimedia previous track
enum_next	ASCII_MEDIA_NEXT		;; multimedia next track
enum_next	ASCII_NUMLK				;; num lock
enum_next	ASCII_MEDIA_MUTE		;; multimedia mute
enum_next	ASCII_MEDIA_PAUSEPLAY	;; multimedia pause/play
enum_next	ASCII_MEDIA_STOP		;; multimedia stop
enum_next	ASCII_MEDIA_VOLDOWN		;; multimedia volume down
enum_next	ASCII_MEDIA_VOLUP		;; multimedia volume up
enum_next	ASCII_SCRLK				;; scroll lock

%assign ASCII_SYSRQ ASCII_PRTSC

%pragma ignore variable
kbd_state: db 0

%pragma ignore variable
keycode_to_ascii_noshift_table: db `\0 1234567890-=\b\tqwertyuiop[]/*asdfghjkl;'\`+\\zxcvbnm,.\n`

%pragma ignore variable
keycode_to_ascii_shifted_table: db `\0 !@#$%^&*()_+\b\tQWERTYUIOP{}?*ASDFGHJKL:"~+|ZXCVBNM<>\n`

;; NOTE: 0x36 => 0x84
%pragma ignore variable
keycode_to_non_printable_table:
	db %hs2b("84818280839192939495969798999AA0C0889B9C898A8B8C8586878D8E908F9D9E9FA1A2A3A4A5")

;; returns the ASCII character or the non-printable code
;; see ../docs/keycode-to-ASCII.txt for input/output pairs
;; returns 0 if the input is a generic release keycode
keycode_to_ascii: ; u8, u8 keycode_to_ascii(u8 keycode);
	movzx	eax, al

	jce 	al, 0xB7,	.state_clear	;; ctrl release
	jce 	al, 0xB8,	.state_clear	;; alt release
	jce 	al, 0xC7,	.state_clear	;; windows release
	jcae 	al, 1 << 7, .release		;; no other release codes do anything
	jcb 	al, 0x36,	.ascii

	mov 	al, byte [keycode_to_non_printable_table + eax - 0x36]
	jce 	al, ASCII_CTRL,		.state_toggle
	jce 	al, ASCII_ALT,		.state_set
	jce 	al, ASCII_SHIFT,	.state_toggle
	jce 	al, ASCII_WIN,		.state_set
	jce 	al, ASCII_INSERT,	.state_toggle
	jce 	al, ASCII_NUMLK,	.state_toggle
	jce 	al, ASCII_SCRLK,	.state_toggle
	test	al, al
	ret
.release:
	;; return 0 for release keycodes
	zero	al
	ret
.state_toggle:
	;; these toggle bit 7 and also the bit they are supposed to flip
	and 	al, ~(1 << 7)
	xor 	byte [kbd_state], al
	or  	al, 1 << 7
	ret
.state_set:
	and 	al, ~(1 << 7)
	or  	byte [kbd_state], al
	or  	al, 1 << 7
	ret
.state_clear:
	mov 	al, byte [keycode_to_non_printable_table + eax - (1 << 7) - 0x36]
	not 	al
	and 	al, ~(1 << 7)
	and 	byte [kbd_state], al
	or  	al, 1 << 7
	ret
.ascii:
	mov 	ebx, keycode_to_ascii_noshift_table
	mov 	ecx, keycode_to_ascii_shifted_table
	test	byte [kbd_state], KBD_STATE_SHFT
	cmovnz	ebx, ecx
	mov 	al, byte [ebx + eax]
	test	al, al
	ret
%endif ; %ifndef STDKBD.NASM
