#include <iostream>
using std::cout;
using std::endl;

#include <string>
using std::string;

#include <type_traits> // part of <string>
using std::is_pointer_v;
using std::enable_if_t;
using std::remove_pointer_t;

using Long = long long;


// basic types

// floating point
inline string typeName(float              x) { return "float"              ; }
inline string typeName(double             x) { return "double"             ; }
inline string typeName(long double        x) { return "long double"        ; }

// signed integers
inline string typeName(char               x) { return "char"               ; }
inline string typeName(short              x) { return "short"              ; }
inline string typeName(int                x) { return "int"                ; }
inline string typeName(long               x) { return "long"               ; }
inline string typeName(long long          x) { return "long long"          ; }

// unsigned integers
inline string typeName(bool               x) { return "bool"               ; }
inline string typeName(unsigned char      x) { return "unsigned char"      ; }
inline string typeName(unsigned short     x) { return "unsigned short"     ; }
inline string typeName(unsigned int       x) { return "unsigned int"       ; }
inline string typeName(unsigned long      x) { return "unsigned long"      ; }
inline string typeName(unsigned long long x) { return "unsigned long long" ; }



template <typename T>
enable_if_t<is_pointer_v<T> && !is_pointer_v<remove_pointer_t<T>>, string>
typeName(T x) {
	// only one layer of pointerage left
	return typeName(reinterpret_cast<remove_pointer_t<T>>(*x)) + " *";
}

template <typename T>
enable_if_t<is_pointer_v<T> && is_pointer_v<remove_pointer_t<T>>, string>
typeName(T x) {
	// more than one layer of pointerage left
	return typeName(reinterpret_cast<remove_pointer_t<T>>(*x)) + "*";
}
