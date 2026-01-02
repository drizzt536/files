// gcc sha1.c -o sha1
// use `-D HUMAN` to get a human readable output for dumps.
// NOTE: using `-Werror -Wall -Wextra` will not work.

#include <stdio.h>
#include <string.h> // memset, memcpy, strcmp
#include <stdlib.h> // malloc
#include <stdint.h> // uint32_t, uint8_t
#include <stdbool.h>

#define WIPE_VARIABLES 0 // this isn't necessary, but probably good for security.
#define byte uint8_t

typedef struct {
	uint32_t state[5];
	uint32_t count[2];
	byte buffer[64];
} SHA1_CTX;

////////////////////////////////////////////////////////////////
// SHA1 implementation
// I took this from github.com/clibs/sha1

#define rol(value, bits) ((value) << bits | (value) >> 32 - bits)

// blk0() and blk() perform the initial expand.
#if BYTE_ORDER == LITTLE_ENDIAN
	#define blk0(i) (block->l[i] = (rol(block->l[i], 24) & 0xFF00FF00) \
		| (rol(block->l[i], 8) & 0xFF00FF))
#elif BYTE_ORDER == BIG_ENDIAN
	#define blk0(i) block->l[i]
#else
	#error "Endianness is not defined"
#endif

#define blk(i) (block->l[i & 15] = rol( \
	  block->l[(i + 13) & 15] \
	^ block->l[(i +  8) & 15] \
	^ block->l[(i +  2) & 15] \
	^ block->l[ i       & 15], 1))

// (R0+R1), R2, R3, R4 are the different operations used in SHA1
#define R0(v, w, x, y, z, i) z += ((x ^ y) & w ^ y) \
	+ blk0(i) \
	+ 0x5A827999 \
	+ rol(v, 5); \
	w = rol(w, 30);
#define R1(v, w, x, y, z, i) z += ((x ^ y) & w ^ y) \
	+ blk(i) \
	+ 0x5A827999 \
	+ rol(v, 5); \
	w = rol(w, 30);
#define R2(v, w, x, y, z, i) z += (w ^ x ^ y) \
	+ blk(i) \
	+ 0x6ED9EBA1 \
	+ rol(v, 5); \
	w = rol(w, 30);
#define R3(v, w, x, y, z, i) z += ((w | x) & y | w & x) \
	+ blk(i) \
	+ 0x8F1BBCDC \
	+ rol(v, 5); \
	w = rol(w, 30);
#define R4(v, w, x, y, z, i) z += (w ^ x ^ y) \
	+ blk(i) \
	+ 0xCA62C1D6 \
	+ rol(v, 5); \
	w = rol(w, 30);

void SHA1Transform(uint32_t state[5], const byte buffer[64]) {
	// Hash a single 512-bit block. This is the core of the algorithm.
	uint32_t a, b, c, d, e;

	union {
		byte c[64];
		uint32_t l[16];
	} block[1]; // use array to appear as a pointer

	memcpy(block, buffer, 64);

	// Copy context->state[] to working vars
	a = state[0];
	b = state[1];
	c = state[2];
	d = state[3];
	e = state[4];

	// 4 rounds of 20 operations each. Loop unrolled.
	R0(a, b, c, d, e,  0); R0(e, a, b, c, d,  1);
	R0(d, e, a, b, c,  2); R0(c, d, e, a, b,  3);
	R0(b, c, d, e, a,  4); R0(a, b, c, d, e,  5);
	R0(e, a, b, c, d,  6); R0(d, e, a, b, c,  7);
	R0(c, d, e, a, b,  8); R0(b, c, d, e, a,  9);
	R0(a, b, c, d, e, 10); R0(e, a, b, c, d, 11);
	R0(d, e, a, b, c, 12); R0(c, d, e, a, b, 13);
	R0(b, c, d, e, a, 14); R0(a, b, c, d, e, 15);

	R1(e, a, b, c, d, 16); R1(d, e, a, b, c, 17);
	R1(c, d, e, a, b, 18); R1(b, c, d, e, a, 19);

	R2(a, b, c, d, e, 20); R2(e, a, b, c, d, 21);
	R2(d, e, a, b, c, 22); R2(c, d, e, a, b, 23);
	R2(b, c, d, e, a, 24); R2(a, b, c, d, e, 25);
	R2(e, a, b, c, d, 26); R2(d, e, a, b, c, 27);
	R2(c, d, e, a, b, 28); R2(b, c, d, e, a, 29);
	R2(a, b, c, d, e, 30); R2(e, a, b, c, d, 31);
	R2(d, e, a, b, c, 32); R2(c, d, e, a, b, 33);
	R2(b, c, d, e, a, 34); R2(a, b, c, d, e, 35);
	R2(e, a, b, c, d, 36); R2(d, e, a, b, c, 37);
	R2(c, d, e, a, b, 38); R2(b, c, d, e, a, 39);

	R3(a, b, c, d, e, 40); R3(e, a, b, c, d, 41);
	R3(d, e, a, b, c, 42); R3(c, d, e, a, b, 43);
	R3(b, c, d, e, a, 44); R3(a, b, c, d, e, 45);
	R3(e, a, b, c, d, 46); R3(d, e, a, b, c, 47);
	R3(c, d, e, a, b, 48); R3(b, c, d, e, a, 49);
	R3(a, b, c, d, e, 50); R3(e, a, b, c, d, 51);
	R3(d, e, a, b, c, 52); R3(c, d, e, a, b, 53);
	R3(b, c, d, e, a, 54); R3(a, b, c, d, e, 55);
	R3(e, a, b, c, d, 56); R3(d, e, a, b, c, 57);
	R3(c, d, e, a, b, 58); R3(b, c, d, e, a, 59);

	R4(a, b, c, d, e, 60); R4(e, a, b, c, d, 61);
	R4(d, e, a, b, c, 62); R4(c, d, e, a, b, 63);
	R4(b, c, d, e, a, 64); R4(a, b, c, d, e, 65);
	R4(e, a, b, c, d, 66); R4(d, e, a, b, c, 67);
	R4(c, d, e, a, b, 68); R4(b, c, d, e, a, 69);
	R4(a, b, c, d, e, 70); R4(e, a, b, c, d, 71);
	R4(d, e, a, b, c, 72); R4(c, d, e, a, b, 73);
	R4(b, c, d, e, a, 74); R4(a, b, c, d, e, 75);
	R4(e, a, b, c, d, 76); R4(d, e, a, b, c, 77);
	R4(c, d, e, a, b, 78); R4(b, c, d, e, a, 79);

	// Add the working vars back into context.state[]
	state[0] += a;
	state[1] += b;
	state[2] += c;
	state[3] += d;
	state[4] += e;

#if WIPE_VARIABLES
	a = b = c = d = e = 0;
	memset(block, '\0', sizeof(block));
#endif
}

void SHA1Init(SHA1_CTX *context) {
	// SHA1 initialization constants
	context->state[0] = 0x67452301; // 103  69  35   1
	context->state[1] = 0xEFCDAB89; // 239 205 171 137
	context->state[2] = 0x98BADCFE; // 152 186 220 254
	context->state[3] = 0x10325476; //  16  50  84 118
	context->state[4] = 0xC3D2E1F0; // 195 210 225 240
	context->count[0] = context->count[1] = 0;
}

void SHA1Update(SHA1_CTX *context, const byte *data, uint32_t len) {
	uint32_t i, j = context->count[0];

	if ((context->count[0] += len << 3) < j)
		context->count[1]++;

	context->count[1] += len >> 29;

	j = (j >> 3) & 63;

	if (j + len > 63) {
		memcpy(&context->buffer[j], data, (i = 64 - j));
		SHA1Transform(context->state, context->buffer);
		for (; i + 63 < len; i += 64)
			SHA1Transform(context->state, &data[i]);

		j = 0;
	}
	else
		i = 0;

	memcpy(&context->buffer[j], &data[i], len - i);
}

void SHA1Final(byte digest[20], SHA1_CTX *context) {
	byte i, c, finalcount[8];

	for (i = 0; i < 8; i++)
		// Endian independent
		finalcount[i] = (byte) ((context->count[i < 4] >> (3 - (i & 3)) * 8) & 255);

	c = 0x80;
	SHA1Update(context, &c, 1);
	while ((context->count[0] & 504) != 448) {
		c = 0x00;
		SHA1Update(context, &c, 1);
	}
	SHA1Update(context, finalcount, 8); // Should cause a SHA1Transform()
	for (i = 0; i < 20; i++)
		digest[i] = (byte) ((context->state[i >> 2] >> ((3 - (i & 3)) * 8)) & 255);

#if WIPE_VARIABLES
	memset(context, '\0', sizeof(*context));
	memset(&finalcount, '\0', sizeof(finalcount));
#endif
}

void SHA1(byte *digest, const char *str, uint32_t len) {
	SHA1_CTX ctx;

	SHA1Init(&ctx);
	SHA1Update(&ctx, (const byte *) str, len);
	SHA1Final(digest, &ctx);
}

////////////////////////////////////////////////////////////////
// extra helper functions

void printHex(byte *bytes, uint32_t n) {
	for (uint32_t i = 0; i < n; i++)
		printf("%02X", bytes[i]);

	printf("\n");
}

void SHA1PrintFinal(SHA1_CTX *context) {
	byte digest[20];
	SHA1Final(digest, context);
	printHex(digest, 20);
}

void SHA1Print(const char *str, uint32_t len) {
	byte digest[20];
	SHA1(digest, str, len);
	printHex(digest, 20);
}

void dumpContextHuman(SHA1_CTX *context) {
	byte i;

	printf("uint32 state[5] = [\n");
	for (i = 0; i < 5; i++)
		printf("    %u,\n", context->state[i]);

	printf("]\nuint32 count[2] = [\n");
	for (i = 0; i < 2; i++)
		printf("    %u,\n", context->count[i]);

	printf("]\nuint8 buffer[64] = [\n");
	for (i = 0; i < 64; i++)
		printf("    %u,\n", context->buffer[i]);

	printf("]\n");
}

void dumpContextBytes(SHA1_CTX *context) {
	// 40 characters
	for (byte i = 0; i < 5; i++)
		printf("%08X", context->state[i]);

	// 16 characters
	for (byte i = 0; i < 2; i++)
		printf("%08X", context->count[i]);

	// 128 characters
	for (byte i = 0; i < 64; i++)
		printf("%02X", context->buffer[i]);

	putchar('\n');
}

SHA1_CTX copy(SHA1_CTX old_ctx) {
	SHA1_CTX new_ctx;
	byte i;

	for (i = 5; i --> 0 ;)
		new_ctx.state[i] = old_ctx.state[i];

	for (i = 2; i --> 0 ;)
		new_ctx.count[i] = old_ctx.count[i];

	for (i = 64; i --> 0 ;)
		new_ctx.buffer[i] = old_ctx.buffer[i];

	return new_ctx;
}

byte hexToByte(char hex) {
	// only makes sense for hex in /[\da-f]/i
	//                  0-9              A-F  a-f
	return hex - (hex < ':' ? 48 : hex < 'G' ? 55 : 87);
}

void parseContextBytes(const char str[92], /* out */ SHA1_CTX *context) {
	for (byte i = 0; i < 5; i++)
		context->state[i] = 0
			| hexToByte(*str++) << 4*7
			| hexToByte(*str++) << 4*6
			| hexToByte(*str++) << 4*5
			| hexToByte(*str++) << 4*4
			| hexToByte(*str++) << 4*3
			| hexToByte(*str++) << 4*2
			| hexToByte(*str++) << 4*1
			| hexToByte(*str++) << 4*0;

	for (byte i = 0; i < 2; i++)
		context->count[i] = 0
			| hexToByte(*str++) << 4*7
			| hexToByte(*str++) << 4*6
			| hexToByte(*str++) << 4*5
			| hexToByte(*str++) << 4*4
			| hexToByte(*str++) << 4*3
			| hexToByte(*str++) << 4*2
			| hexToByte(*str++) << 4*1
			| hexToByte(*str++) << 4*0;

	for (byte i = 0; i < 64; i++)
		context->buffer[i] = 0
			| hexToByte(*str++) << 4*1
			| hexToByte(*str++) << 4*0;
}

bool streq(const char *a, const char *b) {
	for (;; b++) {
		if (*a != *b) // also includes strlen(a) != strlen(b)
			return false;

		if (*a++) // == '\0'
			// *b is also null because *a == *b.
			return true;
	}
}
////////////////////////////////////////////////////////////////

/*
test vectors:
./sha1 digest a b c d abc asdf qwertyuiop asdf1234567890 mn1mn2mn3mn4m

86F7E437FAA5A7FCE15D1DDCB9EAEAEA377667B8
E9D71F5EE7C92D6DC9E92FFDAD17B8BD49418F98
84A516841BA77A5B4648DE2CD0DFCB30EA46DBB4
3C363836CF4E16666669A25DA280A1865C2D2874
A9993E364706816ABA3E25717850C26C9CD0D89D
3DA541559918A808C2402BBA5012F6C60B27661C
B0399D2029F64D445BD131FFAA399A42D2F8E7DC
801A6BBC64086A2D9F5A23059FFEC000BFB322AA
A2338FE30996EF39FD8B1DB911276C13B5B16269
*/

// 0xffffffffffffffffffffffffffffffff
// 0x67452301 0xEFCDAB89 0x98BADCFE 0x10325476 0xC3D2E1F0
// 0x67452301EFCDAB8998BADCFE10325476C3D2E1F0

#define eprintf(STR, ...) printf("\e[31mERROR: " STR "\e[0m\n" __VA_OPT__(,) __VA_ARGS__)

int main(int argc, const char *argv[]) {
	// printf("sizeof(SHA1_CTX) : %zu bytes\n", sizeof(SHA1_CTX));
	// printf("manual sizeof(SHA1_CTX) : %zu bytes\n", 5*4 + 2*4 + 64*1);

	argc--; argv++;

	if (argc == 0) {
		eprintf("no arguments. use `--help` for help");
		return 1;
	}

	const char *command = *argv;

	argc--; argv++;

	if (!strcmp(command, "digest")) {
		if (argc == 0)
			// no input given
			// puts(sha1(""))
			puts("DA39A3EE5E6B4B0D3255BFEF95601890AFD80709");
		else for (int i = 0; i < argc; i++)
			SHA1Print(argv[i], strlen(argv[i]));
	}
	else if (!strcmp(command, "dump")) {
		if (argc == 0) {
			SHA1_CTX ctx;
			SHA1Init(&ctx);
			SHA1Update(&ctx, "", 0);
#ifdef HUMAN
			dumpContextHuman(&ctx);
#else
			dumpContextBytes(&ctx);
#endif
		}
		else for (int i = 0; i < argc; i++) {
			SHA1_CTX ctx;
			SHA1Init(&ctx);
			SHA1Update(&ctx, argv[i], strlen(argv[i]));
#ifdef HUMAN
			dumpContextHuman(&ctx);
#else
			dumpContextBytes(&ctx);
#endif
		}
	}
	else if (!strcmp(command, "update-digest")) {
		if (argc < 2) {
			eprintf("not enough arguments");
			puts("sha1.exe update-digest [dumped bytes] [update string]");
			return 1;
		}

		SHA1_CTX ctx;

		const char *const ctxString = argv[0];

		parseContextBytes(ctxString, &ctx);

		SHA1Update(&ctx, argv[1], strlen(argv[1]));

		SHA1PrintFinal(&ctx);
	}
	else if (!strcmp(command, "update-dump")) {
		if (argc < 2) {
			eprintf("not enough arguments.");
			puts("sha1.exe update-dump [dumped bytes] [update string]");
			return 1;
		}

		SHA1_CTX ctx;

		// example input
		const char *const ctxString = argv[0];

		parseContextBytes(ctxString, &ctx);

		SHA1Update(&ctx, argv[1], strlen(argv[1]));

#ifdef HUMAN
			dumpContextHuman(&ctx);
#else
			dumpContextBytes(&ctx);
#endif
	}
	else if (!strcmp(command, "--help") || !strcmp(command, "help")
		|| !strcmp(command, "-h") || !strcmp(command, "-?"))
		printf(
			"Options:\n"
			"    help, --help, -h, -?         print this message\n"
			"    digest [strs]                hash the inputs and print their hash values.\n"
			"    dump [strs]                  hash the inputs and print out the internal state (context).\n"
			"    update-digest [ctx] [str]    add the new string to the context, update, and print the digest.\n"
			"    update-dump [ctx] [str]      add the new string to the context, update, and print the new context.\n"
			"\n"
			"    NOTE: digest and dump allow more than one input string. no other options do.\n"
#ifdef HUMAN
			"    NOTE: dump and update-dump print the context in a human-readable form that can't be read by the program\n"
#endif
		);
	else
		eprintf("unrecognized command \"%s\"", command);

	return 0;
}
