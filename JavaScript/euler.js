// Project Euler problems

{; // assume all inputs are valid
} function problem_1(x = 10) {
	for (var i = 3, ans = 0; i < x; i++)
		if (i % 3 === 0 || i % 5 === 0)
			ans += i;

	return ans;
} function problem_2(x = 4_000_000) {
	for (var i = 0, fibonacci = [1, 2], ans = 0; fibonacci[0] < x; i++) {
		if (fibonacci[0] % 2 === 0)
			ans += fibonacci[0];

		fibonacci.push(fibonacci[1] + fibonacci.shift());
	}

	return ans;
} function problem_3(x = 600851475143) {
	function isPrime(x) {
		if (!Number.isInteger(x))
			return false;

		if (x === 2)
			return true;

		if (x % 2 === 0 || x < 3)
			return false;

		for (var i = 3, max = Math.sqrt(x); i <= max; i += 2)
			if (x % i === 0)
				return false;

		return true;
	}

	for (let i = 2, factors = []; i <= x; i++)
		if (x % i === 0 && isPrime(i))
			factors.push(i),
			x /= i;

	return factors[factors.length - 1];
} function problem_4() {
	for (var i = 1, tmp, ans; i < 1000; i++)
		for (var j = 1; j < 1000; j++) {
			tmp = i * j;

			if (+`${tmp}`.split("").reverse().join("") === tmp && tmp > ans)
				ans = tmp;
		}

	return ans;
} function problem_5(x = 20) {
	function lcm(...a) {
		a = a.flat(Infinity).map(b =>
			Number.parseInt(b) * (b < 0 ? -1 : 1)
		);

		for (let c, i = Math.max(...a) ;; i++) {
			for (let j = a.length; j --> 0;) {
				if (i % a[j]) {
					c = !1;
					break;
				}
				c = !0;
			}

			if (c)
				return i;
		}
	}

	for (var array = [], i = x; i --> 0 ;)
		array[i] = i;

	return lcm(array);
} function problem_6(end = 100) {
	function sum(l, f = n => n) {
		for (var t = 0, n = 1; n <= l ;)
			t += f(n++);

		return t;
	}

	return sum(end)**2 - sum(end, n => n**2);
} function problem_7(index = 10_001) {
	function isPrime(x) {
		if (x === 2)
			return true;

		if (x % 2 === 0 || x < 2)
			return false;

		for (var i = 3, n = Math.sqrt(x); i <= n; i += 2)
			if (x % i === 0)
				return false;

		return true;
	}

	for (var i = 2, j = 0 ;; i++) {
		if (isPrime(i)) {
			j++;
			if (j === index)
				return i;
		}
	}
} function problem_8(size = 9, number) {
	number ??=
		"7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843" +
		"8586156078911294949545950173795833195285320880551112540698747158523863050715693290963295227443043557" +
		"6689664895044524452316173185640309871112172238311362229893423380308135336276614282806444486645238749" +
		"3035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776" +
		"6572733300105336788122023542180975125454059475224352584907711670556013604839586446706324415722155397" +
		"5369781797784617406495514929086256932197846862248283972241375657056057490261407972968652414535100474" +
		"8216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586" +
		"1786645835912456652947654568284891288314260769004224219022671055626321111109370544217506941658960408" +
		"0719840385096245544436298123098787992724428490918884580156166097919133875499200524063689912560717606" +
		"0588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450";

	for (var i = number.length - size + 1, hash = []; i --> 0 ;)
		hash[i] = number.substr(i, size).split("").reduce((t, e) => t*e, 1);
	return [Math.max(...hash), hash];
} function problem_9(target = 1000) {
	for (var a = 1, triples = []; a < target; a++)
		for (var b = 1; b < target; b++) {
			const c = Math.hypot(a, b);

			if (c % 1 === 0 && a + b + c <= target)
				triples.push([a, b, c]);
		}


	for (var i = triples.length; i --> 0 ;)
		if (triples[i][0] + triples[i][1] + triples[i][2] === target)
			return triples[i][0] * triples[i][1] * triples[i][2];

	return null;
} function problem_10(x = 2_000_000) {
	// slow
	function isPrime(x) {
		if (x === 2)
			return true;

		if (x % 2 === 0 || x < 2)
			return false;

		for (var i = 3, n = Math.sqrt(x); i <= n; i += 2)
			if (x % i === 0)
				return false;

		return true;
	}

	for (var i = 2, ans = 0; i < x; i++)
		if (isPrime(i))
			ans += i;

	return ans
} function problem_11(grid) {
	grid ??= [
		[ 8,  2, 22, 97, 38, 15,  0, 40,  0, 75,  4,  5,  7, 78, 52, 12, 50, 77, 91,  8],
		[49, 49, 99, 40, 17, 81, 18, 57, 60, 87, 17, 40, 98, 43, 69, 48,  4, 56, 62,  0],
		[81, 49, 31, 73, 55, 79, 14, 29, 93, 71, 40, 67, 53, 88, 30,  3, 49, 13, 36, 65],
		[52, 70, 95, 23,  4, 60, 11, 42, 69, 24, 68, 56,  1, 32, 56, 71, 37,  2, 36, 91],
		[22, 31, 16, 71, 51, 67, 63, 89, 41, 92, 36, 54, 22, 40, 40, 28, 66, 33, 13, 80],
		[24, 47, 32, 60, 99,  3, 45,  2, 44, 75, 33, 53, 78, 36, 84, 20, 35, 17, 12, 50],
		[32, 98, 81, 28, 64, 23, 67, 10, 26, 38, 40, 67, 59, 54, 70, 66, 18, 38, 64, 70],
		[67, 26, 20, 68,  2, 62, 12, 20, 95, 63, 94, 39, 63,  8, 40, 91, 66, 49, 94, 21],
		[24, 55, 58,  5, 66, 73, 99, 26, 97, 17, 78, 78, 96, 83, 14, 88, 34, 89, 63, 72],
		[21, 36, 23,  9, 75,  0, 76, 44, 20, 45, 35, 14,  0, 61, 33, 97, 34, 31, 33, 95],
		[78, 17, 53, 28, 22, 75, 31, 67, 15, 94,  3, 80,  4, 62, 16, 14,  9, 53, 56, 92],
		[16, 39,  5, 42, 96, 35, 31, 47, 55, 58, 88, 24,  0, 17, 54, 24, 36, 29, 85, 57],
		[86, 56,  0, 48, 35, 71, 89,  7,  5, 44, 44, 37, 44, 60, 21, 58, 51, 54, 17, 58],
		[19, 80, 81, 68,  5, 94, 47, 69, 28, 73, 92, 13, 86, 52, 17, 77,  4, 89, 55, 40],
		[ 4, 52,  8, 83, 97, 35, 99, 16,  7, 97, 57, 32, 16, 26, 26, 79, 33, 27, 98, 66],
		[88, 36, 68, 87, 57, 62, 20, 72,  3, 46, 33, 67, 46, 55, 12, 32, 63, 93, 53, 69],
		[ 4, 42, 16, 73, 38, 25, 39, 11, 24, 94, 72, 18,  8, 46, 29, 32, 40, 62, 76, 36],
		[20, 69, 36, 41, 72, 30, 23, 88, 34, 62, 99, 69, 82, 67, 59, 85, 74,  4, 36, 16],
		[20, 73, 35, 29, 78, 31, 90,  1, 74, 31, 49, 71, 48, 86, 81, 16, 23, 57,  5, 54],
		[ 1, 70, 54, 71, 83, 51, 54, 69, 16, 92, 33, 48, 61, 43, 52,  1, 89, 19, 67, 48],
	]

	function max(...n) { return Math.max(...n) }

	var map = [[], [], [], []];
	var numRows = grid.length;
	var numCols = grid[0].length;

	for (var i = 0; i < numCols; i++) // for each column
		for (var j = numRows - 4; j >= 0; j--) // for each row
			map[0].push(
				grid[j + 0][i] *
				grid[j + 1][i] *
				grid[j + 2][i] *
				grid[j + 3][i]
			), // vertical search
			map[1].push(
				grid[i][j + 0] *
				grid[i][j + 1] *
				grid[i][j + 2] *
				grid[i][j + 3]
			); // horizontal search

	for (var i = numRows - 3; i --> 0 ;) { // for each row
		for (var j = numCols - 3; j --> 0 ;) // for each column
			map[2].push(
				grid[i + 0][j + 0] *
				grid[i + 1][j + 1] *
				grid[i + 2][j + 2] *
				grid[i + 3][j + 3]
			); // ↖ ↘ search

		for (var j = numCols; j --> 3;) // for each column
			map[3].push(
				grid[j - 0][i + 0] *
				grid[j - 1][i + 1] *
				grid[j - 2][i + 2] *
				grid[j - 3][i + 3]
			); // ↙ ↗ search
	}

	return max(map.map( e => max(e) ));
} function problem_12(target = 500) {
	function factors(n) {
		for (var i = 2, f = [1, n], N = Math.sqrt(n); i <= N; i++)
			if (n % i === 0)
				f.push(i, n / i)

		return f
	}

	for (var i = 1, s = 0 ;; i++) {
		s += i;

		if (factors(s).length > target)
			return s;
	}
} function problem_13(numbers) {
	numbers ??= [
		37107287533902102798797998220837590246510135740250n, 46376937677490009712648124896970078050417018260538n,
		74324986199524741059474233309513058123726617309629n, 91942213363574161572522430563301811072406154908250n,
		23067588207539346171171980310421047513778063246676n, 89261670696623633820136378418383684178734361726757n,
		28112879812849979408065481931592621691275889832738n, 44274228917432520321923589422876796487670272189318n,
		47451445736001306439091167216856844588711603153276n, 70386486105843025439939619828917593665686757934951n,
		62176457141856560629502157223196586755079324193331n, 64906352462741904929101432445813822663347944758178n,
		92575867718337217661963751590579239728245598838407n, 58203565325359399008402633568948830189458628227828n,
		80181199384826282014278194139940567587151170094390n, 35398664372827112653829987240784473053190104293586n,
		86515506006295864861532075273371959191420517255829n, 71693888707715466499115593487603532921714970056938n,
		54370070576826684624621495650076471787294438377604n, 53282654108756828443191190634694037855217779295145n,
		36123272525000296071075082563815656710885258350721n, 45876576172410976447339110607218265236877223636045n,
		17423706905851860660448207621209813287860733969412n, 81142660418086830619328460811191061556940512689692n,
		51934325451728388641918047049293215058642563049483n, 62467221648435076201727918039944693004732956340691n,
		15732444386908125794514089057706229429197107928209n, 55037687525678773091862540744969844508330393682126n,
		18336384825330154686196124348767681297534375946515n, 80386287592878490201521685554828717201219257766954n,
		78182833757993103614740356856449095527097864797581n, 16726320100436897842553539920931837441497806860984n,
		48403098129077791799088218795327364475675590848030n, 87086987551392711854517078544161852424320693150332n,
		59959406895756536782107074926966537676326235447210n, 69793950679652694742597709739166693763042633987085n,
		41052684708299085211399427365734116182760315001271n, 65378607361501080857009149939512557028198746004375n,
		35829035317434717326932123578154982629742552737307n, 94953759765105305946966067683156574377167401875275n,
		88902802571733229619176668713819931811048770190271n, 25267680276078003013678680992525463401061632866526n,
		36270218540497705585629946580636237993140746255962n, 24074486908231174977792365466257246923322810917141n,
		91430288197103288597806669760892938638285025333403n, 34413065578016127815921815005561868836468420090470n,
		23053081172816430487623791969842487255036638784583n, 11487696932154902810424020138335124462181441773470n,
		63783299490636259666498587618221225225512486764533n, 67720186971698544312419572409913959008952310058822n,
		95548255300263520781532296796249481641953868218774n, 76085327132285723110424803456124867697064507995236n,
		37774242535411291684276865538926205024910326572967n, 23701913275725675285653248258265463092207058596522n,
		29798860272258331913126375147341994889534765745501n, 18495701454879288984856827726077713721403798879715n,
		38298203783031473527721580348144513491373226651381n, 34829543829199918180278916522431027392251122869539n,
		40957953066405232632538044100059654939159879593635n, 29746152185502371307642255121183693803580388584903n,
		41698116222072977186158236678424689157993532961922n, 62467957194401269043877107275048102390895523597457n,
		23189706772547915061505504953922979530901129967519n, 86188088225875314529584099251203829009407770775672n,
		11306739708304724483816533873502340845647058077308n, 82959174767140363198008187129011875491310547126581n,
		97623331044818386269515456334926366572897563400500n, 42846280183517070527831839425882145521227251250327n,
		55121603546981200581762165212827652751691296897789n, 32238195734329339946437501907836945765883352399886n,
		75506164965184775180738168837861091527357929701337n, 62177842752192623401942399639168044983993173312731n,
		32924185707147349566916674687634660915035914677504n, 99518671430235219628894890102423325116913619626622n,
		73267460800591547471830798392868535206946944540724n, 76841822524674417161514036427982273348055556214818n,
		97142617910342598647204516893989422179826088076852n, 87783646182799346313767754307809363333018982642090n,
		10848802521674670883215120185883543223812876952786n, 71329612474782464538636993009049310363619763878039n,
		62184073572399794223406235393808339651327408011116n, 66627891981488087797941876876144230030984490851411n,
		60661826293682836764744779239180335110989069790714n, 85786944089552990653640447425576083659976645795096n,
		66024396409905389607120198219976047599490197230297n, 64913982680032973156037120041377903785566085089252n,
		16730939319872750275468906903707539413042652315011n, 94809377245048795150954100921645863754710598436791n,
		78639167021187492431995700641917969777599028300699n, 15368713711936614952811305876380278410754449733078n,
		40789923115535562561142322423255033685442488917353n, 44889911501440648020369068063960672322193204149535n,
		41503128880339536053299340368006977710650566631954n, 81234880673210146739058568557934581403627822703280n,
		82616570773948327592232845941706525094512325230608n, 22918802058777319719839450180888072429661980811197n,
		77158542502016545090413245809786882778948721859617n, 72107838435069186155435662884062257473692284509516n,
		20849603980134001723930671666823555245252804609722n, 53503534226472524250874054075591789781264330331690n,
	];

	return `${ numbers.reduce((t, e) => e + t, 0n) }`.slice(0, 10);
} function problem_14(end = 1_000_000) {
	function collatzLen(x) {
		for (var i = 0; x !== 1; i++) {
			if (x % 2)
				x = 3*x + 1;
			else x /= 2;
		}

		return i
	}

	for (var i = 1, ans = [0, 0]; i < end; i++) {
		var a = collatzLen(i);

		if (a > ans[1])
			ans = [i, a];
	}

	return ans[0];
} function problem_15(gridSize = 20) {
	function ifact(n) {
		for (var ans = 1n, cur = 1n; cur <= n; cur++)
			ans *= cur;

		return ans;
	}

	return Number(ifact(2 * gridSize) / ifact(gridSize)**2n);
} function problem_16(power = 15) {
	return `${1n << BigInt(power)}`.split("").reduce(
		(t, n) => t + BigInt(n), 0n
	);
} function problem_17(target = 1000) {
	function numberToWords(number) {
		if (typeof number !== "number") throw Error(`Expected a number, and found a(n) ${typeof number}`);
		number = ~~number;
		switch (true) {
			case number < 0: return `negative ${numberToWords(-number)}`;
			case number === 0: return "zero";
			case number === 1: return "one";
			case number === 2: return "two";
			case number === 3: return "three";
			case number === 4: return "four";
			case number === 5: return "five";
			case number === 6: return "six";
			case number === 7: return "seven";
			case number === 8: return "eight";
			case number === 9: return "nine";
			case number === 10: return "ten";
			case number === 11: return "eleven";
			case number === 12: return "twelve";
			case number === 13: return "thirteen";
			case number === 15: return "fifteen";
			case number === 18: return "eighteen";
			case number < 20: return `${numberToWords(1*(""+number)[1])}teen`;
			case number === 20: return "twenty";
			case number < 30: return `twenty-${numberToWords(1*(""+number)[1])}`;
			case number === 30: return "thirty";
			case number < 40: return `thirty-${numberToWords(1*(""+number)[1])}`;
			case number === 40: return "forty";
			case number < 50: return `forty-${numberToWords(1*(""+number)[1])}`;
			case number === 50: return "fifty";
			case number < 60: return `fifty-${numberToWords(1*(""+number)[1])}`;
			case number === 60: return "sixty";
			case number < 70: return `sixty-${numberToWords(1*(""+number)[1])}`;
			case number === 70: return "seventy";
			case number < 80: return `seventy-${numberToWords(1*(""+number)[1])}`;
			case number === 80: return "eighty";
			case number < 90: return `eighty-${numberToWords(1*(""+number)[1])}`;
			case number === 90: return "ninety";
			case number < 100: return `ninety-${numberToWords(1*(""+number)[1])}`;
			case number % 100 === 0 && (""+number).length === 3: return `${numberToWords(1*(""+number)[0])} hundred`;
			case number < 1_000: return`${numberToWords(1*(""+number)[0])} hundred and ${numberToWords(1*(""+number).substr(1,2))}`;
			case number % 1_000 === 0 && (""+number).length === 4: return `${numberToWords(1*(""+number)[0])} thousand`;
			case number < 10_000: return `${numberToWords(1*(""+number)[0])} thousand ${numberToWords(1*(""+number).substr(1,3))}`;
			default: throw Error(`Number not found. only works in range (-10000, 10000). input: ${number}`);
		}
	}

	target++;

	for (var i = 1, array = []; i < target; i++)
		array.push(numberToWords(i));

	return array
		.map(e => e.replace(/ |-/g, "").length)
		.reduce((t, e) => t + e, 0);
} function problem_18(treeString) {
	treeString ??= (`
                            75
                          95  64
                        17  47  82
                      18  35  87  10
                    20  04  82  47  65
                  19  01  23  75  03  34
                88  02  77  73  07  63  67
              99  65  04  28  06  16  70  92
            41  41  26  56  83  40  80  70  33
          41  48  72  33  47  32  37  16  94  29
        53  71  44  65  25  43  91  52  97  51  14
      70  11  33  28  77  73  17  78  39  68  17  57
    91  71  52  38  17  14  91  43  58  50  27  29  48
  63  66  04  68  89  53  67  30  73  16  69  87  40  31
04  62  98  27  23  09  70  98  73  93  38  53  60  04  23
`)

	class TreeNode {
		constructor(value, left=null, right=null) {
			this.value  = value
			this.left   = left
			this.right  = right

			// caching changes the solution from O(2^levels) to O(levels^2)
			// this is because all non-edge nodes have two parents.
			this._pathSum = null
		}

		maxPathSum() {
			if (this._pathSum == null)
				this._pathSum = this.value + Math.max(
					this.left ?.maxPathSum?.() ?? 0,
					this.right?.maxPathSum?.() ?? 0,
				)

			return this._pathSum
		}
	}

	function stringToTree(inputString) {
		const lines = inputString.strip().split("\n")
		const levels = lines.map(line =>
			line.strip().split(/\s+/).map(x => +x)
		)

		const nodes = levels.map(level =>
			level.map((x, i) => new TreeNode(x))
		)

		// Link nodes to form the tree
		for (let i = 0; i < nodes.length - 1; i++)
			for (let j = 0; j < nodes[i].length; j++) {
				nodes[i][j].left = nodes[i + 1][j]
				nodes[i][j].right = nodes[i + 1][j + 1]
			}

		// The root of the tree is the first node
		const root = nodes[0][0]
		root.isRoot = true;

		return root
	}

	return stringToTree(treeString).maxPathSum()
}

function problem_20(x = 100n) {
	factorial = x;

	while (x --> 1n)
		factorial *= x;

	return `${factorial}`.split("").reduce((t, e) => t + +e, 0)
} function problem_21(x = 10_000) {
	function d(n) {
		let total = 0

		for (i = n; i --> 1 ;)
			if (n % i === 0)
				total += i

		return total
	}

	const amicables = []
	const set = new Set(Array.from({length: x}, (_, i) => i + 1))
	
	while (set.size) {
		const a = set.values().next().value
		const b = d(a)

		if (a !== b && set.has(b)) {
			if (d(b) === a)
				amicables.push(a, b)

			set.delete(b)
		}

		set.delete(a)
	}

	return amicables.reduce((t, e) => t + e, 0)
} function problem_22() {
	const names = fs.readFileSync("./euler-problem-22-data.txt", "utf8").split(",")
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	function nameScore(name, index) {
		return (index + 1) * name.split("").reduce((total, char) =>
			total + alphabet.indexOf(char) + 1
		, 0)
	}

	names.sort()

	return names.reduce((total, name, index) => total + nameScore(name, index), 0)
}

function problem_67(treeString) {
	treeString ??= fs.readFileSync("./euler-problem-67-data.txt", "utf8")
	return problem_18(treeString)
}

function problem_80(last = 100) {
	const wolframCode = `
	Total@ Table[
		With[{ s = Sqrt[n] },
			(* Ignore perfect squares *)
			If [Head[s] === Integer,
				Nothing,
				(*
					Mathematica rounds the last digit instead of truncating.
					For some reason, s ~N~ 101 with ;;-2 doesn't work and returns 40887.
					Thats half an hour I will never get back.
				*)
				Total[ RealDigits[s ~N~ 102] [[1]] [[;;-3]] ]
			]
		],
		{n, 1, ${last}}}
	]`;

	const wolframCodeFunny = `Total[Table[With[{s=Sqrt[n]},If[SameQ[Head[s],Integer],Nothing[],Total[Part[Part[RealDigits[N[s,102]],1],Span[1,-3]]]]],List[n,1,${last}]]]`;

	return 40886; // if `last` == 100
}

function problem_104() {
	const sqrt5 = Math.sqrt(5)
	const a = Math.log10((1 + sqrt5) / 2)
	const b = -Math.log10(sqrt5)

	function topDigits(n) {
		// basically uses F_n ≈ round(phi^n / sqrt5)
		const t = n*a + b

		const approx = 10 ** (8 + t % 1)

		return Math.floor(approx)
	}

	function isPandigital(n) {
		return `${n}`.split("").sort().join("") === "123456789"
	}

	var prev = [1, 1]
	var n = 3

	while (true) {
		const current = (prev[0] + prev[1]) % 1_000_000_000

		if (isPandigital(current) && isPandigital(topDigits(n)) )
			return n

		n++
		prev = [prev[1], current]
	}
}

function problem_512(target=500_000_000) {
	// this code is really slow, and took a couple of days to finish, but I don't know how to make it faster.

	const wolframCode = `
	(* every once and a while, manually update the base case to be closer to the goal, and restart the kernel. *)
	$RecursionLimit = 50000
	target = ${target}
	(* Num[s_String] := ToExpression@ StringReplace[s, " " -> ""] *)
	F[1] = 1
	F[n_Integer] /; n > 1 := Mod[
		EulerPhi[n] With[{n2m1 = n^2 - 1},
			Mod[PowerMod[n, n, n2m1] - 1, n2m1] / (n - 1)
		],
		n + 1
	]
	x = 0
	G[0] = 0

	(* (* most recent update *)
		x = Num["499 995 102"]
		G[x] = Num["50 659 599 257 027 681"]
	*)
	G[n_] := G[n] = G[n - 1] + F[n]
	For [n = x + 1, n <= target, n += 38807,
		Print@ Riffle[
			{n, N[100 n / target, 8] "%"},
			Reverse@ AbsoluteTiming@ G@ n
		];
	];

	Print@* G@ target
	(* {n, F[n], "percentage done", "time elapsed on last operation"} *)`;

	const wolframCodeFunny = "Set[$RecursionLimit,50000];Set[target,500000000];Set[F[1],1];SetDelayed[Condition[F[Pattern[n,Blank[Integer]]],Greater[n,1]],Mod[Times[EulerPhi[n],With[List[Set[n2m1,Subtract[Power[n,2],1]]],Divide[Mod[Subtract[PowerMod[n,n,n2m1],1],n2m1],Subtract[n,1]]]],Plus[n,1]]];Set[x,0];Set[G[0],0];SetDelayed[G[Pattern[n,Blank[]]],Set[G[n],Plus[G[Subtract[n,1]],F[n]]]];For[Set[n,Plus[x,1]],LessEqual[n,target],AddTo[n,38807],Print[Riffle[List[n,N[Times[100,Divide[n,target],\"%\"],8]],Reverse[AbsoluteTiming[G[n]]]]]];Print[G[target]]";
	const wolframCodeMinified = "$RecursionLimit=50000;t=5*^8;F[1]=1;F[n_]:=Mod[EulerPhi[n]Mod[PowerMod[n,n,n^2-1]-1,n^2-1]/(n-1),n+1];n=0;G[0]=0;G[n_]:=G[n]=G[n-1]+F[n];For[,n<=t,n+=38807,Print@Riffle[{n,N[100n/t,8]\"%\"},Reverse@AbsoluteTiming@G@n]];Print@G@t"

	return 50660591862310323; // if `target` == 5 * 10^8
}
