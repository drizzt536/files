//  node --no-deprecation ./pypi-search.js [args]
// jsdom uses something that uses a deprecated internal module (punycode).

let
	query = null,
	order = "",
	ordername = "relevant first",
	exact = false,
	useLegacy = false,
	verbose = false,
	pages = 1

// process arguments

for (let i = 2; i < process.argv.length; i++) {
	let arg = process.argv[i]

	// transformation to canonical arguments

	if (arg === "-o" || arg === "-s")
		// -o oldest => --orderby=oldest, etc.
		arg = "--orderby"

	if (arg === "-p")
		arg = "--pages"

	if (arg.startsWith("--orderby"))
		; // prevent --orderby=asdf from converting to --orderbyby=asdf
	else
		for (const test of ["--order", "--sortby", "--sort"])
			if (arg.startsWith(test)) {
				arg = "--orderby" + arg.slice(test.length)
				break
			}

	if (arg === "--orderby" || arg === "--pages")
		// `--orderby oldest` => --orderby=oldest
		arg += "=" + process.argv[++i]

	// actual argument logic

	if (arg.startsWith("--orderby=")) {
		const value = arg.slice(10)

		switch (value) {
			case "oldest":
			case "inactive":
				order = "&o=created"
				ordername = "oldest (most inactive) first"
				break

			case "latest":
			case "newest":
				order = "&o=-created"
				ordername = "latest first"
				break

			case "relevance":
			case "relevant":
				order = ""
				ordername = "relevant first"
				break

			default:
				throw Error`invalid value for \`--orderby\` argument`
		}
	}
	else if (arg.startsWith("--pages=")) {
		pages = parseInt(arg.slice(8)) // 0x works, 0b and 0o do not.

		if (pages < 1)
			throw Error`--pages argument must be at least 1.`

		if (!Number.isSafeInteger(pages))
			throw Error`--pages argument must be a safe integer.`

		if (Number.isNaN(pages))
			throw Error`--pages argument must be a number.`
	}
	else switch (arg) {
		case "-e":
		case "--exact":
			exact = true
			break

		case "-l":
		case "--legacy":
			useLegacy = true
			break

		case "-V":
		case "--verbose":
			verbose = true
			break

		case "-h":
		case "-?":
		case "--help":
			// TODO: implement
			throw Error("--help argument is not implemented. For now, just read the code.");

		default:
			if (query == null)
				query = encodeURIComponent(arg)
			else
				throw Error(`Unknown argument \`${arg}\` provided, and package name already provided.`)
	}
}



// errors

if (exact && pages !== 1)
	throw Error`--exact and --pages cannot both be provided`

if (pages < 1)
	throw Error`--pages must be at least 1.`

if (query == null)
	throw Error`the package name must be provided for the query.`

verbose && console.log("arguments parsed\nloading modules")



// modules

const shell = (function shell_closure() {
	// built-in module
	const { execSync } = require("child_process")

	return function shell(code) {
		return execSync(code, {encoding: "utf8"})
	}
})()

const JSDOM = (function find_jsdom() {
	// try locally
	try {
		return require("jsdom").JSDOM
	} catch (e) {
		var localError = e
	}

	// try globally
	try {
		const globalRoot = shell("npm root -g").trimRight().replaceAll("\\", "/")
		verbose && console.log("global root: %o", globalRoot)

		return require(`${globalRoot}/jsdom`).JSDOM
	} catch {
		console.log("jsdom is not installed locally or globally")
	}

	// not installed
	throw localError
})()

const baseURL = `https://pypi.org/search/?q=${query}${order}`

// TODO: make it work on non-windows environments (curl)
// TODO: add `--outdated`, return if the package's installed version is outdated.
// TODO: stop from printing past the columns on the page for the description, use a seconds line.




function packagesFromPage(page=1) {
	const script = `curl.exe --silent --request GET "${baseURL}&page=${page}"`

	verbose && console.log("shell curl script: %o", script)

	const html = shell(script)

	const packageElems = Array.from(
		new JSDOM(html).window.document.querySelectorAll("a.package-snippet")
	)

	const tmp = packageElems.map(a => {
		let pkgInfo = Object.fromEntries(
			Array.from(a.querySelectorAll("span, p")).map(attr => [
				attr.className.replace(/.+_/, ""),
				attr.textContent
			])
		)

		// "Jun 13, 2022" --> "Jun 13, 2022"
		// "Feb 3, 2024"  --> "Feb  3, 2024"

		pkgInfo.created = pkgInfo.created.trim().replace(/( \d,)/, " $1")

		return pkgInfo
	})

	return exact ?
		tmp.filter(e => e.name === query) :
		tmp
}

function lastPageExists() {
	// returns true if all the pages exist, false otherwise

	const script = `curl.exe --silent --output NUL "${baseURL}&page=${pages}" --write-out %{http_code}`

	verbose && console.log("trying last page\nshell curl script: %o", script)

	const exitCode = shell(script)

	if (exitCode === "200")
		return true

	verbose && console.log(`page does not exist\ncurl returned exit code ${exitCode}`)

	return false
}

function getPackages() {
	// assume the pages all exist.

	const packages = []

	for (let i = 1; i <= pages ;)
		packages[i] = packagesFromPage(i++)

	return packages.flat()
}

function legacyPrint(packages) {
	// kind of like the legacy `pip search`, also I made this one first.
	verbose && console.log("\nName (Version, Release date) - Description\n")

	for (const pkg of packages)
		console.log(`${pkg.name} (${pkg.version}, ${pkg.created}) - ${pkg.description}`)

	console.log()
}

function print(packages) {
	const max = { // max length
		// these are the lengths of the section titles
		name: 4,
		vers: 7,
		date: 12,
		desc: 11,
	}

	for (const pkg of packages) {
		max.name = Math.max(max.name, pkg.name       .length)
		max.vers = Math.max(max.vers, pkg.version    .length)
		max.date = Math.max(max.date, pkg.created    .length)
		max.desc = Math.max(max.desc, pkg.description.length)
	}

	max.name++
	max.vers++
	max.date++
	max.desc++

	let result =
		// line 1
		"Name"         + " ".repeat(max.name - 4 ) + "  " +
		"Version"      + " ".repeat(max.vers - 7 ) + "  " +
		"Release Date" + " ".repeat(max.date - 12) + "  " +
		"Description"  + " ".repeat(max.desc - 11) + "\n" +
		// line 2
		"-".repeat(max.name) + "  " +
		"-".repeat(max.vers) + "  " +
		"-".repeat(max.date) + "  " +
		"-".repeat(max.desc) + "\n"

	for (const pkg of packages)
		result +=
			pkg.name        + " ".repeat(max.name - pkg.name       .length) + "  " +
			pkg.version     + " ".repeat(max.vers - pkg.version    .length) + "  " +
			pkg.created     + " ".repeat(max.date - pkg.created    .length) + "  " +
			pkg.description + " ".repeat(max.desc - pkg.description.length) + "\n"

	verbose && console.log(`\nQuery for package ${query}, ${ordername}\n`)

	console.log(result)
}


verbose && console.log("starting main script")
// main script

const packages = lastPageExists() ? getPackages() : {}

if (useLegacy)
	legacyPrint(packages)
else
	print(packages)
