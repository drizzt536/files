; ./assemble print_range
; print_range

%define MAX 32

segment rdata
	fmt 	db "%u, "				; printf format string "%u\n"

segment text
	extern	printf
	global	main

; ╭──────────────────────────────╮
; │                              │
; │  int main(void) {            │
; │      int i = 0;              │
; │      loop:                   │
; │          printf("%u, ", i);  │
; │          i++;                │
; │          goto loop;          │
; │                              │
; │      return 0;               │
; │  }                           │
; │                              │
; ╰──────────────────────────────╯

main:
	mov 	r14, 0					; int i = 0
	lea 	r15, [rel fmt]			;; load format string

	loop:							; loop:
		mov 	rcx, r15			;; load format string
		mov 	rdx, r14			;; load i
		call	printf				;     __builtin_printf(fmt, i);
		inc 	r14					;     i++
		jmp  	loop				;     goto loop

	ret								; unreachable
