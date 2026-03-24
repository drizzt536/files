%ifndef JTEST_INC
%define JTEST_INC

%macro jtest 4
	;; e.g. jtest eax, ebx, lt, .exit for a test and jlt
	test	%1, %2
	j%3 	%4
%endm

%macro jtz 3
	jtest	%1, %2, z, %3
%endm

%macro jte 3
	jtest	%1, %2, e, %3
%endm

%macro jtnz 3
	jtest	%1, %2, nz, %3
%endm

%macro jtne 3
	jtest	%1, %2, ne, %3
%endm

%macro jts 3
	jtest	%1, %2, s, %3
%endm

%macro jtns 3
	jtest	%1, %2, ns, %3
%endm

%macro jtc 3
	jtest	%1, %2, c, %3
%endm

%macro jtnc 3
	jtest	%1, %2, nc, %3
%endm

%macro jto 3
	jtest	%1, %2, o, %3
%endm

%macro jtno 3
	jtest	%1, %2, no, %3
%endm

%macro jtp 3
	jtest	%1, %2, p, %3
%endm

%macro jtpe 3
	jtest	%1, %2, pe, %3
%endm

%macro jtnp 3
	jtest	%1, %2, np, %3
%endm

%macro jtpo 3
	jtest	%1, %2, po, %3
%endm

%macro jtb 3
	jtest	%1, %2, b, %3
%endm

%macro jtnae 3
	jtest	%1, %2, nae, %3
%endm

%macro jtnb 3
	jtest	%1, %2, nb, %3
%endm

%macro jtae 3
	jtest	%1, %2, ae, %3
%endm

%macro jtbe 3
	jtest	%1, %2, be, %3
%endm

%macro jtna 3
	jtest	%1, %2, na, %3
%endm

%macro jta 3
	jtest	%1, %2, a, %3
%endm

%macro jtnbe 3
	jtest	%1, %2, nbe, %3
%endm

%macro jtl 3
	jtest	%1, %2, l, %3
%endm

%macro jtnge 3
	jtest	%1, %2, nge, %3
%endm

%macro jtnl 3
	jtest	%1, %2, nl, %3
%endm

%macro jtge 3
	jtest	%1, %2, ge, %3
%endm

%macro jtle 3
	jtest	%1, %2, le, %3
%endm

%macro jtng 3
	jtest	%1, %2, ng, %3
%endm

%macro jtg 3
	jtest	%1, %2, g, %3
%endm

%macro jtnle 3
	jtest	%1, %2, nle, %3
%endm

%endif ; %ifndef JTEST_INC
