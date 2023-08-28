#!usr/bin/env js

// This file has the tests for lib.js must execute before Test.js does
// in `inputs`, the first element is the `thisArg`, the rest are the function arguments
// in `outputs`, the first element is the return value and the second is the exit code (0 or 1)
if (LIBRARY_VARIABLES.settings.Create_Testing_Object) {

let LibSettings = LIBRARY_VARIABLES.settings
, globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name]
, tests = {/*
	*/ /* 1 */ symbolToString: {
		scope: "globalThis"
		, args: 2
		, inputs: [
			/*  0 */ [undefined, Symbol("1234"), true],
			/*  1 */ [undefined, Symbol("1234"), false],
			/*  2 */ [undefined, Symbol.for("io3qt"), true],
			/*  3 */ [undefined, Symbol.for("io3qt"), false],
			/*  4 */ [undefined, Symbol("asdf"), true],
			/*  5 */ [undefined, Symbol("asdf"), false],
			/*  6 */ [undefined, Symbol.for("//\`3/'"), true],
			/*  7 */ [undefined, Symbol.for("//\`3/'"), false],
			/*  8 */ [undefined, Symbol.asyncIterator, true],
			/*  9 */ [undefined, Symbol.asyncIterator, false],
			/* 10 */ [undefined, Symbol.hasInstance, true],
			/* 11 */ [undefined, Symbol.hasInstance, false],
			/* 12 */ [undefined, Symbol.isConcatSpreadable, true],
			/* 13 */ [undefined, Symbol.isConcatSpreadable, false],
			/* 14 */ [undefined, Symbol.iterator, true],
			/* 15 */ [undefined, Symbol.iterator, false],
			/* 16 */ [undefined, Symbol.match, true],
			/* 17 */ [undefined, Symbol.match, false],
			/* 18 */ [undefined, Symbol.matchAll, true],
			/* 19 */ [undefined, Symbol.matchAll, false],
			/* 20 */ [undefined, Symbol.replace, true],
			/* 21 */ [undefined, Symbol.replace, false],
			/* 22 */ [undefined, Symbol.search, true],
			/* 23 */ [undefined, Symbol.search, false],
			/* 24 */ [undefined, Symbol.split, true],
			/* 25 */ [undefined, Symbol.split, false],
			/* 26 */ [undefined, Symbol.toPrimitive, true],
			/* 27 */ [undefined, Symbol.toPrimitive, false],
			/* 28 */ [undefined, Symbol.toStringTag, true],
			/* 29 */ [undefined, Symbol.toStringTag, false],
			/* 30 */ [undefined, Symbol.unscopables, true],
			/* 31 */ [undefined, Symbol.unscopables, false],
			/* 32 */ [undefined, 1234, true],
			/* 33 */ [undefined, 1234, false],
			/* 34 */ [undefined, "asdf", true],
			/* 35 */ [undefined, "asdf", false],
			/* 36 */ [undefined, 5678n, true],
			/* 37 */ [undefined, 5678n, false],
			/* 38 */ [undefined, [1, 2], true],
			/* 39 */ [undefined, [1, 2], false],
			/* 40 */ [undefined, {a: 1, b: 2}, true],
			/* 41 */ [undefined, {a: 1, b: 2}, false],
			/* 42 */ [undefined, [Symbol.for("asdf")], true],
			/* 43 */ [undefined, [Symbol.for("asdf")], false],
			/* 44 */ [undefined, Symbol.for('""'), true],
			/* 45 */ [undefined, Symbol.for('""'), false],
			// default arguments
			/* 46 */ [undefined, Symbol("1234")],
			/* 47 */ [undefined, Symbol.for("io3qt")],
			/* 48 */ [undefined, Symbol.for("//\`3/'")],
			/* 49 */ [undefined, Symbol.match],
			/* 50 */ [undefined, Symbol.for('""')],
		], outputs: [
			/*  0 */ ['Symbol("1234")', 0],
			/*  1 */ ["Symbol(1234)", 0],
			/*  2 */ ['Symbol.for("io3qt")', 0],
			/*  3 */ ["Symbol.for(io3qt)", 0],
			/*  4 */ ['Symbol("asdf")', 0],
			/*  5 */ ["Symbol(asdf)", 0],
			/*  6 */ [`Symbol.for("//\`3/'")`, 0],
			/*  7 */ ["Symbol.for(//\`3/')", 0],
			/*  8 */ ["Symbol.asyncIterator", 0],
			/*  9 */ ["Symbol(Symbol.asyncIterator)", 0],
			/* 10 */ ["Symbol.hasInstance", 0],
			/* 11 */ ["Symbol(Symbol.hasInstance)", 0],
			/* 12 */ ["Symbol.isConcatSpreadable", 0],
			/* 13 */ ["Symbol(Symbol.isConcatSpreadable)", 0],
			/* 14 */ ["Symbol.iterator", 0],
			/* 15 */ ["Symbol(Symbol.iterator)", 0],
			/* 16 */ ["Symbol.match", 0],
			/* 17 */ ["Symbol(Symbol.match)", 0],
			/* 18 */ ["Symbol.matchAll", 0],
			/* 19 */ ["Symbol(Symbol.matchAll)", 0],
			/* 20 */ ["Symbol.replace", 0],
			/* 21 */ ["Symbol(Symbol.replace)", 0],
			/* 22 */ ["Symbol.search", 0],
			/* 23 */ ["Symbol(Symbol.search)", 0],
			/* 24 */ ["Symbol.split", 0],
			/* 25 */ ["Symbol(Symbol.split)", 0],
			/* 26 */ ["Symbol.toPrimitive", 0],
			/* 27 */ ["Symbol(Symbol.toPrimitive)", 0],
			/* 28 */ ["Symbol.toStringTag", 0],
			/* 29 */ ["Symbol(Symbol.toStringTag)", 0],
			/* 30 */ ["Symbol.unscopables", 0],
			/* 31 */ ["Symbol(Symbol.unscopables)", 0],
			/* 32 */ [undefined, 0],
			/* 33 */ [undefined, 0],
			/* 34 */ [undefined, 0],
			/* 35 */ [undefined, 0],
			/* 36 */ [undefined, 0],
			/* 37 */ [undefined, 0],
			/* 38 */ [undefined, 0],
			/* 39 */ [undefined, 0],
			/* 40 */ [undefined, 0],
			/* 41 */ [undefined, 0],
			/* 42 */ [undefined, 0],
			/* 43 */ [undefined, 0],
			/* 44 */ ['Symbol.for("\\"\\"")', 0],
			/* 45 */ ['Symbol.for("")', 0],
			// default arguments
			/* 46 */ ['Symbol("1234")', 0],
			/* 47 */ ['Symbol.for("io3qt")', 0],
			/* 48 */ [`Symbol.for("//\`3/'")`, 0],
			/* 49 */ ["Symbol.match", 0],
			/* 50 */ ['Symbol.for("\\"\\"")', 0],
		],
	}, /* 2 */ stringify: {
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
			],
		}, outputs: {
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
			],
		},
	}, /* 3 */ parse: {
		ignore: true
		, scope: "globalThis.json"
		,
	}, /* 4 */ sgn: {
		args: null
		, scopes: [
			"globalThis"
			// , "globalThis.aMath"
			// , "globalThis.bMath"
			// , "globalThis.cMath"
			// , "globalThis.fMath" // TODO: Add
			// , "globalThis.rMath"
			// , "globalThis.sMath"
			// , "globalThis.cfMath" // TODO: Add
		], inputs: {
			"globalThis": [
				/*  0 */ [undefined, -5.12],
				/*  1 */ [undefined, -1],
				/*  2 */ [undefined, -Infinity],
				/*  3 */ [undefined, -41233],
				/*  4 */ [undefined, -0],
				/*  5 */ [undefined, 0],
				/*  6 */ [undefined, 1],
				/*  7 */ [undefined, 16.9087],
				/*  8 */ [undefined, 6789678],
				/*  9 */ [undefined, Infinity],
				/* 10 */ [undefined, true],
				/* 11 */ [undefined, false],
			],
		}, outputs: {
			"globalThis": [
				/*  0 */ [-1, 0],
				/*  1 */ [-1, 0],
				/*  2 */ [-1, 0],
				/*  3 */ [-1, 0],
				/*  4 */ [0 , 0],
				/*  5 */ [0 , 0],
				/*  6 */ [1 , 0],
				/*  7 */ [1 , 0],
				/*  8 */ [1 , 0],
				/*  9 */ [1 , 0],
				/* 10 */ [1 , 0],
				/* 11 */ [0 , 0],
			],
		},
	}, /* 5 */ round: {
		changeThis: true
		, args: 1
		, scopes: ["globalThis", "rMath"]
		, inputs: [
			/*  0 */ [undefined, 4.1],
			/*  1 */ [undefined, -2.3],
			/*  2 */ [undefined, -7.5],
			/*  3 */ [undefined, 1.1234],
			/*  4 */ [undefined, 0],
			/*  5 */ [undefined, -0],
			/*  6 */ [undefined, NaN],
			/*  7 */ [undefined, Infinity],
			/*  8 */ [undefined, -Infinity],
			/*  9 */ [undefined, "15.8"],
			/* 10 */ [undefined, "-9.6"],
			/* 11 */ [undefined, "asdf"],
			/* 12 */ [undefined, "420n"],
			/* 13 */ [undefined, Symbol("1234")],
			/* 14 */ [undefined, Symbol.for("1234")],
			/* 15 */ [undefined, [1, 2, 3]],
			/* 16 */ [undefined, 2**-52],
			/* 17 */ [undefined, 1e+58 + 1e+35],
			/* 18 */ [undefined, {a: 1, b: 2}],
			/* 19 */ [undefined, undefined],
			/* 20 */ [undefined, null],
			/* 21 */ [undefined, !0],
			/* 22 */ [undefined, !1],
			/* 23 */ [undefined, () => 2],
			/* 23 */ [undefined, 20n],
			/* 24 */ [undefined, -4n],
			/* 25 */ [undefined, 0n],
			/* 26 */ [undefined, /regex/],
		], outputs: [
			/*  0 */ [4, 0],
			/*  1 */ [-2, 0],
			/*  2 */ [-8, 0],
			/*  3 */ [1, 0],
			/*  4 */ [0, 0],
			/*  5 */ [0, 0],
			/*  6 */ [NaN, 0],
			/*  7 */ [1/0, 0],
			/*  8 */ [- 1/0, 0],
			/*  9 */ [16, 0],
			/* 10 */ [-10, 0],
			/* 11 */ [NaN, 0],
			/* 12 */ [NaN, 0],
			/* 13 */ [NaN, 0],
			/* 14 */ [NaN, 0],
			/* 15 */ [NaN, 0],
			/* 16 */ [0, 0],
			/* 17 */ [1e58, 0],
			/* 18 */ [NaN, 0],
			/* 19 */ [NaN, 0],
			/* 20 */ [NaN, 0],
			/* 21 */ [NaN, 0],
			/* 22 */ [NaN, 0],
			/* 23 */ [NaN, 0],
			/* 23 */ [20n, 0],
			/* 24 */ [-4n, 0],
			/* 25 */ [0n, 0],
			/* 26 */ [NaN, 0],
		],
	}, /* 6 */ isIterable: {
		args: 1
		, scope: "globalThis"
		, inputs: [
			/*  0 */ [undefined, 4.1],
			/*  1 */ [undefined, NaN],
			/*  2 */ [undefined, Infinity],
			/*  3 */ [undefined, -Infinity],
			/*  4 */ [undefined, "asdf"],
			/*  5 */ [undefined, "420n"],
			/*  6 */ [undefined, Symbol("1234")],
			/*  7 */ [undefined, Symbol.for("1234")],
			/*  8 */ [undefined, [1, 2, 3]],
			/*  9 */ [undefined, 2**-52],
			/* 10 */ [undefined, 1e+58 + 1e+35],
			/* 11 */ [undefined, {a: 1, b: 2}],
			/* 12 */ [undefined, undefined],
			/* 13 */ [undefined, null],
			/* 14 */ [undefined, true],
			/* 15 */ [undefined, false],
			/* 16 */ [undefined, () => 2],
			/* 17 */ [undefined, 20n],
			/* 18 */ [undefined, /regex/],
		], outputs: [
			/*  0 */ [false, 0],
			/*  1 */ [false, 0],
			/*  2 */ [false, 0],
			/*  3 */ [false, 0],
			/*  4 */ [true , 0],
			/*  5 */ [true , 0],
			/*  6 */ [false, 0],
			/*  7 */ [false, 0],
			/*  8 */ [true , 0],
			/*  9 */ [false, 0],
			/* 10 */ [false, 0],
			/* 11 */ [false, 0],
			/* 12 */ [false, 0],
			/* 13 */ [false, 0],
			/* 14 */ [false, 0],
			/* 15 */ [false, 0],
			/* 16 */ [false, 0],
			/* 17 */ [false, 0],
			/* 18 */ [false, 0],
		],
	}, /* 7 */ numStrNorm: {
		args: 2
		, ignore: false
		, scope: "globalThis"
		, name: "numStrNorm"
		, inputs: [
			/*  0 */ [undefined, "000000000", NaN],
			/*  1 */ [undefined, "-000000.", 32],
			/*  2 */ [undefined, "-000000.000", -123],
			/*  3 */ [undefined, ".00", /asdf/],
			/*  4 */ [undefined, ".0", null],
			/*  5 */ [undefined, "-234.12", Symbol.for("aa")],
			/*  6 */ [undefined, ".41", NaN],
			/*  7 */ [undefined, "53", NaN],
			/*  8 */ [undefined, "", NaN],
			/*  9 */ [undefined, "", "61.312abc|.."],
			/* 10 */ [undefined, "1", undefined],
			/* 11 */ [undefined, [1, 2, 3], NaN],
			/* 12 */ [undefined, /^a\s+sdf/dim, NaN],
			/* 13 */ [undefined, NaN, 43],
			/* 14 */ [undefined, true, NaN],
			/* 15 */ [undefined, false, NaN],
			/* 16 */ [undefined, "sus amogus", ""],
			/* 17 */ [undefined, complex(1, 2), NaN],
			/* 18 */ [undefined, "complex(1, 2)", NaN],
			/* 19 */ [undefined, ".", 4],
			/* 20 */ [undefined, "--123", -12n],
			/* 21 */ [undefined, "true", null],
			/* 22 */ [undefined, "false", NaN],
			/* 23 */ [undefined, "NaN", NaN],
			/* 24 */ [undefined, "NaN.", NaN],
			/* 25 */ [undefined, "NaN ", NaN],
			/* 26 */ [undefined, "false.0", NaN],
			/* 27 */ [undefined, "true.", NaN],
			/* 28 */ [undefined, "null.", NaN],
			/* 29 */ [undefined, "null", NaN],
			/* 30 */ [undefined, "void 0", NaN],
			/* 31 */ [undefined, "undefined", NaN],
			/* 32 */ [undefined, "undefined.0", NaN],
			/* 33 */ [undefined, "Infinity.0", NaN],
			/* 34 */ [undefined, "Infinity", NaN],
			/* 35 */ [undefined, "-Infinity", NaN],
			/* 36 */ [undefined, "infinity", NaN],
			/* 37 */ [undefined, "-infinity", NaN],
			/* 38 */ [undefined, "-null", NaN],
			/* 39 */ [undefined, "4n", NaN],
			/* 40 */ [undefined, "-4n", NaN],
			/* 41 */ [undefined, "-4 n", NaN],
			/* 42 */ [undefined, "- 123", NaN],
			/* 43 */ [undefined, "+ 517", NaN],
			/* 44 */ [undefined, "+517.", NaN],
			/* 45 */ [undefined, "+123.12", NaN],
			/* 46 */ [undefined, "+456", NaN],
			/* 47 */ [undefined, "15.0000000000000000000000000000000000000000000000000000000000001", NaN],
			/* 48 */ [undefined, " 123.0 ", NaN],
			/* 49 */ [undefined, "1.24e+3", NaN],
			/* 50 */ [undefined, "12.4e+2", NaN],
			/* 51 */ [undefined, Symbol("asdf"), NaN],
			/* 52 */ [undefined, Symbol.for("qwer"), NaN],
			/* 53 */ [undefined, 0.3e-4, NaN],
			/* 54 */ [undefined, 6.123e-24, NaN],
			/* 55 */ [undefined, {a: 1, b: 2, c: 3}, NaN],
			/* 56 */ [undefined, "\n123 ", NaN],
			/* 57 */ [undefined, "+456.1234", NaN],
			/* 58 */ [undefined, /asdf$/, NaN],
			/* 59 */ [undefined, "- -456", NaN],
			/* 60 */ [undefined, "123 .456", NaN],
			/* 61 */ [undefined, "4.56\n78E19", NaN],
			/* 62 */ [undefined, 1234n, NaN],
			/* 63 */ [undefined, -5678n, NaN],
			/* 64 */ [undefined, 0n, NaN],
			/* 65 */ [undefined, -0n, NaN],
			/* 66 */ [undefined, 0, NaN],
			/* 67 */ [undefined, -0, NaN],
			/* 68 */ [undefined, "-0.0", NaN],
			/* 69 */ [undefined, "-0e-12", NaN],
			/* 70 */ [undefined, "-00.0E41", NaN],
			/* 71 */ [undefined, null, NaN],
			/* 72 */ [undefined, undefined, NaN],
			/* 73 */ [undefined, Infinity, NaN],
			/* 74 */ [undefined, -Infinity, NaN],
			/* 75 */ [undefined, "1.234E-9", NaN],
			/* 76 */ [undefined, "0.01234e-7", NaN],
			/* 77 */ [undefined, "1234.1234e6", NaN],
			/* 78 */ [undefined, "4.5678E19", NaN],
			/* 79 */ [undefined, 4.5678E19, NaN],
			/* 80 */ [undefined, -1.2698e18, NaN],
			/* 81 */ [undefined, 4.5678E+17, NaN],
			/* 82 */ [undefined, 2.65813e+16, NaN],
			/* 83 */ [undefined, "0x2A3F", NaN],
			/* 84 */ [undefined, "0x2a3F", NaN],
			/* 85 */ [undefined, "0x2a3f", NaN],
			/* 86 */ [undefined, "0b100101", NaN],
			/* 87 */ [undefined, "0o1234567", NaN],
			/* 88 */ [undefined, "01234567", NaN],
			/* 89 */ [undefined, Symbol.iterator, 45],
			/* 90 */ [undefined, Symbol.hasInstance, "fish"],
		], outputs: [
			/*  0 */ ["0.0", 0],
			/*  1 */ ["0.0", 0],
			/*  2 */ ["0.0", 0],
			/*  3 */ ["0.0", 0],
			/*  4 */ ["0.0", 0],
			/*  5 */ ["-234.12", 0],
			/*  6 */ ["0.41", 0],
			/*  7 */ ["53.0", 0],
			/*  8 */ [NaN, 0],
			/*  9 */ ["61.312abc|..", 0],
			/* 10 */ ["1.0", 0],
			/* 11 */ [NaN, 0],
			/* 12 */ [NaN, 0],
			/* 13 */ [43, 0],
			/* 14 */ ["1.0", 0],
			/* 15 */ ["0.0", 0],
			/* 16 */ ["", 0],
			/* 17 */ [NaN, 0],
			/* 18 */ [NaN, 0],
			/* 19 */ [4, 0],
			/* 20 */ [-12n, 0],
			/* 21 */ ["1.0", 0],
			/* 22 */ ["0.0", 0],
			/* 23 */ [NaN, 0],
			/* 24 */ [NaN, 0],
			/* 25 */ [NaN, 0],
			/* 26 */ [NaN, 0],
			/* 27 */ [NaN, 0],
			/* 28 */ [NaN, 0],
			/* 29 */ [NaN, 0],
			/* 30 */ [NaN, 0],
			/* 31 */ [NaN, 0],
			/* 32 */ [NaN, 0],
			/* 33 */ [NaN, 0],
			/* 34 */ [Infinity, 0],
			/* 35 */ [-Infinity, 0],
			/* 36 */ [NaN, 0],
			/* 37 */ [NaN, 0],
			/* 38 */ [NaN, 0],
			/* 39 */ [NaN, 0],
			/* 40 */ [NaN, 0],
			/* 41 */ [NaN, 0],
			/* 42 */ [NaN, 0],
			/* 43 */ [NaN, 0],
			/* 44 */ ["517.0", 0],
			/* 45 */ ["123.12", 0],
			/* 46 */ ["456.0", 0],
			/* 47 */ ["15.0000000000000000000000000000000000000000000000000000000000001", 0],
			/* 48 */ ["123.0", 0],
			/* 49 */ ["1240.0", 0],
			/* 50 */ ["1240.0", 0],
			/* 51 */ [NaN, 0],
			/* 52 */ [NaN, 0],
			/* 53 */ ["0.00003", 0],
			/* 54 */ ["0.000000000000000000000006123", 0],
			/* 55 */ [NaN, 0],
			/* 56 */ ["123.0", 0],
			/* 57 */ ["456.1234", 0],
			/* 58 */ [NaN, 0],
			/* 59 */ [NaN, 0],
			/* 60 */ [NaN, 0],
			/* 61 */ [NaN, 0],
			/* 62 */ ["1234.0", 0],
			/* 63 */ ["-5678.0", 0],
			/* 64 */ ["0.0", 0],
			/* 65 */ ["0.0", 0],
			/* 66 */ ["0.0", 0],
			/* 67 */ ["0.0", 0],
			/* 68 */ ["0.0", 0],
			/* 69 */ ["0.0", 0],
			/* 70 */ ["0.0", 0],
			/* 71 */ ["0.0", 0],
			/* 72 */ ["0.0", 0],
			/* 73 */ [Infinity, 0],
			/* 74 */ [-Infinity, 0],
			/* 75 */ ["0.000000001234", 0],
			/* 76 */ ["0.000000001234", 0],
			/* 77 */ ["1234123400.0", 0],
			/* 78 */ ["45678000000000000000.0", 0],
			/* 79 */ ["45678000000000000000.0", 0],
			/* 80 */ ["-1269800000000000000.0", 0],
			/* 81 */ ["456780000000000000.0", 0],
			/* 82 */ ["26581300000000000.0", 0],
			/* 83 */ ["10815.0", 0],
			/* 84 */ ["10815.0", 0],
			/* 85 */ ["10815.0", 0],
			/* 86 */ ["37.0", 0],
			/* 87 */ ["342391.0", 0],
			/* 88 */ ["1234567.0", 0],
			/* 89 */ [45, 0],
			/* 90 */ ["fish", 0],
		],
	}, /* 8 */ norm: {
		ignore: true
		, useDifferentTestSet: "numStrNorm"
		, scope: "globalThis.sMath"
		, name: "norm"
		,
	},
};



LIBRARY_VARIABLES["local tests"] = tests;

if (globalTestsObject == null)
	globalTestsObject = globalThis[LibSettings.Testing_Object_Global_Name] = {};


if (globalTestsObject.constructor?.name === "Array")
	globalTestsObject.push(tests);
else if (globalTestsObject.constructor?.name === "Object")
	globalTestsObject[LibSettings.LIBRARY_NAME] = tests;

}


/* globalThis.sgn(): (ones  to add)

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
