; ./assemble hello_world .nasm --e

%define main_stack_space 32			; minumum value without buffering before exit

segment rdata
	txt 	db  	"Hello World"

segment text
	extern	puts
	global	main

; ╭────────────────────────────╮
; │                            │
; │  int main(void) {          │
; │      puts("Hello World");  │
; │      return 0;             │
; │  }                         │
; │                            │
; ╰────────────────────────────╯


main:
	sub 	rsp, main_stack_space

	mov 	rcx, txt
	call	puts

	xor 	rax, rax
	add 	rsp, main_stack_space
	ret
