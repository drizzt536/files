; nasm -fwin64 -Werror print_char_range.nasm -o print_char_range.o
; ld print_char_range.o -lmsvcrt -o print_char_range.exe --entry main
; rm print_char_range.o
; strip print_char_range.exe

%define MIN 32
%define MAX 255

segment text
	global	main

	extern	putchar	; msvcrt.dll

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
	mov 	rbp, rsp
	sub 	rsp, 32

	mov 	rbx, MAX	; 64 bit of MAX version to compare to
	mov 	rax, MIN

.loop:
	mov 	rcx, rax
	call	putchar
	inc 	rax
	cmp 	rax, rbx
	jle 	.loop

	xor 	rax, rax
	mov 	rsp, rbp
	ret