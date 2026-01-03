All implementations support both the MAX7219 and MAX7221.
They only control matrix arrays, and will not work for seven-segment displays.

Pick the first implementation that minimally meets your constraints.

1. Max7219-8x8-ns1.hpp
	- namespace implementation (does not support multiple pinsets or runtime pinset switching)
	- does not support daisy chaining

2. Max7219-8x8-nsn.hpp
	- namespace implementation (does not support multiple pinsets or runtime pinset switching)
	- supports daisy chaining

3. Max7219-8x8-cls1.hpp
	- class implementation (supports multiple pinsets and runtime pinset switching)
	- does not support daisy chaining

4. Max7219-8x8-clsn.hpp
	- class implementation (supports multiple pinsets and runtime pinset switching)
	- supports daisy chaining

If initialization fails, it will disable interrupts and flicker the on-board LED at 6.7Hz (or just trap if there is no on-board LED). This happens if the pins aren't on the same port, not all of the pins exist, or in daisy chaining implementations, it will fail if the number of devices is 0 or more than 8.

for the namespace versions, the pinsets are controlled through the `MAX7219_DIN`, `MAX7219_CS`, and `MAX7219_CLK` macros which must be defined before including the library. The library undefines them when it is done. They default to 2, 3, and 4, respectively. The class versions still use the macros, but instead of controlling the pinsets directly, they control the defaults, so if `init` is called without passing the pins, it uses the macros for them.

Calling any functions before `init` in the namespace implementations is undefined behavior. They will likely not write to the correct pins, if they write to any pins at all.

For daisy chaining versions, the maximum number of daisy chained devices allowed is controlled by `MAX7219_MAXDEVICES`, which defaults to 8. It also has to be defiled before including the library, and is undefined after the library is included. Setting the max devices higher than 8 may cause problems.

If `UNROLL_SEND_LOOP` is defined before including the library, then the loops in `_send` are unrolled. This is best if you care a lot about speed, because 8-bit AVR CPUs don't have a cache, so unrolling just makes it faster for free. The macro is undefined after the library is included.

arduino-avr-fdgpio.hpp is used for faster reads and writes to digital pins.
It provides the following macros:
 - `FORCE_INLINE`: same as `inline __attribute__((always_inline))`
 - `W_LOW(port, mask)`: sets a pin low
 - `W_HIGH(port, mask)`: sets a pin high
 - `W_TOGGLE(port, mask)`: toggles a pin value
 - `W_PORT(port, mask, cond)`: sets a pin high or low depending on the condition.
 - `R_PORT(port, mask)`: reads a pin and returns 0 or 1
 - `R_PORTBIT(port, bit)`: reads a pin and returns 0 or 1. takes a bit index instead of a mask
 - `pinInput(pin)`: same as `pinMode(pin, INPUT)`, but faster
 - `pinInputPullup(pin)`: same as `pinMode(pin, INPUT_PULLUP)`, but faster
 - `pinOutput(pin)`: same as `pinMode(pin, OUTPUT)`, but faster
 - `fastRead(pin)`: same as `digitalRead(pin)`, but faster
 - `fastWrite(pin, b)`: same as `digitalWrite(pin, b)`, but faster.
 - `fastPinMode(pin, mode)`: same as `pinMode(pin, mode)`, but faster.
