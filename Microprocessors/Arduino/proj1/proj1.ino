// dsl: strict
// def: SKETCH3
// board: mega
// upload

// runs on the Arduino Mega 2560, but probably also works on other boards,
// so long as they have at least 48 pins, so basically only the megas.

#if defined(SKETCH1)
	#include "sketch1.hpp"
#elif defined(SKETCH2)
	#include "sketch2.hpp"
#else
	#include "sketch3.hpp"
#endif
