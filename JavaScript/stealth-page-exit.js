// ==UserScript==
// @name         Stealth Page Exit
// @version      1.0
// @description  block pointerleave, mouseenter, focus, blur, etc. events, and update document.hidden, document.hasFocus, etc.
// @author       Daniel Janusch
// @match        https://*/*
// ==/UserScript==

// NOTE: this breaks Desmos 3D

{
	let hasFocus = () => true
	, blockEvent = e => { e.preventDefault(); e.stopImmediatePropagation() }
	, toString = new Proxy(() => "function toString() { [native code] }", {
		get(target, prop) { return prop == "toString" ? toString : target[prop] }
	})

	hasFocus.toString = () => "function hasFocus() { [native code] }"
	hasFocus.toString.toString = toString

	// handle events
	for (let obj of [window, document]) {
		// handle events for the tab losing or regaining focus
		for (let type of ["blur", "focus", "visibilitychange"])
			obj.addEventListener(type, blockEvent, true)

		// handle events for the mouse leaving the page
		for (let a of ["mouse", "pointer"])
		for (let b of ["enter", "leave"])
			obj.addEventListener(a + b, e => e.target == document && blockEvent(e), true)

		// NOTE: websites can't capture ctrl+tab and alt+tab keys, so those events don't matter
	}

	// handle static attributes
	Object.defineProperties(document, {
		hidden:				{writable: false, configurable: false, value: false},
		visibilityState:	{writable: false, configurable: false, value: "visible"},
		hasFocus:			{writable: false, configurable: false, value: hasFocus}
	})
}
