#!/usr/bin/env js
/**
 * image-download.js v2.0.0 (c) | Copyright 2024-2026 Daniel E. Janusch
 *
 * download any image from the current page, convert to canvas, or find the data URI.
 *
 * NOTE: pasting the data URI into the browser URL bar may not load
 *       the whole image. Some browsers like to truncate the URI if it longer
 *       than like 100kb. This is not a problem if you download it as normal.
**/

(function imageDownload_closure(defineGlobally=true, useShortName=true, defaultKind="uri") {
	function _standardizeFormat(fmt) {
		// also allow inputs like "png" or "jpg" instead of the actual MIME types.
		if (typeof fmt !== "string")
			return "image/png"

		fmt = fmt.toLowerCase()

		if (fmt.startsWith("image/"))
			fmt = fmt.slice(6)

		switch (fmt) {
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

	function _toCanvas(x, wprop, hprop, fnprop) {
		const canvas  = document.createElement("canvas")

		canvas.width  = x[wprop]
		canvas.height = x[hprop]

		canvas.getContext("2d")[fnprop](x, 0, 0)

		return canvas
	}

	let imageToCanvas = obj => _toCanvas(obj, "naturalWidth", "naturalHeight", "drawImage"   )

	function convertToCanvas(obj) {
		// returns a canvas, or throws an error. can't convert from URI string

		switch (obj?.constructor?.name) {
			case "Image"             : return imageToCanvas(obj)
			case "ImageData"         : return _toCanvas(obj, "width"       , "height"       , "putImageData")
			case "ImageBitmap"       : return _toCanvas(obj, "width"       , "height"       , "drawImage")
			case "HTMLVideoElement"  : return _toCanvas(obj, "videoWidth"  , "videoHeight"  , "drawImage"   )
			case "HTMLCanvasElement" : return obj
		}

		throw Error(`cannot synchronously convert to canvas from "${
			typeof obj === "string" ?
				"URI" :
				"unknown format"
		}.`)
	}

	async function convertToCanvasAsync(obj) {
		// returns promise of a canvas, or throws an error

		try {
			return convertToCanvas(obj)
		} catch (e) {
			if (!e.message.startsWith("cannot synchronously convert to canvas from"))
				throw e
		}

		if (typeof obj === "string") return new Promise((res, rej) => {
			const image = document.createElement("image")

			image.onload  = () => res(imageToCanvas(image))
			image.onerror = () => rej(Error`URI source is probably invalid`)

			image.src = obj
		})

		throw Error`cannot asynchronously convert to canvas from unknown format.`
	}

	function toDataURI(obj, fmt) {
		return typeof obj === "string" ?
			obj :
			convertToCanvas(obj).toDataURL( _standardizeFormat(fmt) )
	}

	///////////////////////////////////////////////

	function downloadURI(obj, dst, fmt) {
		// download image from <canvas/>, <img/>, <video/>, data URI, blob URL, ImageData, or ImageBitmap

		const uri = toDataURI(obj, fmt)
		const a   = document.createElement("a")

		if (fmt !== "jpg")
			fmt = _standardizeFormat(fmt).slice(6)

		a.href     = uri
		a.download = `${dst ?? "download"}.${fmt}`

		a.click()
	}

	function downloadBlob(obj, dst, fmt) {
		// download image from <canvas/>, <img/>, <video/>, data URI, blob URL, ImageData, or ImageBitmap

		const mime = _standardizeFormat(fmt)

		const _download = (href, revoke) => {
			const a = document.createElement("a")
			a.href     = href
			a.download = `${dst ?? "download"}.${fmt === "jpg" ? "jpg" : mime.slice(6)}`

			a.click()

			if (revoke)
				URL.revokeObjectURL(href)
		}

		// nothing to convert
		if (typeof obj === "string") {
			_download(obj, false)
			return
		}

		return new Promise(res => {
			convertToCanvas(obj).toBlob(blob => {
				_download(URL.createObjectURL(blob), true)
				res()
			}, mime)
		})
	}

	function download(obj, dst, fmt, kind=defaultKind) {
		switch (kind?.toLowerCase?.()) {
			case "blob" : downloadBlob(obj, dst, fmt); break;
			case "uri"  : downloadURI (obj, dst, fmt); break;
			default     : throw Error(`unrecognized download kind ${kind}. must be 'blob' or 'uri'.`)
		}
	}

	download.uri       = downloadURI
	download.blob      = downloadBlob

	// NOTE: between jpg and jpeg, the only difference is the default file extension
	downloadURI.png    = function downloadURI_PNG (obj, dst) { downloadURI(obj, dst, "png" ) }
	downloadURI.jpg    = function downloadURI_JPG (obj, dst) { downloadURI(obj, dst, "jpg" ) }
	downloadURI.jpeg   = function downloadURI_JPEG(obj, dst) { downloadURI(obj, dst, "jpeg") }
	downloadURI.webp   = function downloadURI_WEBP(obj, dst) { downloadURI(obj, dst, "webp") }

	downloadBlob.png   = function downloadBlob_PNG (obj, dst) { downloadBlob(obj, dst, "png" ) }
	downloadBlob.jpg   = function downloadBlob_JPG (obj, dst) { downloadBlob(obj, dst, "jpg" ) }
	downloadBlob.jpeg  = function downloadBlob_JPEG(obj, dst) { downloadBlob(obj, dst, "jpeg") }
	downloadBlob.webp  = function downloadBlob_WEBP(obj, dst) { downloadBlob(obj, dst, "webp") }

	download.png       = function download_PNG (obj, dst, kind=defaultKind) { download(obj, dst, "png" , kind) }
	download.jpg       = function download_JPG (obj, dst, kind=defaultKind) { download(obj, dst, "jpg" , kind) }
	download.jpeg      = function download_JPEG(obj, dst, kind=defaultKind) { download(obj, dst, "jpeg", kind) }
	download.webp      = function download_WEBP(obj, dst, kind=defaultKind) { download(obj, dst, "webp", kind) }

	download.png.uri   = downloadURI.png
	download.jpg.uri   = downloadURI.jpg
	download.jpeg.uri  = downloadURI.jpeg
	download.webp.uri  = downloadURI.webp

	download.png.blob  = downloadBlob.png
	download.jpg.blob  = downloadBlob.jpg
	download.jpeg.blob = downloadBlob.jpeg
	download.webp.blob = downloadBlob.webp

	const _exports = {
		download,
		convertToCanvas,
		convertToCanvasAsync,
		toDataURI,
		_standardizeFormat,
	}

	/// export

	// CommonJS
	if (typeof module !== "undefined" && typeof exports === "object")
		module.exports = _exports
	else if (typeof define === "function" && define.amd)
		define([], () => _exports);
	else if (defineGlobally)
		// browser
		globalThis[useShortName ? "imgdld" : "imageDownload"] = _exports
	else
		return _exports
})()
