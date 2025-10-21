# assume the program was already analyzed and synthesized in quartus
# also assume did `cd %ProjectRoot%/simulation/questa`
# layout load Simulate

# NOTE: if totalTime < 2^(number of input signals), then it the script will error
#       out half way through. this is because the resolution can't go below 1 ns.

if {![info exists height   ]} {set height      32}; # wave height in pixels. the default is 17.
if {![info exists totalTime]} {set totalTime 1024}; # total simulation time in ns

set entities {}; # list of entities in the current design unit

# design unit data stuff
set unit [vdir]
set len [llength $unit]

# figure out how many entities `work` has.
for {set i 0} {$i < $len} {incr i} {
	set item [lindex $unit $i]
	if {$item != {ENTITY}} {continue}

	if {[incr i] == $len} {error "invalid design unit data. {ENTITY} was the last token"}

	lappend entities [lindex $unit $i]
}

unset unit len i item

if {[llength $entities] == 1} {
	# there is only one entity, so just simulate that one.
	vsim [lindex $entities 0]
} else {
	# figure out which entity to simulate.
	puts "Entities: $entities"

	# this should always run at least once.
	while {1} {
		puts -nonewline "Which do you want to simulate? "
		flush stdout
		gets stdin choice

		# just try it. this should update the $entity variable if it works.
		vsim $choice
		if {$entity != ""} {break}
	}
}

proc force-clock {signal time} {
	# force clock with falling edge at the start
	force -freeze $signal 0 0, 1 "[expr {$time / 2.}] ns" -repeat $time
}

proc sig-name {signal} {
	# returns a signal name given the fully-qualified object path, e.g. /entity/signal or /entity/bus(index)
	# return [lindex [regexp -inline {/(\w+(?:\(\d+\))?)$} $signal] 1]
	return [lindex [split $signal /] end]
}

proc add-waves {type} {
	# NOTE: type should be "in", "out", or "internal"
	global height totalTime entity

	set repeatTime $totalTime
	set isin [expr {$type == "in"}]

	switch $type {
		"in"       {set tmp "Input"}
		"out"      {set tmp "Output"}
		"internal" {set tmp "Internal"}
		default    {error "invalid value passed for `$type`. must be {in}, {out}, or {internal}."}
	}

	add wave -height $height -divider "$tmp Signals"
	unset tmp

	# the sort decreasing
	foreach bus [lsort -decreasing [find signals -$type /$entity/*]] {
		if {[regexp {^\d+'} [examine $bus]]} {
			# add each bus signal to a group.

			foreach signal [lsort -decreasing [find signals ${bus}(*)]] {
				add wave -height $height -group $bus -height $height [sig-name $signal]

				if {$isin} {
					force-clock $signal $repeatTime
					set repeatTime [expr {$repeatTime / 2}]
				}
			}
		} else {
			upvar 0 bus signal; # not actually a bus

			add wave -height $height [sig-name $signal]

			if {$isin} {
				force-clock $signal $repeatTime
				set repeatTime [expr {$repeatTime / 2}]
			}
		}

	}; # end foreach
}; # end proc add-waves

add-waves in
add-waves out
add-waves internal
run ${totalTime}ns
