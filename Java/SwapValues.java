class SwapValues {
	private static <T> void swap(Wrapper<T> x, Wrapper<T> y) {
		T tmp = x.value;
		x.value = y.value;
		y.value = tmp;
	}

	public static void main(String argv[]) {
		var x = new Wrapper<Integer>(1);
		var y = new Wrapper<Integer>(2);

		System.out.println("x = " + x);
		System.out.println("y = " + y);
		swap(x, y);

		System.out.println("x = " + x);
		System.out.println("y = " + y);
	}
}

class Wrapper<T> {
	public T value;

	public Wrapper(T _value) {
		value = _value;
	}
	public toString() {
		return value.toString();
	}
}
