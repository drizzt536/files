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
function = type(lambda: 1)
array = list
dict_keys = type({}.keys()) # useless
dict_values = type({}.values()) # useless
dict_items = type({}.items()) # useless
realnum = float | int
number = realnum | complex
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
    "realnum (float | int)",
    "number (float | int | complex)",
    "variables",
    "functions"
); functions = (
    "monitors",
    "view (view module)",
    "read",
    "write",
    "clear (reset file to empty)",
    "cmp",
    "ccmp",
    "isntinstance",
    "random",
    "crandom (complex random)",
    "addressOf",
    "nameOf",
    "tuplify_complex"
)

# miscellaneous functions

def monitors() -> list[dict["top", "left", "width", "height"], ...]:
    """
        None  ->  list[ dict["top", "left", "width", "height"], ... ]
        
        returns a list of all connected monitors.
    """
    from ctypes.wintypes import RECT
    from ctypes import (
        c_int as cint, c_ulong as ul, POINTER as ptr,
        c_double as dbl, WINFUNCTYPE as cfn, windll
    )
    lst = []
    windll.user32.EnumDisplayMonitors(0, 0, cfn(cint, ul, ul, ptr(RECT), dbl)(
        lambda monitor, dc, rect, data: (rct := rect.contents) and lst.append({
            'top'    : rct.top,
            'left'   : rct.left,
            'width'  : rct.right - rct.left,
            'height' : rct.bottom - rct.top,
        }) or 1
    ), 0)
    return lst

def view(module: Module, form: int = 1, /, *, form_6_dst = 1) -> tuple[str, ...] | list[str, ...] | set[str, ...] | dict_keys | None:
    """
        Module, int=1  ->  (tuple | list | set)[str, ...] | dict_keys | None

        function for viewing module contents.
        the first argument is the module, and the second argument is the form
        forms:
            0. returns module.__dict__
            1. returns tuple(module.__dict__)
            2. returns list(module.__dict__)
            3. returns set(module.__dict__)
            4. returns module.__dict__.keys()
            5. reads the file at module.__file__ and returns the file contents.
            6. reads the file at module.__file__ and copies to form_6_dst via shutil.copyfile. returns form_6_dst
            7. does the following: for s in list(module.__dict__): print(s)
            else: directlty returns inputed module
    """
    if isntinstance(module, Module): raise TypeError("automate.misc.view() can only view modules")
    mod = module.__dict__
    if   form == 0: return mod
    elif form == 1: return tuple(mod)
    elif form == 2: return list(mod)
    elif form == 3: return set(mod)
    elif form == 4: return mod.keys()
    elif form == 5:
        try:
            return read(mod["__file__"])
        except (AttributeError, KeyError):
            raise Exception("module's __file__ attribute is not present for automate.misc.view()")
    elif form == 6:
        from shutil import copyfile
        copyfile(mod["__file__"], form_6_dst) # should raise errors on its own, but if not, whatever
        return form_6_dst
    elif form == 7:
        print("\n")
        for s in tuple(module.__dict__):
            print(s)
        print("\n")
    else: return module

def read(file_loc: str | int, /) -> str:
    """
        str | int  ->  str

        function for reading from files.
        takes 1 argument, file path.
        reads and returns the contents of the file
    """
    from io import UnsupportedOperation
    try:
        with open(file_loc, "r") as file:
            return file.read()
    except (FileNotFoundError, PermissionError, TypeError, OSError, UnsupportedOperation) as e:
        print("\nautomate.misc.read() failed to read the file for one of the following reasons:\n * FileNotFoundError - File doesn't exist\n * PermissionError - File requested is a folder (probably. I'm not 100% sure that is always the reason)\n * TypeError - Input was not a string or integer\n * OSError - the input was an integer and also invalid for some reason\n * io.UnsupportedOperation - something like writing to stdin or reading from stdout\n * ValueError - idk\n")
        raise e

def write(file_loc: str | int, text: str = "", form: str = "a", /) -> None:
    """
        str | int, str="", str="a"  ->  None

        function for writing to files.
        takes 3 arguments:
            1. file path
            2. text to write to the file 
            3. form
                options:
                    append
                    write
                    a
                    w
                append adds to the file
                write deletes everything and adds the text to the blank new file
        returns None
    """
    from io import UnsupportedOperation
    if form not in {"a", "w", "write", "append"}:
        form = "a"
    try:
        with open(file_loc, form[0]) as file:
            file.write(text)
    except (FileNotFoundError, PermissionError, TypeError, OSError, UnsupportedOperation) as e:
        print("\nautomate.misc.write() failed to write to the file for one of the following reasons:\n * FileNotFoundError - File doesn't exist\n * PermissionError - File requested is a folder (probably. I'm not 100% sure that is always the reason)\n * TypeError - Input was not a string or integer\n * OSError - the input was an integer and also invalid for some reason\n * io.UnsupportedOperation - something like writing to stdin or reading from stdout\n * ValueError - idk\n")
        raise e

def clear(file_loc: str | int, /) -> bool:
    """
        str | int  ->  bool

        takes one argument, the file path.  
        clears the content of the file.
        returns true on success and false on fail
    """
    try:
         with open(file_loc, 'w') as file:
            file.write("")
    except Exception:
        return false
    return true

def cmp(num1: realnum = 0, num2: realnum = 0, /) -> int:
    """
        float | int=0, float | int=0  ->  int[-1, 0, 1]

        function for comparing floats or integers
        returns -1 if num1 < num2
        returns 0 if num1 == num2
        returns 1 if num1 > num2
    """
    if isinstance(num1, float | int) and isinstance(num2, float | int):
        return num1 < num2 and -1 or int(num1 != num2)
    raise TypeError("automate.misc.cmp() requires an int or float input type")

def ccmp(comp1: number = 0, comp2: number = 0, /) -> tuple[int, int]:
    """
        complex | float | int=0, complex | float | int=0  ->  tuple[ int[-1,0,1], int[-1,0,1] ]

        returns a tuple of two integers
        the first integer compares the real parts and the second integer compares the imaginary parts
    """
    if isinstance(comp1, complex | float | int) and isinstance(comp2, complex | float | int):
        comp1, comp2 = complex(comp1), complex(comp2)
        return (cmp(comp1.real, comp2.real), cmp(comp1.imag, comp2.imag))
    raise TypeError("automate.misc.ccmp() requires arguments of type complex, float, or int")

def isntinstance(a, b: type(realnum) | type, /) -> bool:
    """return not isinstance(arg1, arg2)"""
    return not isinstance(a, b)

def random(return_int: bool = False, /) -> realnum:
    """
        bool  ->  float | int

        returns any random float (or int, depending on the argument) in (-???, ???)
        more likely to return numbers closer to zero
        2^-(1 + int(log|x|)) probability that ~|x| will get returned based on its magnitude
    """
    from random import randint
    string = "0"
    while randint(0, 1):
        string += str(randint(0, 9))
    if not return_int:
        string += "."
        while 1:
            string += str(randint(0, 9))
            if randint(0, 1):
                break
    ans = float(string) * (randint(0, 1) or -1)
    return int(ans) if return_int else ans

def crandom(return_int: bool = False, /) -> complex:
    """
        bool  -> complex

        returns any complex number where both the real
        and complex parts can be in (-???, ???)
        more likely to return numbers closer to zero.
    """
    return complex(random(return_int), random(return_int))

def addressOf(fn: function, form: type = int, /) -> str | int:
    """
        function  ->  str

        function for getting the address of functions
        takes 1 function argument and returns, as a string, the address
    """
    # function cannot be a base class, thus "isinstance" is not required here
    if type(fn) is type(lambda: 1):
        from re import sub
        ans = sub("(.* ){3}", "", str(fn))[:-1]
        if form is str:
            return ans
        elif form is int:
            return int(ans, 16)
    raise TypeError("automate.misc.addressOf() requires a function input")

def nameOf(fn: function, /) -> str:
    """
        function  ->  str

        function for getting the name of functions
        takes 1 function argument and returns, as a string, the name
    """
    # function cannot be a base class, thus "isinstance" is not required here
    if type(fn) is type(lambda: 1):
        from re import sub
        return sub("(<function )| .*", "", str(fn))
    raise TypeError("automate.misc.nameOf() requires a function input")

def tuplify_complex(number: complex = complex(), /) -> tuple[float, float]:
    """
        returns any complex number in the form of a tuple.
        returns (input.real, input.imag)
    """
    return (number.real, number.imag)

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
