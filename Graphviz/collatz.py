from os import system
from math import inf
from automate.misc import read, write, view
from os.path import abspath

# graphviz settings

form = "pdf"
margin = "0"
neato = True
overlap = False
bgcolor = "black"
restore_on_interrupt = True
edgeOptions = { "color": "white" }
nodeOptions = { "color": "white" }
graph_file = "D:/ExtF/CodeFiles/Graphviz/collatz.gv"

# program settings

graph_index = 1500
verbose = True
run_graphviz_dot = False

# program variables

original_file = read(graph_file) if restore_on_interrupt else None
numbers = set()
c = lambda n: 3*n + 1 if n % 2 else n // 2

def collatz(n: int, /) -> None:
	global numbers
	if n == 1486: # temporary
		print("\nbreakpoint 1")
		breakpoint()
	if n in numbers:
		return
	verbose and n not in numbers and print(n, end=",", flush=True)
	numbers.add(n)
	tmp = (n - 1) // 3
	if tmp not in numbers and n > 4 and n % 3 == 1 == tmp % 2:
		collatz(tmp) # in case any of these numbers = 1 (mod 3)
		if n in numbers:
			return
	newline = not read(graph_file).endswith(str(n))
	i = n
	print(f"\ni: {i}, n: {n}")
	while i >= n or i not in numbers:
		tmp = c(i)
		if n == 1486 or i == 1486:
			# i != n, for 1486, but it is literally 3 lines ago in the print statement
			# nothing changed
			print("\nbreakpoint 2")
			breakpoint()
		if i not in numbers or i == n:
			numbers.add(i)
			write(graph_file, (f"\n\t{i}" if newline else '') + f" -> {tmp}", "a")
		i = tmp
		newline = False

try:
	write(
		graph_file,
		"digraph {\n\toverlap=" + ("true" if overlap else "false") +
		("\n\tlayout=neato" if neato else "") +
		(f"\n\tbgcolor={bgcolor}" if bgcolor != False else "") +
		(f"\n\tmargin={margin}" if margin != False else "") +
		(f"\n\tedge [{ ', '.join( map( lambda x: f'{x[0]}={x[1]}', edgeOptions.items() ) ) }]" if type(edgeOptions) is dict else "") +
		(f"\n\tnode [{', '.join(map(lambda x: f'{x[0]}={x[1]}', nodeOptions.items()))}]" if type(nodeOptions) is dict else ""),
		"w"
	) # "\" and '"' not allowed in f-strings. *cringe*, python trash
	verbose and print(f"file writing started (to {abspath(graph_file)})")
	for i in range(graph_index, 1, -1):
		collatz(i)
	write(graph_file, "\n}", "a")

	verbose and print("file generation finished\n") # extra newline
except KeyboardInterrupt:
	if restore_on_interrupt and original_file is not None:
		write(graph_file, original_file, "w")

if run_graphviz_dot is True:
	system(f"dot -T{form} {graph_file} -O{' -v' if verbose else ''}")
	verbose and print("dot executable generation finished")
	system(f"{graph_file}.{form}") # opens the output
	verbose and print("output file opened, script should finish soon")
elif verbose:
	print("graphviz dot was not run")

# exec(open("D:/ExtF/CodeFiles/Graphviz/collatz.py").read())