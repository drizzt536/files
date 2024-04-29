; nasm -fwin64 -Werror print_range.nasm -o print_range.o
; ld print_range.o -lmsvcrt -o print_range.exe --entry main
; rm print_range.o
; strip print_range.exe

%define MAX 32

segment rdata
	fmt 	db  	`%u\n\0`	; printf format string

segment text
	global	main

	extern	printf	; msvcrt.dll

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
	mov 	rbp, rsp
	sub 	rsp, 32				; allocate space on the stack

	mov 	r14, 0				; int i = 0
	mov 	r15, MAX			; this should never change

	loop:						; loop:
		lea 	rcx, [rel fmt]	;; load format string
		mov 	rdx, r14		;; load i
		call	printf			;     __builtin_printf(fmt, i);
		inc 	r14				;     i++
		cmp 	r14, r15		;     if (i <= MAX)
		jle  	loop			;         goto loop

	xor 	rax, rax
	mov 	rsp, rbp
	ret
