
(*
calculate the potential function of a vector field, if there is one.
assumes x, y, and z are the variables used.
sometimes it will give the wrong answer
*)

(* add things together but ignore duplicate terms *)
Combine[args___] := Plus@@Union@@(If [MatchQ[#, _Plus], List@@ #, {#}] & /@ {args})

PotentialFunction1D[{P_}] := PotentialFunction1D[P]
PotentialFunction1D[P_Function] := PotentialFunction1D[P[x]]
PotentialFunction1D[P_] := FullSimplify@ Integrate[P, x]

PotentialFunction2D[{P_, Q_}] := PotentialFunction2D[P, Q]
PotentialFunction2D[P_Function, Q_Function] := PotentialFunction2D[P[x, y], Q[x, y]]

PotentialFunction2D[P_, Q_] := If [TrueQ@ FullSimplify[ D[Q, x] == D[P, y] ],
	FullSimplify@ Combine[
		FullSimplify@Integrate[P, x],
		FullSimplify@Integrate[Q, y]
	],
	None
]

PotentialFunction3D[{P_, Q_, R_}] := PotentialFunction3D[P, Q, R_]
PotentialFunction3D[P_Function, Q_Function, R_Function] :=
	PotentialFunction3D[P[x,y,z], Q[x,y,z], R[x,y,z]]

PotentialFunction3D[P_, Q_, R_] := If [ TrueQ[ FullSimplify@Curl[{P,Q,R}, {x,y,z}] == {0, 0, 0} ],
	FullSimplify@ Combine[
		FullSimplify@ Integrate[P, x],
		FullSimplify@ Integrate[Q, y],
		FullSimplify@ Integrate[R, z]
	],
	None
]

PotentialFunction[F_List] /; MemberQ[{1, 2, 3}, Length[F]] :=
	Symbol["PotentialFunction" <> ToString[Length[F]] <> "D"][F]
PotentialFunction[F__] := PotentialFunction[{F__}]

(*
this is wrong somehow.
P := +3 y / (x^2 + y^2)
Q := -3 x / (x^2 + y^2)
PotentialFunction2D[P, Q]
*)
