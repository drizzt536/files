from sublime_plugin import TextCommand

class PrintIndicesCommand(TextCommand):
	def run(self, edit, start=1):
		"insert the cursor index at each cursor selection."

		# iterate backwards to not mess up the cursor indices.
		for i in range(len(self.view.selection) - 1, -1, -1):
			sel = self.view.selection[i]

			if sel.a != sel.b:
				self.view.erase(edit, sel)

			self.view.insert(edit, min(sel.a, sel.b), str(i + start))
