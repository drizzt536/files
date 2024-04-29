; ../assemble yes.nasm --e --l user32,kernel32

segment rdata
	msg 	db	`y\n\0`

segment text
	global	main

	extern	GetStdHandle		; kernel32.dll
	extern	WriteConsoleA		; user32.dll

main:
	sub 	rsp, 40			; Shadow space

	mov 	rcx, -11
	call	GetStdHandle

	mov 	rbx, rax		; non-volatile register
	xor 	r9 , r9			; WriteConsoleA doesn't change r9

start:
	mov 	rcx, rbx
	mov 	rdx, msg
	mov 	r8 , 3
	call	WriteConsoleA

	jmp 	start
	; will only ever exit from SIGINT/SIGKILL/SIGTERM
