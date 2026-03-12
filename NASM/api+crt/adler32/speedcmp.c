// make adler32.o && gcc speedcmp.c adler32.o -O3 -march=native -ftree-vectorize speedcmp

#include <stdio.h>
#include "adler32.h"

#define GiB (1024llu * 1024llu * 1024llu)
#define MiB (1024llu * 1024llu)
#define KiB (1024llu)

#define J_FIRST false
#define SIZE 16*GiB

#define BASE 65521u
#define NMAX 5552

#define DO1(buf, i)  {adler += (buf)[i]; sum2 += adler;}
#define DO2(buf, i)  DO1(buf, i); DO1(buf, i + 1);
#define DO4(buf, i)  DO2(buf, i); DO2(buf, i + 2);
#define DO8(buf, i)  DO4(buf, i); DO4(buf, i + 4);
#define DO16(buf)    DO8(buf, 0); DO8(buf, 8);

unsigned long z_adler32(unsigned long adler, const u8 *buf, int64_t len) {
	unsigned long sum2;
	unsigned n;

	sum2 = (adler >> 16) & 0xffff;
	adler &= 0xffff;

	if (len == 1) {
		adler += buf[0];

		if (adler >= BASE)
			adler -= BASE;

		sum2 += adler;

		if (sum2 >= BASE)
			sum2 -= BASE;

		return adler | (sum2 << 16);
	}

	if (buf == NULL)
		return 1l;

	if (len < 16) {
		while (len--) {
			adler += *buf++;
			sum2 += adler;
		}

		if (adler >= BASE)
			adler -= BASE;

		sum2 %= BASE;

		return adler | (sum2 << 16);
	}

	while (len >= NMAX) {
		len -= NMAX;
		n = NMAX / 16;

		do {
			DO16(buf);
			buf += 16;
		} while (--n);

		adler %= BASE;
		sum2 %= BASE;
	}

	if (len) {
		while (len >= 16) {
			len -= 16;
			DO16(buf);
			buf += 16;
		}

		while (len--) {
			adler += *buf++;
			sum2 += adler;
		}

		adler %= BASE;
		sum2 %= BASE;
	}

	return adler | (sum2 << 16);
}

#if 0
unsigned long z_adler32_combine(unsigned long adler1, unsigned long adler2, int64_t len2) {
	unsigned long sum1;
	unsigned long sum2;
	unsigned rem;

	if (len2 < 0)
		return 0xffffffffUL;

	len2 %= BASE;
	rem = (unsigned)len2;
	sum1 = adler1 & 0xffff;
	sum2 = rem * sum1;
	sum2 %= BASE;
	sum1 += (adler2 & 0xffff) + BASE - 1;
	sum2 += ((adler1 >> 16) & 0xffff) + ((adler2 >> 16) & 0xffff) + BASE - rem;

	if (sum1 >= BASE) sum1 -= BASE;
	if (sum1 >= BASE) sum1 -= BASE;
	if (sum2 >= ((unsigned long)BASE << 1)) sum2 -= ((unsigned long)BASE << 1);
	if (sum2 >= BASE) sum2 -= BASE;
	return sum1 | (sum2 << 16);
}
#endif

#define RtlGenRandom SystemFunction036
bool RtlGenRandom(void *buffer, u64 length);

int main(void) {
	u64 length = SIZE;
	u8 *buffer = (u8 *) malloc(length);
	if (buffer == NULL)
		return 1;

	if (RtlGenRandom(buffer, length) == 0)
		return 2;

	printf("buffer size = %llu bytes\n", length);

	u32 proc_id, cksmj, cksmz;
	u64 start, end, elapsedj, elapsedz;
#if J_FIRST
	puts("starting adler32_buf_fw");
	start    = __builtin_ia32_rdtscp(&proc_id);
	cksmj    = adler32_buf_fw(ADLER32_EMPTY, buffer, length);
	end      = __builtin_ia32_rdtscp(&proc_id);
	elapsedj = end - start;

	puts("starting z_adler32");
	start    = __builtin_ia32_rdtscp(&proc_id);
	cksmz    = z_adler32(ADLER32_EMPTY, buffer, length);
	end      = __builtin_ia32_rdtscp(&proc_id);
	elapsedz = end - start;
#else
	puts("starting z_adler32");
	start    = __builtin_ia32_rdtscp(&proc_id);
	cksmz    = z_adler32(ADLER32_EMPTY, buffer, length);
	end      = __builtin_ia32_rdtscp(&proc_id);
	elapsedz = end - start;

	puts("starting adler32_buf_fw");
	start    = __builtin_ia32_rdtscp(&proc_id);
	cksmj    = adler32_buf_fw(ADLER32_EMPTY, buffer, length);
	end      = __builtin_ia32_rdtscp(&proc_id);
	elapsedj = end - start;
#endif

	printf("j: c=%#010x, t=%llu\n", cksmj, elapsedj);
	printf("z: c=%#010x, t=%llu\n", cksmz, elapsedz);
	return 0;
}
