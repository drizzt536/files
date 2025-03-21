;; rbit64.nasm

%ifndef RBIT64_INC
%define RBIT64_INC

%ifndef RBIT64_OPTIMIZATION
	%xdefine RBIT64_OPTIMIZATION balanced
%endif

%ifidni RBIT64_OPTIMIZATION, recurse
	%ifndef RBIT32_INC
		%xdefine RBIT32_OPTIMIZATION recurse
		%xdefine RBIT16_OPTIMIZATION recurse
		%xdefine RBIT8_OPTIMIZATION balanced

		%include "./rbit32.nasm"
	%endif

	; uint64_t rbit64(uint64_t x) {
	;     return rbit32(x) << 32 | rbit32(x >> 32);
	; }
	rbit64: ; rcx is the input.
		mov 	rax, rcx ; save the input value for later
		call 	rbit32   ; reverse the lower 16 bits

		shr 	rdx, 32  ; move the upper half of the input
		mov 	ecx, edx ; into the lower half of ecx

		mov 	edx, eax ; save the output of the previous call (reversed lower half)
		shl 	rdx, 32  ; into the upper half of dx

		call	rbit32  ; mov ax, reversed upper half of input

		or  	rax, rdx
		ret
%else
	segment rdata

	rbit64_8_table:
		db 0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0
		db 0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0
		db 0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8
		db 0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8
		db 0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4
		db 0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4
		db 0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec
		db 0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc
		db 0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2
		db 0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2
		db 0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea
		db 0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa
		db 0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6
		db 0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6
		db 0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee
		db 0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe
		db 0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1
		db 0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1
		db 0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9
		db 0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9
		db 0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5
		db 0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5
		db 0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed
		db 0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd
		db 0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3
		db 0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3
		db 0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb
		db 0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb
		db 0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7
		db 0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7
		db 0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef
		db 0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff

	segment text

	; reverse the byte order and reverse the bits in each byte.
	rbit64:
		mov 	r8 , rcx ; save the input value for later.
		xor 	eax, eax ; clear all the bits, so `al`  will be the only stuff used 
		xor 	r9 , r9  ; clear all the bits, so `r9b` will be the only stuff used 

		mov 	rcx, 7   ; one less than the number of iterations required.
	.loop:
		; in each iteration, reverse the LSB of r9, and transfer it from r8 to rdx.
		; then open the next slot of rdx, and move to the next slot of r8.

		; reverse the byte
		mov 	r9b, r8b
		mov		al, [rbit64_8_table + r9]

		; do the transferring
		or  	rdx, rax
		shl 	rdx, 8
		shr 	r8 , 8
		loop	.loop

		;; do the last iteration outside the loop, and don't do any shifts
		; r8 can safely be used here because there is only one byte left, and the rest are zeros
		mov		al, [rbit64_8_table + r8]

		or  	rax, rdx ; use rax as dst this time because it is the return register
		ret

	%if 0
	rbit64_unrolled:
		xor 	eax, eax
		xor 	r8 , r8
	%rep 7
		mov 	r8b, cl
		mov		al, [rbit8_table + r8]

		or  	rdx, rax
		shl 	rdx, 8
		shr 	rcx , 8
	%endrep
		mov		al, [rbit8_table + rcx]
		or  	rax, rdx
		ret
	%endif
%endif

%endif
