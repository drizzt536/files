#pragma once
#define DU64_H

// stuff for printing 64-bit integers with thousands-place separators

#ifndef DU64_SEP_DEFAULT
	#define DU64_SEP_DEFAULT ','
#endif

static char *_sprint_du64_3(char *buffer, u64 x, const char sep) {
	// `buffer` should point to an area at least 27 bytes long.

	// it returns a new pointer to the buffer because the string usually doesn't
	// start at the first byte of the buffer. It is aligned to the "end" of the buffer.
	// the null terminator is always at `buffer[26]`.

	unlikely_if (buffer == NULL)
		return NULL;

	u8 i = 26; // 26 == strlen("18,446,744,073,709,551,615")
	buffer[i] = '\0';

	do {
		buffer[--i] = '0' + (x % 10);
		x /= 10;

		if ((i & 3) == 3) // modulo 4 because the separator is every 4 characters.
			buffer[--i] = sep;
	} until (x == 0);

	// if the current i % 4 == 2, then the most recent character is a separator that needs to be skipped.
	if ((i & 3) == 2)
		i++;

	return buffer + i;
}

static FORCE_INLINE char *_sprint_du64_2(char *buffer, u64 x) {
	return _sprint_du64_3(buffer, x, DU64_SEP_DEFAULT);
}

#define sprint_du64(buffer, x, sep...) \
	VA_IF(_sprint_du64_3(buffer, x, sep), _sprint_du64_2(buffer, x), sep)

static FORCE_INLINE void _print_du64_2(u64 x, const char sep) {
	char buffer[27];

	// this used to be `fputs(..., stdout);` but I changed it to remove the DLL import for fputs.
	printf(sprint_du64(buffer, x, sep));
}

static FORCE_INLINE void _print_du64_1(u64 x) {
	_print_du64_2(x, DU64_SEP_DEFAULT);
}

#define print_du64(x, sep...) \
	VA_IF(_print_du64_2(x, sep), _print_du64_1(x), sep)

static FORCE_INLINE void _println_du64_2(u64 x, const char sep) {
	char buffer[27];

	puts(sprint_du64(buffer, x, sep));
}

static FORCE_INLINE void _println_du64_1(u64 x) {
	_println_du64_2(x, DU64_SEP_DEFAULT);
}

#define println_du64(x, sep...) \
	VA_IF(_println_du64_2(x, sep), _println_du64_1(x), sep)

static FORCE_INLINE char *_ememcpy_du64_3(char *dst, u64 x, const char sep) {
	// returns a pointer to where the end of the string.
	char buffer[27];
	char *start = sprint_du64(buffer, x, sep); // start of the actual string data
	u64 length = 26 - (start - buffer); // 26 - i

	return ememcpy(dst, start, length);
}

static FORCE_INLINE char *_ememcpy_du64_2(char *dst, u64 x) {
	return _ememcpy_du64_3(dst, x, DU64_SEP_DEFAULT);
}

#define ememcpy_du64(dst, x, sep...) \
	VA_IF(_ememcpy_du64_3(dst, x, sep), _ememcpy_du64_2(dst, x), sep)
