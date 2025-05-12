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
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $keepIntermediateFiles = $false,
	[switch] $help,

	[Alias("SVGTool")] [string] ${invert-svg.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	[Alias("PDFTool")] [string] ${invert-pdf.ps1} = "$($MyInvocation.MyCommand.Source)/../invert-pdf.ps1",
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

$inExt  = [IO.Path]::GetExtension($infile ).substring(1).toUpper()
$outExt = [IO.Path]::GetExtension($outfile).substring(1).toUpper()

if ($inExt -notin "doc", "docx") {
	throw "input file extension (``$inExt``) must be be either ``doc`` or ``docx``"
}

if ($outExt -notin "doc", "docx") {
	throw "input file extension (``$outExt``) must be be either ``doc`` or ``docx``"
}

# root the paths. also works if they are already rooted.
$infile  = [IO.Path]::Combine((pwd).path, $infile)
$outfile = [IO.Path]::Combine((pwd).path, $outfile)

if ($logging -ne "none") { write-host "${indent}opening Microsoft Word" }
try { $word = new-object -ComObject Word.Application }
catch { throw "Required program Microsoft Word ``Word.Application`` (ComObject) was not found." }

# this havse to use a full path, or Word will try
# to put it in the OneDrive directory.
$pdf = [IO.Path]::ChangeExtension($infile, ".tmp.pdf")

if ($logging -ne "none") { write-host "${indent}converting $inExt to PDF" }
$document = $word.documents.open(
	$infile,         # file path
	$false,          # dont prompt to confirm conversions
	[type]::missing,
	$false           # dont add to recent file list
)
$document.SaveAs(
	$pdf,            # file path
	17,              # file format code for pdf
	[type]::missing,
	[type]::missing,
	$false,          # dont add to recent files
	[type]::missing,
	$false           # dont recommend read-only
)

# free up the pdf for other processes.
# For some reason, Word locks the file without doing this.
$document.close()

if ($logging -ne "none") { write-host "${indent}inverting PDF colors" }

& ${invert-pdf.ps1} `
	-infile  $pdf   `
	-outfile $pdf   `
	-dpi     $dpi   `
	-indLvl  $($indLvl+2) `
	-indTyp  $indTyp      `
	-logging $logging     `
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
	$false, # dont prompt for file conversion
	$false, # dont open as read-only
	$false  # dont add to recent files
)

$document.SaveAs(
	$outfile,                   # file path
	$outExt -eq "DOC" ? 0 : 24, # file format. DOC or DOCX
	[type]::missing,
	[type]::missing,
	$false,                     # dont add to recent files
	[type]::missing,
	$false                      # dont recommend read-only
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
