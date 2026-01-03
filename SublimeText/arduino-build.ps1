<#
.synopsis
	Comment-based arduino-cli config DSL intended for use in a Sublime Text build system.
	Runs a compilation command and potentially also attaches the sketch to a board.
.description
	looks for single-line comments at the top of the file in one of the following forms:
		- `// command: operand` (command with operands)
		- `// command` (command with no operands)
		- `//` (empty line)

		the whitespace can be basically whatever as long as there aren't newlines in the middle.
		the C comment cannot have whitespace before it though.
		Comments start with `#`, but it has to be the first non-whitespace character after `//`.

	commands and operands are case sensitive.
	some commands take more than one operand, separated by commas, e.g. `set: key, value`

	commands without operands:
		- nocompile    cancel the compilation when encountered. used for files you don't want accidentally compiled.
		- upload       upload the program to the board when done
		- noupload     cancels out "upload". don't upload. this is the default.
		- verbose      pass `--verbose` to `arduino-cli compile`
		- clean        pass `--clean` to `arduino-cli compile`
		- quiet        pass `--quiet` to `arduino-cli compile`
		- verify       pass `--verify` to `arduino-cli compile`
		- else         else statement for conditional blocks
		- endif        ends conditional blocks
		- noop         does nothing and takes no operands
	commands with operands:
		- arg          append an argument to the arguments given to `arduino-cli compile`.
		- args         tab separated list of arguments to append to the list.
		- fqbn/board   specify the fully qualified board name to give to `arduino-cli board attach`
		- port         specify the port address to give to `arduino-cli board attach`
		- programmer   specify the board progammer to give to `arduino-cli board attach`
		- libs         pass `--libraries [operand]` to `arduino-cli compile`
		- cppflags     specify extra C++ flags to give to `arduino-cli compile`
		- cflags       specify extra C flags to give to `arduino-cli compile`
		- ldflags      specify extra linker flags to give to `arduino-cli compile`
		- buildflags   specify extra flags to give to all stages of `arduino-cli compile`
		- Sflags       specify extra assembler flags to `arduino-cli compile`
		- set          set a variable. pass with only the variable name to delete the variable
		               variables should be alphanumeric. the operands are trimmed of leading/ending whitespace
		- append       append a variable to another one with a space in between.
		- copy         copy a variable's value into another variable.
		- ifdef        the same as NASM's `%ifdef`.    the argument must be a variablea
		- ifndef       the same as NASM's `%ifndef`.   the argument must be a variable
		- elifdef      the same as NASM's `%elifdef`.  the argument must be a variable
		- elifndef     the same as NASM's `%elifndef`. the argument must be a variable
		- ifidn        the same as NASM's `%ifidn`.    the first argument must be a variable and the second is a constant
		- ifnidn       the same as NASM's `%ifnidn`.   the first argument must be a variable and the second is a constant
		- elifidn      the same as NASM's `%elifidn`.  the first argument must be a variable and the second is a constant
		- elifnidn     the same as NASM's `%elifnidn`. the first argument must be a variable and the second is a constant
		- dsl          change internal configuration stuff rather than execute something in the compilation
		    silent     suppress all warnings and log output (including `dsl: log`). fatal errors print anyway
		    nosilent   undo `dsl: silent` and return to normal logging
		    dryrun     don't actually run any external commands
		    strict     treat all warnings as fatal errors
		    nostrict   revert back to non-strict mode
		    version    throw an error if the `arduino-cli` version doesn't fit the requirements
		    logmode    operand should be `raw` or `default`. in default mode, it prefixes with `arduino-build.ps1: `
		    log        call `log` in the DSL space with the given operand.
		    warn       call `warning` in the DSL space with the given operand.
		    stop       stop parsing the DSL, and move on to config and compilation
		- noop         does nothing and ignores its operands. basically a comment line

	variables are only allowed in `if` condition arguments.
.parameter infile
	specify the main program file, likely `.ino`.
	If it is blank, it is assumed to be the same as the folder name.

	giving `--help` as the infile, is the same as passing `-help`.
.parameter upload
	if true, `--upload` is appended to the `arduino-cli` arguments.
	has the same effect as giving a `// upload` command.
	default is false.
.parameter silent
	if true, suppresses non fatal output from the parser.
	has the same effect as giving a `// dsl: silent` command.
	default is false.
.parameter dryrun
	if true, suppresses external effects of the program.
	has the same effect as giving a `// dsl: dryrun` command.
	default is false.
.parameter strict
	if true, suppresses external effects of the program.
	has the same effect as giving a `// dsl: dryrun` command.
	default is false.
.parameter help
	if passed, it prints the help text and exits.
#>
param (
	[string] $infile     = "",
	[bool]   $upload     = $false,
	[bool]   $silent     = $false,
	[bool]   $dryrun     = $false,
	[bool]   $strict     = $false,
	[switch] $help
)

if ($help.isPresent -or $infile -eq "--help") {
	get-help -full $MyInvocation.MyCommand.Source
	exit 0
}

# this has been `sketch.yaml` since arduino-cli v0.30.0
[string] $configfile = "sketch.yaml"

# TODO: change "stop" to "fatal" and add a second one that take an argument.
# TODO: add something to change `compiler.optimization_flags` build param
# TODO: update the exit codes.
# TODO: give specialized errors for using commands that need args and passing no args, or vice versa
# TODO: figure out how to combine multiple `--build-property` things into one.
# TODO: keep track of the line number and include them in warning/error messages
# TODO: allow nested conditions with recursion in the main function
# TODO: consider adding a foreach?

if (-not (get-alias -ea ignore ard)) {
	set-alias ard arduino-cli
}

function log([string] $message, [switch] $noNewline) {
	if ($noNewline.isPresent) {
		write-host "arduino-build.ps1: $message" -noNewline
	}
	else {
		write-host "arduino-build.ps1: $message"
	}
}

function warning([string] $message) {
	if ($strict) {
		fatal $message
	}

	write-host "arduino-build.ps1: WARNING: $message"
}

function overuse([string] $command) {
	warning "singleton command ``$command`` encountered more than once."
}

function fatal([int] $exitcode, [string] $message) {
	# remove the alias if there is one. always print fatal error messages.
	# also remove a possible arduino-cli alias.
	remove-alias -ea ignore write-host
	remove-alias -ea ignore arduino-cli

	write-host "arduino-build.ps1: FATAL: $message"
	exit $exitcode
}

function parse-noarg-command([string] $command) {
	switch -CaseSensitive ($command) {
		"nocompile" {
			fatal 0 "command ``nocompile`` encountered. canceling compilation."
		}
		"upload" {
			if ($script:upload) {
				overuse "upload"
			}

			$script:upload = $true
		}
		"noupload" {
			# this is the default, but make it explicit
			$script:upload = $false
		}
		"verbose" {
			if ("--verbose" -cin $script:params -or "-v" -cin $script:params) {
				overuse "verbose"
			}

			$script:params += @("--verbose")
		}
		"clean" {
			if ("--clean" -cin $script:params) {
				overuse "clean"
			}

			$script:params += @("--clean")
		}
		"verify" {
			if ("--verify" -cin $script:params -or "-t" -cin $script:params) {
				overuse "verify"
			}

			$script:params += @("--verify")
		}
		"quiet" {
			if ("--quiet" -cin $script:params -or "-q" -cin $script:params) {
				overuse "quiet"
			} else {
				$script:params += @("--quiet")
			}
		}

		"else" {
			switch ($script:branching) {
				"none" { fatal 1 "command ``else`` encountered without a corresponding ``if``. exiting." }
				"live" { $script:branching = "dead" }
				"skip" { $script:branching = "live" }
				"dead" { <# $script:branching = "dead" #> }
			}
		}

		"endif" {
			if ($script:branching -ceq "none") {
				fatal 1 "command ``endif`` encountered without a corresponding ``if``. exiting."
			}
			else {
				$script:branching = "none"
			}
		}

		"noop" {}

		"quite" {
			fatal 1 "unknown command ``quite`` encountered. Did you mean ``quiet``? exiting."
		}
		"silent" {
			fatal 1 "unknown command ``silent`` encountered. Did you mean one of [``quiet``, ``dsl: silent``]? exiting."
		}
		default {
			fatal 1 "unknown command ``$command`` encountered. exiting."
		}
	}
}

function parse-arg-command([string] $command, [string] $operand) {
	switch -CaseSensitive ($command) {
		"arg" {
			$script:params += @($operand)
		}
		"args" {
			# split at tabs
			$script:params += $operand -split "\s*\t\s*"
		}
		{$command -cin "fqbn", "board"} {
			if ($script:fqbn -cne $null) {
				overuse "fqbn/board"
			}

			# short names for the common looking ones.
			if ($operand -in @(
				"esplora", "ethernet", "fio", "leonardo", "mega", "micro", "mini", "nano",
				"pro", "uno", "unowifi", "yun", "lilypad"
			)) {
				$operand = "arduino:avr:$operand"
			}

			$script:fqbn = $operand
		}
		"port" {
			if ($script:port -cne $null) {
				overuse "port"
			}

			$script:port = $operand
		}
		"programmer" {
			if ($script:programmer -cne $null) {
				overuse "programmer"
			}

			$script:programmer = $operand
		}
		"libs" {
			$script:params += ("--libraries", $operand)
		}

		"cppflags"   { $script:params += @("--build-property",  "compiler.cpp.extra_flags=$operand") }
		"cflags"     { $script:params += @("--build-property",    "compiler.c.extra_flags=$operand") }
		"ldflags"    { $script:params += @("--build-property",   "compiler.ld.extra_flags=$operand") }
		"buildflags" { $script:params += @("--build-property",         "build.extra_flags=$operand") }
		"Sflags"     { $script:params += @("--build-property",    "compiler.S.extra_flags=$operand") }
		"def"        { $script:params += @("--build-property",  "compiler.cpp.extra_flags=-D$operand") }

		"set" {
			$match = [regex]::match($operand, "^(\w+)\s*(?:,\s*(.*))?$")

			if (-not $match.success) {
				fatal 1 "command ``set`` encountered with invalid operand. exiting."
			}

			$variable = $match.groups[1].value

			if ($match.groups[2].success) {
				$script:variables.$variable = $match.groups[2].value
			}
			else {
				# no value given

				if ($script:variables.contains($variable)) {
					$script:variables.remove($variable)
				}
				else {
					warning "deleting variable ``$variable`` that doesn't exist."
				}
			}
		} # set
		"append" {
			$match = [regex]::match($operand, "^(\w+)\s*,\s*(\w+)$")

			if (-not $match.success) {
				fatal 1 "command ``append`` encountered with invalid operand. exiting."
			}

			$var1 = $match.groups[1].value
			$var2 = $match.groups[2].value

			if (-not $script:variables.contains($var1)) {
				fatal 1 "command ``append`` adding to a variable ``$var1`` that doesn't exist. exiting."
			}

			if (-not $script:variables.contains($var2)) {
				fatal 1 "command ``append`` adding from a variable ``$var2`` that doesn't exist. exiting."
			}

			$script:variables.$var1 += " " + $script:variables.$var2
		} # append
		"copy" {
			$match = [regex]::match($operand, "^(\w+)\s*,\s*(\w+)$")

			if (-not $match.success) {
				fatal 1 "command ``copy`` encountered with invalid operand. exiting."
			}

			$var1 = $match.groups[1].value
			$var2 = $match.groups[2].value

			if (-not $script:variables.contains($var1)) {
				fatal 1 "command ``copy`` copying to a variable ``$var1`` that doesn't exist. exiting."
			}

			if (-not $script:variables.contains($var2)) {
				fatal 1 "command ``copy`` copying from a variable ``$var2`` that doesn't exist. exiting."
			}

			$script:variables.$var1 = $script:variables.$var2
		} # append

		{$command -cin "ifdef", "ifndef", "elifdef", "elifndef"} {
			if ($command -cin "ifdef", "ifndef") {
				if ($script:branching -cne "none") {
					fatal 1 "conditional command ``$command`` encountered within another branch. exiting."
				}
			}
			else { # elifdef or elifndef
				if ($script:branching -ceq "none") {
					fatal 1 "conditional command ``$command`` encountered without a corresponding ``if``. exiting."
				}
				elseif ($script:branching -cin "live", "dead") {
					$script:branching = "dead"
					return
				}
				<# else { # skip
					# do nothing.
				} #>
			}

			$script:branching = $command.endsWith("ifdef") ?
				(     $script:variables.contains($operand) ? "live" : "skip") :
				(-not $script:variables.contains($operand) ? "live" : "skip")
		} # ifdef

		{$command -cin "ifidn", "ifnidn", "elifidn", "elifnidn"} {
			if ($command -cin "ifidn", "ifnidn") {
				if ($script:branching -cne "none") {
					fatal 1 "conditional command ``$command`` encountered within another branch. exiting."
				}
			}
			else { # elifidn or elifnidn
				if ($script:branching -ceq "none") {
					fatal 1 "conditional command ``$command`` encountered without a corresponding ``if``. exiting."
				}
				elseif ($script:branching -cin "live", "dead") {
					$script:branching = "dead"
					return
				}
				<# else { # skip
					# do nothing.
				} #>
			}

			$match = [regex]::match($operand, "^(\w+)\s*,\s*(.*)$")

			if (-not $match.success) {
				fatal 1 "command ``$command`` encountered with invalid arguments"
			}

			$variable = $match.groups[1].value
			$constant = $match.groups[2].value

			if (-not $script:variables.contains($variable)) {
				fatal 1 "command ``$command`` given with a nonexistent variable."
			}

			$script:branching = $command.endsWith("ifidn") ?
				($script:variables.$variable -ceq $constant ? "live" : "skip") :
				($script:variables.$variable -cne $constant ? "live" : "skip")
		} # ifidn

		"dsl" {
			if ($operand -ceq "silent") {
				if ($script:silent) {
					# this line does nothing
					overuse "dsl: silent"
				}

				$script:silent = $true

				function noop {}
				set-alias write-host noop
			}
			elseif ($operand -ceq "nosilent") {
				$script:silent = $false
				remove-alias -ea ignore write-host
			}
			elseif ($operand -ceq "dryrun") {
				if ($script:dryrun) {
					overuse "dsl: dryrun"
				}
				else {
					log "enabling dry-run"
				}

				$script:dryrun = $true
				function noop {}
				set-alias arduino-cli noop
			}
			elseif ($operand -ceq "strict") {
				if ($script:strict) {
					overuse "dsl: strict"
				}

				$script:strict = $true
			}
			elseif ($operand -ceq "nostrict") {
				$script:strict = $false
			}
			elseif ($operand -ceq "stop") {
				do {
					$line = $script:reader.readline()
				} while (-not $script:reader.EndOfStream -and $line.startsWith("//"))
			}
			elseif ($operand.startsWith("version")) {
				$match = [regex]::match($operand, "^version\s*,\s*((?:[<>]=?|[!=^~])?)\s*(\d+\.\d+(\.\d+)?)$")

				if (-not $match.success) {
					fatal 1 "command ``dsl: version`` given with invalid syntax. exiting."
				}

				$v1 = ${script:ard version}

				$comparison = $match.groups[1].value
				$v2 = $match.groups[2].value

				if (-not $match.groups[2].success) {
					$v2 += ".0"
				}

				$v2 = [version] $v2

				$condition = switch ($comparison) {
					">"  {$v1 -gt $v2}
					">=" {$v1 -ge $v2}

					"<"  {$v1 -lt $v2}
					"<=" {$v1 -le $v2}

					"!" {$v1 -ne $v2}
					"=" {$v1 -eq $v2}
					""  {$v1 -eq $v2}

					"^" {
						# >= but within the same major version
						$v1.major -eq $v2.major -and (
							($v1.minor -gt $v2.minor) -or
							($v1.minor -eq $v2.minor -and $v1.build -ge $v2.build)
						)
					}

					"~" {
						# >= but within the same minor version
						$v1.major -eq $v2.major -and `
						$v1.minor -eq $v2.minor -and `
						$v1.build -ge $v2.build
					}
					default {
						fatal 1 "unreachable code reached parsing ``dsl: version``."
					}
				}

				if (-not $condition) {
					fatal 1 "command ``dsl: version`` check failed: $v1 $comparison $v2. exiting."
				}
			} # version
			elseif ($operand.startsWith("logmode")) {
				$match = [regex]::match($operand, "^logmode\s*,\s*(\w+)$")

				if (-not $match.success) {
					fatal 1 "command ``dsl: logmode`` given with invalid syntax. exiting."
				}

				$mode = $match.groups[1].value

				if ($mode -notin "raw", "default") {
					fatal 1 "command ``dsl: logmode`` given with invalid operands."
				}

				$script:logmode = $mode
			}
			elseif ($operand.startsWith("log")) {
				$match = [regex]::match($operand, "^log\s*,\s*(.*)$")

				if (-not $match.success) {
					fatal 1 "command ``dsl: log`` given with invalid syntax. exiting."
				}

				$message = $match.groups[1].value

				if ($logmode -ceq "raw") {
					write-host $message
				}
				else {
					log $message
				}
			}
			elseif ($operand.startsWith("warn")) {
				$match = [regex]::match($operand, "^warn\s*,\s*(.*)$")

				if (-not $match.success) {
					fatal 1 "command ``dsl: warn`` given with invalid syntax. exiting."
				}

				$message = $match.groups[1].value

				if ($logmode -ceq "raw") {
					write-host "WARNING: $message"
				}
				else {
					warning $message
				}
			}
			else {
				fatal 1 "command ``dsl`` encountered with an invalid operand."
			}
		} # dsl

		"noop" {}

		{$command -in "fqdn", "fbqn", "fdqn", "fqnb", "fqnd"} {
			fatal 1 "unknown command ``$command`` encountered. Did you mean ``fqbn``? exiting."
		}
		"programer" {
			fatal 1 "unknown command ``programer`` encountered. Did you mean ``programmer``? exiting."
		}
		"nupload" {
			fatal 1 "unknown command ``nupload`` encountered. Did you mean one of [``upload``, ``noupload``]? exiting."
		}
		"cpflags" {
			fatal 1 "unknown command ``cpflags`` encountered. Did you mean one of [``cflags``, ``cppflags``]? exiting."
		}
		"sflags" {
			fatal 1 "unknown command ``sflags`` encountered. Did you mean ``Sflags``? exiting."
		}
		{$command -in "elseifdef", "elseifndef", "elseifidn", "elseifnidn"} {
			fatal 1 "unknown command ``$command`` encountered. Did you mean ``$("el" + $command.substring(4))``? exiting."
		}
		{$command -in "elsifdef", "elsifndef", "elsifidn", "elsifnidn"} {
			fatal 1 "unknown command ``$command`` encountered. Did you mean ``$("el" + $command.substring(3))``? exiting."
		}
		default {
			fatal 1 "unknown command ``$command`` encountered. exiting."
		}
	} # switch
}

function parse-line([string] $line) {
	if ([regex]::match($line, "^//\s*#").success) {
		# hashtags start commented lines.
		# comments only work on empty lines.
		return $true
	}

	if ([regex]::match($line, "^//\s*$").success) {
		# empty line
		return $true
	}

	$match = [regex]::match($line, "^//\s*(\w+)\s*:\s*(.+)\s*$")
	if ($match.success) {
		$command = $match.groups[1].value
		$operand = $match.groups[2].value

		if ($script:branching -ceq "dead" -or `
			($script:branching -ceq "skip" -and $command -cnotin "elifdef", "elifidn")) {
			$command = "noop"
		}

		parse-arg-command $command $operand
		return $true
	}

	# not a `key: value` command
	$match = [regex]::match($line, "^//\s*(\w+)\s*$")

	if (-not $match.success) {
		# not a command. no more config commands
		return $false
	}

	$command = $match.groups[1].value

	if (($script:branching -ceq "skip" -and $command -cnotin "else", "endif") -or
		($script:branching -ceq "dead" -and $command -cne "endif")
	) {
		# NOTE: the elif stuff all have arguments so they won't be here
		# change the command to a noop if it should be skipped.
		# skip everything except stuff that changes branching.
		$command = "noop"
	}

	parse-noarg-command $command
	return $true
}

if (-not (gcm -type app -ea ignore arduino-cli)) {
	fatal 1 "required program ``arduino-cli`` was not found. exiting."
}

if ($infile -ceq "") {
	$infile = pwd | split-path -leaf
}

# --format jsonmini hasn't always existed, so it can't be used.
# the `2> $null` is to hide possible printouts that there is a newer version.
[version] ${ard version} = (arduino-cli version --format json 2> $null | convertfrom-json).VersionString

if (${ard version} -lt "0.30.0") {
	fatal 1 "invalid ``arduino-cli`` version: >= 0.30.0 required, found ${ard version}. exiting."
}


# $addrs = (ard board list --format jsonmini 2> $null | convertfrom-json).detected_ports | foreach {$_.port.address}

$fqbn        = $null # fully qualified board name
$port        = $null
$programmer  = $null
$dsl_silent  = $null
$params      = @()
$variables   = @{}
$branching   = "none" # none, live, skip, or dead
	# none: not in a branch at all
	# live: the current branch is active
	# skip: the current branch condition returned false. skipping the branch content
	# dead: one of the branches already ran, the rest of the branches don't matter and are all skipped
$logmode = "default"

$reader = [IO.StreamReader]::new((convert-path $infile))

while (-not $reader.EndOfStream) {
	$line = $reader.readline()

	if (-not (parse-line $line)) {
		break
	}
}

$reader.close()

if ($branching -cne "none") {
	fatal 1 "conditional block is never terminated"
}

# configuration stuff
if (-not (test-path $configfile)) {
	$cfg_cmd_args = @()

	if ($fqbn -cne $null) {
		$cfg_cmd_args += @("-b", $fqbn)
	}

	if ($port -cne $null) {
		$cfg_cmd_args += @("-p", $port)
	}

	if ($programmer -cne $null) {
		$cfg_cmd_args += @("-P", $programmer)
	}

	log "creating config file: $($cfg_cmd_args -join ' ')"
	arduino-cli board attach @cfg_cmd_args
}
else {
	# sketch.yaml exists
	[string[]] $config = get-content $configfile
	$found = @()
	$cfg_cmd_args = @()

	for ([int] $i = 0; $i -lt $config.count; $i++) {
		if ($config[$i] -eq "") {
			continue
		}

		$match = [regex]::match($config[$i], "^(\w+):\s*(.+)$")

		if (-not $match.success) {
			fatal 1 "YAML config file line is not a key-value pair. exiting."
		}

		$key = $match.groups[1].value
		$val = $match.groups[2].value

		switch ($key) {
			"default_fqbn" {
				if ($fqbn -cne $null -and $fqbn -cne $val) {
					$cfg_cmd_args += @("-b", $fqbn)
				}

				$found += @("fqbn")
			}
			"default_port" {
				if ($port -cne $null -and $port -cne $val) {
					$cfg_cmd_args += @("-p", $port)
				}

				$found += @("port")
			}
			"default_programmer" {
				if ($programmer -cne $null -and $programmer -cne $val) {
					$cfg_cmd_args += @("-P", $programmer)
				}

				$found += @("programmer")
			}
			default {
				fatal 1 "unexpected/unknown key in $configfile. exiting."
			}
		} # switch
	} # for

	# check for the ones that are missing from the config file
	if ("fqbn" -notin $found -and $fqbn -cne $null) {
		$cfg_cmd_args += @("-b", $fqbn)
	}
	if ("port" -notin $found -and $port -cne $null) {
		$cfg_cmd_args += @("-p", $port)
	}
	if ("programmer" -notin $found -and $programmer -cne $null) {
		$cfg_cmd_args += @("-P", $programmer)
	}

	# update all the ones that need to be updated
	if ($cfg_cmd_args.count -gt 0) {
		log "updating config file: $($cfg_cmd_args -join ' ')"
		arduino-cli board attach @cfg_cmd_args
	}
} # else

# compilation
if ($upload -and ("-u" -cnotin $params) -and ("--upload" -cnotin $params)) {
	$params += @("--upload")
}

log "compiling with params: $($params ? $params -join ' ' : '[None]')"
arduino-cli compile @params

remove-alias -ea ignore arduino-cli
remove-alias -ea ignore write-host
exit 0
