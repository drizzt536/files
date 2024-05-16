#!/usr/bin/env makefile

CFLAGS=-std=c99 -Wall -Wextra -Ofast
STRIPFLAGS=-s -R .comment -R comment -R .note -R note 
CC=gcc.exe
ROOT=C:/Program Files/dotnet/
STRIP=1

ifndef VERSION
VERSION=$(shell "$(ROOT)dotnet.exe" --version)
endif

all: csc vbc
	@# build all

copy: csc vbc
	# copying EXEs to `$(ROOT)` requires admin
	@if [ $$(id -u) = 0 ]; then            \
		echo cp ./csc.exe "$(ROOT)csc.exe"; \
		cp      ./csc.exe "$(ROOT)csc.exe";  \
		echo cp ./vbc.exe "$(ROOT)vbc.exe";   \
		cp      ./vbc.exe "$(ROOT)vbc.exe";    \
	else                                        \
		echo "no administrator privelages";      \
	fi

csc vbc:
	$(CC) $(CFLAGS) main.c -D VERSION=\"$(VERSION)\" -D ROOT="\"\\\"$(ROOT)\"" -D LANG=\"$@\" -o $@

	@if [ $(STRIP) = 1 ]; then            \
		echo strip $(STRIPFLAGS) ./$@.exe; \
		strip $(STRIPFLAGS) ./$@.exe;       \
	fi

	@echo

clean:
	rm *.exe
