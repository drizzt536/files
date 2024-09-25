# move to `%AppData%/Sublime Text/Packages/Matlab/invert-svg.ps1` or equivalent.

<#
.synopsis
	inverts the colors of an SVG image.
	requires ImageMagick if the SVG has embedded images (PNG, JPG, etc.)

	to supress messages, either use `-silent` or `invert-svg.ps1 [ARGS] 6> $null`

	assumes the SVG is valid.
	assumes that width=..., etc. always uses double quotes.
	assumes properties use `fill=...` instead of `fill = ...`, etc.
#>
param (
	[Alias("inputfile")] [string] $infile = "",
	[string] $outfile = $infile,

	# the background color before inversion is applied.
	[Alias("bgcolor")] [string] $defaultBGColor = "white",
	[Alias("indentation", "indentLevel")] [string] $messageIndentation = "",

	# basically, `$messageIndentation` is expected to be $indentType*$n
	# for some non-negative integer $n.
	[string] $indentType = "`t",

	[Alias("quiet")] [switch] $silent,
	[Alias("bsilent", "boolquiet", "bquiet")] [bool] $boolSilent = $false,
	[switch] $reallyVerbose,
	[Alias("breallyVerbose", "boolVerbose", "bVerbose")]
		[bool] $boolReallyVerbose = $false
)

if ($infile -eq "") {
	throw "input file was not provided"
}


# all 147 named colors. maps name to inverted color.
$namedColorMap = @{
	"aliceblue"            = "#0f0700"
	"antiquewhite"         = "#051428"
	"aqua"                 = "#ff0000"
	"aquamarine"           = "#80002b"
	"azure"                = "#0f0000"
	"beige"                = "#0a0a23"
	"bisque"               = "#001b3b"
	"black"                = "#ffffff"
	"blanchedalmond"       = "#001432"
	"blue"                 = "#ffff00"
	"blueviolet"           = "#75d41d"
	"brown"                = "#5ad5d5"
	"burlywood"            = "#214778"
	"cadetblue"            = "#a0615f"
	"chartreuse"           = "#8000ff"
	"chocolate"            = "#2d96e1"
	"coral"                = "#0080af"
	"cornflowerblue"       = "#9b6a12"
	"cornsilk"             = "#000723"
	"crimson"              = "#23ebc3"
	"cyan"                 = "#ff0000"
	"darkblue"             = "#ffff74"
	"darkcyan"             = "#ff7474"
	"darkgoldenrod"        = "#4779f4"
	"darkgray"             = "#565656"
	"darkgreen"            = "#ff9bff"
	"darkgrey"             = "#565656"
	"darkkhaki"            = "#424894"
	"darkmagenta"          = "#74ff74"
	"darkolivegreen"       = "#aa94d0"
	"darkorange"           = "#0073ff"
	"darkorchid"           = "#66cd33"
	"darkred"              = "#74ffff"
	"darksalmon"           = "#166985"
	"darkseagreen"         = "#704370"
	"darkslateblue"        = "#b7c274"
	"darkslategray"        = "#d0b0b0"
	"darkslategrey"        = "#d0b0b0"
	"darkturquoise"        = "#ff312e"
	"darkviolet"           = "#6bff2c"
	"deeppink"             = "#00eb6c"
	"deepskyblue"          = "#ff4000"
	"dimgray"              = "#969696"
	"dimgrey"              = "#969696"
	"dodgerblue"           = "#e16f00"
	"firebrick"            = "#4ddddd"
	"floralwhite"          = "#00050f"
	"forestgreen"          = "#dd74dd"
	"fuchsia"              = "#00ff00"
	"gainsboro"            = "#232323"
	"ghostwhite"           = "#070700"
	"gold"                 = "#0028ff"
	"goldenrod"            = "#255adf"
	"gray"                 = "#7f7f7f"
	"grey"                 = "#7f7f7f"
	"green"                = "#ff7fff"
	"greenyellow"          = "#5200d0"
	"honeydew"             = "#0f000f"
	"hotpink"              = "#00964b"
	"indianred"            = "#32a3a3"
	"indigo"               = "#b4ff7d"
	"ivory"                = "#00000f"
	"khaki"                = "#0f1973"
	"lavender"             = "#191905"
	"lavenderblush"        = "#000f0a"
	"lawngreen"            = "#8303ff"
	"lemonchiffon"         = "#000532"
	"lightblue"            = "#522719"
	"lightcoral"           = "#0f7f7f"
	"lightcyan"            = "#1f0000"
	"lightgoldenrodyellow" = "#05052d"
	"lightgray"            = "#2c2c2c"
	"lightgreen"           = "#6f116f"
	"lightgrey"            = "#2c2c2c"
	"lightpink"            = "#00493e"
	"lightsalmon"          = "#005f85"
	"lightseagreen"        = "#df4d55"
	"lightskyblue"         = "#783105"
	"lightslategray"       = "#887766"
	"lightslategrey"       = "#887766"
	"lightsteelblue"       = "#4f3b21"
	"lightyellow"          = "#00001f"
	"lime"                 = "#ff00ff"
	"limegreen"            = "#cd32cd"
	"linen"                = "#050f19"
	"magenta"              = "#00ff00"
	"maroon"               = "#7fffff"
	"mediumaquamarine"     = "#993255"
	"mediumblue"           = "#ffff32"
	"mediumorchid"         = "#45aa2c"
	"mediumpurple"         = "#6c8f24"
	"mediumseagreen"       = "#c34c8e"
	"mediumslateblue"      = "#849711"
	"mediumspringgreen"    = "#ff0565"
	"mediumturquoise"      = "#b72e33"
	"mediumvioletred"      = "#38ea7a"
	"midnightblue"         = "#e6e68f"
	"mintcream"            = "#0a0005"
	"mistyrose"            = "#001b1e"
	"moccasin"             = "#001b4a"
	"navajowhite"          = "#002152"
	"navy"                 = "#ffff7f"
	"oldlace"              = "#020a19"
	"olive"                = "#7f7fff"
	"olivedrab"            = "#9471dc"
	"orange"               = "#005aff"
	"orangered"            = "#00baff"
	"orchid"               = "#258f29"
	"palegoldenrod"        = "#111755"
	"palegreen"            = "#670467"
	"paleturquoise"        = "#501111"
	"palevioletred"        = "#248f6c"
	"papayawhip"           = "#00102a"
	"peachpuff"            = "#002546"
	"peru"                 = "#327ac0"
	"pink"                 = "#003f34"
	"plum"                 = "#225f22"
	"powderblue"           = "#4f1f19"
	"purple"               = "#7fff7f"
	"red"                  = "#00ffff"
	"rosybrown"            = "#437070"
	"royalblue"            = "#be961e"
	"saddlebrown"          = "#74baec"
	"salmon"               = "#057f8d"
	"sandybrown"           = "#0b5b9f"
	"seagreen"             = "#d174a8"
	"seashell"             = "#d174a8"
	"sienna"               = "#5fadd2"
	"silver"               = "#3f3f3f"
	"skyblue"              = "#783114"
	"slateblue"            = "#95a532"
	"slategray"            = "#8f7f6f"
	"slategrey"            = "#8f7f6f"
	"snow"                 = "#000505"
	"springgreen"          = "#ff0080"
	"steelblue"            = "#b97d4b"
	"tan"                  = "#2d4b73"
	"teal"                 = "#ff7f7f"
	"thistle"              = "#274027"
	"tomato"               = "#009cb8"
	"turquoise"            = "#bf1f2f"
	"violet"               = "#117d11"
	"wheat"                = "#0a214c"
	"white"                = "#000000"
	"whitesmoke"           = "#0a0a0a"
	"yellow"               = "#0000ff"
	"yellowgreen"          = "#6532cd"
}

<#
.synopsis
	invert an individual color.
	valid forms:
		hex code without hash (RGB, RGBA, RRGGBB, RRGGBBAA)
		hex code (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
		rgb(r, g, b)
		rgb(r%, g%, b%)
		rgba(r, g, b, a)
		rgba(r%, g%, b%, a)
		hsl(h, s%, l%)
		hsla(h, s%, l%, a)
		any valid named color

	the alpha value can always be either a number or percent.
#>
function invert-color([Parameter(Mandatory=$true)] [string] $color) {
	# TODO: figure out what to do if the rgb values are outside of [0, 256)
	# TODO: separate this into different functions
		# invert-hex
		# invert-named
		# invert-rgb/invert-rgba
		# invert-hsl/invert-hsla
	if ($color -eq "none") {
		return "none"
	}

	if ($color.length -in @(3, 4, 6, 8) -and $color -match "^[\da-f]+$") {
		$color = "#$color"
	}

	if ($color.startsWith("#")) {
		if ($color.length -eq 4) {
			# #RGB -> #RRGGBB
			$color = "#" + `
				$color[1] + $color[1] + `
				$color[2] + $color[2] + `
				$color[3] + $color[3]
		}

		if ($color.length -eq 5) {
			# #RGBA -> #RRGGBBAA
			$color = "#" + `
				$color[1] + $color[1] + `
				$color[2] + $color[2] + `
				$color[3] + $color[3] + `
				$color[4] + $color[4]
		}

		if ($color.length -notin @(7, 9)) {
			throw "invalid hash RGB color ``$color``. must be either #RRGGBB or #RRGGBBAA"
		}

		[byte] $r = "0x" + $color.substring(1, 2)
		[byte] $g = "0x" + $color.substring(3, 2)
		[byte] $b = "0x" + $color.substring(5, 2)

		$outstr = "#" +`
			("{0:x2}" -f (255 - $r)) +`
			("{0:x2}" -f (255 - $g)) +`
			("{0:x2}" -f (255 - $b))

		if ($color.length -eq 7) {
			return $outstr
		}

		[byte] $a = "0x" + $color.substring(7, 2)

		return $outstr + ("{0:x2}" -f $a)
	}

	#### start setup ####

	$match = [regex]::match($color,
		"^(rgb|hsl)\("       +
		"\s*([^\s,\)]+)\s*," +
		"\s*([^\s,\)]+)\s*," +
		"\s*([^\s,\)]+)\s*"  +
		"\)$",
		[Text.RegularExpressions.RegexOptions]::IgnoreCase
	)

	if ($match.success) {
		# rgb or hsl
		$type, $a, $b, $c = $match.groups | select -skip 1 | % value
	}
	else {
		$match = [regex]::match($color,
			"^(rgba|hsla)\("     +
			"\s*([^\s,\)]+)\s*," +
			"\s*([^\s,\)]+)\s*," +
			"\s*([^\s,\)]+)\s*," +
			"\s*([^\s,\)]+)\s*"  +
			"\)$",
			[Text.RegularExpressions.RegexOptions]::IgnoreCase
		)

		if ($match.success) {
			# rgba or hsla
			$type, $a, $b, $c, $d = $match.groups | select -skip 1 | % value
		}
	}

	if ($match.success) {
		# either they all have percents or none of them do.
		$percents = $a.endsWith("%")

		if ($percents) {
			$a = $a.substring(0, $a.length - 1)
			$b = $b.substring(0, $b.length - 1)
			$c = $c.substring(0, $c.length - 1)

			# $d never needs to be changed since the alpha
			# value doesn't change in a color inversion.
		}

		$a = [double] $a
		$b = [double] $b
		$c = [double] $c
	}
	else { $type = "named or invalid" }

	#### end setup ####

	$ret = switch ($type) {
		# for rgb and rgba, either they are all percentages or none of them are.
		# this does not include the alpha value, which can actually be different

		# for hsl and hsla, it is always f(no percent, percent, percent)
		# the alpha can again be whatever.
		"rgb" {
			$percents ?
				"rgb($(100 - $a)%,$(100 - $b)%,$(100 - $c)%)" :
				"rgb($(255 - $a),$( 255 - $b),$( 255 - $c))"
		}
		"rgba" {
			$percents ?
				"rgba($(100 - $a)%,$(100 - $b)%,$(100 - $c)%,$d)" :
				"rgba($(255 - $a),$( 255 - $b),$( 255 - $c),$d)"
		}
		"hsl"  { "hsl($( ($a % 360 + 180) % 360), $b%, $(100 - $c)%)"    }
		"hsla" { "hsla($(($a % 360 + 180) % 360), $b%, $(100 - $c)%,$d)" }
		"named or invalid" {
			$ret = $namedColorMap[$color]

			if ($ret -eq $null) { throw "invalid color ``$color``" }

			$ret
		}
	}

	return $ret
}

<#
.synopsis
	invert the colors of a whole SVG.
	assumes a moderate level of simplicity (no events, gradiants, etc.).
	basically the input should be something that a PNG can render.
	assumes the SVG is valid.
	assumes that width=..., etc. always uses double quotes.
	assumes properties use `fill=...` instead of `fill = ...`, etc.
.description
	process:

	1. set the background color
		1a. find the dimensions of the whole SVG.
		1b. look for `rect` elements where the shape matches one of these:
			- svg width, svg height
			- 100%, 100%
			- svg width, 100%
			- 100%, svg height
		1c. add one to the start of the SVG if there isn't one.
	2. invert the colors on every `stroke` attribute.
	3. invert the colors on every `fill` attribute.
	4. invert the colors on embedded images.
	5. write the new contents to the outfile.
		- or write to stdout if the outfile is "-".
		- default outfile is the infile (in-place inversion).
#>
function invert-svg(
	[Parameter(Mandatory=$true)] [Alias("inputfile", "filepath")]
		[string] $infile,
	[Alias("ofile", "outputfile")] [string] $outfile = $infile,
	[Alias("defaultBGColor")] [string] $bgcolor = "white",
	[Alias("indentation")] [string] $indent = "",
	[string] $indentType = "`t",
	[Alias("quiet")] [bool] $silent = $true,
	[bool] $verb = $false # verbose. gets overridden by silent
) {
	# TODO: don't load the entire file content into memory at once, if possible
	if (-not (test-path -type leaf $infile)) {
		throw "invalid path. either not a file or does not exist"
	}
	${indent+1} = $indent + $indentType

	if ($silent) { $verb = $false }

	# required if there are embedded images.
	[IO.Directory]::SetCurrentDirectory((pwd))

	$content = (cat $infile) -join ""

	$svgSttIndex = $content.indexOf("<svg")
	$svgEndIndex = $content.indexOf(">", $svgSttIndex + 4)
	$svg = $content.substring($svgSttIndex, $svgEndIndex - $svgSttIndex + 1)

	# full SVG dimensions.
	$width  = [regex]::match($svg,  "width=`"(\d+)`"").groups[1].value
	$height = [regex]::match($svg, "height=`"(\d+)`"").groups[1].value

	if ($verb) { write-host "${indent}SVG dimensions (w,h): $width x $height" }

	if ($width -eq $null -or $width -eq "") {
		throw  "width is not specified or is in the wrong format"
	}
	if ($height -eq $null -or $height -eq "") {
		throw "height is not specified or is in the wrong format"
	}

	if ($verb) { write-host "${indent}looking for background rectangle" }

	# find the background rectangle
	<#
	technically, this can find a "background" rectangle midway through
	the SVG, in which case, you would be covering up everything that
	was previously drawn, which is stupid, and there might as well be
	nothing before the background rectangle, unless they have events
	or something more advanced like that.
	#>
	$bgFound = $false
	$end = $svgEndIndex
	$counter = 0
	while ($true) {
		$stt = $content.indexOf("<rect", $end)

		if ($stt -eq -1) { break }
		$counter++
		$end = $content.indexOf(">", $stt + 5)
		if ($verb) { write-host "${indent+1}found background candidate $counter at $stt-$end." }

		$rect = $content.substring($stt, $end - $stt + 1)

		$rectWidth  = [regex]::match($rect, "width=`"(?:100(?:\.0+)?%|$width)`"")
		$rectHeight = [regex]::match($rect, "height=`"(?:100(?:\.0+)?%|$height)`"")

		if ($rectWidth.success -and $rectHeight.success) {
			if ($verb) { write-host "${indent+1}found background. no insertion required." }
			$bgFound = $true
			break
		}
	}

	if ($verb -and -not $bgFound) {
		write-host "${indent+1}background not found. inserting one."
	}

	if (-not $bgFound) {
		$content = $content.insert($svgEndIndex + 1,
			"<rect width=`"$width`" height=`"$height`" fill=`"$bgcolor`"/>"
		)
	}

	if (-not $silent) {
		write-host "${indent}inverting stroke colors" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}
	$counter = 0
	$end = 0
	while ($true) {
		$stt = $content.indexOf("stroke=", $end)

		if ($stt -lt 0) { break }
		$counter++
		$stt += 7

		$end = $content.indexOf('"', $stt + 1)

		if ($verb) { write-host "${indent+1}found stroke $counter at $stt-$end" }

		$color = invert-color $( $content.substring($stt + 1, $end - $stt - 1) )

		$content = $content.substring(0, $stt + 1) + $color + $content.substring($end)
	}

	if (-not $silent) {
		if ($verb) {
			if ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "   - found $counter" }
		write-host "${indent}inverting fill colors" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}

	$counter = 0
	$end = 0
	while ($true) {
		$stt = $content.indexOf("fill=", $end)

		if ($stt -eq -1) { break }
		$counter++
		$stt += 5

		$end = $content.indexOf('"', $stt + 1)

		if ($verb) { write-host "${indent+1}found fill $counter at $stt-$end" }

		$color = invert-color $( $content.substring($stt + 1, $end - $stt - 1) )

		$content = $content.substring(0, $stt + 1) + $color + $content.substring($end)
	}

	if (-not $silent) {
		if ($verb) {
			if ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "     - found $counter" }
		write-host "${indent}inverting embedded images" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}

	$counter = 0
	$end = 0
	while ($true) {
		# I looked into vectorizing the embedded raster image, but I couldn't
		# find a single tool that does it well, even for a simple graph PNG.
		# maybe the PNG I had was just too low quality, but idk.

		$stt = $content.indexOf("<image", $end)

		if ($stt -eq -1) { break }
		$counter++

		if (-not (get-command magick -type app -ErrorAct silent)) {
			throw "Required program ImageMagick ``magick`` was not found. embedded images are left un-inverted."
		}

		$end = $content.indexOf(">", $stt + 6)

		if ($verb) { write-host "${indent+1}found embedded image $("{0:d4}" -f $counter) at $stt-$end" }

		$image = $content.substring($stt, $end - $stt + 1)

		$match = [regex]::match($image,
			"xlink:href=`"data:image/(png|jpe?g|webp);base64,([\da-zA-Z+/=]+)(`")"
		)

		$imageType = $match.groups[1].value
		$image = [Convert]::FromBase64String($match.groups[2].value)
		[IO.File]::WriteAllBytes("./tmp.png", $image)
		magick tmp.png -negate tmp.png
		$image = [IO.File]::ReadAllBytes("./tmp.png")
		$image = [Convert]::ToBase64String($image)
		rm tmp.png 2> $null

		# 23 == "xlink:href=`"data:image/".length - 1
		$content = $content.substring(0, $stt + $match.index + 23) + `
			$match.groups[1].value + ";base64," + $image + `
			$content.substring($stt + $match.groups[3].index)

		# somehow, inverting the colors of a PNG can make the base64
		# version of it signifcantly shorter, so if you use $end
		# then it could completely miss the next <image/> element
		$end = $stt + 5
	}

	if (-not $silent) {
		if ($verb) {
			if ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "   - found $counter" }
	}
	if ($outfile -eq "-") { echo $content }
	else { $content > $outfile }
}


invert-svg                          `
	-infile     $infile             `
	-outfile    $outfile            `
	-indentType $indentType         `
	-bgcolor    $defaultBGColor     `
	-indent     $messageIndentation `
	-verb       $($reallyVerbose.isPresent -or $boolReallyVerbose) `
	-silent     $($silent.isPresent -or $boolSilent)

exit 0
