; ../assemble loop-hello --l msvcrt

segment rdata
	msg 	db	`Hello World\0`

segment text
	global	main

	extern	puts	; msvcrt.dll

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
	mov 	rcx, msg
	call	puts
	jmp 	main
