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

	call	get_scancode
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

	mov 	al, CURS_UNDERLINE
	call	set_cursor

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
	;;       same thing for the pin numbers. this has something to do with the MADT
	;;       idk what that is though.
	;; check 0x40e0-0x44df and 0xE0000-0xFFFFF for the other thing
	;; then parse, looking for "RSP PTR " on 16-byte boundaries, then parse that
	;; structure for the MADT, and then parse the MADT for the APIC base address.

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

	sub 	edi, 13h

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

	mov 	dword [VGA_LOC(24, 65)], DVGA_DWORD('RE')
	mov 	dword [VGA_LOC(24, 67)], DVGA_DWORD('AD')
	mov 	dword [VGA_LOC(24, 69)], DVGA_DWORD('IN')
	mov 	dword [VGA_LOC(24, 71)], DVGA_DWORD('G ')
	mov 	dword [VGA_LOC(24, 73)], DVGA_DWORD('SE')
	mov 	dword [VGA_LOC(24, 75)], DVGA_DWORD('CT')
	mov 	byte  [VGA_LOC(24, 77)], 'O'
	mov 	dword [VGA_LOC(24, 78)], DVGA_DWORD('RS')
	reset_isr_timer
.loop@sectors:
	lea 	eax, [r8d + KERNEL_DISK_SECT]
	mov 	bx, 1		;; 1 sector
	mov		ecx, esp	;; put on the stack
	call	disk_read

	cld
	mov 	esi, esp	;; src = stack pointer
	mov 	ebp, 512	;; ebp = index (iterate backwards)
.loop@words:
	lodsb	;; al = *src++

	xor 	ah, ah
	call	print_u8hex

	dec 	ebp
	jnz 	.loop@words

	timewait_mac8	6, 0

	xor 	eax, eax
	call	move_cursor

	inc 	r8b
	;; read up until one sector after the kernel ends.
	jcne 	r8b, kernel_size/512 + 1, .loop@sectors

	mov 	dword [VGA_LOC(24, 65)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(24, 67)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(24, 69)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(24, 71)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(24, 73)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(24, 75)], DVGA_DWORD(' D')
	mov 	byte  [VGA_LOC(24, 77)], 'O'	;; already an O.
	mov 	dword [VGA_LOC(24, 78)], DVGA_DWORD('NE')

	timewait_mac8	50, 1

	;; increment the first qword in the first sector after the kernel.
	;; this just shows that writing also works. It should show a different
	;; value each time it boots.
	inc 	qword [esp]
	mov 	eax, DISKFS_START
	mov 	bx, 1
	mov 	ecx, esp
	call	disk_write	; disk_write(u64 sector, u16 cnt, u16 *mem);

	add 	esp, 512

	call	cls
	call	hide_cursor

	xor 	ebp, ebp

	mov 	rax, rbp
	xor 	bl, bl
	call	print_u64hex

	xor 	ax, ax
	call	move_cursor

	mov 	dword [VGA_LOC(2,  0)], DVGA_DWORD('KE')
	mov 	dword [VGA_LOC(2,  2)], DVGA_DWORD('YB')
	mov 	dword [VGA_LOC(2,  4)], DVGA_DWORD('IN')
	mov 	dword [VGA_LOC(2,  6)], DVGA_DWORD('DS')

	mov 	dword [VGA_LOC(3,  1)], DVGA_DWORD('En')
	mov 	dword [VGA_LOC(3,  3)], DVGA_DWORD('te')
	mov 	dword [VGA_LOC(3,  5)], DVGA_DWORD('r ')
	mov 	dword [VGA_LOC(3,  7)], DVGA_DWORD(': ')
	mov 	dword [VGA_LOC(3,  9)], DVGA_DWORD('co')
	mov 	dword [VGA_LOC(3, 11)], DVGA_DWORD('nt')
	mov 	dword [VGA_LOC(3, 13)], DVGA_DWORD('in')
	mov 	dword [VGA_LOC(3, 15)], DVGA_DWORD('ue')

	mov 	dword [VGA_LOC(4,  1)], DVGA_DWORD('In')
	mov 	dword [VGA_LOC(4,  3)], DVGA_DWORD('se')
	mov 	dword [VGA_LOC(4,  5)], DVGA_DWORD('rt')
	mov 	dword [VGA_LOC(4,  7)], DVGA_DWORD(': ')
	mov 	dword [VGA_LOC(4,  9)], DVGA_DWORD('ra')
	mov 	dword [VGA_LOC(4, 11)], DVGA_DWORD('nd')
	mov 	dword [VGA_LOC(4, 13)], DVGA_DWORD('om')
	mov 	dword [VGA_LOC(4, 15)], DVGA_DWORD('iz')
	mov 	byte  [VGA_LOC(4, 17)], 'e'

	mov 	dword [VGA_LOC(5,  1)], DVGA_DWORD('1-')
	mov 	dword [VGA_LOC(5,  3)], DVGA_DWORD('9 ')
	mov 	dword [VGA_LOC(5,  5)], DVGA_DWORD('  ')
	mov 	dword [VGA_LOC(5,  7)], DVGA_DWORD(': ')
	mov 	dword [VGA_LOC(5,  9)], DVGA_DWORD('mu')
	mov 	dword [VGA_LOC(5, 11)], DVGA_DWORD('lt')
	mov 	dword [VGA_LOC(5, 13)], DVGA_DWORD('ip')
	mov 	dword [VGA_LOC(5, 15)], DVGA_DWORD('ly')

	mov 	dword [VGA_LOC(6,  1)], DVGA_DWORD('ot')
	mov 	dword [VGA_LOC(6,  3)], DVGA_DWORD('he')
	mov 	dword [VGA_LOC(6,  5)], DVGA_DWORD('r ')
	mov 	dword [VGA_LOC(6,  7)], DVGA_DWORD(': ')
	mov 	dword [VGA_LOC(6,  9)], DVGA_DWORD('ad')
	mov 	dword [VGA_LOC(6, 11)], DVGA_DWORD('d ')
	mov 	dword [VGA_LOC(6, 13)], DVGA_DWORD('sc')
	mov 	dword [VGA_LOC(6, 15)], DVGA_DWORD('an')
	mov 	dword [VGA_LOC(6, 17)], DVGA_DWORD('co')
	mov 	dword [VGA_LOC(6, 19)], DVGA_DWORD('de')

	mov 	ah, 0x0E	;; backspace
	call	keyring_has_scancode

	mov 	al, 0x75	;; `jmp short` byte 1 is 0x75
	mov 	bl, 0xEB	;; `jnz short` byte 1 is 0xEB
	cmovnz	ax, bx		;; u8 b = keyring_has_scancode(0x0E) ? 0xEB : 0x75;

	;; conditionally change from a conditional jump to unconditional
	mov 	byte [.rand@loop@jump], al
	setnz	al
	xor 	ah, ah
	mov 	word [rel cursor_pos], VGA_POS(24, 78)
	call	_print_u8hex
	mov 	word [rel cursor_pos], 0

	;; fallthrough
.before_mul_loop:
	clear_keyring
.mul_loop:
	call	next_scancode	;; block until the next keypress

	jtnz	al, 1 << 7, .mul_loop	;; skip release codes
	;; keys 0-9 are multipliers. the rest of the keys add the scancode to the total.
	jce 	al, 0Bh, .mul0	;; '0'
	jce 	al, 02h, .mul1	;; '1'
	jce 	al, 03h, .mul2	;; '2'
	jce 	al, 04h, .mul3	;; '3'
	jce 	al, 05h, .mul4	;; '4'
	jce 	al, 06h, .mul5	;; '5'
	jce 	al, 07h, .mul6	;; '6'
	jce 	al, 08h, .mul7	;; '7'
	jce 	al, 09h, .mul8	;; '8'
	jce 	al, 0Ah, .mul9	;; '9'
	jce 	al, 1Ch, .rand	;; enter => exit
	jce 	al, 5Fh, .mul_set_rand	;; insert => randomize the value

	movzx	eax, al
	add 	rbp, rax
.mul_loop@print:
	mov 	rax, rbp
	xor 	bl, bl
	call	print_u64hex

	xor 	ax, ax
	call	move_cursor

	jmp 	.mul_loop
.mul_set_rand:
	rdrand_mac rbp
	jmp 	.mul_loop@print
.mul0:
	xor 	ebp, ebp
	;; fallthrough
.mul1:
	jmp 	.mul_loop@print
.mul2:
	shl 	rbp, 1
	jmp 	.mul_loop@print
.mul3:
	imul	rbp, rbp, 3
	jmp 	.mul_loop@print
.mul4:
	shl 	rbp, 2
	jmp 	.mul_loop@print
.mul5:
	imul	rbp, rbp, 5
	jmp 	.mul_loop@print
.mul6:
	imul	rbp, rbp, 6
	jmp 	.mul_loop@print
.mul7:
	imul	rbp, rbp, 7
	jmp 	.mul_loop@print
.mul8:
	shl 	rbp, 3
	jmp 	.mul_loop@print
.mul9:
	imul	rbp, rbp, 9
	jmp 	.mul_loop@print
.rand:
	reset_isr_timer
	mov 	bpl, 32
.rand@loop:
	mov 	eax, 2*TERM_SIZE
	mov 	ebx, VGA_BUF
	call	rand_fill

	timewait_mac8	1, 0
	dec 	bpl
.rand@loop@jump:
	jnz  	.rand@loop

	timewait_mac8	7, 0
	;; fallthrough
.ltf:
	call	cls
	timewait_mac8	7, 0
	mov 	al, CURS_UNDERLINE
	call	show_cursor
	clear_keyring
	reset_isr_timer
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
