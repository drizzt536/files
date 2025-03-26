
# this script may or may not actually work consistently

# NOTE: only supports TeX mode.

if (-not (gcm ./perftest-bufsize.ps1 -type ExternalScript -ea ignore)) {
	throw "``./perftest-bufsize.ps1`` could not be found and is required for this program."
}

# number of bytes to process per loop iteration.
$unroll_factors = @(
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	16,
	32
)

if ($args[0] -eq "--help") {
	# print each section separately.
	# so `(./perftest-bufsize.ps1 --help 6>&1)[$n]` gives the nth section and not the nth line.
	write-host $(
		"test ./adler32 using different .BSS section buffer sizes and unroll factors`n" +
		"using a randomly-generated 128 MiB file as the input.`n"
	)

	write-host $(
		"Options:`n" +
		"    --trials N         specify the number of trials to run per buffer size, unroll factor pair`n" +
		"    --unroll N         specify a specific unroll factor to test.`n" +
		"    --user             print out all the user times instead of real times`n" +
		"    --system, --sys    print out all the system times instead of real times`n"
	)

	write-host $(
		"at the end, it recompiles the binary with default buffer size and unroll factor.`n" +
		"the results are always printed out in TeX format.`n" +
		"If you exit with ^C, it still recompiles with the default, but it doesn't print the results."
	)

	exit 0
}

$i = $args.indexOf("--trials")
if ($i -ne $null) {
	$NUM_TRIALS = [uint32] $args[$i + 1]
}

$i = $args.indexOf("--unroll")
if ($i -ne $null) {
	$unroll = @([uint32] $args[$i + 1])
}

if ($args -ccontains "--real") {
	write-host "using real times"
	$mode_index = 0 # real
}
elseif ($args -ccontains "--user") {
	write-host "using user times"
	$mode_index = 1 # user
}
elseif ($args -ccontains "--system" -or $args -ccontains "--sys") {
	write-host "using system times"
	$mode_index = 2 # system
}
else {
	write-host "using real times"
	$mode_index = 0 # default to real
}
$output = @()

foreach ($unroll in $unroll_factors) {
	# NOTE: `./perftest-bufsize.ps1` prints everything as one string.

	$results = $NUM_TRIALS -eq $null ?
		(./perftest-bufsize.ps1 --tex-only --unroll $unroll) : # use the default
		(./perftest-bufsize.ps1 --tex-only --unroll $unroll --trials $NUM_TRIALS)

	$results = $results -split "`n"

	if ($output.count -eq 0) {
		$output += @($results[3] + "`n")
	}

	$line = $results[$mode_index] + "`n"

	$line = "Y_{$($line[2])$unroll}$($line.substring(3))"
	# change it from Y_S to something like Y_{S4}
	$output += @($line)

	write-host "" # space out the printouts for each unroll factor.
}

write-output $output
