
# assemble nasm intel assembly with Lib C to 64 bit windows
function assemble-nasm {
	[CmdletBinding()]
	param (
		[Parameter(Position=0, Mandatory=$true)] [string] $name,
		[Parameter(Position=1, Mandatory=$false)] [string] $extension = "nasm"
	)

	nasm -fwin64 "./$name.$extension" -o "$name.obj"
	gcc "./$name.obj" -o $name
	rm "./$name.obj"

	return invoke-expression "./$name.exe"
}
