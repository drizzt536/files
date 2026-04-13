%ifndef REG.INC
%define REG.INC

;; NOTE: for 0-7, these are not the actual encoding order. But mostly I don't care.
;;       also, the q suffix ones don't actually exist outside of this.

%idefine r0		rax
%idefine r1		rbx
%idefine r2		rcx
%idefine r3		rdx
%idefine r4		rdi
%idefine r5		rsi
%idefine r6		rsp
%idefine r7		rbp

%idefine r0q	r0
%idefine r1q	r1
%idefine r2q	r2
%idefine r3q	r3
%idefine r4q	r4
%idefine r5q	r5
%idefine r6q	r6
%idefine r7q	r7

%idefine r0d	eax
%idefine r1d	ebx
%idefine r2d	ecx
%idefine r3d	edx
%idefine r4d	edi
%idefine r5d	esi
%idefine r6d	esp
%idefine r7d	ebp

%idefine r0w	ax
%idefine r1w	bx
%idefine r2w	cx
%idefine r3w	dx
%idefine r4w	di
%idefine r5w	si
%idefine r6w	sp
%idefine r7w	bp

%idefine r0b	al
%idefine r1b	bl
%idefine r2b	cl
%idefine r3b	dl
%idefine r4b	dil
%idefine r5b	sil
%idefine r6b	spl
%idefine r7b	bpl

%idefine r0h	ah
%idefine r1h	bh
%idefine r2h	ch
%idefine r3h	dh

%idefine r0q	r0
%idefine r1q	r1
%idefine r2q	r2
%idefine r3q	r3
%idefine r4q	r4
%idefine r5q	r5
%idefine r6q	r6
%idefine r7q	r7
%idefine r8q	r8
%idefine r9q	r9
%idefine r10q	r10
%idefine r11q	r11
%idefine r12q	r12
%idefine r13q	r13
%idefine r14q	r14
%idefine r15q	r15
%idefine r16q	r16
%idefine r17q	r17
%idefine r18q	r18
%idefine r19q	r19
%idefine r20q	r20
%idefine r21q	r21
%idefine r22q	r22
%idefine r23q	r23
%idefine r24q	r24
%idefine r25q	r25
%idefine r26q	r26
%idefine r27q	r27
%idefine r28q	r28
%idefine r29q	r29
%idefine r30q	r30
%idefine r31q	r31

%endif ; %ifndef REG.INC
