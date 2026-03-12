LDFLAGS := -s -O --as-needed --gc-sections --relax --exclude-all-symbols \
		--no-export-dynamic --disable-long-section-names --no-seh \
		--nxcompat --dynamicbase --high-entropy-va \
		--fatal-warnings --warn-common --warn-constructors

NASMFLAGS := -DEFAULT

adler32.exe: adler32.nasm
	nasm -fwin64 -Werror $< -o adler32.o.tmp $(NASMFLAGS)
	strip -S adler32.o.tmp

	ld $(LDFLAGS) adler32.o.tmp -lkernel32 -lshell32 -lucrtbase -o $@
	strip -s -R .comment -R comment -R .note -R note $@

	editbin -nologo -heap:4096,4096 -stack:4096,4096 $@

adler32.dll: adler32.nasm
	nasm -fwin64 -Werror $< -o adler32.o.tmp -DLL $(NASMFLAGS)
	ld adler32.o.tmp -lucrtbase -shared -s --gc-sections -O -o $@

adler32.o: adler32.nasm
	nasm -fwin64 -Werror adler32.nasm -o adler32.o -DSTATIC $(NASMFLAGS)

clean:
	rm -f *.tmp

distclean:
	rm -rf *.tmp adler32.exe
