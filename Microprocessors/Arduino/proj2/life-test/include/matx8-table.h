// defines the Matx8, Matx8_*, TableEntry, HashTable, and Table_* APIs

#pragma once
#define MATX8_TABLE_H

#include "windows.h"     // stdbool.h, integer types

#define TABLE_NO_VALUE	(~0u)
#define ARENA_NO_BUCKET	(~0u)
#define ARENA_NO_NEXT	((~0u) - 1u)

// NOTE: these trials were before the implementation of the arena. With
//       arenas, I only tested it for single multiplication hashing, but
//       TABLE_LEN = 1 << 9 is still the fastest by a decent margin.

// double multiplication speed results for 10^6 nrun trials:
	// 13:   122,945 collisions ( 12.29%) in 6.84 seconds
	// 12:   245,449 collisions ( 24.54%) in 4.24 seconds
	// 11:   486,902 collisions ( 48.69%) in 2.61 seconds
	// 10:   957,293 collisions ( 95.73%) in 2.10 seconds
	//  9: 1,874,358 collisions (187.44%) in 1.58 seconds
	//  8: 3,558,747 collisions (355.87%) in 1.60 seconds
	//  7: 6,482,330 collisions (648.23%) in 1.77 seconds
// single multiplication:
	// 10: 2.06 seconds
	//  9: 1.57 seconds   (4.428sec for 3e+6 trials)
	//  8: 1.57 seconds   (4.494sec for 3e+6 trials)
	//  7: 1.81 seconds
// the trend was about the same for the slow version, but of course a bit slower.
// 512 was the best table size in every case.

#define TABLE_LEN (1 << TABLE_BITS)

#define FALLTHROUGH	__attribute__((fallthrough))
#define FORCE_INLINE inline __attribute__((gnu_inline, always_inline))

typedef union {
	u64 matx;   // the whole matrix as a single integer
	u8 rows[8]; // each row as a separate integer
} Matx8;

constexpr u64 Matx8_xroll_masks[8] = {
	0b1111111111111111111111111111111111111111111111111111111111111111llu, // 0, unused
	0b0111111101111111011111110111111101111111011111110111111101111111llu, // 1
	0b0011111100111111001111110011111100111111001111110011111100111111llu, // 2
	0b0001111100011111000111110001111100011111000111110001111100011111llu, // 3
	0b0000111100001111000011110000111100001111000011110000111100001111llu, // 4
	0b0000011100000111000001110000011100000111000001110000011100000111llu, // 5
	0b0000001100000011000000110000001100000011000000110000001100000011llu, // 6
	0b0000000100000001000000010000000100000001000000010000000100000001llu, // 7
};

//////////////////////////////// Matx8 methods ////////////////////////////////

#if FAST_HASHING
static FORCE_INLINE u32 Matx8__hash_u(u64 state) {
	return state * 0xff51afd7ed558ccdllu >> 64 - TABLE_BITS;
}
#else
#define SIP_HALF_ROUND(a, b, c, d, s, t)      \
	a += b; c += d;                           \
	b = __builtin_stdc_rotate_left(b, s) ^ a; \
	d = __builtin_stdc_rotate_left(d, t) ^ c; \
	a = __builtin_stdc_rotate_left(a, 32);

#define SIP_SINGLE_ROUND(v0, v1, v2, v3)    \
	SIP_HALF_ROUND(v0, v1, v2, v3, 13, 16); \
	SIP_HALF_ROUND(v2, v1, v0, v3, 17, 21);

static u32 Matx8__hash_u(const u64 state) {
	// this implementation is copied from CPython's source code and then modified.
	// essentially just siphash13(0, 0, (u8 *) &state, 8) & (TABLE_LEN - 1).
	// But then also different, because I decided.

	u64 v0 = 0x736f6d6570736575ull,
		v1 = 0x646f72616e646f6dull,
		v2 = 0x6c7967656e657261ull,
		v3 = 0x7465646279746573ull ^ state;

	SIP_SINGLE_ROUND(v0, v1, v2, v3);
	v3 ^= 1llu << 59;
	v0 ^= state;

	SIP_SINGLE_ROUND(v0, v1, v2, v3);
	v0 ^= 1llu << 59;
	v2 ^= 0xff;

	SIP_SINGLE_ROUND(v0, v1, v2, v3);

	// the last two rounds don't reduce collisions, so I removed them.

	return (v0 ^ v1 ^ v2 ^ v3) & (TABLE_LEN - 1);
}
#endif

static FORCE_INLINE u64 Matx8__xroll_u(const u64 state, u8 x) {
	// a positive roll rotates right (towards smaller bit indices).
	x &= 7;

	if (x == 0)
		return state;

	const u64 mask = Matx8_xroll_masks[x];

	return (state >> x) & mask | (state << (8 - x)) & ~mask;
}

static FORCE_INLINE u64 Matx8__yroll_u(const u64 state, u8 y) {
	// a positive roll rotates down (towards smaller bit indices).
	return __builtin_stdc_rotate_right(state, (y & 7) << 3);
}

// matrix wrapper functions

static FORCE_INLINE u32 Matx8__hash(const Matx8 this) {
	return Matx8__hash_u(this.matx);
}

static FORCE_INLINE Matx8 Matx8__xroll(const Matx8 this, u8 x) {
	return (Matx8) {.matx = Matx8__xroll_u(this.matx, x)};
}

static FORCE_INLINE Matx8 Matx8__yroll(const Matx8 this, u8 x) {
	return (Matx8) {.matx = Matx8__yroll_u(this.matx, x)};
}

/////////////////////////// Matx8 public API methods ///////////////////////////

// technically all the functions are public, but just don't use them.

#define Matx8_hash(s) _Generic(s, Matx8: Matx8__hash, u64: Matx8__hash_u)(s)
#define Matx8_xroll(s, x) _Generic(s, Matx8: Matx8__xroll, u64: Matx8__xroll_u)(s, x)
#define Matx8_yroll(s, x) _Generic(s, Matx8: Matx8__yroll, u64: Matx8__yroll_u)(s, x)

#if RAND_BUF_LEN < 1
	#error "RAND_BUF_LEN must be at least 1"
#elif RAND_BUF_LEN > 256
	#error "RAND_BUF_LEN must be 256 or less"
#elif RAND_BUF_LEN == 1
static FORCE_INLINE Matx8 Matx8_random(void) {
	// RDRAND is only faster than RtlGenRandom in the unbuffered case
	// 1.53% faster than unbuffered RtlGenRandom
	u64 value;
	until (__builtin_ia32_rdrand64_step(&value));
	return (Matx8) {.matx = value};
}
#else
// plain RDRAND is always slower for these cases.
// those cap at around 2.6% speedup

// speedup for each buffer size using RtlGenRandom:
	//   1: 0% (base case, no buffering)
	//   2: 1.74%
	//   4: 3.3%
	//   8: 3.27%
	//  16: 3.43%
	//  32: 5.63%
	//  64: 5.7%
	// 128: 6.21%
	// 256: 5.28%
	// 512 (u16 idx): 6.19%
	// 512 (u32 idx): 6.23%

static Matx8 Matx8_random(void) {
	_Static_assert((RAND_BUF_LEN & (RAND_BUF_LEN - 1)) == 0, "RAND_BUF_LEN must be power of two");

	static u64 buffer[RAND_BUF_LEN] __attribute__((aligned(64)));
	static u8 idx = 0; // initialize the first time it is called.

#if RAND_BUF_LEN < 256
	if (idx >= RAND_BUF_LEN)
		__builtin_unreachable();
#endif

	unlikelyp_if (idx == 0, 1.0 - 1.0 / RAND_BUF_LEN) {
		RtlGenRandom(buffer, sizeof buffer);
		idx = RAND_BUF_LEN & UINT8_MAX; // NOTE: still fine for 256
	}

	return (Matx8) {
		.matx = buffer[--idx]
	};
}
#endif

///////////////////////////////// Table stuff /////////////////////////////////

// each entry takes up a quarter of a cache line.
typedef struct TableEntry {
	Matx8 key; // the matrix. 8 bytes
	u32 val;   // step index the state belongs to.
	u32 next;  // arena id for the next entry in the linked list.
} __attribute__((aligned(16))) TableEntry;

#define SCRATCH_SIZE ((TABLE_LEN + ARENA_LEN)*sizeof(TableEntry) + 1*sizeof(u32))

typedef union {
	// generic byte buffer for storing strings in some parts of the program.
	// this just uses the same memory location as the hash table, but is not part of it.
	char scratch[SCRATCH_SIZE];

	// NOTE: The first layer of entries is directly in the hash table. Usually
	//       the hashmap is an array of pointers, but I like this way better.
	__attribute__((packed)) struct {
		TableEntry buckets[TABLE_LEN];
		TableEntry overflow_arena[ARENA_LEN];
		u32 arena_pos;
	};
} __attribute__((aligned(64))) HashTable; // aligned to a cache line.

static HashTable hashtable = {0};

#if DEBUG
static u64 total_collisions = 0;
#endif

static bool Table__add3(const Matx8 mat, const u32 val, const u32 /*hash*/ h) {
	if (hashtable.buckets[h].next == ARENA_NO_BUCKET) {
		// no collision.
		hashtable.buckets[h] = (TableEntry) {
			.key  = mat,
			.val  = val,
			.next = ARENA_NO_NEXT
		};
	}
	else {
		// handle collision

	#if DEBUG
		total_collisions++;
	#endif

		if (hashtable.arena_pos == ARENA_MAX)
			return true; // out of arena memory

		const u32 entry_id = hashtable.arena_pos++;

		// NOTE: if there is a collision, the `next` field will never be ARENA_NO_BUCKET,
		//       so don't worry about trying to normalize the `next` field.

		// don't traverse the linked list. just put the new entry at in the second spot.
		hashtable.overflow_arena[entry_id] = (TableEntry) {
			.key  = mat,
			.next = hashtable.buckets[h].next,
			.val  = val
		};

		hashtable.buckets[h].next = entry_id;
	}

	return false;
}

static FORCE_INLINE bool Table__add2(const Matx8 mat, const u32 val) {
	return Table__add3(mat, val, Matx8_hash(mat));
}


static u32 Table__get2(const Matx8 mat, u32 /*hash*/ h) {
	TableEntry *entry = hashtable.buckets + h;

	if (entry->next == ARENA_NO_BUCKET)
		// bucket is empty. no value to retrieve.
		return TABLE_NO_VALUE;

	while (true) {
		if (entry->key.matx == mat.matx)
			return entry->val;

		if (entry->next == ARENA_NO_NEXT)
			break;

		entry = hashtable.overflow_arena + entry->next;
	}

	return TABLE_NO_VALUE;
}

static FORCE_INLINE u32 Table__get1(const Matx8 mat) {
	return Table__get2(mat, Matx8_hash(mat));
}

/////////////////////////// Table public API methods //////////////////////////

// NOTE: returns false if it succeeded, and true if it ran out of arena memory.
#define Table_add(mat, val, h...) \
	VA_IF(Table__add3(mat, val, h), Table__add2(mat, val), h)

// NOTE: it returns TABLE_NO_VALUE if the entry doesn't exist.
//       a real value should not get that high, so it is fine.
#define Table_get(mat, h...) \
	VA_IF(Table__get2(mat, h), Table__get1(mat), h)

static void Table_clear(void) {
	hashtable.arena_pos = 0;

	for (u32 i = 0; i < TABLE_LEN; i += 4) {
		// only touch one cache line per iteration.
		hashtable.buckets[i | 0].next = ARENA_NO_BUCKET;
		hashtable.buckets[i | 1].next = ARENA_NO_BUCKET;
		hashtable.buckets[i | 2].next = ARENA_NO_BUCKET;
		hashtable.buckets[i | 3].next = ARENA_NO_BUCKET;

		// NOTE: the other fields don't need to be cleared because they
		//       won't be read again until they have been set again.
	}
}
