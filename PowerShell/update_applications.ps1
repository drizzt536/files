Write-Host "upgrading chocolatey packages"
choco upgrade all --confirm

Write-Host "upgrading winget packages"
winget install --all



############ upgrade python ############
${python current version} = (python.exe --version) -replace "^Python\s+", ""
${python current version} -match "^(\d+)\.(\d+)\.(\d+)$"
${python current major build} = $Matches[1]
${python current minor build} = $Matches[2]

If ( (winget search --source winget --name "Python $(${python current major build} + 1)") -ne 'No package found matching input criteria.' ) {
    Write-Host -ForegroundColor Yellow "Python $(1 + ${python current major build}) is released"
}
If ( (winget search --source winget --name "Python ${python current major build}.$(1+[int32]${python current minor build})") -ne 'No package found matching input criteria.' ) {
    Write-Host -ForegroundColor Yellow "Python ${python current major build}.$(1 + ${python current minor build}) is released"
}
(winget search --source winget --name "Python ${python current major build}.${python current minor build}")[-1] -match "(\d+\.\d+\.\d+)\s*$"
If ($Matches[1] -ne ${python current version}) {
    Write-Host -ForegroundColor Yellow "Python $($Matches[1]) is released"
}



############ upgrade python modules ############
python.exe -m pip install --upgrade pip # pip isn't in pip freeze

python.exe -m pip freeze | # list of packages
    %{$_ -replace "^=.+", ""} | # just the name
    %{python.exe -m pip install --upgrade $_}



############ upgrade nodejs ############
${most recent nodejs version} = (nvm list available).Split("`n")[3]`
    -replace "^\|\s+", ""`
    -replace "\s.+", ""

${nodejs active version} = (nvm list | ?{ $_.indexOf("*") -ne -1 })`
    -replace "^\s+\*\s+", ""`
    -replace "\s+\(.+$", ""

If (${most recent nodejs version} -ne ${nodejs active version}) {
    nvm install ${most recent nodejs version}
    nvm use ${most recent nodejs version}
    nvm uninstall ${nodejs active version}

    (new-object -c shell.application).
        Namespace("$env:ProgramFiles\nodejs").
        ParseName("node.exe").InvokeVerb("open")
    ## user should switch which version of node is pinned to the taskbar
}



############ upgrade global npm packages ############
npm outdated --global
npm update --global
