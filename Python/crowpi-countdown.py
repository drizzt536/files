#!/usr/bin/python3

from sys import argv
from subprocess import Popen
from time import sleep
import RPi.GPIO as GPIO
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_CharLCD import Adafruit_CharLCDBackpack as CharacterLCD

no_blink = SevenSegment.HT16K33.HT16K33_BLINK_OFF
blink_1hz = SevenSegment.HT16K33.HT16K33_BLINK_1HZ
SevenSegment = SevenSegment.SevenSegment

buzzer_pin = 18
vibration_pin = 27

if "-b" in argv:
	argv.remove("-b")
	pin = buzzer_pin
else:
	pin = vibration_pin

if "-v" in argv:
	argv.remove("-v")

disp = SevenSegment(address=0x70)

lcd = CharacterLCD(address=0x21)
lcd.show_cursor(False)
lcd.blink(False)
lcd.set_backlight(0)

GPIO.setmode(GPIO.BCM)
GPIO.setup(pin, GPIO.OUT)

MAX = int(argv[1]) if len(argv) > 1 else 3599 # must be in the range [1, 3600)
MAX = MAX if 0 <= MAX <= 3599 else 3599

Popen("clear").wait()

print("^C to stop:")
lcd.message("Process started")

cmatrix_process = Popen("cmatrix")

def exit(*, early: bool = False) -> None:
	disp.set_blink(no_blink)
	disp.clear()
	disp.write_display()

	GPIO.output(pin, GPIO.LOW)

	cmatrix_process.terminate()
	cmatrix_process.wait()

	lcd.set_backlight(1)
	lcd.clear()

	print("\nexiting early" if early else "timer finished\nexiting", flush=True)

	raise SystemExit(0)

disp.begin()
disp.set_blink(no_blink)
disp.set_colon(True)
disp.set_brightness(2)

try:
	for i in range(MAX, -1, -1):
		mins, secs = divmod(i, 60)

		disp.print_number_str(f"{mins:02}{secs:02}")

		sleep(1)
		disp.write_display()
except KeyboardInterrupt:
	exit(early=True)

try:
	# total of 4.8 seconds with 5 sleeps.
	# this is so it lines up with the blinking
	disp.set_blink(blink_1hz)
	for _i in range(2):
		for j in range(2):
			GPIO.output(pin, 1 - j)
			sleep(0.96)

	GPIO.output(pin, GPIO.HIGH)
	sleep(0.96)
except KeyboardInterrupt:
	pass

exit(early=False)
