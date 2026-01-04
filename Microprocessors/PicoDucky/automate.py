# automate reloading the pico

# credits/sources:
# https://github.com/dbisu/pico-ducky (./boot/code.py)
# https://github.com/adafruit/Adafruit_CircuitPython_Bundle (./boot/lib/adafruit_hid/)
# https://github.com/adafruit/Adafruit_CircuitPython_HID (non-compiled version)
# https://circuitpython.org/board/raspberry_pi_pico (./circuit_python-8.0.0.uf2)
# https://github.com/dwelch67/raspberrypi-pico (./flash_nuke.uf2)

# TODO: Make my own circuit python duckyScript

from shutil import copy2 as copy, copytree
from os import rmdir
from time import sleep

# options
version_name = "8.0.0" # (circuit python, for file location)
src_dir = "D:/ExtF/CodeFiles/PicoDucky/"
src_boot_folder = "boot/"
out_drive = "E"
use_flash_nuke = True
copy_payload = True

input("\nPayload will be run upon script end.\n\nBoot select pico and continue...\n")

if use_flash_nuke:
	print("copying flash nuke")
	copy(f"{src_dir}/flash_nuke.uf2", f"{out_drive}:/flash_nuke.uf2")

	print("waiting for reconnect (9 seconds)")
	sleep(9)

print("copying circuit python")
copy(f"{src_dir}/circuit_python-{version_name}.uf2", f"{out_drive}:/circuit_python.uf2")

print("waiting for reconnect (9 seconds)")
sleep(9)

print("copying library")
rmdir(f"{out_drive}:/lib")
copytree(f"{src_dir}/{src_boot_folder}lib", f"{out_drive}:/lib")

print("copying code.py")
copy(f"{src_dir}/{src_boot_folder}code.py", f"{out_drive}:/code.py")

if copy_payload:
	print("copying payload")
	copy(f"{src_dir}/{src_boot_folder}payload.dd", f"{out_drive}:/payload.dd")

print("done")
