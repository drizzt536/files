#!usr/bin/env js

// This file has to execute before Test.js does and has the tests for lib.js

if (LIBRARY_VARIABLES["local LibSettings"].Create_Testing_Object) {

let LibSettings = LIBRARY_VARIABLES["local LibSettings"]
, globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name]
, tests = {
	symbToStr: {
		scope: "globalThis"
		, args: 2
		, inputs: [
			[undefined, Symbol("1234"), 1] // 0
			, [undefined, Symbol("1234"), 2] // 1
			, [undefined, Symbol.for("io3qt"), 1] // 2
			, [undefined, Symbol.for("io3qt"), 2] // 3
			, [undefined, Symbol("asdf"), 1] // 4
			, [undefined, Symbol("asdf"), 2] // 5
			, [undefined, Symbol.for("//3/'"), 1] // 6
			, [undefined, Symbol.for("//3/'"), 2] // 7
			, [undefined, 1234, 1] // 8
			, [undefined, 1234, 2] // 9
			, [undefined, "asdf", 1] // 10
			, [undefined, "asdf", 2] // 11
			, [undefined, 5678n, 1] // 12
			, [undefined, 5678n, 2] // 13
			, [undefined, [1, 2], 1] // 14
			, [undefined, [1, 2], 2] // 15
			, [undefined, {a: 1, b: 2}, 1] // 16
			, [undefined, {a: 1, b: 2}, 2] // 17
		]
		, outputs: [
			['Symbol("1234")', 0] // 0
			, ['Symbol(1234)', 0] // 1
			, ['Symbol.for("io3qt")', 0] // 2
			, ['Symbol.for(io3qt)', 0] // 3
			, ['Symbol("asdf")', 0] // 4
			, ['Symbol(asdf)', 0] // 5
			, [`Symbol.for("//3/'")`, 0] // 6
			, ["Symbol.for(//3/')", 0] // 7
			, [undefined, 0] // 8
			, [undefined, 0] // 9
			, [undefined, 0] // 10
			, [undefined, 0] // 11
			, [undefined, 0] // 12
			, [undefined, 0] // 13
			, [undefined, 0] // 14
			, [undefined, 0] // 15
			, [undefined, 0] // 16
			, [undefined, 0] // 17
		]
	} // 1
	, stringify: {
		args: 2
		, scope: "globalThis.json"
		, inputs: {
			"globalThis.json": [
				// basic array test
				[json, [1, 2, 3], {} ] // 0
				// spaces and spacesAtEnds
				, [json, [1, 2, 3], { space: "\t", spacesAtEnds: true } ] // 1
				// symbols as keys
				, [json, {[Symbol.for("a")]: 3, b: 3}, {} ] // 2
				// all the basic types
				, [json, [1.3, -4n, "ab", [{},null], Symbol.for("a"), Symbol("3"), false, /df/g], {}] // 3
				// same thing with tabs and different values
				, [json, [-8, 0n, ";", [null, {}], Symbol.for("`"), undefined, true, /l]/s]
					, { space: "\t", onlyEnumProps: false }
				] // 4
				// deeper array recursion
				, [json, [1,[1,[],[[7,[[]]],[2,[4,[[6]]],8]]],3], { space: "  " } ] // 5
				// deeper object recursion
				, [json, {a:{b:{c:{d:{e:{h:{i:{m:[{}]}},j:{}}}}}}}, { space: "" } ] // 6
				// non-enumerable string keys
				, [json, Object.create(null, { "asdf": { value: 3, enumerable: false } })
					, { spacesAtEnds: true }
				] // 7
				, [json, Object.create(null, { "asdf": { value: 3, enumerable: false } })
					, { space: "   ", spacesAtEnds: true, onlyEnumProps: false }
				] // 8
				// non-enumerable symbol keys
				, [json, Object.create(null, { [Symbol.for("asdf")]: { value: 3, enumerable: false } })
					, { onlyEnumProps: true }
				] // 9
				, [json, Object.create(null, { [Symbol.for("asdf")]: { value: 3, enumerable: false } })
					, { spacesAtEnds: true, onlyEnumProps: false }
				] // 10
				// number and bigint keys
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
};



LIBRARY_VARIABLES["local tests"] = tests;

if (globalTestsObject == null)
	globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name] = {};


if (globalTestsObject.constructor?.name === "Array")
	globalTestsObject.push(tests);
else if (globalTestsObject.constructor?.name === "Object")
	globalTestsObject[LibSettings.LIBRARY_NAME] = tests;

}
