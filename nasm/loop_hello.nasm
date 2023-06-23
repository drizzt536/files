; nasm -fwin64 loop_hello.nasm
; gcc loop_hello.obj -o loop_hello
; rm ./loop_hello.obj
; ./loop_hello.exe


segment data
	msg 	db "Hello World"

segment text
	extern	puts
	global	main

main:					; while (true)
	mov 	rcx, msg
	call	puts 		; puts("Hello World")
	jmp 	main
