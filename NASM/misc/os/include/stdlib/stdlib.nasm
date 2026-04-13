%ifndef STDLIB.NASM
%define STDLIB.NASM
;; NOTE: `err` as a type is just u32, and means that is the error value.
;; NOTE: `%pragma ignore` stuff is for the stdlib function table generation

%include "kernel.inc" ;; in case it wasn't already included

%include "stdmem.nasm"
%include "stdkbd.nasm"
%include "stdcurs.nasm"
%include "stdprint.nasm"

%pragma ignore file stdlib.nasm

%pragma ignore NOTE: noreturn
%pragma ignore NOTE: jmp to call
halt: ; noreturn void halt(void);
	cli
.loop:
	hlt
	jmp 	.loop

%pragma ignore NOTE: noreturn
%pragma ignore NOTE: jmp to call
reboot: ; noreturn void reboot(void);
	;; reboot by causing a triple fault.
	lidt	[0]
	int 	INT_#DF

%pragma ignore NOTE: jmp to call
not_implemented: ; void not_implemented(void);
	call	cls

	mov 	dword [VGA_ADDR(0,  0)], VGA_DWORD(VGA_ALERT, 'NO')
	mov 	dword [VGA_ADDR(0,  2)], VGA_DWORD(VGA_ALERT, 'T ')
	mov 	dword [VGA_ADDR(0,  4)], VGA_DWORD(VGA_ALERT, 'IM')
	mov 	dword [VGA_ADDR(0,  6)], VGA_DWORD(VGA_ALERT, 'PL')
	mov 	dword [VGA_ADDR(0,  8)], VGA_DWORD(VGA_ALERT, 'EM')
	mov 	dword [VGA_ADDR(0, 10)], VGA_DWORD(VGA_ALERT, 'EN')
	mov 	dword [VGA_ADDR(0, 12)], VGA_DWORD(VGA_ALERT, 'TE')
	mov 	word  [VGA_ADDR(0, 14)], VGA_WORD(VGA_ALERT, 'D')
	;; wait for a non-release keycode and then reset
.wait:
	call	next_keycode
	test	al, al
	js  	.wait

	jmp 	kernel_reset.after_cls

%pragma ignore NOTE: jmp to call
kernel_reset: ; void kernel_reset(void);
	call	cls
.after_cls:
	mov 	al, CURS_UNDERLINE
	call	set_cursor
	call	show_cursor

	zero	r0d
	zero	r1d
	zero	r2d
	zero	r3d
	zero	r4d
	zero	r5d
	mov 	r6d, stack_base
	zero	r7d
	zero	r8d
	zero	r9d
	zero	r10d
	zero	r11d
	zero	r12d
	zero	r13d
	zero	r14d
	zero	r15d

%ifdef APX
	zero	r16d
	zero	r17d
	zero	r18d
	zero	r19d
	zero	r20d
	zero	r21d
	zero	r22d
	zero	r23d
	zero	r24d
	zero	r25d
	zero	r26d
	zero	r27d
	zero	r28d
	zero	r29d
	zero	r30d
	zero	r31d
%endif

	reset_isr_timer
	kbd_reset
	jmp 	kernel_entry.start

%pragma ignore subsystem RNG

%pragma ignore variable
pr_rand_state:
.0: dq 0
.1: dq 0
.2: dq 0
.3: dq 0

;; xoshiro256**
;; clobbers: rax, rbx, rcx, rdx
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

;; clobbers: rax, rbx, rcx
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

;; clobbers: rax, rbx, rcx, (if length < 8: rdx)
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

	zero	eax
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
	zero	edx
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
disk_read: ; err disk_read(u64 sector, u16 cnt, u16 *mem);
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

	zero	eax			;; no errors
	mov 	rdi, rcx	;; restore
	ret
.exit_dirty:
	lea 	rax, [rdi - 512]
	mov 	rdi, rcx	;; restore
	ret

;; clobbers: rax, rbx, rcx
;; NOTE: on errors, it returns a pointer to the start of the memory for the failed sector read.
disk_write: ; err disk_write(u64 sector, u16 cnt, u16 *mem);
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

	zero	eax			;; no errors
	mov 	rsi, rcx	;; restore
	ret
.exit_dirty:
	lea 	rax, [rsi - 512]
	mov 	rdi, rcx	;; restore
	ret
%endif ; %ifndef STDLIB.NASM
