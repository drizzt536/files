;; rbit16.nasm

	%ifndef RBIT16_INC
%define RBIT16_INC

%ifndef RBIT8_INC
	%include "./rbit8.nasm"
%endif

; uint16_t rbit16(uint16_t x) {
;     return rbit8(x) << 8 | rbit8(x >> 8);
; }
rbit16: ; cx is the input.
	mov 	dx, cx ; save the input value for later
	call 	rbit8  ; reverse the lower 8 bits

	shr 	dx, 8  ; move the upper half of the input
	mov 	cl, dl ; into the lower half of cx

	mov 	dl, al ; save the output of the previous call (reversed lower half)
	shl 	dx, 8  ; into the upper half of dx

	call	rbit8  ; mov al, reversed upper half of input

	or  	ax, dx
	ret

%endif