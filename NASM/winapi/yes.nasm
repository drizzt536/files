; ../assemble yes --l kernel32

segment rdata
%xdefine msg_str `y\n`
%xdefine msg_len %strlen(msg_str)
	msg_lbl 	db	msg_str

segment text
	global	main

	extern	GetStdHandle, WriteConsoleA	; kernel32.dll

main:
	sub 	rsp, 40			; Shadow space

	mov 	rcx, -11
	call	GetStdHandle

	mov 	rbx, rax		; non-volatile register
	xor 	r9 , r9			; WriteConsoleA doesn't change r9

.loop:
	mov 	rcx, rbx
	mov 	rdx, msg_lbl
	mov 	r8 , msg_len
	call	WriteConsoleA

	jmp 	.loop
	; will only ever exit from SIGINT/SIGKILL/SIGTERM
