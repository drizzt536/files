def password(length: int = 10, shuffles: int = 6) -> str:
	"""password generator. returns a string"""
	from secrets import choice, randbelow
	from os import system, name as sysname
	def shuffle(s: str, /) -> str:
		"""kind of like random.shuffle except it works for strings only...
			and it returns the new value instead of editing the old one.
			It cant edit the original instance, because strings are imutable in CPython"""
	    output = ""
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

__name__ == "__main__" and password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 6) )
