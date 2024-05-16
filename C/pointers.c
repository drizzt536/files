#define printf __builtin_printf

int main(void) {
	int n         = 2;
	int *p1       = &n;
	int **p2      = &p1;
	int ***p3     = &p2;
	int ****p4    = &p3;
	int *****p5   = &p4;
	int ******p6  = &p5;
	int *******p7 = &p6;

	printf("%d\n%p\n%p\n%p\n%p\n%p\n%p\n%p\n%d\n", n, p1, p2, p3, p4, p5, p6, p7, *******p7);
	return 0;
}
