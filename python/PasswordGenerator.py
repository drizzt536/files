from sys import exit
from random import randint
from re import sub
chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]}{|;:',.<>/?-_=+ \"\\"
passLen, charsRem = abs(int(input("Password Length: "))), input("Characters To Remove: ")
passw = charsRem2 = ""
if passLen == 0:
	passLen = 1
for c in charsRem:
	charsRem2 += (c in "$^()+*\\|[]}{?." and "\\") + f"{c}|"
chars = sub(f"{charsRem2[:len(charsRem2)-1]}", "", chars)
for i in range(passLen):
	passw += chars[randint(0, len(chars) - 1)]
print(f"Password:\n{passw}\n")
input("Press a Enter to continue...")
exit(0)
