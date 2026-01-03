#pragma once
#define FDGPIO_HPP
// Arduino AVR Fast digital GPIO

// Don't use any of these macros if you plan on switching a pin between analog and digital
// for some reason. these all assume the pin is on digital mode before they run.

// pinouts: https://docs.arduino.cc/resources/pinouts/<ID>-full-pinout.pdf
// Uno Rev3:  A000066
// Mega 2560: A000067

using i8  = int8_t;
using i16 = int16_t;
using i32 = int32_t;
using i64 = int64_t;

using u8  = uint8_t;
// using u16 = uint16_t;
using u32 = uint32_t;
using u64 = uint64_t;

#ifndef FORCE_INLINE
	#define FORCE_INLINE inline __attribute__((always_inline))
#endif

// write
#ifndef W_LOW
	#define W_LOW(out, mask) (*(out) &= ~mask)
#endif

#ifndef W_HIGH
	#define W_HIGH(out, mask) (*(out) |= mask)
#endif

#ifndef W_TOGGLE
	#define W_TOGGLE(out, mask) (*(out) ^= mask)
#endif

#ifndef W_PORT
	// write to a port given a boolean condition
	#define W_PORT(out, mask, cond) ((cond) ? W_HIGH(out, mask) : W_LOW(out, mask))
#endif

// read
#ifndef R_PORT
	#define R_PORT(in, mask) ((*(in) & mask) != 0)
#endif

#ifndef R_PORTBIT
	#define R_PORTBIT(in, bit) ((*(in) >> (bit)) & 1)
#endif


#ifndef pinInput
	#define pinInput(pin) ({                       \
		auto const port = digitalPinToPort(pin);   \
		const u8 mask = ~digitalPinToBitMask(pin); \
		*portModeRegister(port)   &= mask;         \
		*portOutputRegister(port) &= mask;         \
		(void) 0;                                  \
	})
#endif

#ifndef pinInputPullup
	#define pinInputPullup(pin) ({                \
		auto const port = digitalPinToPort(pin);  \
		const u8 mask = digitalPinToBitMask(pin); \
		*portModeRegister(port)   &= ~mask;       \
		*portOutputRegister(port) |=  mask;       \
		(void) 0;                                 \
	})
#endif

#ifndef pinOutput
	#define pinOutput(pin) \
		((*portModeRegister(digitalPinToPort(pin)) |= digitalPinToBitMask(pin)), (void) 0)
#endif

////////////////////////////////////////////////////////////////////////////////

#ifndef fastRead
	// same as digitalRead, but faster when applicable.
	#define fastRead(pin) R_PORT(                 \
		portInputRegister(digitalPinToPort(pin)), \
		digitalPinToBitMask(pin)                  \
	)
#endif

#ifndef fastWrite
	// same as digitalWrite, but faster when applicable.
	#define fastWrite(pin, b) W_PORT(              \
		portOutputRegister(digitalPinToPort(pin)), \
		digitalPinToBitMask(pin),                  \
		b                                          \
	)
#endif

#ifndef fastPinMode
	#define fastPinMode(pin, mode) (                   \
		(mode) == INPUT        ? pinInput(pin)       : \
		(mode) == INPUT_PULLUP ? pinInputPullup(pin) : \
		pinOutput(pin)                                 \
	)
#endif
