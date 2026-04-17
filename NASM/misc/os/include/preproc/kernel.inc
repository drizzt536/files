%ifndef KERNEL.INC
%define KERNEL.INC

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

%assign enum_idx 0

enum_next	FLG_BIT_CF		;; carry flag
enum_next	FLG_BIT_RES1	;; ralways 1
enum_next	FLG_BIT_PF		;; parity flag
enum_next	FLG_BIT_RES2	;; reserved
enum_next	FLG_BIT_AF		;; auxilary carry flag
enum_next	FLG_BIT_RES3	;; reserved
enum_next	FLG_BIT_ZF		;; zero flag
enum_next	FLG_BIT_SF		;; sign flag
enum_next	FLG_BIT_TF		;; trap flag
enum_next	FLG_BIT_IF		;; interrupt flag
enum_next	FLG_BIT_DF		;; direction flag
enum_next	FLG_BIT_OF		;; overflow flag
enum_next	FLG_BIT_IOPL1	;; I/O privilege level bit 1
enum_next	FLG_BIT_IOPL2	;; I/O privilege level bit 2
enum_next	FLG_BIT_NT		;; nested task flag
enum_next	FLG_BIT_RES4	;; always 0
enum_next	FLG_BIT_RF		;; resume flag
enum_next	FLG_BIT_VM		;; virtual 8086 mode flag
enum_next	FLG_BIT_AC		;; alignment check
enum_next	FLG_BIT_VIF		;; virtual interrupt flag
enum_next	FLG_BIT_VIP		;; virtual interrupt pending
enum_next	FLG_BIT_ID		;; able to use CPUID instruction
enum_next	FLG_BIT_RES5	;; reserved
enum_next	FLG_BIT_RES6	;; reserved
enum_next	FLG_BIT_RES7	;; reserved
enum_next	FLG_BIT_RES8	;; reserved
enum_next	FLG_BIT_RES9	;; reserved
enum_next	FLG_BIT_RES10	;; reserved
enum_next	FLG_BIT_RES11	;; reserved
enum_next	FLG_BIT_RES12	;; reserved
enum_next	FLG_BIT_RES13	;; reserved
enum_next	FLG_BIT_RES14	;; reserved
enum_next	FLG_BIT_RES15	;; reserved
enum_next	FLG_BIT_RES16	;; reserved
enum_next	FLG_BIT_RES17	;; reserved
enum_next	FLG_BIT_RES18	;; reserved
enum_next	FLG_BIT_RES19	;; reserved
enum_next	FLG_BIT_RES20	;; reserved
enum_next	FLG_BIT_RES21	;; reserved
enum_next	FLG_BIT_RES22	;; reserved
enum_next	FLG_BIT_RES23	;; reserved
enum_next	FLG_BIT_RES24	;; reserved
enum_next	FLG_BIT_RES25	;; reserved
enum_next	FLG_BIT_RES26	;; reserved
enum_next	FLG_BIT_RES27	;; reserved
enum_next	FLG_BIT_RES28	;; reserved
enum_next	FLG_BIT_RES29	;; reserved
enum_next	FLG_BIT_RES30	;; reserved
enum_next	FLG_BIT_RES31	;; reserved
enum_next	FLG_BIT_RES32	;; reserved
enum_next	FLG_BIT_RES33	;; reserved
enum_next	FLG_BIT_RES34	;; reserved
enum_next	FLG_BIT_RES35	;; reserved
enum_next	FLG_BIT_RES36	;; reserved
enum_next	FLG_BIT_RES37	;; reserved
enum_next	FLG_BIT_RES38	;; reserved
enum_next	FLG_BIT_RES39	;; reserved
enum_next	FLG_BIT_RES40	;; reserved
enum_next	FLG_BIT_RES41	;; reserved
enum_next	FLG_BIT_RES42	;; reserved
enum_next	FLG_BIT_RES43	;; reserved
enum_next	FLG_BIT_RES44	;; reserved
enum_next	FLG_BIT_RES45	;; reserved
enum_next	FLG_BIT_RES46	;; reserved

%assign FLG_CF		1 << FLG_BIT_CF
%assign FLG_RES1	1 << FLG_BIT_RES1
%assign FLG_PF		1 << FLG_BIT_PF
%assign FLG_RES2	1 << FLG_BIT_RES2
%assign FLG_AF		1 << FLG_BIT_AF
%assign FLG_RES3	1 << FLG_BIT_RES3
%assign FLG_ZF		1 << FLG_BIT_ZF
%assign FLG_SF		1 << FLG_BIT_SF
%assign FLG_TF		1 << FLG_BIT_TF
%assign FLG_IF		1 << FLG_BIT_IF
%assign FLG_DF		1 << FLG_BIT_DF
%assign FLG_OF		1 << FLG_BIT_OF
%assign FLG_IOPL1	1 << FLG_BIT_IOPL1
%assign FLG_IOPL2	1 << FLG_BIT_IOPL2
%assign FLG_NT		1 << FLG_BIT_NT
%assign FLG_RES4	1 << FLG_BIT_RES4
%assign FLG_RF		1 << FLG_BIT_RF
%assign FLG_VM		1 << FLG_BIT_VM
%assign FLG_AC		1 << FLG_BIT_AC
%assign FLG_VIF		1 << FLG_BIT_VIF
%assign FLG_VIP		1 << FLG_BIT_VIP
%assign FLG_ID		1 << FLG_BIT_ID
%assign FLG_RES5	1 << FLG_BIT_RES5
%assign FLG_RES6	1 << FLG_BIT_RES6
%assign FLG_RES7	1 << FLG_BIT_RES7
%assign FLG_RES8	1 << FLG_BIT_RES8
%assign FLG_RES9	1 << FLG_BIT_RES9
%assign FLG_RES10	1 << FLG_BIT_RES10
%assign FLG_RES11	1 << FLG_BIT_RES11
%assign FLG_RES12	1 << FLG_BIT_RES12
%assign FLG_RES13	1 << FLG_BIT_RES13
%assign FLG_RES14	1 << FLG_BIT_RES14
%assign FLG_RES15	1 << FLG_BIT_RES15
%assign FLG_RES16	1 << FLG_BIT_RES16
%assign FLG_RES17	1 << FLG_BIT_RES17
%assign FLG_RES18	1 << FLG_BIT_RES18
%assign FLG_RES19	1 << FLG_BIT_RES19
%assign FLG_RES20	1 << FLG_BIT_RES20
%assign FLG_RES21	1 << FLG_BIT_RES21
%assign FLG_RES22	1 << FLG_BIT_RES22
%assign FLG_RES23	1 << FLG_BIT_RES23
%assign FLG_RES24	1 << FLG_BIT_RES24
%assign FLG_RES25	1 << FLG_BIT_RES25
%assign FLG_RES26	1 << FLG_BIT_RES26
%assign FLG_RES27	1 << FLG_BIT_RES27
%assign FLG_RES28	1 << FLG_BIT_RES28
%assign FLG_RES29	1 << FLG_BIT_RES29
%assign FLG_RES30	1 << FLG_BIT_RES30
%assign FLG_RES31	1 << FLG_BIT_RES31
%assign FLG_RES32	1 << FLG_BIT_RES32
%assign FLG_RES33	1 << FLG_BIT_RES33
%assign FLG_RES34	1 << FLG_BIT_RES34
%assign FLG_RES35	1 << FLG_BIT_RES35
%assign FLG_RES36	1 << FLG_BIT_RES36
%assign FLG_RES37	1 << FLG_BIT_RES37
%assign FLG_RES38	1 << FLG_BIT_RES38
%assign FLG_RES39	1 << FLG_BIT_RES39
%assign FLG_RES40	1 << FLG_BIT_RES40
%assign FLG_RES41	1 << FLG_BIT_RES41
%assign FLG_RES42	1 << FLG_BIT_RES42
%assign FLG_RES43	1 << FLG_BIT_RES43
%assign FLG_RES44	1 << FLG_BIT_RES44
%assign FLG_RES45	1 << FLG_BIT_RES45
%assign FLG_RES46	1 << FLG_BIT_RES46

%assign FLG_ARITH	FLG_CF | FLG_PF | FLG_AF | FLG_ZF | FLG_SF | FLG_OF
%assign FLG_COM		FLG_ARITH | FLG_DF	;; common flags

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

;; the orange one might be brown. idk

%define VGA_CLR(=fgclr, =bgclr)	%hex(fgclr | bgclr << 4)
%define VGA_CLR_FILL(color)		VGA_CLR(color, color)
%assign VGA_DEFAULT				VGA_CLR(VGA_DRK_GRAY, VGA_BLACK)
%assign VGA_HIGHLIGHT			VGA_CLR(VGA_WHITE, VGA_DRK_GRAY)	;; default text highlight
%assign VGA_ALERT				VGA_CLR(VGA_WHITE, VGA_BLUE)

%assign VGA_BUF					0xb8000
%assign VGA_BUF_SIZE			2*TERM_SIZE
%assign VGA_BUF_END				VGA_BUF + VGA_BUF_SIZE

%define VGA_POS(=row, =col)		%hex((TERM_COLS*row + col) % TERM_SIZE)
%define VGA_ADDR(=row, =col)		%hex(VGA_BUF + 2*VGA_POS(row, col))

%define BYTES2WORD(=b0, =b1) (b0 | b1 << 8)
%define BYTES2DWORD(=b0, =b1, =b2, =b3) (b0 | b1 << 8 | b2 << 16 | b3 << 24)
%define BYTES2QWORD(=b0, =b1, =b2, =b3, =b4, =b5, =b6, =b7) \
	(BYTES2DWORD(b0, b1, b2, b3) | BYTES2DWORD(b4, b5, b6, b7) << 32)

%define VGA_WORD(=clr, s)  (BYTES2WORD(%substr(s, 1, 1), clr))
%define VGA_DWORD(=clr, s) (BYTES2DWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr))
%define VGA_QWORD(=clr, s) (BYTES2QWORD(%substr(s, 1, 1), clr, %substr(s, 2, 1), clr, \
							%substr(s, 3, 1), clr, %substr(s, 4, 1), clr))

%define DVGA_WORD(s) (VGA_WORD(VGA_DEFAULT, s))
%define DVGA_DWORD(s) (VGA_DWORD(VGA_DEFAULT, s))
%define DVGA_QWORD(s) (VGA_QWORD(VGA_DEFAULT, s))

%define _str2chars2(s) %sel(1 + %strlen(s), '', {%substr(s,1,1)}, {%substr(s,1,1),%substr(s,2,1)})

%define _str2chars4(s) %cond(%strlen(s) <= 2, {_str2chars2(%substr(s, 1, 2))}, \
	{_str2chars2(%substr(s, 1, 2)),_str2chars2(%substr(s, 2 + 1))})

%define _str2chars8(s) %cond(%strlen(s) <= 4, {_str2chars4(%substr(s, 1, 4))}, \
	{_str2chars4(%substr(s, 1, 4)),_str2chars4(%substr(s, 4 + 1))})

%define _str2chars16(s) %cond(%strlen(s) <= 8, {_str2chars8(%substr(s, 1, 8))}, \
	{_str2chars8(%substr(s, 1, 8)),_str2chars8(%substr(s, 8 + 1))})

%define _str2chars32(s) %cond(%strlen(s) <= 16, {_str2chars16(%substr(s, 1, 16))}, \
	{_str2chars16(%substr(s, 1, 16)),_str2chars16(%substr(s, 16 + 1))})

%define _str2chars64(s) %cond(%strlen(s) <= 32, {_str2chars32(%substr(s, 1, 32))}, \
	{_str2chars32(%substr(s, 1, 32)),_str2chars32(%substr(s, 32 + 1))})

%define _str2chars128(s) %cond(%strlen(s) <= 64, {_str2chars64(%substr(s, 1, 64))}, \
	{_str2chars64(%substr(s, 1, 64)),_str2chars64(%substr(s, 64 + 1))})

%define _str2chars256(s) %cond(%strlen(s) <= 128, {_str2chars128(%substr(s, 1, 128))}, \
	{_str2chars128(%substr(s, 1, 128)),_str2chars128(%substr(s, 128 + 1))})

%define _str2chars512(s) %cond(%strlen(s) <= 256, {_str2chars256(%substr(s, 1, 256))}, \
	{_str2chars256(%substr(s, 1, 256)),_str2chars256(%substr(s, 256 + 1))})

%define _str2chars1024(s) %cond(%strlen(s) <= 512, {_str2chars512(%substr(s, 1, 512))}, \
	{_str2chars512(%substr(s, 1, 512)),_str2chars512(%substr(s, 512 + 1))})

%define _mapstrcat(args+) %strcat(%tok(%strcat(args)))
%define _charstoupperstr(chars+) _mapstrcat(%map(chartoupper, chars))

;; 1024 is super slow, so only increase this as required
%define str2chars(s) _str2chars64(s)

%define chartoupper(c) %cond(c == '_' || ninrange(c, '0', '9'), c, %chr(c & ~32))
%define strtoupper(s) _charstoupperstr(str2chars(s))

%define eval_fn(=x) x		;; you can only pass user-defined macros to %map

%define contains(args+)  %eval(%find( args) > 0)
%define icontains(args+) %eval(%findi(args) > 0)
%define ncontains(args+) %eval(%find(%map(eval_fn, args)) > 0)	;; numeric contains

%define ninrange(=x, =min, =max) (min <= x && x <= max)	;; numeric contains

%define nocontains(args+)  %eval(%find( args) == 0)
%define noicontains(args+) %eval(%findi(args) == 0)
%define noncontains(args+) %eval(%find(%map(eval_fn, args)) == 0)

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

%macro zero 1
	%if icontains(%1, rax, rbx, rcx, rdx, rdi, rsi, rsp, rbp)
		xor 	e%tok(%substr(%1, 2)), e%tok(%substr(%1, 2))
	%elif icontains(%1,r8, r10, r12, r14, r16, r18, r20, r22, r24, r26, r28, r30, \
						r9, r11, r13, r15, r17, r19, r21, r23, r25, r27, r29, r31)
		xor 	%1%[d], %1%[d]
	%else
		xor 	%1, %1
	%endif
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
	%if %findi(%1, ecx, rcx) > 0
		loop	%%loop
	%else
		dec 	%1
		jtnz	%1, %1, %%loop
	%endif
%endm

%macro keywait_mac 0
	movzx	ebx, byte [rel keyring_read]
%%loop:
	call	next_keycode
	lea 	ebx, [ebx + 1]	;; `inc bl` without touching flags
	jts 	al, al, %%loop	;; ignore release keycodes
%endm

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

%macro reset_isr_timer 0
	mov 	dword [rel isr_timer], 0
%endm

;; NOTE: this is for all of the timewait_macN functions.

;; the first argument is the number of ticks before reset
;; if %2 is true, then it waits that many ticks starting from when it runs,
;; and if %2 is false, then it waits until the next period ends.
;; like if you use 4 spaces vs a tab type of difference.

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

%macro keymod_jcmp 4
	;; test_keymods tmp_reg, comparison, condition, label
	mov 	%1, byte [kbd_state]
	and 	%1, KBD_STATE_MODIFIERS
	jcmp 	%1, %2, %3, %4
%endm

%macro keymod_jce 3
	keymod_jcmp %1, %2, e, %3
%endm

%macro keymod_jcne 3
	keymod_jcmp %1, %2, ne, %3
%endm

%macro mmoviq 3
	;; mem move immediate quadword
	; mmoviq [addr], clobber reg, imm64 value
	mov 	%2, %3
	mov 	qword %1, %2
%endm
%endif ; %ifndef KERNEL.INC
