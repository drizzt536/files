; NOTE: these only work on windows because it uses cl as the first argument.

%ifndef RBIT2_INC
%define RBIT2_INC

;; rbit2.nasm

rbit2:
	;; 6 instructions (11 bytes), 0 rdata bytes, 11 total
	mov 	al, cl
	and 	al, 1
	shl 	al, 1

	shr 	cl, 1
	or  	al, cl
	ret

;; these two implementations are both directly worse
%if 0
rbit2:
	;; return value is in al
	;; 6 instructions (13 bytes), 0 rdata bytes, 13 total
	lea 	eax, [2*rcx] ;; this is ok because of the next instruction
	and 	al, 2

	shr 	cl, 1
	and 	cl, 1
	or  	al, cl
	ret


rbit2:
	;; 6 instructions (15 bytes), 0 rdata bytes, 15 total
	movzx	rcx, cl
	mov 	rax, rcx

	and 	al, 1
	shr 	cl, 1

	lea 	eax, [2*rax + rcx]
	ret
%endif

%endif