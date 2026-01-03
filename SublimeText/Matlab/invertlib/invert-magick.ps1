<#
.synopsis
	Inverts the colors of image for some formats that ImageMagick supports.
.description
	Some of the formats I haven't tried, or I don't know what extension(s)
	they use, and others like MP4 and MKV technically work but they will
	introduce tearing or will output a blank white image, so I don't allow
	them. If you really want it anyway, or the functionality changes, you
	can call to magick yourself.

	use the `--help` argument to get valid and known invalid formats.

	The formats are determined to be valid or invalid based on version:
	ImageMagick 7.1.1-38 Q16-HDRI x64 b0ab922:20240901
#>
[CmdletBinding()]
param (
	[Parameter(Mandatory=$true)] [string] $infile,
	[string] $outfile = $infile,

	[uint32] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $keepIntermediateFiles = $false,
	# -optimize  - EPS, PDF, SVG
	[switch] $help,

	# -SVGTool   - DOC/DOCX, EPS, PDF, and PPT/PPTX
	# -PDFTool   - DOC/DOCX, and PPT/PPTX
	# -dpi       - DOC/DOCX, EPS, PDF, and PPT/PPTX
	# -bgcolor   - SVG
	[string] $format
	# -fontPath  - TXT
	# -fontIndex - TXT
	# -fontSize  - TXT
	# -tabLength - TXT
)

if ($infile -eq "") { throw "input file was not provided." }

$logging = $logging.toLower()

<#
formats that ImageMagick supports for reading and writing,
limited to ones that it is actually good for.

to add more formats later, use `magick identify -list format`

the object maps format to file extension.
#>
$validFormats = @{
	"AVIF"   = @(".avif")
	"BMP"    = @(".bmp")
	"BMP2"   = @(".bmp", ".bmp2")
	"BMP3"   = @(".bmp", ".bmp3")
	"GIF"    = @(".gif")
	"J2C"    = @(".j2c")
	"J2K"    = @(".j2k")
	"JP2"    = @(".jp2")
	"JPC"    = @(".jpc")
	"JPE"    = @(".jpe")
	"JPEG"   = @(".jpg", ".jpeg")
	"JPG"    = @(".jpg", ".jpeg")
	"JPM"    = @(".jpm")
	"JPS"    = @(".jps")
	"MAT"    = @(".mat")
	"PAM"    = @(".pam")
	"PBM"    = @(".pbm")
	"PPM"    = @(".ppm")
	"PGM"    = @(".pgm")
	"PNG"    = @(".png")
	"PNG8"   = @(".png", ".png8")
	"PNG24"  = @(".png", ".png24")
	"PNG32"  = @(".png", ".png32")
	"PNG48"  = @(".png", ".png48")
	"PNG64"  = @(".png", ".png64")
	"PNM"    = @(".pnm")
	"TIFF"   = @(".tif", ".tiff")
	"TIFF64" = @(".tif", ".tiff")
	"WEBP"   = @(".webp") # only handled well if it is one frame.
}

# not an exhaustive list.
$invalidFormats = @{
	"AI"    = "doesn't negate properly"
	"AVI"   = "can't write + video stream/multiple frames"
	"CR2"   = "can't write"
	"CR3"   = "can't write"
	"DNG"   = "can't write"
	"EMF"   = "can't write"
	"EPS"   = "doesn't negate properly"
	"EPS2"  = "can't read"
	"EPS3"  = "can't read"
	"FLV"   = "slow + doesn't negate well; video stream/multiple frames"
	"GIF87" = "doesn't negate well"
	"HEIC"  = "can't write"
	"HEIF"  = "can't write"
	"ICO"   = "doesn't negate properly"
	"ICON"  = "doesn't negate properly"
	"M2V"   = "slow + doesn't negate well; video stream/multiple frames"
	"M4V"   = "slow + doesn't negate well; video stream/multiple frames"
	"MKV"   = "slow + doesn't negate well; video stream/multiple frames"
	"MOV"   = "slow + doesn't negate well; video stream/multiple frames"
	"MP4"   = "slow + doesn't negate well; video stream/multiple frames"
	"MPEG"  = "slow + doesn't negate well; video stream/multiple frames"
	"MPG"   = "slow + doesn't negate well; video stream/multiple frames"
	"MRO"   = "can't write"
	"PS2"   = "can't read"
	"PS3"   = "can't read"
	"SVG"   = "doesn't negate well; rasterizes the image and embeds as PNG"
	"WMF"   = "can't write"
	"XCF"   = "can't write"
}

if ($help.isPresent -or $infile -eq "--help") {
	& $MyInvocation.MyCommand.Source -?

	echo "Valid Formats:"
	$validFormats | format-table
	echo "Invalid Formats (not an exhaustive list):"
	$invalidFormats | format-table
	exit 0
}

# valid extensions
$allExtensions = -split [string[]] $validFormats.values `
	| sort -uniq                                        `
	| % { $_.substring(1) }

# root the paths. also works if they are already rooted.
$infile  = [IO.Path]::Combine((pwd).path, $infile)
$outfile = [IO.Path]::Combine((pwd).path, $outfile)

$format = magick identify $infile

$containsMultipleImages = $format.count -gt 1
# if the format is known as invalid, e.g. MP4, MKV, then give a
# more descriptive message than just "invalid format because video"

$format = $format.substring($infile.length + 1) -replace " .+", ""

$inExt  = [IO.Path]::GetExtension($infile)
$outExt = [IO.Path]::GetExtension($outfile)

if ($format -in $invalidFormats.keys) {
	# As a general rule of thumb, if Magick identifies more than one
	# frame in the image, then it will introduce image tearing.
	throw "input file is of invalid file format ``$format``. reason: ``$($invalidFormats.$format)``"
}

if ($containsMultipleImages) {
	throw "input file ``$infile`` (format ``$format``) contains more than one sub-image."
}

if ($format -notin $validFormats.keys) {
	throw "input file is of unimplemented file format ``$format``. Use ``magick $([IO.Path]::GetFileName($infile)) -negate $([IO.Path]::GetFileName($outfile))`` directly to invert."
}

if ($inExt -notin $validFormats.$format) {
	throw "input file has invalid file extension ``$inExt`` for format ``$format``, must be one of ``$($validFormats.$format -join ", ")``"
}

if ($outExt -notin $allExtensions) {
	throw "output file has invalid file extension ``$outExt``. Must be one of $($allExtensions -join ", ")"
}

# TODO: make invert-ffmpeg.ps1
	# ffmpeg -i in.ext -vf negate out.ext


$indent = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2 # unused

if (!(gcm magick -type app -ea ignore)) {
	throw "Required program ImageMagick ``magick`` was not found."
}

if ($logging -cne "none") { write-host "${indent}inverting colors on `"$infile`"" }
magick $infile         `
	-negate            `
	-compress Lossless `
	-debug $($logging -cin "none", "basic" ? "None" : "All") `
	$outfile                         `
	| % { write-host "${indent+1}$_" }
