<#
.synopsis
	converts an exit code to an NTSTATUS name
#>

function generate-full-table([bool] $includeAliases = $false) {
	# generates a dictionary that maps string -> string[] or string -> string
	# assumes GCC is installed and in path.
	# requires MinGW or MSYS2

	$ntstatus = @{}

	cat "$(gcc -print-sysroot)/include/ntstatus.h" | sls -simpleMatch "(NTSTATUS)" | foreach {
		$match = [regex]::match(
			[string] $_,
			"#define\s+(\w+)\s+\(\s*\(\s*NTSTATUS\s*\)\s*(0x[\da-fA-F]+|\d+)\s*\)"
		)

		$status = $match.groups[1].value
		$code   = $match.groups[2].value

		if ($includeAliases) {
			if ($ntstatus.containsKey($code)) {
				$ntstatus.$code += @($status)
			}
			else {
				$ntstatus.add($code, [string[]] @($status))
			}
		}
		elseif (-not $ntstatus.containsKey($code)) {
			# only include the first one for each code
			$ntstatus.add($code, $status)
		}
	}

	return $ntstatus
}

if ($args.count -eq 0 -or $args -ccontains "--help" -or $args -ccontains "-h" -or $args -ccontains "-?") {
	write-host "ntstatus.ps1: converts integer NTSTATUS codes to the corresponding status name"
	write-host ""
	write-host "Options:"
	write-host "    -h, -?, --help     print this message and exit. (also if no arguments are given)"
	write-host "    --table            generate the entire table instead of doing a single lookup"
	write-host "    --allow-aliases    allow aliases in the table generated by --table."
	write-host "                       essentially makes every value be `[string[]]` instead of `[string]`."
	write-host "    --fast             use a hard-coded subset of common exit codes instead of a full lookup."
	write-host "    --fallback         do a full lookup instead of erroring on cache misses (for --fast)."
	write-host "    --prev             used instead of the code to make it use the most recent program exit code."
	write-host ""
	write-host '`--allow-aliases` without `--table` is ignored.'
	write-host '`--fallback` without `--fast` is ignored.'
	write-host '`--help`, etc. takes precedence over `--table`, which takes precedence over `--fast`.'
	write-host 'for regular searches (no `--table`), the last argument is used as the status code.'
	write-host ""
	write-host 'the behavior you probably want is `ntstatus --fast --fallback $code`'

	exit 0
}

if ($args -ccontains "--table") {
	generate-full-table $($args -ccontains "--allow-aliases")
	exit 0
}

$code = $args[-1]
if ($code -eq "--prev") {
	$code = $lastExitCode
}
$code = $code.gettype() -in @([int], [uint]) ?
	'0x{0:X8}' -f ($code -as $code.gettype()) : # the `-as $code.gettype()` is required for some reason.
	[string] $code

if ($args -ccontains "--fast") {
	# only recognizes a select number of the status codes.
	# some common-sounding ones, and some serious-sounding ones. (I basically just picked randomly)
	switch ($code) {
		"0x00000000" { "STATUS_SUCCESS"							; exit 0 }
		"0xC0000001" { "STATUS_UNSUCCESSFUL"					; exit 0 }
		"0xC0000005" { "STATUS_ACCESS_VIOLATION"				; exit 0 }
		"0xC0000007" { "STATUS_PAGEFILE_QUOTA"					; exit 0 }
		"0xC0000008" { "STATUS_INVALID_HANDLE"					; exit 0 }
		"0xC000000D" { "STATUS_INVALID_PARAMETER"				; exit 0 }
		"0xC000000F" { "STATUS_NO_SUCH_FILE"					; exit 0 }
		"0xC0000017" { "STATUS_NO_MEMORY"						; exit 0 }
		"0xC000001D" { "STATUS_ILLEGAL_INSTRUCTION"				; exit 0 }
		"0xC0000022" { "STATUS_ACCESS_DENIED"					; exit 0 }
		"0xC0000025" { "STATUS_NONCONTINUABLE_EXCEPTION"		; exit 0 }
		"0xC0000032" { "STATUS_DISK_CORRUPT_ERROR"				; exit 0 }
		"0xC0000043" { "STATUS_SHARING_VIOLATION"				; exit 0 }
		"0xC0000053" { "STATUS_EA_CORRUPT_ERROR"				; exit 0 }
		"0xC0000054" { "STATUS_FILE_LOCK_CONFLICT"				; exit 0 }
		"0xC0000055" { "STATUS_LOCK_NOT_GRANTED"				; exit 0 }
		"0xC000008C" { "STATUS_ARRAY_BOUNDS_EXCEEDED"			; exit 0 }
		"0xC000008E" { "STATUS_FLOAT_DIVIDE_BY_ZERO"			; exit 0 }
		"0xC0000094" { "STATUS_INTEGER_DIVIDE_BY_ZERO"			; exit 0 }
		"0xC000009A" { "STATUS_INSUFFICIENT_RESOURCES"			; exit 0 }
		"0xC00000BB" { "STATUS_NOT_SUPPORTED"					; exit 0 }
		"0xC00000FD" { "STATUS_STACK_OVERFLOW"					; exit 0 }
		"0xC0000102" { "STATUS_FILE_CORRUPT_ERROR"				; exit 0 }
		"0xC0000129" { "STATUS_TOO_MANY_THREADS"				; exit 0 }
		"0xC000013A" { "STATUS_CONTROL_C_EXIT"					; exit 0 }
		"0xC0000142" { "STATUS_DLL_INIT_FAILED"					; exit 0 }
		"0xC000014B" { "STATUS_PIPE_BROKEN"						; exit 0 }
		"0xC0000185" { "STATUS_IO_DEVICE_ERROR"					; exit 0 }
		"0xC000023C" { "STATUS_NETWORK_UNREACHABLE"				; exit 0 }
		"0xC0000374" { "STATUS_HEAP_CORRUPTION"					; exit 0 }
		"0xC0000409" { "STATUS_STACK_BUFFER_OVERRUN"			; exit 0 }
		"0xC000041D" { "STATUS_FATAL_USER_CALLBACK_EXCEPTION"	; exit 0 }
		default {
			if ($args -ccontains "--fallback") {
				break
			}

			"unknown status" # it may exist, but is not known
			exit 2
		}
	}
}
# only generate some of the table.

# $status = fgrep -e $code "$(gcc -print-sysroot)/include/ntstatus.h") | awk '{$print $2}'
$status = (sls -raw -simple $code "$(gcc -print-sysroot)/include/ntstatus.h") -split "\s+" | select -index 1

if ($status -eq $null) {
	"nonexistent status"
	exit 1
}

$status
exit 0
