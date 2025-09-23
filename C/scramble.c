#include <ctype.h>  // isxdigit
#include <math.h>   // powl, sinl, fmodl
#include <stdint.h> // uint8_t, int8_t
#include <stdio.h>  // fprintf, printf, puts, putchar
#include <stdlib.h> // srand, rand, malloc, sscanf
#include <string.h> // size_t, memcpy, strlen, strdup

// scambles a buffer. probably not cryptographically secure.


static uint8_t powuc(uint8_t x, uint8_t y) {
	y &= 0x7f; // `x^y % c == x^[y % phi(c)] % c`. phi(256) = 128
	uint8_t result = 1;

	while (y > 0) {
		if (y & 1) // odd; nonzero-digit
			result *= x;

		x *= x;
		y >>= 1;
	}

	return result;
}

static uint8_t f1(long double x) {
	// returns y probably bounded by [-30, 31], but as unsigned.
		// and definately bounded by [-31, 37]

	// for some reason, casting directly to u8 doesn't work for negative numbers. cast to i8 in-between.
	return (int8_t) (
		15*powl(sinl(x), 4)
		- 20*powl(sinl(2.0l/3.0l * x), 3)
		+ 5*powl(sinl(1.8914862321338063611l * x), 2) // (pi + 2) / e
		+ 8*sinl(47.0l/7.0l * x)
		- 11
	);
}

static uint8_t f2(size_t x) {
	// returns y bounded by [-9, 9], but as unsigned.
	// 18.258... == pi^2 + e^2 + 1
	return (int8_t) fmodl(5*x*x*x - 3*x*x + 5, 18.258660500020008846l) - 9;
}

extern void scramble(uint8_t *const buffer, size_t n) {
	// scramble a buffer. probably not any good.
	// not recommended for use anywhere.
	// uses the same argument for input and output

	if (n == 0) {
		// if it were to set the seed, this is the seed it would set it to:
		// srand(693504210u);
		// do nothing if there is no data.
		return;
	}

	// generate a seed from some random equation.
	// all of these constants are prime.
	srand(
		1073741827u
		+ (1930226729u*f1(n) ^ 2640315443u*f2(n))
		+ 4261425293u*n
		+  753772667u*n*n
		+ (3294808613u & n + buffer[n - 1] ^ buffer[0])
		+ (3587750923u*buffer[n >> 1] ^ n*1697972299u)
		+ 723001303u*(buffer[n - 1] + 265622579u)
		+  29346829u*(880796143u*buffer[0] + 270600821u)
		+ 199866581u*(685905019u + n*n*n)*buffer[n >> 2]
		+ 844954057u
			*( 258795617u & 2221365317u*buffer[n >> 3])
			*(2653736269u ^  661915909u*buffer[n >> 4]*n)
			*(2589415313u ^ 1918947571u*buffer[n >> 5])
	);

	if (n == 1) {
		// the normal algorithm sucks ass for length == 1
		// this one probably also sucks, but not nearly as much.
		// it doesn't return a null buffer for every single possible input.
		*buffer +=
			191*f1(*buffer)
			+ 137*f2(powuc(*buffer, *buffer))
			+ 149*(uint8_t) rand();

		return;
	}

	uint8_t *original_buffer_copy = (uint8_t *) malloc(n);
	memcpy(original_buffer_copy, buffer, n);

	const size_t length = n;
	size_t ri; // random index.


	// run 10 times for each byte
	while (n --> 0)
		for (uint8_t i = 10; i --> 0 ;) {
			buffer[n] +=
				f1(n)
				+ f2(n + i)
				+ powuc(buffer[n], n + 1)
				+ (uint8_t) n
				// for n == 0, use the last element instead of the previous.
				+ (buffer[(n || length) - 1] ^ buffer[n])
				+ (uint8_t) rand();

			// intertwine states with up to 40 other bytes
			// and swap values with up to 10 others
			// do less iterations if the buffer is really small.
				// based on the XORing, this probably gives more entropy.
				// so the XORs don't like cancel out because it keeps XORing
				// against the same values or something.
			for (uint8_t j = 1 + 3*(length >= 8) + 6*(length >= 16); j --> 0 ;) {
				// RAND_MAX is `2^16 - 1` on my machine,
				// so I need 5 random numbers to fill a `uint64`.
				ri =
					(size_t) rand() << 49
					| (size_t) rand() << 34
					| (size_t) rand() << 19
					| (size_t) rand() << 4
					^ (size_t) rand();

				// change the current byte given other bytes
				buffer[n] ^= buffer[(
					10477713472038931543llu*ri
					+ 5537748659337152491llu*i*j
				) % length];
				buffer[n] += 173 * buffer[(
					6591826058375317091llu*ri
					+ 14600030474646531647llu*i*i
				) % length];

				// change another byte given the current byte 
				buffer[(
					14730849229571327687llu*ri*i
					+ 11327731867854155477llu*j*j
					+ (4237980431llu^length)
				) % length] += 17*buffer[n];

				buffer[n] ^= buffer[length - n - 1];
				ri %= length;
				buffer[n] += buffer[length - ri - 1];

				// swap values with the random byte
				uint8_t tmp = buffer[n];
				buffer[n] = buffer[ri];
				buffer[ri] = tmp;
			}
		}

	n = length; // `length` is `const`.

	// for input lengths less than like 10, it tends to return a null buffer,
	// so XOR with the original buffer to stop this.
	// Instead of returning a null buffer, it will just be a fixed point.
	while (n --> 0)
		buffer[n] ^= original_buffer_copy[n];
}

#if !(defined(NO_MAIN) && NO_MAIN != 0)
int main(const int argc, const char *const *const argv) {
	if (argc < 2) {
		fprintf(stderr, "No arguments given. One is required.\n");
		return 1;
	}

	const char *hex = argv[1];

	size_t length = strlen(hex);
	if (length & 1) {
		fprintf(stderr, "Invalid argument. should be an even-length string of hex-digit characters.");
		return 2;
	}

	length >>= 1;

	uint8_t buffer[length];

	for (size_t i = 0; i < length; i++, hex += 2) {
		if (!isxdigit(hex[0]) || !isxdigit(hex[1])) {
			fprintf(stderr, "Invalid argument at byte index %zu. should only contain hex-digit characters.", i);

			return 3;
		}

		sscanf(hex, "%02hhx", buffer + i);
	}

	#if defined(DEBUG) && DEBUG != 0
		puts("before:");
		for (size_t i = 0; i < length; i++)
			printf("%02hhx", buffer[i]);

		putchar('\n');
		putchar('\n');

		scramble(buffer, length);

		puts("after:");
	#else
		scramble(buffer, length);
	#endif

	for (size_t i = 0; i < length; i++)
		printf("%02hhx", buffer[i]);

	putchar('\n');

	return 0;
}
#endif
