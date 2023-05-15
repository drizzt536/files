from fractions import Fraction
from math import floor, sqrt

def primeQ(n: int) -> bool:
    for i in range(2, floor( sqrt(n) )+1):
        if not n % i:
            return False
    return True

def coprimeQ(a: int, b: int, /) -> bool:
    """
        returns whether or not a and b are coprime, or if gcd(a, b) = 1
        uses Euclids algorithm to simplify.
    """
    while b != 0:
        a, b = b, a % b
    return a == 1

def main(n: int = 1, m: int = 2, /) -> tuple[str, ...]:
    """
        lists out real numbers in the range (0, 1).
        uses n to the first m negative powers.
    """
    if not isinstance(n, int) or not isinstance(m, int):
        raise TypeError("both arguments bust be integers")
    if n < 1 or m < 0:
        raise ValueError("invalid arguments passed. n > 0, m >= 0 (integers)")
    numbers = []
    for k in range(1, m+1):
        P = n**k
        for i in range(1, P):
            if (coprimeQ(P, i) if primeQ(n) else (P % i if P > n else True) ):
                numbers.append(str( Fraction(i, P) ))
    return tuple(numbers)

main(2, 5) # example
