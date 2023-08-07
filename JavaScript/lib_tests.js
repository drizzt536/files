#!usr/bin/env js

// This file has the tests for lib.js must execute before Test.js does
// in `inputs`, the first element is the `thisArg`, the rest are the function arguments
// in `outputs`, the first element is the return value and the second is the exit code (0 or 1)
if (LIBRARY_VARIABLES.settings.Create_Testing_Object) {

let LibSettings = LIBRARY_VARIABLES.settings
, globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name]
, tests = {
	symbolToString: {
		scope: "globalThis"
		, args: 2
		, inputs: [
			[undefined, Symbol("1234"), true] // 0
			, [undefined, Symbol("1234"), false] // 1
			, [undefined, Symbol.for("io3qt"), true] // 2
			, [undefined, Symbol.for("io3qt"), false] // 3
			, [undefined, Symbol("asdf"), true] // 4
			, [undefined, Symbol("asdf"), false] // 5
			, [undefined, Symbol.for("//\`3/'"), true] // 6
			, [undefined, Symbol.for("//\`3/'"), false] // 7
			, [undefined, Symbol.asyncIterator, true] // 8
			, [undefined, Symbol.asyncIterator, false] // 9
			, [undefined, Symbol.hasInstance, true] // 10
			, [undefined, Symbol.hasInstance, false] // 11
			, [undefined, Symbol.isConcatSpreadable, true] // 12
			, [undefined, Symbol.isConcatSpreadable, false] // 13
			, [undefined, Symbol.iterator, true] // 14
			, [undefined, Symbol.iterator, false] // 15
			, [undefined, Symbol.match, true] // 16
			, [undefined, Symbol.match, false] // 17
			, [undefined, Symbol.matchAll, true] // 18
			, [undefined, Symbol.matchAll, false] // 19
			, [undefined, Symbol.replace, true] // 20
			, [undefined, Symbol.replace, false] // 21
			, [undefined, Symbol.search, true] // 22
			, [undefined, Symbol.search, false] // 23
			, [undefined, Symbol.split, true] // 24
			, [undefined, Symbol.split, false] // 25
			, [undefined, Symbol.toPrimitive, true] // 26
			, [undefined, Symbol.toPrimitive, false] // 27
			, [undefined, Symbol.toStringTag, true] // 28
			, [undefined, Symbol.toStringTag, false] // 29
			, [undefined, Symbol.unscopables, true] // 30
			, [undefined, Symbol.unscopables, false] // 31
			, [undefined, 1234, true] // 32
			, [undefined, 1234, false] // 33
			, [undefined, "asdf", true] // 34
			, [undefined, "asdf", false] // 35
			, [undefined, 5678n, true] // 36
			, [undefined, 5678n, false] // 37
			, [undefined, [1, 2], true] // 38
			, [undefined, [1, 2], false] // 39
			, [undefined, {a: 1, b: 2}, true] // 40
			, [undefined, {a: 1, b: 2}, false] // 41
			, [undefined, [Symbol.for("asdf")], true] // 42
			, [undefined, [Symbol.for("asdf")], false] // 43
			, [undefined, Symbol.for('""'), true] // 44
			, [undefined, Symbol.for('""'), false] // 45
			// default arguments
			, [undefined, Symbol("1234")] // 46
			, [undefined, Symbol.for("io3qt")] // 47
			, [undefined, Symbol.for("//\`3/'")] // 48
			, [undefined, Symbol.match] // 49
			, [undefined, Symbol.for('""')] // 50
			,
		], outputs: [
			['Symbol("1234")', 0] // 0
			, ["Symbol(1234)", 0] // 1
			, ['Symbol.for("io3qt")', 0] // 2
			, ["Symbol.for(io3qt)", 0] // 3
			, ['Symbol("asdf")', 0] // 4
			, ["Symbol(asdf)", 0] // 5
			, [`Symbol.for("//\`3/'")`, 0] // 6
			, ["Symbol.for(//\`3/')", 0] // 7
			, ["Symbol.asyncIterator", 0] // 8
			, ["Symbol(Symbol.asyncIterator)", 0] // 9
			, ["Symbol.hasInstance", 0] // 10
			, ["Symbol(Symbol.hasInstance)", 0] // 11
			, ["Symbol.isConcatSpreadable", 0] // 12
			, ["Symbol(Symbol.isConcatSpreadable)", 0] // 13
			, ["Symbol.iterator", 0] // 14
			, ["Symbol(Symbol.iterator)", 0] // 15
			, ["Symbol.match", 0] // 16
			, ["Symbol(Symbol.match)", 0] // 17
			, ["Symbol.matchAll", 0] // 18
			, ["Symbol(Symbol.matchAll)", 0] // 19
			, ["Symbol.replace", 0] // 20
			, ["Symbol(Symbol.replace)", 0] // 21
			, ["Symbol.search", 0] // 22
			, ["Symbol(Symbol.search)", 0] // 23
			, ["Symbol.split", 0] // 24
			, ["Symbol(Symbol.split)", 0] // 25
			, ["Symbol.toPrimitive", 0] // 26
			, ["Symbol(Symbol.toPrimitive)", 0] // 27
			, ["Symbol.toStringTag", 0] // 28
			, ["Symbol(Symbol.toStringTag)", 0] // 29
			, ["Symbol.unscopables", 0] // 30
			, ["Symbol(Symbol.unscopables)", 0] // 31
			, [undefined, 0] // 32
			, [undefined, 0] // 33
			, [undefined, 0] // 34
			, [undefined, 0] // 35
			, [undefined, 0] // 36
			, [undefined, 0] // 37
			, [undefined, 0] // 38
			, [undefined, 0] // 39
			, [undefined, 0] // 40
			, [undefined, 0] // 41
			, [undefined, 0] // 42
			, [undefined, 0] // 43
			, ['Symbol.for("\\"\\"")', 0] // 44
			, ['Symbol.for("")', 0] // 45
			// default arguments
			, ['Symbol("1234")', 0] // 46
			, ['Symbol.for("io3qt")', 0] // 47
			, [`Symbol.for("//\`3/'")`, 0] // 48
			, ["Symbol.match", 0] // 49
			, ['Symbol.for("\\"\\"")', 0] // 50
			,
		],
	} // 1
	, stringify: {
		args: 2
		, scope: "globalThis.json"
		, inputs: {
			"globalThis.json": [
				[json, [1, 2, 3], {} ] // 0
				, [json, [1, 2, 3], { space: "\t", spacesAtEnds: true } ] // 1
				, [json, {[Symbol.for("a")]: 3, b: 3}, {} ] // 2
				, [json, [1.3, -4n, "ab", [{},null], Symbol.for("a"), Symbol("3"), false, /df/g], {}] // 3
				, [json, [-8, 0n, ";", [null, {}], Symbol.for("`"), undefined, true, /l]/s]
					, { space: "\t", onlyEnumProps: false }
				] // 4
				, [json, [1,[1,[],[[7,[[]]],[2,[4,[[6]]],8]]],3], { space: "  " } ] // 5
				, [json, {a:{b:{c:{d:{e:{h:{i:{m:[{}]}},j:{}}}}}}}, { space: "" } ] // 6
				, [json, Object.create(null, { "asdf": { value: 3, enumerable: false } })
					, { spacesAtEnds: true }
				] // 7
				, [json, Object.create(null, { "asdf": { value: 3, enumerable: false } })
					, { space: "   ", spacesAtEnds: true, onlyEnumProps: false }
				] // 8
				, [json, Object.create(null, { [Symbol.for("asdf")]: { value: 3, enumerable: false } })
					, { onlyEnumProps: true }
				] // 9
				, [json, Object.create(null, { [Symbol.for("asdf")]: { value: 3, enumerable: false } })
					, { spacesAtEnds: true, onlyEnumProps: false }
				] // 10
				, [json, {3: 3, 2n: 4, [-89]:  6}, {}]
			]
		}
		, outputs: {
			"globalThis.json": [
				["[1, 2, 3]", 0] // 0
				, ["[\t1,\t2,\t3\t]", 0] // 1
				, ['{"b": 3, [Symbol.for("a")]: 3}', 0] // 2
				, ['[1.3, -4n, "ab", [{}, null], Symbol.for("a"), Symbol("3"), false, /df/g]', 0] // 3
				, ['[-8,\t0n,\t";",\t[null,\t{}],\tSymbol.for("`"),\tundefined,\ttrue,\t/l]/s]', 0] // 4
				, ['[1,  [1,  [],  [[7,  [[]]],  [2,  [4,  [[6]]],  8]]],  3]', 0] // 5
				, ['{"a":{"b":{"c":{"d":{"e":{"h":{"i":{"m":[{}]}},"j":{}}}}}}}', 0] // 6
				, ['{  }', 0] // 7
				, ['{   "asdf":   3   }', 0] // 8
				, ['{}', 0] // 9
				, ['{ [Symbol.for("asdf")]: 3 }', 0] // 10
				, ['{"2": 4, "3": 3, "-89": 6}', 0] // 11
			]
		}
	} // 2
	, parse: {
		ignore: true
		, scope: "globalThis.json"
	} // 3
	, sgn: {
		ignore: true
		, args: null
		, scopes: [
			"globalThis"
			, "globalThis.aMath"
			, "globalThis.bMath"
			, "globalThis.cMath"
			// , "globalThis.fMath" // TODO: Add
			, "globalThis.rMath"
			, "globalThis.sMath"
			// , "globalThis.cfMath" // TODO: Add
		]
		, inputs: {}
		, outputs: {}
	} // 4
	, round: {
		changeThis: true
		, args: 1
		, scopes: ["globalThis", "rMath"]
		, inputs: [
			[undefined, 4.1] // 0
			, [undefined, -2.3] // 1
			, [undefined, -7.5] // 2
			, [undefined, 1.1234] // 3
			, [undefined, 0] // 4
			, [undefined, -0] // 5
			, [undefined, NaN] // 6
			, [undefined, Infinity] // 7
			, [undefined, -Infinity] // 8
			, [undefined, "15.8"] // 9
			, [undefined, "-9.6"] // 10
			, [undefined, "asdf"] // 11
			, [undefined, "420n"] // 12
			, [undefined, Symbol("1234")] // 13
			, [undefined, Symbol.for("1234")] // 14
			, [undefined, [1, 2, 3]] // 15
			, [undefined, 2**-52] // 16
			, [undefined, 1e+58 + 1e+35] // 17
			, [undefined, {a: 1, b: 2}] // 18
			, [undefined, undefined] // 19
			, [undefined, null] // 20
			, [undefined, !0] // 21
			, [undefined, !1] // 22
			, [undefined, () => 2] // 23
			, [undefined, 20n] // 23
			, [undefined, -4n] // 24
			, [undefined, 0n] // 25
			, [undefined, /regex/] // 26
		]
		, outputs: [
			[4, 0] // 0
			, [-2, 0] // 1
			, [-8, 0] // 2
			, [1, 0] // 3
			, [0, 0] // 4
			, [0, 0] // 5
			, [NaN, 0] // 6
			, [1/0, 0] // 7
			, [- 1/0, 0] // 8
			, [16, 0] // 9
			, [-10, 0] // 10
			, [NaN, 0] // 11
			, [NaN, 0] // 12
			, [NaN, 0] // 13
			, [NaN, 0] // 14
			, [NaN, 0] // 15
			, [0, 0] // 16
			, [1e58, 0] // 17
			, [NaN, 0] // 18
			, [NaN, 0] // 19
			, [NaN, 0] // 20
			, [NaN, 0] // 21
			, [NaN, 0] // 22
			, [NaN, 0] // 23
			, [20n, 0] // 23
			, [-4n, 0] // 24
			, [0n, 0] // 25
			, [NaN, 0] // 26
		]
	} // 5
	, isIterable: {
		args: 1
		, scope: "globalThis"
		, inputs: [
			[undefined, 4.1] // 0
			, [undefined, NaN] // 1
			, [undefined, Infinity] // 2
			, [undefined, -Infinity] // 3
			, [undefined, "asdf"] // 4
			, [undefined, "420n"] // 5
			, [undefined, Symbol("1234")] // 6
			, [undefined, Symbol.for("1234")] // 7
			, [undefined, [1, 2, 3]] // 8
			, [undefined, 2**-52] // 9
			, [undefined, 1e+58 + 1e+35] // 10
			, [undefined, {a: 1, b: 2}] // 11
			, [undefined, undefined] // 12
			, [undefined, null] // 13
			, [undefined, true] // 14
			, [undefined, false] // 15
			, [undefined, () => 2] // 16
			, [undefined, 20n] // 17
			, [undefined, /regex/] // 18
		]
		, outputs: [
			[false, 0] // 0
			, [false, 0] // 1
			, [false, 0] // 2
			, [false, 0] // 3
			, [true , 0] // 4
			, [true , 0] // 5
			, [false, 0] // 6
			, [false, 0] // 7
			, [true , 0] // 8
			, [false, 0] // 9
			, [false, 0] // 10
			, [false, 0] // 11
			, [false, 0] // 12
			, [false, 0] // 13
			, [false, 0] // 14
			, [false, 0] // 15
			, [false, 0] // 16
			, [false, 0] // 17
			, [false, 0] // 18
		]
	} // 6
	, numStrNorm: {
		args: 2
		, ignore: false
		, scope: "globalThis"
		, name: "numStrNorm"
		, inputs: [
			[undefined, "000000000", NaN] // 0
			, [undefined, "-000000.", 32] // 1
			, [undefined, "-000000.000", -123] // 2
			, [undefined, ".00", /asdf/] // 3
			, [undefined, ".0", null] // 4
			, [undefined, "-234.12", Symbol.for("aa")] // 5
			, [undefined, ".41", NaN] // 6
			, [undefined, "53", NaN] // 7
			, [undefined, "", NaN] // 8
			, [undefined, "", "61.312abc|.."] // 9
			, [undefined, "1", undefined] // 10
			, [undefined, [1, 2, 3], NaN] // 11
			, [undefined, /^a\s+sdf/dim, NaN] // 12
			, [undefined, NaN, 43] // 13
			, [undefined, true, NaN] // 14
			, [undefined, false, NaN] // 15
			, [undefined, "sus amogus", ""] // 16
			, [undefined, complex(1, 2), NaN] // 17
			, [undefined, "complex(1, 2)", NaN] // 18
			, [undefined, ".", 4] // 19
			, [undefined, "--123", -12n] // 20
			, [undefined, "true", null] // 21
			, [undefined, "false", NaN] // 22
			, [undefined, "NaN", NaN] // 23
			, [undefined, "NaN.", NaN] // 24
			, [undefined, "NaN ", NaN] // 25
			, [undefined, "false.0", NaN] // 26
			, [undefined, "true.", NaN] // 27
			, [undefined, "null.", NaN] // 28
			, [undefined, "null", NaN] // 29
			, [undefined, "void 0", NaN] // 30
			, [undefined, "undefined", NaN] // 31
			, [undefined, "undefined.0", NaN] // 32
			, [undefined, "Infinity.0", NaN] // 33
			, [undefined, "Infinity", NaN] // 34
			, [undefined, "-Infinity", NaN] // 35
			, [undefined, "infinity", NaN] // 36
			, [undefined, "-infinity", NaN] // 37
			, [undefined, "-null", NaN] // 38
			, [undefined, "4n", NaN] // 39
			, [undefined, "-4n", NaN] // 40
			, [undefined, "-4 n", NaN] // 41
			, [undefined, "- 123", NaN] // 42
			, [undefined, "+ 517", NaN] // 43
			, [undefined, "+517.", NaN] // 44
			, [undefined, "+123.12", NaN] // 45
			, [undefined, "+456", NaN] // 46
			, [undefined, "15.0000000000000000000000000000000000000000000000000000000000001", NaN] // 47
			, [undefined, " 123.0 ", NaN] // 48
			, [undefined, "1.24e+3", NaN] // 49
			, [undefined, "12.4e+2", NaN] // 50
			, [undefined, Symbol("asdf"), NaN] // 51
			, [undefined, Symbol.for("qwer"), NaN] // 52
			, [undefined, 0.3e-4, NaN] // 53
			, [undefined, 6.123e-24, NaN] // 54
			, [undefined, {a: 1, b: 2, c: 3}, NaN] // 55
			, [undefined, "\n123 ", NaN] // 56
			, [undefined, "+456.1234", NaN] // 57
			, [undefined, /asdf$/, NaN] // 58
			, [undefined, "- -456", NaN] // 59
			, [undefined, "123 .456", NaN] // 60
			, [undefined, "4.56\n78E19", NaN] // 61
			, [undefined, 1234n, NaN] // 62
			, [undefined, -5678n, NaN] // 63
			, [undefined, 0n, NaN] // 64
			, [undefined, -0n, NaN] // 65
			, [undefined, 0, NaN] // 66
			, [undefined, -0, NaN] // 67
			, [undefined, "-0.0", NaN] // 68
			, [undefined, "-0e-12", NaN] // 69
			, [undefined, "-00.0E41", NaN] // 70
			, [undefined, null, NaN] // 71
			, [undefined, undefined, NaN] // 72
			, [undefined, Infinity, NaN] // 73
			, [undefined, -Infinity, NaN] // 74
			, [undefined, "1.234E-9", NaN] // 75
			, [undefined, "0.01234e-7", NaN] // 76
			, [undefined, "1234.1234e6", NaN] // 77
			, [undefined, "4.5678E19", NaN] // 78
			, [undefined, 4.5678E19, NaN] // 79
			, [undefined, -1.2698e18, NaN] // 80
			, [undefined, 4.5678E+17, NaN] // 81
			, [undefined, 2.65813e+16, NaN] // 82
			, [undefined, "0x2A3F", NaN] // 83
			, [undefined, "0x2a3F", NaN] // 84
			, [undefined, "0x2a3f", NaN] // 85
			, [undefined, "0b100101", NaN] // 86
			, [undefined, "0o1234567", NaN] // 87
			, [undefined, "01234567", NaN] // 88
		]
		, outputs: [
			["0.0", 0] // 0
			, ["0.0", 0] // 1
			, ["0.0", 0] // 2
			, ["0.0", 0] // 3
			, ["0.0", 0] // 4
			, ["-234.12", 0] // 5
			, ["0.41", 0] // 6
			, ["53.0", 0] // 7
			, [NaN, 0] // 8
			, ["61.312abc|..", 0] // 9
			, ["1.0", 0] // 10
			, [NaN, 0] // 11
			, [NaN, 0] // 12
			, [43, 0] // 13
			, ["1.0", 0] // 14
			, ["0.0", 0] // 15
			, ["", 0] // 16
			, [NaN, 0] // 17
			, [NaN, 0] // 18
			, [4, 0] // 19
			, [-12n, 0] // 20
			, ["1.0", 0] // 21
			, ["0.0", 0] // 22
			, [NaN, 0] // 23
			, [NaN, 0] // 24
			, [NaN, 0] // 25
			, [NaN, 0] // 26
			, [NaN, 0] // 27
			, [NaN, 0] // 28
			, [NaN, 0] // 29
			, [NaN, 0] // 30
			, [NaN, 0] // 31
			, [NaN, 0] // 32
			, [NaN, 0] // 33
			, [Infinity, 0] // 34
			, [-Infinity, 0] // 35
			, [NaN, 0] // 36
			, [NaN, 0] // 37
			, [NaN, 0] // 38
			, [NaN, 0] // 39
			, [NaN, 0] // 40
			, [NaN, 0] // 41
			, [NaN, 0] // 42
			, [NaN, 0] // 43
			, ["517.0", 0] // 44
			, ["123.12", 0] // 45
			, ["456.0", 0] // 46
			, ["15.0000000000000000000000000000000000000000000000000000000000001", 0] // 47
			, ["123.0", 0] // 48
			, ["1240.0", 0] // 49
			, ["1240.0", 0] // 50
			, [NaN, 0] // 51
			, [NaN, 0] // 52
			, ["0.00003", 0] // 53
			, ["0.000000000000000000000006123", 0] // 54
			, [NaN, 0] // 55
			, ["123.0", 0] // 56
			, ["456.1234", 0] // 57
			, [NaN, 0] // 58
			, [NaN, 0] // 59
			, [NaN, 0] // 60
			, [NaN, 0] // 61
			, ["1234.0", 0] // 62
			, ["-5678.0", 0] // 63
			, ["0.0", 0] // 64
			, ["0.0", 0] // 65
			, ["0.0", 0] // 66
			, ["0.0", 0] // 67
			, ["0.0", 0] // 68
			, ["0.0", 0] // 69
			, ["0.0", 0] // 70
			, ["0.0", 0] // 71
			, ["0.0", 0] // 72
			, [Infinity, 0] // 73
			, [-Infinity, 0] // 74
			, ["0.000000001234", 0] // 75
			, ["0.000000001234", 0] // 76
			, ["1234123400.0", 0] // 77
			, ["45678000000000000000.0", 0] // 78
			, ["45678000000000000000.0", 0] // 79
			, ["-1269800000000000000.0", 0] // 80
			, ["456780000000000000.0", 0] // 81
			, ["26581300000000000.0", 0] // 82
			, ["10815.0", 0] // 83
			, ["10815.0", 0] // 84
			, ["10815.0", 0] // 85
			, ["37.0", 0] // 86
			, ["342391.0", 0] // 87
			, ["1234567.0", 0] // 88
		]
	} // 7
	, norm: {
		ignore: true
		, useDifferentTestSet: "numStrNorm"
		, scope: "globalThis.sMath"
		, name: "norm"
	} // 8
};



LIBRARY_VARIABLES["local tests"] = tests;

if (globalTestsObject == null)
	globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name] = {};


if (globalTestsObject.constructor?.name === "Array")
	globalTestsObject.push(tests);
else if (globalTestsObject.constructor?.name === "Object")
	globalTestsObject[LibSettings.LIBRARY_NAME] = tests;

}


/* globalThis.sgn():

-5.12     -> -1
-1        -> -1
-Infinity -> -1
-0        -> 0
0         -> 0
1         -> 1
Infinity  -> 1
true      -> 1
false     -> 0

-6n       -> -1n
-1n       -> -1n
0n        -> 0n
1n        -> 1n
999999n   -> 1n

complex(1, 0)  -> complex(1, 0)
complex(0, 0)  -> complex(0, 0)
complex(-1, 0) -> complex(-1, 0)
complex(0, 1)  -> complex(0, 1)
complex(0, -1) -> complex(0, -1)

complex(1, 1)   -> complex(0.7071067811865474, 0.7071067811865474)
complex(1, -1)  -> complex(0.7071067811865474, -0.7071067811865474)
complex(-1, -1) -> complex(-0.7071067811865474, -0.7071067811865474)
complex(-1, 1)  -> complex(-0.7071067811865474, 0.7071067811865474)

NaN       -> NaN
Symbol()  -> NaN
/asdf/    -> NaN
() => 32  -> NaN
*/
