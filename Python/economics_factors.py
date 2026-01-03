# the default arguments are on the left side. so ec_F_P(i, n) == ec_F_P(1, i, n)

import sympy as sp
from typing import Callable

n = sp.Symbol("n", real=True, integer=True)
i, A, F, P = sp.symbols("i, A, F, P", real=True)

def ec_F_P(P, i, n=None, /):
	if n == None:
		P, i, n = 1, P, i

	return P * (1 + i)**n

def ec_P_F(F, i, n=None, /):
	if n == None:
		F, i, n = 1, F, i

	return F * (1 + i)**-n

def ec_P_A(A, i, n=None, /):
	if n == None:
		A, i, n = 1, A, i

	return A * (1 - (1 + i)**-n) / i

def ec_A_P(P, i, n=None, /):
	if n == None:
		P, i, n = 1, P, i

	return P * i / (1 - (1 + i)**-n)

def ec_F_A(A, i, n=None, /):
	if n == None:
		A, i, n = 1, A, i

	return A * ((1 + i)**n - 1) / i

def ec_A_F(F, i, n=None, /):
	if n == None:
		F, i, n = 1, F, i

	return F * i / ((1 + i)**n - 1)

def ec_P_P(P, i, n=None, /):
	return 1 if n == None else P

def ec_F_F(F, i, n=None, /):
	return 1 if n == None else F

def ec_A_A(A, i, n=None, /):
	return 1 if n == None else A

fn_table = {
	"A/A": ec_A_A,
	"A/F": ec_A_F,
	"A/P": ec_A_P,

	"F/A": ec_F_A,
	"F/F": ec_F_F,
	"F/P": ec_F_P,

	"P/A": ec_P_A,
	"P/F": ec_P_F,
	"P/P": ec_P_P,
}

var_table = {A: "A", F: "F", P: "P"}
var_table_inv = {"A": A, "F": F, "P": P}

def _type_norm(type) -> tuple[str, Callable]:
	"stringify the type, and make sure it is valid. returns the canonical type, and the handler function"
	if isinstance(type, sp.Mul):
		a, b = type.args

		type = f"{var_table.get(a, "")}/{var_table.get(1 / b, "")}"

	if not isinstance(type, str):
		raise TypeError("type must be a string")

	if len(type) != 3:
		raise ValueError("type must be 3 characters long")

	type = type.upper()
	fn = fn_table.get(type, None)

	if fn is None:
		raise ValueError("type must be of the form [AFP]/[AFP]")

	return type, fn

def ec_factor(type: str, known_val, i, n=None, /):
	if n == None:
		known_val, i, n = 1, known_val, i

	return _type_norm(type)[1](known_val, i, n)

def ec_factor_solve(type: str, /, in_val=None, out_val=None, i=i, n=n, var: sp.Symbol = i) -> list:
	"defaults to solving for i"

	type, fn = _type_norm(type)

	if in_val is None:
		in_val = var_table_inv.get(type[2])

	if out_val is None:
		out_val = var_table_inv.get(type[0])

	expr = sp.Eq(out_val, fn(in_val, i, n))

	if var not in expr.free_symbols:
		raise ValueError(f"variable is not present in the given equation. options: {expr.free_symbols}")

	# discard solutions
	return [solution for solution in sp.solve(expr, var) if not solution.has(sp.I)]

f = ec_factor
f_solve = ec_factor_solve
