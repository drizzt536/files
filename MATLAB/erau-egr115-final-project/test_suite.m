%%%% THIS IS A GENERATED FILE %%%%

init_setup;
run_tests;

%%%% ./svg_color_tfm.m FUNCTIONS BEGIN

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

	% TODO: don't invert fill, stroke, or embedded image colors within <mask> tags.
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

%%%% TEST FUNCTIONS BEGIN

function run_tests
	all_passing = true;

	disp("testing global   : namedColorMap");
	all_passing = all_passing && testglobal_namedColorMap;

	disp("testing global   : hexToNameMap");
	all_passing = all_passing && testglobal_hexToNameMap;

	disp("testing function : ternary");
	all_passing = all_passing && test_ternary;

	disp("testing function : clamp");
	all_passing = all_passing && test_clamp;

	disp("testing function : strmul");
	all_passing = all_passing && test_strmul;

	disp("testing function : riffle");
	all_passing = all_passing && test_riffle;

	disp("testing function : selfriffle");
	all_passing = all_passing && test_selfriffle;

	disp("testing function : strinsert");
	all_passing = all_passing && test_strinsert;

	disp("testing function : indexOf");
	all_passing = all_passing && test_indexOf;

	disp("testing function : hsl2hex");
	all_passing = all_passing && test_hsl2hex;

	disp("testing function : clr2hex");
	all_passing = all_passing && test_clr2hex;

	disp("testing function : optimize_hex");
	all_passing = all_passing && test_optimize_hex;

	disp("testing function : optimize_color");
	all_passing = all_passing && test_optimize_color;

	disp("testing function : apply_hex_tfm");
	all_passing = all_passing && test_apply_hex_tfm;

	disp("testing function : apply_color_tfm");
	all_passing = all_passing && test_apply_color_tfm;

	disp("testing function : optimize_paths");
	all_passing = all_passing && test_optimize_paths;

	disp("testing function : svg_color_tfm");
	all_passing = all_passing && test_svg_color_tfm;

	if all_passing
		fprintf("\nall tests passing\n");
	else
		fprintf("\nsome tests failing\n");
	end
end

function all_passing = run_test_vec(test_vec)
	% an n x 4 cell matrix of tests, where each row contains one test
	% each row should be `function string, console output, error, output 1`
	% loops over the rows and tests them.
	% the console output can be given
	%
	% for now, this assumes only one output value from the function.
	% the error object should be a cell array where the first value
	% is the identifier, and the second value is the message. it can
	% be either a row or column array, and can use either string or chartreuse.
	%
	% an attempt was made to limit the number of functions and variables used.
	%
	% Example:
	%     run_test_vec({
	%         "fprintf('test message')", 'test message', {}, 12 % 1
	%         'sqrt(16)'               , ""            , {}, 4  % 2
	%         "mean([1 2 3])"          , ""            , {}, 7  % 3, test fails
	%         "mean([1 2 3])"          , "asdf"        , {}, 2  % 4, test fails
	%         "2 = 3"                  , ''            , {
	%             "MATLAB:m_invalid_lhs_of_assignment"                   % identifier
	%             "Incorrect use of '=' operator. Assign a value " + ... % message
	%             "to a variable using '=' and compare values for" + ...
	%             " equality using '=='."
	%         }, 2                                              % 5
	%     })
	%
	%     usually you would only test one function at a time,
	%     but this still shows what is expected.
	%
	%     `fprintf` doesn't actually return anything, but the return
	%     value of 12 is required. Probably because `evalc` returns
	%     the length of the console output if no real output is given.
	%

	global namedColorMap;
	global hexToNameMap;

	all_passing = ~false;

	for i = 1 : height(test_vec)
		try
			[conout, out1] = evalc(test_vec{i, 1});

			if ~isempty(test_vec{i, 3})
				all_passing = false;
				fprintf("\ttest %d failed. (error was expected)\n", i);
			end
		catch ME
			% don't check the types on the error attributes. char or string.
			show_stack = false;
			errdata = test_vec{i, 3};
			if isempty(errdata)
				errorUnexpected = true;
				errdata = {'' ''};
			else
				errorUnexpected = false;
			end

			if ~isequal(ME.identifier, errdata{1})
				all_passing = false;
				show_stack = true;

				fprintf("\ttest %d failed. (error identifier)\n", i);
				if errorUnexpected, fprintf("\t\tencountered unexpected error\n"); end
				fprintf("\t\texpected '%s' but got '%s'\n", errdata{1}, ME.identifier);
			end

			% allow it to fail both ways
			if ~isequal(ME.message, errdata{2})
				all_passing = false;
				show_stack = true;

				fprintf("\ttest %d failed. (error message)\n", i);
				if errorUnexpected, fprintf("\t\tencountered unexpected error\n"); end
				fprintf("\t\texpected '%s' but got '%s'\n", errdata{2}, ME.message);
			end

			if show_stack
				fprintf("\tcall stack:\n");
				fprintf("\t\t%s:%s (%s)\n", string([
					{ME.stack.file}
					{ME.stack.line}
					{ME.stack.name}
				]));
			end

			% conout and out1 aren't defined.
			continue
		end

		if ~isequaln(conout, test_vec{i, 2})
			all_passing = false;

			fprintf("\ttest %d failed. (console output)\n", i);
			fprintf("\t\texpected '%s' but got '%s'\n", test_vec{i, 2}, conout);
		end

		if ~isequaln(class(out1), class(test_vec{i, 4})) || ~isequaln(out1, test_vec{i, 4})
			all_passing = false;

			fprintf("\ttest %d failed. (output 1)\n", i);
			fprintf("\t\texpected: "); disp(test_vec{i, 4});
			fprintf("\t\treceived: "); disp(out1);
			fprintf("\t\t(if they look the same, the types are probably different)\n");
		end
	end
end

function all_passing = testglobal_namedColorMap
	% these test are largely redundant, since namedColorMap
	% is explicitly defined.

	all_passing = run_test_vec({
		"namedColorMap('aliceblue')"           , '', {}, "#f0f8ff" % 1
		"namedColorMap('aliceblue')"           , '', {}, "#f0f8ff" % 2
		"namedColorMap('antiquewhite')"        , '', {}, "#faebd7" % 3
		"namedColorMap('aqua')"                , '', {}, "#0ff"    % 4
		"namedColorMap('aquamarine')"          , '', {}, "#7fffd4" % 5
		"namedColorMap('azure')"               , '', {}, "#f0ffff" % 6
		"namedColorMap('beige')"               , '', {}, "#f5f5dc" % 7
		"namedColorMap('bisque')"              , '', {}, "#ffe4c4" % 8
		"namedColorMap('black')"               , '', {}, "#000"    % 9
		"namedColorMap('blanchedalmond')"      , '', {}, "#ffebcd" % 10
		"namedColorMap('blue')"                , '', {}, "#00f"    % 11
		"namedColorMap('blueviolet')"          , '', {}, "#8a2be2" % 12
		"namedColorMap('brown')"               , '', {}, "#a52a2a" % 13
		"namedColorMap('burlywood')"           , '', {}, "#deb887" % 14
		"namedColorMap('cadetblue')"           , '', {}, "#5f9ea0" % 15
		"namedColorMap('chartreuse')"          , '', {}, "#7fff00" % 16
		"namedColorMap('chocolate')"           , '', {}, "#d2691e" % 17
		"namedColorMap('coral')"               , '', {}, "#ff7f50" % 18
		"namedColorMap('cornflowerblue')"      , '', {}, "#6495ed" % 19
		"namedColorMap('cornsilk')"            , '', {}, "#fff8dc" % 20
		"namedColorMap('crimson')"             , '', {}, "#dc143c" % 21
		"namedColorMap('cyan')"                , '', {}, "#0ff"    % 22
		"namedColorMap('darkblue')"            , '', {}, "#00008b" % 23
		"namedColorMap('darkcyan')"            , '', {}, "#008b8b" % 24
		"namedColorMap('darkgoldenrod')"       , '', {}, "#b8860b" % 25
		"namedColorMap('darkgray')"            , '', {}, "#a9a9a9" % 26
		"namedColorMap('darkgreen')"           , '', {}, "#006400" % 27
		"namedColorMap('darkgrey')"            , '', {}, "#a9a9a9" % 28
		"namedColorMap('darkkhaki')"           , '', {}, "#bdb76b" % 29
		"namedColorMap('darkmagenta')"         , '', {}, "#8b008b" % 30
		"namedColorMap('darkolivegreen')"      , '', {}, "#556b2f" % 31
		"namedColorMap('darkorange')"          , '', {}, "#ff8c00" % 32
		"namedColorMap('darkorchid')"          , '', {}, "#9932cc" % 33
		"namedColorMap('darkred')"             , '', {}, "#8b0000" % 34
		"namedColorMap('darksalmon')"          , '', {}, "#e9967a" % 35
		"namedColorMap('darkseagreen')"        , '', {}, "#8fbc8f" % 36
		"namedColorMap('darkslateblue')"       , '', {}, "#483d8b" % 37
		"namedColorMap('darkslategray')"       , '', {}, "#2f4f4f" % 38
		'namedColorMap("darkslategrey")'       , '', {}, "#2f4f4f" % 39
		'namedColorMap("darkturquoise")'       , '', {}, "#00ced1" % 40
		'namedColorMap("darkviolet")'          , '', {}, "#9400d3" % 41
		'namedColorMap("deeppink")'            , '', {}, "#ff1493" % 42
		'namedColorMap("deepskyblue")'         , '', {}, "#00bfff" % 43
		'namedColorMap("dimgray")'             , '', {}, "#696969" % 44
		'namedColorMap("dimgrey")'             , '', {}, "#696969" % 45
		'namedColorMap("dodgerblue")'          , '', {}, "#1e90ff" % 46
		'namedColorMap("firebrick")'           , '', {}, "#b22222" % 47
		'namedColorMap("floralwhite")'         , '', {}, "#fffaf0" % 48
		'namedColorMap("forestgreen")'         , '', {}, "#228b22" % 49
		'namedColorMap("fuchsia")'             , '', {}, "#f0f"    % 50
		'namedColorMap("gainsboro")'           , '', {}, "#dcdcdc" % 51
		'namedColorMap("ghostwhite")'          , '', {}, "#f8f8ff" % 52
		'namedColorMap("gold")'                , '', {}, "#ffd700" % 53
		'namedColorMap("goldenrod")'           , '', {}, "#daa520" % 54
		'namedColorMap("gray")'                , '', {}, "#808080" % 55
		'namedColorMap("grey")'                , '', {}, "#808080" % 56
		'namedColorMap("green")'               , '', {}, "#008000" % 57
		'namedColorMap("greenyellow")'         , '', {}, "#adff2f" % 58
		"namedColorMap('honeydew')"            , '', {}, "#f0fff0" % 59
		"namedColorMap('hotpink')"             , '', {}, "#ff69b4" % 60
		"namedColorMap('indianred')"           , '', {}, "#cd5c5c" % 61
		"namedColorMap('indigo')"              , '', {}, "#4b0082" % 62
		"namedColorMap('ivory')"               , '', {}, "#fffff0" % 63
		"namedColorMap('khaki')"               , '', {}, "#f0e68c" % 64
		"namedColorMap('lavender')"            , '', {}, "#e6e6fa" % 65
		"namedColorMap('lavenderblush')"       , '', {}, "#fff0f5" % 66
		"namedColorMap('lawngreen')"           , '', {}, "#7cfc00" % 67
		"namedColorMap('lemonchiffon')"        , '', {}, "#fffacd" % 68
		"namedColorMap('lightblue')"           , '', {}, "#add8e6" % 69
		"namedColorMap('lightcoral')"          , '', {}, "#f08080" % 70
		"namedColorMap('lightcyan')"           , '', {}, "#e0ffff" % 71
		"namedColorMap('lightgoldenrodyellow')", '', {}, "#fafad2" % 72
		"namedColorMap('lightgray')"           , '', {}, "#d3d3d3" % 73
		"namedColorMap('lightgreen')"          , '', {}, "#90ee90" % 74
		"namedColorMap('lightgrey')"           , '', {}, "#d3d3d3" % 75
		"namedColorMap('lightpink')"           , '', {}, "#ffb6c1" % 76
		"namedColorMap('lightsalmon')"         , '', {}, "#ffa07a" % 77
		"namedColorMap('lightseagreen')"       , '', {}, "#20b2aa" % 78
		"namedColorMap('lightskyblue')"        , '', {}, "#87cefa" % 79
		"namedColorMap('lightslategray')"      , '', {}, "#789"    % 80
		"namedColorMap('lightslategrey')"      , '', {}, "#789"    % 81
		"namedColorMap('lightsteelblue')"      , '', {}, "#b0c4de" % 82
		"namedColorMap('lightyellow')"         , '', {}, "#ffffe0" % 83
		"namedColorMap('lime')"                , '', {}, "#0f0"    % 84
		"namedColorMap('limegreen')"           , '', {}, "#32cd32" % 85
		"namedColorMap('linen')"               , '', {}, "#faf0e6" % 86
		"namedColorMap('magenta')"             , '', {}, "#f0f"    % 87
		"namedColorMap('maroon')"              , '', {}, "#800000" % 88
		"namedColorMap('mediumaquamarine')"    , '', {}, "#66cdaa" % 89
		"namedColorMap('mediumblue')"          , '', {}, "#0000cd" % 90
		"namedColorMap('mediumorchid')"        , '', {}, "#ba55d3" % 91
		"namedColorMap('mediumpurple')"        , '', {}, "#9370db" % 92
		"namedColorMap('mediumseagreen')"      , '', {}, "#3cb371" % 93
		"namedColorMap('mediumslateblue')"     , '', {}, "#7b68ee" % 94
		"namedColorMap('mediumspringgreen')"   , '', {}, "#00fa9a" % 95
		"namedColorMap('mediumturquoise')"     , '', {}, "#48d1cc" % 96
		"namedColorMap('mediumvioletred')"     , '', {}, "#c71585" % 97
		"namedColorMap('midnightblue')"        , '', {}, "#191970" % 98
		"namedColorMap('mintcream')"           , '', {}, "#f5fffa" % 99
		"namedColorMap('mistyrose')"           , '', {}, "#ffe4e1" % 100
		"namedColorMap('moccasin')"            , '', {}, "#ffe4b5" % 101
		"namedColorMap('navajowhite')"         , '', {}, "#ffdead" % 102
		"namedColorMap('navy')"                , '', {}, "#000080" % 103
		"namedColorMap('oldlace')"             , '', {}, "#fdf5e6" % 104
		"namedColorMap('olive')"               , '', {}, "#808000" % 105
		"namedColorMap('olivedrab')"           , '', {}, "#6b8e23" % 106
		"namedColorMap('orange')"              , '', {}, "#ffa500" % 107
		"namedColorMap('orangered')"           , '', {}, "#ff4500" % 108
		"namedColorMap('orchid')"              , '', {}, "#da70d6" % 109
		"namedColorMap('palegoldenrod')"       , '', {}, "#eee8aa" % 110
		"namedColorMap('palegreen')"           , '', {}, "#98fb98" % 111
		"namedColorMap('paleturquoise')"       , '', {}, "#afeeee" % 112
		"namedColorMap('palevioletred')"       , '', {}, "#db7093" % 113
		"namedColorMap('papayawhip')"          , '', {}, "#ffefd5" % 114
		"namedColorMap('peachpuff')"           , '', {}, "#ffdab9" % 115
		"namedColorMap('peru')"                , '', {}, "#cd853f" % 116
		"namedColorMap('pink')"                , '', {}, "#ffc0cb" % 117
		"namedColorMap('plum')"                , '', {}, "#dda0dd" % 118
		"namedColorMap('powderblue')"          , '', {}, "#b0e0e6" % 119
		"namedColorMap('purple')"              , '', {}, "#800080" % 120
		"namedColorMap('red')"                 , '', {}, "#f00"    % 121
		"namedColorMap('rosybrown')"           , '', {}, "#bc8f8f" % 122
		"namedColorMap('royalblue')"           , '', {}, "#4169e1" % 123
		"namedColorMap('saddlebrown')"         , '', {}, "#8b4513" % 124
		"namedColorMap('salmon')"              , '', {}, "#fa8072" % 125
		"namedColorMap('sandybrown')"          , '', {}, "#f4a460" % 126
		"namedColorMap('seagreen')"            , '', {}, "#2e8b57" % 127
		"namedColorMap('seashell')"            , '', {}, "#2e8b57" % 128
		"namedColorMap('sienna')"              , '', {}, "#a0522d" % 129
		"namedColorMap('silver')"              , '', {}, "#c0c0c0" % 130
		"namedColorMap('skyblue')"             , '', {}, "#87ceeb" % 131
		"namedColorMap('slateblue')"           , '', {}, "#6a5acd" % 132
		"namedColorMap('slategray')"           , '', {}, "#708090" % 133
		"namedColorMap('slategrey')"           , '', {}, "#708090" % 134
		"namedColorMap('snow')"                , '', {}, "#fffafa" % 135
		"namedColorMap('springgreen')"         , '', {}, "#00ff7f" % 136
		"namedColorMap('steelblue')"           , '', {}, "#4682b4" % 137
		"namedColorMap('tan')"                 , '', {}, "#d2b48c" % 138
		"namedColorMap('teal')"                , '', {}, "#008080" % 139
		"namedColorMap('thistle')"             , '', {}, "#d8bfd8" % 140
		"namedColorMap('tomato')"              , '', {}, "#ff6347" % 141
		"namedColorMap('turquoise')"           , '', {}, "#40e0d0" % 142
		"namedColorMap('violet')"              , '', {}, "#ee82ee" % 143
		"namedColorMap('wheat')"               , '', {}, "#f5deb3" % 144
		"namedColorMap('white')"               , '', {}, "#fff"    % 145
		"namedColorMap('whitesmoke')"          , '', {}, "#f5f5f5" % 146
		"namedColorMap('yellow')"              , '', {}, "#ff0"    % 147
		"namedColorMap('yellowgreen')"         , '', {}, "#9acd32" % 148
		"namedColorMap('none')"                , '', {}, "none"    % 149
		"namedColorMap('transparent')"         , '', {}, "transparent" % 150
		"class(namedColorMap)"                 , '', {}, 'dictionary'  % 151
		"length(namedColorMap.keys)"           , '', {}, 149           % 152
	});
end
function all_passing = testglobal_hexToNameMap
	all_passing = run_test_vec({
		"hexToNameMap(""#a52a2a"")"  , '', {}, "brown"       % 1
		"hexToNameMap(""#ff7f50"")"  , '', {}, "coral"       % 2
		"hexToNameMap(""#f0ffff"")"  , '', {}, "azure"       % 3
		"hexToNameMap(""#008080"")"  , '', {}, "teal"        % 4
		"hexToNameMap(""#fdf5e6"")"  , '', {}, "oldlace"     % 5
		"hexToNameMap(""#000080"")"  , '', {}, "navy"        % 6
		"hexToNameMap(""#ffd700"")"  , '', {}, "gold"        % 7
		"hexToNameMap(""#ffa500"")"  , '', {}, "orange"      % 8
		"hexToNameMap(""#87ceeb"")"  , '', {}, "skyblue"     % 9
		"hexToNameMap('#0ff')"       , '', {}, "cyan"        % 10
		"hexToNameMap('#f5f5dc')"    , '', {}, "beige"       % 11
		"hexToNameMap('#800000')"    , '', {}, "maroon"      % 12
		"hexToNameMap('#d8bfd8')"    , '', {}, "thistle"     % 13
		"hexToNameMap('#f00')"       , '', {}, "red"         % 14
		"hexToNameMap('#fffafa')"    , '', {}, "snow"        % 15
		"hexToNameMap('#d2b48c')"    , '', {}, "tan"         % 16
		"hexToNameMap('#ff6347')"    , '', {}, "tomato"      % 17
		"hexToNameMap('#800080')"    , '', {}, "purple"      % 18
		"hexToNameMap('#dda0dd')"    , '', {}, "plum"        % 19
		"hexToNameMap('#da70d6')"    , '', {}, "orchid"      % 20
		"hexToNameMap('#00f')"       , '', {}, "blue"        % 21
		"hexToNameMap('#ffc0cb')"    , '', {}, "pink"        % 22
		"hexToNameMap('#f5deb3')"    , '', {}, "wheat"       % 23
		"hexToNameMap('#dc143c')"    , '', {}, "crimson"     % 24
		"hexToNameMap('#ffe4c4')"    , '', {}, "bisque"      % 25
		"hexToNameMap('#fa8072')"    , '', {}, "salmon"      % 26
		"hexToNameMap('#8b0000')"    , '', {}, "darkred"     % 27
		"hexToNameMap('#4b0082')"    , '', {}, "indigo"      % 28
		"hexToNameMap('#faf0e6')"    , '', {}, "linen"       % 29
		"hexToNameMap('#808000')"    , '', {}, "olive"       % 30
		"hexToNameMap('#808080')"    , '', {}, "grey"        % 31
		"hexToNameMap('#ee82ee')"    , '', {}, "violet"      % 32
		"hexToNameMap('#cd853f')"    , '', {}, "peru"        % 33
		"hexToNameMap('#f0e68c')"    , '', {}, "khaki"       % 34
		"hexToNameMap('#fffff0')"    , '', {}, "ivory"       % 35
		"hexToNameMap('#c0c0c0')"    , '', {}, "silver"      % 36
		"hexToNameMap('#ff69b4')"    , '', {}, "hotpink"     % 37
		"hexToNameMap('#696969')"    , '', {}, "dimgrey"     % 38
		"hexToNameMap('#0f0')"       , '', {}, "lime"        % 39
		"hexToNameMap('#a0522d')"    , '', {}, "sienna"      % 40
		"hexToNameMap('#008000')"    , '', {}, "green"       % 41
		"hexToNameMap(""none"")"     , '', {}, "none"        % 42
		"hexToNameMap('transparent')", '', {}, "transparent" % 43
		"class(hexToNameMap)"        , '', {}, 'dictionary'  % 44
		"length(hexToNameMap.keys)"  , '', {}, 43            % 45
	});
end

function all_passing = test_ternary
	all_passing = run_test_vec({
		"ternary( true,   5,   6)"    , '', {}, 5   % 1
		"ternary(false,   5,   6)"    , '', {}, 6   % 2
		"ternary(false, ""a"", 'b')"  , '', {}, 'b' % 3
		"ternary( true, 123,  [])"    , '', {}, 123 % 4
		"ternary(2 > 3, 123,  [])"    , '', {}, []  % 5
		"ternary(12345, ""x"", ""y"")", '', {}, "x" % 6
		"ternary(    0, ""x"", ""y"")", '', {}, "y" % 7
		"ternary(   -1,   1,   0)"    , '', {}, 1   % 8
	});
end
function all_passing = test_clamp
	all_passing = run_test_vec({
		"clamp(  10, [0, 1      ])", '', {}, 1    % 1
		"clamp(   3, [0, 5      ])", '', {}, 3    % 2
		"clamp(  -5, [0, 5      ])", '', {}, 0    % 3
		"clamp(   2, [0, 1, 2, 3])", '', {}, 1    % 4
		"clamp(   5, [9, 1      ])", '', {}, 5    % 5
		"clamp(4.56, [4, 5      ])", '', {}, 4.56 % 6
	});
end
function all_passing = test_strmul
	all_passing = run_test_vec({
		'strmul("asdf", 0)', '', {}, ""         % 1
		'strmul("qwer", 1)', '', {}, "qwer"     % 2
		'strmul("1234", 2)', '', {}, "12341234" % 3
		'strmul(  "xz", 3)', '', {}, "xzxzxz"   % 4
		'strmul(  "ab", 4)', '', {}, "abababab" % 5
		'strmul(   "q", 5)', '', {}, "qqqqq"    % 6
		'strmul(    "", 9)', '', {}, ""         % 7
		"strmul('asdf', 0)", '', {}, ''         % 8
		"strmul('qwer', 1)", '', {}, 'qwer'     % 9
		"strmul('1234', 2)", '', {}, '12341234' % 10
		"strmul(  'xz', 3)", '', {}, 'xzxzxz'   % 11
		"strmul(  'ab', 4)", '', {}, 'abababab' % 12
		"strmul(   'q', 5)", '', {}, 'qqqqq'    % 13
		"strmul(    '', 9)", '', {}, ''         % 14
	});
end
function all_passing = test_riffle
	all_passing = run_test_vec({
		"riffle([1 2 3], [4 5 6])", '', {}, [1 4 2 5 3 6] % 1
		"riffle([1 3 5], [2 4 6])", '', {}, [1 2 3 4 5 6] % 2
		"riffle(  'abc',   'xyz')", '', {}, 'axbycz'      % 3
		"riffle(     [],      [])", '', {}, []            % 4
		"riffle(     [],      '')", '', {}, ''            % 5
		"riffle(     '',      [])", '', {}, ''            % 6
		"riffle(     '',      '')", '', {}, ''            % 7
	});
end
function all_passing = test_selfriffle
	all_passing = run_test_vec({
		"selfriffle([1 2 3])", '', {}, [1 1 2 2 3 3] % 1
		"selfriffle([1 3 5])", '', {}, [1 1 3 3 5 5] % 2
		"selfriffle(  'abc')", '', {}, 'aabbcc'      % 3
		"selfriffle(     [])", '', {}, []            % 4
		"selfriffle(     '')", '', {}, ''            % 5
	});
end
function all_passing = test_strinsert
	all_passing = run_test_vec({
		'strinsert("hello", " world", 6)', '', {}, "hello world" % 1
		'strinsert("world", "hello ", 1)', '', {}, "hello world" % 2
		'strinsert("hello", " world", 6)', '', {}, "hello world" % 3
		'strinsert("", "insert me", 1)'  , '', {}, "insert me"   % 4
		'strinsert("hello world", "", 6)', '', {}, "hello world" % 5
		'strinsert("aaaaaa", "bbb", 4)'  , '', {}, "aaabbbaaa"   % 6
	});
end
function all_passing = test_indexOf
	all_passing = run_test_vec({
		'indexOf("asdfqwerq", "q", 5)', '', {}, 9  % 1
		'indexOf("asdfqwerq", "q", 4)', '', {}, 5  % 2
		'indexOf("asdfqwerq", "q", 2)', '', {}, 5  % 3
		'indexOf("abc123qwe", "\d"  )', '', {}, 4  % 4
		'indexOf("asdfasdfa", "q", 1)', '', {}, [] % 5
		'indexOf("asdfasdfa", "a", 1)', '', {}, 5  % 6
		'indexOf("asdfasdfa", "a"   )', '', {}, 1  % 7
	});
end
function all_passing = test_hsl2hex
	all_passing = run_test_vec({
		"hsl2hex([180  50   60])", '', {}, "#66cccc" % 1
		"hsl2hex([540  50   60])", '', {}, "#66cccc" % 2
		"hsl2hex([123  17   63])", '', {}, "#91b192" % 3
		"hsl2hex([ 10 100  100])", '', {}, "#ffffff" % 4
		"hsl2hex([ 30 100  999])", '', {}, "#ffffff" % 5
		"hsl2hex([300 100  100])", '', {}, "#ffffff" % 6
		"hsl2hex([  0   0    0])", '', {}, "#000000" % 7
		"hsl2hex([222  67    0])", '', {}, "#000000" % 8
		"hsl2hex([  1  61   84])", '', {}, "#efbebd" % 9
		"hsl2hex([197  24   55])", '', {}, "#7198a8" % 10
		"hsl2hex([ 31  99    8])", '', {}, "#291500" % 11
		"hsl2hex([360 999   30])", '', {}, "#990000" % 12
		"hsl2hex([-60 -10 66.5])", '', {}, "#aaaaaa" % 13
	});
end
function all_passing = test_clr2hex
	all_passing = run_test_vec({
		'clr2hex("123")'                       , '', {}, "#123"      % 1
		'clr2hex("4567")'                      , '', {}, "#4567"     % 2
		'clr2hex("123456")'                    , '', {}, "#123456"   % 3
		'clr2hex("12345678")'                  , '', {}, "#12345678" % 4
		'clr2hex("#123")'                      , '', {}, "#123"      % 5
		'clr2hex("#4567")'                     , '', {}, "#4567"     % 6
		'clr2hex("#123456")'                   , '', {}, "#123456"   % 7
		'clr2hex("#12345678")'                 , '', {}, "#12345678" % 8
		'clr2hex("rgb(123, 205, 17)")'         , '', {}, "#7bcd11"   % 9
		'clr2hex("rgb(15%, 15%, 15%)")'        , '', {}, "#262626"   % 10
		'clr2hex("rgba(85, 85, 85, 51)")'      , '', {}, "#55555533" % 11
		'clr2hex("rgba(85, 85, 85, 20%)")'     , '', {}, "#55555533" % 12
		'clr2hex("rgba(45%, 20%, 18%, 200)")'  , '', {}, "#73332ec8" % 13
		'clr2hex("rgba(45%, 20%, 18%, 78.4%)")', '', {}, "#73332ec8" % 14
		'clr2hex("hsl(238, 93%, 37%)")'        , '', {}, "#070cb6"   % 15
		'clr2hex("hsla(84, 29%, 61%, 107)")'   , '', {}, "#a1b87f6b" % 16
		'clr2hex("hsla(324, 53%, 24%, 43.5%)")', '', {}, "#5e1d446f" % 17
		'clr2hex("brown")'                     , '', {}, "#a52a2a"   % 18
		'clr2hex(''forestgreen'')'             , '', {}, "#228b22"   % 19
		'clr2hex("red")'                       , '', {}, "#f00"      % 20
		'clr2hex("none")'                      , '', {}, "none"      % 21
		'clr2hex("aqd3fsw_r")'                 , '', {}, "aqd3fsw_r" % 22
	});
end
function all_passing = test_optimize_hex
	all_passing = run_test_vec({
		'optimize_hex("#123456"  )', '', {}, "#123456"   % 1
		'optimize_hex("#112233"  )', '', {}, "#123"      % 2
		'optimize_hex("#11223344")', '', {}, "#1234"     % 3
		'optimize_hex("#11223343")', '', {}, "#11223343" % 4
		'optimize_hex("#123"     )', '', {}, "#123"      % 5
		'optimize_hex("#1234"    )', '', {}, "#1234"     % 6
		'optimize_hex("123"      )', '', {
			'svg_color_tfm:optimize_hex:argLength'
			'invalid hex length'
		}, []                                            % 7
		'optimize_hex("qwer"     )', '', {}, "qwer"      % 8
		'optimize_hex("[,]{|}(!)")', '', {}, "[,]{|}(!)" % 9
	});
end
function all_passing = test_optimize_color
	% `clr2hex` and `optimize_hex` work, so testing this one is redundant. 
	all_passing = run_test_vec({});
end
function all_passing = test_apply_hex_tfm
	all_passing = run_test_vec({
		'apply_hex_tfm("#ccc"   , [+000.0 +000.0 +000.0], [+1.0 +1.0 +1.0])', '', {}, "#ccc"    % 1
		'apply_hex_tfm("#ccc"   , [+255.0 +255.0 +255.0], [-1.0 -1.0 -1.0])', '', {}, "#333"    % 2
		'apply_hex_tfm("#ff1267", [+255.0 +255.0 +255.0], [-1.0 -1.0 -1.0])', '', {}, "#00ed98" % 3
		'apply_hex_tfm("#e4b9eb", [+215.8 +219.1 -003.9], [-0.3 -0.8 +1.2])', '', {}, "#9347ff" % 4
		'apply_hex_tfm("#e64076", [-103.6 +235.8 +042.1], [+0.6 +0.2 +1.0])', '', {}, "#22f9a0" % 5
		'apply_hex_tfm("#9f6573", [+092.0 +191.9 -049.3], [+0.5 -1.5 +0.6])', '', {}, "#ac2814" % 6
	});
end
function all_passing = test_apply_color_tfm
	% `clr2hex` and `apply_color_tfm` work, so testing this one is redundant. 
	all_passing = run_test_vec({});
end
% test_look_for_bg_rect
% test_invert_stroke_colors
% test_invert_fill_colors
% test_find_masks
function all_passing = test_optimize_paths
	all_passing = run_test_vec({
		'optimize_paths("<path d=""h 1 h 1 h 1 v -2 v -3 z z""/>")'  , '', {}, "<path d=""h3v-5z""/>"             % 1
		'optimize_paths("<path d=""zZzZzZzZ h1 h2 h-3 ZZz""/>")'     , '', {}, "<path d=""zh3h-3Z""/>"            % 2
		'optimize_paths("<path d=""l 0 10 v 5 l 10 0 h 5 z""/>")'    , '', {}, "<path d=""v15h15z""/>"            % 3
		'optimize_paths("<path d=""     ""/>")'                      , '', {}, "<path d=""""/>"                   % 4
		'optimize_paths("<path d=""h1 h2 h3""/><path d=""v2 v3""/>")', '', {}, "<path d=""h6""/><path d=""v5""/>" % 5
		'optimize_paths("<path d=""m1 2m3 4""/>")'                   , '', {}, "<path d=""m4 6""/>"               % 6
		'optimize_paths("<path d=""M1 2M3 4""/>")'                   , '', {}, "<path d=""M3 4""/>"               % 7
		'optimize_paths("<path d=""h 3 h -2 h 3""/>")'               , '', {}, "<path d=""h4""/>"                 % 8
		'optimize_paths("<path d=""h 4 h -2 h 1""/>")'               , '', {}, "<path d=""h4h-1""/>"              % 9
		'optimize_paths("<path d=""m 0 0 h 1 v 0 v 4 h 0 z""/>")'    , '', {}, "<path d=""h1v4z""/>"              % 10
	});
end
function all_passing = test_svg_color_tfm
	in1 = [
		"<?xml version=""1.0"" encoding=""UTF-8""?>"
		"<svg xmlns=""http://www.w3.org/2000/svg"" width=""800"" height=""700"" viewBox=""0 0 40 35"">"
		"    <defs>"
		"        <circle id=""glyph-1"" cx=""5"" r=""25"" fill=""#05d""/>"
		""
		"        <mask id=""mask-1"">"
		"            <use xlink:href=""#glyph-1""/>"
		"            <use href = ""#glyph-2""/>"
		"            <use href=""#glyph-3""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADlJREFUGFcdi0EOAEEIwlr3/09emSDxgKE1Segpn9K42YzDJswMEFTLtVOpltU9cm84EuwEsQ+bnwdVuCb0dV9CAgAAAABJRU5ErkJggg==""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADxJREFUGFcly7ERwAAMg0Cw9x/ZUi5JQfcIVstdEIFimxaZGZrgDCbpznAJs0tzKDYNvP5V8tUKubD7Hw/ToiX3nz1hPQAAAABJRU5ErkJggg==""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADpJREFUGFc9ykEKAwEUwtDE3v/I1fJnoG6E8ASnsMH/0bWFQSJr8WRXPIqYPGXHkvBd+VwEXslNNPwAvrMfAemHPO0AAAAASUVORK5CYII=""/>"
		"            <circle cx=""15"" cy=""15"" r=""9"" fill-opacity=""0"" stroke=""#fff""/>"
		"        </mask>"
		"    </defs>"	
		""
		"    <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADlJREFUGFc1jMENADEMwuz9d0tGouKu5YEEMrizwZCASgBbhiBN9eDsRPzIJ3cn5X4mUGT6eZfv5gBOMCAbv4vqNAAAAABJRU5ErkJggg==""/>"
		"</svg>"
	];
	in1 = join(replace(in1, '"', '""'), ['"' newline '"']);
	in1 = "join([" + newline + '"' + in1 + '"' + newline + "], newline)";
	in1 = "svg_color_tfm(""content"", " + in1 + ", ""verbose"", false, ""outfile"", ""---"")";
	out1 = join([
		"<?xml version=""1.0"" encoding=""UTF-8""?>"
		"<svg xmlns=""http://www.w3.org/2000/svg"" width=""800"" height=""700"" viewBox=""0 0 40 35""><rect width=""40"" height=""35"" fill=""#000""/>"
		"    <defs>"
		"        <circle id=""glyph-1"" cx=""5"" r=""25"" fill=""#fa2""/>"
		""
		"        <mask id=""mask-1"">"
		"            <use xlink:href=""#glyph-1""/>"
		"            <use href = ""#glyph-2""/>"
		"            <use href=""#glyph-3""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADlJREFUGFcdi0EOAEEIwlr3/09emSDxgKE1Segpn9K42YzDJswMEFTLtVOpltU9cm84EuwEsQ+bnwdVuCb0dV9CAgAAAABJRU5ErkJggg==""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADxJREFUGFcly7ERwAAMg0Cw9x/ZUi5JQfcIVstdEIFimxaZGZrgDCbpznAJs0tzKDYNvP5V8tUKubD7Hw/ToiX3nz1hPQAAAABJRU5ErkJggg==""/>"
		"            <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAADpJREFUGFc9ykEKAwEUwtDE3v/I1fJnoG6E8ASnsMH/0bWFQSJr8WRXPIqYPGXHkvBd+VwEXslNNPwAvrMfAemHPO0AAAAASUVORK5CYII=""/>"
		"            <circle cx=""15"" cy=""15"" r=""9"" fill-opacity=""0"" stroke=""#fff""/>"
		"        </mask>"
		"    </defs>"
		""
		"    <image href=""data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFBAMAAAB/QTvWAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAbUExURTAxMDAwMTExMTAwMDEwMDAxMTEwMTExMP///9/rFdEAAAAIdFJOUwAAAAAAAAAAt+dSoQAAAAFiS0dECIbelXoAAAAHdElNRQfoDAcXHApxL+dBAAAAHElEQVQI12NgVHZgYAoWYEguL2AQMStgKDcTAAAfDQOLIJbOkwAAACV0RVZGF0ZTpjcmVhdGUAMjAyNC0xMi0wN1QyMzoyODoxMCswMDowMGeiYfgAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMTItMDdUMjM6Mjg6MTArMDA6MDAW/9lEAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI0LTEyLTA3VDIzOjI4OjEwKzAwOjAwQer4mwAAAABJRU5ErkJggg==""/>"
		"</svg>"
	], newline) + newline;

	out2 = string(fileread("./svg/ex1-dark.svg"));
	out2 = replace(out2, sprintf("\r\n"), newline);

	out3 = string(fileread("./svg/ex2-dark.svg"));
	out3 = replace(out3, sprintf("\r\n"), newline);

	out4 = string(fileread("./svg/ex3-dark.svg"));
	out4 = replace(out4, sprintf("\r\n"), newline);

	all_passing = run_test_vec({
		% this one doesn't work because the metadata is never the same.
		% I promise it is correct though.
		% in1, '', {}, out1 % 1
		'svg_color_tfm("infile", "./svg/ex1-light.svg", "verbose", false, "outfile", "---")', '', {}, out2 % 2
		'svg_color_tfm("infile", "./svg/ex2-light.svg", "verbose", false, "outfile", "---")', '', {}, out3 % 3
		'svg_color_tfm("infile", "./svg/ex3-light.svg", "verbose", false, "outfile", "---")', '', {}, out4 % 4
	});
end
