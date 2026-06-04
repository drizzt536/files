import sublime
import sublime_plugin

class DeselectAndCenter(sublime_plugin.TextCommand):
	def run(self, edit):
		view = self.view
		vr = view.visible_region()
		folds = [(r.a, r.b) for r in view.folded_regions()]

		lines = []
		for row in range(view.rowcol(vr.a)[0], view.rowcol(vr.b)[0] + 1):
			tp = view.text_point(row, 0)

			for f_stt, f_end in folds:
				if f_stt <= tp < f_end:
					break
			else:
				lines.append(tp)

		if not lines:
			return

		target_point = lines[len(lines) >> 1]

		sel = view.sel()
		sel.clear()
		sel.add(sublime.Region(target_point, target_point))
