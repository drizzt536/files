(* most bullshit error ever. It seems like a bug in the language itself. *)


(* no license errors, control group *)
	(* these functions look like they probably require licensing to work *)
	(* So since these all work, everything should (Just a guess). *)
	CloudDeploy[APIFunction[{"x" -> "Integer"}, #x^2 &], Permissions -> "Private"] // DeleteFile;
	WolframAlpha["integrate sin(x) dx"];
	ResourceData["Epidemic Data for Novel Coronavirus COVID-19"];
	Predict[{{1, 1} -> 2, {2, 2} -> 4, {3, 3} -> 6}] [{4, 5}];
	TextTranslation["Hello, world!", "Spanish"]; (* requires front end *)
	SpeechRecognize[ExampleData[{"Audio", "Apollo11SmallStep"}]];
	ImageIdentify@ ExampleData[{"TestImage", "Lena"}];
	FinancialData["GOOGL", "Jan. 1, 2020"];
	Print[2 + x + y]; (* control group *)


(* basically if you change anything, it stops erroring. *)
(* license error, version 1 *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := F[n] = F[n - 1] + 0
	F[38814]

(* no license error *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := F[n] = F[n - 1]
	F[38814]
(* no license error *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := F[n - 1] + 0
	F[38814]
(* no license error *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := F[n] = F[n - 1] + 0
	F[38813]
(* no license error *)
	$RecursionLimit = 38793
	F[0] = 0
	F[n_] := F[n] = F[n - 1] + 0
	F[38814]


(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(**)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)


(* license error, version 2 *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := (prev = F[n - 1]; F[n] = prev)
	F[38814]

(* no license error *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := With[{prev = F[n - 1]}, F[n] = prev]
	F[38814]
(* no license error *)
	$RecursionLimit = 40000
	F[0] = 0
	F[n_] := Module[{prev = F[n - 1]}, F[n] = prev]
	F[38814]


(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(**)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)

(* license error, version 3 (simpler) *)
	$RecursionLimit = 2^16;
	F[x_] := (Print[x]; F[x + 1])
	F[0]


(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(*(**)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)*)


(* Extra details: *)

(* x < 38794 works (terminates evaluation), x >= 38794 fails (assuming F[38814]) *)
$RecursionLimit = 40000
F[0] = 0
(* Changing `n_` to `n_Integer` does nothing. *)
F[n_] := F[n] = F[n - 1] + 0 (* without the `F[n] = ` part or the `+ 0` part, it works fine.
	The `+ 0` can be basically anything. `^2`, ` // Sin`, `~Mod~ 2`, `* 1`, etc. As long as
	it is something. *)
F[38814] (* x < 38814 works, x >= 38814 fails, assuming $RecursionLimit = 40000. This is
	always the line that fails *)

(*

	I think this is two separate bugs.
	The first bug is printing that there was a license error on stack overflows.
	The second bug is that these two code snippets behave differently:
		1. `F[n_] := F[n] = F[n - 1] + 0`
		2. `F[n_] := F[n] = F[n - 1]`



	wolframscript gives this message:
		`The Wolfram Engine exited because of a license error.`
	both locations of wolframscript do this.

	math.exe, wolfram.exe, MathKernel.exe, and WolframKernel.exe just close with no message.

	When running math.exe through WindowsTerminal.exe, it says the exit code is 3221225725
	(0xc00000fd) (stack overflow), and it doesn't display the "... license error." message.
		Why does it say license error on stack overflow?

	When running through www.wolframcloud.com, when you get to `F[38814]`, it doesn't exit,
	but it does remove all the `In[1]`, ..., `Out[2]`, etc. stuff, and it makes them all say
	`In[*]` or `Out[*]` until you re-evaluate them.

	The bug is in v14.0, v14.1, v13.3.? (I think .0, not sure) and possibly/probably earlier.

	on my pc, the license is stored in `%AppData%/WolframEngine/Licensing/mathpass`.
	It keeps adding new duplicate lines, though I don't know if that is normal or not.

	I have not tried it on Mathematica, because I don't want to risk ruining my install.
*)


F[x_] := (Print[x]; F[x + 1]);



(*
	NOTE: here is another way to crash the engine:
	this way exits with an access violation (3221225477, 0xc0000005),
	and prints the license error message
*)
Sum[Ceiling@ FractionalPart[10^n / 3], {n, 0, Infinity}]
