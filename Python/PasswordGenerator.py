def password(length: int = 10, shuffles: int = 6) -> str:
	"""password generator. returns a string"""
	from secrets import choice, randbelow
	from os import system, name as sysname
	def shuffle(s: str, /) -> str:
	    output = ""
		# for some reason, this function having a docstring breaks the program. :) I love python (I Hate Python)
		# it makes it close immediately if it is the main program.
	    while s:
	        i = randbelow(len(s))
	        output += s[i]
	        s = s[:i] + s[i + 1:]
	    return output
	chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '
	while 1:
		psw = ""
		for i in range(shuffles): chars = shuffle(chars)
		for i in range(length): psw += choice(chars)
		if not any(map(lambda x: x in psw, '0123456789')): continue
		if not any(map(lambda x: x in psw, 'abcdefghijklmnopqrstuvwxyz')): continue
		if not any(map(lambda x: x in psw, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')): continue
		if not any(map(lambda x: x in psw, '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')): continue
		for i in range(shuffles): psw = shuffle(psw)
		break
	if __name__ == "__main__":
		print(f"Password (in single quotes):\n'{psw}'\n")
		if input("Again?: ").lower() in {"yes", "y", "1", "true", "t"}:
			system("cls" if sysname == "nt" else "clear")
			return password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 6) )
	return psw

<<<<<<< HEAD
__name__ == "__main__" and password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 6) )
=======
__name__ == "__main__" and password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 6) )
>>>>>>> 3743d4811b56202951e6fde3bbf7ee4568637217
