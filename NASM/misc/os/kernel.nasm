default abs
bits 64

%ifdef KERNEL.NASM
	%fatal kernel.nasm should not be used below the top level
%endif

%define KERNEL.NASM

;; TODO: use USB HID keyboard stuff instead of a legacy PS/2 keyboard

%include "kernel.inc"	;; preprocesor-only stuff
%include "stdlib-fntable.nasm"
%include "idt.nasm"		;; IDT declaration
%include "stdlib.nasm"	;; stdlib imports
%include "games.nasm"

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

;; TODO: figure out if this is actually even correct
usermode_jump:
	mov 	rcx, rax
	pushfq
	pop 	r11
	and 	r11, ~(1 << 0 | 1 << 2 | 1 << 4 | 1 << 6 | 1 << 7 | 1 << 10 | 1 << 11)
	sysret

;; process keys until the ISR timer gets to or above the wrap value
proc_keys_until_timeout:
.loop:
	get_isr_timer8_mod 19
	jae 	.ret

	call	get_keycode
	jz  	.loop

	jtnz	al, 1 << 7,			.loop		;; skip the release keycodes
	jce 	al, KC_DELETE,		kernel_reset
	jce 	al, KC_BACKTICK,	.toggle_cursor
	jce 	al, KC_ESC,			.reset_cursor
	jce 	al, KC_UP,			.arrow_up
	jce 	al, KC_RIGHT,		.arrow_right
	jce 	al, KC_DOWN,		.arrow_down
	jce 	al, KC_LEFT,		.arrow_left
	jce 	al, KC_F1,			.stack_overflow
	jce 	al, KC_F2,			.unmapped_page

	;; fallthrough
.log_keycode:
	mov 	ah, VGA_DEFAULT
	call	print_u8hex
	jmp 	.loop
.toggle_cursor:
	call	toggle_cursor
	jmp 	.loop
.reset_cursor:
	zero	ax
	call	move_cursor
	jmp 	.loop
.arrow_up:
	mov 	ax, -TERM_COLS
	call	add_cursor
	jmp 	.loop
.arrow_right:
	call	inc_cursor
	jmp 	.loop
.arrow_down:
	mov 	ax, TERM_COLS
	call	add_cursor
	jmp 	.loop
.arrow_left:
	mov 	ax, -1
	call	add_cursor
	jmp 	.loop
.stack_overflow:
	;; kernel panic: stack overflow
	mov 	al, byte [stack_guard_page]
.unmapped_page:
	;; kernel panic: unmapped page
	mov 	al, byte [-1]
.ret:
	ret

syscall_handler:
	;; RCX = RIP
	;; R11 = RFLAGS
	;; TODO: switch to the kernel stack
	sysret

%xdefine MSG "The Low Taper Fade Meme is **MASSIVE**! " ;; 40 characters long

kernel_entry:
	;; remove kernel_entry from the function table because it is no longer needed.
	mov 	rax, STDLIB_FNTABLE_SIZE
	mov 	qword [stdlib_fntable.size], rax

	mov 	rax, cr4
	bts 	eax, 18		;; set the OSXSAVE bit for AVX to work.
	mov 	cr4, rax

	;; turn on AVX, AVX2, and SSE
	;; for AVX512, also set bits 5, 6, and 7.
	;; 5=OPMASK (k-mask registers) 6=ZMM_Hi256, 7=Hi16_ZMM (ZMM16-ZMM31)
	;; NOTE: bit 19 is for APX. Bits 17 and 18 are for AMX.
	zero	ecx
	xgetbv				;; XCR0
	or  	al, 110b	;; AVX and SSE bits
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

	;; set up syscalls
	;; NOTE: KDATA = KCODE + 8, UDATA = KDATA + 8, UDATA = KDATA + 16.
	mov 	ecx, STAR_MSR
	mov 	edx, GDT_KCODE | GDT_KDATA << 16
	zero	eax		;; the EIP value isn't used in long mode
	wrmsr

	mov 	ecx, LSTAR_MSR
	xor 	edx, edx
	mov 	eax, syscall_handler
	wrmsr
.init_prng:
	;; initialize the PRNG state
	;; xoshiro256** requires that the initial state is not all zeros.
	rdseed_mac	rax
	rdseed_mac	rbx
	rdseed_mac	rcx
	rdseed_mac	rdx

	mov 	rdi, rax
	or  	rdi, rbx
	or  	rdi, rcx
	or  	rdi, rdx
	jz  	.init_prng

	mov 	[pr_rand_state.0], rax
	mov 	[pr_rand_state.1], rbx
	mov 	[pr_rand_state.2], rcx
	mov 	[pr_rand_state.3], rdx
.tss:
	;; set up the TSS memory section
	mov 	eax, TSS_BASE	;; dst = TSS_BASE
	mov 	rbx, tss		;; src = tss
	mov 	ecx, TSS_SIZE	;; cnt = TSS_SIZE
	call	memcpy

	;; load the TSS section
	mov 	ax, GDT_TSS
	ltr 	ax
.pit:
	;; set up the PIT timer.
	outb	IOPT_PIT, 0x36					;; channel 0, lobyte/hibyte, mode 3
	outb 	IOPT_PIT_D1, PIT_DIVISOR & 0xFF	;; low byte
	outb	IOPT_PIT_D1, PIT_DIVISOR >> 8	;; high byte
.interrupts:
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
	zero	eax
	zero	edx
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
	mov 	edi, stack_base	;; just put these right after the stack
	mov 	ecx, 512 * 2
	zero	eax
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

	;; NOTE: the 2 pages after the stack can be reused for something else now.

	lidt	[idt.ptr]

	;; re-enable non-maskable interrupts
	in  	al, IOPT_CMOS
	and 	al, ~(1 << 7)
	out 	IOPT_CMOS, al

	sti		;; enable maskable interrupts.

	;; TODO: select the master on the primary disk
	;;       it should already be set to that, but do it anyway.

	;; zero all the registers (except esp), and reset to a known state
	jmp 	kernel_reset
.start:
	call	next_keycode
	call	keycode_to_ascii
	jz  	.start	;; generic release codes return 0

	jce 	al, ASCII_CTRL,		.start
	jce 	al, ASCII_ALT,		.start
	jce 	al, ASCII_SHIFT,	.start
	jce 	al, ASCII_WIN,		.start
	jce 	al, ASCII_INSERT,	.insert
	jce 	al, ASCII_NUMLK,	.start
	jce 	al, ASCII_SCRLK,	.start

	keymod_jce	ah, KBD_STATE_CTRL, .ctrl
	keymod_jce	ah, KBD_STATE_CTRL | KBD_STATE_ALT, .ctrl_alt

	jtnz	byte [kbd_state], KBD_STATE_CTRL | KBD_STATE_ALT | KBD_STATE_WIN, .start

	;; test regular keys
	jce 	al, ASCII_HOME,		.home
	jce 	al, ASCII_UP,		.arrow_up
	jce 	al, ASCII_RIGHT,	.arrow_right
	jce 	al, ASCII_DOWN,		.arrow_down
	jce 	al, ASCII_LEFT,		.arrow_left
	jce 	al, ASCII_F1,		.toggle_cursor
	jts 	al, al, .start		;; release code

	zero	ah
	call	putchar
	jmp 	.start
.home:
	mov 	al, `\r`
	call	putchar
	jmp 	.start
.arrow_up:
	mov 	ax, -TERM_COLS
	call	add_cursor
	jmp 	.start
.arrow_right:
	call	inc_cursor
	jmp 	.start
.arrow_down:
	;; `add_cursor(TERM_COLS);` would be better, but just demonstrate that this works.

	mov 	al, `\v`
	call	putchar
	jmp 	.start
.arrow_left:
	mov 	ax, -1
	call	add_cursor
	jmp 	.start
.insert:
	mov 	al, byte [cursor_type]
	xor 	al, CURS_UNDERLINE
	call	set_cursor
	jmp 	.start
.toggle_cursor:
	call	toggle_cursor
	jmp 	.start
.ctrl:
	jce 	al, 'b', .ctrl_b	;; bell
	jce 	al, 'l', .ltf		;; LTF
	jce 	al, 'm', .ctrl_m	;; multiply
	jce 	al, 'r', .rand		;; rand
	jce 	al, 's', .before_read_sectors
	jce 	al, 'x', .ctrl_x
	jce 	al, ASCII_F2, .ctrl_f2

	jmp 	.start
.ctrl_x:
	;; also `call cls`, but this is to demonsrate that this works too.
	mov 	al, `\f`
	call	putchar
	jmp 	.start
.ctrl_b:
	mov 	al, ASCII_BEL
	call	putchar
	jmp 	.start
.ctrl_m:
	call	cls
	call	hide_cursor
	mov 	dword [VGA_ADDR(0, 0)], DVGA_DWORD('WA')
	mov 	dword [VGA_ADDR(0, 2)], DVGA_DWORD('IT')
	timewait_mac8 50, 1
	jmp 	.before_mul_loop
.ctrl_f2:
	call	reboot
.ctrl_alt:
	jce 	al, 'g', games_entry
	jmp 	.start
.before_read_sectors:
	sub 	esp, 512	;; allocate space for the sectors to be read into.
	zero	r8d			;; sector_idx = 0;
	call	cls
	call	hide_cursor

	mov 	dword [VGA_ADDR(24, 65)], DVGA_DWORD('RE')
	mov 	dword [VGA_ADDR(24, 67)], DVGA_DWORD('AD')
	mov 	dword [VGA_ADDR(24, 69)], DVGA_DWORD('IN')
	mov 	dword [VGA_ADDR(24, 71)], DVGA_DWORD('G ')
	mov 	dword [VGA_ADDR(24, 73)], DVGA_DWORD('SE')
	mov 	dword [VGA_ADDR(24, 75)], DVGA_DWORD('CT')
	mov 	byte  [VGA_ADDR(24, 77)], 'O'
	mov 	dword [VGA_ADDR(24, 78)], DVGA_DWORD('RS')
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

	zero	ah
	call	print_u8hex

	dec 	ebp
	jnz 	.loop@words

	timewait_mac8	6, 0

	zero	eax
	call	move_cursor

	inc 	r8b
	;; read up until one sector after the kernel ends.
	jcne 	r8b, DISKFS_START, .loop@sectors

	mov 	dword [VGA_ADDR(24, 65)], DVGA_DWORD('  ')
	mov 	dword [VGA_ADDR(24, 67)], DVGA_DWORD('  ')
	mov 	dword [VGA_ADDR(24, 69)], DVGA_DWORD('  ')
	mov 	dword [VGA_ADDR(24, 71)], DVGA_DWORD('  ')
	mov 	dword [VGA_ADDR(24, 73)], DVGA_DWORD('  ')
	mov 	dword [VGA_ADDR(24, 75)], DVGA_DWORD(' D')
	mov 	byte  [VGA_ADDR(24, 77)], 'O'	;; already an O.
	mov 	dword [VGA_ADDR(24, 78)], DVGA_DWORD('NE')

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

	;; fallthrough
.before_mul_loop:
	zero	ebp

	mov 	rax, rbp
	zero	bl
	call	print_u64hex

	zero	ax
	call	move_cursor

	mov 	dword [VGA_ADDR(2,  0)], DVGA_DWORD('KE')
	mov 	dword [VGA_ADDR(2,  2)], DVGA_DWORD('YB')
	mov 	dword [VGA_ADDR(2,  4)], DVGA_DWORD('IN')
	mov 	dword [VGA_ADDR(2,  6)], DVGA_DWORD('DS')

	mov 	dword [VGA_ADDR(3,  1)], DVGA_DWORD('En')
	mov 	dword [VGA_ADDR(3,  3)], DVGA_DWORD('te')
	mov 	byte  [VGA_ADDR(3,  5)], 'r'
	mov 	byte  [VGA_ADDR(3,  7)], ':'
	mov 	dword [VGA_ADDR(3,  9)], DVGA_DWORD('co')
	mov 	dword [VGA_ADDR(3, 11)], DVGA_DWORD('nt')
	mov 	dword [VGA_ADDR(3, 13)], DVGA_DWORD('in')
	mov 	dword [VGA_ADDR(3, 15)], DVGA_DWORD('ue')

	mov 	dword [VGA_ADDR(4,  1)], DVGA_DWORD('In')
	mov 	dword [VGA_ADDR(4,  3)], DVGA_DWORD('se')
	mov 	dword [VGA_ADDR(4,  5)], DVGA_DWORD('rt')
	mov 	byte  [VGA_ADDR(4,  7)], ':'
	mov 	dword [VGA_ADDR(4,  9)], DVGA_DWORD('ra')
	mov 	dword [VGA_ADDR(4, 11)], DVGA_DWORD('nd')
	mov 	dword [VGA_ADDR(4, 13)], DVGA_DWORD('om')
	mov 	dword [VGA_ADDR(4, 15)], DVGA_DWORD('iz')
	mov 	byte  [VGA_ADDR(4, 17)], 'e'

	mov 	dword [VGA_ADDR(5,  1)], DVGA_DWORD('0-')
	mov 	byte  [VGA_ADDR(5,  3)], '9'
	mov 	byte  [VGA_ADDR(5,  7)], ':'
	mov 	dword [VGA_ADDR(5,  9)], DVGA_DWORD('mu')
	mov 	dword [VGA_ADDR(5, 11)], DVGA_DWORD('lt')
	mov 	dword [VGA_ADDR(5, 13)], DVGA_DWORD('ip')
	mov 	dword [VGA_ADDR(5, 15)], DVGA_DWORD('ly')

	mov 	dword [VGA_ADDR(6,  1)], DVGA_DWORD('ot')
	mov 	dword [VGA_ADDR(6,  3)], DVGA_DWORD('he')
	mov 	byte  [VGA_ADDR(6,  5)], 'r'
	mov 	byte  [VGA_ADDR(6,  7)], ':'
	mov 	dword [VGA_ADDR(6,  9)], DVGA_DWORD('ad')
	mov 	byte  [VGA_ADDR(6, 11)], 'd'
	mov 	dword [VGA_ADDR(6, 13)], DVGA_DWORD('ke')
	mov 	dword [VGA_ADDR(6, 15)], DVGA_DWORD('yc')
	mov 	dword [VGA_ADDR(6, 17)], DVGA_DWORD('od')
	mov 	byte  [VGA_ADDR(6, 19)], 'e'

	mov 	al, KC_BACKSPACE
	call	keyring_has_keycode

	;; change the random buffer loop to be infinite if backspace was pressed.
	mov 	al, 0x75	;; `jmp short` byte 1 is 0x75
	mov 	bl, 0xEB	;; `jnz short` byte 1 is 0xEB
	cmovnz	ax, bx		;; u8 b = keyring_has_keycode(KC_BACKSPACE) ? 0xEB : 0x75;

	;; conditionally change from a conditional jump to unconditional
	mov 	byte [.rand@loop@jump], al
	setnz	al
	zero	ah
	mov 	word [rel cursor_pos], VGA_POS(24, 78)
	call	_print_u8hex
	mov 	word [rel cursor_pos], 0

	clear_keyring
.mul_loop:
	call	next_keycode				;; block until the next keypress

	jtnz	al, 1 << 7, .mul_loop		;; skip release codes
	;; keys 0-9 are multipliers. the rest of the keys add the keycode to the total.
	jce 	al, KC_0,		.mul0
	jce 	al, KC_1,		.mul1
	jce 	al, KC_2,		.mul2
	jce 	al, KC_3,		.mul3
	jce 	al, KC_4,		.mul4
	jce 	al, KC_5,		.mul5
	jce 	al, KC_6,		.mul6
	jce 	al, KC_7,		.mul7
	jce 	al, KC_8,		.mul8
	jce 	al, KC_9,		.mul9
	jce 	al, KC_ENTER,	.rand			;; enter => exit
	jce 	al, KC_INSERT,	.mul_set_rand	;; insert => randomize the value

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
.ltf@mainloop:
	mov 	esi, VGA_BUF
	mov 	ah, VGA_CLR(VGA_LGT_RED, VGA_PURPLE)
.ltf@fill_screen_1:
	mov 	ecx, %strlen(MSG)
.ltf@print_msg_1:
	dec 	ecx
	mov 	al, byte [ltf_msg + ecx]
	mov 	word [esi + 2*ecx], ax
	jtnz	ecx, ecx, .ltf@print_msg_1

	add 	esi, TERM_COLS
	jcb 	esi, VGA_BUF_END, .ltf@fill_screen_1

	call	proc_keys_until_timeout

	;; print the same thing again but in different colors
	mov 	esi, VGA_BUF
	mov 	ah, VGA_CLR(VGA_CYAN, VGA_BLUE)
.ltf@fill_screen_2:
	mov 	ecx, %strlen(MSG)
.ltf@print_msg_2:
	dec 	ecx
	mov 	al, byte [ltf_msg + ecx]
	mov 	word [esi + 2*ecx], ax
	jtnz	ecx, ecx, .ltf@print_msg_2

	add 	esi, TERM_COLS
	jcb 	esi, VGA_BUF_END, .ltf@fill_screen_2

	call	proc_keys_until_timeout
	jmp 	.ltf@mainloop

ltf_msg: db MSG

align 512	;; align to sector boundary
kernel_end:
kernel_size: equ $ - $$
