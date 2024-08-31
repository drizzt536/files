; ../assemble print-char-range --l msvcrt

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

	mov 	rbx, MAX	; 64 bit version of MAX to compare to
	mov 	rax, MIN

.loop:
	mov 	rcx, rax
	call	putchar
	inc 	rax
	cmp 	rax, rbx
	jle 	.loop

	leave
	xor 	rax, rax
	ret
