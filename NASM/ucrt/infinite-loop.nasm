; ../assemble infinite-loop

segment text
	global main

main:
	jmp main
