# $env:stexpdffile = "%project-root%/PowerShell/global/stexpdf.ps1"
# iex $env:stexpdffile
# then the function is defined.

function global:stexpdf { # smaller tex pdf compiler
    param ( $fname = $null )
    if ($fname -eq $null) {
        $fname = (pwd).path
        $fname = $fname.substring($fname.lastIndexOf("\") + 1)
    }
    gps | ? name -eq Acrobat | spps
    pdflatex -quiet "./$fname.tex"
    pdflatex -quiet "./$fname.tex" # so references work
    rm "./$fname.aux", "./$fname.log"
    if (test-path "./texput.log") { rm "./texput.log" }
    iex "./$fname.pdf"
    return $null
}
