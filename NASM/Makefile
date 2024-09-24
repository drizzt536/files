# requires MinGW on Windows.

CC = gcc

# no -pedantic. GNU extensions are required. ISO C is gay anyway.
CFLAGS = -Wall -Wextra -Ofast

override HASH := $(shell git log -1 --format=%H -- ./assemble.c)

# user/repo
override REPO := $(shell git remote -v \
	| grep -F push \
	| grep -Eo '/\w+/\w+' \
	| cut -c2-)

ifeq ($(shell uname),Windows_NT)
	override FMT := win
else ifeq ($(shell uname),Darwin)
	override FMT := macho
else
	override FMT := elf
endif

ifneq (,$(findstring 64,$(PROCESSOR_ARCHITECTURE)))
	override BITS := 64
else
	override BITS := 32
endif

# if you are using a 16-bit OS, cross-compiling, etc., directly specify `FORMAT`.
FORMAT := $(FMT)$(BITS)


ifeq ($(shell uname),Windows_NT)
all: assemble.exe

clean:
	rm -f ./assemble.exe
else
all: assemble

clean:
	rm -f ./assemble
endif

.PHONY: prereqs-exist

prereqs-exist:
	@# given that `make` is present, `nasm` is the only one likely to be missing. \
	echo "# finding requisite subprograms:";      #\
	start="\x1b[38;2;166;12;26mError:";          #\
	end="could not be found. It is required";    #\
	end="$$end for the output program.\x1b[0m\n"; #\
	missing=0;                                      #\
	printf "    # ";                                   #\
	if ! command -v nasm; then                           #\
		printf "$$start \`nasm\` $$end" >&2;              #\
		missing=1;                                        #\
	fi;                                                  #\
	printf "    # ";                                   #\
	if ! command -v objcopy; then                   #\
		printf "$$start \`objcopy\` $$end" >&2;   #\
		missing=1;                               #\
	fi;                                          #\
	printf "    # ";                              #\
	if ! command -v ld; then                        #\
		printf "$$start \`ld\` $$end" >&2;             #\
		missing=1;                                       #\
	fi;                                                   #\
	printf "    # ";                                      #\
	if ! command -v strip; then                          #\
		printf "$$start \`strip\` $$end" >&2;          #\
		missing=1;                                  #\
	fi;                                           #\
	if [ $$missing -eq 1 ]; then                 #\
		# not all programs found.                #\
		exit 1;                                   #\
	fi

	# all required programs were found

# use `assemble.exe` on windows, and `assemble` otherwise.
assemble assemble.exe: assemble.c prereqs-exist
	@echo

	$(CC) $(CFLAGS) \
		-D GIT_REPO=\"$(REPO)\" \
		-D GIT_HASH=\"$(HASH)\" \
		-D NASM_FORMAT=\"$(FORMAT)\" \
		$< -o $@

	@echo

	strip -s -R .comment -R comment -R .note -R note $@

	@echo

	# repository local package location for NASM build tool in Sublime.
	cp -fp $@ ../SublimeText/NASM/$@

	@echo

ifeq ($(shell uname), Windows_NT)
	# Windows Sublime Text package location
	cp -fp $@ "$(shell echo "$(APPDATA)" | sed 's/\\/\//g')/Sublime Text/Packages/NASM/$@"
else ifeq ($(shell uname), Darwin)
	# MacOS Sublime Text package location
	cp -fp $@ "$(HOME)/Library/Application Support/Sublime Text/Packages/NASM/$@"
else
	@# Use Linux as a default.
	# Linux Sublime Text package location
	cp -fp $@ "$(HOME)/.config/sublime-text/Packages/NASM/$@"
endif
