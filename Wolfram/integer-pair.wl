IntegerPair[n_Integer] /; n >= 0 := Module[{a, b, c, main, sign},
	(*
	return the `n`th integer pair.
	different from the nth rational:
		- both/either parts can be negative
		- both parts can be zero.
	*)
	a = Floor[n / 4];
	b = Floor[(Sqrt[8 a + 1] - 1) / 2]; (* (PolygonalNumber^-1)[a] // Floor *)
	c = a - PolygonalNumber[b];

	main = {c, b - c};

	(*
		sign = <|
			0 -> {+1, +1},
			1 -> {-1, +1},
			2 -> {+1, -1},
			3 -> {-1, -1}
		|>[n ~Mod~ 4];

		sign = {
			Cos[Pi n] + Sin[Pi n],
			Cos[Pi n/2] + Sin[Pi n/2]
		};
	*)
	sign = (-1)^Floor@ {n, n/2};

	main sign
]

IntegerPairGroup[n_Integer] /; n >= 0 := With[{k = 4n - 1},
	Association @@ # -> F[#] & /@ (k + Range[4])
]
