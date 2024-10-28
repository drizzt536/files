<#
.synopsis
	inverts the colors of an SVG image.
	requires ImageMagick if the SVG has embedded images (PNG, JPG, etc.)

	to supress messages, either use `-logging none` or
	`invert-svg.ps1 [ARGS] 6> $null`

	assumes the SVG is valid (probably, at least it doesn't check that it is).

	the bgcolor argument is the background color *before* inversion.
	It can be any valid SVG color thing. (e.g. hex, name, hsl, etc.)
#>
param (
	[string] $infile,
	[string] $outfile = $infile,

	[uint32] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $keepIntermediateFiles = $false,
	[switch] $help,

	# -SVGTool   - DOC/DOCX, EPS, PDF, and PPT/PPTX
	# -PDFTool   - DOC/DOCX, and PPT/PPTX
	# -dpi       - DOC/DOCX, EPS, PDF, and PPT/PPTX
	[string] $bgcolor = "#000"
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

# all 147 named colors. maps name to hex color.
$namedColorMap = @{
	"aliceblue"            = "#f0f8ff"
	"antiquewhite"         = "#faebd7"
	"aqua"                 = "#0ff"
	"aquamarine"           = "#7fffd4"
	"azure"                = "#f0ffff"
	"beige"                = "#f5f5dc"
	"bisque"               = "#ffe4c4"
	"black"                = "#000"
	"blanchedalmond"       = "#ffebcd"
	"blue"                 = "#00f"
	"blueviolet"           = "#8a2be2"
	"brown"                = "#a52a2a"
	"burlywood"            = "#deb887"
	"cadetblue"            = "#5f9ea0"
	"chartreuse"           = "#7fff00"
	"chocolate"            = "#d2691e"
	"coral"                = "#ff7f50"
	"cornflowerblue"       = "#6495ed"
	"cornsilk"             = "#fff8dc"
	"crimson"              = "#dc143c"
	"cyan"                 = "#0ff"
	"darkblue"             = "#00008b"
	"darkcyan"             = "#008b8b"
	"darkgoldenrod"        = "#b8860b"
	"darkgray"             = "#a9a9a9"
	"darkgreen"            = "#006400"
	"darkgrey"             = "#a9a9a9"
	"darkkhaki"            = "#bdb76b"
	"darkmagenta"          = "#8b008b"
	"darkolivegreen"       = "#556b2f"
	"darkorange"           = "#ff8c00"
	"darkorchid"           = "#9932cc"
	"darkred"              = "#8b0000"
	"darksalmon"           = "#e9967a"
	"darkseagreen"         = "#8fbc8f"
	"darkslateblue"        = "#483d8b"
	"darkslategray"        = "#2f4f4f"
	"darkslategrey"        = "#2f4f4f"
	"darkturquoise"        = "#00ced1"
	"darkviolet"           = "#9400d3"
	"deeppink"             = "#ff1493"
	"deepskyblue"          = "#00bfff"
	"dimgray"              = "#696969"
	"dimgrey"              = "#696969"
	"dodgerblue"           = "#1e90ff"
	"firebrick"            = "#b22222"
	"floralwhite"          = "#fffaf0"
	"forestgreen"          = "#228b22"
	"fuchsia"              = "#f0f"
	"gainsboro"            = "#dcdcdc"
	"ghostwhite"           = "#f8f8ff"
	"gold"                 = "#ffd700"
	"goldenrod"            = "#daa520"
	"gray"                 = "#808080"
	"grey"                 = "#808080"
	"green"                = "#008000"
	"greenyellow"          = "#adff2f"
	"honeydew"             = "#f0fff0"
	"hotpink"              = "#ff69b4"
	"indianred"            = "#cd5c5c"
	"indigo"               = "#4b0082"
	"ivory"                = "#fffff0"
	"khaki"                = "#f0e68c"
	"lavender"             = "#e6e6fa"
	"lavenderblush"        = "#fff0f5"
	"lawngreen"            = "#7cfc00"
	"lemonchiffon"         = "#fffacd"
	"lightblue"            = "#add8e6"
	"lightcoral"           = "#f08080"
	"lightcyan"            = "#e0ffff"
	"lightgoldenrodyellow" = "#fafad2"
	"lightgray"            = "#d3d3d3"
	"lightgreen"           = "#90ee90"
	"lightgrey"            = "#d3d3d3"
	"lightpink"            = "#ffb6c1"
	"lightsalmon"          = "#ffa07a"
	"lightseagreen"        = "#20b2aa"
	"lightskyblue"         = "#87cefa"
	"lightslategray"       = "#789"
	"lightslategrey"       = "#789"
	"lightsteelblue"       = "#b0c4de"
	"lightyellow"          = "#ffffe0"
	"lime"                 = "#0f0"
	"limegreen"            = "#32cd32"
	"linen"                = "#faf0e6"
	"magenta"              = "#f0f"
	"maroon"               = "#800000"
	"mediumaquamarine"     = "#66cdaa"
	"mediumblue"           = "#0000cd"
	"mediumorchid"         = "#ba55d3"
	"mediumpurple"         = "#9370db"
	"mediumseagreen"       = "#3cb371"
	"mediumslateblue"      = "#7b68ee"
	"mediumspringgreen"    = "#00fa9a"
	"mediumturquoise"      = "#48d1cc"
	"mediumvioletred"      = "#c71585"
	"midnightblue"         = "#191970"
	"mintcream"            = "#f5fffa"
	"mistyrose"            = "#ffe4e1"
	"moccasin"             = "#ffe4b5"
	"navajowhite"          = "#ffdead"
	"navy"                 = "#000080"
	"oldlace"              = "#fdf5e6"
	"olive"                = "#808000"
	"olivedrab"            = "#6b8e23"
	"orange"               = "#ffa500"
	"orangered"            = "#ff4500"
	"orchid"               = "#da70d6"
	"palegoldenrod"        = "#eee8aa"
	"palegreen"            = "#98fb98"
	"paleturquoise"        = "#afeeee"
	"palevioletred"        = "#db7093"
	"papayawhip"           = "#ffefd5"
	"peachpuff"            = "#ffdab9"
	"peru"                 = "#cd853f"
	"pink"                 = "#ffc0cb"
	"plum"                 = "#dda0dd"
	"powderblue"           = "#b0e0e6"
	"purple"               = "#800080"
	"red"                  = "#f00"
	"rosybrown"            = "#bc8f8f"
	"royalblue"            = "#4169e1"
	"saddlebrown"          = "#8b4513"
	"salmon"               = "#fa8072"
	"sandybrown"           = "#f4a460"
	"seagreen"             = "#2e8b57"
	"seashell"             = "#2e8b57"
	"sienna"               = "#a0522d"
	"silver"               = "#c0c0c0"
	"skyblue"              = "#87ceeb"
	"slateblue"            = "#6a5acd"
	"slategray"            = "#708090"
	"slategrey"            = "#708090"
	"snow"                 = "#fffafa"
	"springgreen"          = "#00ff7f"
	"steelblue"            = "#4682b4"
	"tan"                  = "#d2b48c"
	"teal"                 = "#008080"
	"thistle"              = "#d8bfd8"
	"tomato"               = "#ff6347"
	"turquoise"            = "#40e0d0"
	"violet"               = "#ee82ee"
	"wheat"                = "#f5deb3"
	"white"                = "#fff"
	"whitesmoke"           = "#f5f5f5"
	"yellow"               = "#ff0"
	"yellowgreen"          = "#9acd32"
}
$hexToNameMap = @{}
foreach ($name in $namedColorMap.keys) {
	$hex = $namedColorMap.$name

	if ($name.length -le $hex.length) {
		$hexToNameMap.$hex = $name
	}
}

<#
.synopsis
	https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
	h \in [0, 360]
	s, l \in [0, 1]
#>
function hsl-to-hex([double] $h, [double] $s, [double] $l) {
	$h /= 360

	function hue-to-rgb([double] $p, [double] $q, [double] $t) {
		if ($t -lt 0) { $t++ }
		if ($t -gt 1) { $t-- }

		if ($t -lt 1/6) { return $p + 6*$t*($q - $p) }
		if ($t -lt 1/2) { return $q }
		if ($t -lt 2/3) { return $p + 6*(2/3 - $t)*($q - $p) }

		return $p
	}

	if ($s -eq 0) {
		$r = $g = $b = $l # achromatic
	}
	else {
		$q = $l + $s*($l -lt 0.5 ? $l : 1 - $l)
		$p = 2*$l - $q

		$r = hue-to-rgb $p $q ($h + 1/3)
		$g = hue-to-rgb $p $q $h
		$b = hue-to-rgb $p $q ($h - 1/3)
	}

	$r = "{0:x2}" -f ([int] (255 * $r))
	$g = "{0:x2}" -f ([int] (255 * $g))
	$b = "{0:x2}" -f ([int] (255 * $b))

	return optimize-hex "#$r$g$b"
}

<#
.synopsis
	returns the shortest hex code for the color.

	the output will always be in hex form
	unless the named color form is shorter.
	the output will always be in hex form, even if the named color is shorter.
#>
function optimize-hex([string] $color) {
	if ($color.length - 1 -notin 3, 4, 6, 8) {
		throw "invalid hex color length"
	}

	## convert double characters to single characters where available.

	# "#RRGGBBAA" -> "#RGBA"
	if ($color -match "^#([\da-f])\1([\da-f])\2([\da-f])\3([\da-f])\4$") {
		$color = "#" + $color[1] + $color[3] + $color[5] + $color[7]
	}

	# "#RRGGBB" -> "#RGB"
	if ($color -match "^#([\da-f])\1([\da-f])\2([\da-f])\3$") {
		$color = "#" + $color[1] + $color[3] + $color[5]
	}

	# "#RrGgBbff" -> "#RrGgBb"
	if ($color -match "^#[\da-f]{6}00$") {
		# this is an approximation of the color, but since it
		# is fully transparent, it doesn't matter anyway.
		$color = "#" + $color[1] + $color[3] + $color[5] + "0"
	}

	## remove unnecessary alpha channels

	# "#RGBf" -> "#RGB"
	if ($color -match "^#[\da-f]{3}f$") {
		$color = $color.substring(0, 4)
	}

	# "#RrGgBbff" -> "#RrGgBb"
	if ($color -match "^#[\da-f]{6}ff$") {
		$color = $color.substring(0, 7)
	}

	return $color -in $hexToNameMap.keys ?
		$hexToNameMap.$color :
		$color
}

<#
.synopsis
	returns the shortest representation of the color.
	assumes the input string is a valid color.

	if there are decimals like rgb(12.5, 5.7, 8.9), then
	they are rounded to the nearest whole number, unless
	it is a .5, in which case it is rounded to the nearest
	even number. so 12.5 would round to 12 and not 13.

	the output will always be in hex form
	unless the named color form is shorter.
#>
function optimize-color([string] $color) {
	# the order of the multiplications is important,
	# operations coerce to the type of the left operand.

	# the hex form is always shorter than the rgb/rgba or hsl/hsla form

	$color = $color.trim()

	if ($color -eq "none") {
		return "none"
	}

	if ($color.length -in 3, 4, 6, 8 -and $color -match "^[\da-f]+$") {
		$color = "#$color"
	}

	## convert from function form to hex form

	if ($color -match "^rgb\(" + "\s*(\d+(?:\.\d+)?)\s*,"*3 + "{0}\)$") {
		$color = "#"                        + `
			("{0:x2}" -f [int] $matches[1]) + `
			("{0:x2}" -f [int] $matches[2]) + `
			("{0:x2}" -f [int] $matches[3])
	}
	if ($color -match "^rgb\(" + "\s*(\d+(?:\.\d+)?)%\s*,"*3 + "{0}\)$") {
		$color = "#"                                      + `
			("{0:x2}" -f [int] (255 * $matches[1] / 100)) + `
			("{0:x2}" -f [int] (255 * $matches[2] / 100)) + `
			("{0:x2}" -f [int] (255 * $matches[3] / 100))
	}
	if ($color -match "^rgba\(" + "\s*(\d+(?:\.\d+)?)\s*,"*4 + "{0}%?\)$") {
		if ($color -match "%\s*)$") {
			# change percent to a regular integer the
			# alpha channel can always be a percent,
			# even if the other channels are not.
			$matches[4] = 255 * $matches[4] / 100
		}

		$color = "#"                        + `
			("{0:x2}" -f [int] $matches[1]) + `
			("{0:x2}" -f [int] $matches[2]) + `
			("{0:x2}" -f [int] $matches[3]) + `
			("{0:x2}" -f [int] $matches[4])
	}
	if ($color -match "^rgba\(" + "\s*(\d+(?:\.\d+)?)%\s*,"*4 + "{0}%?\)$") {
		if ($color -match "%\s*)$") {
			# see the comment for the rgba section
			$matches[4] = 255 * $matches[4]
		}

		$color = "#"                                      + `
			("{0:x2}" -f [int] (255 * $matches[1] / 100)) + `
			("{0:x2}" -f [int] (255 * $matches[2] / 100)) + `
			("{0:x2}" -f [int] (255 * $matches[3] / 100)) + `
			("{0:x2}" -f [int] $matches[4])
	}
	if ($color -match "^hsl\("    +
		"\s*(\d+(?:\.\d+)?)\s*,"  +
		"\s*(\d+(?:\.\d+)?)%\s*," +
		"\s*(\d+(?:\.\d+)?)%\s*"  +
		"\)$"
	) {
		$color = hsl-to-hex      `
			$([int] $matches[1]) `
			$([int] $matches[2]) `
			$([int] $matches[3])
	}
	if ($color -match "^hsla\("   +
		"\s*(\d+(?:\.\d+)?)\s*,"  +
		"\s*(\d+(?:\.\d+)?)%\s*," +
		"\s*(\d+(?:\.\d+)?)%\s*," +
		"\s*(\d+(?:\.\d+)?)%?\s*" +
		"\)$"
	) {
		if ($color -match "%\s*)$") {
			# see the comment for the rgba section
			$matches[4] = 255 * $matches[4] / 100
		}

		$color = hsl-to-hex      `
			$([int] $matches[1]) `
			$([int] $matches[2]) `
			$([int] $matches[3])

		$color += "{0:x2}" -f [int] $matches[4]
	}

	return optimize-hex $color
}

<#
.synopsis
	invert an individual color, given by a hex code.
#>
function invert-hex([string] $color) {
	if ($color.length -eq 4) {
		# #RGB -> #RRGGBB
		$color = "#"              + `
			$color[1] + $color[1] + `
			$color[2] + $color[2] + `
			$color[3] + $color[3]
	}

	if ($color.length -eq 5) {
		# #RGBA -> #RRGGBBAA
		$color = "#"              + `
			$color[1] + $color[1] + `
			$color[2] + $color[2] + `
			$color[3] + $color[3] + `
			$color[4] + $color[4]
	}

	if ($color.length -notin 7, 9) {
		throw "invalid hash RGB color ``$color``. must be either #RRGGBB or #RRGGBBAA"
	}

	[byte] $r = "0x" + $color.substring(1, 2)
	[byte] $g = "0x" + $color.substring(3, 2)
	[byte] $b = "0x" + $color.substring(5, 2)

	$outstr = "#"                + `
		("{0:x2}" -f (255 - $r)) + `
		("{0:x2}" -f (255 - $g)) + `
		("{0:x2}" -f (255 - $b))

	if ($color.length -eq 7) {
		return optimize-color $outstr
	}

	[byte] $a = "0x" + $color.substring(7, 2)

	$outstr += "{0:x2}" -f $a
	return optimize-color $outstr
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
function invert-color([string] $color) {
	# TODO: figure out what to do if the rgb values are outside of [0, 256)
	# TODO: separate this into different functions
		# invert-named
		# invert-rgb/invert-rgba
		# invert-hsl/invert-hsla

	$color = $color.trim()

	if ($color -eq "none") {
		return "none"
	}

	if ($color.length -in 3, 4, 6, 8 -and $color -match "^[\da-f]+$") {
		$color = "#$color"
	}

	if ($color.startsWith("#")) {
		return invert-hex $color
	}

	#### start setup ####

	$match = [regex]::match($color,
		"^(rgb|hsl)\(" +
		"\s*([^\s,\)]+)\s*,"*3 +
		"{0}\)$",
		[Text.RegularExpressions.RegexOptions]::IgnoreCase
	)

	if ($match.success) {
		# rgb or hsl
		$type, $a, $b, $c = $match.groups | select -skip 1 | % value
	}
	else {
		$match = [regex]::match($color,
			"^(rgba|hsla)\(" +
			"\s*([^\s,\)]+)\s*,"*4 +
			"{0}\)$",
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
			$ret = invert-color $namedColorMap.$color

			if ($ret -eq $null) { throw "invalid color ``$color``" }

			$ret
		}
	}

	return optimize-color $ret
}

<#
.synopsis
	look for a background rectangle. if it
	is found do nothing, otherwise add one.

	returns nothing; updates the content
	found at the $options.content argument.
#>
function look-for-bg-rect(
	[hashtable] $options,
	[string] $width,
	[string] $height,
	[int] $svgEndIndex
) {
	${indent+1} = $options.indentPlus1

	<#
	technically, this can find a "background" rectangle midway through
	the SVG, in which case, you would be covering up everything that
	was previously drawn, which is stupid, and there might as well be
	nothing before the background rectangle, unless they have events
	or something more advanced like that.
	#>
	$bgFound = $false
	$counter = 0
	$actualStt = 0
	$end = $svgEndIndex
	while ($true) {
		$stt = $options.content.indexOf("<rect", $end)

		if ($stt -eq -1) { break }
		$actualStt = $stt
		$counter++
		$end = $options.content.indexOf(">", $stt + 5)

		if ($options.overwrite) {
			write-host "`r${indent+1}found background candidate $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found background candidate $counter at bytes $stt-$end"
		}

		$rect = $options.content.substring($stt, $end - $stt + 1)

		# TODO: make this match any number, and then test it externally.
		$rectWidth  = [regex]::match($rect, "width\s*=\s*`"(?:100(?:\.0+)?%|$width)`"")
		$rectHeight = [regex]::match($rect, "height\s*=\s*`"(?:100(?:\.0+)?%|$height)`"")

		if ($rectWidth.success -and $rectHeight.success) {
			if ($options.verb) {
				if ($options.overwrite) {
					# overwrite the previous line
					write-host $(
						"`r${indent+1}" +
						" " * "found background candidate $counter at bytes $stt-$end".length +
						"`r"
					) -noNewline
				}

				write-host "${indent+1}background found. no insertion required."
			}

			$bgFound = $true
			break
		}
	}

	if ($options.verb -and !$bgFound) {
		if ($options.overwrite) {
			# overwrite the previous line
			write-host $(
				"`r${indent+1}" +
				" " * "found background candidate $counter at bytes $actualStt-$end".length +
				"`r"
			) -noNewline
		}

		write-host "${indent+1}background not found. inserting one."
	}

	if (!$bgFound) {
		$rectStr  = "<rect width=`""
		$rectStr += "$width".length -gt 4 ? "100%" : $width
		$rectStr += "`" height=`""
		$rectStr += "$height".length -gt 4 ? "100%" : $height
		$rectStr += "`" fill=`"$bgcolor`"/>"

		$options.content = $options.content.insert($svgEndIndex + 1, $rectStr)
	}
	else {
		write-host "${indent+1}not inserting background"
	}
}

<#
.synopsis
	invert all stroke colors in the SVG.
	returns nothing; updates $options.content.
#>
function invert-stroke-colors([hashtable] $options) {
	${indent+1} = $options.indentPlus1
	$counter = 0
	$actualStt = 0
	$end = 0
	while ($true) {
		$stt = $options.content.indexOf("stroke=", $end)

		if ($stt -eq -1) { break }
		$actualStt = $stt
		$counter++
		$stt += 7

		$end = $options.content.indexOf('"', $stt + 1)

		if ($options.overwrite) {
			write-host "`r${indent+1}found stroke $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found stroke $counter at bytes $stt-$end"
		}

		$color = invert-color $( $options.content.substring($stt + 1, $end - $stt - 1) )

		$options.content = $options.content.substring(0, $stt + 1) + `
			$color + $options.content.substring($end)
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host $(
					"`r${indent+1}"                                               + # indentation
					" " * "found stroke $counter at bytes $actualStt-$end".length + # clear line
					"`r${indent+1}done. $counter found"                             # new content
				)
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "   - found $counter" }
	}
}

<#
.synopsis
	invert all fill colors in the SVG.
	returns nothing; updates $options.content.
#>
function invert-fill-colors([hashtable] $options) {
	${indent+1} = $options.indentPlus1
	$counter = 0
	$actualStt = 0
	$end = 0
	while ($true) {
		$stt = $options.content.indexOf("fill=", $end)

		if ($stt -eq -1) { break }
		$actualStt = $stt
		$counter++
		$stt += 5

		$end = $options.content.indexOf('"', $stt + 1)

		if ($options.overwrite) {
			write-host "`r${indent+1}found fill $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found fill $counter at bytes $stt-$end"
		}

		$color = invert-color $( $options.content.substring($stt + 1, $end - $stt - 1) )

		$options.content = $options.content.substring(0, $stt + 1) + $color + $options.content.substring($end)
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host $(
					"`r${indent+1}"                                             + # indentation
					" " * "found fill $counter at bytes $actualStt-$end".length + # clear line
					"`r${indent+1}done. $counter found"                           # new content
				)
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "     - found $counter" }
	}
}

<#
.synopsis
	because of how image masks work, images used in masks don't
	have to be inverted.

	returns the IDs of mask images that use `<use ...>` and the
	indices of embedded <image> tags within `<mask>`.
.description
	Assumes all images used for masks (via <use>) are not used for
	anything else. Technically they *can* be used for both, but I
	don't think that is likely, so I don't care.
#>
function find-image-masks([hashtable] $options) {
	${indent+1} = $options.indentPlus1
	# TODO: deal with masks that have stuff like <rect>, <circle>, etc.
		# find masks before everything else.
		# change the image indices to be mask index ranges.
		# don't invert the colors of anything in any of the ranges.

	$end = $actualStt = $counter = 0
	$firstImageIndex  = $end = $stt = $options.content.indexOf("<image", $end)
	$maskImageIds     = @()
	$maskImageIndices = @()

	# if there are no images, don't look for image masks.
	while ($stt -ne -1) {
		$stt = $options.content.indexOf("<mask", $end)

		if ($stt -eq -1) { break }
		$actualStt = $stt
		$counter++

		# 6 == "<mask>".length
		$end = $options.content.indexOf("</mask>", $stt + 6)

		if ($options.overwrite) {
			write-host "`r${indent+1}found image mask $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found image mask $counter at bytes $stt-$end"
		}

		$mask = $options.content.substring($stt, $end - $stt + 1)

		$useMatches = [regex]::matches($mask,
			"<use[^>]*xlink:href\s*=\s*" +
			"(?<quote>[`"'])"            +
				"#(?<id>[^`"'\s>]+)"     +
			"\k<quote>"                  +
			"[^>]*/?>"
		)

		$maskImageIds += $useMatches `
			| % groups               `
			| where name -eq id      `
			| % value

		$maskImageIndices += [regex]::matches($mask,
			"<image[^>]*xlink:href\s*=\s*"       +
			"(?<quote>[`"'])"                    +
				"data:image/(?:png|jpe?g|webp);" +
				"base64,(?:[\da-zA-Z+/=]+)"      +
			"\k<quote>"                          +
			"[^>]*/?>"
		) | % index
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host $(
					"`r${indent+1}"                                                   + # indentation
					" " * "found image mask $counter at bytes $actualStt-$end".length + # clear line
					"`r${indent+1}done. $counter found"                                 # new content
				)
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "       - found $counter" }
	}

	return @{
		imageIds        = $maskImageIds
		imageIndices    = $maskImageIndices
		firstImageIndex = $firstImageIndex
	}
}

<#
.synopsis
	inverts the colors of images embedded through <image> tags.
	returns nothing; updates $options.content.
#>
function invert-image-colors(
	[hashtable] $options,
	[bool] $keepIntermediateFiles,
	[hashtable] $masks
) {
	${indent+1} = $options.indentPlus1
	# TODO: also work with images that use files for their colors?
	$counter = 0
	$actualStt = $stt = $actualEnd = $end = $masks.firstImageIndex
	while ($stt -ne -1) {
		# I looked into vectorizing the embedded raster image, but I couldn't
		# find a single tool that does it well, even for a simple graph PNG.
		# maybe the PNG I had was just too low quality, but idk.

		$stt = $options.content.indexOf("<image", $end)

		if ($stt -eq -1) { break }
		$actualStt = $stt
		$counter++

		if ($stt -in $masks.imageIndices) {
			# the image is one of the embedded mask <image> tags
			continue
		}

		if (!(gcm magick -type app -ErrorAct silent)) {
			throw "Required program ImageMagick ``magick`` was not found. embedded images are left un-inverted."
		}

		# 7 == "<image/".length. it can never be shorter than that.
		$actualEnd = $end = $options.content.indexOf(">", $stt + 7)

		if ($options.overwrite) {
			write-host "`r${indent+1}found embedded image $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found embedded image $counter at bytes $stt-$end"
		}

		$image = $options.content.substring($stt, $end - $stt + 1)

		# the "preamble" is just the stuff before the base64.
		$match = [regex]::match($image,
			"(?<preamble>xlink:href\s*=\s*"    +
			"(?<startquote>[`"'])data:image/)" +
			"(?<type>png|jpe?g|webp);base64,"  +
			"(?<base64>[\da-zA-Z+/=]+)"        +
			"(?<endquote>\k<startquote>)"
		)

		$id = [regex]::match($image,
			"id\s*=\s*(?<quote>[`"'])(?<id>[^`"'\s>]+)\k<quote>"
		).groups | where name -eq id | % value

		if ($id -in $masks.imageIds) {
			# the image is used in a <mask> tag
			continue
		}

		$groups = $match.groups

		$imageType = ($groups | where name -eq type).value
		$image = [Convert]::FromBase64String(($groups | where name -eq base64).value)
		[IO.File]::WriteAllBytes("./tmp-$counter.$imageType", $image)

		magick ./tmp-$counter.$imageType -negate ./tmp-$counter.$imageType

		$image = [IO.File]::ReadAllBytes("./tmp-$counter.$imageType")
		$image = [Convert]::ToBase64String($image)
		if (!$keepIntermediateFiles) {
			rm ./tmp-$counter.$imageType 2> $null
		}

		$options.content =
			$options.content.substring(0,
				$stt         +
				$match.index +
				($groups | where name -eq preamble).value.length
			)                          + `
			"$imageType;base64,$image" + `
			$options.content.substring($stt + ($groups | where name -eq endquote).index)

		# somehow, inverting the colors of a PNG can make the base64
		# version of it signifcantly shorter, so if you keep $end the
		# same, it you could completely miss the next <image> element
		$end = $stt + 5
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				# $end gets set to $stt + 5 after every iteration, so $actualEnd
				# is used so the value used in the string length can be stored.
				write-host $(
					"`r${indent+1}" +
					" " * "found embedded image $counter at bytes $actualStt-$actualEnd".length +
					"`r${indent+1}done. $counter found"
				)
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host " - found $counter" }
	}

	return $options.content
}

<#
.synopsis
	invert the colors of a whole SVG.
	assumes a moderate level of simplicity (no events, gradiants, etc.).
		basically the input should be something that a PNG can render.
	assumes the SVG is valid.
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
	[string] $infile,
	[string] $outfile = $infile,

	[string] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")]
		[string] $logging = "basic",
	[bool] $keepIntermediateFiles,

	# -SVGTool is for EPS and PDF
	# -dpi is only for EPS and PDF
	[string] $bgcolor = "white"
) {
	# the `$actualXYZ` variables are used for overwriting previous lines.

	# TODO: don't invert fill, stroke, or embedded image colors within <mask> tags.
	# TODO: don't load the entire file content into memory at once, if possible
	if ($infile -eq "") { throw "input file was not provided" }

	if (!(test-path -type leaf $infile)) {
		throw "invalid path. either not a file or does not exist"
	}

	$verb = $logging -in "none", "basic" ? $false : $true

	$overwrite = $logging -eq "overwrite"
	$verb = [bool] $verb

	$numRegex = "\d+(?:\.\d+)?|\.\d+"

	$indent = $indTyp * $indLvL
	${indent+1} = $indent + $indTyp*1
	${indent+2} = $indent + $indTyp*2 # unused.

	# required if there are embedded images.
	[IO.Directory]::SetCurrentDirectory((pwd))

	$content = cat $infile -raw

	$svgSttIndex = $content.indexOf("<svg")
	$svgEndIndex = $content.indexOf(">", $svgSttIndex + 4)
	$svg = $content.substring($svgSttIndex, $svgEndIndex - $svgSttIndex + 1)

	# full SVG dimensions.
	# not using width="..." or height="..." since those are different
	# from the coordinates that things within the SVG use; possible scaling
	$scaledWidth  = [regex]::match($svg,
		"width\s*=\s*(?<quote>[`"'])\s*(?<width>$numRegex)\s*\k<quote>"
	).groups | where name -eq width  | % value

	$scaledHeight = [regex]::match($svg,
		"height\s*=\s*(?<quote>[`"'])\s*(?<height>$numRegex)\s*\k<quote>"
	).groups | where name -eq height | % value

	if ($svg -notmatch "viewBox\s*=\s*(?<quote>[`"'])\s*" +
		"($numRegex)(?:\s+)"*4 +
		"{0}\s*\k<quote>") {
		throw "SVG does not have a ``viewBox`` attribute"
	}
	# viewBox="min_x min_y width height"

	# these can stay as strings, it is fine.
	$width  = $matches[3]
	$height = $matches[4]

	# these coerce to doubles before the division
	$widthScale  = $scaledWidth  / $width
	$heightScale = $scaledHeight / $height

	if ($verb) {
		write-host "${indent}SVG dimensions (w,h): $width x $height ($(
			$widthScale -ne 1 -or $heightScale -ne 1 ?
				"scaled to $scaledWidth x $scaledHeight" :
				"unscaled"
		))"
	}

	if ($width  -in $null, "") {
		throw  "width is not specified or is in the wrong format"
	}
	if ($height -in $null, "") {
		throw "height is not specified or is in the wrong format"
	}

	$options = @{
		content     = $content
		overwrite   = $overwrite
		verb        = $verb
		logging     = $logging
		indentPlus1 = ${indent+1}
	}
	$content = $null

	if ($verb) {
		write-host "${indent}looking for background rectangle"
	}

	look-for-bg-rect $options `
		-width       $width   `
		-height      $height  `
		-svgEndIndex $svgEndIndex

	if ($logging -ne "none") {
		write-host "${indent}inverting stroke colors" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}
	invert-stroke-colors $options

	if ($logging -ne "none") {
		write-host "${indent}inverting fill colors" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}
	invert-fill-colors $options

	if ($logging -ne "none") {
		write-host "${indent}finding image masks" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}
	$masks = find-image-masks $options

	if ($logging -ne "none") {
		write-host "${indent}inverting embedded images" -noNewline
		if ($verb) { write-host "" } # add the newline.
	}
	invert-image-colors $options `
		-masks   $masks          `
		-keepInt $keepIntermediateFiles

	if ($logging -ne "none") {
		write-host "${indent}done"
	}

	$options.content = $options.content.trim()

	if ($outfile -eq "-") { echo $options.content }
	else { $options.content > $outfile }
}

try {
	$canSetCursorVisibility = $true

	try {
		# sometimes this can throw an error, for example if it
		# is being run through Sublime Text.
		$startingCursorVisibility = [Console]::CursorVisible
		[Console]::CursorVisible = $false
	}
	catch {
		$canSetCursorVisibility = $false
	}

	invert-svg            `
		-infile  $infile  `
		-outfile $outfile `
		-indLvl  $indLvl  `
		-indTyp  $indTyp  `
		-logging $logging `
		-bgcolor $bgcolor `
		-keepInt $keepIntermediateFiles
}
finally {
	# in case of ^C, reset visibility.

	if ($canSetCursorVisibility) {
		[Console]::CursorVisible = $startingCursorVisibility
	}
}

exit 0
