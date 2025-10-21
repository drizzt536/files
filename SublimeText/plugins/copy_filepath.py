from sublime_plugin import WindowCommand
from sublime import set_clipboard
from os import name as osname

class CopyFilepath(WindowCommand):
	def run(self):
		view = self.window.active_view()
		filepath = view.file_name()

		if filepath is None:
			filepath = "scratch" if view.is_scratch() else "untitled"
		elif osname == "nt":
			filepath = filepath.replace("\\", "/")

		set_clipboard(filepath)
