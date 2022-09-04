@echo off
title powershell
:cmd
powershell
:: 'pwsh' works with newer versions of powershell.
set/p var=Are You Sure You Want To Exit?
if %var%==yes (goto end) else (goto cmd)
:end
