START_TIME := $(shell date +%s)

DEPENDENCIES = $(shell ls *.nasm 2>/dev/null \
	| tr '\n' ' ' \
	| sed 's/\.nasm/\.exe/g')

all: $(DEPENDENCIES)
	@echo "Duration: $$(( $$(date +%s) - $(START_TIME) )) seconds"

%.exe: %.nasm
	../assemble $< --infer
	@echo

clean:
	@rm *.exe 2>/dev/null
	@echo "rm *.exe"
