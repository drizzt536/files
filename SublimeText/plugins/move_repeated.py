from sublime_plugin import WindowCommand

class MoveRepeatedCommand(WindowCommand):
	def run(self, *, by = "l", forward = True, extend = False):
		if   by == "l": by = "lines"
		elif by == "c": by = "characters"
		elif by == "p": by = "pages"

		self._options = {"by": by, "forward": forward, "extend": extend}

		self.window.show_input_panel("n = ", "", self.on_done, self.on_change, None)

	def on_change(self, n):
		"exit early if `S` or `f` is the last character (same as RET)."

		if n == "" or n[-1] not in "Sf":
			return

		self.window.run_command("hide_panel")
		self.on_done(n[:-1])

	def on_done(self, n):
		try:
			options = self._options

			# this is the same orientation as the number pad, but moved.
			keymap = {
				'q':'7', 'w':'8', 'e':'9',
				'a':'4', 's':'5', 'd':'6',
				'z':'1', 'x':'2', 'c':'3',
				' ':'0'
			}

			n = int( ''.join(keymap.get(c, c) for c in n.lower()) )

			# treat negative values as going the opposite direction.
			if n < 0:
				n *= -1
				options["forward"] = not options["forward"]

			# This can definitely be made faster, using TextCommand instead of WindowCommand,
			# and interacting directly with the regions and doing addition on them
			for _ in range(n):
				self.window.run_command("move", options)
		except ValueError:
			self.window.status_message("Invalid input: integer required")
