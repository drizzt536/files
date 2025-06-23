(*
F[0] := {{}}
F[1] := {{1}}
F[2] := {
	{1, 1},
	{1, 1}
}
F[3] := {
	{1, 2, 1},
	{2, 4, 2},
	{1, 2, 1}
}
F[4] := {
	{1, 3, 3, 1},
	{3, 9, 9, 3},
	{3, 9, 9, 3},
	{1, 3, 3, 1}
}
F[5] := {
	{ 1,  4,  6,  4,  1},
	{ 4, 16, 24, 16,  4},
	{ 6, 24, 36, 24,  6},
	{ 4, 16, 24, 16,  4},
	{ 1,  4,  6,  4,  1}
}
F[6] := {
	{  1,   5,  10,  10,   5,   1},
	{  5,  25,  50,  50,  25,   5},
	{ 10,  50, 100, 100,  50,  10},
	{ 10,  50, 100, 100,  50,  10},
	{  5,  25,  50,  50,  25,   5},
	{  1,   5,  10,  10,   5,   1}
}
F[7] := {
	{  1,   6,  15,  20,  15,   6,   1},
	{  6,  36,  90, 120,  90,  36,   6},
	{ 15,  90, 225, 300, 225,  90,  15},
	{ 20, 120, 300, 400, 300, 120,  20},
	{ 15,  90, 225, 300, 225,  90,  15},
	{  6,  36,  90, 120,  90,  36,   6},
	{  1,   6,  15,  20,  15,   6,   1}
} *)

F[level_Integer?Positive] := With[{lvl = level - 1, Choose = Binomial}, Table[
		lvl ~Choose~ row *
		lvl ~Choose~ col,
		{row, 0, lvl},
		{col, 0, lvl}
	]
]

F[level_Integer?Positive, row_Integer?Positive] :=
	(* F[level, row, col] == F[level][[row]] *)
	(* grab the whole row. Or grab the whole column since it is symmetric. *)
	(* the nth row is just the first row scaled by the first value of the nth column. *)
	Binomial[level - 1, row - 1] Table[
		Binomial[level - 1, col],
		{col, 0, level - 1}
	]

F[level_Integer?Positive, row_Integer?Positive, col_Integer?Positive] :=
	(* F[level, row, col] == F[level, row][[col]] == F[level][[row, col]] *)
	Binomial[level - 1, row - 1] Binomial[level - 1, col - 1]
