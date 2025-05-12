#requires -version 7

<#
.synopsis
	Download video from m3u8 file and combine using FFmpeg.
	- By default, combines as mp4.
	- Cross-platform.
.description
	prefer -help to -? or Get-Help.
.notes
	Requires PowerShell 7.
	Requires FFmpeg. Any version from like the last decade will work.
#>

param (
	[string] $infile = "./index.m3u8",
	[string] $outfile = "./output.mp4",

	[switch] $alwaysWriteSegments,
	[switch] $bypassLengthCap,
	[switch] $clean,
	[switch] $help,
	[switch] $keepIntermediateFiles,
	[switch] $leaveSegmented,
	[switch] $remoteInput,
	[switch] $silent,

	[Parameter(ValueFromPipeline=$true)] $input
)

# TODO: allow multiple inputs/outputs/batch processing.
	# change the `segments` folder and `segments.txt` file to use the
	# base name of the input file. Or maybe just do `segments-$index`.
	# for now make them process sequentially, but add `-parallel` or
	# `-parallelBatching` or something.

if ($input.count -gt 2) {
	write-error "More than 2 pipeline arguments were given. Only input and output filenames are allowed."
	exit 12
}

# prioritize pipeline input over normal argument input.
if ($input.count -gt 0) {
	$infile = $input[0]

	if ($input.count -eq 2) {
		$outfile = $input[1]
	}
}

$helpTextOptions = @'
Options:
    The -input and -output options can be provided positionally instead of named.
    They can also be passed via the pipeline, i.e. `"input", "output" | fetch-m3u8.ps1`.
    If both are provided, the pipeline value is used.

    -i, -in, -infile PATH               specify path to the m3u8 file. default "./index.m3u8"
    -o, -out, -outfile PATH             specify output video file for FFmpeg. default "output.mp4"
                                        the extension determines the format, as it does for FFmpeg
    -a, -alwaysWriteSegments            redownload segment files that are already downloaded
    -b, -bypassLengthCap                allow downloading files estimated to be larger than 16gb
    -c, -clean                          clean intermediate files if they are there. do nothing else
                                        removed files: segments.txt, segments/*.ts, input file
    -h, -help                           print this help text and exit
    -?                                  print the help as given from `Get-Help`. Not recommended
    -k, -keep, -keepIntermediateFiles   do not delete input file, segments folder, or segments.txt
    -l, -leaveSegmented                 do not combine the segments with FFmpeg. Replace the input
                                        file's urls to the downloaded segment files. implies `-keep`
    -r, -remote, -remoteInput           the input file is a remote file to be downloaded before use
    -s, -silent                         do not print anything. fatal errors still print to stderr.
                                        These messages contain extra information (url, http status. etc.)
'@
$helpTextErrorCodes = @'
Exit codes:
     0 - Success
     1 - Input file name ends in / (or also \ on Windows). Even if it resolves to an actual file
     2 - Input file does not exist (404 Not Found or 410 Gone)
     3 - Remote input file could not be accessed nor confirmed to not exist
     4 - Remote input file uses local segment files
     5 - Windows (drive:/...) local absolute path encountered in the input file on a non-Windows system
     6 - Input file did not contain any urls
     7 - Segment file analog of exit code 2. Segment file does not exist (404 or 410)
     8 - Segment file analog of exit code 3. Segment file could not be accessed nor confirmed to not exist
     9 - Estimated total video file size is larger than 16gb without `-bypassLengthCap` option
    10 - FFmpeg could not be found or is not installed
    11 - FFmpeg encountered an error combining the segments
    12 - More than 2 aguments were passed through the pipeline.
'@

function clean {
	if (test-path -pathtype leaf segments.txt) { rm segments.txt }
	if (test-path -pathtype container segments) { rm -r segments }
	if (($clean -or $remoteInput) -and (test-path -pathtype leaf $inFile)) { rm $inFile }
}
function Get-ChromeUserAgent {
	# these values might not ever need to be updated. it will just be increasingly
	# likely over time that the server won't believe it, and block the request.
	# NOTE: the user agent is at `navigator.userAgent` in the JS terminal

	# the value given by [Microsoft.PowerShell.Commands.PSUserAgent]::Chrome
	# says Webkit 534.6, which was from like 2010.

	$osInfo = $isWindows ? "Windows NT 10.0; Win64; x64" :
		$isMacOS ? "Macintosh; Intel Mac OS X 10_15_7" :
			"X11; Linux x86_64"

	$chromeVersion = "136.0.0.0"
	$webkitVersion = "537.36"

	return "Mozilla/5.0 ($osInfo) AppleWebKit/$webkitVersion" +
		" (KHTML, like Gecko) Chrome/$chromeVersion Safari/$webkitVersion"
}

# pretend to be chrome; less likely to be blocked for botting/automation.
# Hopefully this is legal. idk
$userAgent = Get-ChromeUserAgent
$chromeMajorVersion = [regex]::match($userAgent, "(?<=Chrome/)\d+").value
$requestHeaders = @{
	"DNT" = 1;
	"sec-ch-ua-mobile" = "?0";
	"sec-ch-ua-platform" = "`"$(
		$isWindows ? "Windows" :
		$isMacOS ? "MacOS" :
			"Linux"
	)`"";
	"sec-ch-ua"        = $(
		"`"Not)A;Brand`";v=`"99`", " +
		"`"Google Chrome`";v=`"$chromeMajorVersion`", " +
		"`"Chromium`";v=`"$chromeMajorVersion`""
	);
}

function curl {
	# internal function. not actually `curl`.
	# all commands for this function are valid for real `curl`, but not vice versa.
	# returns 0 on success, http status code on error 

	param (
		[Parameter(Position=0, Mandatory=$true)] [string] $inFile,
		[string] $outFile,
		[switch] $head
	)

	if (-not ($head -xor $PSBoundParameters.ContainsKey("outFile"))) {
		throw "Options -out and -head are mutually exclusive, but one must be given."
	}

	# only matters on
	$contentType = switch ([IO.Path]::GetExtension($outFile)) {
		".m3u8" {"application/x-mpegURL"}
		".ts" {"video/MP2T"}
		default {"*/*"}
	}

	$extraHeaders = $head ? @{} : @{"Accept" = $contentType}
	$httpVersions = 1.1, 2.0, 3.0, 1.0

	# 5 tries
	for ([int] $try = 1; $try -le 5; $try++) {
		$response = iwr `
			-URI $inFile `
			-method $($head ? "HEAD" : "GET") `
			-skipHTTPErrorCheck <# requires PowerShell 7 #> `
			-maximumRedirection 15 <# default is 5 #> `
			-maximumRetryCount 0 <# do not retry #> `
			-userAgent $userAgent `
			-HttpVersion $($httpVersions[0]) `
			-headers $($requestHeaders + $extraHeaders)

		if ($response.statusCode -in @(200, 203)) {
			if ($head) {
				$lastExitCode = 0
				return $response.headers["Content-Length"]
			}

			if ($response.headers["Content-Type"] -ne $contentType) {
				return $lastExitCode = 415
			}
			[IO.File]::WriteAllBytes($outFile, $response.content)
			return $lastExitCode = 0
		}
		if ($response.statusCode -eq 505) {
			# 505 HTTP Version Not Supported
			$httpVersions = $httpVersions | select -skip 1

			if ($httpVersions.count -eq 0) {
				return $lastExitCode = 505
			}
		}

		if ($response.statusCode -in @(429, 500, 502, 503, 504)) {
			# exponential backoff. max total wait time is 11.769 seconds.
			# plus download time or possible time waiting for timeouts.
			[uint64] $retryAfter = $response.headers["Retry-After"]

			$timeout = [math]::max(
				[math]::pow(1.9, $try - 1) - 0.4,
				$retryAfter
			)
			if ($timeout -gt 10) {
				# since $timeout > 6.459s, there must have been a retry-after header.
				# but only stop if $timeout -gt 10 to allow for reasonable values.
				# encode 429 and the retry length into a uint64.
				return $lastExitCode = ($retryAfter -band 0xFFFFFFFFul) -bor (429ul -shl 32ul)
			}
			continue
		}

		return $lastExitCode = $($head ? -1 : $response.statusCode)
	}
}

if ($help) {
	$helpTextObject = get-help -full $myInvocation.myCommand.path

	write-output @(
		"Usage:`n    $($myInvocation.myCommand.source.replace("\", "/")) [options]`n"
		"$(("Details:`n$($helpTextObject.synopsis           )").replace("`n", "`n    "))`n"
		"$(("Notes:`n$(  $helpTextObject.alertSet.alert.text)").replace("`n", "`n    "))`n"
		"$helpTextOptions`n"
		"$helpTextErrorCodes`n"
	)


	exit 0
}
if ($clean) {
	clean
	exit 0
}

if ($leaveSegmented) {
	$keepIntermediateFiles = $true
}

if ($isWindows) {
	$inFile = $inFile.replace("\", "/")
}

if ($inFile[-1] -eq "/") {
	write-error "$($remoteInput ? 'remote' : 'local') input file ends in ``/``"
	exit 1
}

if ($remoteInput) {
	curl $inFile -o index.m3u8

	$httpStatus = "HTTP Status: $lastExitCode$([regex]::Replace(
		[string] [Net.HttpStatusCode] $lastExitCode,
		"([A-Z])",
		' $1'
	))"

	if ($lastExitCode -in @(404, 410)) {
		write-error "remote input file does not exist. $httpStatus"
		exit 2
	}
	if ($lastExitCode -shr 32 -eq 429) {
		write-error "remote input file could not be accessed. $httpStatus. Retry after $($lastExitCode -band 0xFFFFFFFFul) seconds."
		exit 2
	}
	if ($lastExitCode -ne 0) {
		write-error "remote input file could not be accessed. $httpStatus"
		exit 3
	}

	$relativeDir = [URI]::new("$inFile/../").absoluteURI
	$inFile = "index.m3u8"
}
else {
	if (-not (test-path $inFile -pathtype leaf)) {
		write-error "local input file does not exist"
		exit 2
	}

	$relativeDir = "file://" + (convert-path "$inFile/../")
	if ($isWindows) {
		$relativeDir = $relativeDir.replace("\", "/")
	}
}
# `$relativeDir` includes the `/` at the end. and is normalized to have no backslashes.

#                   | egrep -v "^#|^$"
$urls = cat $inFile | where { -not [regex]::isMatch($_, '^#|^$') } | foreach {
	$url = $_

	if ([regex]::isMatch($url, "^file:///?")) {
		# local absolute path with `file` protocol
		if ($remoteInput) {
			write-error "remote input files cannot use local segment files."
			exit 4
		}

		return $url
	}

	if ([regex]::isMatch($url, "^\w+://")) {
		# remote absolute path
		return $url
	}

	if ([regex]::isMatch($url, "^[a-zA-Z]:/")) {
		# local absolute path (Windows only).
		if ($remoteInput) {
			write-error "remote input files cannot use local segment files."
			exit 4
		}

		if (-not $isWindows) {
			write-error "local Windows-style absolute paths can only be used on Windows."
			exit 5
		}

		return "file:///$url"
	}

	if ($url[0] -eq "/" -and $remoteInput) {
		# remote absolute path (without protocol)
		return ([URI]::new($relativeDir) | foreach { "$($_.scheme)://$($_.host)$url" })
	}

	if ($url[0] -eq "/" <# -and -not $remoteInput #>) {
		# local absolute path (Windows or Linux)
		return "file://" + [regex]::match((pwd), "^\w+:").value + $url
	}

	# relative path (remote or local, determined by where the input file came from)
	return [URI]::new("$relativeDir$url").absoluteURI
}

if ($urls.count -eq 0) {
	write-error "No URLs were found in the input file."
	exit 6
}

$firstSegmentContentLength = curl $($urls[0]) -head
if ($lastExitCode -shr 32 -eq 429) {
	write-error "segment file preflight request returned HTTP 429 Too Many Requests. Retry after $($lastExitCode -band 0xFFFFFFFFul) seconds."
	# not a different status code becuase this is essentially the same as a GET method failing.
	exit 8
}
if (-not $bypassLengthCap -and $firstSegmentContentLength * $urls.count -gt 16gb) {
	write-error "the segments are estimated to total more than 16gb. terminating program. use `-bypassLengthCap` to continue Anyway."
	exit 9
}

if (-not (test-path -pathtype container segments)) {
	if (test-path segments) {
		# `segments` exists but isn't a folder
		rm segments
	}

	[void] (mkdir segments) # suppress output
}

$i = 0
$padSize = "$($urls.count)".length
$startTime = [DateTime]::Now
# It is probably a bad idea to parallelize this loop, for a few reasons:
	# 1. The urls will have to be indexed beforehand, which is probably annoying to do.
		# this is so the output files will always be in the right order locally.
	# 2. The server will probably start rate limiting or rejecting the requests.
		# since it will likely be making the requests much faster.
	# 3. It will be much harder to display an accurate progress bar.
		# It will probably be harder to calculate the percentage/time remaining.
		# the index variable might not be accurate due to data races.
foreach ($url in $urls) {
	$iterationStartTime = [DateTime]::Now
	$i++

	if (-not $silent) {
		# TODO: figure out what the upper bound means
		# is that a *guess* at an upper bound, or is that the actual upper bound?
		$remainingSeconds = $i -eq 1 ?
			11.77 * $urls.count : # 11.77s /segment is an upper bound.
			($iterationStartTime - $startTime).totalSeconds*($urls.count/($i-1) - 1)

		write-progress "Downloading video segments" " $i/$($urls.count)" -id 1 `
			-percent $($i / $urls.count * 100) -secondsRemaining $remainingSeconds
	}

	$segfile = "./segments/$("$i".padLeft($padSize, "0")).ts"

	if (test-path $segfile) {
		if (test-path -pathtype container $segfile) {
			if (-not $silent) {
				write-host "file is a directory. removing and redownloading"
			}

			rm $segfile
		}
		elseif ($alwaysWriteSegments) {
			if (-not $silent) {
				write-host "file exists. redownloading."
			}
		}
		else {
			if (-not $silent) {
				write-host "    download not required."
			}

			continue
		}
	}

	curl $url -o $segfile

	$httpStatus = "HTTP Status: $lastExitCode$([regex]::Replace(
		[string] [Net.HttpStatusCode] $lastExitCode,
		"([A-Z])",
		' $1'
	))"

	if ($lastExitCode -in @(404, 410)) {
		write-error "segment file $i does not exist. $httpStatus.`n    $url"
		exit 7
	}

	if ($lastExitCode -shr 32 -eq 429) {
		write-error "segment file $i could not be accessed. $httpStatus. Retry after $($lastExitCode -band 0xFFFFFFFFul) seconds."
		exit 8
	}

	if ($lastExitCode -ne 0) {
		write-error "segment file $i could not be accessed. $httpStatus.`n    $url"
		exit 8
	}

	# if the download took less than 1 second, sleep the rest of it. This keeps
	# the program it to 1 req/sec to avoid `429 Too Many Requests` errors.
	start-sleep $([math]::max(0, 1 - ([DateTime]::Now - $iterationStartTime).totalSeconds))
}

if (-not $silent) {
	write-host "downloads finished.`ncombining segments"
}

if (test-path segments.txt) {
	# recurse in case it is a folder for some reason.
	rm -r segments.txt
}

ls ./segments/*.ts | foreach { "file '$($_.name)'" } | out-file segments.txt

if ($leaveSegmented) {
	$lines = cat $inFile

	$urls = ls ./segments/*.ts | foreach { "./segments/$($_.name)" }
	$j = 0
	$fileLines = for ($i = 0; $i -lt $lines.count; $i++) {
		[regex]::isMatch($lines[$i], '^#|^$') ?
			$lines[$i] :
			$urls[$j++]
	}

	$fileLines > $inFile
	exit 0
}

if ((get-command ffmpeg -errorAction silentlyContinue) -eq $null) {
	write-error "FFmpeg could not be found or is not installed"
	exit 10
}

ffmpeg -y -safe 0 -f concat -i segments.txt -c copy `
	$outfile -loglevel $($silent ? "quiet" : "info")

if ($lastExitCode -ne 0) {
	# don't delete intermedaite files if FFmpeg failed.
	write-error "FFmpeg failed: exit code $lastExitCode"
	exit 11
}

if (-not $keepIntermediateFiles) {
	clean
}

# for some reason, exiting via the end of the file doesn't change $lastExitCode to 0.
exit 0
