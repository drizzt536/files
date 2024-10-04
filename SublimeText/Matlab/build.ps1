# move to `%AppData%/Sublime Text/Packages/Matlab/build.ps1` or equivalent.

<#
.synopsis
	inverts the colors of "published" MatLab exports.

	requirements by format (other than MatLab and PowerShell):
		DOC/DOCX:
			- `invert-doc.ps1` and dependencies
		HTML:
			- none
		LaTeX:
			- `invert-eps.ps1` and dependencies
		PDF:
			- `invert-pdf.ps1` and dependencies
		PPT/PPTX:
			- N/A (inversion not implemented)
			- will probably use PowerPoint when/if implemented.
		XML:
			- none

	Only PDF and HTML keep a copy of the light mode versions. This is
	because the other formats keep the images separately from the main
	file, and it would clutter the directory too much to keep two copies
	of every image. Technically HTML also does this, but there is an easy
	workaround to not have to store both versions of very image.
	And for DOC/DOCX I didn't feel like making it do that.
	Who uses Microsoft Word anyway?

	built for Sublime Text, but does not require it.
#>
param (
	# infile includes extension. assumes it is in the working directory.
	[Alias("inputfile")] [string] $infile = "",
	[ValidateSet("doc", "docx", "html", "latex", "pdf", "ppt", "pptx", "xml")] [string] $format = "pdf",

	[Alias("DOCTool", "DOCXTool")] [string] ${invert-doc.ps1} = "$($MyInvocation.MyCommand.Source)/../invertlib/invert-doc.ps1",
	[Alias("EPSTool")]             [string] ${invert-eps.ps1} = "$($MyInvocation.MyCommand.Source)/../invertlib/invert-eps.ps1",
	[Alias("PDFTool")]             [string] ${invert-pdf.ps1} = "$($MyInvocation.MyCommand.Source)/../invertlib/invert-pdf.ps1",
	[Alias("SVGTool")]             [string] ${invert-svg.ps1} = "$($MyInvocation.MyCommand.Source)/../invertlib/invert-svg.ps1",

	[switch] $keepLightMode,
	[switch] $silent,
	[switch] $version,
	[switch] $open
)

$verbose_ = -not $silent.isPresent

# TODO: on all the subprograms, cd into the directory with the input file.
	# so all the temporary files will be in that directory.

function version {
	write-host "Inverted-Color Buildsystem for Matlab (ICBM) v1.3"
}

if ($version.isPresent) {
	version
	exit 0
}

if ($infile -eq "") { throw "input file was not provided." }

if (-not (gcm matlab -type app -ErrorAct silent)) {
	throw "Required program ``matlab`` was not found."
}

[IO.Directory]::SetCurrentDirectory((pwd))
$basename = [IO.Path]::GetFileNameWithoutExtension($infile)

if ($format -in "docx", "pptx") {
	# MatLab doesn't actually support docx or pptx.
	# even though doc and ppt were deprecated in 2007.

	# MatLab will create a doc/ppt, and then I will
	# have to update it to docx/pptx myself.
	$format = $format.substring(0, 3)
	$updateFileType = $true
}
else {
	$updateFileType = $false
}

$outext = $format -eq 'latex' ?
	'tex' :
	$format.toLower()

$outfile = "$basename.$outext"

if ($verbose_) { version }

$matlabCmd = "publish('./$infile', 'format', '$format', 'outputDir', './tmp/');"
$matlabCmd = $verbose_ ? @"
disp('building ""./$outfile"" from ""./$infile""');
ofile = $matlabCmd
fprintf('\noutput file == "%s"\nexiting matlab\n', ofile);
"@ : $matlabCmd

if ($verbose_) {
	$startTime = [DateTime]::Now
	write-host "starting matlab"
	matlab -batch $matlabCmd 2>&1 | %{
		$_.length ? " `t$_" : ""
	} | tee -var matlabOutput
	$elapsedTime = ([DateTime]::Now - $startTime).totalSeconds
	write-host "`tFinished in $([math]::round($elapsedTime , 1))s"
}
else {
	matlab -batch $matlabCmd *> $null
}

if ($lastExitCode -ne 0) {
	if ($verbose_) { write-host "matlab encountered a fatal error. exit code $lastExitCode. exiting" }
	# since matlab failed, there shouldn't be anything in the tmp directory,
	# but in case there is, don't recurse, and suppress error messages.

	rm tmp 2> $null
	exit $lastExitCode
}

if (-not $keepLightMode) {
	switch ($format) {
		"doc" {
			if (-not (gcm ${invert-doc.ps1} -type externalScript -ErrorAct silent)) {
				throw "Required program ``invert-doc.ps1`` was not found.`nlooking at ``${invert-doc.ps1}``."
			}

			if ($updateFileType) {
				$outfile += "x" # .doc -> .docx
			}

			& ${invert-doc.ps1}              `
				-infile  ./tmp/$basename.doc `
				-outfile ./tmp/$outfile      `
				-PDFTool ${invert-pdf.ps1}   `
				-SVGTool ${invert-svg.ps1}   `
				-quiet   $(-not $verbose_)

			move ./tmp/$outfile $outfile
		}
		"html" {
			move ./tmp/* .
			$content = cat $outfile -raw
			move ./$outfile ./$basename-light.html

			$reader = [IO.StreamReader]::new("./$basename-light.html")
			$writer = [IO.StreamWriter]::new("./$outfile")

			try {
				while (($line = $reader.readline()) -ne $null) {
					$i = $line.indexOf("<body")

					if ($i -ne -1) {
						$writer.writeline(
							$line.insert(
								$i + "<body".length,
								' style="background-color: black; filter: invert(100%);"'
							)
						)
						# we don't need to check for the body tag anymore
						break;
					}

					$writer.writeline($line)
				}

				while (($line = $reader.readline()) -ne $null) {
					$writer.writeline($line)
				}
			} finally {
				$reader.close()
				$writer.close()
			}
		}
		"latex" {
			<#
			this does not work for arbitrary LaTeX documents, it only works
			for the subset of documents that MatLab outputs, and hopefully
			it even works with all of those.

			process:
				1. invert the colors of the eps files.
					1.1. convert EPS to PDF (gs)
					1.2. convert PDF to SVG (pdftocairo)
					1.3. invert SVG colors (invert-svg.ps1)
					1.4. convert SVG to EPS (cairosvg)
				2. add `\pagecolor{black}\color{white}` before the `\begin{document}`.
				3. replace all instances of `\color{black}` with `\color{white}`
					- make sure they aren't part of a `verbatim` block.
					- it seems like it only ever gets used right after a verbatim block.
			#>
			cd tmp

			$gs   = (gcm gs       -type app -errorAct silent)?.name
			$gs ??= (gcm gswin64c -type app -errorAct silent)?.name
			$gs ??= (gcm gswin32c -type app -errorAct silent)?.name

			if ($gs -eq $null) {
				throw "Required program GhostScript ``gs / gswin64c / gswin32c`` was not found."
			}
			if (-not (gcm pdftocairo -type app -ErrorAct silent)) {
				throw "Required program (Poppler) ``pdftocairo`` was not found."
			}
			if (-not (gcm ${invert-eps.ps1} -type externalScript -ErrorAct silent)) {
				throw "Required program ``invert-eps.ps1`` was not found.`nlooking at ``${invert-eps.ps1}``."
			}
			if (-not (gcm cairosvg -type app -ErrorAct silent)) {
				# assume that GTK2/3 is installed and properly setup for CairoSVG.
				throw "Required program ``cairosvg`` was not found."
			}

			# step 1
			ls *.eps | % name | % {
				& ${invert-eps.ps1}            `
					-infile  $_                `
					-quiet   $(-not $verbose_) `
					-svgTool ${invert-svg.ps1}
			}


			$texFile = ls *.tex | % name

			$LaTeXContent = cat $texFile -raw

			# step 2
			$docStartIndex = $LaTeXContent.indexOf("\begin{document}")
			$LaTeXContent = $LaTeXContent.insert(
				$docStartIndex,
				"\pagecolor{black}`n\color{white}`n"
			)


			# step 3
			$LaTeXContent = [regex]::replace(
				$LaTeXContent,
				"\\end\{verbatim\}\s*\\color\{black\}",
				"\end{verbatim} \color{white}"
			)

			$LaTeXContent > $texFile

			cd ..
			move -force ./tmp/* .
		}
		"pdf" {
			if (-not (gcm ${invert-pdf.ps1} -type externalScript -ErrorAct silent)) {
				throw "Required program ``invert-pdf.ps1`` was not found.`nlooking at ``${invert-pdf.ps1}``."
			}

			if ($verbose_) { write-host "cleaning temporary files" }

			# in case the previous build process was stopped part-way.
			# sometimes having the files here already can break things.
			# Or maybe that is just because sometimes you change nothing
			# and MatLab will publish to different outputs.
			rm	page-*.tmp.svg, `
				page-*.tmp.pdf, `
				text.tmp.pdf,   `
				out.tmp.pdf,    `
				pdfdata.tmp.txt 2> $null

			& ${invert-pdf.ps1}            `
				-infile  ./tmp/$outfile    `
				-outfile ./$outfile        `
				-indLvl  0                 `
				-indTyp  "`t"              `
				-quiet   $(-not $verbose_) `
				-svgTool ${invert-svg.ps1}

			move -force ./tmp/$outfile ./$basename-light.pdf
		}
		"ppt" {
			# TODO: implement PPT and PPTX
			<#
			For now, the best way to do it is to manually save the
			PPT file as a PDF through PowerPoint, then invoke
			`invert-pdf.ps1` on the PDF, and convert back PPT/PPTX
			from there through PowerPoint.

			I don't actually know if this works, but I'll get there.
			#>
			$format = $updateFileType ? "PPTX" : "PPT"

			if ($verbose_) {
				write-host "dark mode is not implemented for output format ``$format``. proceeding with light mode"

				if ($updateFileType) {
					write-host "PPT to PPTX conversion is not implemented. proceeding with PPT"
				}
			}

			move -force ./tmp/* .
		}
		"xml" {
			# I don't really understand the XML formatting, so I am
			# just going to invert the PNGs, and keep everything
			# else the same. As far as I can tell, the XML file
			# doesn't even have any styling, so it doesn't really
			# make sense to "invert" the XML file's colors.

			ls ./tmp/*.png | % name | % { magick $_ -negate $_ }
			move -force ./tmp/* .
		}
		default {
			throw "unknown file format ``$format``"
		}
	}
}
else {
	# most of the formats other than PDF create multiple files.
	move ./tmp/* .
}

# there should be nothing in it at this point
rmdir tmp -recurse

if ($verbose_ -and $format -eq "pdf" -and -not $keepLightMode -and $matlabOutput.count -gt 4) {
	write-host "`nmatlab encountered non-fatal errors."

	$count = $matlabOutput.count
	# `output file == '...'` and `exiting matlab`.
	$matlabOutput[1..($count - 4)] -join "`n" | write-host
}


if ($open.isPresent) {
	if ($verbose_) { write-host "`nopening `"./$outfile`"" }
	start $outfile
}
elseif ($verbose_) {
	if ($outext -eq "pdf") {
		write-host ""
		write-host original PDF: ./$basename-light.pdf
		write-host darkmode PDF: ./$outfile
	} else {
		write-host output file: ./$outfile
	}
}

exit 0
