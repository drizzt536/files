%ifndef IO_PORTS_INC
%define IO_PORTS_INC
; things without explicit sources are likely sourced from the OSDev Wiki
; src 1: IBM Personal System/2 Hardware Interface Technical Reference
; src 2: IBM Personal System/2 Hardware Interface Technical Reference - Video Subsystems

; NOTE: `_D` suffix means it is a data line, and no suffix means it is a command port.
%assign IOPT_PIC1		0x20	;; legacy 8259 PIC master command port
%assign IOPT_PIT_D1		0x40	;; PIT ISR timer channel 0 data port (IRQ0 timer)
%assign IOPT_PIT_D2		0x41	;; PIT ISR timer channel 0 data port (DRAM refresh timer, obsolete)
%assign IOPT_PIT_D3		0x42	;; PIT ISR timer channel 0 data port (PC speaker freq.)
%assign IOPT_PIT		0x43	;; PIT ISR timer command port
%assign IOPT_PS2_KBD_D	0x60	;; PS/2 keyboard data line (for scan codes)
%assign IOPT_PS2_KBD	0x64	;; PS/2 keyboard command port
%assign IOPT_CMOS		0x70	;; port used for NMI enable/disable
%assign IOPT_POST		0x80	;; Power On Self Test
%assign IOPT_A20		0x92	;; fast A20 line to allow memory higher than 1 MiB
%assign IOPT_PIC2		0xA0	;; legacy 8259 PIC slave command port

%assign IOPT_PIC1_D		IOPT_PIC1 + 1	;; legacy 8259 PIC master data port
%assign IOPT_PIC2_D		IOPT_PIC2 + 1	;; legacy 8259 PIC slave  data port

%assign IOPT_PS2_CRTCR	0x03D4 ; CRT Controller Register. [2, p. 2-53, pdf p. 79]
;; CRT is (cathode-ray tube). sometimes this register is at 0x03B4 instead,
;; specifically, it is the B one if it is monochrome.

; NOTE: IRQs are listed here (5, 10, 11, and 15 are reserved): [1, p. 07-1, pdf p. 262]
; NOTE: some keyboard information is listed starting here: [1, p. 10-001, pdf p. 332]
; NOTE: scancode stuff is listed starting here: [1, p. 14-001, pdf p. 506]

; 14, 42, 45, 56, 59, 63, 65-74, 77-78, 82, 87-88, 94, 107, 109, 111, 127
; 102-key keyboards will not be supported.
%endif ; %ifndef IO_PORTS_INC
