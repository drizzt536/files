%ifndef KERNEL_INC
%define KERNEL_INC

%assign KERNEL_START	0x100000 ;; 1 MiB
org KERNEL_START

%include "io-ports.inc"
%include "jtest.inc"
%include "jcmp.inc"
%include "reg.inc"

%assign enum_idx 0
%macro enum_next 1
	%assign %1 enum_idx
	%assign enum_idx	enum_idx + 1
%endm

%macro enum_set 1-*
	%rep %0
		enum_next	%1
		%rotate 1
	%endrep
%endm

%assign IST1_BASE	0x1000
%assign TSS_BASE	0x500
%assign TSS_SIZE	104

;; these segment offsets shouldn't change.
%assign GDT_NULL	0x00
%assign GDT_KCODE	0x08
%assign GDT_KDATA	0x10
%assign GDT_UDATA	0x18
%assign GDT_UCODE	0x20
%assign GDT_TSS		0x28	;; 2 entries long
%assign GDT_BASE	TSS_BASE + TSS_SIZE

%assign EFER_MSR			0xC0000080	;; extended feature enable register
%assign STAR_MSR			0xC0000081	;; system target address register
%assign LSTAR_MSR			0xC0000082	;; long mode syscall handler address
%assign CSTAR_MSR			0xC0000083	;; compatibility STAR. only for 32-bit mode.
%assign SFMASK_MSR			0xC0000084
%assign FS_BASE_MSR			0xC0000100
%assign GS_BASE_MSR			0xC0000101
%assign KRNL_GS_BASE_MSR	0xC0000102	;; IA32_KERNEL_GS_BASE. for SWAPGS

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
;; on older systems, it also has to be 15, modulo 16, but I don't care.
%assign APIC_SPURIOUS_ISR	0xFF

%assign APIC_IRQ0_PIN	2	;; PIT timer
%assign APIC_IRQ1_PIN	1	;; keyboard

;; the reserved codes are basically permanently

%assign enum_idx 0x00

enum_next	INT_#DE		;; divide by zero
enum_next	INT_#DB		;; debug
enum_next	INT_NMI		;; non-maskable interrupt
enum_next	INT_#BP		;; breakpoint (INT3)
enum_next	INT_#OF		;; overflow (INTO when OF=1)
enum_next	INT_#BR		;; bound range exceeded (BOUND when value out of range)
enum_next	INT_#UD		;; invalid opcode
enum_next	INT_#NM		;; device not available
enum_next	INT_#DF		;; double fault
enum_next	INT_CSO		;; coprocessor segment overrun (obsolete)
enum_next	INT_#TS		;; invalid TSS
enum_next	INT_#NP		;; non-present segment
enum_next	INT_#SS		;; stack-segment fault
enum_next	INT_#GP		;; general-protection fault
enum_next	INT_#PF		;; page fault
enum_next	INT_RES1	;; reserved
enum_next	INT_#MF		;; x87 Floating-Point Exception
enum_next	INT_#AC		;; alignment check
enum_next	INT_#MC		;; machine check
enum_next	INT_#XM		;; SIMD floating-point exception
enum_next	INT_#VE		;; virtualization exception
enum_next	INT_#CP		;; control protection exception
enum_next	INT_RES2	;; reserved
enum_next	INT_RES3	;; reserved
enum_next	INT_RES4	;; reserved
enum_next	INT_RES5	;; reserved
enum_next	INT_RES6	;; reserved
enum_next	INT_RES7	;; reserved
enum_next	INT_RES8	;; reserved
enum_next	INT_RES9	;; reserved
enum_next	INT_#HV		;; hypervisor injection exception, AMD SEV-SNP specific
enum_next	INT_#VC		;; VMM Communication Exception, AMD SEV specific
enum_next	INT_TIMER
enum_next	INT_KBD

%assign INT_#XF INT_#XM
%assign INT_SPURIOUS	APIC_SPURIOUS_ISR

%assign TERM_ROWS		25
%assign TERM_COLS		80
%assign TERM_SIZE		TERM_ROWS * TERM_COLS

;; probably don't use these, but they are available for clarity.
%assign TERM_WIDTH		TERM_COLS
%assign TERM_HEIGHT		TERM_ROWS

%if TERM_COLS % 16 != 0
	;; this is required for include/stdlib/stdprint.nasm
	%fatal terminal columns is assumed to be divisible by 16. (value = %[TERM_SIZE])
%endif

;; NOTE: the colors were determined experimentally rather than from documentation.

%assign enum_idx 0x0

enum_set \
	VGA_BLACK, VGA_BLUE, VGA_GREEN, VGA_TEAL, \
	VGA_RED, VGA_MAGENTA, VGA_ORANGE, VGA_LGT_GRAY, \
	VGA_DRK_GRAY, VGA_PURPLE, VGA_LGT_GREEN, VGA_CYAN, \
	VGA_LGT_RED, VGA_PINK, VGA_YELLOW, VGA_WHITE

%define VGA_CLR(fgclr, bgclr)	%hex((fgclr) | (bgclr) << 4)
%define VGA_CLR_FILL(color)		VGA_CLR(color, color)
%define VGA_POS(row, col)		%hex((TERM_COLS*(row) + (col)) % TERM_SIZE)
%assign VGA_BUF					0xb8000
%define VGA_ADDR(row, col)		%hex(VGA_BUF + 2*VGA_POS(row, col))
%assign VGA_DEFAULT				VGA_CLR(VGA_DRK_GRAY, VGA_BLACK)
%assign VGA_BUF_END				VGA_BUF + 2*TERM_SIZE

%define BYTES2WORD(b0, b1) (b0 | b1 << 8)
%define BYTES2DWORD(b0, b1, b2, b3) (b0 | b1 << 8 | b2 << 16 | b3 << 24)
%define BYTES2QWORD(b0, b1, b2, b3, b4, b5, b6, b7) \
	(BYTES2DWORD(b0, b1, b2, b3) | BYTES2DWORD(b4, b5, b6, b7) << 32)

%define VGA_WORD(clr, s)  (BYTES2WORD(%substr(s, 1, 1), clr))
%define VGA_DWORD(clr, s) (BYTES2DWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr))
%define VGA_QWORD(clr, s) (BYTES2QWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr, \
							%substr(s, 3, 1), clr, %substr(s, 4, 1), clr))

%define DVGA_WORD(s) (VGA_WORD(VGA_DEFAULT, s))
%define DVGA_DWORD(s) (VGA_DWORD(VGA_DEFAULT, s))
%define DVGA_QWORD(s) (VGA_QWORD(VGA_DEFAULT, s))

%define byte2char(b) %sel((b) + 1, \
	`\x00`, `\x01`, `\x02`, `\x03`, `\x04`, `\x05`, `\x06`, `\x07`, `\x08`, `\x09`, `\x0A`, `\x0B`, \
	`\x0C`, `\x0D`, `\x0E`, `\x0F`, `\x10`, `\x11`, `\x12`, `\x13`, `\x14`, `\x15`, `\x16`, `\x17`, \
	`\x18`, `\x19`, `\x1A`, `\x1B`, `\x1C`, `\x1D`, `\x1E`, `\x1F`, `\x20`, `\x21`, `\x22`, `\x23`, \
	`\x24`, `\x25`, `\x26`, `\x27`, `\x28`, `\x29`, `\x2A`, `\x2B`, `\x2C`, `\x2D`, `\x2E`, `\x2F`, \
	`\x30`, `\x31`, `\x32`, `\x33`, `\x34`, `\x35`, `\x36`, `\x37`, `\x38`, `\x39`, `\x3A`, `\x3B`, \
	`\x3C`, `\x3D`, `\x3E`, `\x3F`, `\x40`, `\x41`, `\x42`, `\x43`, `\x44`, `\x45`, `\x46`, `\x47`, \
	`\x48`, `\x49`, `\x4A`, `\x4B`, `\x4C`, `\x4D`, `\x4E`, `\x4F`, `\x50`, `\x51`, `\x52`, `\x53`, \
	`\x54`, `\x55`, `\x56`, `\x57`, `\x58`, `\x59`, `\x5A`, `\x5B`, `\x5C`, `\x5D`, `\x5E`, `\x5F`, \
	`\x60`, `\x61`, `\x62`, `\x63`, `\x64`, `\x65`, `\x66`, `\x67`, `\x68`, `\x69`, `\x6A`, `\x6B`, \
	`\x6C`, `\x6D`, `\x6E`, `\x6F`, `\x70`, `\x71`, `\x72`, `\x73`, `\x74`, `\x75`, `\x76`, `\x77`, \
	`\x78`, `\x79`, `\x7A`, `\x7B`, `\x7C`, `\x7D`, `\x7E`, `\x7F`, `\x80`, `\x81`, `\x82`, `\x83`, \
	`\x84`, `\x85`, `\x86`, `\x87`, `\x88`, `\x89`, `\x8A`, `\x8B`, `\x8C`, `\x8D`, `\x8E`, `\x8F`, \
	`\x90`, `\x91`, `\x92`, `\x93`, `\x94`, `\x95`, `\x96`, `\x97`, `\x98`, `\x99`, `\x9A`, `\x9B`, \
	`\x9C`, `\x9D`, `\x9E`, `\x9F`, `\xA0`, `\xA1`, `\xA2`, `\xA3`, `\xA4`, `\xA5`, `\xA6`, `\xA7`, \
	`\xA8`, `\xA9`, `\xAA`, `\xAB`, `\xAC`, `\xAD`, `\xAE`, `\xAF`, `\xB0`, `\xB1`, `\xB2`, `\xB3`, \
	`\xB4`, `\xB5`, `\xB6`, `\xB7`, `\xB8`, `\xB9`, `\xBA`, `\xBB`, `\xBC`, `\xBD`, `\xBE`, `\xBF`, \
	`\xC0`, `\xC1`, `\xC2`, `\xC3`, `\xC4`, `\xC5`, `\xC6`, `\xC7`, `\xC8`, `\xC9`, `\xCA`, `\xCB`, \
	`\xCC`, `\xCD`, `\xCE`, `\xCF`, `\xD0`, `\xD1`, `\xD2`, `\xD3`, `\xD4`, `\xD5`, `\xD6`, `\xD7`, \
	`\xD8`, `\xD9`, `\xDA`, `\xDB`, `\xDC`, `\xDD`, `\xDE`, `\xDF`, `\xE0`, `\xE1`, `\xE2`, `\xE3`, \
	`\xE4`, `\xE5`, `\xE6`, `\xE7`, `\xE8`, `\xE9`, `\xEA`, `\xEB`, `\xEC`, `\xED`, `\xEE`, `\xEF`, \
	`\xF0`, `\xF1`, `\xF2`, `\xF3`, `\xF4`, `\xF5`, `\xF6`, `\xF7`, `\xF8`, `\xF9`, `\xFA`, `\xFB`, \
	`\xFC`, `\xFD`, `\xFE`, `\xFF`)

%define strmul(s, n) %sel((n) + 1, '', \
	%sel(!%isdifi( 1),) %strcat(s), \
	%sel(!%isdifi( 2),) %strcat(s,s), \
	%sel(!%isdifi( 3),) %strcat(s,s,s), \
	%sel(!%isdifi( 4),) %strcat(s,s,s,s), \
	%sel(!%isdifi( 5),) %strcat(s,s,s,s,s), \
	%sel(!%isdifi( 6),) %strcat(s,s,s,s,s,s), \
	%sel(!%isdifi( 7),) %strcat(s,s,s,s,s,s,s), \
	%sel(!%isdifi( 8),) %strcat(s,s,s,s,s,s,s,s), \
	%sel(!%isdifi( 9),) %strcat(s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(10),) %strcat(s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(11),) %strcat(s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(12),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(13),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(14),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(15),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(16),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(17),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(18),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(19),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(20),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(21),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(22),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(23),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(24),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(25),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(26),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(27),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(28),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(29),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(30),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(31),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s), \
	%sel(!%isdifi(32),) %strcat(s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s) \
	)

%imacro zero 1
	xor 	%1, %1
%endm

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
		jtnz	%1, %1, %%loop
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
	jcb 	%3, %1, %%loop

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
	zero	%3
	mov 	%2, %4 [rel isr_timer]
	cmp 	%2, %1					;; isr timer wrap value. probably will be imm8
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

%macro rdseed_mac 1
%%loop:
	rdseed	%1
	jnc 	%%loop
%endm

%macro _putchar_colored 3
	;; _putchar_colored row, col, val
	mov		[rel VGA_ADDR(%1, %2)], %3	;; VGA text buffer
%endm

%macro inc 1-*
	%rep %0
		inc 	%1
		%rotate 1
	%endrep
%endm

%macro keymod_jce 3
	;; test_keymods tmp_reg, comparison, label
	mov 	%1, byte [kbd_state]
	and 	%1, KBD_STATE_MODIFIERS
	jce 	%1, %2, %3
%endm
%endif ; %ifndef KERNEL_INC
