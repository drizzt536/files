; ../assemble stack-overflow

segment text
	global main

main:
	push	rax
	jmp 	main
