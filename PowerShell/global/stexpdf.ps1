# add $env:stexpdffile = "%project-root%/PowerShell/global/stexpdf.ps1"
# iex $env:stexpdffile
# then the function is defined.
function global:stexpdf { # smaller tex pdf compiler
    param ( $fname )
    gps | ? name -eq Acrobat | spps
    pdflatex -quiet "./$fname.tex"
    rm "./$fname.aux", "./$fname.log"
    if (test-path "./texput.log") { rm "./texput.log" }
    iex "./$fname.pdf"
}
