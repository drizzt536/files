;; ../assemble print-pipe --l kernel32,ucrtbase

;; example 1: cat ./print-pipe.nasm | ./print-pipe
;; example 2: "asdf", "qwer", "1234", "zxcv" | ./print-pipe

segment rdata
	bytes_avail_fmt		db `Bytes available: %u\n\0`

segment text
	global main

	extern GetStdHandle, PeekNamedPipe					; kernel32.dll
	extern printf, fread, malloc, free, __acrt_iob_func	; ucrtbase.dll

main:
	push	rbx
	push	r12

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 64			; shadow space + sizeof(int) + 2*sizeof(long) + alignment

	lea 	rbx, [rbp - 4]	; save it to push it later as an argument

	mov 	ecx, -10
	call	GetStdHandle

	mov 	rcx, rax				; arg 1
	xor 	edx, edx				; arg 2
	xor 	r8 , r8					; arg 3
	xor 	r9 , r9					; arg 4
	mov 	qword [rsp + 32], rbx	; arg 5. put on the stack above the shadow space
	mov 	qword [rsp + 40], 0		; arg 6
	call	PeekNamedPipe

	mov 	r12b, al			; save the return value for after the `printf` call

	mov 	ebx, dword [rbx]	; dereference the pointer

	lea 	rcx, [rel bytes_avail_fmt]
	mov 	edx, ebx
	call	printf

	test	r12b, r12b	; always print the byte count, and only exit conditionally after.
	jz  	.exit

	lea 	rcx, [rbx + 1]
	call	malloc

	mov 	r12, rax	; r12 = buffer

	mov 	rcx, 0
	call	__acrt_iob_func

	mov 	rcx, r12
	mov 	edx, 1		; sizeof(char)
	mov 	r8d, ebx
	mov 	r9 , rax
	call	fread

	mov 	ebx, eax ; `fread` collapses \r\n into \n, this value will be different

	mov 	byte [r12 + rbx], `\0` ; set the null byte.

	mov 	rcx, r12 ; `printf(s)` is basically the same as `printf("%s", s)`
	call	printf

	mov 	rcx, r12
	call	free
.exit:
	xor 	eax, eax

	leave
	pop 	r12
	pop 	rbx
	ret
