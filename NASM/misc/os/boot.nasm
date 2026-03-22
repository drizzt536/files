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

;; the address the kernel will be loaded to in real mode
;; 0x9FC00:0x9FFFF (inclusive of both) is technically usable, but sometimes the BIOS uses it.
%assign KERNEL_ADDR_1E 0x9FC00
%assign KERNEL_ADDR_1S KERNEL_ADDR_1E - KERNEL_SIZE

;; the address the kernel is moved to in long mode.
%assign KERNEL_ADDR_2S 0x100000
%assign KERNEL_ADDR_2E 0x100000 + KERNEL_SIZE

%define DISK_FAIL_MSG "ERR:Disk Read: Sect 2"

%if KERNEL_SECTORS > 1
	%xdefine DISK_FAIL_MSG %strcat(DISK_FAIL_MSG, %num(2 + KERNEL_SECTORS - 1))
%endif

%define NO_LONG_MODE_MSG "ERR:No x64"

;; NOTE: this ID number is changed programmatically. 1 is just the default.
%xdefine MISSING_FEATURES_MSG "ERR:CPU missing features"

%assign VGA_BUF 0xb8000

%assign PT_PML4_BASE	0x1000
%assign PT_PDPT0_BASE	0x2000
%assign PT_PD0_BASE		0x3000
%assign PT_PT0_BASE		0x4000
%assign PT_PAGES		3

;; both of these have to fit in 16 bits
%assign TSS_BASE		0x500
%assign TSS_SIZE		104		;; minimim size is 104 bytes
%assign gdt64			TSS_BASE + TSS_SIZE

start16: ;; real mode entrypoint
	cli	;; disable maskable interrupts

	;; Temporarily disable non-maskable interrupts
	in  	al, IOPT_CMOS
	or  	al, 80h
	out 	IOPT_CMOS, al

	;; the stack segment register is updated in a couple instructions

	;; NOTE: each disk read takes 19 bytes of instructions.

	mov 	bx, KERNEL_ADDR_1S >> 4
	mov 	es, bx

	mov 	ax, 02h << 8 | KERNEL_SECTORS
	xor 	bx, bx				;; the lower 4 bits of the address will always be 0
	mov 	ss, bx				;; put here to avoid an exra xor
	mov 	cx, 00h << 8 | 02h	;; cylinder 0, start at sector 2
	xor 	dh, dh				;; head 0
	;; the BIOS passes the drive number in dl already.
	int 	13h
	jc  	disk_error	;; `int 13h` sets the carry flag on a disk read error

	;; has to be after the disk read

	;; it should already be in VGA text mode, but this also clears the screen.
	;; specifically, in the case that the CPU doesn't support long mode, this makes it print correctly
	mov 	ax, 0003h	;; 80x25 16-color VGA text mode
	int 	10h

	;; set the A20 line. allow memory higher than 1 MiB
	in  	al, IOPT_A20

	or  	al, 2
	and 	al, ~(1 << 0)	;; clear the 0th bit
	out 	IOPT_A20, al
	;; switch to protected (32-bit) mode
	lgdt	[gdt.ptr]
	mov 	eax, cr0
	or  	al, 1
	mov 	cr0, eax
	jmp 	gdt.kcode_ofs:start32	;; set CS and jump to start32

disk_error:
	mov 	si, disk_fail_msg
	mov 	cx, %strlen(DISK_FAIL_MSG)
.print:	;; assumes there is at least on character (which is true)
	lodsb

	mov 	ah, 0eh	;; teletype output
	int 	10h		;; video

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

	mov 	edi, VGA_BUF	;; print to the start of the screen
.loop:		;; print out the error message
	dec 	ecx
	movsb	;; [edi] = [esi], esi++, edi++
	inc 	edi
	test	ecx, ecx
	jnz 	.loop

	hlt

missing_features:
	;; use BMI2 as a baseline to assume most other instruction sets exist.
	mov 	ecx, %strlen(MISSING_FEATURES_MSG)
	mov 	esi, missing_features_msg
	jmp 	refusing_boot

start32: ;; protected mode entrypoint
	cld	;; for later
	;; CS is already set to the correct value.
	mov 	ax, gdt.kdata_ofs
	mov 	ds, ax
	mov 	es, ax
	mov 	fs, ax
	mov 	ss, ax
	mov 	gs, ax

	;; see ./docs/cpu-features.txt for more information on the CPU feature requirements

	mov 	eax, 80000001h
	cpuid

	bt  	edx, 29	;; check for long mode
	jnc 	no_long_mode

	mov 	eax, 1
	cpuid	;; basic features, part 0

	mov 	eax, 01110110111110000011001000001011b
	and 	ecx, eax	;; NOTE: there is also an EDX, but that has older stuff.
	xor 	ecx, eax			; if ((features & mask) ^ mask != 0)
	jnz 	missing_features	;     goto missing_features;

	mov 	eax, 7		;; advanced features
	xor 	ecx, ecx	;; leaf 0
	cpuid
	;; NOTE/TODO: APX (APX_F) and AVX10.1 will be in CPUID.(0x7.0x1).EDX. (indices 21 and 19 respectively)

	mov 	eax, 00100000000011000000000100101000b
	and 	ebx, eax	;; CPUID.(0x7.0x0).EBX
	xor 	ebx, eax
	jnz 	missing_features

	mov 	edi, PT_PML4_BASE			;; page dictionary address. PML4 starts at 0x1000
	mov 	cr3, edi
	xor 	eax, eax
	mov 	ecx, 1024*(3 + PT_PAGES)	;; clear the pages: PML4 + PDPT + PD + 2 extra pages
	rep 	stosd
	mov 	edi, cr3

	;; PML4[0] = PDPT0
	mov 	dword [edi], PT_PDPT0_BASE + 0x3
	add 	edi, 1000h			;; edi = PDPT0_BASE

	;; PDPT0[0] = PD0
	mov 	dword [edi], PT_PD0_BASE + 0x3
	add 	edi, 1000h			;; edi = PD0_BASE

	;; set PD0 entries
	mov 	esi, PT_PT0_BASE + 0x3
	mov 	ecx, PT_PAGES
.set_pd_entry:
	mov 	dword [edi], esi	;; PD[i] points to PT at 0x4000 + 1000h*i
	add 	esi, 1000h			;; next PT is 4KiB further in memory
	add 	edi, 8				;; next PD entry
	loop	.set_pd_entry

	mov 	edi, PT_PT0_BASE
	mov 	ebx, 11b			;; present and read/write bit
	mov 	ecx, 512 * PT_PAGES	;; number of entries in the page table
.set_pt_entry:
	mov 	dword [edi], ebx
	add 	ebx, 1000h
	add 	edi, 8
	loop	.set_pt_entry		;; set the next entry

	;; update the control registers to make it actually long mode

	mov 	eax, cr4
	or  	al, 1 << 5			;; set the PAE-bit (bit 5)
	mov 	cr4, eax

	mov 	ecx, 0xC0000080		;; EFER MSR
	rdmsr
	bts 	eax, 8				;; set the LM-bit (bit 8)
	wrmsr

	mov 	eax, cr0
	bts 	eax, 31		;; Set the PG-bit (bit 31)
	mov 	cr0, eax

	;; update the code segment flags to work with 64-bit mode.
	;; the ring 3 user space code flags are already set to the 64-bit mode

	mov 	edi, gdt64
	mov 	esi, gdt
	xor 	ecx, ecx
	mov 	cl, gdt.size + 3 >> 2	;; round up to the nearest 4 bytes.
	rep 	movsd

	xor 	byte [gdt64 + gdt.kcode_ofs + 6], 1100000b
	mov 	dword [gdt64 + gdt.ptr_ofs + 2], gdt64

	lgdt	[gdt64 + gdt.ptr_ofs]
	jmp 	gdt.kcode_ofs:start64	;; Set the code segment and enter 64-bit long mode.

bits 64
start64:
	;; NOTE: the GDT offsets did not change since protected mode, so updating them again is redundant.

	;; move the kernel to where it is supposed to be
	std	;; set the direction bit for a backwards move
	;; subtract 8 because they are qwords, and the end address is not inclusive
	mov 	esi, KERNEL_ADDR_1E - 8	;; source
	mov 	edi, KERNEL_ADDR_2E - 8	;; destination
	mov 	ecx, KERNEL_SIZE >> 3	;; KERNEL_SIZE / 8
	rep 	movsq	;; move the kernel 8 bytes at a time. 512 is a multiple of 8

	;; re-enable non-maskable interrupts
	in  	al, IOPT_CMOS
	and 	al, 0x7F
	out 	IOPT_CMOS, al

	jmp 	qword [KERNEL_ADDR_2S]

;;;;;;;;;;;;;;;;;;;;;;;;;;;;; data stuff ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

disk_fail_msg: db DISK_FAIL_MSG
no_long_mode_msg: db NO_LONG_MODE_MSG
missing_features_msg: db MISSING_FEATURES_MSG


;; https://wiki.osdev.org/Global_Descriptor_Table
;; https://wiki.osdev.org/Setting_Up_Long_Mode#Entering_the_64-bit_Submode

gdt:
.null: equ $ - gdt
	dq		0			;; null descriptor
;; ring 0 segments
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
	db		10101111b ;; already set to the long mode flags
	db		0
.udata_ofs: equ $ - gdt
	dd		0xFFFF
	db		0
	db		11110010b
	db		11001111b
	db		0
;; this takes up 2 GDT slots. idk if this works.
.tss_ofs: equ $ - gdt
	dw		%eval(TSS_SIZE - 1)	;; limit [15:0]
	dw		TSS_BASE			;; base [15:0]
	db		0					;; base [23:16]
	db		0x89				;; P=1, DPL=0, type=0x9 (64-bit TSS available)
	db		0					;; G=0, limit [19:16]
	db		0					;; base [31:24]
	dd		0					;; base [63:32]
	dd		0					;; reserved
.ptr:
.ptr_ofs: equ $ - gdt
	dw		$ - gdt - 1
	dq		gdt			;; the last 4 bytes don't matter, but should be there for long mode.
.size: equ $ - gdt

%if $ - $$ <= 510
	;; fill the rest of the sector
	times 510 - ($ - $$) nop
	db 0x55, 0xAA
%else
	;; the build step for boot.bin will catch the length error and give a better error message than NASM will
	align 512
%endif
