#!/usr/bin/env js
// continuum.js v1.4 (c) | Copyright 2023 Daniel E. Janusch

// This file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
// and may only be copied IN ITS ENTIRETY under penalty of law.

////////////////// long form functions //////////////////

/**
 * Ihe functions in this file are in a different form than
 * in the continuum hypothesis paper (part 5?), and since
 * they are both correct, I do not care.
**/


var printReals = (function printReals_closure(consoleWidth=140) {
	// put in your console width for the argument

	// this version should work anywhere

	// all functions assume valid input

	const isBrowser = (globalThis + "").slice(8, -1).toLowerCase() === "window";
	var write = isBrowser ? // technically also Deno
		(function create_write() {

			var str = "";
			return function write(string = "", flush = false) {
				// kind of the same effect as `process.stdout.write` gets in node

				str += string;

				if (flush || str.length > consoleWidth)
					console.log(str),
					str = "";
			}

		})() :
		// just `process.stdout.write` doesn't work here:
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

		return ( isqrt(1n + (x << 3n)) + 1n >> 1n ) - 1n;
	}
	function triangleNumber(n) {
		// `n` is the "triangle index"
		return n * (n + 1n) >> 1n;
	}

	function generateCoordinates(n) {
		// converts a 1d index into an appropriate 2d coordinate
		const k = greatestTriangleIndex(n)
			, t = triangleNumber(k)
			, u = n - t;

		return [u, k - u];
		// these can be swapped, but it changes inverse()
	}
	function R(n, k) {
		// `n`: integer part
		// `k`: reversed decimal part
		return `${n}.` + `${k}`.split("").reverse().join("");
	}
	function getReal(index) {
		// generates a unique real number based on the index given.
		// sign == (n+1) ~Mod~ 2 - 1
		// sign == Mod[n + 1, 2] - 1
		return (index % 2n ? "-" : "") + // these two cases can be swapped, but it changes inverse()
			R( ...generateCoordinates(index >> 1n) );
	}
	function inverse(string) {
		const
			{groups: {ipart, fpart}} = /^-??(?<ipart>\d+)\.(?<fpart>\d+)$/.exec(string),
			n = BigInt( ipart ),
			k = BigInt( fpart.split("").reverse().join("") );

		return (n+k)**2n + 3n*n + k + BigInt(string[0] === "-")
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

////////////////// short versions without lib.js //////////////////

function isqrt(n) {
	if (n < 2n) return n;

	var x1 = n >> 1n, x0; // current, previous

	do [x1, x0] = [x1 + n / x1 >> 1n, x1];
	while (x1 < x0);

	return x0;
}
function indexToReal(n = 1n) {
	const
		a = isqrt(1n + (n << 2n)) + 1n >> 1n, // usually n << 3n, but this skips a step
		b = n - a*(a - 1n) >> 1n; // integer part = n/2 - T(a)

	return `${n % 2n ? "-" : ""}${b}.` + `${a - b - 1n}`.split("").reverse().join("");
}
function realToIndex(string) {
	const
		{groups: {ipart, fpart}} = /^-??(?<ipart>\d+)\.(?<fpart>\d+)$/.exec(string),
		x = BigInt( ipart ),
		y = BigInt( fpart.split("").reverse().join("") );

	return (x+y)**2n + 3n*x + y + BigInt(string[0] === "-")
}

////////////////// short form versions using lib.js //////////////////

function indexToReal(n = 1n) {
	const
		a = bMath.sqrt(1n + (n << 2n)) + 1n >> 1n, // usually n << 3n, but this skips a step
		b = n - a*(a - 1n) >> 1n; // integer part = n/2 - T(a)

	return `${n % 2n ? "-" : ""}${b}.` + `${a - b - 1n}`.reverse();
}
function realToIndex(string) {
	const
		{groups: {ipart, fpart}} = /^-??(?<ipart>\d+)\.(?<fpart>\d+)$/.exec(string),
		x = BigInt( ipart ),
		y = BigInt( fpart.reverse() );

	return (x+y)**2n + 3n*x + y + BigInt(string[0] === "-")
}


////////////////// short forms using lib.js and double-precision floating-point numbers //////////////////

function indexToReal(n = 1) {
	const
		a = floor( (rMath.isqrt(1 + 4*n) + 1) / 2 ), // usually n << 3n, but this skips a step
		b = floor( (n - a*(a - 1)) / 2 ); // integer part = n/2 - T(a)

	return `${n % 2 ? "-" : ""}${b}.` + `${a - b - 1}`.reverse();
}
function realToIndex(string) {
	const
		{groups: {ipart, fpart}} = /^-??(?<ipart>\d+)\.(?<fpart>\d+)$/.exec(string),
		x = +ipart,
		y = +fpart.reverse();

	return (x+y)**2 + 3*x + y + (string[0] === "-")
}