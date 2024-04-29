; nasm -fwin64 -Werror hello.nasm -o hello.o
; ld hello.o -lmsvcrt -o hello.exe --entry main
; rm hello.o
; strip hello.exe


segment rdata
	txt 	db  	`Hello World\0`

segment text
	global	main

	extern	puts	; msvcrt.dll

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

	xor 	rax, rax
	ret
