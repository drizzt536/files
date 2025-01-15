def mc_sugarcane_matrix(rows: int, cols: int):
	"""
	Generates a matrix with the water locations for an optimal non-redstone
	Minecraft sugarcane farm. It returns a uint8 numpy ndarray object.

	A 1 represents water, and 0 represents sugarcane (or nothing, in some
	spots around the edge). The top left spot (M[0, 0]) will always be a 1,
	and the rest of the matrix is derived from that.
	"""

	# I'm pretty sure it makes the bytecode smaller to import everything separately,
	# instead of doing `import numpy as np` and then doing `np.whatever` all the time.
	from math import ceil
	from numpy import ndarray, uint8, arange, roll

	# rolling the rows only works properly if there are a multiple of 5 columns
	padded_rows = 5 * ceil(rows / 5)
	padded_cols = 5 * ceil(cols / 5)

	# uses ndarray because the values don't need to be initialized.
	M = ndarray([padded_rows, padded_cols], uint8)

	# put a water every 5th block in the row
	row = (arange(padded_cols, dtype=uint8) % 5 == 0).astype(uint8)

	# move the water over by 2 blocks per row
	# if rows < 5, then not all 5 of them need to be computed
	for i in range(min(5, rows)):
		M[i, :] = row = roll(row, 2)

	if rows > 5:
		# take advantage of the repetition. the matrix is periodic every 5 rows
		j = 5
		for i in range(1, padded_rows // 5):
			M[j:(j := j + 5), :] = M[:5, :]

	# remove the excess columns that were only required for accurate rolling.
	# and the excess rows used for the repetition
	return M[:rows, :cols]
