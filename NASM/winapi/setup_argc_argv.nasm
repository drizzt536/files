; provides two functions: `wstr_to_str_inplace_macro` and `setup_argc_argv`
; requirements for code outside of this:
;     - linking with kernel32 and shell32
;     - extern GetCommandLineW, CommandLineToArgvW
;     - segment text (or similar)
;
; NOTE: setup_argc_argv sets up the shadow space itself, and does not assume the caller does it.


%ifndef SETUP_ARGC_ARGV_INC
%define SETUP_ARGC_ARGV_INC

; approximate C implementation
%if 0
typedef union {
	wchar_t *wc;
	char *c;
} wstr_str;

// updates the string inline to be a normal string.
static inline __attribute__((always_inline)) void wstr_to_str_inplace_macro(wchar_t *wstr) {
	wstr_str str = (wstr_str) { .wc = wstr }; // implicit in the assembly, no extra memory
	int i;

	for (i = 0; str.wc[i] != L'\0'; i++) {
		// this part could probably be slightly more efficient
		if (str.wc[i] > 255)
			str.wc[i] = 63; // '?'

		str.c[i] = str.wc[i] & 255;
	}

	str.c[i] = '\0';
	return;
}

// returns argc and argv through rdi and rsi, ignoring the ABI stuff.
void setup_argc_argv(void) {
	// pretend the compiler won't restore these two values after the function ends.
	register int argc asm("rdi");
	register wchar_t **argv asm("rsi") = CommandLineToArgvW(GetCommandLineW(), &argc);

	for (int i = 0; i < argc; i++)
		wstr_to_str_inplace_macro(argv[i]);
}
%endif

%macro wstr_to_str_inplace_macro 0
	; wstr_to_str: rcx as the argument, returns nothing
	wstr_to_str_inplace_macro rcx
%endm
	
%macro wstr_to_str_inplace_macro 1
	; wstr_to_str: returns nothing. the argument must be usable as a base register
	xor 	r8, r8
%%loop:
	mov 	ax, [%1 + 2*r8]

	test	ax, ax
	jz  	%%done	; null character

	test	ah, ah	; test if the upper byte is 0
	jz  	%%ascii
	mov 	al, '?'	; default to a question mark for non-ascii characters.
%%ascii:
	mov 	[%1 + r8], al
	inc 	r8
	jmp 	%%loop
%%done:
	mov 	byte [%1 + r8], 0
%endm

%if 0
win_wstr_to_str_inplace:
	xor 	r8, r8
.loop:
	mov 	ax, word [rcx + 2*r8]

	test	ax, ax
	jz  	.done	; null character

	test	ah, ah	; test if the upper byte is 0
	jz  	.ascii
	mov 	al, '?'	; default to a question mark for non-ascii characters.
.ascii:
	mov 	[rcx + r8], al
	inc 	r8
	jmp 	.loop
.done:
	mov 	byte [rcx + r8], `\0` ; set the ending null byte
	ret
%endif

%ifndef SETUP_ARGC_ARGV_MACRO_ONLY
setup_argc_argv:
	; moves argc into edi and argv into rsi.
	; ignores the ABI convention of rdi and rsi being non-volatile. 
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 48 ; 32-bit shadow space + 4-byte integer. 32 seems to work though too.

	call	GetCommandLineW

	mov 	rcx, rax
	lea 	rdx, [rsp + 44]
	call	CommandLineToArgvW

	mov 	edi, [rsp + 44]	; rdi = argc
	mov 	rsi, rax		; rsi = argv

	xor 	r9, r9			; int i = 0;
.loop:
	mov 	rcx, [rsi + 8*r9] ; rcx = argv[i]
	wstr_to_str_inplace_macro rcx
;	call	win_wstr_to_str_inplace

	inc 	r9
	cmp 	r9, rdi
	jl  	.loop

	leave
	ret
%endif ; %ifndef SETUP_ARGC_ARGV_MACRO_ONLY

%macro setup_argc_argv_macro 0
	; moves argc into edi and argv into rsi.

	;; assumes you have already done `sub rsp, 56` (or more)
	;; 32 for the shadow space, then 4 for the dword stack variable,
	;; and then 12 to align it to 16 bytes, and then 8 more to counteract the return address's 8 bytes
	call	GetCommandLineW

	mov 	rcx, rax
	lea 	rdx, [rsp + 32]
	call	CommandLineToArgvW

	mov 	edi, [rsp + 32]	; rdi = argc
	mov 	rsi, rax		; rsi = argv

	xor 	r9, r9			; int i = 0;
%%loop:
	mov 	rcx, [rsi + 8*r9] ; rcx = argv[i]
	wstr_to_str_inplace_macro rcx

	inc 	r9
	cmp 	r9, rdi
	jl  	%%loop
%endm
%endif ; %ifndef SETUP_ARGC_ARGV_INC
