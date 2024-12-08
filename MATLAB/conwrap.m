function outstr = conwrap(instr)
	% wraps lines in a string to fit the current console width
	%
	% Example:
	%     disp( conwrap(sym(2)^18636) )

	consize = matlab.desktop.commandwindow.size; % [width, height]
	outstr = join(string(textwrap({string(instr)}, consize(1))), newline) );
end
