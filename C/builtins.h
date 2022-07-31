#ifndef __LIBRARY_MINGW_GCC_BUILTINS__ // probably not all of them
#define __LIBRARY_MINGW_GCC_BUILTINS__
#ifndef __ALSO_USE_CUSTOM_MACROS_FOR_BUILTINS_H_LIBRARY__
#define __ALSO_USE_CUSTOM_MACROS_FOR_BUILTINS_H_LIBRARY__ (_Bool) 1u
#endif
struct FILE *__acrt_iob_func(unsigned index); // stdio.h
int atoi(const char *_Str); // stdlib.h
double atof(const char *_String); // stdlib.h
long atol(const char *_Str); // stdlib.h
int rand(void); // stdlib.h
char **__sys_errlist(void); // errno.h?
int *__sys_nerr(void); // errno.h?
int *_errno(void); // stderr.h
void perror(const char *_ErrMsg); // errno.h
unsigned long *__doserrno(void); // stdlib.h
int _set_errno(int _Value); // errno.h
int _get_errno(int *_Value); // errno.h
int _set_doserrno(unsigned long _Value); // stdlib.h
int _get_doserrno(unsigned long *_Value); // stdlib.h
#define _countof(_Array) (sizeof(_Array) / sizeof(_Array[0])) // stdlib.h
#define offsetof(TYPE, MEMBER) __builtin_offsetof(TYPE, MEMBER) // stdlib.h
#define object_size __builtin_object_size
#define constant_p __builtin_constant_p
#define huge_valq __builtin_huge_valq
#define tgmath __builtin_tgmath
#define sscanf __builtin_sscanf
#define scanf __builtin_scanf
#define vsscanf __builtin_vsscanf
#define scanf __builtin_scanf
#define vscanf __builtin_vscanf
#define fscanf __builtin_fscanf
#define vfscanf __builtin_vfscanf
#define vsnprintf __builtin_vsnprintf
#define snprintf __builtin_snprintf
#define printf __builtin_printf
#define vprintf __builtin_vprintf
#define fprintf __builtin_fprintf
#define vfprintf __builtin_vfprintf
#define sprintf __builtin_sprintf
#define vsprintf __builtin_vsprintf
#define puts __builtin_puts
#define putc __builtin_putc
#define fputs __builtin_fputs
#define fputc __builtin_fputc
#define putchar __builtin_putchar
#define	STDIN_FILENO  0
#define	STDOUT_FILENO 1
#define	STDERR_FILENO 2
#define stdin  (__acrt_iob_func(STDIN_FILENO ))
#define stdout (__acrt_iob_func(STDOUT_FILENO))
#define stderr (__acrt_iob_func(STDERR_FILENO))
#define NULL ((void *)0)
#define __sprintf_chk __builtin___sprintf_chk
#define __vsprintf_chk __builtin___vsprintf_chk
#define __snprintf_chk __builtin___snprintf_chk
#define __vsnprintf_chk __builtin___vsnprintf_chk
#define bool _Bool
#define true ((_Bool) 1u)
#define false ((_Bool) 0u)
#define TRUE ((_Bool) 1u)
#define FALSE ((_Bool) 0u)
#define malloc __builtin_malloc
#define calloc __builtin_calloc
#define realloc __builtin_realloc
#define free __builtin_free
#define exit __builtin_exit
#define abort __builtin_abort
#define fwrite __builtin_fwrite
#define EXIT_SUCCESS 0
#define EXIT_FAILURE 1
#define _doserrno (*__doserrno())
#define _sys_nerr (*__sys_nerr())
#define _sys_errlist (__sys_errlist())
#define size_t long unsigned int
#define ssize_t long
#define va_start __builtin_va_start
#define va_end __builtin_va_end
#define va_arg __builtin_va_arg
#define va_list __builtin_va_list
#define va_arg_pack __builtin_va_arg_pack
#define va_cope __builtin_va_copy
#define INFINITY (__builtin_inff())
#define inff __builtin_inff
#define NAN	(__builtin_nanf(""))
#define nanf __builtin_nanf
#define nansf __builtin_nansf
#define nansl __builtin_nansl
#define nansf32 __builtin_nansf32
#define nansf64 __builtin_nansf64
#define nansf128 __builtin_nansf128
#define nansf32x __builtin_nansf32x
#define nansf64x __builtin_nansf64x
#define infd32 __builtin_infd32
#define nand32 __builtin_nand32
#define nansd32 __builtin_nansd32
#define nansd64 __builtin_nansd64
#define nansd128 __builtin_nansd128
#define __memcpy_chk __builtin___memcpy_chk
#define __memmove_chk __builtin___memmove_chk
#define __memset_chk __builtin___memset_chk
#define __strcpy_chk __builtin___strcpy_chk
#define __stpcpy_chk __builtin___stpcpy_chk
#define __strncpy_chk __builtin___strncpy_chk
#define __strcat_chk __builtin___strcat_chk
#define __strncat_chk __builtin___strncat_chk
#define memchr __builtin_memchr
#define memcmp __builtin_memcmp
#define memcpy __builtin_memcpy
#define mempcpy __builtin_mempcpy
#define memset __builtin_memset
#define memmove __builtin_memmove
#define strlen __builtin_strlen
#define strnlen __builtin_strnlen
#define strchr __builtin_strchr
#define strrchr __builtin_strrchr
#define strcmp __builtin_strcmp
#define strncmp __builtin_strncmp
#define strcat __builtin_strcat
#define strncat __builtin_strncat
#define strdup __builtin_strdup
#define strndup __builtin_strndup
#define strcspn __builtin_strcspn
#define strstr __builtin_strstr
#define strcasecmp __builtin_strcasecmp
#define strncasecmp __builtin_strncasecmp
#define complex _Complex
#define fcomplex float _Complex
#define dcomplex double _Complex
#define ldcomplex long double _Complex
#define creal __builtin_creal
#define cimag __builtin_cimag
#define carg __builtin_carg
#define cabs __builtin_cabs
#define conj __builtin_conj
#define cacos __builtin_cacos
#define casin __builtin_casin
#define catan __builtin_catan
#define ccos __builtin_ccos
#define csin __builtin_csin
#define ctan __builtin_ctan
#define cacosh __builtin_cacosh
#define casinh __builtin_casinh
#define catanh __builtin_catanh
#define ccosh __builtin_ccosh
#define csinh __builtin_csinh
#define ctanh __builtin_ctanh
#define cexp __builtin_cexp
#define clog __builtin_clog
#define clog10 __builtin_clog10
#define cpow __builtin_cpow
#define csqrt __builtin_csqrt
#define cproj __builtin_cproj
#define crealf __builtin_crealf
#define cimagf __builtin_cimagf
#define cargf __builtin_cargf
#define cabsf __builtin_cabsf
#define conjf __builtin_conjf
#define cacosf __builtin_cacosf
#define casinf __builtin_casinf
#define catanf __builtin_catanf
#define ccosf __builtin_ccosf
#define csinf __builtin_csinf
#define ctanf __builtin_ctanf
#define cacoshf __builtin_cacoshf
#define casinhf __builtin_casinhf
#define catanhf __builtin_catanhf
#define ccoshf __builtin_ccoshf
#define csinhf __builtin_csinhf
#define ctanhf __builtin_ctanhf
#define cexpf __builtin_cexpf
#define clogf __builtin_clogf
#define clog10f __builtin_clog10f
#define cpowf __builtin_cpowf
#define csqrtf __builtin_csqrtf
#define cprojf __builtin_cprojf
#define creall __builtin_creall
#define cimagl __builtin_cimagl
#define cargl __builtin_cargl
#define cabsl __builtin_cabsl
#define conjl __builtin_conjl
#define cacosl __builtin_cacosl
#define casinl __builtin_casinl
#define catanl __builtin_catanl
#define ccosl __builtin_ccosl
#define csinl __builtin_csinl
#define ctanl __builtin_ctanl
#define cacoshl __builtin_cacoshl
#define casinhl __builtin_casinhl
#define catanhl __builtin_catanhl
#define ccoshl __builtin_ccoshl
#define csinhl __builtin_csinhl
#define ctanhl __builtin_ctanhl
#define cexpl __builtin_cexpl
#define clogl __builtin_clogl
#define clog10l __builtin_clog10l
#define cpowl __builtin_cpowl
#define csqrtl __builtin_csqrtl
#define cprojl __builtin_cprojl
#define M_E 2.7182818284590452354
#define M_LOG2E 1.4426950408889634074
#define M_LOG10 0.43429448190325182765
#define M_LN2 0.69314718055994530942
#define M_LN10 2.30258509299404568402
#define M_PI 3.14159265358979323846
#define M_PI_2 1.57079632679489661923
#define M_PI_4 0.78539816339744830962
#define M_1_PI 0.31830988618379067154
#define M_2_PI 0.63661977236758134308
#define M_2_SQRTP 1.12837916709551257390
#define M_SQRT2 1.41421356237309504880
#define M_SQRT1_ 0.70710678118654752440
#define huge_val __builtin_huge_val
#define huge_vall __builtin_huge_vall
#define huge_valf __builtin_huge_valf
#define sin __builtin_sin
#define cos __builtin_cos
#define tan __builtin_tan
#define sinh __builtin_sinh
#define cosh __builtin_cosh
#define tanh __builtin_tanh
#define asin __builtin_asin
#define acos __builtin_acos
#define atan __builtin_atan
#define atan2 __builtin_atan2
#define exp __builtin_exp
#define log __builtin_log
#define log10 __builtin_log10
#define pow __builtin_pow
#define sqrt __builtin_sqrt
#define ceil __builtin_ceil
#define floor __builtin_floor
#define fabsf __builtin_fabsf
#define fabsl __builtin_fabsl
#define fabs __builtin_fabs
#define fabsf __builtin_fabsf
#define ldexp __builtin_ldexp
#define frexp __builtin_frexp
#define modf __builtin_modf
#define fmod __builtin_fmod
#define sincos __builtin_sincos
#define sincosl __builtin_sincosl
#define sincosf __builtin_sincosf
#define abs __builtin_abs
#define labs __builtin_labs
#define finite __builtin_finite
#define fpclassify __builtin_fpclassify
#define trap __builtin_trap
#define sinf __builtin_sinf
#define sinl __builtin_sinl
#define cosf __builtin_cosf
#define cosl __builtin_cosl
#define tanf __builtin_tanf
#define tanl __builtin_tanl
#define asinf __builtin_asinf
#define asinl __builtin_asinl
#define acosf __builtin_acosf
#define acosl __builtin_acosl
#define atanf __builtin_atanf
#define atanl __builtin_atanl
#define atan2f __builtin_atan2f
#define atan2l __builtin_atan2l
#define sinhf __builtin_sinhf
#define sinhf __builtin_sinhf
#define sinhl __builtin_sinhl
#define coshf __builtin_coshf
#define coshf __builtin_coshf
#define coshl __builtin_coshl
#define tanhf __builtin_tanhf
#define tanhf __builtin_tanhf
#define tanhl __builtin_tanhl
#define acosh __builtin_acosh
#define acoshf __builtin_acoshf
#define acoshl __builtin_acoshl
#define asinh __builtin_asinh
#define asinhf __builtin_asinhf
#define asinhl __builtin_asinhl
#define atanh __builtin_atanh
#define atanhf __builtin_atanhf
#define atanhl __builtin_atanhl
#define expf __builtin_expf
#define expf __builtin_expf
#define expl __builtin_expl
#define exp2 __builtin_exp2
#define exp2f __builtin_exp2f
#define exp2l __builtin_exp2l
#define expm1 __builtin_expm1
#define expm1f __builtin_expm1f
#define expm1l __builtin_expm1l
#define frexpf __builtin_frexpf
#define frexpf __builtin_frexpf
#define frexpl __builtin_frexpl
#define ilogb __builtin_ilogb
#define ilogbf __builtin_ilogbf
#define ilogbl __builtin_ilogbl
#define ldexpf __builtin_ldexpf
#define ldexpf __builtin_ldexpf
#define ldexpl __builtin_ldexpl
#define logf __builtin_logf
#define logl __builtin_logl
#define log10f __builtin_log10f
#define log10l __builtin_log10l
#define log1p __builtin_log1p
#define log1pf __builtin_log1pf
#define log1pl __builtin_log1pl
#define log2 __builtin_log2
#define log2f __builtin_log2f
#define log2l __builtin_log2l
#define logb __builtin_logb
#define logbf __builtin_logbf
#define logbl __builtin_logbl
#define modff __builtin_modff
#define modfl __builtin_modfl
#define scalbn __builtin_scalbn
#define scalbnf __builtin_scalbnf
#define scalbnl __builtin_scalbnl
#define scalbln __builtin_scalbln
#define scalblnf __builtin_scalblnf
#define scalblnl __builtin_scalblnl
#define cbrt __builtin_cbrt
#define cbrtf __builtin_cbrtf
#define cbrtl __builtin_cbrtl
#define hypot __builtin_hypot
#define hypotf __builtin_hypotf
#define hypotf __builtin_hypotf
#define hypotl __builtin_hypotl
#define powf __builtin_powf
#define powf __builtin_powf
#define powl __builtin_powl
#define sqrtf __builtin_sqrtf
#define sqrtl __builtin_sqrtl
#define erf __builtin_erf
#define erff __builtin_erff
#define erfl __builtin_erfl
#define erfc __builtin_erfc
#define erfcf __builtin_erfcf
#define erfcl __builtin_erfcl
#define lgamma __builtin_lgamma
#define lgammaf __builtin_lgammaf
#define lgammal __builtin_lgammal
#define tgamma __builtin_tgamma
#define tgammaf __builtin_tgammaf
#define tgammal __builtin_tgammal
#define ceilf __builtin_ceilf
#define ceill __builtin_ceill
#define floorf __builtin_floorf
#define floorl __builtin_floorl
#define nearbyint __builtin_nearbyint
#define nearbyintf __builtin_nearbyintf
#define nearbyintl __builtin_nearbyintl
#define rint __builtin_rint
#define rintf __builtin_rintf
#define rintl __builtin_rintl
#define lrint __builtin_lrint
#define lrintf __builtin_lrintf
#define lrintl __builtin_lrintl
#define llrint __builtin_llrint
#define llrintf __builtin_llrintf
#define llrintl __builtin_llrintl
#define round __builtin_round
#define roundf __builtin_roundf
#define roundl __builtin_roundl
#define lround __builtin_lround
#define lroundf __builtin_lroundf
#define lroundl __builtin_lroundl
#define llround __builtin_llround
#define llroundf __builtin_llroundf
#define llroundl __builtin_llroundl
#define trunc __builtin_trunc
#define truncf __builtin_truncf
#define truncl __builtin_truncl
#define fmodf __builtin_fmodf
#define fmodl __builtin_fmodl
#define remainder __builtin_remainder
#define remainderf __builtin_remainderf
#define remainderl __builtin_remainderl
#define remquo __builtin_remquo
#define remquof __builtin_remquof
#define remquol __builtin_remquol
#define copysign __builtin_copysign
#define copysignf __builtin_copysignf
#define copysignl __builtin_copysignl
#define nan __builtin_nan
#define nanf __builtin_nanf
#define nanl __builtin_nanl
#define nextafter __builtin_nextafter
#define nextafterf __builtin_nextafterf
#define nextafterl __builtin_nextafterl
#define nexttoward __builtin_nexttoward
#define nexttowardf __builtin_nexttowardf
#define nexttowardl __builtin_nexttowardl
#define fdim __builtin_fdim
#define fdimf __builtin_fdimf
#define fdiml __builtin_fdiml
#define fmax __builtin_fmax
#define fmaxf __builtin_fmaxf
#define fmaxl __builtin_fmaxl
#define fmin __builtin_fmin
#define fminf __builtin_fminf
#define fminl __builtin_fminl
#define fma __builtin_fma
#define fmaf __builtin_fmaf
#define fmal __builtin_fmal
#define isgreater __builtin_isgreater
#define isgreaterequal __builtin_isgreaterequal
#define isless __builtin_isless
#define islessequal __builtin_islessequal
#define islessgreater __builtin_islessgreater
#define isunordered __builtin_isunordered
#define isalpha __builtin_isalpha
#define isupper __builtin_isupper
#define islower __builtin_islower
#define isdigit __builtin_isdigit
#define isxdigit __builtin_isxdigit
#define isspace __builtin_isspace
#define ispunct __builtin_ispunct
#define isalnum __builtin_isalnum
#define isprint __builtin_isprint
#define isgraph __builtin_isgraph
#define iscntrl __builtin_iscntrl
#define toupper __builtin_toupper
#define tolower __builtin_tolower
#define isblank __builtin_isblank
#define iswalpha __builtin_iswalpha
#define iswupper __builtin_iswupper
#define iswlower __builtin_iswlower
#define iswdigit __builtin_iswdigit
#define iswxdigit __builtin_iswxdigit
#define iswspace __builtin_iswspace
#define iswpunct __builtin_iswpunct
#define iswalnum __builtin_iswalnum
#define iswprint __builtin_iswprint
#define iswgraph __builtin_iswgraph
#define iswcntrl __builtin_iswcntrl
#define isascii __builtin_isascii
#define towupper __builtin_towupper
#define towlower __builtin_towlower
#define iswcntrl __builtin_iswcntrl
#define iswblank __builtin_iswblank
#define errno (*_errno())
#define feclearexcept __builtin_feclearexcept
#define fegetexceptflag __builtin_fegetexceptflag
#define feraiseexcept __builtin_feraiseexcept
#define fesetexceptflag __builtin_fesetexceptflag
#define fetestexcept __builtin_fetestexcept
#define fegetround __builtin_fegetround
#define fesetround __builtin_fesetround
#define fegetenv __builtin_fegetenv
#define fesetenv __builtin_fesetenv
#define feupdateenv __builtin_feupdateenv
#define feholdexcept __builtin_feholdexcept
#define frame_address __builtin_frame_address
#define setjmp __builtin_setjmp
#define longjmp __builtin_longjmp
#define int8_t signed char
#define uint8_t unsigned char
#define int16_t signed short int
#define uint16_t unsigned short int
#define int32_t signed int
#define uint32_t unsigned int
#define int64_t signed long long int
#define uint64_t unsigned long long int
#define int_least8_t signed char
#define uint_least8_t unsigned char
#define int_least16_t signed short int
#define uint_least16_t unsigned short int
#define int_least32_t signed int
#define uint_least32_t unsigned int
#define int_least64_t signed long long int
#define uint_least64_t unsigned long long int
#define int_fast8_t signed char
#define uint_fast8_t unsigned char
#define int_fast16_t signed short int
#define uint_fast16_t unsigned short int
#define int_fast32_t signed int
#define uint_fast32_t unsigned int
#define int_fast64_t signed long long int
#define uint_fast64_t unsigned long long int
#define intmax_t signed long long int
#define uintmax_t unsigned long long int
#define INT8_MIN (-128)
#define INT16_MIN (-32768)
#define INT32_MIN (-2147483647 - 1)
#define INT64_MIN  (-9223372036854775807LL - 1)
#define INT8_MAX 127
#define INT16_MAX 32767
#define INT32_MAX 2147483647
#define INT64_MAX 9223372036854775807LL
#define UINT8_MAX 255
#define UINT16_MAX 65535
#define UINT32_MAX 0xffffffffU
#define UINT64_MAX 0xffffffffffffffffULL
#define _Exit __builtin__Exit
#define execl __builtin_execl
#define execle __builtin_execle
#define execlp __builtin_execlp
#define execv __builtin_execv
#define execve __builtin_execve
#define execvp __builtin_execvp
#define clock_t long
#define time_t __int64
#define CLOCKS_PER_SEC 1000
#define _daylight (* __daylight())
#define _dstbias (* __dstbias())
#define _timezone (* __timezone())
#define _tzname (__tzname())
#define strftime __builtin_strftime
#if __ALSO_USE_CUSTOM_MACROS_FOR_BUILTINS_H_LIBRARY__
// my macros. not builtin
#define ctoi(c) ((int) (c - 48))
#define ctol(c) ((long) (c - 48))
#define ctoa(c) ((char *) c)
#define substr(str, index) (str[index])
#define stringify_bool(b) (b ? "true" : "false")
#define ullong unsigned long long int
#define llong signed long long int
#define error(str, err) ({\
	fprintf(stderr, "ERROR:%s:%llu: %s\n", __FILE__, __LINE__, (char *)str);\
	exit((int) err);\
	0ULL/*so gcc will let me use the macro in operations*/; })
#define alloc(n1, n2) __builtin_malloc((n1) * (n2))
#define max(x, y) ({ typeof(x) a = (x); typeof(y) b = (y); (a > b ? a : b); })
#define min(x, y) ({ typeof(x) a = (x); typeof(y) b = (y); (a < b ? a : b); })
#define swap(x, y) ({/*only evaluates each input once. takes values not addresses*/\
	typeof(x) *_x = &(x);\
	typeof(x) *t = _x;\
	typeof(y) *_y = &(y);\
	*_x = (typeof(x)) *_y;\
	*_y = (typeof(y)) *t;\
	0ULL/*so gcc will let me use the macro in operations*/; })
#endif
#endif // ifndef __LIBRARY_MINGW_GCC_BUILTINS__
