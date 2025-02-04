; ../assemble float-add --l ucrtbase

%include "../libasm/callconv.mac"
%include "../libasm/enter.mac"
%include "../libasm/exit.mac"

segment data
	prompt1		db `Enter the first floating point number: \0`
	prompt2		db `Enter the second floating point number: \0`
	scan_fmt	db `%lf\0`
	flt_fmt		db `x = %lf\n\0`

segment text
	global	main
	extern	printf, scanf	; ucrtbase.dll

main:
	enter	48 ; 32 + 8, aligned to the next 16 bytes

	; prompt the first number
	lea 	arg1, [rel prompt1]
	call	printf

	lea 	arg1, [rel scan_fmt]
	lea 	arg2, [rbp - 4]
	call	scanf

	; prompt the second number
	lea 	arg1, [rel prompt2]
	call	printf

	lea 	arg1, [rel scan_fmt]
	lea 	arg2, [bptr - 8]
	call	scanf

	cvtss2sd	xmm0, dword [bptr - 4]
	cvtss2sd	xmm1, dword [bptr - 8]
	addsd	xmm0, xmm1

	lea		arg1, [rel flt_fmt]
	movq	arg2, xmm0
	call	printf

	exit
