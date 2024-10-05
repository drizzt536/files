(*
transpose using M^T instead of Transpose[M] or M \[Transpose].
if you have previously set `T` to anything, it will be cleared.
T is protected after this. If you unprotect T and change it, this will break.
*)


SetAttributes[WithUnprotected, HoldRest] (* so the block doesn't execute until it is supposed to *)
WithUnprotected[x : _Symbol | _Function, block_] := (
	Unprotect[x];
	block;
	Protect[x];
)

WithUnprotected[Transpose,
	(*
	MatrixForm[{1, 2, 3}] is a column vector for some reason, but that is stupid so I don't care.
	I am treating it as a row vector, because that makes more sense to me.
	*)
	Transpose[x_List /; Length@*Dimensions@ x == 1] := {#} & /@ x
]

ClearAll[T]
Protect[T]

WithUnprotected[Power,
	(* 1. Remove threading so the next step will work *)

	ClearAttributes[Power, Listable]

	(* 2. Make M^T a transpose *)
	m_List^T := m \[Transpose]

	(* M^T^T => M,    M^T^2 => (M^T)^2 *)
	(*
		This makes it so M^T^x == (M^T)^x, for whatever power comes right after the transpose.
		This is likely what you want though.
		normally the exponentiation will be right-associative.
	*)
	m_List^T^p_ := m \[Transpose]^p

	(* 4. add back threading, but only after it checks for transposes. *)
	b_List^p_List /; Length[b] == Length[p] := Table[b[[i]]^p[[i]], {i, Length@ b}]
	b_List^p_List := Throw[Thread::tdlen] (* I don't know the correct way to do this. *)
	b_    ^p_List := b^# &/@ p
	b_List^p_     := #^p &/@ b
]
