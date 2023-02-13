import usb_hid as u,digitalio as D
from time import sleep as s
from adafruit_hid.keyboard import Keyboard as b
from adafruit_hid.keyboard_layout_us import KeyboardLayoutUS as B
from adafruit_hid.keycode import Keycode as K
from board import*
M=D.DigitalInOut(LED);M.direction=D.Direction.OUTPUT;z={'WINDOWS':K.WINDOWS,'GUI':K.GUI,'APP':K.APPLICATION,'MENU':K.APPLICATION,'SHIFT':K.SHIFT,'ALT':K.ALT,'CONTROL':K.CONTROL,'CTRL':K.CONTROL,'DOWNARROW':K.DOWN_ARROW,'DOWN':K.DOWN_ARROW,'LEFTARROW':K.LEFT_ARROW,'LEFT':K.LEFT_ARROW,'RIGHTARROW':K.RIGHT_ARROW,'RIGHT':K.RIGHT_ARROW,'UPARROW':K.UP_ARROW,'UP':K.UP_ARROW,'BREAK':K.PAUSE,'PAUSE':K.PAUSE,'CAPSLOCK':K.CAPS_LOCK,'DELETE':K.DELETE,'END':K.END,'ESC':K.ESCAPE,'ESCAPE':K.ESCAPE,'HOME':K.HOME,'INSERT':K.INSERT,'NUMLOCK':K.KEYPAD_NUMLOCK,'PAGEUP':K.PAGE_UP,'PAGEDOWN':K.PAGE_DOWN,'PRINTSCREEN':K.PRINT_SCREEN,'ENTER':K.ENTER,'SCROLLLOCK':K.SCROLL_LOCK,'SPACE':K.SPACE,'TAB':K.TAB,'BAKCKSPACE':K.BACKSPACE,'DELETE':K.DELETE,'A':K.A,'B':K.B,'C':K.C,'D':K.D,'E':K.E,'F':K.F,'G':K.G,'H':K.H,'I':K.I,'J':K.J,'K':K.K,'L':K.L,'M':K.M,'N':K.N,'O':K.O,'P':K.P,'Q':K.Q,'R':K.R,'S':K.S,'T':K.T,'U':K.U,'V':K.V,'W':K.W,'X':K.X,'Y':K.Y,'Z':K.Z,'F1':K.F1,'F2':K.F2,'F3':K.F3,'F4':K.F4,'F5':K.F5,'F6':K.F6,'F7':K.F7,'F8':K.F8,'F9':K.F9,'F10':K.F10,'F11':K.F11,'F12':K.F12}
def c(l):
	n=[]
	for k in filter(None,l.split(" ")):
		k=k.upper();j=z.get(k,None)
		if j is not None:n.append(j)
		elif hasattr(K,k):n.append(getattr(K,k))
	return n
def R(a):
	for k in a:kbd.press(k)
	kbd.release_all()
def parseLine(A):
	if A[:3]=="REM":0
	elif A[:5]=="DELAY":s(float(A[6:])/1000)
	elif A[:6]=="STRING":layout.write(A[7:])
	elif A[:6]=="IMPORT":r(A[7:])
	elif A[:13]=="DEFAULT_DELAY":global d;d=int(A[13:])/100
	elif A[:3]=="LED":M.value=not M.value
	else:R(c(A))
kbd=b(u.devices);layout=B(kbd);s(.5);P=D.DigitalInOut(GP0);P.switch_to_input(pull=D.Pull.UP);d=0
def r(F):
	global d;p=""
	with open(F,"r")as f:
		for L in f.readlines():
			L=L.strip()
			if L[:6]=="REPEAT":
				for i in range(int(L[7:])):parseLine(p);s(d)
			else:parseLine(L);p=L
			s(d)
if P.value:r("payload.dd")
