// nocompile

void loop(void) {
	static u64 display = 0;

	Max7219::update(
		(display >> 8*7) & 0xFF,
		(display >> 8*6) & 0xFF,
		(display >> 8*5) & 0xFF,
		(display >> 8*4) & 0xFF,
		(display >> 8*3) & 0xFF,
		(display >> 8*2) & 0xFF,
		(display >> 8*1) & 0xFF,
		(display >> 8*0) & 0xFF
	);

	display++;
	delay(66);
	delayMicroseconds(666);
}
