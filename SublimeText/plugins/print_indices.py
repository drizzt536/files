from sublime_plugin import TextCommand

class PrintIndicesCommand(TextCommand):
	def run(self, edit, start=1):
		"insert the cursor index at each cursor selection."

		for i in range(len(self.view.selection) - 1, -1, -1):
			self.view.insert(edit, self.view.selection[i].begin(), str(i + start))
