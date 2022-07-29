def password(length: int = 10, shuffles: int = 2) -> str:
	"""password generator. returns a string"""
	from secrets import choice
	from random import shuffle
	chars, psw = list('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '), ""
	for i in range(shuffles): shuffle(chars)
	for i in range(length): psw += choice(chars)
	psw = list(psw)
	for i in range(shuffles): shuffle(psw)
	psw = ''.join(psw)
	print(f"Password:\n{psw}\n")
	__name__ == "__main__" and input("Press 'Enter' to continue...\n")
	return psw

__name__ == "__main__" and password( abs(int(input("length: ") or 10)), abs(int(input("shuffles: ") or 2)) )
