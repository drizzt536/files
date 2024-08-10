using namespace System.Text.RegularExpressions

<#
.synopsis
    wrapper around `[Regex]::Replace`.
	text | replace.ps1 pattern replacement options
.example
    "asdf", "qwer", "1234" | ./replace "a|12" "x"
    returns "xsdf", "qwer", "x34"
#>
param (
	[Parameter(Position=0, Mandatory=$true)] $pattern,
	[Parameter(Position=1, Mandatory=$false)] [string] $replacement = "",

	# $args holds the options.
	[Parameter(Position=2, ValueFromRemainingArguments=$true)] $args,
	[Parameter(ValueFromPipeline=$true)] $input
)

$options = [RegexOptions]::None

if ($pattern -is [Regex]) {
	$options = $pattern.options
}

$pattern = [string] $pattern

foreach ($option in $args) {
	# The argument can either be the string name for the type,
	# or it can be the type itself.
	if ([RegexOptions]::$option -ne $null) {
		$options = $options -bor [RegexOptions]::$option
	}
	# ignore invalid options.
}

# treats an array of strings as separate things.
# if that isn't what you want, join the strings first.
foreach ($string in $input) {
	[Regex]::Replace($string, $pattern, $replacement, $options)
}
