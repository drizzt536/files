// nocompile

void loop(void) {
	static u8 i = 1;

	u8 x =
		(random(256) < 85) << 7 |
		(random(256) < 85) << 6 |
		(random(256) < 85) << 5 |
		(random(256) < 85) << 4 |
		(random(256) < 85) << 3 |
		(random(256) < 85) << 2 |
		(random(256) < 85) << 1 |
		(random(256) < 85);

	Matrix::Core::send(i, x);

	i++;
	if (i == 9) {
		i = 1;
		delay(350);
	}
}
