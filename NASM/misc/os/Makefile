# required programs:
#  - NASM (3.00+)
#  - QEMU
#  - PowerShell 7
#  - MinGW | MSYS2 (make 4.3+, stat, awk, cat, printf, echo, rm)
#  - MSYS2 (for flashing hardware)

# NOTE: this won't work on linux

# these are the arguments that it makes sense to change, unlike the drive input
QEMU_ARGS := -full-screen -cpu max -audiodev dsound,id=snd0 -machine pcspk-audiodev=snd0

# physical drive index to flash the OS to
PDRV_IDX := none

# size of the filesystem part of the disk in sectors
FS_SIZE := 16

# I guess you could use disk.img or something if you wanted.
DISK_IMG := disk.bin

QEMU := qemu-system-x86_64

# NOTE: _MSYS2_BASH is an environment variable
ifndef _MSYS2_BASH
$(error environment variable _MSYS2_BASH does not exist)
endif

ifeq ($(PDRV_IDX),0)
$(error PDRV_IDX cannot be 0. overwriting the C: drive is a very bad idea)
endif

override MSYS2_BASH := $(subst \,/,$(_MSYS2_BASH))


override QEMU_CMD := $(QEMU) -drive 'format=raw,if=ide,file=$(DISK_IMG)' $(QEMU_ARGS)
override QEMU_CMD_FLASH := $(QEMU) -drive 'format=raw,if=ide,file=\\.\PhysicalDrive$(PDRV_IDX)' $(QEMU_ARGS)

all: check-prereqs $(DISK_IMG)

$(DISK_IMG): kernel.bin boot.bin
	@if [ $$(stat -c %s boot.bin) -ne 512 ]; then \
		printf "\e[31mWARNING: the bootloader is not one sector long\e[0m\n" 1>&2; \
	fi

	cat boot.bin kernel.bin > $(DISK_IMG)
	disklastidx=$$(awk "BEGIN {print $$(stat -c %s disk.bin)/512 + $(FS_SIZE) - 1}"); \
	dd if=/dev/zero of=disk.bin seek=$$disklastidx count=1 bs=1b

include/stdlib/stdlib-fntable.nasm include/stdlib/stdlib-header.inc &: gen-fntable.ps1 $(filter-out include/stdlib/stdlib-fntable.nasm,$(wildcard include/stdlib/*.nasm))
	@echo pwsh -noprofile -nologo -f $< -i ./include/stdlib/stdlib.nasm -o ./include/stdlib-fntable.nasm -h ./include/stdlib-header.inc
	@printf "    loading"
	@pwsh -noprofile -nologo -f $< -i ./include/stdlib/stdlib.nasm -o ./include/stdlib/stdlib-fntable.nasm -h ./include/stdlib/stdlib-header.inc

kernel.bin: kernel.nasm include/stdlib/stdlib-fntable.nasm $(wildcard ./include/* ./include/*/*)
	nasm -fbin -Iinclude -Iinclude/preproc -Iinclude/stdlib kernel.nasm -o kernel.bin

boot.bin: boot.nasm kernel.bin
	nasm -fbin -Iinclude/preproc boot.nasm -o boot.bin -DKERNEL_SECTORS=$$(awk "BEGIN {print $$(stat -c %s kernel.bin) / 512}")

#################################### PHONY COMMANDS ####################################

.PHONY: check-prereqs echo-prereqs flash sim

check-prereqs:
	@echo "# checking prerequisite subprograms:";       \
	start="\e[38;2;166;12;26mError: Required program "; \
	end="could not be found.\e[0m\n";                   \
	missing=0;                                          \
	                                                    \
	list="nasm stat.exe awk.exe head.exe dd.exe";       \
	list="$$list pwsh $(notdir $(QEMU))";               \
	                                                    \
	for exe in $$list; do                               \
		printf "# - ";                                  \
		if ! command -v $$exe; then                     \
			printf "$$start \`$$exe\` $$end" >&2;       \
			missing=1;                                  \
		fi                                              \
	done;                                               \
	                                                    \
	if [ $$missing -eq 1 ]; then                        \
		# not all programs found.                       \
		exit 1;                                         \
	fi

	# all required programs were found

clean:
	rm -f kernel.bin boot.bin 2>/dev/null

distclean: clean
	rm -f $(DISK_IMG) include/stdlib/stdlib-fntable.nasm include/stdlib/stdlib-header.inc 2>/dev/null

# As of right now, you have to figure out the drive index yourself. Basically, the issue
# is that the drive will likely not be formatted, which means it won't show up with a drive
# letter in most places, even though Windows knows it has a drive letter. I can't find a
# reliable way to determine the physical drive index from the drive letter, unless perhaps
# you can guarantee you only have one unformatted external drive at a time, in which case
# you know which drive it is because it is the only one that doesn't have any partitions.
flash: all
	@# this requires administrator
	@if [ "$(DISK_IMG)" -nt flash-date ]; then \
		echo "# flashing OS onto hard drive"; \
		echo "dd bs=32k conv=fsync if='$(DISK_IMG)' of='\\\\.\\PhysicalDrive$(PDRV_IDX)'"; \
		dd bs=32k conv=fsync if='$(DISK_IMG)' of='\\.\PhysicalDrive$(PDRV_IDX)'; \
		touch flash-date; \
	else \
		echo "# $(DISK_IMG) hasn't changed since last flash"; \
	fi

ifeq ($(PDRV_IDX),none)
# e.g. `make sim PDRV_IDX=none` or just `make sim`
# empty drive index means you are not running from a disk 
sim: all
	@# run the OS in QEMU from disk.bin

	@echo "$(subst \,\\,$(QEMU_CMD))"
	@echo "# this might take a few seconds"
	@$(QEMU_CMD)
else
# e.g. make sim PDRV_IDX=1
sim: flash
	@# run the OS in QEMU from \\.\PhysicalDrive[N]
	@echo "$(subst \,\\,$(QEMU_CMD_FLASH))"
	@echo "# this might take a few seconds"
	@$(QEMU_CMD_FLASH)
endif



# basically, you have to flash your own drive.
# I can't figure out a reliable way to get the \\.\PhysicalDiskN from the drive letter.
# basically just do this command yourself in MSYS2 for now:
# dd if=disk.bin of=/dev/sdb bs=32K conv=fsync
# except use the actual drive instead of sdb, and make sure it can find disk.bin.

# flash: all
# 	# NOTE: you might want to run `diskpart clean $(HARD_DRIVE)`
# 	@# flash the OS onto actual hardware
# 	@if [ "$(HARD_DRIVE)" == "C:" ]; then echo "aborting overwrite of C: drive"; exit 1; fi;
# 
# 	@read -p "are you sure $(HARD_DRIVE)/ is the correct drive to flash [yes/no]? " ans; \
# 	if [ "$$ans" != "yes" ]; then echo "aborting."; exit 1; fi;
# 
# 	@echo "checking size of data usage on drive $(HARD_DRIVE)/."
# 	@size=$$(pwsh -noprofile -nologo -c '(get-psdrive | where root -eq "$(HARD_DRIVE)\").used'); \
# 	if [ "$$size" == "" ]; then echo "drive $(HARD_DRIVE)/ doesn't exist."; exit 1; fi; \
# 	if [ $$size -gt 33554432 ]; then \
# 		echo "WARNING: $$size B of data on drive $(HARD_DRIVE)/"; \
# 		read -p "Are you sure you want to overwrite this drive [YES/no]? " ans;\
# 		if [ "$$ans" != "YES" ]; then echo "aborting."; exit 1; fi; \
# 	fi;
# 
# 	@echo this will likely only work in administrator mode
# 	@# NOTE: this won't work if the drive isn't formatted (which it wont be)
# 	drive=$$(cat /proc/partitions | fgrep $(HARD_DRIVE) | head -n 1 | awk '{print substr(\$$4, 0, 3)}');
# 	$(MSYS2_BASH) -lc "dd bs=32KiB conv=fsync if=\"$(abspath $(DISK_IMG))\" of=/dev/\$$drive"


# these are some random commands that may or may not be useful later.
# xorriso -asm mkisofs -o disk.iso -b disk.bin -no-emul-boot -boot-info-table
# xorriso -create_new_image_file ./disk.iso -straight_iso_9660 -rockridge on -joliet on -volume_name "ASDF"
# xorriso -as mkisofs -no-emul-boot -boot-load-size 1 -boot-info-table -c boot.cat -b disk.bin -o output.iso /dev/zero
