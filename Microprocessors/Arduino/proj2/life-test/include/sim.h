#pragma once
#define SIM_H

static char *_stringify_count(const sttyp_t t) {
	switch (t) {
		case EMPTY: return "empty";
		case CONST: return "const";
		case CYCLE: return "cycle";
		default: __builtin_unreachable();
	}
}

static void print_state(const Matx8 state) {
	// returns the number of characters printed (always 202)
	// represents alive cells as '#' and dead cells as '.'

	// this function doesn't need to be optimized because it runs in the `sim`
	// branches, where the code deliberately calls `Sleep`.

	puts(
		"   | 7 6 5 4 3 2 1 0 \n"
		"---+-----------------"
	);

	for (u8 row = 8; row --> 0 ;) {
		printf(" %u |", row);

		for (u8 col = 8; col --> 0 ;) {
			putchar(' ');
			putchar((state.rows[row] >> col) & 1 ? alive_char : dead_char);
		}

		unlikelyp_if (row, 0.875)
			putchar('\n');
	}
}

static void _cli_sim2(const u64 trial, const Matx8 start_state) {
	u32 step, h, table_value, period;
	Matx8 state = start_state;

	// clear the screen, clear scrollback lines, move cursor to (0, 0),
	// and print the start state
	printf("\e[2J\e[3J");
	printf("\e[Hstate %3u:          \n", 0);
	print_state(state);

	Table_clear();

	step = 0;

	do {
		Sleep(sleep_ms[1]);
		h = Matx8_hash(state);
		table_value = Table_get(state, h);

		unlikelyp_if (table_value != TABLE_NO_VALUE, 0.97129) {
			// the state has already been seen.
			period = step - table_value;
			goto sim_done;
		}

		unlikelyp_if (Table_add(state, step, h), 0.999999) {
			eprintf("Arena OOM: s=0x%016llx, step=%u\n", start_state.matx, step);
			return;
		}

		state = Matx8_next(state);
		step++;

		// no \e[2J required since the new message is either the same length or longer
		// than whatever is printed currently.
		printf("\e[Hstate %3u:          \n", step);
		print_state(state);
	} until (GetAsyncKeyState(stop_key) & 0x8000);

	// abort code when the stop key is pressed.
	printf("\e[4;22Hs=%016llx", start_state.matx);
	printf("\e[5;23Haborting");
	printf("\e[11;21H");
	exit(0);

sim_done:
	printf("\e[4;22Hs=0x%016llx", start_state.matx);
	printf("\e[5;22Hd=\"%s\"",
		_stringify_count(!state.matx ? EMPTY : period == 1 ? CONST : CYCLE));
	printf("\e[6;22Hp=%u", period);
	printf("\e[7;22Ht=%u", step);
	printf("\e[8;22HT="); print_du64(trial);

#if DEBUG
	printf("\e[9;22HC=%u", hashtable.arena_pos);
	if (hashtable.arena_pos > max_collisions) {
		max_collisions = hashtable.arena_pos;
		max_collisions_state = start_state.matx;
	}
#endif

	// move the cursor back to the end in case there are no more simulations.
	printf("\e[11;21H");
}

static FORCE_INLINE void _cli_sim1(const u64 trial) {
	_cli_sim2(trial, Matx8_random());
}

// cli_sim is basically run_once but it prints the states.
#define cli_sim(trial, start_state...) \
	VA_IF(_cli_sim2(trial, start_state), _cli_sim1(trial), start_state)

static void _cli_sim_one1(Matx8 state) {
	// simulate until the process is killed.
	printf("\e[2J\e[3J\e[H");
	print_state(state);

	do {
		Sleep(sleep_ms[1]);
		state = Matx8_next(state);

		printf("\e[H");
		print_state(state);
	} until (GetAsyncKeyState(stop_key) & 0x8000);

#if DEBUG
	if (!silent)
		putchar('\n');
#endif
}

static FORCE_INLINE void _cli_sim_one0(void) {
	_cli_sim_one1(Matx8_random());
}

#define cli_sim_one(start_state...) \
	VA_IF(_cli_sim_one1(start_state), _cli_sim_one0(), start_state)
