// nocompile

static FORCE_INLINE u64 permute(u64 x) {
	// xorshift64*
	x ^= x >> 12;
	x ^= x << 25;
	x ^= x >> 27;
	x *= 0x2545F4914F6CDD1Dllu;
	return x;
}

void loop(void) {
	Max7219::state.raw = permute(Max7219::state.raw);
	Max7219::sync();
	delay(250);
}
