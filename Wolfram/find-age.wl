dateOfBirth = DateObject@ {2007, 7, 8, 17, 12, 0}

GetAge[DOB_ : dateOfBirth] := Module[{diff, milliseconds, microseconds},
	(* DOB should be a DateObject with at least a year present. *)
	diff = DateDifference[
		Now,
		DateObject@ Prepend[
			Drop[DOB[[1]], 1],
			Today[[1]][[1]]
		],
		{"Minutes", "Seconds"}
	];
	milliseconds = Quantity[1000 (diff[[1]][[1]][[-1]] ~ Mod ~ 1), "Milliseconds"];
	microseconds = Quantity[Round[1000 (milliseconds[[1]] ~ Mod ~ 1)], "Microseconds"];
	diff[[1]][[1]][[-1]] = Floor@ diff[[1]][[1]][[-1]];
	milliseconds[[1]] = Floor@ milliseconds[[1]];

	Today[[1]][[1]] - DOB[[1]][[1]] - UnitConvert[
		diff + milliseconds + microseconds,
		"Day"
	][[1]] / 360
]

PrintAgeForever[DOB_ : dateOfBirth] := While[True,
	Print@ N[
		Quantity[GetAge@ DOB, "Years"],
		20
	];

	Pause[1/10]
]
