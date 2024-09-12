# move to `%AppData%/Sublime Text/Packages/LaTeX/build.ps1` or equivalent.

<#
requirements:
	- PowerShell
	- MatLab
	- pdftocairo.exe (part of MiKTeX install)
	- magick (ImageMagick)
	- grep (MinGW devkit)
	- awk (MinGW devkit)
#>

param (
	# infile includes extension. relative path.
	[Parameter(Mandatory=$true)] [string] $inputfile,
	[ValidateSet("html", "doc", "latex", "ppt", "xml", "pdf")]
		[string] $format = "pdf",
	[switch] $open,
	[switch] $keepLightMode
)


$basename = [IO.Path]::GetFileNameWithoutExtension($inputfile)

$outext = $format -eq 'latex' ? 'tex' : $format

$outfile = "./$basename.$outext"

echo "building `"./$inputfile`""
matlab -batch "publish('./$inputfile', 'format', '$format', 'outputDir', './')"

if (-not $keepLightMode) {
	if ($format -eq "pdf") {
		echo "inverting pdf colors"
		pdftocairo -png "$basename.pdf" "tmp-$basename"

		magick "tmp-$basename-*.png" -negate $outfile # overwrite output file

		rm "tmp-$basename-*.png" # remove intermediate files
	}
	else {
		echo "formats other than pdf can't be made dark mode."
		# or at least I don't care enough to implement it/figure out how.
	}
}


if ($open.isPresent) {
	echo "opening `"./$outfile`""
	start "./$outfile"
}
