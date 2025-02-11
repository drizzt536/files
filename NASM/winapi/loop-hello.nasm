; ../assemble loop-hello --l kernel32

segment rdata
%xdefine msg_str `Hello World\n\0`
%xdefine msg_len %strlen(msg_str)

	msg_lbl 	db	msg_str

segment text
	global	main

	extern	ExitProcess, GetStdHandle, WriteConsoleA	; kernel32.dll

%macro print 2
	; inline BOOL print(const VOID *msg, DWORD len) {
	;     return WriteConsoleA(GetStdHandle(-11), msg, len, NULL);
	; }

	mov 	rcx, -11 ; STD_OUTPUT_HANDLE
	call	GetStdHandle

	mov 	rcx, rax
	mov 	rdx, %1
	mov 	r8, %2
	xor 	r9, r9 ; NULL: ignore argument
	call	WriteConsoleA
%endm

main:
	sub 	rsp, 40	; Shadow space, plus 8 bytes instead of `push rbp`

	mov 	rbx, 100000	; ~5 seconds of printing, non-volatile register.
.loop:
	print	msg_lbl, msg_len

	dec 	rbx
	jnz 	.loop

	xor 	ecx, ecx
	call	ExitProcess
