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
	cmova 	eax, ebx
	stosw

	mov 	al, cl
	and 	al, 0x0f
	add 	al, '0'
	lea 	ebx, [eax + 'A' - ('9' + 1)]
	cmp 	al, '9'
	cmova 	eax, ebx
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
	%if i == 0x36
		db 0x2A
	%elif i == 0x3A
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
	%elif i == 0x54
		db 0x6C
	%elif i == 0xAA
		db 0x2A
	%elif i == 0xB6
		db 0x2A
	%elif i == 0xBA
		db 0x2A
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
	%elif i == 0xD4
		db 0xEC
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
		db 0x65
	%elif i == 0x19
		db 0x66
	%elif i == 0x1C
		db 0x1C
	%elif i == 0x1D
		db 0x1D
	%elif i == 0x20
		db 0x67
	%elif i == 0x22
		db 0x68
	%elif i == 0x24
		db 0x69
	%elif i == 0x2E
		db 0x6A
	%elif i == 0x30
		db 0x6B
	%elif i == 0x35
		db 0x35
	%elif i == 0x37
		db 0x6C
	%elif i == 0x38
		db 0x38
	%elif i == 0x47
		db 0x60
	%elif i == 0x48
		db 0x59
	%elif i == 0x49
		db 0x5D
	%elif i == 0x4B
		db 0x5C
	%elif i == 0x4D
		db 0x5A
	%elif i == 0x4F
		db 0x61
	%elif i == 0x50
		db 0x5B
	%elif i == 0x51
		db 0x5E
	%elif i == 0x52
		db 0x5F
	%elif i == 0x53
		db 0x62
	%elif i == 0x5B
		db 0x63
	%elif i == 0x5C
		db 0x63
	%elif i == 0x5D
		db 0x64
		%exitrep
	%else
		db 0
	%endif ;; switch/case

	%assign i i + 1
%endrep ; keyring_extended_scancode_map
%undef i


%ifdef i
	%undef i
%endif

%assign idt_idx 0

;; declare the handler vectors
%rep 256
	idt_hfn_%[idt_idx]_ofs: equ KERNEL_START + ($ - $$)
	idt_hfn_%[idt_idx]:

	%if 0x20 <= idt_idx && idt_idx <= 0x2F	;; PIC IRQs
		;; TODO: for IRQ7 (0x27) and IRQ15 (0x2F), check for spurious interrupts
		;;       outb(0x20, 0x0B); unsigned char irr = inb(0x20);
		;;       then for IRQ15, still send EOI to the master PIC.
		push	rax

		%if idt_idx == 0x21
			;; INT 0x21 (IRQ1) is the keyboard

			push	rbx
			push	rdx

			mov 	dx, IOPT_PS2_KBD_D
			in  	al, dx

			cmp 	byte [rel keyring_escape], KEYRING_ESC_EXT
			je  	.process_extended

			cmp 	byte [rel keyring_escape], KEYRING_ESC_PB1
			je  	.pause_break_byte2

			cmp 	byte [rel keyring_escape], KEYRING_ESC_PB2
			je  	.pause_break_byte3

			cmp 	al, 0xE1						;; if it starts with 0xE1
			je  	.pause_break_byte1				;;     then it is definitely a pause break

			xor 	bl, bl							; esc = KEYRING_ESC_NONE;
			mov 	dl, KEYRING_ESC_EXT
			cmp 	al, 0xE0						; if (al == 0xE0) {
			cmove 	ebx, edx						;     esc = true;
			mov 	byte [rel keyring_escape], bl	; *keyring_escape = esc; // unconditional
			je  	.keypress_exit					;     return; }

			movzx	eax, al
			mov 	al, byte [keyring_scancode_map + eax]
			test 	al, al
			jz  	.keypress_exit

			jmp 	.write_to_keyring
		.process_extended:
			movzx 	eax, al
			test	al, 1 << 7
			jnz 	.process_extended@release		;; break sequence has bit 7 set

			;; fallthrough
		.process_extended@press:
			mov 	al, byte [keyring_extended_scancode_map + eax - 16]

			test 	al, al
			jz  	.keypress_exit_unescape
			jmp 	.write_to_keyring
		.process_extended@release:
			mov 	al, byte [keyring_extended_scancode_map + eax - 144]

			;; NOTE: the zero test has to be before the increment
			test 	al, al
			jz  	.keypress_exit_unescape

			or  	al, 1 << 7

			;; fallthrough
		.write_to_keyring:
			mov 	dl, byte [rel keyring_write]		;; dl = write idx

			inc 	dl
			;; NOTE: in order to make it not overwrite values, it won't ever actually use
			;;       all 256 slots, and will only use 255 of them.
			cmp 	dl, byte [rel keyring_read]		; if (write + 1 == read)
			je  	.keypress_exit					;     return; // drop the keypress

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
			mov 	al, 0x6D
			mov 	dl, 0xED
			cmove	eax, edx

			jmp 	.write_to_keyring
		.keypress_exit_unescape:
			mov 	byte [rel keyring_escape], KEYRING_ESC_NONE

			;; fallthrough
		.keypress_exit:
			pop 	rdx
			pop 	rbx
		%elif idt_idx == 0x20
			inc 	dword [rel isr_timer]
		%else
			;; INT 0x20 (IRQ0) is the timer. it happens like 20 times a second. don't print those.
			mov 	al, %hex(idt_idx)
			movzx	eax, al
			call	idt_hfn_default ;; log the interrupt to the screen
		%endif

		;; send the EOI signal
		;; legacy PIC
		mov 	al, PIC_EOI
		out 	IOPT_PIC1, al
		%if idt_idx >= 0x28
			;; PIC2 has to send EOI to both of them.
			out 	IOPT_PIC2, al
		%endif

		pop 	rax
		iretq
	%else
		;; generic default interrupt handler.
		push	rax

		mov 	al, %hex(idt_idx)
		movzx 	eax, al
		call 	idt_hfn_default

		pop 	rax
		iretq
	%endif

	%assign idt_idx idt_idx + 1
%endrep

%assign idt_idx 0

align 512 ; the idt is exactly 8 sectors long, so make it line up with the sector boundaries. because I decided.
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
	db 0												;; disable IST, reserved bits = 0.
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
