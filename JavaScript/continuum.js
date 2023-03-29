#!/usr/bin/env js
// continuum.js v1.2 (c) | Copyright 2023 Daniel E. Janusch

// This file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
// and may only be copied IN ITS ENTIRETY under penalty of law.

var printReals = (function create_printReals() {
	// all functions assume valid input
	const isBrowser = (globalThis + "").slice(8, -1).toLowerCase() === "window";
	var write = isBrowser ?
		(function create_write() {

			var str = "";
			return function write(string = "", flush = false) {
				// kind of the same effect as process.stdout.write in node

				str += string;
				if (flush || str.length > 100)
					console.log.call(console, str),
					str = "";
			}

		})() :
		str => process.stdout.write.call(process.stdout, str);

	// bit shifts are probably faster than division.
	function isqrt(n) {
		// floored (integer) square root.
		// bigint operations are automatically floored when applicable.
		if (n < 2n) return n;

		var x1 = n >> 1n, x0; // current, previous

		do [x1, x0] = [x1 + n / x1 >> 1n, x1];
		while (x1 < x0);

		return x0; // more accurate than `x1`
	}
	function greatestTriangleIndex(x) {
		// returns the "triangle index" of the greatest triangle number...
		// less than or equal to the input `x`.
		// I do not remember how I derived this.

		x = isqrt(1n + (x << 3n)); // some random intermediate value
		return (x + x % 2n >> 1n) - 1n;
	}
	function triangleNumber(n) {
		// `n` is the "triangle index"
		return n * (n + 1n) >> 1n;
	}
	function generateCoordinates(x) {
		// converts a 1d index into an appropriate 2d coordinate
		const u = greatestTriangleIndex(x)
			, k = triangleNumber(u)
			, t = x - k;

		return [t, u - t];
		// these can be swapped, but it changes inverse()
	}
	function R(i, j) {
		// `i`: integer part
		// `j`: reverse of decimal part
		return `${i}.` + `${j}`.split("").reverse().join("");
	}
	function getReal(index) {
		// generates a unique real number based on the index given.

		return (index % 2n ? "-" : "") + // these two cases can be swapped, but it changes inverse()
			R( ...generateCoordinates(index >> 1n) );
	}
	function inverse(string) {
		const match = /^-??(\d+)\.(\d+)$/.exec(string)
			, i = BigInt(match[1])
			, j = BigInt(match[2]);

		return (i+j)**2n + 3n*i + j + BigInt(string[0] === "-")
	}

	function generateRealsList(maxIndex=10n) {
		try { maxIndex = BigInt(maxIndex) } catch { return [] }

		for (var i = 0n, set = []; i < maxIndex ;)
			set.push( getReal(i++) );

		return set;
	}
	function printReals(maxIndex=1n, delimiter=", ") {
		// -1n acts as infinity (or max bigint, in practice)
		try { maxIndex = BigInt(maxIndex) } catch { return }

		write("[");

		for (var i = 0n; i !== maxIndex ;)
			write( getReal(i) ),
			++i !== maxIndex && write(delimiter);

		write("]\n", true);
	}

	return printReals._isqrt = isqrt,
		printReals._greatestTriangleIndex = greatestTriangleIndex,
		printReals._triangleNumber = triangleNumber,
		printReals._generateCoordinates = generateCoordinates,
		printReals._R = R,
		printReals.getReal = getReal,
		printReals.inverse = inverse,
		printReals.__generateRealsList = generateRealsList,
		printReals._write = write,
		printReals;
})();


// short forms using lib.js

function indexToReal(n = 1n) {
	const a = bMath.sqrt(1n + 4n*n) + 1n >> 1n;
	const b = n - a*(a - 1n) >> 1n;

	return `${n % 2n ? "-" : ""}${b}.` + `${a - b - 1n}`.reverse();
}
function realToIndex(string) {
	const match = /^-??(\d+)\.(\d+)$/.exec(string);
	const x = BigInt(match[1]);
	const y = BigInt(match[2].reverse());

	return (x+y)**2n + 3n*x + y + BigInt(string[0] === "-")
}

// minified versions using lib.js.

var f=n=>{var a=bMath.sqrt(1n+4n*n)+1n>>1n,b=n-a*(a-1n)>>1n;return`${n%2n?"-":""}${b}.`+`${a-b-1n}`.reverse()},i=s=>{var m=/^-?(\d+)\.(\d+)$/.exec(s),x=BigInt(m[1]),y=BigInt(m[2].reverse());return (x+y)**2n+3n*x+y+BigInt(s[0]=="-")};
