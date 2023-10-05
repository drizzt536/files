// uses funadmental differences between the runtimes to determine which runtime is being used.

function isBrowserRuntime() {
	// this should be somewhere in between resistant and
	// immune to tampering and contrived situations

	if (globalThis != "[object Window]")
		// no window. Neither Browser nor Deno.
		return false

	// determine between Browser and Deno.

	/*if (window.document == null)
		return false // Deno

	if (typeof document !== "object")
		return false // Deno

	if (window?.fetch?.toString() === "function fetch() { [native code] }")
		// fetch is not native in Deno as of version 1.37.1
		return true // Browser*/

	if (window.Deno == null)
		return true // Browser

	if (typeof Deno !== "object")
		return true // Browser

	if (Deno.prototype !== undefined)
		return true // Browser

	const _Deno = Deno;

	try {
		// In Deno, the `Deno` object can't be changed,
		// but it may be able to be changed in the browser

		Deno = true; // this will throw an error in Deno
		Deno = _Deno; // reset Deno back to whatever it was (not null/undefined).

		return true // Browser
	} catch (error) {
		// make sure `error` is a TypeError
		if (error == null || typeof error !== "object")
			return true // Browser

		if (	window.TypeError != null
			&&	typeof TypeError === "function"
			&&	TypeError() instanceof TypeError
			&&	TypeError == "function TypeError() { [native code] }")

			// TypeError hasn't been tampered with
			if (!(error instanceof TypeError))
				return true // Browser


		if (error.message !== "Cannot assign to read only property 'Deno' of object '#<Window>'")
			return true // Browser

		if (error != "TypeError: " + error.message)
			return true // Browser

		const stack = error.stack;

		if (typeof stack !== "string")
			return true // Browser

		// we can't assume that `RegExp.prototype.match` or
		// `String.prototype.split` haven't been tampered with,
		// so just use a for loop.

		for (var newlines = 0, i = stack.length; i --> 0 ;)
			if (stack[i] === "\n")
				newlines++

		/*
			I think this should be sufficient. If I am correct,
			The browser can only ever do something like this:

			TypeError: Cannot assign to read only property 'Deno' of object '#<Window>'
				at set (<anonymous>:3:16)
				at <anonymous>:1:12


			while the error in Deno is like this:

			TypeError: Cannot assign to read only property 'Deno' of object '#<Window>'
				at <anonymous>:1:12
		*/
		return newlines !== 1
	}
}

function determineRuntime(includeVersion = false) {
	// determines between Browser, Deno, Node, or Bun. Otherwise it returns Unknown.
	// the version will be in the form of like `Bun 1.0.4`, `Node 20.8.0`, or `Deno 1.37.1`
	return globalThis == "[object Window]" ?
		isBrowserRuntime() ?
			"Browser" :
			"Deno" + (includeVersion ? " " + Deno.version.deno : "") :
		globalThis == "[object global]" ?
			"Node" + (includeVersion ? " " + process.version.slice(1) : "") :
			globalThis == "[object Object]" ?
				// globalThis.toString() is this value as of version 1.0.4
				"Bun" + (includeVersion ? " " + Bun.version : "") :
				"Unknown";
}
