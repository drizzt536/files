from sublime import Region
from sublime_plugin import TextCommand

# TODO: fix this for if there is more than one cursor

class TransposeLeft(TextCommand):
	def run(self, edit):
		# transpose right, and then move all the cursors back two characters
		self.view.run_command("transpose")

		for region in self.view.selection:
			# ignore highlighted regions
			if region.a != region.b:
				continue

			self.view.selection.clear()
			self.view.selection.add(Region(region.a - 2))
