#!/usr/bin/env js
// continuum.js v1.1 (c) | Copyright 2023 Daniel E. Janusch

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
	// bitwise shifts are faster than division
	function R(i, j) { return `${i}.` + `${j}`.split("").reverse().join("") }
	function triangleNumber(x) { return x * (x + 1n) >> 1n }
	function isqrt(n) {
		if (n < 2n) return n;
		var x0, x1 = n >> 1n;

		do x0 = x1, x1 = x0 + n / x0 >> 1n;
		while ( x1 < x0 );

		return x0;
	}
	function greatestTriangleIndex(x) { return x = isqrt(1n + (x << 3n)), ( x + x % 2n >> 1n) - 1n }
	function generateIndices(x) {
		const u = greatestTriangleIndex(x)
			, k = triangleNumber(u)
			, t = x - k;
		return [t, u - t]; // these can be swapped, it doesn't really matter.
	}
	function getReal(index) {
		let positive = true;
		index % 2n && (positive--, index--);
		const t = generateIndices(index >> 1n);
		return (positive ? "" : "-") + R(t[0], t[1]);
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
		for (var i = 0n; i !== maxIndex; ++i) {
			process.stdout.write( getReal(i) );
			i + 1n !== maxIndex && process.stdout.write(delimiter);
		}
		process.stdout.write("]\n", isBrowser ? true : void 0);
	}
	return generateReals._isqrt = isqrt,
		generateReals._greatestTriangleIndex = greatestTriangleIndex,
		generateReals._triangleNumber = triangleNumber,
		generateReals._generateIndices = generateIndices,
		generateReals._R = R,
		generateReals._getReal = getReal,
		generateReals._generateRealsSet = generateRealsSet,
		generateReals;
})();

function inverse(string) { // assume valid input
	const match = /^(-?)(\d+)\.(\d)$/.exec(string)
		, i = BigInt(match[2]) // the x coordinate index, or the integer part
		, j = BigInt(match[3]); // the y coordinate index, or the decimal part
	return i*(i+1n) + ((i << 1n) + j)*(j+1n) + BigInt(match[1] === "-");
}
