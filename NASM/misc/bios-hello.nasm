; nasm -fbin bios-hello.nasm -o bios-hello.bin
; qemu-system-x86_64.exe -drive format=raw,file=bios-hello.bin,if=ide

; basically print hello world in the bios and stop doing anything else

bits	16
org 	0x7c00

%define MSG "Hello World"

cli
mov 	si, msg
mov 	cx, %strlen(MSG)

print:
	lodsb
	mov 	ah, 0eh	; teletype output
	int 	10h		; video

	loop	print

hlt	; stop execution

msg: db MSG

times 510 - ($ - $$) nop
db 0x55, 0xAA
