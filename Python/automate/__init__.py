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
pynput: https://pypi.org/project/pynput/
file location:
C:/Python[version]/Lib/site-packages/automate/__init__.py
"""



# variables

buttons = [] # (mouse) buttons currently pressed
keys = [] # keys currently pressed

__variables__ = (
	'buttons',
	'keys',
	'Button',
	'Key',
	'__variables__',
	'__functions__',
	'__all__',
	'fkeys',
	'winkey (Key.cmd)',
	"misc (module)",
)
__functions__ = (
	'KeyboardController',
	'KeyboardListener',
	'KeyboardEvents',
	'HotKey',
	'GlobalHotKeys',
	'MouseController',
	'MouseListener',
	'MouseEvents',
	'getbuttonspressed',
	'getkeyspressed',
	'getmouseposition',
	'setmouseposition',
	'movemouse',
	'click',
	'scroll',
	'vscroll',
	'hscroll',
	'mousedown',
	'mouseup',
	'releasebuttons',
	'keydown',
	'keyup',
	'keypress',
	'typekeys',
	'keycombo',
	'nextwindow',
	'prevwindow',
	'releasekeys',
	'release_all',
	'volumeup',
	'volumedown',
	'pauseplay',
	'togglemute',
	'nextmedia',
	'prevmedia'
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



# getters

def getbuttonspressed() -> list[Key, ...]:
	return buttons

def getkeyspressed() -> list[Key, ...]:
	return keys

def getmouseposition() -> tuple[int, int]:
	return MouseController().position



# Mouse automation

def setmouseposition(x: float | int = 0, y: float | int = 0) -> None:
	MouseController().position = (x, y)

def movemouse(relX: float | int = 0, relY: float | int = 0) -> None:
	MouseController().move(relX, relY)

def click(button: object = Button.left, times: int = 1) -> None:
	MouseController().click(button, times)

def scroll(ltr: float | int = 0, dtu: float | int = 0) -> None:
	MouseController().scroll(rtl, dtu)

def vscroll(dtu: float | int = 0) -> None: # vertical scroll
	MouseController().scroll(0, dtu)

def hscroll(ltr: float | int = 0) -> None: # horizontal scroll
	MouseController().scroll(ltr, 0)

def mousedown(button: object = Button.left) -> None:
	buttons.append(button)
	MouseController().press(button)

def mouseup() -> None: # release most recent mouse button
	MouseController().release( buttons.pop() )

def releasebuttons() -> None:
	while buttons:
		mouseup()



# Keyboard automation

def keydown(key: object = None) -> None:
	if key is None: return
	keys.append(key)
	KeyboardController().press(key)

def keyup() -> None: # release most recent key
	KeyboardController().release( keys.pop() )

def keypress(key: object = None, delay_ms: int = 0) -> None:
	if key is None: return
	from win32api import Sleep
	keydown(key)
	Sleep(delay_ms)
	keyup()

def typekeys(keys: list | tuple | str | None = None, delay_ms: int = 0) -> None:
	if keys is None: return
	for key in keys:
		keypress(Key.enter if key == "\n" else key, delay_ms)

def enter(times: int = 1, delay_ms: int = 0) -> None:
	for i in range(int(times)):
		keypress(Key.enter, delay_ms)

def keycombo(keys: list | tuple | None = None) -> None:
	if keys is None: return
	for key in keys:
		keydown(key)
	for key in keys:
		keyup()

def nextwindow(times: int = 1, delay_ms: int = 10) -> None:
	"""alt tab"""
	keydown(Key.alt)
	for i in range(int(times)):
		keypress(Key.tab, delay_ms)
	keyup()

def prevwindow(times: int = 1, delay_ms: int = 10) -> None:
	"""alt shift tab"""
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

if __name__ == '__main__':
	print_options = {"sep": "\n * ", "end": 3*"\n"}
	print( "__name__ == '__main__'\nautomate\n\nvariables:\n", *__variables__, **print_options )
	print( "functions:\n", *__functions__, **print_options )
	input("Press Enter to exit...\n")

from . import misc
