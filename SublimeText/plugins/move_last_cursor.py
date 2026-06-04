from sublime import Region
from sublime_plugin import TextCommand

class MoveLastCursor(TextCommand):
	# sticky memory across repeated executions
	intended_offset = None
	expected_pos    = None
	view_id         = None

	def run(self, edit, *, by="lines", forward=True):
		view = self.view

		cur_loc  = view.selection[-1]
		tab_size = view.settings().get("tab_size", 4)

		# invalidate cache if the view changed or if the cursor position changed unexpectedly
		if MoveLastCursor.view_id != view.id() or MoveLastCursor.expected_pos != cur_loc.a:
			MoveLastCursor.intended_offset = None
			MoveLastCursor.view_id         = view.id()

		if by == "l" or by == "lines":
			cur_line = view.line(cur_loc.a)
			current_offset = len(view.substr(Region(cur_line.a, cur_loc.a)).expandtabs(tab_size))

			if MoveLastCursor.intended_offset is None:
				MoveLastCursor.intended_offset = current_offset

			offset = MoveLastCursor.intended_offset

			new_line = view.line(cur_line.b + 1) if forward else view.line(cur_line.a - 1)

			new_offset    = 0 # offset assuming len("\t") == 1
			new_charcount = 0 # offset assuming len("\t") == tab_size

			for c in view.substr(new_line):
				new_charcount += tab_size if c == "\t" else 1

				if new_charcount > offset:
					break

				new_offset += 1

			# make sure it doesn't overflow into the next line
			new_loc = Region(min(new_line.a + new_offset, new_line.b))
		elif by == "c" or by == "characters":
			new_loc = Region(cur_loc.a + 2*forward - 1)
			MoveLastCursor.intended_offset = None
		else:
			self.window.status_message(f"ERROR: `move_last_cursor` invalid \"by\" option '{py}'")
			return

		MoveLastCursor.expected_pos = new_loc.a

		view.selection.subtract(cur_loc)
		view.selection.add(new_loc)
