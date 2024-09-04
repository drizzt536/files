ImageTakeLeftHalf[image_Image] := With[{ width = ImageDimensions[image][[1]] },
	ImageTake[image, All, {1, Floor[width / 2]}]
]

ImageTakeRightHalf[image_Image] := With[{ width = ImageDimensions[image][[1]] },
	ImageTake[image, All, {Floor[width / 2] + 1, -1}]
]

ImageTakeLeftHalf[filename_String] := ImageTakeLeftHalf@ Import@ filename
ImageTakeRightHalf[filename_String] := ImageTakeRightHalf@ Import@ filename


ImageAssembleHalves[a_Image, b_Image               ] := ImageAssemble[{ {a, b} }]
ImageAssembleHalves[a_Image, b_Image, Top -> Bottom] := ImageAssemble[{  a, b  }]
ImageAssembleHalves[a_Image, b_Image, Left -> Right] := ImageAssemble[{ {a, b} }]
ImageAssembleHalves[a_Image, b_Image, Right -> Left] := ImageAssemble[{ {b, a} }]
ImageAssembleHalves[a_Image, b_Image, Bottom -> Top] := ImageAssemble[{  b, a  }]

(* Never = _ /; False *)
(* Always = _ /; True *)

ImageAssembleHalves[a_String, b_String] := ImageAssembleHalves[a, b, Left -> Right]

ImageAssembleHalves[a_String, b_String, option_] /; MatchQ[
	option,
	(Top -> Bottom) |
	(Left -> Right) |
	(Right -> Left) |
	(Bottom -> Top)
] := ImageAssembleHalves[
	ImageTakeLeftHalf@ a,
	ImageTakeRightHalf@ b,
	option
]

(*
(* example script: use the left half of `a` and the right half of image `b`. *)
final = ImageAssembleHalves["./a.jpg", "./b.jpg", Left -> Right]

Export["./final.jpg", final]
*)
