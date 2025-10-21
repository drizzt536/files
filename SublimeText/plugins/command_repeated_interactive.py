from sublime_plugin import WindowCommand

class CommandRepeatedInteractive(WindowCommand):
	def run(self):
		self.window.show_input_panel("n = ", "", self.on_get_n, self.on_change_n, None)

	def on_change_n(self, n):
		"exit early if `S` or `f` is the last character (same as RET)."

		if n == "" or n[-1] not in "Sf":
			return

		self.window.run_command("hide_panel")
		self.on_get_n(n[:-1])

	def on_change_cmd(self, cmd):
		if cmd == "" or cmd[-1] != "\t":
			return

		self.on_get_cmd(cmd[:-1])	

	def on_get_n(self, n):
		try:
			# this is the same orientation as the number pad, but moved.
			keymap = {
				'q':'7', 'w':'8', 'e':'9',
				'a':'4', 's':'5', 'd':'6',
				'z':'1', 'x':'2', 'c':'3',
				' ':'0'
			}

			self._n = int( ''.join(keymap.get(c, c) for c in n.lower()) )

			self.window.show_input_panel("cmd = ", "", self.on_get_cmd, self.on_change_cmd, None)
		except ValueError:
			self.window.run_command("hide_panel")
			self.window.status_message("ERROR: invalid integer passed")

	def on_get_cmd(self, cmd):
		self.window.run_command("hide_panel")

		# replace spaces with underscores, but not at the ends
		cmd = cmd.strip(" \r\n").replace(" ", "_")

		for _ in range(self._n):
			self.window.run_command(cmd)
