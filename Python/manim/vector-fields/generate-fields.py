#!/usr/bin/env python3

"""
2D vector field animation using Manim.

requires Python 3.11 to 3.13 (manim doesn't support Python 3.14 yet).

run the following command for help:
	python generate-fields.py help

this script uses `./fields.txt` for vector fields function storage

there are no dependencies other than manim and its dependendcies.
"""

# NOTE: all the the previously computed IDs are for Python 3.12

if __name__ != "__main__":
	raise Exception("don't use this file as a module. use Manim directly for rendering stuff, or run this as a script")

# TODO: allow passing multiple ids to `--id`
# TODO: --dryrun doesn't do anything about --clean. it still cleans either way
# TODO: add an option to specify the pixel aspect ratio
# TODO: add an option to specify the renderer
# TODO: add --remove to remove a function from the list
# TODO: add --migrate, which updates the IDs (for if you update Python versions)
# TODO: make an argument to log the positions of the particles in the last frame.
	# this could be used to do some kind of curve fitting.
# TODO: make an option for using `StreamLines` instead of `ArrowVectorField`.
	# this should be much faster, and arguably nicer, depending on what you are looking for.
# TODO: allow giving criteria for --findbest (currently allowable: size, duration, ratio)
	# and then also make it work for radius and fps

# TODO: only append to the list if it isn't already in it. or add an argument
	# to clean the list and exit. this might need something like SymPy,
	# because `lambda x: 1 + x` and `lambda x: x + 1` have different bytecode,
	# but SymPy could normalize them or something

	# if using Sympy, add --contains, to normalize a function,
	# check if it is in the list, and return the id if it is.

from manim import *

from typing import Iterable, Callable
from os.path import isfile, getsize as filesize
from sys import argv, exit
from os import listdir

import math

from math import (
	acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil,
	comb, cos, cosh, degrees, e, erf, erfc, exp, exp2, expm1,
	fabs, factorial, floor, fmod, gamma, gcd, hypot, isqrt,
	lcm, ldexp, lgamma, log, log10, log1p, log2, perm, pi, pow,
	radians, remainder, sin, sinh, sqrt, tan, tanh, tau, trunc
)

math.min = min
math.max = max
math.abs = abs

math.sec = sec = lambda x: 1/cos(x)
math.csc = csc = lambda x: 1/sin(x)
math.cot = cot = lambda x: 1/tan(x)

math.sech = sech = lambda x: 1/cosh(x)
math.csch = csch = lambda x: 1/sinh(x)
math.coth = coth = lambda x: 1/tanh(x)

math.asec = asec = lambda x: acos(1/x)
math.acsc = acsc = lambda x: asin(1/x)
math.acot = acot = lambda x: atan(1/x)

math.asech = asech = lambda x: acosh(1/x)
math.acsch = acsch = lambda x: asinh(1/x)
math.acoth = acoth = lambda x: atanh(1/x)

math.nzhypot = nzhypot = lambda x, y: (1 if x == y == 0 else hypot(x, y))
math.sgn     = sgn     = lambda x: -1 if x < 0 else int(x > 0)

Fnop = lambda x, y, z: (0, 0, 0)
output_count = 0

argv    = argv[1:]
argset  = set(argv)

# length of the config separator "===..." thing
CONFIG_SEP_LEN = 44 # it will look better if this is even.

def try_get_arg[T](args: list[str], T: type, default: T) -> T:
	# TODO: make invalid values throw an error or print something instead of silently becoming the default

	if T == bool:
		for arg in args:
			if arg in argset:
				return True

			# try it without the --
			if arg[:2] == "--" and try_get_arg([arg[2:]], bool, False):
				return True

		return False

	for arg in args:
		try:
			if arg not in argset:
				# first use an O(1) check to see if the argument is there
				raise IndexError

			i = argv.index(arg)
			result = T(argv[i + 1]) # this is the line that would throw an error. it only throws
			# if you pass in a key with no value, or like a boolean for a float argument or something

			return default if result in {"None", "default"} else result
		except (ValueError, IndexError):
			pass

		# try it without the --

		if arg[:2] != "--":
			continue

		if arg[2:] not in argset:
			continue

		tmp = try_get_arg([arg[2:]], T, default)
		if tmp != default:
			return tmp

	return default

def f2s(f: float | int) -> str:
	"""
	float to string. (also works for integers)
	0.25 -> ".25", 123.0 -> "123", etc.
	"""

	from re import sub as re_replace

	return re_replace(r"^0(?=\.)|\.0$", "", str(f)) if isinstance(f, float) else str(f)

def print_config(options: Iterable) -> None:
	CSL2m4 = CONFIG_SEP_LEN//2 - 4
	print("="*(CSL2m4 + CONFIG_SEP_LEN % 2) + " CONFIG " + "="*CSL2m4)

	maxlength = max(len(opt) for opt in options)

	for name, value in options.items():
		print(f"\x1b[1;33m{name}\x1b[0m{(1 + maxlength - len(name)) * " "}= ", end="")

		if value is None or isinstance(value, bool):
			print(f"\x1b[3;31m{value}\x1b[0m")

		elif isinstance(value, float | int):
			print(f"\x1b[3;1;34m{f2s(value)}\x1b[0m")

		elif isinstance(value, str):
			print(f"\x1b[3;32m\"{value}\"\x1b[0m")

	print("="*CONFIG_SEP_LEN)

def is_safe_2d_fn(expr: str) -> bool:
	"determines whether or not a function is safe and valid to be a 2d vector function output tuple string"

	import ast

	if expr[0] == "(" and expr[-1] == ")":
		# the input has to be a no-parentheses tuple
		# this is kind of heuristicy, and if it becomes a problem I will fix it.
		# ... I forgot what the point of this restriction is.
		return False

	allowed_funcs = {
		# functions from `math` package
		"comb", "factorial", "gcd", "isqrt", "lcm", "perm",
		"ceil", "fabs", "floor", "fmod", "remainder", "trunc",
		"cbrt", "exp", "exp2", "expm1", "log", "log1p", "log2", "log10", "pow", "sqrt",
		"degrees", "radians",
		"cos", "sin", "tan", "acos", "asin", "atan", "atan2",
		"acosh", "asinh", "atanh", "cosh", "sinh", "tanh",
		"erf", "erfc", "gamma", "lgamma",
		"ldexp",
		# functions not from `math` package
		"sec", "csc", "cot", "asec", "acsc", "acot",
		"sech", "csch", "coth", "asech", "acsch", "acoth",
		"hypot", "nzhypot", "sgn", "min", "max", "abs"
	}

	allowed_vars = {"x", "y", "pi", "e", "tau"}

	# NOTE: ast.Attribute can only be used in function calls (e.g. math.cos(...))
	# don't allow boolean operations, conditions
	misc_allowed_ops =       \
		  ast.Add   | ast.Sub \
		| ast.Div   | ast.Mod  \
		| ast.Pow   | ast.Mult  \
		| ast.UAdd  | ast.USub   \
		| ast.BinOp | ast.UnaryOp \
		| ast.Call  | ast.FloorDiv \
		| ast.Load

	nodes_to_skip = set() # nodes already seen through a different node

	### SETUP DONE ###

	try:
		tree = tuple(ast.walk(ast.parse(expr, mode="eval")))
	except (SyntaxError, ValueError):
		return False

	if len(tree) < 4:
		# Expression, Tuple, element, element. and then some other stuff like Load, etc.
		return False

	# ignore tree[0] because it is always ast.Expression, and I don't have conditions for it

	if not isinstance(tree[1], ast.Tuple) or len(tree[1].elts) != 2:
		return False

	for node in tree[2:]:
		if node in nodes_to_skip:
			# e.g. the `func` attribute node of a `Call` node
			continue

		if isinstance(node, ast.Name):
			if node.id not in allowed_vars:
				return False

		elif isinstance(node, ast.Constant):
			if not isinstance(node.value, float | int):
				# don't allow boolean, string, complex, etc. constants
				return False

		elif isinstance(node, ast.Call):
			# Check if the function call is allowed
			func = node.func

			if isinstance(func, ast.Attribute):
				if func.value.id != "math" or func.attr not in allowed_funcs:
					# only `math` is allowed as a module,
					# and you still can only use allowed functions
					return False

				nodes_to_skip.add(func.value)

			elif not isinstance(func, ast.Name) or func.id not in allowed_funcs:
				return False

			nodes_to_skip.add(func)

		elif not isinstance(node, misc_allowed_ops):
			# Allow basic operators and expressions
			return False

	return True

def find_best_file(id: str, criteria: list[str]) -> str:
	from re import match

	for i, c in enumerate(criteria):
		if criteria in {"ratio", "size/duration", "size/length"}:
			criteria[i] = "ratio"
		elif c in {"duration", "length"}:
			criteria[i] = "duration"
		elif c in {"size", "fps", "radius", "distance"}:
			pass # valid and already normalized
		else:
			raise ValueError("invalid criteria")

	valid = lambda f: match(rf"^vectorfield\-{id}\-(\d+(?:\.\d+)?|\.\d+)fps\-" \
		rf"(\d+(?:\.\d+)?|\.\d+)s\-r(\d+)\-d(\d+(?:\.\d+)?|\.\d+)\." \
		rf"{config["movie_file_extension"].replace(".", "")}$", f)

	best = {
		"file"    : None,
		"size"    : -1,
		"ratio"   : -1,
		"fps"     : -1,
		"duration": -1,
		"radius"  : -1,
		"distance": -1,
	}

	files = tuple(f for f in listdir() if valid(f))

	if not files:
		# no animation file with the requested function id was found
		return None

	for file in files:
		groups = valid(file).groups()
		size = filesize(file)
		duration = float(groups[1])

		current = {
			"file"    : file,
			"size"    : size,
			"ratio"   : size / duration,
			"fps"     : float(groups[0]),
			"duration": duration,
			"radius"  : int(groups[2]),
			"distance": float(groups[3]),
		}

		for c in criteria:
			if current[c] > best[c]:
				best = current

	return best["file"]

def ignore_sigint(fn: Callable) -> Callable:
	"""
	decorator function to ignore KeyboardInterrupt exceptions while inside the function
	"""
	from signal import signal as set_signal, SIGINT
	from functools import wraps

	@wraps(fn)
	def wrapper(*args, **kwargs):
		sigint_received = False

		def sigint_handler(signum, frame) -> None:
			nonlocal sigint_received
			sigint_received = True

		prev_handler = set_signal(SIGINT, sigint_handler)

		try:
			return_value = fn(*args, **kwargs)
		except Exception as e:
			set_signal(SIGINT, prev_handler)

			if sigint_received:
				raise KeyboardInterrupt

			raise e

		if sigint_received:
			raise KeyboardInterrupt

		return return_value

	return wrapper

@ignore_sigint
def clean_list(file = None, close: bool = True):
	"""
	returns the file. it is seeked to the end.

	if ^C is given during the function,
	it won't be run until the function ends.
	"""

	if file is None:
		file = open("./fields.txt", "r+")

	if not file.readable():
		raise ValueError("file is not readable")

	if not file.writable():
		raise ValueError("file is not writable")

	if not file.seekable():
		raise ValueError("file is not seekable")

	file.seek(0)

	lines = []
	file_lines = file.readlines()

	for s in (line[33:] for line in file_lines):
		try:
			lines.append(f"{str_to_id(s)}\t{s}")
		except ValueError:
			# invalid or unsafe function. thrown by str_to_2dfn in str_to_id
			continue

	lines.sort()

	# remove duplicates. traverse backwards to not mess up the indexing
	for i in range(len(lines) - 1, 0, -1):
		if lines[i][:32] == lines[i - 1][:32]:
			del lines[i]

	if lines != file_lines:
		file.seek(0)
		file.writelines(lines)

	if close:
		file.close()

	return file

class VectorFieldSceneBase:
	def __init__(self, F: Callable = Fnop, R: int = 10, dx: float = 0.5, field: bool = True, t: float = 5):
		"""
		arguments:
			F: vector field function. should map `(x, y, z) -> (x', y', z')`
			R: radius of the inscribed circle in the particle square.
			dx: verticle and horizontal distance between particles
			field: whether or not to include the vector field arrows
			t: time in seconds to run the animation for.
		"""
		super().__init__()

		self.F = lambda p: np.array(F(*p))
		self.R = R
		self.dx = dx
		self.field = field
		self.t = t

	def update_particles(self, mob: Mobject, dt: float) -> None:
		for particle in mob:
			velocity = self.F(particle.get_center())
			particle.shift(velocity * dt)

	def construct(self):
		if self.field:
			self.add(ArrowVectorField(self.F))

		axrange = np.arange(-self.R, self.R + self.dx, self.dx)

		particles = VGroup(*(Dot([x, y, 0], radius=0.05) for x in axrange for y in axrange))

		self.add(particles)

		particles.add_updater(self.update_particles)

		self.wait(self.t)

def str_to_2dfn(output: str) -> Callable:
	if is_safe_2d_fn(output):
		return eval(f"lambda x, y, z: ({output}, 0)")

	raise ValueError("output string was an unsafe or invalid value for the vector function x,y output")

def function_id(fn: Callable) -> str:
	"this gives the same values across program instances, but not across python versions."

	from hashlib import md5 # the one with the shortest result

	hasher = md5()
	hasher.update(fn.__code__.co_code)

	return hasher.hexdigest()

def str_to_id(output: str) -> str:
	return function_id(str_to_2dfn(output))

def render_field(output: str) -> None:
	global output_count, quiet, radius, distance, time, identity

	try:
		fn = str_to_2dfn(output)
	except ValueError:
		if not quiet:
			print("\x1b[31mERROR: Invalid or unsafe output tuple string. Skipping function\x1b[0m")

		return

	# this has to be a new class definition every call
	class VectorFieldScene(VectorFieldSceneBase, Scene):
		def __init__(self, *args, **kwargs):
			super().__init__(*args, **kwargs)

	fn_id = function_id(fn)

	config["output_file"] = VectorFieldScene.__name__ = \
	f"vectorfield-{fn_id}-{f2s(fps)}fps-{f2s(time)}s-r{radius}-d{f2s(distance)}"

	file_exists = isfile(f"./{config["output_file"]}{config["movie_file_extension"]}")

	if identity is not None:
		if identity != fn_id:
			if not quiet:
				print(f"\x1b[1;32mfunction id {fn_id}, ignored\x1b[0m")

			return

		if not update and file_exists:
			if not quiet:
				print(f"\x1b[1;32mfunction id {fn_id}, skipped\x1b[0m")
				print("ID found.  Remaining lines skipped due to id mismatch")

				if output_count == 0:
					print("no output videos")


			exit(0)

	if update or not file_exists:
		output_count += 1

		if dry_run:
			print(f"\x1b[1;32mfunction id {fn_id}\x1b[0m")
		else:
			if not quiet:
				print(f"\x1b[1;32mfunction id {fn_id}\x1b[0m")

			VectorFieldScene(F=fn, R=radius, dx=distance, t=time).render()

		if identity is not None:
			if not quiet:
				print("ID found.  Remaining lines skipped due to id mismatch")

			exit(0)

		return

	if not quiet:
		print(f"\x1b[1;32mfunction id {fn_id}, skipped\x1b[0m")

def render_fields(outputs):
	for output in outputs:
		render_field(output)

# logger.setLevel("DEBUG")
append    = try_get_arg(["--append"     , "-a"], str  , None )
find_best = try_get_arg(["--findbest"   , "-b"], str  , None )
clean     = try_get_arg(["--clean"      , "-c"], bool , False)
distance  = try_get_arg(["--distance"   , "-d"], float, 0.5  )
dry_run   = try_get_arg(["--dryrun"     , "-D"], bool , False)
fps       = try_get_arg(["--fps"        , "-f"], float, 60.0 )
help      = try_get_arg(["--help", "-?" , "-h"], bool , False)
identity  = try_get_arg(["--id"         , "-i"], str  , None )
ls        = try_get_arg(["--list","--ls", "-l"], bool , False)
nocache   = try_get_arg(["--nocache"    , "-n"], bool , False)
quiet     = try_get_arg(["--quiet"      , "-q"], bool , False)
radius    = try_get_arg(["--radius"     , "-r"], int  , 10   )
time      = try_get_arg(["--time"       , "-t"], float, 5.0  )
update    = try_get_arg(["--update"     , "-u"], bool , False)
version   = try_get_arg(["--version"    , "-v"], bool , False)

config["disable_caching"] = nocache

if version:
	print("version 1.1")
	exit(0)

if help:
	print("switch options:")
	print("    --version -v       print the program version and exit")
	print("    --help, -h, -?     print this help text and exit")
	print("    --dryrun, -D       don't actually render anything. print config data")
	print("    --update, -u       render all classes, including ones that already exist")
	print("    --quiet, -q        don't print option data or the no outputs message.")
	print("                       this option is mostly overridden by --dryrun.")
	print("                       the manim config options are not printed in quiet mode")
	print("    --list, --ls, -l   list out the ids of all vector functions in ./fields.txt")
	print("    --clean, -c        sort the lines in the function file by id. overwrites the file.")
	print("    --nocache, -n      disable file caching via manim.config['disable_caching'].")
	print("")
	print("options with arguments:")
	print("    --fps, -f          specify the FPS for the output animations. default 60. can also be set in manim.cfg")
	print("    --time, -t         specify the animation duration in seconds. default 5.")
	print("    --radius, -r       specify the radius of the particle starting rectangle. default 10.")
	print("    --distance, -d     specify the x and y distance between particle starting positions.")
	print("    --append, -a       append a vector field function to the list before animating")
	print("    --id, -i           specify the id of the function you want to update.")
	print("    --findbest, -b     find the best file with the given ID, print the file name, and open it.")
	print("                       use --quiet to prevent printing, and --dryrun to prevent opening")
	print("")
	print("    the `--` on all long-form arguments is optional (e.g. `version` instead of `--version`)")
	print("    unknown arguments are ignored.")
	print("    passing in invalid argument values will silently use the default.")
	print("    passing in \"default\" or \"None\" basically does nothing. it leaves the option as its default value")
	print("")
	print("NOTE: in the printouts, \"ignored\" means it doesn't match the function ID, and \"skipped\" means it already exists")

	exit(0)

if find_best is None and ("--findbest" in argset or "findbest" in argset or "-b" in argset):
	if find_best is None and identity is not None:
		find_best = identity
		identity = None

if dry_run and clean:
	print("cleaning skipped due to dry run")
	clean = False

if find_best is not None:
	if clean:
		clean_list(close=True)

	if dry_run and quiet:
		# nothing will happen if these are both enabled
		exit(0)

	best_file = find_best_file(id=find_best, criteria=["ratio", "size", "duration", "fps", "radius", "distance"])

	if best_file is None:
		print("\x1b[31mERROR: no animation file with the given ID was found.\x1b[0m")
		exit(1)

	if not quiet:
		print("./" + best_file)

	if not dry_run:
		utils.file_ops.open_file(best_file, in_browser=False)

	exit(0)

if append is not None and not is_safe_2d_fn(append):
	print("\x1b[31mERROR: Invalid or unsafe appended vector field function. ignoring.\x1b[0m")
	append = None

if dry_run or not quiet:
	print_config({
		"update"  : update,
		"dry run" : dry_run,
		"clean"   : clean,
		"list"    : ls,
		"fps"     : fps,
		"radius"  : radius,
		"duration": time,
		"distance": distance,
		"identity": identity,
		"append"  : append,
	})

if ls:
	if identity:
		if clean:
			clean_list(close=True)

		for file in (file for file in listdir() if identity in file):	
			print(file)

		exit(0)

	if clean:
		file = clean_list(close=False)
		file.seek(0)
	else:
		file = open("./fields.txt", "r")

	for line in file.readlines():
		print(line, end="")

	file.close()

	exit(0)

if clean and not append:
	clean_list(close=True)

	if len(argv) == 1:
		# --clean is the only argument given
		# if you want different behavior, do something like `--clean --fps default`
		exit(0)

if dry_run and not quiet:
	print("manim config:")

	for k, v in sorted(config.items()):
		if k == "tex_template":
			continue

		print(f"    {k} = {v}")

	print("=" * CONFIG_SEP_LEN)

with open("./fields.txt", "a+") as file:
	if append and not dry_run:
		file.write(f"{str_to_id(append)}\t{append}\n")

		if clean:
			clean_list(file)

	file.seek(0)

	# skip past the id and the tab.
	render_fields(s[33:] for s in file.readlines())

if not quiet and output_count == 0:
	print("no output videos")
