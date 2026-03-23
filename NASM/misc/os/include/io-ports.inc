%ifndef IO_PORTS_INC
%define IO_PORTS_INC
; things without explicit sources are likely sourced from the OSDev Wiki
; src 1: IBM Personal System/2 Hardware Interface Technical Reference
; src 2: IBM Personal System/2 Hardware Interface Technical Reference - Video Subsystems

; NOTE: `_D` suffix means it is a data line, and no suffix means it is a command port.
%assign IOPT_PIC1		0x20	;; legacy 8259 PIC master command port
%assign IOPT_PIC1_D		0x21	;; legacy 8259 PIC master data port
%assign IOPT_PIT_D1		0x40	;; PIT channel 0 data port (IRQ0 timer)
%assign IOPT_PIT_D2		0x41	;; PIT channel 0 data port (obsolete DRAM refresh timer)
%assign IOPT_PIT_D3		0x42	;; PIT channel 0 data port (PC speaker freq.)
%assign IOPT_PIT		0x43	;; PIT command port
%assign IOPT_PS2_KBD_D	0x60	;; PS/2 keyboard data line (for scan codes)
%assign IOPT_PS2_KBD	0x64	;; PS/2 keyboard command port
%assign IOPT_CMOS		0x70	;; port used for NMI enable/disable
%assign IOPT_POST		0x80	;; Power On Self Test
%assign IOPT_A20		0x92	;; fast A20 line to allow memory higher than 1 MiB
%assign IOPT_PIC2		0xA0	;; legacy 8259 PIC slave command port
%assign IOPT_PIC2_D		0xA1	;; legacy 8259 PIC slave  data port

%ifdifi
	status/command bits
	BSY (bit 7): Drive is busy, ignore all other bits until this clears.
	DRDY (bit 6): Drive is ready to accept a command.
	DRQ (bit 3): Drive has data ready for you to read (or is ready to accept data from you).
	ERR (bit 0): An error occurred; read the Error register for details.
%endif


;; PIO1 is the primary and PIO2 is the secomndary

%assign IOPT_ATA_PIO1_CTRL		0x03F6
%assign IOPT_ATA_PIO1_BASE		0x01F0
%assign IOPT_ATA_PIO1_DATA		0x01F0	;; 16-bit sector data
%assign IOPT_ATA_PIO1_ERR_FEAT	0x01F1	;; error info on read, hints to drive on write
%assign IOPT_ATA_PIO1_SECTS		0x01F2	;; number of sectors
%assign IOPT_ATA_PIO1_LBA_LOW	0x01F3	;; LBA[7:0]
%assign IOPT_ATA_PIO1_LBA_MID	0x01F4	;; LBA[15:8]
%assign IOPT_ATA_PIO1_LBA_HIGH	0x01F5	;; LBA[23:16]
%assign IOPT_ATA_PIO1_DRV_HEAD	0x01F6	;; master/slave select and LBA[27:24]
%assign IOPT_ATA_PIO1_STAT_CMT	0x01F7	;; status/command

%assign IOPT_ATA_PIO2_CTRL		0x0376
%assign IOPT_ATA_PIO2_BASE		0x0170
%assign IOPT_ATA_PIO2_DATA		0x0170	;; 16-bit sector data
%assign IOPT_ATA_PIO2_ERR_FEAT	0x0171	;; error info on read, hints to drive on write
%assign IOPT_ATA_PIO2_SECTS		0x0172	;; number of sectors
%assign IOPT_ATA_PIO2_LBA_LOW	0x0173	;; LBA[7:0]
%assign IOPT_ATA_PIO2_LBA_MID	0x0174	;; LBA[15:8]
%assign IOPT_ATA_PIO2_LBA_HIGH	0x0175	;; LBA[23:16]
%assign IOPT_ATA_PIO2_DRV_HEAD	0x0176	;; master/slave select and LBA[27:24]
%assign IOPT_ATA_PIO2_STAT_CMT	0x0177	;; status/command

;; NOTE: For LBA48 instead of LBA28, you write to each port twice,
;;       once with the upper value, and again with the lower value.
;;       The LBA bits in the drive head port are unused for LBA48

%assign IOPT_PS2_CRTCR	0x03D4	;; CRT Controller Register. [2, p. 2-53, pdf p. 79]
;; CRT is (cathode-ray tube). sometimes this register is at 0x03B4 instead,
;; specifically, it is the B one if it is monochrome.

;; NOTE: IRQs are listed here (5, 10, 11, and 15 are reserved): [1, p. 07-1, pdf p. 262]
;; NOTE: some keyboard information is listed starting here: [1, p. 10-001, pdf p. 332]
;; NOTE: scancode stuff is listed starting here: [1, p. 14-001, pdf p. 506]

;; 14, 42, 45, 56, 59, 63, 65-74, 77-78, 82, 87-88, 94, 107, 109, 111, 127
;; 102-key keyboards will not be supported.
%endif ; %ifndef IO_PORTS_INC
