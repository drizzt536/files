# move to `%AppData%/Sublime Text/Packages/Matlab/build.ps1` or equivalent.

<#
.synopsis
	has the same requirements as invert-pdf.ps1, but with matlab as well.
	for PDF exports, inverts the colors.
#>

param (
	# infile includes extension. relative path.
	[Parameter(Mandatory=$true)] [string] $inputfile,
	[ValidateSet("html", "doc", "latex", "ppt", "xml", "pdf")]
		[string] $format = "pdf",
	[switch] $open,
	[switch] $silent,
	[switch] $keepLightMode
)

if (-not (get-command matlab -type app -ErrorAct silent)) {
	throw "Required program ``matlab`` was not found."
}

[IO.Directory]::SetCurrentDirectory((pwd))
$basename = [IO.Path]::GetFileNameWithoutExtension($inputfile)

$outext = $format -eq 'latex' ? 'tex' : $format

$outfile = "./$basename.$outext"

$verbose_ = -not $silent.isPresent

echo "cleaning" # in case the previous build was stopped mid way through.
rm page-*.svg, page-*.pdf, text.pdf, tmp.pdf 2> $null

if ($verbose_) {
	echo "starting matlab"
	matlab -batch @"
disp('building "./$inputfile"');
ofile = publish('./$inputfile', 'format', '$format', 'outputDir', './');
fprintf('output file == "`"%s`"`"\nexiting matlab\n', ofile);
"@
}
else {
	matlab -batch "publish('./$inputfile', 'format', '$format', 'outputDir', './');"
}

if (-not $keepLightMode) {
	if ($format -eq "pdf") {
		if ($isWindows) {
			${invert-pdf.ps1} = "$env:AppData/Sublime Text/Packages/Matlab/invert-pdf.ps1"
			${invert-svg.ps1} = "$env:AppData/Sublime Text/Packages/Matlab/invert-svg.ps1"
		}
		elseif ($isLinux) {
			${invert-pdf.ps1} = "~/.config/sublime-text/Packages/Matlab/invert-pdf.ps1"
			${invert-svg.ps1} = "~/.config/sublime-text/Packages/Matlab/invert-svg.ps1"
		}
		else { # $isMacOS
			${invert-pdf.ps1} = "~/Library/Application Support/Sublime Text/Packages/Matlab/invert-pdf.ps1"
			${invert-svg.ps1} = "~/Library/Application Support/Sublime Text/Packages/Matlab/invert-svg.ps1"
		}

		iex "$(${invert-pdf.ps1} -replace ' ', '` ') `"$outfile`" -SVGTool `"${invert-svg.ps1}`" $($verbose_ ? '' : '-s')"
	}
	elseif ($verbose_) {
		echo "formats other than pdf can't be made dark mode."
		# or at least I don't care enough to implement it/figure out how.
	}
}

if ($verbose_) { echo "done" }

if ($open.isPresent) {
	if ($verbose_) { echo "opening `"$outfile`"" }
	start $outfile
}
elseif ($verbose_) {
	echo "PDF is located at `"$outfile`""
}

exit 0
