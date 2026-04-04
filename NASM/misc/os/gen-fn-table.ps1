#requires -version 7

<#
.synopsis
	generates a function table given the input file and output file.
	functions are assigned ordinals in the table in the same order they are defined.
#>
param (
	[Parameter(Mandatory=$true)] [string] $infile,
	[Parameter(Mandatory=$true)] [string] $outfile
)

# TODO: figure out some kind of syntax to declare the existence of macros in the standard library
# TODO: perhaps also make syntax to make stdlib extern variables?

write-host -noNewline "`r`e[0K    running"
# preprocess only. all the includes are in the same folder.
# remove instruction lines, sub-label lines, %line lines, and blank lines
[Collections.ArrayList] $lines = nasm -I./include -I./include/stdlib -e $infile | where {
	$_ -notmatch '^( |\.|%line|$)' -and $_ -notmatch "^\s*\b(res|d)[bwdq]\b"
}
[Collections.ArrayList] $notelines = @()

$i = 0;
$maxlen = ($lines | where {
	$_ -match '^\w+:$' -and $lines[$i - 1] -notmatch '^\[\s*pragma\s+ignore\s+variable\s*\]$'
	$i++;
} | % length | measure -max).maximum

if ($maxlen -lt "kernel_entry".length) {
	$maxlen = "kernel_entry".length
}

$fn_idx = 1

$file = "<unknown.nasm>" # in case it encounters a subsystem pragma before a file pragma.

$table_size = 0
for ([int] $i = 0; $i -lt $lines.count; $i++) {
	$line = $lines[$i]

	if ($line -match '^\[\s*pragma\s+ignore\s+variable\s*\]$') {
		# skip this line and the next one
		$lines.removeAt($i)
		$lines.removeAt($i--)
	}
	elseif ($line -match '^(\w+):$') {
		$table_size++
	}
	elseif ($line -match '^(\w+) ') {
		# probably a multiline macro. just ignore it.
		$lines.removeAt($i--)
	}
	elseif ($line -match '^\[\s*(org|(?:sect)?align|warning|global|extern|section|segment|absolute|bits|common|cpu)\s+[^\]]+\]$') {
		# exclude directives that don't matter
		$lines.removeAt($i--)
	}
}

$table_size++ # including the 0 index element

$idx_pad = "$($table_size - 1)".length

for ([int] $i = 0; $i -lt $lines.count; $i++) {
	$line = $lines[$i]

	if ($line -match '\[\s*pragma\s+ignore\s+file\s+([^\]]+)\s*\]$') {
		$lines.insert($i, "") # insert empty line
		$i++

		$file = $matches[1]
		$lines[$i] = "`t;; " + $file
	}
	elseif ($line -match '\[\s*pragma\s+ignore\s+subsystem\s+([^\]]+)\s*\]$') {
		$lines.insert($i, "") # insert empty line
		$i++

		$lines[$i] = "`t;; $file ($($matches[1]))"
	}
	elseif ($line -match '^\[\s*pragma\s+ignore\s+NOTE:\s+(.+)\s*\]$') {
		[void] $notelines.add($matches[1])
	}
	elseif ($line -match '^(\w+):$') {
		$fn = $matches[1]
		$lines[$i] = "`tdq $fn" + " "*($maxlen - $fn.length) + ";; " + " "*($idx_pad - "$fn_idx".length) + "$fn_idx"

		if ($notelines.count -ne 0) {
			$lines[$i] += " *($($notelines -join ", "))"

			foreach ($note in $notelines) {
				$lines.removeAt(--$i)
			}

			$notelines.clear()
		}

		$fn_idx++
	}
	else {
		# this should be unreachable.
		# if it executes, it likely means the file was processed wrong up to this point.
		throw "unreachable, line ${i}: `"$line`""
	}
}

$fn = "kernel_entry"

@(
	"%ifndef STDLIB_FN_TABLE_NASM",
	"%define STDLIB_FN_TABLE_NASM",
	"",
	"stdlib_fntable:",
	".size:",
	("`tdq $fn" + " "*($maxlen - $fn.length) + ";; " + " "*($idx_pad - 1) + "0 *(for the bootloader, set to the table size in the kernel)"),
	$lines,
	"",
	"%assign STDLIB_FNTABLE_SIZE $fn_idx"
	""
	"%endif ; %ifndef STDLIB_FN_TABLE_NASM"
) > $outfile

write-host "`r`e[0K    done"
exit 0
