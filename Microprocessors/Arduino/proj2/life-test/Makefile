# the following things are required:
	# basic linux tools: mv, rm, awk, stat, grep, tail
	# other linux tools: gcc (must be MSVCRT), make
	# binutils: ld, strip, objcopy, objdump
	# VC build tools: dumpbin, editbin
	# misc: 7z, nasm, python (>=3.12)

# it works for sure with MinGW devkit 2.5 (GCC 15.2, binutils 2.45)
# the MSYS2 version of GCC won't work because it is UCRT and not MSVCRT.

CFLAGS     := -std=gnu23 -masm=intel -I../../../../C/ -Iinclude -Werror -Wall -Wextra \
			-Wno-parentheses -Wno-missing-profile -DPY_BASE=\"analyze\"
COPTZ      := -Ofast -fdelete-dead-exceptions -ffinite-loops -fgcse-las -fgcse-sm \
			-fipa-pta -fira-loop-pressure -flive-range-shrinkage -frename-registers \
			-fshort-enums -ftree-loop-if-convert -ftree-vectorize -fvpt -fweb -fwrapv \
			-fno-exceptions -fno-unwind-tables -fno-asynchronous-unwind-tables -fno-ident
CPROF_OPTZ := -fprofile-partial-training -fbranch-probabilities -fipa-profile \
			-fprofile-reorder-functions
LDFLAGS    := -s -O --as-needed --gc-sections --relax --exclude-all-symbols \
			--no-export-dynamic --disable-long-section-names --no-seh \
			--nxcompat --dynamicbase --high-entropy-va \
			--fatal-warnings --warn-common --warn-constructors
LDLIBS     := -lcryptbase -lkernel32 -lshell32 -lucrtbase -luser32
CFILES     := life.c $(wildcard ./include/*.h) ../../../../C/error-print.h

# configuration stuff:

ifeq ($(OPTIMIZE),native)
	COPTZ += -march=native
else
	ifeq ($(OPTIMIZE),avx512)
		COPTZ += -march=x86-64-v4
	else
		ifeq ($(OPTIMIZE),avx2)
			COPTZ += -march=x86-64-v3
		else
			# default to a super old one
			COPTZ += -march=x86-64-v2
		endif
	endif
endif

ifdef ALIVE_CHAR_DEF
	CFLAGS += -DALIVE_CHAR_DEF=$(ALIVE_CHAR_DEF)
endif

ifdef DEAD_CHAR_DEF
	CFLAGS += -DDEAD_CHAR_DEF=$(DEAD_CHAR_DEF)
endif

ifdef TIMER_PERIOD
	CFLAGS += -DTIMER_PERIOD=$(TIMER_PERIOD)
endif

ifdef TABLE_BITS
	CFLAGS += -DTABLE_BITS=$(TABLE_BITS)
endif

ifdef PERIOD_LEN
	CFLAGS += -DPERIOD_LEN=$(PERIOD_LEN)
endif

ifdef TRANSIENT_LEN
	CFLAGS += -DTRANSIENT_LEN=$(TRANSIENT_LEN)
endif

ifdef ARENA_LEN
	CFLAGS += -DARENA_LEN=$(ARENA_LEN)
endif

ifdef CLIP
	CFLAGS += -DCLIPBOARD=$(CLIP)
endif

ifdef TIMER
	CFLAGS += -DTIMER=$(TIMER)
endif

ifdef FAST_HASHING
	CFLAGS += -DFAST_HASHING=$(FAST_HASHING)
endif

ifdef HELP
	CFLAGS += -DHELP=$(HELP)
endif

ifdef DEBUG
	CFLAGS += -DDEBUG=$(DEBUG)
endif

ifdef NEIGHBORHOOD
	CFLAGS += -DNEIGHBORHOOD=NH_$(NEIGHBORHOOD)
endif

ifdef RULESET
	CFLAGS += -DRULESET="\"$(RULESET)\""
	CFLAGS += -DNEXT_COND="$(shell python gen-next-cond.py '$(RULESET)')"
endif

all: requirements life.7z life.txt life-launch.txt

.PHONY: requirements req-7z req-nasm req-linux req-binutils req-gcc req-vcbtools req-python

requirements: req-7z req-nasm req-vcbtools req-python req-gcc

ifeq ($(REQUIRE),false)
req-7z:
req-nasm:
req-gcc:
req-linux:
req-binutils:
req-vcbtools:
req-python:
else
req-7z:
	@if ! command -v 7z > /dev/null; then echo "# program not found: \`7z\`"; exit 1; fi; \
	echo "# 7zip found"

req-nasm:
	@if ! command -v nasm > /dev/null; then echo "# program not found: \`nasm\`"; exit 1; fi; \
	echo "# nasm found"

req-python:
	@if ! command -v python > /dev/null; then \
		echo "# program not found: \`python\`"; \
		exit 1; \
	fi; \
	echo "# python found"

req-gcc: req-linux req-binutils
	@if ! command -v gcc > /dev/null; then echo "# program not found: \`gcc\`";  exit 1; fi; \
	if ! command -v grep > /dev/null; then echo "# program not found: \`grep\`"; exit 1; fi

	echo "void main() {}" | gcc -x c -Wl,-s,--gc-sections - -o tmp.exe
	@if ! grep -Fq msvcrt.dll tmp.exe; then     \
		echo "rm tmp.exe";                      \
		rm -f tmp.exe;                          \
		echo "# GCC must be an MSVCRT version"; \
		exit 2;                                 \
	fi
	rm -f tmp.exe
	@echo "# suitable version of GCC found"

req-linux:
	@# basic linux utilities \
	if ! command -v mv   > /dev/null; then echo "# program not found: \`mv\`";   exit 1; fi; \
	if ! command -v rm   > /dev/null; then echo "# program not found: \`rm\`";   exit 1; fi; \
	if ! command -v awk  > /dev/null; then echo "# program not found: \`awk\`";  exit 1; fi; \
	if ! command -v stat > /dev/null; then echo "# program not found: \`stat\`"; exit 1; fi; \
	echo "# linux utilities found"

req-binutils:
	@\
	if ! command -v ld      >/dev/null;then echo "# program not found: \`ld\`";      exit 1;fi; \
	if ! command -v strip   >/dev/null;then echo "# program not found: \`strip\`";   exit 1;fi; \
	if ! command -v objcopy >/dev/null;then echo "# program not found: \`objcopy\`"; exit 1;fi; \
	if ! command -v objdump >/dev/null;then echo "# program not found: \`objdump\`"; exit 1;fi; \
	echo "# binutils found"

req-vcbtools:
	@\
	if ! command -v editbin >/dev/null;then echo "# program not found: \`editbin\`"; exit 1;fi; \
	if ! command -v dumpbin >/dev/null;then echo "# program not found: \`dumpbin\`"; exit 1;fi; \
	echo "# VC Build Tools found"
endif

life.7z: life.exe life-launch.exe req-7z analyze.py req-linux
	7z a -t7z -mx=9 -bso0 -bsp0 $@ life.exe life-launch.exe analyze.py

	@zip=$$(stat -c %s life.7z);    \
	main=$$(stat -c %s life.exe);   \
	launch=$$(stat -c %s life.exe); \
	awk "BEGIN {print \"# 7zip reduction: \" 100 - $$zip*100 / ($$main + $$launch) \"%\"}"

init-crt.o: init-crt.nasm req-nasm req-binutils
	nasm -fwin64 $< -o $@
	strip -S $@

ifeq ($(PROFILE),false)
life.o: $(CFILES) req-gcc req-python
	@# can't use `-ffreestanding` for some reason
	gcc -c -nostdlib $(CFLAGS) -DPY_VERSION="\"$$(python --version | tail -c +8)\""  $(COPTZ) $< -o $@
else
prof.exe: init-crt.o $(CFILES) req-gcc
	gcc -fprofile-generate -DPROFILING $(CFLAGS) $(COPTZ) $< life.c -o $@

life.gcda: prof.exe req-linux
	./$< nrun 1000000 > /dev/null
	mv prof-life.gcda $@

life.o: $(CFILES) life.gcda req-gcc
	gcc -c -fprofile-use -nostdlib -ffreestanding $(CFLAGS) -DPY_VERSION="\"$$(python --version | tail -c +8)\"" $(COPTZ) $(CPROF_OPTZ) $< -o $@.tmp

	objcopy $@.tmp --remove-section .pdata --remove-section .xdata $@
	strip -S $@
endif

analyze.py: analysis.py req-linux req-python
	python -O -m compileall -b $< > /dev/null
	mv $<c $@
	@echo "# built $@ for $$(python --version)"

life.exe: init-crt.o life.o req-binutils req-vcbtools
	ld $(LDFLAGS) init-crt.o life.o $(LDLIBS) -o $@
ifneq ($(RESERVE),long)
	editbin -nologo -heap:32768,4096 -stack:32768,4096 $@
endif

life.txt: life.exe req-binutils req-vcbtools
	objdump -Mintel -D $< > $@
	echo "-----------------------------------" >> $@
	dumpbin -nologo -headers $< >> $@

# wrapper program so double clicking from explorer does something other than exit.

life-launch.o: life-launch.nasm req-nasm req-binutils
	nasm -fwin64 $< -o $@
	strip -S $@

life-launch.exe: life-launch.o req-binutils req-vcbtools
	ld $(LDFLAGS) $< -lucrtbase -lkernel32 -o $@
	strip -s $@
ifneq ($(RESERVE),long)
	editbin -nologo -heap:4096,4096 -stack:4096,4096 $@
endif

life-launch.txt: life-launch.exe req-binutils req-vcbtools
	objdump -Mintel -D $< > $@
	echo "-----------------------------------" >> $@
	dumpbin -nologo -headers $< >> $@

# cleanup stuff

clean: req-linux
	rm -f *.o *.tmp *.gcda prof.exe

distclean: req-linux
	rm -f *.o *.tmp *.gcda *.exe life.7z life.txt life-launch.txt analyze.py
