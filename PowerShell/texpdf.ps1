# invoke-ps2exe ./texpdf.ps1 ./texpdf.exe
# move texpdf.exe to a directory in $env:PATH

$FileName = $args[0]
$OpenPDF  = $args[1]
$Compiler = $args[2]

if ($FileName -eq $null) {
	$FileName = (Get-Location).Path
	$FileName = $FileName.Substring($FileName.LastIndexOf("\") + 1)
}

if ($OpenPDF  -eq $null) { $OpenPDF  = $true      }
if ($Compiler -eq $null) { $Compiler = "pdflatex" }

Get-Process | Where-Object name -eq Acrobat | Stop-Process
Start-Sleep 1

if (Test-Path "./$FileName.pdf") { Remove-Item "./$FileName.pdf" }

Invoke-Expression "$Compiler -quiet ./$FileName.tex"
Invoke-Expression "$Compiler -quiet ./$FileName.tex" # again so references work

if (Test-Path "./$FileName.log") { Remove-Item "./$FileName.log" }
if (Test-Path "./$FileName.aux") { Remove-Item "./$FileName.aux" }
if (Test-Path "./$FileName.toc") { Remove-Item "./$FileName.toc" }
if (Test-Path "./$FileName.out") { Remove-Item "./$FileName.out" }
if (Test-Path "./texput.log"   ) { Remove-Item "./texput.log"    }

if ($OpenPDF) {
	try { Invoke-Expression "./$FileName.pdf" }
	catch {
		Write-Host "a pdf was not created."
		throw Error
	}
}
