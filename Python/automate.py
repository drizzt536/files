from pynput.keyboard import Key, Controller as KeyboardController
from pynput.mouse import Button, Controller as MouseController
# C:\Users\[user]\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\site-packages

# variables

buttons = []
keys = []
functions = ('getbuttonspressed', 'getkeyspressed', 'getmouseposition', 'setmouseposition', 'movemouse', 'click', 'scroll', 'mousedown', 'mouseup', 'releasebuttons', 'keydown', 'keyup', 'keypress', 'typekeys', 'keycombo', 'alt_tab', 'release_keys', 'release_all', 'KeyboardController', 'MouseController')
variables = ('buttons', 'keys', 'Button', 'Key', 'functions', 'variables', 'winKey (Key.cmd)')
winKey = Key.cmd

# getters

getbuttonspressed = lambda: buttons
getkeyspressed = lambda: keys
getmouseposition = lambda: MouseController().position

# Mouse automation

def setmouseposition(x:int=0, y:int=0):
    MouseController().position = (x, y)

def movemouse(relX:int=0, relY:int=0):
    MouseController().move(relX, relY)

def click(button:object=Button.left, times:int=1):
    MouseController().click(button, times)

def scroll(rtl:int=0, dtu:int=0):
    MouseController().scroll(rtl, dtu)

def mousedown(button:object=Button.left):
    buttons.append(button)
    MouseController().press(button)

def mouseup():
    MouseController().release( buttons.pop() )

def releasebuttons():
    while buttons:
        mouseup()

# Keyboard automation

def keydown(key:object):
    keys.append(key)
    KeyboardController().press(key)

def keyup():
    KeyboardController().release( keys.pop() )

def keypress(key:object, delay:float=0):
    keydown(key)
    from time import sleep
    sleep(delay)
    keyup()

def typekeys(keys:object=None, delay:float=0):
    if keys is None:
        keys = []
    for key in keys:
        keypress(key, delay)

def keycombo(keys:list=None, delay:float=0):
    if keys is None:
        keys = []
    for key in keys:
        keydown(key)
    for key in keys:
        keyup()

def alt_tab(times:int=1):
    if times < 1:
        return
    times = int(times)
    keydown(Key.alt)
    for i in range(times):
        keydown(Key.tab)
    for i in range(times + 1):
        keyup()

def release_keys():
    while keys:
        keyup()

def release_all():
    releasekeys()
    releasebuttons()

