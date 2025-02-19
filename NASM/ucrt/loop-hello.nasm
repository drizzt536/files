; ../assemble loop-hello --l ucrtbase

segment rdata
	msg 	db	`Hello World\0`

segment text
	global	main

	extern	puts	; ucrtbase.dll

; ╭────────────────────────────────╮
; │                                │
; │  int main(void) {              │
; │      while (true)              │
; │          puts("Hello World");  │
; │      return 0;                 │
; │  }                             │
; │                                │
; ╰────────────────────────────────╯

main:
	lea 	rcx, [rel msg]
	call	puts
	jmp 	main
