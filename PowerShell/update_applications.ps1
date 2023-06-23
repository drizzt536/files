## Administrator is required for a portion of these updates
Write-Host "upgrading chocolatey packages"
choco upgrade all --confirm

Write-Host "upgrading winget packages"
winget install --all



############ upgrade python ############
${python current version} = (python.exe --version) -replace "^Python\s+", ""
${python current version} -match "^(\d+)\.(\d+)\.(\d+)$"
${python current major build} = [int32] $Matches[1]
${python current minor build} = [int32] $Matches[2]
# ${python current bugfix}    = [int32] $Matches[3] # not needed

If ( (winget search --source winget --name "Python $(1 + ${python current major build})") -ne 'No package found matching input criteria.' ) {
    Write-Host -ForegroundColor Yellow "Python $(1 + ${python current major build}) is released"
}
If ( (winget search --source winget --name "Python ${python current major build}.$(1 + ${python current minor build})") -ne 'No package found matching input criteria.' ) {
    Write-Host -ForegroundColor Yellow "Python ${python current major build}.$(1 + ${python current minor build}) is released"
}
(winget search --source winget --name "Python ${python current major build}.${python current minor build}")[-1] -match "(\d+\.\d+\.\d+)\s*$"
If ($Matches[1] -ne ${python current version}) {
    Write-Host -ForegroundColor Yellow "Python $($Matches[1]) is released"
}



############ upgrade python modules ############
python.exe -m pip install --upgrade pip # pip isn't in pip freeze

# could break some packages
python.exe -m pip freeze | # list of packages
    %{$_ -replace "^=.+", ""} | # just the name
    %{python.exe -m pip install --upgrade $_}



############ upgrade nodejs ############
${most recent nodejs version} = (
    Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json'`
    -Method GET
)[0].Version # vX.Y.Z

${nodejs current version} = nvm current

If (${most recent nodejs version} -ne ${nodejs current version}) {
    nvm install ${most recent nodejs version}
    nvm use ${most recent nodejs version}
    nvm uninstall ${nodejs current version}

    Start-Process node.exe
    ## user should switch which version of node is pinned to the taskbar
}



############ upgrade global npm packages ############
npm outdated --global
npm update --global
