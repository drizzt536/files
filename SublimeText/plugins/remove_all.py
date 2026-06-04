import sublime
import sublime_plugin

class RemoveAll(sublime_plugin.TextCommand):
	def run(self, edit, regex=None, preset=None):
		if regex is None:
			return

		if   preset is None:    pass
		elif preset == "left":  regex = '^' + regex
		elif preset == "right": regex += '$'
		elif preset == "lines": regex = '^' + regex + r'$\n?'
		else:
			view.window().status_message(f"ERROR: `remove_all` invalid preset '{preset}'")
			return

		for region in reversed(self.view.find_all(regex)):
			self.view.erase(edit, region)
