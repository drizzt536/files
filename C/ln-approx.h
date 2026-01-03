#pragma once

// compile with `-mfma` so the fma calls can actually use fma instructions

#include <math.h>

/*
these are N=4 and N=5 versions of this series:

\ln x \stackrel?= \! \lim_{N \to \infty} \! \left[
	\dfrac 1 2 \dfrac x {N + 1}
	+ \sum_{n=1}^N \left\{\dfrac 1 n + \left(\dfrac 1 n + \dfrac 1 2\right) \! \left(\!-\dfrac 2 x\right)^{\! n}
	\, \prod_{k=0}^{n-1} \dfrac{N - k}{3 + k}\right\}
	\! - \ln \dfrac e 2
\right] \ni x > 1
*/

static double ln_a4(double x) {
	// the result is within 1% of the correct answer for x \in (1.17341, 6.04135)
	const double y = 1/x;
	double res = 0.8;

	res = fma(res, y, -8/3.0);
	res = fma(res, y, +4.0);
	res = fma(res, y, -4.0);
	res = fma(res, y, 1.7764805138932787); // ln(2) + 13/12

	return fma(0.1, x, res);
}

/*
#include <complex.h>
_Complex double ln_a5c(_Complex double x) {
	if (x == 0)
		return NAN;

	return ln_a5(hypot(creal(x), cimag(x))) + atan2(cimag(x), creal(x))*I;
}
*/

static double ln_a5(double x) {
	// if x > e^127 or x < e^-127, the answer will be garbage.
	if (x == 0)
		return -INFINITY;

	if (x < 0)
		return NAN;

	if (x < 1)
		return -ln_a5(1/x);

	// normalize x into (1.13648, 7.16264)
	signed char offset = 0; // ln(x) = ln(e^n x^*) = n + ln(x^*)

	if (x < 2.2) {
		x *= M_E;
		offset = -1;
	}
	else {
		double tmp_cur  = 1, tmp_next = M_E;

		while (x > tmp_next) {
			offset++;

			tmp_cur = tmp_next;
			tmp_next *= M_E;
		}

		x /= tmp_cur;
	}

	// the result of this stuff is within 1% of the correct answer for x \in (1.13648, 7.16264)
	const double y = 1/x;
	double res = -16.0/15.0;

	res = fma(res, y, +4.0);
	res = fma(res, y, -20.0/3.0);
	res = fma(res, y, +20.0/3.0);
	res = fma(res, y, -5.0);
	res = fma(res, y, 1.9764805138932786); // ln(2) + 77/60

	return fma(1.0/12.0, x, res + offset);
}

// NASM code for N=5 approximation with SIMD instructions.
// gcc -S main.c -g -masm=intel -fno-verbose-asm -mfma -O3 -o tmp.s
// with GCC 15.2, it gives the GAS version of this code.
/*
ln_a5:
	;; [normalization code]

	;; main algorithm
	vmovsd  		xmm1, qword [rel .c0]
	vmovsd  		xmm2, qword [rel .c1]
	vdivsd  		xmm1, xmm1, xmm0
	vfmadd213sd 	xmm2, xmm1, qword [rel .c2]
	vfmadd213sd 	xmm2, xmm1, qword [rel .c3]
	vfmadd213sd 	xmm2, xmm1, qword [rel .c4]
	vfmadd213sd 	xmm2, xmm1, qword [rel .c5]
	vfmadd213sd 	xmm1, xmm2, qword [rel .c6]
	vfmadd132sd 	xmm0, xmm1, qword [rel .c7]
	ret
.c0:	dq 1.0
.c1:	dq -1.0666666666666667
.c2:	dq 4.0
.c3:	dq -6.666666666666667
.c4:	dq 6.666666666666667
.c5:	dq -5.0
.c6:	dq 1.9764805138932786 ; ln(2) + 77/60
.c7:	dq 0.08333333333333333
*/
