%ifndef KERNEL_INC
%define KERNEL_INC

%assign KERNEL_START 0x100000 ;; 1 MiB
org KERNEL_START

%include "io-ports.inc"
%include "jtest.inc"
%include "jcmp.inc"


%define stack_guard_page	(kernel_end + 4095) & ~4095
%define stack_start			stack_guard_page + 4096

;; these segment offsets shouldn't change.
%assign GDT_NULL	0x00
%assign GDT_KCODE	0x08
%assign GDT_KDATA	0x10
%assign GDT_UCODE	0x18
%assign GDT_UDATA	0x20
%assign GDT_TSS		0x28

%assign PT_PML4		0x1000
%assign PT_PDPT		0x2000
%assign PT_PD		0x3000

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

%assign APIC_SPURIOUS_ISR	0xFF		;; must be less than 256, more than 31, and end in 'F'
%assign IOAPIC_BASE			0xFEC00000	;; this should be found dynamically

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
	
%endif ; %ifndef KERNEL_INC
