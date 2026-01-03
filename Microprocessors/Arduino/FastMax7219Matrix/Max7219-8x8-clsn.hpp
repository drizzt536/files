// nocompile
#pragma once

#ifdef MAX7219_7221_8X8_MATRIX_IMPL
	#error only one implementation of Max7219 can be used
#endif

#define MAX7219_7221_8X8_MATRIX_IMPL

#include <arduino-avr-fdgpio.hpp>

#ifndef MAX7219_DIN
	#define MAX7219_DIN 2
#endif
#ifndef MAX7219_CS
	#define MAX7219_CS 3
#endif
#ifndef MAX7219_CLK
	#define MAX7219_CLK 4
#endif
#ifndef MAX7219_MAXDEVICES
	// probably don't set this higher than 16
	#define MAX7219_MAXDEVICES 8
#endif

class Max7219 {
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
		for (u8 i = 0; i < 8; i++) {
			W_PORT(port_out, bit_din, operand & 128);
			operand <<= 1;

			W_HIGH(port_out, bit_clk);
			W_LOW(port_out, bit_clk);
		}

		for (u8 i = 0; i < 8; i++) {
			W_PORT(port_out, bit_din, opcode & 128);
			opcode <<= 1;

			W_HIGH(port_out, bit_clk);
			W_LOW(port_out, bit_clk);
		}	
	#endif
	}

public:
	static constexpr u8 OP_NOOP        =  0; // operand ignored. does nothing
	// opcode 9 does nothing.
	static constexpr u8 OP_INTENSITY   = 10; // operand in [0, 15]. sets the current draw.
	static constexpr u8 OP_SCANLIMIT   = 11; // operand in in [0, 7] for rows 1-8
	static constexpr u8 OP_SHUTDOWN    = 12; // operand is 0 (normal) or 1 (power saving)
	// opcodes 13 and 14 don't exist
	static constexpr u8 OP_DISPLAYTEST = 15; // operand is 1/on or 0/off. turns on all LEDs with intensity 15.

	typedef union {
		u64 raw;
		u8 rows[8];
	} state_t;

	typedef union {
		state_t devices[MAX7219_MAXDEVICES];
		u8 raw[8*MAX7219_MAXDEVICES];
	} states_t;

	states_t state;
	u8 ndevices;
	u8 intensities[MAX7219_MAXDEVICES];

	FORCE_INLINE void send(u8 device, u8 opcode, u8 operand) const {
		// device is 0 indexed
		u8 i = ndevices;
		device++;

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

	FORCE_INLINE void sync(u8 row) const {
		W_LOW(port_out, bit_cs);
		for (u8 i = ndevices; i --> 0 ;)
			_send(row + 1, state.devices[i].rows[row]);
		W_HIGH(port_out, bit_cs);
	}

	FORCE_INLINE void sync(void) const {
		// update the devices with the state that this controller has.

		for (u8 row = 0; row < 8; row++)
			sync(row);
	}

	FORCE_INLINE void intensity(u8 device, u8 value) {
		if (device >= ndevices)
			return;

		if (value > 15)
			value = 15;

		intensities[device] = value;
		send(device, OP_INTENSITY, value);
	}

	FORCE_INLINE void intensity(u8 value) {
		if (value > 15)
			value = 15;

		for (u8 i = 0; i < ndevices; i++)
			intensities[i] = value;

		send(OP_INTENSITY, value);
	}

	FORCE_INLINE void update(u8 device, u8 r1, u8 r2, u8 r3, u8 r4, u8 r5, u8 r6, u8 r7, u8 r8) {
		// this multiplexes over rows and not devices,
		// so this can not be done more efficiently.
		state.devices[device].rows[0] = r1; state.devices[device].rows[1] = r2;
		state.devices[device].rows[2] = r3; state.devices[device].rows[3] = r4;
		state.devices[device].rows[4] = r5; state.devices[device].rows[5] = r6;
		state.devices[device].rows[6] = r7; state.devices[device].rows[7] = r8;

		send(device, 1, r1); send(device, 2, r2);
		send(device, 3, r3); send(device, 4, r4);
		send(device, 5, r5); send(device, 6, r6);
		send(device, 7, r7); send(device, 8, r8);
	}

	FORCE_INLINE void update(u8 device, state_t s) {
		update(device, 
			s.rows[0], s.rows[1], s.rows[2], s.rows[3],
			s.rows[4], s.rows[5], s.rows[6], s.rows[7]
		);
	}

	FORCE_INLINE void update(u8 device, u8 s[8]) {
		update(device, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]);
	}

	FORCE_INLINE void update(u8 device, u64 s) {
		update(device, (state_t) {.raw = s});
	}

	FORCE_INLINE void update(states_t s) {
		for (u8 i = 0; i < ndevices; i++)
			state.devices[i].raw = s.devices[i].raw;

		sync();
	}

	FORCE_INLINE void setRow(u8 device, u8 row, u8 x) {
		if (device >= ndevices || row > 7)
			return;

		state.devices[device].rows[row] = x;
		send(device, row + 1, x);
	}

	FORCE_INLINE void setRow(u8 row, u8 *xs) {
		// send a mega row. assumes the array is long enough.
		if (row > 7)
			return;

		for (u8 i = 0; i < ndevices; i++)
			state.devices[i].rows[row] = xs[i];

		sync(row);
	}

	void setCol(u8 device, u8 col, u8 x) {
		if (device >= ndevices || col > 7)
			return;

		const u8 mask = bit(col);

		for (u8 i = 0; i < 8; i++) {
			if (x & 1) state.devices[device].rows[i] |=  mask; // set the bit
			else       state.devices[device].rows[i] &= ~mask; // clear the bit

			x >>= 1;
		}

		sync();
	}

	void setCol(u8 col, u8 x) {
		// set the same column with the same value in all the devices
		if (col > 7)
			return;

		const u8 mask = bit(col);

		for (u8 i = 0; i < ndevices; i++) {
			u8 y = x; // tmp value
			for (u8 row = 0; row < 8; row++) {
				if (y & 1) state.devices[i].rows[row] |=  mask; // set the bit
				else       state.devices[i].rows[row] &= ~mask; // clear the bit

				y >>= 1;
			}
		}

		sync();
	}

	FORCE_INLINE void setCell(u8 device, u8 row, u8 col, u8 b) {
		if (device >= ndevices || row > 7 || col > 7)
			return;

		if (b) state.devices[device].rows[row] |= bit(col);
		else   state.devices[device].rows[row] &= ~bit(col);
		send(device, row + 1, state.devices[device].rows[row]);
	}

	FORCE_INLINE void setCell(u8 row, u8 col, u8 b) {
		if (row > 7 || col > 7)
			return;

		if (b)
			for (u8 d = 0; d < ndevices; d++)
				state.devices[d].rows[row] |= bit(col);
		else
			for (u8 d = 0; d < ndevices; d++)
				state.devices[d].rows[row] &= ~bit(col);

		sync(row);
	}

	FORCE_INLINE void toggleRow(u8 device, u8 row) {
		if (device >= ndevices || row > 7)
			return;

		state.devices[device].rows[row] ^= 0xFF;
		send(device, row + 1, state.devices[device].rows[row]);
	}

	FORCE_INLINE void toggleRow(u8 row) {
		// toggle a mega row.
		if (row > 7)
			return;

		for (u8 i = 0; i < ndevices; i++)
			state.devices[i].rows[row] ^= 0xFF;

		sync(row);
	}

	FORCE_INLINE void toggleCol(u8 device, u8 col) {
		if (device >= ndevices || col > 7)
			return;

		const u8 mask = bit(col);

		for (u8 i = 0; i < 8; i++)
			state.devices[device].rows[i] ^= mask;

		sync();
	}

	void toggleCol(u8 col) {
		// toggle the same column on all devices
		if (col > 7)
			return;

		const u8 mask = bit(col);

		for (u8 i = 0; i < ndevices; i++)
			for (u8 row = 0; row < 8; row++)
				state.devices[i].rows[row] ^= mask;

		sync();
	}

	FORCE_INLINE void toggleCell(u8 device, u8 row, u8 col) {
		if (device >= ndevices || row > 7 || col > 7)
			return;

		state.devices[device].rows[row] ^= bit(col);
		send(device, row + 1, state.devices[device].rows[row]);
	}

	FORCE_INLINE void toggleCell(u8 row, u8 col) {
		if (row > 7 || col > 7)
			return;

		for (u8 d = 0; d < ndevices; d++)
			state.devices[d].rows[row] ^= bit(col);

		sync(row);
	}

	FORCE_INLINE void all(u8 b) {
		if (b)
			for (u8 i = 0; i < ndevices; i++)
				state.devices[i].raw = ~0llu;
		else
			for (u8 i = 0; i < ndevices; i++)
				state.devices[i].raw = 0llu;

		sync();
	}

	FORCE_INLINE void Max7219(u8 DIN, u8 CS, u8 CLK, u8 num_devices) {
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

	FORCE_INLINE void Max7219(u8 num_devices) {
		Max7219(MAX7219_DIN, MAX7219_CS, MAX7219_CLK, num_devices);
	}
}

#undef MAX7219_DIN
#undef MAX7219_CS
#undef MAX7219_CLK
#undef UNROLL_SEND_LOOP
#undef MAX7219_MAXDEVICES
