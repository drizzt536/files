; ../assemble empty.nasm --e

segment text
	global	main

main:
	xor 	rax, rax
	ret
