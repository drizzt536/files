; ./assemble factorial .nasm --e

%define main_stack_space 48

segment rdata
	input_fmt		db	"input: ", 0
	output_fmt		db	"output: " ; uses `lli_fmt` as well
	lli_fmt 		db	"%lli", 0
	if_negative 	db	"(-n)! is not defined", 10, 0

segment text
	global	main
	extern	printf
	extern	scanf

factorial:
	mov 	rax, 1
	cmp 	rcx, 0
	jl  	.negative
	jrcxz	.end
.loop:
	mul 	rcx
	dec 	rcx
	jnz 	.loop
	jmp 	.end
.negative:
	mov 	rcx, if_negative
	call	printf

	; return except go to main_exit instead
	add 	rsp, 8
	jmp		main_exit
.end:
	retn

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, main_stack_space

	lea 	rcx, [rel input_fmt]
	call	printf					; print input prompt

	lea 	rcx, [rel lli_fmt]
	lea 	rdx, [rbp - 8]
	call	scanf					; scan for input and move to the stack

	mov 	rcx, [rbp - 8]
	call	factorial

	lea 	rcx, [rel output_fmt]
	mov 	rdx, rax
	call	printf					;  print factorial of input

main_exit:
	xor 	rax, rax
	add 	rsp, main_stack_space
	pop 	rbp
	ret
