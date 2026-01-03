from PIL import Image, ImageDraw, ImageFont
import numpy as np
from math import ceil

# a lot of times, these suck, so it might just make sense to just do it yourself.

Image.MAX_IMAGE_PIXELS = None

chars = "0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPRSTUVWXYZ!\"#&'*+,-.:;<=>?^_`~"
chars_removed = "jQ$%()/@[\\]{|} \t\n\r\x0b\x0c"

font_size = 4096
fonts     = ["consola.ttf", "courbd.ttf", "./vgaoem.ttf"]
font_path = fonts[0]
font_idx  = 0 # font subtype

font = ImageFont.truetype(font_path, font_size, font_idx)

def charsize(char: str) -> tuple[int, int]:
	left, top, right, bottom = font.getbbox(char)
	width, height = right - left, bottom - top

	return width, height

canvas_len = 8*ceil(max([max(charsize(c)) for c in chars]) / 8)
canvas_size = canvas_len, canvas_len

arr8x8_t = np.typing.NDArray[np.uint8]


def downsample_image(image: arr8x8_t, raw: bool = False) -> arr8x8_t:
	"""
	the input image should be 0 for black and 255 for white.
	the output is an 8x8 matrix of 0s or 1s
	"""

	in_width, in_height = image.shape

	if in_width != in_height:
		raise ValueError("image must be square")

	if in_width & 7 != 0:
		raise ValueError("image sidelengths must be multiples of 8")

	tmp = in_width >> 3
	threshold = tmp**2 * 126

	total = image.reshape(8, tmp, 8, tmp).sum(axis=(1, 3))

	return total if raw else (total > threshold).astype(np.uint8)

enlarge = lambda image, size: np.repeat(np.repeat(image, size, axis=0), size, axis=1)

def copy_state(image: arr8x8_t) -> None:
	"takes in the 8x8 downsampled image."

	import subprocess

	text = "static const u8 state[8] = {\n\t" + ",\n\t".join(f"0b{n:08b}" for n in np.packbits(image, axis=1)[:,0]) + "\n}"
	subprocess.run(["clip"], input=text, text=True)

def gen_image(
	char: str,
	downsample: bool = False,
	asarray: bool = True,
	invert: bool = False,
	bright: bool = False,
	copy: bool = False,
	size: int = 1,
) -> arr8x8_t:
	left, top, right, bottom = font.getbbox(char)

	img = Image.new("L", canvas_size, color=(255 if invert else 0))

	# the location to put the top left so that the image is drawn in the center
	x = round((canvas_len - left - right) / 2)
	y = round((canvas_len - top - bottom) / 2)

	ImageDraw.Draw(img).text((x, y), char, font=font, fill=(0 if invert else 255))

	image = np.array(img)

	if downsample:
		image = downsample_image(image)

	if copy:
		copy_state(image)

	if bright:
		image *= 255

	if isinstance(size, int) and size > 1:
		image = enlarge(image, size)

	if not asarray:
		image = Image.fromarray(image, mode="L")

	return image

show = lambda char: gen_image(char, asarray=False, downsample=True, bright=True, size=64).show()
show_original = lambda char: gen_image(char, asarray=False).show()

# gen_image('A', downsample=True, copy=True)
