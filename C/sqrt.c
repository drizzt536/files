#define printf __builtin_printf
double atof(const char *_String);
#define true ((_Bool) +1u)
#define false ((_Bool) +0u)
#define DEBUG false

double sqrt(double x) {
	// √(1/x), 1 / √x
	if (x < 0) return -1.0f;
	if (x == 0.0f) return 0.0f;

	double prev1 = x
		, prev2 = x
		, start = x;
	do prev2 = prev1
		, prev1 = x
		, x = (prev1 + 1.0f) / (start * prev1 + 1.0f)
		#if DEBUG
		, printf(" %.17llf\n", prev1)
		#endif
		;
	while (prev1 != x && x != prev2);
	return x;
}

int main(int argc, const char **argv) {
	if (argc < 2)
	#if DEBUG
		return printf("No argument provided")
	#endif
	;
	for (int i = 1; i < argc ;) printf("%.18llf\n", sqrt( atof(argv[i++]) ));
	return 0;
}
