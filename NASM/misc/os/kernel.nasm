default abs
bits 64

;; TODO: use USB HID keyboard stuff instead of a legacy PS/2 controller keyboard

%include "kernel.inc"
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

	jtnz	al, 1 << 7, .loop		;; skip the release scancodes
	jce 	al, 29h, .toggle_cursor	;; backtick
	jce 	al, 01h, .reset_cursor	;; escape
	jce 	al, 59h, .arrow_up
	jce 	al, 5Ah, .arrow_right
	jce 	al, 5Bh, .arrow_down
	jce 	al, 5Ch, .arrow_left
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

	;; TODO: put more page tables at 0x7E00-0x9FFF
	;; TODO: after that, put more page tables somewhere else.
	;;       I need to get up to like 4 GiB so I can use x2APIC

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
	;; disable 8259 PIC chip. (mask all the ISRs)
	mov 	al, 0xFF
	out 	IOPT_PIC1_D, al
	out 	IOPT_PIC2_D, al

	;; NOTE: APIC is available since X2APIC availability was checked before boot

	;; enable APIC and x2APIC. APIC should already be enabled.
	mov 	ecx, APIC_BASE_MSR
	rdmsr

	or  	eax, APIC_ENABLE | X2APIC_ENABLE
	wrmsr

	;; APIC enable and spurious interrupt vector
	mov 	ecx, X2APIC_SVR
	rdmsr
	or  	eax, 1 << 8 | APIC_SPURIOUS_ISR
	wrmsr

	;; set task priority to 0
	mov 	ecx, X2APIC_TPR
	xor 	eax, eax
	xor 	edx, edx
	wrmsr

	;; TODO: figure out the address dynamically instead of using a hard-coded one.
	mov dword [IOAPIC_BASE], 0x13			;; register 0x13
	mov dword [IOAPIC_BASE + 0x10], 0		;; CPU 0

	mov dword [IOAPIC_BASE], 0x12			;; register 0x12
	mov dword [IOAPIC_BASE + 0x10], 0x21	;; vector 0x21, unmasked

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
	jtnz	ecx, ecx, .print_msg_1

	add 	esi, TERM_COLS
	jcb 	esi, VGA_BUF_END, .fill_screen_1

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
	jtnz	ecx, ecx, .print_msg_2

	add 	esi, TERM_COLS
	jcb 	esi, VGA_BUF_END, .fill_screen_2

	call	proc_keys_until_timeout
	jmp 	.mainloop

msg: db MSG

align 512	;; align to sector boundary
kernel_end:
kernel_size: equ $ - $$
