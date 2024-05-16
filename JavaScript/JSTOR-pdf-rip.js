
// this one is kind of redundant because you can just download the file

// DIRECTIONS:
	// change the compression level if desired. (next variable)
	// put the code into the console

const compressionLevels = {
	documentLevel: true, // true or false
	imageLevel: "FAST", // "NONE", "FAST", "MEDIUM", or "SLOW".

	// FAST is ~35 times smaller than NONE, but they get diminishing returns.
}

const nextPageButton = document.querySelector("[label='Next page']").shadowRoot.querySelector("button")
const prevPageButton = document.querySelector("[label='Previous page']").shadowRoot.querySelector("button")
const dpi = 300
const pages = [null].concat( $$("div.page") ) // pages are 1-indexed
const numberOfPages  = +document.querySelector(".page-input").max



for (let i =+ document.querySelector(".page-input").value; i --> 1 ;)
	// move to page 1. pages are 1-indexed on JSTOR
	prevPageButton.click()



window?.jspdf?.jsPDF || await fetch("https://unpkg.com/jspdf/dist/jspdf.umd.min.js", {
	method: "GET",
	cors: "cors",
}).then(e => e.text()).then(e => eval(e))

function canvasAtIndex(i) {
	return pages[i]?.querySelector?.("canvas") ?? null
}

function createPDFFor(canvas) {
	const
		imageData = canvas.toDataURL("image/png"),
		width = canvas.width / dpi,
		height = canvas.height / dpi,

		pdf = new jspdf.jsPDF({
			orientation : "p",
			unit        : "in",
			compress    : compressionLevels.documentLevel,
			format      : [width, height],
		})

	pdf.addImage({
		x: 0,
		y: 0,
		width,
		height,
		imageData,
		format: "PNG",
		compression: compressionLevels.imageLevel,
	})

	return pdf
}

function createPDF() {
	const coverPage = canvasAtIndex(1)

	if (coverPage == null) {
		// prevPageButton.click()
		// wait 100ms
		// return createPDF()
		throw Error`cover page not found. make sure you are on the cover page`
	}

	return createPDFFor(coverPage)
}

function addPage(pdf, canvas) {
	// the dimensions should be the same for each page, but we calculate it again anyway.
	const
		width = canvas.width / dpi,
		height = canvas.height / dpi,
		imageData = canvas.toDataURL("image/png")

	pdf.addPage([width, height], "p")


	pdf.addImage({
		x: 0,
		y: 0,
		width,
		height,
		imageData,
		format: "PNG",
		compression: compressionLevels.imageLevel,
	})

	return pdf
}

window.fullPDF = null

const TRIES_BEFORE_GIVEUP = 3

function retryAfter(n, timeout, i, try_, nextPage=false) {
	if (nextPage)
		nextPageButton.click()

	setTimeout(() => 
		getFullPDF(n, timeout, i, try_),
		timeout
	)
}


function getFullPDF(n=Infinity, timeout=500, i=1, try_=1) {
	// get the first `n` pages of the full pdf
	// `n == Infinity` gets all of them.
	// timeout 500 is probably fine on JSTOR

	if (i === 1) {
		console.log(`processing canvas at index 1 / ${numberOfPages}`)
		window.fullPDF = createPDF()
		console.log("\tdone")

		return retryAfter(n, timeout, i + 1, 1, true)
	}

	if (try_ === 1)
		console.log(`processing canvas at index ${i} / ${numberOfPages}`)
	const canvas = canvasAtIndex(i)

	if (canvas == null) {
		if (try_ < TRIES_BEFORE_GIVEUP) {
			// sometimes it takes too long to load
			console.log(`\tcanvas not found (attempt ${try_} / ${TRIES_BEFORE_GIVEUP})`)
			return retryAfter(n, timeout, i, try_ + 1, false)
		}
		return console.log("%cPDF copy is finished or the internet connection is abysmal.\n\n%cCopy and paste \"%cdownloadFullPDF()%c\" into the console", "color: yellow", "color: yellow", "color: red", "color: yellow")
	}

	if (try_ > 1)
		console.log("\tcanvas found")

	addPage(window.fullPDF, canvas)
	console.log("\tdone")

	if (i === n) {
		console.log("page quota met")
		return
	}

	retryAfter(n, timeout, i + 1, 1, true)
}

function downloadPDF(pdf, dest="download.pdf") {
	pdf.save(dest)
}

function downloadFullPDF(dest) {
	downloadPDF(window.fullPDF, dest)
}

// getFullPDF()
// downloadFullPDF()
// JSTOR Stealer
