; ../assemble hello --l kernel32

segment rdata
%xdefine msg_str `Hello World\n`
%xdefine msg_len %strlen(msg_str)
	msg_lbl 	db	msg_str

segment text
	global	main

	extern	GetStdHandle, WriteConsoleA	; kernel32.dll

%macro print 2
	; BOOL print(const VOID *msg, DWORD len) {
	;     return WriteConsoleA(GetStdHandle(-11), msg, len, NULL);
	; }

	mov 	rcx, -11 ; STD_OUTPUT_HANDLE
	call	GetStdHandle

	mov 	rcx, rax
	mov 	rdx, %1
	mov 	r8, %2
	xor 	r9, r9 ; ignore argument
	call	WriteConsoleA
%endm

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32 ; Shadow space

	print	msg_lbl, msg_len

	leave
	xor 	eax, eax
	ret
