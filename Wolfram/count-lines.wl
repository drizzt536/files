includedExtensions = {
    (* files with other extensions get ignored *)
    "8xp",
    "bat",
    "c",
    "cmd",
    "emacs",
    "gv",
    "h",
    "hs",
    "htm",
    "html",
    "java",
    "js",
    "nasm",
    "ps1",
    "py",
    "rs",
    "sublime-syntax",
    "tex",
    "ts",
    "wl"
}

(*
    count the number of lines in subdirectories with extensions
    that match the `includedExtensions` list.
*)
CountLines[
    path_String,
    verbose_?BooleanQ,
    subdirTimes_Integer
] /; subdirTimes >= 0 := Module[{ originalDirectory = Directory[], lines },
    SetDirectory[path];
    verbose && WriteLine["stdout", StringRepeat["    ", subdirTimes] <> path <> "/"];
    lines = Total[
        If [ DirectoryQ@ #,
            CountLines[#, verbose, 1 + subdirTimes],
            If [MemberQ[includedExtensions, FileExtension@ #],
                verbose && WriteLine[
                    "stdout",
                    StringRepeat["    ", 1 + subdirTimes] <> #
                ];
                Length@ ReadList[#, String],
                0
            ]
        ] & /@ FileNames[]
    ];
    SetDirectory[originalDirectory];
    lines
]
CountLines[path_String, verbose_?BooleanQ] := CountLines[path, verbose, 0]
CountLines[path_String] := CountLines[path, True]
CountLines[] := CountLines@ Directory[]
