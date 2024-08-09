#ifndef REGISTERS_H
	#define REGISTERS_H

	#ifndef __GNUC__
		#error "registers.h requires a GCC-compatable compiler."
	#endif

	#include <stdint.h> // uint64_t, uint32_t, uint16_t, uint8_t
	typedef unsigned __int128 uint128_t;
	typedef __int128 int128_t; // not used. just for consistency.

	// the registers provided can not be used as lvalues.

	// flags register

	#define FLAGS ({                   \
		register uint64_t _r asm("ax"); \
		asm("pushf");                    \
		asm("pop ax");                    \
		_r;                                \
	})
	#define EFLAGS ({                   \
		register uint64_t _r asm("eax"); \
		asm("pushfd");                    \
		asm("pop eax");                    \
		_r;                                 \
	})
	#define RFLAGS ({                   \
		register uint64_t _r asm("rax"); \
		asm("pushfq");                    \
		asm("pop rax");                    \
		_r;                                 \
	})

	/// general registers


	// 64-bit general registers
	#define RAX ({ register uint64_t _r asm("rax"); _r; })
	#define RCX ({ register uint64_t _r asm("rcx"); _r; })
	#define RDX ({ register uint64_t _r asm("rdx"); _r; })
	#define RBX ({ register uint64_t _r asm("rbx"); _r; })
	#define RSI ({ register uint64_t _r asm("rsi"); _r; })
	#define RDI ({ register uint64_t _r asm("rdi"); _r; })
	#define RSP ({ register uint64_t _r asm("rsp"); _r; })
	#define RBP ({ register uint64_t _r asm("rbp"); _r; })
	#define R8  ({ register uint64_t _r asm("r8" ); _r; })
	#define R9  ({ register uint64_t _r asm("r9" ); _r; })
	#define R10 ({ register uint64_t _r asm("r10"); _r; })
	#define R11 ({ register uint64_t _r asm("r11"); _r; })
	#define R12 ({ register uint64_t _r asm("r12"); _r; })
	#define R13 ({ register uint64_t _r asm("r13"); _r; })
	#define R14 ({ register uint64_t _r asm("r14"); _r; })
	#define R15 ({ register uint64_t _r asm("r15"); _r; })

	// 32-bit general registers
	#define EAX  ({ register uint32_t _r asm("eax" ); _r; })
	#define EBX  ({ register uint32_t _r asm("ebx" ); _r; })
	#define ECX  ({ register uint32_t _r asm("ecx" ); _r; })
	#define EDX  ({ register uint32_t _r asm("edx" ); _r; })
	#define ESI  ({ register uint32_t _r asm("esi" ); _r; })
	#define EDI  ({ register uint32_t _r asm("edi" ); _r; })
	#define ESP  ({ register uint32_t _r asm("esp" ); _r; })
	#define EBP  ({ register uint32_t _r asm("ebp" ); _r; })
	#define R8d  ({ register uint32_t _r asm("r8d" ); _r; })
	#define R9d  ({ register uint32_t _r asm("r9d" ); _r; })
	#define R10d ({ register uint32_t _r asm("r10d"); _r; })
	#define R11d ({ register uint32_t _r asm("r11d"); _r; })
	#define R12d ({ register uint32_t _r asm("r12d"); _r; })
	#define R13d ({ register uint32_t _r asm("r13d"); _r; })
	#define R14d ({ register uint32_t _r asm("r14d"); _r; })
	#define R15d ({ register uint32_t _r asm("r15d"); _r; })

	// 16-bit general registers
	#define AX   ({ register uint16_t _r asm("ax"  ); _r; })
	#define BX   ({ register uint16_t _r asm("bx"  ); _r; })
	#define CX   ({ register uint16_t _r asm("cx"  ); _r; })
	#define DX   ({ register uint16_t _r asm("dx"  ); _r; })
	#define SI   ({ register uint16_t _r asm("si"  ); _r; })
	#define DI   ({ register uint16_t _r asm("di"  ); _r; })
	#define SP   ({ register uint16_t _r asm("sp"  ); _r; })
	#define BP   ({ register uint16_t _r asm("bp"  ); _r; })
	#define R8W  ({ register uint16_t _r asm("r8w" ); _r; })
	#define R9W  ({ register uint16_t _r asm("r9w" ); _r; })
	#define R10W ({ register uint16_t _r asm("r10w"); _r; })
	#define R11W ({ register uint16_t _r asm("r11w"); _r; })
	#define R12W ({ register uint16_t _r asm("r12w"); _r; })
	#define R13W ({ register uint16_t _r asm("r13w"); _r; })
	#define R14W ({ register uint16_t _r asm("r14w"); _r; })
	#define R15W ({ register uint16_t _r asm("r15w"); _r; })

	// 8-bit (upper) general registers
	#define AH ({ register uint8_t _r asm("ah"); _r; })
	#define BH ({ register uint8_t _r asm("bh"); _r; })
	#define CH ({ register uint8_t _r asm("ch"); _r; })
	#define DH ({ register uint8_t _r asm("dh"); _r; })

	// 8-bit (lower) general registers
	#define AL   ({ register uint8_t _r asm("al"  ); _r; })
	#define BL   ({ register uint8_t _r asm("bl"  ); _r; })
	#define CL   ({ register uint8_t _r asm("cl"  ); _r; })
	#define DL   ({ register uint8_t _r asm("dl"  ); _r; })
	#define SIL  ({ register uint8_t _r asm("sil" ); _r; })
	#define DIL  ({ register uint8_t _r asm("dil" ); _r; })
	#define SPL  ({ register uint8_t _r asm("spl" ); _r; })
	#define BPL  ({ register uint8_t _r asm("bpl" ); _r; })
	#define R8B  ({ register uint8_t _r asm("r8b" ); _r; })
	#define R9B  ({ register uint8_t _r asm("r9b" ); _r; })
	#define R10B ({ register uint8_t _r asm("r10b"); _r; })
	#define R11B ({ register uint8_t _r asm("r11b"); _r; })
	#define R12B ({ register uint8_t _r asm("r12b"); _r; })
	#define R13B ({ register uint8_t _r asm("r13b"); _r; })
	#define R14B ({ register uint8_t _r asm("r14b"); _r; })
	#define R15B ({ register uint8_t _r asm("r15b"); _r; })

	/// altreg general registers

	// 64-bit altreg general registers
	#define R0 RAX
	#define R1 RCX
	#define R2 RDX
	#define R3 RBX
	#define R4 RSP
	#define R5 RBP
	#define R6 RSI
	#define R7 RDI

	// 32-bit altreg general registers
	#define R0D EAX
	#define R1D ECX
	#define R2D EDX
	#define R3D EBX
	#define R4D ESP
	#define R5D EBP
	#define R6D ESI
	#define R7D EDI

	// 16-bit altreg general registers
	#define R0W AX
	#define R1W CX
	#define R2W DX
	#define R3W BX
	#define R4W SP
	#define R5W BP
	#define R6W SI
	#define R7W DI

	// 8-bit (lower) altreg general registers
	#define R0B AL
	#define R1B CL
	#define R2B DL
	#define R3B BL
	#define R4B SPL
	#define R5B BPL
	#define R6B SIL
	#define R7B DIL

	// 8-bit (lower) altreg general registers
	#define R0L  R0B
	#define R1L  R1B
	#define R2L  R2B
	#define R3L  R3B
	#define R4L  R4B
	#define R5L  R5B
	#define R6L  R6B
	#define R7L  R7B
	#define R8L  R8B
	#define R9L  R9B
	#define R10L R10B
	#define R11L R11B
	#define R12L R12B
	#define R13L R13B
	#define R14L R14B
	#define R15L R15B

	/// NOTE: [xyz]mm(16-31) can't be accessed despite being valid (on my machine).

	// mm registers
	#define MM0 ({ register uint64_t _r asm("mm0"); _r; })
	#define MM1 ({ register uint64_t _r asm("mm1"); _r; })
	#define MM2 ({ register uint64_t _r asm("mm2"); _r; })
	#define MM3 ({ register uint64_t _r asm("mm3"); _r; })
	#define MM4 ({ register uint64_t _r asm("mm4"); _r; })
	#define MM5 ({ register uint64_t _r asm("mm5"); _r; })
	#define MM6 ({ register uint64_t _r asm("mm6"); _r; })
	#define MM7 ({ register uint64_t _r asm("mm7"); _r; })

	// xmm registers
	union uint128 {
		uint128_t u128;
		uint64_t u64[2];
		uint32_t u32[4];
		uint16_t u16[8];
		uint8_t  u8[16];
	};

	#define XMM0  ({ register union uint128 _r asm("xmm0" ); _r; })
	#define XMM1  ({ register union uint128 _r asm("xmm1" ); _r; })
	#define XMM2  ({ register union uint128 _r asm("xmm2" ); _r; })
	#define XMM3  ({ register union uint128 _r asm("xmm3" ); _r; })
	#define XMM4  ({ register union uint128 _r asm("xmm4" ); _r; })
	#define XMM5  ({ register union uint128 _r asm("xmm5" ); _r; })
	#define XMM6  ({ register union uint128 _r asm("xmm6" ); _r; })
	#define XMM7  ({ register union uint128 _r asm("xmm7" ); _r; })
	#define XMM8  ({ register union uint128 _r asm("xmm8" ); _r; })
	#define XMM9  ({ register union uint128 _r asm("xmm9" ); _r; })
	#define XMM10 ({ register union uint128 _r asm("xmm10"); _r; })
	#define XMM11 ({ register union uint128 _r asm("xmm11"); _r; })
	#define XMM12 ({ register union uint128 _r asm("xmm12"); _r; })
	#define XMM13 ({ register union uint128 _r asm("xmm13"); _r; })
	#define XMM14 ({ register union uint128 _r asm("xmm14"); _r; })
	#define XMM15 ({ register union uint128 _r asm("xmm15"); _r; })
	#define XMM16 ({ register union uint128 _r asm("xmm16"); _r; })
	#define XMM17 ({ register union uint128 _r asm("xmm17"); _r; })
	#define XMM18 ({ register union uint128 _r asm("xmm18"); _r; })
	#define XMM19 ({ register union uint128 _r asm("xmm19"); _r; })
	#define XMM20 ({ register union uint128 _r asm("xmm20"); _r; })
	#define XMM21 ({ register union uint128 _r asm("xmm21"); _r; })
	#define XMM22 ({ register union uint128 _r asm("xmm22"); _r; })
	#define XMM23 ({ register union uint128 _r asm("xmm23"); _r; })
	#define XMM24 ({ register union uint128 _r asm("xmm24"); _r; })
	#define XMM25 ({ register union uint128 _r asm("xmm25"); _r; })
	#define XMM26 ({ register union uint128 _r asm("xmm26"); _r; })
	#define XMM27 ({ register union uint128 _r asm("xmm27"); _r; })
	#define XMM28 ({ register union uint128 _r asm("xmm28"); _r; })
	#define XMM29 ({ register union uint128 _r asm("xmm29"); _r; })
	#define XMM30 ({ register union uint128 _r asm("xmm30"); _r; })
	#define XMM31 ({ register union uint128 _r asm("xmm31"); _r; })

	// ymm registers
	union uint256 {
		uint128_t u128[2];
		uint64_t u64[4];
		uint32_t u32[8];
		uint16_t u16[16];
		uint8_t  u8[32];
	};

	#define YMM0  ({ register union uint256 _r asm("ymm0" ); _r; })
	#define YMM1  ({ register union uint256 _r asm("ymm1" ); _r; })
	#define YMM2  ({ register union uint256 _r asm("ymm2" ); _r; })
	#define YMM3  ({ register union uint256 _r asm("ymm3" ); _r; })
	#define YMM4  ({ register union uint256 _r asm("ymm4" ); _r; })
	#define YMM5  ({ register union uint256 _r asm("ymm5" ); _r; })
	#define YMM6  ({ register union uint256 _r asm("ymm6" ); _r; })
	#define YMM7  ({ register union uint256 _r asm("ymm7" ); _r; })
	#define YMM8  ({ register union uint256 _r asm("ymm8" ); _r; })
	#define YMM9  ({ register union uint256 _r asm("ymm9" ); _r; })
	#define YMM10 ({ register union uint256 _r asm("ymm10"); _r; })
	#define YMM11 ({ register union uint256 _r asm("ymm11"); _r; })
	#define YMM12 ({ register union uint256 _r asm("ymm12"); _r; })
	#define YMM13 ({ register union uint256 _r asm("ymm13"); _r; })
	#define YMM14 ({ register union uint256 _r asm("ymm14"); _r; })
	#define YMM15 ({ register union uint256 _r asm("ymm15"); _r; })
	#define YMM16 ({ register union uint256 _r asm("ymm16"); _r; })
	#define YMM17 ({ register union uint256 _r asm("ymm17"); _r; })
	#define YMM18 ({ register union uint256 _r asm("ymm18"); _r; })
	#define YMM19 ({ register union uint256 _r asm("ymm19"); _r; })
	#define YMM20 ({ register union uint256 _r asm("ymm20"); _r; })
	#define YMM21 ({ register union uint256 _r asm("ymm21"); _r; })
	#define YMM22 ({ register union uint256 _r asm("ymm22"); _r; })
	#define YMM23 ({ register union uint256 _r asm("ymm23"); _r; })
	#define YMM24 ({ register union uint256 _r asm("ymm24"); _r; })
	#define YMM25 ({ register union uint256 _r asm("ymm25"); _r; })
	#define YMM26 ({ register union uint256 _r asm("ymm26"); _r; })
	#define YMM27 ({ register union uint256 _r asm("ymm27"); _r; })
	#define YMM28 ({ register union uint256 _r asm("ymm28"); _r; })
	#define YMM29 ({ register union uint256 _r asm("ymm29"); _r; })
	#define YMM30 ({ register union uint256 _r asm("ymm30"); _r; })
	#define YMM31 ({ register union uint256 _r asm("ymm31"); _r; })

	// zmm registers
	union uint512 {
		uint128_t u128[4];
		uint64_t u64[8];
		uint32_t u32[16];
		uint16_t u16[32];
		uint8_t  u8[64];
	};

	#define ZMM0  ({ register union uint512 _r asm("zmm0" ); _r; })
	#define ZMM1  ({ register union uint512 _r asm("zmm1" ); _r; })
	#define ZMM2  ({ register union uint512 _r asm("zmm2" ); _r; })
	#define ZMM3  ({ register union uint512 _r asm("zmm3" ); _r; })
	#define ZMM4  ({ register union uint512 _r asm("zmm4" ); _r; })
	#define ZMM5  ({ register union uint512 _r asm("zmm5" ); _r; })
	#define ZMM6  ({ register union uint512 _r asm("zmm6" ); _r; })
	#define ZMM7  ({ register union uint512 _r asm("zmm7" ); _r; })
	#define ZMM8  ({ register union uint512 _r asm("zmm8" ); _r; })
	#define ZMM9  ({ register union uint512 _r asm("zmm9" ); _r; })
	#define ZMM10 ({ register union uint512 _r asm("zmm10"); _r; })
	#define ZMM11 ({ register union uint512 _r asm("zmm11"); _r; })
	#define ZMM12 ({ register union uint512 _r asm("zmm12"); _r; })
	#define ZMM13 ({ register union uint512 _r asm("zmm13"); _r; })
	#define ZMM14 ({ register union uint512 _r asm("zmm14"); _r; })
	#define ZMM15 ({ register union uint512 _r asm("zmm15"); _r; })
	#define ZMM16 ({ register union uint512 _r asm("zmm16"); _r; })
	#define ZMM17 ({ register union uint512 _r asm("zmm17"); _r; })
	#define ZMM18 ({ register union uint512 _r asm("zmm18"); _r; })
	#define ZMM19 ({ register union uint512 _r asm("zmm19"); _r; })
	#define ZMM20 ({ register union uint512 _r asm("zmm20"); _r; })
	#define ZMM21 ({ register union uint512 _r asm("zmm21"); _r; })
	#define ZMM22 ({ register union uint512 _r asm("zmm22"); _r; })
	#define ZMM23 ({ register union uint512 _r asm("zmm23"); _r; })
	#define ZMM24 ({ register union uint512 _r asm("zmm24"); _r; })
	#define ZMM25 ({ register union uint512 _r asm("zmm25"); _r; })
	#define ZMM26 ({ register union uint512 _r asm("zmm26"); _r; })
	#define ZMM27 ({ register union uint512 _r asm("zmm27"); _r; })
	#define ZMM28 ({ register union uint512 _r asm("zmm28"); _r; })
	#define ZMM29 ({ register union uint512 _r asm("zmm29"); _r; })
	#define ZMM30 ({ register union uint512 _r asm("zmm30"); _r; })
	#define ZMM31 ({ register union uint512 _r asm("zmm31"); _r; })


	/// k registers
	// NOTE: despite being valid, these can't be accessed (on my machine)

	#define K0 ({ register uint64_t _r asm("k0"); _r; })
	#define K1 ({ register uint64_t _r asm("k1"); _r; })
	#define K2 ({ register uint64_t _r asm("k2"); _r; })
	#define K3 ({ register uint64_t _r asm("k3"); _r; })
	#define K4 ({ register uint64_t _r asm("k4"); _r; })
	#define K5 ({ register uint64_t _r asm("k5"); _r; })
	#define K6 ({ register uint64_t _r asm("k6"); _r; })
	#define K7 ({ register uint64_t _r asm("k7"); _r; })
#endif
