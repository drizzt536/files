from pynput.keyboard import Key, Controller as KeyboardController
from pynput.mouse import Button, Controller as MouseController
# C:\Users\[user]\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\site-packages

# variables

buttons = []
keys = []
functions = ('getbuttonspressed', 'getkeyspressed', 'getmouseposition', 'setmouseposition', 'movemouse', 'click', 'scroll', 'pressmouse', 'releasemouse', 'keydown', 'keyup', 'keypress', 'typekeys', 'keycombo', 'test', 'KeyboardController', 'MouseController')
variables = ('buttons', 'keys', 'Button', 'Key', 'functions', 'variables')

# getters

def getbuttonspressed():
    return buttons

def getkeyspressed():
    return keys

def getmouseposition():
    return MouseController().position

# Mouse automation

def setmouseposition(x:int=0, y:int=0):
    MouseController().position = (x, y)

def movemouse(relX:int=0, relY:int=0):
    MouseController().move(relX, relY)

def click(button=Button.left, times:int=1):
    MouseController().click(button, times)

def scroll(rtl:int=0, dtu:int=0):
    MouseController().scroll(rtl, dtu)

def pressmouse(button=Button.left):
    buttons.append(button)
    MouseController().press(button)

def releasemouse():
    MouseController().release( buttons.pop() )

# Keyboard automation

def keydown(key):
    keys.append(key)
    KeyboardController().press(key)

def keyup():
    KeyboardController().release( keys.pop() )

def keypress(key, delay:float=0):
    keydown(key)
    if delay > 0:
        from time import sleep
        sleep(delay)
    keyup()

def typekeys(keys=[], delay:float=0):
    for key in keys:
        keypress(key, delay)

def keycombo(keys:list=[], delay:float=0):
    for key in keys:
        keydown(key)
    for key in keys:
        keyup()
