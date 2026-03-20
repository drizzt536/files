;; this assumes the bootloader at ./os/boot.nasm as of commit f30c6a34c8d06f054450406083ce2331f77f8ed2

bits 64
org 0x100000 ; 1 MiB

%macro wait_mac 1
	mov 	ecx, 1 << %1
%%loop:
	loop	%%loop
%endm

dq kernel_entry ; for `jmp qword [0x100000]` in the bootloader.

fill_screen: ; takes the argument in al. clobbers rbx, rcx, and rdi
	mov 	ah, 08h
	cld
	mov 	bx, ax
	shl 	eax, 16
	mov 	ax, bx
	mov 	ebx, eax
	shl 	rax, 32
	or  	rax, rbx
	mov 	ecx, 500
	mov 	edi, 0xb8000
	rep 	stosq
	ret

kernel_entry:
	mov 	dx, 03D4h	; VGA control port
	mov 	al, 0Ah		; Cursor start register
	out 	dx, al

	inc 	dl			; 0x3D5 is data port. `inc dx` isn't required because there is no overflow.
	mov 	al, 1 << 5	; Set bit 5 to disable the cursor
	out 	dx, al
.start:
	mov 	al, '@'
	call	fill_screen

	wait_mac 29

	mov 	esi, 0xb8000
	mov 	ah, 1Bh

.main_loop:
	wait_mac 26

	mov 	ecx, 40
.loop2:
	dec 	ecx
	mov 	al, byte [msg + ecx]
	mov 	word [esi + 2*ecx], ax
	test 	ecx, ecx
	jnz 	.loop2

	add 	esi, 80
	cmp 	esi, 0xb8fa0
	jb  	.main_loop

	wait_mac 29

	jmp 	.start

msg: db "The Low Taper Fade Meme is **MASSIVE**! "

align 512
