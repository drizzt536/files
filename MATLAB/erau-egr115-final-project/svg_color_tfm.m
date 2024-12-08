% SVG Color Transformation v1.0 (c) | Copyright 2024 Daniel E. Janusch

% this file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
% and must be copied IN ITS ENTIRETY under penalty of law.

function outcontent = svg_color_tfm(varargin)
	% applies a color transformation to an SVG file
	% requires MatLab R2022b or newer. do `svg_color_tfm --help` for arguments.
	%
	% Example:
	%     % these all do the same thing because of default values.
	%     svg = svg_color_tfm("infile", "./tmp.svg", "outfile", "---", "verbose", true, "A", [255 255 255], "B", [-1 -1 -1], "keep", false, "bgcolor", "#fff")
	%     svg = svg_color_tfm("infile", "./tmp.svg", "outfile", "---", "verbose", true, "tfm", [255 255 255; -1 -1 -1], "keep", false, "bgcolor", "#fff")
	%     svg = svg_color_tfm("infile", "./tmp.svg", "outfile", "---")

	init_setup;

	% TODO: don't load the entire file content into memory at once, if possible

	% default values:
	content = missing;
	infile  = "./in.svg";
	outfile = missing;
	verbose = true;
	transformMatrix = [
		255 255 255 % A
		-1  -1  -1  % B
	];
	keepIntermediateFiles = false;
	bgcolor = "#fff";

	% argument parsing
	i = 1;
	while i <= nargin
		key = varargin{i};
		i = i + 1;
		if i > nargin
			% key with no value
			if ismember(key, ["help", "options", "-h", "-?", "-help", "--help"])
				print_help;
				return
			end

			break
		end
		val = varargin{i};

		if ~isa(key, "string") && ~isa(key, "char")
			fprintf(2, "argument %d ignored. only named arguments are supported\n", i);
			continue
		end

		% TODO: so far it assumes you don't give matrices for infile, outfile, verbose, etc.
		switch lower(key)
			case {"in", "infile"}
				if ~isa(val, "string") && ~isa(val, "char")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'infile'. must be char or string."));
				end

				infile = string(val);
			case {"out", "outfile"}
				if ~isa(val, "string") && ~isa(val, "char")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'outfile'. must be char or string."));
				end

				outfile = string(val);
			case "verbose"
				if ~isa(val, "logical")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'verbose'. must be a boolean."));
				end

				verbose = val;
			case {"transformmatrix", "transform", "tfmat", "tfm", "m"}
				if ~isa(val, "double")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'transformMatrix'. must be double."));
				end

				if any(size(size(val)) ~= [1 2]) || any(size(val) ~= [2 3])
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'transformMatrix'. must be a 2x3 matrix."));
				end

				transformMatrix = val;
			case "a"
				if ~isa(val, "double")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'A'. must be double."));
				end

				if any(size(size(val)) ~= [1 2]) || any(size(val) ~= [1 3])
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'A'. must be a 1x3 row vector."));
				end

				transformMatrix(1, :) = val;
			case "b"
				if ~isa(val, "double")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'B'. must be double."));
				end

				if any(size(size(val)) ~= [1 2]) || any(size(val) ~= [1 3])
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'B'. must be a 1x3 row vector."));
				end

				transformMatrix(2, :) = val;
			case {"keepintermediatefiles", "keepintermediate", "keepint", "keep"}
				if ~isa(val, "logical")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'keepIntermediateFiles'. must be boolean."));
				end

				keepIntermediateFiles = val;
			case {"backgroundcolor", "bgcolor"}
				if ~isa(val, "string") && ~isa(val, "char")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'backgroundColor'. must be char or string."));
				end

				bgcolor = string(val);
			case "content"
				if ~isa(val, "string") && ~isa(val, "char")
					throw(MException("svg_color_tfm:svg_color_tfm:args", "invalid value for named argument 'content'. must be char or string."));
				end

				content = string(val);
			otherwise
				throw(MException("svg_color_tfm:svg_color_tfm:args", "unknown named argument '" + key + "'."));
		end

		i = i + 1;
	end

	if nargin == 0
		print_help;
		return;
	end

	if ismissing(outfile), outfile = infile; end

	A = transformMatrix(1, :);
	B = transformMatrix(2, :);

	numRegex = "\d+(?:\.\d+)?|\.\d+";

	% required if there are embedded images.

	if ismissing(content)
		if ~isfile(infile)
			throw(MException("svg_color_tfm:svg_color_tfm:args", "input file '" + infile + "' does not exist"));
		end

		content = string(fileread(infile));
	end


	svgSttIndex = indexOf(content, "<svg");
	svgEndIndex = indexOf(content, ">", svgSttIndex + 4);
	svg = extractBetween(content, svgSttIndex, svgEndIndex);

	% full SVG dimensions.
	% not using width="..." or height="..." since those are different
	% from the coordinates that things within the SVG use; possible scaling
	scaledWidth = regexp(svg,                     ...
		"width\s*=\s*(?<quote>[""'])\s*" +        ...
		"(?<width>" + numRegex + ")\s*\k<quote>", ...
		"tokens", "once"                          ...
	);
	scaledWidth = scaledWidth(2);

	scaledHeight = regexp(svg,                     ...
		"height\s*=\s*(?<quote>[""'])\s*" +        ...
		"(?<height>" + numRegex + ")\s*\k<quote>", ...
		"tokens", "once"                           ...
	);
	scaledHeight = scaledHeight(2);

	matches = regexp(svg,                        ...
		"viewBox\s*=\s*(?<quote>[""'])\s*"     + ...
		strmul("(" + numRegex + ")(?:\s+)", 4) + ...
		"{0}\s*\k<quote>",                       ...
		"tokenExtents", "once"                   ...
	);
	
	if isempty(matches)
		throw(MException("svg_color_tfm:svg_color_tfm:content", "SVG does not have a `viewBox` attribute"))
	end
	% viewBox="min_x min_y width height"

	% these can stay as strings, it is fine.
	width  = extractBetween(svg, matches(4, 1), matches(4, 2));
	height = extractBetween(svg, matches(5, 1), matches(5, 2));

	if width == "", throw(MException("svg_color_tfm:svg_color_tfm:content", "svg width is not specified or is in the wrong format")); end
	if height == "", throw(MException("svg_color_tfm:svg_color_tfm:content", "svg height is not specified or is in the wrong format")); end

	widthScale  = str2double(scaledWidth) / str2double(width);
	heightScale = str2double(scaledHeight) / str2double(height);

	if verbose
		% uses eps(100) because eps(1) (eps) is too small
		if abs(widthScale - 1) > eps(64) || abs(heightScale - 1) > eps(64)
			fprintf("SVG dimensions (w,h): %s x %s (scaled to %s x %s)\n", ...
				width, height, scaledWidth, scaledHeight);
		else
			fprintf("SVG dimensions (w,h): %s x %s (unscaled)\n", width, height);
		end
	end

	options = struct(       ...
		"content", content, ...
		"verbose", verbose, ...
		"A"      , A,       ...
		"B"      , B        ...
	);
	clear content;
	clear transformMatrix;
	clear A;
	clear B;
	clear widthScale;
	clear heightScale;

	if bgcolor ~= "none"
		if verbose, disp("looking for background rectangle"); end
		options.content = look_for_bg_rect(options, width, height, svgEndIndex);
	end

	if verbose, disp("finding masks"); end
	options.masks = find_masks(options);

	if verbose, disp("inverting stroke colors"); end
	options.content = invert_stroke_colors(options);

	if verbose, disp("inverting fill colors"); end
	options.content = invert_fill_colors(options);

	if verbose, disp("inverting embedded images"); end
	options.content = invert_image_colors(options, keepIntermediateFiles);

	if verbose, disp("done"); end

	options.content = optimize_paths(options.content);
	options.content = strip(options.content) + newline;
	options.content = replace(options.content, sprintf("\r\n"), newline);

	if outfile == "-" % print to stdout
		fprintf(options.content);
	elseif outfile == "--" % print to stderr
		fprintf(2, options.content);
	elseif outfile ~= "---" % "---" => print nowhere
		fd = fopen(outfile, "wt");
		fwrite(fd, options.content);
		fclose(fd);
	end

	if nargout > 0
		outcontent = options.content;
	end
end

function init_setup
	% all the good names are taken up by built-in functions ao I picked this.

	% all 147 named colors. maps name to optimized hex color.
	% also "none" and "transparent".
	% colors taken from the SVG 1.1 standard.

	% since matlab is stupid, you need to put the main function first.
	global namedColorMap
	global hexToNameMap

	map = [
		"aliceblue"            , "#f0f8ff"
		"antiquewhite"         , "#faebd7"
		"aqua"                 , "#0ff"   
		"aquamarine"           , "#7fffd4"
		"azure"                , "#f0ffff"
		"beige"                , "#f5f5dc"
		"bisque"               , "#ffe4c4"
		"black"                , "#000"   
		"blanchedalmond"       , "#ffebcd"
		"blue"                 , "#00f"   
		"blueviolet"           , "#8a2be2"
		"brown"                , "#a52a2a"
		"burlywood"            , "#deb887"
		"cadetblue"            , "#5f9ea0"
		"chartreuse"           , "#7fff00"
		"chocolate"            , "#d2691e"
		"coral"                , "#ff7f50"
		"cornflowerblue"       , "#6495ed"
		"cornsilk"             , "#fff8dc"
		"crimson"              , "#dc143c"
		"cyan"                 , "#0ff"   
		"darkblue"             , "#00008b"
		"darkcyan"             , "#008b8b"
		"darkgoldenrod"        , "#b8860b"
		"darkgray"             , "#a9a9a9"
		"darkgreen"            , "#006400"
		"darkgrey"             , "#a9a9a9"
		"darkkhaki"            , "#bdb76b"
		"darkmagenta"          , "#8b008b"
		"darkolivegreen"       , "#556b2f"
		"darkorange"           , "#ff8c00"
		"darkorchid"           , "#9932cc"
		"darkred"              , "#8b0000"
		"darksalmon"           , "#e9967a"
		"darkseagreen"         , "#8fbc8f"
		"darkslateblue"        , "#483d8b"
		"darkslategray"        , "#2f4f4f"
		"darkslategrey"        , "#2f4f4f"
		"darkturquoise"        , "#00ced1"
		"darkviolet"           , "#9400d3"
		"deeppink"             , "#ff1493"
		"deepskyblue"          , "#00bfff"
		"dimgray"              , "#696969"
		"dimgrey"              , "#696969"
		"dodgerblue"           , "#1e90ff"
		"firebrick"            , "#b22222"
		"floralwhite"          , "#fffaf0"
		"forestgreen"          , "#228b22"
		"fuchsia"              , "#f0f"   
		"gainsboro"            , "#dcdcdc"
		"ghostwhite"           , "#f8f8ff"
		"gold"                 , "#ffd700"
		"goldenrod"            , "#daa520"
		"gray"                 , "#808080"
		"grey"                 , "#808080"
		"green"                , "#008000"
		"greenyellow"          , "#adff2f"
		"honeydew"             , "#f0fff0"
		"hotpink"              , "#ff69b4"
		"indianred"            , "#cd5c5c"
		"indigo"               , "#4b0082"
		"ivory"                , "#fffff0"
		"khaki"                , "#f0e68c"
		"lavender"             , "#e6e6fa"
		"lavenderblush"        , "#fff0f5"
		"lawngreen"            , "#7cfc00"
		"lemonchiffon"         , "#fffacd"
		"lightblue"            , "#add8e6"
		"lightcoral"           , "#f08080"
		"lightcyan"            , "#e0ffff"
		"lightgoldenrodyellow" , "#fafad2"
		"lightgray"            , "#d3d3d3"
		"lightgreen"           , "#90ee90"
		"lightgrey"            , "#d3d3d3"
		"lightpink"            , "#ffb6c1"
		"lightsalmon"          , "#ffa07a"
		"lightseagreen"        , "#20b2aa"
		"lightskyblue"         , "#87cefa"
		"lightslategray"       , "#789"   
		"lightslategrey"       , "#789"   
		"lightsteelblue"       , "#b0c4de"
		"lightyellow"          , "#ffffe0"
		"lime"                 , "#0f0"   
		"limegreen"            , "#32cd32"
		"linen"                , "#faf0e6"
		"magenta"              , "#f0f"   
		"maroon"               , "#800000"
		"mediumaquamarine"     , "#66cdaa"
		"mediumblue"           , "#0000cd"
		"mediumorchid"         , "#ba55d3"
		"mediumpurple"         , "#9370db"
		"mediumseagreen"       , "#3cb371"
		"mediumslateblue"      , "#7b68ee"
		"mediumspringgreen"    , "#00fa9a"
		"mediumturquoise"      , "#48d1cc"
		"mediumvioletred"      , "#c71585"
		"midnightblue"         , "#191970"
		"mintcream"            , "#f5fffa"
		"mistyrose"            , "#ffe4e1"
		"moccasin"             , "#ffe4b5"
		"navajowhite"          , "#ffdead"
		"navy"                 , "#000080"
		"oldlace"              , "#fdf5e6"
		"olive"                , "#808000"
		"olivedrab"            , "#6b8e23"
		"orange"               , "#ffa500"
		"orangered"            , "#ff4500"
		"orchid"               , "#da70d6"
		"palegoldenrod"        , "#eee8aa"
		"palegreen"            , "#98fb98"
		"paleturquoise"        , "#afeeee"
		"palevioletred"        , "#db7093"
		"papayawhip"           , "#ffefd5"
		"peachpuff"            , "#ffdab9"
		"peru"                 , "#cd853f"
		"pink"                 , "#ffc0cb"
		"plum"                 , "#dda0dd"
		"powderblue"           , "#b0e0e6"
		"purple"               , "#800080"
		"red"                  , "#f00"   
		"rosybrown"            , "#bc8f8f"
		"royalblue"            , "#4169e1"
		"saddlebrown"          , "#8b4513"
		"salmon"               , "#fa8072"
		"sandybrown"           , "#f4a460"
		"seagreen"             , "#2e8b57"
		"seashell"             , "#2e8b57"
		"sienna"               , "#a0522d"
		"silver"               , "#c0c0c0"
		"skyblue"              , "#87ceeb"
		"slateblue"            , "#6a5acd"
		"slategray"            , "#708090"
		"slategrey"            , "#708090"
		"snow"                 , "#fffafa"
		"springgreen"          , "#00ff7f"
		"steelblue"            , "#4682b4"
		"tan"                  , "#d2b48c"
		"teal"                 , "#008080"
		"thistle"              , "#d8bfd8"
		"tomato"               , "#ff6347"
		"turquoise"            , "#40e0d0"
		"violet"               , "#ee82ee"
		"wheat"                , "#f5deb3"
		"white"                , "#fff"   
		"whitesmoke"           , "#f5f5f5"
		"yellow"               , "#ff0"   
		"yellowgreen"          , "#9acd32"
		"none"                 , "none"
		"transparent"          , "transparent"
	]';

	namedColorMap = dictionary(map(1, :), map(2, :));
	hexToNameMap = dictionary;

	for name = namedColorMap.keys'
		hex = namedColorMap(name);

		if strlength(name) <= strlength(hex)
			hexToNameMap(hex) = name;
		end
	end
end

%%% general helper functions

function out    = ternary(condition, ifTrue, ifFalse)
	% ternary: similar to a C-style ternary operator.
	% condition ? ifTrue : ifFalse
	% elso `ifTrue*condition + ifFalse*~condition` for numerics.
	% both arguments are evaluated regardless of the condition,
	% so don't use expressions with side-affects or CPU-intensive operations.


	if condition
		out = ifTrue;
	else
		out = ifFalse;
	end
end
function xout   = clamp(xin, xbounds)
	% clamps x between the minimum and maximum given by xbounds.
	% index explicitly in case the bounds argument has more than 2 values.

	xout = median([xbounds(1), xin, xbounds(2)]);
end
function outstr = strmul(instr, n)
	% performs a Python-esque string multiplication.
	% returns the same type as the input, either `char` or `string`

	outstr = feval(            ...
		class(instr),          ...
		ternary(               ...
			n == 0,            ...
			"",                ...
			join(repelem(      ...
				string(instr), ...
				n              ...
			), "")             ...
		)                      ...
	);
end
function C      = riffle(A, B)
	% similar to `c = Riffle[A, B]` from Mathematica
	% repelem(A, 2)
	C = reshape([A; B], height(A), []);
end
function B      = selfriffle(A)
	% similar to `B = Riffle[A, A]` from Mathematica
	B = riffle(A, A);
end
function outstr = strinsert(astr, bstr, i)
	% insert `bstr` into index `i` of `astr`.

	outstr = extractBefore(astr, i) + string(bstr) + extractAfter(astr, i - 1);
end
function i      = indexOf(instr, search, startIndex)
	% finds the index of the first instance of `search`.
	% uses regexp because strfind always finds all of them.
	% can only return values larger than `startIndex`.

	if nargin < 3
		startIndex = 0;
	end

	i = startIndex + regexp(extractAfter(instr, startIndex), search, "once");
end
function          fwriteFromBase64(fp, base64)
	% given the file path and base64 string writes the bytes to the file
	fd = fopen(fp, "wb");
	bytes = matlab.net.base64decode(base64);

	fwrite(fd, bytes, "uint8");
	fclose(fd);
end
function base64 = freadToBase64(fp)
	% reads bytes from a file and converts them to a base64 string
	% takes in a file path (`char` or `string`) and returns `char`

	fd = fopen(fp, "rb");

	bytes = uint8(fread(fd));
	fclose(fd);

	base64 = matlab.net.base64encode(bytes);
end

%%% helper color functions

function outhex = hsl2hex(color)
	% hsl2hex: converts HSL color to RGB hex color.
	% returns a `string` object
	%
	% https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
	% h \in [0, 360]
	% s, l \in [0, 100]
	% returns #RRGGBB (in lowercase)
	% there is no built-in hsl2rgb function, but there is an hsv2rgb.
	% clamps the saturation and light level between 0 and 100.
	% modulo's the angle by 360 degrees.
	%
	% Example:
	%     hsl(180°, 50%, 60%) -> [180, 50, 60] -> #66cccc
	%     hsl(123°, 17%, 63%) -> [123, 17, 63] -> #91b192

	% normalize into [0, 1]
	h = mod(color(1), 360) / 360;
	s = clamp(color(2), [0 100]) / 100;
	l = clamp(color(3), [0 100]) / 100;

	function out = hue2rgb(p, q, t)
		t = t + (t < 0) - (t > 1);

		if t < 1/6,		out = p + 6*t*(q - p);
		elseif t < 1/2,	out = q;
		elseif t < 2/3,	out = p + 6*(2/3 - t)*(q - p);
		else,			out = p;
		end
	end

	if s == 0
		% achromatic
		r = l;
		g = l;
		b = l;
	else
		% q = (1 + s)*l + s*(1 - 2*l)*(l >= 1/2);
		q = l + s*ternary(l < 0.5, l, 1 - l);
		p = 2*l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	end

	outhex = sprintf("#%02x%02x%02x", round(255*r), round(255*g), round(255*b));
end
function outhex = clr2hex(color)
	% clr2hex: returns the hex representation of the color (#RRGGBB or #RRGGBBAA)
	% assumes the input string is a valid color.
	% allows any color input type that `apply_color_tfm` does.
	%
	% if there are decimals like in rgb(12.5, 5.7, 8.9),
	% they are rounded to the nearest whole number

	global namedColorMap

	color = strip(char(color));

	if ismember(strlength(color), [3 4 6 8]) && ~isempty(regexp(color, "^[\da-f]+$", "once"))
		color = ['#' color];
	end

	matches = regexp(color, "^rgb\(" + ...
		strmul("\s*(\d+(?:\.\d+)?)\s*,", 3) + "{0}\)$", "tokens");
	if ~isempty(matches)
		matches = str2double(string(matches{1}));
		color = "#" + sprintf("%02x", round(matches));
	end

	matches = regexp(color, "^rgb\(" + ...
		strmul("\s*(\d+(?:\.\d+)?)%\s*,", 3) + "{0}\)$", "tokens");
	if ~isempty(matches)
		matches = 255 * str2double(string(matches{1})) / 100;
		color = "#" + sprintf("%02x", round(matches));
	end

	matches = regexp(color, "^rgba\(" + ...
		strmul("\s*(\d+(?:\.\d+)?)\s*,", 4) + "{0}%?\)$", "tokens");
	if ~isempty(matches)
		matches = str2double(string(matches{1}));

		if regexp(color, "%\s*\)$")
			% change percent to a regular integer the
			% alpha channel can always be a percent,
			% even if the other channels are not.

			matches(4) = 255 * matches(4) / 100;
		end

		color = "#" + sprintf("%02x", round(matches));
	end

	matches = regexp(color, "^rgba\(" + ...
		strmul("\s*(\d+(?:\.\d+)?)%\s*,", 3) + "\s*(\d+(?:\.\d+)?)%?\s*\)$", "tokens");
	if ~isempty(matches)
		matches = str2double(string(matches{1}));
		matches(1:3) = 255 * matches(1:3) / 100;

		if regexp(color, "%\s*\)$")
			% see the comment for the other rgba section

			matches(4) = 255 * matches(4) / 100;
		end

		color = "#" + sprintf("%02x", round(matches));
	end

	matches = regexp(color, "^hsl\(\s*(\d+(?:\.\d+)?)\s*," + ...
		strmul("\s*(\d+(?:\.\d+)?)%\s*,", 2) + "{0}\)$", "tokens");
	if ~isempty(matches)
		matches = str2double(string(matches{1}));

		color = hsl2hex(matches);
	end

	matches = regexp(color, "^hsla\(\s*(\d+(?:\.\d+)?)\s*," + ...
		strmul("\s*(\d+(?:\.\d+)?)%\s*,", 2) + "\s*(\d+(?:\.\d+)?)%?\s*\)$", "tokens");
	if ~isempty(matches)
		matches = str2double(string(matches{1}));

		if regexp(color, "%\s*\)$")
			% see the comment for the rgba section
			matches(4) = 255 * matches(4) / 100;
		end

		color = hsl2hex(matches(1:3)) + sprintf("%02x", round(matches(4)));
	end

	% named color
	if ismember(color, namedColorMap.keys)
		color = namedColorMap(color);
	end

	outhex = string(color);
end
function outhex = optimize_hex(inhex)
	% returns the shortest hex code for the color.
	%
	% the output will always be in hex form of type `string`
	% unless the named color form is shorter.
	% the output will always be in hex form, even if the named color is shorter.

	inhex = strip(char(inhex));

	% #RGB, #RGBA, #RRGGBB, #RRGGBBAA
	if ~ismember(strlength(inhex), [4 5 7 9])
		throw(MException("svg_color_tfm:optimize_hex:argLength", "invalid hex length"));
	end

	global hexToNameMap;

	% #RRGGBBAA -> #RGBA
	if regexp(inhex, "^#([\da-f])\1([\da-f])\2([\da-f])\3([\da-f])\4$")
		inhex = ['#' inhex(2:2:8)];
	end

	% #RRGGBB -> #RGB
	if regexp(inhex, "^#([\da-f])\1([\da-f])\2([\da-f])\3$")
		inhex = ['#' inhex(2:2:6)];
	end

	% #RrGgBb00 -> #RGB0
	if regexp(inhex, "^#[\da-f]{6}00$")
		% this is an approximation of the color, but since it
		% is fully transparent, it doesn't matter anyway.

		inhex = ['#' inhex(2:2:6) '0'];
	end

	%% remove redundant alpha channels

	% #RGBf -> #RGB
	if regexp(inhex, "^#[\da-f]{3}f$")
		inhex = inhex(1:4);
	end

	% #RrGgBbff -> #RrGgBb
	if regexp(inhex, "^#[\da-f]{6}ff$")
		inhex = inhex(1:7);
	end

	if ismember(inhex, hexToNameMap.keys)
		outhex = hexToNameMap(inhex);
	else
		outhex = string(inhex);
	end
end
function outhex = optimize_color(color)
	% returns the shortest representation of the color.
	% assumes the input string is a valid color.
	%
	% if there are decimals like rgb(12.5, 5.7, 8.9), then
	% they are rounded to the nearest whole number.
	%
	% the output will always be in hex form
	% unless the named color form is shorter.
	%
	% the hex form is always shorter than the rgb/rgba or hsl/hsla form

	if color == "none" || color == "transparent"
		outhex = string(color);
	else
		outhex = optimize_hex(clr2hex(color));
	end
end
function outhex = apply_hex_tfm(color, A, B)
	% apply the color transformation to a hex input color
	% returns a `string` object.

	if nargin < 2
		A = [255 255 255];
	end
	if nargin < 3
		B = [-1 -1 -1];
	end

	A = double(A);
	B = double(B);

	color = strip( char(color) );

	if ismember(strlength(color), [4 5])
		% 1. #RGB  -> #RRGGBB
		% 2. #RGBA -> #RRGGBBAA

		color = ['#' selfriffle( color(2:end) )];
	end

	if ~ismember(strlength(color), [7, 9])
		throw(MException("svg_color_tfm:invert_hex:argLength", "invalid hash RGB color `color`. must be either #RRGGBB or #RRGGBBAA at this point"))
	end

	outhex = arrayfun(@(i) str2double(['0x' color(2*i + [0 1])]), 1:3);
	outhex = uint8(A + B.*outhex); % clamp into [0, 255] and round
	outhex = "#" + sprintf("%02x", outhex);

	if strlength(color) ~= 7
		outhex = outhex + string(color(8:9));
	end

	outhex = optimize_hex(outhex);
end
function outhex = apply_color_tfm(color, A, B)
	% applies a transformation to an individual color.
	% A + B .* color, given the color as a string.
	% 
	% valid forms:
	%     hex code without hash (RGB, RGBA, RRGGBB, RRGGBBAA)
	%     hex code (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
	%     rgb(r, g, b)
	%     rgb(r%, g%, b%)
	%     rgba(r, g, b, a)
	%     rgba(r%, g%, b%, a)
	%     hsl(h, s%, l%)
	%     hsla(h, s%, l%, a)
	%     any valid named color
	%
	% the alpha value can always be either a number or percent.

	if nargin < 2
		A = [255 255 255];
	end
	if nargin < 3
		B = [-1 -1 -1];
	end

	if color == "none" || color == "transparent"
		outhex = string(color);
	else
		outhex = apply_hex_tfm(clr2hex(color), A, B);
	end
end

%%% main script functions

function content = look_for_bg_rect( ...
	options,                         ... struct
	width,                           ... string
	height,                          ... string
	svgEndIndex                      ... int
)
	% look for a background rectangle. if it
	% is found do nothing, otherwise add one.
	%
	% returns the updated content found at the options.content argument.
	%
	% technically, this can find a "background" rectangle midway through
	% the SVG, in which case, you would be covering up everything that
	% was previously drawn, which is stupid, and there might as well be
	% nothing before the background rectangle, unless they have events
	% or something more advanced like that.

	bgcolor = "#fff";
	bgFound = false;
	counter = 0;
	iend = svgEndIndex;
	content = options.content;

	while true
		stt = indexOf(content, "<rect", iend);

		if isempty(stt), break, end

		counter = counter + 1;

		iend = indexOf(content, ">", stt + 5);

		if options.verbose
			fprintf("\tfound background candidate %d at bytes %d-%d\n", counter, stt, iend);
		end

		rect = extractBetween(content, stt, iend);

		% TODO: make this match any number, and then test it externally.
			% in case there are discrepancies like "10" and "10.0" or something
		rectWidth = regexp(rect, "width\s*=\s*([""'])(?:100(?:\.0+)?%|" + width + ")\1", "once");
		rectHeight = regexp(rect, "height\s*=\s*([""'])(?:100(?:\.0+)?%|" + height + ")\1", "once");

		if ~isempty(rectWidth) && ~isempty(rectHeight)
			if options.verbose
				fprintf("\tbackground found. no insertion required.\n");
			end

			bgFound = true;
			break
		end
	end

	if options.verbose && ~bgFound
		fprintf("\tbackground not found. inserting one.\n");
	end

	if ~bgFound
		rectStr = "<rect width="""                                    ...
			+ ternary(strlength(num2str(width)) > 4, "100%", width)   ...
			+ """ height="""                                          ...
			+ ternary(strlength(num2str(height)) > 4, "100%", height) ...
			+ """ fill=""" + bgcolor + """/>";

		content = strinsert(content, rectStr, svgEndIndex + 1);
	end
end
function content = invert_stroke_colors(options)

	% invert all stroke colors in the SVG.
	% returns the new SVG content.

	counter = 0;
	iend = 1;
	content = options.content;

	while true
		stt = indexOf(content, "stroke=", iend);

		if isempty(stt), break, end

		counter = counter + 1;
		stt = stt + 7;

		if any(median([
				options.masks.maskRanges
				stt*ones(1, width(options.masks.maskRanges))
			]) == stt)

			% example:
			% s = stt
			% ranges == [
			%     a  c  e
			%     b  d  f
			% ]
			% tmp array == [
			%     a  c  e
			%     b  d  f
			%     s  s  s
			% ]
			% median(tmp array) == [x y z]
			% if x, y, or z is stt, then stt is in one of the ranges.
			% stt is in one of the ranges
			% if stt is in one of the mask ranges, then it should not be inverted.

			iend = stt; % stop an infinite loop
			continue
		end


		iend = indexOf(content, """", stt + 1);

		if options.verbose
			fprintf("\tfound stroke %d at bytes %d-%d\n", counter, stt, iend);
		end

		color = apply_color_tfm(extractBetween(content, stt + 1, iend - 1), ...
			options.A, options.B);

		content = extractBefore(content, stt + 1) + ...
			color + extractAfter(content, iend - 1);
	end

	if options.verbose && counter == 0
		fprintf("\tnone found\n");
	end
end
function content = invert_fill_colors(options)
	% invert all fill colors in the SVG.
	% returns the new SVG content

	counter = 0;
	iend = 1;
	content = options.content;

	while true
		stt = indexOf(content, "fill=", iend);

		if isempty(stt), break, end

		counter = counter + 1;
		stt = stt + 5;

		if any(median([
				options.masks.maskRanges
				stt*ones(1, width(options.masks.maskRanges))
			]) == stt)

			% look at the comment in the same spot of `invert_stroke_colors`
			% for why this is used here.

			iend = stt; % stop an infinite loop
			continue
		end

		iend = indexOf(content, """", stt + 1);

		if options.verbose
			fprintf("\tfound fill %d at bytes %d-%d\n", counter, stt, iend);
		end

		color = apply_color_tfm(                        ...
			extractBetween(content, stt + 1, iend - 1), ...
			options.A,                                  ...
			options.B                                   ...
		);

		content = extractBefore(content, stt + 1) + ...
			color + extractAfter(content, iend - 1);
	end

	if options.verbose && counter == 0
		fprintf("\tnone found\n");
	end
end
function maskdata = find_masks(options)
	% because of how image masks work, images used in masks don't
	% have to be inverted.
	%
	% returns the IDs of mask images that use `<use ...>`, the
	% indices of embedded <image> tags within `<mask>`, and the index
	% of the first image. this index may or may not be within a <mask>.
	%
	% Assumes all images used for masks (via <use>) are not used for
	% anything else. Technically they *can* be used for both, but I
	% don't think that is likely, so I don't care.

	% TODO: deal with masks that have stuff like <rect>, <circle>, etc.
		% find masks before everything else.
		% change the image indices to be mask index ranges.
		% don't invert the colors of anything in any of the ranges.

	content = options.content;
	iend = 1;
	counter = 0;
	stt = indexOf(content, "<image");
	firstImageIndex = stt;

	maskImageIds     = [];
	maskImageIndices = [];
	maskRanges       = [];

	% if there are no images, don't look for image masks.
	while ~isempty(stt)
		stt = indexOf(content, "<mask", iend);

		if isempty(stt), break, end

		counter = counter + 1;

		% 6 == "<mask>".length
		iend = indexOf(content, "</mask>", stt + 6);

		if options.verbose
			fprintf("\tfound mask %d at bytes %d-%d\n", counter, stt, iend);
		end


		maskRanges = [ maskRanges [stt; iend + 6] ];
		mask = extractBetween(content, stt, iend + 6);

		useMatches = regexp(mask,               ...
			"<use[^>]*(?:xlink:)?href\s*=\s*" + ...
			"(?<quote>[""'])"                 + ...
				"#(?<id>[^""'\s>]+)"          + ...
			"\k<quote>"                       + ...
			"[^>]*/?>", "tokens"                ...
		);
		useMatches = [useMatches{:}];
		maskImageIds = [maskImageIds, useMatches(2 : 2 : length(useMatches))];

		indices = regexp(mask,                     ...
			"<image[^>]*(?:xlink:)?href\s*=\s*"  + ...
			"(?<quote>[""'])"                    + ...
				"data:image/(?:png|jpe?g|webp);" + ...
				"base64,(?:[\da-zA-Z+/=]+)"      + ...
			"\k<quote>"                          + ...
			"[^>]*/?>"                             ...
		);
		maskImageIndices = [maskImageIndices, (stt - 1 + indices)];
	end

	if options.verbose && counter == 0
		fprintf("\tnone found\n");
	end

	maskdata = struct(                       ...
		"imageIds",        maskImageIds,     ...
		"imageIndices",    maskImageIndices, ...
		"firstImageIndex", firstImageIndex,  ...
		"maskRanges",      maskRanges        ...
	);
end
function content = invert_image_colors(options, keepIntermediateFiles)
	% inverts the colors of images embedded through <image> tags.
	% returns the new SVG content.

	% TODO: also work with images that use files for their colors?
	counter = 0;
	iend = options.masks.firstImageIndex;
	stt = iend;
	content = options.content;
	[imageMagickExists, ~] = system("magick --version");
	imageMagickExists = ~imageMagickExists;

	while ~isempty(stt)
		% I looked into vectorizing the embedded raster image, but I couldn't
		% find a single tool that does it well, even for a simple graph PNG.
		% maybe the PNG I had was just too low quality, but idk.

		stt = indexOf(content, "<image", iend);

		if isempty(stt), break, end
		counter = counter + 1;

		if ismember(stt, options.masks.imageIndices)
			iend = stt + 5;
			% the image is one of the embedded mask <image> tags
			continue
		end

		if ~imageMagickExists
			throw(MException("svg_color_tfm:invert_image_colors:missingDependency", "Required system program ImageMagick `magick` was not found. embedded images are left un-inverted."));
		end

		% 7 == strlength("<image/"). it can never be shorter than that.
		iend = indexOf(content, ">", stt + 7);

		if options.verbose
			fprintf("\tfound embedded image %d at bytes %d-%d\n", counter, stt, iend);
		end

		image = extractBetween(content, stt, iend);

		imageData = regexp(image,               ...
			"(?:xlink:)?href\s*=\s*"          + ...
			"(?<sttquote>[""'])data:image/"   + ...
			"(?<type>png|jpe?g|webp);base64," + ...
			"(?<base64>[\da-zA-Z+/=]+)"       + ...
			"(?<endquote>\k<sttquote>)",        ...
			"tokenExtents"                      ...
		);
		imageData = imageData{1}; % there should only be one

		imageType = extractBetween(image, imageData(2, 1), imageData(2, 2));
		base64 = extractBetween(image, imageData(3, 1), imageData(3, 2));

		% I have to do the extractAfter, because if I include the <quote>
		% group in the lookbehind, then the full regex won't match anything
		id = extractAfter(regexp(image,       ...
			"(?<=id\s*=\s*)(?<quote>[""'])" + ...
			"(?<id>[^""'\s>]+)(?=\k<quote>)", ...
			"match"                           ...
		), 1);

		if ismember(id, options.masks.imageIds)
			% the image is used in a <mask> tag
			continue
		end

		file = sprintf("./tmp-%d.%s", counter, imageType);

		fwriteFromBase64(file, base64);
		[~, ~] = system(sprintf("magick %s -negate %s", file, file));
		base64 = freadToBase64(file);

		if ~keepIntermediateFiles
			delete(file);
		end

		image = extractBefore(image, imageData(3, 1)) + base64 + ...
			extractAfter(image, imageData(3, 2));

		content = extractBefore(content, stt) + image + extractAfter(content, iend);

		% somehow, inverting the colors of a PNG can make the base64
		% version of it signifcantly shorter, so if you keep iend the
		% same, it you could completely miss the next <image> element
		iend = stt + 5;
	end


	if options.verbose && counter == 0
		fprintf("\tnone found\n");
	end
end
function content = optimize_paths(incontent)
	% It condenses and optimizes the paths descriptors for <path> tags.
	%
	% Here is a list of what it does, in order:
	%     1. condense spaces
	%     2. replace `l x 0` with `h x`
	%     3. replace `l 0 x` with `v x`
	%     4. remove `h 0`, `v 0`, and `m 0 0`
	%     5. replace things like `ZzZzz` or `zzzZzZ` with just the first `z` or `Z`.
	%     6. replace `h n h k` with `h (n+k)`, as long as their signs are the same.
	%         at this time, it also does the same thing with `v`.
	%     7. optimize consecutive `m` and `M` commands
	%         `m 1 2 m 3 4` -> `m 4 6`.
	%         `M 1 2 M 3 4` -> `M 3 4`.
	%     8. TODO: optimize consecutive `l` commands, but only if they are in the same direction.
	%     9. TODO: remove the `[mM]` in anything like `[mM] x y [zZ]`
	%     10. optimize backtracking. h4 h-2 h3 -> h5.
	%         however, something like `h4 h-5 h3` isn't entirely contained in
	%         the previous line, so it isn't really simplifiable.
	%         essentially look for `hA hB hC` where |A| > |B|, and sgn(A) = -sgn(B) = sgn(C)
	%         and replace it with `hA h (C-B)` which can be reduced further if |C| > |B| to
	%         `h (A - B + C)`, so there might need to be another step 6 after this, or this
	%         check can be added as a subset of this one.
	%         the same thing would work for `v` instead of `h`.
	%     11. do step 6 again.
	%
	% this function is made much longer due to the fact that regexprep
	% does not allow you to have a replacement function

	number = "-?(?:\d*\.)?\d+(?:e[+\-]?\d+)?";
	zero = "-?(?:0*\.)?0+(?:e[+\-]?\d+)?";

	content = incontent;

	% 1. condense spaces
		% `h 1 z v 2 l 2 3 L 1 -1` -> `h1zv2l2 3L1-1`
	pattern = "d\s*=\s*(['""])(?<path>[^'""]*)\1";
	indices = regexp(content, pattern);
	matches = regexp(content, pattern, "tokens");
	matches = [
		regexp(content, pattern, "match")
		reshape([matches{:}], 2, length(matches), [])
	]';

	for i = length(indices) : -1 : 1
		index = indices(i);
		path = matches(i, 3);
		path = regexprep(path, "[\s,]+", " ");
		path = regexprep(path, "(?<!\d)\s|\s(?!\d)", "");
		repl = "d=""" + path + """";

		endindex = index + strlength(matches(i, 1)) - 1;
		content = extractBefore(content, index) + repl + extractAfter(content, endindex);
	end

	% 2. replace `l x 0` with `h x`
	content = regexprep(content, "l(" + number + ") " + zero + "(?![\d\.])", "h$1");

	% 3. replace `l 0 x` with `v x`
	content = regexprep(content, "l" + zero + "([ -]" + number + ")", "v$1");
	content = regexprep(content, "v (" + number + ")", "v$1");

	% 4. remove `h 0`, `v 0`, and `m 0 0`
	content = regexprep(content, "h" + zero + "(?![\d\.])", "");
	content = regexprep(content, "v" + zero + "(?![\d\.])", "");
	content = regexprep(content, "m" + zero + " " + zero + "(?![\d\.])", "");

	% 5. optimize consecutive `z` and `Z` commands.
	content = regexprep(content, "(z)z+", "$1", "ignorecase");

	% 6. combine consecutive `h` and `v` commands
		% `h2 h2 h-2 h2` -> `h4h-2h2`. this could just be h4 though
		% `v-2 v-2 v-2 v-2` -> `v-8`
	pattern = "(?<type>[hv])(?<n1>" + number + ")\k<type>(?<n2>" + number + ")";
	while true
		cont = false; % continue

		indices = regexp(content, pattern);
		if isempty(indices), break, end % avoid error on reshape
		matches = regexp(content, pattern, "tokens");
		matches = [
			regexp(content, pattern, "match")
			reshape([matches{:}], 3, length(matches), [])
		]';

		for i = length(indices) : -1 : 1
			index = indices(i);
			type = matches(i, 2);
			n1 = str2double(matches(i, 3));
			n2 = str2double(matches(i, 4));

			if sign(n1) == sign(n2)
				cont = true;

				repl = type + string(n1 + n2);
			else
				repl = matches(i, 1);
			end

			endindex = index + strlength(matches(i, 1)) - 1;
			content = extractBefore(content, index) + repl + extractAfter(content, endindex);
		end

		if ~cont
			break
		end
	end

	% 7. optimize consecutive `m` and `M` commands
		% `m 1 2 m 3 4` -> `m 4 6`.
		% `M 1 2 M 3 4` -> `M 3 4`.
	pattern = "(?<type>[mM])(?<n1>" + number + ") ?(?<n1>" + number + ...
		")\k<type>(?<n3>" + number + ") ?(?<n4>" + number + ")";
	while true
		cont = false; % continue

		indices = regexp(content, pattern);
		if isempty(indices), break, end % avoid error on reshape
		matches = regexp(content, pattern, "tokens");
		matches = [
			regexp(content, pattern, "match")
			reshape([matches{:}], 5, length(matches), [])
		]';

		for i = length(indices) : -1 : 1
			index = indices(i);
			type = matches(i, 2);
			n1 = str2double(matches(i, 3));
			n2 = str2double(matches(i, 4));
			n3 = str2double(matches(i, 5));
			n4 = str2double(matches(i, 6));

			cont = true;
			if type == "m"
				repl = string(n2 + n4);

				if n2 + n4 >= 0, repl = " " + repl; end
				repl = "m" + string(n1 + n3) + repl;
			else
				repl = string(n4);

				if n4 >= 0, repl = " " + repl; end
				repl = "M" + string(n3) + repl;
			end

			endindex = index + strlength(matches(i, 1)) - 1;
			content = extractBefore(content, index) + repl + extractAfter(content, endindex);
		end

		if ~cont
			break
		end
	end

	% 8. TODO: optimize consecutive `l` commands, but only if they have the same slope.
	% 9. TODO: remove anything like `[mM] x y [zZ]`

	% 10. optimize backtracking.
		% `h3 h-2 h3` -> `h4`
		% `h3 h-2 h1` -> `h3h-1`
	pattern = "(?<type>[hv])(?<n1>" + number + ")\k<type>(?<n2>" + number + ")\k<type>(?<n3>" + number + ")";
	while true
		cont = false; % continue

		indices = regexp(content, pattern);
		if isempty(indices), break, end % avoid error on reshape
		matches = regexp(content, pattern, "tokens");
		matches = [
			regexp(content, pattern, "match")
			reshape([matches{:}], 4, length(matches), [])
		]';

		for i = length(indices) : -1 : 1
			index = indices(i);
			type = matches(i, 2);
			n1 = str2double(matches(i, 3));
			n2 = str2double(matches(i, 4));
			n3 = str2double(matches(i, 5));

			if sign(n1) == sign(n3) && sign(n1) == -sign(n2) && abs(n2) < abs(n1)
				cont = true;
				if abs(n2) < abs(n3)
					repl = type + string(n1 + n2 + n3);
				else
					repl = type + string(n1) + type + string(n2 + n3);
				end
			else
				repl = matches(i, 1);
			end

			endindex = index + strlength(matches(i, 1)) - 1;
			content = extractBefore(content, index) + repl + extractAfter(content, endindex);
		end

		if ~cont
			break
		end
	end

	% TODO: fix <path d="h 4 h -2 h 1 h -1"/>
		% it returns <path d="h4h-1h-1"/>
		% when it should return <path d="h4h-2"/>
		% doing step 6 again doesn't work because it just matches `h4h-1`
		% and decides it can't do anything. so I might have to go back to
		% where it is split up for positive and negative [hv] in step 6.
		% but then put back a redo on step 6 for step 11.
end
function print_help
	fprintf("valid named arguments (case insensitive):\n");

	fprintf("\t""in"", ""infile""\n");
	fprintf("\t\tthe input file path. either string or char.\n");
	fprintf("\t\tif you pass more than one (i.e. string matrix), it will break.\n");
	fprintf("\t\tan error is thrown if it isn't a char or string.\n");
	fprintf("\t\tdefaults to ""./in.svg"".\n");

	fprintf("\t""out"", ""outfile""\n");
	fprintf("\t\tthe output file path. either string or char.\n");
	fprintf("\t\tif you pass more than one (i.e. string matrix), it will break.\n");
	fprintf("\t\tuse ""-"" for stdout, ""--"" for stderr, or ""---"" for nowhere.\n");
	fprintf("\t\twhen using ""---"", you can still get the svg content if nargout > 0.\n");
	fprintf("\t\tdefaults to the input file.\n");

	fprintf("\t""verbose""\n");
	fprintf("\t\twhether or not to give extra information through the console. should be a boolean.\n");
	fprintf("\t\tif you pass more than one (i.e. boolean matrix), it will break.\n");
	fprintf("\t\tan error is thrown if it isn't a boolean.\n");
	fprintf("\t\tdefaults to true.\n");

	fprintf("\t""transformMatrix"", ""transform"", ""tfmat"", ""tfm"", ""M""\n");
	fprintf("\t\tshould be a 2x3 double matrix. anything else will throw an error.\n");
	fprintf("\t\tthe top row is A and the bottom row is B.\n");
	fprintf("\t\tthe color transformation is: outRGB = A + B .* inRGB.\n");
	fprintf("\t\tdefaults to [255 255 255; -1 -1 -1] (color inversion).\n");

	fprintf("\t""A""\n");
	fprintf("\t\tshould be a 1x3 double matrix. anything else will throw an error.\n");
	fprintf("\t\tonly updates the top row of the transformation matrix.\n");

	fprintf("\t""B""\n");
	fprintf("\t\tshould be a 1x3 double matrix. anything else will throw an error.\n");
	fprintf("\t\tonly updates the bottom row of the transformation matrix.\n");

	fprintf("\t""keepIntermediateFiles"", ""keepIntermediate"", ""keepInt"", ""keep""\n");
	fprintf("\t\twhether or not to keep temporary image files. should be a boolean.\n");
	fprintf("\t\tif you pass more than one (i.e. boolean matrix), it will break.\n");
	fprintf("\t\tthe only intermediate images will be ones in <image> tags outside of <mask> tags.\n");
	fprintf("\t\tdefaults to false.\n");

	fprintf("\t""backgroundColor"", ""bgcolor""\n");
	fprintf("\t\tshould be a string or char, and a valid color.\n");
	fprintf("\t\tif bgcolor is ""none"", then background rectangle checking is skipped\n");
	fprintf("\t\tthe assumed background color before the transformation\n");
	fprintf("\t\tdefaults to ""#fff""\n");

	fprintf("\t""content""\n");
	fprintf("\t\tshould be a string or char.\n");
	fprintf("\t\tif both ""content"" and ""infile"" are given, the direct content is used.\n");
	fprintf("\t\tanother option instead of infile.\n");
	fprintf("\t\tdefaults to missing\n");

	fprintf("\t""help"", ""options"", ""-h"", ""-?"", ""-help"", ""--help""\n");
	fprintf("\t\tprints this help text.\n");
	fprintf("\t\tdoes not require a value after it.\n");

	fprintf("\n");
	fprintf("if no arguments are given, this help text is printed.\n");
	fprintf("non-string arguments that are not values for other named arguments are ignored.\n");
	fprintf("if an unrecognized named argument is given, an error is thrown.\n");
	fprintf("run `help svg_color_tfm` for more information.\n");
end
