; ../assemble hello --l ucrtbase

segment rdata
	txt 	db  	`Hello World\0`

segment text
	global	main

	extern	puts	; ucrtbase.dll

; ╭────────────────────────────╮
; │                            │
; │  int main(void) {          │
; │      puts("Hello World");  │
; │      return 0;             │
; │  }                         │
; │                            │
; ╰────────────────────────────╯


main:
	sub 	rsp, 32

	mov 	rcx, txt
	call	puts

	add 	rsp, 32

	xor 	eax, eax
	ret
