// compile with `make -B DEBUG=true CLIP=true TIMER=true NEIGHBORHOOD=MOORE RULESET=B3/S23 OPTIMIZE=avx2`
// requires an MSVCRT version of GCC, despite not actually linking to MSVCRT.

// TODO: maybe allow coalescing flags together? like -abqTfSd <a> <T> <S> <d>

///////////////////////////////// config start ////////////////////////////////

#ifndef ALIVE_CHAR_DEF
	#define ALIVE_CHAR_DEF	'#' // character to print for alive cells
#endif
#ifndef DEAD_CHAR_DEF
	#define DEAD_CHAR_DEF	' ' // character to print for  dead cells
#endif

// period after which `nrun inf` logs the summary and resets.
// granularity lower than like 250 likely won't do anything.
// the timer is only checked every 267,378,720 trials. (INT16_MAX * UINT8_MAX * 4 * 8)
// 43200 == 12*60*60. this definition has to be the final expression result.
#ifndef TIMER_PERIOD
	#define TIMER_PERIOD	43200 // seconds
#endif

// NOTE: these values and comments are for NEIGHBORHOOD=MOORE and RULESET=B3/S23
//       other ones may need way more memory for stuff like the transients
//       for example, VON_NEUMANN with B23/S23 needs TRANSIENT_LEN >= 2048

// use 8 for hyperthreading. 9  the fastest on a single core.
// unless your L1 cache is 64KiB, in which case 9 or maybe even 10 is probably better.
// this has to be at least 2, or the program will not work.
#ifndef TABLE_BITS
	#define TABLE_BITS		9
#endif

// 512 makes them one page of memory.
// these have to be at least 133 and 424 respectively.
#ifndef PERIOD_LEN
	#define PERIOD_LEN		136
#endif
#ifndef TRANSIENT_LEN
	#define TRANSIENT_LEN	448
#endif

// max number of collisions per trial before errors.
// this has to be at least 143 with TABLE_BITS=9 and FAST_HASHING=true
#ifndef ARENA_LEN
	#define ARENA_LEN		256
#endif

#ifndef PY_BASE
	// base name of the python file
	#define PY_BASE "analyze"
#endif

#ifndef DATAFILE
	#define DATAFILE "data.json"
#endif

////////////////////////////////// config end /////////////////////////////////

#ifdef _MSC_VER
	// I don't care if you are using clang-cl or something. that counts in my eyes.
	#error Silly Microsoft sheep. Visual Studio will not work here. Use a real C compiler.
#endif

#ifndef _WIN64
	// NOTE: windows is always little endian, so I don't have to check that as well.
	#error This program will only compile on 64-bit windows
#endif

#ifndef __MINGW64__
	#error This program will only compile properly with a MinGW compiler.
#endif

#ifndef __GNUC__
	#error "This program only works with compilers that allow GNU extensions."
#endif

#ifndef CLIPBOARD
	// true  => include the -c flag
	// false => no -c flag (less DLL imports)
	#define CLIPBOARD false
#endif

#ifndef TIMER
	// true  => include the nrun periodic data file update and program state reset.
	// false => don't
	#define TIMER false
#endif

#ifndef FAST_HASHING
	// true  => multiplication hashing
	// false => reduced, keyless, and weakened version of SipHash-1-3
	// either way, the hash function isn't cryptographic
	#define FAST_HASHING true
#endif

#ifndef HELP
	// true => include help text in the binary.
	// false => don't include help text. significantly reduces the binary size.
	#define HELP true
#endif

#ifndef DEBUG
	// true => print extra collision data when the program exits.
	// false => don't.
	#define DEBUG false
#endif

#define     ARENA_MAX (-1 +     ARENA_LEN)
#define    PERIOD_MAX (-1 +    PERIOD_LEN)
#define TRANSIENT_MAX (-1 + TRANSIENT_LEN)

#ifndef PROFILING
	// NOTE: the profiling mode is strange, because it automatically
	//       links with msvcrt, and if you pass `-nostdlib -ffreestanding`,
	//       then it just says it can't find any of the functions it needs,
	//       even if you do `-Wl,-lucrtbase` or something.

	// undefine the references to the __mingw_* nonsense
	// and add prototypes for functions specific to UCRT
	#define _UCRT

	// this has to be before the includes. The headers don't actually
	// prototype _crt_at_quick_exit, so I have to make it prototype it.
	#define atexit		_crt_at_quick_exit
	#define exit		quick_exit
	#define strtoull	_strtoui64 // these are the same underlying function anyway

	// this shouldn't do anything since _UCRT is defined,
	// but I really don't want it to use the __mingw functions.
	#define __USE_MINGW_ANSI_STDIO 0
#endif

#define ememcpy(dst, src, len) (__builtin_memcpy(dst, src, len) + len /* point to the end */)
#define streq(x, y) (__builtin_strcmp(x, y) == 0)
#define POPCNT(x) __builtin_stdc_count_ones(x)
#define TOSTRING(x) #x
#define TOSTRING_EXPANDED(x) TOSTRING(x)
#define INT_LEN(x) (      \
	(x) <      10 ? 1 :   \
	(x) <     100 ? 2 :   \
	(x) <   1'000 ? 3 :   \
	(x) <  10'000 ? 4 :   \
	(x) < 100'000 ? 5 : 6 \
)

// static branch prediction hinting is still used to build prof.exe.
// NOTE: these default branch probability is 90%

#define likely(x) __builtin_expect(!!(x), 1)
#define likelyp(x, p) __builtin_expect_with_probability(!!(x), 1, p)

#define unlikely(x) __builtin_expect(!!(x), 1)
#define unlikelyp(x, p) __builtin_expect_with_probability(!!(x), 0, p)

#define likely_if(x)       if (likely(x))
#define unlikely_if(x)     if (unlikely(x))
#define likelyp_if(x, p)   if (likelyp(x, p))
#define unlikelyp_if(x, p) if (unlikelyp(x, p))

// p is the chance that it stays in the loop
#define likely_while(x)       while (likely(x))
#define unlikely_while(x)     while (unlikely(x))
#define likelyp_while(x, p)   while (likelyp(x, p))
#define unlikelyp_while(x, p) while (unlikelyp(x, p))

#define until(x) while (!(x))

// p is the chance that it exits
#define likely_until(x)       while (likely(!(x)))
#define unlikely_until(x)     while (unlikely(!(x)))
#define likelyp_until(x, p)   while (likelyp(!(x), p))
#define unlikelyp_until(x, p) while (unlikelyp(!(x), p))

// NOTE: little endian integers are stored backwards.
#define CHARS1_TO_U08(c0) ((u8) c0)
#define CHARS2_TO_U16(c0, c1) ((u16)c1 << 8 | (u16)c0)
#define CHARS4_TO_U32(c0, c1, c2, c3) ((u32)c3 << 24 | (u32)c2 << 16 | (u32)c1 << 8 | (u32)c0)
#define CHARS8_TO_U64(c0, c1, c2, c3, c4, c5, c6, c7) \
	((u64)CHARS4_TO_U32(c4, c5, c6, c7) << 32 | (u64)CHARS4_TO_U32(c0, c1, c2, c3))

#include <string.h> // strcmp, sprintf, memcpy
#include <time.h>   // _localtime64, _timespec64_get, struct _timespec64, struct tm
#include <sys/stat.h> // S_IWRITE
#include <sys/locking.h> // LK_NBLCK
#include "error-print.h" // stdlib.h, stdio.h, fcntl.h (io.h (_open, _write, ...), O_CREAT, ...)
#include "windows.h"
#include "matx8-table.h"
#include "matx8-next.h" // Matx8_next

__attribute__((optimize("unroll-loops")))
static FORCE_INLINE void print_table_headers(void) {
#if INT_LEN(PERIOD_LEN) == 3 && INT_LEN(TRANSIENT_LEN) == 3
	printf(
		"timestamp        | start state        | int | per | trs | n | trial\n"
		"--------------------------------------------------------------------"
	);
#else
	printf(
		"timestamp        | start state        | int | %*s | %*s | n | trial\n"
		"--------------------------------------------------------------------",
		INT_LEN(PERIOD_LEN), "per", INT_LEN(TRANSIENT_LEN), "trs"
	);

	for (u8 i = 0; i < max(INT_LEN(PERIOD_LEN), 3) + max(INT_LEN(TRANSIENT_LEN), 3) - 6; i++)
		putchar('-');
#endif
}

typedef enum <% EMPTY, CONST, CYCLE %> sttyp_t; // state type

// hashtable and total_collisions are defined in matx8-table.h now.

// static HashTable hashtable        = {0};
static u64 counts[3]                 = {0}; // EMPTY, CONST, CYCLE
static u64 periods[PERIOD_LEN]       = {0};
static u64 transients[TRANSIENT_LEN] = {0};

#if DEBUG
static u64 max_collisions_state = 0; // the state with the most hash collisions
static u32 max_collisions       = 0; // max collisions in a single trial
// static u64 total_collisions  = 0; // total collisions across all trials
#endif

#if CLIPBOARD
static bool copy       = false;
#endif

static bool usefile    = false;
static bool silent     = false;
static u8 stop_key     = VK_F1;
static u8 update_key   = VK_INSERT;
static char alive_char = ALIVE_CHAR_DEF;
static char dead_char  =  DEAD_CHAR_DEF;

static u32 sleep_ms[2] = {
	1500, // sleep time in between each trial in the sim commands
	90    // sleep time in between each state in the sim commands
};

#if HELP
static const char *const help_string =
	"usage: life [FLAGS] COMMAND [OPERANDS]"
	"\n"
	"\nbuild config:"
	"\n    NEIGHBORHOOD="
	#if NEIGHBORHOOD == NH_MOORE
		"MOORE"
	#elif NEIGHBORHOOD == NH_VON_NEUMANN
		"VON_NEUMANN"
	#elif NEIGHBORHOOD == NH_DIAGONAL
		"DIAGONAL"
	#endif
	#ifdef PY_VERSION
	"\n    PY_VERSION=\""	PY_VERSION "\""
	#endif
	#ifdef OPTIMIZE // the profiling version doesn't always have this
	"\n    OPTIMIZE=\""		OPTIMIZE "\""
	#endif
	"\n    RULESET=\""		RULESET "\""
	"\n    TABLE_BITS="		TOSTRING_EXPANDED(TABLE_BITS)
	"\n    PERIOD_LEN="		TOSTRING_EXPANDED(PERIOD_LEN)
	"\n    TRANSIENT_LEN="	TOSTRING_EXPANDED(TRANSIENT_LEN)
	"\n    ARENA_LEN="		TOSTRING_EXPANDED(ARENA_LEN)
	"\n    TIMER="			TOSTRING_EXPANDED(TIMER)
	"\n    CLIPBOARD="		TOSTRING_EXPANDED(CLIPBOARD)
	"\n    FAST_HASHING="	TOSTRING_EXPANDED(FAST_HASHING)
	"\n    DEBUG="			TOSTRING_EXPANDED(DEBUG)
	"\n"
	"\nflags:"
#if CLIPBOARD
	"\n    -c   in run modes, copy the summary to the clipboard as well as printing."
#endif
	"\n    -f   in run modes, concatenate the summary data together into " DATAFILE "."
	"\n    -q   quiet mode. suppresses output beyond what is necessary."
	"\n    -s   specify a key code to stop in `nrun inf` `nsim inf`, and `sim1`."
	"\n    -u   specify a key code to update the user in `nrun inf`."
	"\n    -T   specify a wait in ms between trials in sim modes. default=1500."
	"\n    -S   specify a wait in ms between states in sim modes. default=90."
	"\n    -a   specify a character to print for dead cells in sim modes."
	"\n    -d   specify a character to print for alive cells in sim modes."
	"\n    -b   print a bell character when the program exits."
	"\n    -H   use REALTIME process priority in admin mode, or HIGH in user mode."
	"\n    -h, -?, -help, and --help are the same as the `help` command."
	"\n    flags must be given one at a time, e.g. no `-fHq` or anything."
	"\n"
	"\ncommands:"
	"\n    help           print this message and exit"
	"\n    run,nrun       runs simulations and gives in-depth statistics"
	"\n    sim,sim1,nsim  runs simulations visually without statistics"
	"\n    step           step to the next state and print out the result"
	"\n                   takes an optional second operand for the number of steps"
	"\n"
	"\n    dump           runs `./" PY_BASE ".py -s " DATAFILE "` and exit"
	"\n    fold           runs `./" PY_BASE ".py -f " DATAFILE "` and exit"
	"\n    cnt            counts the number of objects in " DATAFILE
	"\n    merg A B       runs `./" PY_BASE ".py -m A B` and exit"
	"\n"
	"\n    nrun and nsim take one argument with the number of trials to run."
	"\n      'inf' can be given to make it run indefinitely."
	"\n    run and sim take a list of integers for the starting states."
	"\n    sim1 takes a single integer for the starting state."
	"\n    all modes other than sim1 stop trials at the first repeated state."
	"\n"
	"\nexit codes:"
	"\n    1  [unused]"
	"\n    2  [unused]"
	"\n    3  could not perform an operation on the datafile for an unknown reason"
	"\n    4  command given with invalid arguments or the wrong amount of arguments"
	"\n    5  flag given with invalid arguments or the wrong amount of arguments"
	"\n    6  an unknown command was given"
	"\n    7  an unknown flag was given"
	"\n"
	"\nstate interest bit meanings:"
	"\n    7  end state is not empty and is a perfect inverse of the start state"
	"\n    6  end state is not empty. start and end states together total the board"
	"\n    5  constant end state with a number of alive bits in (26, 32)"
	"\n    4  new period value"
	"\n    3  new transient value"
	"\n    2  period > 36 and transient - period > 196"
	"\n    1  2nd or 3rd encounter of a particular period"
	"\n    0  2nd or 3rd encounter of a particular transient length";
#else // HELP
static const char *const help_string = "help text was not included in this build";
#endif

#include "du64.h"
#include "summary.h"
#include "sim.h"
#include "run.h"

static void show_cursor(void) { printf("\e[?25h"); }
static void bell(void) { putchar('\x07'); }

#if DEBUG
static void log_collisions(void) {
	if (silent || total_collisions == 0)
		return;

	printf("hash collisions: total="); print_du64(total_collisions, '_');
	printf(", trial max=%u, s=0x%016llx\n", max_collisions, max_collisions_state);
}
#endif

static FORCE_INLINE void parse_flags(u32 *const restrict pargc, char **restrict *const restrict pargv) {
	// assumes neither argument is null. if you pass null, then you are stupid.

	// modifies the arguments and also modifies global state.
	// NOTE: this uses goto, but the label is always to an exit routine
	//       and it never jumps backwards in the code.

	u32 argc    = *pargc;
	char **argv = *pargv;
	char *flag, *operand;
	char c0; // flag character 0

	while (argc > 0 && **argv == '-') {
		flag = *argv + 1; // first argument, but skip the dash.
		argc--; argv++;

		// these are the only two flags that can be more than one character
		if (streq(flag, "-help") || streq(flag, "-help" + 1))
			goto help_flag;

		c0 = flag[0];
		if (c0 != '\0' && flag[1] != '\0')
			goto flag_unknown;

		// NOTE: if you do something like `-T -q`, then the `-q` will be the
		//       operand to `-T`, and that will be an error because it isn't
		//       a valid value, and not because it looks like a flag.
		operand = argc > 0 ? *argv : NULL;

		switch (c0) {
		case 'b': atexit(&bell);  break;
		case 'q': silent  = true; break;
		case 'f': usefile = true; break;
		#if CLIPBOARD
		case 'c': copy    = true; break;
		#endif
		case 'T': FALLTHROUGH;
		case 'S': {
			if (operand == NULL)
				goto flag_no_operand;

			u32 *const pvar = sleep_ms + (c0 == 'S');

			char *arg_end;
			const u64 tmp = strtoull(operand, &arg_end, 0);

			if (*arg_end != '\0')
				goto flag_invalid_operand;

			*pvar = tmp;
			argc--; argv++;
			break;
		}
		case 's': FALLTHROUGH;
		case 'u': {
			if (operand == NULL)
				goto flag_no_operand;

			u8 *const pkey = c0 == 's' ? &stop_key : &update_key;

			// allow strings for the ones I plan on using. (f1 - f9)
			// fA, fB, and fC instead of f10, f11, and f12
			likely_if (operand[0] == 'f' && operand[1] && !operand[2]) {
				switch (operand[1]) {
				case '1': *pkey = VK_F1; break;
				case '2': *pkey = VK_F2; break;
				case '3': *pkey = VK_F3; break;
				case '4': *pkey = VK_F4; break;
				case '5': *pkey = VK_F5; break;
				case '6': *pkey = VK_F6; break;
				case '7': *pkey = VK_F7; break;
				case '8': *pkey = VK_F8; break;
				case '9': *pkey = VK_F9; break;
				// NOTE: there are 7 characters between '9' and 'A'. With that
				//       distance, the compiler's discretion is probably better
				//       than mine on if an if-else chain or a jump table is better.
				case 'A': *pkey = VK_F10; break;
				case 'B': *pkey = VK_F11; break;
				case 'C': *pkey = VK_F12; break;
				default : goto flag_invalid_operand; // print a message and exit.
				}
			}
			else {
				// argument is not a function key
				char *arg_end;
				const u64 vkey = strtoull(operand, &arg_end, 0);

				if (*arg_end != '\0' || vkey > UINT8_MAX)
					goto flag_invalid_operand;

				*pkey = vkey;
			}

			argc--; argv++;
			break;
		}
		case 'a':
		case 'd': {
			char *const pchar = **argv == 'a' ? &alive_char : &dead_char;

			if (operand == NULL)
				goto flag_no_operand;

			if (*operand == '\0')
				goto flag_invalid_operand;

			// NOTE: characters after the first are ignored.
			*pchar = *operand;
			argc--; argv++;
			break;
		}
		case 'H':
			// REALTIME priority requires administrator permissions.
			// HIGH priority doesn't, so it always succeeds.
			// Windows falls back to HIGH if it can't do REALTIME.
			SetPriorityClass(GetCurrentProcess(), REALTIME_PRIORITY_CLASS);
			break;
		case 'h': FALLTHROUGH;
		case '?':
			goto help_flag;
		default:
			goto flag_unknown;
		} // switch
	} // while

	*pargc = argc;
	*pargv = argv;
	return;
help_flag:
	puts(help_string);
	exit(0);
flag_no_operand:
	eprintf("flag `-%s` given without an argument.\n", flag);
	exit(5);
flag_invalid_operand:
	eprintf("flag `-%s` given with an invalid value `%s`\n", flag, operand);
	exit(5);
flag_unknown:
#if HELP
	eprintf("unknown flag `-%s`. use command `help` for options.\n", flag);
#else
	eprintf("unknown flag `-%s`.\n", flag);
#endif

	exit(7);
}

void init_crt(void);

#ifdef PROFILING
int main(void)
#else
// profiling for the main function is discarded because I couldn't get it to work.
void mainCRTStartup(void)
#endif
{
	// I don't care that `int` is actually i32.
	// nobody is ever passing enough arguments that it matters.
	u32 argc;
	char **argv;

	asm volatile (
		"call init_args\n\t"
		"mov %0, edi\n\t"
		"mov %1, rsi"
		: "=r"(argc), "=r"(argv)
		: // no outputs
		: "rax", "rcx", "rdx", "r8", "r9", "rdi", "rsi", "memory"
	);

	if (_isatty(1)) {
		printf("\e[0m\e[?25l"); // remove terminal styling if there is any and hide the cursor.
		atexit(&show_cursor);
	}
#if DEBUG
	atexit(&log_collisions);
#endif

	argc--; argv++; // the file name is not needed.
	parse_flags(&argc, &argv);

	if (argc == 0) {
		// no arguments given. just print the help text.
		puts(help_string);
		exit(0);
	}


	// NOTE: all the commands are at least 3 characters long, so if any of the
	//       first 3 characters are null, then it is definitely not a known commands
	unlikely_if (!argv[0][0] || !argv[0][1] || !argv[0][2])
		goto unknown_command;

	// the string is longer than 4 characters, so it is definitely unknown
	unlikely_if (argv[0][3] && argv[0][4])
		goto unknown_command;

	u64 n; // for nrun and nsim

	// parse the first argument as a 32-bit unsigned integer.
	// these branches aren't worth putting in helper functions because they are tiny.
	// NOTE: this is safe because the string is at least 3 characters long,
	//       so it takes up at least 4 bytes including the null terminator.
	switch (*(u32 *) *argv) {
	case CHARS4_TO_U32('n', 'r', 'u', 'n'):
		if (!silent)
			print_table_headers();

		if (argc == 0)
			__builtin_unreachable();

		likely_if (argc == 2) {
			likely_if (streq(argv[1], "inf")) {
				run_forever();
				give_summary(false);
				__builtin_unreachable();
			}
			else
				n = strtoull(argv[1], NULL, 0);
		}
		else if (argc == 1)
			n = 1;
		else {
			eprintf("command `%s` expected %s operands, found %u.\n", "nrun", "0 or 1", argc - 1);
			exit(4);
		}

		for (u8 i = 0; i < (n & 7); i++)
			run_once();

		for (u32 i = n >> 3; i --> 0 ;)
			RUN_8();

		give_summary(false);
		__builtin_unreachable();
	case CHARS4_TO_U32('r', 'u', 'n',  0 ):
		if (!silent)
			print_table_headers();

		if (argc == 0)
			__builtin_unreachable();
		
		if (argc == 1)
			run_once();
		else
			// run once for each state given
			for (u32 i = 1; i < argc; i++) {
				char *str_end;
				Matx8 state = (Matx8) {.matx = strtoull(argv[i], &str_end, 0)};

				if (*str_end != '\0') {
					putchar('\n');
					eprintf("command `%s` given with an invalid value at position %u.\n", "run", i);
					exit(4);
				}

				run_once(state);
			}

		give_summary(false);
		__builtin_unreachable();
	case CHARS4_TO_U32('s', 'i', 'm',  0 ):
		if (argc < 1)
			__builtin_unreachable();

		unlikely_if (argc == 1) {
			cli_sim(1);
		#if DEBUG
			if (!silent)
				putchar('\n');
		#endif
			exit(0);
		}

		// run once for each state given
		for (u32 i = 1; i < argc; i++) {
			char *str_end;
			Matx8 state = (Matx8) {.matx = strtoull(argv[i], &str_end, 0)};

			if (*str_end != '\0') {
				eprintf("command `%s` given with an invalid value at position %u.\n", "sim", i);
				exit(4);
			}

			cli_sim((u64) i, state);

			unlikely_if (i != argc - 1)
				// don't sleep after the last iteration
				Sleep(sleep_ms[0]);
		}

		#if DEBUG
		if (!silent)
			putchar('\n');
		#endif
		break;
	case CHARS4_TO_U32('s', 'i', 'm', '1'): {
		if (argc == 0)
			__builtin_unreachable();

		if (argc == 1) {
			cli_sim_one();
			exit(0);
		}

		unlikely_if (argc > 2) {
			eprintf("command `%s` expected %s operands, found %u.\n", "sim1", "0 or 1", argc - 1);
			exit(4);
		}

		// argc == 2

		char *str_end;
		Matx8 state = (Matx8) {.matx = strtoull(argv[1], &str_end, 0)};

		if (*str_end != '\0') {
			eprintf("command `%s` given with an invalid value at position %u.\n", "sim1", 1);
			exit(4);
		}

		cli_sim_one(state);
		break;
	}
	case CHARS4_TO_U32('n', 's', 'i', 'm'):
		if (argc == 0)
			__builtin_unreachable();

		likely_if (argc == 2) {
			// life [FLAGS] nsim ARG
			likely_if (streq(argv[1], "inf")) {
				u64 trial = 0;

				while (true) {
					if (trial)
						Sleep(sleep_ms[0]);

					cli_sim(++trial);
				}

				__builtin_unreachable();
			}

			n = strtoull(argv[1], NULL, 0);
		}
		else if (argc == 1)
			n = 1; // default to one trial.
		else {
			eprintf("command `%s` expected %s operands, found %u.\n", "nsim", "0 or 1", argc - 1);
			exit(4);
		}

		unlikely_if (n == 0)
			exit(0);

		for (u32 i = 1; i < n; i++) {
			cli_sim(i);
			Sleep(sleep_ms[0]);
		}

		// do the last simulation without a sleep after it.
		cli_sim(n);

		#if DEBUG
		if (!silent)
			putchar('\n');
		#endif
		break;
	case CHARS4_TO_U32('s', 't', 'e', 'p'): {
		if (argc == 0)
			__builtin_unreachable();

		unlikely_if (argc < 2 && argc > 3) {
			eprintf("command `%s` expected %s operands, found %u.\n", "step", "1 or 2", argc - 1);
			exit(4);
		}

		char *str_end;

		Matx8 state = (Matx8) {.matx = strtoull(argv[1], &str_end, 0)};

		if (*str_end != '\0') {
			eprintf("command `%s` given with an invalid value at position %u.\n", "step", 1);
			exit(4);
		}

		if (argc == 2)
			n = 1;
		else {
			n = strtoull(argv[2], &str_end, 0);

			if (*str_end != '\0') {
				eprintf("command `%s` given with an invalid value at position %u.\n", "step", 2);
				exit(4);
			}
		}

		while (n --> 0)
			state = Matx8_next(state);

		printf("0x%016llx\n", state.matx);
		print_state(state);
		putchar('\n');
		break;
	}
	case CHARS4_TO_U32('d', 'u', 'm', 'p'):
		exit(system(PY_BASE " -s " DATAFILE));
		__builtin_unreachable();
	case CHARS4_TO_U32('f', 'o', 'l', 'd'):
		exit(system(PY_BASE " -f " DATAFILE));
		__builtin_unreachable();
	case CHARS4_TO_U32('m', 'e', 'r', 'g'): {
		if (argc == 0)
			__builtin_unreachable();

		if (argc != 3) {
			eprintf("command `%s` expected %s operands, found %u.\n", "merg", "2", argc - 1);
			exit(4);
		}

		// I don't want a DLL import for strnlen just for this.
		// limit paths to 255 characters.
		for (u8 i, j = 1; j < 3; j++) {
			for (i = 0; i < UINT8_MAX && argv[j][i] != '\0'; i++);

			if (i == UINT8_MAX) {
				eprintf("command `%s` given with an invalid value at position %u.\n", "merg", i);
				exit(4);
			}
		}

		// allocate on the stack instead of using `malloc`.
		// also round up to the next multiple of 16, because I decided.
		char command[(__builtin_strlen(PY_BASE " -m ") + UINT8_MAX + 1/*space*/ + UINT8_MAX + 1/*null*/ + 15) & ~15];

		sprintf(command, PY_BASE " -m %s %s", argv[1], argv[2]);

		exit(system(command));
		__builtin_unreachable();
	}
	case CHARS4_TO_U32('c', 'n', 't',  0 ): {
		const u32 fd = _open(DATAFILE, O_RDONLY | O_BINARY);
		if (fd == ~0u) {
			i32 error; _get_errno(&error);
			eprintf("can't %s %s: errno=%u.\n", "read", DATAFILE, error);
			exit(3);
		}

		if (_locking(fd, LK_NBLCK, INT32_MAX) != 0) {
			// only try once because I don't feel like looping.
			i32 error; _get_errno(&error);
			eprintf("can't %s %s: errno=%u.\n", "lock", DATAFILE, error);
			exit(3);
		}

		u32 objects = 0;
		u8 tmp_len = 0;
		i32 len;
		char *const restrict buf = hashtable.scratch;

		// NOTE: it doesn't make sense for a file to end with "\n{\n\t".
		//       without at least like 20 or so extra characters.
		_Static_assert(SCRATCH_SIZE > 15, "SCRATCH_SIZE should be at least like 16.");

		while ((len = _read(fd, buf, SCRATCH_SIZE)) > 8) {
			i32 i = 0;

			switch (tmp_len) {
			default: __builtin_unreachable();
			case 0: break;
			case 1:
				if (*(u16 *)buf == CHARS2_TO_U16('{', '\n') && buf[2] == '\t') {
					objects++;
					i = 3;
				}
				else
					i = 1; // start at the second newline
				break;
			case 2:
				objects += *(u16 *)buf == CHARS2_TO_U16('\n', '\t');
				i = 2;
				break;
			case 3:
				objects += *buf == '\t';
				i = 1;
				break;
			}

			for (; i <= len - 4; i++)
				objects += *(u32 *)(hashtable.scratch + i) ==
							CHARS4_TO_U32('\n', '{', '\n', '\t');

			if (*(u16 *)(buf + len - 3) == CHARS2_TO_U16('\n', '{') &&
				hashtable.scratch[len - 1] == '\n')
				tmp_len = 3;
			else if (*(u16 *)(buf + len - 2) == CHARS2_TO_U16('\n', '{'))
				tmp_len = 2;
			else if (buf[len - 1] == '\n')
				tmp_len = 1;
			else
				tmp_len = 0;
		}

		if (len == -1) {
			i32 error; _get_errno(&error);
			eprintf("can't %s %s: errno=%u.\n", "read", DATAFILE, error);
			exit(3);
		}

		printf("found %u objects\n", objects);
		break;
	}
	case CHARS4_TO_U32('h', 'e', 'l', 'p'):
		puts(help_string);
		break;
	default:
		goto unknown_command;
	}

	exit(0);
unknown_command:
#if HELP
	eprintf("unknown command `%s`. use `help` for help.\n", *argv);
#else
	eprintf("unknown command `%s`.\n", *argv);
#endif
	exit(6);
}
