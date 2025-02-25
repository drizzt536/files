def password(length: int = 10, shuffles: int = 6, *, interactive: bool = True) -> str:
	"""password generator"""
	from secrets import choice, randbelow
	from os import system, name as sysname

	if length < 4:
		raise ValueError("length must be at least 4 to satisfy all conditions")

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
		if not interactive:
			print(psw)
			return psw

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
	from sys import argv, exit

	if len(argv) == 1:
		# no arguments. use interactive mode
		print()
		length = abs(int(input("length: "    ) or 14))
		password(
			length,
			abs(int(input("# shuffles: ") or 6 )),
			interactive = True
		)
		exit(0)

	if argv[1] in {"--help", "-help", "-h", "-?"}:
		print("Usage: password-generator.py [LENGTH] [SHUFFLES]")
		print("with no arguments, it opens in interactive mode.")
		print("if SHUFFLES is not passed, it defaults to 0.")
		print("negative arguments are converted to be positive.")
		print("LENGTH must be at least 4.")
		exit(0)

	try:
		length = abs(int(argv[1]))
	except ValueError:
		print("\x1b[31mERROR: Argument 1 must be a valid integer\x1b[0m")
		exit(1)

	if length < 4:
		print("\x1b[31mERROR: Argument 1 must be at least 4\x1b[0m")
		exit(1)

	if len(argv) > 2:
		try:
			shuffles = abs(int(argv[2]))
		except:
			print("\x1b[31mERROR: Argument 2 must be a valid integer\x1b[0m")
			exit(1)
	else:
		shuffles = 0

	password(
		length,
		shuffles,
		interactive = False
	)
