% how to get the determinant of a matrix without MATLAB lying about the answer.
%{
x = [
	1 2 3
	4 5 6
	7 8 9
]
det(x) == 6.661338147750939e-16
x(1)*(x(5)*x(9) - x(6)*x(8)) ...
	- x(4)*(x(2)*x(9) - x(8)*x(3)) ...
	+ x(7)*(x(2)*x(6) - x(5)*x(3)) ...
	== 0
x(1,1)*(x(2,2)*x(3,3) - x(2,3)*x(3,2)) ...
	- x(1,2)*(x(2,1)*x(3,3) - x(2,3)*x(3,1)) ...
	+ x(1,3)*(x(2,1)*x(3,2) - x(2,2)*x(3,1)) ...
	== 0
%}

function out = actual_det(M)
	% actual_det: determinant of a function, without lying about the answer.
	% don't use for large matrices, as this uses an O(n!) algorithm.

	[rows, cols] = size(M);

	if rows ~= cols
		error("can only take the determinant of a square matrix");
	end

	if rows == 0, out = 1; return;
	elseif rows == 1, out = M; return;
	end

	% split off the top row into a separate variable
	[topRow, M] = deal( M(1, :), M(2:rows, :) );

	out = sum(arrayfun(
		@(col) (-1)^(col + 1) * ...
			topRow(col)       * ...
			actual_det( M(:, [1:col-1, col+1:cols]) ),
		1:cols
	));
end
