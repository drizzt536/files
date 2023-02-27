<#
.SYNOPSIS
    basically pdflatex that also deletes the log files and closes adobe acrobat.
.DESCRIPTION
    basically pdflatex that deletes [filename].aux, [filename].log, and texput.log if it exists, which it will after an error. it also closes adobe acrobat if open.
.EXAMPLE
    PS C:/> texpdf collatz $true pdflatex C:/Folder/ tex
    closes adobe acrobat if open
    runs "pdflatex -quiet C:/Folder/collatz.tex"
    deletes C:/Folder/collatz.log
    deletes C:/Folder/collatz.aux
    deletes C:/Folder/texput.log if it exists
    opens C:/Folder/collatz.pdf with whatever pdf viewer is active as the default
.EXAMPLE
    PS C:/TeX> texpdf texfile $false pdftex ./ tex
    whenever it says "./", it means "C:/TeX/"
    closes adobe acrobat if open
    runs "pdftex -quiet ./texfile.tex"
    deletes "./texfile.log" and "./texfile.aux"
    deletes ./texput.log if it exists
    does not open the file because the 2nd parameter was $false
.INPUTS
    [Parameter(position=0, mandatory=$true )] [string] $filename              ,
    [Parameter(position=1, mandatory=$false)] [ bool ] $openpdf  = $true      ,
    [Parameter(position=2, mandatory=$false)] [string] $compiler = "pdflatex" ,
    [Parameter(position=3, mandatory=$false)] [string] $path     = "./"       ,
    [Parameter(position=4, mandatory=$false)] [string] $filetype = "tex"      ,
.OUTPUTS
    always outputs $null unless there is an error that causes powershell to crash or stop execusion
.PARAMETER FILENAME
    * mandatory positional (0) string parameter
    * does not include the path or the file type (ie: .tex)
    * the name of the file to pass to the compiler
.PARAMETER OPENPDF
    * optional positional (1) boolean parameter that defaults to $true
    if this is truthy, the pdf will be opened with whichever pdf viewer is active as the default
    if it is falsy, the pdf is not opened
.PARAMETER COMPILER
    * optional positional (2) string parameter that defaults to "pdflatex"
    * file path to the compiler
.PARAMETER PATH
    * optional positional (3) string parameter that defaults to "./"
    * the only benefit of using the path parameter is if there is texput.log...
    * otherwise, you can just make the path part of the file name parameter
.PARAMETER FILETYPE
    * optional positional (4) string parameter that defaults to "tex"
    * "." + filetype gets tacked on to the end of the file name.
    * filetype, unlike path, cannot just be added to the filename parameter because that will change the files deleted.
.LINK
    N/A
#>
Function Global:Texpdf {
    [CmdletBinding()]
    Param (
        [Parameter(Position=0, Mandatory=$false)] [string] $FileName = $null      ,
        [Parameter(Position=1, Mandatory=$false)] [ bool ] $OpenPDF  = $true      ,
        [Parameter(Position=2, Mandatory=$false)] [string] $Compiler = "pdflatex" ,
        [Parameter(Position=3, Mandatory=$false)] [string] $Path     = "./"       ,
        [Parameter(Position=4, Mandatory=$false)] [string] $FileType = "tex"
    )
    Process {
        if ($FileName -eq $null) {
            $FileName = (Get-Location).Path
            $FileName = $FileName.Substring($FileName.LastIndexOf("\") + 1)
        }
        Get-Process | Where-Object { $_.name -eq "Acrobat" } | Stop-Process

        Invoke-Expression "$Compiler -quiet '$Path$FileName.$FileType'"
        Invoke-Expression "$Compiler -quiet '$Path$FileName.$FileType'" # so references work

        if (Test-Path "${Path}texput.log")  { Remove-Item "${Path}texput.log"  }
        if (Test-Path "$Path$FileName.toc") { Remove-Item "$Path$FileName.toc" }
        if (Test-Path "$Path$FileName.aux") { Remove-Item "$Path$FileName.aux" }
        if (Test-Path "$Path$FileName.log") { Remove-Item "$Path$FileName.log" }

        Try {
            if ($OpenPDF) { Invoke-Expression "$Path$FileName.pdf" }
        }
        Catch {
            Write-Host "pdf was not created"
            throw error
        }
        return $null
    }
}
