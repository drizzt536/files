;; ../../assemble exe-wrap -D FILE_PATH=\"...\" --l kernel32,shlwapi,ucrtbase

%ifndef FILE_PATH
	; -D FILE_PATH=\"...\" or %define FILE_PATH "..."
	%error "`FILE_PATH` macro must be defined for exe-wrap.nasm to work"
%endif

section rdata
	cmdfmt	db %strcat(`""`, FILE_PATH, `.exe" %s"\0`)

segment text
	global	main

	extern	printf, sprintf, strlen, system	; ucrtbase.dll
	extern	GetCommandLineA					; kernel32.dll
	extern	PathGetArgsA					; shlwapi.dll

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32				; shadow space

	call	GetCommandLineA

	mov 	rcx, rax
	call	PathGetArgsA

	mov 	rbx, rax			; rbx = args.s

	mov 	rcx, rax
	call	strlen				; rax = args.l == strlen(args.s)

	add 	rax, 10 + %strlen(FILE_PATH)
	sub 	rsp, rax			; char *cmd[args.l + 12]
	and 	rsp, -16
	lea 	r12, [rbx]			; rsp + 32; jump over shadow space. r12 == cmd

	mov 	rcx, r12
	lea 	rdx, [rel cmdfmt]
	mov 	r8, rbx
	call	sprintf				; sprintf(cmd, cmdfmt, args.s)

	mov 	rcx, r12
	call	system				; system(cmd)

	leave
	xor 	eax, eax
	ret
