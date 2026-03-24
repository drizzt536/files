%ifndef STDLIB_NASM
%define STDLIB_NASM
;; NOTE: `err` as a type is just u32, and means that is the error value.
;; NOTE: `%pragma ignore` stuff is for the stdlib function table generation

%include "stdmem.nasm"
%include "stdcurs.nasm"
%include "stdprint.nasm"

%pragma ignore stdlib.nasm

halt:
	cli
.loop:
	hlt
	jmp 	.loop

;; returns scancode, scancode idx
;; clobbers: al, rbx
;; returns al=0 on failure.
;; set up so `call next_scancode` can immediately be followed by
;; either `jz .error` or `jnz .no_error` for fast processing.
;; the other flags aren't guaranteed, only the zero flag.
next_scancode: ; u8, u8 next_scancode(void);
	movzx	ebx, byte [rel keyring_read]
_next_scancode: ; u8, u8 _next_scancode(void _, u32 keyring_read);

	xor 	al, al
	cmp 	bl, byte [rel keyring_write]
	je  	.ret

	mov 	al, byte [keyring + ebx]

	inc 	bl
	mov 	byte [rel keyring_read], bl
	test	al, al
.ret:
	ret

disk_select:
	;; TODO: implement this. and then maybe move it into the kernel startup
	ret

;; NOTE: on errors, it returns a pointer to the start of the memory for the failed sector read.
; err disk_read(u64 sector, u16 cnt, u16 *mem);
disk_read:
	;; block address
	movzx 	ebx, bx

	;; rax = [63:56] [55:48] [47:40] [39:32] [31:24] [23:16] [15: 8] [ 7: 0]
	bswap	rax
	;; rax = [ 7: 0] [15: 8] [23:16] [31:24] [39:32] [47:40] [55:48] [63:56]
	shr 	rax, 16
	;; rax = [ 00h ] [ 00h ] [ 7: 0] [15: 8] [23:16] [31:24] [39:32] [47:40]

	outb	IOPT_ATA_PIO1_LBA_HIGH, al
	outb	IOPT_ATA_PIO1_LBA_MID, ah

	shr 	rax, 16
	;; rax = [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 7: 0] [15: 8] [23:16] [31:24]
	outb	IOPT_ATA_PIO1_LBA_LOW, al
	outb	IOPT_ATA_PIO1_LBA_HIGH, ah

	shr 	eax, 16
	;; eax = [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 00h ] [ 7: 0] [15: 8]
	outb	IOPT_ATA_PIO1_LBA_MID, al
	outb	IOPT_ATA_PIO1_LBA_LOW, ah

	;; sector count
	outb	IOPT_ATA_PIO1_SECTS, bh
	outb	IOPT_ATA_PIO1_SECTS, bl

.poll_ready@command:
	;; TODO: perhaps error out if this iterates more than like 31 times?
	inb 	IOPT_ATA_PIO1_CMD
	and 	al, ATA_PIO_STAT_BSY | ATA_PIO_STAT_DRDY
	cmp 	al, ATA_PIO_STAT_DRDY
	jne 	.poll_ready@command

	outb 	IOPT_ATA_PIO1_CMD, ATA_PIO_CMD_READ
.poll_ready@read:
	;; poll until BSY = 0 and DRQ = 1
	inb 	IOPT_ATA_PIO1_CMD
	and 	al, ATA_PIO_STAT_BSY | ATA_PIO_STAT_DRQ
	cmp 	al, ATA_PIO_STAT_DRQ
	jne 	.poll_ready@read

	;; fallthrough
	shl 	ebx, 8		;; change from sector count to word count
	mov 	eax, 65536 * 256
	test 	ebx, ebx	;; if sector count == 0,
	cmovz	ebx, eax	;;     the actual sector count is 65536
.read_loop:
	inw  	IOPT_ATA_PIO1_DATA

	mov 	word [rcx], ax
	add 	rcx, 2

	dec 	ebx		; if (--words == 0)
	jz  	.exit	;     goto exit;

	test	bx, 255		; if (words % 256 != 0)
	jnz 	.read_loop	;     continue;

	;; check the error bit after each sector
	inb 	IOPT_ATA_PIO1_STAT
	test	al, ATA_PIO_STAT_ERR
	jnz 	.exit_dirty

	jmp 	.read_loop
.exit:
	;; check the error bit for the last sector
	inb 	IOPT_ATA_PIO1_STAT
	test	al, ATA_PIO_STAT_ERR
	jnz 	.exit_dirty

	xor 	eax, eax	;; no errors
	ret
.exit_dirty:
	lea 	rax, [rcx - 512]
	ret

%endif ; %ifndef STDLIB_NASM
