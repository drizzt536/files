// nocompile

/*
[ROW, BIT]

[0, 0]  [0, 1]  [0, 2]  [0, 3]  [0, 4]  [0, 5]  [0, 6]  [0, 7]
[1, 0]  [1, 1]  [1, 2]  [1, 3]  [1, 4]  [1, 5]  [1, 6]  [1, 7]
[2, 0]  [2, 1]  [2, 2]  [2, 3]  [2, 4]  [2, 5]  [2, 6]  [2, 7]
[3, 0]  [3, 1]  [3, 2]  [3, 3]  [3, 4]  [3, 5]  [3, 6]  [3, 7]
[4, 0]  [4, 1]  [4, 2]  [4, 3]  [4, 4]  [4, 5]  [4, 6]  [4, 7]
[5, 0]  [5, 1]  [5, 2]  [5, 3]  [5, 4]  [5, 5]  [5, 6]  [5, 7]
[6, 0]  [6, 1]  [6, 2]  [6, 3]  [6, 4]  [6, 5]  [6, 6]  [6, 7]
[7, 0]  [7, 1]  [7, 2]  [7, 3]  [7, 4]  [7, 5]  [7, 6]  [7, 7]


a cell will be alive in the next frame if one of the following is true:
1. 3 alive neighbors in the current frame
2. 2 alive neighbors and currently alive

u8 alive_neighbors = neighbors(row, col)
alive = (alive_neighbors == 3) | ((alive_neighbors == 2) & current(row, col))

NOTE: this uses 4 neighbors and it is supposed to use all 8.
*/

FORCE_INLINE u8 getCell(u8 row, u8 col) {
	return (Max7219::state.rows[row & 7] >> (col & 7)) & 1;
}

FORCE_INLINE u8 _getCell(u8 row, u8 col) {
	return (Max7219::state.rows[row] >> col) & 1;
}

FORCE_INLINE u8 neighbors(u8 row, u8 col) {
	/*
	if (0 < row && row < 7 && 0 < col && col < 7)
		return
			_getCell(row - 1, col - 1) + _getCell(row - 1, col) + _getCell(row - 1, col + 1) +
			_getCell(row    , col - 1)                          + _getCell(row    , col + 1) +
			_getCell(row + 1, col - 1) + _getCell(row + 1, col) + _getCell(row + 1, col + 1);
	*/

	return
		getCell(row - 1, col - 1) + getCell(row - 1, col) + getCell(row - 1, col + 1) +
		getCell(row    , col - 1)                         + getCell(row    , col + 1) +
		getCell(row + 1, col - 1) + getCell(row + 1, col) + getCell(row + 1, col + 1);
}

FORCE_INLINE u8 nextState(u8 row, u8 col) {
	const u8 n = neighbors(row, col);
	return (n == 3) | ((n == 2) & getCell(row, col));
}

void loop(void) {
#ifdef UNROLL_EVERYTHING
	next[0] =
		nextState(0, 7) << 7 | nextState(0, 6) << 6 |
		nextState(0, 5) << 5 | nextState(0, 4) << 4 |
		nextState(0, 3) << 3 | nextState(0, 2) << 2 |
		nextState(0, 1) << 1 | nextState(0, 0) << 0;
	next[1] =
		nextState(1, 7) << 7 | nextState(1, 6) << 6 |
		nextState(1, 5) << 5 | nextState(1, 4) << 4 |
		nextState(1, 3) << 3 | nextState(1, 2) << 2 |
		nextState(1, 1) << 1 | nextState(1, 0) << 0;
	next[2] =
		nextState(2, 7) << 7 | nextState(2, 6) << 6 |
		nextState(2, 5) << 5 | nextState(2, 4) << 4 |
		nextState(2, 3) << 3 | nextState(2, 2) << 2 |
		nextState(2, 1) << 1 | nextState(2, 0) << 0;
	next[3] =
		nextState(3, 7) << 7 | nextState(3, 6) << 6 |
		nextState(3, 5) << 5 | nextState(3, 4) << 4 |
		nextState(3, 3) << 3 | nextState(3, 2) << 2 |
		nextState(3, 1) << 1 | nextState(3, 0) << 0;
	next[4] =
		nextState(4, 7) << 7 | nextState(4, 6) << 6 |
		nextState(4, 5) << 5 | nextState(4, 4) << 4 |
		nextState(4, 3) << 3 | nextState(4, 2) << 2 |
		nextState(4, 1) << 1 | nextState(4, 0) << 0;
	next[5] =
		nextState(5, 7) << 7 | nextState(5, 6) << 6 |
		nextState(5, 5) << 5 | nextState(5, 4) << 4 |
		nextState(5, 3) << 3 | nextState(5, 2) << 2 |
		nextState(5, 1) << 1 | nextState(5, 0) << 0;
	next[6] =
		nextState(6, 7) << 7 | nextState(6, 6) << 6 |
		nextState(6, 5) << 5 | nextState(6, 4) << 4 |
		nextState(6, 3) << 3 | nextState(6, 2) << 2 |
		nextState(6, 1) << 1 | nextState(6, 0) << 0;
	next[7] =
		nextState(7, 7) << 7 | nextState(7, 6) << 6 |
		nextState(7, 5) << 5 | nextState(7, 4) << 4 |
		nextState(7, 3) << 3 | nextState(7, 2) << 2 |
		nextState(7, 1) << 1 | nextState(7, 0) << 0;
#else // not unrolling everything
	for (u8 i = 0; i < 8; i++) {
		next[i] = 0;

		for (u8 j = 0; j < 8; j++)
			next[i] |= nextState(i, j) << j;
	}
#endif

	// if any of the rows changed, then the state is still changing.
	// otherwise, reset the device and get a new state.
	for (u8 i = 0; i < 8; i++)
		if (next[i] != Max7219::state.rows[i]) {
			Max7219::update(next);
			delay(DELAY);
			return;
		}

	// wait 2 seconds first so it is clear why it is reseting
	delay(2000);
	asm volatile ("jmp 0");
}
