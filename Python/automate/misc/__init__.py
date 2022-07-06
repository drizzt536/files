# miscellaneous variables

import _string as string # smallest standard module I could find
Module = type(string)
string = str
NoneType = type(None) # useless
true = True
false = False
ellipsis = type(...) # type(Ellipsis)
NotImplementedType = type(NotImplemented)
generator = type(i for i in []) # useless
function = type(lambda x: x)
array = list
dict_keys = type(int.__dict__.keys()) # useless
dict_values = type(int.__dict__.values()) # useless
dict_items = type(int.__dict__.items()) # useless
variables = (
    "Module",
    "string",
    "NoneType",
    "true",
    "false",
    "ellipsis",
    "NotImplementedType",
    "generator",
    "function",
    "array",
    "dict_keys",
    "dict_values",
    "dict_items",
    "variables",
    "functions"
); functions = (
    "monitors",
    "view (view module)",
    "read",
    "cmp",
    "ccmp",
)

# miscellaneous functions

def monitors() -> list[object, ...]:
    from ctypes.wintypes import RECT as rect
    from ctypes import (
        c_int as cint, c_ulong as ul, POINTER as ptr,
        c_double as dbl, WINFUNCTYPE as cfun, windll
    )
    lst = []
    windll.user32.EnumDisplayMonitors(0, 0, cfun(cint, ul, ul, ptr(rect), dbl)(
        lambda monitor, dc, rect, data: (rct := rect.contents) and lst.append({
            'top': rct.top,
            'left': rct.left,
            'width': rct.right - rct.left,
            'height': rct.bottom - rct.top,
        }) or 1
    ), 0)
    return lst

def view(module: Module, form: int = 1)-> tuple[str, ...] | list[str, ...] | set[str, ...] | dict_keys | None:
    if not isinstance(module, Module): return
    module = module.__dict__
    if form == 1: return tuple(module)
    elif form == 2: return list(module)
    elif form == 3: return set(module)
    elif form == 4: return module.keys()

from io import UnsupportedOperation as ccmp # so it doesn't stay in the module forever
def read(file_loc: str | int) -> str:
    if file_loc == 0:
        raise Exception("automate.misc.read() cannot read from standard input")
    try:
        with open (file_loc, "r") as file:
            return file.read()
    except (FileNotFoundError, PermissionError, TypeError, OSError, ccmp) as e:
        print("\nautomate.misc.read() failed to read the file for one of the following reasons:\n * FileNotFoundError - File doesn't exist\n * PermissionError - File requested is a folder (probably. I'm not 100% sure it is always that reason)\n * TypeError - Input was not a string or integer\n * OSError - the input was an integer and also invalid for some reason\n * io.UnsupportedOperation - something like writing to stdin or reading from stdout\n")
        raise e

def write(file_loc: str | int, text: str = "", form: str = "a") -> None:
    if file_loc in {0, 1}:
        raise Exception("automate.misc.write() cannot write to stdin or stdout")
    if form not in {"a", "w", "write", "append"}:
        form = "a"
    try:
        with open(file_loc, form[0]) as file:
            file.write(text)
    except (FileNotFoundError, PermissionError, TypeError, OSError, ccmp) as e:
        print("\nautomate.misc.read() failed to read the file for one of the following reasons:\n * FileNotFoundError - File doesn't exist\n * PermissionError - File requested is a folder (probably. I'm not 100% sure it is always that reason)\n * TypeError - Input was not a string or integer\n * OSError - the input was an integer and also invalid for some reason\n * io.UnsupportedOperation - something like writing to stdin or reading from stdout\n")
        raise e

def cmp(num1: float | int = 0, num2: float | int = 0) -> int:
    if not isinstance(num1, float | int) or not isinstance(num2, float | int):
        raise TypeError("automate.misc.cmp() requires an int or float input type")
    return -1 if num1 < num2 else int(num1 != num2)

def ccmp(comp1: complex | float | int = 0, comp2: complex | float | int = 0) -> tuple[int, int]:
    if not isinstance(comp1, complex | float | int) or not isinstance(comp2, complex | float | int):
        raise TypeError("automate.misc.ccmp() requires arguments of type complex, float, or int")
    comp1, comp2 = complex(comp1), complex(comp2)
    return (cmp(comp1.real, comp2.real), cmp(comp1.imag, comp2.imag))

isntinstance = lambda a, b: not isinstance(a, b)

if __name__ == '__main__':
    print("__name__ == '__main__'\nautomate.misc\n\nvariables:")
    print(
        "",
        *variables,
        **{"sep": "\n * ", "end": 3*"\n"}
    )
    print("functions:")
    print(
        "",
        *functions,
        **{"sep": "\n * ", "end": 3*"\n"}
    )
    input("Press Enter to exit...\n")
