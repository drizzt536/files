from sublime_plugin import WindowCommand
import ast # for sanitizing the argument string.

class CommandRepeatedWithArgsInteractive(WindowCommand):
	def run(self):
		self.window.show_input_panel("n = ", "", self.on_get_n, None, None)

	def on_change_n(self, n):
		"exit early if `S` or `f` is the last character (same as RET)."

		if n == "" or n[-1] not in "Sf":
			return

		# `hide_panel` is not required.
		self.on_get_n(n[:-1])

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

	def on_change_cmd(self, cmd):
		if cmd == "" or cmd[-1] != "\t":
			return

		self.on_get_cmd(cmd[:-1])

	def on_get_cmd(self, cmd):
		self._cmd = cmd.replace(" ", "_")
		self.window.show_input_panel("args = ", "", self.on_get_args, None, None)

	def on_get_args(self, arg_string):
		if arg_string == "":
			self._args = {}
			return self.apply_command()

		tree = tuple(ast.walk(ast.parse(arg_string, mode="eval")))

		if not isinstance(tree[1], ast.Dict):
			return self.unsafe_args()

		for s in tree[2:]:
			# List, Tuple, and Load should also be safe
			if not isinstance(s, (ast.Str, ast.Load, ast.Name)):
				return self.unsafe_args()

		self._args = eval(arg_string)
		self.apply_command()


	def apply_command(self):
		self.window.run_command("hide_panel")

		for _ in range(self._n):
			self.window.run_command(self._cmd, self._args)

	def unsafe_args(self):
		self.window.run_command("hide_panel")
		self.window.status_message("ERROR: unsafe arg string passed")
