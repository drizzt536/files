//	dsl: strict
//	dsl: version, ^1.0.0
//	dsl: version, <1.8.0
//	board: mega
//	port: COM3
//
//	def: SKETCH5
//	upload

#define UNROLL_SEND_LOOP
#define MAX7219_DIN 48
#define MAX7219_CS  46
#define MAX7219_CLK 44
#include <Max7219-8x8-ns1.hpp>

#ifdef SKETCH4
static Max7219::state_t next = (Max7219::state_t) {.raw =
	#ifdef S4_LOOP // some random one that loops and kind of looks cool
		0b0000000000011000000011000000011000000000000000000000000000000000llu
	#elif defined S4_P3
		0xf800f85516301655llu
	#elif defined S4_P12
		0x6c40e215cdb56749llu
	#elif defined(S4_P132) || defined(S4_T423)
		0x28177566421dabacllu
	#elif defined S4_CHECKERED4
		0b1111000000001111111100000000111111110000000011111111000000001111llu
	#elif defined S4_CHECKERED2
		0b1100110000110011110011000011001111001100001100111100110000110011llu
	#elif defined S4_CHECKERED1
		0b1010101001010101101010100101010110101010010101011010101001010101llu
	#else // S4_GLIDER
		0b0100000000100000111000000000000000000000000000000000000000000000llu
	#endif
};
#elif defined SKETCH5
static state_t next;
#endif

void setup(void) {
	Max7219::init();

#ifdef SKETCH4
	Max7219::update(next); // use the hardcoded matrix as the start state
#elif defined(SKETCH5) || defined(SKETCH7)
	u16 tmp = (analogRead(A0) ^ millis()) | analogRead(A5) << 5;
	randomSeed((tmp << 9 | tmp >> 7) + (analogRead(A14) ^ micros()));

	Max7219::update(
		random(255), random(255), random(255), random(255),
		random(255), random(255), random(255), random(255)
	);
#endif
}

#ifdef SKETCH1
	#include "loop1.hpp"
#elif defined SKETCH2
	#include "loop2.hpp"
#elif defined(SKETCH4) || defined(SKETCH5)
	#define MOORE_NEIGHBORHOOD
	#include "loop4-5.hpp"
#elif defined SKETCH6
	#include "loop6.hpp"
#elif defined SKETCH7
	#include "loop7.hpp"
#else
	#include "loop3.hpp"
#endif
