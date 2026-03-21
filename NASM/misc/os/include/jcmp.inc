%ifndef JCMP_INC
%define JCMP_INC

%macro jcmp 4
	;; e.g. jcmp eax, ebx, lt, .exit for a compare and jlt
	cmp 	%1, %2
	j%3 	%4
%endm

%macro jcz 3
	jcmp	%1, %2, z, %3
%endm

%macro jce 3
	jcmp	%1, %2, e, %3
%endm

%macro jcnz 3
	jcmp	%1, %2, nz, %3
%endm

%macro jcne 3
	jcmp	%1, %2, ne, %3
%endm

%macro jcs 3
	jcmp	%1, %2, s, %3
%endm

%macro jcns 3
	jcmp	%1, %2, ns, %3
%endm

%macro jcc 3
	jcmp	%1, %2, c, %3
%endm

%macro jcnc 3
	jcmp	%1, %2, nc, %3
%endm

%macro jco 3
	jcmp	%1, %2, o, %3
%endm

%macro jcno 3
	jcmp	%1, %2, no, %3
%endm

%macro jcp 3
	jcmp	%1, %2, p, %3
%endm

%macro jcpe 3
	jcmp	%1, %2, pe, %3
%endm

%macro jcnp 3
	jcmp	%1, %2, np, %3
%endm

%macro jcpo 3
	jcmp	%1, %2, po, %3
%endm

%macro jcb 3
	jcmp	%1, %2, b, %3
%endm

%macro jcnae 3
	jcmp	%1, %2, nae, %3
%endm

%macro jcnb 3
	jcmp	%1, %2, nb, %3
%endm

%macro jcae 3
	jcmp	%1, %2, ae, %3
%endm

%macro jcbe 3
	jcmp	%1, %2, be, %3
%endm

%macro jcna 3
	jcmp	%1, %2, na, %3
%endm

%macro jca 3
	jcmp	%1, %2, a, %3
%endm

%macro jcnbe 3
	jcmp	%1, %2, nbe, %3
%endm

%macro jcl 3
	jcmp	%1, %2, l, %3
%endm

%macro jcnge 3
	jcmp	%1, %2, nge, %3
%endm

%macro jcnl 3
	jcmp	%1, %2, nl, %3
%endm

%macro jcge 3
	jcmp	%1, %2, ge, %3
%endm

%macro jcle 3
	jcmp	%1, %2, le, %3
%endm

%macro jcng 3
	jcmp	%1, %2, ng, %3
%endm

%macro jcg 3
	jcmp	%1, %2, g, %3
%endm

%macro jcnle 3
	jcmp	%1, %2, nle, %3
%endm

%endif ; %ifndef JCMP_INC
