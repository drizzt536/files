<#
.synopsis
	Inverts the colors on a PDF document.

	Due to file-type conversion inaccuracy, the output PDF is usually
	~5-8 times the size as the input PDF. If re-inverting a PDF, the
	output will be ~1-3 times the size of the input.

	requirements:
		- invert-svg.ps1	used to invert SVG colors
		- pdftocairo		used for PDF TO SVG conversion
		- inkscape			one of two options for converting SVG to PDF
							the other option is CairoSVG
		- cairosvg			also install gtk3 runtime, or gtk2 for 32-bit. can be used in place of inkscape.
		- magick			required for invert-svg.ps1 if the SVGs have embedded raster images.
		- pdftk				used for general PDF manipulation
		- ghostscript		(gs / gswin64c / gswin32c)
							used for PDF optimization.
							at least one of ghostscript and qpdf must exist for `-optimize $true` to work,
							but if both are present, both will be used in series.
		- qpdf				used for PDF optimization
.description
	process:
		1. convert PDF to SVGs
		2. invert SVGs
		3. convert SVGs to PDFs
		4. combine PDFs into one PDF
		5. copy over text layer from the original PDF
		6. copy over bookmarks and stuff from the original PDF
.parameter infile
	The input file to invert the colors of. should be a valid PDF.
.parameter outfile
	The output file. Leave blank for an in-place inversion.
	if the name starts with `tmp-`, it might cause issues.
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
		- tmp-%d.ext (PNG/JPG/WEBP) files for SVG embedded raster images.
		- page-%d.tmp.svg
		- page-%d.tmp.pdf
		- text.tmp.pdf (usually a hardlink or symlink unless both are unsupported)
		- out.tmp.pdf
		- pdfdata.tmp.txt
		- $optimizedInput ($infile -replace ".pdf", "opt.tmp.pdf") (sometimes)
.parameter optimize
	optimizes the input PDF before inversion and the output PDF after inversion.
	optimizes intermediate SVGs as well.
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

if (!(gcm pdftocairo -type app -ea ignore)) {
	throw "Required program (Poppler) ``pdftocairo`` was not found."
}
if (!(gcm ${invert-svg.ps1} -type externalScript -ea ignore)) {
	throw "Required program ``invert-svg.ps1`` was not found.`nlooking at ``${invert-svg.ps1}``."
}
if (!(gcm pdftk -type app -ea ignore)) {
	throw "Required program ``pdftk`` was not found."
}
if (!(gcm inkscape -type app -ea ignore) -and !(gcm cairosvg -type app -ea ignore)) {
	throw "One of ``inkscape`` or ``cairosvg`` is required and neither was found."
}

$indent     = $indTyp * $indLvl
${indent+1} = $indent + $indTyp*1
${indent+2} = $indent + $indTyp*2

$gs   = (gcm -type app -ea ignore gs      )?.name
$gs ??= (gcm -type app -ea ignore gswin64c)?.name
$gs ??= (gcm -type app -ea ignore gswin32c)?.name

try {
	$logging = $logging.toLower()

	$canSetCursorVisibility = $logging -cne "none"
	$naturalExit = $false

	if ($logging -cne "none") {
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

	$totalSteps = 6 + 2*$optimize
	$step = 1

	if ($optimize) {
		if ($logging -cne "none") {
			write-host "${indent}optimizing input PDF (step $step/$totalSteps)"
		}
		# NOTE: I tried a bunch of combinations of gs, qpdf, and mutool, and this gives the
		#       best output size I found that only uses two of the three programs.

		# ghostscript isn't guaranteed to have the output be smaller than the input,
		# but it usually is since it removes a lot of metadata that it doesn't understand.

		$optimizedInput = [IO.Path]::ChangeExtension($infile, "opt.tmp.pdf")

		# NOTE: this file is never kept, even with `-keepIntermediate $true` because I decided.
		$optimizedTmpFile = "gs-opt.tmp.pdf"

		if ($gs -eq $null -and -not (gcm -type app -ea ignore qpdf)) {
			throw "GhostScript and/or qpdf are required for optimization and neither was found."
		}

		if ($gs -ne $null) {
			if ($logging -ceq "verbose") {
				write-host "${indent+1}ghostscript optimizing"
			}

			# NOTE: -dDetectDuplicateImages is on by default
			& $gs -dNOPAUSE -dQUIET -dBATCH -sDEVICE=pdfwrite -dDetectDuplicateImages `
				"-dCompatibilityLevel=1.7" -dConvertCMYKImagesToRGB `
				"-sOutputFile=$optimizedTmpFile" $infile
		}
		else {
			if ($logging -cne "none") {
				write-host "`e[1;33m${indent+1}WARNING: GhostScript was not found"
			}
			copy-item $infile $optimizedTmpFile
		}

		if (gcm -type app -ea ignore qpdf) {
			if ($logging -ceq "verbose") {
				write-host "${indent+1}qpdf optimizing"
			}

			# NOTE: some of these argumetns aren't required.
			qpdf $optimizedTmpFile --force-version=1.7 --coalesce-contents `
				--remove-unreferenced-resources=yes --object-streams=generate `
				--compress-streams=y --stream-data=compress --recompress-flate `
				--compression-level=9 $optimizedInput

			rm $optimizedTmpFile
		}
		else {
			if ($logging -cne "none") {
				write-host "`e[1;33m${indent+1}WARNING: qpdf was not found"
			}
			move-item $optimizedTmpFile $optimizedInput
		}

		if ($outfile -eq $infile) {
			remove-item $infile
			move-item $optimizedInput $infile
			$optimizedInput = $infile
		}

		$step++
	}
	else {
		# no optimization.
		$optimizedInput = $infile
	}

	# from now on, assume $optimizedInput is the input file.
	# it is only different if `$optimize -and $infile -ne $outfile` is true.

	pdftk $optimizedInput dump_data output pdfdata.tmp.txt *> $null

	$pdfDataLines = [Collections.ArrayList] (cat pdfdata.tmp.txt)
	$line = 0
	$lineNos = $pdfDataLines | foreach {
		if ($_ -match "InfoKey: (Producer|Creator)") { $line - 1 }
		$line++
	} | sort -descending | foreach {
		$pdfDataLines.removeAt($_) # InfoBegin
		$pdfDataLines.removeAt($_) # InfoKey: Producer
		$pdfDataLines.removeAt($_) # GPL Ghostscript 10.05.1
	}

	$pdfDataLines > pdfdata.tmp.txt

	[uint32] $pages = ($pdfDataLines | sls NumberOfPages) -split " " | select -last 1

	if ($logging -cne "none") { write-host "${indent}converting PDF pages to SVG with $dpi dpi (step $step/$totalSteps)" }
	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -ceq "overwrite") {
			write-host "`r${indent+1}converting page $i/$pages" -noNewline
		}
		elseif ($logging -cne "none") {
			write-host "${indent+1}converting page $i/$pages"
		}

		pdftocairo -svg -r $dpi -f $i -l $i $optimizedInput page-$i.tmp.svg *> $null
	}
	$step++

	$elapsedTime =  [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -ceq "overwrite") {
		write-host $(
			"`r`e[0K${indent+1}done. Finished $pages page$($pages -eq 1 ? '' : 's') in ${elapsedTime}s`n" +
			"${indent}inverting SVG colors (step $step/$totalSteps)"
		)
	}
	elseif ($logging -cne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
		write-host "${indent}inverting SVG colors (step $step/$totalSteps)"
	}

	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -cne "none") { write-host "${indent+1}page $i/$pages" }

		& ${invert-svg.ps1}           `
			-infile   page-$i.tmp.svg `
			-outfile  page-$i.tmp.svg `
			-indLvl   $($indlvl+2)    `
			-indTyp   $indTyp         `
			-logging  $logging        `
			-bgcolor  "#fff"          `
			-optimize $optimize       `
			-keep     $keepIntermediateFiles
	}

	$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -cne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
	}

	if ($optimizedInput -eq $outfile) {
		# either $infile -eq $outfile, or you did `-outfile "./[INFILE NAME].opt.tmp.pdf"
		move-item $optimizedInput text.tmp.pdf
	}
	else {
		try {
			# keep the old file, but get a hardlink to the same file data.
			[void] (new-item text.tmp.pdf -target $optimizedInput -type hardlink)
		} catch {
			# try a symlink next
			try {
				[void] (new-item text.tmp.pdf -target $optimizedInput -type symboliclink)
			} catch {
				# hardlinks/symlinks are not available on the given drive, so just copy it instead.
				copy-item text.tmp.pdf $optimizedInput
			}
		}
	}
	$step++

	if ($logging -cne "none") { write-host "${indent}converting SVG pages to PDF (step $step/$totalSteps)" }
	$startTime = [DateTime]::Now
	for ($i = 1; $i -le $pages; $i++) {
		if ($logging -ceq "overwrite") {
			write-host "`r${indent+1}converting page $i/$pages" -noNewline
		}
		elseif ($logging -cne "none") {
			write-host "${indent+1}converting page $i/$pages"
		}

		if (gcm inkscape -type app -ea ignore) {
			inkscape page-$i.tmp.svg --export-type pdf *> $null
		}
		else { # elseif isn't required since it checks for existence of one of them before.
			# assume that GTK2/3 is installed and properly set up.
			cairosvg page-$i.tmp.svg -o page-$i.tmp.pdf *> $null
		}
	}
	$step++

	$elapsedTime = [math]::round(([DateTime]::Now - $startTime).totalSeconds, 1)
	if ($logging -ceq "overwrite") {
		write-host $(
			"`r`e[0K${indent+1}done. Finished $pages page$($pages -eq 1 ? '' : 's') in ${elapsedTime}s`n" +
			"${indent}combining PDF pages (step $step/$totalSteps)"
		)
	}
	elseif ($logging -cne "none") {
		write-host "${indent+1}Finished in ${elapsedTime}s"
		write-host "${indent}combining PDF pages (step $step/$totalSteps)"
	}
	pdftk page-*.tmp.pdf cat output $outfile *> $null
	$step++

	if ($logging -cne "none") { write-host "${indent}restoring PDF text layer (step $step/$totalSteps)" }
	pdftk $outfile multibackground text.tmp.pdf output out.tmp.pdf *> $null
	$step++

	if ($logging -cne "none") { write-host "${indent}restoring PDF bookmarks (step $step/$totalSteps)" }
	pdftk out.tmp.pdf update_info pdfdata.tmp.txt output $outfile *> $null
	$step++

	if ($optimize) {
		if ($logging -cne "none") {
			write-host "${indent}optimizing output PDF (step $step/$totalSteps)"
		}
		# NOTE: this is basically the same code as for optimizing the input code.
		#       except it isn't long enough or close enough to warrant making it
		#       a function since it is only ever used twice.

		# don't check for existence again because we already checked before if one exists.
		# technically, they could have been uninstalled while the script was running, but
		# if that is the case, that is your fault and I don't care.

		$optimizedTmpFile = "gs-opt.tmp.pdf"

		if ($gs -ne $null) {
			if ($logging -ceq "verbose") {
				write-host "${indent+1}ghostscript optimizing"
			}

			# NOTE: -dDetectDuplicateImages is on by default
			& $gs -dNOPAUSE -dQUIET -dBATCH -sDEVICE=pdfwrite -dDetectDuplicateImages `
				"-dCompatibilityLevel=1.7" -dConvertCMYKImagesToRGB `
				"-sOutputFile=$optimizedTmpFile" $outfile

			remove-item $outfile
		}
		else {
			if ($logging -cne "none") {
				write-host "`e[1;33m${indent+1}WARNING: GhostScript was not found"
			}

			move-item $outfile $optimizedTmpFile
		}

		if (gcm -type app -ea ignore qpdf) {
			if ($logging -ceq "verbose") {
				write-host "${indent+1}qpdf optimizing"
			}

			# NOTE: some of these argumetns aren't required.
			qpdf $optimizedTmpFile --force-version=1.7 --coalesce-contents `
				--remove-unreferenced-resources=yes --object-streams=generate `
				--compress-streams=y --stream-data=compress --recompress-flate `
				--compression-level=9 $outfile

			rm $optimizedTmpFile
		}
		else {
			if ($logging -cne "none") {
				write-host "`e[1;33m${indent+1}WARNING: qpdf was not found"
			}

			move-item $optimizedTmpFile $outfile
		}

		$step++
	}

	if (!$keepIntermediateFiles) {
		if ($logging -cne "none") { write-host "${indent}cleaning temporary files" }

		rm	page-*.tmp.svg, `
			page-*.tmp.pdf, `
			text.tmp.pdf,   `
			out.tmp.pdf,    `
			pdfdata.tmp.txt 2> $null

		if ($optimizedInput -ne $infile -and $optimizedInput -ne $outfile) {
			# if $optimizedInput -eq $outfile, it won't be there.
			rm $optimizedInput 2> $null
		}
	}

	if ($logging -cne "none") { write-host "${indent}done" }

	$naturalExit = $true
}
finally {
	# in case of ^C.

	if (-not $naturalExit -and $logging -cne "none") {
		write-host "`n`e[1;31maborting pdf inversion"
	}

	if ($canSetCursorVisibility) {
		[Console]::CursorVisible = $startingCursorVisibility
	}
}

exit 0
