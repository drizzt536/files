#pragma once
#define SUMMARY_H

static FORCE_INLINE u32 count_args(...) { return __builtin_va_arg_pack_len(); }

// this function doesn't actually exist
void comptime_error(void) __attribute__((error("")));

// versions of the char[] to uint conversions that ignore extra arguments.
#define CHARS1_TO_U08_VA(c0, ...)						CHARS1_TO_U08(c0)
#define CHARS2_TO_U16_VA(c0,c1, ...)					CHARS2_TO_U16(c0,c1)
#define CHARS4_TO_U32_VA(c0,c1,c2,c3, ...)				CHARS4_TO_U32(c0,c1,c2,c3)
#define CHARS8_TO_U64_VA(c0,c1,c2,c3,c4,c5,c6,c7, ...)	CHARS8_TO_U64(c0,c1,c2,c3,c4,c5,c6,c7)

// the character ones have variable arguments so the fuckass compiler can shut the fuck up.

// the one with two 'i's in it has ignored arguments.
// if you need more than 8 characters, probably switch to the string version.
#define _BUF_WRITE1c(buf, C...)		({*(u8  *)buf = CHARS1_TO_U08_VA(C); buf += 1;})
#define _BUF_WRITE2c(buf, C...)		({*(u16 *)buf = CHARS2_TO_U16_VA(C); buf += 2;})
#define _BUF_WRITE4c(buf, C...)		({*(u32 *)buf = CHARS4_TO_U32_VA(C); buf += 4;})
#define _BUF_WRITE8c(buf, C...)		({*(u64 *)buf = CHARS8_TO_U64_VA(C); buf += 8;})
#define _BUF_WRITE3c(buf, c0, C...)	({_BUF_WRITE1c(buf, c0); _BUF_WRITE2c(buf, C);})
#define _BUF_WRITE5c(buf, c0, C...)	({_BUF_WRITE1c(buf, c0); _BUF_WRITE4c(buf, C);})
#define _BUF_WRITE6c(buf, C...)		({_BUF_WRITE2c(buf, C ); _BUF_WRITEii4c(buf, C);})
#define _BUF_WRITE7c(buf, c0, C...)	({_BUF_WRITE1c(buf, c0); _BUF_WRITE6c(buf, C);})
#define _BUF_WRITEii4c(buf, _1, _2, C...) _BUF_WRITE4c(buf, C)

// NOTE: this can't have a `__builtin_constant_p` static assertion because it still
//       gets type checked even in branches that won't execute, and in those branches
//       the thing isn't always static, so the assertion would fail, breaking everything.
#define _BUF_WRITE1s(buf, str) ({buf = ememcpy(buf, str, __builtin_strlen(str));})
#define _BUF_WRITE1du64(buf, x) ({buf = ememcpy_du64(buf, x, ',');})

// it passes in a bunch of zeros after the real arguments so they meet the minimum arguments
// for all the branches, including the ones it doesn't take. The fuckass compiler still
// type checks all of the branches, even if only one of them will ever possibly run.
#define _BUF_WRITEvc(buf, C...) ({                               \
	_Static_assert(VA_IF(1, 0, C), "no arguments given.");       \
	count_args(C) == 1 ? _BUF_WRITE1c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 2 ? _BUF_WRITE2c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 3 ? _BUF_WRITE3c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 4 ? _BUF_WRITE4c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 5 ? _BUF_WRITE5c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 6 ? _BUF_WRITE6c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 7 ? _BUF_WRITE7c(buf, C, 0,0,0,0,0,0,0,0) : \
	count_args(C) == 8 ? _BUF_WRITE8c(buf, C, 0,0,0,0,0,0,0,0) : \
		comptime_error(); /* too many characters given. */       \
})

// NOTE: character literals are actually `int`, which is why that is there.
#define _BUF_WRITE1(buf, x) _Generic(x,       \
	u64  : _BUF_WRITE1du64(buf, (u64) x),     \
	int  : _BUF_WRITE1c(buf, (char) (u64) x), \
	char : _BUF_WRITE1c(buf, (char) (u64) x), \
	char*: _BUF_WRITE1s(buf, (char *) x)      \
)

#define _BUF_WRITEv1s(buf, fmt, args...) ({buf += sprintf(buf, fmt, args);})

// NOTE: if the first argument is int or char, then all of the arguments are int or char.
//       if the first argument is char *, then I have no idea what types the rest are.
//       this might break if some of the arguments are pointers. maybe you would have to
//       case the pointers to u64, since GCC doesn't like it when you cast pointers to integers
//       of different sizes.
#define _BUF_WRITE2plus(buf, x1, x...) _Generic(x1, \
	int  : _BUF_WRITEvc(buf, (char) (u64) x1, x),   \
	char : _BUF_WRITEvc(buf, (char) (u64) x1, x),   \
	char*: _BUF_WRITEv1s(buf, (char *) x1, x)       \
)

// writes to the buffer and updates the variable to point to the next write position.
#define BUF_WRITE(buf, x1, x2plus...) \
	VA_IF(_BUF_WRITE2plus(buf, x1, x2plus), _BUF_WRITE1(buf, x1), x2plus)

///////////////////////////////////////////////////////////////////////////////////////////////////

static char *sprintf_summary(char *buf) {
	// assumes the buffer is long enough. it has to be like 8KiB or something.

#if DEBUG
	BUF_WRITE(buf, "{\n\t\"hcollide\": {\"count\": %u, \"states\": [\"0x%016llx\"]},"
		"\n\t\"trials\": \"",
		max_collisions, max_collisions_state
	);
#else
	BUF_WRITE(buf, "{\n\t\"hcollide\": {\"count\": 0, \"states\": [\"0x0000000000000000\"]},"
		"\n\t\"trials\": \"");
#endif
	BUF_WRITE(buf, counts[EMPTY] + counts[CONST] + counts[CYCLE]);

	BUF_WRITE(buf, "\",\n\t\"counts\": {\"empty\": \""); BUF_WRITE(buf, counts[EMPTY]);
	BUF_WRITE(buf, "\", \"const\": \"");                 BUF_WRITE(buf, counts[CONST]);
	BUF_WRITE(buf, "\", \"cycle\": \"");                 BUF_WRITE(buf, counts[CYCLE]);

	BUF_WRITE(buf, "\"},\n\t\"periods\": {");
	// this stuff compiles to AVX512 instructions if they are available.
	{
		u32 max_period = 0;
		for (u32 i = PERIOD_MAX; i --> 0 ;)
			if (periods[i] != 0) {
				max_period = i;
				break;
			}

		for (u32 i = 0; i < PERIOD_MAX; i++) {
			unlikely_if (i == max_period) {
				BUF_WRITE(buf, "\"%u\": %llu", i, periods[i]);
				break;
			}

			if (periods[i] == 0)
				continue;

			BUF_WRITE(buf, "\"%u\": %llu", i, periods[i]);
			BUF_WRITE(buf, ',', ' ');
		}
	} // end bare block

	BUF_WRITE(buf, "},\n\t\"transients\": {");
	{
		u32 max_transient = 0;
		for (u32 i = TRANSIENT_MAX; i --> 0 ;)
			if (transients[i] != 0) {
				max_transient = i;
				break;
			}

		for (u32 i = 0; i < TRANSIENT_MAX; i++) {
			unlikely_if (i == max_transient) {
				BUF_WRITE(buf, "\"%u\": %llu", i, transients[i]);
				break;
			}

			if (transients[i] == 0)
				continue;

			BUF_WRITE(buf, "\"%u\": %llu", i, transients[i]);
			BUF_WRITE(buf, ',', ' ');
		}
	} // end bare block

	BUF_WRITE(buf, '}', '\n', '}', '\0');
	return buf - 1; // return a pointer to the null terminator byte.
}

static void give_summary(const bool returns) {
	char *const buf_stt = hashtable.scratch;
	char *buf_end = sprintf_summary(buf_stt);

	unlikely_if (silent)
		printf("\r\e[0K");
	else
		puts("\nSummary:");

	puts(buf_stt);

	// length not including the null byte.
	u64 len = buf_end - buf_stt;

#if CLIPBOARD
	if (copy && !returns) {
		// never copy to the clipboard if the function will be returning for a few reasons:
		// 1. I don't want to have to DLL import the mutex and clipboard closing functions
		// 2. it would be really bad UX if randomly every 12 hours your clipboard is overwritten
		//    regardless of what you're doing outside this program.

		// the mutex is cross-program. Since the Windows API is retarded, this is the only way to
		// achieve the goal that I need in a way that works remotely well..

		// here are the reasons the API for this sucks:
		// 1. OpenClipboard locks the clipboard to the window and not to the process. This means
		//    if you have two threads or even two separate processes that have the same window,
		//    OpenClipboard will just shrug its shoulders and let both processes have an unresolved
		//    data race. This matters in situations like with Windows Terminal, where if you have
		//    two processes in two separate tabs, or in two split panes, they have the same window.
		// 2. Creating a unique window and passing the window handle to OpenClipboard doesn't work
		//    either. While it is true that it will then lock the clipboard to each dummy window,
		//    Windows decides that once you call SetClipboardData, you are done with the clipboard,
		//    and it does not wait for you to call `CloseClipboard`, and it does not wait for the
		//    data to settle in the clipboard. So if you write something in one process, and then
		//    immediately write something else in a different process, the windows+v clipboard
		//    stack will only contain the newer item.
		// 3. When you call CloseClipboard, it doesn't actually wait for the clipboard to update to
		//    the new value before exiting, so when the second process gets the clipboard, Windows
		//    wasn't actually done with the previous data, so when you update the clipboard,
		//    Windows says "you know what? whoever gave me the first data: fuck you. im skipping
		//    your data." This is part of why I have to do Sleep even after WaitForSingleObject.
		// 4. There is no function to do anything along the lines of "wait until the clipboard is
		//    done". So you have to just wait for like 250ms or 500ms or something and hope that it
		//    was enough time. And this is also the reason you have to just poll until
		//    OpenClipboard returns true.
		// 5. You cannot just pass SetClipboardData a pointer and length for the memory you
		//    already have, and then it copies it into its internal buffer stuff, and moves on.
		//    No, you have to use GlobalAlloc to generate the internal memory for the kernel,
		//    because of course it can't just do it itself. And then you have to use GlobalLock
		//    to turn it into a real pointer, then memcpy into the buffer, then you have to call
		//    GlobalUnlock for god knows what reason. Then you give the handle to that stuff to
		//    SetClipboardData. I'm surprised that there isn't some internal Windows API
		//    GlobalMemoryCopy function, to where if you don't use that function to write to
		//    global allocated memory, your whole program crashes.

		void *const windows_fuckass_bullshit_global_memory_handle_nonsense = AllocateWindowsFuckassBullshitGlobalMemoryNonsense(GMEM_MOVEABLE, len + 1);
		memcpy(RealPointerFromWindowsFuckassBullshitGlobalMemoryNonsense(windows_fuckass_bullshit_global_memory_handle_nonsense), buf_stt, len + 1);
		SomeMoreWindowsFuckassBullshitGlobalMemoryNonsenseIDontEvenKnowWhatThisIsFor(windows_fuckass_bullshit_global_memory_handle_nonsense);

		void *mutex = CreateMutexA(NULL, false, "LifeClip");
		const bool newMutex = GetLastError() == ERROR_ALREADY_EXISTS;
		do {
			WaitForMutexUnlock(mutex, ~0u);
			// extra wait so previous clipboard values can settle to the real value.
			// or if the mutex is new, wait for 1ms so that the loop doesn't take a ton of
			// CPU time if another window has control of the clipboard.
			Sleep(newMutex ? 1 : 500);
		} until (OpenClipboard(NULL));

		// now for sure the window and the process has sole access to the clipboard
		SetClipboardData(CF_TEXT, windows_fuckass_bullshit_global_memory_handle_nonsense);

		// The OS does these anyway, so skip them and reduce the DLL requirements.
		// technically, releasing the mutex is different from abandoning it, but 
		// the other threads don't distinguish between them, so it doesn't matter.
		// CloseClipboard();
		// ReleaseMutex(mutex);
		// CloseHandle(mutex);
	#if DEBUG
		printf("summary written to %s.\n", "clipboard");
	#endif

		// the program exits basically right after this.
	}
#endif // CLIPBOARD

	if (usefile) {
		BUF_WRITE(buf_end, '\n', ']', '\n', '\0'); buf_end--;
		len += __builtin_strlen("\n]\n");

		const bool file_exists = _access_s(DATAFILE, F_OK) == 0;
		const i32 fd = _open(DATAFILE, O_CREAT | O_WRONLY | O_BINARY, S_IWRITE);

		// NOTE: technically different instances could race on the last byte of the file,
		//       but since none of them try to lock it, and none of them try to access it
		//       until the end of the file is locked, it doesn't matter.

		if (file_exists)
			_lseeki64(fd, -(i64) __builtin_strlen("\n]\n"), SEEK_END);

		while (_locking(fd, LK_NBLCK, INT32_MAX) != 0) {
			i32 error;
			_get_errno(&error);

			if (error != 13 /* EACCES */) {
				eprintf("can't %s %s: errno=%u.\n", "lock", DATAFILE, error);

				exit(3);
			}

			Sleep(200); // 5 tries per second
		}

		const char tmp[2] = {
			file_exists ? ',' : '[',
			'\n'
		};

		_write(fd, &tmp, 2); // either write ",\n" or "[\n"
		_write(fd, buf_stt, len); // write the object and the end bracket.

		// this happens automatically when _close is called, or when the program exits.
		// _locking(fd, _LK_UNLCK, INT32_MAX);

		if (returns)
			// the local jump is faster than the DLL syscall if the program doesn't need the call.
			_close(fd);
	#if DEBUG
		printf("summary written to %s.\n", DATAFILE);
	#endif
	}

	if (!returns)
		exit(0);
}
