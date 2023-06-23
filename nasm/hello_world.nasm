; nasm -fwin64 hello_world.nasm
; gcc hello_world.obj -o hello_world
; rm ./hello_world.obj
; ./hello_world.exe

%define stack_space 32			; minumum value without buffering before exit

segment data
	txt 	db "Hello World"

segment text
	extern	puts
	global	main

; int main(void) {
;     puts("Hello World");
;     return 0;
; }

main:
	sub 	rsp, stack_space
	mov 	rcx, txt
	call	puts
	add 	rsp, stack_space
	ret
