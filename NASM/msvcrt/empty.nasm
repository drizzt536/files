; nasm -fwin64 empty.nasm -o empty.o
; ld empty.o -o empty.exe --entry main
; rm empty.o
; strip empty.exe

segment text
	global	main

main:
	xor 	rax, rax
	ret
