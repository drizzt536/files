def main() -> str:
	from importlib import import_module as _import
	from os  import system
	from sys import argv
	script_name, module_name = ("python" if len(argv) < 3 else argv[2]), argv[1].strip()
	if len(argv) < 2:
		print("no module given to install (listing installed modules):\n")
		system(script_name + " -m pip list")
		return input("\npress Enter to continue...")
	try:
		_import(module_name)
	except ImportError:
		system( script_name + " -m pip install " + module_name )
		print("module installed (listing installed modules):\n")
	else:
		print("module already installed (listing installed modules):\n")
	system(script_name + " -m pip list")
	return input("\npress Enter to continue...")

if __name__ == "__main__":
	main()
