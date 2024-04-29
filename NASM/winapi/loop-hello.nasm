; nasm -fwin64 -Werror loop-hello.nasm -o loop-hello.o
; ld loop-hello.o -luser32 -lkernel32 -o loop-hello.exe --entry main
; rm loop-hello.o
; strip loop-hello.exe

segment rdata
	msg:	db	"Hello World", 10, 0
	len:	equ $ - msg

segment text
	global	main

	extern	GetStdHandle	; kernel32.dll
	extern	ExitProcess		; kernel32.dll
	extern	WriteConsoleA	; user32.dll

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
	sub 	rsp, 40		; Shadow space
	mov 	rbx, 100000	; ~5 seconds of printing, non-volatile register

.start:
	mov 	rcx, msg
	mov 	rdx, len
	call	print

	dec 	rbx
	jnz 	.start

	add 	rsp, 40
	xor 	rcx, rcx
	call	ExitProcess
