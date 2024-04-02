
function _standardizeFormat(format) {
	// also allow inputs like "png" or "jpg" instead of the actual MIME types.
	if (typeof format !== "string")
		return "image/png"

	format = format.toLowerCase()

	if (format.startsWith("image/"))
		format = format.slice(6)

	switch (format) {
		default:
			// format not recognized. fallback to default
		case "png":
			return "image/png"

		case "jpeg":
		case "jfif":
		case "jpg":
			return "image/jpeg"

		case "webp":
			return "image/webp"
	}
}

var {convertToCanvas, convertToCanvasAsync} = (function convertToCanvas_closure() {
	function imageToCanvas(image) {
		const canvas  = document.createElement("canvas")

		canvas.width  = image.naturalWidth
		canvas.height = image.naturalHeight

		canvas.getContext("2d").drawImage(image, 0, 0)

		return canvas
	}

	function imageDataToCanvas(imageData) {
		const canvas  = document.createElement("canvas")

		canvas.width  = imageData.width
		canvas.height = imageData.height

		canvas.getContext("2d").putImageData(imageData, 0, 0)

		return canvas
	}

	function convertToCanvas(object) {
		// returns a canvas, or throws an error. can't convert from URI string

		if (object instanceof Image) return imageToCanvas(object)
		if (object instanceof ImageData) return imageDataToCanvas(object)
		if (object instanceof HTMLCanvasElement) return object

		if (typeof object === "string")
			throw Error`cannot convert from a data URI to a canvas synchronously`

		throw Error`cannot convert unknown format to a canvas  synchronously.`
	}

	async function convertToCanvasAsync(object) {
		// returns promise of a canvas, or throws an error

		if (object instanceof Image) return imageToCanvas(object)
		if (object instanceof ImageData) return imageDataToCanvas(object)
		if (object instanceof HTMLCanvasElement) return object

		if (typeof object === "string") return new Promise((res, rej) => {
			const image = document.createElement("image")

			image.onload = () => res(imageToCanvas(image))
			image.onerror = () => rej(Error`URI source is probably invalid`)

			image.src = object
		})

		throw Error`cannot convert unknown format to a canvas asynchronously.`
	}

	return {convertToCanvas, convertToCanvasAsync}
})()

function dataURI(object, format) {
	// `object` is an image, canvas, data URI, or ImageData object.

	return typeof object === "string" ?
		object :
		convertToCanvas(object).toDataURL( _standardizeFormat(format) )

}

function download(object, dest, format) {
	// download image from <canvas/>, <img/>, data URI, or ImageData object.

	const url = dataURI(object, format)
	const link = document.createElement("a")

	link.href = url
	link.download = (dest ?? `download.${_standardizeFormat(format).slice(6)}`).toString()

	link.click()
}

function downloadPNG (object, dest) { download(object, dest, "png" ) }
function downloadJPG (object, dest) { download(object, dest, "jpg" ) }
function downloadJPEG(object, dest) { download(object, dest, "jpeg") }
function downloadWEBP(object, dest) { download(object, dest, "webp") }

download.png  = downloadPNG
download.jpg  = downloadJPG
download.jpeg = downloadJPEG
download.webp = downloadWEBP

const _exports = {
	download,
	downloadPNG,
	downloadJPG,
	downloadJPEG,
	downloadWEBP,
	convertToCanvas,
	convertToCanvasAsync,
	dataURI,
}

if (typeof module !== "undefined" && typeof exports === "object")
	module.exports = _exports
else
	globalThis.imageDownload = _exports
