%ifndef STDLIB_NASM
%define STDLIB_NASM
;; NOTE: `err` as a type is just u32, and means that is the error value.
;; NOTE: `%pragma ignore` stuff is for the stdlib function table generation

%include "kernel.inc"

%include "stdmem.nasm"
%include "stdkbd.nasm"
%include "stdcurs.nasm"
%include "stdprint.nasm"

%pragma ignore file stdlib.nasm

halt:
	cli
.loop:
	hlt
	jmp 	.loop

reboot:
	;; reboot by causing a triple fault.
	lidt	[0]
	int 	INT_#DF

%pragma ignore subsystem RNG

%pragma ignore variable
pr_rand_state:
.0	dq 0
.1	dq 0
.2	dq 0
.3	dq 0

;; xoshiro256**
next_rand: ; u64 next_rand(void);
	mov 	rbx, qword [pr_rand_state.0]
	mov 	rcx, qword [pr_rand_state.1]
	mov 	rax, rcx
	imul	rax, 5
	rol 	rax, 7
	imul	rax, 9

	mov 	rdx, rcx
	shl 	rdx, 17
	xor 	rcx, qword [pr_rand_state.3]
	xor 	rbx, qword [pr_rand_state.2]
	xor 	qword [pr_rand_state.0], rcx
	rol 	rcx, 45
	mov 	qword [pr_rand_state.3], rcx
	xor 	qword [pr_rand_state.1], rbx
	xor 	rbx, rdx
	mov 	qword [pr_rand_state.2], rbx
	ret

splitmix64: ; u64 splitmix64(u64 z);
	mov 	rbx, 0x9e3779b97f4a7c15	;; Floor[2 / (1 + Sqrt[5]) 2^64]
	add 	rax, rbx				; z += 0x9e3779b97f4a7c15llu;

	mov 	rbx, rax				; // x = z;
	shr 	rbx, 30					; // x >>= 30;
	xor 	rax, rbx				; z ^= z >> 30;
	mov 	rcx, 0xbf58476d1ce4e5b9	;; 13787848793156543929
	imul	rax, rcx				; z *= 0xbf58476d1ce4e5b9llu;

	mov 	rbx, rax				; // x = z;
	shr 	rbx, 27					; // x >>= 27;
	xor 	rax, rbx				; z ^= z >> 27;
	mov 	rcx, 0x94d049bb133111eb	;; 10723151780598845931
	imul	rax, rcx				; z *= 0x94d049bb133111ebllu;

	mov 	rbx, rax				; // x = z;
	shr 	rbx, 31					; // x >>= 31;
	xor 	rax, rbx				; z ^= z >> 31;
	ret								; return z;

;; clobbers: rax, rbx, rcx, rdx
;; rdx is only clobbered if the length is not a multiple of 8
rand_fill: ; void rand_fill(u64 length, u8 *buffer);
	cld
	mov 	rcx, rax			;; rcx = length;
	xchg	rbx, rdi			;; rdi = buffer;

	jtz 	rax, rax, .ret		; if (length == 0) return;
	jtz 	al, 7, .preloop		; if (length % 8 == 0) do the fast way
.unaligned:
	rdrand_mac rax
	jcbe	rcx, 7, .unaligned_short

	;; write the full 8 bytes, but then just overwrite the last part in the main loop.
	mov 	qword [rdi], rax

	xor 	eax, eax
	mov 	al, cl
	and 	al, 7
	add 	rbx, rax	; ptr += length % 8;
.preloop:
	shr 	rcx, 3		;; length /= 8;
.loop:
	rdrand_mac rax

	stosq				;; *((u64 *) buffer)++ = rax;
	loop	.loop
.ret:
	mov 	rdi, rbx	;; restore
	ret
.unaligned_short:
	xor 	edx, edx
	mov 	dl, cl
	and 	dl, 7
	jmp 	[.unaligned_short@jump_table + 8*(edx - 1)]
.unaligned_short@jump_table:
	dq		.unaligned_short@1
	dq		.unaligned_short@2
	dq		.unaligned_short@3
	dq		.unaligned_short@4
	dq		.unaligned_short@5
	dq		.unaligned_short@6
	dq		.unaligned_short@7
.unaligned_short@7:
	stosb
	shr 	rax, 8
.unaligned_short@6:
	stosb
.unaligned_short@5:
	mov 	al, ah
	stosb
	shr 	rax, 16
.unaligned_short@4:
	stosd
	mov 	rdi, rbx	;; restore
	ret
.unaligned_short@3:
	mov 	al, ah
	stosb
.unaligned_short@2:
	stosb
	shr 	rax, 16
.unaligned_short@1:
	stosb
	mov 	rdi, rbx	;; restore
	ret

%pragma ignore subsystem disk

; disk_select:
	;; TODO: implement this. and then maybe move it into the kernel startup

;; NOTE: on errors, it returns a pointer to the start of the memory for the failed sector read.
; err disk_read(u64 sector, u16 cnt, u16 *mem);
disk_read:
	;; block address
	movzx	ebx, bx

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

	outb	IOPT_ATA_PIO1_CMD, ATA_PIO_CMD_READ
.poll_ready@read:
	;; poll until BSY = 0 and DRQ = 1
	inb 	IOPT_ATA_PIO1_CMD
	and 	al, ATA_PIO_STAT_BSY | ATA_PIO_STAT_DRQ
	jcne	al, ATA_PIO_STAT_DRQ, .poll_ready@read

	cld
	shl 	ebx, 8		;; change from sector count to word count
	mov 	eax, 65536 * 256
	test	ebx, ebx	;; if sector count == 0,
	cmovz	ebx, eax	;;     the actual sector count is 65536
	xchg	rcx, rdi	;; xchg instead of mov so it can be restored later
.read_loop:
	inw 	IOPT_ATA_PIO1_DATA

	stosw							;; *dst++ = ax;

	dec 	ebx						; if (--words == 0)
	jz  	.exit					;     goto exit;

	jtnz	bx, 255, .read_loop		; if (words % 256 != 0) continue;

	;; check the error bit after each sector
	inb 	IOPT_ATA_PIO1_STAT
	jtnz	al, ATA_PIO_STAT_ERR, .exit_dirty

	jmp 	.read_loop
.exit:
	;; check the error bit for the last sector
	inb 	IOPT_ATA_PIO1_STAT
	jtnz	al, ATA_PIO_STAT_ERR, .exit_dirty

	xor 	eax, eax	;; no errors
	mov 	rdi, rcx	;; restore
	ret
.exit_dirty:
	lea 	rax, [rdi - 512]
	xchg	rcx, rdi
	ret

;; clobbers: rax, rbx, rcx
;; NOTE: on errors, it returns a pointer to the start of the memory for the failed sector read.
; err disk_write(u64 sector, u16 cnt, u16 *mem);
disk_write:
	;; block address
	movzx	ebx, bx

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
	jcne	al, ATA_PIO_STAT_DRDY, .poll_ready@command

	outb 	IOPT_ATA_PIO1_CMD, ATA_PIO_CMD_WRITE
.poll_ready@write:
	;; poll until BSY = 0 and DRQ = 1
	inb 	IOPT_ATA_PIO1_CMD
	and 	al, ATA_PIO_STAT_BSY | ATA_PIO_STAT_DRQ
	jcne	al, ATA_PIO_STAT_DRQ, .poll_ready@write

	cld
	shl 	ebx, 8		;; change from sector count to word count
	mov 	eax, 65536 * 256
	test	ebx, ebx	;; if sector count == 0,
	cmovz	ebx, eax	;;     the actual sector count is 65536
	xchg	rcx, rsi	;; xchg instead of mov so it can be restored on exit.
.write_loop:
	lodsw							;; ax = *src++;
	outw	IOPT_ATA_PIO1_DATA, ax

	dec 	ebx						; if (--words == 0)
	jz  	.exit					;     goto exit;

	jtnz	bx, 255, .write_loop	; if (words % 256 != 0) continue

	;; check the error bit after each sector
	inb 	IOPT_ATA_PIO1_STAT
	jtnz	al, ATA_PIO_STAT_ERR, .exit_dirty

	jmp 	.write_loop
.exit:
	;; check the error bit for the last sector
	inb 	IOPT_ATA_PIO1_STAT
	jtnz	al, ATA_PIO_STAT_ERR, .exit_dirty

	xor 	eax, eax	;; no errors
	mov 	rsi, rcx	;; restore
	ret
.exit_dirty:
	lea 	rax, [rsi - 512]
	xchg	rcx, rsi
	ret
%endif ; %ifndef STDLIB_NASM
