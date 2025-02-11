; ../assemble read-comptime-file --l ucrtbase -DFILENAME=\"file.txt\"

%ifndef FILENAME
	%error FILENAME macro was not defined
%endif

segment rdata
	file_modifier	db `r\0`
	filename		db FILENAME, 0
	file_nexits_str	db `\e[31minput file "`, FILENAME, `" does not exist\e[0m\n\0`

segment text
	global main

	extern _access_s, fopen, fgetc, putchar, fclose, fprintf, __acrt_iob_func	; ucrtbase.dll

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	lea 	rcx, [rel filename]
	mov 	rdx, 100b ; read access
	call	_access_s

	test	rax, rax ; test for nonzero exit code
	jnz  	.file_doesnt_exist

	lea 	rcx, [rel filename]
	lea 	rdx, [rel file_modifier]
	call 	fopen

	mov 	rbx, rax ; rbx = fp;

	; while (true) {
	;     c = fgetc(fp);
	;     if (c - (-1) == 0)
	;         break;
	;     putchar(c);
	; }
.loop:
	mov 	rcx, rbx
	call	fgetc

	cmp 	eax, -1		; NOTE: eax and not rax because fgetc returns int and not long.
	jz  	.done

	mov 	ecx, eax	; this is fine because `fgetc` returns a 32-bit value, not 64-bit
	call	putchar

	jmp 	.loop

.done:
	mov 	rcx, rbx
	call	fclose

	xor 	eax, eax
	leave
	ret
.file_doesnt_exist:
	mov 	rcx, 2
	call	__acrt_iob_func

	mov 	rcx, rax	; print to stderr.
	lea 	rdx, [rel file_nexits_str]
	call	fprintf

	mov 	eax, 1
	leave
	ret
