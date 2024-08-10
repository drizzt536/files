from sublime_plugin import TextCommand

class ToggleScratchCommand(TextCommand):
	def run(self, edit, verbose: bool = False):
		value = not self.view.is_scratch()

		self.view.set_scratch(value)

		if verbose:
			print("scratch:", value)
