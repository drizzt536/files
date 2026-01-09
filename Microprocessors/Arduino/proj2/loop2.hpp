// nocompile

void loop(void) {
	static u8 i = 1;

	u8 x =
		(random(256) <= 17) << 7 |
		(random(256) <= 65) << 6 |
		(random(256) <= 42) << 5 |
		(random(256) <= 80) << 4 |
		(random(256) <= 33) << 3 |
		(random(256) <= 90) << 2 |
		(random(256) <= 70) << 1 |
		(random(256) <= 12);

	Matrix::Core::send(i, x);

	i++;
	if (i == 9) {
		i = 1;
		delay(225);
		Matrix::all(0);
		delay(75);
	}

	delay(30); // delay after every row instead of after every display
}
