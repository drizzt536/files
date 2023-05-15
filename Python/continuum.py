def prime(n: int, /) -> int:
    """
        - finds the nth prime number via delegation.
        - incurs around 2 seconds of overhead each call.
        - calls to wolfram engine because I don't know a fast enough algorithm.
        - assumes valid input: integer >= 1.
    """
    from subprocess import Popen, PIPE
    process = Popen(["wolframscript", "-c", f"Prime@ {n}"], stdout=PIPE)
    (output, _error) = process.communicate()
    process.wait() # idk if this is still needed or not
    return int( output.decode("utf-8") )

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
        uses the nth prime number to the first m negative powers.
    """
    from fractions import Fraction
    if not isinstance(n, int) or not isinstance(m, int):
        raise TypeError("both arguments bust be integers")
    if n < 1 or m < 0:
        raise ValueError("invalid arguments passed. n > 0, m >= 0 (integers)")
    p = prime(n)
    numbers = []
    for k in range(1, m+1):
        P = p**k
        for i in range(1, P):
            if coprimeQ(P, i):
                numbers.append(str( Fraction(i, P) ))
    return tuple(numbers)

main(1, 5)
