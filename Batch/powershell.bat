@echo off
title powershell
:cmd
powershell
:: 'pwsh' works with newer versions of powershell.
set/p var=Are You Sure You Want To Exit?
if %var%==yes (goto :EOF) else (goto cmd)
:: if (%var%) neq (yes) (goto cmd)
