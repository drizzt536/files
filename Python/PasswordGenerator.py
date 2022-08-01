def password(length: int = 10, shuffles: int = 2) -> str:
	"""password generator. returns a string"""
	from secrets import choice
	from random import shuffle
	from os import system, name as sysname
	chars = list('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ ')
	while 1:
		psw = ""
		for i in range(shuffles): shuffle(chars)
		for i in range(length): psw += choice(chars)
		if not any(map(lambda x: x in psw, '0123456789')): continue
		if not any(map(lambda x: x in psw, 'abcdefghijklmnopqrstuvwxyz')): continue
		if not any(map(lambda x: x in psw, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')): continue
		if not any(map(lambda x: x in psw, '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')): continue
		psw = list(psw)
		for i in range(shuffles): shuffle(psw)
		psw = ''.join(psw)
		break
	if __name__ == "__main__":
		print(f"Password (in single quotes):\n'{psw}'\n")
		if input("Again?: ").lower() in {"yes", "y", "1", "true", "t"}:
			system("cls" if sysname == "nt" else "clear")
			return password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 2) )
	return psw

__name__ == "__main__" and password( print() or abs(int(input("length: ") or 10)), abs(int(input("# shuffles: ")) or 2) )
