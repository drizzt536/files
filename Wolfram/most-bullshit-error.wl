(* most bullshit error ever. It seems like a bug in the language itself. *)


(* no license errors, control group *)
	(* these functions look like they probably require licensing to work *)
	CloudDeploy[APIFunction[{"x" -> "Integer"}, #x^2 &], Permissions -> "Private"] // DeleteFile;
	WolframAlpha["integrate sin(x) dx"];
	ResourceData["Epidemic Data for Novel Coronavirus COVID-19"];
	Predict[{{1, 1} -> 2, {2, 2} -> 4, {3, 3} -> 6}] [{4, 5}];
	TextTranslation["Hello, world!", "Spanish"]; (* requires front end *)
	SpeechRecognize[ExampleData[{"Audio", "Apollo11SmallStep"}]];
	ImageIdentify@ ExampleData[{"TestImage", "Lena"}];
	FinancialData["GOOGL", "Jan. 1, 2020"];
	Print[2 + x + y]; (* control group *)


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


(* Extra details: *)

(* x < 38794 works (terminates evaluation), x >= 38794 fails (assuming F[38814]) *)
$RecursionLimit = 40000
F[0] = 0
F[n_] := F[n] = F[n - 1] + 0 (* without the `F[n] = ` part or the `+ 0` part, it works fine.
	The `+ 0` can be basically anything. `^2`, ` // Sin`, `~Mod~ 2`, `* 1`, etc. As long as
    it is something. *)
F[38814] (* x < 38814 works, x >= 38814 fails, assuming $RecursionLimit = 40000. This is
	always the line that fails *)

(*
    wolframscript gives this message:
        `The Wolfram Engine exited because of a license error.`
    both locations of wolframscript do this.

    math.exe, wolfram.exe, MathKernel.exe, and WolframKernel.exe just close with no message.

    When running math.exe through WindowsTerminal.exe, it says the exit code is 3221225725
    (0xc00000fd), and it doesn't display the "... license error." message.

    When running through www.wolframcloud.com, when you get to `F[38814]`, it doesn't exit,
	but it does remove all the `In[1]`, ..., `Out[2]`, etc. stuff, and it makes them all say
	`In[*]` or `Out[*]` until you re-evaluate them.

	The bug is in both v13.3.? (I think .0, not sure) and v14.0
*)
