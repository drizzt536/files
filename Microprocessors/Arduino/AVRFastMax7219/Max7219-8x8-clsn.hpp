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
#ifndef MAX7219_MAXDEVICES
	// probably don't set this higher than 16
	#define MAX7219_MAXDEVICES 8
#endif

namespace Max7219 {

using namespace Max7219::Opcodes;

class Matrix {
private:
	// configuration
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
	using State = union {
		u64 raw;
		u8 rows[8];
	};

	using StateChain = union {
		State devices[MAX7219_MAXDEVICES];
		u8 raw[8*MAX7219_MAXDEVICES];
	};

	StateChain state;
	u8 ndevices;
	u8 intensities[MAX7219_MAXDEVICES];

	FORCE_INLINE void send(u8 device, u8 opcode, u8 operand) const {
		// device is 0 indexed
		u8 i = ndevices;
		device++; // avoid off-by-one error

		W_LOW(port_out, bit_cs); // start reading

		while (i --> device) _send(OP_NOOP, 0);
		_send(opcode, operand);
		while (i --> 0) _send(OP_NOOP, 0);

		W_HIGH(port_out, bit_cs); // latch value
	}

	FORCE_INLINE void send(u8 opcode, u8 operand) const {
		// send the same thing to all the ndevices
		W_LOW(port_out, bit_cs); // start reading

		for (u8 i = ndevices; i --> 0 ;)
			_send(opcode, operand);

		W_HIGH(port_out, bit_cs); // latch value
	}

	FORCE_INLINE void send(u8 *data) {
		// data must be at least `2*ndevices` bytes long.
		// the first two bytes go to the farthest device.
		// use this if you want to give different commands to each device.
		// for setting rows, use `update`.

		for (u8 i = 0; i < 2*ndevices; i += 2)
			send(data[i], data[i + 1]);
	}

	FORCE_INLINE void sync(u8 row) const {
		W_LOW(port_out, bit_cs);
		for (u8 i = ndevices; i --> 0 ;)
			_send(OP_ROW(row), state.devices[i].rows[row]);
		W_HIGH(port_out, bit_cs);
	}

	FORCE_INLINE void sync(void) const {
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

	FORCE_INLINE void update(u8 device, u8 r0, u8 r1, u8 r2, u8 r3, u8 r4, u8 r5, u8 r6, u8 r7) {
		// this multiplexes over rows and not devices,
		// so this can not be done more efficiently.
		state.devices[device].rows[0] = r0; state.devices[device].rows[1] = r1;
		state.devices[device].rows[2] = r2; state.devices[device].rows[3] = r3;
		state.devices[device].rows[4] = r4; state.devices[device].rows[5] = r5;
		state.devices[device].rows[6] = r6; state.devices[device].rows[7] = r7;

		send(device, OP_ROW0, r0); send(device, OP_ROW1, r1);
		send(device, OP_ROW2, r2); send(device, OP_ROW3, r3);
		send(device, OP_ROW4, r4); send(device, OP_ROW5, r5);
		send(device, OP_ROW6, r6); send(device, OP_ROW7, r7);
	}

	FORCE_INLINE void update(u8 device, State s) {
		update(device,
			s.rows[0], s.rows[1], s.rows[2], s.rows[3],
			s.rows[4], s.rows[5], s.rows[6], s.rows[7]
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

	FORCE_INLINE void setRow(u8 device, u8 row, u8 x) {
		if (device >= ndevices || row > 7)
			return;

		state.devices[device].rows[row] = x;
		send(device, OP_ROW(row), x);
	}

	FORCE_INLINE void setRow(u8 row, u8 *xs) {
		// send a mega row. assumes the array is long enough.
		if (row > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].rows[row] = xs[i];

		sync(row);
	}

	FORCE_INLINE void setCol(u8 device, u8 col, u8 x) {
		if (device >= ndevices || col > 7)
			return;

		for (u8 row = 8; row --> 0 ;) {
			if (x & 128) state.devices[device].rows[row] |=  bit(col); // set the bit
			else         state.devices[device].rows[row] &= ~bit(col); // clear the bit

			x <<= 1;
		}

		sync();
	}

	void setCol(u8 col, u8 x) {
		// set the same column with the same value in all the devices
		if (col > 7)
			return;

		for (u8 row = 8; row --> 0 ;) {
			if (x & 128)
				for (u8 i = ndevices; i --> 0 ;)
					state.devices[i].rows[row] |=  bit(col); // set the bit
			else
				for (u8 i = ndevices; i --> 0 ;)
					state.devices[i].rows[row] &= ~bit(col); // clear the bit

			x <<= 1;
		}

		sync();
	}

	FORCE_INLINE void setCell(u8 device, u8 row, u8 col, u8 b) {
		if (device >= ndevices || row > 7 || col > 7)
			return;

		if (b) state.devices[device].rows[row] |=  bit(col);
		else   state.devices[device].rows[row] &= ~bit(col);

		sync(row);
	}

	FORCE_INLINE void setCell(u8 row, u8 col, u8 b) {
		if (row > 7 || col > 7)
			return;

		if (b)
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].rows[row] |=  bit(col);
		else
			for (u8 i = ndevices; i --> 0 ;)
				state.devices[i].rows[row] &= ~bit(col);

		sync(row);
	}

	FORCE_INLINE void toggleRow(u8 device, u8 row, u8 mask = 0xFF) {
		if (device >= ndevices || row > 7)
			return;

		state.devices[device].rows[row] ^= mask;
		sync(row);
	}

	FORCE_INLINE void toggleRow(u8 row, u8 mask = 0xFF) {
		// toggle a mega row.
		if (row > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].rows[row] ^= mask;

		sync(row);
	}

	FORCE_INLINE void toggleRow(u8 row, u8 *masks) {
		// toggle a mega row with a given mask for each row.
		// masks should be at least `ndevices` elements long.
		if (row > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].rows[row] ^= masks[i];

		sync(row);
	}

	FORCE_INLINE void toggleCol(u8 device, u8 col, u8 mask = 0xFF) {
		if (device >= ndevices || col > 7)
			return;

		for (u8 row = 8; row --> 0 ;)
			state.devices[device].rows[row] ^= ((mask >> row) & 1) << col;

		sync();
	}

	void toggleCol(u8 col, u8 mask = 0xFF) {
		// toggle the same column on all devices
		if (col > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			for (u8 row = 8; row --> 0 ;)
				state.devices[i].rows[row] ^= ((mask >> row) & 1) << col;

		sync();
	}

	void toggleCol(u8 col, u8 *masks) {
		// probably just use `toggleRow` with the transposed masks if possible.
		if (col > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			for (u8 row = 8; row --> 0 ;)
				state.devices[i].rows[row] ^= ((masks[i] >> row) & 1) << col;

		sync();
	}

	FORCE_INLINE void toggleCell(u8 device, u8 row, u8 col) {
		if (device >= ndevices || row > 7 || col > 7)
			return;

		state.devices[device].rows[row] ^= bit(col);
		sync(row);
	}

	FORCE_INLINE void toggleCell(u8 row, u8 col) {
		if (row > 7 || col > 7)
			return;

		for (u8 i = ndevices; i --> 0 ;)
			state.devices[i].rows[row] ^= bit(col);

		sync(row);
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

	FORCE_INLINE void init(u8 DIN, u8 CS, u8 CLK, u8 num_devices = MAX7219_MAXDEVICES) {
		static_assert((MAX7219_MAXDEVICES) > 1, "max devices can not be 0 or 1");

		ndevices = num_devices;
		auto clk_port_id = digitalPinToPort(CLK);

		port_out = (volatile u8 *) portOutputRegister(clk_port_id);

		if (__builtin_expect(!ndevices || ndevices > MAX7219_MAXDEVICES || port_out == NOT_A_PORT || clk_port_id != digitalPinToPort(DIN) || clk_port_id != digitalPinToPort(CS), 0)) {
			cli();
		#ifdef LED_BUILTIN
			// th should not happen. give some kind of data to the user to show
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
		send(OP_SCANLIMIT, 7);   // use all rows
		intensity(0);            // lowest intensity
		all(0);                  // blank the display
		send(OP_SHUTDOWN, 1);    // turn off power saving mode
	}

	FORCE_INLINE void init(u8 num_devices = MAX7219_MAXDEVICES) {
		init(MAX7219_DIN, MAX7219_CS, MAX7219_CLK, num_devices);
	}

	FORCE_INLINE Matrix(u8 DIN, u8 CS, u8 CLK, u8 num_devices = MAX7219_MAXDEVICES) {
		init(DIN, CS, CLK, num_devices);
	}

	FORCE_INLINE Matrix(u8 num_devices = MAX7219_MAXDEVICES) {
		init(num_devices);
	}
} // Matrix

} // Max7219

#undef MAX7219_DIN
#undef MAX7219_CS
#undef MAX7219_CLK
#undef UNROLL_SEND_LOOP
#undef MAX7219_MAXDEVICES
