#pragma once
#define RUN_H

static void log_if_interesting(Matx8 s0, Matx8 s1, sttyp_t type, u32 step, u32 period) {
	// returns an integer where the magnitude reflects how interesting the state is.
	u8 interest = 0;

	// these conditions are all unlikely because most states are not interesting.
	// near the start, most states are interesting, but after like a million trials, almost none of them are.

	// after I see them a few times, they stop being interesting. The rest of the states
	// stop logging on their own, or are so rare they don't stop being interesting.
	// the 64 and 128 conditions are so unlikely that I have never actually seen them.
	static u8 b4 = 5, b32 = 5;

	// rare but not new transient value.
	unlikely_if (transients[step] < 2 && transients[step] > 0)
		interest |= 1 << 0; // 1

	// rare but not new period value
	unlikely_if (periods[period] < 2 && periods[period] > 0)
		interest |= 1 << 1; // 2

	// a lot of states before the loop, and a loop
	unlikely_if (step - period > 196 && period > 36) {
		unlikelyp_if (b4 != 0, 0.999) b4--;

		interest |= 1 << 2; // 4
	}

	// new transient value
	unlikely_if (transients[step] == 0)
		interest |= 1 << 3; // 8

	// new period value
	unlikely_if (periods[period] == 0)
		interest |= 1 << 4; // 16

	// constant end state and slightly less than half of the states
	unlikely_if (type == CONST && 26 < POPCNT(s1.matx) && POPCNT(s1.matx) < 32) {
		unlikelyp_if (b32 != 0, 0.999) b32--;

		interest |= 1 << 5; // 32
	}

	// the start and end states total the whole board
	// this is only interesting if the final state isn't empty
	unlikelyp_if (type != EMPTY && (s0.matx | s1.matx) == ~0llu, 0.99999)
		interest |= 1 << 6; // 64

	// the two states are perfect inverses of each other.
	unlikelyp_if ((s0.matx ^ s1.matx) == ~0llu, 0.99999) {
		// way more interesting than 2, so remove that one if this one is true.
		interest &= ~2;
		interest |= 1 << 7; // 128
	}

	// more than one combined together is still interesting.
	// but if they are all out, and only one is there, it isn't interesting anymore.
	likelyp_if (!interest || !b4 && interest == 4 || !b32 && interest == 32, 0.999999)
		return;

	// the zero initialization is required so the program doesn't crash in profiling mode.
	struct _timespec64 ts = {0};

#ifdef PROFILING
	// the same length as the call, just so profiling will still work.
	asm volatile ( // 13 byte NOP
		".fill 12, 1, 0x66\n\t" // o16 prefix, with 11 more redundant copies.
		".byte 0x90\n\t" // one byte nop
	);
#else
	// profiling is forced into using MSVCRT, which doesn't have `timespec_get`,
	// so I have to just get rid of that part.
	_timespec64_get(&ts, TIME_UTC);
#endif

	struct tm *tm = _localtime64(&ts.tv_sec);

	/**
	 * timestamp prints in big to small (DAY-HH:MM:SS.0MS)
	 * everything is left-padded with zeros.
	 * 
	 * states are only printed if i > 0.
	 * s: start state
	 * int: interestingness factor
	 * per: period (if interesting)
	 * trs: transient length (if interesting)
	 * n: number of things that were interesting (if greater than 1)
	 * trial: the current trial number.
	**/

	// this will just print `365-17:00:00.000` every time in profiling mode.
	printf("\n%03d-%02d:%02d:%02d.%03ld | 0x%016llx | %3u | ",
		tm->tm_yday + 1,      // DAY: 001-366
		tm->tm_hour,          // HH: 00-23
		tm->tm_min,           // MM
		tm->tm_sec,           // SS
		ts.tv_nsec / 1000000, // MS
		s0.matx, interest
	);

	// pick the alignment based on the length of the max value, up to 5 digits.
	unlikely_if (interest & (2 | 16))
		#if INT_LEN(PERIOD_LEN) == 1
			printf( "%u | ", period);
		#elif INT_LEN(PERIOD_LEN) == 2
			printf("%2u | ", period);
		#elif INT_LEN(PERIOD_LEN) == 3
			printf("%3u | ", period);
		#elif INT_LEN(PERIOD_LEN) == 4
			printf("%4u | ", period);
		#elif INT_LEN(PERIOD_LEN) == 5
			printf("%5u | ", period);
		#else // 6
			printf("%6u | ", period);
		#endif
	else
		#if INT_LEN(PERIOD_LEN) == 1
			printf(     "  | ");
		#elif INT_LEN(PERIOD_LEN) == 2
			printf(    "   | ");
		#elif INT_LEN(PERIOD_LEN) == 3
			printf(   "    | ");
		#elif INT_LEN(PERIOD_LEN) == 4
			printf(  "     | ");
		#elif INT_LEN(PERIOD_LEN) == 5
			printf( "      | ");
		#else // 6
			printf("       | ");
		#endif

	likelyp_if (interest & (1 | 8), 0.999)
		#if INT_LEN(TRANSIENT_LEN) == 1
			printf( "%u | ", step);
		#elif INT_LEN(TRANSIENT_LEN) == 2
			printf("%2u | ", step);
		#elif INT_LEN(TRANSIENT_LEN) == 3
			printf("%3u | ", step);
		#elif INT_LEN(TRANSIENT_LEN) == 4
			printf("%4u | ", step);
		#elif INT_LEN(TRANSIENT_LEN) == 5
			printf("%5u | ", step);
		#else // 6
			printf("%6u | ", step);
		#endif
	else
		#if INT_LEN(TRANSIENT_LEN) == 1
			printf(     "  | ");
		#elif INT_LEN(TRANSIENT_LEN) == 2
			printf(    "   | ");
		#elif INT_LEN(TRANSIENT_LEN) == 3
			printf(   "    | ");
		#elif INT_LEN(TRANSIENT_LEN) == 4
			printf(  "     | ");
		#elif INT_LEN(TRANSIENT_LEN) == 5
			printf( "      | ");
		#else // 6
			printf("       | ");
		#endif


	if (POPCNT(interest) > 1)
		printf("%u | ", POPCNT(interest));
	else
		printf( "  | ");

	// print the trial number last because it will mess up the columns otherwise.
	print_du64(counts[EMPTY] + counts[CONST] + counts[CYCLE]);
}

static void _run_once1(const Matx8 start_state) {
	u32 step, h, table_value, period;
	Matx8 state = start_state;

	Table_clear();

	for (step = 0;; step++) {
		h = Matx8_hash(state);
		table_value = Table_get(state, h);

		unlikelyp_if (table_value != TABLE_NO_VALUE, 0.92129) {
			// this happens after on average 34.83 iterations., or 2.87% of the time.

			// the state has already been seen.
			period = step - table_value;
			break;
		}

		unlikelyp_if (Table_add(state, step, h), 0.9999999) {
			eprintf("\nArena OOM: s=0x%016llx, step=%u", start_state.matx, step);
			return;
		}

		state = Matx8_next(state);
	}

	// make sure the indices are valid and won't segfault the program.
	u8 invalid = 0; // 2 bit value

	unlikelyp_if (period > PERIOD_MAX, 0.9999999)
		invalid |= 1;

	unlikelyp_if (step > TRANSIENT_MAX, 0.9999999)
		invalid |= 2;

	unlikelyp_if (invalid != 0, 0.9999999) {
		eprintf(
			"\ninvalid start state: out of bounds value, reason=\"%s\""
			": p=%03u, t=%03u, s=0x%016llx",
			invalid == 1 ? "p" : invalid == 2 ? "p+t"+2 : "p+t",
			period,
			step,
			start_state.matx
		);

		return;
	}

	sttyp_t type = state.matx == 0 ? EMPTY : period == 1 ? CONST : CYCLE;

	// update this one first so the logs work properly.
	++counts[type];

	likely_if (!quiet)
		log_if_interesting(start_state, state, type, step, period);

	// update the global data
	++transients[step];
	++periods[period];

#if DEBUG
	if (hashtable.arena_pos > max_collisions) {
		max_collisions = hashtable.arena_pos;
		max_collisions_state = start_state.matx;
	}
#endif
}

static FORCE_INLINE void _run_once0(void) {
	_run_once1(Matx8_random());
}

#define run_once(start_state...) \
	VA_IF(_run_once1(start_state), _run_once0(), start_state)

#define RUN_2() ({run_once(); run_once();})
#define RUN_8() ({RUN_2(); RUN_2(); RUN_2(); RUN_2();})

static FORCE_INLINE void run_forever(void) {
#if TIMER
	u64 last_reset = (u64) _time64(NULL);
start:
#endif
	bool update_pressed = false;

	while (true) {
	#if TIMER
		// only check the timer like every 64 to 515 seconds or so,
		// depending on how fast your computer is.
		for (u16 j = 0; j < INT16_MAX; j++) {
	#endif
			// only check key states every 8160 trials.
			// sometimes if you just tap the stop or update button, it will miss it.
			// pressing and holding for a slightest amount of time fixes it.
			for (u8 i = 0; i < UINT8_MAX; i++) {
				// run 32 trials. 32 copies of the `call run_once` instruction.
				RUN_8(); RUN_8();
				RUN_8(); RUN_8();
			}

			// if you are pressing both keys, print the trial first and then exit.
			unlikelyp_if (GetAsyncKeyState(update_key) & 0x8000, 0.999999) {
				if (!update_pressed && likely(!silent)) {
					putchar(quiet ? '\r' : '\n');
					printf("trial: ");
					print_du64(counts[EMPTY] + counts[CONST] + counts[CYCLE]);
				}

				update_pressed = true;
			} else
				update_pressed = false;

			unlikelyp_if (GetAsyncKeyState(stop_key) & 0x8000, 0.9999)
				return;
	#if TIMER
		} // for, j

		if (!usefile)
			// only do the timer in the first place for file output.
			continue;

		const u64 now = (u64) _time64(NULL);

		// 24 hours by default
		if (now > last_reset + TIMER_PERIOD) {
			last_reset = now;
			give_summary(true); // returning version of the function. never uses the clipboard
			Table_clear();

			counts[EMPTY] = 0;
			counts[CONST] = 0;
			counts[CYCLE] = 0;

			_Static_assert(PERIOD_LEN < TRANSIENT_LEN, "PERIOD_LEN < TRANSIENT_LEN");

			for (u32 pos = 0; pos < PERIOD_LEN; pos += 4) {
				periods[pos | 0] = 0;
				periods[pos | 1] = 0;
				periods[pos | 2] = 0;
				periods[pos | 3] = 0;
			}

			for (u32 pos = 0; pos < TRANSIENT_LEN; pos += 4) {
				transients[pos | 0] = 0;
				transients[pos | 1] = 0;
				transients[pos | 2] = 0;
				transients[pos | 3] = 0;
			}

			enputs("More than " TOSTRING_EXPANDED(TIMER_PERIOD)
				" seconds have passed since timer last check. restarting.");

			if (unlikely(usebell) && likely(!silent))
				putchar('\x07'); // bell

			goto start;
		}
	#endif
	} // while
}
