from math import gcd, factorial as ifact, nan, log10 as log, floor
class Fraction:
    def __init__(self, numer: int, denom: int, /) -> None:
        super(Fraction, self).__init__()
        if not isinstance(numer, int) or not isinstance(denom, int):
            raise TypeError("Fraction() requires 2 int arguments")
        if denom == 0:
            raise ValueError("demominator cannot be 0")
        g = gcd(numer, denom)
        self.numer = numer // g
        self.denom = denom // g
    def __add__(self, f, /):
        if type(f) is not type(self): raise TypeError("Fraction.__add__() requires a Fraction argument")
        n = self.numer*f.denom + self.denom*f.numer
        d = self.denom*f.denom
        g = gcd(n, d)
        return self (n // g, d // g)
    def __sub__(self, f, /):
        if type(f) is not type(self): raise TypeError("Fraction.__sub__() requires a Fraction argument")
        n = f.denom*self.numer - self.denom*f.numer
        d = self.denom*f.denom
        g = gcd(n, d)
        return self (n // g, d // g)
    def __mul__(self, f, /):
        if type(f) is int:
            n = self.numer * f
            d = self.denom
            g = gcd(n, d)
            return self (n // g, d // g)
        if type(f) is not type(self): raise TypeError("Fraction.__mul__() requires a Fraction argument")
        return self (self.numer*f.numer, self.denom*f.denom)
    def __div__(self, f, /):
        if type(f) is int:
            n = self.numer
            d = self.denom * f
            g = gcd(n, d)
            return self (n // g, d // g)
        if type(f) is not type(self): raise TypeError("Fraction.__div__() requires a Fraction argument")
        return self (self.numer*f.denom, self.denom*f.numer)
    def __mod__(self, f, /):
        return self.__sub__(self.__div__(f))
    def __call__(self, numer, denom, /):
        return type(self) (numer, denom)
    def __pow__(self, f):
        if f == -1:
            return self (self.denom, self.numer)
        if type(f) is int:
            n = self.numer ** f
            d = self.denom ** f
            g = gcd(n, d)
            return self (n // g, d // g)
        raise NotImplementedError(NotImplemented)
    def __repr__(self, /) -> str:
        return f"{self.numer} / {self.denom}"


def div(fraction: Fraction, decimalplaces: int = 100, /) -> str:
    """returns the division of a fraction to any amount of decimal places as a string."""
    def idiv(n: int, d: int) -> int:
        """does the divisioning. generator function"""
        yield (-1 if n < 0 else 1) * (-1 if d < 0 else 1)
        n, d = abs(n), abs(d)
        while 1:
            yield (i := n // d)
            if not (n := 10 * (n - i * d)): break
    a = idiv(fraction.numer, fraction.denom)
    # probably not the best way to do this
    out = f"{'-' if next(a) < 0 else ''}{next(a)}."
    for i in range(int(decimalplaces)): out += str( next(a) )
    return out

# pi approximation:
# f = lambda k: Fraction( (-1)**k * ifact(6*k) * (13591409 + 545140134*k), ifact(3*k) * ifact(k)**3 * 640320**(3*k) )
# s = (sum([f(n) for n in range(10000)], Fraction(0, 1)) ** -1) * Fraction(66716672916145927, 1562500000)
# print(div(s))