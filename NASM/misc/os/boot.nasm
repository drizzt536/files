bits 16
default abs
org 0x7c00

;; NOTE: For various reasons, this only works on little endian systems.

%include "io-ports.inc"

;; size of the kernel in sectors. must be between 1 and 127 (inclusive).
;; technically it can be up to 1215, but that would require extra disk reads.
;; 1215 assumes no more bootloader sectors are loaded after the first one, which is true as of writing this.
%ifndef KERNEL_SECTORS
	%assign KERNEL_SECTORS	1
%endif

%ifnnum KERNEL_SECTORS
	%fatal -DKERNEL_SECTORS was given with a non-numeric value (KERNEL_SECTORS)
%endif

%if KERNEL_SECTORS > 127
	%fatal -DKERNEL_SECTORS cannot be given a value larger than 127. this would require extra interrupts.
%endif

%assign KERNEL_SIZE KERNEL_SECTORS * 512

; the address the kernel will be loaded to in real mode
; 0x9FC00 : 0x9FFFF (inclusive of both) is technically usable, but sometimes the BIOS uses it.
%assign KERNEL_ADDR_1E 0x9FC00
%assign KERNEL_ADDR_1S KERNEL_ADDR_1E - KERNEL_SIZE

; the address the kernel is moved to in protected mode.
%assign KERNEL_ADDR_2S 0x100000
%assign KERNEL_ADDR_2E 0x100000 + KERNEL_SIZE

%define DISK_FAIL_MSG "ERR:Disk Read: Sect 2"

%if KERNEL_SECTORS > 1
	%xdefine DISK_FAIL_MSG %strcat(DISK_FAIL_MSG, %num(2 + KERNEL_SECTORS - 1))
%endif

%define NO_LONG_MODE_MSG "ERR:No x64"

; NOTE: this ID number is changed programmatically. 1 is just the default.
%xdefine MISSING_FEATURES_MSG "ERR:CPU missing features. id: 1"
%xdefine MISSING_FEATURES_ID_ADDR missing_features_msg + %strlen(MISSING_FEATURES_MSG) - 1

%assign VGA_BUF 0xb8000

start16: ; real mode entrypoint
	cli	; disable maskable interrupts

	; Temporarily disable non-maskable interrupts
	in  	al, IOPT_CMOS
	or  	al, 80h
	out 	IOPT_CMOS, al

	mov 	sp, 0x7C00	; put the stack right before the bootloader in case something needs it
	mov 	bp, sp
	; the stack segment register is updated in a couple instructions

	;; NOTE: each disk read takes 19 bytes of instructions.

	mov 	bx, KERNEL_ADDR_1S >> 4
	mov 	es, bx

	mov 	ax, 02h << 8 | KERNEL_SECTORS
	xor 	bx, bx				; the lower 4 bits of the address will always be 0
	mov 	ss, bx				; put here to avoid an exra xor
	mov 	cx, 00h << 8 | 02h	; cylinder 0, start at sector 2
	xor 	dh, dh				; head 0
	; the BIOS passes the drive number in dl already.
	int 	13h
	jc  	disk_error	; `int 13h` sets the carry flag on a disk read error

	;; has to be after the disk read

	;; it should already be in VGA text mode, but this also clears the screen.
	;; specifically, in the case that the CPU doesn't support long mode, this makes it print correctly
	mov 	ax, 0003h	; 80x25 16-color VGA text mode
	int 	10h

	; set the A20 line. allow memory higher than 1 MiB
	in  	al, IOPT_A20
	test 	al, 2
	jnz 	.a20_line_set

	or  	al, 2
	and 	al, 0xFE	; clear the 0th bit
	out 	IOPT_A20, al
.a20_line_set:
	; switch to protected (32-bit) mode
	lgdt	[gdt.ptr]
	mov 	eax, cr0
	or  	al, 1
	mov 	cr0, eax
	jmp 	gdt.kcode_ofs:start32	; set cs and jump to start32

disk_error:
	mov 	si, disk_fail_msg
	mov 	cx, %strlen(DISK_FAIL_MSG)
.print:	; assumes there is at least on characer (which is true)
	lodsb

	mov 	ah, 0eh	; teletype output
	int 	10h		; video

	loop 	.print
	hlt

bits 32

no_long_mode:
	;; move the cursor after the message
	mov 	ecx, %strlen(NO_LONG_MODE_MSG)
	mov 	esi, no_long_mode_msg
;	jmp 	refusing_boot

refusing_boot:
	;; ecx = length, esi = msg should happen prior to jumping here

	;; hide the cursor
	mov 	dx, IOPT_PS2_CRTCR	; VGA control port
	mov 	al, 0Ah				; Cursor start register
	out 	dx, al

	inc 	dl				; 0x3D5 is data port. `inc dx` isn't required because there is no overflow.
	mov 	al, 1 << 5		; Set bit 5 to disable the cursor
	out 	dx, al

	mov 	edi, VGA_BUF	; print to the start of the screen
.loop: ; print out the error message
	dec 	ecx
	; this can't be `rep movsb` because it is 
	movsb	; [edi] = [esi], esi++, edi++
	inc 	edi
	test 	ecx, ecx
	jnz 	.loop

	hlt

missing_features:
	;; use BMI2 as a baseline to assume most other instruction sets exist.
	mov 	ecx, %strlen(MISSING_FEATURES_MSG)
	mov 	esi, missing_features_msg
	jmp 	refusing_boot

start32: ; protected mode entrypoint
	; CS is already set to the correct value.
	mov 	ax, gdt.kdata_ofs
	mov 	ds, ax
	mov 	es, ax
	mov 	fs, ax
	mov 	ss, ax
	mov 	gs, ax

	;; see ./docs/cpu-features.txt for more information on the CPU feature requirements

	mov 	eax, 80000001h
	cpuid

	bt  	edx, 29	; check for long mode
	jnc 	no_long_mode

	;; TODO: this might not work on AMD, where LZCNT is supported via ABM
	bt  	ecx, 5	; LZCNT
	jnc 	missing_features	; group 1 feature check

	mov 	byte [MISSING_FEATURES_ID_ADDR], '2'	; group 2 feature check
	mov 	eax, 1
	cpuid	; basic features, part 0

	mov 	eax, 01110110111110000011001000001011b
	and  	ecx, eax ; NOTE: this tests `CPUID.01H.ECX` there is also an EDX, but that has older stuff.
	xor 	ecx, eax			; if ((features & mask) ^ mask != 0)
	jnz 	missing_features	;     goto missing_features;

	mov 	byte [MISSING_FEATURES_ID_ADDR], '3'	; group 3 feature check
	mov 	eax, 7		; advanced features
	xor 	ecx, ecx	; part 1
	cpuid
	; NOTE/TODO: APX (APX_F) and AVX10.1 will be in CPUID.(0x7.0x1).EDX. (indices 21 and 19 respectively)

	mov 	eax, 00100000000011000000000100101000b
	and  	ebx, eax ; CPUID.(0x7.0x1).EBX
	xor 	ebx, eax
	jnz 	missing_features

	;; I basically directly copied this up until the `xgetbv` from wiki.osdev.org
	;; TODO: figure out what this all does. I know it turns on paging, but nothing deeper than that.
	mov 	edi, 0x1000	; page dictionary address
	mov 	cr3, edi
	xor 	eax, eax
	mov 	ecx, 4096
	rep		stosd		; clear the memory
	mov 	edi, cr3

	mov 	dword [edi], 0x1003 + 4096*1
	add 	edi, 4096
	mov 	dword [edi], 0x1003 + 4096*2
	add 	edi, 4096
	mov 	dword [edi], 0x1003 + 4096*3
	add 	edi, 4096

	mov 	ebx, 3		; present and read/write bit
	mov 	ecx, 512	; number of entries in the page table
.set_page_entry:
	mov 	dword [edi], ebx
	add 	ebx, 4096
	add 	edi, 8
	loop	.set_page_entry		; set the next entry

	;; update the control registers to make it actually long mode

	mov 	eax, cr4
	or  	eax, 1 << 5 | 1 << 18	; set the PAE-bit (bit 5), and the OSXSAVE bit (bit 18)
	mov 	cr4, eax

	; turn on AVX and AVX2
	xgetbv				; XCR0
	xor 	ecx, ecx
	or  	al, 111b	; AVX, SSE, x87 bits
	xsetbv				; Save back to XCR0

	mov 	ecx, 0xC0000080		; EFER MSR
	rdmsr
	bts 	eax, 8				; set the LM-bit (bit 8)
	wrmsr

	mov 	eax, cr0
	bts 	eax, 31		; Set the PG-bit (bit 31)
	mov 	cr0, eax

	xor 	byte [gdt.kcode + 6], 1100000b	; update the code segment flags to work with 64-bit mode.
	; the ring 3 user space code flags are already set to the 64-bit mode because it doesn't break anything.

;	lgdt	[gdt.ptr]	; redundant instruction,  the pointer didn't change.
	jmp 	gdt.kcode_ofs:start64	; Set the code segment and enter 64-bit long mode.

bits 64
start64:
	;; NOTE: the GDT offsets did not change since protected mode, so updating them again is redundant.

	;; move the kernel to where it is supposed to be
	std ; set the direction bit for a backwards move
	; subtract 8 because they are qwords, and the end address is not inclusive
	mov 	esi, KERNEL_ADDR_1E - 8	; source
	mov 	edi, KERNEL_ADDR_2E - 8	; destination
	mov 	ecx, KERNEL_SIZE >> 3	; KERNEL_SIZE / 8
	rep 	movsq	; move the kernel 8 bytes at a time. 512 is a multiple of 8

	; re-enable non-maskable interrupts
	in  	al, IOPT_CMOS
	and 	al, 0x7F
	out 	IOPT_CMOS, al

	jmp 	qword [KERNEL_ADDR_2S]

;;;;;;;;;;;;;;;;;;;;;;;;;;;;; data stuff ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

disk_fail_msg: db DISK_FAIL_MSG
no_long_mode_msg: db NO_LONG_MODE_MSG
missing_features_msg: db MISSING_FEATURES_MSG


; https://wiki.osdev.org/Global_Descriptor_Table
; https://wiki.osdev.org/Setting_Up_Long_Mode#Entering_the_64-bit_Submode
;; NOTE: there is space for one more GDT entry before overflowing the sector.

gdt:
.null: equ $ - gdt
	dq		0			; null descriptor
; ring 0 segments
.kcode:
.kcode_ofs: equ $ - gdt
	dd		0xFFFF
	db		0
	db		10011010b
	db		11001111b
	db		0
.kdata_ofs: equ $ - gdt
	dd		0xFFFF
	db		0
	db		10010010b
	db		11001111b
	db		0
; ring 3 segments
.ucode_ofs: equ $ - gdt
	dd		0xFFFF
	db		0
	db		11111010b
	db		10101111b ; already set to the long mode flags
	db		0
.udata_ofs: equ $ - gdt
	dd		0xFFFF
	db		0
	db		11110010b
	db		11001111b
	db		0
; idk what this is for
.tss_ofs: equ $ - gdt
	dd		0x00000068
	dd		0x00CF8900
.ptr:
	dw		$ - gdt - 1
	dq		gdt			; the last 4 bytes don't matter, but should be there for long mode.

%if $ - $$ <= 510
	; fill the rest of the sector
	times 510 - ($ - $$) nop
	db 0x55, 0xAA
%else
	; the build step for boot.bin will catch the length error and give a better error message than NASM will
	align 512
%endif
