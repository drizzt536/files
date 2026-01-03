//	dsl: strict
//	dsl: version, ^1.0.0
//	dsl: version, <1.8.0
//	board: mega
//	port: COM3
//
//	upload

// this probably only works on the Arduino Mega 2560

#define UNROLL_SEND_LOOP
#define MAX7219_DIN 48
#define MAX7219_CS  46
#define MAX7219_CLK 44
#include <Max7219-8x8-ns1.hpp>

// radius of the deadzone. percentage is DEADZONE/1023
#define DEADZONE 51

using Max7219::state;

static FORCE_INLINE void apply_state_AND(bool nand) {
	state.raw = ~0llu; // set to all ones instead of all zeros.
	// this one uses a temporary value so as not to be fixed to all on or all off.
	u64 tmp = 0;
	// rows
	if (!R_PORTBIT(&PINA, 0)) tmp |= 0x0101010101010101llu;
	if (!R_PORTBIT(&PINA, 1)) tmp |= 0x0202020202020202llu;
	if (!R_PORTBIT(&PINA, 2)) tmp |= 0x0404040404040404llu;
	if (!R_PORTBIT(&PINA, 3)) tmp |= 0x0808080808080808llu;
	if (!R_PORTBIT(&PINA, 4)) tmp |= 0x1010101010101010llu;
	if (!R_PORTBIT(&PINA, 5)) tmp |= 0x2020202020202020llu;
	if (!R_PORTBIT(&PINA, 6)) tmp |= 0x4040404040404040llu;
	if (!R_PORTBIT(&PINA, 7)) tmp |= 0x8080808080808080llu;
	state.raw &= tmp;

	tmp = 0;
	// columns
	if (!R_PORTBIT(&PINC, 0)) tmp |= 0x00000000000000ffllu;
	if (!R_PORTBIT(&PINC, 1)) tmp |= 0x000000000000ff00llu;
	if (!R_PORTBIT(&PINC, 2)) tmp |= 0x0000000000ff0000llu;
	if (!R_PORTBIT(&PINC, 3)) tmp |= 0x00000000ff000000llu;
	if (!R_PORTBIT(&PINC, 4)) tmp |= 0x000000ff00000000llu;
	if (!R_PORTBIT(&PINC, 5)) tmp |= 0x0000ff0000000000llu;
	if (!R_PORTBIT(&PINC, 6)) tmp |= 0x00ff000000000000llu;
	if (!R_PORTBIT(&PINC, 7)) tmp |= 0xff00000000000000llu;
	state.raw &= tmp;

	tmp = 0;
	// the corner things
	if (!R_PORTBIT(&PINL, 2)) tmp |= 0x8100000000000081llu;
	if (!R_PORTBIT(&PINL, 4)) tmp |= 0x42c300000000c342llu;
	if (!R_PORTBIT(&PINL, 6)) tmp |= 0x2424e70000e72424llu;
	if (!R_PORTBIT(&PINL, 7)) tmp |= 0x0102040810204080llu;
	state.raw &= tmp;

	if (nand)
		state.raw = ~state.raw;
}

static FORCE_INLINE void apply_state_OR(bool nor) {
	// rows
	if (!R_PORTBIT(&PINA, 0)) state.raw |= 0x0101010101010101llu;
	if (!R_PORTBIT(&PINA, 1)) state.raw |= 0x0202020202020202llu;
	if (!R_PORTBIT(&PINA, 2)) state.raw |= 0x0404040404040404llu;
	if (!R_PORTBIT(&PINA, 3)) state.raw |= 0x0808080808080808llu;
	if (!R_PORTBIT(&PINA, 4)) state.raw |= 0x1010101010101010llu;
	if (!R_PORTBIT(&PINA, 5)) state.raw |= 0x2020202020202020llu;
	if (!R_PORTBIT(&PINA, 6)) state.raw |= 0x4040404040404040llu;
	if (!R_PORTBIT(&PINA, 7)) state.raw |= 0x8080808080808080llu;

	// columns
	if (!R_PORTBIT(&PINC, 0)) state.raw |= 0x00000000000000ffllu;
	if (!R_PORTBIT(&PINC, 1)) state.raw |= 0x000000000000ff00llu;
	if (!R_PORTBIT(&PINC, 2)) state.raw |= 0x0000000000ff0000llu;
	if (!R_PORTBIT(&PINC, 3)) state.raw |= 0x00000000ff000000llu;
	if (!R_PORTBIT(&PINC, 4)) state.raw |= 0x000000ff00000000llu;
	if (!R_PORTBIT(&PINC, 5)) state.raw |= 0x0000ff0000000000llu;
	if (!R_PORTBIT(&PINC, 6)) state.raw |= 0x00ff000000000000llu;
	if (!R_PORTBIT(&PINC, 7)) state.raw |= 0xff00000000000000llu;

	// the corner things
	if (!R_PORTBIT(&PINL, 2)) state.raw |= 0x8100000000000081llu;
	if (!R_PORTBIT(&PINL, 4)) state.raw |= 0x42c300000000c342llu;
	if (!R_PORTBIT(&PINL, 6)) state.raw |= 0x2424e70000e72424llu;
	if (!R_PORTBIT(&PINL, 7)) state.raw |= 0x0102040810204080llu;

	if (nor)
		state.raw = ~state.raw;
}

static FORCE_INLINE void apply_state_XOR(bool nxor) {
	// toggle rows
	if (!R_PORTBIT(&PINA, 0)) state.raw ^= 0x0101010101010101llu;
	if (!R_PORTBIT(&PINA, 1)) state.raw ^= 0x0202020202020202llu;
	if (!R_PORTBIT(&PINA, 2)) state.raw ^= 0x0404040404040404llu;
	if (!R_PORTBIT(&PINA, 3)) state.raw ^= 0x0808080808080808llu;
	if (!R_PORTBIT(&PINA, 4)) state.raw ^= 0x1010101010101010llu;
	if (!R_PORTBIT(&PINA, 5)) state.raw ^= 0x2020202020202020llu;
	if (!R_PORTBIT(&PINA, 6)) state.raw ^= 0x4040404040404040llu;
	if (!R_PORTBIT(&PINA, 7)) state.raw ^= 0x8080808080808080llu;

	// toggle columns
	if (!R_PORTBIT(&PINC, 0)) state.raw ^= 0x00000000000000ffllu;
	if (!R_PORTBIT(&PINC, 1)) state.raw ^= 0x000000000000ff00llu;
	if (!R_PORTBIT(&PINC, 2)) state.raw ^= 0x0000000000ff0000llu;
	if (!R_PORTBIT(&PINC, 3)) state.raw ^= 0x00000000ff000000llu;
	if (!R_PORTBIT(&PINC, 4)) state.raw ^= 0x000000ff00000000llu;
	if (!R_PORTBIT(&PINC, 5)) state.raw ^= 0x0000ff0000000000llu;
	if (!R_PORTBIT(&PINC, 6)) state.raw ^= 0x00ff000000000000llu;
	if (!R_PORTBIT(&PINC, 7)) state.raw ^= 0xff00000000000000llu;

	// toggle the corner things
	if (!R_PORTBIT(&PINL, 2)) state.raw ^= 0x8100000000000081llu;
	if (!R_PORTBIT(&PINL, 4)) state.raw ^= 0x42c300000000c342llu;
	if (!R_PORTBIT(&PINL, 6)) state.raw ^= 0x2424e70000e72424llu;
	if (!R_PORTBIT(&PINL, 7)) state.raw ^= 0x0102040810204080llu;

	if (nxor)
		// stfu. I am not using xnor because it is a notted xor.
		// exclusive nor doesn't make any sense. I am aware that
		// nxor is not an actual gate. I do not care.
		state.raw = ~state.raw;
}

static FORCE_INLINE i16 readX(void) { return analogRead(A15); }
static FORCE_INLINE i16 readY(void) { return analogRead(A14); }

constexpr u8 rbit_table[16] = {
	0,  8, 4, 12,
	2, 10, 6, 14,
	1,  9, 5, 13,
	3, 11, 7, 15,
};

static FORCE_INLINE u8 rbit(u8 x) {
	return rbit_table[x & 15] << 4 | rbit_table[x >> 4];
}

void setup(void) {
	// set all the pins in ports A and C as input pullup.
	DDRA = 0; PORTA = 0xff;
	DDRC = 0; PORTC = 0xff;

	// pins 42, 43, 45, and 47
	DDRL &= ~0b11010100;
	PORTL |= 0b11010100;

	// pins 2, 3, and 5
	// for some reason, pin 4 is on port G, so it is skipped.
	DDRE &= ~0b00111000;
	PORTE |= 0b00111000;

	// pin 53: stick drift recalibration pin.
	DDRB &= ~0b00000001;
	PORTB |= 0b00000001;

	Max7219::init();
}

void loop(void) {
	state.raw = 0llu;

	// default to no inverts and no rotations
	static i16 x = 0, y = 0;
	static u8 sx = 1, sy = 1, tsp = 0; // x and y sign bits and transpose bit.

	// save the starting values to calibrate for stick drift.
	// NOTE: this assumes the stick is in the starting state, which it may not be.
	//       if that is the case, that is the user's fault. they can just recalibrate it.
	static u16 x0 = readX(), y0 = readY();

	const u8 mode = (PINE >> 3) & 0b111;
	// [pin 3] [~pin 2] [pin 5] (pullup, so 0 is on and 1 is off)
	// 000 and 001: 00 => OR
	// 010 and 011: 01 => XOR
	// 100 and 101: 10 => AND
	// 110 and 111: 11 => NAND

	if (mode >= 0b100)
		apply_state_AND(mode & 0b010);
	else if (mode & 0b010)
		apply_state_XOR(false);
	else
		apply_state_OR(false);

	if (!R_PORTBIT(&PINB, 0)) {
		// recalibrate for stick drift.
		x0 = readX();
		y0 = readX();

		if (x > 1023 || y > 1023)
			__builtin_unreachable();
	}

	if (!(mode & 0b001)) {
		// adjust so the neutral position is at (0, 0).
		x = readX() - x0;
		y = readY() - x0;

		if (x < -1023 || x > 1023 || y < -1023 || y > 1023)
			// tell the compiler the bounds on the return values.
			// these are the worst possible cases of stick drift.
			__builtin_unreachable();

		tsp = 0;
		// convert from twos compliment to sign and magnitude
		u16 abs_x = x < 0 ? -x : x;  sx = x < DEADZONE;
		u16 abs_y = y < 0 ? -y : y;  sy = y < DEADZONE;

		// apply controller deadzone
		if (abs_x < DEADZONE && abs_y < DEADZONE) {
			// the circular deadzone is completely contained in the square deadzone.
			// this will be 4802 at most, which fits in 16 bits.
			if (abs_x*abs_x + abs_y*abs_y < DEADZONE*DEADZONE)
				goto apply_tfms;
		}

		u8 rot_mode;

		// these approximate |x| tan([2n - 1] pi/12) < |y| < |x| tan([2n + 1] pi/12)
		if (abs_y < (abs_x * 69 >> 8))
			rot_mode = 0;
		else if (abs_y < abs_x)
			rot_mode = 1;
		else if (abs_x < (abs_y * 69 >> 8))
			// this is ordered like this for precision.
			// 69/256 is more precise than 119/32
			rot_mode = 2;
		else
			rot_mode = 3;

		if (sx ^ sy)
			// quadrants 2 and 4 have the opposite order.
			rot_mode = 3 - rot_mode;

		switch (rot_mode) {
		case 0: // 0° ccw
			break;
		case 1: // 90° ccw: transpose, invert y
			tsp = 1;
			sy ^= 1;
			break;
		case 2: // 180° ccw : invert x, invert y
			sx ^= 1;
			sy ^= 1;
			break;
		case 3: // -90° ccw : transpose, invert x
			tsp = 1;
			sx ^= 1;
			break;
		default:
			__builtin_unreachable();
		}
	}

apply_tfms:
	// the transpose has to be before the inversions, otherwise the rotations
	// will be in the wrong directions.
	if (tsp) {
		// SWAR butterfly bitboard transpose
		u64 tmp;

		tmp = (state.raw ^ (state.raw >> 7)) & 0x00AA00AA00AA00AAllu;
		state.raw ^= tmp ^ (tmp << 7);

		tmp = (state.raw ^ (state.raw >> 14)) & 0x0000CCCC0000CCCCllu;
		state.raw ^= tmp ^ (tmp << 14);

		tmp = (state.raw ^ (state.raw >> 28)) & 0x00000000F0F0F0F0llu;
		state.raw ^= tmp ^ (tmp << 28);
	}

	// invert x (reverse the integers in each row)
	if (!sx)
		for (u8 row = 0; row < 8; row++)
			state.rows[row] = rbit(state.rows[row]);

	// invert y (reverse the row order).
	if (!sy) {
		u8 tmp;
		tmp = state.rows[0]; state.rows[0] = state.rows[7]; state.rows[7] = tmp;
		tmp = state.rows[1]; state.rows[1] = state.rows[6]; state.rows[6] = tmp;
		tmp = state.rows[2]; state.rows[2] = state.rows[5]; state.rows[5] = tmp;
		tmp = state.rows[3]; state.rows[3] = state.rows[4]; state.rows[4] = tmp;
	}

	Max7219::sync();
}
