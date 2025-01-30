from sublime_plugin import WindowCommand
from functools import partial
import sublime

class ScrollRepeatedCommand(WindowCommand):
	def run(self, *, by = "l", forward = True):
		base_amount = -1.0 if forward else 1.0

		self.window.show_input_panel("n = ", "", lambda n: self.on_done(n, base_amount), None, None)

	def on_done(self, n, base_amount):
		try:
			# this is the same orientation as the number pad, but moved.
			keymap = {
				'q':'7', 'w':'8', 'e':'9',
				'a':'4', 's':'5', 'd':'6',
				'z':'1', 'x':'2', 'c':'3',
				' ':'0'
			}

			n = int( ''.join(keymap.get(c, c) for c in n.lower()) )

			self.window.run_command("scroll_lines", {"amount": base_amount * n})
		except ValueError:
			self.window.status_message("Invalid input: integer required")
