from random import choice, shuffle
chars = list("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]}{|;:',.<>/?-_=+ \"\\")
length, passw = abs(int(input("Enter password length: "))), ""
for i in range(length): passw += choice(chars)
print(f"Password:\n{passw}\n")
input("Press 'Enter' to continue...\n")
