import os
from sublime_plugin import TextCommand

class DeleteCurrentFile(TextCommand):
	def run(self, edit):
		view     = self.view
		window   = view.window()
		filepath = view.file_name()

		if not filepath:
			window.status_message("ERROR: Cannot delete an unsaved buffer.")
			return

		# Safety check: make sure the file actually exists on disk first
		if not filepath or not os.path.exists(filepath):
			window.status_message("ERROR: File does not exist.")
			return

		try:
			os.remove(filepath)
			window.status_message(f"Deleted: {os.path.basename(filepath)}")
		except Exception as e:
			window.status_message(f"Delete failed: {str(e)}")