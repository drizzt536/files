#!/usr/bin/env js
// continuum.js v1.0 (c) | Copyright 2023 Daniel E. Janusch

// This file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
// and may only be copied IN ITS ENTIRETY under penalty of law.

var generateReals = (function create_realNumbers() {
	const isBrowser = (globalThis + "").slice(8, -1).toLowerCase() === "window";
	if (isBrowser) var process = {
		stdout: {
			write: (function create_write() {
				let str = "";
				return function write(string = "", flush = false) {
					str += string.toString();
					if (flush || str.length > 100) {
						console.log.call(console, str);
						str = "";
					}
				}
			})()
		}
	}
	function R(i, j) { return i < 0n || j < 0n ? NaN : `${i}.` + `${j}`.split("").reverse().join("") }
	function sgn(x) { return x < 0n ? -1n : BigInt(x > 0n) }
	function triangleNumber(x) { return x * (x + 1n) / 2n }
	function floor(x) {
		return typeof x === "number" ?
			Number.parseInt(x) - (x<0 && x != Number.parseInt(x)) :
			typeof x === "bigint" ?
				x :
				NaN;
	}
	function isqrt(n) {
		if (n < 2n) return n;
		var x0, x1 = n / 2n;

		do x0 = x1, x1 = ( x0 + n / x0 ) / 2n;
		while ( x1 < x0 );

		return x0;
	}
	function greatestTriangleIndex(x) {
		return (
			isqrt(1n + 8n*x) +
			sgn( 1n - sgn(1n - isqrt(1n + 8n*x) % 2n) )
		) / 2n - 1n;
	}
	function generateIndices(x) {
		const u = greatestTriangleIndex(x)
			, k = triangleNumber(u)
			, t = x - k;
		return [t, u - t]; // these can be swapped, it doesn't matter.
	}
	function getReal(index) {
		try { index = BigInt(index) } catch { return NaN }
		let negative = 0;
		index % 2n && (negative = 1, index--);
		let t = generateIndices(index /= 2n);
		return (negative ? "-" : "") + R(t[0], t[1]);
	}
	function generateRealsSet(maxIndex=10n) {
		try { maxIndex = BigInt(maxIndex) } catch { return [] }
		for (var i = 0n, set = []; i < maxIndex; i++)
			set.push( getReal(i) );
		return set;
	}
	function generateReals(maxIndex=1n, delimiter=", ") {
		// -1n acts as infinity.
		try { maxIndex = BigInt(maxIndex) } catch { return }
		process.stdout.write("[");
		for (var i = 0n; i !== maxIndex; i++) {
			process.stdout.write( getReal(i) );
			i + 1n !== maxIndex && process.stdout.write(delimiter);
		}
		process.stdout.write("]\n", isBrowser ? true : void 0);
	}
	return generateReals._floor = floor,
		generateReals._isqrt = isqrt,
		generateReals._sgn = sgn,
		generateReals._greatestTriangleIndex = greatestTriangleIndex,
		generateReals._triangleNumber = triangleNumber,
		generateReals._generateIndices = generateIndices,
		generateReals._R = R,
		generateReals._getReal = getReal,
		generateReals._generateRealsSet = generateRealsSet,
		generateReals;
})();
