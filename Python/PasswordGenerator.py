from random import randint
from re import sub
chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]}{|;:',.<>/?-_=+ \"\\"
passLen, charsRem = abs(int(input("Password Length: "))), input("Characters To Remove: ")
passw = charsRem2 = ""
passLen += not passLen
for c in charsRem:
	charsRem2 += c in "$^()+*\\|[]}{?." and f"\\{c}|" or f"{c}|"
chars = sub(charsRem2[:-1], "", chars)
for i in range(passLen):
	passw += chars[randint(0, len(chars) - 1)]
print(f"Password:\n{passw}\n")
input("Press 'Enter' to continue...\n")
