#ifdef STRING_JOIN_HPP
	#warning "including both string-join.h and string-join.h++ is a bad idea."
#endif

#ifndef STRING_JOIN_H
	#define STRING_JOIN_H
	// NOTE: string-join.h and string-join.h++ have naming collisions.

	#ifndef STRING_JOIN_DEFAULT_JOINER
		#define STRING_JOIN_DEFAULT_JOINER ' '
	#endif

	#ifndef STRING_JOIN_NOINCLUDE
		#include <stdlib.h> // calloc, realloc, free, NULL
		#include <string.h> // strlen, strdup, memcpy, size_t
	#endif

	#ifndef FORCE_INLINE
		#define FORCE_INLINE inline __attribute__((always_inline))
	#endif

	typedef struct {
		char *s;   // string
		size_t l; // length
	} string;

	// for some reason this doesn't work as an inline function.
	// the other Xtos functions probably have the same problem.
	#define ctos(c) (              \
		/* char to string */        \
		(string) {                   \
			.s = (char []) {c, '\0'}, \
			.l = 1                     \
		}                               \
	)
	static FORCE_INLINE string atos(const char *const str) {
		// ascii to string
		return (string) {
			.s = (char *) str,
			.l = strlen(str)
		};
	}
	static FORCE_INLINE string ctons(const char c) {
		// character to new (heap) string
		return (string) {
			.s = strdup((char []) {c, '\0'}),
			.l = 1
		};
	}
	static FORCE_INLINE string atons(const char *const str) {
		// ascii to new (heap) string
		return (string) {
			.s = (char *) strdup(str),
			.l = strlen(str)
		};
	}


	/// merge into destination
		// they don't actually set the same variable (i.e. out argument), but it does
		// use the same memory for the array (i.e. realloc).
		// the new pointer value gets returned.

	string sstrjoinsi(
		string dst,
		const size_t argc,
		const string *argv,
		string joiner // constant in cases except for if it is null 
	) {
		// struct-string join (with) (struct-)string-joiner into (dst)

		// dst.s should be on the heap. the return value's string will be on the heap.
		// argc should not include the destination string in the count.
		// using the old dst.s after this function call is always undefined.
		// if the destination string is empty, it will not have a joiner after it.
		// if joiner.s is null, it will be set to the default joiner (probably ' ')
		// returns null if any input values are null, or if realloc returns null.


		if (dst.s == NULL)
			// not `return dst` in case dst.l is not also 0.
			return (string) {NULL, 0};

		if (argc == 0)
			// no more strings to add.
			return dst;

		if (joiner.s == NULL)
			// using a read-only string " " is safe because it will not be written to.
			// I think technically, this doesn't even need the null terminator, but idk.
			joiner = ctos(STRING_JOIN_DEFAULT_JOINER);

		size_t length = dst.l + (argc - !dst.l)*joiner.l;

		for (size_t i = 0; i < argc; i++) {
			if (argv[i].s == NULL)
				goto return_null;

			length += argv[i].l;
		}

		string res = {
			.s = realloc(dst.s, length + 1 /*null byte*/),
			.l = length
		};

		if (res.s == NULL)
			goto return_null;


		/// end of setup.

		// dst.s gets iterated over, res.s actually gets returned.
		// `dst.s += dst.l` doesn't work because the docs say using the old pointer
		// after a realloc is undefined behavior.
		dst.s = res.s + dst.l;

		// do the first iteration outside of the loop.
		// this is fine because it is guaranteed to need at least one iteration.
		if (dst.l != 0) {
			// if the destination string starts empty, don't add a joiner.
			memcpy(dst.s, joiner.s, joiner.l);
			dst.s += joiner.l;
		}

		memcpy(dst.s, argv->s, argv->l);
		dst.s += argv->l;

		for (size_t i = 1; i < argc; i++) {
			argv++;

			memcpy(dst.s, joiner.s, joiner.l);
			dst.s += joiner.l;

			memcpy(dst.s, argv->s, argv->l);
			dst.s += argv->l;
		}

		dst.s[0] = '\0';

		return res;

	return_null:
		free(dst.s);
		return (string) {NULL, 0};
	}
	static FORCE_INLINE string sstrjoinci(
		const string dst,
		const size_t argc,
		const string *argv,
		const char joiner
	) {
		return sstrjoinsi(dst, argc, argv, ctos(joiner));
	}
	static FORCE_INLINE string sstrjoini(const string dst, const size_t argc, const string *argv) {
		return sstrjoinsi(dst, argc, argv, (string) {NULL, 0});
	}

	static FORCE_INLINE string strjoinsi(
		const char *dst,
		const size_t argc,
		const char *const *const argv,
		const string joiner
	) {
		string argv_strings[argc];

		for (size_t i = 0; i < argc; i++)
			argv_strings[i] = atos(argv[i]);

		return sstrjoinsi(atos(dst), argc, argv_strings, joiner);
	}
	static FORCE_INLINE string strjoinci(
		const char *dst,
		const size_t argc,
		const char *const *const argv,
		const char joiner
	) {
		return strjoinsi(dst, argc, argv, ctos(joiner));
	}
	static FORCE_INLINE string strjoini(
		const char *dst,
		const size_t argc,
		const char *const *const argv
	) {
		return strjoinci(dst, argc, argv, STRING_JOIN_DEFAULT_JOINER);
	}


	/// create new string

	static FORCE_INLINE string sstrjoins(
		const size_t argc,
		const string *argv,
		const string joiner
	) {
		return sstrjoinsi((string) {
			.s = calloc(1, sizeof(char)),
			.l = 0
		}, argc, argv, joiner);
	}
	static FORCE_INLINE string sstrjoinc(const size_t argc, const string *argv, const char joiner) {
		return sstrjoins(argc, argv, ctos(joiner));
	}
	static FORCE_INLINE string sstrjoin(const size_t argc, const string *argv) {
		return sstrjoinc(argc, argv, STRING_JOIN_DEFAULT_JOINER);
	}

	static FORCE_INLINE string strjoins(
		const size_t argc,
		const char *const *const argv,
		const string joiner
	) {
		string argv_strings[argc];

		for (size_t i = 0; i < argc; i++)
			argv_strings[i] = atos(argv[i]);

		return sstrjoins(argc, argv_strings, joiner);
	}
	static FORCE_INLINE string strjoinc(
		const size_t argc,
		const char *const *const argv,
		const char joiner
	) {
		return strjoins(argc, argv, ctos(joiner));
	}
	static FORCE_INLINE string strjoin(const size_t argc, const char *const *const argv) {
		return strjoinc(argc, argv, STRING_JOIN_DEFAULT_JOINER);
	}


	#define STRJOIN_H_COUNT_ARGS_IMPL(\
		_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16,\
		_17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32,\
		_33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48,\
		_49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64,\
		count, ...) count
	#define STRJOIN_H_COUNT_ARGS(...) STRJOIN_H_COUNT_ARGS_IMPL(__VA_ARGS__ __VA_OPT__(,)\
		64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49,\
		48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33,\
		32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17,\
		16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0)

	/// variable argument versions. works up to 64 arguments.

	#define sstrjoinn(args...) ({                 \
		const string strs[] = {args};              \
		sstrjoin(STRJOIN_H_COUNT_ARGS(args), strs); \
	})
	#define strjoinn(args...) ({                 \
		const char *strs[] = {args};              \
		strjoin(STRJOIN_H_COUNT_ARGS(args), strs); \
	})

	#define sstrjoinni(dst, args...) sstrjoini( \
		dst,                                     \
		STRJOIN_H_COUNT_ARGS(args),               \
		(string []) {args}                         \
	)
	#define strjoinni(dst, args...) strjoini( \
		dst,                                   \
		STRJOIN_H_COUNT_ARGS(args),             \
		(char *[]) {args}                        \
	)

	/// versions for 2 arguments

	#define sstrjoin2(s1, s2) sstrjoinn(s1, s2)
	#define strjoin2(s1, s2) strjoinn(s1, s2)

	#define sstrjoin_into(dst, src) sstrjoinni(dst, src)
	#define strjoin_into(dst, src) strjoinni(dst, src)
#endif
