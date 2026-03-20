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

write-host -noNewline "`r`e[0K    running"
# preprocess only. all the includes are in the same folder.
# remove instruction lines, sub-label lines, %line lines, and blank lines
[Collections.ArrayList] $lines = nasm -I./include/stdlib -e $infile | where {
	$_ -notmatch '^( |\.|%line|$)' -and $_ -notmatch "^\s*\b(res|d)[bwdq]\b"
}
[Collections.ArrayList] $notelines = @()


$i = 0;
$maxlen = ($lines | where {
	$_ -match '^\w+:$' -and $lines[$i - 1] -notmatch '^\[\s*pragma\s+ignore\s+variable\s*\]$'
	$i++;
} | % length | measure -max).maximum

$fn_idx = 1

for ([int] $i = 0; $i -lt $lines.count; $i++) {
	$line = $lines[$i]

	if ($line -match '\[\s*pragma\s+ignore\s+(\w+\.nasm)\s*\]$') {
		$lines.insert($i, "") # insert empty line
		$i++

		$lines[$i] = "; " + $matches[1]
	}
	elseif ($line -match '^\[\s*pragma\s+ignore\s+NOTE:\s+(.+)\s*\]$') {
		[void] $notelines.add($matches[1])
	}
	elseif ($line -match '^\[\s*pragma\s+ignore\s+variable\s*\]$') {
		# skip this line and the next one
		$lines.removeAt($i)
		$lines.removeAt($i)
		$i--
	}
	elseif ($line -match '^(\w+):$') {
		$fn = $matches[1]
		$lines[$i] = "dq $fn" + " "*($maxlen - $fn.length) + "; $fn_idx"

		if ($notelines.count -ne 0) {
			$lines[$i] += " *($($notelines -join ", "))"

			foreach ($note in $notelines) {
				$i--
				$lines.removeAt($i)
			}

			$notelines.clear()
		}

		$fn_idx++
	}
	else {
		# this should be unreachable, and likely means the file was processed wrong up to this point.
		throw "unreachable"
	}
}

"dq kernel_entry ; 0th entry, for the bootloader. zeroed in the kernel.", "",
	";; stdlib function table", $lines > $outfile

write-host "`r`e[0K    done"
exit 0
