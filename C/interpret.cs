// csc.exe ./interpret.cs /target:exe /main:MainProgram.Program /out:interpret.exe /optimize+

using System.Linq; // array.Select, array.ToList

using ConsoleKeyInfo    = System.ConsoleKeyInfo;
using ConsoleColor      = System.ConsoleColor;
using Environment       = System.Environment;
using ConsoleKey        = System.ConsoleKey;
using Console           = System.Console;
using Convert           = System.Convert;

using ProcessStartInfo  = System.Diagnostics                   .ProcessStartInfo;
using Process           = System.Diagnostics                   .Process;
using StringList        = System.Collections.Generic           .List<string>;
using Regex             = System.Text       .RegularExpressions.Regex;
using RegexOptions      = System.Text       .RegularExpressions.RegexOptions;
using StringBuilder     = System.Text                          .StringBuilder;
using File              = System.IO                            .File;
using Path              = System.IO                            .Path;

namespace MainProgram {
	internal static class Execute {
		private static string CompilerArguments() {
			string compiler = Program.compiler
				,  language = Program.language
				,  outFile  = Program.outFile
				,  srcFile  = Program.srcFile;

			switch (compiler) {
				case "cl.exe":
					return $"/I \"D:/ExtF/Files/MSVC/include\" "
						+  $"/Wall /O2 /J /T{(language == "C++" ? "P" : "C")} "
						+  $"/Fe \"{outFile}\" \"{srcFile}\"";
				case "gcc.exe":
				case "clang.exe":
				case "g++.exe":
				case "clang++.exe":
					return $"-Wall -Wextra -pedantic -Ofast -x {( language.ToLower()
					)} -o \"{outFile}\" \"{srcFile}\"";
				case "csc.exe":
					return $"/target:exe /optimize+ /nologo /out:\"{outFile}\" \"{srcFile}\"";
				case "vbc.exe":
					return $"/target:exe /optimize+ /nologo /quiet /out:\"{outFile}\" \"{srcFile}\"";
				case "javac.exe":
					return $"\"{srcFile}\" --release {language.Substring(5)}";
				default:		
					// take a wild guess at the argument syntax
					return $"\"{srcFile}\" -o \"{outFile}\"";
			}
		}
		// string, bool
		private static int Exec(in string executable, bool printComments) {
			return Exec(in executable, "", printComments);
		}
		// string, string[], bool
		// string, string[]
		private static int Exec(in string executable, in string[] args, bool printComments = false) {
			return Exec(in executable, string.Join(" ", args), printComments);
		}
		// string, string, bool
		// string, string
		// string
		private static int Exec(in string executable, in string args = "", bool printComments = false) {
			// returns exit code: 1 on error, 0 on success.

			try {
				var processInfo = new ProcessStartInfo(executable, args);

				if (printComments)
					Console.WriteLine("// Program Results:");

				processInfo.UseShellExecute = false;
				processInfo.RedirectStandardOutput = true;

				using (Process process = Process.Start(processInfo)) {
					string output = process.StandardOutput.ReadToEnd();
					process.WaitForExit();

					if (!Program.silent)
						Console.Write(output);
				}

				return 0;
			} catch {
				return 1;
			}
		}
		private static int Run(in string executable) {
			Program.printResultsComment = true;

			int output = Program.isJava() ?
				Exec("java.exe", new string[] {
					"-classpath",
					$"\"{ Path.GetDirectoryName(executable) }\"",
					// TODO: figure out the main class file
					Path.GetFileNameWithoutExtension(executable)
				}) :
				Exec(in executable);

			Program.printResultsComment = false;

			return output;
		}
		internal static int CompileAndRun() {
			if (!Program.silent)
				Console.WriteLine("// Compiling");

			int compilerExitCode = Exec(in Program.compiler, CompilerArguments());

			return compilerExitCode == 0 ?
				Run(in Program.outFile) :
				compilerExitCode;
		}
	}

	public class Program {
		internal static bool printResultsComment = false;
		internal static string language = "";
		internal static string compiler = "";
		internal static string extension = "";
		internal static bool silent = false;
		internal static string srcFile;
		internal static string outFile;

		internal static bool isJava() {
			return Regex.IsMatch(language, "^java", RegexOptions.IgnoreCase);
		}

		private static bool startInMain = false;
		private static bool saveSouceFile = false;
		private static bool waitForKeyToExit = true;
		private static ConsoleColor bg_color = Console.BackgroundColor;
		private static ConsoleColor fg_color = Console.ForegroundColor;

		private static string PutIntoMain(in string program) {
			return startInMain ?
				PutIntoMain( program.Split('\n') ) :
				program;
		}
		private static string PutIntoMain(in string[] lines) {
			// strategy pattern
			if (!startInMain) return string.Join("\n", lines);

			switch (language) {
				case "Java 21":
				case "Java 20":
				case "Java 19":
				case "Java 18":
				case "Java 17":
				case "Java 16":
				case "Java 15":
				case "Java 14":
				case "Java 13":
				case "Java 12":
				case "Java 11":
				case "Java 10":
				case "Java 9":
				case "Java 8":
					return string.Join("\n", new string[] {
						  "import java.util.*;"
						, "import static java.lang.System.out;"
						, ""
						, "class Main {"
						, "    private static <T> void print(T x) {"
						, "        out.print(x);"
						, "    }"
						, "    private static <T> void println(T x) {"
						, "        out.println(x);"
						, "    }"
						, ""
						, "    public static void main(String argv[]) {"
						,$"        {(
							int.Parse(language.Substring(5)) >= 10 ?
								"var" :
								"Scanner"
						)} input = new Scanner(System.in);"
						, "        String[] args = argv;"
						, ""
						, string.Join("\n", lines.Select(line => $"        {line}"))
						, "    }" // having a semicolon here sometimes doesn't work
						, "}"
						, ""
					});
				case "C":
					return string.Join("\n", new string[] {
						  "#include <stdio.h>"
						, "#include <stdlib.h>"
						, "#include <stdbool.h>"
						, "#include <stddef.h>"
						, "#include <math.h>"
						, "#include <complex.h>"
						, "#include <string.h>"
						, ""
						, "#ifdef _WIN32"
						, "    #include <windows.h>"
						, "    #include <conio.h>"
						, "    #include <io.h>"
						, "    #define access(file, mode) _access((file), (mode))"
						, "#endif"
						, ""
						, "#if defined(__linux__) || defined(__APPLE__) || defined(__MINGW32__)"
						, "    #include <unistd.h>"
						, "#endif"
						, ""
						, "#define uchar unsigned char"
						, "#define ushort unsigned short"
						, "#define uint unsigned int"
						, "#define ulong unsigned long"
						, "#define llong long long"
						, "#define ullong unsigned llong"
						, "#define Long llong"
						, "#define uLong unsigned Long"
						, ""
						, "#define alloc(x, y) malloc((x)*(y))"
						, "#define str_pos_int(numStr) (*numStr != '-')"
						, "#define substr(str, index) (str + index)"
						, "#define bool_string(b) (b ? \"true\" : \"false\")"
						, "#define ctoi(c) ((uint) (chr - '0'))"
						, ""
						, "static Long index_of(char *str, char c) {"
						, "    for (uLong i = 0; str[i] != '\\0'; ++i)"
						, "        if (str[i] == c) return i;"
						, ""
						, "    return -1LL;"
						, "}"
						, "static bool includes(char *str, char c) {"
						, "    for (uLong i = 0; str[i] != '\\0'; ++i)"
						, "        if (str[i] == c)"
						, "            return true;"
						, "    return false;"
						, "}"
						, ""
						, "int main(int argc, char *argv[]) {"
						, ""
						, string.Join("\n", lines.Select(line => $"    {line}")) + ";"
						, ""
						, "    return 0;"
						, "}"
						, ""
					});
				case "C++":
					return string.Join("\n", new string[] {
						  "#include <iostream>"
						, "#include <type_traits>"
						, "#include <string>"
						, "#include <vector>"
						, "#include <list>"
						, "#include <map>"
						, "#include <algorithm>"
						, "#include <fstream>"
						, "#include <cmath>"
						, "#include <memory>"
						, "#include <functional>"
						, "#include <math>"
						, ""
						, "using namespace std;"
						, "using Long = llong;"
						, "using ullong = unsigned llong;"
						, "using Long = llong;"
						, "using uLong = unsigned Long;"
						, "using uchar = unsigned char;"
						, "using ushort = unsigned short;"
						, "using uint = unsigned int;"
						, "using ulong = unsigned long;"
						, ""
						, "template <typename T>"
						, "void printbits(T x, ostream outFile = stdout) {"
						, "    // print the binary bits of a value."
						, "    for (size_t i = 8 * sizeof(T); i --> 0 ;)"
						, "        outFile << x >> i & 1;"
						, "}"
						, ""
						, "int main(int argc, char *argv[]) {"
						, ""
						, string.Join("\n", lines.Select(line => $"    {line}")) + ";"
						, ""
						, "    return 0;"
						, "}"
						, ""
					});
				case "C#":
					return string.Join("\n", new string[] {
						  "using System.Text.RegularExpressions;"
						, "using System.Collections.Generic;"
						, "using System.Threading.Tasks;"
						, "using System.Diagnostics;"
						, "using System.Linq;"
						, "using System.Text;"
						, "using System.Net;"
						, "using System.IO;"
						, "using System;"
						, ""
						, "namespace MainProgram {"
						, "    public class Program {"
						, "        private static void Write<T>(T x) { Console.Write(x); }"
						, "        private static void WriteLine<T>(T x) { Console.WriteLine(x); }"
						, "        public  static void Main(string[] argv) {"
						, string.Join("\n", lines.Select(line => $"            {line}")) + ";"
						, "        }"
						, "    }"
						, "}"
						, ""
					});
				case "VB":
					return string.Join("\n", new string[] {
						  "Module Program"
						, "    Sub Main()"
						, string.Join("\n", lines.Select(line => $"        {line}"))
						, "    End Sub"
						, "End Module"
					});
				default:
					if (!Program.silent) {
						Console.Error.WriteLine($"PutIntoMain() is not implemented for language {language}");
						Console.Error.WriteLine("    returning back the input");
					}

					return string.Join("\n", lines);
			}
		}

		private static void Exit(int code = 0) {
			// All exit points happen with the temporary files undefined.
			Console.BackgroundColor = bg_color;
			Console.ForegroundColor = fg_color;

			if (srcFile != "" && File.Exists(srcFile)) {
				try {
					File.Delete(srcFile);
				} catch {
					Console.WriteLine($"could not delete {srcFile}");
				}
			}
			if (outFile != "" && File.Exists(outFile)) {
				try {
					File.Delete(outFile);
				} catch {
					Console.WriteLine($"could not delete {outFile}");
				}
			}

			if (waitForKeyToExit) {
				ConsoleKeyInfo keyInfo;

				if (!silent)
					Console.Write("// Waiting for Enter or ^C to exit: ");

				do keyInfo = Console.ReadKey(intercept: true);
				while (keyInfo.Key != ConsoleKey.Enter || keyInfo.Modifiers != 0);
			}

			Environment.Exit(code);
		}
		private static string ReadProgram() {
			var inputBuffer = new StringBuilder();

			while (true) {
				ConsoleKeyInfo keyInfo = Console.ReadKey(intercept: true);

				switch (keyInfo.Key) {
					case ConsoleKey.PageUp:
					case ConsoleKey.PageDown:
					case ConsoleKey.Home:
					case ConsoleKey.End:
					case ConsoleKey.Insert:
					case ConsoleKey.UpArrow:
					case ConsoleKey.LeftArrow:
					case ConsoleKey.RightArrow:
					case ConsoleKey.DownArrow:
						break;
					case ConsoleKey.Delete:
					case ConsoleKey.Backspace:
						if (inputBuffer.Length > 0) {
							// backspace 4 times for tabs, or 1 for other characters.
							for (int i = 1 + 3 * Convert.ToInt32(inputBuffer[inputBuffer.Length - 1] == '\t'); i --> 0 ;)
								if (!silent) Console.Write("\b \b");

							inputBuffer.Length--;
						}
						break;
					case ConsoleKey.Tab:
						inputBuffer.Append("\t");
						if (!silent) Console.Write("    ");
						break;
					case ConsoleKey.Enter:
						if (!silent) Console.Write(Environment.NewLine);
						inputBuffer.Append(Environment.NewLine);

						if (keyInfo.Modifiers != 0)
							return inputBuffer.ToString();
						break;
					default:
						inputBuffer.Append(keyInfo.KeyChar);
						if (!silent) Console.Write(keyInfo.KeyChar);
						break;
				}
			}
		}
		private static bool SetupLanguageInfo(bool setValue = true) {
			if (setValue && Regex.IsMatch(Program.language, "^java", RegexOptions.IgnoreCase)) {
				compiler = "javac.exe";
				extension = "java";
			}
			switch (language) {
				case "javac.exe":
				case "java.exe":
				case "java":
				case "java21":
				case "java 21":
					if (setValue)
						language = "Java 21";
					break;
				case "java20":
				case "java 20":
					if (setValue)
						language = "Java 20";
					break;
				case "java19":
				case "java 19":
					if (setValue)
						language = "Java 19";
					break;
				case "java18":
				case "java 18":
					if (setValue)
						language = "Java 18";
					break;
				case "java17":
				case "java 17":
					if (setValue)
						language = "Java 17";
					break;
				case "java16":
				case "java 16":
					if (setValue)
						language = "Java 16";
					break;
				case "java15":
				case "java 15":
					if (setValue)
						language = "Java 15";
					break;
				case "java14":
				case "java 14":
					if (setValue)
						language = "Java 14";
					break;
				case "java13":
				case "java 13":
					if (setValue)
						language = "Java 13";
					break;
				case "java12":
				case "java 12":
					if (setValue)
						language = "Java 12";
					break;
				case "java11":
				case "java 11":
					if (setValue)
						language = "Java 11";
					break;
				case "java10":
				case "java 10":
					if (setValue)
						language = "Java 10";
					break;
				case "java9":
				case "java 9":
					if (setValue)
						language = "Java 9";
					break;
				case "java8":
				case "java 8":
					if (setValue)
						language = "Java 8";
					break;
				case "gcc.exe":
				case "c":
				case "gcc":
				case "gcc c":
					if (setValue) {
						language = "C";
						compiler = "gcc.exe";
						extension = "c";
					}
					break;
				case "clang.exe":
				case "clangc":
				case "clang":
				case "clang c":
					if (setValue) {
						language = "C";
						compiler = "clang.exe";
						extension = "c";
					}
					break;
				case "msvc c":
				case "visual c":
				case "visualc":
				case "msvisual c":
				case "msvisualc":
				case "ms visual c":
					if (setValue) {
						language = "C";
						compiler = "cl.exe";
						extension = "c";
					}
					break;
				case "g++.exe":
				case "c++":
				case "g++":
				case "cpp":
				case "cc":
				case "g++ c++":
				case "g++ cpp":
				case "g++ cc":
				case "gcc c++":
				case "gcc cpp":
				case "gcc cc":
					if (setValue) {
						language = "C++";
						compiler = "g++.exe";
						extension = "c++";
					}
					break;
				case "clang++.exe":
				case "clang++":
				case "clang++ c++":
				case "clang++ cpp":
				case "clang++ cc":
				case "clang c++":
				case "clang cpp":
				case "clang cc":
				case "clangc++":
				case "clangcpp":
				case "clangcc":
					if (setValue) {
						language = "C++";
						compiler = "clang++.exe";
						extension = "c++";
					}
					break;
				case "cl.exe":
				case "msvc":
				case "msvc cl":
				case "msvc cl.exe":
				case "msvc++":
				case "msvc c++":
				case "visual c++":
				case "msvisual c++":
				case "ms visual c++":
					if (setValue) {
						language = "C++";
						compiler = "cl.exe";
						extension = "c++";
					}
					break;
				case "vbc.exe":
				case "visual basic":
				case "visualbasic":
				case "vb":
				case "vbc":
				case "vbc vb":
					if (setValue) {
						language = "VB";
						compiler = "vbc.exe";
						extension = "vb";
					}
					break;
				case "csc.exe":
				case "c#":
				case "cs":
				case "csharp":
				case "csc":
					if (setValue) {
						language = "C#";
						compiler = "csc.exe";
						extension = "cs";
					}
					break;
				default:
					if (!silent)
						Console.Error.WriteLine($"language '{language}' is not supported");
					if (setValue) Exit(2);
					else return false; // the language does not exist
					break;
			}

			return true; // the language exists
		}
		private static void DisplayHelp() {
			if (!silent) Console.WriteLine( string.Join("\n", new string[] {""
				, "Upon exit, exit the program without waiting for Enter or ^C:  -e, --exit"
				, "Save the source file to file-save.{extension}:                -s, --save"
				, "Run the program silently (never print to the console):        -S, --silent"
				, "Put the provided code into the main function automatically:   -m, --main"
				, "Display this message and exit (disregards other options):     -h, --help, -?"
				, "    implies -e argument"
				, "Specify the language to interpret:                            -x, --lang, -l, --language"
				, ""
				, "    The default value is \"java 21\"."
				, "    The compiler executable can also be passed."
				, "    The value is not case sensitive."
				, "    whitespace is condensed into one space."
				, "    dashes are converted to spaces."
				, "    The C ones use gcc unless clang is secified."
				, "    Values with spaces must be passed like this: `-x \"gcc c++\"`."
				, "    These are the allowed values:"
				, "        Java:"
				, "            java.exe"
				, "            java"
				, "        C:"
				, "            GNU Compiler Collection C:"
				, "                gcc.exe"
				, "                gcc c"
				, "                gcc"
				, "                c"
				, "            Clang C:"
				, "                clang.exe"
				, "                clang c"
				, "                clangc"
				, "                clang"
				, "            Microsoft Visual C:"
				, "                msvc"
				, "                msvc c"
				, "                visual c"
				, "                visualc"
				, "                msvisualc"
				, "                msvisual c"
				, "                ms visual c"
				, "        C++:"
				, "            GNU Compiler Collection C++:"
				, "                g++.exe"
				, "                g++ c++"
				, "                g++ cpp"
				, "                g++ cc"
				, "                g++"
				, "                c++"
				, "                cpp"
				, "                cc"
				, "            Clang C++:"
				, "                clang++.exe"
				, "                clang++"
				, "                clang++ c++"
				, "                clang++ cpp"
				, "                clang++ cc"
				, "                clang c++"
				, "                clang cpp"
				, "                clang cc"
				, "                clangc++"
				, "                clangcpp"
				, "                clangcc"
				, "            Microsoft Visual C++:"
				, "                cl.exe"
				, "                msvc cl.exe"
				, "                msvc cl"
				, "                msvc"
				, "                msvc++"
				, "                msvc c++"
				, "                visual c++"
				, "                msvisual c++"
				, "                ms visual c++"
				, "        Visual Basic:"
				, "            vbc.exe"
				, "            visual basic"
				, "            visualbasic"
				, "            vb"
				, "            vbc"
				, "            vbc vb"
				, "        C#:"
				, "            csc.exe"
				, "            c#"
				, "            cs"
				, "            csharp"
				, "            c sharp"
				, "            csc"
				, ""
			}));
			waitForKeyToExit = false;
			Exit(0);
		}
		private static void ParseArguments(ref string[] argv) {
			while (argv.Length > 0 && argv[0].Length > 1) {

				if (argv[0][0] != '-')
					// return on the first unknown option
					goto end;

				if (argv[0][1] != '-' && argv[0].Length > 2) {
					// something like `-mx` or `-es`

					string current = argv[0];
					Skip(ref argv, 1);

					// split the option into its parts
					argv = current.Substring(1)
						.Select(e => "-" + e)
						.Concat(argv)
						.ToArray();
				}

				switch (argv[0]) {
					case "-m":
					case "--main":
						Skip(ref argv, 1);
						startInMain = true;
						break;
					case "-x":
					case "-l":
					case "--lang":
					case "--language":
						if (argv.Length == 1) {
							if (!silent)
								Console.Error.WriteLine($"no value provided after '{argv[0]}' argument");
							Exit(1);
						}

						language = Regex.Replace(argv[1], @"\s+", " ")
							.ToLower()
							.Replace("-", " ");
						Skip(ref argv, 2);
						break;
					case "-s":
					case "--save":
						Skip(ref argv, 1);
						saveSouceFile = true;
						break;
					case "-S":
					case "--silent":
						Skip(ref argv, 1);
						silent = true;
						break;
					case "-e":
					case "--exit":
						Skip(ref argv, 1);
						waitForKeyToExit = false;
						break;
					case "-h":
					case "-?":
					case "--help":
						DisplayHelp();
						break;
					default:
						// return on the first unknown option
						goto end;
				}
			}

			end:
			if (language == "")
				language = "java 21";
		}
		private static string FileConvert(string path, string outType) {
			string tmp = path;
			path = Path.ChangeExtension(path, "." + outType);
			File.Move(tmp, path);

			return path;
		}
		private static T[] Skip<T>(ref T[] array, int times = 1) {
			array = times == 0 ?
				array :
				array.Skip(times).ToArray();

			return array;
		}

		public static void Main(string[] argv) {
			ParseArguments(ref argv);
			SetupLanguageInfo();

			srcFile = FileConvert(Path.GetTempFileName(), extension);
			outFile = FileConvert(Path.GetTempFileName(), isJava() ? "class" : "exe");

			// print the language and program code
			if (!silent) {
				Console.WriteLine($"// using language {language}");
				Console.WriteLine($"// using compiler {compiler}");
				Console.WriteLine($"// Program:");
			}

			string code = argv.Length == 0 ?
				PutIntoMain(ReadProgram()) :
				PutIntoMain(in argv);

			if (argv.Length > 0 && !silent)
				// print the code as if it were read from stdin
				Console.WriteLine(code);

			if (!silent)
				Console.WriteLine("// End of Program");

			File.WriteAllText(srcFile, code);

			if (saveSouceFile) {
				string saveTo = $"./file-save.{extension}";
				if (!silent) Console.WriteLine($"// Saving source file to '{saveTo}'");
				File.Copy(srcFile, saveTo, true);
			}

			// execute the program
			int error = Execute.CompileAndRun();
			if (Convert.ToBoolean(error) && !silent)
				Console.Error.WriteLine($"{compiler} exited with errors or was not found");

			Console.WriteLine($"Exiting the program with error code {error}");
			Exit(error);
		}
	}
}
