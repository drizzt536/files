#ifndef PUTS_U144_H
	#define PUTS_U144_H

	#include <stdint.h> // uint8_t
	#include <stdio.h> // putchar, puts, printf, fwrite
	#include <stdbool.h> // bool, true

	typedef int8_t  i8;
	typedef int16_t i16;
	typedef int32_t i32;
	typedef int64_t i64;

	typedef uint8_t  u8;
	typedef uint16_t u16;
	typedef uint32_t u32;
	typedef uint64_t u64;

	typedef unsigned _BitInt(144) u144;

	void _puts_u144_bin2(const u144 x, bool include_newline) {
		u8 bit_i; // bit index

		putchar('0');
		putchar('b');

		if (x == 0) {
			puts("0");
			return;
		}

		bit_i = 144;

		while (bit_i-- && (x >> bit_i & 1) == 0);

		// use do-while instead of while because the previous loop skips the first nonzero value.
		do printf("%hhu", (u8) (x >> bit_i & 1));
		while (bit_i--);

		if (include_newline)
			putchar('\n');
	}

	void _puts_u144_oct2(const u144 x, bool include_newline) {
		u8 bit_i; // bit index

		putchar('0');
		putchar('o');

		if (x == 0) {
			puts("0");
			return;
		}

		bit_i = 141; // Start at the most significant bit group

		while (bit_i < 142 && (x >> bit_i & 0x7) == 0)
			bit_i -= 3;

		// Use do-while to print the first non-zero group
		do {
			printf("%hhu", (u8) (x >> bit_i & 0x7));
			bit_i -= 3;
		} while (bit_i < 142);

		if (include_newline)
			putchar('\n');
	}

	void _puts_u144_dec2(u144 x, bool include_newline) {
		if (x == 0) {
			puts("0");
			return;
		}

		// length. 2^144 / 10^44 < 1. indexes 0-43 for 10^0 to 10^43
		u8 i = 44;

		char digits[i + include_newline];

		if (include_newline)
			digits[i] = '\n';

		while (x > 0) {
			digits[--i] = '0' + (x % 10);
			x /= 10;
		}
		// at this point, `i` is the first index with a nonzero number

		fwrite(digits + i, sizeof(char), 44 + include_newline - i, stdout);
	}

	void _puts_u144_hex2(const u144 x, bool include_newline) {
		u8 bit_i; // bit index

		// null string terminator is not required
		const char hex_digits[16] = {
			'0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
		};

		putchar('0');
		putchar('x');

		if (x == 0) {
			puts("0");
			return;
		}

		bit_i = 140;

		// `bit_i < 142` is kind of like `bit_i >= 0`, but for unsigned.
		while (bit_i < 142 && (x >> bit_i & 0xf) == 0)
			bit_i -= 4;

		do {
			printf("%c", hex_digits[x >> bit_i & 0xf]);
			bit_i -= 4;
		} while (bit_i < 142);

		if (include_newline)
			putchar('\n');
	}

	inline __attribute__((always_inline)) void _puts_u144_bin(u144 x) {
		_puts_u144_bin2(x, true);
	}

	inline __attribute__((always_inline)) void _puts_u144_oct(u144 x) {
		_puts_u144_oct2(x, true);
	}

	inline __attribute__((always_inline)) void _puts_u144_dec(u144 x) {
		_puts_u144_dec2(x, true);
	}

	inline __attribute__((always_inline)) void _puts_u144_hex(u144 x) {
		_puts_u144_hex2(x, true);
	}

	#define puts_u144(/*u144*/ x, /*char*/ fmt) \
		switch (fmt) {                          \
			case 'b': _puts_u144_bin(x); break; \
			case 'o': _puts_u144_oct(x); break; \
			case 'd':                           \
			default : _puts_u144_dec(x); break; \
			case 'h':                           \
			case 'x': _puts_u144_hex(x); break; \
		}
#endif
