<#
.synopsis
	requirements, and where I have them from:
		- gs/gswin64c/gswin32c (GhostScript) - choco install Ghostscript
		- pdftocairo (Poppler) - choco install miktex.
						MiKTeX has Poppler as a dependency.
						I don't know the real way to get pdftocairo.
		- invert-svg.ps1
		- magick     - choco install imagemagick
						required for invert-svg.ps1 if the SVGs have embedded images.
		- cairosvg   - pip install cairosvg,
						also install gtk3 runtime, or gtk2 for 32-bit.

	process:
		1. convert EPS to PDF
		2. convert PDF to SVG
		3. invert SVG colors
		4. convert SVG back to EPS.

	I'm sure there is a way to invert the colors on an EPS file directly,
	but I don't know how to do it, and this way works just fine.

	150 DPI is the default DPI for pdftocairo, and is also the default here.
#>
param (
	[string] $infile,
	[string] $outfile = $infile,

	[uint32] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $keepIntermediateFiles = $false,
	[switch] $help,

	[Alias("SVGTool")] [string] ${invert-svg.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	# -PDFTool   - DOC/DOCX, and PPT/PPTX
	[uint32] $dpi = 150
	# -bgcolor   - SVG
	# -format    - magick
	# -fontPath  - TXT
	# -fontIndex - TXT
	# -fontSize  - TXT
	# -tabLength - TXT
)

if ($infile -eq "") { throw "input file was not provided." }

if ($help.isPresent -or $infile -eq "--help") {
	& $MyInvocation.MyCommand.Source -?
	exit 0
}

$indent     = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2


$gs   = (gcm gs       -type app -errorAct silent)?.name
$gs ??= (gcm gswin64c -type app -errorAct silent)?.name
$gs ??= (gcm gswin32c -type app -errorAct silent)?.name

if ($gs -eq $null) {
	throw "Required program GhostScript ``gs / gswin64c / gswin32c`` was not found."
}
if (!(gcm pdftocairo -type app -ErrorAct silent)) {
	throw "Required program (Poppler) ``pdftocairo`` was not found."
}
if (!(gcm ${invert-svg.ps1} -type externalScript -ErrorAct silent)) {
	throw "Required program ``invert-svg.ps1`` was not found.`nlooking at ``${invert-svg.ps1}``."
}
if (!(gcm cairosvg -type app -ErrorAct silent)) {
	# assume that GTK2/3 is installed and properly setup for CairoSVG.
	throw "Required program ``cairosvg`` was not found."
}

if ($logging -ne "none") { write-host "${indent}inverting colors of $infile" }
$sttTime = [DateTime]::Now

$pdf = [IO.Path]::ChangeExtension($infile, "tmp.pdf")
$svg = [IO.Path]::ChangeExtension($infile, "tmp.svg")

if ($logging -ne "none") { write-host "${indent+1}converting EPS to PDF" }
& $gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dEPSCrop "-sOutputFile=$pdf" $infile *> $null

if ($logging -ne "none") { write-host "${indent+1}converting PDF to SVG" }
pdftocairo -svg -f 1 -l 1 -r $dpi $pdf $svg *> $null

if ($logging -ne "none") { write-host "${indent+1}inverting SVG colors" }

& ${invert-svg.ps1}
	-infile  $svg     `
	-outfile $svg     `
	-bgcolor "#000"   `
	-logging $logging `
	-indTyp  $indTyp  `
	-indlvl  $($indlvl+2) `
	-keepInt $keepIntermediateFiles

if ($logging -ne "none") { write-host "${indent+1}converting SVG to EPS" }
cairosvg $svg -o $outfile *> $null

if (!$keepIntermediateFiles) {
	if ($logging -ne "none") { write-host "${indent+1}cleaning intermediate files"}
	rm $pdf, $svg
}

$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
if ($logging -ne "none") { write-host "${indent+1}Finished in ${elapsedTime}s" }
