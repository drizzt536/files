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
if (!(gcm pdftk -type app -ErrorAct silent)) {
	throw "Required program ``pdftk`` was not found."
}

$indent     = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2

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

	pdftk $infile dump_data output pdfdata.tmp.txt *> $null
	[uint32] $pages = (cat pdfdata.tmp.txt | sls NumberOfPages) -split " " | select -last 1

	if ($logging -ne "none") { write-host "${indent}converting PDF pages to SVG with $dpi dpi (step 1/6)" }
	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -eq "overwrite") {
			write-host "`r${indent+1}converting page $i/$pages" -noNewline
		}
		elseif ($logging -ne "none") {
			write-host "${indent+1}converting page $i/$pages"
		}

		pdftocairo -svg -r $dpi -f $i -l $i $infile page-$i.tmp.svg *> $null
	}

	$elapsedTime =  [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -eq "overwrite") {
		write-host $(
			"`r${indent+1}"                                                 +
			" " * "converting page $i/$pages".length                        +
			"`r${indent+1}done. Finished $pages pages in ${elapsedTime}s`n" +
			"${indent}inverting SVG colors (step 2/6)"
		)
	}
	elseif ($logging -ne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
		write-host "${indent}inverting SVG colors (step 2/6)"
	}

	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -ne "none") { write-host "${indent+1}page $i/$pages" }

		& ${invert-svg.ps1}          `
			-infile  page-$i.tmp.svg `
			-outfile page-$i.tmp.svg `
			-indLvl  $($indlvl+2)    `
			-indTyp  $indTyp         `
			-logging $logging        `
			-bgcolor "#fff"          `
			-keepInt $keepIntermediateFiles
	}

	$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -ne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
	}

	if ($infile -eq $outfile) {
		move $infile text.tmp.pdf
	}
	else {
		# keep the old file, but get a hardlink to the same file data.
		new-item text.tmp.pdf -target $infile -type hardlink > $null
	}

	if ($logging -ne "none") { write-host "${indent}converting SVG pages to PDF (step 3/6)" }
	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -eq "overwrite") {
			write-host "`r${indent+1}converting page $i/$pages" -noNewline
		}
		elseif ($logging -ne "none") {
			write-host "${indent+1}converting page $i/$pages"
		}

		cairosvg page-$i.tmp.svg -o page-$i.tmp.pdf *> $null
	}

	$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -eq "overwrite") {
		write-host $(
			"`r${indent+1}"                                                 +
			" " * "converting page $i/$pages".length                        +
			"`r${indent+1}done. Finished $pages pages in ${elapsedTime}s`n" +
			"${indent}combining PDF pages (step 4/6)"
		)
	}
	elseif ($logging -ne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
		write-host "${indent}combining PDF pages (step 4/6)"
	}
	pdftk page-*.tmp.pdf cat output $outfile *> $null

	if ($logging -ne "none") { write-host "${indent}restoring PDF text layer (step 5/6)" }
	pdftk $outfile multibackground text.tmp.pdf output out.tmp.pdf *> $null

	if ($logging -ne "none") { write-host "${indent}restoring PDF bookmarks (step 6/6)" }
	pdftk out.tmp.pdf update_info pdfdata.tmp.txt output $outfile *> $null

	if (!$keepIntermediateFiles) {
		if ($logging -ne "none") { write-host "${indent}cleaning temporary files" }

		rm	page-*.tmp.svg, `
			page-*.tmp.pdf, `
			text.tmp.pdf,   `
			out.tmp.pdf,    `
			pdfdata.tmp.txt 2> $null
	}

	if ($logging -ne "none") { write-host "${indent}done" }
}
finally {
	# in case of ^C.
	if ($canSetCursorVisibility) {
		[Console]::CursorVisible = $startingCursorVisibility
	}
}
exit 0
