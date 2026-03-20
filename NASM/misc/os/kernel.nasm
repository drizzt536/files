%assign KERNEL_START 0x100000 ;; 1 MiB

;; TODO: use USB HID keyboard stuff instead of a legacy PS/2 controller keyboard

default abs
bits 64
org KERNEL_START

%include "io-ports.inc"

;; these segment offsets shouldn't change.
%assign GDT_NULL	0x00
%assign GDT_KCODE	0x08
%assign GDT_KDATA	0x10
%assign GDT_UCODE	0x18
%assign GDT_UDATA	0x20
%assign GDT_TSS		0x28

%assign PIC_ICW1_ICW4		0x01	;; Indicates that ICW4 will be present
%assign PIC_ICW1_CASCADE	0x02	;; cascade mode
%assign PIC_ICW1_INIT		0x10	;; initialization
%assign PIC_ICW4_8086		0x01	;; 8086/88 (MCS-80/85) mode
%assign PIC_OFFS_1			0x20	;; IDT vector offset for PIC1 (32-39, inclusive)
%assign PIC_OFFS_2			0x28	;; IDT vector offset for PIC2 (40-47, inclusive)
%assign PIC_EOI				0x20	;; end of interrupt signal for legacy 8259 PIC

%assign IA32_APIC_BASE_MSR	0x1B	;; APIC MSR ID
%assign IA32_APIC_ENABLE	1 << 11	;; 0x800
%assign IA32_X2APIC_ENABLE	1 << 10	;; 0x400
%assign IA32_X2APIC_EOI		0x80B	;; end of interrupt signal for modern x2APIC

%assign TERM_ROWS 25
%assign TERM_COLS 80
%assign TERM_SIZE TERM_ROWS * TERM_COLS

;; probably don't use these, but they are available for clarity.
%assign TERM_WIDTH  TERM_COLS
%assign TERM_HEIGHT TERM_ROWS

%if TERM_SIZE % 4 != 0
	%fatal terminal size is assumed to be divisible by 4. (value = TERM_SIZE)
%endif

;; NOTE: since this gets loaded to 1 MiB, absolute addresses can use 32-bit registers for efficiency.

;; NOTE: the colors were determined experimentally rather than from documentation.
%assign VGA_BLACK		0x0
%assign VGA_DRK_BLUE	0x1
%assign VGA_GREEN		0x2
%assign VGA_TEAL		0x3
%assign VGA_RED			0x4
%assign VGA_DRK_PINK	0x5 ;; bad name? is this magenta or something?
%assign VGA_ORANGE		0x6
%assign VGA_LGT_GRAY	0x7
%assign VGA_DRK_GRAY	0x8
%assign VGA_PURPLE		0x9
%assign VGA_LGT_GREEN	0xA
%assign VGA_CYAN		0xB
%assign VGA_LGT_RED		0xC
%assign VGA_PINK		0xD
%assign VGA_YELLOW		0xE
%assign VGA_WHITE		0xF
%define VGA_CLR(fgclr, bgclr) %hex((fgclr) | (bgclr) << 4)
%assign VGA_DEFAULT		VGA_CLR(VGA_DRK_GRAY, VGA_BLACK)
%assign VGA_BUF			0xb8000
%assign VGA_BUF_END		VGA_BUF + 2*TERM_SIZE
%define VGA_LOC(row, col) %hex(VGA_BUF + (TERM_COLS*(row) + (col)) % TERM_SIZE * 2)

%assign KRN_STACK_SIZE	65536

%macro io_wait 0
	;; basically just kill a little bit of time so other `out` commands can finish.
	;; the value doesn't matter so just use whatever is already in al.
	out 	IOPT_POST, al
%endm

%macro wait_mac 2
	;; wait_mac clobber, cycles
	mov 	%1, %2
%%loop:
	%if %isidn(%1,ecx) || %isidn(%1,rcx)
		loop	%%loop
	%else
		dec 	%1
		test 	%1, %1
		jnz 	%%loop
	%endif
%endm

%macro timewait_mac8 1
	;; clobbers al
	;; the argument is the number of ticks before reset
%%loop:
	mov 	al, byte [rel isr_timer]
	cmp 	al, %1	;; isr timer wrap value. probablly will be imm8
	jb  	%%loop

	mov 	dword [rel isr_timer], 0
%endm

%macro get_isr_timer8_mod 1
	;; clobbers ax and bx
	xor 	bl, bl
	mov 	al, byte [rel isr_timer]
	cmp 	al, %1	;; isr timer wrap value. probablly will be imm8
	cmovae 	ax, bx
	mov 	byte [rel isr_timer], al	;; write back in case it was zeroed
%endm

%macro _putchar_0_0_colored 1
	mov		[rel VGA_BUF], %1	;; VGA text buffer
%endm

%macro _putchar_colored 3
	;; _putchar_colored row, col, val
	mov		[rel VGA_LOC(%1, %2)], %3	;; VGA text buffer
%endm

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; start of non-preproc code ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

%include "stdlib-fn-table.nasm"
%include "idt.nasm"		;; IDT declaration
%include "stdlib.nasm"	;; stdlib imports

;; process keys until the ISR timer gets to or above the wrap value
proc_keys_until_timeout:
.loop:
	get_isr_timer8_mod 18
	jae 	.ret

	call	next_scancode
	jz  	.loop

	test 	al, 1 << 7	;; skip the release values
	jnz 	.loop

	cmp 	al, 0x29		;; backtick
	je  	.toggle_cursor

	cmp 	al, 0x01		;; escape
	je  	.reset_cursor

	cmp 	al, 0x59
	je  	.arrow_up

	cmp 	al, 0x5A
	je  	.arrow_right

	cmp 	al, 0x5B
	je  	.arrow_down

	cmp 	al, 0x5C
	je  	.arrow_left

.log_scancode:
	mov 	ah, VGA_DEFAULT
	call	print_u8hex
	jmp 	.loop
.toggle_cursor:
	call	toggle_cursor
	jmp 	.loop
.reset_cursor:
	xor 	ax, ax
	call	move_cursor
	jmp 	.loop
.arrow_up:
	mov 	ax, -80
	call	add_cursor
	jmp 	.loop
.arrow_right:
	call	inc_cursor
	jmp 	.loop
.arrow_down:
	mov 	ax, 80
	call	add_cursor
	jmp 	.loop
.arrow_left:
	mov 	ax, -1
	call	add_cursor
	jmp 	.loop
.ret:
	ret

kernel_entry:
	;; put the stack in the 64 KiB after the kernel
	mov 	esp, kernel_end + KRN_STACK_SIZE

	;; remove kernel_entry from the function table because it is no longer needed.
	xor 	eax, eax
	mov 	qword [KERNEL_START], rax

	;; remap PIC1 from 08h-0fh to 20h-27h and PIC2 from 70h-77h to 28h-2fh
	mov 	al, PIC_ICW1_INIT | PIC_ICW1_ICW4	; 0x11
	out 	IOPT_PIC1, al		;; starts the initialization sequence (in cascade mode)
	io_wait

	mov 	al, PIC_ICW1_INIT | PIC_ICW1_ICW4	; 0x11
	out 	IOPT_PIC2, al
	io_wait

	mov 	al, PIC_OFFS_1
	out 	IOPT_PIC1_D, al		;; ICW2: master PIC IDT vector offset
	io_wait

	mov 	al, PIC_OFFS_2
	out 	IOPT_PIC2_D, al		;; ICW2: slave PIC IDT vector offset
	io_wait

	mov 	al, 0000_0100b
	out 	IOPT_PIC1_D, al		;; ICW3: tell the master PIC that there is a slave PIC at IRQ2 (0000 0100)
	io_wait

	mov 	al, PIC_ICW1_CASCADE
	out 	IOPT_PIC2_D, al		;; ICW3: tell the slave PIC its cascade identity (0000 0010)
	io_wait

	mov 	al, PIC_ICW4_8086	
	out 	IOPT_PIC1_D, al		;; ICW4: have the PICs use 8086 mode (and not 8080 mode)
	io_wait

	mov 	al, PIC_ICW4_8086
	out 	IOPT_PIC2_D, al
	io_wait

%if 1
	;; unmask all the IRQs
	;; NOTE: if using `-d int -D qemu.log`, probably mask PIC1[0] (the timer bit)
	xor 	al, al
	out 	IOPT_PIC1_D, al
	out 	IOPT_PIC2_D, al
%else
	;; disable 8259 PIC chip
	mov 	al, 0xff
	out 	IOPT_PIC1_D, al
	out 	IOPT_PIC2_D, al

	;; enable APIC and X2APIC. APIC should already be enabled.
	mov 	ecx, IA32_APIC_BASE_MSR
	rdmsr

	or  	eax, IA32_APIC_ENABLE | IA32_X2APIC_ENABLE
	wrmsr

	;; set bit 8 of the spurious interrupt vector register
	mov 	ecx, 0x80F
	rdmsr
	or  	eax, 1 << 8
	wrmsr

	;; TODO: enable I/O APIC

	;; NOTE: APIC is available since X2APIC availability was checked before boot
%endif

	lidt	[idt.ptr]
	sti 	;; enable interrupts.
.start:

%xdefine MSG "The Low Taper Fade Meme is **MASSIVE**! " ;; 40 characters long
	; call	hide_cursor

.mainloop:
	mov 	esi, VGA_BUF
	mov 	ah, VGA_CLR(VGA_LGT_RED, VGA_PURPLE)
.fill_screen_1:
	mov 	ecx, %strlen(MSG)
.print_msg_1:
	dec 	ecx
	mov 	al, byte [msg + ecx]
	mov 	word [esi + 2*ecx], ax
	test 	ecx, ecx
	jnz 	.print_msg_1

	add 	esi, TERM_COLS
	cmp 	esi, VGA_BUF_END
	jb  	.fill_screen_1

	call	proc_keys_until_timeout

	;; print the same thing again but in different colors
	mov 	esi, VGA_BUF
	mov 	ah, VGA_CLR(VGA_CYAN, VGA_DRK_BLUE)
.fill_screen_2:
	mov 	ecx, %strlen(MSG)
.print_msg_2:
	dec 	ecx
	mov 	al, byte [msg + ecx]
	mov 	word [esi + 2*ecx], ax
	test 	ecx, ecx
	jnz 	.print_msg_2

	add 	esi, TERM_COLS
	cmp 	esi, VGA_BUF_END
	jb  	.fill_screen_2

	call	proc_keys_until_timeout
	jmp 	.mainloop

msg: db MSG

align 512	;; align to sector boundary
kernel_end:
kernel_size: equ $ - $$
