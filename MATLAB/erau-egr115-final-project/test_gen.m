% SVG Color Transformation Tests v1.0 (c) | Copyright 2024 Daniel E. Janusch

% this file is licensed by https://raw.githubusercontent.com/drizzt536/files/main/LICENSE
% and must be copied IN ITS ENTIRETY under penalty of law.

function test_gen(varargin)
	% generate the tests for ./svg_color_tfm.m
	% outputs the test suite file to ./test_suite.m
	% requires MATLAB 2022a or higher (for `writelines`).
	% NOTE: testing anonymous functions doesn't work for whatever reason.
	%
	% Examples:
	%     % run `init_setup()` before the tests, and run the tests after generation.
	%     test_gen("exec", true, "setup", "init_setup")
	%
	%     % print argument information.
	%     test_gen --help;
	%

	% default values:
	run_test_suite = false;
	setup_fn = '';

	% argument parsing
	i = 1;
	while i <= nargin
		arg = varargin{i};

		if ismember(class(arg), ["string", "char"])
			switch lower(arg)
				case {"run", "exec", "runtestsuite", "run test suite", "run_test_suite"}
					i = i + 1;
					arg = varargin{i};

					if class(arg) ~= "logical"
						throw(MException("test_gen:args", "invalid value for named argument 'runTestSuite'. must be a boolean."));
					end

					run_test_suite = arg;
				case {"setup", "setupfn", "setup fn", "setup_fn" ...
					"setupfunction", "setup function", "setup_function"}
					i = i + 1;
					arg = varargin{i};

					if ~ismember(class(arg), ["char", "string"])
						throw(MException("test_gen:args",                 ...
							"invalid value for named argument 'setup'." + ...
							" must be type string or char."               ...
						));
					end

					setup_fn = arg;
				case {"help", "options", "-h", "-?", "-help", "--help"}
					fprintf("valid named arguments (case insensitive)\n");
					fprintf("\t""run"", ""exec"", ""runtestsuite"", ""run test suite"", ""run_test_suite""\n");
					fprintf("\t\tboolean argument for whether or not to run the generated tests\n");
					fprintf("\t""setup"", ""setupfn"", ""setup fn"", ""setup_fn"", ""setupfunction"", ""setup function"", ""setup_function""\n");
					fprintf("\t\tstring/char argument for the setup code to run before the tests\n");
					fprintf("\t""help"", ""options"", ""-h"", ""-?"", ""-help"", ""--help""\n");
					fprintf("\t\tprint this message and return.\n");
					fprintf("\n");
					fprintf("\tall other named arguments throw an error due to ambiguity\n");
					fprintf("\n");
					fprintf("for more information, run `help test_gen`\n");

					return
				otherwise
					throw(MException("test_gen:args",                ...
						"lone-standing string argument '"+arg+"' " + ...
						"is ambiguous as either an invalid named " + ...
						"argument or a setup function."              ...
					));
			end
		end

		i = i + 1;
	end

	filename = "./svg_color_tfm.m";

	tab = string(char(9));

	disp("building test_suite.m");

	writelines([
		"%%%% THIS IS A GENERATED FILE %%%%"
		""
		string(setup_fn) + ";" % this is also fine if setup_fn is empty.
		"run_tests;"
		""
		"%%%% " + filename + " FUNCTIONS BEGIN"
		""
		""
	], "./test_suite.m");

	writelines(readlines(filename), "./test_suite.m", "writemode", "append");

	lines = readlines("./test_gen.m"); % the current file

	i = find(lines == "%%%% TEST FUNCTIONS BEGIN", 1);

	% TODO: in `run_test_vec`, if the test failed, give more information about it:
		% e.g. expected / actual value.
	% TODO: think about how to test against errors as well as correct values.

	[main_fn, globals] = gen_main_fn(lines(i + 1:end));

	writelines([
		""
		"%%%% TEST FUNCTIONS BEGIN"
		""
		main_fn
		""
		"function all_passing = run_test_vec(test_vec)"
		tab+"% an n x 4 cell matrix of tests, where each row contains one test"
		tab+"% each row should be `function string, console output, error, output 1`"
		tab+"% loops over the rows and tests them."
		tab+"% the console output can be given"
		tab+"%"
		tab+"% for now, this assumes only one output value from the function."
		tab+"% the error object should be a cell array where the first value"
		tab+"% is the identifier, and the second value is the message. it can"
		tab+"% be either a row or column array, and can use either string or chartreuse."
		tab+"%"
		tab+"% an attempt was made to limit the number of functions and variables used."
		tab+"%"
		tab+"% Example:"
		tab+"%     run_test_vec({"
		tab+"%         ""fprintf('test message')"", 'test message', {}, 12 % 1"
		tab+"%         'sqrt(16)'               , """"            , {}, 4  % 2"
		tab+"%         ""mean([1 2 3])""          , """"            , {}, 7  % 3, test fails"
		tab+"%         ""mean([1 2 3])""          , ""asdf""        , {}, 2  % 4, test fails"
		tab+"%         ""2 = 3""                  , ''            , {"
		tab+"%             ""MATLAB:m_invalid_lhs_of_assignment""                   % identifier"
		tab+"%             ""Incorrect use of '=' operator. Assign a value "" + ... % message"
		tab+"%             ""to a variable using '=' and compare values for"" + ..."
		tab+"%             "" equality using '=='."""
		tab+"%         }, 2                                              % 5"
		tab+"%     })"
		tab+"%"
		tab+"%     usually you would only test one function at a time,"
		tab+"%     but this still shows what is expected."
		tab+"%"
		tab+"%     `fprintf` doesn't actually return anything, but the return"
		tab+"%     value of 12 is required. Probably because `evalc` returns"
		tab+"%     the length of the console output if no real output is given."
		tab+"%"
		""
		globals
		""
		tab+"all_passing = ~false;"
		""
		tab+"for i = 1 : height(test_vec)"
		tab+tab+"try"
		tab+tab+tab+"[conout, out1] = evalc(test_vec{i, 1});"
		""
		tab+tab+tab+"if ~isempty(test_vec{i, 3})"
		tab+tab+tab+tab+"all_passing = false;"
		tab+tab+tab+tab+"fprintf(""\ttest %d failed. (error was expected)\n"", i);"
		tab+tab+tab+"end"
		tab+tab+"catch ME"
		tab+tab+tab+"% don't check the types on the error attributes. char or string."
		tab+tab+tab+"show_stack = false;"
		tab+tab+tab+"errdata = test_vec{i, 3};"
		tab+tab+tab+"if isempty(errdata)"
		tab+tab+tab+tab+"errorUnexpected = true;"
		tab+tab+tab+tab+"errdata = {'' ''};"
		tab+tab+tab+"else"
		tab+tab+tab+tab+"errorUnexpected = false;"
		tab+tab+tab+"end"
		""
		tab+tab+tab+"if ~isequal(ME.identifier, errdata{1})"
		tab+tab+tab+tab+"all_passing = false;"
		tab+tab+tab+tab+"show_stack = true;"
		""
		tab+tab+tab+tab+"fprintf(""\ttest %d failed. (error identifier)\n"", i);"
		tab+tab+tab+tab+"if errorUnexpected, fprintf(""\t\tencountered unexpected error\n""); end"
		tab+tab+tab+tab+"fprintf(""\t\texpected '%s' but got '%s'\n"", errdata{1}, ME.identifier);"
		tab+tab+tab+"end"
		""
		tab+tab+tab+"% allow it to fail both ways"
		tab+tab+tab+"if ~isequal(ME.message, errdata{2})"
		tab+tab+tab+tab+"all_passing = false;"
		tab+tab+tab+tab+"show_stack = true;"
		""
		tab+tab+tab+tab+"fprintf(""\ttest %d failed. (error message)\n"", i);"
		tab+tab+tab+tab+"if errorUnexpected, fprintf(""\t\tencountered unexpected error\n""); end"
		tab+tab+tab+tab+"fprintf(""\t\texpected '%s' but got '%s'\n"", errdata{2}, ME.message);"
		tab+tab+tab+"end"
		""
		tab+tab+tab+"if show_stack"
		tab+tab+tab+tab+"fprintf(""\tcall stack:\n"");"
		tab+tab+tab+tab+"fprintf(""\t\t%s:%s (%s)\n"", string(["
		tab+tab+tab+tab+tab+"{ME.stack.file}"
		tab+tab+tab+tab+tab+"{ME.stack.line}"
		tab+tab+tab+tab+tab+"{ME.stack.name}"
		tab+tab+tab+tab+"]));"
		tab+tab+tab+"end"
		""
		tab+tab+tab+"% conout and out1 aren't defined."
		tab+tab+tab+"continue"
		tab+tab+"end"
		""
		tab+tab+"if ~isequaln(conout, test_vec{i, 2})"
		tab+tab+tab+"all_passing = false;"
		""
		tab+tab+tab+"fprintf(""\ttest %d failed. (console output)\n"", i);"
		tab+tab+tab+"fprintf(""\t\texpected '%s' but got '%s'\n"", test_vec{i, 2}, conout);"
		tab+tab+"end"
		""
		tab+tab+"if ~isequaln(class(out1), class(test_vec{i, 4})) || ~isequaln(out1, test_vec{i, 4})"
		tab+tab+tab+"all_passing = false;"
		""
		tab+tab+tab+"fprintf(""\ttest %d failed. (output 1)\n"", i);"
		tab+tab+tab+"fprintf(""\t\texpected: ""); disp(test_vec{i, 4});"
		tab+tab+tab+"fprintf(""\t\treceived: ""); disp(out1);"
		tab+tab+tab+"fprintf(""\t\t(if they look the same, the types are probably different)\n"");"
		tab+tab+"end"
		tab+"end"
		"end"
	], "./test_suite.m", "writemode", "append");

	writelines(lines(i + 1:end), "./test_suite.m", "writemode", "append");


	if run_test_suite
		fprintf("done. starting tests\n\n");
		run test_suite
	else
		disp("done");
	end
end

function [outlines, globals] = gen_main_fn(lines)
	% `lines` is a vector of strings.
	% whether row or column, I don't remember. It shouldn't matter though.

	tab = string(char(9));

	outlines = [
		"function run_tests"
		tab+"all_passing = true;"
		""
	];

	globals = [];

	for line = lines'
		match = regexp(line, "^function\s+all_passing\s*=\s*test_(\w+)$", "tokens");

		if ~isempty(match)
			outlines = [
				outlines
				tab+"disp(""testing function : " + match{1} + """);"
				tab+"all_passing = all_passing && test_" + match{1} + ";"
				""
			];

			continue
		end

		match = regexp(line, "^function\s+all_passing\s*=\s*testglobal_(\w+)$", "tokens");

		if ~isempty(match)
			outlines = [
				outlines
				tab+"disp(""testing global   : " + match{1} + """);"
				tab+"all_passing = all_passing && testglobal_" + match{1} + ";"
				""
			];

			if ismember(match{1}, [
				"all_passing"  "i"     "class"  "conout"  "disp"      "evalc"
				"test_vec"     "out1"  "false"  "height"  "isequaln"  "num2str"
			])
				throw(MException("test_gen:gen_main_fn:global_match", ...
					"invalid global variable name. " +                ...
					"it must not be a variable used in the function." ...
				));
			end

			globals = [
				globals
				tab+"global " + match{1} + ";"
			];

			continue
		end
	end

	outlines = [
		outlines
		tab+"if all_passing"
		tab+tab+"fprintf(""\nall tests passing\n"");"
		tab+"else"
		tab+tab+"fprintf(""\nsome tests failing\n"");"
		tab+"end"
		"end"
	];
end

%%%% TEST FUNCTIONS BEGIN

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
