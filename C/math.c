// TODO: Finish
// #include <stdio.h>
struct FILE *__acrt_iob_func(unsigned index);
#define stderr (__acrt_iob_func(2))
#define printf __builtin_printf
#define fprintf __builtin_fprintf
#define NULL ((void *)0)
// #include <stdbool.h>
#define bool _Bool
#define true ((_Bool) 1u)
#define false ((_Bool) 0u)
#define TRUE ((_Bool) 1u)
#define FALSE ((_Bool) 0u)
// #include <stdlib.h>
#define exit __builtin_exit
#define malloc __builtin_malloc
#define free __builtin_free
// #include <stddef.h>
#define size_t long unsigned int
#define ssize_t long
// custom preprocessor things
#define ullong unsigned long long int
#define llong signed long long int
#define error(str, err) ({\
	fprintf(stderr, "ERROR:%s:%llu: %s\n", __FILE__, __LINE__, (char *)str);\
	exit((int) err);\
	0ULL;\
})
#define alloc(n1, n2) (malloc((n1)*(n2)))
#define max(x, y) ({ typeof(x) a = (x); typeof(y) b = (y); (a > b ? a : b); })
#define min(x, y) ({ typeof(x) a = (x); typeof(y) b = (y); (a < b ? a : b); })
// swap and swap3l take values not addresses
#define swap(x, y) ({\
	typeof(x) *_x = &(x);\
	typeof(x) *t = _x;\
	typeof(y) *_y = &(y);\
	*_x = (typeof(x)) *_y;\
	*_y = (typeof(y)) *t;\
})
#define swap3l(x, y, z) ({ typeof(x) t = (x);\
	(x) = (typeof(x)) (y);\
	(y) = (typeof(y)) (z);\
	(z) = (typeof(z)) t;\
	0ULL;\
})

static inline char *stringify_bool(bool b) { return b ? "true" : "false"; }
static inline char *substr(char *str, ullong index) { return str + index; } // assume no segfault
static inline bool isPositive(char * restrict str ) { return * str != '-'; }
static inline int ctoi(char chr) { return (int) (chr - '0'); } // assume input is a number

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
	for (int i = 0; str[i] != 0; ++i)
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

#define strlen __builtin_strlen
static inline ullong strdim(char *str) {
	// str[strdim(str)] => last character in str before null terminator == str[strlen(str) - 1]
	return strlen(str) - 1ULL;
}
static bool isValid(char *str) {
	if (isNaN(str)) return false; // not a number
	if (*str == '.') return false; // starts with '.'

	llong index = indexOf(str, 46); // first index of '.'
	if (index < 0) return true; // integer
	else {
		ullong dim = strdim(str);
		if (str[dim] == 46) return false; // ends with '.'

		for (llong i = index; i <= dim; ++i)
			if (str[i] != '0') // it's decimals are not all zeros
				return true;

		return false; // it ends with /\.0+"/ (integer)
	}
	return true;
}

#if 0
	// assume correct syntax for inputs. "0.123" for decimals. "123" for integer
	static char *fadd(char *n1, char *n2) {
		n1 == n2 && error("No. point to different things", -1);

		llong indexofperiod1 = indexOf(n1, 46);
		llong indexofperiod2 = indexOf(n2, 46);
		char *tmp1;
		char *tmp2;
	}
#endif

char *addlen(void *array, size_t length, size_t diff) {

}

int main(int argc, char **restrict argv) {
	argc == 1 && error("No arguments were provided. 2 were expected", 1);
	argc == 2 && error("Only 1 argument was provided. 2 were expected", 2);
	argc >  3 && error("Too many arguments were provided. 2 were expected", 3);
	if (isNaN(argv[1]) || isNaN(argv[2])) error("At least one argument is not a number", 4);


	char *a = "1234";
	char *b = "5678";
	printf("a: %s\nb: %s\n\n", a, b);
	swap(a, b);
	printf("a: %s\nb: %s\n\n", a, b);
	return 0;
}
#if 0
	typedef struct {
		void **array; // array of pointers to objects
		ullong size: 128; // max = 2**64 - 1
	} Array;
#endif

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
