# %cd D:/ExtF/CodeFiles/Python/manim/array-sorting/

from secrets import randbelow as secrets_randbelow
from random import seed as set_seed, randrange as random_randrange
from manim import *
import manim

def get_color(n: int = 2, i: int = 0) -> ManimColor:
	from colorsys import hsv_to_rgb

	return ManimColor([round(x * 255) for x in hsv_to_rgb((i + 1) / n, 1, 1)])

value_range = lambda max: range(1, 1 + max, 1)

realnum = float | int
USE_SEEDED = True
SEED = 0x8e48fbad

if USE_SEEDED:
	set_seed(SEED)

def __replace__(string: str, pattern: str, repl: str = "", count=0, flags=0):
	from re import sub as _replace

	return _replace(pattern, repl, string, count, flags)


class Main(Scene):
	array_vgroup = None
	array = []
	alg_text = None

	sort_algorithm = "insertion sort"
	fps = 30 # frames per second
	spf = 1 / fps # seconds per frame
	border_percent = 0.05

	### Helper Functions

	def reset_seed(self) -> None:
		set_seed(SEED)

	def randbelow(self, x: int) -> int:
		return random_randrange(0, x) if USE_SEEDED else secrets_randbelow(x)

	def algorithm(self, alg_name: str) -> None:
		"display the current algorithm being used"

		new_alg_text = Text(
			f"Algorithm: {alg_name}",
			font = "Courier New",
			font_size = 18
		).to_edge(UL, buff=0)\
			.shift(self.border_percent * self.camera.frame_width * RIGHT + DOWN / 10)

		if self.alg_text is not None:
			self.play(AnimationGroup(
				Uncreate(self.alg_text),
				Create(new_alg_text)
			))
		else:
			self.play(Create(new_alg_text))

		self.alg_text = new_alg_text

	def display(self) -> None:
		"Update the display of the current array state"

		if self.array_vgroup is not None:
			self.remove(self.array_vgroup)

		self.array_vgroup = VGroup(*self.array).arrange(RIGHT, buff=0)

		for rect in self.array:
			rect.shift(UP * (self.border.get_bottom() - rect.get_bottom()))

		self.add(self.array_vgroup)

	def verify(self) -> None:
		"verifies that each element is sorted with respect to the previous"

		# correct, incorrect
		correct = ManimColor("#009900")
		incorrect = ManimColor("#990000")

		arr = self.array

		arr[0].color = correct

		self.render_frame()

		for i in range(len(arr) - 1):
			arr[i + 1].color = correct if arr[i]._int_value <= arr[i + 1]._int_value else incorrect

			self.render_frame()

	def render_frame(self, sleep: realnum | None = None) -> None:
		if sleep is None:
			sleep = self.spf

		self.display()
		self.wait(sleep)

	### Algorithm Operations

	def get(self, i: int) -> Mobject:

		I = self.array[i]
		I.color = GRAY_B

		self.render_frame()

		I.color = I._original_color

		return I

	def set(self, i: int, x: Any) -> Mobject:
		"""
		Set one value in the array to another value.
		If the value is already in the array, set a copy instead.
		Return the value (the copied one, if applicable).
		"""

		self.wait(sleep)

		arr = self.array

		# create a copy if it is in the array.
		# make the color what it should be.

		arr[i] = x.copy() if x in arr and x is not arr[i] else x

		self.render_frame()

		return arr[i]

	def swap(self, i: int, j: int, /, *, sleep: realnum | None = None, should_swap: bool = True) -> None:
		"swap two indices and redisplay the array"

		arr = self.array
		I, J = arr[i], arr[j]

		# change colors to gray for a frame
		I.color = GRAY_B
		J.color = GRAY_B

		self.render_frame(sleep)

		if should_swap:
			arr[i], arr[j] = J, I

			self.render_frame(sleep)

			I.color = J._original_color
			J.color = I._original_color
		else:
			# no swap, just comparison
			# reset colors

			I.color = I._original_color
			J.color = J._original_color

	__getitem__ = get
	__setitem__ = set


	### Sorting Algorithms


	def shuffle(self) -> None:
		# 0.05 is for a "fast" shuffle on 30 fps
		self.algorithm("Fisher-Yates Shuffle")

		for i in range(len(self.array) - 1, 0, -1): # i \in [1, length)
			self.swap(i, self.randbelow(i), should_swap=True)

	def reverse(self) -> None:
		self.algorithm("Reverse")
		l, r = 0, len(self.array) - 1

		while l < r:
			self.swap(l, r, should_swap=True)

			l += 1
			r -= 1

	def insertion_sort(self) -> None:
		self.algorithm("Insertion Sort")

		arr = self.array

		for i in range(1, len(arr)): # Iterate over the array starting from the second element
			key = self[i] # Store the current element as the key to be inserted in the right position
			j = i - 1

			while j >= 0 and key._int_value < arr[j]._int_value:
				self[i] = arr[j]
				j -= 1

			self[j + 1] = key

	def selection_sort(self) -> None:
		self.algorithm("Selection Sort")

		n = len(self.array)

		for i in range(n):
			min_index = i

			for j in range(i, n): # i < j
				self.swap(i, j, should_swap=False)

				if self.array[j]._int_value < self.array[min_index]._int_value:
					min_index = j

			if min_index != i:
				self.swap(i, min_index, sleep=0 if min_index == n - 1 else self.spf, should_swap=True)

	def exchange_sort(self) -> None:
		self.algorithm("Exchange Sort")
		n = len(self.array)

		for i in range(n):
			for j in range(i, n): # i < j
				if self.array[i]._int_value > self.array[j]._int_value:
					self.swap(i, j)

	def improved_exchange_sort(self) -> None:
		self.algorithm("Improved Exchange Sort")

		arr = self.array
		n = len(arr)

		for i in range(n):
			for j in range(n - 1, i, -1): # i < j
				self.swap(i, j, should_swap=arr[i]._int_value > arr[j]._int_value)


	### Construction Functions


	def setup(self) -> None:
		"do all the setup things"

		self.border = Rectangle(
			width = (1 - 2 * self.border_percent) * self.camera.frame_width,
			height = (1 - 2 * self.border_percent) * self.camera.frame_height,
		)

		values       = value_range(32)
		max_value    = max(values)
		length       = len(values)
		width        = self.border.width / length
		height_scale = self.border.height / max_value

		for i, value in enumerate(values):
			color = get_color(length, i)

			self.array.append(Rectangle(
				width = width,
				height = value * height_scale,
				# this is only index `i` because it starts sorted
				fill_color = color,
				fill_opacity = 1,
				stroke_width = 0
			))

			self.array[i]._int_value = value
			self.array[i]._original_color = color

		self.display()

	def construct(self) -> None:
		self.setup()

		for operation in ["shuffle", self.sort_algorithm.replace(" ", "_"), "verify"]:
			self.wait(1)
			getattr(self, operation)()



# !manim render ./index.py --fps 30 --quality h
