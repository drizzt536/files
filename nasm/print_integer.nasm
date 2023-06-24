; ./assemble print_integer
; ./print_integer

%define stack_space 32

segment data
	format	db "%u", 10, 0		; printf format string ("%u\n")
	uvalue	db 0b1111_1111		; unsigned integer value 

segment text
	extern	printf
	global	main

; ╭───────────────────────────────╮
; │                               │
; │  int main(void) {             │
; │      printf("%u\n", uv);      │
; │      return 0;                │
; │  }                            │
; │                               │
; ╰───────────────────────────────╯


main:
	sub 	rsp, stack_space	; allocate space on the stack

	lea 	rcx, [rel format]	; load the address of the format specifier
	mov 	rdx, [rel uvalue]	; load the integer
	call	printf

	add 	rsp, stack_space
	ret
