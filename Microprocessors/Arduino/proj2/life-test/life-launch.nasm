;; NOTE: the output program has to be in the same directory as life.exe.

section .text
	global mainCRTStartup
	extern system, puts ; ucrtbase.dll
	extern Sleep ; kernel32.dll

;; in .text instead of .rdata to save space in the binary.
cmd: db "life -f nrun inf", 0
msg: db "ctrl+C to exit"  , 0

mainCRTStartup:
	sub 	rsp, 40 ; NOTE: 40 \equiv 8 (mod 16)

	lea 	rcx, [rel cmd]
	call	system

	lea 	rcx, [rel msg]
	call	puts

	mov 	ecx, ~0 ;; INFINITY
	call	Sleep ;; halt the program without eating CPU (sleep the thread indefinitely)
