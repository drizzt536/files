% convert the SVGs to PDF for inclusion in LaTeX PDFs.

[status, ~] = system("inkscape --version");
if status ~= 0
	error("Inkscape is not installed and is required for converting SVG to PDF.");
	% there is also rsvg-convert and CairoSVG, but rsvg-convert is less reliable,
	% and CairoSVG doesn't work at all with masks and is incredibly slow and deprecated.
end

for name = "./svg/" + string({dir("./svg/*.svg").name})
	cmd = sprintf("inkscape %s --export-type=pdf --export-filename=%s", ...
		name, strrep(name, "svg", "pdf"));

	disp(cmd);
	[~, ~] = system(cmd);
end
