%ifndef ADLER32_COMBINE_NASM
%define ADLER32_COMBINE_NASM

%ifndef NO_ARG_C
%ifdifi
static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_fw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	// output values, but start out as a2 and b2
	uint32_t a = cksm2 & 0xffff;
	uint32_t b = cksm2 >> 16;

	// aout = a1 + a2 + BASE - 1
	// bout = b1 + b2 + len2*(a1 - 1) + BASE

	// the `+ 65521u`s are to counteract negatives. For example, if a = 0 and x1 > 0, then
	// (a + x1) % BASE will be the wrong value, and (a + x1 + BASE) % BASE is the real value.
	// e.g. 15 % 65521 = 15, but (15 + 2^64 - 65521) % 65521 = 50640.
	x1--;
	a  += x1 + 65521u;
	x1 *= len2;
	b  += x1;
	b  += x2 + 65521u;

	// intel syntax
	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

static inline __attribute__((always_inline)) // not actually void. eax = a, edx = b
void adler32_combine_bw(uint32_t _, uint32_t cksm2, uint64_t len2) {
	// x1 = a3, x2 = b3

	// start as a2 and b2
	uint32_t a = cksm2 & 0xffff;
	uint32_t b = cksm2 >> 16;

	// aout = (a3 - a2 + 1 + BASE) % BASE
	// bout = (b3 - b2 - len2*(a1 - 1) + BASE*BASE) % BASE

	uint32_t a1 = (a3 - a2 + 1 + BASE) % BASE;
	uint32_t b1 = (b3 - b2 - len2*(a1 - 1) + BASE*BASE) % BASE;

	// intel syntax
	asm volatile("mov eax, %0" : : "r" (a));
	asm volatile("mov edx, %0" : : "r" (b));
}

uint32_t adler32_combine(uint32_t cksm1, uint32_t cksm2, uint64_t len2, register uint8_t flags asm("r14b")) {
	uint32_t x1 = cksm1 & 0xffff;
	uint32_t x2 = cksm1 >> 16;

	len2 %= 65521u;

	// call them with no arguments to signify not changing any of the arguments.
	if ((flags & 4) == 0)
		adler32_combine_fw();
	else
		adler32_combine_bw();

	uint32_t a, b;

	asm volatile("mov %0, eax" : "=r" (a));
	asm volatile("mov %0, edx" : "=r" (b));

	a %= 65521u;
	b %= 65521u;

	return b << 16 | a;
}
%endif ; %ifdifi

adler32_combine: ; uint32_t adler32_combine(uint32_t cksm1 (or cksm3), uint32_t cksm2, uint64_t len2);
	;; NOTE: implicitly uses `r14` as a fourth argument for the program flags
	;;       except for in DLL mode, where it is a memory location
	;; len2 = r8
	;; temporary values, but start out as a1 and b1
	movzx	r9d, cx		; x2 = cksm1 & 0xffff // x1 = b1
	shr 	ecx, 16		;; move the upper half into cx
	movzx	ecx, cx		; x1 = cksm1 >> 16 // x2 = a1
	xchg	ecx, r9d	;; swap x1 and x2. x1 is used more often, so give it the shorter register opcode.

	;; NOTE: x1 (a1 or a3) = ecx
	;; NOTE: x2 (b1 or b3) = r9d

	mov 	r10d, edx	; preserve edx (cksm2)
	modbase_u64 r8		; len2 %= BASE;
	mov 	edx, r10d	; restore edx

%ifndef NO_DIRECTIONS
	;; if ((flags & (1 << 3)) == 0) // if (backwards_flag_bit == 0)
	;;     goto forwards;

	;; this makes the hot path (forwards) have one less jump instruction
	;; because of the branch fallthrough at the end.

%ifdef DLL
	bt  	dword [rel adler32_flags], DIR_BIT
	jc  	.backwards
%else
	test	r14b, DIR_BIT_VAL
	jnz 	.backwards
%endif ; %ifdef

	;; branch fallthrough
%endif ; %ifndef NO_DIRECTIONS
.forwards: ;; unused label. only for clarity
	;; input values
	movzx	eax, dx		; eax = a = cksm2 & 0xffff;
	shr 	edx, 16		; move cksm2 upper half into dx
	movzx	edx, dx		; edx = b = cksm2 >> 16;

	;; ecx = x1 (a1)
	;; r9d = x2 (b1)
	;; eax = a
	;; edx = b
	;; r8d = len2

	;; actual algorithm
	dec 	ecx							; x1--;
	lea 	eax, [eax + ecx + BASE]		; a += x1 + BASE;
	imul	ecx, r8d					; x1 *= len2; // very close to 32-bit overflow
	lea 	edx, [edx + r9d + BASE]		; b = x2 + BASE;
	add 	edx, ecx					; b += x1;

	;; r8d = a
	;; r9d = b
	;; eax = tmp a
	;; edx = tmp b

	mov 	r9d, edx	;; r9d = b
	mov 	ecx, eax	;; ecx = a

	modbase_u32 ecx
	modbase_u32 r9d

	mov 	eax, r9d	; retn_val = b;
	shl 	eax, 16		; retn_val <<= 16;
	or  	eax, ecx	; retn_val |= a;
	ret

%ifndef NO_DIRECTIONS
.backwards:
	;; input values
	movzx	r10d, dx	; a2 = cksm2 & 0xffff;
	shr 	edx, 16		;; move upper half into dx
	movzx	r11d, dx	; b2 = cksm2 >> 16;

	;; rcx = x1 (a3)
	;; r9  = x2 (b3)
	;; r10 = a2, then a1
	;; r11 = b2, then b1
	;; r8  = len2

	;; actual algorithm
	neg 	r10d							; a2 = -a2;
	lea 	r10d, [r10 + rcx + BASE + 1]	; a2 += x1 + BASE + 1; // use 64-bit inputs for shorter opcodes
	modbase_u32 r10d						; a2 %= BASE;

	;; NOTE: I honestly have no idea why it is + 2^32 - BASE*BASE rather than
	;;       + BASE*BASE - 2^32, but this passes the tests and the other way doesn't. :|
	lea 	ecx, [r10d - 1]					; x1 = a2 - 1;
	imul	ecx, r8d						; x1 *= len2;
	lea 	ecx, [rcx + r11 + 0x1dff1f]		; x1 += b2 + (1 << 32) - BASE*BASE
	sub 	r9d, ecx						; x2 -= x1;
	modbase_u32 r9d

	mov 	eax, r9d	; retn_val = x2;
	shl 	eax, 16		; retn_val <<= 16;
	or  	eax, r10d	; retn_val |= a2;
	ret
%endif ; %ifndef NO_DIRECTIONS
%endif ; %ifndef NO_ARG_C

%endif ;; ADLER32_COMBINE_NASM
