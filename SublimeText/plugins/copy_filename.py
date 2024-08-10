from sublime_plugin import WindowCommand
from sublime import set_clipboard
from os import name as osname

class CopyFilenameCommand(WindowCommand):
	def run(self):
		"copy the file name without the full path"
		view = self.window.active_view()
		filepath = view.file_name()

		if filepath is None:
			set_clipboard("scratch" if view.is_scratch() else "untitled")
			return
		if osname == "nt":
			filepath = filepath.replace("\\", "/")

		set_clipboard(filepath.rsplit("/", 1)[1])
