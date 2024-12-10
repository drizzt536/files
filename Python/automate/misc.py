# variables

import _string as string # smallest standard module I could find
Module = type(string)
string = str
NoneType = type(None) # useless
true = True
false = False
ellipsis = type(...) # type(Ellipsis)
NotImplementedType = type(NotImplemented)
function = type(lambda: 1)
array = list
generator = type(i for i in []) # useless
dict_keys = type({}.keys()) # useless
dict_values = type({}.values()) # useless
dict_items = type({}.items()) # useless
realnum = float | int
number = realnum | complex
__vars__ = (
	"Module",
	"string",
	"NoneType",
	"true",
	"false",
	"ellipsis",
	"NotImplementedType",
	"generator (useless)",
	"function",
	"array",
	"dict_keys (useless)",
	"dict_values (useless)",
	"dict_items (useless)",
	"realnum (float | int)",
	"number (realnum | complex)",
	"__variables__",
	"__functions__",
	"__all__"
)
__functions__ = (
	"monitors",
	"view (view module)",
	"void",
	"read",
	"readlines",
	"write",
	"clear (reset file to empty)",
	"cmp",
	"ccmp",
	"isntinstance",
	"random",
	"crandom (complex random)",
	"addressOf",
	"nameOf",
	"tuplify_complex",
	"inline_namedtuple",
	"inline_dataclass"
)
__all__ = __vars__ + __functions__

# functions

def void(*args, **kwargs) -> None:
	"takes in any number of arguments and return nothing."
	pass

def monitors() -> list[dict["top", "left", "width", "height"], ...]:
	"returns a list of all connected monitors."

	from ctypes.wintypes import RECT
	from ctypes import (
		c_int as cint,
		c_ulong as ul,
		POINTER as ptr,
		c_double as dbl,
		WINFUNCTYPE as cfn,
		windll
	)

	lst = []
	windll.user32.EnumDisplayMonitors(0, 0, cfn(cint, ul, ul, ptr(RECT), dbl)(
		lambda monitor, dc, rect, data: (rct := rect.contents) and lst.append({
			"top"    : rct.top,
			"left"   : rct.left,
			"width"  : rct.right - rct.left,
			"height" : rct.bottom - rct.top,
		}) or 1
	), 0)

	return lst

def view(module: Module, form: int = 8, /, *, form_6_dst = 1) -> tuple[str, ...] | list[str, ...] | set[str, ...] | dict_keys | None:
	"""
		function for viewing module contents.
		Essentially just dir() before I knew it existed.
		The first argument is the module, and the second argument is the form.
		forms:
			0. returns module.__dict__
			1. returns tuple(module.__dict__)
			2. returns list(module.__dict__)
			3. returns set(module.__dict__)
			4. returns module.__dict__.keys()
			5. reads the file at module.__file__ and returns the file contents.
			6. reads the file at module.__file__ and copies to form_6_dst via shutil.copyfile. returns form_6_dst
			7. does the following: for s in list(module.__dict__): print(s)
			8: tuple(module.__dict__) without anything starting with "__" or "_"
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
	elif form == 8:
		return tuple(
			filter( lambda x: not(x.startswith("_")), tuple(mod) )
		)
	else: return module

def read(file_loc: str | bytes | int, /, *, encoding: str = "utf8") -> str:
	"""
		function for reading from files.
		takes 1 argument, file path.
		reads and returns the contents of the file
	"""

	from io import UnsupportedOperation

	try:
		with open(file_loc, "r", encoding=encoding) as file:
			return file.read()
	except FileNotFoundError as e:
		print("\nautomate.misc.read() failed to read the file because it does not exist")
		raise e
	except PermissionError as e:
		print("\nautomate.misc.read() failed to read the file because the file requested is a folder or there are insufficient permissions to view the file.")
		raise e
	except TypeError as e:
		print("\nautomate.misc.read() failed to read the file because it was not a string, bytes, non-negative-integer, or os.PathLike")
		raise e
	except ValueError as e:
		print("\nautomate.misc.read() failed to read the file because it was not a valid value")
		raise e
	except OSError as e:
		print("\nautomate.misc.read() failed to read the file because it was an invalid integer (ie: not 0, 1, or 2)")
		raise e
	except UnsupportedOperation as e:
		print("\nautomate.misc.read() can't read from stdout")
		raise e

def readlines(file_loc: str | bytes  | int, /, *, encoding: str = "utf8") -> list[str, ...]:
	"""
		function for reading from files.
		takes 1 argument, file path.
		reads and returns the contents of the file split into a list of lines
	"""
	from io import UnsupportedOperation

	try:
		with open(file_loc, "r") as file:
			return file.readlines()
	except FileNotFoundError as e:
		print("\nautomate.misc.readlines() failed to read the file because it does not exist")
		raise e
	except PermissionError as e:
		print("\nautomate.misc.readlines() failed to read the file because the file requested is a folder or there are insufficient permissions to view the file.")
		raise e
	except TypeError as e:
		print("\nautomate.misc.read() failed to read the file because it was not a string, bytes, non-negative-integer, or os.PathLike")
		raise e
	except ValueError as e:
		print("\nautomate.misc.readlines() failed to read the file because it was not a valid value")
		raise e
	except OSError as e:
		print("\nautomate.misc.readlines() failed to read the file because it was an invalid integer (ie: not 0, 1, or 2)")
		raise e
	except UnsupportedOperation as e:
		print("\nautomate.misc.readlines() can't read from stdout")
		raise e

def write(file_loc: str | bytes | int, text: str = "", form: str = "a", /, *, encoding: str = "utf8") -> None:
	"""
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
		with open(file_loc, form[0], encoding=encoding) as file:
			file.write(text)
	except FileNotFoundError as e:
		print("\nautomate.misc.write() failed to write to the file because it does not exist")
		raise e
	except PermissionError as e:
		print("\nautomate.misc.write() failed to write to the file because the file requested is a folder or there are incorrect permissions to view the file.")
		raise e
	except TypeError as e:
		print("\nautomate.misc.read() failed to read the file because it was not a string, bytes, non-negative-integer, or os.PathLike")
		raise e
	except ValueError as e:
		print("\nautomate.misc.write() failed to write to the file was not a correct value")
		raise e
	except OSError as e:
		print("\nautomate.misc.write() failed to write to the file was an invalid integer (ie: not 0, 1, or 2)")
		raise e
	except UnsupportedOperation as e:
		print("\nautomate.misc.write() can't write to stdin")
		raise e

def clear(file_loc: str | bytes | int, /) -> bool:
	"""
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

def cmp(num1: realnum = 0, num2: realnum = 0, /) -> -1 | 0 | 1:
	"""
		function for comparing floats or integers
		This is a built-in function in python2, but not python 3 because it is useless

		returns -1 if num1 < num2
		returns 0 if num1 == num2
		returns 1 if num1 > num2
	"""

	if isinstance(num1, realnum) and isinstance(num2, realnum):
		return -1 if num1 < num2 else int(num1 != num2)

	raise TypeError("automate.misc.cmp() requires an int or float input type")

def ccmp(z: number = 0, w: number = 0, /) -> tuple[int, int] | int:
	"""
		returns a tuple of two integers
		the first integer compares the real parts and the second integer compares the imaginary parts
	"""

	if isinstance(z, number) and isinstance(w, number):
		z, w = complex(z), complex(w)

		ret = (cmp(z.real, w.real), cmp(z.imag, w.imag))

		if ret[0] == ret[1]:
			# conclusive result
			return ret[0]

		if 0 in ret:
			# zero on one axis, nonzero on the other
			# return the other one.
			return ret[0] + ret[1]

		# map them to the y = x line.
		a = (z.real + z.imag) / 2
		b = (w.real + w.imag) / 2
		tmp = cmp(a, b)

		if tmp != 0:
			return tmp

		# (1, -1) or (-1, 1)
		# they are on the same y = c - x line.
		return ret

	raise TypeError("automate.misc.ccmp() requires arguments of type complex, float, or int")

def isntinstance(a, b: type(realnum) | type, /) -> bool:
	"return not isinstance(arg1, arg2)"

	return not isinstance(a, b)

def random(return_int: bool = False, /) -> realnum:
	"""
		returns any random float (or int, depending on the argument) in (-∞, ∞)
		more likely to return numbers closer to zero
		2^-(1 + int(log|x|)) probability that ~|x| will get returned based on its magnitude
	"""

	from random import randint

	string = "0"

	while randint(0, 1):
		string += str(randint(0, 9))

	if not return_int:
		string += "."

		while True:
			string += str(randint(0, 9))

			if randint(0, 1):
				break

	ans = float(string) * (randint(0, 1) or -1)

	return int(ans) if return_int else ans

def crandom(return_int: bool = False, /) -> complex:
	"""
		returns any complex number where both the real
		and complex parts can be in (-∞, ∞)
		more likely to return numbers closer to zero.
	"""

	return complex(random(return_int), random(return_int))

def addressOf(fn: function, form: type = int, /) -> str | int:
	"""
		function for getting the address of functions
		takes 1 function argument and returns, as a string, the address
	"""

	# function can't be extended, so isinstance isn't required
	if isinstance(fn, function):
		from re import sub

		ans = sub("(.* ){3}", "", str(fn))[:-1]

		if form is str:
			return ans
		elif form is int:
			return int(ans, 16)

	raise TypeError("automate.misc.addressOf() requires a function input")

def nameOf(fn: function, /) -> str:
	"""
		function for getting the name of functions
		takes 1 function argument and returns, as a string, the name
	"""

	# function can't be extended, so isinstance isn't required
	if isinstance(fn, function):
		from re import sub

		return sub("(<function )| .*", "", str(fn))

	raise TypeError("automate.misc.nameOf() requires a function input")

def tuplify_complex(number: complex = complex(), /) -> tuple[float, float]:
	"""
		returns any complex number in the form of a tuple.
		returns (input.real, input.imag)
	"""

	return (number.real, number.imag)

def inline_namedtuple(name: str | None = None, /, **kwargs):
	from collections import namedtuple as _namedtuple

	if name is None:
		name = "CustomTuple"

	return _namedtuple(name, kwargs.keys()) (*kwargs.values())

def inline_dataclass(name: str | None = None, types: tuple | list | None = None, /, **kwargs):
	from dataclasses import make_dataclass

	if name is None:
		name = "CustomDataclass"

	keys = kwargs.keys()

	return make_dataclass(name, keys if types is None else zip(keys, types))(**kwargs)

if __name__ == "__main__":
	print_options = {"sep": "\n * ", "end": 3*"\n"}
	print( "__name__ == \"__main__\"\nautomate.misc\n\nvariables:\n", *__variables__, **print_options )
	print( "functions:\n", *__functions__, **print_options )
	input("Press Enter to exit...\n")
