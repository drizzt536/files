// nocompile
#pragma once

#ifdef MAX7219_7221_SEVEN_SEGMENT_IMPL
	#error only one implementation of the Max7219 7-segment controller can be used
#endif

#define MAX7219_7221_SEVEN_SEGMENT_IMPL

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

namespace Max7219::SevenSegment {
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

	inline namespace EBCD {
		constexpr u8 BCD_0 = 0x0;
		constexpr u8 BCD_1 = 0x1;
		constexpr u8 BCD_2 = 0x2;
		constexpr u8 BCD_3 = 0x3;
		constexpr u8 BCD_4 = 0x4;
		constexpr u8 BCD_5 = 0x5;
		constexpr u8 BCD_6 = 0x6;
		constexpr u8 BCD_7 = 0x7;
		constexpr u8 BCD_8 = 0x8;
		constexpr u8 BCD_9 = 0x9;

		// Max7219-specific Extended BCD
		constexpr u8 EBCD_HYPHEN = 0xA;
		constexpr u8 EBCD_E = 0xB;
		constexpr u8 EBCD_H = 0xC;
		constexpr u8 EBCD_L = 0xD;
		constexpr u8 EBCD_P = 0xE;
		constexpr u8 EBCD_BLANK = 0xF;
		// after 0xF, I think it just wraps around to 0.
	}

	using namespace Max7219::Opcodes;
	using namespace Core;

	using State = union {
		u64 raw;
		u8 digits[8];
	};

	static State state;      // digit values
	static u8 led_intensity; // NOTE: `intensity` is the setter function.
	static u8 decode_state;

	[[maybe_unused]]
	static FORCE_INLINE void sync(u8 digit) {
		send(OP_DIGIT(digit), state.digits[digit]);
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
	static FORCE_INLINE void decode(u8 value) {
		decode_state = value;
		send(OP_DECODE, value);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(u8 d0, u8 d1, u8 d2, u8 d3, u8 d4, u8 d5, u8 d6, u8 d7) {
		state.digits[0] = d0; state.digits[1] = d1;
		state.digits[2] = d2; state.digits[3] = d3;
		state.digits[4] = d4; state.digits[5] = d5;
		state.digits[6] = d6; state.digits[7] = d7;

		send(OP_DIGIT0, d0); send(OP_DIGIT1, d1);
		send(OP_DIGIT2, d2); send(OP_DIGIT3, d3);
		send(OP_DIGIT4, d4); send(OP_DIGIT5, d5);
		send(OP_DIGIT6, d6); send(OP_DIGIT7, d7);
	}

	[[maybe_unused]]
	static FORCE_INLINE void update(State s) {
		update(
			s.digits[0], s.digits[1], s.digits[2], s.digits[3],
			s.digits[4], s.digits[5], s.digits[6], s.digits[7]
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
	static FORCE_INLINE void setDigit(u8 digit, u8 x) {
		if (digit > 7)
			return;

		state.digits[digit] = x;
		send(OP_DIGIT(digit), x);
	}

	[[maybe_unused]]
	static FORCE_INLINE void setSegment(u8 digit, u8 segment, u8 b) {
		if (digit > 7 || segment > 7)
			return;

		if (b) state.digits[digit] |= bit(segment);
		else   state.digits[digit] &= ~bit(segment);

		sync(digit);
	}

	[[maybe_unused]]
	static FORCE_INLINE void toggleDigit(u8 digit, u8 mask = 0xFF) {
		if (digit > 7)
			return;

		state.digits[digit] ^= mask;
		sync(digit);
	}

	[[maybe_unused]]
	static FORCE_INLINE void toggleSegment(u8 digit, u8 segment) {
		if (digit > 7 || segment > 7)
			return;

		state.digits[digit] ^= bit(segment);
		sync(digit);
	}

	[[maybe_unused]]
	static FORCE_INLINE void all(u8 b) {
		state.raw = b ? ~0llu : 0llu;
		sync();
	}

	[[maybe_unused]]
	static FORCE_INLINE void init(bool decodeMode = true) {
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
		send(OP_SCANLIMIT, 7);   // use all digits
		decode(decodeMode);
		intensity(0);            // lowest intensity
		all(0);                  // blank the display
		send(OP_SHUTDOWN, 1);    // turn off power saving mode
	}
}

#undef MAX7219_DIN
#undef MAX7219_CS
#undef MAX7219_CLK
#undef UNROLL_SEND_LOOP
