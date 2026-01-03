//	dsl: strict
//	dsl: version, ^1.0.0
//	dsl: version, <1.8.0
//	board: mega
//	port: COM3
//
//	def: SKETCH5
//	upload

#if defined(SKETCH4) || defined(SKETCH5)
static constexpr u8 DELAY = 100;
#endif

#define UNROLL_SEND_LOOP
#define MAX7219_DIN 48
#define MAX7219_CS  46
#define MAX7219_CLK 44
#include <Max7219-8x8-ns1.hpp>

#ifdef SKETCH4
static u8 next[8] = {	
	#ifdef S4_LOOP // some random one that loops and kind of looks cool
		0b00000000,
		0b00011000,
		0b00001100,
		0b00000110,
		0b00000000,
		0b00000000,
		0b00000000,
		0b00000000,
	#else // S4_GLIDER
		0b01000000,
		0b00100000,
		0b11100000,
		0b00000000,
		0b00000000,
		0b00000000,
		0b00000000,
		0b00000000,
	#endif
};
#elif defined SKETCH5
static u8 next[8]; // this is initialized in `setup`.
#endif


void setup(void) {
	Max7219::init();

#ifdef SKETCH4
	Max7219::update(next); // use the hardcoded matrix as the start state
#elif defined SKETCH5
	u16 tmp = (analogRead(A0) ^ millis()) | analogRead(A5) << 5;
	randomSeed((tmp << 9 | tmp >> 7) + (analogRead(A14) ^ micros()));

	#ifdef UNROLL_EVERYTHING
		Max7219::update(
			random(255), random(255), random(255), random(255),
			random(255), random(255), random(255), random(255)
		);
	#else
		for (u8 i = 0; i < 8; i++)
			Max7219::setRow(i, random(255));
	#endif
#endif
}

#ifdef SKETCH1
	#include "loop1.hpp"
#elif defined SKETCH2
	#include "loop2.hpp"
#elif defined(SKETCH4) || defined(SKETCH5)
	#include "loop4-5.hpp"
#elif defined SKETCH6
	#include "loop6.hpp"
#else
	#include "loop3.hpp"
#endif
