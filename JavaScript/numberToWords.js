
var numberToWords = (function create_numberToWords() {

// after ~10^125, I made up the names, and most if not all of them make absolutely zero sense.
// Current Range: |x| ≤ 10^(3*10^837 + 297);
// this function is very very slow for really big numbers. It took like 20 minutes for it to run for a number that was an approximation of the max bigint value (2^1,073,741,823) divided by like 4 or so.
// this file requires ./lib.js

// variables
var numerals = [ // i = [0, 20) \in mathbb{Z}
	"zero",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
	"thirteen",
	"fourteen",
	"fifteen",
	"sixteen",
	"seventeen",
	"eighteen",
	"nineteen"
]
, tens = [ // 10 * index = value
	"",
	"ten",
	"twenty-",
	"thirty-",
	"forty-",
	"fifty-",
	"sixty-",
	"seventy-",
	"eighty-",
	"ninety-",
]
, names = (function make_names() {
	/**
	 * after iota, the words are inspired by (or taken directly from) ancient greek words.
	 * website used for ancient greek words: https://www.absp.org.uk/words/langgreekancient.shtml
	 * UPDATE: the names no longer make any sense at all, and the original meanings should...
	 * be completely disregarded for everything past 'novemnonagintillion' or x = 99.
	 * not all of the things are ancient greek. they could be sanskrit, something else,...
	 * or completely made up.
	**/
	var p = ["", "un", "duo", "tre", "quattuor", "quin", "sex", "septen", "octo", "novem"]
	, s = ["", "hena", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "ennea"]
	, g = "gintillion", deca = "deca" + g
	, f100 = [
		"thousand", // 0
		"million", // 1
		"billion", // 2
		"trillion", // 3
		"quadrillion", // 4
		"quintillion", // 5
		"sextillion", // 6
		"septillion", // 7
		"octillion", // 8
		"nonillion", // 9
	]
	.concat(
		[
			"decillion"        , // 10
			"vigintillion"     , // 20
			"trigintillion"    , // 30
			"quadragintillion" , // 40
			"quingintillion"   , // 50
			"sexgintillion"    , // 60
			"heptagintillion"  , // 70
			"octagintillion"   , // 80
			"nonagintillion"   , // 90
		].map(e => p.map(s => s + e)).flat()
	)
	, a = [
		"","conta","hecta","kaidecahecta","kaihectaihecta","chilia","myria","kilo","mega","exa","giga",
		"yotta","yocto","zepto","atto","fempto","pico","hevto","tera","peta",
		// alphabetical now
		"abiosa","aboulia","acala","acantha","acedia","acoemetia","acrasia","acrolitha","acromia","acropola","adenoma","adespota","aeda","aepyrona","agalla","agapa","agela","agma","agoga","agonista","agrapha","aida","akolutha","alalagma","alastora","alcaia","alisma","alpha","althaea","amanita","amarylla","ambrosia","amianta","amioma","amma","amnia","amphioxa","anaba","anabaena","anabasa","anablepsa","anacrusa","anaglypha","anagnorisa","anagoga","analecta","analemma","analogona","ananka","anapaesta","anapha","anaptyxa","anasarca","anastasa","anathema","ancona","angophora","anhona","anonyma","anophelesa","anthelia","anthemia","anthesa","antiphona","antispa","aorista","apagia","aphesa","apodosa","apollia","apomixa","apophthegma","apophyga","apositia","apothema","apoza","apteryxa","aracha","archona","argemona","argona","argusa","artemisia","aryballa","asbesta","ascarida","ascesa","ascita","asclepia","asepsia","ashta","aska","aspera","asphodela","aspidia","asplenia","asteisma","astraga","atla","aula","automa","auxesa","axona","azytha","basilica","basilicona","bathosa","bema","bentha","betta","biota","bombyxa","bostryxa","boulea","bregma","bubala","bulimia","cacodema","cala","calantha","calatha","callaisa","callia","carcinoma","cardamina","carpala","caryata","caryopsa","catacla","catapa","cataphora","catharsa","catheta","cathisma","ceanotha","celoma","centa","centesa","cerastesa","ceratodusa","cestosa","chalazia","chaosa","chara","chatvaaria","chenixa","chi","chiasma","chiliagona","chiliara","chiliasma","chiragra","chitona","chlamysa","chloasma","chola","choliamba","chondra","chondrusa","choreusa","choria","choriamba","chorisia","chrismona","chroma","chthonica","cicinnusa","cistusa","cleoma","clerucha","cleruchya","clystera","cnida","coccyxa","coleusa","collyria","colocyntha","comimia","corybanta","cosma","cotyla","crasa","cratona","cremasta","crota","cryptadia","ctena","cyesa","cylixa","cynanchea","cytona","dactyl","daima","daphna","dasyura","deixisa","delphica","delta","demagoga","demea","demiurga","demosa","dendrona","derma","diabia","diachyla","diadocha","diadra","diaeresa","dialla","diapenta","diaphysa","diaspora","diasta","diastera","diatriba","diazeuxisa","dicasta","didrachma","diegesisa","digamma","diglota","dimesta","dioba","dioma","diora","diota","diploema","dipsa","dipterosa","disticha","dochmia","dolichosa","dracaena","drachma","droma","drya","ecdysa","ecthyma","edema","ega","eida","eidola","eika","eirenica","ekama","elana","eleutheria","elopsa","elytrona","emblema","emesa","empusa","encanthisa","encarpusa","encolpia","encomiona","endeixa","enhydra","enkratya","enomotya","entasia","entera","eohippa","epanoda","epapoga","eparcha","epha","ephebosa","ephedra","ephemerisa","ephialtesa","epiclesa","epidermisa","epigonea","epinaosa","epinosica","epirrhema","episemona","epistemica","eposa","epsila","epulisa","epylliona","erga","erigerona","eringa","erodia","erosa","erythema","ethnoa","ethoa","eucharisa","euchologya","eudaema","eugea","euoia","eupatrida","eustacya","eutaxya","exoda","exoma","feusa","filoa","forba","galicora","gamma","gammadia","ganglia","ganymea","geotaxia","glia","glochida","glottia","gnathia","gnomia","gnosa","gorgona","haliotisa","halma","hamadrya","hamartia","hamaryosa","hapaxa","harmosta","harstya","hebea","hegema","hegumena","helcoida","helia","heliodora","helixa","hemiola","hemionusa","hemiptera","henotica","heroona","hexapla","himatia","hippara","hoplita","hydria","hydropsa","hyla","hymena","hypatea","hyraxa","ialpisa","icha","ichneumona","ichthysa","iconostasa","ictera","iniona","iota","ipomoea","isagoga","isodica","isoetesa","ixodia","kalyptra","kappa","kenosisa","kerygma","kinesa","kithara","koepia","koinea","kora","kottaba","kourosa","krate","krypsia","kuda","kylixa","kyria","labda","labia","labrysa","lambda","larna","lavra","lecanora","leipoa","lekythosa","leucoma","leukona","lichanosa","limosia","linina","lipoma","liturgya","lochia","logiona","logosa","macrona","maelida","maieutica","malacia","mantica","megarona","meiosa","melisma","menarchea","mersisa","mesea","messiasa","metopea","miasma","microna","mimesisa","mitosa","mnemona","moira","molossa","monosa","moria","morpha","mu","myalgia","mycetesa","mychnisa","myeloma","myelonia","mygalea","mylodona","mymosisa","myopa","myosota","myrmidona","mythosa","myxoma","nabla","naia","naosa","naphtha","nava","navarcha","nektona","nemea","nemesia","nepenthea","nephrosa","neritea","nestora","netea","neura","niptera","noesia","nomarcha","nomarchya","nomosa","nostosa","notornisa","noumenona","nousa","nu","nyctalopsa","obola","oceanida","octapla","odeona","odyssa","oecista","oedema","oenomela","olecranoa","olpea","omicra","onycha","onychia","onyxa","ootheca","opopanaxa","oporicea","ora","orchisa","orexisa","organona","ornisa","orthosisa","orthrosa","osteoma","ostracona","otolitha","ouroborosa","oxalisa","oxymela","oxymoa","panacea","panaxa","pancha","pangamya","pangena","panisca","panmixisa","pansophya","panthea","parabasia","parabema","paracletea","paracmea","parama","paramesea","parasanga","parema","parergona","paresa","parhypata","parodosa","parotisa","parousia","parulisa","pathosa","pedesa","pelma","peltasta","peplosa","periaktosa","periapta","peribola","perona","petasosa","phaeica","phaenogama","phaetona","phara","pharynxa","phelloa","phi","philomela","phimosisa","phloema","phlomisa","phloxa","phlyctaena","phoba","phona","phorminxa","phratrya","phylea","physa","phyta","pi","pignolia","pithosa","plama","plasta","platysma","pleona","pleroma","pleronera","plessora","pletha","pleurona","pneuma","podagra","polemica","polisa","polyga","polypoda","polyzoa","porisma","porosisa","potamica","poxytona","prisma","prolepsa","promachosa","pronosa","propolisa","prytaneuma","psammona","pschenta","psi","psilosa","psoasa","ptarmica","pterina","pteriona","ptilosa","ptisana","ptosa","ptyxia","pyaemia","raphania","raphisa","regma","rhabdoma","rhabdusa","rhagadesa","rhamnusa","rhaphea","rhipidiona","rhizoma","rho","rhombosa","rhotica","rhytina","rhytona","rycnona","saccosa","salpinxa","sampia","sapphica","saprobea","sapropela","sapta","sarcoma","sardonyxa","sarosa","satrapa","scammonya","scazona","scepsa","schaza","scheia","schisma","scholiona","sciamachya","sclerema","scleroma","scolexa","scolia","scolioma","scolytida","scopelida","scotoma","scotopia","scytalea","sekosa","selenea","semantrona","semeiona","semiosia","sepsa","sepseala","seselia","sibyla","sida","siglosa","sigma","silva","sipha","skatola","skyphosa","soma","soritesa","sorosa","speosa","sphagnuma","sphendonea","sphina","sphygmusa","spiraea","spodiuma","stachysa","stamnosa","stasia","stasidiona","stasimona","stateia","stearina","steatoma","stelea","stemma","stenosa","stephena","sthenosa","sticha","stichera","stichosea","stigmea","stoa","stoma","storgea","strobila","strongyla","strophea","stygiana","stylitea","stylobatea","stypsisa","stypta","styraxa","supia","sybotica","syconia","sycosa","syllepsa","symplocea","synagoa","synaptea","synaxia","syncopea","synergia","synesia","syngamya","syntexisa","syrinxa","syrphida","syssitia","systolea","tagma","taranda","tau","telamona","telesa","telesmia","telosa","telsonia","temenosa","tephra","terasa","teratoma","terebintha","tetradracma","tetrapla","tettixa","thanatosa","thema","thenara","theotokosa","theriaca","therma","theta","thetea","thiasa","thlipsisa","tholosa","threnosa","thripsa","thuja","thyrsea","tira","tmesa","toparcha","topazia","toponyma","toposa","toreutica","traema","tragelapha","tragopana","tragulea","treenia","tremia","tridacna","tridea","trierarcha","trilitha","tripoa","triposa","tripsia","trisemea","trocha","trochila","trogona","tropariona","tryma","tulosia","tylosia","typhona","tyrannisa","tyzygya","unessa","upsilla","urachusa","uraniscusa","uresia","uretera","urostegea","vima","xenolithia","xenophya","xenotima","xeransisa","xeroma","xerosisa","xi","xoanona","xylea","xylogena","xypsila","xystera","xystosa","zalga","zantha","zea","zebla","zephyra","zetetica","zetta","zeugma","zeuxitea","zizania","zoariuma","zoetropea","zoiatria","zoma","zoocytia","zooecia","zooglea","zoolatrya","zoomancya","zoometrya","zoomorpha","zoonosisa","zoophora","zostera","zygantra","zygoma","zygosa","zymoa","zytha"
	];
	const MAXIMUM_VALUE = 10n**BigInt(a.length + 1) + 99n;

	return function names(x, dashes=false) {
		if (x > MAXIMUM_VALUE) {
			window[Symbol.for("Z01*zW/8gIn|")] = x;
			throw Error(`input to names() is too big. it is larger than 99 + 1e${a.length + 1}. the value should be moved to window[Symbol.for('Z01*zW/8gIn|')] for easier debugging or whatever.`);
		}
		if (x < 0n) throw Error`Not Possible. x can't be less than 0`;
		if (x < 100n) return f100[x];
		if (x === 100n) return deca;

		x = x - 100n + "";

		for (var i = 0, o = "", n = x.length, d = (dashes ? "-" : ""); i < n ; i++)
			s[x[i]] && (o += s[x[i]] + a[n - i - 1] + d);

		return o + g;
	}
})();

function getDecimalPartName(number, ellipsis=false, ellipsisText = "etcetera") {
	for (var decimals = " point", i = 1, n = number.length; i < n ;)
		decimals += ` ${numerals[number[i++]]}`;

	return decimals + (ellipsis ? " " + ellipsisText : "");
}

/*function _sa(arr=[]) {
	// for verifying and testing the large name array in names().
	// The array is named `a` as of writing this.
	// that array is the input this takes.
	// I do not remember why this function is called `sa`

	return arr.hasDupes() ?
		console.log("duplicates") || arr.getDupes() :
		json.stringify(arr.sort());
}*/

function numberToWords(number, { fancyInfinity = true, ellipsisText = "etcetera", dashes = false }={}) {
	// handle infinity
	if ([
			Infinity , "Infinity" , "inf" , "infinity" , "∞" ,
			-Infinity, "-Infinity", "-inf", "-infinity", "-∞",
		].incl(number)
	) {
		let infinity = fancyInfinity ? "apeirogintillion" : "infinity";
		return typeof number === "number" ?
			`${number < 0 ? "negative " : ""}${infinity}` :
			`${number.incl("-") ? "negative " : ""}${infinity}`;
	}
	number = `${number}`.remove(/['`,_\s]/g);
	
	// handle negative
	if (number[0] === "-") return `negative ${ numberToWords(number.slc(1)) }`;
	
	//  handle ellpisis
	var ellipsis;
	if (number.ew("...")) {
		number = number.remove(/\.\.\.$/);
		ellipsis = true;
	}
	else ellipsis = false;

	if ( isNaN(number) ) return false;

	// remove leading zeros, trailing decimal zeros, and useless decimal points
	if (number.incl(".")) number = number.remove(/0+$/);
	number = number.remove(/^0+/g).remove(/\.$/).start("0");

	// handle decimal part
	if (number.incl(".")) return numberToWords( number.slc(0, ".") ) + getDecimalPartName(
		number.slc("."),
		ellipsis,
		ellipsisText
	);

	// handle |x| < 20
	if (numerals[number]) return numerals[number];
	numerals[0] = ""; // zero is only needed for decimals, and when the input is zero.

	// handle |x| < 1,000
	if (number.length === 2) {
		let tensPart = tens[number[0]],
			onesPart = numerals[number[1]];
		return tensPart.substr(0, tensPart.length - (onesPart === "")) + onesPart;
	}
	if (number.length === 3) {
		let rest = numberToWords(number.substr(1));
		rest === "zero" && (rest = "");
		return numerals[number[0]] + ` hundred${rest ? " and " : ""}` + rest;
	}

	// handle everything else up to the max limit
	for (var
		i = number.length - 6,
		output = numberToWords(number.substr(i + 3, 3)).remove(/^zero$/),
		x = 0n,
		tmp;;
		i -= 3, x++
	)
	{
		tmp = numberToWords( number.substr(rMath.max(0, i), 3 + rMath.min(0, i)) );
		if (tmp === "zero" || tmp === "") continue;
		output = tmp + " " + names(x, dashes) + (output && ", ") + output;
		if (i < 1) break;
	}
	return output;
}


return numberToWords.numerals = numerals,
	numberToWords.tens = tens,
	numberToWords.names = names,
	numberToWords.getDecimalPartName = getDecimalPartName,
	numberToWords;

})();
