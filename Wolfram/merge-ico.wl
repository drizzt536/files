DotExtension[extension_String] :=
    If [StringPart[extension, 1] != ".", ".", ""] <> ToLowerCase[extension]

HasExtension[filename_String, extension_String] :=
    "." <> ToLowerCase@ FileExtension@ filename == DotExtension[extension]

WithExtension[filename_String, extension_String] :=
    (*
        examples:
            - "file"     ~WithExtension~ "png" -> "file.png"
            - "file."    ~WithExtension~ "png" -> "file.png"
            - "file.jpg" ~WithExtension~ "png" -> "file.png"
    *)
    If [ filename ~HasExtension~ extension,
        filename,
        FileBaseName@ filename <> DotExtension@ extension
    ];

WithExtension[extension_String][filename_String] :=
    filename ~WithExtension~ extension;

MergeICOFiles[filenames : {__String}, outfile_String] := Export[
    outfile ~WithExtension~ "ico",
    Flatten[
        Import[# ~WithExtension~ "ico"] & /@ filenames,
        1
    ],
    "ico"
]

(*
FileConvertInMemory[source_String, format_String] :=
    FileConvertInMemory[Import@ source, format]

FileConvertInMemory[source_Image, format_String] :=
    source ~ExportString~ format ~ImportString~ format

PNGToICO[filename_String] :=
    FileConvertInMemory[# ~WithExtension~ "png", "ico"]

PNGToICO[filenames : {__String}] :=
    PNGToICO /@ filenames

PNGToICO[filename_String, outfile_String] :=
    FileConvert[filename, outfile ~WithExtension~ "ico"]

PNGToICO[filenames : {__String}, outfile_String] := Export[
    outfile ~WithExtension~ "ico",
    PNGToICO /@ filenames,
    "ico"
]
*)
