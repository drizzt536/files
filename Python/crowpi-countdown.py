#!/usr/bin/python3

from sys import argv
from subprocess import Popen
from time import sleep
from Adafruit_LED_Backpack import SevenSegment

no_blink = SevenSegment.HT16K33.HT16K33_BLINK_OFF
blink_1hz = SevenSegment.HT16K33.HT16K33_BLINK_1HZ
SevenSegment = SevenSegment.SevenSegment

disp = SevenSegment(address=0x70)


MAX = int(argv[1]) if len(argv) > 1 else 3599 # must be in the range [1, 3600)
MAX = MAX if 0 <= MAX <= 3599 else 3599
Popen("clear").wait()
print("^C to stop:")
cmatrix_process = Popen("cmatrix")

def exit(*, early: bool = False) -> None:
	disp.set_blink(no_blink)
	disp.clear()
	disp.write_display()
	cmatrix_process.terminate()
	cmatrix_process.wait()
	print("\nexiting early" if early else "timer finished\nexiting", flush=True)
	raise SystemExit(0)

disp.begin()
disp.set_blink(no_blink)
disp.set_colon(True)
disp.set_brightness(2)

try:
	for i in range(MAX, -1, -1):
		mins, secs = divmod(i, 60)

		disp.print_number_str(f"{mins}{secs:02}")

		sleep(1)
		disp.write_display()
except KeyboardInterrupt:
	exit(early=True)

try:
	disp.set_blink(blink_1hz)
	sleep(4.8)
except KeyboardInterrupt:
	pass

exit(early=False)
