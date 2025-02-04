; ../assemble float-ops --l ucrtbase

%if 0
addsd		dst, src ; add
subsd		dst, src ; subtract
mulsd		dst, src ; multiply
divsd		dst, src ; divide

cvtss2sd	dst, src ; move 32-bit float from xmm or memory to xmm
movss		dst, src ; move 32-bit float from xmm to another xmm
movd		dst, src ; move 32-bit float from xmm to general register

movsd		dst, src ; move 64-bit float from xmm or memory to xmm
movq		dst, src ; move 64-bit float from xmm to general register

movaps		dst, src ; move 128-bit aligned data from xmm to xmm
%endif

%include "../libasm/callconv.mac"
%include "../libasm/enter.mac"
%include "../libasm/exit.mac"

segment data
	flt1_prompt		db `Enter the 1st floating point number: \0`
	flt2_prompt		db `Enter the 2nd floating point number: \0`
	opcode_prompt	db `Enter the opcode (0=add, 1=sub, 2=mul, 3=div): \0`
	dbl_fmt			db `%lf\0`
	uchar_fmt		db `%hhu\0`
	output_fmt		db `x = %lf\n\0`
	invalid_opcode	db `\e[31mInvalid opcode. Must be in the range [0, 3].\e[0m\n\0`

segment text
	global	main
	extern	printf, scanf, exit		; ucrtbase.dll

exec_op:
	; double exec_op(double x1, double x2, unsigned char opcode) // 1 <= opcode <= 4
	; it takes in the opcode through al instead of cl (windows) or dil (linux)
	; because `mov al, something` has shorter opcodes.

	cmp 	al, 1
	jl  	.case_0_add
	je  	.case_1_sub

	cmp 	al, 3
	jl  	.case_2_mul
	je  	.case_3_div
	; the only case left is opcode > 3 (invalid)

	enter
	lea 	arg1, [rel invalid_opcode]
	call	printf

	mov 	arg1, 1
	call	exit

; these have to have the prefix before the period.
; for some reason NASM doesn't recognize forward jumps to local labels
; or something like that. idk.
exec_op.case_0_add:
	addsd	xmm0, xmm1
	ret
exec_op.case_1_sub:
	subsd	xmm0, xmm1
	ret
exec_op.case_2_mul:
	mulsd	xmm0, xmm1
	ret
exec_op.case_3_div:
	divsd	xmm0, xmm1
	ret

main:
	enter	%eval(32 + 16 + 16) ; 32 + 8*2 + 1, aligned to the next 16 bytes

	; prompt the first number
	lea 	arg1, [rel flt1_prompt]
	call	printf

	lea 	arg1, [rel dbl_fmt]
	lea 	arg2, [bptr - 8]
	call	scanf

	; prompt the second number
	lea 	arg1, [rel flt2_prompt]
	call	printf

	lea 	arg1, [rel dbl_fmt]
	lea 	arg2, [bptr - 16]
	call	scanf

	; prompt the opcode
	lea 	arg1, [rel opcode_prompt]
	call	printf

	lea 	arg1, [rel uchar_fmt]
	lea 	arg2, [bptr - 17]
	call	scanf

	; run the given operation
	movsd	xmm0, qword [bptr - 8]
	movsd	xmm1, qword [bptr - 16]
	mov		al  , byte  [bptr - 17]
	call	exec_op

	lea		arg1, [rel output_fmt]
	movq	arg2, xmm0
	call	printf

	fn_exit
