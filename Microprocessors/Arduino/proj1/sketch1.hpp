// nocompile

static constexpr u8 DELAY     = 125;
static constexpr u8 LED_CNT   = 10;
static constexpr u8 BTN_PIN   = 2;

static const u8 pins[LED_CNT] = {48, 46, 44, 42, 40, 38, 36, 34, 32, 30};

void setup(void) {
	for (u8 i = 0; i < LED_CNT; i++)
		pinMode(pins[i], OUTPUT);

	pinMode(BTN_PIN, INPUT_PULLUP);

	while (digitalRead(BTN_PIN) == 0);
		// don't start until the button is pressed.
}

void loop(void) {
	u8 i = 0;

	// enable all LEDs
	for (; i < LED_CNT; i++)
		digitalWrite(pins[i], 1);

	delay(DELAY);

	// disable all LEDs
	while (i --> 0)
		digitalWrite(pins[i], 0);

	delay(DELAY);
}
