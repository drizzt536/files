; ../assemble print-integer --l msvcrt

segment rdata
	format	db	`%u\n\0`		; printf format string ("%u\n")
	uvalue	db	1101_1111b		; unsigned integer value 

segment text
	global	main

	extern	printf	; msvcrt.dll

; ╭───────────────────────────╮
; │                           │
; │  int main(void) {         │
; │      printf("%u\n", uv);  │
; │      return 0;            │
; │  }                        │
; │                           │
; ╰───────────────────────────╯


main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32				; allocate space on the stack

	lea 	rcx, [rel format]	; rcx = format
	mov 	rdx, [rel uvalue]	; rdx = *uvalue
	call	printf				; `scanf` uses the same registers, but does `lea` on both

	xor 	rax, rax
	leave
	ret
