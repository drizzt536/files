import hashlib
from copy import copy
def createHash(Input):
	if not (type(Input) is str or type(Input) is bytes):
		return
	if type(Input) is str:
		Input = bytes(Input, "utf-8")
	h = hashlib.sha256()
	h.update(Input, "utf-8")
	a = h.hexdigest()
	return a
def crackHashv2(inputHash, debug = False, hashfunction = hashlib.sha256):
	chars = "default";
	if debug:
		chars = input("Characters: ")
	if not debug or chars == "default":
		chars = [
			"1","2","3","4","5","6","7","8","9","0","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t",
			"u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X",
			"Y","Z","`","~","-","_","=","+","(",")","[","]","{","}","\\","|",";",":","'",'"',",","<",".",">","/","?","\t","!","@",
			"#","$","%","^","&","*"," "
		]
	else:
		chars = list(set(chars))
	hasher, obj, List = hashfunction(), {}, copy(chars)
	#repeat until a match is found
	
	while True:
		#create a hash of all the items in the list and store the hashes as keys in a dictionary with the equivalent string as the values:
		
		for i in List:
			hasher = hashfunction()
			hasher.update(bytes(i,"utf-8"))
			obj[f"{hasher.hexdigest()}"] = i
		#check if the hash is already known:
		
		if inputHash in obj:
			return obj[inputHash]
		#create the new iteration of the list:
		
		for e in range(len(List)):
			arr = copy(chars)
			for j in range(len(arr)):
				arr[j] = List[e] + chars[j]
			List[e] = arr
		#remove sub lists
		while True:
			b = []
			for i in List:
				if type(i) is list:
					b += i
				else:
					b.append(i)
			List = b
			for i in List:
				sublist = False
				if not (type(i) is list):
					sublist = True
					break
			if sublist:
				break
