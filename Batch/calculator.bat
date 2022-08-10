@echo off
title integer calculator
:start
set /p math= Equation? 
set /a result= %math%
echo %math% = %result%
echo.
pause
cls
goto start
