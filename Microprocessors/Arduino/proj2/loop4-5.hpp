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
*/

static FORCE_INLINE u8 _getCell(u8 row, u8 col) {
	return (Max7219::state.rows[row] >> col) & 1;
}

static FORCE_INLINE u8 getCell(u8 row, u8 col) {
	return _getCell(row & 7, col & 7);
}

static FORCE_INLINE u8 neighbors(u8 row, u8 col) {
#ifdef MOORE_NEIGHBORHOOD
	return
		getCell(row - 1, col - 1) + getCell(row - 1, col) + getCell(row - 1, col + 1) +
		getCell(row    , col - 1)                         + getCell(row    , col + 1) +
		getCell(row + 1, col - 1) + getCell(row + 1, col) + getCell(row + 1, col + 1);
#elif defined VON_NEUMANN_NEIGHBORHOOD
	return
		getCell(row - 1, col) +
		getCell(row, col - 1) + getCell(row, col + 1) +
		getCell(row + 1, col);
#elif defined DIAGONAL_NEIGHBORHOOD
	return
		getCell(row - 1, col - 1) + getCell(row - 1, col + 1) +
		getCell(row + 1, col - 1) + getCell(row + 1, col + 1);
#else
	#error "a neighbood must be specified"
#endif
}

static FORCE_INLINE u8 nextState(u8 row, u8 col) {
	const u8 n = neighbors(row, col);
	return (n == 3) | ((n == 2) & getCell(row, col));
}

void loop(void) {
	for (u8 i = 0; i < 8; i++) {
		next.rows[i] =
			nextState(i, 7) << 7 | nextState(i, 6) << 6 |
			nextState(i, 5) << 5 | nextState(i, 4) << 4 |
			nextState(i, 3) << 3 | nextState(i, 2) << 2 |
			nextState(i, 1) << 1 | nextState(i, 0) << 0;
	}

	// if any of the cells changed, then the state is still changing.
	// otherwise, reset the device and get a new state.

	if (next.raw == Max7219::state.raw) {
		// wait 2 seconds first so it is clear why it is reseting
		delay(2000);
		asm volatile ("jmp 0");
		__builtin_unreachable();
	}

	Max7219::update(next);
	delay(100);
}
