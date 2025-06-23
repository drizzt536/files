(*
	a Cos[x] + b Sin[x] + c == 0
	this result isn't super helpful since it comes from the results of Solve,
*)

Solve1DegreeTrig[{a_?NumericQ, b_?NumericQ, c_?NumericQ}, n_Integer : 0] /; a == 0 && b != 0 :=
	{ x -> Mod[ArcSin[c/a], 2 Pi] + 2 Pi n }

Solve1DegreeTrig[{a_?NumericQ, b_?NumericQ, c_?NumericQ}, n_Integer : 0] /; a != 0 && b == 0 :=
	{ x -> Mod[ArcCos[c/a], 2 Pi] + 2 Pi n }

Solve1DegreeTrig[{a_?NumericQ, b_?NumericQ, c_?NumericQ}, n_Integer : 0] /; a != 0 && b != 0 := {
	x -> Mod[ArcTan[
		-a c - b Sign[b] Sqrt[a^2 + b^2 - c^2],
		-b c + a Sign[b] Sqrt[a^2 + b^2 - c^2]
	], 2 Pi] + 2 Pi n,
	x -> Mod[ArcTan[
		-a c + b Sign[b] Sqrt[a^2 + b^2 - c^2],
		-b c - a Sign[b] Sqrt[a^2 + b^2 - c^2]
	], 2 Pi] + 2 Pi n
}
