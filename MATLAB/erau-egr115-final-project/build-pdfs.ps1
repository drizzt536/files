# convert the SVGs to PDF for inclusion in LaTeX PDFs.

if (!(gcm inkscape -type app -ErrorAction SilentlyContinue)) {
	throw "inkscape is not installed and is required for converting SVG to PDF"
	# there is also rsvg-convert and CairoSVG, but rsvg-convert is less reliable,
	# and CairoSVG doesn't work at all with masks and is incredibly slow and deprecated.
}

ls ./svg | % name | % {
	$cmd = "inkscape ./svg/$_ --export-type=pdf " +
		"--export-filename=./pdf/$($_ -replace ".svg", ".pdf")"

	write-host $cmd
	iex $cmd
}
