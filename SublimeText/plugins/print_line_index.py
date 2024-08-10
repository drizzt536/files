from sublime_plugin import TextCommand

# view.run_command("print_line_index")

class PrintLineIndexCommand(TextCommand):
	def run(self, edit):
		"insert the current line number at the start of every cursor selection."

		for pt in reversed(tuple(r.begin() for r in self.view.selection)):
			self.view.insert(edit, pt, str(self.view.rowcol(pt)[0] + 1))
