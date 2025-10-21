from sublime_plugin import TextCommand

class SpawnBelowLastCursor(TextCommand):
	def run(self, edit):
		loc = self.view.selection[-1]
		self.view.run_command("move_last_cursor", {"by": "lines", "forward": True})
		self.view.selection.add(loc)
