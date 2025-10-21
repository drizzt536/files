from sublime_plugin import WindowCommand

class PrintSequenceInteractive(WindowCommand):
	def run(self):
		"""
		Print Linear Sequence (Interactive version)

		basically the same as the `seq` linux command but where the end is based on how
		many cursors you have, and not a conditional on the value.

		This is a wrapper around print_lin_seq that prompts for all the values in an input window.

		each argument can be skipped, so long as all the arguments after it are also skipped.

		`start` should be an integer, float, or a string "[+-]?n[+-]\\d+". defaults to 1
		`incr` should be an integer or a float for the increment per element. defaults to 1
		`bw` should be a boolean for if the sequence should go backwards or not. defaults to false
		"""

		self.window.show_input_panel("start, incr, bw = ", "", self.on_done, None, None)

	def on_done(self, res):
		from re import sub as replace

		res = replace(r"\s", "", res).split(",")
		if len(res) > 3:
			self.window.status_message(f"ERROR: too many arguments: expected ≤3, found {len(res)}")
			return
		elif len(res) == 3:
			start, incr, bw = res
		elif len(res) == 2:
			start, incr = res
			bw = "false"
		elif len(res) == 1:
			start = res[0] or "1" # NOTE: ''.split(',') == ['']
			incr = "1"
			bw = "false"

		# convert start to a correct value
		try:
			start = int(start)
		except ValueError:
			try:
				start = float(start)
			except ValueError:
				# it could be something like "n - 1", which would be valid.
				pass

		# convert incr to a correct value
		try:
			incr = int(incr)
		except ValueError:
			try:
				incr = float(incr)
			except ValueError:
				self.window.status_message("ERROR: invalid increment: must be an int or float.")
				return

		# convert bw to a correct value
		bw = bw.lower()
		if bw in {"1", "yes", "on", "true", "y", "t"}:
			bw == True
		elif bw in {"0", "no", "off", "false", "n", "f"}:
			bw = False
		else:
			self.window.status_message("ERROR: invalid backwards flag: must be a boolean")
			return

		self.window.run_command("print_sequence", {"start": start, "incr": incr, "bw": bw})
