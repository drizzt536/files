$data = curl -sf "https://nasm.us/pub/nasm/releasebuilds/"

if ($lastExitCode -ne 0) {
	write-host "`e[31mcurl encountered an error. exit code $lastExitCode"
	exit $lastExitCode # propogate the error code through
}

$releases = $data | % {
	$match = [regex]::match($_, "<a href=`"([^`"]+)/`">\1/</a>")

	if ($match.success) {
		$match.groups[1].value
	}
	# don't output anything if the match fails.
}

# NOTE: the versions are already in descending order.
$latest = $releases | where { !$_.contains("rc") } | select -index 0

# example: @("NASM", "version", "3.01", "compiled", "on", "Oct", "10", "2025")[2]
$current = (gcm -type app -ea ignore nasm) ?
	(-split (nasm --version) | select -index 2) :
	"none"

# NOTE: The spaces around $latest are so it doesn't match stuff like 3.01-20251011, which is older than 3.01

write-host $(
	$current -eq "none"  ? "NASM couldn't be found. latest version is $latest." :
	$current -eq $latest ? "NASM is up to date. version is $latest." :
	"NASM is outdated. latest version is $latest. current is $current."
)

exit 0
