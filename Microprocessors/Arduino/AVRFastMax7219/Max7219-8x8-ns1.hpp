// nocompile
#pragma once

#ifdef MAX7219_7221_8X8_MATRIX_IMPL
	#error only one implementation of the Max7219 matrix controller can be used
#endif

#define MAX7219_7221_8X8_MATRIX_IMPL

#include <fdgpio.hpp>
#include <Max7219-opcodes.hpp>

#ifndef MAX7219_DIN
	#define MAX7219_DIN 2
#endif
#ifndef MAX7219_CS
	#define MAX7219_CS 3
#endif
#ifndef MAX7219_CLK
	#define MAX7219_CLK 5
#endif

namespace Max7219::Matrix {
	namespace Core {
		constexpr u8 DIN = MAX7219_DIN;
		constexpr u8 CS  = MAX7219_CS;
		constexpr u8 CLK = MAX7219_CLK;

		static u8 bit_din, bit_cs, bit_clk;
		static volatile u8 *port_out;

		static void _send(u8 opcode, u8 operand) {
			// emulates something like SPI communication.
			// sends `opcode << 8 | operand` to a shift register, MSB first.
			// does not touch CS at the start and end.
		#ifdef UNROLL_SEND_LOOP
			// first four bits are always low
			W_LOW(port_out, bit_din);
			W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, opcode & 8); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, opcode & 4); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, opcode & 2); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, opcode & 1); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);

			W_PORT(port_out, bit_din, operand & 128); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &  64); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &  32); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &  16); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &   8); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &   4); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &   2); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
			W_PORT(port_out, bit_din, operand &   1); W_HIGH(port_out, bit_clk); W_LOW(port_out, bit_clk);
		#else
			for (u8 i = 8; i --> 0 ;) {
				W_PORT(port_out, bit_din, operand & 128);
				operand <<= 1;

				W_HIGH(port_out, bit_clk);
				W_LOW(port_out, bit_clk);
			}

			for (u8 i = 8; i --> 0 ;) {
				W_PORT(port_out, bit_din, opcode & 128);
				opcode <<= 1;

				W_HIGH(port_out, bit_clk);
				W_LOW(port_out, bit_clk);
			}
		#endif
		}

		[[maybe_unused]]
		static FORCE_INLINE void send(u8 opcode, u8 operand) {
			W_LOW(port_out, bit_cs); // start reading
			_send(opcode, operand);
			W_HIGH(port_out, bit_cs); // latch value
		}

		[[maybe_unused]]
		static FORCE_INLINE void send(u8 *data) {
			send(data[0], data[1]);
		}
	}

	using namespace Max7219::Opcodes;
	using namespace Core;

	using State = union {
		u64 raw;
		u8 rows[8];
	};

	static State state;
	static u8 led_intensity; // NOTE: `intensity` is the setter function.

	[[maybe_unused]]
	static FORCE_INLINE void sync(u8 row) {
		send(OP_ROW(row), state.rows[row]);
	}

	[[maybe_unused]]
	static FORCE_INLINE void sync(void) {
		// sync the device with the state that this controller has.
		sync(0); sync(1); sync(2); sync(3);
		sync(4); sync(5); sync(6); sync(7);
	}

	[[maybe_unused]]
	static FORCE_INLINE void intensity(u8 value) {
		value &= 15;

		led_intensity = value;
		send(OP_INTENSITY, value);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(u8 r0, u8 r1, u8 r2, u8 r3, u8 r4, u8 r5, u8 r6, u8 r7) {
		state.rows[0] = r0; state.rows[1] = r1;
		state.rows[2] = r2; state.rows[3] = r3;
		state.rows[4] = r4; state.rows[5] = r5;
		state.rows[6] = r6; state.rows[7] = r7;

		send(OP_ROW0, r0); send(OP_ROW1, r1);
		send(OP_ROW2, r2); send(OP_ROW3, r3);
		send(OP_ROW4, r4); send(OP_ROW5, r5);
		send(OP_ROW6, r6); send(OP_ROW7, r7);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(State s) {
		update(
			s.rows[0], s.rows[1], s.rows[2], s.rows[3],
			s.rows[4], s.rows[5], s.rows[6], s.rows[7]
		);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(u8 s[8]) {
		update(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(u64 s) {
		update((State) {.raw = s});
	}

	[[maybe_unused]]
	static FORCE_INLINE void setRow(u8 row, u8 x) {
		if (row > 7)
			return;

		state.rows[row] = x;
		send(OP_ROW(row), x);
	}

	[[maybe_unused]]
	static FORCE_INLINE void setCol(u8 col, u8 x) {
		if (col > 7)
			return;

		for (u8 row = 8; row --> 0 ;) {
			if (x & 128) state.rows[row] |=  bit(col); // set the bit
			else         state.rows[row] &= ~bit(col); // clear the bit

			x <<= 1;
		}

		sync();
	}

	[[maybe_unused]]
	static FORCE_INLINE void setCell(u8 row, u8 col, u8 b) {
		if (row > 7 || col > 7)
			return;

		if (b)	state.rows[row] |=  bit(col);
		else	state.rows[row] &= ~bit(col);

		sync(row);
	}

	[[maybe_unused]]
	static FORCE_INLINE void toggleRow(u8 row, u8 mask = 0xFF) {
		if (row > 7)
			return;

		state.rows[row] ^= mask;
		sync(row);
	}

	[[maybe_unused]]
	static FORCE_INLINE void toggleCol(u8 col, u8 mask = 0xFF) {
		if (col > 7)
			return;

		for (u8 row = 8; row --> 0 ;)
			state.rows[row] ^= ((mask >> row) & 1) << col;

		sync();
	}

	[[maybe_unused]]
	static FORCE_INLINE void toggleCell(u8 row, u8 col) {
		if (row > 7 || col > 7)
			return;

		state.rows[row] ^= bit(col);
		sync(row);
	}

	[[maybe_unused]]
	static FORCE_INLINE void all(u8 b) {
		state.raw = b ? ~0llu : 0llu;
		sync();
	}

	[[maybe_unused]]
	static FORCE_INLINE void init(void) {
		auto clk_port_id = digitalPinToPort(CLK);

		port_out = (volatile u8 *) portOutputRegister(clk_port_id);

		if (__builtin_expect(port_out == NOT_A_PORT || clk_port_id != digitalPinToPort(DIN) || clk_port_id != digitalPinToPort(CS), 0)) {
			cli();
		#ifdef LED_BUILTIN
			// this should not happen. give some kind of data to the user to show
			// something bad happened.

			// NOTE: on the Mega 2560, Nano, and the Uno Rev3, these are all port B,
			// but on some random other boards it isn't, so I can't hardcode any of this.

			const u8 bitmask = digitalPinToBitMask(LED_BUILTIN);

			// set the builtin LED to output mode
			*(volatile u8 *) portModeRegister(digitalPinToPort(LED_BUILTIN)) |= bitmask;

			// reuse this variable because it won't be used for anything else now.
			port_out = (volatile u8 *) portOutputRegister(digitalPinToPort(LED_BUILTIN));

			while (true) {
				W_TOGGLE(port_out, bitmask);
				// delay for 0.149253 seconds (6.7Hz).
				// delay requires interrupts to work, but delayMicroseconds is a busy loop.
				delayMicroseconds(65535);
				delayMicroseconds(65535);
				delayMicroseconds(18183);
			}
		#else
			while (true);
		#endif

			__builtin_unreachable();
		}

		bit_din = digitalPinToBitMask(DIN);
		bit_cs  = digitalPinToBitMask(CS);
		bit_clk = digitalPinToBitMask(CLK);

		// set output modes
		*(volatile u8 *) portModeRegister(digitalPinToPort(CLK)) |= bit_din | bit_cs | bit_clk;
		W_HIGH(port_out, bit_cs); // latch

		send(OP_DISPLAYTEST, 0); // turn off display test
		send(OP_SCANLIMIT, 7);   // use all rows
		intensity(0);            // lowest intensity
		all(0);                  // blank the display
		send(OP_SHUTDOWN, 1);    // turn off power saving mode
	}
}

#undef MAX7219_DIN
#undef MAX7219_CS
#undef MAX7219_CLK
#undef UNROLL_SEND_LOOP
