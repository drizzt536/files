import java.io.PrintStream;

public class HelloWorldFunny extends Object {
	public static void main(String[] args) {
		PrintHelloWrapper helloPrinter = PrintHelloWrapperFactory.generateNewHelloPrinter(false);
		helloPrinter.printHello();
	}
}

class PrintHelloWrapper extends Object {
	protected final boolean printing;
	protected final PrintStream outputFile;

	protected static <T> void printlnToOutputFile(T x) {
		PrintHelloWrapper.printToOutputFile(x);
		PrintHelloWrapper.printToOutputFile("\n");
	}
	protected static <T> void printToOutputFile(T x) {
		java.lang.System.out.print(x);
	}
	public PrintHelloWrapper(PrintStream _outputFile, boolean _silent) {
		printing = !_silent;
		outputFile = _outputFile;
	}
	public void printHello() {
		if (isPrinting() == true) {
			PrintHelloWrapper.printlnToOutputFile("Hello World");
		}
	}
	public boolean isPrinting() {
		return printing;
	}
	public PrintStream getOutputFile() {
		return outputFile;
	}
}

class PrintHelloWrapperFactory extends Object {
	public static PrintHelloWrapper generateNewHelloPrinter(boolean silent) {
		return new PrintHelloWrapper(java.lang.System.out, silent);
	}
}

// generates a shorter bytecode than this (by 13 bits):
/*
class HelloWorld1 {
	public static void main(String argv[]) {
		System.out.println("Hello World");
	}
}
*/
