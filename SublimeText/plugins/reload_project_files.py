from sublime_plugin import WindowCommand

class ReloadProjectFilesCommand(WindowCommand):
	def run(self):
		proj_data = self.window.project_data()

		if proj_data:
			self.window.set_project_data({})
			self.window.set_project_data(proj_data)
