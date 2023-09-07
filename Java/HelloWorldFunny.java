// This is my honest attempt at writing Hello World in Java :)

import java.io.PrintStream;
import java.util.ArrayList;

public class HelloWorldFunny extends Object {
	public static void main(String[] args) {
		ConcreteHelloPrinterWrapperManagerFactory printerManagerFactory = new ConcreteHelloPrinterWrapperManagerFactory();
		ConcreteHelloPrinterWrapperManager printerManager = printerManagerFactory.nextManager();

		printerManager.addNextPrinter(false);

		ConcreteHelloPrinterWrapper printer = printerManager.getLatestPrinter();

		printer.printHello();
	}
}

interface HelloPrinterInterface {
	void printHello();
	boolean getIsPrinting();
	PrintStream getOutputFile();
	void setIsPrinting(boolean newIsPrinting);
	void getOutputFile(PrintStream newOutputFile);
}

abstract class AbstractHelloPrinterWrapper extends Object {
	protected boolean printing;
	protected PrintStream outputFile;

	abstract public void printHello();

	public boolean getIsPrinting() {
		return printing;
	}

	public PrintStream getOutputFile() {
		return outputFile;
	}

	public abstract void setIsPrinting(boolean newIsPrinting);
	public abstract void getOutputFile(PrintStream newOutputFile);
}

class ConcreteHelloPrinterWrapper extends AbstractHelloPrinterWrapper implements HelloPrinterInterface {
	protected static <T> void printlnToOutputFile(T x) {
		ConcreteHelloPrinterWrapper.printToOutputFile(x);
		ConcreteHelloPrinterWrapper.printToOutputFile("\n");
	}

	protected static void printlnToOutputFile() {
		ConcreteHelloPrinterWrapper.printToOutputFile("\n");
	}

	protected static <T> void printToOutputFile(T x) {
		java.lang.System.out.print(x);
	}

	public ConcreteHelloPrinterWrapper(PrintStream outputFile_, boolean silent_) {
		this.printing = !silent_;
		this.outputFile = outputFile_;
	}

	@Override
	public void printHello() {
		if (this.getIsPrinting() == true) {
			ConcreteHelloPrinterWrapper.printlnToOutputFile("Hello World");
		}
	}

	// public boolean getIsPrinting
	// public PrintStream getOutputFile

	@Override
	public void setIsPrinting(boolean newIsPrinting) {
		this.printing = newIsPrinting;
	}

	@Override
	public void getOutputFile(PrintStream newOutputFile) {
		this.outputFile = newOutputFile;
	}
}

class ConcreteHelloPrinterWrapperManager extends Object {
	private ArrayList<ConcreteHelloPrinterWrapper> helloPrinters = new ArrayList<ConcreteHelloPrinterWrapper>();

	public ConcreteHelloPrinterWrapper nextPrinter(Boolean silent) {
		return new ConcreteHelloPrinterWrapper( java.lang.System.out, silent );
	}

	public void addPrinter(ConcreteHelloPrinterWrapper printer) {
		this.helloPrinters.add( printer );
	}

	public ConcreteHelloPrinterWrapper addNextPrinter(Boolean silent) {
		ConcreteHelloPrinterWrapper nextPrinter = this.nextPrinter( silent );
		this.helloPrinters.add( nextPrinter );
		return nextPrinter;
	}

	public ConcreteHelloPrinterWrapper getPrinter(Integer index) {
		return this.helloPrinters.get( index );
	}

	public ConcreteHelloPrinterWrapper getLatestPrinter() {
		return this.helloPrinters.get( this.helloPrinters.size() - 1 );
	}

	public Integer numberOfPrintersManaged() {
		return this.helloPrinters.size();
	}
}

class ConcreteHelloPrinterWrapperManagerFactory extends Object {
	private ConcreteHelloPrinterWrapperManager _nextManager() {
		// this code might change in the future
		return new ConcreteHelloPrinterWrapperManager();
	}
	public ConcreteHelloPrinterWrapperManager nextManager() {
		return this._nextManager();
	}
}
