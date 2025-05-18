<#
.synopsis
	# TODO: this is currently inaccurate. it recomputes the character map with the default values.

	requires python if the font arguments are not the default.

	uses character brightness levels, and maps character with
	index `i` to the character with index `len - i - 1`. non-
	printable characters are treated as a space.

	The default font is Consolas (normal) 288px. When using
	the default font path, size, and index, it will use a
	pre-computed brightness list.

	Uses single-byte UTF-8 characters, or extended ASCII (character codes 0-255).
.description
	NOTE: inverting a text file twice may not give the same
	file as the original, specifically if it has non-printable
	characters in the file, or multiple-byte utf-8 values.
.parameter infile
	The input file to invert the brightness of. should only contain ASCII bytes.
.parameter outfile
	The output file. Leave blank for an in-place brightness inversion.
	if $outfile == $infile, but a file "$infile.tmp" exists, it will be overwritten.
.parameter indLvl
	starting indentation level. 0 for no indentation.
	Use a higher level if needed for if this is called as a subprogram.
.parameter indTyp
	type of indentation. probably either "`t" or "    ".
	defaults to tab indentation.
.parameter logging
	specifies the logging level.
	overwrite logging is not supported. it does the same thing as basic.
	verbose logging is mostly the same as basic, except for it prints some extra stuff.
.parameter keepIntermediateFiles
	specifies whether or not intermediate files should be kept.
.parameter help
	prints help text and exit. equivalent to `get-help -full invert-pdf.ps1`.
	`invert-pdf.ps1 --help` also works, but `--help` must be the first argument.
	`invert-pdf.ps1 -?` is different, and equivalent to `get-help invert-pdf.ps1`
.parameter fontPath
	the font path given to Pillow ImageFont.truetype
.parameter fontIndex
	the subfont index for fonts that have more than one type.
.parameter fontSize
	font size in pixels.
.parameter tabLength
	the length in spaces to replace tabs with.
	it does a direct text replacement with no tab stops.
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
	# -format    - magick
	[string] $fontPath = "consola.ttf",
	[uint] $fontIndex = 0,
	[uint] $fontSize = 288,
	[uint] $tabLength = 4
)

if ($infile -eq "") { throw "input file was not provided." }

if ($help.isPresent -or $infile -eq "--help") {
	get-help -full $MyInvocation.MyCommand.Source
	exit 0
}
`
if (!(test-path -type leaf $infile)) {
	throw "input file does not exist"
}

$python   = (gcm python   -type app -ea ignore)?.name
$python ??= (gcm python3  -type app -ea ignore)?.name
$python ??= gcm python3.* -type app -ea ignore | % name | sort -descending | select -index 0
$python ??= (gcm py       -type app -ea ignore)?.name
# the error for python not being found happens later because it isn't needed if it is cached.

$indent     = $indTyp * $indLvl
${indent+1} = $indent + $indTyp

# these also work if the path is already rooted.
$infile  = [IO.Path]::Combine((pwd), $infile)
$outfile = [IO.Path]::Combine((pwd), $outfile)

# this next operation is required so PowerShell and Python both use the same encoding
$oldEncoding = [Console]::OutputEncoding
[Console]::OutputEncoding = [Text.Encoding]::UTF8

# TODO: make this use numpy, but correctly. I did it before, but it broke everything.
$charmapScript = @'
from PIL import Image, ImageDraw, ImageFont

font = ImageFont.truetype("__FONT_PATH__", __FONT_SIZE__, __FONT_INDEX__)

# non-printable characters
blank_chars     = {i for i in range(128) if \
    len(repr(chr(i))) > 3 and i != 92 or i == 32}
printable_chars = {chr(i) for i in range(128) if i not in blank_chars}
printable_chars_len = len(printable_chars)

def get_char_size(char: str):
    left, top, right, bottom = font.getbbox(char)
    width, height = right-left, bottom-top

    return width + 2, height + 2

canvas_size = tuple(max(x) for x in zip(*(get_char_size(char) for char in printable_chars)))
char_index  = 1

def brightness_map(char: str) -> float:
    "calculate the brightness percent of a given character in a given font."

    global char_index

    if ord(char) in blank_chars:
        return 0.0

    if __VERBOSE__:
        print(f"__INDENT__computing brightness of '{char}' - {char_index}/{printable_chars_len}", flush=True)

        char_index += 1

    img = Image.new("L", canvas_size, color=0)
    ImageDraw.Draw(img).text((1, 1), char, font=font, fill=255)

    pixels = img.load()

    filled_pixels = sum(pixels[x, y] for x in range(img.width) \
        for y in range(img.height) if pixels[x, y] > 0)

    return char, filled_pixels / (255 * img.width * img.height)

brightnesses = sorted([(chr(i), 0.0) for i in blank_chars] +
    [brightness(char) for char in printable_chars],
    key=lambda x: x[1]
)

charmap = " " + "".join(b[0] for b in brightnesses[len(blank_chars):])

print(charmap, flush=True)
'@

${charmap - consola.ttf[0] 100}   = ' `.''-:,_"^~;!><=*/\+?rc|L)(vT7iszJl}{xtY[F]nu1fCI3jo25eaykSVhEPZwK4UX69dbqpmAHG#ROD%8WBMN$0Qg&@'
${charmap - consola.ttf[0] 1000}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJl}t{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1250}  = ' `.''-:,_"^~;><!=*\/+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX96bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1375}  = ' `.''-:,_"^~;><!=*\/+r?|cL)(Tv7iszJl}t{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1438}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]nufC1I3jo25eaySkVhEPZwK4UX96bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1469}  = ' `.''-:,_"^~;><!=*\/+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1485}  = ' `.''-:,_"^~;><!=*\/+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1489}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJl}t{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'

${charmap - consola.ttf[0] 1493}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 1500}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 2000}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 3000}  = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'
${charmap - consola.ttf[0] 10000} = ' `.''-:,_"^~;><!=*/\+r?|cL)(Tv7iszJlt}{xY[F]unfC1I3jo25eaySkVhEPZwK4UX69bdqpmAHG#ROD%8WBM$N0Qg&@'

if ("$fontPath[$fontIndex]" -eq "consola.ttf[0]" -and $fontSize -ge 1493) {
	# avoid recomputing it since the character map is known
	# the character map converges after about 1493px. (I've only checked up to 10,000px)

	if ($logging -ne "none") { write-host "${indent}using pre-computed character map for font ``consola[0]`` (${fontSize}px) (step 1/2)" }
	$charmap = iex "`${charmap - consola.ttf[0] 1493}"
	# TODO: figure out why this ^^^^ is using `iex` and not just using the variable directly.
}
elseif ("$fontPath[$fontIndex]" -eq "consola.ttf[0]" -and $fontSize -in 100, 1000, 1250, 1375, 1438, 1469, 1485, 1489) {
	if ($logging -ne "none") { write-host "${indent}using pre-computed character map for font ``consola[0]`` (${fontSize}px) (step 1/2)" }
	$charmap = iex "`${charmap - consola.ttf[0] $fontSize}"
}
else {
	# the character map isn't known, so it must be recomputed.

	if ($python -eq $null) {
		throw "Required program (Python 3) ``python / python3 / py / python3.*`` was not found."
	}

	if ($logging -ne "none") { write-host "${indent}computing character map for font ``$fontPath[$fontIndex]`` (${fontSize}px) (step 1/2)" }

	$charmapScript = $charmapScript        `
		-creplace "__VERBOSE__", "$($logging -eq "verbose")" `
		-creplace "__FONT_PATH__", $fontPath `
		-creplace "__FONT_SIZE__", $fontSize  `
		-creplace "__FONT_INDEX__", $fontIndex `
		-creplace "__INDENT__", $(${indent+1} -creplace "`t", "\t")

	if ($logging -eq "verbose") {
		& $python -X utf8 -c $charmapScript | tee -var charmap

		# get rid of the `calculating ... for index ...` messages.
		$charmap = $charmap[-1]
	}
	else {
		$charmap = & $python -X utf8 -c $charmapScript
	}
}

if ($logging -ne "none") { write-host "${indent}inverting file using character map (step 2/2)" }
if ($infile -eq $outfile) {
	$oldinfile = $infile
	$infile = "$infile.tmp"
	move-item -force $oldinfile $infile
}

try {
	# in/out file stream
	$ifs = [IO.File]::OpenRead($infile)
	$ofs = [IO.File]::OpenWrite($outfile)

	$index = 1
	$total = $ifs.length
	while ($true) {
		$byte = $ifs.readbyte()

		if ($byte -eq -1) {
			$ifs.close()
			$ofs.close()
			break
		}

		$i = $charmap.indexOf([char] $byte)
		if ($i -eq -1) { $i = 0 } # $charmap.indexOf(" ").

		if ($byte -eq 9) { # \t
			# TODO: a direct "\t" for "    " replacement isn't accurate.
			#      it should really be doing tab stops.
			$newbyte = [byte] $charmap[-1]

			for ($i = 0; $i -lt $tabLength; $i++) {
				$ofs.writebyte($newbyte)
			}
		}
		else {
			$newbyte = $byte -in @(10, 13) ?
				[byte] $byte : # \n and \r
				[byte] $charmap[$charmap.length - $i - 1]

			if ($logging -eq "verbose") { write-host "${indent+1}inverting byte $index/$total value from $byte to $newbyte" }
		}

		$ofs.writebyte($newbyte)
		$index++
	}
}
catch {
	$ifs.close()
	$ofs.close()

	write-host "${indent}errors occured in file reading/writing."
}

if (!$keepIntermediateFiles -and $oldinfile -ne $null) {
	remove-item -force $infile 2> $null # the .tmp one.
}

[Console]::OutputEncoding = $oldEncoding
exit 0

<#
${invert-txt.ps1} = "$env:Appdata/Sublime Text/Packages/Matlab/invertlib/invert-txt.ps1"
for ([int] $i = 1; $i -lt 1000; $i++) {
    if (!(test-path -type leaf ./consola-$i.txt)) {
        & ${invert-txt.ps1} ./tmp.txt ./consola-$i.txt -verb $true -fontSize $i
    }
}
#>
