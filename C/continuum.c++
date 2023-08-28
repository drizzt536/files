// continuum.c++ v2.0 (c) | Copyright 2023 Daniel E. Janusch

// This file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
// and may only be copied IN ITS ENTIRETY under penalty of law.

#include <iostream>
#include <string>

using std::cout;
using std::stoull;

using uLong = unsigned long long int;
using Lfloat = long double;
#define SEPARATOR ", "

struct Point {
	uLong x;
	uLong y;
};

static inline uLong sgn(uLong x) { return (uLong) (x < 0 ? -1 : x > 0); }

static uLong triangleNumber(uLong x) { return x * (x + 1) / 2; }

static uLong isqrt(uLong n) {
	if (n < 2) return n;

	uLong n_0
		, n_1 = n / 2;

	do n_0 = n_1,
		n_1 = ( n_0 + n / n_0 ) / 2;
	while ( n_1 < n_0 );

	return n_0;
}

static uLong greatestTriangleIndex(uLong x) {
	return (isqrt(1 + 8*x) + 1) / 2 - 1;
}

static Point generateIndices(uLong x) {
	uLong u = greatestTriangleIndex(x)
		, k = triangleNumber(u)
		, t = x - k;

	return Point {t, u - t};
}

static uLong reverseBase10(uLong x) {
	uLong ans = 0, tmp;
	 
	while (x > 0) {
		tmp = x % 10;
		ans *= 10;
		ans += tmp;

	    x -= tmp;
	    x /= 10;
	}
	return ans;
}

static uLong len(uLong x) {
	uLong length = 0;
	do x /= 10, length++;
	while (x > 0);
	return length;
}

static uLong ullpow10(uLong x) {
	uLong ans = 1;
	while (x > 0)
		x--,
		ans *= 10;

	return ans;
}

static long double R(Point p) {
	return (long double) p.x +
		(long double) reverseBase10(p.y) /
		(long double) ullpow10( len(p.y) );
}

static long double getReal(uLong index) {
	bool negative = 0;
	index % 2ull && (negative = 1, index--);
	Point t = generateIndices(index /= 2);
	return (long double) ((negative ? -1 : 1) * R(t.x, t.y));
}

long double *generateRealsSet(uLong maxIndex) {
	long double *set = (long double *) malloc(maxIndex * sizeof(long double));

	for (uLong i = maxIndex; i --> 0 ;)
		set[i] = getReal(i);
	return set;
}

void printReals(uLong maxIndex) {
	if (maxIndex == 0)
		// theoretically 2^64 - 1 ...
		// in practice, basically forever. or like an hour, idk.
		maxIndex--;
	cout << "[";
	for (uLong i = 0; i < maxIndex ;) {
		cout << getReal(i);
		if (++i < maxIndex)
			cout << SEPARATOR;
	}
	cout << "]";
	return;
}

int main(int argc, char **argv) {
	if (argc > 2) {
		cout << "Too many arguments provided. Only provide 1 argument for the max index.";
		return 1;
	}
	if (argc < 2) {
		cout << "Not enough arguments provided. Please provide 1 argument for the max index.";
		return 2;
	}

	uLong maxIndex = stoull(argv[1], nullptr, 10);

	printReals(maxIndex);

	return 0;
}
