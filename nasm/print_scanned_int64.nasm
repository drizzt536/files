%define main_stack_space 48

segment rdata
	fmt 	db	"%d"

segment text
	global	main
	extern	printf
	extern	scanf

; ╭──────────────────────────────────╮
; │                                  │
; │  int main(void) {                │
; │      __int64 i;                  │
; │      __builtin_scanf("%d", &i);  │
; │      __builtin_printf("%d", i);  │
; │                                  │
; │      return 0;                   │
; │  }                               │
; │                                  │
; ╰──────────────────────────────────╯

main:
	mov 	rbp, rsp
	sub 	rsp, main_stack_space

	lea 	rcx, [rel fmt] 
	lea 	rdx, [rbp - 4]
	call	scanf

	lea 	rcx, [rel fmt]
	mov 	rdx, [rbp - 4]
	call	printf

	add 	rsp, main_stack_space
	ret
