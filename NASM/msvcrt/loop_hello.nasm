; nasm -fwin64 loop_hello.nasm -o loop_hello.o
; ld loop_hello.o -lmsvcrt -o loop_hello.exe --entry main
; rm loop_hello.o
; strip loop_hello.exe

segment rdata
	msg db	`Hello World\0`

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
