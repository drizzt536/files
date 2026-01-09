## file naming convention

- files with `8x8` in the name control 8x8 LED matrices, and files with `7seg` in the name control 7-segment displays. Both can be used at the same time, but only one from each category.
- files ending in `-nsX.hpp` use a namespace implementation, meaning they use a single compile-time static pinset, and do not support runtime pinset switching. The pinsets are controlled by the `MAX7219_DIN`, `MAX7219_CS`, and `MAX7219_CLK` macros.
- files ending in `-clsX.hpp` use a class implementation, so they allow runtime pinsets, multiple pinsets, and pinset switching without creating new instances. The `MAX7219_DIN`, `MAX7219_CS`, and `MAX7219_CLK` macros are still used, but only as default values if runtime values aren't.
- files ending in `1.hpp` do not support daisy chaining.
- files ending in `n.hpp` support daisy chaining up to 255 deep, determined by the `MAX7219_MAXDEVICES` macro, which defaults to 8.


## files

- fdgpio.hpp
- Max7219-opcodes.hpp
- Max7219-7seg-ns1.hpp
- Max7219-7seg-nsn.hpp
- Max7219-7seg-cls1.hpp
- Max7219-7seg-clsn.hpp
- Max7219-8x8-ns1.hpp
- Max7219-8x8-nsn.hpp
- Max7219-8x8-cls1.hpp
- Max7219-8x8-clsn.hpp

## misc

All implementations support both the MAX7219 and MAX7221 as they are drop-in replacements of each other.

the `sync` functions only sync rows/digits. they do not sync decode mode or led intensity. those variables should only be read from user space.

Since the library uses direct port access and uses the Arduino API, it will only work on Arduino MCUs that use ports, so basically only the 8-bit AVR MCUs.

If initialization fails, it will disable interrupts and flicker the on-board LED at 6.7Hz (or just trap if there is no on-board LED). This happens if the pins aren't on the same port, not all of the pins exist, or in daisy chaining implementations, it will fail if the number of devices is 0 or more than 8.

for the namespace versions, the pinsets are controlled through the `MAX7219_DIN`, `MAX7219_CS`, and `MAX7219_CLK` macros which must be defined before including the library. The library undefines them when it is done. They default to 2, 3, and 4, respectively. The class versions still use the macros, but instead of controlling the pinsets directly, they control the defaults, so if `init` is called without passing the pins, it uses the macros for them.

Calling any functions before `init` in the namespace implementations is undefined behavior. They will likely not write to the correct pins, if they write to any pins at all.

Also, for the class implementations, the pinset can be switched by just calling `init` again with new data.

For daisy chaining versions, the maximum number of daisy chained devices allowed is controlled by `MAX7219_MAXDEVICES`, which defaults to 8. It also has to be defiled before including the library, and is undefined after the library is included. Setting the max devices higher than 8 may cause problems.

If `UNROLL_SEND_LOOP` is defined before including the library, then the loops in `_send` are unrolled. This is best if you care a lot about speed, because 8-bit AVR CPUs don't have a cache, so unrolling just makes it faster for free. The macro is undefined after the library is included.

fdgpio.hpp is used for faster reads and writes to digital pins.
It provides the following macros:
 - `FORCE_INLINE`: same as `inline [[gnu::always_inline]]`
 - `analogToDigital(pin)`: same as `turnOffPWM(digitalPinToTimer(pin))`.
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
