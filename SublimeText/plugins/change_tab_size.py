from sublime_plugin import TextCommand
from functools import partial

class ChangeTabSizeCommand(TextCommand):
	# CS-p csz RET a RET

	def run(self, edit):
		self.view.window().show_input_panel("n = ", "", self.on_done, None, None)

	def on_done(self, n):
		try:
			# this is the same orientation as the number pad, but moved.
			keymap = {
				'q':'7', 'w':'8', 'e':'9',
				'a':'4', 's':'5', 'd':'6',
				'z':'1', 'x':'2', 'c':'3',
				' ':'0', '-': ''
			}

			n = int( ''.join(keymap.get(c, c) for c in n.lower()) )
			self.view.settings().set("tab_size", n)
		except ValueError:
			self.view.window().status_message("Invalid input: integer required")