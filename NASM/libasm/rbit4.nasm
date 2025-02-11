; NOTE: these only work on windows because it uses cl as the first argument.

%ifndef RBIT4_INC
%define RBIT4_INC

%ifndef RBIT4_OPTIMIZATION
	%xdefine RBIT4_OPTIMIZATION balanced
%endif

%ifidni RBIT4_OPTIMIZATION, speed
	; raw lookup table

	segment rdata

	rbit4_table:
		;; reversed bits of `index`
		;; python code: [int(f"{x:04b}"[::-1], 2) for x in range(16)]
		;; [i%2*6 + i%8 + i%16 - 6*(i%8 > 3) - 7*(i%16 > 7) for i in range(16)]
		db 0,  8, 4, 12
		db 2, 10, 6, 14
		db 1,  9, 5, 13
		db 3, 11, 7, 15

	segment text

	rbit4:
		;; 3 instructions (11 bytes), 16 rdata bytes, 27 total
		movzx	rcx, cl
		mov 	al, [rbit4_table + rcx]
		ret
%elifidni RBIT4_OPTIMIZATION, balanced
	; lookup table with some manipulation

	segment rdata

	rbit4_table:
		;; [0, 7, 2, 9]   == [i + nibble_reverse(i) for i in range(4)]
		;; [254, 5, 0, 7] == [0, 7, 2, 9] - 2 (wrapping around).
		;; python code: [(nibble_reverse(i & 3) - (i & 3) - 2 * (i >> 2)) & 255 for i in range(8)]
		db   0, 7, 2, 9
		db 254, 5, 0, 7

	segment text

	rbit4:
		;; 8 instructions (23 bytes), 8 rdata bytes, 31 total
		movzx 	rdx, cl		;; copy cl for later.

		and 	dl, 7
		mov 	al, [rbit4_table + rdx]

		add 	al, cl		; al = f2(x) + x
		cmp 	cl, 8
		jl  	.ret		; return f2(x) + x + 7*(x > 7);
		sub 	al, 7
	.ret:
		ret
%elifidni RBIT4_OPTIMIZATION, recurse
	;; rbit4 using rbit2
	segment text

	%ifndef RBIT2_INC
		%include "rbit2.nasm"
	%endif

	rbit4:
		mov 	dl, cl	; save the upper 2 bits of the input for later
		shr 	dl, 2	; shift the upp 2 bits into the lower 2 bits

		and 	cl, 3
		call	rbit2	; reverse the lower 2 bits of the input
		shl 	al, 2	; move the reversed lower 2 bits into the upper 2 bits

		mov 	cl, dl
		mov 	dl, al	; save the output of the previous thing
		call 	rbit2

		or  	al, dl
		ret
%elifidni RBIT4_OPTIMIZATION, nordata
	; compute table value mathematically
	segment text

	;; there is also the De Bruijn Sequence thing, which is faster
	;; than this, but it is also yucky, and not my algorithm.

	; uint8_t rbit4(uint8_t x) {
	;     return 6*(x&1) + (x&7) + (x&15) - 6*((x&7) > 3) - 7*((x&15) > 7);
	; }
	rbit4:
		;; 15 instructions (33 bytes), 0 bytes of rdata, 33 bytes total
		xor 	al, al		;; default value for f1 is 0.
		mov 	dl, cl		;; copy cl for later. last startup line.
		and 	dl, 7

		test	dl, 1
		jz  	.f1ret		; return 6*(x % 2);
		mov 	al, 6
	.f1ret:
		add 	al, dl		;; al = f1(x) + x
		cmp 	dl, 4
		jl  	.f2ret		; return f1(x) + x - 6*(x > 3);
		sub 	al, 6
	.f2ret:
		add 	al, cl		; al = f2(x) + x
		cmp 	cl, 8
		jl  	.f3ret		; return f2(x) + x + 7*(x > 7);
		sub 	al, 7
	.f3ret:
		ret
%else
	%error "RBIT4_OPTIMIZATION" must be speed, balanced, recurse, or nordata (case insensitive)
%endif

%endif
