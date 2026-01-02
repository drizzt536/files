#requires -version 7

<#
.synopsis
	backs up a drive to another drive, starting at some root directory.
	also works for updating an existing drive backup.
	removes stale backups for files that no longer exist on the source drive.

	basically a RAID 1 type thing.

	Doesn't work with mounted paths, but just don't have more than 26 drives at a time.

	Only works on Windows, because it uses fsutil.exe, Windows drive letter scheming,
	and [Security.Principal.WindowsIdentity]::GetCurrent

	returns an exit code of 0 on success and 1 on fail. read the messages for the exit reason.

	color information:
		- gray/default: config data, generic updates, miscellaneous unimportant information
		- white: generic process updates (major steps).
		- yellow: notes, deviations from normal behavior, etc.
		- green: file move and delete messages.
		- orange: warnings, non fatal errors
		- red: fatal errors
		- blue: dry-run debug information (command strings)
.parameter inputDrive
	Alias: -srcDrive, -i

	The drive letter of the source drive. (the drive that is being backed up)
.parameter outputDrive
	Alias: -dstDrive, -o

	The drive letter of the destination drive. (the drive the backups will be put into)
.parameter root
	The root of the folder within the drive that should be backed up.

	Everything outside of the folder will not be backed up.
	An empty string means it backs up the whole drive.

	For D:/a/b/c/ as the root folder, use -root "a/b/c".
.parameter reference
	The file to use as a reference for what files are newer or older than the latest backup.
	The reference file should be on the destination drive and doesn't need to exist on the source drive.
	The reference file should not be a directory.

	The backup file is assumed to be placed in "${outputDrive}:/$root/". This can be overridded by
	making it start with "${outputDrive}:/", but it still has to be within the output drive.

	If the reference does not exist:
	 - if `-firstTime` was passed, the reference file is created.
	 - if `-firstTime` was not passed, an error is thrown.
.parameter keepStale
	Also: -k

	If this option is passed, the step for deleting stale backups is skipped.
.parameter confirmDelete
	Alias: -yes, -y

	If this option is passed, it will not ask before deleting stale backup files it finds.
	It will just print them out and delete them.
.parameter firstTime
	Alias: -create, -f

	If this option is passed, it indicates it is creating a backup instead of updating one.
	This skips the size comparison check, and changes behavior slightly.
.parameter dryRun
	Alias: -whatIf

	don't actually move or delete anything, but print out what would normally happen.
	some parts print out the exact command, and some parts don't.
.parameter skipVerify
	Alias: -bypassVerification, -b

	skip the full verification, and only verify newly copied files.
.parameter skipCorruptionCheck
	skip the heuristic checks for possible drive corruption.
.parameter skipAll
	equivalent to `-skipVerify -skipCorruptionCheck`

	skips full verification and drive corruption heuristics.
.parameter transferOnly
	Also: -t

	equivalent to `-skipAll -keepStale
.parameter help
	an alias of --help and -?
.example
	PS C:\> ./backup.ps1 D E path/to/root README.md -y -c

	 - Back up drive D: to E: starting from D:/path/to/root/
	 - Things outside that root directory will not be backed up
	 - It will skip the delete confirmation because of `-y`
	 - it will assume the backup does not yet exist.
.example
	PS C:\> ./backup.ps1 -src F -dst D -ref

	 - Back up the entirety of drive F: to D:
	 - it will use D:/backup-reference as the reference file.
	 - It will assume it is updating an existing backup,
	   and will ask for confirmation before deleting files
	 - checks for drive corruption using heuristics
.example
	PS C:\> backup.ps1 C E -t -dry

	- back up the entirety of drive C: to E:
	- use E:/backup-reference as the reference file
	- assume the backup exists already.
	- skip drive corruption check
	- skip full drive verification
	- skip stale file check
	- don't actually move files (dry run)

	`-dry -t` basically just lists out the files that have changed.
#>
param (
	[string] [Alias("srcDrive")] $inputDrive = "D",
	[string] [Alias("dstDrive")] $outputDrive = "E",
	[string] $root = "",
	[string] $reference = "backup-reference",

	[switch] $keepStale,
	[switch] [Alias("yes")] $confirmDelete,
	[switch] [Alias("create")] $firstTime,
	[switch] [Alias("whatIf")] $dryRun,
	[switch] [Alias("bypassVerification")] $skipVerify,
	[switch] $skipCorruptionCheck,
	[switch] $skipAll,
	[switch] $transferOnly,
	[switch] $help
)
# For some reason, I can't get the aliases to auto populate in the help text, so I put them in manually.

# TODO: maybe make command that restores the source drive to the state that the backup drive is in?
# NOTE: this uses [Console]::ForegroundColor and write-host instead of write-error so it looks better.
#       write-error puts "Write-Error: " at the start of every message it prints.
# NOTE: write-host doesn't respect ANSI color escape sequences, so [Console]::WriteLine is used when
#       applicable. it only respects it if the color is contained to the current message.

if ($help -or $inputDrive -eq "--help") {
	get-help -full $MyInvocation.MyCommand.source
	exit 0
}

if ($transferOnly) {
	$skipAll = $true
	$keepStale = $true
}

if ($skipAll) {
	$skipVerify = $true
	$skipCorruptionCheck = $true
}

$cmpBufLen = 16KB
[byte[]] $cmpBuf1 = new-object byte[] $cmpBufLen
[byte[]] $cmpBuf2 = new-object byte[] $cmpBufLen
$arrayComparer = [Collections.Generic.SortedSet[byte]]::CreateSetComparer()

<#
.synopsis
	compares two files byte by byte.
	returns true if they are the same file, and false otherwise.

	does not compare metadata.
	takes in paths to two files.
	assumes they exist, are readable, and are not directories.

	does not work if directories are passed in
#>
function files-equal([string] $path1, [string] $path2) {
	# NOTE: $cmpBufLen, $cmpBuf1, $cmpBuf2, ad $arrayComparer are script variables
	[IO.Directory]::SetCurrentDirectory((pwd))

	[Array]::Clear($cmpBuf1)
	[Array]::Clear($cmpBuf2)

	try {
		$file1 = [IO.File]::OpenRead($path1)
		$file2 = [IO.File]::OpenRead($path2)
	} catch {
		# one or both is a directory, non readable, or doesn't exist
		# so just assume they are different.
		return $false
	}

	try {
		# assume $file1.canRead and $file2.canRead are true.

		if ($file1.length -ne $file2.length) {
			return $false
		}

		for ([uint64] $i = 0; $i -lt $file1.length; $i += $cmpBufLen) {
			$file1.read($cmpBuf1, 0, $cmpBufLen)
			$file2.read($cmpBuf2, 0, $cmpBufLen)

			if (-not $arrayComparer.equals($cmpBuf1, $cmpBuf2)) {
				return $false
			}
		}

		return $true
	}
	finally {
		$file1.close()
		$file2.close()
	}
}

# "yes", a bunch of fat fingers and typos of yes, and a couple of other things that probably mean yes.
# a string distance is probably overkill since this is only used twice, and there are only ~40 items.
$confirmOptions = @(
	"y", "a", "yes", # main options
	"uyes", "yesd", "yeds", "ytes", "yers", "yues", "yews", "yues", # adjacent insertions
	"yyes", "yees", "yess", # duplication
	"eys", "esy", "yse", "sye", "sey", # transpositions
	"ues", "urd", "yed", "yrs", "tes", "yrd", "yds", # substitutions
	"ye", "ys", "es", # deletions
	"yeah", "yea", "sure", "1", "ok", "true", "always" # other miscellaneous things
)

###########################################################

[Console]::ResetColor() # in case the background color is wrong for some reason.

if ($inputDrive.length -gt 1) {
	write-host "`e[31minput drive '$inputDrive' should only be a single character"
	exit 1
}

if ($outputDrive.length -gt 1) {
	write-host "`e[31moutput drive '$outputDrive' should only be a single character"
	exit 1
}

$alphabet = 'a'..'z'

if ($inputDrive -notin $alphabet) {
	write-host "`e[31minvalid input drive letter '$inputDrive'"
	exit 1
}

if ($outputDrive -notin $alphabet) {
	write-host "`e[31minvalid output drive letter '$outputDrive'"
	exit 1
}

if (-not (test-path -type container "${inputDrive}:")) {
	write-host "`e[31msource drive '${inputDrive}:' does not exist."
	exit 1
}

if (-not (test-path -type container "${outputDrive}:")) {
	write-host "`e[31mdestination drive '${outputDrive}:' does not exist."
	exit 1
}

if ($reference -eq "") {
	# making it empty is probably the user trying to make it a folder, which isn't allowed.
	write-host "`e[31mreference file cannot be an empty string"
	exit 1
}

$inputDrive = $inputDrive.toUpper()
$outputDrive = $outputDrive.toUpper()
$root = $root -replace "\\", "/" -replace "^/+|/+$", ""
$reference = $reference -replace "\\", "/" -replace "/+$", ""

if ($firstTime) {
	# In like 99% of cases, the first time backup should not find stale backups.
	# this would only happen if there were files there before the backup, but that
	# would indicate that it probably wasn't actually a first time backup.
	$keepStale = $true
}

# if you pass /asdf/qwer, assume it is E:/asdf/qwer, or whatever the output drive is.
if ($reference[0] -eq "/") {
	$reference = "${outputDrive}:$reference"
}

# if it already has the drive letter at the start, there isn't a need to override it.
if (-not $reference.startsWith("${outputDrive}:/")) {
	if ($reference -like "[a-zA-Z]:/*") {
		write-host "`e[31mreference file cannot be outside of the output drive"
		exit 1
	}

	$reference = "${outputDrive}:/$root/$reference"
}


###########################################################

write-host "`e[1;37mattempting backup of drive ${inputDrive}: to drive ${outputDrive}:"

write-host "using `"/$root`" as the root directory"
write-host "using `"$reference`" for modify-time reference"
write-host "using confirmDelete = $confirmDelete"
write-host "using skipVerify = $skipVerify"
write-host "using keepStale = $keepStale"
write-host "using firstTime = $firstTime"
write-host "using dryRun = $dryRun`n"

if (test-path -type container $reference) {
	write-host "`e[31mreference file cannot be a directory"
	exit 1
}

if ($inputDrive -eq "C") {
	# fsutil sometimes doesn't work for the C drive.
	# NOTE: this assumes Windows is in the C drive, which is almost always the case.
	$isAdmin = [bool] ([Security.Principal.WindowsIdentity]::GetCurrent().Groups -eq "S-1-5-32-544").count

	if (-not $isAdmin) {
		write-host "`e[1;33mNOTE: corruption heuristics might not be accurate for C: without administrator"
	}
}

if ($outputDrive -eq "C") {
	write-host "`e[31mcannot use C: as the backup drive."
	exit 1
}

if (-not (test-path $reference)) {
	if ($firstTime) {
		# if the backup doesn't exist yet and the reference file doesn't exit, create the reference file.
		write-host "creating reference file."

		if ($dryRun) {
			write-host "`e[1;34mcmd: new-item -force -type file $reference"
		}
		else {
			new-item -force -type file $reference
		}
	}
	else {
		write-host "`e[31mreference file does not exist.`naborting backup"
		exit 1
	}
}

###########################################################

if ($skipCorruptionCheck) {
	write-host "skipping corruption heuristic checks"
}
else {
	write-host "`e[1;37mchecking corruption heuristics"

	$inputCount = (ls -r -force "${inputDrive}:/$root").count
	$outputCount = (ls -r -force "${outputDrive}:/$root").count
	$inputPossiblyCorrupt = $false
	$outputPossiblyCorrupt = $false

	$inputVolume = get-volume -drive $inputDrive
	$outputVolume = get-volume -drive $outputDrive

	if ((fsutil dirty query "${inputDrive}:") -eq "Volume - ${inputDrive}: is Dirty") {
		write-host "`e[31minput drive is marked as dirty."
		$inputPossiblyCorrupt = $true
	}

	if ($inputVolume.operationalStatus -ne "OK") {
		write-host "`e[31minput drive operational status is not 'OK'."
		$inputPossiblyCorrupt = $true
	}

	if ($inputVolume.healthStatus -ne "Healthy") {
		write-host "`e[31minput drive health status is not 'Healthy'."
		$inputPossiblyCorrupt = $true
	}

	if ($inputVolume.size -lt 12uGB) {
		# I haven't heard of drives smaller than 16 GiB, except for maybe SD cards.
		write-host "`e[31minput drive is smaller than 12 GiB (suspiciously small)."
		$inputPossiblyCorrupt = $true
	}

	if (-not $firstTime) { # nothing to compare to for a first time backup.
		# if the input drive has significantly less files, it might be corrupted.
		if ($inputCount -lt ($outputCount * 3 -shr 2)) {
			write-host "`e[31minput drive has less than 75% as many objects than the output drive."
			$inputPossiblyCorrupt = $true
		}

		if ($outputCount - $inputCount -gt 1000) {
			write-host "`e[31minput drive has more than 1,000 less files than the output drive."
			$inputPossiblyCorrupt = $true
		}
	}

	if ($inputPossiblyCorrupt) {
		# write-host "input, output file counts: $inputCount, $outputCount"
		write-host "`e[31mthe input drive might be corrupted or failing."

		if ($confirmOptions -notcontains (read-host "do you wish to continue?")) {
			write-host "`e[31maborting backup"
			exit 1
		}
	}


	if ((fsutil dirty query "${ourputDrive}:") -eq "Volume - ${outputDrive}: is Dirty") {
		write-host "`e[31moutput drive is marked as dirty."
		$outputPossiblyCorrupt = $true
	}

	if ($outputVolume.operationalStatus -ne "OK") {
		write-host "`e[31moutput drive operational status is not 'OK'."
		$outputPossiblyCorrupt = $true
	}

	if ($outputVolume.healthStatus -ne "Healthy") {
		write-host "`e[31moutput drive health status is not 'Healthy'."
		$outputPossiblyCorrupt = $true
	}

	if ($outputVolume.size -lt 12uGB) {
		write-host "`e[31moutput drive is smaller than 12 GiB (suspiciously small)."
		$outputPossiblyCorrupt = $true
	}

	if ($outputPossiblyCorrupt) {
		write-host "`e[31mthe output drive might be corrupted or failing."

		if ($confirmOptions -notcontains (read-host "do you wish to continue?")) {
			write-host "`e[31maborting backup"
			exit 1
		}
	}

	if (-not $inputPossiblyCorrupt -and -not $outputPossiblyCorrupt) {
		write-host "no catastrophic corruption detected"
	}
}


###########################################################

$reftime = ([IO.FileInfo] $reference).lastWriteTime

write-host "`n`e[1;37msearching for new and updated files"


$updatedFiles = [string[]] (ls -r -force "${inputDrive}:/$root" | where {
	# the file is newer, copy it only if the destination is an existing directory.
	# copy if it only exists in the source drive.
	$dst = $outputDrive + $_.fullname.substring(1);
	($_.lastWriteTime -gt $reftime -and -not (test-path -type container $dst)) -or -not (test-path $dst)
} | % fullname)

for ($i = 0; $i -lt $updatedFiles.count; $i++) {
	$src = $updatedFiles[$i]
	$dst = $outputDrive + $src.substring(1)

	write-host "`e[1;32mbacking up file $($i + 1)/$($updatedFiles.count): $($src -replace '\\', '/')"

	# make sure the directory exists
	$dstDir = split-path $dst
	if (-not (test-path -type container $dstDir)) {
		if ($dryRun) {
			write-host "`e[1;34mcmd: new-item -force -type dir $dstDir"
		}
		else {
			# NOTE: this resets the console color for some reason.
			#       that is why the foreground color is set to green every iteration.
			[void] (new-item -force -type dir $dstDir)
		}
	}

	# back up the file
	if (-not $dryRun) {
		if (test-path -type container $src) {
			# don't copy the folder.
			# a copy only needs to happen at all
			if (-not (test-path -type container $dst)) {
				[void] (new-item -force -type dir $dst)
			}
		} else {
			copy-item -force $src $dst
		}
	}
}

###########################################################

# verify newly added files
[uint32] $verifyErrors = 0

if ($updatedFiles.count -eq 0) {
	write-host "no new or updated files found"
}
elseif (-not $skipVerify) {}
# only verify these now if it isn't verifying them again later.
elseif ($dryRun) {
	write-host "`n`e[1;33mNOTE: newly copied files cannot be verified in a dry run"
}
else {
	write-host "`nverifying newly copied files"

	# probably not required, but it might be if it only transfers one file or somthing, idk.
	start-sleep -ms 100 # wait for it to flush to disk or something, idk.

	for ($i = 0; $i -lt $updatedFiles.count; $i++) {
		$src = $updatedFiles[$i]
		$dst = $outputDrive + $src.substring(1)

		if (test-path -type container $src) {
			# directories don't need to be verified.
			# they are already guaranteed to exist on both drives.

			# increment it anyway so the estimate will be more accurate
			# and it will also make it seem like it is doing more work than it really is.
			continue
		}

		if (-not (files-equal $src $dst)) {
			$verifyErrors++
			write-host "`e[38;5;172mbackup does not reflect source file: $dst"
		}
	}

	if ($verifyErrors -eq 0) {
		write-host "no verification errors"
	}
}

###########################################################

if ($keepStale) {
	write-host "`nskipping check for stale backup files"
}
else {
	# check for files that only exist on the backup drive.
	write-host "`n`e[1;37mchecking for stale backup files"

	$staleFiles = @()
	$staleSubfileCount = 0 # stale files part of stale folders
	$abortDelete = $false

	# for each file, add it to the stale file list if it is applicable
	ls -recurse -force "${outputDrive}:/$root" | foreach {
		$dst = $_.fullname
		$src = $inputDrive + $dst.substring(1)

		if (($staleFiles | foreach {
			if ($dst.toLower().startsWith($_.toLower())) { 1 }
		}).count -ne 0) {
			# directories get listed first, so sub directories don't need to be put in the list.
			$staleSubfileCount++
			return # continue
		}

		if (-not (test-path $src)) {
			# it doesn't exist in the source drive, so it doesn't need to be backed up anymore.
			$staleFiles += @($dst) # add to the list
		}
	}

	# ask for confirmation
	if ($staleFiles.count -eq 0) {
		write-host "no stale backups found"
	}
	else {
		# stale backups found
		write-host "`e[1;33mfound $($staleSubfileCount + $staleFiles.count) stale backups:"
		$staleFiles | % { " - $_" } | write-host
		write-host "" # extra newline

		if ($confirmDelete) {
			write-host "skipping deletion confirmation"
		}
		elseif ($confirmOptions -notcontains (read-host "do you wish to delete them?")) {
			write-host "`e[1;33maborting deletion"

			$abortDelete = $true
		}

		if (-not $abortDelete) {
			write-host "`e[1;32mdeleting stale backups"
		}
	}

	if (-not $abortDelete) {
		if ($dryRun) {
			foreach ($file in $staleFiles) {
				write-host "`e[1;34mcmd: remove-item -recurse -force $file"
			}
		}
		else {
			foreach ($file in $staleFiles) {
				remove-item -recurse -force $file
			}
		}
	} # if (-not $abortDelete)
} # if (-not $keepStale)

###########################################################

write-host "`nupdating reference file modify time"

if (-not $dryRun) {
	([IO.FileInfo] $reference).lastWriteTime = [DateTime]::Now
}

###########################################################

if ($skipVerify) {
	write-host "`nskipping full backup verification"
}
else {
	[uint32] $verifyErrors = 0

	# the object count should always be the input drive object count,
	# except for if 
	write-host "`n`e[1;37mperforming full backup verification on ~$inputCount files"

	$i = 1

	ls -r -force "${outputDrive}:/$root" | foreach {
		$dst = $_.fullname -replace "\\", "/"
		$src = $inputDrive + $dst.substring(1)

		if (test-path -type container $src) {
			# directories don't need to be verified.
			# they are already guaranteed to exist on both drives.

			# increment it anyway so the estimate will be more accurate
			# and it will also make it seem like it is doing more work than it really is.
			$i++
			return
		}

		if (-not (test-path $src)) {
			# stale file. either -dryRun -keepStale was passed.
			return
		}

		$message = "`r`e[0Kverifying file $i/${inputCount}: $dst"

		if ($message.length -ge [Console]::BufferWidth) {
			$message = $message.substring(0, [Console]::BufferWidth - 4) + "..."
		}

		write-host -noNewline $message
		$equal = files-equal $src $dst

		if (-not $equal) {
			# this doesn't necessarily imply corruption.
			# if you edit the file in between when it gets copied and verified, it may say this.
			write-host "`r`e[0K`e[38;5;172mbackup does not reflect source file: $dst"
			$verifyErrors++
		}

		$i++
	}

	$i--

	write-host "$(
		$verifyErrors -eq 0 ? '' : "`e[38;5;172m"
	)finished verifying $i files. found $(switch ($verifyErrors) {
		0 {"no file mismatches"}
		1 {"1 file mismatch"}
		default {"$verifyErrors file mismatches"}
	})"
}

###########################################################

write-host $($dryRun ? "dry run complete. `e[1;33mno changes were made." : "done.")
exit 0
