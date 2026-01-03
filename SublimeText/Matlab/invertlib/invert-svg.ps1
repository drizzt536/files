<#
.synopsis
	inverts the colors of an SVG image.

	assumes a moderate level of simplicity (no events, gradiants, filters, vector masks, etc.).
		basically the input should be something that a PNG could theoretically render.

	assumes the SVG is valid (for the most part).

	requires ImageMagick if the SVG has embedded images (PNG/JPEG/WEBP)
	It must be a new enough version to be called `magick`.
	If it is required but missing, an error won't be thrown until most of the way through inversion.

	to suppress all messages, either use `-logging none` or `invert-svg.ps1 [ARGS] 6> $null`
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
		4. invert the colors on every inline CSS `style` attribute.
		5. invert the colors on embedded raster images that aren't used as a mask.
		6. write the new contents to the outfile.
			- or write to stdout if the outfile is "-".
			- default outfile is the infile (in-place inversion).
.parameter infile
	The input file to invert the colors of. should be a valid SVG.
.parameter outfile
	The output file. Use "-" for stdout, and leave blank for an in-place inversion.
.parameter indLvl
	starting indentation level. 0 for no indentation.
	Use a higher level if needed for if this is called as a subprogram.
.parameter indTyp
	type of indentation. probably either "`t" or "    ".
	defaults to tab indentation.
.parameter logging
	specifies the logging type and verbosity of the program.

	- none: don't print anything, and don't hide the cursor
	- basic: prints major steps and number of things found for each major step.
	- verbose: prints out every opteration that happens on a separate line. also prints debug information.
	- overwrite: prints in a similar format as "verbose", but doesn't print debug information, and prints
		the "found ..." lines and overwrite them as it finds new ones.
		Doesn't print properly on terminals that don't support ANSI escape sequence.
.parameter keepIntermediateFiles
	if given as true, intermediate files will be kept, which amounts to
	./tmp-$counter.$imageType files for embedded raster images being kept.
.parameter optimize
	controls whether or not extra optimizations are performed on the SVG.

	NOTE: color optimization happens regardless, e.g. these inversions:
		"#1234560"                 -> "#eca0"
		"rgb(128, 128, 128)"       -> "gray"
		"hsl(209.5, 58.5%, 47.5%)" -> "peru"
		"rgba(54, 127, 65, 47%)"   -> "#c980be78"
.parameter help
	prints help text and exit. equivalent to `get-help -full invert-svg.ps1`.
	`invert-svg.ps1 --help` also works, but `--help` must be the first argument.
	`invert-svg.ps1 -?` is different, and equivalent to `get-help invert-svg.ps1`
.parameter bgcolor
	set the assumed background color of the input SVG (before inverting).
	if `-bgcolor "none"` is given, the step for inserting a background is skipped.
	if the SVG already has a background and the color is wrong, nothing happens.

	if the SVG doesn't have a background already, one will be added with the given color.
	This is most useful for auto-generated SVGs from `pdftocairo` and stuff.
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

	# -SVGTool   - DOC/DOCX, EPS, PDF, and PPT/PPTX
	# -PDFTool   - DOC/DOCX, and PPT/PPTX
	# -dpi       - DOC/DOCX, EPS, PDF, and PPT/PPTX
	[string] $bgcolor = "#fff"
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

# TODO: remove comments before everything, so background checking doesn't find
	# commented out rectangles as the potential background.

# TODO: for x="...", y="...", limit to 3 decimal places? maybe also d="..."?
# TODO: invert the colors of CSS color styling.
	# it would need to do both inline CSS and the standalone CSS.
	# the inline CSS will be much easier.
# TODO: what happens if you have something like <rect width="50" height="50">
	# without a fill, stroke, or style.
# TODO: for every externally-linked raster image, embed the image directly.
	# do this before reversing the image colors.
	# or maybe just warn that they won't invert properly
# TODO: make a boolean argument to decide if masks should be inlined.
	# meaning removing masks and masking the images that are given.
	# more thought is required for masking stuff that isn't raster.
# TODO: everything without fill="..." or fill-opacity="..." needs fill-opacity="0"
	# this is so SVG to PDF and SVG rasterization programs will work.
	# this is in addition to the previous todo for removing masks.
# TODO: <g> groups with only one thing in it can get removed.
	# the attributes have to get moved to the sub-object.
	# attributes might have to get merged, e.g. `<rect id="a b"/>` instead of `<rect id="a" id="b"/>`.
# TODO: empty <g> groups can be removed and so can all references to them by id.
# TODO: all instances of `xlink:href=` can be replaced with `href=`. (I think)
# TODO: <g> groups without any id or anything don't matter and can be removed.
# TODO: add extra checks and throw errors for bad input.
	# a lot of assumptions are made, and for bad input, they don't work.
# TODO: implement a color tolerance where `-optimize $true` will change colors like "#cc863f"
	# to "peru" ("#cd853f") if the distance is under a certain tolerance (3? 4?).
	# this would only take place after inversion, and only if it makes the color name shorter.
	# use a Euclidean-like distance to the nearest short color
	# sqrt(abs(ΔR² sgn ΔR + ΔG² sgn ΔG + ΔB² sgn ΔB))
# TODO: try and figure out a way that something like this can be inverted:
	# use `dot -Tsvg in.gv -o out.svg` to generate this given some graphviz file.
	# <?xml version="1.0" encoding="UTF-8" standalone="no"?>
	# <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
	#  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<#
idea to invert <style> ... </style> CSS styling

for each external stylesheet reference,
	if it is a repeat reference, delete it and continue.
	replace it with a regular <style> ... </style> block containing the same contents.

for each <style> ... </style> tag:
	Strip out comments because they make everything more difficult.
	Find all instances of `{` and `}` that are not inside strings.
	for each of the curly braces
		match with the ending brace and extract the rules string in between.
	for each set of rules,
		pretend it is inline and invert the colors using the inline inverter function.
		replace the uninverted rules with the inverted rules in the string.
	replace the <style> block with the new style block.
#>

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
		# write-host "`$hexToNameMap.'$hex' = $name"
		$hexToNameMap.$hex = $name
	}
}

if (-not (get-typedata -typeName Text.StringBuilder).members.indexOf) {
	update-typedata -typeName Text.StringBuilder -memberType ScriptMethod -memberName indexOf -value {
		param ([string] $str, [uint] $stt = 0)

		# I don't think KMP is worth it here, and I don't think it is ever worth it.
		# this is already O(n m), but much closer to O(n) than that, so O(n + m) is
		# barely an immprovement for a ton of extra complexity.

		for ($i = $stt; $i -lt $this.length - $str.length; $i++) { # for each character in the builder
			# TODO: instead of just $i++, skip to the next instance of the first character
			#       or if there was none, do $i += $j
			for ($j = 0; $j -lt $str.length; $j++) { # try and match it to the string
				if ($this[$i + $j] -ne $str[$j]) {
					break
				}

				if ($j + 1 -eq $str.length) {
					# the whole string matched.
					return $i
				}
			}
		}

		# nothing matched
		return -1
	}
}

if (-not (get-typedata -typeName Text.StringBuilder).members.chunkCount) {
	update-typedata -typeName Text.StringBuilder -memberType ScriptMethod -memberName chunkCount -value {
		$count = 0
		$chunks = $this.getChunks()

		while ($chunks.moveNext()) {
			$count++
		}

		$count
	}
}

<#
.synopsis
	https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
	h \in [0, 360]
	s, l \in [0, 100]

	returns #RRGGBB
#>
function hsl-to-hex([double] $h, [double] $s, [double] $l) {
	# normalize into [0, 1]
	$h /= 360
	$s /= 100
	$l /= 100

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

	return "#$r$g$b"
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

	# #RRGGBBAA -> #RGBA
	if ($color -match "^#([\da-f])\1([\da-f])\2([\da-f])\3([\da-f])\4$") {
		$color = "#" + $color[1] + $color[3] + $color[5] + $color[7]
	}

	# #RRGGBB -> #RGB
	if ($color -match "^#([\da-f])\1([\da-f])\2([\da-f])\3$") {
		$color = "#" + $color[1] + $color[3] + $color[5]
	}

	# #RrGgBb00 -> #RGB0
	if ($color -match "^#[\da-f]{6}00$") {
		# this is an approximation of the color, but since it
		# is fully transparent, it doesn't matter anyway.
		$color = "#" + $color[1] + $color[3] + $color[5] + "0"
	}

	## remove unnecessary alpha channels

	# #RGBf -> #RGB
	if ($color -match "^#[\da-f]{3}f$") {
		$color = $color.substring(0, 4)
	}

	# #RrGgBbff -> #RrGgBb
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

	if ($color -in "none", "transparent") {
		return $color.toLower()
	}

	if ($color.length -in 3, 4, 6, 8 -and $color -match "^[\da-f]+$") {
		$color = "#$color"
	}

	## convert from function form to hex form

	# [math]::round rounds to the nearest even integer,
	# instead of the nearest integer, so it won't work.
	# instead round(x) == floor(x + 1/2) is used.
	# The 0.5 is put on the left side for casting purposes.

	if ($color -match "^rgb\(" + "\s*(\d+(?:\.\d+)?)\s*,"*3 + "{0}\)$") {
		$color = "#"                                             + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[1])) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[2])) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[3]))
	}
	if ($color -match "^rgb\(" + "\s*(\d+(?:\.\d+)?)%\s*,"*3 + "{0}\)$") {
		$color = "#"                                                         + `
			("{0:x2}" -f [int] [math]::floor(0.5 + 255 * $matches[1] / 100)) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + 255 * $matches[2] / 100)) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + 255 * $matches[3] / 100))
	}
	if ($color -match "^rgba\(" + "\s*(\d+(?:\.\d+)?)\s*,"*4 + "{0}%?\)$") {
		if ([regex]::match($color, "%\s*\)$").success) {
			# change percent to a regular integer the
			# alpha channel can always be a percent,
			# even if the other channels are not.
			$matches[4] = 255 * $matches[4] / 100
		}

		$color = "#"                                             + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[1])) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[2])) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[3])) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[4]))
	}
	if ($color -match "^rgba\(" + "\s*(\d+(?:\.\d+)?)%\s*,"*4 + "{0}%?\)$") {
		if ([regex]::match($color, "%\s*\)$").success) {
			# see the comment for the rgba section
			$matches[4] = 255 * $matches[4] / 100
		}

		$color = "#"                                                         + `
			("{0:x2}" -f [int] [math]::floor(255 * $matches[1] / 100 + 0.5)) + `
			("{0:x2}" -f [int] [math]::floor(255 * $matches[2] / 100 + 0.5)) + `
			("{0:x2}" -f [int] [math]::floor(255 * $matches[3] / 100 + 0.5)) + `
			("{0:x2}" -f [int] [math]::floor(0.5 + $matches[4]))
	}
	if ($color -match "^hsl\("      +
		"\s*(\d+(?:\.\d+)?)\s*,"    +
		"\s*(\d+(?:\.\d+)?)%\s*,"*2 +
		"{0}\)$"
	) {
		$color = hsl-to-hex         `
			$([double] $matches[1]) `
			$($matches[2])          `
			$($matches[3])
	}
	if ($color -match "^hsla\("     +
		"\s*(\d+(?:\.\d+)?)\s*,"    +
		"\s*(\d+(?:\.\d+)?)%\s*,"*2 +
		"\s*(\d+(?:\.\d+)?)%?\s*"   +
		"\)$"
	) {
		if ([regex]::match($color, "%\s*\)$").success) {
			# see the comment for the rgba section
			$matches[4] = 255 * $matches[4] / 100
		}

		$color = hsl-to-hex         `
			$([double] $matches[1]) `
			$([double] $matches[2]) `
			$([double] $matches[3])

		$color += "{0:x2}" -f [int] [math]::floor(0.5 + $matches[4])
	}

	if ($namedColorMap.$color -ne $null) {
		$color = $namedColorMap.$color
	}

	if (-not $color.startsWith("#")) {
		# NOTE: this might not be the color that was originally given to the function.
		throw "invalid color ``$color``."
	}

	# write-host $color

	# NOTE: hex is almost always the shortest form. except for sometimes when the named form is shorter.
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

	try {
		[byte] $r = "0x" + $color.substring(1, 2)
		[byte] $g = "0x" + $color.substring(3, 2)
		[byte] $b = "0x" + $color.substring(5, 2)
	} catch {
		# NOTE: this isn't always the color that was originally given to the function.
		throw "invalid color ``$color``"
	}

	$outstr = "#"                + `
		("{0:x2}" -f (255 - $r)) + `
		("{0:x2}" -f (255 - $g)) + `
		("{0:x2}" -f (255 - $b))

	if ($color.length -eq 7) {
		return optimize-hex $outstr
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
	# TODO: separate this into different functions?
		# invert-named
		# invert-rgb/invert-rgba
		# invert-hsl/invert-hsla

	$color = $color.trim()

	if ($color -in "none", "transparent") {
		return $color.toLower()
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

	if ($type -in "hsl", "hsla") {
		if (-not $b.endsWith("%")) {
			throw "invalid HSL/HSLA saturation percent '$b'"
		}

		if (-not $c.endsWith("%")) {
			throw "invalid HSL/HSLA lightness percent '$c'"
		}

		$a = [double] $a
		$b = [double] $b.substring(0, $b.length - 1)
		$c = [double] $c.substring(0, $c.length - 1)
	}
	elseif ($match.success) {
		# RGB and RGBA
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

	# clamp to the allowable color range and normalize
	if ($type -in "rgb", "rgba") {
		$a = [double]::clamp($a, 0, $percents ? 100 : 255)
		$b = [double]::clamp($b, 0, $percents ? 100 : 255)
		$c = [double]::clamp($c, 0, $percents ? 100 : 255)
		# $d gets clamped later
	}
	elseif ($type -in "hsl", "hsla") {
		if ($a -lt 0) { $a = $a % 360 + 360 } # e.g. (-500) % 360 -> -140
		$b = [double]::clamp($b, 0, 100)
		$c = [double]::clamp($c, 0, 100)
	}

	if ($type -in "rgba", "hsla") {
		try {
			$d = $d.endsWith("%") ?
				"$( [double]::clamp($d.substring(0, $d.length - 1), 0, 100) )%" :
				[int]::clamp($d, 0, 255)
		} catch {
			throw "invalid color ``$color``."
		}
	}

	#### end setup ####

	$ret = switch ($type) {
		# for rgb and rgba, either they are all percentages or none of them are.
		# this does not include the alpha value, which can be different

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
		"hsl"  { "hsl($( ($a + 180) % 360),$b%,$(100 - $c)%)"    }
		"hsla" { "hsla($(($a + 180) % 360),$b%,$(100 - $c)%,$d)" }
		"named or invalid" {
			if ($namedColorMap.$color -eq $null) { throw "invalid color ``$color``" }
			invert-color $namedColorMap.$color
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
.description
	there are a few major issues I am aware of with the approach this function takes,
	but they don't seem super common, at least for SVGs exported from programs I've used,
	and the supported ways of doing backgrouns are better in basically every way,
	so it is probably fine to put off fixing these issues.

	# TODO: (todo line just for file searching)
	issue 1:
		if `<rect width="100%" height="100%"/>` is in <defs>, it doesn't actually render.
		this will still recognize it and assume it is the whole document background.
		It might be, depending on how that id is used in the SVG, but probably not,
		otherwise it would just be outside the <defs> block.
		There is almost certainly the same issue with <mask> as well as <defs>
	issue 2:
		this can find a "background" rectangle midway through
		the SVG, in which case, you would be covering up everything that
		was previously drawn, which is stupid, and there might as well be
		nothing before the background rectangle, unless they have events
		or something more advanced like that.
		(<style> and <defs> probably would go before it, but it doesn't really matter).
	issue 3:
		technically, you can use <circle>, <path>, <polygon>, and stuff other than <rect>
		as a document background, as long as it covers the whole SVG area. This will not
		recognize those, and will only find <rect> It is exceedingly unlikely that anyone
		or any program would intentionally use any of those when <rect> is simpler.
#>
function look-for-bg-rect(
	[hashtable] $options,
	[string] $width,
	[string] $height,
	[int] $svgEndIndex
) {
	${indent+1} = $options.indentPlus1
	$bgFound = $false
	$counter = 0
	$end = $svgEndIndex

	while (($stt = $options.content.indexOf("<rect", $end)) -ne -1) {
		$counter++
		$end = $options.content.indexOf(">", $stt + 5)

		if ($end -eq -1) {
			throw "unterminated rectangle"
		}

		if ($options.overwrite) {
			write-host "`r${indent+1}found background candidate $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found background candidate $counter at bytes $stt-$end"
		}

		$rect = $options.content.toString($stt, $end - $stt + 1) # +1 to include the '>' character.

		# TODO: make this match any number, and then test it externally.
		$rectWidth  = [regex]::match($rect, "width\s*=\s*`"(?:100(?:\.0+)?%|$width)`"")
		$rectHeight = [regex]::match($rect, "height\s*=\s*`"(?:100(?:\.0+)?%|$height)`"")

		if ($rectWidth.success -and $rectHeight.success) {
			if ($options.verb) {
				if ($options.overwrite) {
					# overwrite the previous line
					write-host -noNewline "`r`e[0K"
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
			write-host -noNewline "`r`e[0K"
		}

		write-host "${indent+1}background not found. inserting one."
	}

	if (!$bgFound) {
		# use the shorter between "100%", and the actual width.
		$rectStr =	"<rect width=`"" + ("$width".length -gt 4 ? "100%" : $width) + `
					"`" height=`"" + ("$height".length -gt 4 ? "100%" : $height) + `
					"`" fill=`"$bgcolor`"/>"

		[void] $options.content.insert($svgEndIndex + 1, $rectStr)
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
	$end = 0

	while (($stt = $options.content.indexOf("stroke=", $end)) -ne -1) {
		$counter++
		$stt += 7

		# `$options.content[$stt]` should be either ' or ".
		$end = $options.content.indexOf($options.content[$stt], $stt + 1)

		if ($end -eq -1) {
			throw "unterminated ``stroke`` attribute"
		}

		if ($options.overwrite) {
			write-host "`r${indent+1}found stroke $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found stroke $counter at bytes $stt-$end"
		}

		$stt++ # skip after the open quote.
		$oldColor = $options.content.toString($stt, $end - $stt)
		$newColor = invert-color $oldColor

		[void] $options.content.replace($oldColor, $newColor, $stt, $end - $stt)

		$end = $stt + $newColor.length + 1 # update the index for the new content. +1 for the end quote.
		# don't assume this is the last one for the element. technically, you can do
		# `<rect stroke="red" stroke="blue"/>`, even though that doesn't make sense.
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host "`r`e[0K${indent+1}done. $counter found"
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "     - found $counter" }
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
	$end = 0

	while (($stt = $options.content.indexOf("fill=", $end)) -ne -1) {
		$counter++
		$stt += 5

		# `$options.content[$stt]` should be either ' or ".
		$end = $options.content.indexOf($options.content[$stt], $stt + 1)

		if ($end -eq -1) {
			throw "unterminated ``fill`` attribute"
		}

		if ($options.overwrite) {
			write-host "`r${indent+1}found fill $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found fill $counter at bytes $stt-$end"
		}

		$stt++ # skip after the open quote.
		$oldColor = $options.content.toString($stt, $end - $stt)
		$newColor = invert-color $oldColor

		[void] $options.content.replace($oldColor, $newColor, $stt, $end - $stt)

		$end = $stt + $newColor.length + 1 # update the index for the new content. +1 for the end quote.
		# don't assume this is the last one for the element. technically, you can do
		# `<rect fill="red" fill="blue"/>` even though that doesn't make sense.
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host "`r`e[0K${indent+1}done. $counter found"
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "       - found $counter" }
	}
}

<#
.synopsis
	invert colors of inline CSS style colors in the SVG.
	returns nothing; updates $options.content.
#>
function invert-inline-css-colors([hashtable] $options) {
	${indent+1} = $options.indentPlus1
	$counter = $end = 0

	while (($stt = $options.content.indexOf("style=", $end)) -ne -1) {
		if ($stt -eq -1) { break }
		$counter++
		$stt += 6

		$outerQuoteType = $options.content[$stt]
		$innerQuoteType = $outerQuoteType -eq '"' ? "'" : '"'

		# `$outerQuoteType` should be either ' or ".
		$end = $options.content.indexOf($outerQuoteType, $stt + 1)

		if ($end -eq -1) {
			throw "unterminated ``style`` attribute"
		}

		if ($options.overwrite) {
			write-host -noNewline "`r${indent+1}found inline CSS style $counter at bytes $stt-$end"
		}
		elseif ($options.verb) {
			write-host "${indent+1}found inline CSS style $counter at bytes $stt-$end"
		}

		$stt++ # skip over the open quote
		$oldStyle = $options.content.toString($stt, $end - $stt)

		# TODO: when full <style> inversion is added, this code will need to be moved to its own function.
		#       because it covers the inversion of the stuff in the curly brackets.
		$styles = [Collections.ArrayList] (($oldStyle -creplace "[\t\r\n]", " ") -split ";")

		# NOTE: it does the line collapsing and actual inverting in one iteration.
		for ($i = 0; $i -lt $styles.count; $i++) {
			$styles[$i] = $styles[$i].trim()

			if ($styles[$i].length -eq 0) {
				# empty element. probably a double or trailing semicolon in the source.

				$styles.removeAt($i)
				$i-- # counteract the $i++
				continue
			}

			# make stuff like `content: 'x; y';` back into one element in the list.
			if ($styles[$i].toCharArray().where({ $_ -eq $innerQuoteType }).count -band 1) {
				# an odd number of quote characters means there is an unterminated string. technically,
				# you could be doing &quot; or something, but that is weird and you should stop that.
				if ($i -eq $styles.count -1) {
					throw "unterminated string in inline CSS styling"
				}

				$styles[$i] += ";" + $styles[$i + 1]
				$styles.removeAt($i + 1)

				# in case the style continues into a third line.
				$i-- # counteract the $i++
				continue
			}

			# TODO: if there are unmatched open quotes that aren't in strings, collapse the lines together.

			if ($styles[$i] -like "filter\s*:.+") {
				# TODO: filter is not implemented.
				# this one's arguments are different I think.
				# I don't know the semantics of how stuff like `grayscale(70%)` works.
				continue
			}

			if ($styles[$i] -like "invert\s*:.+") {
				# TODO: invert is not implemented either
				continue
			}

			# parse out the parts of the style
			$match = [regex]::match($styles[$i], "^(\w+(?:\-\w+)*)\s*:\s*(.+)$")

			# invert anything that looks like a color
			if ($match.success) {
				$styleTokens = $match.groups[2].value -split "\s+"

				for ($j = 0; $j -lt $styleTokens.count; $j++) {
					try { $styleTokens[$j] = invert-color $styleTokens[$j] }
					catch {} # leave the token the same.
				}

				$styles[$i] = "$($match.groups[1].value): $styleTokens"
				continue
			}
		} # end for loop

		$newStyle = $styles -join ";"
		# NOTE: $style is still the original style.
		[void] $options.content.replace($oldStyle, $newStyle, $stt, $end - $stt)
		$end = $stt + $newStyle.length + 1 # update the index for the new content. +2 for the quotes.
	} # end while loop

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host "`r`e[0K${indent+1}done. $counter found"
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host " - found $counter" }
	}
}

<#
.synopsis
	because of how image masks work, images used in masks don't
	have to be inverted.

	returns the IDs of mask images that use `<use ...>`, the
	indices of embedded <image> tags within `<mask>`, and the index
	of the first image. this index may or may not be within a <mask>.
.description
	Assumes all images used for masks (via <use>) are not used for
	anything else. Technically they *can* be used for both, but I
	don't think that is likely, so I don't care.
#>
function find-masks([hashtable] $options) {
	${indent+1} = $options.indentPlus1
	# TODO: deal with masks that have stuff like <rect>, <circle>, etc.
		# find masks before everything else.
		# change the image indices to be mask index ranges.
		# don't invert the colors of anything in any of the ranges.

	$end = $counter = 0
	# there used to be an `$end = ` in the next line, but I think it was a mistake.
	$firstImageIndex  = $stt = $options.content.indexOf("<image", $end)
	$maskImageIds     = @()
	$maskImageIndices = @()

	# if there are no images, don't look for image masks.
	while ($stt -ne -1) {
		$stt = $options.content.indexOf("<mask", $end)

		if ($stt -eq -1) { break }
		$counter++

		# 6 == "<mask>".length
		$end = $options.content.indexOf("</mask>", $stt + 6)

		if ($end -eq -1) {
			throw "unterminated ``<mask>`` element"
		}

		if ($options.overwrite) {
			write-host "`r${indent+1}found mask $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found mask $counter at bytes $stt-$end"
		}

		$mask = $options.content.toString($stt, $end - $stt + 1)

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
				write-host "`r`e[0K${indent+1}done. $counter found"
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "               - found $counter" }
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
	# TODO: also work with images that use files for their colors?
	#       e.g. <image href="file.png"/>

	${indent+1} = $options.indentPlus1
	$counter = 0
	$stt = $end = $masks.firstImageIndex

	while ($stt -ne -1) {
		# I looked into vectorizing the embedded raster image, but I couldn't
		# find a single tool that does it well, even for a simple graph PNG.
		# maybe the PNG I had was just too low quality, but idk.

		$stt = $options.content.indexOf("<image", $end)

		if ($stt -eq -1) { break }
		$counter++

		if ($stt -in $masks.imageIndices) {
			# the image is one of the embedded mask <image> tags
			continue
		}

		if (!(gcm magick -type app -ea ignore)) {
			# Ideally, this check would be at the start of the program,
			# but it technically isn't always required.
			throw "Required program ImageMagick ``magick`` was not found. embedded images are left un-inverted."
		}

		# 7 == "<image/".length. the data can never be shorter than that.
		$end = $options.content.indexOf(">", $stt + 7)

		if ($end -eq -1) {
			throw "unterminated ``<image>`` element"
		}

		if ($options.overwrite) {
			write-host "`r${indent+1}found embedded image $counter at bytes $stt-$end" -noNewline
		}
		elseif ($options.verb) {
			write-host "${indent+1}found embedded image $counter at bytes $stt-$end"
		}

		$image = $options.content.toString($stt, $end - $stt + 1)

		# the "preamble" is just the stuff before the base64.
		# TODO: is the `xlink:` part required?
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

		# TODO: if this script is being called from `invert-pdf.ps1`, this temporary
		#       file might conflict with the one for other pages.
		#       consider changing the naming convention to avoid this.
		#       this is only an issue with `-keep $true`
		$tmpfile = "./tmp-$counter.$imageType"
		[IO.File]::WriteAllBytes($tmpfile, $image)

		magick $tmpfile -negate $tmpfile

		$image = [IO.File]::ReadAllBytes($tmpfile)
		$image = [Convert]::ToBase64String($image)
		if (!$keepIntermediateFiles) {
			rm $tmpfile 2> $null
		}

		$replStt = $stt + $match.index + ($groups | where name -eq preamble).value.length
		$replEnd = $stt + ($groups | where name -eq endquote).index
		$repl = "$imageType;base64,$image"

		# TODO: change these StringBuilder methods from remove+insert to replace.
		[void] $options.content.remove($replStt, $replEnd - $replStt)
		[void] $options.content.insert($replStt, $repl)

		# somehow, inverting the colors of a PNG can make the base64
		# version of it signifcantly shorter, so if you keep $end the
		# same, it you could completely miss the next <image> element

		# this assumes that the xlink:href thing is very last in the image, which is not always the case.
		# NOTE: 3 -eq "'/>".length
		$end = $replStt + $repl.length + 3
	}

	if ($options.logging -ne "none") {
		if ($options.verb) {
			if ($options.overwrite) {
				# overwrite the previous line
				write-host "`r`e[0K${indent+1}done. $counter found"
			}
			elseif ($counter -eq 0) { write-host "${indent+1}none found" }
		}
		else { write-host "   - found $counter" }
	}
}

# TODO: make this take a [Text.StringBuilder] instead of [string] for the file content.
<#
.synopsis
	It condenses and optimizes the paths descriptors for <path> tags.

	Here is a list of what it does, in order:
		1. condense spaces
		2. replace `l x 0` with `h x`
		3. replace `l 0 x` with `v x`
		4. replace things like `ZzZzz` or `zzzZzZ` with just the first `z` or `Z`.
		5. replace `h n h k` with `h (n+k)`, as long as their signs are the same.
			at this time, it also does the same thing with `v`.
#>
function optimize-paths($options) {
	$pnum = "(?:\d*\.)?\d+(?:e[+\-]?\d+)?" # positive number
	$nnum = "-" + "$pnum" # negative nummber
	$number = "-?" + $pnum

	# condense spaces
	# `h 1 z v 2 l 2 3 L 1 -1` -> `h1zv2l2 3L1-1`
	$options.content =
	$options.content -creplace "d\s*=\s*(['`"])(?<path>[^'`"]*)\1", {
		$path = $_.groups | ? name -eq path | % value
		$path = $path -creplace "[\s,]+", " " -creplace "(?<!\d)\s|\s(?!\d)", ""

		return "d=`"$path`""
	}

	$options.content =
	$options.content `
		-creplace "l($number) 0", 'h$1' `
		-creplace "l0 ?($number)", 'v$1'

	# optimize consecutive `z` and `Z` commands.
	# only the first one can actually do anything.
	$options.content = $options.content -replace "(z)z+", { $_.groups[1] }

	# optimize consecutive `h` and `v` commands
	# `h2 h2 h-2 h2` -> `h4h-2h2`. this could just be h4 though
	# `v-2 v-2 v-2 v-2` -> `v-8`
	do {
		$continue = $false

		$options.content =
		$options.content -creplace "(?<type>[hv])(?<n1>$number)\k<type>(?<n2>$number)", {
			$type        = $_.groups | ? name -eq type | % value
			[double] $n1 = $_.groups | ? name -eq n1   | % value
			[double] $n2 = $_.groups | ? name -eq n2   | % value

			if ([math]::sign($n1) -eq [math]::sign($n2)) {
				$continue = $true

				"$type$($n1 + $n2)"
			}
			else {
				$_.groups[0].value
			}

		}
	} while ($continue)

	# TODO: optimize consecutive `l` commands, but only if they have the same slope.

	# TODO: optimize backtracking. h4 h-2 h3 -> h5.
		# however, something like `h4 h-5 h3` isn't entirely contained in
		# the previous line, so it isn't really simplifiable.
}

<#
.synopsis
	invert the colors of a whole SVG.
	assumes a moderate level of simplicity and assumes the SVG is valid (for the most part).
#>
function invert-svg(
	[string] $infile,
	[string] $outfile = $infile,

	[string] $indLvl = 0,
	[string] $indTyp = "`t",
	[ValidateSet("none", "basic", "overwrite", "verbose")] [string] $logging = "basic",
	[bool] $optimize = $false,
	[bool] $keepIntermediateFiles,

	# -SVGTool is for EPS and PDF
	# -dpi is only for EPS and PDF
	[string] $bgcolor = "#fff"
) {
	# TODO: don't invert fill, stroke, or embedded image colors within <mask> tags.
	# TODO: don't load the entire file content into memory at once, if possible.
	if ($infile -eq "") { throw "input file was not provided" }

	$logging = $logging.toLower()

	if (!(test-path -type leaf $infile)) {
		throw "invalid path. either not a file or does not exist"
	}

	$verb = $logging -cin "overwrite", "verbose"

	$overwrite = $logging -ceq "overwrite"

	$numRegex = "\d+(?:\.\d+)?|\.\d+"

	$indent = $indTyp * $indLvL
	${indent+1} = $indent + $indTyp*1
	${indent+2} = $indent + $indTyp*2 # unused.

	# required if there are embedded images because .NET uses its own working directory
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

	# these can stay as strings, it is fine. they will be coerced to the correct types.
	# it can't be coerced because sometimes it is null and it is used in string operations.
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
		throw "width is not specified or is in the wrong format"
	}
	if ($height -in $null, "") {
		throw "height is not specified or is in the wrong format"
	}

	$options = @{
		content     = [Text.StringBuilder] $content.trim()
		# TODO: the next two properties are not actually required.
		#       make sure they are used enough to warrant having them.
		overwrite   = $overwrite
		verb        = $verb
		logging     = $logging
		indentPlus1 = ${indent+1}
	}
	$content = $null # let the garbage collecter clear the string's memory.

	if ($bgcolor -ne "none") {
		# `-bgcolor none` won't add a non-existing backgound, but it also won't remove existing ones.
		if ($verb) {
			write-host "${indent}looking for background rectangle"
		}
		look-for-bg-rect $options `
			-width       $width   `
			-height      $height  `
			-svgEndIndex $svgEndIndex
	}

	if ($logging -cne "none") {
		write-host "${indent}inverting stroke colors" -noNewline
		if ($verb) { write-host "" }
	}
	invert-stroke-colors $options

	if ($logging -cne "none") {
		write-host "${indent}inverting fill colors" -noNewline
		if ($verb) { write-host "" }
	}
	invert-fill-colors $options

	if ($logging -cne "none") {
		write-host "${indent}inverting inline CSS colors" -noNewline
		if ($verb) { write-host "" }
	}
	invert-inline-css-colors $options

	if ($logging -cne "none") {
		write-host "${indent}finding masks" -noNewline
		if ($verb) { write-host "" }
	}
	$masks = find-masks $options

	if ($logging -cne "none") {
		write-host "${indent}inverting embedded images" -noNewline
		if ($verb) { write-host "" }
	}
	invert-image-colors $options -masks $masks -keep $keepIntermediateFiles

	if ($logging -ceq "verbose") {
		write-host "${indent}`e[1;34mDEBUG: file StringBuilder chunk count = $($options.content.chunkCount())"
	}

	$options.content = [string] $options.content

	if ($logging -cne "none") {
		write-host "${indent}done"
	}

	if ($optimize) {
		# if ($logging -cne "none") { write-host "optimizing SVG" }
		optimize-paths $options
	}

	if ($outfile -eq "-") { echo $options.content }
	else { $options.content > $outfile }
} # function invert-svg


try {
	# for `-logging none`, keep the cursor visible (pretend it cant be hidden).
	$canSetCursorVisibility = $logging -ne "none"
	$naturalExit = $false

	if ($logging -ne "none") {
		try {
			# sometimes this can throw an error, for example if it
			# is being run through Sublime Text.

			$startingCursorVisibility = [Console]::CursorVisible
			[Console]::CursorVisible = $false
		}
		catch {
			$canSetCursorVisibility = $false
		}
	}

	invert-svg              `
		-infile   $infile   `
		-outfile  $outfile  `
		-indLvl   $indLvl   `
		-indTyp   $indTyp   `
		-logging  $logging  `
		-bgcolor  $bgcolor  `
		-optimize $optimize `
		-keep     $keepIntermediateFiles

	$naturalExit = $true
}
finally {
	# in case of ^C.

	if ($canSetCursorVisibility) {
		[Console]::CursorVisible = $startingCursorVisibility
	}

	if (-not $naturalExit -and $logging -ne "none") {
		write-host "`n`e[1;31maborting svg inversion"
		exit 1
	}
}

exit 0
