<#
.synopsis
	requirements, and where I have them from:
		- Microsoft Word
			- requires (new-object -ComObject Word.Application);

	works for both DOC and DOCX files.
	can also do DOC -> inverted DOCX and DOCX -> inverted DOC.

	input and output formats are determined by the file extensions.

	process:
		1. convert DOC/DOCX (input format) to PDF
		2. invert PDF colors
		3. convert PDF to DOC/DOCX (output format)
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

	[Alias("SVGTool")] [string] ${invert-pdf.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-pdf.ps1",
	[Alias("PDFTool")] [string] ${invert-pdf.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-pdf.ps1",
	[uint32] $dpi = 150 # passed to invert-pdf.ps1
	# -bgcolor is for SVG
	# -format is only for invert-magick.ps1
)

if ($infile -eq "") { throw "input file was not provided." }

if ($help.isPresent -or $infile -eq "--help") {
	& $MyInvocation.MyCommand.Source -?
	exit 0
}

$inExt  = [IO.Path]::GetExtension($infile ).substring(1).toUpper()
$outExt = [IO.Path]::GetExtension($outfile).substring(1).toUpper()

if ($inExt -notin "doc", "docx") {
	throw "input file extension (``$inExt``) must be be either ``doc`` or ``docx``"
}

if ($outExt -notin "doc", "docx") {
	throw "input file extension (``$outExt``) must be be either ``doc`` or ``docx``"
}

if (-not [IO.Path]::IsPathRooted($infile)) {
	$infile = [IO.Path]::Join((pwd).path, $infile)
}
if (-not [IO.Path]::IsPathRooted($outfile)) {
	$outfile = [IO.Path]::Join((pwd).path, $outfile)
}

if (-not $quiet) { write-host "${indent}opening Microsoft Word" }
try { $word = new-object -ComObject Word.Application }
catch { throw "Required program Microsoft Word ``Word.Application`` (ComObject) was not found." }

# this havse to use a full path, or Word will try
# to put it in the OneDrive directory.
$pdf = [IO.Path]::ChangeExtension($infile, ".tmp.pdf")

if (-not $silent) { write-host "${indent}converting $inExt to PDF" }
$document = $word.documents.open(
	$infile,         # file path
	$false,          # don't prompt to confirm conversions
	[type]::missing,
	$false           # don't add to recent file list
)
$document.SaveAs(
	$pdf,            # file path
	17,              # file format code for pdf
	[type]::missing,
	[type]::missing,
	$false,          # don't add to recent files
	[type]::missing,
	$false           # don't recommend read-only
)

# free up the pdf for other processes.
# For some reason, Word locks the file without doing this.
$document.close()

if (-not $silent) { write-host "${indent}inverting PDF colors" }

& ${invert-pdf.ps1} `
	-infile  $pdf   `
	-outfile $pdf   `
	-dpi     $dpi   `
	-indLvl  $($indLvl+2) `
	-indTyp  $indTyp      `
	-quiet   $quiet       `
	-verb    $verb        `
	-quiet   $(-not $verbose_) `
	-svgTool ${invert-svg.ps1} `
	-keep    $keepIntermediateFiles

# for some reason, if you have never converted from PDF
# within Word before, the program will just hang. It is
# waiting for you to check a box, but the box is only
# there when $word.visible is $true, which it won't be.
# or maybe I am just stupid, idk.

write-host "${indent}converting PDF to $outExt"
$document = $word.documents.open(
	$pdf,   # input file
	$false, # don't prompt for file conversion
	$false, # don't open as read-only
	$false  # don't add to recent files
)

$document.SaveAs(
	$outfile,                   # file path
	$outExt -eq "DOC" ? 0 : 24, # file format. DOC or DOCX
	[type]::missing,
	[type]::missing,
	$false,                     # don't add to recent files
	[type]::missing,
	$false                      # don't recommend read-only
)

$document.close()
$word.quit()

if (-not $keepIntermediateFiles) {
	rm $pdf
	if ($infile -ne $outfile) {
		rm $infile
	}
}

exit 0
