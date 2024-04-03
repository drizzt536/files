ImageTakeLeftHalf[image_Image] := With[{ width = ImageDimensions[image][[1]] },
	ImageTake[image, All, {1, Floor[width / 2]}]
]

ImageTakeRightHalf[image_Image] := With[{ width = ImageDimensions[image][[1]] },
	ImageTake[image, All, {Floor[width / 2] + 1, -1}]
]

ImageTakeLeftHalfFrom[filename_String] := ImageTakeLeftHalf@ Import@ filename
ImageTakeRightHalfFrom[filename_String] := ImageTakeRightHalf@ Import@ filename

ImageAssembleHalves[a_Image, b_Image               ] := ImageAssemble[{ {a, b} }]
ImageAssembleHalves[a_Image, b_Image, Top -> Bottom] := ImageAssemble[{  a, b  }]
ImageAssembleHalves[a_Image, b_Image, Left -> Right] := ImageAssemble[{ {a, b} }]
ImageAssembleHalves[a_Image, b_Image, Right -> Left] := ImageAssemble[{ {b, a} }]
ImageAssembleHalves[a_Image, b_Image, Bottom -> Top] := ImageAssemble[{  b, a  }]

Never = _ /; False
Always = _ /; True

ImageAssembleHalvesFrom[a_String, b_String] :=
	ImageAssembleHalvesFrom[a, b, Left -> Right]

ImageAssembleHalvesFrom[a_String, b_String, option_] /; MatchQ[
	option,
	(Top -> Bottom) |
	(Left -> Right) |
	(Right -> Left) |
	(Bottom -> Top)
] := ImageAssembleHalves[
	ImageTakeLeftHalfFrom@ a,
	ImageTakeRightHalfFrom@ b,
	option
]

(*
final = ImageAssembleHalvesFrom["./a.jpg", "./b.jpg", Left -> Right]
final = ImageExportAssembledHalvesFrom["./final.jpg", "./a.jpg", "./b.jpg", Left -> Right]

Export[final]
*)