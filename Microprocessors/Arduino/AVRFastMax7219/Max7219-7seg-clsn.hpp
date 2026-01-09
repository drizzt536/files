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
#ifndef MAX7219_MAXDEVICES
	// probably don't set this higher than 16
	#define MAX7219_MAXDEVICES 8
#endif

namespace Max7219 {

using namespace Max7219::Opcodes;

class SevenSegment {
private:
	u8 bit_din, bit_cs, bit_clk;
	volatile u8 *port_out;

	void _send(u8 opcode, u8 operand) const {
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
public:
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

	using State = union {
		u64 raw;
		u8 digits[8];
	};

	using StateChain = union {
		State devices[MAX7219_MAXDEVICES];
		u8 raw[8*MAX7219_MAXDEVICES];
	};

	StateChain state;
	u8 ndevices;
	u8 intensities[MAX7219_MAXDEVICES];
	u8 decode_states[MAX7219_MAXDEVICES];

	FORCE_INLINE void send(u8 device, u8 opcode, u8 operand) {
		// device is 0 indexed
		u8 i = ndevices;
		device++; // avoid off-by-one error

		W_LOW(port_out, bit_cs); // start reading

		while (i --> device) _send(OP_NOOP, 0);
		_send(opcode, operand);
		while (i --> 0) _send(OP_NOOP, 0);

		W_HIGH(port_out, bit_cs); // latch value
	}

	FORCE_INLINE void send(u8 opcode, u8 operand) {
		// send the same thing to all the devices
		W_LOW(port_out, bit_cs); // start reading

		for (u8 i = ndevices; i --> 0 ;)
			_send(opcode, operand);

		W_HIGH(port_out, bit_cs); // latch value
	}

	FORCE_INLINE void send(u8 *data) {
		// data must be at least `2*ndevices` bytes long.
		// the first two bytes go to the farthest device.
		// use this if you want to give different commands to each device.
		// for setting digits, use `update`.

		for (u8 i = 0; i < 2*ndevices; i += 2)
			send(data[i], data[i + 1]);
	}

	FORCE_INLINE void sync(u8 digit) {
		W_LOW(port_out, bit_cs);
		for (u8 i = ndevices; i --> 0 ;)
			_send(OP_DIGIT(digit), state.devices[i].digits[digit]);
		W_HIGH(port_out, bit_cs);
	}

	FORCE_INLINE void sync(void) {
		// update the devices with the state that this controller has.
		sync(0); sync(1); sync(2); sync(3);
		sync(4); sync(5); sync(6); sync(7);
	}

	FORCE_INLINE void intensity(u8 device, u8 value) {
		if (device >= ndevices)
			return;

		value &= 15;

		intensities[device] = value;
		send(device, OP_INTENSITY, value);
	}

	FORCE_INLINE void intensity(u8 value) {
		value &= 15;

		for (u8 i = ndevices; i --> 0 ;)
			intensities[i] = value;

		send(OP_INTENSITY, value);
	}

	FORCE_INLINE void decode(u8 device, u8 value) {
		if (device >= ndevices)
			return;

		decode_states[device] = value;
		send(device, OP_DECODE, value);
	}

	FORCE_INLINE void decode(u8 value) {
		for (u8 i = ndevices; i --> 0 ;)
			decode_states[i] = value;

		send(OP_DECODE, value);
	}

	FORCE_INLINE void update(u8 device, u8 d0, u8 d1, u8 d2, u8 d3, u8 d4, u8 d5, u8 d6, u8 d7) {
		// this multiplexes over digits and not devices,
		// so this can not be done more efficiently.
		state.devices[device].digits[0] = d0; state.devices[device].digits[1] = d1;
		state.devices[device].digits[2] = d2; state.devices[device].digits[3] = d3;
		state.devices[device].digits[4] = d4; state.devices[device].digits[5] = d5;
		state.devices[device].digits[6] = d6; state.devices[device].digits[7] = d7;

		send(device, OP_DIGIT0, d0); send(device, OP_DIGIT1, d1);
		send(device, OP_DIGIT2, d2); send(device, OP_DIGIT3, d3);
		send(device, OP_DIGIT4, d4); send(device, OP_DIGIT5, d5);
		send(device, OP_DIGIT6, d6); send(device, OP_DIGIT7, d7);
	}

	FORCE_INLINE void update(u8 device, State s) {
		update(device,
			s.digits[0], s.digits[1], s.digits[2], s.digits[3],
			s.digits[4], s.digits[5], s.digits[6], s.digits[7]
		);
	}

	FORCE_INLINE void update(u8 device, u8 s[8]) {
		update(device, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]);
	}

	FORCE_INLINE void update(u8 device, u64 s) {
		update(device, (State) {.raw = s});
	}

	FORCE_INLINE void update(StateChain s) {
		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].raw = s.devices[i].raw;

		sync();
	}

	FORCE_INLINE void setDigit(u8 device, u8 digit, u8 x) {
		if (device >= ndevices || digit > 7)
			return;

		state.devices[device].digits[digit] = x;
		sync(digit);
	}

	FORCE_INLINE void setDigit(u8 digit, u8 *xs) {
		// send a digit to each device. assumes the array is long enough.
		if (digit > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].digits[digit] = xs[i];

		sync(digit);
	}

	FORCE_INLINE void setSegment(u8 device, u8 digit, u8 segment, u8 b) {
		if (device >= ndevices || digit > 7 || segment > 7)
			return;

		if (b) state.devices[device].digits[digit] |= bit(segment);
		else   state.devices[device].digits[digit] &= ~bit(segment);

		sync(digit);
	}

	FORCE_INLINE void setSegment(u8 digit, u8 segment, u8 b) {
		if (digit > 7 || segment > 7)
			return;

		if (b)
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].digits[digit] |= bit(segment);
		else
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].digits[digit] &= ~bit(segment);

		sync(digit);
	}

	FORCE_INLINE void toggleDigit(u8 device, u8 digit, u8 mask = 0xFF) {
		if (device >= ndevices || digit > 7)
			return;

		state.devices[device].digits[digit] ^= mask;
		sync(digit);
	}

	FORCE_INLINE void toggleDigit(u8 digit, u8 mask = 0xFF) {
		// toggle a digit on all devices.
		if (digit > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].digits[digit] ^= mask;

		sync(digit);
	}

	FORCE_INLINE void toggleDigit(u8 digit, u8 *masks) {
		// toggle a digit on all devices with a given mask for each.
		// masks should be at least `ndevices` elements long.
		if (digit > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].digits[digit] ^= masks[i];

		sync(digit);
	}

	FORCE_INLINE void toggleSegment(u8 device, u8 digit, u8 segment) {
		if (device >= ndevices || digit > 7 || segment > 7)
			return;

		state.devices[device].digits[digit] ^= bit(segment);
		sync(digit);
	}

	FORCE_INLINE void toggleSegment(u8 digit, u8 segment) {
		if (digit > 7 || segment > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].digits[digit] ^= bit(segment);

		sync(digit);
	}

	FORCE_INLINE void all(u8 b) {
		if (b)
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].raw = ~0llu;
		else
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].raw = 0llu;

		sync();
	}

	FORCE_INLINE void init(u8 DIN, u8 CS, u8 CLK, u8 num_devices = MAX7219_MAXDEVICES, bool decodeMode = true) {
		static_assert((MAX7219_MAXDEVICES) > 1, "max devices can not be 0 or 1");

		ndevices = num_devices;
		auto clk_port_id = digitalPinToPort(CLK);

		port_out = (volatile u8 *) portOutputRegister(clk_port_id);

		if (__builtin_expect(!ndevices || ndevices > MAX7219_MAXDEVICES || port_out == NOT_A_PORT || clk_port_id != digitalPinToPort(DIN) || clk_port_id != digitalPinToPort(CS), 0)) {
			cli();
		#ifdef LED_BUILTIN
			// this should not happen. give some kind of data to the user to show
			// something bad happened.

			// NOTE: on the Mega 2560, Nano, and the Uno Rev3, these are all port B,
			// but on some random other boards, it isn't so I can't hardcode any of this.

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

	FORCE_INLINE void init(u8 DIN, u8 CS, u8 CLK, bool decodeMode, u8 num_devices = MAX7219_MAXDEVICES) {
		init(DIN, CS, CLK, num_devices, decodeMode);
	}

	FORCE_INLINE void init(u8 num_devices = MAX7219_MAXDEVICES, bool decodeMode = true) {
		init(MAX7219_DIN, MAX7219_CS, MAX7219_CLK, num_devices, decodeMode);
	}

	FORCE_INLINE void init(bool decodeMode) {
		init(MAX7219_DIN, MAX7219_CS, MAX7219_CLK, MAX7219_MAXDEVICES, decodeMode);
	}

	FORCE_INLINE SevenSegment(u8 DIN, u8 CS, u8 CLK, u8 num_devices = MAX7219_MAXDEVICES, bool decodeMode = true) {
		init(DIN, CS, CLK, num_devices, decodeMode);
	}

	FORCE_INLINE SevenSegment(u8 DIN, u8 CS, u8 CLK, bool decodeMode, u8 num_devices = MAX7219_MAXDEVICES) {
		init(DIN, CS, CLK, decodeMode, num_devices);
	}

	FORCE_INLINE SevenSegment(u8 num_devices = MAX7219_MAXDEVICES, bool decodeMode = true) {
		init(num_devices, decodeMode);
	}

	FORCE_INLINE SevenSegment(bool decodeMode) {
		init(decodeMode);
	}
} // SevenSegment

} // Max7219

#undef MAX7219_DIN
#undef MAX7219_CS
#undef MAX7219_CLK
#undef UNROLL_SEND_LOOP
#undef MAX7219_MAXDEVICES
