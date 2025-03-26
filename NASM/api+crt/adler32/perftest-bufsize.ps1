
# requires MinGW for time.

# you have to analyze the data yourself. but this makes it easier to get the data.


# buffer size. KB -> KiB. MB -> MiB.

$sizes = @(
	"8 B"
	"16 B"
	"32 B"
	"64 B"
	"128 B"
	"256 B"
	"512 B"
	"1 KB",
	"2 KB",
	"4 KB",
	"8 KB",
	"16 KB",
	"32 KB",
	"64 KB",
	"128 KB",
	"256 KB",
	"512 KB",
	"1 MB",
	"2 MB",
	"4 MB"
	# 8 MiB is 2^32 bytes, and I don't know for sure that will work with `uint32_t` values.
	# larger than 8 MiB does not work (probably) because the buffer is assumed to fit in 2^32 (I think).
)

$EXP_MIN = 1
$EXP_MAX = 23

if ($args[0] -eq "--help") {
	# print each section separately.
	# so `(./adler32-perftest-bufsize.ps1 --help 6>&1)[$n]` gives the nth section and not the nth line.
	write-host $(
		"test ./adler32 using different static .BSS section buffer sizes`n" +
		"using a randomly-generated 128 MiB file as the input.`n"
	)

	write-host $(
		"Options:`n" +
		"    --trials N      specify the number of trials to run per buffer size`n" +
		"    --exponent N    specify a specific size to use (2^N). clamped to [1, 23].`n" +
		"    --unroll N      specify a specific unroll factor to use.`n" +
		"                    only that specific size will be used in trials.`n" +
		"    --tex-only      only print out the TeX format output. don't print the header either.`n" +
		"    --plain-only    only print out the plain format output. don't print the header either.`n"
	)

	write-host $(
		"at the end, it recompiles the binary with default buffer size and unroll factor.`n" +
		"the results are printed out in two formats: a human readable format,`n" +
		"and a TeX form. If you exit with ^C, it still recompiles with the default,`n" +
		"but it doesn't print the results. ``--tex-only`` takes precedence over`n" +
		"``--plain-only`` regardless of the order thet are passed."
	)

	exit 0
}

[IO.Directory]::SetCurrentDirectory((pwd))

$infile = "random.bin.tmp"

if (-not (test-path -type leaf $infile) -or (ls $infile | % length) -ne 128MB) {
	write-host "generating 128MiB input file. this might take a minute."
	$data = new-object byte[] 128MB
	(new-object Random).nextBytes($data)

	[IO.File]::WriteAllBytes($infile, $data)
}

$plain_outstr = ""
$tex_outstr   = @("Y_R=\left[", "Y_U=\left[", "Y_S=\left[")


########################### process arguments ###########################
$i = $args.indexOf("--trials")
$NUM_TRIALS = $i -ne -1 ? [uint32] $args[$i + 1] : 8 # 8 trials is the default

$i = $args.indexOf("--exponent")
if ($i -ne -1) {
	$exp = $args[$i + 1] # exponent / size index
	$exp = [math]::clamp($exp, $EXP_MIN, $EXP_MAX)
	$sizes = @($sizes[$exp - 3])
}

$i = $args.indexOf("--unroll")
if ($i -ne -1) {
	$unroll = [uint32] $args[$i + 1]
}

$natural_exit = $false
$version_printed = $false

############################## main code ##############################
try {
	foreach ($size_str in $sizes) {
		$size = $size_str -replace " B?", "" -as [uint32]

		start-sleep -ms 100

		write-host -nonewline "recompiling"
		if ($unroll -eq $null) {
			../../assemble adler32 --infer "-DSCRATCH_BUF_LEN=$size" 1> $null
		}
		else {
			../../assemble adler32 --infer "-DSCRATCH_BUF_LEN=$size" "-DUNROLL_N=$unroll" 1> $null
		}

		write-host -nonewline $("`r" + " " * "recompiling".length + "`r")

		if (-not $version_printed) {
			write-host "performance testing buffer sizes for $(./adler32 --version)"
			if ($unroll -ne $null) {
				write-host "using unroll factor $unroll"
			} else {
				write-host "using default unroll factor (decided by adler32.nasm)"
			}
			$version_printed = $true
		}
		write-host "testing with buffer size: $size_str"

		# write-host "executable size: $(wc -c adler32.exe | awk '{print $1}') bytes"

		if ($lastExitCode -ne 0) {
			# NOTE: this only works with the MinGW printf, and not the MSYS2 printf.
			printf "\e[0m" # reset the console colors in case it didn't reset on its own.
			write-host "an unexpected error occurred while compiling"
			break
		}

		$real = @()
		$user = @()
		$syst = @()

		write-host -nonewline "    running trial "
		foreach ($trial in 1..$NUM_TRIALS) {
			write-host -nonewline "$trial/$NUM_TRIALS"

			# for some reason, `time.exe` prints to stderr.
			# realtime is the highest priority, so it should have the least scheduler variance.
			($process = start-process "time.exe" -args "./adler32 -r random.bin.tmp" `
				-nnw -passthru -rso stdout.log.tmp -rse stderr.log.tmp).priorityClass = "realtime"

			$process.WaitForExit()

			[string[]] $output = cat stderr.log.tmp

			$match = [regex]::match([string] $output[0], "(\d+)\.(\d{2})s")
			$real += @(600*[uint32] $match.groups[1].value + 10*[uint32] $match.groups[2].value)

			$match = [regex]::match([string] $output[1], "(\d+)\.(\d{2})s")
			$user += @(600*[uint32] $match.groups[1].value + 10*[uint32] $match.groups[2].value)

			$match = [regex]::match([string] $output[2], "(\d+)\.(\d{2})s")
			$syst += @(600*[uint32] $match.groups[1].value + 10*[uint32] $match.groups[2].value)

			$clen = "$trial/$NUM_TRIALS".length
			write-host -nonewline $("`b" * $clen + " "*$clen + "`b" * $clen)
		}

		write-host -nonewline $("`r" + " " * "    running trial ".length + "`r")

		$real_str = ($real | % { ([string] $_).padleft(3, " ") }) -join ', '
		$user_str = ($user | % { ([string] $_).padleft(3, " ") }) -join ', '
		$syst_str = ($syst | % { ([string] $_).padleft(3, " ") }) -join ', '

		$real_ave = ($real | measure -ave | % average) / 1000 | % { "{0:f5}" -f $_ }
		$user_ave = ($user | measure -ave | % average) / 1000 | % { "{0:f5}" -f $_ }
		$syst_ave = ($syst | measure -ave | % average) / 1000 | % { "{0:f5}" -f $_ }

		$plain_outstr += "$size_str buffer:`n" + `
		"    real: $real_ave, mean([$real_str])`n" + `
		"    user: $user_ave, mean([$user_str])`n" + `
		"    syst: $syst_ave, mean([$syst_str])`n"

		$tex_outstr[0] += "$( $real_ave.trimEnd("0") ),"
		$tex_outstr[1] += "$( $user_ave.trimEnd("0") ),"
		$tex_outstr[2] += "$( $syst_ave.trimEnd("0") ),"
	}

	$natural_exit = $true
}
finally {
	rm stderr.log.tmp, stdout.log.tmp 2> $null

	if (-not $natural_exit) { write-host "" <# newline #> }
	write-host "recompiling with default buffer size"
	../../assemble adler32 --infer 1> $null
}

# remove the last character because the loop code always adds an extra comma at the end.
$tex_outstr = ($tex_outstr | % { $_.substring(0, $_.length - 1) + "\right]" }) -join "`n"
$tex_outstr += "`nX=\left[$(($sizes | % { [uint32]::log2(($_ -replace ' B?', '')) }) -join ',')\right]"

if ($args -ccontains "--tex-only") {
	write-output $tex_outstr
}
elseif ($args -ccontains "--plain-only") {
	write-output $plain_outstr
}
else {
	write-host "######################### Data: Report Format #########################"
	write-output $plain_outstr

	write-host "########################## Data: TeX Format ##########################"
	write-output $tex_outstr
}

exit 0
