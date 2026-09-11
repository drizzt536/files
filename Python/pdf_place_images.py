"""
pdf_place_images.py

written primarily by Claude

Place one or more images or single-page PDFs onto specific pages of a PDF,
each scaled to fit inside a given rectangular region (without stretching,
flipping, or rotating). PDF sources are embedded as real vector content
(not rasterized); if a source PDF has multiple pages, only the first page
is used.

Image sources may be any raster format Pillow can read -- this includes
PNG, JPEG/JPG, WEBP, GIF, BMP, TIFF, and ICO, among others. AVIF support
depends on your Pillow install (recent Pillow versions include it; older
ones may need a plugin) -- if in doubt, try it and see whether it errors.
Transparency (e.g. PNG/WEBP alpha channels) is preserved.

Coordinates are given as (x, y) in TOP-LEFT origin, matching what SumatraPDF's
cursor-position readout (press 'm') shows you.

Requirements:
	Python 3.8+
	pip install pypdf reportlab

Usage:
	python pdf_place_images.py [-C <dir>] [-j <config.json>] [-i <in.pdf>] [-o <out.pdf>] [-O <mode>] [-s]

	-C changes directory (relative to cwd) before anything else, like `cd
	   <dir> && ...`; every other path below (including -i/-o, the JSON
	   file's own root/input/output, and the config.json default) is then
	   resolved relative to that directory.
	-j defaults to ./config.json (relative to -C, if given) if omitted.
	-i/-o override whatever "input"/"output" are set to in the JSON file.
	-s/--silent suppresses warnings about overlapping placement regions.
	-O/--optimize <1/0>[,<1/0>][,<1/0>] optimizes PDFs via Ghostscript
	   (if gs/gswin64c/gswin32c is found) followed by qpdf (if found),
	   falling back to a plain copy for whichever tool is missing. Terms
	   are (optimize input, optimize output, optimize each placed PDF);
	   the 2nd term defaults to the 1st if omitted, the 3rd defaults to 0
	   if omitted. E.g. -O1 = input+output, -O0,1 = output only,
	   -O1,1,1 = -Os = everything. Never makes a file bigger: if
	   optimizing would increase size, the original is used instead.

JSON format:
	{
		"root": "C:/path/prefixed/to/every/filename/",   // optional, default "."
		"input": "in.pdf",                               // optional, default "in.pdf"
		"output": "out.pdf",                             // optional, default "out.pdf"
		"placements": [                                  // required
			["file1.pdf", 2, [367, 441], [556, 611]],
			["file2.png", "3,4,5-10, r3-r1", [367,  73], [556, 254]]
		]
	}

	Each placement is [filename, page_spec, [top_left_x, top_left_y],
	[bottom_right_x, bottom_right_y]], with coordinates in points, top-left
	origin.

	page_spec may be:
	  - an int (1-indexed page number), e.g. 3
	  - a string: a comma-separated list of individual pages and/or ranges,
		e.g. "1,3,6-8,10-end". Each individual page identifier (bare, or
		on either side of a "-" range) may be:
		  - a plain integer, e.g. "5"
		  - "end": the last page of the document
		  - "rN" (N >= 0): the N-th page counting back from the end, so
			"r0" is the last page (same as "end"), "r1" is the
			second-to-last page, etc.
		The placement is applied, unchanged, to every page the spec
		resolves to. Backwards ranges (e.g. "5-2", or "end-1" on a
		document where that resolves before the start) are always
		invalid -- since placements aren't ordered, there's no
		"reverse order" to fall back on the way there is in e.g. pdftk.
		Out-of-range page numbers are rejected at validation time.
"""

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import io


def optimize_pdf(infile, outfile, silent: bool = False):
	"""
	Run a Ghostscript pass (dedup images, normalize to PDF 1.7) followed by
	a qpdf pass (coalesce/recompress streams), falling back gracefully if
	either tool isn't installed. If neither tool is found, this just copies
	infile to outfile. If the result ends up larger than the original
	input, falls back to copying infile to outfile instead.
	"""
	gs_exe = None
	for candidate in ("gs", "gswin64c", "gswin32c"):
		if shutil.which(candidate):
			gs_exe = candidate
			break

	fd, tempfile_path = tempfile.mkstemp(suffix=".pdf")
	os.close(fd)
	tempfile_path = Path(tempfile_path)
	infile = Path(infile)
	outfile = Path(outfile)

	try:
		if not gs_exe:
			shutil.copyfile(infile, tempfile_path)
		else:
			result = subprocess.run(
				[
					gs_exe,
					"-dNOPAUSE",
					"-dBATCH",
					"-sDEVICE=pdfwrite",
					"-dDetectDuplicateImages",
					"-dCompatibilityLevel=1.7",
					f"-sOutputFile={tempfile_path}",
					str(infile),
				],
				capture_output=True,
				text=True,
				check=True,
			)
			
			if not silent and result.stdout:
				lines = result.stdout.splitlines()
				# skip the first 4 lines of Ghostscript boilerplate
				filtered_lines = lines[4:] if len(lines) > 4 else lines
				
				if filtered_lines:
					# print the prefix without a newline, then the rest of the output
					print(f"{infile.name}: ", end="")
					print("\n".join(filtered_lines))

		qpdf_exe = shutil.which("qpdf")

		if not qpdf_exe:
			shutil.move(str(tempfile_path), str(outfile))
		else:
			subprocess.run(
				[
					qpdf_exe,
					str(tempfile_path),
					"--force-version=1.7",
					"--coalesce-contents",
					"--remove-unreferenced-resources=yes",
					"--object-streams=generate",
					"--compress-streams=y",
					"--stream-data=compress",
					"--recompress-flate",
					"--compression-level=9",
					str(outfile),
				],
				capture_output=silent,
				check=True,
			)
			tempfile_path.unlink()

		# if optimization made the file bigger, just use the original instead.
		if outfile.stat().st_size > infile.stat().st_size:
			outfile.unlink()
			shutil.copyfile(infile, outfile)
	finally:
		# clean up the tempfile if something above raised before it was
		# moved/removed on the normal paths.
		if tempfile_path.exists():
			tempfile_path.unlink()


def parse_optimize_flag(value):
	"""
	Parse the -O/--optimize argument into (optimize_input, optimize_output,
	optimize_placed), each a bool.

	Format: "<1/0>[,<1/0>][,<1/0>]"
	  - 1st term: whether to optimize the input PDF.
	  - 2nd term: whether to optimize the final output PDF. Defaults to
		the 1st term's value if omitted.
	  - 3rd term: whether to optimize each placed PDF (source PDFs merged
		onto a page) individually. Defaults to 0 if omitted.

	So "-O1" optimizes input+output (not placed PDFs), "-O0" optimizes
	nothing, "-O0,1" optimizes only the output, "-O1,1,1" optimizes
	everything. "-Os" is the same as "-O1,1,1"
	"""

	if value == 's':
		return True, True, True

	parts = value.split('s')
	if len(parts) > 3:
		fatal(f"invalid -O/--optimize value {value!r}: expected 1 to 3 comma-separated terms, got {len(parts)}")

	def to_bool(term, label):
		if term not in "01":
			fatal(f"invalid -O/--optimize value {value!r}: {label} must be 0 or 1, got {term!r}")

		return term == '1'

	optimize_input  = to_bool(parts[0], "1st term")
	optimize_output = to_bool(parts[1], "2nd term") if len(parts) >= 2 else optimize_input
	optimize_placed = to_bool(parts[2], "3rd term") if len(parts) >= 3 else False

	return optimize_input, optimize_output, optimize_placed


def is_pdf(path):
	return os.path.splitext(path)[1].lower() == ".pdf"


def display_path(path):
	"""Format a path with forward slashes for printing, even on Windows."""
	return str(path).replace("\\", "/")


_WARN_COLOR  = "\x1b[38;2;180;100;0m"
_FATAL_COLOR = "\x1b[38;2;166;12;26m"
_RESET_COLOR = "\x1b[m"


def warn(message):
	"""Print a non-fatal warning in color, prefixed with 'Warning: '."""
	print(f"{_WARN_COLOR}Warning: {message}{_RESET_COLOR}")


def fatal(message):
	"""Print a fatal error in color and terminate the program (no traceback)."""
	raise SystemExit(f"{_FATAL_COLOR}Error: {message}{_RESET_COLOR}")


def _resolve_page_token(token, total_pages):
	"""
	Resolve a single page identifier token to a 1-indexed page number.

	Accepts:
	  - a plain integer string, e.g. "5"
	  - "end", meaning the last page (same as "r0")
	  - "rN" (N >= 0), meaning the N-th page counting back from the end;
		"r0" is the last page, "r1" is second-to-last, etc.

	Raises ValueError (with the token embedded, for cheap error context)
	on anything else, or if the resolved page number is < 1.
	"""
	if token == "end":
		return total_pages

	if token.startswith("r"):
		digits = token[1:]
		if not digits or not digits.isdigit():
			raise ValueError(f"invalid page identifier {token!r}: expected 'r' followed by a non-negative integer")
		offset = int(digits)
		resolved = total_pages - offset
		if resolved < 1:
			raise ValueError(
				f"invalid page identifier {token!r}: resolves to page {resolved}, "
				f"but document only has {total_pages} page(s)"
			)
		return resolved

	try:
		page = int(token)
	except ValueError:
		raise ValueError(f"invalid page identifier: expected an integer, 'end', or 'rN', got {token!r}")
	if page < 1:
		raise ValueError(f"invalid page identifier: page number must be >= 1, got {page}")
	return page


def parse_page_spec(spec, total_pages):
	"""
	Expand a page specification into a sorted list of unique 1-indexed page
	numbers.

	`spec` may be:
	  - an int: returned as a single-element list, e.g. 3 -> [3]
	  - a str: a comma-separated list of individual pages and/or ranges,
		e.g. "1,3,6-8,10-end,r2". Whitespace is ignored.

		Each individual page identifier (on its own, or on either side of
		a "-" range) may be:
		  - a plain integer, e.g. "5"
		  - "end": the last page of the document
		  - "rN" (N >= 0): the N-th page counting back from the end,
			e.g. "r0" is the last page (same as "end"), "r1" is the
			second-to-last page, etc.

	Backwards ranges (where the resolved end comes before the resolved
	start) are always invalid, regardless of which identifier forms were
	used to express either side -- since a placement's pages are just a
	set of destinations, not an ordered sequence, there's no meaningful
	interpretation of "reverse order" the way there is in e.g. pdftk.

	Raises ValueError on any malformed token (unrecognized identifier,
	empty token, a range with the (resolved) start greater than the
	(resolved) end, a page number below 1, or an 'rN' that resolves below
	page 1).
	"""
	if isinstance(spec, bool):
		raise ValueError(f"invalid page spec: {spec!r}")

	if isinstance(spec, int):
		if spec < 1:
			raise ValueError(f"invalid page spec: page number must be >= 1, got {spec}")
		return [spec]

	if not isinstance(spec, str):
		raise ValueError(f"invalid page spec: must be an int or string, got {type(spec).__name__}")

	cleaned = "".join(spec.split())  # strip all whitespace
	if not cleaned:
		raise ValueError("invalid page spec: empty string")

	pages = set()
	for token in cleaned.split(","):
		if not token:
			raise ValueError(f"invalid page spec: empty entry in {spec!r}")

		if "-" in token:
			left, _, right = token.partition("-")

			if not left:
				raise ValueError(f"invalid page spec: missing range start in {token!r}")
			if not right:
				raise ValueError(f"invalid page spec: missing range end in {token!r}")

			try:
				start = _resolve_page_token(left, total_pages)
			except ValueError as e:
				raise ValueError(f"invalid page spec: {e} (in {token!r})")
			try:
				end = _resolve_page_token(right, total_pages)
			except ValueError as e:
				raise ValueError(f"invalid page spec: {e} (in {token!r})")

			if end < start:
				raise ValueError(
					f"invalid page spec: range {token!r} is backwards "
					f"(resolves to start={start}, end={end}); "
					f"page order doesn't matter here, so reverse the identifiers instead"
				)

			pages.update(range(start, end + 1))
		else:
			pages.add(_resolve_page_token(token, total_pages))

	return sorted(pages)


def _is_number(v):
	return isinstance(v, (int, float)) and not isinstance(v, bool)


def _is_coord_pair(v):
	return (
		isinstance(v, (list, tuple))
		and len(v) == 2
		and _is_number(v[0])
		and _is_number(v[1])
	)


def validate_config(data, json_path, total_pages):
	"""
	Validate the raw parsed JSON dict. Collects ALL problems found (rather
	than stopping at the first) and raises a single ValueError listing them,
	so a bad config can be fixed in one pass instead of one error at a time.
	`total_pages` is the page count of the resolved input PDF, needed to
	resolve "end"/"rN" in page-spec strings and to reject any page numbers
	(after expansion) that fall outside the document's actual page range.
	"""
	errors = []
	label = display_path(json_path)

	# --- root / input / output: if present, must be strings ---
	for key in ("root", "input", "output"):
		if key in data and data[key] is not None and not isinstance(data[key], str):
			errors.append(f"'{key}' must be a string (or null/omitted), got {type(data[key]).__name__}")

	# --- placements: required, must be a non-empty list ---
	if "placements" not in data:
		errors.append("missing required key 'placements'")
	elif not isinstance(data["placements"], list):
		errors.append(f"'placements' must be a list, got {type(data['placements']).__name__}")
	elif len(data["placements"]) == 0:
		errors.append("'placements' must have at least one entry")
	else:
		for i, entry in enumerate(data["placements"]):
			prefix = f"placements[{i}]"

			if not isinstance(entry, (list, tuple)):
				errors.append(f"{prefix}: must be a list, got {type(entry).__name__}")
				continue
			if len(entry) != 4:
				errors.append(f"{prefix}: must have exactly 4 elements [filename, page, top_left, bottom_right], got {len(entry)}")
				continue

			filename, page_spec, top_left, bottom_right = entry

			if not isinstance(filename, str) or not filename:
				errors.append(f"{prefix}: filename must be a non-empty string, got {filename!r}")

			try:
				resolved_pages = parse_page_spec(page_spec, total_pages)
			except ValueError as e:
				errors.append(f"{prefix}: {e}")
			else:
				out_of_range = [p for p in resolved_pages if p > total_pages]
				if out_of_range:
					errors.append(
						f"{prefix}: page(s) {out_of_range} out of range "
						f"(document has {total_pages} page(s))"
					)

			if not _is_coord_pair(top_left):
				errors.append(f"{prefix}: top_left must be a [x, y] pair of numbers, got {top_left!r}")
			if not _is_coord_pair(bottom_right):
				errors.append(f"{prefix}: bottom_right must be a [x, y] pair of numbers, got {bottom_right!r}")

			# Only check region sanity if both pairs were well-formed
			if _is_coord_pair(top_left) and _is_coord_pair(bottom_right):
				if bottom_right[0] <= top_left[0] or bottom_right[1] <= top_left[1]:
					errors.append(
						f"{prefix}: bottom_right {tuple(bottom_right)} must be strictly greater than "
						f"top_left {tuple(top_left)} in both x and y"
					)

	if errors:
		bullet_list = "\n".join(f"  - {e}" for e in errors)
		fatal(f"Invalid config in '{label}':\n{bullet_list}")


def fit_region(content_w, content_h, top_left, bottom_right, page_height):
	"""
	Given a content's natural size and a target region (top-left origin),
	compute (draw_x, draw_y, draw_w, draw_h) in PDF bottom-left-origin
	points, scaled to fit entirely inside the region (preserving aspect
	ratio) and centered.
	"""
	region_x0, region_y0 = top_left
	region_x1, region_y1 = bottom_right
	region_w = region_x1 - region_x0
	region_h = region_y1 - region_y0

	if region_w <= 0 or region_h <= 0:
		fatal(f"Invalid region: top_left={top_left}, bottom_right={bottom_right}")

	scale = min(region_w / content_w, region_h / content_h)
	draw_w = content_w * scale
	draw_h = content_h * scale

	offset_x = (region_w - draw_w) / 2
	offset_y = (region_h - draw_h) / 2

	draw_x = region_x0 + offset_x
	draw_y = page_height - region_y1 + offset_y  # region_y1 = bottom edge in top-left coords

	return draw_x, draw_y, draw_w, draw_h, scale


def build_image_overlay(page_width, page_height, image_placements):
	"""Build a single-page reportlab overlay containing all IMAGE placements for one page."""
	buf = io.BytesIO()
	c = canvas.Canvas(buf, pagesize=(page_width, page_height))

	for image_path, top_left, bottom_right in image_placements:
		img = ImageReader(image_path)
		img_w, img_h = img.getSize()
		draw_x, draw_y, draw_w, draw_h, _ = fit_region(
			img_w, img_h, top_left, bottom_right, page_height
		)

		c.drawImage(
			img,
			draw_x,
			draw_y,
			width=draw_w,
			height=draw_h,
			mask='auto',
			preserveAspectRatio=True,  # belt-and-suspenders; we already computed exact size
		)

	c.save()
	buf.seek(0)
	return buf


def merge_pdf_placement(page, page_height, pdf_path, top_left, bottom_right, silent, optimize=False):
	"""Embed the first page of a source PDF onto `page`, scaled/centered into the region."""
	opt_tempfile = None
	try:
		read_path = pdf_path
		if optimize:
			fd, opt_tempfile = tempfile.mkstemp(suffix=".pdf")
			os.close(fd)
			optimize_pdf(pdf_path, opt_tempfile, silent)
			read_path = opt_tempfile

		src_reader = PdfReader(read_path)
		if len(src_reader.pages) > 1:
			warn(f"'{display_path(pdf_path)}' has {len(src_reader.pages)} pages; using page 1 only.")
		src_page = src_reader.pages[0]

		content_w = float(src_page.mediabox.width)
		content_h = float(src_page.mediabox.height)
		draw_x, draw_y, draw_w, draw_h, scale = fit_region(
			content_w, content_h, top_left, bottom_right, page_height
		)

		transform = Transformation().scale(sx=scale, sy=scale).translate(tx=draw_x, ty=draw_y)
		page.merge_transformed_page(src_page, transform)
	finally:
		if opt_tempfile and os.path.isfile(opt_tempfile):
			os.remove(opt_tempfile)


def parse_args():
	parser = argparse.ArgumentParser(
		description="Place images/PDFs onto specific regions of PDF pages."
	)
	parser.add_argument("-C", "--chdir", dest="chdir", default=None, help="Change to this directory (relative to cwd) before doing anything else")
	parser.add_argument("-j", "--json", default=None, help="Path to the placements JSON file (default: ./config.json, relative to -C if given)")
	parser.add_argument("-i", "--input", default=None, help="Path to the source PDF (overrides JSON 'input')")
	parser.add_argument("-o", "--output", default=None, help="Path to write the resulting PDF (overrides JSON 'output')")
	parser.add_argument("-s", "--silent", action="store_true", help="Suppress warnings about overlapping placement regions")
	parser.add_argument(
		"-O", "--optimize", default=None, metavar="1/0[,1/0][,1/0]|s",
		help="Optimize via Ghostscript+qpdf if available: <input>[,<output>][,<placed>], "
			 "each 0 or 1. output defaults to input's value; placed defaults to 0. "
			 "E.g. -O1 = optimize input+output, -O0,1 = output only, -O1,1,1 = -Os = everything."
	)
	return parser.parse_args()


def load_config(json_path, cli_input, cli_output):
	if not os.path.isfile(json_path):
		fatal(f"JSON config not found: '{display_path(json_path)}'")

	with open(json_path, "r") as f:
		try:
			data = json.load(f)
		except json.JSONDecodeError as e:
			fatal(f"'{display_path(json_path)}' is not valid JSON: {e}")

	if not isinstance(data, dict):
		fatal(f"'{display_path(json_path)}' must contain a JSON object, got {type(data).__name__}")

	json_dir = os.path.dirname(os.path.abspath(json_path))

	# root/input/output that come FROM the JSON are relative to the JSON
	# file's own directory. Values passed on the CLI (-i/-o) are relative
	# to the current working directory instead, and are used as-is.
	root = os.path.join(json_dir, data.get("root") or ".")

	if cli_input:
		input_pdf = cli_input
	else:
		input_pdf = os.path.join(json_dir, data.get("input") or "in.pdf")

	if cli_output:
		output_pdf = cli_output
	else:
		output_pdf = os.path.join(json_dir, data.get("output") or "out.pdf")

	if not os.path.isfile(input_pdf):
		fatal(f"Input PDF not found: '{display_path(input_pdf)}'")

	# Needed up front so validate_config can resolve "end" in page specs
	# and so it can be reported alongside any other errors in one pass.
	total_pages = len(PdfReader(input_pdf).pages)

	validate_config(data, json_path, total_pages)

	# Expand each entry's page spec (int or "1,3,6-8,10-end" style string)
	# into one or more concrete (filename, page_num, top_left, bottom_right)
	# tuples -- one per resolved page number, all sharing the same region.
	# From here on, page_num is always a plain positive int.
	placements = []
	for filename, page_spec, top_left, bottom_right in data["placements"]:
		for page_num in parse_page_spec(page_spec, total_pages):
			placements.append((filename, page_num, tuple(top_left), tuple(bottom_right)))

	# Check every referenced placement file actually exists (relative to root)
	missing = []
	for filename, _, _, _ in placements:
		full_path = os.path.join(root, filename)
		if not os.path.isfile(full_path):
			missing.append(display_path(full_path))
	if missing:
		bullet_list = "\n".join(f"  - {m}" for m in missing)
		noun = "file" if len(missing) == 1 else "files"
		fatal(f"Placement {noun} not found:\n{bullet_list}")

	return root, input_pdf, output_pdf, placements


def regions_overlap(a_top_left, a_bottom_right, b_top_left, b_bottom_right):
	"""Axis-aligned rectangle overlap test (top-left origin, x right / y down)."""
	a_x0, a_y0 = a_top_left
	a_x1, a_y1 = a_bottom_right
	b_x0, b_y0 = b_top_left
	b_x1, b_y1 = b_bottom_right
	return not (a_x1 <= b_x0 or b_x1 <= a_x0 or a_y1 <= b_y0 or b_y1 <= a_y0)


def warn_overlaps(by_page):
	"""Print a warning for every pair of placements on the same page whose regions overlap."""
	for page_num, items in sorted(by_page.items()):
		for i in range(len(items)):
			path_a, tl_a, br_a = items[i]
			for j in range(i + 1, len(items)):
				path_b, tl_b, br_b = items[j]
				if regions_overlap(tl_a, br_a, tl_b, br_b):
					warn(
						f"page {page_num}: regions for "
						f"'{display_path(path_a)}' and '{display_path(path_b)}' overlap"
					)


def format_size(num_bytes):
	"""Format a byte count as KiB (2 decimal places), switching to MiB if it would be >= 1024 KiB."""
	kib = num_bytes / 1024
	if kib >= 1024:
		return f"{kib / 1024:.2f} MiB"
	return f"{kib:.2f} KiB"


def _run(root, input_pdf, output_pdf, placements, silent=False,
		  optimize_input=False, optimize_output=False, optimize_placed=False):
	opt_input_tempfile = None
	try:
		read_input_pdf = input_pdf
		if optimize_input:
			fd, opt_input_tempfile = tempfile.mkstemp(suffix=".pdf")
			os.close(fd)
			optimize_pdf(input_pdf, opt_input_tempfile, silent)
			read_input_pdf = opt_input_tempfile

		reader = PdfReader(read_input_pdf)
		writer = PdfWriter()

		# Group placements by page number; split each page's placements into
		# images (handled via a reportlab overlay) and PDFs (embedded directly
		# as vector page content).
		by_page = {}
		for filename, page_num, top_left, bottom_right in placements:
			path = os.path.join(root, filename)
			by_page.setdefault(page_num, []).append((path, top_left, bottom_right))

		if not silent:
			warn_overlaps(by_page)

		for i, page in enumerate(reader.pages):
			page_num = i + 1  # 1-indexed to match user-facing config
			page_width = float(page.mediabox.width)
			page_height = float(page.mediabox.height)

			if page_num in by_page:
				image_placements = [p for p in by_page[page_num] if not is_pdf(p[0])]
				pdf_placements = [p for p in by_page[page_num] if is_pdf(p[0])]

				if image_placements:
					overlay_buf = build_image_overlay(page_width, page_height, image_placements)
					overlay_reader = PdfReader(overlay_buf)
					page.merge_page(overlay_reader.pages[0])

				for pdf_path, top_left, bottom_right in pdf_placements:
					merge_pdf_placement(page, page_height, pdf_path, top_left, bottom_right, silent, optimize=optimize_placed)

			writer.add_page(page)

		if os.path.isfile(output_pdf):
			warn(f"'{display_path(output_pdf)}' already exists and will be overwritten.")

		with open(output_pdf, "wb") as f:
			writer.write(f)

		if optimize_output:
			fd, opt_output_tempfile = tempfile.mkstemp(suffix=".pdf")
			os.close(fd)
			try:
				optimize_pdf(output_pdf, opt_output_tempfile, silent)
				shutil.move(opt_output_tempfile, output_pdf)
			finally:
				if os.path.isfile(opt_output_tempfile):
					os.remove(opt_output_tempfile)

		item_word = "item" if len(placements) == 1 else "items"
		page_word = "page" if len(reader.pages) == 1 else "pages"
		print(
			f"Placed {len(placements)} {item_word} across {len(by_page)} of {len(reader.pages)} {page_word}."
		)
		print(f"Done. Wrote {display_path(output_pdf)} ({format_size(os.path.getsize(output_pdf))})")
	finally:
		if opt_input_tempfile and os.path.isfile(opt_input_tempfile):
			os.remove(opt_input_tempfile)


def main():
	args = parse_args()

	original_cwd = os.getcwd()
	try:
		if args.chdir:
			os.chdir(args.chdir)

		json_path = args.json
		if json_path is None:
			json_path = "config.json"
			if not os.path.isfile(json_path):
				fatal(
					"No -j/--json given and './config.json' does not exist "
					f"(looked in '{display_path(os.getcwd())}')."
				)

		root, input_pdf, output_pdf, placements = load_config(json_path, args.input, args.output)

		optimize_input, optimize_output, optimize_placed = (
			parse_optimize_flag(args.optimize) if args.optimize is not None else (False, False, False)
		)

		_run(
			root, input_pdf, output_pdf, placements, silent=args.silent,
			optimize_input=optimize_input, optimize_output=optimize_output, optimize_placed=optimize_placed,
		)
	finally:
		os.chdir(original_cwd)


if __name__ == "__main__":
	main()
