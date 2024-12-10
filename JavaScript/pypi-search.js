// requires jsdom, egrep, and awk.
// example: node ./pypi-search.js IPYTHON
// node ./pypi-search.js [args]

let
	query     = null,
	order     = "",
	ordername = "relevant first",
	outdated  = false,
	exact     = false,
	verbose   = false,
	pages     = 1

// process arguments

for (let i = 2; i < process.argv.length; i++) {
	let arg = process.argv[i]

	// transformation to canonical arguments

	if (arg === "-o" || arg === "-s")
		// -o oldest => --orderby=oldest, etc.
		// "s" for "sort (by)"
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

		case "-V":
		case "--verbose":
			verbose = true
			break

		case "--outdated":
			outdated = true
			// It only makes sense to use outdated with exact.
			exact = true
			break

		case "-h":
		case "-?":
		case "--help":
			console.log("usage: node pypi-search.js [OPTIONS] PACKAGE_NAME")
			console.log("options:")
			console.log("    -e, --exact                       only match against the exact package name. case sensitive.")
			console.log("    -v, --verbose                     print out extra information about what is happening")
			console.log("    -o, --order[by], -s, --sort[by]   change the sorting for the results. options can include")
			console.log("                                      oldest/inactive, latest/newest, or relevance/relevant.")
			console.log("                                      can be something like --orderby order or --orderby=order.")
			console.log("    -p, --pages                       the number of pages of results to print. defaults to 1.")
			console.log("                                      can be either --pages N or --pages=N. (with or without =)")
			console.log("    --outdated                        instead of searching pypi for possible matches, it searches")
			console.log("                                      for exact matches and returns whether it is outdated or not.")
			console.log("                                      implies --exact.")
			console.log("    -h, -?, --help                    prints this message.")
			console.log("")

			process.exit(0)

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

if (query == null) {
	// with `--outdated` and no query, loop over every installed package.
	if (!outdated)
		throw Error`the package name must be provided for the query.`
}

verbose && console.log("arguments parsed\nloading modules")

if (/['"&;\s]/g.test(query)) {
	// nuh uh, no code injection for you buddy
	verbose && console.log("removing instances of /['\"&;\s]/ from query string")
	query = query.replace(/['"&;\s]/g, "")
}

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
		const globalRoot = process.execPath.replaceAll("\\", "/") + "/../node_modules"
		// const globalRoot = shell("npm root -g").trimRight().replaceAll("\\", "/")
		verbose && console.log("global root: %o", globalRoot)

		return require(`${globalRoot}/jsdom`).JSDOM
	} catch {
		console.log("jsdom is not installed locally or globally")
	}

	// not installed
	throw localError
})()

// this function is for `--outdated` with no package name.
const baseUrlFn = query => `https://pypi.org/search/?q=${query}${order}`
const baseURL = baseUrlFn(query)

// TODO: make it work on non-windows environments (curl / --outdated)
// TODO: stop from printing past the columns on the page for the description, use a second/third/etc. line.

function sleep(ms) {
	var start  = new Date().getTime(),
		expire = start + ms;

	while (new Date().getTime() < expire);
}

function packagesFromPage(page=1, query) {
	const baseURL = baseUrlFn(query, order)
	const command = `curl.exe --silent --request GET "${baseURL}&page=${page}"`

	verbose && console.log("shell command: %o", command)

	const html = shell(command)

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
		// allow different casing in case you did it wrong.
		tmp.filter(e => e.name.toLowerCase() === query.toLowerCase()) :
		tmp
}

function lastPageExists() {
	// returns true if all the pages exist, false otherwise

	if (outdated)
		return true

	const command = `curl.exe --silent --output NUL "${baseURL}&page=${pages}" --write-out %{http_code}`

	verbose && console.log("trying last page\nshell command: %o", command)

	const exitCode = shell(command)

	if (exitCode === "200")
		return true

	verbose && console.log(`page does not exist\ncurl returned exit code ${exitCode}`)

	return false
}

function getPackages(query) {
	// assume the pages all exist.

	const packages = []

	for (let i = 1; i <= pages ;)
		packages[i] = packagesFromPage(i++, query)

	return packages.flat()
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

function checkOutdated(pkg, query) {
	console.log(pkg, query)
	command = `pip list 2> nul | grep -Ei "^${query}" | awk "{print $2}"`

	let installedVersion = shell(command).trim()

	if (installedVersion === "") {
		console.log(`package "${query}" is not installed.`)
		process.exit(1)
	}

	const max = { // max length
		// these are the lengths of the section titles
		name: 4,
		outd: 8 // outdated
	}
	let isOutdated = `${pkg.version.trim() !== installedVersion}`

	max.name = 1 + Math.max(max.name, pkg.name.length)
	max.outd++

	console.log(
		"Name"     + " ".repeat(max.name - 4) + "  " +
		"Outdated" + " ".repeat(max.outd - 8) + "\n" +
		// line 2
		"-".repeat(max.name) + "  " +
		"-".repeat(max.outd)
	)


	let result =
		// line 1
		pkg.name   + " ".repeat(max.name - pkg.name  .length) + "  " +
		isOutdated + " ".repeat(max.outd - isOutdated.length) + "\n"

	console.log(result)
}

function checkAllOutdated() {
	info = shell('pip list 2> nul | awk "{print $1 \\" \\" $2}"')
		.split("\n")
		.map(e => e.split(" "))

	info.shift()
	info.shift()

	let result = ""

	const max = { // max length
		// these are the lengths of the section titles
		name: 4,
		outd: 8 // outdated
	}

	for (const [query, installedVersion] of info) {
		let pkg = packagesFromPage(1, query)[0]

		if (pkg === undefined) {
			// try again after replacing all underscores with dashes.
			const tmp = query.replaceAll("_", "-")

			if (tmp !== query)
				pkg = packagesFromPage(1, tmp)[0]

			if (pkg === undefined) {
				// log even outside of verbose mode.
				console.log(`package ${query} isn't found on PyPi. check yourself.`)
				// example: `jupyter_client` is listed as `jupyter-client`
				continue
			}
		}

		const isOutdated = `${pkg.version !== installedVersion}`

		max.name = 1 + Math.max(max.name, query.length)

		result +=
			query      + " ".repeat(max.name - query     .length) + "  " +
			isOutdated + " ".repeat(max.outd - isOutdated.length) + "\n"

		// wait to avoid rate limiting.
		sleep(500)
	}

	max.outd++
	console.log(
		"Name"     + " ".repeat(max.name - 4) + "  " +
		"Outdated" + " ".repeat(max.outd - 8) + "\n" +
		"-".repeat(max.name) + "  " +
		"-".repeat(max.outd) + "\n" +
		result
	)
}


verbose && console.log("starting main script")
// main script


const packages = !(outdated && query === null) && lastPageExists() ?
	getPackages(query) :
	[{}]

outdated ?
	query === null ?
		checkAllOutdated() :
		checkOutdated(packages[0], query) :
	print(packages)
