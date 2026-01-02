// gcc -Werror -Wall -Wextra -O3 sqroots.c -o sqroots.exe

#include "error-print.h" // stdlib, stdio, io/unistd
#include <stdint.h>
#include <stdbool.h>

#ifdef _WIN32
	void Sleep(uint32_t ms); // <windows.h>
#else
	int usleep(uint32_t usec); // <unistd.h>
#endif

static inline __attribute__((always_inline)) void msleep(unsigned ms) {
	// cross-platform? sleep function
	#ifdef _WIN32
		Sleep(ms);
	#else
		usleep(ms * 1000); // microseconds
	#endif
}

typedef uint8_t u8;
typedef uint32_t u32;

int main(int argc, const char **argv) {
	argc--; argv++;
	if (argc == 0) {
		eputs("no values were given.");
		return 1;
	}

	// TODO: perhaps cap this dynamically at the terminal length
	/*if (argc > 32) {
		ewputs("more than 32 values were given. ignoring extras.");
		argc = 32;
	}*/

	int wait_ms = 500;

	if (**argv == '-') {
		// check for switches as the first argument
		if (!strcmp(argv[0], "-h") || !strcmp(argv[0], "--help")) {
			puts(
				"usage: ./sqroots [-w TIME | -h | --help | -v] [ARGS...]\n"
				"\n"
				"options:\n"
				"     -h, --help    print this help text and exit\n"
				"     -v            print the version string and exit\n"
				"     -w TIME       wait time in-between iterations. default 500ms\n"
				"\n"
				"NOTE: if you have more inputs than around 3 less than the number of\n"
				"      lines on your terminal, the program will stop working properly."
			);
			return 0;
		}
		else if (!strcmp(argv[0], "-v")) {
			puts("v1.0");
			return 0;
		}
		else if (!strcmp(argv[0], "-w")) {
			argc--; argv++; // "-w" isn't needed anymore.
			if (argc == 0) {
				eputs("Option `-w` passed without a value.");
				return 1;
			}

			char *str_end;

			wait_ms = (int) strtol(argv[0], &str_end, 10);
			if (*str_end != '\0') {
				eputs("Option `-w` passed with a non-numeric value.");
				return 1;
			}

			if (wait_ms < 0) {
				eputs("Option `-w` passed with a negative value.");
				return 1;
			}

			argc--; argv++; // the option value isn't needed anymore.
		}
	}

	double
		// instead of calling fabs(cur - prev) > eps, I just use prev2
		// (previous's previous) and do direct comparisons on them. this will
		// catch where it cycles between 2 values and doesn't converge exactly.
		*prev2_lst = malloc(argc * sizeof(double)),
		*prev1_lst = malloc(argc * sizeof(double)),
		*curnt_lst = malloc(argc * sizeof(double)),
		*orign_lst = malloc(argc * sizeof(double));
	bool *done_lst = malloc(argc * sizeof(bool));

	// populate the arrays
	u8 x_len = 0; // number of numeric arguments given.
	for (u8 i = 0; i < argc; i++) {
		char *str_end;
		const char *arg = argv[i];
		double x = strtod(arg, &str_end);

		if (*str_end != '\0') {
			ewprintf("non-numeric value at argument index %d\n", i + 1);
			// it didn't use the whole string for the number.
			// non-numeric (invalid) argument.
			continue;
		}

		orign_lst[x_len] = x;
		curnt_lst[x_len] = x;
		prev1_lst[x_len] = x;
		prev2_lst[x_len] = x;

		done_lst[x_len] = false; // sqrt(0) = 0, but 1/0 is undefined.
		x_len++;
	}

	// figure out which input value is the longest
	int longest_orign_len = 0;
	{
		char tmp_str[32]; // it shouldn't be longer than like 13, and 32 is double that.
		for (u8 i = 0; i < x_len; i++) {
			int size = sprintf(tmp_str, "%lg", orign_lst[i]);

			if (size > longest_orign_len)
				longest_orign_len = size;
		}
	}


	if (x_len == 0) {
		eputs("no numeric values were given.");
		return 1;
	}

	// reserve enough terminal lines on the screen. (scroll down then back up)
	printf("\e[%uB\e[%uA", x_len + 1, x_len + 1);


	// print out the starting numbers
	printf("iteration: 0\e[0K\n");
	for (u8 i = 0; i < x_len; i++)
		printf("\r%*lg : %.16lf\e[0K\n", longest_orign_len, orign_lst[i], curnt_lst[i]);

	msleep(wait_ms);

	bool all_done;
	u32 iteration = 1;
	while (true) {
		all_done = true;

		// go back up to the first line.
		printf("\r\e[%uA\e[11C%u\n", x_len + 1, iteration);

		for (u8 i = 0; i < x_len; i++) {
			// go to the line's start, print the number and delete the rest of the line.

			if (done_lst[i]) {
				// skip its line if it is done.
				printf("\e[1B");
				continue;
			}

			printf("\r%*lg : %.16lf\e[0K", longest_orign_len, orign_lst[i], curnt_lst[i]);
			double x = curnt_lst[i];

			if (x == 0) {
				// don't actually iterate with 0, because 1/0 is nan
				done_lst[i] = true;
				printf(" - done in %u\n", iteration);

				continue;
			}

			prev2_lst[i] = prev1_lst[i];
			prev1_lst[i] = x;
			curnt_lst[i] = (x + orign_lst[i]/x) / 2.0;

			if (prev2_lst[i] == curnt_lst[i] || prev1_lst[i] == curnt_lst[i]) {
				done_lst[i] = true;
				printf(" - done in %u\n", iteration);
			}
			else {
				putchar('\n');
				all_done = false;
			}
		}

		if (all_done)
			break;

		iteration++;
		msleep(wait_ms);
	}

	return 0;
}

// 1HGCR2F3XGA113248
