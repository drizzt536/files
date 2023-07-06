from subprocess import Popen, PIPE
from re import sub as replace, MULTILINE
from os.path import isfile as fileQ
from os import listdir as ls, remove
from automate.misc import write

def binify_dword(dword: int = 0, power: int = 32, /) -> str:
	absolute_dword = abs(dword)
	out = bin(absolute_dword)[2:]
	out = (power - len(out)) * "0" + out

	if dword < 0: # two's compliment
		out = bin(1 + int("".join((str(1 - int(x)) for x in out)), 2))[2:]
		out = (power - len(out)) * "0" + out

	return out

def long_double_memory(value: int | float | str = 3.4, /):
	"""Basically solves the problem by giving it to someone else (gcc).
		without `-O0`, it will optimize out the useless variable.
		There is probably a better way to generate a unique file name
	"""
	if isinstance(value, int):
		value = str(value) + ".0"
	elif isinstance(value, float):
		pass
	elif isinstance(value, str):
		try:
			float(value)
		except ValueError:
			raise TypeError("floating point value must be a floating point value")
	else:
		raise TypeError("floating point value must be a floating point value")

	temprary_file = "./" + max([len(file) for file in ls('.') if fileQ(file)]) * "a" + "a.c"
	write(temprary_file, f"int main(){{long double x={value};return 0;}}", "w")
	process = Popen(["gcc", "-S", "-O0", "-masm=intel", temprary_file, "-o", "-"], stdout=PIPE)
	full_asm = process.communicate()[0].decode("utf-8").replace("\r\n", "\n")
	float_parts = "\n".join( full_asm.split("\n")[-6:-2] )[1:].replace("\n\t", "\n")
	dwords = (int(x) for x in replace("^.*\t", "", float_parts, flags=MULTILINE).split("\n"))
	remove(temprary_file)

	return ''.join( (binify_dword(x) for x in dwords) )


def unique_filename(extension: str = "c", /) -> str:
	from os.path import isfile as fileQ
	from string import ascii_lowercase
	from os import listdir as ls

	ascii_lowercase = set(ascii_lowercase)
	outstring = ""
	i = 0
	files = [filename for filename in ls('.') if fileQ(filename)]

	while files:
		current_characters = (filename[i] for filename in files) # pronounced `eyes`
		charset = set(current_characters)
		difference = ascii_lowercase - charset

		if len(difference):
			return outstring + difference.pop() + "." + extension

		values = {c: list(current_characters).count(c) for c in charset}
		char = min(values, key=values.get)
		outstring += char
		if not any((filename == outstring + "." + extension for filename in files)):
			# all the files are different
			return outstring
		files = (file for file in files if file[i] != char and len(file) > i)
		i += 1

	return outstring + "." + extension

