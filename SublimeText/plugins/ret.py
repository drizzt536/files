from sublime_plugin import WindowCommand

class Ret(WindowCommand):
	def run(self):
		# example: C-kr eafret RET (insert 94 newlines)
		self.window.run_command("insert", {"characters": "\n"})
