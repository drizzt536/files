from os import system, chdir as cd
from numpy import array, sqrt, arctan2, sign
from manim import *
import manim


# pretend this is a class method and call it using the actual Main class.
def play_scene_1(self) -> None:
	"""Title and Introduction"""
	# field labels in an ellipse around the origin.
	# major fields from before 1907
	fields = [
		["Formal Logic" , +5/3 * UP + 11/3 * RIGHT],
		["Set Theory"   , +0   * UP + 4.1  * RIGHT], # 5 sqrt(97)/12
		["Geometry"     , -5/3 * UP + 11/3 * RIGHT],
		["Arithmetic"   , -2.8 * UP + 0    * RIGHT],
		["Algebra"      , -5/3 * UP - 11/3 * RIGHT],
		["Statistics"   , +0   * UP - 4.1  * RIGHT], # 5 sqrt(97)/12
		["Calculus"     , +5/3 * UP - 11/3 * RIGHT],
		["Analysis"     , +2.8 * UP + 0    * RIGHT],
	]
	nodes = []
	for field in fields:
		label = Tex(field[0]).scale(0.75)
		border_object = Ellipse(
			width = 0.75 + label.width,
			height = 0.75 + label.height,
			color = RED, # this seems to be the default but I am making it explicit
		).move_to(field[1])
		nodes.append( VGroup(
			border_object,
			label.next_to(border_object.get_center(), ORIGIN)
		) )

	foundation_text = Tex(
		"Universal\\\\(Axiomatic)\\\\Foundation",
		color = BLUE
	).scale(0.8)
	foundation_border = Rectangle(
		width = 0.85 + foundation_text.width,
		height = 0.85 + foundation_text.height,
		color = BLUE
	)
	edges = [
		+1*UP + 1*RIGHT, # UR
		+0*UP + 1*RIGHT, # +R
		-1*UP + 1*RIGHT, # DR
		-1*UP + 0*RIGHT, # +D
		-1*UP - 1*RIGHT, # DL
		+0*UP - 1*RIGHT, # +L
		+1*UP - 1*RIGHT, # UL
		+1*UP + 0*RIGHT, # +U
	]

	for i in range(len(edges)): # must be range(len) to mutate the original
		edges[i]  = Arrow(
			start = foundation_border.get_corner(edges[i]),
			end   = nodes[i][0].point_at_angle(
				arctan2(*-nodes[i][0].get_center()[1::-1]) # atan2(-center.y, -center.x)
			)
		).set(color=GREEN)

	title = Tex("The Continuum Hypothesis").shift(0.5 * UP)
	by    = Tex("Presented by"            ).next_to(title, DOWN)
	name  = Tex("Daniel E. Janusch"       ).next_to(by, 0.6 * DOWN)

	self.play(Write(title)         , run_time = 1.50) # self.wait(0.0)
	self.play(Write(by)            , run_time = 1.00) # self.wait(0.0)
	self.play(Write(name)          , run_time = 1.00) ; self.wait(1.0)
	self.play(AnimationGroup(
		Uncreate(title),
		Uncreate(by),
		Uncreate(name),
	)   , run_time = 1.25) ; self.wait(1.5)
	self.play(AnimationGroup(*(
		Write(x)
		for x
		in nodes
	)), run_time = 2.00) ; self.wait(1.0)
	self.play(AnimationGroup(
		Write(foundation_border),
		Write(foundation_text),
	)   , run_time = 1.00) ; self.wait(0.5)
	self.play(AnimationGroup(*(
		Write(x)
		for x
		in edges
	)), run_time = 1.00) ; self.wait(2.0)
	self.play(AnimationGroup(*(
		Uncreate(x)
		for x
		in edges + [foundation_border, foundation_text]
	)), run_time = 2.00) ; self.wait(0.5)
	self.play(AnimationGroup(*(
		Uncreate(item)
		for vgroup in nodes
		for item in vgroup
		# nodes.flatMap(e => Uncreate(e))
	)), run_time = 1.00) ; self.wait(4/3)


def play_scene_2(self) -> None:
	"""Basic CH Explanation"""
	naturals = MathTex(R"\text{naturals}\!:\left\{1,2,3,4,5,\cdots\right\}").shift(2 * UP)
	reals = MathTex(R"\text{reals}\!:\left\{1,~-\dfrac45,~\pi-\sqrt e,~\ln17,~\cdots\right\}").shift(2.2*DOWN)
	text = Tex(R"Continuum Hypothesis:\\there is no set of a size in between these two").set(color=BLUE)
	undecidable = Tex("*Unsolved and Undecidable").to_corner(UL).set(color=GREEN)

	self.play(Write(naturals), run_time = 1)
	self.play(Write(reals), run_time = 1)
	self.play(Write(text), run_time = 1.5)
	self.play(Write(undecidable), run_time = 1)
	self.wait(1.25)
	self.play(AnimationGroup(
		naturals   .animate.shift(LEFT * 13),
		text       .animate.shift(LEFT * 13),
		reals      .animate.shift(LEFT * 13),
		undecidable.animate.shift(LEFT * 13),
	), run_time = 1)
	self.remove(naturals, text, reals,undecidable)


def play_scene_3(self) -> None:
	"""Rationals are countable"""

	rational_table = MathTable([
		["\\tfrac11", "\\tfrac21", "\\tfrac31", "\\tfrac41", "\\cdots"],
		["\\tfrac12", "\\tfrac22", "\\tfrac32", "\\tfrac42", "\\cdots"],
		["\\tfrac13", "\\tfrac23", "\\tfrac33", "\\tfrac43", "\\cdots"],
		["\\tfrac14", "\\tfrac24", "\\tfrac34", "\\tfrac44", "\\cdots"],
		["\\vdots", "\\vdots", "\\vdots", "\\vdots", "\\ddots"],
	], h_buff = 1).shift(3 * LEFT)

	out_set = MathTex(R"\left\{\tfrac11,\,\tfrac21,\,\tfrac12,\,\tfrac31,\,\tfrac41,\,\tfrac32,\,\cdots\right\}", tex_to_color_map={
		R"\left\{": WHITE,
		R"\right\}": WHITE,
		R"\tfrac11": GREEN,
		R"\tfrac21": GREEN,
		R"\tfrac12": GREEN,
		R"\tfrac31": GREEN,
		R"\tfrac41": GREEN,
		R"\tfrac32": GREEN,
		R"\cdots"  : GREEN,
	}).shift(UP + 3.5 * RIGHT)
	countable = Tex("This is ", "countable", ".").shift(DOWN + 3.5 * RIGHT).set(color=BLUE)
	underline = Line(color=BLUE).match_width(countable[1]).next_to(countable[1], DOWN, buff=0.06)
	arrow = Arrow(
		start = countable.get_corner(UP),
		end   = out_set.get_corner(DOWN),
		color = BLUE,
		stroke_width = 4,
	)

	spline = VMobject().set(color=GREEN)
	spline.set_points_smoothly([
		rational_table[0][ 0].get_center(),
		rational_table[0][ 1].get_center(),
		rational_table[0][ 5].get_center(),
		rational_table[0][10].get_center(),
		rational_table[0][ 6].get_center(),
		rational_table[0][ 2].get_center(),
		rational_table[0][ 3].get_center(),
		rational_table[0][ 7].get_center(),
		rational_table[0][11].get_center(),
		rational_table[0][15].get_center(),
		rational_table[0][20].get_center(),
		rational_table[0][16].get_center(),
		rational_table[0][12].get_center(),
		rational_table[0][ 8].get_center(),
		rational_table[0][ 4].get_center(),
		rational_table[0][ 9].get_center(),
		rational_table[0][13].get_center(),
		rational_table[0][17].get_center(),
		rational_table[0][21].get_center(),
		rational_table[0][22].get_center(),
		rational_table[0][18].get_center(),
		rational_table[0][14].get_center(),
	])
	tip = ArrowTriangleFilledTip().move_to(rational_table[0][14]).set(color=GREEN).scale(0.5)
	tip.rotate(-135 * DEGREES, about_point=tip.get_center())

	self.play(Write(rational_table), run_time = 1.00) ; self.wait(1.5)
	self.play(Create(spline)       , run_time = 3.00) # self.wait(0.0)
	self.play(Write(tip)           , run_time = 0.25) ; self.wait(1.0)
	self.play(AnimationGroup(
		Write(countable),
		Write(out_set),
		Create(arrow),
	)   , run_time = 1.00) # self.wait(0.0)
	self.play(Create(underline), run_time = 1.00) ; self.wait(1.0)
	self.play(AnimationGroup(
		rational_table.animate.shift(8 * UP),
		countable     .animate.shift(8 * UP),
		underline     .animate.shift(8 * UP),
		out_set       .animate.shift(8 * UP),
		spline        .animate.shift(8 * UP),
		arrow         .animate.shift(8 * UP),
		tip           .animate.shift(8 * UP),
	)   , run_time = 1.00) # self.wait(0)
	self.remove(rational_table, countable, underline, out_set, spline, arrow, tip)


def play_scene_3_old_2(self) -> None:
	"""Rationals are countable; deprecated, no line"""
	rational_table = MathTable([
		["\\tfrac11", "\\tfrac21", "\\tfrac31", "\\tfrac41", "\\cdots"],
		["\\tfrac12", "\\tfrac22", "\\tfrac32", "\\tfrac42", "\\cdots"],
		["\\tfrac13", "\\tfrac23", "\\tfrac33", "\\tfrac43", "\\cdots"],
		["\\tfrac14", "\\tfrac24", "\\tfrac34", "\\tfrac44", "\\cdots"],
		["\\vdots", "\\vdots", "\\vdots", "\\vdots", "\\ddots"],
	], h_buff = 1).shift(3 * LEFT)

	map_table = MathTable([
		["\\tfrac11"],
		["\\tfrac21"],
		["\\tfrac12"],
		["\\tfrac31"],
		["\\vdots"],
	], row_labels = [
		MathTex("1").set(color=GREEN),
		MathTex("2").set(color=GREEN),
		MathTex("3").set(color=GREEN),
		MathTex("4").set(color=GREEN),
		MathTex("\\vdots").set(color=GREEN),
	], h_buff = 1).shift(3.5 * RIGHT)

	ellipsis = map_table[0][9].set(color=RED)
	f1  = MathTex("\\tfrac11").move_to(rational_table[0][ 0]).set(color=RED)
	f2  = MathTex("\\tfrac21").move_to(rational_table[0][ 1]).set(color=RED)
	f3  = MathTex("\\tfrac12").move_to(rational_table[0][ 5]).set(color=RED)
	f4  = MathTex("\\tfrac31").move_to(rational_table[0][ 2]).set(color=RED)
	f5  = MathTex("\\tfrac22").move_to(rational_table[0][ 6]).set(color=RED)
	f6  = MathTex("\\tfrac13").move_to(rational_table[0][10]).set(color=RED)
	f7  = MathTex("\\tfrac41").move_to(rational_table[0][ 3]).set(color=RED)
	f8  = MathTex("\\tfrac32").move_to(rational_table[0][ 7]).set(color=RED)
	f9  = MathTex("\\tfrac23").move_to(rational_table[0][11]).set(color=RED)
	f10 = MathTex("\\tfrac14").move_to(rational_table[0][15]).set(color=RED)
	f11 = MathTex("\\tfrac51").move_to(rational_table[0][ 4]).set(color=RED)
	f12 = MathTex("\\tfrac42").move_to(rational_table[0][ 8]).set(color=RED)
	f13 = MathTex("\\tfrac33").move_to(rational_table[0][12]).set(color=RED)
	f14 = MathTex("\\tfrac24").move_to(rational_table[0][16]).set(color=RED)
	f15 = MathTex("\\tfrac15").move_to(rational_table[0][20]).set(color=RED)

	self.play(Write(rational_table), run_time = 1.75)
	self.wait(1)
	self.play(AnimationGroup(Write(map_table[1:]), *(
		Write(map_table[0][i])
		for i
		in range(0, len(map_table[0]), 2)
	) ), run_time = 1)

	self.play(rational_table[0][0].animate.set(color=RED), run_time=0.25)
	self.add(f1)
	self.play(
		f1.animate.move_to(map_table[0][1]),
		run_time = 0.75
	)

	self.play(rational_table[0][1].animate.set(color=RED), run_time=0.25)
	self.add(f2)
	self.play(
		f2.animate.move_to(map_table[0][3]),
		run_time = 0.75
	)

	self.play(rational_table[0][5].animate.set(color=RED), run_time=0.25)
	self.add(f3)
	self.play(
		f3.animate.move_to(map_table[0][5]),
		run_time = 0.75
	)

	self.play(rational_table[0][2].animate.set(color=RED), run_time=0.25)
	self.add(f4)
	self.play(AnimationGroup(
		AnimationGroup(
			f4.animate.move_to(map_table[0][7]),
			run_time = 0.75
		),
		AnimationGroup(Write(ellipsis), run_time = 0.8),
		lag_ratio = 0.4
	))

	self.play(Succession(
		AnimationGroup(
			rational_table[0][6].animate.set(color=RED),
			Write(f5),
			run_time = 0
		),
		AnimationGroup(f5.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f5), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][10].animate.set(color=RED),
			Write(f6),
			run_time = 0
		),
		AnimationGroup(f6.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f6), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][3].animate.set(color=RED),
			Write(f7),
			run_time = 0
		),
		AnimationGroup(f7.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f7), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][7].animate.set(color=RED),
			Write(f8),
			run_time = 0
		),
		AnimationGroup(f8.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f8), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][11].animate.set(color=RED),
			Write(f9),
			run_time = 0
		),
		AnimationGroup(f9.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f9), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][15].animate.set(color=RED),
			Write(f10),
			run_time = 0
		),
		AnimationGroup(f10.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f10), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(Write(f11), run_time = 0),
		AnimationGroup(f11.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f11), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][8].animate.set(color=RED),
			Write(f12),
			run_time = 0
		),
		AnimationGroup(f12.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f12), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][12].animate.set(color=RED),
			Write(f13),
			run_time = 0
		),
		AnimationGroup(f13.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f13), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(
			rational_table[0][16].animate.set(color=RED),
			Write(f14),
			run_time = 0
		),
		AnimationGroup(f14.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f14), run_time = 0),
		lag_ratio = 0
	))
	self.play(Succession(
		AnimationGroup(Write(f15), run_time = 0),
		AnimationGroup(f15.animate.move_to(ellipsis), run_time = 0.4),
		AnimationGroup(Uncreate(f15), run_time = 0),
		lag_ratio = 0
	))
	
	self.wait(1)
	self.play(AnimationGroup(
		rational_table.animate.shift(10 * UP),
		map_table.animate.shift(10 * UP),
		f1 .animate.shift(10 * UP),
		f2 .animate.shift(10 * UP),
		f3 .animate.shift(10 * UP),
		f4 .animate.shift(10 * UP),
		f5 .animate.shift(10 * UP),
		f6 .animate.shift(10 * UP),
		f7 .animate.shift(10 * UP),
		f8 .animate.shift(10 * UP),
		f9 .animate.shift(10 * UP),
		f10.animate.shift(10 * UP),
		f11.animate.shift(10 * UP),
		f12.animate.shift(10 * UP),
		f13.animate.shift(10 * UP),
		f14.animate.shift(10 * UP),
		f15.animate.shift(10 * UP),
	))
	self.remove(
		*rational_table[0] , *map_table[0] ,
		*rational_table[1:], *map_table[1:],
		f1 , f2 , f3 , f4 , f5 ,
		f6 , f7 , f8 , f9 , f10,
		f11, f12, f13, f14, f15,
	)
	self.wait(0.5)


def play_scene_3_old_1(self) -> None:
	"""Natural to Integer map; deprecated"""
	# 26 seconds is too long
	# pretend this is a class method and call it using the actual Main class.
	table = MathTable([
		["\\text{integers}~(f(n))"],
		["0" ],
		["1" ],
		["-1"],
		["2" ],
		["-2"],
		["3" ],
		["\\vdots"],
	], row_labels = [
		MathTex("\\text{natural indices}~n"),
		MathTex("1").set(color=GREEN),
		MathTex("2").set(color=GREEN),
		MathTex("3").set(color=GREEN),
		MathTex("4").set(color=GREEN),
		MathTex("5").set(color=GREEN),
		MathTex("6").set(color=GREEN),
		MathTex("\\vdots").set(color=GREEN),
	], h_buff = 0.6).scale(0.75)
	formulas = VGroup(
		MathTex("f(n) = \\dfrac{(-1)^n(2n-1)+1}4"),
		MathTex("f^{-1}(n) = \\dfrac{|4n-1|+1}2"),
	).arrange(DOWN).shift(3.5 * RIGHT)
	
	example_1     = MathTex("f(2)=\\dfrac{(-1)^2(2\\cdot2-1)+1}4").shift(2.5*UP + 3.5*RIGHT)
	example_2     = MathTex("f(2)=\\dfrac{(4-1)+1}4"             ).shift(2.5*UP + 3.5*RIGHT)
	example_3     = MathTex("f(2)=\\dfrac44"                     ).shift(2.5*UP + 3.5*RIGHT)
	example_4     = MathTex("f(2)=1"                             ).shift(2.5*UP + 3.5*RIGHT)
	example_1_inv = MathTex("f^{-1}(1)=\\dfrac{|4\\cdot1-1|+1}2" ).shift(1.5*UP + 3.5*RIGHT)
	example_2_inv = MathTex("f^{-1}(1)=\\dfrac{|3|+1}2"          ).shift(1.5*UP + 3.5*RIGHT)
	example_3_inv = MathTex("f^{-1}(1)=\\dfrac42"                ).shift(1.5*UP + 3.5*RIGHT)
	example_4_inv = MathTex("f^{-1}(1)=2"                        ).shift(1.5*UP + 3.5*RIGHT)

	self.play(Write(table))                                       ; self.wait(2.0)
	self.play(table.animate.shift(3.5*LEFT))                      # self.wait(0.0)
	self.play(Write(formulas))                                    ; self.wait(2.0) # example
	self.play(AnimationGroup(
		formulas.animate.shift(2*DOWN),
		Write(example_1)
	))                                 ; self.wait(0.5)
	self.play(ReplacementTransform(example_1, example_2))         # self.wait(0.0)
	self.remove(example_1)                                        ; self.wait(1.0)
	self.play(ReplacementTransform(example_2, example_3))         # self.wait(0.0)
	self.remove(example_2)                                        ; self.wait(1.0)
	self.play(ReplacementTransform(example_3, example_4))         # self.wait(0.0)
	self.remove(example_3)                                        ; self.wait(1.0)
	self.play(Write(example_1_inv))                               ; self.wait(1.0) # inverse
	self.play(ReplacementTransform(example_1_inv, example_2_inv)) # self.wait(0.0)
	self.remove(example_1_inv)                                    ; self.wait(1.0)
	self.play(ReplacementTransform(example_2_inv, example_3_inv)) # self.wait(0.0)
	self.remove(example_2_inv)                                    ; self.wait(1.0)
	self.play(ReplacementTransform(example_3_inv, example_4_inv)) # self.wait(0.0)
	self.remove(example_3_inv)                                    ; self.wait(2.0)
	self.play(AnimationGroup(
		*(# table.map(e => Uncreate(e))
			Uncreate(mobject)
			for mobject
			in (*table[0], *table[1:])
		),
		Uncreate(formulas),
		Uncreate(example_4),
		Uncreate(example_4_inv),
	), run_time = 1)                   ; self.wait(1.5)


def play_scene_4(self) -> None:
	"""Cantor's Diagonal Argument"""
	chapter_title = VGroup(
		Tex("Cantor's Diagonal Argument:"),
		Tex("The Reals are Uncountable"),
	).arrange(DOWN).center()

	table = MathTable([
		["0.1111111111111111111111\\cdots"],
		["0.2222222222222222222222\\cdots"],
		["0.3333333333333333333333\\cdots"],
		["0.4444444444444444444444\\cdots"],
		["\\vdots\\hspace{2em}\\vdots\\hspace{2em}\\vdots\\hspace{2em}\\vdots\\hspace{2em}\\vdots\\hspace{2em}\\vdots"],
	], row_labels = [ # green indices
		MathTex("1").set(color=GREEN),
		MathTex("2").set(color=GREEN),
		MathTex("3").set(color=GREEN),
		MathTex("4").set(color=GREEN),
		MathTex("\\vdots").set(color=GREEN),
	]).shift(0.5 * DOWN)

	# underline important digits
	digit_underlines = Line(
		start = table[0][1].get_corner(DL) + array([0.36, -0.02, 0]),
		end   = table[0][1].get_corner(DL) + array([0.63, -0.02, 0]),
		color = RED
	), Line(
		start = table[0][3].get_corner(DL) + array([0.60, -0.02, 0]),
		end   = table[0][3].get_corner(DL) + array([0.87, -0.02, 0]),
		color = RED
	), Line(
		start = table[0][5].get_corner(DL) + array([0.86, -0.02, 0]),
		end   = table[0][5].get_corner(DL) + array([1.12, -0.02, 0]),
		color = RED
	), Line(
		start = table[0][7].get_corner(DL) + array([1.12, -0.02, 0]),
		end   = table[0][7].get_corner(DL) + array([1.38, -0.02, 0]),
		color = RED
	)

	# top explainer text
	n1 = MathTex(
		"\\text{number}\\!: 0.", "1234\\cdots",
		tex_to_color_map = { "1234\\cdots": RED },
		arg_separator = ""
	).move_to( array([-2.473, 3, 0]) )
	n2 = MathTex(
		"\\text{new number}\\!: 0.", "2345\\cdots",
		tex_to_color_map = { "2345\\cdots": RED },
		arg_separator = ""
	).move_to( array([-2.985, 3, 0]) )
	corner_blue_text = MathTex(
		"\\text{by definition not in the list}",
		color = BLUE
	).move_to( array([3, 3, 0]) )

	self.play(AnimationGroup(
		AnimationGroup(Write(chapter_title[0]), run_time = 1),
		AnimationGroup(Write(chapter_title[1]), run_time = 1),
	)     , run_time = 1) ; self.wait(1.00)
	self.play(AnimationGroup(
		Uncreate(chapter_title[0]),
		Uncreate(chapter_title[1])
	)     , run_time = 1) ; self.wait(1.00)
	self.play(Write(table)           , run_time = 2) ; self.wait(1.50)
	for digit_underline in digit_underlines:         # self.wait(0.00)
		self.play(Create(digit_underline))           ; self.wait(0.75)
	self.play(Write(n1))                             ; self.wait(0.75)
	self.play(ReplacementTransform(n1, n2))          # self.wait(0.00)
	self.remove(n1)                                  ; self.wait(0.75)
	self.play(Write(corner_blue_text), run_time = 1) ; self.wait(2.00)
	self.play(AnimationGroup(
		*(# mobjects.concat(digit_underlines).map(e => Uncreate(e))
			Uncreate(mobject)
			for mobject
			in (*table[0], *table[1:]) + digit_underlines
		),
		Uncreate(n2),
		Uncreate(corner_blue_text),
	), run_time = 2) ; self.wait(0.8)


def play_scene_5(self) -> None:
	"""Inoptimal Listing"""
	table = MathTable([
		["\\text{naturals}"],
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		["\\vdots"],
	], row_labels = [
		MathTex("\\text{indices}"),
		MathTex("1").set(color=GREEN),
		MathTex("2").set(color=GREEN),
		MathTex("3").set(color=GREEN),
		MathTex("4").set(color=GREEN),
		MathTex("5").set(color=GREEN),
		MathTex("6").set(color=GREEN),
		MathTex("\\vdots").set(color=GREEN),
	], h_buff = 0.6).scale(0.75)

	text_1 = Tex(R"All infinite indices are used up,\\not all naturals are in the list.").shift(1.5*UP + 2.6*RIGHT).set(color=BLUE)
	text_2 = Tex(R"Because we skipped numbers,\\this is not an ", "optimal listing", ".").shift(1.5*DOWN + 2.6*RIGHT).set(color=BLUE)
	underline = Line(color=BLUE).match_width(text_2[1]).next_to(text_2[1], DOWN, buff=0)

	self.play(Write(table))                     ; self.wait(2.00)
	self.play(table.animate.shift(3.5*LEFT))    # self.wait(0.00)
	self.play(Write(text_1))                    ; self.wait(0.50)
	self.play(Write(text_2))                    # self.wait(0.00)
	self.play(Create(underline))                ; self.wait(0.75)
	self.play(AnimationGroup(
		*(# table.map(e => move down offscreen)
			mobject.animate.shift(10 * DOWN)
			for mobject
			in (*table[0], *table[1:])
		),
		text_1.animate.shift(10 * DOWN),
		text_2.animate.shift(10 * DOWN),
		underline.animate.shift(10 * DOWN),
	), run_time = 1) # self.wait(0.0)
	self.remove(*table[0], *table[1:], text_1, text_2, underline)


def play_scene_6(self) -> None:
	"""An Optimal Listing: Novel Approach"""
	chapter_title = VGroup(
		Tex("An Optimal Listing:"),
		Tex("A Novel Approach"),
	).arrange(DOWN).center()
	chapter_note = Tex("*Here onwards follows my 2022 paper").scale(0.6).to_corner(UL)

	length = MathTex(R"\text{length}\,n=\lceil\log(1+n)\rceil").shift(3 * UP)
	reverse = MathTex(R"\text{reverse}\,n=\sum_{k=0}^{\text{length}\,n}\left(\left\lfloor\dfrac n{10^k}\right\rfloor\text{mod}\,10\right)\!10^{\text{length}\,n-k-1}").shift(1.5 * UP)
	examples = MathTex(R"& \text{length}\,15\phantom3=2\hspace{2em}\text{reverse}\,15\phantom3=51\\& \text{length}\,123=3\hspace{2em}\text{reverse}\,123=321").shift(1.5 * DOWN)

	X_n = MathTex(R"X_n=\dfrac{\text{reverse}\,n}{10^{\text{length}\,n}").shift(2.5 * UP)
	X_n_text = MathTex(R"\text{This is equivalent to reversing }n\\\text{and adding `0.' to the beginning.}").set(color=BLUE).shift(0.6 * UP)
	X = MathTex(R"X = \{0,0.1,0.2,\cdots,0.01,0.02,\cdots\}").shift(0.8 * DOWN)
	X_text = MathTex(R"X\text{ contains every number in the range }\\(0,1)\text{ and is countable by definition}~~~").set(color=BLUE).shift(2 * DOWN)

	R    = MathTex(R"R_n = X + n").shift(0.75 * UP)
	R_nk = MathTex(R"R_{n,k} = \left(n+\dfrac{\text{reverse}\,k}{10^{\text{length}\,k}}\right)").shift(0.75 * DOWN)

	R_table = MathTable([
		["0.0", "0.1", "0.2", "0.3", "\\cdots"],
		["1.0", "1.1", "1.2", "1.3", "\\cdots"],
		["2.0", "2.1", "2.2", "2.3", "\\cdots"],
		["3.0", "3.1", "3.2", "3.3", "\\cdots"],
		["\\vdots", "\\vdots", "\\vdots", "\\vdots", "\\ddots"],
	], h_buff = 1).shift(3 * LEFT)
	spline = VMobject().set(color=GREEN)
	spline.set_points_smoothly([
		R_table[0][ 0].get_center(),
		R_table[0][ 1].get_center(),
		R_table[0][ 5].get_center(),
		R_table[0][10].get_center(),
		R_table[0][ 6].get_center(),
		R_table[0][ 2].get_center(),
		R_table[0][ 3].get_center(),
		R_table[0][ 7].get_center(),
		R_table[0][11].get_center(),
		R_table[0][15].get_center(),
		R_table[0][20].get_center(),
		R_table[0][16].get_center(),
		R_table[0][12].get_center(),
		R_table[0][ 8].get_center(),
		R_table[0][ 4].get_center(),
		R_table[0][ 9].get_center(),
		R_table[0][13].get_center(),
		R_table[0][17].get_center(),
		R_table[0][21].get_center(),
		R_table[0][22].get_center(),
		R_table[0][18].get_center(),
		R_table[0][14].get_center(),
	])
	tip = ArrowTriangleFilledTip().move_to(R_table[0][14]).set(color=GREEN).scale(0.5)
	tip.rotate(-145 * DEGREES, about_point=tip.get_center())

	R_row_labels = VGroup(*(
		MathTex(f"R_{i}").move_to(
			2*R_table[0][4 + 5*i].get_center() -
			R_table[0][3 + 5*i].get_center()
		) for i in range(4)
	))

	positives = MathTex(R"\mathbb R^+\text{ is countable}").to_edge(RIGHT)

	negatives = MathTex(R"\mathbb R\text{ is countable}")
	integers_example = MathTex(R"\left\{1,-1,~2,-2,~3,-3,\cdots\right\}")

	conclusions = VGroup(
		MathTex(R"\left|\mathbb N\right|=\left|\mathbb R\right|"),
		Tex(R"nothing can be in-between them."),
		Tex(R"The Continuum Hypothesis must be true."),
	).arrange(2 * DOWN).center().shift(1.5 * LEFT)
	thanks = Tex("Thanks For Watching!")


	self.play(AnimationGroup(
		AnimationGroup(Write(chapter_title[0]), run_time = 1),
		AnimationGroup(Write(chapter_title[1]), run_time = 1),
		AnimationGroup(Write(chapter_note)    , run_time = 1),
	), run_time = 1) ; self.wait(1)
	self.play(AnimationGroup(
		Uncreate(chapter_title[0]),
		Uncreate(chapter_title[1]),
		Uncreate(chapter_note),
	), run_time = 1) ; self.wait(1)
	self.play(Write(length)     , run_time = 1) ; self.wait(1)
	self.play(Write(reverse)    , run_time = 1) ; self.wait(1)
	self.play(Write(examples)   , run_time = 1) ; self.wait(1)
	self.play(AnimationGroup(
		Uncreate(length),
		Uncreate(reverse),
		Uncreate(examples),
	), run_time = 1) # self.wait(0)

	self.play(Write(X_n)        , run_time = 1) ; self.wait(1)
	self.play(Write(X_n_text)   , run_time = 1) ; self.wait(1)
	self.play(Write(X)          , run_time = 1) ; self.wait(1)
	self.play(Write(X_text)     , run_time = 1) ; self.wait(1)
	self.play(AnimationGroup(
		X_n.animate.to_corner(UR),
		Uncreate(X_n_text),
		Uncreate(X),
		Uncreate(X_text),
	), run_time = 1) # self.wait(0)

	self.play(Write(R)          , run_time = 1.0) # self.wait(0)
	self.play(Write(R_nk)       , run_time = 1.0) ; self.wait(1)
	self.play(AnimationGroup(
		R.animate.next_to(X_n, 1.25 * DOWN),
		Uncreate(R_nk),
		Write(R_table),
	), run_time = 1.4) # self.wait(0)

	self.play(Write(R_row_labels), run_time = 1.00) ; self.wait(1)
	self.play(Create(spline)     , run_time = 3.00) # self.wait(0)
	self.play(Write(tip)         , run_time = 0.25) ; self.wait(1)

	self.play(Write(positives)  , run_time = 1) ; self.wait(1)
	self.play(AnimationGroup(
		positives.animate.next_to(R, DOWN),
		Uncreate(R_row_labels),
		Uncreate(R_table),
		Uncreate(spline),
		Uncreate(tip),
	), run_time = 1)

	self.play(Write(integers_example), run_time = 1) ; self.wait(2)

	self.play(ReplacementTransform(integers_example, negatives), run_time = 1)
	self.remove(integers_example)
	self.play(negatives.animate.next_to(positives, 1.1 * DOWN), run_time = 1)
	self.wait(1)
	self.play(Write(conclusions), run_time = 2) ; self.wait(1)
	self.play(AnimationGroup(
		Uncreate(X_n),
		Uncreate(R),
		Uncreate(positives),
		Uncreate(negatives),
		Uncreate(conclusions[0]),
		Uncreate(conclusions[1]),
		Uncreate(conclusions[2]),
	))
	self.play(Write(thanks), run_time = 1)
	self.wait(0.5)

	# k = MathTex(R"k=\left\lfloor\dfrac{1+\left\lfloor\sqrt{1+4n}\right\rfloor}2\right\rfloor").shift(2.5 * UP + 3 * LEFT)
	# t = MathTex(R"t=\left\lfloor\dfrac{n+k\left(1-k\right)}2\right\rfloor").shift(2.5 * UP + 3 * RIGHT)
	# A = MathTex(R"A=R_{k,k-t-1}").shift(DOWN)
	# self.play(Write(k), run_time = 1) ; self.wait(1)
	# self.play(Write(t), run_time = 1) ; self.wait(1)
	# self.play(Write(A), run_time = 1) ; self.wait(1)


class Main(Scene):
	# scene construction order: 3 2 1 4 5
	def construct(self) -> None:
		play_scene_1(self)
		play_scene_2(self)
		play_scene_3(self)
		play_scene_4(self)
		play_scene_5(self)
		play_scene_6(self)

# !manim render ./index.py --fps 120 --quality h
