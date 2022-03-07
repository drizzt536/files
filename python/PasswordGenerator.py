allCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]{}|;:',.<>/?-_=+ \"\\"
password = ""
passwordLength = abs(int(input("Password Length: ")))
if passwordLength == 0:	passwordLength = 1
charsToRemove = input("Characters To Remove: ")
charsToRemove2 = ""
def a(e):
	if charsToRemove is e:
		return(True)
	else:
		return(False)
if charsToRemove != "":
	i = 0
	while i < len(charsToRemove):
		if a("$")or a("^")or a("(")or a(")")or a("+")or a("*")or a("\\")or a("|")or a("[")or a("]")or a("{")or a("}")or a("?")or a(".")is True:
			charsToRemove2 += "\\"
		charsToRemove2 += charsToRemove[i]
		if i + 1 != len(charsToRemove):
			charsToRemove2 += "|"
		i += 1
import re
newCharacters = re.sub(rf"{charsToRemove2}", "", allCharacters)
import random
i = 0
while i < passwordLength:
	password += newCharacters[round(random.random() * (len(newCharacters) - 1) )]
	i += 1
print("Password:")
print(password, "\n")
