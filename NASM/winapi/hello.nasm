; nasm -fwin64 -Werror hello.nasm -o hello.o
; ld hello.o -luser32 -lkernel32 -o hello.exe --entry main
; rm hello.o
; strip hello.exe

segment rdata
	msg:	db	`Hello World\n\0`
	len:	equ $ - msg

segment text
	global	main

	extern	GetStdHandle
	extern	WriteConsoleA
	extern	ExitProcess

print:
	; BOOL print(const VOID *msg, DWORD len) {
	;     return WriteConsoleA(GetStdHandle(-11), msg, len, NULL);
	; }

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	mov 	r8, rdx
	mov 	rdx, rcx

	mov 	rcx, -11 ; STD_OUTPUT_HANDLE
	call	GetStdHandle

	mov 	rcx, rax
	xor 	r9, r9 ; ignore argument
	call	WriteConsoleA

	leave
	ret

main:
	; implicit push rbp
	sub 	rsp, 40 ; Shadow space

	mov 	rcx, msg
	mov 	rdx, len
	call	print

	add 	rsp, 40
	xor 	rcx, rcx
	call	ExitProcess
