# move to `%AppData%/Sublime Text/Packages/LaTeX/build.ps1` or equivalent.
# NOTE: if it says it can't remove the intermediate files, restart sublime.

[CmdletBinding()]
param (
	[Alias("infile")] [string] $texfile, # file basename.
	[string] $pdfViewer = $isWindows ? "SumatraPDF.exe" : "evince",
	[switch] $buildOnly,
	[switch] $keepIntermediateFiles
)

# use the directory name if no file was given.
$texfile ??= get-location | split-path -leaf

$pdfViewBaseName = [IO.Path]::GetFileNameWithoutExtension($pdfViewer)

# use the common parameter `-verbose`.
$verbose_ = $PSCmdlet.MyInvocation.BoundParameters["Verbose"].isPresent ?? $false
$pdfOpened = $false

function open-pdf {
	if ($buildOnly.isPresent -or $pdfOpened) {
		if ($verbose_) { echo "Skipping opening PDF." }
		return
	}

	if ($pdfViewBaseName -eq "SumatraPDF" -and (get-process | where name -eq SumatraPDF).count) {
		# pass
	}
	elseif ($verbose_) { echo "Opening PDF: ``$pdfViewer ./$texfile.pdf``" }
	# Assumes SumatraPDF `ReuseInstance` option is set to `true`
	# although, technically it shouldn't matter either way.
	start-process $pdfViewer -argumentList ./$texfile.pdf

	$pdfOpened = $true
}


# setup
if (test-path -type leaf ./$texfile.pdf) {
	# assumes you don't have `$texfile.pdf` as a folder name.

	# if the pdf is newer than the source, no compilation is needed
	if ((ls ./$texfile.pdf | % lastWriteTime) -gt (ls ./$texfile.tex | % lastWriteTime)) {
		if ($verbose_) { echo "No edits have been made since last compilation. Exiting." }

		open-pdf
		exit 0
	}

	if ($pdfViewBaseName -eq "SumatraPDF") { open-pdf }
	else {
		# PDF Editors like Acrobat don't let you edit the file while they are using it.
		# And I don't know how to close the file without killing the whole program.
		get-process | where name -eq $pdfViewBaseName | stop-process
	}
}


# compiling
if ($verbose_) { latexmk -verbose -time -pdf ./$texfile.tex }
else           { latexmk -silent        -pdf ./$texfile.tex > $null }


# cleanup
if (-not $keepIntermediateFiles.isPresent) {
	if ($verbose_) {
		echo "Removing intermediate files"
		latexmk -c
	}
	else { latexmk -c > $null }
}
elseif ($verbose_) {
	echo "Keeping intermediate files"
}

if ($verbose_) { echo "`n" }

# if it was Sumatra, the PDF is already open, unless the pdf didn't exist before now.
open-pdf
