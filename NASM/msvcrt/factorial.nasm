; ../assemble factorial --l msvcrt

segment rdata
	input_fmt		db	`input: \0`
	output_fmt		db	"output: " ; missing null byte on purpose
	lli_fmt 		db	`%lli\0`
	if_negative 	db	`(-n)! is not defined\n\0`

segment text
	global	main

	extern	printf, scanf	; msvcrt.dll

factorial:
	mov 	rax, 1
	cmp 	rcx, 0
	jl  	.negative
	jrcxz	.end
.loop:
	mul 	rcx
	dec 	rcx
	jnz 	.loop
	retn ; jmp .end
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
	sub 	rsp, 48

	lea 	rcx, [rel input_fmt]
	call	printf					; print input prompt

	lea 	rcx, [rel lli_fmt]		; rcx = lli_fmt
	lea 	rdx, [rbp - 8]			; rdx = rbp - 8
	call	scanf					; scan for input and move to the stack

	mov 	rcx, [rbp - 8]			; rcx = *(rbp - 8)
	call	factorial

	lea 	rcx, [rel output_fmt]	; rcx = output_fmt
	mov 	rdx, rax
	call	printf					;  print factorial of input

main_exit: ; can't be a local label.
	xor 	rax, rax
	leave
	ret
