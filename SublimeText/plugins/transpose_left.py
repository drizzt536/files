from sublime import Region
from sublime_plugin import TextCommand

class TransposeLeft(TextCommand):
	def run(self, edit):
		view = self.view

		# transpose right, and then move all the cursors back two characters
		# NOTE: if at least one cursor is highlighted, then after this command, they all will be
		view.run_command("transpose")

		# ignore highlighted regions
		new_regions = [r if r.a != r.b else Region(r.a - 2) for r in view.selection]

		view.selection.clear()
		view.selection.add_all(new_regions)
