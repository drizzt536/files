#requires -version 7

<#
.synopsis
	Download video segments from m3u8 file and combine using FFmpeg.
	- By default, combines as mp4.
	- Cross-platform (I think?).
.description
	prefer -help to -? or Get-Help. it is more helpful.
.notes
	Requires PowerShell 7.
	Requires FFmpeg. Any version from like the last decade will work.
	pipeline input is prioritized over regular input.
.example
	fetch-m3u8.ps1 -remote "https://www.example.com/index.m3u8" -o video.mp4
#>

param (
	[string] $infile               = "./index.m3u8",
	[string] [Alias("o")] $outfile = "./out.mp4",
	[string] $origin               = "",
	[string] $referer              = "",
	[string] $hashRename           = "",

	[switch] $alwaysWriteSegments,
	[switch] $bypassLengthCap,
	[switch] $clean,
	[switch] $help,
	[switch] $keepIntermediateFiles,
	[switch] $leaveSegmented,
	[switch] $remoteInput,
	[switch] $silent,
	[switch] [Alias("verb")] $verbose_,

	[Parameter(ValueFromPipeline=$true)] $input
)

# TODO: add a validation function on $hashRename. It can be SHA1, SHA256, SHA384, SHA512, or MD5.
#       idk if `ValidateSet()` uses `-in` or `-cin`. `-in` is what I want.

# TODO: consider allowing multiple inputs/outputs/batch processing.
	# change the `segments` folder and `segments.txt` file to use the
	# base name of the input file. Or maybe just do `segments-$index`.
	# for now make them process sequentially, but add `-parallel` or
	# `-parallelBatching` or something.

if ($infile -eq "--help") {
	$help = $true
}

if ($infile -eq $outfile) {
	[Console]::Error.WriteLine("`e[31minfile == outfile. this is likely a mistake.`e[m")
	exit 13
}

if ($input.count -gt 2) {
	[Console]::Error.WriteLine("`e[31mMore than 2 pipeline arguments were given. Only input and output filenames are allowed.`e[m")
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
    They can also be passed via the pipeline, i.e. `"infile", "outfile" | fetch-m3u8.ps1`.
    If both are provided, the pipeline value is used.

    -i, -in, -infile URI          specify path to the m3u8 file. default "./index.m3u8"
    -o, -out, -outfile PATH       specify output video file for FFmpeg. default "output.mp4"
                                  the extension determines the format, as it does for FFmpeg
    -origin URI                   specify the origin to give in the request headers. implies `-r`
                                  triggers Sec-Fetch-(Dest|Mode|Site) to be added.
    -referer URI                  specify the referer to give in the request headers. implies `-r`
    -a, -alwaysWriteSegments      redownload segment files that are already downloaded
    -b, -bypassLengthCap          allow downloading files estimated to be larger than 4gb
    -c, -clean                    clean intermediate files if they are there. do nothing else
                                  removed files: segments.txt, segments/*.ts, input file
    -h, -help                     print this help text and exit
    -?                            print the help as given from `Get-Help`. Not recommended.
    -k, -keepIntermediateFiles    do not delete input file, segments folder, or segments.txt
    -l, -leaveSegmented           do not combine the segments with FFmpeg. Replace the input
                                  file's urls to the downloaded segment files. implies `-keep`
    -r, -remote, -remoteInput     the input file is a remote file to be downloaded before use
    -s, -silent                   do not print anything. fatal errors still print to stderr.
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
     9 - Estimated total video file size is larger than 4gb without `-bypassLengthCap` option
    10 - FFmpeg could not be found or is not installed
    11 - FFmpeg encountered an error combining the segments
    12 - More than 2 aguments were passed through the pipeline.
    13 - Input file is the same as the output file.
'@

function clean {
	if (test-path -type leaf segments.txt) { rm segments.txt }
	if (test-path -type container segments) { rm -r segments }
	if (($clean -or $remoteInput) -and (test-path -type leaf $inFile)) { rm $inFile }
}

function Get-ChromeUserAgent {
	# these values might not ever need to be updated. it will just be increasingly
	# likely over time that the server won't believe it, and block the request.
	# NOTE: the user agent is at `navigator.userAgent` in the JS terminal

	# the value given by [Microsoft.PowerShell.Commands.PSUserAgent]::Chrome
	# says Webkit 534.6, which was from like 2010.

	# just lie and always say it is on Windows
	$osInfo        = "Windows NT 10.0; Win64; x64"
	$chromeVersion = "151.0.0.0"
	$webkitVersion = "537.36"

	return "Mozilla/5.0 ($osInfo) AppleWebKit/$webkitVersion" +
		" (KHTML, like Gecko) Chrome/$chromeVersion Safari/$webkitVersion"
}

# pretend to be chrome; less likely to be blocked for botting/automation.
# Hopefully this is legal. idk
$userAgent = Get-ChromeUserAgent
$chromeMajor = [regex]::match($userAgent, "(?<=Chrome/)\d+").value
$requestHeaders = @{
	"Dnt" = 1;
	"Priority" = "u=0, i";
	"Sec-Ch-Ua-Mobile" = "?0";
	"Sec-Ch-Ua-Platform" = "`"$(
		<#$isWindows ? "Windows" : $isMacOS ? "MacOS" : "Linux"#>
		"Windows"
	)`"";
	"Sec-Ch-Ua" = $(
		"`"Not.A/Brand`";v=`"99`", " +
		"`"Brave`";v=`"$chromeMajor`", " +
		"`"Chromium`";v=`"$chromeMajor`""
	);
	"Upgrade-Insecure-Requests" = 1;
	"Accept-Language" = "en-US,en;q=0.5";
	"Sec-Gpc" = 1
}

if ([Environment]::version.major -ge 11) {
	# zstd support doesn't exist until .NET 11. As of right now, PowerShell 7.7.0 prereleases
	# 2 and 3 are the only versions of PowerShell that use .NET 11. They both work with this,
	# so I will assume this is fine.
	# NOTE: this could also just be completely useless. idk if 7.7.0 adds zstd by default.
	$requestHeaders += @{"Accept-Encoding" = "gzip, deflate, br, zstd"}
}

if ($origin) {
	$remoteInput = $true

	$targetUri = [Uri] $infile
	$originUri = [Uri] $origin

	if ($targetUri.scheme -eq $originUri.scheme -and $targetUri.host -eq $originUri.host -and $targetUri.port -eq $originUri.port) {
		$fetchSite = "same-origin"
	}
	else {
		$multiPartTlds = @("co.uk", "org.uk", "co.jp", "co.nz", "com.au", "co.za", "com.br")

		$targetParts       = $targetUri.host -split '\.'
		$targetLastTwo     = $targetParts[-2..-1] -join '.'
		$targetRegistrable = $multiPartTlds -contains $targetLastTwo -and $targetParts.count -ge 3 ?
			$targetParts[-3..-1] -join '.' :
			$targetLastTwo

		$originParts       = $originUri.Host -split '\.'
		$originLastTwo     = $originParts[-2..-1] -join '.'
		$originRegistrable = $multiPartTlds -contains $originLastTwo -and $originParts.count -ge 3 ?
			$originParts[-3..-1] -join '.' :
			$originLastTwo

		$fetchSite = $targetRegistrable -eq $originRegistrable ? "same-site" : "cross-site"
	}

	$requestHeaders += @{
		"Origin"         = $origin;
		"Sec-Fetch-Dest" = "empty";
		"Sec-Fetch-Mode" = "cors";
		"Sec-Fetch-Site" = $fetchSite
	}
}

if ($referer) {
	$remoteInput = $true
	$requestHeaders += @{"Referer" = $referer}
}

[IO.Directory]::SetCurrentDirectory((pwd)) # for the outfile in curl.

function format-headers {
	param ($headers, [byte] $maxlen = 60)

	$lines = foreach ($entry in $headers.getEnumerator()) {
		$key   = $entry.Key
		$first = @($entry.Value)[0]
		$val   = "$first"

		if ($val.Length -gt $maxlen) {
			$val = $val.substring(0, $maxlen) + "..."
		}

		$val = $val -replace '"', '\"'

		"  `"$key`": `"$val`""
	}

	"{`n" + ($lines -join ",`n") + "`n}"
}

$fncurl_calls = 0

function fncurl {
	# internal function. not actually `curl`.
	# all commands for this function are valid for real `curl`, but not vice versa.
	# returns 0 on success, http status code on error

	# TODO: consider not switching 200 to 415, since some sites have content type obfuscation nonsense.
	# NOTE: sometimes it lies about what the response code was, but it should be approximately correct.
	#       like it says 415 (UnsupportedMediaType) instead of 200 (OK) if the content type doesn't match,
	#       and it says 429 (TooManyRequests) instead of 500 (InternalServerError) and stuff, since the end
	#       result is the same: stop trying, it is not working.

	param (
		[string] $inFile,
		[string] $outFile,
		[switch] $head,
		[bool] $debug
	)

	if (-not ($head -xor $PSBoundParameters.containsKey("outFile"))) {
		throw "options ``-out`` and `-head`` are mutually exclusive, but one must be given."
	}

	# NOTE: add stuff here if the content types fail
	# I think I tried just doing "*/*" for everything, but that didn't work if I remember right.
	$contentType = switch ([IO.Path]::GetExtension($outFile)) {
		".m3u8" {"application/x-mpegURL,application/vnd.apple.mpegurl,text/plain"}
		".ts" {"video/MP2T,video/mp4,image/png,text/plain"}
		default {"*/*"}
	}

	if ($debug) {
		write-host "`n////////////////////////////////////////////////////////////"
		write-host "fncurl call $((++$script:fncurl_calls))"
		write-host "head=$head, contentType=$contentType"
	}

	$extraHeaders = $head ? @{} : @{"Accept" = $contentType}
	$httpVersions = 1.1, 2.0, 3.0, 1.0

	# 5 tries
	for ([byte] $try = 1; $try -le 5; $try++) {
		# the loop only ever re-executes when something like 429 or 505 comes up.
		if ($debug) {
			if ($try -gt 1) {
				write-host -nonewline "`e[38;2;180;100;0m"
			}

			write-host "try=$try`e[m`nrequest headers: $(format-headers ($requestHeaders + $extraHeaders))"
		}

		$response = invoke-webrequest `
			-URI $inFile `
			-method $($head ? "HEAD" : "GET") `
			-skipHTTPErrorCheck    <# requires PowerShell 7 #> `
			-maximumRedirection 15 <# default is 5 #> `
			-maximumRetryCount 0   <# do not retry #> `
			-userAgent $userAgent `
			-HttpVersion $($httpVersions[0]) `
			-headers $($requestHeaders + $extraHeaders)

		if ($debug) {
			write-host "outFile: $outFile"
			write-host "inFile: $inFile"
			write-host "response headers: $(format-headers $response.headers)"
			write-host "content type: $($response.headers["Content-Type"])"
		}

		if ($response.statusCode -in 200, 203) {
			if ($head) {
				$script:httpCode = 200
				return $response.headers["Content-Length"]
			}

			if ($response.headers["Content-Type"] -notin ($contentType -split ",")) {
				return $script:httpCode = 415
			}

			# some fuckass websites send their stuff as `text/plain` for whatever the fuck reason
			# (probably obfuscation tbh), so I have to extract out the byte stream just in case.
			$bytes = [IO.BinaryReader]::new($response.rawContentStream).readbytes(
				$response.rawContentStream.length
			)

			[IO.File]::WriteAllBytes($outFile, $bytes)
			return $script:httpCode = 200
		}
		if ($response.statusCode -eq 505) {
			# 505 HTTP Version Not Supported
			$httpVersions = $httpVersions | select -skip 1

			if ($httpVersions.count -eq 0) {
				return $script:httpCode = 505
			}
		}

		if ($response.statusCode -in 429, 500, 502, 503, 504) {
			# exponential backoff. max total wait time is 12.63 seconds.
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
				$script:httpCode = 429
				return $retryAfter
			}

			continue
		}

		# miscellaneous status code
		return $script:httpCode = $response.statusCode # $($head ? -1 : $response.statusCode)
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

if ($isWindows -and -not $remoteInput) {
	$inFile = $inFile.replace("\", "/")
}

if ($inFile[-1] -eq "/") {
	[Console]::Error.WriteLine("`e[31m$($remoteInput ? 'remote' : 'local') input file ends in ``/```e[m")
	exit 1
}

if ($remoteInput) {
	$curlData = fncurl $inFile -o index.m3u8 -debug $verbose_

	# write-host "DEBUG: `$httpCode = $httpCode"
	# write-host "DEBUG: status code = $([string] [Net.HttpStatusCode] $httpCode)"

	# transform stuff like "HttpVersionNotSupported" to " Http Version Not Supported"
	$httpStatus = "HTTP Status: $httpCode$([regex]::Replace(
		([string] [Net.HttpStatusCode] $httpCode),
		"([A-Z])",
		' $1'
	))"

	if ($httpCode -in 404, 410) {
		[Console]::Error.WriteLine("`e[31mremote input file does not exist. $httpStatus`e[m")
		exit 2
	}
	if ($httpCode -eq 429) {
		[Console]::Error.WriteLine("`e[31mremote input file could not be accessed. $httpStatus. Retry after $curlData seconds.`e[m")
		exit 3
	}
	if ($httpCode -ne 200) {
		[Console]::Error.WriteLine("`e[31mremote input file could not be accessed. $httpStatus`e[m")
		exit 3
	}

	# get rid of the query.
	$relativeDir = [URI]::new($inFile)
	$relativeDir = $relativeDir.absoluteUri.substring(0, $relativeDir.absoluteUri.length - $relativeDir.query.length)

	# get rid of the file name.
	$relativeDir = [URI]::new("$relativeDir/../").absoluteURI
	$infile = "index.m3u8"
}
else {
	if (-not (test-path $inFile -type leaf)) {
		[Console]::Error.WriteLine("`e[31mlocal input file does not exist`e[m")
		exit 2
	}

	$relativeDir = "file://" + (convert-path "$inFile/../")
	if ($isWindows) {
		$relativeDir = $relativeDir.replace("\", "/")
	}
}

# parse and normalize the urls

# `$relativeDir` includes the `/` at the end. and is normalized to have no backslashes.
#                   | egrep -v "^#|^$"
$urls = cat $infile | where { -not [regex]::isMatch($_, '^#|^$') } | foreach {
	$url = $_

	if ([regex]::isMatch($url, "^file:///?")) {
		# local absolute path with `file` protocol
		if ($remoteInput) {
			[Console]::Error.WriteLine("`e[31mremote input files cannot use local segment files.`e[m")
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
			[Console]::Error.WriteLine("`e[31mremote input files cannot use local segment files.`e[m")
			exit 4
		}

		if (-not $isWindows) {
			[Console]::Error.WriteLine("`e[31mlocal Windows-style absolute paths can only be used on Windows.`e[m")
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
	[Console]::Error.WriteLine("`e[31mNo URLs were found in the input file.`e[m")
	exit 6
}

if ($verbose_) {
	write-host "total segment files: $($urls.count)"
	write-host "prefetching segment 1: $($urls[0])"
}

$curlData = fncurl $($urls[0]) -head -debug $verbose_
$httpStatus = "HTTP Status: $httpCode$([regex]::Replace(
	([string] [Net.HttpStatusCode] $httpCode),
	"([A-Z])",
	' $1'
))"
if ($httpCode -eq 429) {
	# NOTE: in the case that `curl -head` has 429 as the exit code, it returns the retry time and not the data length.
	# not a different status code becuase this is essentially the same as a GET method failing.

	[Console]::Error.WriteLine("`e[31msegment file preflight request returned HTTP 429 Too Many Requests. Retry after $curlData seconds.`e[m")
	exit 8
}
if ($httpCode -in 404, 410) {
	[Console]::Error.WriteLine("`e[31mfirst segment file does not exist during preflight request. $httpStatus`e[m")
	exit 7
}
if ($httpCode -ne 200) {
	[Console]::Error.WriteLine("`e[31mfirst segment file could not be accessed during preflight request. $httpStatus`e[m")
	exit 8
}

$firstSegmentContentLength = $curlData
if (-not $bypassLengthCap -and $firstSegmentContentLength * $urls.count -gt 4gb) {
	[Console]::Error.WriteLine("`e[31mthe segments are estimated to total more than 4gb. terminating program. use `-bypassLengthCap` to continue anyway.`e[m")
	exit 9
}

if (-not (test-path -type container segments)) {
	if (test-path segments) {
		# `segments` exists but isn't a folder
		remove-item -force segments
	}

	# it doesn't exist at all, so create it.
	[void] (new-item -type dir segments) # suppress output with [void]
}

# download loop

$i = 0
$padSize = "$($urls.count)".length
$startTime = [DateTime]::Now
# It is probably a bad idea to parallelize this loop, for a few reasons:
#     1. The urls will have to be indexed beforehand, which is probably annoying to do.
#        this is so the output files will always be in the right order locally.
#     2. The server will probably start rate limiting or rejecting the requests.
#        since it will likely be making the requests much faster.
#     3. It will be harder to display an accurate progress bar.
#        It will probably be harder to calculate the percentage/time remaining.
#        the index variable might not be accurate due to data races.
foreach ($url in $urls) {
	$iterationStartTime = [DateTime]::Now
	$i++

	if (-not $silent) {
		# this is based on the formula that the exponential backoff uses.
		# and 24.0011 is super close to 24, so it is rounded to 24.
		$remainingSeconds = $i -eq 1 ?
			24 * $urls.count : # 24 / segment is an upper bound.
			($iterationStartTime - $startTime).totalSeconds*($urls.count/($i-1) - 1)

		write-progress "Downloading video segments" " $i/$($urls.count)" -id 1 `
			-percent $($i / $urls.count * 100) -secondsRemaining $remainingSeconds
	}

	$segfile = "./segments/$("$i".padLeft($padSize, "0")).ts"

	if (test-path $segfile) {
		if (test-path -type container $segfile) {
			if (-not $silent) {
				write-host "file is a directory. removing and redownloading"
			}

			remove-item $segfile
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

	$curlData = fncurl $url -o $segfile -debug $verbose_

	$httpStatus = "HTTP Status: $httpCode$([regex]::Replace(
		([string] [Net.HttpStatusCode] $httpCode),
		"([A-Z])",
		' $1'
	))"

	if ($httpCode -in 404, 410) {
		[Console]::Error.WriteLine("`e[31msegment file $i does not exist. $httpStatus.`n    $url`e[m")
		exit 7
	}

	if ($httpCode -eq 429) {
		[Console]::Error.WriteLine("`e[31msegment file $i could not be accessed. $httpStatus. Retry after $curlData seconds.`e[m")
		exit 8
	}

	if ($httpCode -ne 200) {
		[Console]::Error.WriteLine("`e[31msegment file $i could not be accessed. $httpStatus.`n    $url`e[m")
		exit 8
	}

	# if the download took less than 1 second, sleep the rest of it. This keeps
	# the program it to 1 req/sec to avoid `429 Too Many Requests` errors.
	start-sleep -sec $([math]::max(0, 1 - ([DateTime]::Now - $iterationStartTime).totalSeconds))
}

if (-not $silent) {
	write-progress "Downloading video segments" -completed
	write-host "downloads finished.`ncombining segments"
}

if (test-path segments.txt) {
	# recurse in case it is a folder for some reason.
	remove-item -recurse segments.txt
}

ls ./segments/*.ts | foreach { "file './segments/$($_.name)'" } | out-file segments.txt

if ($leaveSegmented) {
	# I don't remember what this is supposed  to do
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

if (-not (gcm ffmpeg -ea ignore)) {
	# the required options are so old that it can basically be assumed that all ffmpeg version have it.
	# this check happens here and not earlier because ffmpeg isn't required if `-leaveSegmented` is passed.
	# use `ffmpeg -y -safe 0 -f concat -i segments.txt -c copy output.mp4 -loglevel info` to combine.
	[Console]::Error.WriteLine("`e[31mFFmpeg could not be found or is not installed. files are left segmented.`e[m")
	exit 10
}

ffmpeg -y -safe 0 -f concat -i segments.txt -c copy `
	$outfile -loglevel $($silent ? "quiet" : "info")

write-host ""

if ($hashRename -ne "") {
	write-host "renaming with algorithm $($hashRename.toUpper())"
	${new outfile} = (get-filehash -alg $hashRename $outfile).hash.tolower()
	rename-item $outfile "${new outfile}$([IO.Path]::GetExtension($outfile))"
}

if (-not $?) {
	# don't delete intermediate files if FFmpeg failed.
	# sometimes the first one doesn't show up for some reason, so just print two similar messages.
	[Console]::Error.WriteLine("`e[31mFFmpeg failed with nonzero exit code: $lastExitCode`e[m")
	[Console]::Error.WriteLine("`e[31mskipping cleaning due to nonzero FFmpeg exitcode`e[m")
	exit 11
}

if (-not $keepIntermediateFiles) {
	write-host "cleaning"
	clean
}
else {
	write-host "skipping cleaning"
}

# for some reason, exiting via EOF doesn't change $lastExitCode to 0.
exit 0
