from sublime import Region
from sublime_plugin import TextCommand

class MoveLastCursor(TextCommand):
	def run(self, edit, *, by="lines", forward = True):
		cur_loc = self.view.selection[-1]
		tab_size = self.view.settings().get("tab_size", 4)

		if by == "l" or by == "lines":
			cur_line = self.view.line(cur_loc.a)
			offset = len(self.view.substr(Region(cur_line.a, cur_loc.a)).expandtabs(tab_size))
			new_line = self.view.line(cur_line.b + 1) if forward else self.view.line(cur_line.a - 1)

			new_offset    = 0 # offset assuming len("\t") == 1
			new_charcount = 0 # offset assuming len("\t") == tab_size

			for c in self.view.substr(new_line):
				new_charcount += tab_size if c == "\t" else 1

				if new_charcount > offset:
					break

				new_offset += 1

			# make sure it doesn't overflow into the next line
			new_loc = Region(min(new_line.a + new_offset, new_line.b))
		elif by == "c" or by == "characters":
				new_loc = Region(cur_loc.a + 2*forward - 1)
		else:
			self.window.status_message("Invalid move_last_cursor command \"by\" option '%s'" % by)

		self.view.selection.subtract(cur_loc)
		self.view.selection.add(new_loc)


