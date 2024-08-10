CC = gcc
CFLAGS = -std=c99 -Wall -Wextra -Ofast

override HASH := $(shell git log -1 --format=%H -- ./assemble.c)

# user/repo
override REPO := $(shell git remote -v \
	| fgrep push \
	| egrep -o '/\w+/\w+' \
	| cut -c2-)

ifeq ($(OS),Windows_NT)
	override FMT := win
else
	ifeq ($(OS),Linux)
		override FMT := elf
	else
		override FMT := macho
	endif
endif

ifneq (,$(findstring 64,$(PROCESSOR_ARCHITECTURE)))
	override BITS := 64
else
	override BITS := 32
endif

override FORMAT := $(FMT)$(BITS)


ifeq ($(OS),Windows_NT)
all: assemble.exe

clean:
	rm ./assemble.exe
else
all: assemble

clean:
	rm ./assemble
endif

#######################################

# use `assemble.exe` on windows, and `assemble` otherwise.
assemble assemble.exe: assemble.c
	# echo nasm format: $(FMT)
	$(CC) $(CFLAGS) \
		-D GIT_REPO=\"$(REPO)\" \
		-D GIT_HASH=\"$(HASH)\" \
		-D NASM_FORMAT=\"$(FORMAT)\" \
		$< -o $@

	strip -s $@
