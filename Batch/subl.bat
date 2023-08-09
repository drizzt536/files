@echo off

if exist "./whereis.exe" ( "./whereis.exe" subl.exe > nul
) else if exist C:/Windows/System32/where.exe ( C:/Windows/System32/where.exe subl.exe > nul
) else ( echo `where.exe` and `whereis.exe` cannot be found.

	subl.exe %*
	if %ErrorLevel% equ 0 (exit 0) else set ErrorLevel=0

	"C:/Program Files/Sublime Text/subl.exe" %*
	if %ErrorLevel% equ 0 (exit 0) else set ErrorLevel=0

	"../Sublime Text/subl.exe" %*
	if %ErrorLevel% equ 0 (exit 0) else set ErrorLevel=0

	"%~d0/ExtF/Files/Sublime Text/subl.exe" %*
	if %ErrorLevel% equ 0 exit 0

	echo `subl.exe` could not be found
	exit 1
)


if %ErrorLevel% equ 0 ( subl.exe %*
) else if exist "C:/Program Files/Sublime Text/subl.exe" ( "C:/Program Files/Sublime Text/subl.exe" %*
) else if exist "../Sublime Text/subl.exe" ( "../Sublime Text/subl.exe" %*
) else if exist "%~d0/ExtF/Files/Sublime Text/subl.exe" ( "%~d0/ExtF/Files/Sublime Text/subl.exe" %*
) else (
	echo subl.exe not found
	exit 2
)
