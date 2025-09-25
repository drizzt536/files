# ghdl but automatically with the 2008 standard.

switch ($args.length) {
	0 {ghdl}
	1 {ghdl $($args[0]) --std=08}
	default {
		$cmd = $args[0]
		$rest = $args[1..($args.count)]
		ghdl $cmd --std=08 @rest
	}
}
