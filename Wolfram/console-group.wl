{Group, Println} = Module[{
	$IndentLevel,
	$IndentString,
	Println,
	Group
},
	$IndentLevel = 0;
	$IndentString := StringRepeat["\t", $IndentLevel];

	Println[args___] := Print@ Sequence[$IndentString, args];

	SetAttributes[Group, HoldAll];

	Group[consoleGroup$name_String, expr_] := (
		Println[consoleGroup$name <> ":"];
		++$IndentLevel;
		expr;
		--$IndentLevel;
	);

	{Group, Println}
];

(* example:
Group[ "group 1",
	Println["1 - 1"];
	Println["1 - 2"];
	Println["1 - 3"];
	Println[];

	Group[ "group 2",
		Println["2 - 1"];
		Println["2 - 2"];
		Println["2 - 3"];
	];
]
*)
