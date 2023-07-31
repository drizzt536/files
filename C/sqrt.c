double atof(const char *_String);

#define printf __builtin_printf
#define DEBUG_MODE ((_Bool) +0u)

double sqrt(double x) {
	// return √(x)
	if (x < 0) return -1.0f;
	if (x == 0.0f) return 0.0f;

	double
		prev1 = x,
		prev2 = x,
		start = x;

	do prev2 = prev1
		, prev1 = x
		, x = (prev1 + 1.0f) / (start * prev1 + 1.0f)
	#if DEBUG_MODE
		, printf(" %.17llf\n", prev1)
	#endif
		;
	while (prev1 != x && x != prev2);

	return 1 / x;
}

int main(int argc, const char *argv[]) {
	#if DEBUG_MODE
	if (argc < 2) return printf("No argument provided"), 1;
	#endif
	for (int i = 1; i < argc ;) printf(
		"%.18Lf\n",
		sqrt( atof(argv[i++]) )
	);
	return 0;
}
