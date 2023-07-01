; ./assemble print_scanned_int64 .nasm --e

%define main_stack_space 32

segment rdata
	fmt 	db  	"%d"

segment text
	global	main
	extern	printf
	extern	scanf

; ╭────────────────────────╮
; │                        │
; │  int main(void) {      │
; │      int64_t i;        │
; │      scanf("%d", &i);  │
; │      printf("%d", i);  │
; │      return 0;         │
; │  }                     │
; │                        │
; ╰────────────────────────╯

main:
	mov 	rbp, rsp
	sub 	rsp, main_stack_space

	lea 	rcx, [rel fmt]
	lea 	rdx, [rbp - 8]
	call	scanf

	lea 	rcx, [rel fmt]
	mov 	rdx, [rbp - 8]
	call	printf

	xor 	rax, rax
	add 	rsp, main_stack_space
	ret
