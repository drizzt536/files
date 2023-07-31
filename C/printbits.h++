#include <iostream>

using size_t = unsigned long long;
using std::ostream;
using std::endl;

template <typename T>
void printbits(T x, ostream outFile = stdout) {
	// print the binary bits of a value.
	for (size_t i = 8 * sizeof(T); i --> 0 ;)
		outFile << x >> i & 1;
}

template <typename T>
void printbitsln(T x, ostream outFile = stdout) {
	// print the binary bits of a value with a newline at the end.
	printbits<T>(x, outFile);
	outFile << endl;
}
