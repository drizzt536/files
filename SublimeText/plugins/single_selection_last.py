import sublime, sublime_plugin

class SingleSelectionLastCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		regions = self.view.sel()

		if not regions:
			# there are no positions to collapse
			return

		last_region = regions[-1]

		self.view.sel().clear()
		self.view.sel().add(last_region)
