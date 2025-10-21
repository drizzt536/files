from sublime_plugin import TextCommand

class PrintSequence(TextCommand):
	def run(self, edit, start = 1, incr = 1, bw=False):
		"""
		insert start + idx*incr at each cursor selection.
		prints as a float if both are a float, otherwise it prints all values as integers.

		basically the same as the `seq` linux command but where the end is based on how
		many cursors you have, and not a conditional on the value.

		All arguments must be provided for the command to run

		the start is allowed to be a string with a linear combination of `n` and a constant integer,
		and `n` will be substituted with the number of cursors active at the time of the command.
		"""

		ncursors = len(self.view.selection)

		if isinstance(start, str):
			import re
			start = re.sub(r"\s", "", start)

			# it is allowed to be `\pm n`, `\pm n \pm K`, or `\pm K \pm n`,
			# where each \pm doesn't have to be the same for each, and K is a positive integer.
			# no scaling by any x is allowed, unless x is 1 or -1.

			if start in {"n", "+n"}:
				start = ncursors
			elif start == "-n":
				start = -ncursors

			elif (match := re.match(r"([+-]?)n([+-]\d+)", start)) is not None:
				groups = match.groups()
				start = int(groups[1]) + (-1 if groups[0] == "-" else 1)*ncursors

			elif (match := re.match(r"([+-]?\d+)([+-])n", start)) is not None:
				groups = match.groups()
				start = int(groups[0]) + (-1 if groups[1] == "-" else 1)*ncursors

			else:
				self.view.window().status_message(f"ERROR: invalid start string given: \"{start}\"")
				return

		if isinstance(start, float) | isinstance(incr, float):
			# if one of them is a float, make both of them a float
			start = float(start)
			incr = float(incr)

		# iterate backwards to not mess up the cursor indices.
		for i in range(ncursors - 1, -1, -1):
			sel = self.view.selection[i]

			if sel.a != sel.b:
				self.view.erase(edit, sel)

			self.view.insert(edit, min(sel.a, sel.b), str(start + (ncursors - 1 - i if bw else i)*incr))


