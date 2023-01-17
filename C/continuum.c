// continuum.c v1.0 (c) | Copyright 2023 Daniel E. Janusch

// This file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
// and may only be copied IN ITS ENTIRETY under penalty of law.

#include <stdio.h>
#include <stdlib.h>

#define ullong unsigned long long int

const char *DELIMITER = ", ";


static ullong sgn(ullong x) { return (ullong) (x < 0ull ? -1ull : x > 0ull); }

static ullong triangleNumber(ullong x) { return x * (x + 1ull) / 2ull; }

static ullong isqrt(ullong n) {
	if (n < 2ull) return n;

	ullong n_0, n_1 = n / 2ull;

	do n_0 = n_1,
		n_1 = ( n_0 + n / n_0 ) / 2ull;
	while ( n_1 < n_0 );

	return n_0;
}

static ullong greatestTriangleIndex(ullong x) {
	return (
		isqrt(1ull + 8ull*x) +
		sgn( 1ull - sgn(1ull - isqrt(1ull + 8ull*x) % 2ull) )
	) / 2ull - 1ull;
}

static ullong *generateIndices(ullong x) {
	ullong u = greatestTriangleIndex(x)
		, k = triangleNumber(u)
		, t = x - k;
	ullong *arr = (ullong *) malloc( 2*sizeof(ullong) );
	arr[0] = t;
	arr[1] = u - t;
	return arr;
}

static ullong reverse(ullong x) {
	ullong ans = 0ull;
	 
	while (x > 0ull) {
		ullong tmp = x % 10ull;
		ans *= 10ull;
		ans += tmp;

	    x -= tmp;
	    x /= 10ull;
	}
	return ans;
}

static ullong len(ullong x) {
	ullong length = 0;
	do x /= 10ull, length++;
	while (x > 0ull);
	return length;
}

static ullong ullpow10(ullong x) {
	ullong ans = 1ull;
	while (x > 0ull)
		x--, ans *= 10ull;
	return ans;
}

static long double R(ullong i, ullong j) {
	return ((long double) i) + ((long double) reverse(j)) / ((long double) ullpow10( len(j) ));
}

static long double getReal(ullong index) {
	_Bool negative = 0;
	index % 2ull && (negative = 1, index--);
	ullong *t = generateIndices(index /= 2ull);
	return (long double) ((negative ? -1 : 1) * R(*t, t[1]));
}

long double *generateRealsSet(ullong maxIndex) {
	long double *set = (long double *) malloc(maxIndex * sizeof(long double));
	for (ullong i = maxIndex; i --> 0 ;)
		set[i] = getReal(i);
	return set;
}

void printReals(ullong maxIndex) {
	if (maxIndex == 0ull)
		// theoretically 2^64 - 1 ...
		// in practice, basically forever. or like an hour, idk.
		maxIndex--;
	printf("[");
	for (ullong i = 0ull; i < maxIndex ;) {
		printf("%Lf", getReal(i));
		if (++i < maxIndex)
			printf("%s", DELIMITER);
	}
	printf("]");
	return;
}

int main(int argc, char **argv) {
	if (argc > 2) return printf("Too many arguments provided. Only provide 1 argument for the max index.");
	if (argc < 2) return printf("Not enough arguments provided. Please provide 1 argument for the max index.");

	ullong maxIndex = strtoull(argv[1], (void *) 0, 10);

	printReals(maxIndex);
	
	return 0;
}
