from PIL import Image, ImageDraw, ImageFont

############################# global options #############################
font_path: str           = "consola.ttf"
font_size: int           = 288
padding: tuple[int, int] = (1, 1) # (width, height)
max_ord: int             = 256
##########################################################################


# some of these characters render as a question mark in a rectangle
# but in a text file they aren't actually printable characters.
# 92 is '\\' and 32 is ' '.
blank_chars     = {i for i in range(max_ord) if len(repr(chr(i))) > 3 and i != 92 or i == 32}
all_chars       = tuple(chr(i) for i in range(max_ord))
printable_chars = tuple(chr(i) for i in range(max_ord) if i not in blank_chars)


font = ImageFont.truetype(font_path, font_size)

def get_char_data(char: str, font: ImageFont.FreeTypeFont = font):
	"returns (canvas size, top, char)"
	# global font, padding

	left, top, right, bottom = font.getbbox(char)
	char_width, char_height = right-left, bottom-top

	canvas_size = char_width + 2*padding[0], char_height + 2*padding[1]
	return char, top, canvas_size

char_data  = tuple(get_char_data(char, font) for char in printable_chars)
max_width  = max(data[2][0] for data in char_data)
max_height = max(data[2][1] for data in char_data)
max_size   = max_width, max_height
char_data  = tuple((data[0], data[1], max_size) for data in char_data)
del max_width, max_height

def show(
	char: str,
	top: int,
	canvas_size: tuple[int, int] = max_size,
	font: ImageFont.FreeTypeFont = font
) -> float:
	"show the character image instead of calculating the brightness from it"
	starting_pos = (padding[0], padding[1] - top) # padding - (0, top)

	img = Image.new("L", canvas_size, color=0)
	ImageDraw.Draw(img).text(starting_pos, char, font=font, fill=255)

	img.show()

	return img

def brightness(
	char: str,
	top: int,
	canvas_size: tuple[int, int] = max_size,
	font: ImageFont.FreeTypeFont = font
) -> float:
	"get the approximate brightness percent of a given character in a given font."

	if ord(char) in blank_chars:
		# [0, 32] ∪ [127, 160] ∪ 173
		return 0.0

	starting_pos = (padding[0], padding[1] - top) # padding - (0, top)

	img = Image.new("L", canvas_size, color=0)
	ImageDraw.Draw(img).text(starting_pos, char, font=font, fill=255)

	pixels = img.load()

	# also take into account the intensity of each pixel 
	filled_pixels = sum(pixels[x, y] \
		for x in range(img.width) \
		for y in range(img.height) \
		if pixels[x, y] > 0)

	total_pixels = img.width * img.height

	filled_pixels / (255*total_pixels)

if __name__ == "__main__":
	brightnesses = [(data[0], brightness(*data, font)) for data in char_data]
	brightnesses = [(chr(i), 0.0) for i in blank_chars] + brightnesses
	brightnesses = sorted(brightnesses, key=lambda x: x[1])

	# string form of the character map. If a character isn't in the
	# character map, pretend it is " ", because it isn't printable.
	charmap = " " + "".join(b[0] for b in brightnesses[len(blank_chars):])

	print(charmap)
