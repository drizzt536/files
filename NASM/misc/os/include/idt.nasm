%ifndef IDT_INC
%define IDT_INC

;; this should get included into kernel.nasm

;; https://wiki.osdev.org/Interrupt_Descriptor_Table
;; https://wiki.osdev.org/Interrupt_Service_Routines
;; https://wiki.osdev.org/PS/2_Keyboard#Scan_Code_Set_1

%assign KEYRING_ESC_NONE	0
%assign KEYRING_ESC_EXT		1
%assign KEYRING_ESC_PB1		2
%assign KEYRING_ESC_PB2		3

keyring_escape	db KEYRING_ESC_NONE		;; written and read only in the ISR
keyring_rw_word:						;; label for read/write, regardless of which is first
keyring_write	db 0					;; written in the ISR, read in the kernel
keyring_read	db 0					;; read in the ISR, written in the kernel
keyring			times 256 db 0			;; written in the ISR, read in the kernel

;; NOTE: the internal clock speed is 1193182Hz, with a variable divisor from 1 to 65536.
;;       the default divisor is 65536
isr_timer: dd 0

%xdefine IDT_HFN_DEFAULT_MSG "Received INT 0x"
idt_hfn_default_msg: db IDT_HFN_DEFAULT_MSG

;; default idt handler function. just print the interrupt number and return.
idt_hfn_default:
	;; assume the handler stubs do `push rax` and `mov eax, interrupt_number`

	;; don't call `cls` because the content on the rest of the screen could help
	;; you figure out what went wrong and/or caused the unknown interrupt

	push	rbx
	push	rcx
	push	rdx
	push	rdi
	push	rsi

	cld		;; forwards iteration
	mov 	dl, al

	mov 	esi, idt_hfn_default_msg
	mov 	ecx, %strlen(IDT_HFN_DEFAULT_MSG)
	mov 	edi, VGA_BUF
	mov 	ah, VGA_DEFAULT
.loop:
	;; This is basically print_u8hex, but inlined with simpler and with some stuff removed.
	lodsb	;; al = [esi]
	stosw	;; [edi] = ax

	dec 	ecx
	jnz 	.loop

	;; print the hex digits for the interrupt number.
	;; I think this part is an inlined version of print_u8hex
	mov 	cl, dl

	mov 	al, cl
	shr 	al, 4
	add 	al, '0'
	lea 	ebx, [eax + 'A' - ('9' + 1)]
	cmp 	al, '9'
	cmova	eax, ebx
	stosw

	mov 	al, cl
	and 	al, 0x0f
	add 	al, '0'
	lea 	ebx, [eax + 'A' - ('9' + 1)]
	cmp 	al, '9'
	cmova	eax, ebx
	stosw

	mov 	al, '.'
	stosw

	pop 	rsi
	pop 	rdi
	pop 	rdx
	pop 	rcx
	pop 	rbx
	ret

keyring_scancode_map:
%assign i 0
%rep 256
	%if i == 0x01
		db 0x39
	%elif i == 0x1C
		db 0x35
	%elif i == 0x1D
		db 0x37
	%elif i == 0x2A
		db 0x36
	%elif i == 0x35
		db 0x1C
	%elif i == 0x37
		db 0x1D
	%elif i == 0x39
		db 0x01
	%elif i == 0x3A
		db 0x00
	%elif i == 0x45
		db 0x00
	%elif i == 0x46
		db 0x00
	%elif i == 0x47
		db 0x08
	%elif i == 0x48
		db 0x09
	%elif i == 0x49
		db 0x0A
	%elif i == 0x4A
		db 0x0C
	%elif i == 0x4B
		db 0x05
	%elif i == 0x4C
		db 0x06
	%elif i == 0x4D
		db 0x07
	%elif i == 0x4E
		db 0x2A
	%elif i == 0x4F
		db 0x02
	%elif i == 0x50
		db 0x03
	%elif i == 0x51
		db 0x04
	%elif i == 0x52
		db 0x0B
	%elif i == 0x53
		db 0x34
	%elif i == 0x57
		db 0x48
	%elif i == 0x58
		db 0x49
	%elif i == 0x81
		db 0xB9
	%elif i == 0x9C
		db 0xB5
	%elif i == 0x9D
		db 0xB7
	%elif i == 0xAA
		db 0x36
	%elif i == 0xB5
		db 0x9C
	%elif i == 0xB6
		db 0x36
	%elif i == 0xB7
		db 0x9D
	%elif i == 0xB9
		db 0x81
	%elif i == 0xBA
		db 0x36
	%elif i == 0xC5
		db 0x45
	%elif i == 0xC6
		db 0x46
	%elif i == 0xC7
		db 0x88
	%elif i == 0xC8
		db 0x89
	%elif i == 0xC9
		db 0x8A
	%elif i == 0xCA
		db 0x8C
	%elif i == 0xCB
		db 0x85
	%elif i == 0xCC
		db 0x86
	%elif i == 0xCD
		db 0x87
	%elif i == 0xCE
		db 0xAA
	%elif i == 0xCF
		db 0x82
	%elif i == 0xD0
		db 0x83
	%elif i == 0xD1
		db 0x84
	%elif i == 0xD2
		db 0x8B
	%elif i == 0xD3
		db 0xB4
	%elif i == 0xD7
		db 0xC8
	%elif i == 0xD8
		db 0xC9
	%elif (i | 80h) == 0x80 || (i | 80h) == 0xD5 || (i | 80h) == 0xD6 || \
			0xD9 <= (i | 80h) && (i | 80h) <= 0xFF
		;; these scancodes don't exist. just map them all to 0.

		db 0
	%else
		db %hex(i)
	%endif	;; switch/case

	%assign i i + 1
%endrep ; keyring_scancode_map
%undef i

;; NOTE: indices higher than 77 don't exist
;; NOTE: map[i] => keyring_extended_scancode_map[i - 144] + 128 for bit 7 set,
;;       and map[i] => keyring_extended_scancode_map[i - 16] + 0 for bit 7 not set
keyring_extended_scancode_map:
%assign i 16
%rep 256
	%if i == 0x10
		db 0x56
	%elif i == 0x19
		db 0x57
	%elif i == 0x1C
		db 0x35
	%elif i == 0x1D
		db 0x37
	%elif i == 0x20
		db 0x58
	%elif i == 0x22
		db 0x59
	%elif i == 0x24
		db 0x5A
	%elif i == 0x2E
		db 0x5B
	%elif i == 0x30
		db 0x5C
	%elif i == 0x35
		db 0x1C
	%elif i == 0x37
		db 0x54
	%elif i == 0x38
		db 0x38
	%elif i == 0x47
		db 0x51
	%elif i == 0x48
		db 0x4A
	%elif i == 0x49
		db 0x4E
	%elif i == 0x4B
		db 0x4D
	%elif i == 0x4D
		db 0x4B
	%elif i == 0x4F
		db 0x52
	%elif i == 0x50
		db 0x4C
	%elif i == 0x51
		db 0x4F
	%elif i == 0x53
		db 0x3A
	%elif i == 0x5B
		db 0x47
	%elif i == 0x5C
		db 0x47
	%elif i == 0x5D
		db 0x50
		%exitrep
	%else
		db 0
	%endif ;; switch/case

	%assign i i + 1
%endrep ; keyring_extended_scancode_map
%undef i

%assign idt_idx 0

;; declare the handler vectors
%rep 256
	idt_hfn_%[idt_idx]_ofs: equ KERNEL_START + ($ - $$)
	idt_hfn_%[idt_idx]:

	%if idt_idx == INT_#PF
		;; page fault
		%ifdifi
			error code (top value on the stack, QWORD)

			bit 0:  1 => protection violation  0 => unmapped page
			bit 1:  1 => fault on write        0 => fault on read
			bit 2:  1 => fault in usermode     0 => fault in kernel
			bit 4:  1 => instruction fetch (NX violation)
		%endif

		xchg	rax, qword [rsp]
		test	al, 1 << 2
		jz  	.kernel_panic

		;; fallthrough
	.normal_error:
		;; TODO: do something else here since this will just return back to the same instruction
		;;       that page faults. there is no user mode yet, so I don't really care.
		mov 	al, INT_#PF
		movzx	eax, al
		call	idt_hfn_default

		pop 	rax
		iretq
	.kernel_panic:
		;; preserving registers doesn't matter anymore because the kernel panic doesn't
		;; return either way.
		cli
		mov 	ax, VGA_CLR(VGA_WHITE, VGA_DRK_BLUE) << 8 | ' '
		call	fill_scr
		call	hide_cursor

		mov 	byte [VGA_BUF + 2*0], 'K'
		mov 	byte [VGA_BUF + 2*1], 'E'
		mov 	byte [VGA_BUF + 2*2], 'R'
		mov 	byte [VGA_BUF + 2*3], 'N'
		mov 	byte [VGA_BUF + 2*4], 'E'
		mov 	byte [VGA_BUF + 2*5], 'L'
		mov 	byte [VGA_BUF + 2*6], ' '
		mov 	byte [VGA_BUF + 2*7], 'P'
		mov 	byte [VGA_BUF + 2*8], 'A'
		mov 	byte [VGA_BUF + 2*9], 'N'
		mov 	byte [VGA_BUF + 2*10], 'I'
		mov 	byte [VGA_BUF + 2*11], 'C'

		mov 	rax, cr2
		and 	rax, ~4095

		mov 	ebx, stack_guard_page
		cmp 	rax, rbx

		jne 	.kernel_panic@generic
		;; fallthrough
	.kernel_panic@stack_overflow:
		mov 	byte [VGA_BUF + 2*12], ':'
		mov 	byte [VGA_BUF + 2*13], ' '
		mov 	byte [VGA_BUF + 2*14], 'S'
		mov 	byte [VGA_BUF + 2*15], 'T'
		mov 	byte [VGA_BUF + 2*16], 'A'
		mov 	byte [VGA_BUF + 2*17], 'C'
		mov 	byte [VGA_BUF + 2*18], 'K'
		mov 	byte [VGA_BUF + 2*19], ' '
		mov 	byte [VGA_BUF + 2*20], 'O'
		mov 	byte [VGA_BUF + 2*21], 'V'
		mov 	byte [VGA_BUF + 2*22], 'E'
		mov 	byte [VGA_BUF + 2*23], 'R'
		mov 	byte [VGA_BUF + 2*24], 'F'
		mov 	byte [VGA_BUF + 2*25], 'L'
		mov 	byte [VGA_BUF + 2*26], 'O'
		mov 	byte [VGA_BUF + 2*27], 'W'

		jmp 	halt
	.kernel_panic@generic:
		mov 	byte [VGA_BUF + 2*12], ':'
		mov 	byte [VGA_BUF + 2*13], ' '
		mov 	byte [VGA_BUF + 2*14], 'U'
		mov 	byte [VGA_BUF + 2*15], 'N'
		mov 	byte [VGA_BUF + 2*16], 'M'
		mov 	byte [VGA_BUF + 2*17], 'A'
		mov 	byte [VGA_BUF + 2*18], 'P'
		mov 	byte [VGA_BUF + 2*19], 'P'
		mov 	byte [VGA_BUF + 2*20], 'E'
		mov 	byte [VGA_BUF + 2*21], 'D'
		mov 	byte [VGA_BUF + 2*22], ' '
		mov 	byte [VGA_BUF + 2*23], 'R'
		mov 	byte [VGA_BUF + 2*24], 'E'
		mov 	byte [VGA_BUF + 2*25], 'G'
		mov 	byte [VGA_BUF + 2*26], 'I'
		mov 	byte [VGA_BUF + 2*27], 'O'
		mov 	byte [VGA_BUF + 2*28], 'N'

		;; TODO: print the faulting address.

		;; fallthrough
		jmp 	halt
	%elif idt_idx == INT_TIMER
		;; INT 0x20 (IRQ0) is the PIT timer

		push	rax
		push	rcx
		push	rdx

		inc 	dword [rel isr_timer]

		mov 	ecx, X2APIC_EOI
		xor 	eax, eax
		xor 	edx, edx
		wrmsr

		pop 	rdx
		pop 	rcx
		pop 	rax
		iretq
	%elif idt_idx == INT_KBD
		;; INT 0x21 (IRQ1) is the keyboard

		push	rax
		push	rcx
		push	rdx

		inb 	IOPT_PS2_KBD_D

		jce 	byte [rel keyring_escape], KEYRING_ESC_EXT, .process_extended
		jce 	byte [rel keyring_escape], KEYRING_ESC_PB2, .pause_break_byte3
		jce 	byte [rel keyring_escape], KEYRING_ESC_PB1, .pause_break_byte2

		jce 	al, 0xE1, .pause_break_byte1 ;; if it starts with 0xE1, then it is definitely a pause break

		xor 	cl, cl							; esc = KEYRING_ESC_NONE;
		mov 	dl, KEYRING_ESC_EXT
		cmp 	al, 0xE0						; if (al == 0xE0) {
		cmove	ecx, edx						;     esc = true;
		mov 	byte [rel keyring_escape], cl	; *keyring_escape = esc; // unconditional
		je  	.keypress_exit					;     return; }

		movzx	eax, al
		mov 	al, byte [keyring_scancode_map + eax]
		jtz 	al, al, .keypress_exit

		jmp 	.write_to_keyring
	.process_extended:
		movzx	eax, al
		jtnz	al, 1 << 7, .process_extended@release		;; break sequence has bit 7 set

		;; fallthrough
	.process_extended@press:
		mov 	al, byte [keyring_extended_scancode_map + eax - 16]

		jtz 	al, al, .keypress_exit_unescape
		jmp 	.write_to_keyring
	.process_extended@release:
		mov 	dl, 0x53	;; flattened insert keycode
		cmp 	al, 0xD2	;; insert PS/2 break code
		cmove	ax, dx
		je  	.write_to_keyring

		mov 	al, byte [keyring_extended_scancode_map + eax - 144]

		;; NOTE: the zero test has to be before the increment
		jtz 	al, al, .keypress_exit_unescape

		or  	al, 1 << 7

		;; fallthrough
	.write_to_keyring:
		mov 	dl, byte [rel keyring_write]		;; dl = write idx

		inc 	dl
		;; NOTE: in order to make it not overwrite values, it won't ever actually use
		;;       all 256 slots, and will only use 255 of them.
		; if (write + 1 == read) return; // drop the keypress
		jce 	dl, byte [rel keyring_read], .keypress_exit

		dec 	dl	;; separate instruction so that it wraps modulo 256.
		movzx	edx, dl
		mov 	byte [keyring + edx], al
		inc 	byte [rel keyring_write]

		mov 	byte [rel keyring_escape], KEYRING_ESC_NONE

		jmp 	.keypress_exit
	.pause_break_byte1: ;; E1
		mov 	byte [rel keyring_escape], KEYRING_ESC_PB1
		jmp 	.keypress_exit
	.pause_break_byte2:	;; 1D | 9D
		mov 	byte [rel keyring_escape], KEYRING_ESC_PB2
		jmp 	.keypress_exit
	.pause_break_byte3:	;; 45 | C5
		cmp 	al, 0xC5
		mov 	al, 0x55
		mov 	dl, 0xD5
		cmove	eax, edx

		jmp 	.write_to_keyring
	.keypress_exit_unescape:
		mov 	byte [rel keyring_escape], KEYRING_ESC_NONE

		;; fallthrough
	.keypress_exit:
		mov 	ecx, X2APIC_EOI
		xor 	eax, eax
		xor 	edx, edx
		wrmsr

		pop 	rdx
		pop 	rcx
		pop 	rax
		iretq
	%elif idt_idx == INT_SPURIOUS
		;; do nothing because it is a spurious request.
		iretq
	%else
		;; generic default interrupt handler.

		;; skip the error code in ISRs that have it
		%if idt_idx == INT_#DF || idt_idx == INT_#TS || idt_idx == INT_#NP || idt_idx == INT_#SS || \
			idt_idx == INT_#GP || idt_idx == INT_#AC || idt_idx == INT_#CP
			add 	rsp, 8
		%endif

		push	rax

		mov 	al, %hex(idt_idx)
		movzx	eax, al
		call 	idt_hfn_default

		pop 	rax
		iretq
	%endif ;; index switch/case

	%assign idt_idx idt_idx + 1
%endrep

%assign idt_idx 0

;; the idt is exactly 8 sectors long, so make it line up with the sector boundaries.
;; because I decided.
align 512
idt:
	; NOTE: for every entry, P must always be 1, and S must always be 0.

	;; the valid gate types are 0xE (interrupt gate) and 0xF (trap gate)
	;; interrupt gates are usually used for timers, keyboard and NIC interrupts (block other interrupts)
	;; trap gates are for page faults, debug exceptions, divide by zero, etc. (allow other interrupts)
	;; entries 0-31 are exceptions (trap), 32-47 are IRQs (interrupt), and 48-255 are user syscalls (trap)
%rep 256
.entry_%[idt_idx]:
	dw idt_hfn_%[idt_idx]_ofs & 0xFFFF					;; offset[15:0]
	dw GDT_KCODE										;; selector: kernel code segment
	;; reserved bits = 0.
	%if idt_idx == INT_#DF || idt_idx == INT_#PF
		;; use IST1
		db 1
	%else
		;; disable IST
		db 0
	%endif
	db %hex(10001110b | (idt_idx < 32 || idt_idx > 47))	;; P, DPL=00b, S, gate type (trap/interrupt)
	dw (idt_hfn_%[idt_idx]_ofs >> 16) & 0xFFFF			;; offset[31:16]
	dd idt_hfn_%[idt_idx]_ofs >> 32						;; offset[63:32]
	dd 0												;; reserved
%assign idt_idx idt_idx + 1
%endrep
.ptr:
	dw $ - idt - 1
	dq idt

%undef idt_idx
%endif ; %ifndef IDT_INC
