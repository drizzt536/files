(*
given $f(x)$ is the generating function of the sequence $a$, $a_n$ is given by this formula:

+---------------------------------------------------+
|       (n)                                         |
| a  = f   (0)                                      |
|  n                                                |
|                                    // c = 0       |
|           ∞                           ∞           |
|        -------                     -------        |
|        \        (n)                \           n  |
|         \      f   (c)         n    \         x   |
| f(x) =  /     --------- (x - c)  =  /     a  ---- |
|        /         n!                /       n  n!  |
|        -------                     -------        |
|         n = 0                       n = 0         |
+---------------------------------------------------+

$a_n$ is zero indexed.
*)

Int = Integer

(* pass a function instead of an expression *)
GeneratingFunctionTerms[f_Function, span_Span] := GeneratingFunctionTerms[f[#], #, span] &@ Unique[]

(* main implementation *)
GeneratingFunctionTerms[expr_, x_Symbol, start_Int ;; stop_Int] /; start >= 0 := Table[
	D[expr, {x, n}] / n! /. x -> 0, (* f^(n)(0) / n! *)
	{n, start, stop}
]

(* args in a different order *)
GeneratingFunctionTerms[expr_, span_Span, x_Symbol] := GeneratingFunctionTerms[expr, x, span]
