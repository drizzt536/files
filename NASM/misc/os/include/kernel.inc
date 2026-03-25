%ifndef KERNEL_INC
%define KERNEL_INC

%assign KERNEL_START	0x100000 ;; 1 MiB
org KERNEL_START

%include "io-ports.inc"
%include "jtest.inc"
%include "jcmp.inc"

;; these segment offsets shouldn't change.
%assign GDT_NULL	0x00
%assign GDT_KCODE	0x08
%assign GDT_KDATA	0x10
%assign GDT_UCODE	0x18
%assign GDT_UDATA	0x20
%assign GDT_TSS		0x28

%assign IST1_BASE	0x1000
%assign TSS_BASE	0x500
%assign TSS_SIZE	104

;; the drift with this divisor is 1 second per 17 hours.
;; for no drift, the only two useful divisors are 14551 and 29102,
;; which give a frequency of 82Hz and 41Hz, respectively.
%assign PIT_DIVISOR			62799	;; divisor for ~19 Hz (1193182 / 62799)

;; page table stuff
%assign PT_PML4_BASE		0x1000	;; this pointer is stored in cr3
%assign PT_PDPT0_BASE		0x2000
%assign PT_PD0_BASE			0x3000
%assign PT_PT0_BASE			0x4000
%assign PT_BOOT_PAGES		3		;; number of pages added in the bootloader
%assign PT_PAGES			124		;; total number of pages to add.
%assign PT_KRNL_PAGE_OFS	(2*1024*1024) * PT_BOOT_PAGES	;; 2 MiB per page
%assign PT_KRNL_PAGES		PT_PAGES - PT_BOOT_PAGES
%assign EBDA_SEGMENT_PTR	0x40E

%assign KERNEL_STACK_SIZE	65536
%define stack_guard_page	((KERNEL_START + kernel_size + 4095) & ~4095)
%define stack_base			(stack_guard_page + 4096 + KERNEL_STACK_SIZE)

;; NOTE: this is different from in the bootloader because the bootloader is at sector 0
;;       LBA28 and LBA48, but it is sector 1 in CHS (how the bootloader does it)
%assign KERNEL_DISK_SECT	1
%define DISKFS_START		(KERNEL_DISK_SECT + kernel_size/512)

%assign PIC_ICW1_ICW4		0x01	;; Indicates that ICW4 will be present
%assign PIC_ICW1_CASCADE	0x02	;; cascade mode
%assign PIC_ICW1_INIT		0x10	;; initialization
%assign PIC_ICW4_8086		0x01	;; 8086/88 (MCS-80/85) mode
%assign PIC_OFFS_1			0x20	;; IDT vector offset for PIC1 (32-39, inclusive)
%assign PIC_OFFS_2			0x28	;; IDT vector offset for PIC2 (40-47, inclusive)
%assign PIC_EOI				0x20	;; end of interrupt signal for legacy 8259 PIC

%assign APIC_BASE_MSR		0x1B	;; x2APIC MSR ID
%assign APIC_ENABLE			1 << 11	;; 0x800
%assign X2APIC_ENABLE		1 << 10	;; 0x400
%assign X2APIC_TPR			0x808	;; task priority register
%assign X2APIC_EOI			0x80B	;; end of interrupt location for x2APIC
%assign X2APIC_SVR			0x80F	;; spurious vector register

;; this should be found dynamically. this is a temporary value
%assign QEMU_IOAPIC_BASE	0xFEC00000

;; must be more than 31 and less than 256.
;; on older systems, it also has to be equal to 15, modulo 16, but I don't care.
%assign APIC_SPURIOUS_ISR	0xFF

%assign APIC_IRQ0_PIN		2	;; PIT timer
%assign APIC_IRQ1_PIN		1	;; keyboard

%assign TERM_ROWS			25
%assign TERM_COLS			80
%assign TERM_SIZE			TERM_ROWS * TERM_COLS

;; probably don't use these, but they are available for clarity.
%assign TERM_WIDTH			TERM_COLS
%assign TERM_HEIGHT			TERM_ROWS

%if TERM_SIZE % 4 != 0
	%fatal terminal size is assumed to be divisible by 4. (value = TERM_SIZE)
%endif

;; NOTE: the colors were determined experimentally rather than from documentation.
%assign VGA_BLACK				0x0
%assign VGA_DRK_BLUE			0x1
%assign VGA_GREEN				0x2
%assign VGA_TEAL				0x3
%assign VGA_RED					0x4
%assign VGA_DRK_PINK			0x5 ;; bad name? is this magenta or something?
%assign VGA_ORANGE				0x6
%assign VGA_LGT_GRAY			0x7
%assign VGA_DRK_GRAY			0x8
%assign VGA_PURPLE				0x9
%assign VGA_LGT_GREEN			0xA
%assign VGA_CYAN				0xB
%assign VGA_LGT_RED				0xC
%assign VGA_PINK				0xD
%assign VGA_YELLOW				0xE
%assign VGA_WHITE				0xF
%define VGA_CLR(fgclr, bgclr)	%hex((fgclr) | (bgclr) << 4)
%assign VGA_DEFAULT				VGA_CLR(VGA_DRK_GRAY, VGA_BLACK)
%assign VGA_BUF					0xb8000
%assign VGA_BUF_END				VGA_BUF + 2*TERM_SIZE
%define VGA_LOC(row, col)		%hex(VGA_BUF + (TERM_COLS*(row) + (col)) % TERM_SIZE * 2)

%define BYTES2WORD(b0, b1) (b0 | b1 << 8)
%define BYTES2DWORD(b0, b1, b2, b3) (b0 | b1 << 8 | b2 << 16 | b3 << 24)
%define BYTES2QWORD(b0, b1, b2, b3, b4, b5, b6, b7) \
	(BYTES2DWORD(b0, b1, b2, b3) | BYTES2DWORD(b4, b5, b6, b7) << 32)

%define VGA_WORD(clr, s)  (BYTES2WORD(%substr(s, 1, 1), clr))
%define VGA_DWORD(clr, s) (BYTES2DWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr))
%define VGA_QWORD(clr, s) (BYTES2DWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr), \
							 BYTES2DWORD(%substr(s, 3, 1), clr, %substr(s, 4, 1), clr))

%define DVGA_WORD(s) (VGA_WORD(VGA_DEFAULT, s))
%define DVGA_DWORD(s) (VGA_DWORD(VGA_DEFAULT, s))
%define DVGA_QWORD(s) (VGA_QWORD(VGA_DEFAULT, s))

%macro io_wait 0
	;; basically just kill a little bit of time so other `out` commands can finish.
	;; the value doesn't matter so just use whatever is already in al.
	;; I think this is guaranteed to take at least 30ns.
	out 	IOPT_POST, al
%endm

%macro wait_mac 2
	;; wait_mac clobber, cycles
	mov 	%1, %2
%%loop:
	%if %isidni(%1, ecx) || %isidni(%1, rcx)
		loop	%%loop
	%else
		dec 	%1
		test	%1, %1
		jnz 	%%loop
	%endif
%endm

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; NOTE: this is for all of the timewait_macN functions.

;; the first argument is the number of ticks before reset
;; if %2 is true, then it waits that many ticks starting from when it runs,
;; and if %2 is false, then it waits until the next period ends.
;; like if you use 4 spaces vs a tab type of difference.

%macro reset_isr_timer 0
	mov 	dword [rel isr_timer], 0
%endm

%macro _timewait_macx 4
	;; e.g. `_timewait_macx 21, 1, al, byte`.
	;;      wait 21 ticks, reseting before counting. use 7-bit mode.
	;; clobbers al.
%if %2
	reset_isr_timer
%endif
%%loop:
	mov 	%3, %4 [rel isr_timer]
	cmp 	%3, %1	;; isr timer wrap value. probablly will be imm8
	jb  	%%loop

	reset_isr_timer
%endm

%macro timewait_mac8 2
	;; clobbers al.
	_timewait_macx %1, %2, al, byte
%endm

%macro timewait_mac16 2
	;; clobbers ax
	_timewait_macx %1, %2, ax, word
%endm

%macro timewait_mac32 2
	;; clobbers rax
	_timewait_macx %1, %2, eax, dword
%endm

%macro _get_isr_timerx_mod 4
	;; _get_isr_timerx_mod mod, avar, bvar, type
	xor 	%3, %3
	mov 	%2, %4 [rel isr_timer]
	cmp 	%2, %1					;; isr timer wrap value. probablly will be imm8
	cmovae	%cond(%isidni(%2, al), ax, %2), %cond(%isidni(%3, bl), bx, %3)
	mov 	%4 [rel isr_timer], %2	;; write back in case it was zeroed
%endm

%macro get_isr_timer8_mod 1
	;; clobbers ax and bx
	_get_isr_timerx_mod %1, al, bl, byte
%endm

%macro get_isr_timer16_mod 1
	;; clobbers ax and bx
	_get_isr_timerx_mod %1, ax, bx, word
%endm

%macro get_isr_timer32_mod 1
	;; clobbers ax and bx
	_get_isr_timerx_mod %1, eax, ebx, dword
%endm

%macro _outx 3
	;; e.g. `_outx 0x100, 56, ax`. port, value, al/ax/eax for size.
	%if %isnidni(%2, %3)
		mov 	%3, %2
	%endif

	%if %isidni(%1, dx) || %cond(%isnum(%1), (%1) < 256, 0)
		out 	%1, %3
	%else
		mov 	dx, %1
		out 	dx, %3
	%endif
%endm

%macro outd 2
	_outx	%1, %2, eax
%endm

%macro outw 2
	_outx	%1, %2, ax
%endm

%macro outb 2
	_outx	%1, %2, al
%endm

%macro _inx 2
	;; %1 should be al, ax, or eax
	;; %2 is either dx or an imm8 port address
	%if %isidni(%2,dx) || %cond(%isnum(%2), (%2) < 256, 0)
		in  	%1, %2
	%else
		mov 	dx, %2
		in  	%1, dx
	%endif
%endm

%macro inb 1
	_inx 	al, %1
%endm

%macro inw 1
	_inx 	ax, %1
%endm

%macro ind 1
	_inx 	eax, %1
%endm

%macro rdrand_mac 1
%%loop:
	rdrand	%1
	jnc 	%%loop
%endm

%macro _putchar_colored 3
	;; _putchar_colored row, col, val
	mov		[rel VGA_LOC(%1, %2)], %3	;; VGA text buffer
%endm
	
%endif ; %ifndef KERNEL_INC
