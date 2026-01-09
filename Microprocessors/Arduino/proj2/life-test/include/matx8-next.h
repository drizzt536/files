#pragma once
#define MATX8_NEXT_H

#define NH_MOORE		0 // 8 neighbors (combination of the other two)
#define NH_VON_NEUMANN	1 // 4 neighbors (cardinal directions)
#define NH_DIAGONAL		2 // 4 neighbors (only the diagonal ones)

#ifndef NEXT_COND
	// NOTE: 0 and 8 are always the same, so not all conditions are allowed.

	#pragma message("NEXT_COND not given. assuming B3/S23.")
	#define NEXT_COND ~n2 & n1 & (n0 | s)
#endif

#ifndef NEIGHBORHOOD
	#pragma message("NEIGHBORHOOD not given. assuming NH_MOORE (8 neighbors).")
	#define NEIGHBORHOOD NH_MOORE

	#ifndef RULESET
		#define RULESET "B3/S23"
	#endif
#endif

#ifndef RULESET
	#pragma message("RULESET not given. defaulting to unknown")
	#define RULESET "unknown"
#endif

#if NEIGHBORHOOD != NH_MOORE && NEIGHBORHOOD != NH_VON_NEUMANN && NEIGHBORHOOD != NH_DIAGONAL
	#error "invalid neighborhood. must be NH_MOORE, NH_VON_NEUMANN, or NH_DIAGONAL"
#endif

// NOTE: adds a 1-bit value `x` to a 3-bit accumulator. 8 wraps around to 0.
//       this doesn't matter because 8 and 0 give the same result in all cases.
//       and it can't wrap around multiple times like it could with a 2-bit accumulator.
#define _3BIT_ADD(c0, n2, n1, n0, x) ({ \
	c0  = n0 & x;  \
	n2 ^= n1 & c0; \
	n1 ^= c0;      \
	n0 ^= x;       \
	(void) 0;      \
})

static Matx8 Matx8_next(const Matx8 this) {
	register u64 // neighbor counter bits
		n2 = 0, // counter output bit 2. e.g. (n >> 2) & 1
		n1 = 0, // counter output bit 1. e.g. (n >> 1) & 1
		n0 = 0, // counter output bit 0. e.g. (n >> 0) & 1
		c0;     // carry bit for counter bit 0

	const u64
		cl = Matx8_xroll(this.matx, 7), // center left
		cr = Matx8_xroll(this.matx, 1); // center right

	// the code with the _3BIT_ADD stuff is basically just this:
	// neighbors = (ul + uc + ur) + (cl + cr) + (dl + dc + dr)
	// but avoiding the issue that is it is trying to fit potentially 4 bits of information
	// into each bit, which will overflow all over the place and return garbage,
	// so instead the adders have each bit separated out so there are no overflows.

#if NEIGHBORHOOD == NH_MOORE || NEIGHBORHOOD == NH_VON_NEUMANN
	const u64
		uc = Matx8_yroll(this.matx, 7), // up center
		dc = Matx8_yroll(this.matx, 1); // down center

	_3BIT_ADD(c0, n2, n1, n0, cl);
	_3BIT_ADD(c0, n2, n1, n0, cr);

	_3BIT_ADD(c0, n2, n1, n0, uc);
	_3BIT_ADD(c0, n2, n1, n0, dc);
#endif

#if NEIGHBORHOOD == NH_MOORE || NEIGHBORHOOD == NH_DIAGONAL
	const u64
		ul = Matx8_yroll(cl, 7), // up left
		ur = Matx8_yroll(cr, 7), // up right
		dl = Matx8_yroll(cl, 1), // down left
		dr = Matx8_yroll(cr, 1); // down right

	_3BIT_ADD(c0, n2, n1, n0, ul);
	_3BIT_ADD(c0, n2, n1, n0, ur);

	_3BIT_ADD(c0, n2, n1, n0, dl);
	_3BIT_ADD(c0, n2, n1, n0, dr);
#endif

	const u64 s = this.matx;
	(void) s; // some rulesets don't directly depend on the current state

	return (Matx8) {.matx = NEXT_COND};
}
