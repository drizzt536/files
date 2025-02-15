; ../assemble adler32 --l kernel32,shell32,ucrtbase

;; NOTE: this program doesn't allow you to pass in a checksum
;;       for previous data, and assumes there is no data before
;;       the file currently being checksummed.

segment rdata
	valid_line_fmt		db `%08x\t%s\n\0`
	invalid_line_fmt	db `\e[31m[MISSING]\e[0m\t%s\n\0`
	file_read_modifier	db `r\0`
	help_arg			db `--help\0`
	help_text			db `Usage: adler32 [file1] [file2] ...\n`
						db `       adler32 --help\0`

segment text
	global main

	extern GetCommandLineW				; kernel32.dll
	extern CommandLineToArgvW			; shell32.dll
	extern fprintf, printf, puts
	extern __acrt_iob_func, fgetc
	extern _access_s, fopen, fclose		; ucrtbase.dll

%include "../winapi/setup_argc_argv.nasm"

%include "../libasm/callconv.mac" ; required for streq.nasm
%include "../libasm/streq.nasm"

;; compute the adler32 checksum of a file given the pointer to the file
adler32_fp:
	;; uint32_t adler32_fp(FILE *fp);
	push	r12			; r12 = a
	push	r13			; r13 = b
	push	r14			; r14 = 65521
	push	r15			; r15 = fp

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	; load in the default values
	mov 	r12d, 1		; a = 1
	xor 	r13d, r13d	; b = 0
	mov 	r14d, 65521	; BASE = 65521
	mov 	r15, rcx	; fp = rcx
.loop:
	mov 	rcx, r15
	call	fgetc

	cmp 	eax, -1
	je  	.done

	; a = (a + fgetc()) % 65521
	add 	eax, r12d	; tmp1 = a + fgetc() // rax += r12
	xor 	edx, edx	; clear the upper bits of the input
	div 	r14d		; tmp2 = tmp1 % 65521
	mov 	r12d, edx	; a = tmp2

	; b = (a + b) % 65521
	add 	r13d, r12d	; b += a
	mov 	eax, r13d	; tmp1 = b
	xor 	edx, edx	; clear the upper bits of the input
	div 	r14d		; tmp1 = b % 65521
	mov 	r13d, edx	; b = tmp

	jmp 	.loop
.done:
	mov 	eax, r13d
	shl 	eax, 16
	or  	eax, r12d

	leave
	pop 	r15
	pop 	r14
	pop 	r13
	pop 	r12
	ret

;; compute the adler32 checksum of a file given the file name as a string
adler32_fname:
	;; uint32_t adler32_fname(char *filename);
	push	r12

	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32 + 8 ; extra 8 bytes for alignment

	mov 	r12, rcx

	mov 	rdx, 100b	; read access
	call	_access_s

	test	rax, rax	; test for nonzero exit code
	jnz 	.invalid_file

	mov 	rcx, r12
	lea 	rdx, [rel file_read_modifier]
	call	fopen

	mov 	r12, rax	; r12 = fp;

	mov 	rcx, rax	; rcx = fp;
	call	adler32_fp	; rax = adler32_fp(fp)

	xchg	rax, r12	; swap(&rax, &fp)

	mov 	rcx, rax
	call	fclose

	mov 	rax, r12	; rax = checksum
.exit:
	leave
	pop 	r12
	ret
.invalid_file:
	;; give an invalid value
	; mov 	eax, -1		; 5 bytes, 1 instruction
	xor 	eax, eax	; 4 bytes, 2 instructions
	dec 	eax

	jmp 	.exit		; leave, pop r12, ret

main:
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 32

	call	setup_argc_argv

	dec 	edi ; ignore the current executable path argument
	add 	rsi, 8

	test 	edi, edi
	jz  	.done

	xor 	ebx, ebx

	mov 	rcx, [rsi]
	lea 	rdx, [rel help_arg]
	call	streq ; NOTE: streq always updates ZF
	jnz  	.help
.loop:
	cmp 	ebx, edi
	je  	.done
	mov 	r13, [rsi + 8*rbx] ; r13 = argv[i]

	mov 	rcx, r13
	call	adler32_fname

	cmp 	eax, -1 ;; invalid file. error message already printed.
	je  	.invalid_file

	lea 	rcx, [rel valid_line_fmt]
	mov 	edx, eax
	mov 	r8 , r13
	call	printf

	jmp 	.inc
.invalid_file:
	mov 	rcx, 2
	call	__acrt_iob_func

	mov 	rcx, rax	; print to stderr
	lea 	rdx, [rel invalid_line_fmt]
	mov 	r8 , r13
	call	fprintf
.inc:
	inc 	ebx
	jmp 	.loop

.done:
	leave
	xor 	eax, eax
	ret

.help:
	lea 	rcx, [rel help_text]
	call	puts
	jmp 	.done
