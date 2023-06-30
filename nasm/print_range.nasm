; ./assemble print_range .nasm --e

%define main_stack_space 32
%define MAX 32

segment rdata
	fmt 	db  	"%u", 10		; printf format string "%u\n"

segment text
	global	main
	extern	printf

; ╭───────────────────────────────────╮
; │                                   │
; │  #define printf __builtin_printf  │
; │  #define MAX 32                   │
; │                                   │
; │  int main(void) {                 │
; │      int i = 0;                   │
; │      loop:                        │
; │          printf("%u\n", i);       │
; │          i++;                     │
; │          if (i <= MAX)            │
; │              goto loop;           │
; │                                   │
; │      return 0;                    │
; │  }                                │
; │                                   │
; ╰───────────────────────────────────╯

main:
	sub 	rsp, main_stack_space	; allocate space on the stack

	mov 	r14, 0					; int i = 0
	mov 	r15, MAX				; this should never change

	loop:							; loop:
		lea 	rcx, [rel fmt]		;; load format string
		mov 	rdx, r14			;; load i
		call	printf				;     __builtin_printf(fmt, i);
		inc 	r14					;     i++
		cmp 	r14, r15			;     if (i <= MAX)
		jle  	loop				;         goto loop

	xor 	rax, rax
	add 	rsp, main_stack_space
	ret
