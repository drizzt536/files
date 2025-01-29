import sublime, sublime_plugin

class TransposeLeftCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		# Run the default transpose command
		self.view.run_command("transpose")

		# After transposing, move every cursor location back two characters
		for region in self.view.sel():
			if not region.empty():
				continue

			# Move cursor two positions to the left
			new_point = region.begin() - 2
			self.view.sel().clear()
			self.view.sel().add(sublime.Region(new_point, new_point))