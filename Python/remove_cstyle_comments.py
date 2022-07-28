def remove_comments_str(text: str, /) -> str:
	"""takes one argument that is the text for editing
		does not modify the text because strings are immutable in CPython
		returns a new string with the new value"""
	endsWithNewLine = False
	if not text[-1] == "\n":
		endsWithNewLine = True
		text += "\n";
	stack, inString, removing, output, i, n = [], False, False, "", -1, len(text)
	while (i := i + 1) < n:
		if text[i] in {"'", '"', "`"}:
			if stack:
				if text[i] == stack[-1]:
					stack.pop()
					inString = not inString
			else:
				inString = not inString
				stack.append(text[i])
		if inString:
			output += text[i]
			continue
		if text[i] == "/":
			if text[i + 1] == "/":
				index = i + 2
				while index < n:
					if text[index] == "\n":
						break
					index += 1
				i = index
				output += "\n";
				continue
			elif text[i + 1] == "*":
				insString2 = False
				index = i - 1
				stack2 = []
				while (index := index + 1) < n:
					inString2 = False
					if text[index] in {"'", '"', "`"}:
						if stack2:
							if text[index] == stack2[-1]:
								stack2.pop()
								inString2 = not inString2
						else:
							inString2 = not inString2
							stack2.append(text[index])
					if not inString2:
						if text[index] == "*" and text[index + 1] == "/":
							break
				i = index + 1
				continue
		output += text[i]
	return output[0:-1] if not endsWithNewLine and text[-1] == "\n" else output

def remove_comments_file(filepath: str | int, edit: bool = False, /) -> str:
    """takes the file location of a file. removes all C-style comments from the file.
        if the second argument is truthy, The file is overwrited to the new state.
        returns the output string"""
    from automate.misc import read, write
    output = remove_comments_str( read(filepath) )
    edit and write(filepath, output, 'w')
    return output
