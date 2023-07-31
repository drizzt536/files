#!/usr/bin/env js
// requires lib.js


// greedy egyptian fraction expansion of pi
function piEgyptianFractionExpansion(useStep1=true, {nOverride, pOverride}={}) {
	// you will probably need to manually make sure the last digit is correct...
	// there is a bug for if it is on the last digit.

	// the precision should be a little more than double the previous
	sMath.precision = 2250; // this is a manual value

	console.log("variables");

	var n = nOverride ?? 9n; // natural number.
	var p = pOverride ?? 0n; // power
	var approx;
	console.log("\tcomputation of known terms: starting");
	var BASE_VALUE = sMath.add(
		// the previous terms need to be put in manually
		// index | decimal precision | scientific notation exponent for term
		/*+----+------+------+*/
		/*| 0  |    0 |  N/A |*/ 3n // represents 1/1 + 1/1 + 1/1
		/*| 1  |    1 |    0 |*/ , sMath.inv(8n)
		/*| 2  |    3 |    1 |*/ , sMath.inv(61n)
		/*| 3  |    7 |    3 |*/ , sMath.inv(5020n)
		/*| 4  |   17 |    8 |*/ , sMath.inv(128541455n)
		/*| 5  |   34 |   17 |*/ , sMath.inv(162924332716605980n)
		/*| 6  |   68 |   34 |*/ , sMath.inv(28783052231699298507846309644849796n)
		/*| 7  |  137 |   68 |*/ , sMath.inv(871295615653899563300996782209332544845605756266650946342214549769447n)
		/*| 8  |  275 |  137 |*/ , sMath.inv(910061501066771569929177518283776533536956708990096834567481804094469953756509557953741463718463021812584586928871816513428410989679108567n)
		/*| 9  |  552 |  276 |*/ , sMath.inv(1519975995495123548864232057230913989322800465552709630913779900493650670821767027219702518074382949141691252249407810669110196772510918483421661269623000241540612237295778589839203838068946388167303612692018867252097220910799910121318313730089594877104929553610347363788990198n)
		/*| 10 | 1108 |  552 |*/ , sMath.inv(3615455471582486000145649018223397099166826163683301789062540270509414959783556780836761642204519869354884239583194801387002048797969779091794868463185702594818005541857630128575946136035053165329955953027655941749295936491729557558509795623239994105636752198836270784061141719941852449881772325462303572255174255057672638567474967542491354471381176431978776054756233942285930200578166190648569473860832228026892389517758910739072052112180302512759973884762505528749693481612414819148862238401215750025609802645249507759302626955226055882048423169423343n)
		/*| 11 | 2217 | 1108 |*/ , sMath.inv(44307489566534943680673245462504159770281187977643191015419371812634393000467171774383804593891321909064706907093777137161291151633698755098127790260131130447691904647429154709335414247960087137917104875600833337266623752183654599354324990490308332562223348390184611948219514918579489845234698365013397796478714854840642562972820230436312709375435435083574445573053724718588356666401116940513751151217306043649172632623786705270622659362235034562392258756013762402728647299194328632265606494795066906374034167576732264734123090031919070861358419549096834837454639370074304352060364101073076810631784982842723519925131360164706882689225079787446349554004080546731917789072805592046813543159135378307431306080876183415707726907097068958880259114829000271986605457522146630666278182645118473157779897822499164640972052019121154750598694064423247029865182042839418188632791961668626330412746830682144727497777944644616148776909032232648850690189590719183725223256749757437828732837682409265622910158923833325966358322458568736250159945534072134155301696017487287118261706993556548894936260406435592564464187488350n)
		/*+----+------+------+*/
	);
	console.log("\tcomputation of known terms: finished");
	var pi = sMath.piApprox.digits[
		Math.max( Object.keys(sMath.piApprox.digits).map(e => +e) )
	].slice(0, sMath.precision + 2);

	if (pi.length < sMath.precision + 2)
		throw Error`sMath.piApprox.digits can't match the precision of sMath.precision.\nadd more precision to sMath.piApprox.digits`;

	function getApprox() {
		return sMath.add(
			BASE_VALUE,
			// MUCH faster than multiplying before inverting
			// sMath.iinv(n) is faster for small n (<~ 5020) and can give wrong answers
			sMath.div10(sMath.inv(n), p)
		);
	}



	if (useStep1) {
		console.log("Stage 1: Find Correct Power of 10");
		console.log("%cp == %o", "color: darkgray", p);
		while (sMath.eq.gt(approx = getApprox(), pi))
			console.log("%c++p == %o", "color: lightgray", ++p);
	}
	else {
		console.log("%cp == %o", "color: darkgray", p);
		approx = getApprox();
	}



	console.log("Stage 2: Find Correct Digits");
	while (p >= 0n) {
		console.log(
			"%c%sn%cE%o; >= %c%sd",
			"color: darkgray",
			n,
			"color: white",
			p,
			"color: #9980FF",
			fstrdiff(approx, pi)
		);

		if (n % 10n === 0n) {
			--p;
			p === -1n || (n = 10n*n + 9n);
			continue;
		}

		approx = getApprox();

		if ( sMath.eq.eq(approx, pi) ) throw Error`approx == pi. add more precision`;

		sMath.eq.gt(approx, pi) ? // approx > pi
			p-- ?
				n = 10n*n + 9n :
				--n :
			--n;
	}

	console.log(
		"%c%sn%c; %c%s digits",
		"color: darkgray;",
		n,
		"color: white;",
		"color: #9980FF;",
		fstrdiff(approx, pi)
	);

	return n;
}



// piEgyptianFractionExpansion(false, {nOverride, pOverride});

/* // for the gamma paper

1. elaborate on the significance of simultaneous execution
2. Refer to Equation (4), where $C(S)$ is talked about.
3. mention what $R^n$ means

*/
