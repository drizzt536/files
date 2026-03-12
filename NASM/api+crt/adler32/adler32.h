// only works with GCC-compatible compilers. No dirty Mossad Visual Studio users.
#pragma once
#define ADLER32_H

#include <stdint.h>  // uint8_t, uint16_t, uint32_t, uint64_t
#include <stdlib.h>  // FILE

typedef uint8_t  u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;

// no <stdbool.h> because it is deprecated.

#define ADLER32_MAX 	0xFFF0FFF0u	// 65520 << 16 | 65520
#define ADLER32_BASE	0xFFF1u		// 65521
#define ADLER32_EMPTY	1			// checksum of an empty buffer

#define ADLER32_VERSION_FLAG_NO_FOLDER_CHECK	(1 << 0)
#define ADLER32_VERSION_FLAG_UNUSED_1			(1 << 0)
#define ADLER32_VERSION_FLAG_UNUSED_2			(1 << 2)
#define ADLER32_VERSION_FLAG_UNUSED_3			(1 << 3)
#define ADLER32_VERSION_FLAG_UNUSED_4			(1 << 4)
#define ADLER32_VERSION_FLAG_UNUSED_5			(1 << 5)
#define ADLER32_VERSION_FLAG_UNUSED_6			(1 << 6)
#define ADLER32_VERSION_FLAG_UNUSED_7			(1 << 7)

// this assumes little endian, which is okay because MS ABI requires it
typedef union {
	struct __attribute__((packed)) {
		union {
			struct __attribute__((packed)) {
				u8 minor;
				u8 major;
			};

			u16 version; // major << 8 | minor
		};

		u32 buffer_size;
		u8 unroll_factor;
		u8 flags;
	};

	u64 raw;
} adler32_version_t;

#ifdef __cplusplus
extern "C" {
#endif

// NOTE: not all of these exist or are exported in every build.

u32 adler32_buf(u32 prev_cksm, u8 *buf, u64 length);
u32 adler32_buf_fw(u32 prev_cksm, u8 *buf, u64 length);
u32 adler32_buf_bw(u32 prev_cksm, u8 *buf, u64 length);
u32 adler32_combine(u32 cksm1, u32 cksm2, u64 len2);
u32 adler32_fname(char *filename, u32 prev_cksm);
u32 adler32_fp(FILE *fp, u32 prev_cksm);
u32 adler32_fp_fw(FILE *fp, u32 prev_cksm);
u32 adler32_fp_bw(FILE *fp, u32 prev_cksm);
u32 adler32_hex(char *str, u32 prev_cksm);
u32 adler32_str(char *str, u32 prev_cksm);

bool adler32_reverse(void);
bool adler32_direction(void);
adler32_version_t adler32_version(void);
void adler32_memzero(void);

#ifdef __cplusplus
}
#endif
