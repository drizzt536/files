<#
.synopsis
	requirements, and where I have them from:
		- invert-svg
		- pdftocairo - choco install miktex.
						MiKTeX has Poppler as a dependency.
						I don't know the real way to get pdftocairo.
		- cairosvg   - pip install cairosvg,
						also install gtk3 runtime, or gtk2 for 32-bit.
		- magick     - choco install imagemagick
						required for invert-svg.ps1 if the SVGs have embedded images.
		- pdftk      - choco install pdftk

	150 DPI is the default DPI for pdftocairo, and is also the default here.
#>
param (
	[string] $infile,
	[string] $outfile = $infile,

	[uint32] $indLvl = 0,
	[string] $indTyp = "`t",
	[bool] $quiet = $false,
	[bool] $verb = $false,
	[bool] $keepIntermediateFiles = $false,
	[switch] $help,

	[Alias("SVGTool")] [string] ${invert-svg.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	# -PDFTool is for DOC and DOCX
	[uint32] $dpi = 150
	# -bgcolor is for SVG
	# -format is only for invert-magick.ps1
)

if ($infile -eq "") { throw "input file was not provided." }

if ($help.isPresent -or $infile -eq "--help") {
	& $MyInvocation.MyCommand.Source -?
	exit 0
}

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

if ($quiet) { $verb = $false }

$indent = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2

pdftk $infile dump_data output pdfdata.tmp.txt *> $null
[uint32] $pages = (cat pdfdata.tmp.txt | sls NumberOfPages) -split " " | select -last 1

if (-not $quiet) { write-host "${indent}converting PDF pages to SVG with $dpi dpi (step 1/6)" }
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if (-not $quiet) { write-host "${indent+1}page $i/$pages" }
	pdftocairo -svg -r $dpi -f $i -l $i $infile page-$i.tmp.svg *> $null
}
$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds

if (-not $quiet) {
	write-host "${indent+1}Finished in $([math]::round($elapsedTime, 1))s"
	write-host "${indent}inverting SVG colors (step 2/6)"
}
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if (-not $quiet) { write-host "${indent+1}page $i/$pages" }

	& ${invert-svg.ps1}          `
		-infile  page-$i.tmp.svg `
		-outfile page-$i.tmp.svg `
		-indLvl  $($indlvl+2)    `
		-indTyp  $indTyp         `
		-quiet   $quiet          `
		-verb    $verb           `
		-bgcolor "white"         `
		-keepInt $keepIntermediateFiles
}

$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds
if (-not $quiet) {
	write-host "${indent+1}Finished in $([math]::round($elapsedTime, 1))s"
}

if ($infile -eq $outfile) {
	move $infile text.tmp.pdf
}
else {
	# keep the old file, but get a hardlink to the same file data.
	new-item text.tmp.pdf -target $infile -type hardlink > $null
}

if (-not $quiet) { write-host "${indent}converting SVG pages to PDF (step 3/6)" }
$startTime = [DateTime]::Now
for ($i = 1; $i -le $pages; $i++) {
	if (-not $quiet) { write-host "${indent+1}page $i/$pages" }
	cairosvg page-$i.tmp.svg -o page-$i.tmp.pdf *> $null
}

$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds
if (-not $quiet) {
	write-host "${indent+1}Finished in $([math]::round($elapsedTime, 1))s"
	write-host "${indent}combining PDF pages. step 4/6"
}
pdftk page-*.tmp.pdf cat output $outfile *> $null

if (-not $quiet) { write-host "${indent}restoring PDF text layer (step 5/6)" }
pdftk $outfile multibackground text.tmp.pdf output out.tmp.pdf *> $null

if (-not $quiet) { write-host "${indent}restoring PDF bookmarks (step 6/6)" }
pdftk out.tmp.pdf update_info pdfdata.tmp.txt output $outfile *> $null

if (-not $keepIntermediateFiles) {
	if (-not $quiet) { write-host "${indent}cleaning temporary files" }

	rm	page-*.tmp.svg, `
		page-*.tmp.pdf, `
		text.tmp.pdf,   `
		out.tmp.pdf,    `
		pdfdata.tmp.txt
}

if (-not $quiet) { write-host "${indent}done" }

exit 0
