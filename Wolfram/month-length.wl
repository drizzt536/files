MonthIndex = <|
	(* these aren't built-in symbols but it doesn't matter *)
	January     -> 1,
	February    -> 2,
	March       -> 3,
	April       -> 4,
	May         -> 5,
	June        -> 6,
	July        -> 7,
	August      -> 8,
	September   -> 9,
	October     -> 10,
	November    -> 11,
	December    -> 12,

	"January"   -> 1,
	"February"  -> 2,
	"March"     -> 3,
	"April"     -> 4,
	"May"       -> 5,
	"June"      -> 6,
	"July"      -> 7,
	"August"    -> 8,
	"September" -> 9,
	"October"   -> 10,
	"November"  -> 11,
	"December"  -> 12
|>

MonthLength[month_] := Quantity[
	DateObject[{
		Today[[1]][[1]],
		1 + MonthIndex[month],
		-1
	}][[1]][[-1]],
	"Days"
]

MonthLength[month_, year_] := Quantity[
	DateObject[{
		year,
		1 + MonthIndex[month],
		-1
	}][[1]][[-1]],
	"Days"
]
