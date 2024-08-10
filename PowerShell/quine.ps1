<#
.synopsis
	it's a quine.
	comments and everything.
.notes
	This cmdlet does not support any common parameters, despite what `get-help` says.

	invokeable quine.
	so if you call to this quine and call `.invoke()`, your script is a quine too.
	If you do `.invoke().invoke()` it will stack overflow :)
#>
param()

# without `script:`, it works here but invoking it doesn't always print anything.
$script:myInvocation.myCommand.scriptBlock
