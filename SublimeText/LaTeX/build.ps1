# move to `%AppData%/Sublime Text/Packages/LaTeX/build.ps1` or equivalent.
# NOTE: if it says it can't remove the intermediate files, restart sublime.

[CmdletBinding()]
param (
	[Alias("infile")] [string] $texfile, # file basename.
	[string] $pdfViewer = $isWindows ? "SumatraPDF.exe" : "evince",
	[switch] $buildOnly,
	[switch] $alwaysBuild,
	[switch] $shellEscape,
	[switch] $optimize,
	[switch] $keepIntermediateFiles
)

$shell = $shellEscape.isPresent

# use the directory name if no file was given.
$texfile ??= get-location | split-path -leaf

$pdfViewBaseName = [IO.Path]::GetFileNameWithoutExtension($pdfViewer)

# use the common parameter `-verbose`.
$verbose_ = $PSCmdlet.MyInvocation.BoundParameters["Verbose"].isPresent ?? $false
$pdfOpened = $false

function open-pdf {
	if ($buildOnly.isPresent -or $pdfOpened) {
		if ($verbose_) { write-host "build.ps1: Skipping opening PDF." }
		return
	}

	if ($pdfViewBaseName -eq "SumatraPDF" -and (get-process | where name -eq SumatraPDF).count) {
		# pass
	}
	elseif ($verbose_) { write-host "build.ps1: Opening PDF: ``$pdfViewer ./$texfile.pdf``" }

	# Assumes SumatraPDF `ReuseInstance` option is set to `true`
	# although, technically it shouldn't matter either way.
	start-process $pdfViewer -args ./$texfile.pdf

	$pdfOpened = $true
}

function cleanup {
	if (-not $keepIntermediateFiles.isPresent) {
		if ($verbose_) {
			write-host "build.ps1: Removing intermediate files"
			latexmk -c
		}
		else { latexmk -c > $null }
	}
	elseif ($verbose_) {
		write-host "build.ps1: Keeping intermediate files"
	}
}


# setup
if (test-path -type leaf ./$texfile.pdf) {
	# assumes you don't have `$texfile.pdf` as a folder name.

	# if the pdf is newer than the source, no compilation is needed (probably)
	if (-not $alwaysBuild.isPresent -and (ls ./$texfile.pdf | % lastWriteTime) -gt (ls ./$texfile.tex | % lastWriteTime)) {
		if ($verbose_) { write-host "build.ps1: No edits have been made since last compilation. Exiting." }

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

cleanup

# compiling
$pdflatex = "pdflatex -c-style-errors -interaction=nonstopmode -halt-on-error"

if ($verbose_) {
	if ($shell) {
		latexmk -pdf -pdflatex="$pdflatex" -shell-escape ./$texfile.tex
	}
	else {
		latexmk -pdf -pdflatex="$pdflatex"               ./$texfile.tex
	}
}
else {
	if ($shell) {
		latexmk -pdf -silent -f -shell-escape ./$texfile.tex *> $null
	}
	else {
		latexmk -pdf -silent -f               ./$texfile.tex *> $null
	}
}

$latexmkExitCode = $lastExitCode

if ($latexmkExitCode -eq 0 -and $optimize.isPresent) {
	# don't complain if either of them don't exist.
	# I'm in a silent error type of mood.
	$gs   = (gcm gs       -type app -ea ignore)?.name
	$gs ??= (gcm gswin64c -type app -ea ignore)?.name
	$gs ??= (gcm gswin32c -type app -ea ignore)?.name

	if ($gs -ne $null) {
		# NOTE: this doesn't actually optimize anything,
		#       but it frequently makes it smaller anyway.
		if ($verbose_) { write-host "build.ps1: normalizing PDF with ghostscript" }
		& $gs -dBATCH -dNOPAUSE -dQUIET -sDEVICE=pdfwrite -dDetectDuplicateImages `
			"-dCompatibilityLevel=1.7" -dConvertCMYKImagesToRGB `
			"-sOutputFile=$texfile.tmp.pdf" ./$texfile.pdf

		rm ./$texfile.pdf
	}
	else {
		mv ./$texfile.pdf ./$texfile.tmp.pdf
	}

	if (gcm qpdf -type app -ea ignore) {
		if ($verbose_) { write-host "build.ps1: optimizing PDF with qpdf" }
		qpdf ./$texfile.tmp.pdf --force-version=1.7 --coalesce-contents `
			--remove-unreferenced-resources=yes --object-streams=generate `
			--compress-streams=y --stream-data=compress --recompress-flate `
			--compression-level=9 ./$texfile.pdf

		rm ./$texfile.tmp.pdf
	}
	else {
		mv ./$texfile.tmp.pdf ./$texfile.pdf
	}
}

cleanup

if ($verbose_) { write-host "`n" }

# if it was Sumatra, the PDF is already open, unless the pdf didn't exist before now.
open-pdf
if ($verbose_) { write-host "build.ps1: latexmk exit code $latexmkExitCode" }
exit $latexmkExitCode
