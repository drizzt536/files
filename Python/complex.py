import math
from random import randint, random as rand

# Typing "math." before the function name is too hard, also log() is base 10 not base e.
# Also, even if it was, "ln" has less letters than "log".
def ln(num):
	try:    return math.log(num)
	except: return math.nan

def sqrt(num):
	try:    return math.sqrt(num)
	except: return math.nan

def sin(num):
	try:    return math.sin(num)
	except: return math.nan

def cos(num):
	try:    return math.cos(num)
	except: return math.nan

class Complex():
	def __init__(self, re:float=0.0, im:float=0.0):
		super(Complex, self).__init__()
		if (type(re) in {int, float}) and (type(im) in {int, float}):
			self.re = re
			self.im = im
		else:
			raise TypeError("invalid input to Complex() class")
	# Not always accurate within 1e-9 for a+bi ∧ c+di ∈ ℝ
	# Also, python can't do 0^complex(num, num) or 0^-x because it's a bad programming language.
	def pow(self, num):
		if type(num) is complex:
			num = type(self)(num.real, num.imag)
		if type(num) is not type(self):
			raise TypeError("invalid input to Complex.pow() function, requires a Complex argument")
		try:    r = (self.re**2 + self.im**2) ** (num.re / 2)  /  math.e ** ( num.im*arg(self) )
		except: print("Error Code 1")
		try:    θ = num.re*arg(self) + num.im*ln(sqrt(self.re**2 + self.im**2))
		except: print("Error Code 2")
		try:    return r*complex(cos(θ), sin(θ))
		except: print("Error Code 3")

def arg(num: Complex):
	try:    return math.atan2(num.im, num.re)
	except: return math.nan

def test(size:int=1000, debug:bool=False):
	def do_the_thing(i):
		if debug and i and not i % 1_000_000:
			print(i)
		n1 = randint(-100, 100) * rand() or 1
		n2 = randint(-100, 100) * rand()
		n3 = randint(-100, 100) * rand() or 1
		n4 = randint(-100, 100) * rand()
		if n1 and n3 and not n2 and not n4:
			return
		complex1 = complex(n1, n2)
		complex2 = complex(n3, n4)
		Complex1 = Complex(n1, n2)
		Complex2 = Complex(n3, n4)
		try:    complex3 = complex1 ** complex2
		except: return
		Complex3 = Complex1.pow(Complex2)
		if not (math.isclose(complex3.real, Complex3.real) and math.isclose(complex3.imag, Complex3.imag)):
			raise Exception(f"OutputError: Inputs:\n{n1}\n{n2}\n{n3}\n{n4}\nOutputs:\n  complex:\n{complex3.real}\n{complex3.imag}\n  Complex:\n{Complex3.real}\n{Complex3.imag}\n1 based Index: {i + 1}")
	if type(size) not in [int, float]:
		raise TypeError("invalid type for test() function argument")
	if size is math.inf:
		i = 0
		while True:
			do_the_thing(i)
			i += 1
	else:
		for i in range(round(size)):
			do_the_thing(i)
	print("Done")
