<#
.Description
	returns either "dll" or "exe", depending on the type of the executable.
	It does not matter what the file extension is.
	DLLs can be run with rundll32.exe and EXEs can be run directly.
.Parameter FilePath
	the full path to the executable.
	Even if the executable is in PATH, it still has to be the full path to it.
	The path can be relative or absolute, but must be explicit.
.Example
	PS C:/Windows> Get-ExecutableType System32/kernel32.dll
	PS C:/Windows> Get-ExecutableType ./System32/kernel32.dll
	PS C:/Windows> Get-ExecutableType C:/WINDOWS/System32/kernel32.dll
	These all do the same thing: return "dll".
.Example
	correct:
	PS C:/> Get-ExecutableType C:/Windows/System32/notepad.exe

	incorrect:
	PS C:/> Get-ExecutableType notepad.exe

	Get-ExecutableType doesn't look in the path.
	The correct one should return "exe".
#>
Function Global:Get-ExecutableType {
	Param ([Parameter(Position=0, Mandatory=$true)][String] $FilePath)
	
	return (C:/Program` Files/Microsoft` Visual` Studio/2022/Community/VC/Tools/MSVC/14.36.32532/bin/Hostx64/x64/dumpbin.exe
		/HEADERS
		$FilePath
	)[8].Substring(11).ToLower() -replace "cutable image", ""
}
