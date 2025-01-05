// This is my honest attempt at writing Hello World in Java ;)

// ChatGPT said it wants to be called "Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks", that wasn't my doing. I was just allowing it to be called what it wants to be called.

// this package line is only commented out because I don't feel like making the file structure.
// package com.website.programs.javaprograms.utility.output.print.helloworld;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Random;
import java.io.PrintStream;
import java.lang.*;

/**
 * A basic implementation of a "Hello World" program.
 * Implements the {@link HelloWorldMainProgramInterface} interface.
 * 
 * <p>This class demonstrates the use of the
 * {@link ConcreteHelloPrinterWrapperManagerFactory} and
 * {@link ConcreteHelloPrinterWrapperManager} to create and
 * manage a printer wrapper  that outputs "Hello World".
 * It provides a concrete example of how the printer
 * management system can be utilized.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
public final class HelloWorldWithOOP extends Object implements HelloWorldMainProgramInterface {
	/**
	 * Default constructor, given explicitly to stop javadoc from giving warnings.
	 * 
	 * Usage: {@code HelloWorldWithOOP x = new HelloWorldWithOOP();}
	 */
	public HelloWorldWithOOP() {}

	/**
	 * The entry point of "Hello World" program.
	 * 
	 * <p>This method creates a {@link ConcreteHelloPrinterWrapperManagerFactory}
	 * to obtain  a {@link ConcreteHelloPrinterWrapperManager} instance. It then
	 * adds a new printer,  ensures printing is enabled, and prints "Hello World"
	 * 
	 * @param args command-line arguments passed to the program (not used).
	 * 
	 * @see ConcreteHelloPrinterWrapperManagerFactory
	 * @see ConcreteHelloPrinterWrapperManagerFactory#getNextManagerInstance()
	 * @see ConcreteHelloPrinterWrapperManager
	 * @see ConcreteHelloPrinterWrapperManager#getLatestPrinter
	 * @see ConcreteHelloPrinterWrapper#getIsPrinting()
	 * @see ConcreteHelloPrinterWrapper#toggleIsPrinting()
	 * @see ConcreteHelloPrinterWrapper#printHello()
	 */
	public static void main(String[] args) {
		final ConcreteHelloPrinterWrapperManagerFactory factory = new ConcreteHelloPrinterWrapperManagerFactory();
		final ConcreteHelloPrinterWrapperManager manager = factory.getNextManagerInstance();

		manager.addNextPrinter();

		final ConcreteHelloPrinterWrapper printer = manager.getLatestPrinter();

		if (printer.getIsPrinting() == false) {
			printer.toggleIsPrinting();
		}

		printer.printHello();
	}
}

/**
 * A marker interface for classes that implement a main method.
 * 
 * <p>This interface serves as a way to indicate that a class contains a 
 * {@code main} method to serve as the program's entry point. While the 
 * method is defined here as a static member, it is expected that 
 * implementing classes will override and provide their own implementation.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
interface HelloWorldMainProgramInterface {
	/**
	 * The example program entry point.
	 * 
	 * <p>This method prints "Hello World" to the standard output.
	 * 
	 * @param args command-line arguments passed to the program (not used).
	 */
	static void main(String[] args) {
		System.out.println("Hello World");
	}
}

/**
 * Defines a general contract for managing printing behavior and output streams.
 * 
 * <p>This interface provides methods to control the state of printing, retrieve 
 * or modify the output destination, and toggle the printing functionality.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
interface AbstractGeneralPrinterInterface {
	/**
	 * Retrieves the current printing state.
	 * 
	 * @return {@code true} if printing is enabled, {@code false} otherwise.
	 */
	java.lang.Boolean getIsPrinting();

	/**
	 * Toggles the current printing state.
	 * 
	 * <p>If printing is enabled, this will disable it, and vice versa.
	 */
	void toggleIsPrinting();

	/**
	 * Retrieves the current output stream used for printing.
	 * 
	 * @return the {@link PrintStream} currently set as the output destination.
	 */
	java.io.PrintStream getOutputFile();

	/**
	 * Sets a new output stream for printing.
	 * 
	 * @param newOutputFile the new {@link PrintStream} to be
	 *                      used as the output destination.
	 */
	void setOutputFile(java.io.PrintStream newOutputFile);
}

/**
 * Defines the contract for classes that provide
 * functionality to print a "Hello World" message.
 * 
 * <p>Implementing classes are expected to handle the specific behavior
 * of printing a predefined "Hello World" message, which may include
 * customization or validation specific to their implementation.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
interface ConcreteHelloPrinterInterface {
	/**
	 * Prints the "Hello World" message.
	 * Takes in no arguments and does not return anything.
	 */
	void printHello();
}

/**
 * Abstract base class for managing generic printer functionality with
 * a configurable output file. This class provides foundational behavior
 * for handling messages and printing them conditionally, while allowing
 * specific implementations to define message validity checks.
 * 
 * <p>
 * This class is part of a general framework for managing
 * and validating printing behavior, and it is extended by
 * classes like {@link AbstractGeneralStringPrinterWrapper}.
 * 
 * @param <T> The type of message handled by the printer wrapper.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
sealed abstract class AbstractGeneralPrinterWrapper<T extends Object>
	extends Object
	implements AbstractGeneralPrinterInterface
	permits AbstractGeneralStringPrinterWrapper {
	/**
	 * The current output stream to which messages are printed.
	 * Defaults to {@link System#out}.
	 * private property.
	 */
	private java.io.PrintStream outputFile = java.lang.System.out;

	/**
	 * Boolean flag indicating whether printing is enabled.
	 * Initialized to either true or false.
	 * private property.
	 */
	private java.lang.Boolean isPrinting = new Random().nextBoolean();

	/**
	 * The current message being handled by the printer wrapper.
	 * Initially set to {@code null}.
	 * private property.
	 */
	private T message = null;

	/**
	 * Constructs an instance of {@link AbstractGeneralPrinterWrapper} with no arguments.
	 */
	public AbstractGeneralPrinterWrapper() {}

	/**
	 * Checks the validity of a given message.
	 * Subclasses must implement this method to
	 * define specific validation rules for messages.
	 * 
	 * @param message The message to validate.
	 * @return {@code true} if the message is valid, otherwise {@code false}.
	 */
	abstract java.lang.Boolean checkMessageValidity(T message);

	/**
	 * Prints a given object to the current output file, followed by a newline.
	 * 
	 * @param <U>  The type of object to print.
	 * @param x    The object to print.
	 * @deprecated Use {@link #printToOutputFile(Object)} instead for printing
	 *             without newline, or append a newline manually as needed.
	 * 
	 * @see #printToOutputFile
	 * @see #printlnToOutputFile()
	 */
	@Deprecated
	private <U extends Object> void printlnToOutputFile(U x) {
		this.printToOutputFile(x);
		this.printToOutputFile("\n");
	}

	/**
	 * Prints a newline to the current output file.
	 * 
	 * @deprecated Use {@link #printToOutputFile(Object)} to print
	 *             messages, appending newlines manually as needed.
	 * 
	 * @see #printToOutputFile
	 * @see #printlnToOutputFile(Object)
	 */
	@Deprecated
	private void printlnToOutputFile() {
		this.printToOutputFile("\n");
	}

	/**
	 * Prints a given object to the current output file.
	 * 
	 * @param <U> The type of object to print.
	 * @param x   The object to print.
	 * 
	 * @see #outputFile
	 */
	private <U extends Object> void printToOutputFile(U x) {
		this.outputFile.print(x);
	}

	/**
	 * Sets the message to be handled by this printer wrapper.
	 * 
	 * @param newMessage The new message to set.
	 * 
	 * @see #message
	 */
	protected void setMessage(T newMessage) {
		this.message = newMessage;
	}

	/**
	 * Prints the given message if it is valid and printing is enabled.
	 * 
	 * @param message The message to print.
	 * @throws IllegalArgumentException If the message is invalid.
	 * 
	 * @see #checkMessageValidity
	 * @see #getIsPrinting
	 * @see #printToOutputFile
	 * @see IllegalArgumentException
	 */
	protected void printGeneral(T message) throws IllegalArgumentException {
		if (this.checkMessageValidity(message) == false) {
			throw new IllegalArgumentException("Failed");
		}

		if (this.getIsPrinting() == true) {
			this.printToOutputFile(message);
		}
	}

	/**
	 * Retrieves the current printing status.
	 * 
	 * @return {@code true} if printing is enabled, otherwise {@code false}.
	 * 
	 * @see #isPrinting
	 * @see Boolean
	 */
	public java.lang.Boolean getIsPrinting() {
		return isPrinting;
	}

	/**
	 * Retrieves the current output stream.
	 * 
	 * @return The current {@link PrintStream} for output.
	 * 
	 * @see #outputFile
	 */
	public java.io.PrintStream getOutputFile() {
		return outputFile;
	}

	/**
	 * Toggles the printing status.
	 * If printing is currently enabled, it will be disabled, and vice versa.
	 * 
	 * @see #isPrinting
	 */
	public void toggleIsPrinting() {
		this.isPrinting = !this.isPrinting;
	}

	/**
	 * Sets a new output stream for this printer wrapper.
	 * 
	 * @param newOutputFile The new {@link PrintStream} to use for output.
	 * 
	 * @see #outputFile
	 */
	public void setOutputFile(java.io.PrintStream newOutputFile) {
		this.outputFile = newOutputFile;
	}
}

/**
 * Abstract class for wrappers that manage {@link String} objects in
 * the context of general printer functionality. This class extends
 * {@link AbstractGeneralPrinterWrapper} and implements
 * {@link AbstractGeneralPrinterInterface}. It serves as the base
 * class for printer wrappers that handle string messages.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
sealed abstract class AbstractGeneralStringPrinterWrapper
	extends AbstractGeneralPrinterWrapper<String>
	implements AbstractGeneralPrinterInterface
	permits ConcreteHelloPrinterWrapper {
	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapper} with no arguments.
	 * Initializes the wrapper by calling the constructor of the superclass.
	 */
	public AbstractGeneralStringPrinterWrapper() {
		super();
	}
}

/**
 * A concrete implementation of {@link AbstractGeneralStringPrinterWrapper}
 * designed to print "Hello World". This class ensures that the message is
 * always "Hello World" and provides functionality to print it.
 * 
 * <p>
 * Implements both {@link AbstractGeneralPrinterInterface} and
 * {@link ConcreteHelloPrinterInterface}.
 * </p>
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
final class ConcreteHelloPrinterWrapper
	extends AbstractGeneralStringPrinterWrapper
	implements AbstractGeneralPrinterInterface, ConcreteHelloPrinterInterface {
	// make sure the string is in at least 3 places, so you can maximize the
	// probability of forgetting one if you ever change it

	/**
	 * Constructs an instance of {@link ConcreteHelloPrinterWrapper} with no arguments.
	 * The default message is set to "Hello World".
	 * 
	 * Example: {@code ConcreteHelloPrinterWrapper w = new ConcreteHelloPrinterWrapper();}
	 * 
	 * @see AbstractGeneralStringPrinterWrapper
	 */
	public ConcreteHelloPrinterWrapper() {
		super();
		this.setMessage("Hello World\n");
	}

	/**
	 * Validates the given message to ensure it matches "Hello World".
	 * 
	 * @param message The message to validate.
	 * @return {@code true} if the message is valid, {@code false} otherwise.
	 * 
	 * @see String
	 * @see Boolean
	 */
	@Override
	protected java.lang.Boolean checkMessageValidity(java.lang.String message) {
		return message.equals("Hello World\n");
	}

	/**
	 * Prints the "Hello World" message using the general print
	 * method from the superclass.
	 * 
	 * @see #printGeneral
	 */
	public void printHello() {
		super.printGeneral("Hello World\n");
	}
}

/**
 * Interface for managing a collection of {@link AbstractGeneralStringPrinterWrapper}
 * objects. It defines methods for adding printers, retrieving printers by index, and
 * managing the number of printers.
 * 
 * @param <T> The type of printer managed, which extends
 *            {@link AbstractGeneralStringPrinterWrapper}.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
interface AbstractGeneralStringPrinterWrapperManagerInterface
	<T extends AbstractGeneralStringPrinterWrapper> {

	/**
	 * Adds a specified printer to the collection of printers managed by the implementing class.
	 * 
	 * @param printer The printer to add to the collection.
	 */
	void addPrinter(T printer);

	/**
	 * Adds a new printer to the collection by creating a new
	 * instance of the managed printer type. The specific
	 * printer type is determined by the implementing class.
	 */
	void addNextPrinter();

	/**
	 * Retrieves a printer from the collection based on its index.
	 * 
	 * @param index The index of the printer to retrieve.
	 * @return The printer at the specified index in the collection.
	 * @throws IndexOutOfBoundsException If the index is out of range.
	 * 
	 * @see IndexOutOfBoundsException
	 */
	T getPrinter(java.lang.Integer index) throws IndexOutOfBoundsException;

	/**
	 * Retrieves the most recently added printer from the collection.
	 * 
	 * @return The latest printer added to the collection.
	 * @throws IndexOutOfBoundsException If there are no printers.
	 * 
	 * @see IndexOutOfBoundsException
	 */
	T getLatestPrinter() throws IndexOutOfBoundsException;

	/**
	 * Returns the total number of printers currently
	 * managed by the implementing class.
	 * 
	 * @return The number of printers in the collection.
	 */
	java.lang.Integer getNumberOfPrintersManaged();
}

/**
 * This exception class handles errors specific to the {@link HelloWorldWithOOP}
 * program. returns an exception related to the
 * {@link AbstractGeneralStringPrinterWrapperManager} class.
 * <br>
 * This exception API is perfectly created to force you
 * to use one of the following OOP best practices:
 * 
 * <pre>
 * // 1
 * try {
 *     f();
 * } catch (Exception e) {
 *     throw e; // rethrow the error because you don't know what it means
 * }
 * // 2
 * try {
 *     f();
 * } catch (Exception e) {
 *     // ignore the error because it doesn't sound important
 * }
 * </pre>
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see RuntimeException
 * @see Exception
 * @see Throwable
 * @see Object
 */
final class AbstractGeneralStringPrinterWrapperManagerException extends RuntimeException {
	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerException} with two arguments.
	 * 
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerException e2 = new AbstractGeneralStringPrinterWrapperManagerException("message", e1);}
	 *
	 * @param msg the message to put in the exception string
	 * @param e   the exception causing this exception
	 */
	public AbstractGeneralStringPrinterWrapperManagerException(String msg, Exception e) {
		// deliberately ignore arguments, but allow them to be given.
		this(msg);
	}

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerException} with one argument.
	 *
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerException e = new AbstractGeneralStringPrinterWrapperManagerException("message");}
	 *
	 * @param msg the message to put in the exception string
	 */
	public AbstractGeneralStringPrinterWrapperManagerException(String msg) {
		// because fuck you.
		super("");
	}

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerFactoryException} with no arguments.
	 *
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerFactoryException e = new AbstractGeneralStringPrinterWrapperManagerFactoryException();}
	 *
	 * @deprecated this constructor is deprecated, use one of the other two.
	 */
	@Deprecated
	public AbstractGeneralStringPrinterWrapperManagerException() {
		super("");
	}
}

/**
 * A sealed abstract class for managing a collection of string printer wrappers.
 * This class provides a base implementation for managing a list of printer wrappers 
 * of a specific type, with lifecycle operations and utility methods for accessing 
 * the printers. It is extended by {@link ConcreteHelloPrinterWrapperManager}.
 * 
 * @param <T> the type of printer wrappers managed, which must
 *            extend {@link AbstractGeneralStringPrinterWrapper}.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
sealed abstract class AbstractGeneralStringPrinterWrapperManager
	<T extends AbstractGeneralStringPrinterWrapper>
	extends Object
	implements AbstractGeneralStringPrinterWrapperManagerInterface<T>
	permits ConcreteHelloPrinterWrapperManager {

	/**
	 * The {@code ArrayList} of printer wrappers managed by this manager.
	 * Each element in the list represents an instance of a specific type
	 * of printer wrapper. Has no default value.
	 * 
	 * @see ArrayList
	 */
	private final ArrayList<T> printerList = new ArrayList<T>();

	/**
	 * The {@code Class} object representing the type of printer
	 * wrapper managed by this manager. Used for dynamically
	 * creating new instances of the specified printer wrapper type.
	 * Has no default value.
	 * 
	 * @see Class
	 */
	private final Class<T> _class;

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManager} with one argument.
	 * 
	 * @param _class the {@link Class} object representing the type of printer wrappers managed.
	 * 
	 * @see #_class
	 */
	public AbstractGeneralStringPrinterWrapperManager(Class<T> _class) {
		this._class = _class;
	}

	/**
	 * Creates a new instance of the printer wrapper using its default constructor.
	 * This method is protected and intended to be used internally or by subclasses.
	 * 
	 * @return a new instance of the printer wrapper.
	 * @throws AbstractGeneralStringPrinterWrapperManagerException
	 *         if the instance cannot be created.
	 * 
	 * @see #_class
	 * @see AbstractGeneralStringPrinterWrapperManagerException
	 * @see InstantiationException
	 * @see IllegalAccessException
	 * @see NoSuchMethodException
	 * @see InvocationTargetException
	 */
	protected T nextPrinter() throws AbstractGeneralStringPrinterWrapperManagerException {
		try {
			return _class.getDeclaredConstructor().newInstance();
		} catch (InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
			throw new AbstractGeneralStringPrinterWrapperManagerException("new instance could not be created", e);
		}
	}

	/**
	 * Adds a printer wrapper to the manager's collection.
	 * Does not return a value.
	 * 
	 * @param printer the printer wrapper to add.
	 * 
	 * @see #printerList
	 */
	public void addPrinter(T printer) {
		this.printerList.add(printer);
	}

	/**
	 * Creates a new printer wrapper instance and adds it to the collection.
	 * Returns nothing.
	 * 
	 * @throws AbstractGeneralStringPrinterWrapperManagerException
	 *         if the instance cannot be created.
	 * 
	 * @see #nextPrinter
	 * @see #addPrinter
	 */
	public void addNextPrinter() throws AbstractGeneralStringPrinterWrapperManagerException {
		T nextPrinter = this.nextPrinter();
		this.addPrinter(nextPrinter);
	}

	/**
	 * Retrieves a printer wrapper at a specified index in the collection.
	 * 
	 * @param index the index of the printer wrapper to retrieve.
	 * @return the printer wrapper at the specified index.
	 * @throws IndexOutOfBoundsException if the index is out of range.
	 * 
	 * @see #printerList
	 * @see IndexOutOfBoundsException
	 */
	public T getPrinter(java.lang.Integer index) throws IndexOutOfBoundsException {
		return this.printerList.get(index);
	}

	/**
	 * Retrieves the most recently added printer wrapper in the collection.
	 * 
	 * @return the latest printer wrapper in the collection.
	 * @throws IndexOutOfBoundsException if the collection is empty.
	 * 
	 * @see #getPrinter
	 * @see #printerList
	 * @see #getNumberOfPrintersManaged
	 * @see IndexOutOfBoundsException
	 */
	public T getLatestPrinter() throws IndexOutOfBoundsException {
		return this.getPrinter(this.getNumberOfPrintersManaged() - 1);
	}

	/**
	 * Returns the number of printer wrappers currently managed.
	 * 
	 * @return the number of printer wrappers in the collection.
	 * 
	 * @see #printerList
	 */
	public java.lang.Integer getNumberOfPrintersManaged() {
		return this.printerList.size();
	}
}

/**
 * A concrete implementation of {@link AbstractGeneralStringPrinterWrapperManager} 
 * and {@link AbstractGeneralStringPrinterWrapperManagerInterface}, specialized for 
 * managing instances of {@link ConcreteHelloPrinterWrapper}.
 * <p>
 * This class serves as the definitive implementation for managing the lifecycle 
 * and behavior of {@code ConcreteHelloPrinterWrapper} objects. It provides the 
 * required constructor to initialize the parent class with the appropriate type.
 * </p>
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
final class ConcreteHelloPrinterWrapperManager
	extends AbstractGeneralStringPrinterWrapperManager<ConcreteHelloPrinterWrapper>
	implements AbstractGeneralStringPrinterWrapperManagerInterface<ConcreteHelloPrinterWrapper> {
	/**
	 * Constructs a new instance of {@code ConcreteHelloPrinterWrapperManager} with no arguments.
	 * <p>
	 * This constructor initializes the superclass with the {@code ConcreteHelloPrinterWrapper} 
	 * class type, enabling the parent class to manage objects of this type.
	 * </p>
	 * 
	 * Example: {@code ConcreteHelloPrinterWrapperManager x = new ConcreteHelloPrinterWrapperManager();}
	 */
	public ConcreteHelloPrinterWrapperManager() {
		super(ConcreteHelloPrinterWrapper.class);
	}
}

/**
 * An interface defining the contract for factories that create instances
 * of {@link AbstractGeneralStringPrinterWrapperManagerFactory} or its subclasses.
 * <p>
 * This interface provides a single method, {@link #getNextManagerInstance()},
 * which is responsible for producing instances of the generic type {@code T}.
 * Implementations of this interface must specify the logic for instantiating
 * the manager objects.
 * </p>
 * 
 * @param <T> the type of manager that this factory produces, extending
 *            {@link AbstractGeneralStringPrinterWrapperManager}.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
interface AbstractGeneralStringPrinterWrapperManagerFactoryInterface
	<T extends AbstractGeneralStringPrinterWrapperManager> {
	/**
	 * Creates and returns a new instance of the manager class.
	 * <p>
	 * This method defines the core responsibility of the factory interface,
	 * ensuring that implementations provide a mechanism for creating
	 * instances of the specified manager type.
	 * </p>
	 * 
	 * @return a new instance of the manager class, of type {@code T}.
	 * @throws AbstractGeneralStringPrinterWrapperManagerFactoryException if the
	 *         manager instance could not be created.
	 */
	T getNextManagerInstance();
}

/**
 * This exception class handles errors specific to the {@link HelloWorldWithOOP}
 * program. returns an exception related to the
 * {@link AbstractGeneralStringPrinterWrapperManagerFactory} class.
 * <br>
 * This exception API is perfectly created to force you
 * to use one of the following OOP best practices:
 * 
 * <pre>
 * // 1
 * try {
 *     f();
 * } catch (Exception e) {
 *     throw e; // rethrow the error because you don't know what it means
 * }
 * // 2
 * try {
 *     f();
 * } catch (Exception e) {
 *     // ignore the error because it doesn't sound important
 * }
 * </pre>
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see RuntimeException
 * @see Exception
 * @see Throwable
 * @see Object
 */
final class AbstractGeneralStringPrinterWrapperManagerFactoryException extends RuntimeException {
	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerFactoryException} with two arguments.
	 * 
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerFactoryException e2 = new AbstractGeneralStringPrinterWrapperManagerFactoryException("message", e1);}
	 *
	 * @param msg the message to put in the exception string
	 * @param e   the exception causing this exception
	 */
	public AbstractGeneralStringPrinterWrapperManagerFactoryException(String msg, Exception e) {
		// deliberately ignore arguments, but allow them to be given. Because fuck you.
		this(msg);
	}

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerFactoryException} with one argument.
	 *
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerFactoryException e = new AbstractGeneralStringPrinterWrapperManagerFactoryException("message");}
	 *
	 * @param msg the message to put in the exception string
	 */
	public AbstractGeneralStringPrinterWrapperManagerFactoryException(String msg) {
		// give a helpful error message in case the exception class name wasn't enough.
		super("");
	}

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerFactoryException} with no arguments.
	 *
	 * Example: {@code AbstractGeneralStringPrinterWrapperManagerFactoryException e = new AbstractGeneralStringPrinterWrapperManagerFactoryException();}
	 *
	 * @deprecated this constructor is deprecated, use one of the other two.
	 */
	@Deprecated
	public AbstractGeneralStringPrinterWrapperManagerFactoryException() {
		super("");
	}
}

/**
 * A sealed abstract factory for creating instances of subclasses of
 * {@link AbstractGeneralStringPrinterWrapperManager}. This class provides
 * a base implementation for factories that manage the instantiation of
 * specific string printer wrapper managers.
 * 
 * @param <T> the type of manager created by the factory, extending 
 * {@link AbstractGeneralStringPrinterWrapperManager}.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see RuntimeException
 * @see Exception
 * @see Throwable
 * @see Object
 */
sealed abstract class AbstractGeneralStringPrinterWrapperManagerFactory
	<T extends AbstractGeneralStringPrinterWrapperManager>
	extends Object
	implements AbstractGeneralStringPrinterWrapperManagerFactoryInterface<T>
	permits ConcreteHelloPrinterWrapperManagerFactory {

	/**
	 * The {@code Class} object of the printer wrapper managers
	 * that the printer wrapper manager factory creates. 
	 */
	private final Class<T> _class;

	/**
	 * Constructs an instance of {@link AbstractGeneralStringPrinterWrapperManagerFactory} with one argument.
	 * 
	 * @param _class the {@link Class} object representing the type of manager
	 *               that this factory creates.
	 */
	public AbstractGeneralStringPrinterWrapperManagerFactory(Class<T> _class) {
		this._class = _class;
	}

	/**
	 * Creates and returns a new instance of the manager class.
	 * <p>
	 * This method is private because implementation details should remain
	 * encapsulated. It relies on reflection to instantiate the manager.
	 * 
	 * Example: {@code this._getNextManagerInstance()}
	 * 
	 * @return a new instance of the manager class.
	 * @throws AbstractGeneralStringPrinterWrapperManagerFactoryException if the
	 *         manager instance could not be created.
	 */
	private T _getNextManagerInstance() throws AbstractGeneralStringPrinterWrapperManagerFactoryException {
		try {
			return _class.getDeclaredConstructor().newInstance();
		} catch (InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
			throw new AbstractGeneralStringPrinterWrapperManagerFactoryException("instance could not be created", e);
		}
	}

	/**
	 * Returns a new instance of the manager class.
	 * <p>
	 * This method calls the internal {@link #_getNextManagerInstance()} to create
	 * the instance, ensuring encapsulation of implementation details.
	 * 
	 * Example: {@code new AbstractGeneralStringPrinterWrapperManagerFactory(cls).getNextManagerInstance()}
	 * 
	 * @return a new instance of the manager class.
	 * @throws AbstractGeneralStringPrinterWrapperManagerFactoryException if the
	 *         manager instance could not be created.
	 */
	public T getNextManagerInstance() throws AbstractGeneralStringPrinterWrapperManagerFactoryException {
		return this._getNextManagerInstance();
	}
}

/**
 * A factory class for creating instances of {@link ConcreteHelloPrinterWrapperManager}.
 * This class simplifies the creation of managers for hello printer wrappers.
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * 
 * @see HelloWorldWithOOP
 * @see HelloWorldMainProgramInterface
 * @see AbstractGeneralPrinterInterface
 * @see ConcreteHelloPrinterInterface
 * @see AbstractGeneralPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapper
 * @see ConcreteHelloPrinterWrapper
 * @see AbstractGeneralStringPrinterWrapperManagerInterface
 * @see AbstractGeneralStringPrinterWrapperManagerException
 * @see AbstractGeneralStringPrinterWrapperManager
 * @see ConcreteHelloPrinterWrapperManager
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryInterface
 * @see AbstractGeneralStringPrinterWrapperManagerFactoryException
 * @see AbstractGeneralStringPrinterWrapperManagerFactory
 * @see ConcreteHelloPrinterWrapperManagerFactory
 * @see Object
 */
final class ConcreteHelloPrinterWrapperManagerFactory
	extends AbstractGeneralStringPrinterWrapperManagerFactory<ConcreteHelloPrinterWrapperManager>
	implements AbstractGeneralStringPrinterWrapperManagerFactoryInterface<ConcreteHelloPrinterWrapperManager> {
	/**
	 * Constructs an instance of {@link ConcreteHelloPrinterWrapperManagerFactory} with no arguments.
	 * 
	 * Example: {@code ConcreteHelloPrinterWrapperManagerFactory factory = new ConcreteHelloPrinterWrapperManagerFactory();}
	 */
	public ConcreteHelloPrinterWrapperManagerFactory() {
		super(ConcreteHelloPrinterWrapperManager.class);
	}
}

/**
 * The {@code Utils} class provides utility methods and types that
 * are essential for  maintaining a clean and organized codebase.
 * 
 * <p>This class can be used to group general-purpose utility functionality, and its 
 * structure allows for easy expansion in case any utility methods or types become 
 * necessary in the future. Use this class to centralize commonly used functionality 
 * and avoid the need for multiple disparate utility classes.</p>
 * 
 * @author Daniel E. Janusch
 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
 * @author Anonymous 1
 * @author Anonymous 2
 * @version 3.0.0.0
 * @since 2025
 * @deprecated This class is deprecated.
 * 
 * @see NoopClass
 * @see NoopInterface
 * @see Object
 */
@Deprecated
class Utils {
	/**
	 * Default constructor, given explicitly to stop javadoc from giving warnings.
	 * 
	 * Usage: {@code Utils x = new Utils();}
	 */
	public Utils() {}
	/**
	 * This interface does nothing. It is a noop interface.
	 *
	 * @author Daniel E. Janusch
	 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
	 * @author Anonymous 1
	 * @author Anonymous 2
	 * @version 3.0.0.0
	 * @since 2025
	 * @deprecated This interface is deprecated.
	 * 
	 * @see NoopInterface
	 * @see NoopClass
	 * @see Object
	 */
	@Deprecated
	interface NoopInterface {}

	/**
	 * This class performs no operations, does nothing, and is here purely for the
	 * sake of having a class that does nothing. It can be used to demonstrate the
	 * art of minimalism in object-oriented programming.
	 *
	 * <p>It's the perfect class for when you need a class, but absolutely do not
	 * want it to do anything. Use this class to improve the size of your codebase
	 * without adding any actual value.</p>
	 *
	 * @author Daniel E. Janusch
	 * @author Sir Chadwick Gippity Montgomery Maximillian 4o'th, Lord of Memory Leaks
	 * @author Anonymous 1
	 * @author Anonymous 2
	 * @version 3.0.0.0
	 * @since 2025
	 * @deprecated This class is deprecated.
	 * 
	 * @see Object
	 * @see NoopInterface
	 * @see NoopClass
	 */
	@Deprecated
	final class NoopClass implements NoopInterface {
		/**
		 * Constructs an instance of {@link NoopClass} with no arguments.
		 * 
		 * Example: {@code NoopClass nc = new NoopClass();}
		 */
		public NoopClass() {}
	}
}
