import hashlib
from copy import copy

def create_hash(inpt: str | bytes, hashfunction = hashlib.sha256) -> str:
	if isinstance(inpt, str):
		inpt = inpt.encode("utf8")

	h = hashfunction()
	h.update()

	return h.hexdigest()


def hash_cracker_v4(inputHash, changeChars=False, hashfunction=hashlib.sha256):
	chars = input("Characters: ") if changeChars else "default"
	if chars == "default":
		# chars = [s.encode("utf8") for s in "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~-_=+()[]{}\\|;:'\",<.>/?\t!@#$%^&* "]
		
		chars = [
			b"1", b"2", b"3" , b"4", b"5", b"6", b"7", b"8", b"9", b"0", b"a", b"b",
			b"c", b"d", b"e" , b"f", b"g", b"h", b"i", b"j", b"k", b"l", b"m", b"n",
			b"o", b"p", b"q" , b"r", b"s", b"t", b"u", b"v", b"w", b"x", b"y", b"z",
			b"A", b"B", b"C" , b"D", b"E", b"F", b"G", b"H", b"I", b"J", b"K", b"L",
			b"M", b"N", b"O" , b"P", b"Q", b"R", b"S", b"T", b"U", b"V", b"W", b"X",
			b"Y", b"Z", b"`" , b"~", b"-", b"_", b"=", b"+", b"(", b")", b"[", b"]",
			b"{", b"}", b"\\", b"|", b";", b":", b"'", b'"', b",", b"<", b".", b">",
			b"/", b"?", b"\t", b"!", b"@", b"#", b"$", b"%", b"^", b"&", b"*", b" ",
		]
	else:
		chars = list(x.encode("utf8") for x in set(chars))

	hasher, List, length, numChecked = hashfunction(), copy(chars), 0, 0
	hasher.update(b"")

	if inputHash == hasher.hexdigest():
		return "Result (empty string):"

	while True:
		for s in List:
			hasher = hashfunction()
			hasher.update(s)
			if inputHash == hasher.hexdigest():
				return "Result:" + str(s)[2:len(s) + 2]

		for i in List:
			List += list(List[0] + chars[chars.index(x)] for x in chars)
			List.pop(0)

def num_combos(length: int, form = sum):
	chars = input("Characters: ")
	c = 96 if chars == "default" else len(set(chars))

	return form(c**(x+1) for x in range(length))
