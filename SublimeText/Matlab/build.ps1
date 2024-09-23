# move to `%AppData%/Sublime Text/Packages/Matlab/build.ps1` or equivalent.

<#
.synopsis
	inverts the colors of "published" MatLab exports.
	currently only implemented for PDF and HTML formats.

	requirements by format:
		everything:
			- matlab
		PDF:
			- everything `invert-pdf.ps1` requires
		others:
			- nothing


	built for Sublime Text, but does not require it.
#>

param (
	# infile includes extension. assumes it is in the working directory.
	[Alias("inputfile")] [string] $infile = "",
	[ValidateSet("html", "doc", "latex", "ppt", "xml", "pdf")]
		[string] $format = "pdf",
	[Alias("PDFTool")] [string] ${invert-pdf.ps1} =
		"$($MyInvocation.MyCommand.Source)/../invert-pdf.ps1",
	[Alias("SVGTool")] [string] ${invert-svg.ps1} =
		"$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	[string] $invertPDF = "$($MyInvocation.MyCommand.Source)/../invert-svg.ps1",
	[switch] $keepLightMode,
	[switch] $silent,
	[switch] $version,
	[switch] $open
)

function version {
	write-host "Inverted-Color Buildsystem for Matlab (ICBM) v1.1"
}

if ($version.isPresent) {
	version
	exit 0
}

if ($infile -eq "") {
	throw "input file was not provided."
}

if (-not (get-command matlab -type app -ErrorAct silent)) {
	throw "Required program ``matlab`` was not found."
}
if (-not (get-command ${invert-pdf.ps1} -type externalScript -ErrorAct silent)) {
	throw "Required program ``invert-pdf.ps1`` was not found.`nlooking at ``${invert-pdf.ps1}``."
}

[IO.Directory]::SetCurrentDirectory((pwd))
$basename = [IO.Path]::GetFileNameWithoutExtension($infile)

$outext = $format -eq 'latex' ? 'tex' : $format

$outfile = "$basename.$outext"

$verbose_ = -not $silent.isPresent

if ($verbose_) { version }

# in case the previous build was stopped mid way through
if ($verbose_) { write-host "cleaning temporary files" }
rm	page-*.tmp.svg, `
	page-*.tmp.pdf, `
	text.tmp.pdf,   `
	out.tmp.pdf,    `
	pdfdata.tmp.txt 2> $null

$matlabCmd = "publish('./$infile', 'format', '$format', 'outputDir', './tmp/');"
$matlabCmd = $verbose_ ? @"
disp('building "./$outfile"');
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
	if ($verbose_) { write-host "matlab encountered a fatal error. exit code $lastExitCode. exiting"
	# since matlab failed, there shouldn't be anything in the tmp directory,
	# but in case there is, don't recurse, and suppress error messages.

	rm tmp 2> $null
	exit $lastExitCode
}

if (-not $keepLightMode) {
	switch ($format) {
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
		"pdf" {
			& ${invert-pdf.ps1}            `
				-infile ./tmp/$outfile     `
				-outfile ./$outfile        `
				-svgTool ${invert-svg.ps1} `
				-boolSilent $(-not $verbose_)

			move -force ./tmp/$outfile ./$basename-light.pdf
		}
		default {
			if ($verbose_) {
				write-host "dark mode is not implemented for output format ``$format``."
				# TODO: implement these
				# I don't care enough to figure out how, because I don't use them.
				# I know how to make a LaTeX file dark mode, but I don't want to do it.
			}

			move -force ./tmp/* .
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
	# for some reason, the line with `^^^^^^` will be after the lines with
	# `output file == '...'` and `exiting matlab`.
	$matlabOutput[1..($count - 5) + ($count - 1)] -join "`n" | write-host
}


if ($open.isPresent) {
	if ($verbose_) { write-host "`nopening `"./$outfile`"" }
	start $outfile
}
elseif ($verbose_) {
	if ($outext -eq "pdf") {
		write-host ""
		write-host original PDF: `"./$basename-light.pdf`"
		write-host darkmode PDF: `"./$outfile`"
	} else {
		write-host output file: `"./$outfile`"
	}
}

exit 0
