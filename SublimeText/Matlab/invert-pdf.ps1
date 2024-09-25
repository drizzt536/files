# move to `%AppData%/Sublime Text/Packages/Matlab/invert-pdf.ps1` or equivalent.

<#
.synopsis
	requirements, and where I have them from:
		- pwsh       - PowerShell 7
		- ./invert-svg.ps1
		- pdftocairo - part of MiKTeX install (Poppler)
		- cairosvg   - pip install cairosvg,
						also install gtk3 runtime, or gtk2 for 32-bit.
		- magick     - choco install imagemagick
						required for invert-svg.ps1 if the SVGs have embedded images.
		- pdftk      - choco install pdftk
#>

param (
	# infile includes extension. relative path. e.g. `./asdf.pdf`
	[Alias("inputfile")] [string] $infile = "",

	# use ./invert-svg.ps1 relative to this file, and not the working directory.
	[string] $outfile = $infile,
	[Alias("SVGInvertFileLocation", "SVGTool")] [string] $invertSVGFileLocation =
		"$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	[uint32] $dpi = 150, # the default DPI for pdftocairo
	[switch] $keepIntermediateFiles,
	[Alias("quiet")] [switch] $silent,
	[Alias("bsilent", "boolquiet", "bquiet")] [bool] $boolSilent,
	[switch] $reallyVerbose, # passed to invert-svg.ps1
	[Alias("breallyVerbose", "boolVerbose", "bVerbose")]
		[bool] $boolReallyVerbose = $false
)

if ($infile -eq "") {
	throw "input file was not provided."
}

${invert-svg.ps1} = $invertSVGFileLocation

$verbose_ = -not $silent.isPresent -or $boolSilent
$reallyVerbose = $reallyVerbose.isPresent -or $boolReallyVerbose

if (-not (gcm pdftocairo -type app -ErrorAct silent)) {
	throw "Required program (Poppler) ``pdftocairo`` was not found."
}
if (-not (gcm ${invert-svg.ps1} -type externalScript -ErrorAct silent)) {
	throw "Required program ``invert-svg.ps1`` was not found.`nlooking at ``${invert-svg.ps1}``."
}
if (-not (gcm cairosvg -type app -ErrorAct silent)) {
	# assume that GTK2/3 is installed and properly setup for CairoSVG.
	throw "Required program ``cairosvg`` was not found."
}
if (-not (gcm pdftk -type app -ErrorAct silent)) {
	throw "Required program ``pdftk`` was not found."
}

pdftk $infile dump_data output pdfdata.tmp.txt
[uint32] $pages = (cat pdfdata.tmp.txt | sls NumberOfPages) -split " " | select -last 1

if ($verbose_) { write-host "converting PDF pages to SVG with $dpi dpi" }
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { write-host "`tpage $i/$pages" }
	pdftocairo -svg -r $dpi -f $i -l $i $infile page-$i.tmp.svg *> $null
}
$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds

if ($verbose_) {
	write-host "`tFinished in $([math]::round($elapsedTime , 1))s"
	write-host "inverting SVG colors"
}
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { write-host "`tpage $i/$pages" }
	& ${invert-svg.ps1}  `
		page-$i.tmp.svg  `
		-bgcolor white   `
		-indentType "`t" `
		-indlvl "`t`t"   `
		-bquiet $(-not $verbose_) `
		-bVerb $reallyVerbose
}

$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds
if ($verbose_) {
	write-host "`tFinished in $([math]::round($elapsedTime , 1))s"
}

if ($infile -eq $outfile) {
	move $infile text.tmp.pdf
}
else {
	# keep the old file, but get a hardlink to the same file data.
	new-item text.tmp.pdf -target $infile -type hardlink > $null
}

if ($verbose_) { write-host "converting SVG pages to PDF" }
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { write-host "`tpage $i/$pages" }
	cairosvg page-$i.tmp.svg -o page-$i.tmp.pdf *> $null
}

$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds
if ($verbose_) {
	write-host "`tFinished in $([math]::round($elapsedTime , 1))s"
	write-host "combining PDF pages"
}
pdftk page-*.tmp.pdf cat output $outfile *> $null

if ($verbose_) { write-host "restoring PDF text layer" }
pdftk $outfile multibackground text.tmp.pdf output out.tmp.pdf *> $null

if ($verbose_) { write-host "restoring PDF bookmarks" }
pdftk out.tmp.pdf update_info pdfdata.tmp.txt output $outfile *> $null

if (-not $keepIntermediateFiles) {
	if ($verbose_) { write-host "cleaning temporary files" }

	rm	page-*.tmp.svg, `
		page-*.tmp.pdf, `
		text.tmp.pdf,   `
		out.tmp.pdf,    `
		pdfdata.tmp.txt
}

if ($verbose_) { write-host "done" }

exit 0
