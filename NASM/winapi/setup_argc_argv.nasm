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
%ifdifi
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
		if (str.wc[i] > UINT8_MAX)
			str.wc[i] = '?';

		str.c[i] = str.wc[i];
	}

	str.c[i] = '\0';
	return;
}

// returns argc and argv through rdi and rsi, ignoring the ABI stuff.
void setup_argc_argv(void) {
	// pretend the compiler won't restore these two values after the function ends.
	register int argc asm("edi");
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
	xor 	r8d, r8d
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
	wstr_to_str_inplace_macro rcx
	ret
%endif

%macro setup_argc_argv_macro 0
	; moves argc into edi and argv into rsi.
	;; assumes you have already done `sub rsp, 48` (or more)

	call	GetCommandLineW

	mov 	rcx, rax
	lea 	rdx, [rsp + 32]
	call	CommandLineToArgvW

	mov 	edi, dword [rsp + 32]	; rdi = argc
	mov 	rsi, rax				; rsi = argv

	xor 	r9d, r9d				; int i = 0;
%%loop:
	mov 	rcx, qword [rsi + 8*r9]	; rcx = argv[i]
	wstr_to_str_inplace_macro rcx

	inc 	r9d
	cmp 	r9d, edi
	jb  	%%loop
%endm

%ifndef SETUP_ARGC_ARGV_MACRO_ONLY
setup_argc_argv:
	; moves argc into edi and argv into rsi.
	; ignores the ABI convention of rdi and rsi being non-volatile.

	;; 48 comes from 32 for the shadow space, then 4 for the dword stack
	;; variable, then 12 more to align to the next 16-byte boundary.
	;; the `push rbp` counteracts the return address.
	;; `sub rsp, 32` seems to also work, which indicates that none of the sub functions
	;; actually use the shadow space. except for 16 doesn't work.
	push	rbp
	mov 	rbp, rsp
	sub 	rsp, 48 ; 32-bit shadow space + 4-byte integer.

	setup_argc_argv_macro

	leave
	ret
%endif ; %ifndef SETUP_ARGC_ARGV_MACRO_ONLY
%endif ; %ifndef SETUP_ARGC_ARGV_INC
