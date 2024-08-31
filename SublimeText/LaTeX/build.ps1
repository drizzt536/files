# move to `%AppData%/Sublime Text/Packages/LaTeX/build.ps1` or equivalent.

[CmdletBinding()]
param (
	[Alias("infile")] [string] $texfile, # file basename.
	[string] $compiler,
	[switch] $buildOnly,
	[switch] $keepIntermediateFiles
)

# use the common parameter `-verbose`.
$verbose_ = $PSCmdlet.MyInvocation.BoundParameters["Verbose"].isPresent ?? $false

# use the directory name if no file was given
$texfile  ??= get-location | split-path -leaf
$compiler ??= "pdflatex"

if ((ls ./$texfile.pdf | % lastWriteTime) -gt `
	(ls ./$texfile.tex | % lastWriteTime)) {
	# if the pdf is newer than the source, no compilation is needed
	echo "No edits have been made since last compilation."

	if ($buildOnly.isPresent) { echo "skipping opening PDF." }
	else {
		try {
			iex "./$texfile.pdf"
			echo "opening PDF."
		}
		catch {}
	}

	exit 0
}

get-process | where name -eq Acrobat | stop-process

rm "./$texfile.pdf" 2> $null

iex "$compiler $($verbose_ ? '' : '-quiet') ./$texfile.tex"
iex "$compiler $($verbose_ ? '' : '-quiet') ./$texfile.tex" # again so references work

if ($buildOnly.isPresent) { echo "skipping opening PDF." }
else {
	try {
		iex "./$texfile.pdf"
		echo "opening PDF."
	}
	catch {}
}

# remove the extra files created
# `rm nonexistent, existent` errors but still removes the existing file.
if (-not $keepIntermediateFiles.isPresent) {
	rm @(
		"./$texfile.synctex.gz",
		"./$texfile.log",
		"./$texfile.aux",
		"./$texfile.toc",
		"./$texfile.out",
		"./texput.log"
	) 2> $null
}
elseif ($verbose_) {
	echo "keeping intermediate files"
}
