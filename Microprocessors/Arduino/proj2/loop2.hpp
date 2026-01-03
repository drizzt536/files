// nocompile

void loop(void) {
	static u8 i = 1;

	u8 x =
		(random(0, 255) <= 17) << 7 |
		(random(0, 255) <= 65) << 6 |
		(random(0, 255) <= 42) << 5 |
		(random(0, 255) <= 80) << 4 |
		(random(0, 255) <= 33) << 3 |
		(random(0, 255) <= 90) << 2 |
		(random(0, 255) <= 70) << 1 |
		(random(0, 255) <= 12);

	Max7219::send(i, x);

	i++;
	if (i == 9) {
		i = 1;
		delay(225);
		Max7219::all(0);
		delay(75);
	}

	delay(30); // delay after every row instead of after every display
}
