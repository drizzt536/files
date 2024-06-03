param (
	# TODO: allow no game filter
	[Alias("g")] [string] $game = $null,
	[Alias("o")] [string] $outfile = $null,
	[Alias("h", "?")] [switch] $help
)

$helpText = '
prints out the video file locations captured by NVIDIA ShadowPlay.
prints in javascript array syntax.

usage:
    nvidia-highlights.ps1 [-g] GAME [[-o] FILE]

parameters:
    -o, -outfile    specify the file to place the output into.
                    default is stdout. `-` also specifies stdout.
    -g, -game       specify the game to find highlights from. (required)
    -h, -?, -help   display this message
'

if ($help.isPresent) {
	write-host $helpText
	exit
}

if ($game -eq $null) {
	write-host "``-g GAME`` must be provided"
	exit
}

$dataFile = "$env:LocalAppData/NVIDIA Corporation/NVIDIA Share/Highlights/HighlightTracker.json"

$json = (get-content $dataFile) `
	-replace "\\\\", "/" `
	-replace '"([a-zA-Z]\w*)":', '$1:'

# full directory without game
$videoFolder = [regex]::match(
	# full directory
	[regex]::match(
		# full path
		[regex]::match($json, 'C:/.+?(?=")').value,
		'.+(?=/)'
	).value,
	'.+/'
).value + "$game/"


${cat main.js} = @"
const highlights = ($json)
	.highlights
	.filter(h => h.gameName === "$($game.ToLower())")
	.map(h => ({
		type: h.highlightDefinitionId,
		file: h.path.replace(/.+\//, "")
	}))

, types = Array.from(new Set(
	highlights.map(e => e.type)
))

, strings = types.map(type =>
	``const `${type[0].toLowerCase()}`${type.replace(/ /g, "").slice(1)}Files = [`${highlights
		.filter(e => e.type === type)
		.map(e => ``\n\t"`${e.file}",``).join("")
	}\n];``
);

console.log(
	``const folder = "$videoFolder";\n\n`${strings.join("\n\n")}``
)
"@

$res = node -e ${cat main.js}


if ($outfile -and $outfile -ne "-") {
	$res > $outfile
}
else {
	write-output $res
}
