
function _standardizeFormat(format) {
	// also allow inputs like "png" or "jpg" instead of the actual MIME types.
	if (typeof format !== "string")
		return "image/png"

	switch (format.toLowerCase()) {
		case "image/png" : case "png":
			return "image/png"

		case "image/jpeg": case "jpeg":
		case "image/jfif": case "jfif":
		case "image/jpg" : case "jpg":
			return "image/jpeg"

		case "image/webp": case "webp":
			return "image/webp"

		default:
			// format not recognized. fallback to default
			return "image/png"
	}
}

var convertToCanvas = (function convertToCanvas_closure() {
	function imageToCanvas(image) 

	function imageDataToCanvas(imageData) {
		const canvas  = document.createElement("canvas")

		canvas.width  = imageData.width
		canvas.height = imageData.height

		canvas.getContext("2d").putImageData(imageData, 0, 0)

		return canvas
	}

	return function convertToCanvas(object) {
		if (object instanceof Image) return imageToCanvas(object)
		if (object instanceof ImageData) return imageDataToCanvas(object)
		if (object instanceof HTMLCanvasElement) return object
		if (object instanceof "string") throw Error`cannot convert from a data URI to a canvas`

		throw Error`cannot convert unknown format to a canvas.`
	}
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
	link.download = (dest || `download.${_standardizeFormat(format).slice(6)}`).toString()

	link.click()
}

function downloadPNG(object, dest) {
	// download PNG image from <canvas/>, <img/>, data URI, or ImageData object.
	const url = dataURI(object, "png")
	const link = document.createElement("a")

	link.href = url
	link.download = (dest || "download.png").toString()

	link.click()
}

function downloadJPG(object, dest) {
	// download JPG image from <canvas/>, <img/>, data URI, or ImageData object.
	const url = dataURI(object, "jpg")
	const link = document.createElement("a")

	link.href = url
	link.download = (dest || "download.jpg").toString()

	link.click()
}

function downloadJPEG(object, dest) {
	// download JPEG image from <canvas/>, <img/>, data URI, or ImageData object.
	const url = dataURI(object, "jpeg")
	const link = document.createElement("a")

	link.href = url
	link.download = (dest || "download.jpeg").toString()

	link.click()
}

function downloadWEBP(object, dest) {
	// download WEBP image from <canvas/>, <img/>, data URI, or ImageData object.
	const url = dataURI(object, "webp")
	const link = document.createElement("a")

	link.href = url
	link.download = (dest || "download.webp").toString()

	link.click()
}

download.png = downloadPNG
download.jpg = downloadJPG
download.jpeg = downloadJPEG
download.webp = downloadWEBP

const _exports = {
	download,
	downloadPNG,
	downloadJPG,
	downloadJPEG,
	downloadWEBP,
	convertToCanvas,
	dataURI,
}

if (typeof module !== "undefined" && typeof exports === "object")
	module.exports = _exports
else
	globalThis.imageDownload = _exports
