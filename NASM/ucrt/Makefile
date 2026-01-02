START_TIME := $(shell date +%s)

all: $(shell ls -1 *.nasm 2>/dev/null | sed 's/\.nasm/\.exe/g' | tr '\n' ' ')
	@echo "Duration: $$(( $$(date +%s) - $(START_TIME) )) seconds"

%.exe: %.nasm
	../assemble $< --infer
	@echo

clean:
	@rm *.exe 2>/dev/null
	@echo "rm *.exe"
