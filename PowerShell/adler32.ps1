<#
.synopsis
	non-cryptographic incremental checksum hashing using Adler-32.

	I know Adler-32 isn't actually a hash function.
	I mostly don't care. I like the word "hash" better than "checksum".

	For the most efficiency, pass multi-byte data as an [IO.Stream] descendent type.
	See the description for command syntax.
	See examples for usage.
.description
	The syntax follows one of the following:

	hash command:
		implicit:
			adler32.ps1 $data
			adler32.ps1 $data $prevHash
			$prevHash | adler32.ps1 $data

		explicit:
			adler32.ps1 hash $data
			adler32.ps1 hash $data $prevHash
			$prevHash | adler32.ps1 hash $data

	undo command:
		adler32.ps1 undo $data
		adler32.ps1 undo $data $prevHash
		$prevHash | adler32.ps1 undo $data

	replace command:
		adler32.ps1 replace $data_A $data_B
		adler32.ps1 replace $data_A $data_B $prevHash
		$prevHash | adler32.ps1 replace $data_A $data_B

	combine command:
		# $length2 can be negative for an undo.
		adler32.ps1 combine $hash1 $hash2 $length2
		$hash1 | adler32.ps1 combine $hash2 $length2
		adler32.ps1 combine $hash2 $length2 # returns $hash2 because $hash1 is 1.

	help command:
		adler32.ps1 help
.parameter hash
	passed either through the pipeline,
	or positionally, after the data.
.parameter silent
	suppress error messages
.inputs
	The inputs depend on the command.
	See the description for the argument syntaxes.
.outputs
	returns a hash value as [uint32].
	on error, it either returns nothing,
	or prints a help message, depending
	on if `-silent` is provided.
.example
	# "hash", "undo", "replace" examples

	$asdf = ./adler32.ps1 hash asdf

	# take previous hash through pipe. input as string
	$as = $asdf | ./adler32.ps1 undo df

	# take previous hash as positional parameter.
	# takes the last characters given, and the replacement
	# expands to an "undo" command followed by a "hash" command
	$abcd = ./adler32.ps1 replace s bcd $as

	$default = ./adler32.ps1 hash "" # 1
.example
	# you can omit the "hash" command as long as the text
	# being hashed is not a valid command

	$qwer1 = ./adler32.ps1 hash qwer
	$qwer2 = ./adler32.ps1      qwer

	write-host ($qwer1 -eq $qwer2) # True

	./adler32 hash # error, "hash" is a valid command
.example
	# you can pass integers directly without casting to string,
	# as well as nullable types.
	# currently this only works with the `hash` command.
	# it will throw an error with other commands.

	$12345_1 = ./adler32.ps1 hash 12345
	$12345_2 = ./adler32.ps1      12345

	write-host ($12345_1 -eq $12345_2) # True

	$54321   = ./adler32.ps1 $([nullable[int]] 54321)
	$asdf    = ./adler32.ps1 $([nullable[int]] $null)
	$x       = ./adler32.ps1 $([bigint] "-99887766554433221100")

	# In these cases, the integer is cast to a string before processing.

	# If you want to do something like `./adler32 hash 32` meaning
	# the character code 32, explicitly cast to [byte] or [char].
.example
	# file stream

	$fileStream = [IO.File]::OpenRead("file.txt")

	./adler32.ps1 $fileStream 100 # hash the first 100 bytes of the file
	$fileStream.position = 16
	./adler32.ps1 $fileStream # hash the remaining part of the file
	# `undo` and `replace` do not support streams
.example
	# memory stream

	[byte[]] $junkData = for ($i = 4096; $i-- ;) {
		get-random -min 0 -max 255
	}
	$memoryStream = [IO.MemoryStream]::new($junkData)

	./adler32.ps1 $memoryStream

	# tradeoff of passing as memory stream vs passing as bytes:
		# extra casting operation
		# faster adler32 implementation (from zlib).
.example
	# miscellaneous errors / weird things

	./adler32.ps1 hash hash # no error
	./adler32.ps1 hash -asdf # error. PowerShell thinks it is a argument
	./adler32.ps1 hash "-asdf" # no error

	./adler32.ps1 hash --asdf # no error
.example
	# example error messages (and -silent)

	PS > ./adler32.ps1
	`adler32.ps1 [CMD]` invalid command ``
	must be a [byte], [byte[]], [char], [char[]], any integer type, a nullable type of previously mentioned type, an [IO.Stream] descendent, or [string] object, or "hash", "undo", "replace", "combine", or "help".

	PS > ./adler32.ps1 hash
	`adler32.ps1 hash [ARG] [ARG]?` invalid argument ``
	must be a [byte], [byte[]], [char], [char[]], any integer type, a nullable type of previously mentioned type, an [IO.Stream] descendent, or [string] object.

	PS > ./adler32.ps1 -silent # suppress error messages
	PS > ./adler32.ps1 hash -s # suppress error messages. -s, -si, -sil, etc. also work for -silent.
.example
	# examples using other types as inputs

	./adler32.ps1 ([char] "a")
	./adler32.ps1 ([byte] 97)
	./adler32.ps1 ([byte] [char] "a")
	./adler32.ps1 ([char[]] "asdf")
	./adler32.ps1 ([byte[]] [char[]] "qwer")
.example
	$abc = ./adler32.ps1 hash abc
	$def = ./adler32.ps1 hash def

	$abcdef1 = ./adler32.ps1 hash abcdef

	# 3 is the length of the data for the second hash.
	$abcdef2 = ./adler32.ps1 combine $abc $def 3

	write-host ($abcdef1 -eq $abcdef2) # $True
.example
	# you can use `combine` as an undo

	$abc    = ./adler32.ps1 hash abc
	$def    = ./adler32.ps1 hash def
	$abcdef = ./adler32.ps1 hash abcdef

	$abcdef = ./adler32.ps1 hash abcdef

	# -3 is the length of the data for the second hash.
	# it is negative to specify an undo
	# use `combine` if you have the hash, and `undo` if
	# you have the actual string of the second argument.
	$abc2 = $abcdef | ./adler32.ps1 combine $def -3
	$abc3 = $abcdef | ./adler32.ps1 undo def

	write-host ($abc -eq $abc2) # $True
	write-host ($abc -eq $abc3) # $True
.example
	./adler32.ps1 help
	# prints (get-help adler32.ps1 -full), with some modifications for simplicity.
	# it does not use a pager, so pass it to `less` or `more` yourself if you want.
#>



param (
	[Parameter(Position = 0)] $a = $null,
	[Parameter(Position = 1)] $b = $null,
	[Parameter(Position = 2)] $c = $null,
	[Parameter(Position = 3)] $d = $null,
	[Parameter(ValueFromPipeline=$true)] [uint32] $hash = 1,
	[switch] $silent # suppress error messages
)

$BASE = 65521u

# accept arbitrary number of bytes
function adler32-hash {
	param (
		[byte[]] $data,
		[Parameter(ValueFromPipeline=$true)] [uint32] $hash = 1
	)

	[uint32] $a = $hash -band 0xffff
	[uint32] $b = $hash -shr 16

	foreach ($byte in $data) {
		$a = ($a + $byte) % $BASE
		$b = ($a + $b   ) % $BASE
	}

	return ($b -shl 16) -bor $a
}
function adler32-undo {
	param (
		[byte[]] $data,
		[Parameter(ValueFromPipeline=$true, Mandatory=$true)]
			[uint32] $hash
	)

	[int] $a = $hash -band 0xffff
	[int] $b = $hash -shr 16

	# undo them in reverse
	foreach ($byte in $data[($data.count - 1)..0]) {
		$b -= $a
		if ($b -lt 0) { $b += $BASE }

		$a -= $byte
		if ($a -lt 0) { $a += $BASE }
	}

	return ([uint32] $b -shl 16) -bor [uint32] $a
}
function adler32-replace {
	param (
		[byte[]] $prevbytes,
		[byte[]] $newbytes,
		[Parameter(ValueFromPipeline=$true)] [uint32] $hash
	)

	return $hash `
		| adler32-undo $prevbytes `
		| adler32-hash $newbytes
}

# this next one is stolen from zlib
# e9d5486e6635141f589e110fd789648aa08e9544
# https://github.com/madler/zlib/blob/<HASH>/adler32.c
# original comments are denoted by `# //` instead of `#`.

# uLong ZEXPORT adler32_z(uLong adler, const Bytef *buf, z_size_t len);
function adler32-stream-hash {
	# this is not the argument order of the zlib implementation,
	# but I like it better like this.
	param (
		[Parameter(Mandatory=$true)] [IO.Stream] $fs,
		[Nullable[uint64]] $len = $null,
		[Parameter(ValueFromPipeline=$true)] [uint32] $hash = 1
	)

	if ($len -eq $null) {
		# this condition isn't actually part of the zlib implementation
		<# z_size_t #> $len = $fs.length - $fs.position
	}

	# // split a-32 into component sums
	[uint32] $b = $hash -shr 16 # zlib also did an `& 0xffff` after this. ¯\(ツ)/¯
	[uint32] $a = $hash -band 0xffff

	# this null check has to happen before the len == 1 check
	# it is after it in the zlib code, but `$fs.readbyte()` throws an error if it's null.
	if ($fs -eq $null) {
		return 1u
	}

	# // in case user likes doing a byte at a time, keep it fast
	if ($len -eq 1) {
		$a += $fs.readbyte()

		if ($a -ge $BASE) {
			$a -= $BASE
		}

		$b += $a

		if ($b -ge $BASE) {
			$b -= $BASE
		}

		return ($b -shl 16) -bor $a
	}

	# // in case short lengths are provided, keep it somewhat fast
	if ($len -lt 16) {
		# zlib just does `while (len--)`,
		# but this only works because `uint64` can roll over past 0 in C.
		# that will error here, so this is used instead.
		$len++
		while (--$len) {
			$b += $a += $fs.readbyte()
		}

		if ($a -ge $BASE) {
			$a -= $BASE
		}

		$b %= $BASE

		return ($b -shl 16) -bor $a
	}

	# 5552 is the largest `n` such that `255 n(n+1)/2 + (65520-1)(n+1) < 2^32`
	# // do length 5552 blocks -- requires just one modulo operation
	while ($len -ge 5552) {
		$len -= 5552
		$n = 347 # 5552 / 16
		do {
			# zlib uses an unrolled loop here.
			for ([byte] $i = 17; --$i ;) {
				$b += $a += $fs.readbyte()
			}
		} while (--$n)

		$a %= $BASE
		$b %= $BASE
	}

	# // do remaining bytes (less than 5552, still just one modulo)
	if ($len) { # // avoid modulos if none remaining
		while ($len -ge 16) {
			$len -= 16

			# zlib uses an unrolled loop here.
			for ([byte] $i = 17; --$i ;) {
				$b += $a += $fs.readbyte()
			}
		}

		# see the comment in the `$len -lt 16` branch.
		$len++
		while (--$len) {
			$b += $a += $fs.readbyte()
		}

		$a %= $BASE
		$b %= $BASE
	}

	return ($b -shl 16) -bor $a
}

function adler32-combine {
	param (
		[Parameter(Mandatory=$true)] [uint32] $hash1,
		[Parameter(Mandatory=$true)] [uint32] $hash2,
		[Parameter(Mandatory=$true)] [int64] $len2
	)

	# This one I also stole from zlib, but I changed it so
	# it would also work for negative lengths, which I
	# interpret as an undo. zlib just returns an invalid
	# checksum in this case.

	<#
	Example:
		$asdf      = ./adler32 asdf
		$qwer      = ./adler32 qwer
		$asdfqwer  = ./adler32 asdfqwer
		$asdfqwer2 = ./adler32 combine $asdf $qwer 4

		# a negative length is treated as an undo.
		$asdf2     = ./adler32 combine $asdfqwer $qwer -4

		$asdfqwer -eq $asdfqwer2
		$asdf -eq $asdf2
	#>

	# This works because in PowerShell, -n % +k -> -(-n % k)
	# i.e. -5 % 4 -> -1, not 3.
	$len2 %= $BASE


	$bw <# backwards #> = [int] ($len -lt 0)
	$fw <# forewards #> = 1 - $bw
	# sgn(len2), but with sgn(0) -> 1. (i.e. a zero-length string is forewards)
	# using sgn(0) -> 0 breaks things.
	$sign = $fw ? 1 : -1

	[uint32] $a1 = $hash1 -band 0xffff
	[uint32] $b1 = $hash1 -shr 16

	[uint32] $a2 = $hash2 -band 0xffff
	[uint32] $b2 = $hash2 -shr 16

	# I still have no idea how the derivation of this works,
	# I just tried things until the reversing worked.

	[uint32] $a = ($a1 + $BASE + $sign*$a2 - $sign) % $BASE
	[uint32] $b = ($b1 + $BASE + $sign*$b2 + ($a1 - $a2*$bw)*$len2 - $len2*$fw) % $BASE

	return ($b -shl 16) -bor $a
}


# only accept single-byte input
function adler32-single-hash {
	param (
		[byte] $byte,
		[Parameter(ValueFromPipeline=$true)] [uint32] $hash = 1
	)
	[uint32] $a = $hash -band 0xffff
	[uint32] $b = $hash -shr 16

	$a += $byte
	if ($a -ge $BASE) {
		$a -= $BASE
	}
	$b += $a

	if ($b -ge $BASE) {
		$b -= $BASE
	}

	return ($b -shl 16) -bor $a
}
function adler32-single-undo {
	param (
		[byte] $prevbyte,
		[Parameter(ValueFromPipeline=$true, Mandatory=$true)]
			[uint32] $hash
	)

	[int] $a = $hash -band 0xffff
	[int] $b = $hash -shr 16

	$b -= $a
	if ($b -le 0) { $b += $BASE }

	$a -= $prevbyte
	if ($a -le 0) { $a += $BASE }

	return ([uint32] $b -shl 16) -bor [uint32] $a
}
function adler32-single-replace {
	param (
		[byte] $prevbyte,
		[byte] $newByte,
		[Parameter(ValueFromPipeline=$true)] [uint32] $hash
	)

	return $hash `
		| adler32-single-undo $prevbyte `
		| adler32-single-hash $newbyte
}

# internal functions
function _help([string] $fn, [string] $cmd) {
	if ($script:silent.IsPresent) {
		exit 0
	}

	switch ($fn) {
		"" {
			write-host "``adler32.ps1 [CMD]`` invalid command ``$cmd``"
			write-host "must be a [byte], [byte[]], [char], [char[]], any integer type, a nullable type of previously mentioned type, an [IO.Stream] descendent, or [string] object, or `"hash`", `"undo`", `"replace`", `"combine`", or `"help`"."
		}
		"hash" {
			write-host "``adler32.ps1 hash [ARG] [ARG]?`` invalid argument ``$cmd``"
			write-host "must be a [byte], [byte[]], [char], [char[]], any integer type, a nullable type of previously mentioned type, an [IO.Stream] descendent, or [string] object."
		}
		"undo" {
			write-host "``adler32.ps1 undo [ARG] [ARG]?`` unkninvalidown argument ``$cmd``"
			write-host "must be a [byte], [byte[]], [char], [char[]], or [string] object."
		}
		"replace" {
			write-host "``adler32.ps1 replace [ARG] [ARG] [ARG]?`` invalid argument ``$cmd``"
			write-host "must be two from [byte], [byte[]], [char], [char[]], or [string] object."
		}
		"combine" {
			write-host "``adler32.ps1 combine [ARG]? [ARG] [ARG]`` invalid argument ``$cmd``"
			write-host "hashes must all be coercible to [uint32], and the length to [int64]."
		}
	}

	exit 0
}
function main {
	param (
		[Parameter(Position=0)] [string] $fn,
		[Parameter(Position=1)] $x = $null,
		[Parameter(Position=2)] $y = $null,
		[Parameter(Position=3)] $z = $null
	)
	# TODO: make integer inputs work with commands other than `hash`.
	switch ($fn) {
		{$_ -in "hash", ""} {
			$hash = $y ?? $script:hash

			if ($x -eq $null) {
				_help $fn $x
			}

			if ($x.GetType() -in [byte], [Nullable[byte]]) {
				$x = [string] [Nullable[char]] $x
			}

			if ($x.GetType() -in [byte[]], [Nullable[byte][]]) {
				$x = [string] [Nullable[char][]] $x
			}

			if ($x.GetType() -in @(
				[int16 ], [uint16 ], [Nullable[int16 ]], [Nullable[uint16 ]],
				[int32 ], [uint32 ], [Nullable[int32 ]], [Nullable[uint32 ]],
				[int64 ], [uint64 ], [Nullable[int64 ]], [Nullable[uint64 ]],
				[int128], [uint128], [Nullable[int128]], [Nullable[uint128]],
				[char], [char[]], [Nullable[char]], [Nullable[char][]],
				[bigint], [Nullable[bigint]]
			)) {
				$x = [string] $x
			}

			switch ($x.GetType()) {
				{$x -is [IO.Stream]} { adler32-stream-hash $x $y $hash }

				{$_ -eq [string] -and $x.length -eq 1} { adler32-single-hash ([char  ] $x) $hash }
				{$_ -eq [string] -and $x.length -ne 1} { adler32-hash        ([char[]] $x) $hash }

				default { _help $fn $x }
			}
		}
		"undo" {
			$hash = $y ?? $script:hash

			if ($x -eq $null) {
				_help $fn $x
			}

			switch ($x.GetType()) {
				{$x -is [IO.Stream]} { throw "undo is not implemented for [IO.Stream] descendent objects" }

				{$_ -in [byte  ], [char  ]} { adler32-single-undo $x $hash }
				{$_ -in [byte[]], [char[]]} { adler32-undo        $x $hash }

				{$_ -eq [string] -and $x.length -eq 1} { adler32-single-undo ([char  ] $x) $hash }
				{$_ -eq [string] -and $x.length -ne 1} { adler32-undo        ([char[]] $x) $hash }

				default { _help $fn $x }
			}
		}
		"replace" {
			$hash = $z ?? $script:hash

			if ($x -eq $null) { _help $fn $x }
			if ($y -eq $null) { _help $fn $y }

			# coerce them away from string type
			if ($x -is [string]) {
				$x = $x -as ($x.length -eq 1 ? [char] : [char[]])
			}
			if ($y -is [string]) {
				$y = $y -as ($y.length -eq 1 ? [char] : [char[]])
			}

			# if one of them is an array, treat them both as arrays
			if ($x -is [array] -or $y -is [array]) {
				adler32-replace $x $y $hash
			}
			else {
				adler32-single-replace $x $y $hash
			}
		}
		"combine" {
			if ($z -eq $null) {
				# 1. adler32.ps1 combine hash2 length
				# 2. hash1 | adler32.ps1 combine hash2 length

				# rotate arguments right by 1.
				$z = $y
				$y = $x
				$x = $script:hash # defaults to 1 if not given.
			}

			# `[some int type] $null` gives 0 and not an error.
			if ($y -eq $null) { _help $fn $y }
			if ($z -eq $null) { _help $fn $z }

			# give sensible errors instead of type-coersion errors
			try { $x = [uint32] $x } catch { _help $fn $x }
			try { $y = [uint32] $y } catch { _help $fn $y }
			try { $z =  [int64] $z } catch { _help $fn $z }


			# adler32.ps1 combine hash1 hash2 length2
			adler32-combine $x $y $z
		}
		"help" {
			$helpText = get-help $script:MyInvocation.MyCommand.Path -full

			# get rid of the argument text because it doesn't actually matter
			# keep `-hash` and `-silent` though.
			$helpText.parameters.parameter = @(
				$helpText.parameters.parameter[4]
				$helpText.parameters.parameter[5]
			)

			$helpText
			exit 0
		}
		default {
			throw "Operation ``$fn`` is not recognized."
		}
	}
}

if ($a -notin "hash", "undo", "replace", "combine", "help") {
	# i.e. `adler32.ps1 asdf` => `adler32.ps1 hash asdf`.
	# implicit "hash" command

	$b = $a
	$a = ""
}

main $a $b $c $d
exit 0
