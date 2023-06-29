; ./assemble loop_hello
; strip loop_hello.exe
; ./loop_hello


segment rdata
	msg 	db "Hello World"

segment text
	extern	puts
	global	main

; ╭────────────────────────────────╮
; │                                │
; │  int main(void) {              │
; │      while (true)              │
; │          puts("Hello World");  │
; │      return 0;                 │
; │  }                             │
; │                                │
; ╰────────────────────────────────╯

main:
	mov 	rcx, msg
	call	puts
	jmp 	main
