# prior art

<!-- monospace font -->
```
Microsoft ABI:
	arguments      : rcx rdx r8 r9
	other volatile : rax r10 r11
	non volatile   : rbx rdi rsi rsp rbp r12 r13 r14 r15
	return values  : rax

System V ABI:
	arguments      : rdi rsi rdx rcx r8 r9
	other volatile : rax r10 r11
	non volatile   : rbx rsp rbp r12 r13 r14 r15
	return values  : rax rdx
```

# main design

```
StackMin-L64 ABI (little-endian 64-bit):
	arguments       : rax rbx rcx rdx rdi rsi | r16 r17 r18 r19 r20 r21
	other volatile  : rflags
	non volatile    : rsp rbp r8 r9 r10 r11 r12 r13 r14 r15 | r22 r23 r24 r25 r26 r27 r28 r29 r30 r31
	return values   : same as arguments (up to 6|12 return values)
	fp arguments    : xmm0-xmm5  (ymm0-ymm5)
	non volatile fp : xmm6-xmm15 (ymm6-ymm15)
	fp return vals  : xmm0-xmm5  (ymm0-ymm5) (same as arguments)
```

 - rsp is reserved for the stack pointer.
 - rbp is not reserved for the stack base pointer, but it optionally can be used as such anyway.
 - NOTE: r16-r31 only exist in CPUs with the APX instruction set, so they are spread out,
   rather than having r8-r13 be the rest of the volatile arguments.
 - arguments beyond the first 6 should be passed on the stack in reverse order:
	```
	...
	push arg9 ; or arg15 with APX
	push arg8 ; or arg14
	push arg7 ; or arg13
	call whatever
	```
 - string directions (DF flag) does not need to be cleared or restored before returning if set. It is
   essentially a volatile value. if you use something that uses it (e.g. `rep stosb`), explicitly set it first.
 - the caller should align the stack so the callee can do `sub rsp, 8` and have the stack 16-byte aligned.
   this way, for leaf functions that don't use AVX, SSE, etc., they can ignore the alignment altogether.
   however, functions can define their own ABI, and if they declare they are a leaf function that doesn't
   use AVX, or SSE, then the calling function doesn't have to worry about aligning the stack before calling it.
 - there will not be any kind of shadow space. functions that need the stack should allocate it themselves.
 - for functions that only return one value in rax, it is recommended, but not required, to return an error
   code in rbx if applicable. all standard library functions will do this, but it is not required
   that user level programs do the same. for functions that return between 1-5 values, the error value should
   go in the first unused return register, and for 6+ return values, you have to do something else. This is a
   suggestion, and is still defined per function.
 - for >6 int and >6 fp arguments, the order the extra args go on the stack should be defined by the
   particular function (e.g. function prototype).

# returning single values

 - if you control both the caller and callee, then this is just a suggestion.
 - 8 bits: al
 - 16 bits: ax
 - 32 bits: eax
 - 64 bits: rax
 - 128 bits: rbx:rax (rax is the lower half, rbx is the upper half)
 - 192: rcx:rbx:rax (rax lowest third, rbx middle third, rcx upper third)
 - 256 bits: rdx:rcx:rbx:rax (rax lowest fourth, rbx 2nd lowest fourth, rcx 2nd highest, rdx highest)
 - 320 bits: rdi:rdx:rcx:rbx:rax (rax low to rdi high)
 - 384 bits: rsi:rdi:rdx:rcx:rbx:rax (rax low to rsi high)

#### extension with APX

 - 448 bits: r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r16 high)
 - 512 bits: r17:r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r17 high)
 - 576 bits: r18:r17:r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r18 high)
 - 640 bits: r19:r18:r17:r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r19 high)
 - 704 bits: r20:r19:r18:r17:r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r20 high)
 - 768 bits: r21:r20:r19:r18:r17:r16:rsi:rdi:rdx:rcx:rbx:rax (rax low to r21 high)

 - other: clump towards rax and right-pad to a 64-bit boundary.
   e.g., for a 380-bit value, zero the highest 4 bits of rsi.
 - for more than the return registers allow, return a pointer to the stack.
   NOTE: low means least significant, high means most significant.

# returning packed structures and arrays *without* APX

if the return value isn't exactly 384 bits, just ignore the bits and registers that aren't needed.

 - up to 6 values of up to 64-bits:
	this category outclasses the others. if there are less than 6 values, always use separate registers.
	basically, use the least amount of registers as possible, and clump them towards rax.

	for up to 10 8-bit values, this also applies, use the H and L registers as separate registers.
	e.g. al=x1, ah=x2, bl=x3, bh=x4, etc.

	for 16-bit (<=6 values), use ax and ignore the rest of the register.
	for 8-bit (<=6 values), use al and ignore the rest of the register.
	(this applies to all the return registers, ax and al are just an example)

	rax = x1
	rbx = x2
	rcx = x3
	rdx = x4
	rdi = x5
	rsi = x6
 - up to 3 128-bit values:
	```c
	struct __attribute__((packed)) b384_3 {
		unsigned __int128 x1, x2, x3;
	};
	// or this:
	unsigned __int128 arr[3]; // xN is arr[N - 1]
	```
	rax = x1 & (1 << 64)
	rbx = x1 >> 64
	rcx = x2 & (1 << 64)
	rdx = x2 >> 64
	rdi = x3 & (1 << 64)
	rsi = x3 >> 64
 - up to 6 64-bit values:
	```c
	struct __attribute__((packed)) b384_6 {
		uint64_t x1, x2, x3, x4, x5, x6;
	};
	// or this:
	uint64_t arr[6]; // xN is arr[N - 1]
	```
	rax = x1
	rbx = x2
	rcx = x3
	rdx = x4
	rdi = x5
	rsi = x6
 - up to 12 32-bit values:
	```c
	struct __attribute__((packed)) b384_12 {
		uint32_t x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12;
	};
	// or this:
	uint32_t arr[12]; // xN is arr[N - 1]
	```
	rax = x2  << 32 | x1
	rbx = x4  << 32 | x3
	rcx = x6  << 32 | x5
	rdx = x8  << 32 | x7
	rdi = x10 << 32 | x9
	rsi = x12 << 32 | x11
 - up to 24 16-bit values:
	```c
	struct __attribute__((packed)) b384_24 {
		uint16_t x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12,
			x13, x14, x15, x16, x17, x18, x19, x20, x21, x22, x23, x24;
	};
	// or this:
	uint16_t arr[24]; // xN is arr[N - 1]
	```
	rax = x4  << 48 | x3  << 32 | x2  << 16 | x1
	rbx = x8  << 48 | x7  << 32 | x6  << 16 | x5
	rcx = x12 << 48 | x11 << 32 | x10 << 16 | x9
	rdx = x16 << 48 | x15 << 32 | x14 << 16 | x13
	rdi = x20 << 48 | x19 << 32 | x18 << 16 | x17
	rsi = x24 << 48 | x23 << 32 | x22 << 16 | x21
 - up to 48 8-bit values:
	```c
	struct __attribute__((packed)) b384_48 {
		uint16_t x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12,
			x13, x14, x15, x16, x17, x18, x19, x20, x21, x22, x23, x24,
			x25, x26, x27, x28, x29, x30, x31, x32, x33, x34, x35, x36,
			x37, x38, x39, x40, x41, x42, x43, x44, x45, x46, x47, x48;
	};
	// or this:
	uint8_t str[48]; // x1 is str[0], x2 is str[1], ..., xN is str[N - 1]
	```
	rax = x8  << 56 | x7  << 48 | x6  << 40 | x5  << 32 | x4  << 24 | x3  << 16 | x2  << 8 | x1
	rbx = x16 << 56 | x15 << 48 | x14 << 40 | x13 << 32 | x12 << 24 | x11 << 16 | x10 << 8 | x9
	rcx = x24 << 56 | x23 << 48 | x22 << 40 | x21 << 32 | x20 << 24 | x19 << 16 | x18 << 8 | x17
	rdx = x32 << 56 | x31 << 48 | x30 << 40 | x29 << 32 | x28 << 24 | x27 << 16 | x26 << 8 | x25
	rdi = x40 << 56 | x39 << 48 | x38 << 40 | x37 << 32 | x36 << 24 | x35 << 16 | x34 << 8 | x33
	rsi = x48 << 56 | x47 << 48 | x46 << 40 | x45 << 32 | x44 << 24 | x43 << 16 | x42 << 8 | x41

# returning packed structures and arrays *with* APX

if the return value isn't exactly 768 bits, just ignore the bits and registers that aren't needed.

 - up to 12 values of up to 64-bits:
	this category outclasses the others. if there are less than 12 values, always use separate registers.
	basically, use the least amount of registers as possible, and clump them towards rax.

	for up to 16 8-bit values, this also applies, use the H and L registers as separate registers.
	e.g. al=x1, ah=x2, bl=x3, bh=x4, etc.

	for 16-bit (<=12 values), use ax and ignore the rest of the register.
	for 8-bit (<=12 values), use al and ignore the rest of the register.
	(this applies to all the return registers, ax and al are just an example)

	rax = x01
	rbx = x02
	rcx = x03
	rdx = x04
	rdi = x05
	rsi = x06
	r16 = x07
	r17 = x08
	r18 = x09
	r19 = x10
	r20 = x11
	r21 = x12

	for <=6 128-bit values, <=12 64-bit values, <=24 32-bit values, <=48 16-bit values, <=96 8-bit values,
	it is basically the same as for returning packed structs and arrays without APX. The only difference
	is that there are double the registers used.

# variadic functions (VF)

<!-- idk what SysV ABI or MS ABI do for variadic functions, but it is probably stupid, so I don't care. -->

 - NOTE: VA means "variadic argument". NVA means "non-variadic argument". NVOA means "non-variadic overflow
   argument", or the NVAs that are overflowed onto the stack instead of in registers. 
 - a VF is a function that takes a variable number of arguments, meaning the number of arguments that should
   be given can be different between multiple invocations of the function.
 - VFs use an argument `va_count` that should be given as the last NVA. this is opposed to a `va_list`
   argument in other ABIs, which does who knows what.
 - VFs types will be defined via the function contract, which is basically like a C prototype type thing.
 - NVAs still go in registers, and the VAs go right after the NVOAs on the stack. For example, if all the
   arguments are 64-bits and the last NVA is at `rsp + 8*10`, then VA `i` is at `rsp + 8*(10 + 1) + 8*i`.
 - `va_list` doesn't include the stack pointer in this construction because it is always in a fixed
   location: right after (above) the NVOAs in memory. Or if there are no overflow arguments, then it goes
   right above the return address.
 - All VAs go on the stack rather than a hybrid approach with some of the VAs in registers and the rest
   on the stack because with VAs, usually the whole point is that the callee needs to iterate over them,
   and if you pass the first few through registers, you will just have to push them to the stack anyway.
 - For calling a function with variable arguments, the procedure is:
	1. potentially do stack alignment for AVX `sub rsp, 8`
	2. push the VAs in reverse order
	3. push the NVOAs in reverse order
	4. call the function
	5. remove the arguments from the stack space: `add rsp, variadic_size + overflow_size`.
	6. potentially undo the stack realignment with `add rsp, 8`

## static variadic functions (SVF)

 - an SVF is a function that takes a variable number of arguments, but where their types are known at compile
   time, and are the same for all invocations. For example, something like a `sum_u64` would be in this
   category, since all the arguments are `u64` integers, and it sums them.
 - SVFs are essentially the same as if the function takes a length and a pointer to an array, but more convenient
   at the call site since the caller in the higher level language doesn't have to create an actual array.
 - `va_count` takes up a single argument. This is a 32-bit value. (as opposed to `va_list`) this has to be given
   for SVFs since they have no other way to determine the count.
 - a VF is static if, given only the number of arguments, it can always correctly and uniquely
   determine the type and offsets of all of its arguments. They don't have to uniformly typed.
 - all arguments must be 64-bit aligned, and it is undefined how to pass values that are both larger than
   64-bits and not 64-bit aligned.
 - values larger than 64-bits that are aligned to 64-bits should be pushed into the list as if they are
   separate 64-bit arguments (byte-for-byte copy). But the `va_count` argument will be given the
   number of logical arguments. For example, f((u128) x, (u64) y, (u256) z) passes `va_count = 3`, but pushes
   7 variadic u64 blocks. It pushes the arguments to the stack in the following order (highest to lowest):
     1. `z >> 192`
     2. `(z >> 128) & 0xffffffffffffffffllu`
     3. `(z >> 64) & 0xffffffffffffffffllu`
     4. `z & 0xffffffffffffffffllu`
     5. `y`
     6. `x >> 64`
     7. `x & 0xffffffffffffffffllu`

## dynamic variadic functions (DVF)

 - a DVF is a function that takes a variable number of arguments but where the types and offsets of the
   VAs can all be calculated at runtime from one of the NVAs (e.g. `printf`'s format argument).
 - a DVF is allowed to pass unaligned values and values larger than 64-bits.
 - all values should put in their slot in the variable argument list as a byte-for-byte copy.
 - DVFs should omit the `va_count` argument unless it is explicitly used in the function. This would be
   defined in the function contract.
 - By default, all DVF arguments should 64-bits (`u64` or `f64`) unless the specific function contract
   dictates otherwise.
