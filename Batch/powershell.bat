@echo off

title PowerShell
:cmd
powershell.exe
:: 'pwsh' works with newer versions of powershell.
set /p var=Are You Sure You Want To Exit?
:: if %var% equ yes (goto :EOF
:: ) else goto cmd
if %var% neq yes goto cmd
