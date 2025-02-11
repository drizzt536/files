; ../assemble print-argc --l kernel32,shell32,ucrtbase

segment rdata
	argc_fmt	db `argc = %d\n\0`

segment text
	global main

	extern GetCommandLineW		; kernel32.dll
	extern CommandLineToArgvW	; shell32.dll
	extern printf, puts			; ucrtbase.dll

%include "../winapi/setup_argc_argv.nasm"

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	call	setup_argc_argv

	lea 	rcx, [rel argc_fmt]
	mov 	edx, edi
	call	printf

	xor 	ebx, ebx
.loop:
	mov 	rcx, [rsi + 8*rbx] ; rcx = argv[i].
	call	puts

	inc 	ebx
	cmp 	ebx, edi
	jl  	.loop

	xor 	eax, eax
	leave
	ret
