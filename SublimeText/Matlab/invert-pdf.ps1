# move to `%AppData%/Sublime Text/Packages/Matlab/invert-pdf.ps1` or equivalent.

<#
.synopsis
	requirements, and where I have them from:
		- pwsh       - PowerShell 7
		- ./invert-svg.ps1
		- pdfinfo    - part of MiKTeX install (or Poppler)
		- pdfunite   - part of MiKTeX install (or Poppler)
		- pdftocairo - part of MiKTeX install (or Poppler)
		- qpdf       - choco install qpdf
		- magick     - choco install imagemagick
						required for invert-svg.ps1 if the SVGs have embedded images.
		- cairosvg   - pip install cairosvg,
						also install gtk3 runtime, or gtk2 for 32-bit.
		- grep       - MinGW devkit
		- awk        - MinGW devkit
#>

param (
	# infile includes extension. relative path. e.g. `./asdf.pdf`
	[Parameter(Mandatory=$true)] [string] $infile,
	[string] $outfile = $infile,
	[string] [Alias("SVGInvertFileLocation", "SVGTool")]
		$invertSVGFileLocation = "./invert-svg.ps1",
	[switch] $silent,
	[switch] $verbose_
)

${invert-svg.ps1} = $invertSVGFileLocation

if (-not (get-command ${invert-svg.ps1} -type externalScript -ErrorAct silent)) {
	throw "Required program ImageMagick ``invert-svg.ps1`` was not found."
}
if (-not (get-command pdfinfo -type app -ErrorAct silent)) {
	throw "Required program Poppler ``pdfinfo`` was not found."
}
if (-not (get-command pdfunite -type app -ErrorAct silent)) {
	throw "Required program Poppler ``pdfunite`` was not found."
}
if (-not (get-command pdftocairo -type app -ErrorAct silent)) {
	throw "Required program Poppler ``pdftocairo`` was not found."
}
if (-not (get-command qpdf -type app -ErrorAct silent)) {
	throw "Required program ``qpdf`` was not found."
}
if (-not (get-command pdftocairo -type app -ErrorAct silent)) {
	throw "Required program Poppler ``pdftocairo`` was not found."
}
if (-not (get-command cairosvg -type app -ErrorAct silent)) {
	# assume that GTK2/3 is installed and properly setup for CairoSVG.
	throw "Required program Poppler ``pdftocairo`` was not found."
}
if (-not (get-command grep -type app -ErrorAct silent)) {
	throw "Required program ``grep`` was not found."
}
if (-not (get-command awk -type app -ErrorAct silent)) {
	throw "Required program ``awk`` was not found."
}

$verbose_ = $verbose_.isPresent -or -not $silent.isPresent

$redirect = $verbose_ ? '' : ' *> $null'

$pages = pdfinfo $outfile 2> $null | grep -F Pages | awk '{print $2}'

if ($verbose_) { echo "converting PDF pages to SVG" }
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { echo "    page $i" }
	iex "pdftocairo -svg -f $i -l $i `"$outfile`" page-$i.svg$redirect"
}

if ($verbose_) { echo "inverting SVG colors" }
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { echo "    page $i" }
	iex "${invert-svg.ps1} page-$i.svg -bgcolor white$redirect"
}

move $outfile text.pdf

if ($verbose_) { echo "converting SVG pages to PDF" }
for ($i = 1; $i -le $pages; $i++) {
	if ($verbose_) { echo "    page $i" }
	iex "cairosvg page-$i.svg -o page-$i.pdf$redirect"
}

if ($verbose_) { echo "combining PDF pages" }
iex "pdfunite $(ls page-*.pdf | % name) `"$outfile`"$redirect"

if ($verbose_) { echo "adding text layer back into PDF" }
iex "qpdf --empty --pages `"$outfile`" -- --underlay text.pdf -- tmp.pdf$redirect"
move tmp.pdf $outfile -force

if ($verbose_) { echo "cleaning" }
rm page-*.svg, page-*.pdf, text.pdf

if ($verbose_) { echo "done" }

exit 0
