; ./assemble print_charcode_range
; ./print_charcode_range

%define MIN 32
%define MAX 255
%define stack_space 24			; idk why this value works

segment text
	extern	putchar
	global	main

; ╭─────────────────────────────────────────╮
; │                                         │
; │  #define MIN 32                         │
; │  #define MIN 255                        │
; │                                         │
; │  int main(void) {                       │
; │      for (char i = MIN; i <= MAX; i++)  │
; │          __builtin_putchar(i);          │
; │                                         │
; │      return 0;                          │
; │  }                                      │
; │                                         │
; ╰─────────────────────────────────────────╯

main:
	sub 	rsp, stack_space
	mov 	rbx, MAX			; 64 bit of MAX version to compare to
	mov 	rax, MIN

	loop:
		mov 	rcx, rax
		call	putchar
		inc 	rax
		cmp 	rax, rbx
		jle 	loop

	add 	rsp, stack_space
	ret
