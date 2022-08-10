import hashlib
from copy import copy
<<<<<<< HEAD
def create_hash(input, hashfunction=hashlib.sha256):
    if type(Input) is str:
        h = hashfunction()
        h.update(input.encode("utf8"))
        return h.hexdigest()

def hash_cracker_v4(inputHash, changeChars=False, hashfunction=hashlib.sha256):
    chars = changeChars and input("Characters: ") or "default"
    if chars == "default":
        chars = [
            b"1", b"2", b"3", b"4", b"5", b"6", b"7", b"8", b"9", b"0", b"a", b"b", b"c", b"d", b"e", b"f", b"g", b"h", b"i", b"j", b"k", b"l", b"m", b"n", b"o", b"p", b"q", b"r", b"s", b"t", b"u", b"v", b"w", b"x", b"y", b"z", b"A", b"B", b"C", b"D", b"E", b"F", b"G", b"H", b"I", b"J", b"K", b"L", b"M", b"N", b"O", b"P", b"Q", b"R", b"S", b"T", b"U", b"V", b"W", b"X", b"Y", b"Z", b"`",b"~", b"-", b"_", b"=", b"+", b"(", b")", b"[", b"]", b"{", b"}", b"\\", b"|", b";", b":", b"'", b'"', b",", b"<", b".", b">", b"/", b"?", b"\t", b"!", b"@", b"#", b"$", b"%", b"^", b"&", b"*", b" "
        ]
    else:
        chars = list( map(lambda x: x.encode("utf8"), set(chars)) )
    hasher, List, length, numChecked = hashfunction(), copy(chars), 0, 0
    hasher.update(b"")
    if inputHash == hasher.hexdigest():
        return "Result (empty string):"
    while True:
        for s in List:
            hasher = hashfunction()
            hasher.update(s)
            if inputHash == hasher.hexdigest():
                return "Result:" + str(s)[2:len(s)+2]
        for i in List:
            List += list(map(lambda x: List[0] + chars[chars.index(x)], chars))
            List.pop(0)

def num_combos(length, form=sum):
    chars = input("Characters: ")
    c = chars == "default" and 96 or len(set(chars))
    return form(map(lambda x: c**(x+1), range(length)))
=======
def create_hash(Input, hashfunction=hashlib.sha256):
	if type(Input) is str:
		h = hashfunction()
		h.update(bytes(Input, "utf-8"))
		return h.hexdigest()

def hash_cracker_v4(inputHash, debug=False, hashfunction=hashlib.sha256):
	chars = "default";
	if debug:
		chars = input("Characters: ")
	if chars == "default":
		chars = [
			b"1", b"2", b"3", b"4", b"5", b"6", b"7", b"8", b"9", b"0",
			b"a", b"b", b"c", b"d", b"e", b"f", b"g", b"h", b"i", b"j", b"k", b"l", b"m", b"n", b"o", b"p", b"q", b"r", b"s", b"t", b"u", b"v", b"w", b"x", b"y", b"z",
			b"A", b"B", b"C", b"D", b"E", b"F", b"G", b"H", b"I", b"J", b"K", b"L", b"M", b"N", b"O", b"P", b"Q", b"R", b"S", b"T", b"U", b"V", b"W", b"X", b"Y", b"Z",
			b"`",b"~", b"-", b"_", b"=", b"+", b"(", b")", b"[", b"]", b"{", b"}", b"\\", b"|", b";", b":", b"'", b'"', b",", b"<", b".", b">", b"/", b"?", b"\t",
			b"!", b"@", b"#", b"$", b"%", b"^", b"&", b"*", b" "
		]
	else:
		chars = list(map(lambda x: bytes(x, "utf-8"), set(chars)))
	hasher, List, length, numChecked = hashfunction(), copy(chars), 0, 0
	hasher.update(b"")
	if inputHash == hasher.hexdigest():
		return "Result (empty string):"
	# Repeat until a match is found.
	while True:
		# Check if the original text is already known.
		for s in List:
			hasher = hashfunction()
			hasher.update(s)
			if inputHash == hasher.hexdigest():
				return "Result:" + str(s)[2:len(s)+2]
		if debug:
			print(f"Current Length Checked: {(length := length + 1)},    Combinations Checked: {(numChecked := numChecked + len(List))}")
		# Extend the list where each item is a list of itself plus each unique character, but don't nest the lists.
		for i in range(len(List)):
			List += list(map(lambda x: List[0] + chars[chars.index(x)], chars))
			List.pop(0)

def num_combos(length, form=sum):
	chars = input("Characters: ")
	c = chars == "default" and 96 or len(set(chars))
	return form(map(lambda x: c**(x+1), list(range(length))))
>>>>>>> 3743d4811b56202951e6fde3bbf7ee4568637217
