from sublime_plugin import WindowCommand
from functools import partial

class ScrollRepeated(WindowCommand):
	def run(self, *, by = "l", forward = True):
		self._base_amount = -1.0 if forward else 1.0

		self.window.show_input_panel("n = ", "", self.on_done, None, None)

	def on_change(self, n):
		"exit early if `S` of `f` is the last character (same as RET)."

		if n == "" or n[-1] not in "Sf":
			return

		self.window.run_command("hide_panel")
		self.on_done(n[:-1])

	def on_done(self, n):
		try:
			# this is the same orientation as the number pad, but moved.
			keymap = {
				'q':'7', 'w':'8', 'e':'9',
				'a':'4', 's':'5', 'd':'6',
				'z':'1', 'x':'2', 'c':'3',
				' ':'0'
			}

			n = int( ''.join(keymap.get(c, c) for c in n.lower()) )

			self.window.run_command("scroll_lines", {"amount": self._base_amount * n})
		except ValueError:
			self.window.status_message("Invalid input: integer required")
