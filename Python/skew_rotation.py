#!/usr/bin/env python3

"""
Requires Python 3.10 or higher.
	or-operator type-unions (`|`)

requires numpy: where, zeros, sum, any, rot90, ndarray.
requires sympy: pi, sin, tan, Integer, Basic
it should work with basically any versions of these that work in the version of Python being used.

Provides 4 functions (1 external, 3 internal):
	- rotate_image: rotate an image, preserving the existence of all pixels.
	- _apply_x_skew: skew image in x direction
	- _apply_y_skew: skew image in y direction
	- _without_borders: removes black borders from the edges of images

probably doesn't work with images that have alpha channels.

inspired by: https://youtu.be/1LCEiVDHJmc
"""

from sys import version_info as py_version

if py_version < (3, 10):
	raise Exception("This module requires Python 3.10 or newer.")

import numpy as np
import sympy as sp
from fractions import Fraction

pi = sp.pi
ndarray = np.ndarray


def _apply_x_skew(image: ndarray, x: float | int) -> ndarray:
	"""
	Applies an x-axis skew to the image.

	- Extends the image with black pixels to maintain a rectangular shape.
	- Returns a new image unless no skew is applied (i.e. x == 0).

	- The image should be 2D for grayscale or 3D for colored
	- The first and second dimensions are interpreted as the height and width, respectively
	- The following types of images are accepted, but will not behave as expected:
		> 3D grayscale images
		> Multi-framed grayscale images
		> A batch of 2D grayscale images
	"""

	if x == 0:
		return image

	if not isinstance(image, ndarray):
		raise TypeError("image must be an ndarray")

	if len(image.shape) < 2:
		raise TypeError("image must be a 2d or 3d ndarray")

	if len(image.shape) > 3:
		raise TypeError("image must be a 2d or 3d ndarray\n\tNote: Batch processing, as well as multi-framed and 3D images are not supported.")

	if not isinstance(x, int | float):
		raise TypeError("x (skew) must be an int or float value.")

	# leftover_dimensions will only ever be 0 or 1 elements long.
	height, width, *leftover_dimensions = image.shape
	last_index = height - 1

	x_positive = x > 0
	if x < 0:
		x *= -1

	new_image = np.zeros((height, width + int(x*last_index), *leftover_dimensions), dtype=image.dtype)

	# TODO: figure out a way to vectorize this loop.
	for i in range(height):
		left_pad = int(x*(last_index - i if x_positive else i))

		new_image[i, left_pad:left_pad + width] = image[i]

	return new_image

def _apply_y_skew(image: ndarray, y: float | int) -> ndarray:
	"""
	Apply a y-axis skew to the image.

	return image if y == 0 else _apply_x_skew(image^T, y)^T
		where `^T` is actually `.transpose(1, 0, 2)`

	refer to `_apply_x_skew`'s docstring for an explanation.
	"""

	if not isinstance(image, ndarray):
		raise TypeError("image must be an ndarray")

	if len(image.shape) != 3:
		raise TypeError("image must be an 3-dimensional ndarray")

	if not isinstance(y, int | float):
		raise TypeError("y (skew) must be an int or float value.")

	if y == 0:
		return image
	else:
		image = image.transpose(1, 0, 2)
		image = _apply_x_skew(image, -y)
		return image.transpose(1, 0, 2)

def _without_borders(image: ndarray) -> ndarray:
	"""
	Removes starting and ending all-black rows and columns.
	Returns a view of the original image (returns the original image)
	"""

	# TODO: figure out which sides will have the border based on the angle, and only do those.
	# maybe could use the original (height, width), and shrink the image down to (width, height)

	if not isinstance(image, ndarray):
		raise TypeError("image must be an ndarray")

	if len(image.shape) not in {2, 3}:
		raise ValueError("image must be 2d or 3d")

	channel_summed_image = np.sum(image, axis=2)

	row_indices = np.where( np.any(channel_summed_image, axis=1) )[0] # where(rows)[0]
	col_indices = np.where( np.any(channel_summed_image, axis=0) )[0] # where(cols)[0]

	return image[
		row_indices[0]:row_indices[-1] + 1,
		col_indices[0]:col_indices[-1] + 1
	]

def rotate_image(image: ndarray, *,
	degrees: float | int | Fraction | sp.Basic | None = None,
	radians: float | int | Fraction | sp.Basic | None = None,
	direction: str = "counterclockwise",
	keep_border: bool = False
) -> ndarray:
	"""
	skew-based counterclockwise image rotation.
	θ in either degrees or radians. `degrees` or `radians` keyword argument for the mode.
	direction should be one of "clockwise", "cw", "counterclockwise", or "ccw".
	if both degrees and radians are provided, an error is thrown.
	if the original image had all-black edges, they may be removed, depending on the angle.
	preserves all pixels, and is reversible.
	`rotate_image(rotate_image(image, θ), -θ)` should be equivalent to `image`.
	image is a NumPy ndarray of shape (height, width, channels). `image[row, col, chan]`.
	returns a new image.
	"""

	if not isinstance(image, ndarray):
		raise TypeError("image must be an ndarray")

	if len(image.shape) != 3:
		raise TypeError("image must be an 3-dimensional ndarray")

	if not isinstance(keep_border, bool):
		raise TypeError("keep_border must be a boolean")

	if not isinstance(direction, str):
		raise TypeError("direction must be a string")

	if direction not in {"clockwise", "cw", "counterclockwise", "ccw"}:
		raise ValueError("direction must be clockwise, cw, counterclockwise, or ccw")

	if degrees is not None:
		if radians is not None:
			raise Exception("only one of \"radians\" or \"degrees\" keyword arguments can be passed")

		if isinstance(degrees, float):
			degrees = Fraction(degrees).limit_denominator()

		# TODO: assert type
		θ = sp.sympify(degrees) * pi / 180 # convert to radians
	elif radians is not None:
		if isinstance(radians, float):
			radians = Fraction(radians).limit_denominator()

		# TODO: assert type
		θ = sp.sympify(radians)
	else:
		raise ValueError("one of \"radians\" or \"degrees\" keyword argument must be passed")

	if direction == "clockwise" or direction == "cw":
		θ *= -1

	θ %= 2*pi

	# trivial rotations (can be done without skewing)

	# transform θ to be less than pi/2 (90°)
	# NOTE: (0, 1) are the default axes for rot90.
	if θ >= 3*pi/2:
		θ -= 3*pi/2 # 270°
		image = np.rot90(image, k=3).copy()
	elif θ >= pi:
		θ -= pi # 180°
		image = np.rot90(image, k=2).copy()
	elif θ >= pi/2:
		θ -= pi/2 # 90°
		image = np.rot90(image, k=1).copy()

	if θ == 0:
		# this covers 0, pi/2, pi, and 3*pi/2
		return image.copy()

	# math.tan(math.pi) != 0
	x_skew = -sp.tan(θ/2)
	y_skew = -sp.sin(θ)

	x_skew = int(x_skew) if isinstance(x_skew, sp.Integer) else float(x_skew)
	y_skew = int(y_skew) if isinstance(y_skew, sp.Integer) else float(y_skew)

	image = _apply_x_skew(image, x_skew)
	image = _apply_y_skew(image, y_skew)
	image = _apply_x_skew(image, x_skew)

	return image if keep_border else _without_borders(image)

if __name__ == "__main__":
	print("skew_rotation.py should not be used on its own")
	exit(1)
