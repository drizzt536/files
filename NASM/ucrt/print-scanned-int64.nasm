; ../assemble print-scanned-int64 --l ucrtbase

segment rdata
	fmt 	db  	"%llu" ; print as unsigned int64

segment text
	global	main

	extern	printf, scanf	; ucrtbase.dll

; ╭──────────────────────────╮
; │                          │
; │  int main(void) {        │
; │      int64_t i;          │
; │      scanf("%llu", &i);  │
; │      printf("%llu", i);  │
; │      return 0;           │
; │  }                       │
; │                          │
; ╰──────────────────────────╯

main:
	mov 	rbp, rsp
	sub 	rsp, 32

	lea 	rcx, [rel fmt]
	lea 	rdx, [rbp - 8]
	call	scanf

	lea 	rcx, [rel fmt]
	mov 	rdx, [rbp - 8]
	call	printf

	xor 	rax, rax
	mov 	rsp, rbp
	ret
