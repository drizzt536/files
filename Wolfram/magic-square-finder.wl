(* F[x_Integer] /; PositiveQ[x] := x^2 *)

GetList[i_Integer] /; Positive@ i := Module[{
	list,
	origList,
	twos,
	threes,
	fours
},
	If [i < 0, Return@ Nothing];

	list = Take[#, 3] & /@ SortBy[
		{a, b, c, i} /. # & /@ Solve[
			{ a^2 + b^2 + c^2 == i,
				2 < a < b < c < i },
			{a, b, c},
			PositiveIntegers
		],
		Last
	];
	(* temporary value *)
	origList = Keys@ Select[Counts@ Flatten[list, 1], # == 1 &];

	(* remove equations where any number only appears in that equation and no others *)
	origList = list = If[ContainsAny[#, oneKeys], Nothing, #] & /@ list;

	If [Length@ list < 9, Return@ Nothing];

	list = Counts[ Min[4, #] & /@ Values@ Counts@ Flatten[list, 1] ];

	twos = Lookup[list, 2, 0];
	threes = Lookup[list, 3, 0];
	fours = Lookup[list, 4, 0];

	If [twos < 4, threes += twos - 4];
	If [threes < 4, fours += threes - 4];
	If [fours < 1, Nothing, i -> origList]
];
F[x_Integer -> y_Integer] /; 0 < x <= y := Association@ Table[GetList@ i, {i, x, y}];
F[x_Integer] /; Positive@ x := F[x -> x];

(* F[1 -> 606300] == <||> *)

i = 606300
list = {}

While[Length@ list == 0,
	WriteString["stdout", "attempting total: ", ++i, ", "];
	list = F@ i;
]

(*
+--------+--------+--------+
|        |        |        |
|   x1   |   x2   |   x3   |
|        |        |        |
+--------+--------+--------+
|        |        |        |
|   x4   |   x5   |   x6   |
|        |        |        |
+--------+--------+--------+
|        |        |        |
|   x7   |   x8   |   x9   |
|        |        |        |
+--------+--------+--------+

+---+---+---+   |   +---+---+---+
| 1 | 2 | 3 |   |   | 3 | 2 | 3 |
+---+---+---+   |   +---+---+---+
| 4 | 5 | 6 |   |   | 2 | 4 | 2 |
+---+---+---+   |   +---+---+---+
| 7 | 8 | 9 |   |   | 3 | 2 | 3 |
+---+---+---+   |   +---+---+---+
*)

(*
 - four numbers must appear at least three times.
 - four numbers must appear at least two   times.
 - one  number  must appear at least four  times.
 - any numbers that appear less than two times can be ignored
 - there must be 9+ equations each with no numbers that only
 	appear in that equation.
*)

