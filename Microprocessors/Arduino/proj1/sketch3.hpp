// nocompile

static constexpr u8 DELAY     = 125;
static constexpr u8 LED_CNT   = 10;
static constexpr u8 STATE_CNT = 3;
static constexpr u8 BTN_PIN   = 2;

static const u8 pins[LED_CNT] = {48, 46, 44, 42, 40, 38, 36, 34, 32, 30};
static const u8 states[STATE_CNT][LED_CNT] = {
	{1,0,0, 1,0,0, 1,0,0, 1},
	{0,1,0, 0,1,0, 0,1,0, 0},
	{0,0,1, 0,0,1, 0,0,1, 0}
};

void setup(void) {
	for (u8 i = 0; i < LED_CNT; i++)
		pinMode(pins[i], OUTPUT);

	pinMode(BTN_PIN, INPUT_PULLUP);
}

void loop(void) {
	static u8 state = 0;
	static u8 btn   = 1;
	
	// only poll the button value once per cycle because the it is a toggle
	btn ^= ~digitalRead(BTN_PIN);

	for (u8 i = 0; i < LED_CNT; i++)
		digitalWrite(pins[i], btn & states[state][i]);

	state++;
	if (state == STATE_CNT)
		state = 0;

	delay(DELAY);
}
