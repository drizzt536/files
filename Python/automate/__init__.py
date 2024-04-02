from pynput.keyboard import (
	Key,
	Controller as KeyboardController,
	Listener as KeyboardListener,
	Events as KeyboardEvents,
	HotKey,
	GlobalHotKeys
)
from pynput.mouse import (
	Button,
	Controller as MouseController,
	Listener as MouseListener,
	Events as MouseEvents
)
"""
uses pynput: https://pypi.org/project/pynput/
file location:
C:/Python[version]/Lib/site-packages/automate/__init__.py

basically provides a functional/procedural? wrapper around pynput.
pynput uses classes and that is icky
"""



# variables

buttons = [] # (mouse) buttons currently pressed
keys = [] # keys currently pressed

__variables__ = (
	"buttons",
	"keys",
	"Button",
	"Key",
	"__variables__",
	"__functions__",
	"__all__",
	"fkeys",
	"winkey (Key.cmd)",
	"misc (module)",
)
__functions__ = (
	"KeyboardController",
	"KeyboardListener",
	"KeyboardEvents",
	"HotKey",
	"GlobalHotKeys",
	"MouseController",
	"MouseListener",
	"MouseEvents",
	"getbuttonspressed",
	"getkeyspressed",
	"getmouseposition",
	"setmouseposition",
	"setmouseposition2",
	"movemouse",
	"click",
	"drag",
	"leftclick",
	"rightclick",
	"middleclick",
	"scroll",
	"vscroll",
	"hscroll",
	"mousedown",
	"mouseup",
	"releasebuttons",
	"keydown",
	"keyup",
	"keypress",
	"typekeys",
	"typestring",
	"keycombo",
	"nextwindow",
	"prevwindow",
	"releasekeys",
	"release_all",
	"volumeup",
	"volumedown",
	"pauseplay",
	"togglemute",
	"nextmedia",
	"prevmedia"
)
__all__ = __variables__ + __functions__
fkeys = (
	None,
	Key.f1, Key.f2, Key.f3,
	Key.f4, Key.f5, Key.f6,
	Key.f7, Key.f8, Key.f9,
	Key.f10, Key.f11, Key.f12,
	Key.f13, Key.f14, Key.f15,
	Key.f16, Key.f17, Key.f18,
	Key.f19, Key.f20, Key.f21,
	Key.f22, Key.f23, Key.f24,
)
winkey = Key.winkey = Key.cmd

Key.a = "a"; Key.A = "A"; Key.b = "b"; Key.B = "B"
Key.c = "c"; Key.C = "C"; Key.d = "d"; Key.D = "D"
Key.e = "e"; Key.E = "E"; Key.f = "f"; Key.F = "F"
Key.g = "g"; Key.G = "G"; Key.h = "h"; Key.H = "H"
Key.i = "i"; Key.I = "I"; Key.j = "j"; Key.J = "J"
Key.k = "k"; Key.K = "K"; Key.l = "l"; Key.L = "L"
Key.m = "m"; Key.M = "M"; Key.n = "n"; Key.N = "N"
Key.o = "o"; Key.O = "O"; Key.p = "p"; Key.P = "P"
Key.q = "q"; Key.Q = "Q"; Key.r = "r"; Key.R = "R"
Key.s = "s"; Key.S = "S"; Key.t = "t"; Key.T = "T"
Key.u = "u"; Key.U = "U"; Key.v = "v"; Key.V = "V"
Key.w = "w"; Key.W = "W"; Key.x = "x"; Key.X = "X"
Key.y = "y"; Key.Y = "Y"; Key.z = "z"; Key.Z = "Z"
Key.shft = Key.shift
Key.control = Key.ctrl

def init_module() -> None:
	from win32api import Sleep

	mouse_controller = MouseController()
	keyboard_controller = KeyboardController()
	realnumber = float | int
	Location = tuple[int, int]

	global getbuttonspressed,\
		getkeyspressed,\
		getmouseposition,\
		setmouseposition,\
		setmouseposition2,\
		movemouse,\
		click,\
		drag,\
		leftclick,\
		rightclick,\
		middleclick,\
		scroll,\
		vscroll,\
		hscroll,\
		mousedown,\
		mouseup,\
		releasebuttons,\
		keydown,\
		keyup,\
		keypress,\
		typekeys,\
		enter,\
		keycombo,\
		nextwindow,\
		prevwindow,\
		releasekeys,\
		releaseall,\
		volumeup,\
		volumedown,\
		pauseplay,\
		togglemute,\
		nextmedia,\
		prevmedia,\
		Sleep


	# getters

	def getbuttonspressed() -> list[Key, ...]:
		return buttons

	def getkeyspressed() -> list[Key, ...]:
		return keys

	def getmouseposition() -> tuple[int, int]:
		return mouse_controller.position



	# Mouse automation

	def setmouseposition(x: int | Location = 0, y: int = 0) -> None:
		mouse_controller.position = x if isinstance(x, tuple) else (x, y)

	def setmouseposition2(loc: Location = None, steps: int = 50, delay_ms: int = 2) -> None:
		"change mouse position smoothly. takes `steps` number of increments"

		rel_x = loc[0] - mouse_controller.position[0]
		rel_y = loc[1] - mouse_controller.position[1]

		movemouse2((rel_x, rel_y), steps, delay_ms)

	def movemouse(rel_x: int | Location = 0, rel_y: int = 0) -> None:
		if isinstance(rel_x, tuple):
			mouse_controller.move(*rel_x)
		else:
			mouse_controller.move(rel_x, rel_y)

	def movemouse2(rel_loc: Location, steps: int = 50, delay_ms: int = 2) -> None:
		"move mouse smoothly. takes `steps` number of increments. sleep `delay_ms` between each move."
		rel_x, rel_y = rel_loc

		x_step = rel_x // steps
		y_step = rel_y // steps

		for i in range(steps):
			mouse_controller.move(x_step, y_step)
			Sleep(delay_ms)

		# make sure it moves to the exact target given
		mouse_controller.move(rel_x % steps, rel_y % steps)

	def click(button: object = Button.left, times: int = 1, loc: Location | None = None) -> None:
		if loc is not None:
			setmouseposition(loc)

		mouse_controller.click(button, times)

	def drag(
		start: Location | None = None,
		end: Location | None = None,
		button: Button = Button.left,
		move_steps: int = 2,
		delay_ms: int = 10,
	) -> None:

		"""
		drag the mouse button `button` between locations `start` and `end`
		If `start` isn't provided, it defaults to the current position.
		`end` must be provided, or else it is just a click.
		`move_steps` is the number of steps it takes to move the mouse between points,
		set higher for smoother movement.
		sleeps `delay_ms` between mousedown & movement, between steps, and between movement & mouseup
		"""

		if end is None:
			raise ValueError("the end location must be provided.")

		mousedown(button, loc=start, delay_ms=10)

		Sleep(delay_ms)

		setmouseposition(end) if move_steps == 1 else setmouseposition2(end, move_steps, delay_ms)

		Sleep(delay_ms)

		mouseup()

	def leftclick(times: int = 1, loc: Location | None = None) -> None:
		if loc is not None:
			mouse_controller.position = loc

		mouse_controller.click(Button.left, times)

	def rightclick(times: int = 1, loc: Location | None = None) -> None:
		if loc is not None:
			mouse_controller.position = loc

		mouse_controller.click(Button.right, times)

	def middleclick(times: int = 1, loc: Location | None = None) -> None:
		if loc is not None:
			mouse_controller.position = loc

		mouse_controller.click(Button.middle, times)

	def scroll(ltr: realnumber | Location = 0, dtu: realnumber = 0) -> None:
		if isinstance(ltr, tuple):
			mouse_controller.scroll(*ltr)
		else:
			mouse_controller.scroll(ltr, dtu)

	def vscroll(dtu: realnumber = 0) -> None:
		"vertical scroll"
		mouse_controller.scroll(0, dtu)

	def hscroll(ltr: realnumber = 0) -> None:
		"horizontal scroll"
		mouse_controller.scroll(ltr, 0)

	def mousedown(button: Button = Button.left, loc: Location | None = None, delay_ms: int = 10) -> None:
		"the delay only happens if the mouse location is changed"
		if loc is not None:
			mouse_controller.position = loc

			Sleep(delay_ms)

		buttons.append(button)
		mouse_controller.press(button)

	def mouseup(loc: Location | None = None, delay_ms: int = 10) -> None:
		"release most recent mouse button"

		if loc is not None:
			mouse_controller.position = loc

			Sleep(delay_ms)

		mouse_controller.release( buttons.pop() )

	def releasebuttons() -> None:
		while buttons:
			mouseup()



	# Keyboard automation

	def keydown(key: object = None) -> None:
		if key is None:
			return

		keys.append(key)
		keyboard_controller.press(key)

	def keyup() -> None: # release most recent key
		keyboard_controller.release( keys.pop() )

	def keypress(key: object = None, delay_ms: int = 0) -> None:
		if key is None:
			return

		keydown(key)
		Sleep(delay_ms)
		keyup()

	def typekeys(keys: list | tuple | str | None = None, delay_ms: int = 0) -> None:
		if keys is None:
			return

		for key in keys:
			keypress(Key.enter if key == "\n" else key, delay_ms)

	def enter(times: int = 1, delay_ms: int = 0) -> None:
		for i in range(int(times)):
			keypress(Key.enter, delay_ms)

	def keycombo(keys: list | tuple | None = None, delay_ms: int = 10) -> None:
		if keys is None:
			return

		for key in keys:
			keydown(key)

		Sleep(delay_ms)

		for key in keys:
			keyup()

	def nextwindow(times: int = 1, delay_ms: int = 10) -> None:
		"alt tab"

		keydown(Key.alt)

		for i in range(int(times)):
			keypress(Key.tab, delay_ms)

		keyup()

	def prevwindow(times: int = 1, delay_ms: int = 10) -> None:
		"alt shift tab"

		keydown(Key.alt)
		keydown(Key.shift)

		for i in range(int(times)):
			keypress(Key.tab, delay_ms)

		keyup()
		keyup()

	def releasekeys() -> None:
		while keys:
			keyup()

	def releaseall() -> None:
		releasekeys()
		releasebuttons()



	# media stuff

	def volumeup(times: int = 1) -> None:
		for i in range(int(times)):
			keypress(Key.media_volume_up, 0)

	def volumedown(times: int = 1) -> None:
		for i in range(int(times)):
			keypress(Key.media_volume_down, 0)

	def pauseplay() -> None:
		keypress(Key.media_play_pause, 0)

	def togglemute() -> None:
		keypress(Key.media_volume_mute, 0)

	def nextmedia() -> None:
		keypress(Key.media_next, 0)

	def prevmedia() -> None:
		keypress(Key.media_previous, 0)


if __name__ == "__main__":
	print_options = {"sep": "\n * ", "end": 3*"\n"}
	print("__name__ == \"__main__\"\nautomate\n\nvariables:\n", *__variables__, **print_options)
	print("functions:\n", *__functions__, **print_options )
	input("Press Enter to exit...\n")
else:
	init_module()
	del init_module

	typestring = typekeys

	from . import misc
