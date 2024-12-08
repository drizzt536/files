# convert the SVGs to PDF for inclusion in LaTeX PDFs.

if (!(gcm inkscape -type app -ErrorAction silent)) {
    throw "inkscape is not installed, and is required for converting SVG to PDF"
}

ls ./svg | % name | % {
    $cmd = "inkscape ./svg/$_ --export-type=pdf --export-filename=./pdf/$($_ -replace ".svg", ".pdf")"
    write-host $cmd
    iex $cmd
}
