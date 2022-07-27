// incomplete file for doing string math and learning things
#include <stdio.h> // printf, fprintf
#include <stdlib.h> // malloc
#include <stdbool.h> // true, false, bool
// REMEMBER TO FREE
// on my machine, char == signed char.

#ifndef ullong
	#define ullong unsigned long long// int
	#else
	#error ullong constant (unsigned long long int) already defined
#endif
#ifndef llong
	#define llong signed long long// int
	#else
	#error llong constant (signed long long int) already defined
#endif
#ifndef error
	// print error message and exit with exit code
	// 0; at the end so gcc stops yelling at me for using a void macro in operations
	#define error(str, err) ({fprintf(stderr, "ERROR: %s\n", str); exit((int)err); 0;})
	#else
	#error error() macro already defined
#endif
#ifndef alloc
	// malloc but in the style of calloc but without having to put sizeof
	#define alloc(n1, n2) (malloc((n1)*(n2)))
	#else
	#error alloc is already defined
#endif

static inline char *stringify_bool(bool b) { return b ? "true" : "false"; }
static inline char *substr(char *str, ullong index) { return str + index; } // assume no segfault
static inline bool isPositive(char * restrict str ) { return * str != 46; }

// String math
static char *ullong_to_str(ullong number, bool sign) {
	// sign: same as sign bit for IEEE754 standard floating point numbers
	ullong length = (ullong)sign, numbercopy = number;
	while (numbercopy >= 1) {
		numbercopy /= 10;
		length++;
	}
	// length == 1 + ⌊log₁₀(number)⌋ + sign
	// char *output = malloc((length + 1) * sizeof(char)); // plus 1 for null terminator
	char *output = alloc(length + 1, sizeof(char)); // plus 1 for null terminator
	if (output == NULL) {
		fprintf(stderr, "ERROR: Could not malloc %llu bytes in ullong_to_cstr()",
			(length+1) * sizeof(char) );
		return "\0";
	}
	for (ullong i = 0, n; i < length ;) {
		n = number % 10;
		output[length - ++i] = (char)(n + 48ULL);
		number -= n; // just in case this helps with rounding errors or something
		number /= 10ULL;
	}
	sign && (output[0] = 45);
	output[length] = 0;
	return output;
}
static bool isNaN(char *restrict str) {
	for (int i = 0; str[i] != 0; ++i)
		if ((str[i] < 48 || str[i] > 57) && str[i] != 46 && str[i] != 45)
			return true;
	return false;
}
static bool isIntZero(char *restrict str) {
	for (int i = 0; str[i] != 0; ++i)
		if (str[i] != 48) return false;
	return true;
}
static bool includes(char *str, char c) {
	for (int i = 0; str[i] != 0 ; ++i)
		if (str[i] == c) return true;
	return false;
}
static llong indexOf(char *str, char c) {
	for (llong i = 0LL; str[i] != 0; ++i)
		if (str[i] == c) return i;
	return -1LL;
}
static bool isInt(char *restrict str) {
	if (!includes(str, 46)) return false;
	// in case of things like "123." or "123.00000", etc...
	for (ullong i = (ullong)indexOf(str, 46) + 1ULL; str[i] != 0 ;)
		if (str[i] != 48) return true;
	return false;
}
static ullong strlen(char *str) {
	ullong i = 0;
	for (; str[i] != 0; ++i) ;return i;
}
static ullong strdim(char *str) {
	// str[strdim(str)] => last character in str before null terminator == str[strlen(str) - 1]
	ullong i = 0;
	for (; str[i] != 0; ++i) ;return i - 1ULL;
}

char *add(char *restrict n1, char *restrict n2) {
	char *decimals;
	if (isInt(n1)) {
		if (isInt(n2)) {
			// add integers
		} else decimals = n2 + indexOf(n2, 46);
	} else {
		if (isInt(n2)) decimals = n1 + indexOf(n1, 46);
		//else return floatadd(n1, n2);
	}
	return "w";
}


int main(int argc, char **restrict argv) {
	argc == 1 && error("No arguments were provided. 2 were expected"       , 1);
	argc == 2 && error("Only 1 argument was provided. 2 were expected"     , 2);
	argc >  3 && error("Too many arguments were provided. 2 were expected" , 3);
	if (isNaN(argv[1]) || isNaN(argv[2])) error("At least one argument is not a number", 4);
	char *test = "0123456\0";
	printf("%c\n", test[strlen(test) - 1]);
	int i = 256;
	printf("%d\n", (char) i);
	return 0;
}
