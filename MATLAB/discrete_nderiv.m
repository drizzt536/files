function [X, Y] = discrete_nderiv(x, y, n)
	%   numerical nth derivative of y = f(x) given list inputs
	%
	%   finds the points directly without recursion.
	%   finding the y values requires n loop sum iterations.
	%   at least n + 1 points are required for the nth derivative.
	%   assumes a uniform distribution of x values.

	x_len = numel(x);
	y_len = numel(y);

	if nargin < 3
		n = 1;
	end

	if mod(n, 1) ~= 0
		throw (MException("discrete_nderiv:domain", "n must be an integer"))
	end

	if n < 0
		throw (MException("discrete_nderiv:domain", "n must be non-negative"))
	end

	if x_len ~= y_len
		throw (MException("discrete_nderiv:numel", [                     ...
			'there must be an equal amount of x and y values given. '    ...
			num2str(x_len) ' and ' num2str(y_len) ' given respectively.' ...
		]))
	end

	if x_len < n + 1
		switch mod(n, 10)
			case 1   ; suf = 'st';
			case 2   ; suf = 'nd';
			case 3   ; suf = 'rd';
			otherwise; suf = 'th';
		end

		throw (MException("nderiv:numel", [                         ...
			'not enough points for ' num2str(n) suf ' derivative. ' ...
			num2str(n) '/' num2str(n + 1) ' points given.'          ...
		]))
	end

	dx = x(2) - x(1);

	X = x(1 + floor(n/2) : end - round(n/2)) + mod(n, 2) * dx/2;

	Y = 0;

	for k = 0 : n
		Y = Y + (-1)^k * nchoosek(n, k) * y(1 + n - k : end - k);
	end

	Y = Y / dx^n;
end

