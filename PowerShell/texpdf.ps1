<#
.synopsis
    basically pdflatex that also deletes the log files
.description
    basically pdflatex that deletes [filename].aux, [filename].log, and texput.log if it exists, which it will after an error.
.example
    PS C:/> texpdf collatz $true pdflatex C:/Folder/ tex
    runs "pdflatex -quiet C:/Folder/collatz.tex"
    deletes C:/Folder/collatz.log
    deletes C:/Folder/collatz.aux
    deletes C:/Folder/texput.log if it exists
    opens C:/Folder/collatz.pdf with whatever pdf viewer is active as the default
.example
    PS C:/TeX> texpdf texfile $false pdftex ./ tex
    whenever it says "./", it means "C:/TeX/"
    runs "pdftex -quiet ./texfile.tex"
    deletes "./texfile.log" and "./texfile.aux"
    deletes ./texput.log if it exists
    does not open the file because the 2nd parameter was $false
.inputs
    [Parameter(position=0, mandatory=$true )] [string] $filename              ,
    [Parameter(position=1, mandatory=$false)] [ bool ] $openpdf  = $true      ,
    [Parameter(position=2, mandatory=$false)] [string] $compiler = "pdflatex" ,
    [Parameter(position=3, mandatory=$false)] [string] $path     = "./"       ,
    [Parameter(position=4, mandatory=$false)] [string] $filetype = "tex"      ,
.outputs
    always outputs $null unless there is an error that causes powershell to crash or stop execusion
.parameter filename
    * mandatory positional (0) string parameter
    * does not include the path or the file type (ie: .tex)
    * the name of the file to pass to the compiler
.parameter openpdf
    * optional positional (1) boolean parameter that defaults to $true
    if this is truthy, the pdf will be opened with whichever pdf viewer is active as the default
    if it is falsy, the pdf is not opened
.parameter compiler
    * optional positional (2) string parameter that defaults to "pdflatex"
    * file path to the compiler
.parameter path
    * optional positional (3) string parameter that defaults to "./"
    * the only benefit of using the path parameter is if there is texput.log...
    * otherwise, you can just make the path part of the file name parameter
.parameter filetype
    * optional positional (4) string parameter that defaults to "tex"
    * "." + filetype gets tacked on to the end of the file name.
    * filetype, unlike path, cannot just be added to the filename parameter because that will change the files deleted.
.link
    N/A
#>
function global:texpdf {
    [CmdletBinding()]
    param (
        [Parameter(position=0, mandatory=$true )] [string] $filename              ,
        [Parameter(position=1, mandatory=$false)] [ bool ] $openpdf  = $true      ,
        [Parameter(position=2, mandatory=$false)] [string] $compiler = "pdflatex" ,
        [Parameter(position=3, mandatory=$false)] [string] $path     = "./"       ,
        [Parameter(position=4, mandatory=$false)] [string] $filetype = "tex"
    )
    process {
        iex "$compiler -quiet '$path$filename.$filetype'"
        rm "$path$filename.aux", "$path$filename.log"
        if (test-path "${path}texput.log") { rm "${path}texput.log" }
        $openpdf && iex "$path$filename.pdf"
        return $null
    }
}
