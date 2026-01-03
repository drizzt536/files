<#
.synopsis
	Inverts the colors on an EPS image.

	requirements:
		- invert-svg.ps1	used to invert SVG colors
		- ghostscript		(gs/gswin64c/gswin32c). used for EPS to PDF conversion and
		- qpdf				optionally used for optimization at PDF stages if `-optimize $true` is given.
							if qpdf isn't found, this step is skipped.
		- pdftocairo		used for PDF to SVG conversion
		- magick			required for invert-svg.ps1 if the SVGs have embedded raster images.
		- inkscape			one of two options for converting SVG to PDF
							the other option is CairoSVG
		- cairosvg			also install gtk3 runtime, or gtk2 for 32-bit. can be used in place of inkscape.
.description
	process:
		1. convert EPS to PDF
		2. convert PDF to SVG
		3. invert SVG colors
		4. convert SVG back to EPS
.parameter infile
	The input file to invert the colors of. should be a valid EPS file.
.parameter outfile
	The output file. Leave blank for an in-place inversion.
.parameter indLvl
	starting indentation level. 0 for no indentation.
	Use a higher level if needed for if this is called as a subprogram.
.parameter indTyp
	type of indentation. probably either "`t" or "    ".
	defaults to tab indentation.
.parameter logging
	specifies the logging type and verbosity of the program.
	must be one of: none, basic, overwrite, verbose

	passes the same logging level to invert-svg.ps1

	verbose prints extra information.
	everything else prints the exact same in all logging levels (excluding the invert-svg.ps1 stuff)
.parameter keepIntermediateFiles
	if true, intermediate files will be kept, which amounts to:
	 - infileBasename.tmp.pdf
	 - infileBasename.tmp.svg
	 - tmp-%d.ext (PNG/JPG/WEBP) files for SVG embedded raster images.
.parameter optimize
	perform extra optimization.
	passes `-optimize $true` to `invert-svg.ps1`.
.parameter help
	prints help text and exit. equivalent to `get-help -full invert-pdf.ps1`.
	`invert-pdf.ps1 --help` also works, but `--help` must be the first argument.
	`invert-pdf.ps1 -?` is different, and equivalent to `get-help invert-pdf.ps1`
.parameter dpi
	specify the DPI used in `pdftocairo` for the PDF to SVG conversion.
	I don't think it does anything.
#>
[CmdletBinding()]
param (
	[Parameter(Mandatory=$true)] [string] $infile,
	[Alias("o")] [string] $outfile = $infile,

	[uint32] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $keepIntermediateFiles = $false,
	[bool] $optimize = $false,
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
	get-help -full $MyInvocation.MyCommand.Source
	exit 0
}

if (-not (test-path -type leaf $infile)) {
	throw "input file '$infile' does not exist"
}

$indent     = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2

$logging = $logging.toLower()


$gs   = (gcm gs       -type app -ea ignore)?.name
$gs ??= (gcm gswin64c -type app -ea ignore)?.name
$gs ??= (gcm gswin32c -type app -ea ignore)?.name

if ($gs -eq $null) {
	throw "Required program ``gs / gswin64c / gswin32c`` (GhostScript) was not found."
}
if (!(gcm pdftocairo -type app -ea ignore)) {
	throw "Required program ``pdftocairo`` (Poppler) was not found."
}
if (!(gcm ${invert-svg.ps1} -type externalScript -ea ignore)) {
	throw "Required program ``invert-svg.ps1`` was not found.`nlooking at ``${invert-svg.ps1}``."
}
if (!(gcm inkscape -type app -ea ignore) -and !(gcm cairosvg -type app -ea ignore)) {
	# assume that GTK2/3 is installed and properly setup for CairoSVG if it is the one used.
	throw "One of ``inkscape`` or ``cairosvg`` is required and neither was found."
}
if ($optimize -and !(gcm qpdf -type app -ea ignore)) {
	throw "``-optimize`` was given a value of True, and ``qpdf`` was not found."
}

if ($logging -cne "none") { write-host "${indent}inverting colors of $infile" }
$sttTime = [DateTime]::Now

$pdf  = [IO.Path]::ChangeExtension($infile, "tmp.pdf")
$pdf2 = $optimize ? [IO.Path]::ChangeExtension($infile, "tmp2.pdf") : $pdf
$svg  = [IO.Path]::ChangeExtension($infile, "tmp.svg")

if ($logging -cne "none") { write-host "${indent+1}converting EPS to PDF" }
& $gs -dNOPAUSE -dBATCH -dQUIET -sDEVICE=pdfwrite -dEPSCrop `
	"-dCompatibilityLevel=1.7" "-sOutputFile=$pdf2" $infile *> $null

if ($optimize) {
	if ($logging -cne "none") { write-host "${indent+1}optimizing PDF" }

	qpdf $pdf2 --force-version=1.7 --coalesce-contents `
		--remove-unreferenced-resources=yes --object-streams=generate `
		--compress-streams=y --stream-data=compress --recompress-flate `
		--compression-level=9 $pdf
}

if ($logging -cne "none") { write-host "${indent+1}converting PDF to SVG" }
pdftocairo -svg -f 1 -l 1 -r $dpi $pdf $svg *> $null

if ($logging -cne "none") { write-host "${indent+1}inverting SVG colors" }

& ${invert-svg.ps1}
	-infile   $svg         `
	-outfile  $svg         `
	-bgcolor  "#fff"       `
	-logging  $logging     `
	-indTyp   $indTyp      `
	-indlvl   $($indlvl+2) `
	-optimize $optimize    `
	-keepInt  $keepIntermediateFiles

if ($logging -cne "none") { write-host "${indent+1}converting SVG to EPS" }
if (gcm inkscape -type app -ea ignore) {
	inkscape $svg --export-type eps -o $outfile *> $null
}
else {
	# assume that GTK2/3 is installed and properly set up.
	cairosvg $svg -o $outfile *> $null
}

if (!$keepIntermediateFiles) {
	if ($logging -cne "none") { write-host "${indent+1}cleaning intermediate files"}
	rm $pdf, $svg
}

$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
if ($logging -cne "none") { write-host "${indent+1}Finished in ${elapsedTime}s" }
