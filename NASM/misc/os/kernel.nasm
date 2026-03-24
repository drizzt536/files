default abs
bits 64

;; TODO: use USB HID keyboard stuff instead of a legacy PS/2 keyboard

%include "kernel.inc"
%include "stdlib-fn-table.nasm"
%include "idt.nasm"		;; IDT declaration
%include "stdlib.nasm"	;; stdlib imports

tss:
	dd	0			;; 0x00: reserved
	dq	stack_base	;; 0x04: RSP0
	dq	0			;; 0x0C: RSP1. unused
	dq	0			;; 0x14: RSP2. unused
	dq	0			;; 0x1C: reserved
	dq	IST1_BASE	;; 0x24: IST1.
	dq	0			;; 0x2C: IST2. unused
	dq	0			;; 0x34: IST3. unused
	dq	0			;; 0x3C: IST4. unused
	dq	0			;; 0x44: IST5. unused
	dq	0			;; 0x4C: IST6. unused
	dq	0			;; 0x54: IST7. unused
	dq	0			;; 0x5C: reserved
	dw	0			;; 0x64: reserved
	dw	TSS_SIZE	;; 0x66: IOPM offset. set to outside the TSS so all ports are restricted

;; process keys until the ISR timer gets to or above the wrap value
proc_keys_until_timeout:
.loop:
	get_isr_timer8_mod 19
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
	jce 	al, 3Bh, .f1
	jce 	al, 3Ch, .f2
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
.f1:
	;; kernel panic: stack overflow
	mov 	al, byte [stack_guard_page]
.f2:
	;; kernel panic: unmapped page
	mov 	al, byte [-1]
.ret:
	ret

%xdefine MSG "The Low Taper Fade Meme is **MASSIVE**! " ;; 40 characters long

kernel_entry:
	;; put the stack in the 64 KiB after the kernel
	mov 	esp, stack_base

	;; remove kernel_entry from the function table because it is no longer needed.
	mov 	qword [KERNEL_START], 0

	mov 	rax, cr4
	bts 	eax, 18		;; set the OSXSAVE bit for AVX to work.
	mov 	cr4, rax

	;; turn on AVX and AVX2
	xor 	ecx, ecx
	xgetbv				;; XCR0
	or  	al, 111b	;; AVX, SSE, x87 bits
	xsetbv				;; Save back to XCR0

	;; set PD0 entries 3 through 123 at 0x7000-0x7FFFF
	mov 	edi, PT_PD0_BASE + PT_BOOT_PAGES*8	;; start at the first nonexistent entry
	mov 	esi, PT_PT0_BASE + PT_BOOT_PAGES*4096 + 0x3
	mov 	ecx, PT_KRNL_PAGES
.set_pd_entry:
	mov 	dword [edi], esi	;; PD[i] points to PT at 0x4000 + 1000h*i
	add 	esi, 1000h			;; next PT is 4KiB further in memory
	add 	edi, 8				;; next PD entry
	loop	.set_pd_entry

	mov 	edi, PT_PT0_BASE + 1000h*PT_BOOT_PAGES
	mov 	ebx, PT_KRNL_PAGE_OFS + 0x3	;; present and read/write bit
	mov 	ecx, 512*PT_KRNL_PAGES		;; number of entries in the page table
.set_pt_entry:
	mov 	dword [edi], ebx
	add 	ebx, 1000h
	add 	edi, 8
	loop	.set_pt_entry		;; set the next entry

	mov 	eax, stack_guard_page
	shr 	eax, 12
	and 	byte [PT_PT0_BASE + rax*8], ~1
	invlpg	[stack_guard_page]	;; invalidate the single page in the TLB
.stdlib_avail:
	;; NOTE: calling stdlib functions before this point is not defined
	;;       since paging and AVX isn't fully set up before this.
	call	cls				;; set to the default colors

	;; set up the TSS memory section
	mov 	eax, TSS_BASE	;; dst = TSS_BASE
	mov 	rbx, tss		;; src = tss
	mov 	ecx, TSS_SIZE	;; cnt = TSS_SIZE
	call	memcpy

	;; load the TSS section
	mov 	ax, GDT_TSS
	ltr 	ax

	;; set up the PIT timer.
	outb	IOPT_PIT, 0x36					;; channel 0, lobyte/hibyte, mode 3
	outb 	IOPT_PIT_D1, PIT_DIVISOR & 0xFF	;; low byte
	outb	IOPT_PIT_D1, PIT_DIVISOR >> 8	;; high byte

	;; remap PIC1 from 08h-0fh to 20h-27h and PIC2 from 70h-77h to 28h-2fh
	;; 0x11. starts the initialization sequence (in cascade mode)
	outb	IOPT_PIC1, PIC_ICW1_INIT | PIC_ICW1_ICW4
	io_wait

	outb	IOPT_PIC2, PIC_ICW1_INIT | PIC_ICW1_ICW4
	io_wait

	outb	IOPT_PIC1_D, PIC_OFFS_1			;; ICW2: master PIC IDT vector offset
	io_wait

	outb	IOPT_PIC2_D, PIC_OFFS_2			;; ICW2: slave PIC IDT vector offset
	io_wait

	outb	IOPT_PIC1_D, 0000_0100b			;; ICW3: tell the master PIC the slave PIC is at IRQ2
	io_wait

	outb	IOPT_PIC2_D, PIC_ICW1_CASCADE	;; ICW3: tell the slave PIC its cascade identity
	io_wait

	outb	IOPT_PIC1_D, PIC_ICW4_8086		;; ICW4: have the PICs use 8086 mode (and not 8080 mode)
	io_wait

	outb	IOPT_PIC2_D, PIC_ICW4_8086
	io_wait

	;; disable 8259 PIC. (mask all the IRQs)
	outb	IOPT_PIC1_D, 0xFF
	outb	IOPT_PIC2_D, al

	;; setup the page tables required for 0xFEC00000
	;; PML4[0], PDPT[3], PD[502], PT[0]
	;; 2 pages need to be generated, a new PD and a new PT.
	cld
	mov 	edi, esp	;; just put these right after the stack
	mov 	ecx, 512 * 2
	xor 	eax, eax
	rep 	stosq

	mov 	edi, QEMU_IOAPIC_BASE + 13h
	mov 	dword [PT_PDPT0_BASE + 8*  3], stack_base         + 03h	;; PDPT[3] = PD
	mov 	dword [stack_base    + 8*502], stack_base + 1000h + 03h	;; PD[502] = PT
	mov 	dword [stack_base    + 1000h], edi						;; PT[0] = page

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

	mov 	edi, QEMU_IOAPIC_BASE

	;; TODO: figure out the address dynamically instead of using a hard-coded one.
	;;       same thing for the pin numbers. this has something to do with the MADT
	;;       idk what that is though.

	;; IRQ0
	mov 	dword [rdi + 0x00], 0x10 + 2*APIC_IRQ0_PIN
	mov 	dword [rdi + 0x10], 0x20					;; vector 0x20
	mov 	dword [rdi + 0x00], 0x10 + 2*APIC_IRQ0_PIN + 1
	mov 	dword [rdi + 0x10], 0x00					;; CPU core 0

	;; IRQ1
	mov 	dword [rdi + 0x00], 0x10 + 2*APIC_IRQ1_PIN
	mov 	dword [rdi + 0x10], 0x21					;; vector 0x21
	mov 	dword [rdi + 0x00], 0x10 + 2*APIC_IRQ1_PIN + 1
	mov 	dword [rdi + 0x10], 0x00					;; CPU core 0

	lidt	[idt.ptr]
	sti 	;; enable interrupts.

	;; TODO: select the master on the primary disk
	;;       it should already be set to that, but do it anyway.
.start:
	sub 	esp, 512	;; allocate space for the sectors to be read into.
	xor 	r8d, r8d	;; sector_idx = 0;
	call	hide_cursor
.loop@sectors:
	lea 	eax, [r8d + KERNEL_DISK_SECT]
	mov 	bx, 1
	mov		ecx, esp
	call	disk_read

	cld
	mov 	esi, esp	;; src = stack pointer
	mov 	ebp, 512	;; ebp = index (iterate backwards.)
.loop@words:
	lodsb	;; al = *src++

	mov 	ah, VGA_DEFAULT
	call	print_u8hex

	dec 	ebp
	jnz 	.loop@words

	wait_mac	ecx, 1 << 28

	xor 	eax, eax
	call	move_cursor

	inc 	r8b
	cmp 	r8b, kernel_size/512 + 1	;; read up until one sector after the kernel ends.
	jne 	.loop@sectors

	mov 	byte [VGA_LOC(24, 76)], 'D'
	mov 	byte [VGA_LOC(24, 77)], 'O'
	mov 	byte [VGA_LOC(24, 78)], 'N'
	mov 	byte [VGA_LOC(24, 79)], 'E'

	wait_mac	ecx, 1 << 30

	mov 	al, CURSOR_UNDERLINE
	call	show_cursor
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
