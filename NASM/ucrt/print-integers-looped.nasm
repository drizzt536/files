; ../assemble print-integers-looped --l ucrtbase

%define MAX 32

segment rdata
	fmt 	db  	`%u, \0`	; printf format string "%u\n"

segment text
	global	main

	extern	printf	; ucrtbase.dll

; ╭──────────────────────────╮
; │                          │
; │  int main(void) {        │
; │      int i = 0;          │
; │  loop:                   │
; │      printf("%u, ", i);  │
; │      i++;                │
; │      goto loop;          │
; │                          │
; │      return 0;           │
; │  }                       │
; │                          │
; ╰──────────────────────────╯

main:
	mov 	rbp, rsp
	sub 	rsp, 32

	mov 	r14, 0				; int i = 0
	lea 	r15, [rel fmt]		;; load format string

.loop:							; loop:
	mov 	rcx, r15			;; load format string
	mov 	rdx, r14			;; load i
	call	printf				;     __builtin_printf(fmt, i);
	inc 	r14					;     i++
	jmp  	.loop				;     goto loop

	; unreachable
	; mov 	rsp, rbp
	; ret
