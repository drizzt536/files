#!/usr/bin/env python3

"""
basically the same thing as PhotoScreensaver.scr, but with a lot more flexibility.
Also kind of like google slides, but only with single images, and different.

requirements:
 - Python 3.12+ (for nested f-strings)
 - external packages:
	- pillow (>= ~2.7, or ~3.0 on windows)
	- pillow-avif-plugin (optional, only required for AVIF images, any version)
	- numpy (any version)
	- sympy (any version)
	- pywin32 (win32clipboard) (only for exports to clipboard to work)
	- skew_rotation (local file)

not tested on Linux or macOS
"""

# TODO: add an option to specify how to sort files.
# TODO: use `collections.deque` for the stacks?

from os            import name as osname
from sys           import exit, version_info as py_version
from math          import isclose
from PIL           import Image, ImageTk # Pillow
from numpy         import array as np_array
from random        import randrange
from tkinter       import Canvas, Tk, TclError, simpledialog
from argparse      import ArgumentParser
from functools     import partial
from skew_rotation import rotate_image as skew_rotate # should be in the same directory.
from fractions     import Fraction # only used for the `--secondary-zoom` input value.
from time          import time # only used for the elapsed time in the details dumps.
try:
	import pillow_avif
except ImportError:
	# avif images can't be opened
	pass

if py_version < (3, 12):
	# nested f-strings
	raise Exception("This script requires Python 3.12 or newer.")

#### argument parsing

arg_parser = ArgumentParser(add_help=False)

arg_parser.add_argument("--no-autoscale", "-A", action="store_false", default=True, help="don't autoscale images to fit the screen as much as possible")
arg_parser.add_argument("--bgcolor", "-b", type=str, default="black", help="sets the background color. can be either a color name or hex code. defaults to black")
arg_parser.add_argument("--no-circular", "-C", action="store_false", default=True, help="Do not add more images after the last one has been displayed.")
arg_parser.add_argument("--debug", "-d", action="store_true", default=False, help="Print out debug information as well as general information. overridden by --silent")
arg_parser.add_argument("--no-fullscreen", "-F", action="store_false", default=True, help="stop the program from loading as fullscreen")
arg_parser.add_argument("--help", "-h", "-?", action="store_true", default=False, help="print commands and this usage message and exit")
arg_parser.add_argument("--include-all", "-i", action="store_true", default=False, help="This switch turns off the behavior for ignoring folders called ignore and .ignore")
arg_parser.add_argument("--logfile", "-l", type=str, default=None, help="specifies a file to print all non-fatal messages to.")
arg_parser.add_argument("--no-subdirs", "-n", action="store_false", default=True, help="Do not include subdirectories of directories passed in as arguments")
arg_parser.add_argument("--ordering", "-o", type=str, choices={"random", "sequential"}, default="sequential", help="specify the image ordering type. defaults to sequential")
arg_parser.add_argument("--paused", "-p", action="store_true", default=False, help="start paused. defaults to false")
arg_parser.add_argument("--secondary-rotate", "-r", type=float, default=23, help="specify the angle in degrees for the the Q/E secondary rotate binds.")
arg_parser.add_argument("--default-rotation", "-R", type=float, default=0, help="specify the default rotation for when images ar loaded")
arg_parser.add_argument("--silent", "-s", action="store_true", default=False, help="only print to the terminal on fatal errors")
arg_parser.add_argument("--stack-size", "-S", type=int, default=-1, help="stack size for previous images. defaults to no limit (-1)")
arg_parser.add_argument("--swap-interval", "-t", type=int, default=5000, help="time between image changes (in ms). defaults to 5 seconds (5000)")
arg_parser.add_argument("--wildcard", "-w", type=str, action="append", help="specify that a path is a wildcard string. everything is included if matched, even if invalid")
arg_parser.add_argument("--secondary-zoom", "-z", type=Fraction, default=Fraction("99/100"), help="specify the ratio for the the Z/C secondary zoom binds.")
arg_parser.add_argument("paths", nargs="*", type=str, help="paths to directories or files with images")

args = arg_parser.parse_args()

# NOTE: the rest of the global state is initialized in `reset`
#       specifically, the parts of the state that change with each image.

paths = args.paths

autoscale     = args.no_autoscale
bgcolor       = args.bgcolor
circular      = args.no_circular
debug         = args.debug
fullscreen    = args.no_fullscreen
help_arg      = args.help
include_all   = args.include_all
allow_subdirs = args.no_subdirs
random_order  = args.ordering == "random"
silent        = args.silent
stack_size    = args.stack_size
swap_interval = args.swap_interval
logfile       = None if args.logfile is None else open(args.logfile, "a", encoding="utf8")
wildcards     = args.wildcard

default_rotation = args.default_rotation % 360
if isclose(default_rotation, int(default_rotation)):
	default_rotation = int(default_rotation)

secondary_zoom = args.secondary_zoom.limit_denominator()
if secondary_zoom <= 0:
	print("\x1b[31mvalue to `--secondary-zoom` must be a positive number.\x1b[0m")
	exit(1)
if secondary_zoom > 1:
	secondary_zoom **= -1

secondary_rotate = args.secondary_rotate
if secondary_rotate < 0:
	secondary_rotate *= -1

pil_ext_map = Image.registered_extensions()
pil_openable_exts = {ext for ext in pil_ext_map if pil_ext_map[ext] in Image.OPEN}
pil_savable_exts = {ext for ext in pil_ext_map if pil_ext_map[ext] in Image.SAVE}

print_fatal = print # so fatal errors can guarantee their messages print.
def print(*args, file=None, **kwargs) -> None:
	"""
	print only if the program is not silenced.
	the `file` arg is never used, but exists so it is never in `kwargs`.
	it always prints to the logfile given to the program.
	"""

	if not silent:
		print_fatal(*args, file=logfile, **kwargs)

def get_image_paths(root: str | list[str] = "./", wildcards: list[str] = None) -> list[str]:
	"""
	if no root directory is given, tries to pick a good one, based on the user and OS.
	recursively gets images from the directory and returns them.
	"""

	if help_arg:
		return []

	from os import path
	from getpass import getuser
	from glob import glob as ls_wildcard

	print("finding images")

	try:
		username = getuser()
	except OSError:
		# getuser throws an OS error if something goes wrong.
		username = None

	if osname == "nt" and username == None:
		# username is only used with NT, so don't worry about a default on other OSs.
		# use Public because all users can access it.
		username = "Public"

	# try and give a default directory if no directory was given
	if not root and not wildcards:
		if osname == "nt":
			root = [f"C:/Users/{username}/Pictures/", f"C:/Users/{username}/OneDrive/Pictures/"]
		elif osname == "posix":
			root = "~/Pictures"
		elif osname == f"j{'a'}va":
			from re import sub

			password = input(f"D{'o'} you l{'i'}ke J{'a'}va?\n")

			if sub(r"[,;\.!\?]", "", password.lower()).strip() in {
				"no",
				"n",
				"0",
				"ew no",
				"no wtf",
				"hell nah",
				f"no java sucks",
				f"i hate j{'a'}va",
				f"no i hate j{'a'}va",
				f"i would rather use assembly than j{'a'}va that piece of shit language is genuinely beyond terrible"
			}:
				print_fatal("\x1b[31mNo directory given. The default directory is only supported on Windows and POSIX.\x1b[0m")
				exit(1)
			else:
				import signal
				from time import sleep

				for sig in signal.valid_signals():
					# I promise this is required.
					signal.signal(sig, lambda *args, **kwargs: None)

				print_fatal(f"\r\x1b[0Kho{'o'}d o{'n'} a mo{'me'}nt", end="", flush=True)
				sleep(0.5)
				while True:
					for _ in range(4):
						print_fatal(".", end="", flush=True)
						sleep(0.5)

					print_fatal("\x1b[4D\x1b[0K", end="", flush=True)
		else:
			# os2 or something?
			print_fatal("\x1b[31mNo directory given. The default directory is only supported on Windows and POSIX\x1b[0m")
			exit(1)

		print(f"No directory given; defaulting to {root !r}")

	if osname == "nt":
		if isinstance(root, str):
			if root[0:2] == "~/":
				root = f"C:/Users/{username}/{root[2:]}"
		else:
			for i, v in enumerate(root):
				if v[0:2] == "~/":
					root[i] = f"C:/Users/{username}/{v[2:]}"

	def ls(directory: str = "./", /) -> list[str]:
		"returns os.listdir() but with the absolute paths"
		from os import listdir

		return [path.join(directory, file).replace("\\", "/") for file in listdir(directory)]

	# recursively gets images from the directory and returns them
	if isinstance(root, str):
		paths = [root]
	elif isinstance(root, list) and all(isinstance(item, str) for item in root):
		paths = root
	else:
		raise ValueError("invalid type passed for `root` argument")

	if not isinstance(wildcards, list) or not all(isinstance(item, str) for item in wildcards):
		raise ValueError("invalid type passed for `wildcards` argument")

	files = []

	while paths:
		# the variable is called `directory` because it is
		# a directory for most of the loop.
		directory = paths.pop()

		if not path.isdir(directory):
			if path.isfile(directory):
				# file was given directly so bypass the text file ignore
				files.append(directory)
			else:
				print(f"\x1b[1;33mpath is not a file or directory: '{directory}'\x1b[0m")

			continue

		if not include_all and directory in {"ignore", ".ignore"}:
			continue

		# subdirectories
		for name in ls(directory):
			if path.isdir(name):
				if allow_subdirs:
					paths.append(name)
			else:
				files.append(name)

	# NOTE: this can technically return duplicate and non-file objects, but if
	#       you pass a wildcard pattern that returns folders, that's your fault.
	for pattern in wildcards:
		files += ls_wildcard(pattern, include_hidden=include_all)

	return [file for file in files if file.lower().endswith( tuple(pil_openable_exts) )]

#### basic things

original_image_paths: list[str] = get_image_paths(paths, wildcards)
original_image_paths.reverse() # images pop off the end not the start, so reverse it to get around that.

root = Tk()
timer_id: int = None
cursor_shown: bool = True
hidden_images: list[str] = []

screen_dim = root.winfo_screenwidth(), root.winfo_screenheight()
screen_width, screen_height = screen_dim
screen_center = screen_width // 2, screen_height // 2

canvas = Canvas(
	root,
	bg = bgcolor,
	width = screen_width,
	height = screen_height,
	highlightthickness = 0
)

if not original_image_paths and not help_arg:
	print_fatal(f"\x1b[31mNo images found in the specified director{"ies" if len(paths) > 1 else "y"}.\x1b[0m")
	exit(2)

if not help_arg:
	print(f"found {len(original_image_paths)} images")

del paths


def current_image_data() -> tuple[Image.Image, str, list[int], float | int, Fraction, int, tuple[int, int]]:
	return image, image_path, translation, rotation, zoom, distortion, original_size

def autoscale_image(scale: int | float | None = None) -> ImageTk.PhotoImage:
	"""
		this is called when an image is first rendered.
		it is not called upon resizing an image.

		if no scale is given, the image will be resized to
		the maximum size while still entirely visible.
		returns a PIL.ImageTk.PhotoImage instance
	"""

	global original_size

	img = Image.open(image_path)
	width, height = img.size

	if autoscale:
		if scale is None:
			scale = min(
				Fraction(screen_height, height).limit_denominator(),
				Fraction(screen_width, width).limit_denominator()
			)

		if scale == 1:
			return ImageTk.PhotoImage(img)

		if debug:
			print(f"autoscaling image by {scale:.4g}x ({scale})")

		width = int(scale * width)
		height = int(scale * height)

		original_size = (width, height)

		img = img.resize(original_size, resample=Image.LANCZOS)
	else:
		original_size = img.size

	return ImageTk.PhotoImage(img)

def next_image_path() -> str | None:
	"returns the absolute path of the next image"

	global image_paths

	if not original_image_paths:
		print("all remaining images are hidden; keeping the current image")
		return image_path

	if not image_paths:
		if not circular:
			print("slideshow is finished. there are no more images to display.")
			return

		print(f"no images left. {"reshuffling" if random_order else "restarting"}")
		image_paths = original_image_paths.copy()

	index = randrange(len(image_paths)) if random_order else len(image_paths) - 1

	return image_paths.pop(index)

def display_image(image: ImageTk.PhotoImage) -> None:
	"Takes in whatever ImageTk.PhotoImage(img) returns. centers the image on the screen."

	location =\
		screen_center[0] + translation[0],\
		screen_center[1] + translation[1]

	canvas.delete("all")
	canvas.create_image(*location, anchor="center", image=image)

#### event functions

def print_commands(event=None, /) -> None:
	from re import sub as replace, MULTILINE

	print(replace(pattern=r"^[\t ]*?\|", flags=MULTILINE, repl="", string="""\
		|(the commands here use Emacs syntax)
		|basic commands:
		|    bind    function name
		|    CS-c    close_canvas
		|                closes the program
		|    f       print_details
		|                prints a bunch of information about the image and the global state.
		|    F       print_hidden_paths
		|                print the paths of hidden images
		|    [       goto_stt
		|                traverses the stack back to the beginning (the first image)
		|    ]       goto_end
		|                traverses the stack to the last image that was previously rendered.
		|    X       pop_image
		|                removes the current image from the stack of images
		|                moves to the next image
		|    C-h     hide_image
		|                pops the current image off the stack, and
		|                stops it from appearing after further shuffles
		|                or after resetting via pressing `CS-R`.
		|    CS-h    unhide_image
		|                removes the most recently hidden image from the hidden list
		|                and adds it to the start of the list for future shuffles.
		|    space   pauseplay
		|                swaps between paused and playing
		|    h, ?    print_commands
		|                print this message with the available command binds
		|    CS-r    reset
		|                resets everything.
		|                does not recheck file/path existence
		|                does not change hidden status of images
		|    r       reset_changes
		|                resets translation, zoom, and rotation.
		|                undos artifacts from over-rotation
		|    CMS-Backspace
		|            delete_image
		|                delete the file associated with the current image
		|                hide the current image from appearing after future shuffles
		|    a       prev_image
		|                goes to the next image
		|    d       next_image
		|                goes back to the previous image in the stack
		|    u       edit_config_value
		|                opens the popup for editing config values.
		|                they do not persist across a program exit.
		|    o       export_image
		|                opens a command entry popup for exporting/copying an image.
		|                most functionality only works on Windows.
		|                only 'export image' works on all operating systems.
		|    f11     toggle_fullscreen
		|                toggles fullscreen, like in most programs.
		|    p       print_filepath
		|                print out the path of the currently-displayed image.
		|
		|number keys:
		|   \\d
		|                traverses forward n images into the stack.
		|                the same as pressing `d` n times, where n is a digit.
		|    M-\\d
		|                traverses backwards `n` images into the stack.
		|                the same as pressing `a` n times, where n is a digit.
		|
		|zoom:
		|    z           zooms out on the image about its center with a factor of 4/5
		|    c           zooms in on the image about its center with a factor of 5/4
		|    Z           zooms out on the image about its center with the secondary zoom factor of (default 99/100)
		|    C           zooms in on the image about its center with the secondary zoom factor of (default 100/99)
		|
		|translation:
		|    Up, W       move the image up by 10 pixels
		|    Right, D    move the image right by 10 pixels
		|    Down, S     move the image down by 10 pixels
		|    Left, A     move the image left by 10 pixels
		|
		|
		|    S-Up, C-w   move the image up by 1 pixel
		|    S-Right, C-d
		|                move the image right by 1 pixel
		|    S-Down, C-s
		|                move the image down by 1 pixel
		|    S-Left, C-a
		|                move the image left by 1 pixel
		|
		|rotation:
		|    q           rotate the image 90° CCW about its center
		|    e           rotate the image 90° CW about its center
		|    Q           rotate the image CCW about its center with the secondary rotation angle (default 23°)
		|    E           rotate the image CW about its center with the secondary rotation angle (default 23°)
		|
		|cursor:
		|    lclick  next_image
		|                see the description for `d`
		|    rclick  prev_image
		|                see the description for `a`
		|    motion  show_cursor
		|                the cursor gets hidden when images are switched.
		|                it is re-shown on mouse movement
		|"""))

def print_hidden_paths(event=None, /) -> None:
	"print the list of hidden paths"

	print("hidden images:")

	for path in hidden_images:
		print(f"\t{path}")

def print_details(event=None, /) -> None:
	"display information about the currently displayed image"

d	elapsed_time = time() - start_time
	ms = round(elapsed_time % 1 * 1000)
	seconds = int(elapsed_time)
	# probably only ms, s, and min are useful
	minutes, seconds = divmod(seconds, 60)
	hours, minutes = divmod(minutes, 60)
	days, hours = divmod(hours, 24)

	# Dd, HH:MM:SS.MMS
	elapsed_time = \
		(f"{days}d, " if days != 0 else "") + \
		(f"{hours:02d}:" if hours != 0 else "") + \
		(f"{minutes:02d}:" if minutes != 0 else "00:" if days != 0 else "") + \
		(f"{seconds}.{ms:03d}s" if hours == minutes == 0 else f"{seconds:02}.{ms:03d}")

	x, y = translation
	t_dir = ("origin" if x == 0 else "right" if x > 0 else "left"), \
		("origin" if y == 0 else "down" if y > 0 else "up")

	angle = (rotation + 180) % 360 - 180
	if angle == -180:
		angle = 180

	# NOTE: next_stack_size is the images you have loaded but then moved back before.
	print(
		"details:" + \
		f"\n    prev stack size  │ {len(prev_image_stack)}" + \
		f"\n    next stack size  │ {len(next_image_stack)}" + \
		f"\n    images left      │ {len(image_paths)}" + \
		f"\n    hidden images    │ {len(hidden_images)}" + \
		f"\n    time elapsed     │ {elapsed_time}" + \
		f"\n    paused           │ {paused}" + \
		f"\n    default rotation │ {default_rotation}" + \
		f"\n   ──────────────────┼────────────────────────" + \
		f"\n    image path       │ {image_path}" + \
		f"\n    translation      │ {tuple(translation)} ({", ".join(t_dir)})" + \
		f"\n    rotation         │ {angle}° {"" if angle == 0 else "ccw" if rotation > 0 else "cw"}" + \
		f"\n    zoom             │ {float(zoom):.4g}x{'' if zoom == 1 else f' ({zoom.limit_denominator()})'}" + \
		f"\n    distortion       │ {distortion} ops"
	)

def print_current_filename(event=None, /) -> None:
	print(f"current file: {image_path}")

def reset(event=None, /, *, first: bool = False) -> None:
	"initializes global state (or resets it when called after the first time)"
	global image_paths, original_size, prev_image_stack, next_image_stack, \
		translation, rotation, zoom, distortion, image, image_path, paused

	image_paths = original_image_paths.copy()
	original_size = None
	prev_image_stack = []
	next_image_stack = []
	translation = [0, 0]
	rotation = 0
	zoom = Fraction(1)
	distortion = int(autoscale)
	image = None
	image_path = None
	paused = args.paused

	print(f"{"starting" if first else "restarting"} slideshow {'randomly' if random_order else 'sequentially'}")

	next_image()

def reset_changes(event=None, /) -> None:
	global image, translation, rotation, zoom, distortion

	if debug:
		print("resetting changes on image")

	translation = [0, 0]
	rotation = default_rotation
	zoom = Fraction(1)
	distortion = int(autoscale)

	# undo rotation pixelation and zoom blur
	# `image` can't be reused because some transformations are not reversible. It must be fully reloaded.
	img = Image.open(image_path)

	if autoscale:
		# otherwise, original_size is the actual original size and the resize call is redundant.
		img = img.resize(original_size, resample=Image.LANCZOS)

	image = ImageTk.PhotoImage(img)

	# redisplay the image with the new translation/rotation/zoom
	if default_rotation != 0:
		# NOTE: `rotate` calls `display_image` at the end, so it can be used in place of it.
		rotate(image, angle=default_rotation)
	else:
		display_image(image)

def next_image(event=None, /) -> None:
	"prints the next image to the canvas and starts a timer for the next swap."

	if event is None and paused:
		# change it to be anything other than None
		# This stops it from unpausing
		event = True

	global image_path, translation, rotation, zoom, distortion, original_size, image, timer_id

	if next_image_stack:
		# the images that have been loaded and then put back.
		if image is not None:
			prev_image_stack.append(current_image_data())

		image, image_path, translation, rotation, zoom, distortion, original_size = next_image_stack.pop()

		if debug:
			print(f"moving to next image (previously rendered): {image_path}")

		display_image(image) # never rotate it if it comes from `next_image_stack`
	else:
		# generate a new image from the unrendered images.
		tmp = next_image_path()
		if tmp is None:
			return

		if image is not None:
			prev_image_stack.append(current_image_data())


		if debug:
			print(f"moving to next image: {image_path}")

		image_path = tmp
		image = autoscale_image()
		translation = [0, 0]
		rotation = 0
		zoom = Fraction(1)
		distortion = int(autoscale)

		if default_rotation != 0:
			# NOTE: `rotate` calls `display_image` at the end, so it can be used in place of it.
			rotate(image, angle=default_rotation)
		else:
			display_image(image)

	if stack_size != -1 and len(prev_image_stack) > stack_size:
		# remove the oldest one
		# NOTE: this is where collections.deque would help
		prev_image_stack.pop(0)

	hide_cursor()

	if timer_id is not None:
		root.after_cancel(timer_id)

	if paused and event != None:
		# don't start the timer when paused if it switched from user interaction.
		return

	timer_id = root.after(swap_interval, next_image)

def prev_image(event=None, /) -> None:
	global image, image_path, translation, rotation, zoom, distortion, original_size

	if prev_image_stack:
		next_image_stack.append(current_image_data())

		image, image_path, translation, rotation, zoom, distortion, original_size = prev_image_stack.pop()

		if debug:
			print(f"moving to previous image: {image_path}")

		display_image(image)
	else:
		print("image stack underflow. retaining the current image")

def pop_image(event=None, /) -> None:
	"goes to the next image and removes the current one from the stack"

	global image, image_path, translation, rotation, zoom, distortion

	print(f"popping image: {image_path}")

	image = None # decrement the reference counter for the image object.
	image_path = None
	translation = [0, 0]
	rotation = 0
	zoom = Fraction(1)
	distortion = 0

	next_image()

def hide_image(event=None, /) -> None:
	"pops the image and hides it from showing up after future shuffles"

	if len(original_image_paths) == 1:
		print(f"image hiding failed (can't hide last image): {image_path}")
		return

	print(f"hiding image: {image_path}")

	hidden_images.append(image_path)

	original_image_paths.remove(image_path)

	pop_image()

def unhide_image(event=None, /) -> None:
	"""
	unhides the most recently hidden image and adds it to the start of the image list for future shuffles.
	if no images have been hidden, this does nothing.
	"""

	if not hidden_images:
		print("image unhide failed. no hidden images left.")
		return


	last_hidden_image = hidden_images.pop()

	print(f"unhiding image: {last_hidden_image}")
	original_image_paths.append(last_hidden_image)

def delete_image(event=None, /) -> None:
	"""
	delete the image file and hide the image.
	"""

	from os import remove as rmfile


	result = simpledialog.messagebox.askquestion(
		"Delete File",
		"Are you sure you want to delete the current file?"
	)

	if result == "yes":
		print(f"removing file: {image_path}")
		rmfile(image_path)

	hide_image(image)

def next_image_n(event=None, /, *, n: int = 1) -> None:
	print(f"traversing ahead {n} images at once")

	for i in range(n):
		next_image(event)

def prev_image_n(event=None, /, *, n: int = 1) -> None:
	print(f"traversing back {n} images at once")

	for i in range(n):
		prev_image(event)

def pauseplay(event=None, /) -> None:
	"if there is no timer, go to the next image, otherwise cancel the timer"

	global timer_id, paused

	if timer_id is not None:
		print("pause")
		root.after_cancel(timer_id)
		timer_id = None
		paused = True
	else:
		print("play")
		paused = False
		next_image()

def close_canvas(event=None, /) -> None:
	"clears the canvas, destroys the window, and exits the program"

	if event is not None:
		print("^C")

	canvas.delete("all")
	root.destroy()

	if logfile is not None and not logfile.closed:
		logfile.close()

	exit(0)

def show_cursor(event=None, /) -> None:
	global cursor_shown

	if cursor_shown:
		return

	if debug:
		print("showing cursor")

	cursor_shown = True
	root.config(cursor="")

def hide_cursor(event=None, /) -> None:
	global cursor_shown

	if not cursor_shown:
		return

	if debug:
		print("hiding cursor")

	cursor_shown = False
	root.config(cursor="none")

def goto_stt(event=None, /) -> None:
	print("traversing to beginning")

	# this can't be made any faster because they have to be put back into `next_image_stack`.
	# so it can't just grab prev_image_stack[0] and set all the corresponding values.
	while prev_image_stack:
		prev_image()

def goto_end(event=None, /) -> None:
	print("traversing to current position")

	while next_image_stack:
		next_image()

def translate(event=None, /, vec: tuple[int, int] = (0, 0)) -> None:
	"translate the image by an x and y amount of pixels, and redisplay the image."

	if debug:
		print(f"translate({None if event is None else f"<{type(event).__name__} event ...>"}, vec={vec})")

	translation[0] += vec[0]
	translation[1] += vec[1]

	display_image(image)

def rotate(event=None, /, *, angle: float | int = 90) -> None:
	"rotate the displayed image"

	global image, rotation, distortion

	if debug:
		print(f"rotate({None if event is None else f"<{type(event).__name__} event ...>"}, angle={type(angle).__name__}({angle}))")

	angle %= 360
	rotation = (rotation + angle) % 360
	if angle % 90 != 0:
		distortion += 1

	# image starting type is ImageTk.PhotoImage
	img = ImageTk.getimage(image)         # convert to Image.Image
	img = np_array(img)                   # convert to numpy.ndarray
	img = skew_rotate(
		img,
		degrees=angle,
		direction="counterclockwise",
	) # apply rotation
	img = Image.fromarray(img)            # convert to Image.Image
	image = ImageTk.PhotoImage(img)       # convert back to ImageTk.PhotoImage
	display_image(image)

def rotate_secondary_fn(event=None, /, *, clockwise: bool = False) -> None:
	rotate(event, angle=secondary_rotate * (-1 if clockwise else 1))

def zoom_fn(event=None, /, *, scale: Fraction = Fraction(3, 2)) -> None:
	"zoom in or out on the displayed image."
	global image, zoom, distortion

	if not isinstance(scale, Fraction):
		raise TypeError("scaling can only be done by a Fraction ratio.")

	if scale == 1:
		if debug:
			print("ignoring 1x zoom operation")

		return

	if debug:
		print(f"zoom({None if event is None else f"<{type(event).__name__} event ...>"}, scale=Fraction(\"{scale}\"))")

	img = ImageTk.getimage(image)

	# TODO: do something if scale < 0. probably pad it since an exception will not be caught.

	# stop displaying the current image
	image = None

	x, y = img.size # NOTE: this is the updated x and y given the previous zoom, not the original x and y.

	zoom *= scale
	distortion += 1

	x = int(x * scale)
	y = int(y * scale)
	img = img.resize((x, y), resample=Image.LANCZOS)

	image = ImageTk.PhotoImage(img)

	display_image(image)

def zoom_secondary_fn(event=None, /, *, inverse: bool = False) -> None:
	zoom_fn(event, scale=secondary_zoom ** (-1 if inverse else 1))

def toggle_fullscreen(event=None, /) -> None:
	global fullscreen

	fullscreen = not fullscreen
	root.attributes("-fullscreen", fullscreen)

def export_image(event=None, /) -> bool:
	from PIL import ImageGrab
	from os import path

	show_cursor()

	title = "Image Exporter"

	while True:
		command = simpledialog.askstring(title, "export command:")

		if command in {None, "", "cancel"}:
			return False

		# normalize to the shorter names
		if command.startswith("copy image"):
			command = "ci" + command[10:]
		elif command.startswith("copy window"):
			command = "cw" + command[11:]
		elif command.startswith("export image"):
			command = "ei" + command[12:]
		elif command.startswith("export window"):
			command = "ew" + command[13:]

		# normalize the image so both branches do the same thing
		if command == "ci":
			if osname != "nt":
				simpledialog.messagebox.showinfo(title, "export command 'copy image' is Windows exclusive")
				return False

			img = ImageTk.getimage(image)
			export_type = "image"
		elif command == "cw":
			if osname != "nt":
				simpledialog.messagebox.showinfo(title, "export command 'copy window' is Windows exclusive")
				return False

			img = ImageGrab.grab(window=root.winfo_id(), all_screens=True)
			export_type = "window"
		elif command.startswith("ei "):
			img = ImageTk.getimage(image)
			export_type = "image"
		elif command.startswith("ew "):
			if osname != "nt":
				simpledialog.messagebox.showinfo(title, "export command 'export window' is Windows exclusive")
				return False

			img = ImageGrab.grab(window=root.winfo_id(), all_screens=True)
			export_type = "window"

		if command in {"ci", "cw"}:
			import win32clipboard as clip
			from io import BytesIO

			# convert to 32-bit DIB format
			with BytesIO() as output:
				img.convert("RGB").save(output, "BMP")
				data = output.getvalue()[14:] # remove BMP header

			clip.OpenClipboard()

			try:
				clip.EmptyClipboard()
				clip.SetClipboardData(clip.CF_DIB, data)
			finally:
				clip.CloseClipboard()

			print(f"copying current {export_type} to clipbord")
		elif command.startswith("ei ") or command.startswith("ew "):
			filename = command[3:]
			ext = path.splitext(filename)[1]

			if ext not in pil_ext_map:
				simpledialog.messagebox.showinfo(title, f"extension \"{ext}\" is not recognized by Pillow")
				continue

			if ext not in pil_savable_exts:
				simpledialog.messagebox.showinfo(title, f"Pillow cannot save in the format: {pil_ext_map[ext]}")
				continue

			img.save(filename)
			print(f"exporting current {export_type} to file: {filename}")
		else:
			simpledialog.messagebox.showinfo(title,
				"valid options are:\n" +
				" - cancel\n" +
				" - copy image / ci\n" +
				" - copy window / cw\n" +
				" - export image / ei. (with the file path after it)\n"
				" - export window / ew. (with the file path after it)"
			)

			continue

		return True

def edit_config_value(event=None, /) -> bool:
	"returns true if a value was changed and false if it wasn't. changes global state."

	from collections.abc import Callable

	global secondary_rotate, secondary_zoom, swap_interval, random_order, \
		silent, default_rotation, autoscale, debug, circular

	show_cursor()

	ask_i = simpledialog.askinteger
	ask_s = simpledialog.askstring
	ask_f = simpledialog.askfloat

	title = "Config Value Editor"

	def ask_for_value(
		asker: Callable = ask_s,
		*,
		title: str = title,
		msg: str = "value:",
		cond: Callable = lambda val: True,
		callback: Callable = lambda val: None,
		ret_new: bool = False, # return the value from the callback and not the original value.
		catch_type: BaseException = None,
		err_msg: str | Callable | None = None
	):
		while True:
			val = asker(title, msg)

			if val in {None, "", "cancel"}:
				return None

			if cond(val):
				if catch_type is None:
					tmp = callback(val)
					return tmp if ret_new else val
				else:
					try:
						tmp = callback(val)
						# condition was true and the callback didn't error out
						return tmp if ret_new else val
					except catch_type:
						pass

			if err_msg is not None:
				if callable(err_msg):
					err_msg = err_msg(val)

				simpledialog.messagebox.showinfo(title, err_msg)

	# the rest of this function assumes there is at least one allowable value
	allowable_options = frozenset({"rotation bind", "zoom bind", "interval", "ordering",
		"bgcolor", "title", "cancel", "default rotation", "silent", "autoscale", "circular", "debug", "fullscreen"})

	root.withdraw() # TODO: pause the slideshow until the end.
	canceled = True # this is changed to False on a regular exit

	try:
		# ask for the config type
		option = ask_for_value(ask_s, msg="What do you want to edit?\nenter 'help' for options",
			cond=lambda val: val in allowable_options,
			callback=lambda val: val.lower(),
			ret_new=True,
			err_msg=f"allowable values are: help, {", ".join(allowable_options)}"
		)

		if option in {None, "", "cancel"}:
			return False

		# ask for the new config value

		if option == "rotation bind":
			tmp = ask_for_value(ask_f, msg="secondary rotation angle:")

			if tmp is None:
				return False

			if isclose(tmp, int(tmp)):
				tmp = int(tmp)

			secondary_rotate = tmp % 360
			print(f"setting secondary rotation angle to {secondary_rotate}")
		elif option == "zoom bind":
			tmp = ask_for_value(ask_s, msg="secondary zoom factor:",
				# limit the denominator in case they pass a float and not a fraction.
				cond=lambda val: val > 0,
				callback=lambda val: Fraction(val).limit_denominator(),
				ret_new=True,
				err_msg="invalid zoom factor. it must be a positive value of type: int, float, or Fraction.",
				catch_type=ValueError
			)

			if tmp is None:
				return False

			secondary_zoom = tmp
			print(f"setting secondary zoom factor to {secondary_zoom}")
		elif option == "interval":
			tmp = ask_for_value(ask_i, msg="image swap interval (ms):",
				cond=lambda val: val > 0,
				err_msg="invalid image swap interval: must be positive.",
			)

			swap_interval = tmp
			print(f"setting image swap interval to {swap_interval}")
		elif option == "ordering":
			tmp = ask_for_value(ask_i, msg="random or sequential ordering:",
				cond=lambda val: val in {"random", "sequential"},
				err_msg="invalid ordering type: must be random or sequential.",
			)

			random_order = tmp.lower() == "random"
			print(f"setting ordering to {tmp}")
		elif option == "bgcolor":
			tmp = ask_for_value(ask_s, msg="background color:",
				callback=lambda val: canvas.config(background=val),
				catch_type=TclError,
				err_msg=lambda val: f"value '{val}' is not a valid Tcl color.",
			)

			if tmp == None:
				return False

			print(f"setting bgcolor to \"{tmp}\"")
		elif option == "title":
			tmp = ask_for_value(ask_s, msg="title:")

			if tmp == None:
				return False

			root.title(tmp)
			print(f"setting title to \"{tmp}\"")
		elif option == "default rotation":
			tmp = ask_for_value(ask_f, msg="default image rotation:")

			if tmp is None:
				return False

			if isclose(tmp, int(tmp)):
				tmp = int(tmp)

			default_rotation = tmp % 360

			print(f"setting default image rotation to {default_rotation}")
		elif option == "silent":
			tmp = ask_for_value(ask_s, msg="silent:",
				cond=lambda val: val.lower() in {"true", "false"},
				err_msg="invalid value: must be a boolean.",
			)

			if tmp is None:
				return False

			silent = tmp.lower() == "true"
			print(f"setting silent to {silent}")
		elif option == "autoscale":
			tmp = ask_for_value(ask_s, msg="autoscale:",
				cond=lambda val: val.lower() in {"true", "false"},
				err_msg="invalid value: must be a boolean.",
			)

			if tmp is None:
				return False

			autoscale = tmp.lower() == "true"
			print(f"setting autoscale to {autoscale}")
		elif option == "circular":
			tmp = ask_for_value(ask_s, msg="circular slideshow:",
				cond=lambda val: val.lower() in {"true", "false"},
				err_msg="invalid value: must be a boolean.",
			)

			if tmp is None:
				return False

			circular = tmp.lower() == "true"
			print(f"setting circular to {circular}")
		elif option == "debug":
			tmp = ask_for_value(ask_s, msg="debug:",
				cond=lambda val: val.lower() in {"true", "false"},
				err_msg="invalid value: must be a boolean.",
			)

			if tmp is None:
				return False

			debug = tmp.lower() == "true"
			print(f"setting debug to {debug}")
		elif option == "fullscreen":
			tmp = ask_for_value(ask_s, msg="fullscreen:",
				cond=lambda val: val.lower() in {"true", "false"},
				callback=lambda val: root.attributes("-fullscreen", val.lower() == "true"),
				err_msg="invalid value: must be a boolean.",
			)

			if tmp is None:
				return False

			fullscreen = tmp.lower() == "true"
			print(f"setting fullscreen to {fullscreen}.")
		else:
			assert False, "unreachable. options variable mismatches with the if-else chain."

		canceled = False
		return True
	finally:
		if canceled:
			print("canceled value editing")

		root.deiconify()

#### binding functions

def bind_basic_commands(root=root) -> None:
	root.bind("<Control-C>", close_canvas) # C-C == CS-c
	root.bind("<f>", print_details)
	root.bind("<F>", print_hidden_paths)
	root.bind("<[>", goto_stt)
	root.bind("<]>", goto_end)
	root.bind("<X>", pop_image)
	root.bind("<Control-h>", hide_image)
	root.bind("<Control-H>", unhide_image)
	root.bind("<space>", pauseplay)
	root.bind("</>", print_commands)
	root.bind("<h>", print_commands)
	root.bind("<?>", print_commands)
	root.bind("<Control-R>", reset) # C-R == CS-r
	root.bind("<r>", reset_changes)
	root.bind("<Control-Alt-Shift-BackSpace>", delete_image)
	root.bind("<a>", prev_image)
	root.bind("<d>", next_image)
	root.bind("<u>", edit_config_value)
	root.bind("<o>", export_image)
	root.bind("<p>", print_current_filename)
	root.bind("<F11>", toggle_fullscreen)

def bind_number_keys(root=root) -> None:
	root.bind("<1>"      , partial(next_image_n, n=1))
	root.bind("<2>"      , partial(next_image_n, n=2))
	root.bind("<3>"      , partial(next_image_n, n=3))
	root.bind("<4>"      , partial(next_image_n, n=4))
	root.bind("<5>"      , partial(next_image_n, n=5))
	root.bind("<6>"      , partial(next_image_n, n=6))
	root.bind("<7>"      , partial(next_image_n, n=7))
	root.bind("<8>"      , partial(next_image_n, n=8))
	root.bind("<9>"      , partial(next_image_n, n=9))

	root.bind("<Shift-1>", partial(prev_image_n, n=1))
	root.bind("<Shift-2>", partial(prev_image_n, n=2))
	root.bind("<Shift-3>", partial(prev_image_n, n=3))
	root.bind("<Shift-4>", partial(prev_image_n, n=4))
	root.bind("<Shift-5>", partial(prev_image_n, n=5))
	root.bind("<Shift-6>", partial(prev_image_n, n=6))
	root.bind("<Shift-7>", partial(prev_image_n, n=7))
	root.bind("<Shift-8>", partial(prev_image_n, n=8))
	root.bind("<Shift-9>", partial(prev_image_n, n=9))

def bind_translation_keys(root=root) -> None:
	# The keypad numbers are commented out because they don't work.

	## 10px translations

	fn = partial(translate, vec=(0, -10))
	root.bind("<Up>", fn)
	root.bind("<W>", fn)

	fn = partial(translate, vec=(10, 0))
	root.bind("<Right>", fn)
	root.bind("<D>", fn)

	fn = partial(translate, vec=(0, 10))
	root.bind("<Down>", fn)
	root.bind("<S>", fn)

	fn = partial(translate, vec=(-10, 0))
	root.bind("<Left>", fn)
	root.bind("<A>", fn)

	## 1px translations

	fn = partial(translate, vec=(0, -1))
	root.bind("<Shift-Up>", fn)
	root.bind("<Control-w>", fn)

	fn = partial(translate, vec=(1, 0))
	root.bind("<Shift-Right>", fn)
	root.bind("<Control-d>", fn)

	fn = partial(translate, vec=(0, 1))
	root.bind("<Shift-Down>", fn)
	root.bind("<Control-s>", fn)

	fn = partial(translate, vec=(-1, 0))
	root.bind("<Shift-Left>", fn)
	root.bind("<Control-a>", fn)

def bind_rotation_keys(root=root) -> None:
	root.bind("<q>", partial(rotate, angle=90))
	root.bind("<e>", partial(rotate, angle=-90))

	root.bind("<Q>", rotate_secondary_fn)
	root.bind("<E>", partial(rotate_secondary_fn, clockwise=True))

def bind_zoom_keys(root=root) -> None:
	root.bind("<z>", partial(zoom_fn, scale=Fraction(4, 5))) # zoom out
	root.bind("<c>", partial(zoom_fn, scale=Fraction(5, 4))) # zoom in

	root.bind("<Z>", zoom_secondary_fn) # zoom out
	root.bind("<C>", partial(zoom_secondary_fn, inverse=True)) # zoom in

def bind_mouse_buttons(root=root) -> None:
	root.bind("<Button-1>", next_image) # left click
	root.bind("<Button-3>", prev_image) # right click
	root.bind("<Motion>", show_cursor)

#### script

start_time = time()

if help_arg:
	print_commands()
	print()

	arg_parser.print_help()
	exit(0)

root.configure(background=bgcolor)
root.attributes("-fullscreen", fullscreen)
root.title("slideshow")
canvas.pack(expand=True, fill="both")

# supposedly, this doesn't always work. It only matters if you type something ...
# into the terminal in between starting the program and opening the window.
root.focus_force()

bind_basic_commands()
bind_number_keys()
bind_zoom_keys()
bind_translation_keys()
bind_rotation_keys()
bind_mouse_buttons()
reset(first=True)

try:
	root.mainloop()
except KeyboardInterrupt:
	# handle ^C from the terminal side
	close_canvas()
