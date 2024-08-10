<#
.synopsis
    return $input -join $joiner
    - $input is from the pipeline.
    - $joiner is the first positional argument.
        it is optional, and defaults to a newline character.
.example
    "asdf", "qwer", "1234" | join -
    returns "asdf qwer 1234"
.example
    "a", "b", "c" | join
    returns "a`nb`nc"
#>
param (
    [Parameter(Position=0, Mandatory=$false)] $joiner = "`n",
    [Parameter(ValueFromPipeline=$true)] $input
)

return $input -join $joiner
