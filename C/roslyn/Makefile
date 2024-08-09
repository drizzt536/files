#!/usr/bin/env makefile

CFLAGS = -std=c99 -Wall -Wextra -Ofast
STRIPFLAGS = -s -R .comment -R comment -R .note -R note 
CC = gcc
ROOT = C:/Program Files/dotnet/
STRIP = 1
VERSION = $(shell "$(ROOT)dotnet.exe" --version)

# throw in F# because why not.
override OUTPUTS = csc.exe vbc.exe fsc.exe
override BASE = $(basename $@)

all: $(OUTPUTS)
	@# build all

copy: $(OUTPUTS)
	@# build all and copy to destination.

	# copying EXEs to `$(ROOT)` requires admin
	@if [ $$(id -u) = 0 ]; then          \
		echo cp csc.exe "$(ROOT)csc.exe"; \
		cp      csc.exe "$(ROOT)csc.exe";  \
		echo cp vbc.exe "$(ROOT)vbc.exe";   \
		cp      vbc.exe "$(ROOT)vbc.exe";    \
		echo cp fsc.exe "$(ROOT)fsc.exe";     \
		cp      fsc.exe "$(ROOT)fsc.exe";      \
	else                                        \
		echo "no administrator privelages";      \
	fi

clean:
	@rm *.exe 2>/dev/null
	@echo "rm *.exe"

$(OUTPUTS):
	$(CC) $(CFLAGS) ./main.c -D VERSION=\"$(VERSION)\" -D ROOT="\"$(ROOT)\"" -D LANG=$(shell echo $(BASE) | cut -c1-2) -o $(BASE)

	@if [ $(STRIP) = 1 ]; then        \
		echo strip $(STRIPFLAGS) ./$@; \
		strip $(STRIPFLAGS) ./$@;       \
	fi

	@echo
