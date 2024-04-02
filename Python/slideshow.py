#!/usr/bin/env python3

"""
basically the same thing as PhotoScreensaver.scr, but with more flexibility.
Also kind of like google slides, but only with images, and different.
"""

# TODO: add more right-hand control options, ie: with arrow keys, mouse, etc.
# TODO: allow keybind control
# TODO: add controls to swap image ordering
# TODO: add function to unhide most recently hidden path
# TODO: make the beginning function not actually traverse the stack
# TODO: add shift-space : unpause but don't go to the next one, just start the timer
# TODO: add `--silent` or `--quiet` argument, or `--verbose`
# TODO: option to change timing without restart
# TODO: add keybind for `enlarge to fit closest edge
# TODO: use `collections.deque` for the stacks
# TODO: make numpad 8, 4, 5, 6 be the same as wasd.
# TODO: make a `go to the end` function. go until the next stack is empty
# TODO: make w/NP_8 and s/NP_5 have some function
# TODO/Maybe: add extra statistics to details?
# TODO/Maybe: allow multi-monitor support?
# TODO/Maybe: allow the user to choose the background color?

from os        import path
from sys       import exit
from PIL       import Image, ImageTk # Pillow
from random    import randrange
from tkinter   import Canvas, Tk
from argparse  import ArgumentParser
from functools import partial

#### argument parsing

arg_parser = ArgumentParser(add_help=False, description="image slideshow program")

arg_parser.add_argument("--change-time", "-c", type=int, default=5000, help="time between swaps (in ms). defaults to 5 seconds")
arg_parser.add_argument("--stack-size", "-s", type=int, default=-1, help="stack size for previous images. defaults to no limit (-1)")
arg_parser.add_argument("--paused", "-p", action="store_true", default=False, help="start paused. defaults to false")
arg_parser.add_argument("--help", "-h", action="store_true", default=False, help="print commands and this usage message and exit")
arg_parser.add_argument("--sequential", "-S", action="store_true", default=False, help="load images sequentially instead of randomly. defaults to false")
arg_parser.add_argument("--include-all", "-i", action="store_true", default=False, help="This switch turns off the behavior described here. Ignore files with the following extensions: .txt, .text, .md, and .org. Ignore folders called ignore. Ignore files called readme, license, or ignore.")
arg_parser.add_argument("--no-subdirs", "-n", action="store_true", default=False, help="Do not include subdirectories of directories passed in as arguments")
arg_parser.add_argument("paths", nargs="*", type=str, help="paths to directories or files with images")


args = arg_parser.parse_args()


help_arg = args.help
directories = args.paths
sequential = args.sequential
ignore = not args.include_all
allow_subdirs = not args.no_subdirs
swap_time = args.change_time
stack_size = args.stack_size

if not directories and not help_arg:
	from os import name as osname

	if osname == "nt":
		from getpass import getuser
		# I don't know what the default directory should be on other platforms
		directories = f"C:/Users/{getuser()}/Pictures/"
		del getuser
	elif osname == "posix":
		directories = "~/Pictures"
	elif osname == "java":
		from re import sub

		password = input("Do you like Java?")

		if sub(r"[\?,]", "", password.lower()) in {"no", "n", "0", "no what the fuck", "no fuck you", "who the fuck does", "do i look like a sadist"}:
			print("No directory given. The default directory is only supported on Windows and POSIX.")
			exit(1)
		else:
			# TODO: find malware and execute it here.

			while True:
				print("Fuck Java, Fuck Jython, Fuck you")
	else:
		# ChatGPT says this is either "java" or "os2". I don't care about either of them
		print("No directory given. The default directory is only supported on Windows and POSIX")
		exit(1)

	print(f"No directory given; defaulting to {directories !r}")

	del osname

#### basic things

def get_images_recursively(root: list[str, ...] = "./") -> list[str, ...]:
	"recursively gets images from the directory and returns them"

	def ls(directory: str = "./", /) -> list[str, ...]:
		"returns os.listdir() but with the absolute paths"
		from os import listdir

		return [path.join(directory, file).replace("\\", "/") for file in listdir(directory)]

	def extname(filepath: str) -> str:
		return path.splitext(filepath)[1]

	if isinstance(root, str):
		directories = [root]
	elif isinstance(root, list) and all(isinstance(item, str) for item in root):
		directories = root
	else:
		raise ValueError("invalid type passed for `root` argument")

	files = []

	while directories:
		directory = directories.pop()

		if not path.isdir(directory):
			if path.isfile(directory):
				# file was given directl so bypass the text file ignore
				files.append(directory)

			# the path does not exist
			continue

		if ignore and directory == "ignore":
			continue

		# subdirectories
		for name in ls(directory):
			if path.isdir(name):
				if allow_subdirs:
					directories.append(name)
			elif ignore and name.lower() not in {"readme", "license", "ignore"} and\
				extname(name).lower() not in {".txt", ".text", ".md", ".org"}:

				files.append(name)

	return [file for file in files if file.lower().endswith((
		# .avif is not supported by Pillow
		".bmp",
		".gif",
		".ico",
		".jpeg",
		".jpg",
		".jfif",
		".png",
		".tiff",
		".webp",
	))]

original_image_paths: list = get_images_recursively(directories)
del get_images_recursively

root = Tk()
timer_id: int = None
hidden_images: list[str, ...] = []

screen_dim = root.winfo_screenwidth(), root.winfo_screenheight()
screen_width, screen_height = screen_dim
screen_center = screen_width // 2, screen_height // 2

canvas = Canvas(
	root,
	bg = "black",
	width = screen_width,
	height = screen_height,
	highlightthickness = 0
)

if not original_image_paths and not help_arg:
	print(f"No images found in the specified director{"ies" if len(directories) > 1 else "y"}.")
	exit(2)

del directories

def current_image_data() -> tuple[Image.Image, str, list[int, int], tuple[int, int]]:
	return image, image_path, translation, original_size

def resized_image(scale: int | float = None):
	"""
		if no scale is given, the image will be resized to
		the maximum size while still entirely visible.
		returns a PIL.ImageTk.PhotoImage instance
	"""

	global original_size

	img = Image.open(image_path)
	width, height = img.size


	if scale is None:
		scale = min(
			screen_height / height,
			screen_width / width,
		)

	width = int(width * scale)
	height = int(height * scale)

	original_size = (width, height)

	img = img.resize(original_size, resample=Image.LANCZOS)

	return ImageTk.PhotoImage(img)

def next_image_path() -> str:
	"returns the absolute path of the next image"

	global image_paths

	if not original_image_paths:
		print("all remaining images are hidden; keeping the current image")
		return image_path

	if not image_paths:
		print("no images left. reshuffling")
		image_paths = original_image_paths.copy()

	index = len(image_paths) - 1 if sequential else randrange(len(image_paths))

	return image_paths.pop(index)

def display_image(image: ImageTk.PhotoImage) -> None:
	"Takes in whatever ImageTk.PhotoImage(img) returns. centers the image on the screen."

	location =\
		screen_center[0] + translation[0],\
		screen_center[1] + translation[1]

	canvas.delete("all")
	canvas.create_image(*location, anchor="center", image=image)

#### event functions

def print_commands(event=None) -> None:
	from re import sub as replace, MULTILINE

	# TODO: make this not outdated
	print(replace(pattern=r"^[\t ]*?\|", flags=MULTILINE, repl="", string="""\
		|(the commands here use Emacs syntax)
		|basic commands:
		|    C-C    close_canvas
		|                closes the program
		|    f       print_details
		|                prints the following information:
		|                    - absolute path to the current image
		|                    - number of previous images in the stack
		|                    - number of next images in the stack
		|                    - the number of hidden images
		|                    - whether or not the presentation is paused
		|                    - the translation of the image displayed (x, y)
		|                    - the zoom factor of the current image
		|    F       print_hidden_paths
		|                print the paths of hidden images
		|    b       beginning
		|                traverses the stack back to the beginning (the first image)
		|    X       pop_image
		|                removes the current image from the stack of images
		|                moves to the next image
		|    h       hide_image
		|                pops the current image off the stack, and
		|                stops it from appearing after further shuffles
		|                or after resetting via pressing `C-R`.
		|    space   pauseplay
		|                swaps between paused and playing
		|    /       print_commands
		|                print this message with the available commands
		|
		|    C-R     reset
		|                resets everything.
		|                does not recheck file/path existence
		|                does not change hidden status of images
		|    r       reset_changes
		|                resets translation, zoom, and rotation.
		|                undos artifacts from over-rotation
		|    CMS-BackSpace  delete_image
		|                       delete the file associated with the current image
		|                       hide the current image from appearing after future shuffles
		|
		|
		|    a       prev_image
		|                goes to the next image
		|    d       next_image
		|                goes back to the previous image in the stack
		|
		|number keys:
		|    1
		|                traverses back 1 image into the stack.
		|                the same as pressing `a` once
		|
		|    2
		|                traverses back 2 images into the stack.
		|                the same as pressing `a` 2 times
		|
		|    3
		|                traverses back 3 images into the stack.
		|                the same as pressing `a` 3 times
		|
		|    4
		|                traverses back 4 images into the stack.
		|                the same as pressing `a` 4 times
		|
		|    5
		|                traverses back 5 images into the stack.
		|                the same as pressing `a` 5 times
		|
		|    6
		|                traverses back 6 images into the stack.
		|                the same as pressing `a` 6 times
		|
		|    7
		|                traverses back 7 images into the stack.
		|                the same as pressing `a` 7 times
		|
		|    8
		|                traverses back 8 images into the stack.
		|                the same as pressing `a` 8 times
		|
		|    9
		|                traverses back 9 images into the stack.
		|                the same as pressing `a` 9 times
		|
		|zoom:
		|    z
		|                zooms out on the image about its center with a factor of 4/5
		|
		|    c
		|                zooms in on the image about its center with a factor of 5/4
		|
		|    Z
		|                zooms out on the image about its center with a factor of 99/100
		|
		|    C
		|                zooms in on the image about its center with a factor of 100/99
		|
		|translation:
		|    Up, W
		|                move the image up by 10 pixels
		|
		|    Right, D
		|                move the image right by 10 pixels
		|
		|    Down, S
		|                move the image down by 10 pixels
		|
		|    Left, A
		|                move the image left by 10 pixels
		|
		|
		|    S-Up, C-w
		|                move the image up by 1 pixel
		|
		|    S-Right, C-d
		|                move the image right by 1 pixel
		|
		|    S-Down, C-s
		|                move the image down by 1 pixel
		|
		|    S-Left, C-a
		|                move the image left by 1 pixel
		|
		|rotation:
		|    e
		|                rotate the image 90 degrees clockwise about its center
		|    q
		|                rotate the image 90 degrees counter-clockwise about its center
		|
		|    E
		|                rotate the image 23 degrees clockwise about its center
		|    Q
		|                rotate the image 23 degrees counter-clockwise about its center
		|
		|cursor:
		|    l-click     next_image
		|                    see the description for `d`
		|    r-click     prev_image
		|                    see the description for `a`
		|
		|    motion      show_cursor
		|                    the cursor gets hidden when images are switched
		|                    it gets reshown upon movement
	|"""))

if help_arg:
	arg_parser.print_help()

	print("commands:\n")
	print_commands()
	exit(0)

def print_hidden_paths(event=None) -> None:
	"print the list of hidden paths"

	print("hidden images:")

	for path in hidden_images:
		print(f"\t{path}")

def reset(event=None) -> None:
	global image_paths, original_size, prev_image_stack, next_image_stack, translation, image_angle, image, image_path, paused

	image_paths = original_image_paths.copy()
	original_size = None
	prev_image_stack = []
	next_image_stack = []
	translation = [0, 0]
	image_angle = 0
	image = None
	image_path = None
	paused = args.paused

	next_image()

def reset_changes(event=None) -> None:
	global translation, image

	translation = [0, 0]

	# undo rotation-circularization and zoom-blur
	img = Image.open(image_path).resize(original_size, resample=Image.LANCZOS)
	image = ImageTk.PhotoImage(img)

	# redisplay the image with the new translation/rotation/zoom
	display_image(image)

def print_details(event=None) -> None:
	"display information about the currently displayed image"

	print("details:")
	print(f"\timage path: {image_path !r}")
	print(f"\timages in previous stack: {len(prev_image_stack)}")
	print(f"\timages in next stack: {len(next_image_stack)}")
	print(f"\thidden images: {len(hidden_images)}")
	print(f"\timages left: {len(image_paths)}")
	print(f"\tpaused: {paused}")
	print(f"\ttranslation: {tuple(translation)}")
	print(f"\timage zoom: {image.width() / original_size[0]}")

def next_image(event=None) -> None:
	"prints the next image to the canvas and starts a timer for the next swap."

	if event is None and paused:
		# change it to be anything other than None
		# This stops it from unpausing
		event = True

	global image_path, translation, original_size, image, timer_id

	if image is not None:
		prev_image_stack.append(current_image_data())

	if stack_size != -1 and len(prev_image_stack) > stack_size:
		# remove the oldest one
		prev_image_stack.pop(0)

	if next_image_stack:
		image, image_path, translation, original_size = next_image_stack.pop()
	else:
		image_path = next_image_path()
		image = resized_image()
		translation = [0, 0]

	display_image(image)
	hide_cursor()

	if timer_id is not None:
		root.after_cancel(timer_id)

	if paused and event != None:
		# don't start the timer when paused
		return

	timer_id = root.after(swap_time, next_image)

def prev_image(event=None) -> None:
	global image, image_path, translation, original_size

	if prev_image_stack:
		next_image_stack.append(current_image_data())

		image, image_path, translation, original_size = prev_image_stack.pop()
		display_image(image)
	else:
		print("image stack underflow. retaining the current image")

def pop_image(event=None) -> None:
	"goes to the next image and removes the current one from the stack"

	global image, image_path, translation

	image = None
	image_path = None
	translation = [0, 0]

	next_image()

def hide_image(event=None) -> None:
	"pops the image and hides it from showing up after future shuffles"

	hidden_images.append(image_path)
	original_image_paths.remove(image_path)

	# TODO: look through prev_image_stack and next_image_stack for this image.
	# for i in range(len(prev_image_stack)):
	# 	;

	pop_image()

def delete_image(event=None) -> None:
	"delete the image file and hide the image"

	from os import remove as rmfile
	from tkinter.messagebox import askquestion as confirm

	result = confirm(
		"Delete File",
		"Are you sure you want to delete the current file?"
	)

	if result == "yes":
		print("removing file")
		rmfile(image_path)

	hide_image(image)

def next_image_n(event=None, /, *, n: int = 1) -> None:
	for i in range(n):
		next_image(event)

def prev_image_n(event=None, /, *, n: int = 1) -> None:
	for i in range(n):
		prev_image(event)

def pauseplay(event=None) -> None:
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

def close_canvas(event=None) -> None:
	"clears the canvas, destroys the window, and exit the program"

	if event is not None:
		print("^C")

	canvas.delete("all")
	root.destroy()
	exit(0)

def translate(event=None, vec: tuple[int, int] = (0, 0)) -> None:
	"translate the image by an x and y amount of pixels, and redisplay the image."

	translation[0] += vec[0]
	translation[1] += vec[1]

	display_image(image)

def show_cursor(event=None) -> None:
	root.config(cursor="")

def hide_cursor(event=None) -> None:
	root.config(cursor="none")

def beginning(event=None) -> None:
	print("beginning")

	while prev_image_stack:
		prev_image()

def zoom(event = None, /, *, scale: float = 1.5) -> None:
	"zoom in or out on the displayed image."
	global image

	img = ImageTk.getimage(image)

	# stop displaying the current image
	image = None

	x, y = img.size

	x = int(x * scale)
	y = int(y * scale)
	img = img.resize((x, y), resample=Image.LANCZOS)

	image = ImageTk.PhotoImage(img)

	display_image(image)

def rotate(event = None, /, *, angle: float = 90) -> None:
	"rotate the displayed image"
	# TODO: add skew rotation for non 90n angles.

	global image #, image_angle

	angle %= 360

	if angle == 0:
		return

	img = ImageTk.getimage(image)


	# these transpositions are much faster than img.rotate()
	# rotate the large amount first
	# should be faster and be more consistent with the original image
	if angle >= 270:
		img = img.transpose(Image.ROTATE_270)
		angle -= 270
	elif angle >= 180:
		img = img.transpose(Image.ROTATE_180)
		angle -= 180
	elif angle >= 90:
		img = img.transpose(Image.ROTATE_90)
		angle -= 90

	# rotate the remaining distance
	if angle != 0:
		# LANCZOS is not allowed for rotations
		img = img.rotate(angle, expand=1, resample=Image.BICUBIC)


	image = ImageTk.PhotoImage(img)
	display_image(image)

#### script


root.attributes("-fullscreen", True)
root.configure(background="black")
root.title("slideshow")

canvas.pack(expand=True, fill="both")


# basic commands
root.bind("<Control-C>", close_canvas)
root.bind("<f>", print_details)
root.bind("<F>", print_hidden_paths)
root.bind("<Control-R>", reset)
root.bind("<r>", reset_changes)
root.bind("</>", print_commands)
root.bind("<h>", hide_image)
root.bind("<b>", beginning)
root.bind("<d>", next_image)
root.bind("<X>", pop_image)
root.bind("<a>", prev_image)
root.bind("<space>", pauseplay)
root.bind("<Control-Alt-Shift-BackSpace>", delete_image)


# number keys: go backward
root.bind("<1>", partial(prev_image_n, n=1))
root.bind("<2>", partial(prev_image_n, n=2))
root.bind("<3>", partial(prev_image_n, n=3))
root.bind("<4>", partial(prev_image_n, n=4))
root.bind("<5>", partial(prev_image_n, n=5))
root.bind("<6>", partial(prev_image_n, n=6))
root.bind("<7>", partial(prev_image_n, n=7))
root.bind("<8>", partial(prev_image_n, n=8))
root.bind("<9>", partial(prev_image_n, n=9))

# shift number keys: go foreward
root.bind("<Shift-1>", partial(next_image_n, n=1))
root.bind("<Shift-2>", partial(next_image_n, n=2))
root.bind("<Shift-3>", partial(next_image_n, n=3))
root.bind("<Shift-4>", partial(next_image_n, n=4))
root.bind("<Shift-5>", partial(next_image_n, n=5))
root.bind("<Shift-6>", partial(next_image_n, n=6))
root.bind("<Shift-7>", partial(next_image_n, n=7))
root.bind("<Shift-8>", partial(next_image_n, n=8))
root.bind("<Shift-9>", partial(next_image_n, n=9))


# zoom
root.bind("<z>", partial(zoom, scale=4/5)) # zoom out
root.bind("<c>", partial(zoom, scale=5/4)) # zoom in

root.bind("<Z>", partial(zoom, scale=0.99)) # zoom out
root.bind("<C>", partial(zoom, scale=1 / 0.99)) # zoom in


# translation
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

del fn


# rotation
root.bind("<KeyPress-e>", partial(rotate, angle=-90))
root.bind("<KeyPress-q>", partial(rotate, angle=90))

root.bind("<KeyPress-E>", partial(rotate, angle=-23))
root.bind("<KeyPress-Q>", partial(rotate, angle=23))



root.bind("<Button-1>", next_image) # left click
root.bind("<Button-3>", prev_image) # right click
root.bind("<Motion>", show_cursor)

reset()

try:
	root.mainloop()
except KeyboardInterrupt:
	# handle ^C from the terminal side
	close_canvas()
