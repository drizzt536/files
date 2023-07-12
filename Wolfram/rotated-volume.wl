

(* rotate f(x) around g(x) or vice versa. Disk method *)
(* if it is rotated around g(y), then swap instances of x and y *)


Rx := F[x] - G[x] (* radius of each disk *)
Ax := Pi R^2 (* Area of each disk *)

Vx := Integrate[Pi R^2, x]

Hx := dx (* height of each disk *)
(*  V == ∫AH  *)
(* integral of cylinder volume, with functions and adjusted height *)


(* `y` is a dummy variable. just replace them with `x` and do it the same as before *)

Ry := F[y] - G[y] (* radius of each disk *)
Ay := Pi R^2 (* Area of each disk *)

Vy := Integrate[Pi R^2, y]


Hy := dy (* height of each disk *)


(* area between f(x) and g(x) *)
Integrate[Abs[Subtract[F[x],G[x]]],{x}~Join~(x/.Solve[Equal[F[x],G[x]],x])]
Integrate[Abs[F[x]-G[x]],{x,x/.Solve[F[x]==G[x],x]}//Flatten]

Integrate[
	Abs[ F[x] - G[x] ],
	{
		x,
		x /. Solve[F[x] == G[x],x]
	} // Flatten
]

2!

(* ∫ |f-g| dx, Solve[F[x] == G[x],x] *)


(*
Newton[equation_, guess_: Null, iterations_: 10] := Module[{F, G, x0, x1},
	F[x_] := Subtract@@equation; (* Apply[Subtract, equation] *)
	G[x_] := x - F'[x] / F[x];

	x0 := If[guess === Null, 1, guess];
	x1 = G[x0];

	While [
		iterations --> 0 && x0 != x1,
		{x0, x1} = {x1, G[x1]};
	];
	x1;
]
*)
