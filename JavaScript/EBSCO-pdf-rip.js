// EBSCO-pdf-rip.js


// DIRECTIONS:

// 1. make sure the iframe document is selected in the elements panel
	// type `$$("iframe#ViewerServiceFrame")[0]` into the console and click enter
	// right click on the element and click "Reveal in Elements panel"
	// click the arrow next to the iframe tag
	// click on the document thing right under the iframe tag
// 2. make sure TRIES_BEFORE_GIVEUP * TIMEOUT / 1000 is a good amount of seconds.
// 3. copy and paste this whole file into the console.

// ADVANCED SETTINGS

const PDF_PPI = 300 //  pixels per inch
const TIMEOUT = 250 // in ms. lower is better, to a point
const COMPRESSION_LEVELS = {
	document: true, // true or false
	image: "FAST", // "NONE", "FAST", "MEDIUM", or "SLOW".

	// fast is ~35 times smaller than none, but they get diminishing returns after that.
	// full document compression does basically nothing.
}

// TODO: test with https://web-p-ebscohost-com.ezp1r.riosalado.edu/ehost/ebookviewer/ebook?sid=96ee81c6-9c78-4f73-bed8-186c34f16f9c%40redis&vid=0&format=EK`
	// this page has a strange format


if ($0 !== document || $0.title !== "EBSCO Viewer Service")
	// only works with   web-p-ebscohost-com.ezp1r.riosalado.edu/ehost/ebookviewer/ebook.
	// doesn't work with web-p-ebscohost-com.ezp1r.riosalado.edu/ehost/pdfviewer/pdfviewer.
	// that one has a free full download feature anyway.
	throw Error`the iframe document object must be selected in the console elements panel`


const iframeDocument = $0
const nextPageButton = iframeDocument.querySelector("button[title='Go to Next Page']")
const prevPageButton = iframeDocument.querySelector("button[title='Go to Previous Page']")
const pageNumberElement = iframeDocument.querySelector("input#pageLabel")
var previousPageNumber = null
const title = iframeDocument.querySelector("span#source").innerHTML
const author = iframeDocument.querySelector("span#author").innerHTML

// sanitize \/:*?"<>| from the name, as well as change % to %% so decodeURIComponent(filename) works.
// this sanitation is probably required in order to work on windows.
const filename = `${title} - ${author}.pdf`
	.replaceAll("%", "%%")
	.replaceAll("\\", "%5C")
	.replaceAll("/", "%2F")
	.replaceAll(":", "%3A")
	.replaceAll("*", "%2A")
	.replaceAll("?", "%3F")
	.replaceAll("<", "%3C")
	.replaceAll(">", "%3E")
	.replaceAll("|", "%7C")

window.fullPDF = null

window?.jspdf?.jsPDF || await fetch("https://unpkg.com/jspdf/dist/jspdf.umd.min.js", {
	method: "GET",
	cors: "cors",
}).then(e => e.text()).then(e => eval(e))

function canvasAtIndex(i) {
	return iframeDocument.querySelector(`div#page-${i} canvas`)
}

function addPage(pdf, canvas) {
	const
		// the dimensions should be the same for each page
		imageData = canvas.toDataURL("image/png"),
		width = canvas.width / PDF_PPI,
		height = canvas.height / PDF_PPI

	pdf ?
		// pdf already exists
		pdf.addPage([width, height], "p") :

		// create a new pdf
		pdf = new jspdf.jsPDF({
			orientation : "p",
			unit        : "in",
			compress    : COMPRESSION_LEVELS.document,
			format      : [width, height],
		})


	pdf.addImage({
		x: 0,
		y: 0,
		width,
		height,
		imageData,
		format: "PNG",
		compression: COMPRESSION_LEVELS.image,
	})

	return pdf
}

function createPDF() {
	const coverPage = canvasAtIndex(0)

	if (coverPage == null)
		throw Error`cover page not found. make sure you are on the cover page`

	return addPage(null, coverPage)
}

function retryAfter(n, i, nextPage=true, try_=1) {
	if (nextPage) {
		previousPageNumber = pageNumberElement.value
		nextPageButton.click()
	}

	setTimeout(() =>
		getFullPDF(n, i, nextPage ? 1 : try_ + 1)
	, TIMEOUT)
}

function getFullPDF(n=Infinity, i=0, try_=1) {
	// get the first `n+1` pages of the full pdf (stops after but includes index `n`)
	// `n == Infinity` gets all of them.

	if (pageNumberElement.innerHTML === previousPageNumber) {
		// there are no more pages; clicking "Next Page" does nothing.
		// download the finished pdf.

		console.log("%cPDF copy is finished.\nDownload should begin shortly (2s).", "color: yellow")


		return setTimeout(() => downloadFullPDF(filename), 2000)
	}

	// CONDITION: there are more pages

	if (i === 0) {
		console.log("processing canvas at index 0")
		window.fullPDF = createPDF()
		console.log("\tdone")

		// try the next page
		return retryAfter(n, i + 1)
	}

	// CONDITION: the index is higher than 0

	if (try_ === 1)
		console.log(`processing canvas at index ${i}`)

	const canvas = canvasAtIndex(i)

	if (canvas == null) {
		// retry the same page

		console.log(`\tcanvas not found (attempt ${try_})`)

		return retryAfter(n, i, false, try_)
	}

	// CONDITION: the page is loaded

	if (try_ > 1)
		console.log("\tcanvas found")

	addPage(window.fullPDF, canvas)
	console.log("\tdone")

	if (i === n) {
		console.log("page quota met")
		return
	}

	// CONDITION: the page quota has not been met.

	// try the next page
	retryAfter(n, i + 1)
}

function downloadFullPDF(dest=filename) {
	window.fullPDF.save(dest)
}


// getFullPDF()
// downloadFullPDF()
// EBSCO Stealer
