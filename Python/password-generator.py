def password(length: int = 10, shuffles: int = 6) -> str:
	"""password generator"""
	from secrets import choice, randbelow
	from os import system, name as sysname

	def shuffle(s: str, /) -> str:
		output = ""

		while s:
			i = randbelow(len(s))
			output += s[i]
			s = s[:i] + s[i + 1:]

		return output

	chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ "

	while True:
		psw = ""
		for i in range(shuffles):
			chars = shuffle(chars)

		for i in range(length):
			psw += choice(chars)

		if (any(x in psw for x in "0123456789")\
			and any(x in psw for x in "abcdefghijklmnopqrstuvwxyz")\
			and any(x in psw for x in "ABCDEFGHIJKLMNOPQRSTUVWXYZ")\
			and any(x in psw for x in "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")
		):
			for i in range(shuffles):
				psw = shuffle(psw)
			break

	if __name__ == "__main__":
		print(f"Password (in single quotes):\n'{psw}'\n")
		if input("Again?: ").lower() in {"yes", "y", "1", "true", "t"}:
			system("cls" if sysname == "nt" else "clear")
			print()

			return password(
				abs(int(input("length: "    ) or 14)),
				abs(int(input("# shuffles: ") or 6 ))
			)

	return psw

if __name__ == "__main__":
	print()
	password(
		abs(int(input("length: "    ) or 14)),
		abs(int(input("# shuffles: ") or 6 ))
	)
