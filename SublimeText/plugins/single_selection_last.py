from sublime_plugin import TextCommand

class SingleSelectionLast(TextCommand):
	def run(self, edit):
		regions = self.view.selection

		if not regions:
			# there are no positions to collapse
			return

		last_region = regions[-1]

		self.view.selection.clear()
		self.view.selection.add(last_region)
