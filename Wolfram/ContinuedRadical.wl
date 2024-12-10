(*
	a similar idea to continued fractions, but instead of being:
	a_1 + 1/(a_2 + 1/(a_3 + 1/(a_4 + ...))), it is
	a_1 + sqrt(a_2 + sqrt(a_3 + sqrt(a_4 + ...))).

	where a_n is made the largest it can be before moving on to a_{n+1}.
*)

ContinuedRadical[
	x_?NumericQ,
	total_Integer?NonNegative,
	op_String /; MemberQ[{"list", "approx", "napprox", "diff"}, op]
] := Module[{nlist, xapprox, nxapprox},
	nlist[y_?NumericQ, len_Integer?NonNegative] := NestList[
		{
			(1 + Mod[#[[1]], 1])^2,
			Floor@#[[1]] - 1
		} &,
		{y, Null}, len
	][[2;;All, 2]];

	xapprox[y_, len_] := With[{list = nlist[y, len]},
		Fold[Sqrt[#1] + list[[-#2]] &, 1 + list[[-1]], Range[2, len]]
	];

	nxapprox[y_, len_] := N@ xapprox[y, len];
	diff[y_, len_] := N[cx - xapprox[y, len], 10];

	Symbol[op][x, total]
];

ContinuedRadical[x_?NumericQ, total_Integer] := ContinuedRadical[x, total, "list"];
ContinuedRadical[x_?NumericQ, op_String] := ContinuedRadical[x, 5, op];
ContinuedRadical[x_?NumericQ] := ContinuedRadical[x, "list"];
	