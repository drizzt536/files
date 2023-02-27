# $env:stexpdffile = "%project-root%/PowerShell/global/stexpdf.ps1"
# iex $env:stexpdffile
# then the function is defined.

function global:stexpdf { # smaller tex pdf compiler
    param ( $fname = $null )
    if ($fname -eq $null) {
        $fname = (pwd).path
        $fname = $fname.substring($fname.lastIndexOf("\") + 1)
    }
    ps | ? name -eq Acrobat | spps
    sleep 1
    if (test-path "./$fname.pdf") { rm "./$fname.pdf" }
    pdflatex -quiet "./$fname.tex"
    pdflatex -quiet "./$fname.tex" # so references work
    if (test-path "./$fname.log") { rm "./$fname.log" }
    if (test-path "./$fname.aux") { rm "./$fname.aux" }
    if (test-path "./$fname.toc") { rm "./$fname.toc" }
    if (test-path "./$fname.out") { rm "./$fname.out" }
    if (test-path "./texput.log") { rm "./texput.log" }
    try { iex "./$fname.pdf" } catch {
        write-host "pdf not created"
        throw Error
    }
    return $null
}
