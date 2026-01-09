#pragma once
#define MAX7219_7221_OPCODES

namespace Max7219 {} // this has to be here until C++17

namespace Max7219::Opcodes {
	static FORCE_INLINE OP_ROW(u8 row) {
		return row + 1;
	}

	static FORCE_INLINE OP_DIGIT(u8 digit) {
		return digit + 1;
	}

	constexpr u8 OP_NOOP        =  0; // operand ignored. does nothing

	// the meaning of registers 1-8 depend on what the Max7219 is controlling.
	// matrix row opcodes
	constexpr u8 OP_ROW0        =  1;
	constexpr u8 OP_ROW1        =  2;
	constexpr u8 OP_ROW2        =  3;
	constexpr u8 OP_ROW3        =  4;
	constexpr u8 OP_ROW4        =  5;
	constexpr u8 OP_ROW5        =  6;
	constexpr u8 OP_ROW6        =  7;
	constexpr u8 OP_ROW7        =  8;

	// 7-segment digit opcodes
	constexpr u8 OP_DIGIT0      =  1;
	constexpr u8 OP_DIGIT1      =  2;
	constexpr u8 OP_DIGIT2      =  3;
	constexpr u8 OP_DIGIT3      =  4;
	constexpr u8 OP_DIGIT4      =  5;
	constexpr u8 OP_DIGIT5      =  6;
	constexpr u8 OP_DIGIT6      =  7;
	constexpr u8 OP_DIGIT7      =  8;

	// opcodes 1-8 are for rows/digits
	constexpr u8 OP_DECODEMODE  =  9; // decode mode for 7seg displays.
	constexpr u8 OP_INTENSITY   = 10; // operand in [0, 15]. sets the current draw.
	constexpr u8 OP_SCANLIMIT   = 11; // operand in in [0, 7] for rows 1-8
	constexpr u8 OP_SHUTDOWN    = 12; // operand is 0 (normal) or 1 (power saving)
	// opcodes 13 and 14 don't exist
	constexpr u8 OP_DISPLAYTEST = 15; // operand is 1/on or 0/off. turns on all LEDs with intensity 15.
}
