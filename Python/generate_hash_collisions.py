from typing import Hashable

def generate_hash_collisions(x: Hashable, n: int = 10) -> set:
	"returns a set with `x`, and `n` different integers with the same hash"

	base_hash = hash(x)
	magic_value = (-1 if base_hash < 0 else 1) * 18446744073709551608 # \pm (2**64 - 8)

	if abs(base_hash) >= abs(magic_value):
		raise ValueError("cannot generate a hash collision for the input value.")

	output_set = {magic_value*k + base_hash for k in range(n)}
	output_set.add(x)

	return output_set
