@echo off
title Integer Calculator
:start
set /p equation= Equation? 
set /a result= %equation%
echo %equation% = %result%
echo:
pause
cls
goto start
