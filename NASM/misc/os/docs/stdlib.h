// NOTE: `string` means an LP string and `vstring` means a string view.
// NOTE: not entirely real C syntax, but close enough that you know what I mean.

// C prototype											// clobbers

// stdmem.nasm
string, u64 cstrlen(const string str);					// rax, rbx, rcx, rdi
u8 *, u64 _memscan(const u8 *ptr, u8 c);				// rax, rbx, rcx, rdi
macro u64 strlen(string str);							// N/A
macro char *strend(string str);							// N/A
macro u64 strnlen(string str, u64 maxlen);				// N/A
string strncpy(string dst, string src, u64 maxlen);		// rax, rbx, rcx, rdx, rdi, rsi
string strcpy(string dst, string src);					// rax, rbx, rcx, rdi, rsi
u8 *memmove(u8 *dst, u8 *src, u64 count);				// rcx, rdi, rsi
u8 *memcpy(u8 *dst, u8 *src, u64 count);				// rcx, rdi, rsi
u8 *memset(u8 *ptr, u8 value, u64 num);					// rcx, rdi
i8 strcmp(string a, string b);							// rax, rcx, rdx, dil, rsi
i8 strncmp(string a, string b, u64 maxlen);				// rax, rcx, rdx, dil, rsi
i8 memcmp(u8 *a, u8 *b, u64 len);						// rax, rbx, dl
u8 streq(string a, string b);							// rax, rbx, rcx, rdx
string strrev(string s);								// rbx, rcx, dl
vstring strtok(string str, vstring tok, string delims);	// rax, rbx, rcx, rdi, rsi

// stdkbd.nasm
u8 get_keycode(void);									// al, rbx
u8 _get_keycode(void _, u32 keyring_read_idx);			// al
u8 next_keycode(void);									// al, rbx
u8 next_keycode(void _, u32 keyring_read_idx);			// al
bool keyring_has_keycode(u8 keycode);					// ax, rbx
macro void clear_keyring(void);							// none
macro void kbd_reset(void);								// none
u8, u8 keycode_to_ascii(u8 keycode);					// rax, (if ascii printable: rbx, rcx)

// stdcurs.nasm
void toggle_cursor(void);								// al, dx
void hide_cursor(void);									// al, dx
u4 show_cursor(void);									// al, dx
u4 set_cursor(u8 height);								// al, bl, dx
u16 _add_cursor(u16 ofs);								// ax
err, u16 add_cursor(u16 ofs);							// rax, rbx, dx
err, u16 inc_cursor(void);								// rax, rbx, dx
err, u16 move_cursor(u16 pos);							// rax, rbx, dx
macro err, u16 move_cursor_2d(u16 row, u16 col);		// rax, rbx, dx

// stdprint.nasm
void cls(void);											// rax, rbx, dx, rcx, rdi
void fill_scr_def(u8 charcode);							// rax, rbx, rcx, rdi
void fill_scr(u16 vga_char);							// rax, rbx, rcx, rdi
void _print_u8hex(u16 vga_char);						// rax, rbx, cl, rdi
err, u16 print_u8hex(u16 vga_char);						// rax, rbx, cl, dx, rdi
err, u16 print_u16hex(u16 x, u8 color);					// rax, rbx, cx, dx, rdi
err, u16 print_u32hex(u32 x, u8 color);					// rax, rbx, cx, rdx, rdi
err, u16 print_u64hex(u64 x, u8 color);					// rax, rbx, cx, rdx, rdi
err, u16 putchar(u16 vga_char);							// rax, rbx, rcx, dx
void puts(string str);									// rax, rbx, rcx, dx, rdi, rsi

// stdlib.nasm
noreturn void halt(void);								// none
noreturn void reboot(void);								// none
void not_implemented(void);								// r0-r15, (if APX: r16-r31)
void kernel_reset(void);								// r0-r15, (if APX: r16-r31)

// stdlib.nasm (RNG)
u64 next_rand(void);									// rax, rbx, rcx, rdx
u64 splitmix64(u64 z);									// rax, rbx, rcx
void rand_fill(u64 length, u8 *buffer);					// rax, rbx, rcx, (if length < 8: rdx)

// stdlib.nasm (disk)
err disk_read(u64 sector, u16 cnt, u16 *mem);			// rax, rbx, rcx, dx
err disk_write(u64 sector, u16 cnt, u16 *mem);			// rax, rbx, rcx, dx
