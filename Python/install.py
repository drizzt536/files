def main() -> str:
	# install modules using pip
	from sys import argv
	if len(argv) < 2:
		return input("no module given to install\nthe module name should be given using command line arguments\nPress Enter to Exit...")
	from importlib import import_module as _import
	module_name = argv[1].strip()
	try:
		_import(module_name)
	except ImportError:
		from os import system
		system( ("python" if len(argv) < 3 else argv[2]) + " -m pip install " + module_name )
		print("module installed")
	else:
		print("module already installed")
	return input("Press Enter to Exit...")

if __name__ == "__main__":
	main()