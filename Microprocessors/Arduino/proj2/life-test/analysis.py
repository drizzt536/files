"""
Some high level operations and statistics on the data for the life simulations.

This file used to contain an implementation for the simulations, but it
has since been removed because the C version is like 4,000 times faster
"""

from collections import defaultdict

# import the specific functions because it gives smaller bytecode.
from json import load as json_load, dumps as json_dumps
from math import sqrt, erf, log as ln

def norm_ppf(p: float) -> float:
	# idk how this works, but it does it good enough.

	# Acklam approximation
	a = [-3.969683028665376e+01,  2.209460984245205e+02,
		 -2.759285104469687e+02,  1.383577518672690e+02,
		 -3.066479806614716e+01,  2.506628277459239e+00]

	b = [-5.447609879822406e+01,  1.615858368580409e+02,
		 -1.556989798598866e+02,  6.680131188771972e+01,
		 -1.328068155288572e+01]

	c = [-7.784894002430293e-03, -3.223964580411365e-01,
		 -2.400758277161838e+00, -2.549732539343734e+00,
		  4.374664141464968e+00,  2.938163982698783e+00]

	d = [ 7.784695709041462e-03,  3.224671290700398e-01,
		  2.445134137142996e+00,  3.754408661907416e+00]

	if p < 0.02425:
		p = sqrt(-2 * ln(p))
		return (((((c[0]*p + c[1])*p + c[2])*p + c[3])*p + c[4])*p + c[5]) / \
				((((d[0]*p + d[1])*p + d[2])*p + d[3])*p + 1)
	elif p > 0.97575:
		p = sqrt(-2 * ln(1 - p))
		return -(((((c[0]*p + c[1])*p + c[2])*p + c[3])*p + c[4])*p + c[5]) / \
				 ((((d[0]*p + d[1])*p + d[2])*p + d[3])*p + 1)
	else:
		p -= 0.5
		r = p*p
		return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5])*p / \
			   (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1)

def binned_hist(hist: dict | defaultdict, width: int = 5) -> dict | defaultdict:
	"linear histogram binning given a histogram with bin size 1"

	binned = defaultdict(int)

	for steps, count in hist.items():
		bin_start = (steps // width) * width
		binned[bin_start] += count

	return binned

def summarize(
	dataset: dict[str, dict | int],
	bin_width: int = 10,           # linear binning for the transients
	alpha: float | int = 0.05,
	z: float | int | None = None,  # alternative to passing alpha for very small alpha
	rare: float | int = 0.0001,    # how rare is a rare event. defaults to 0.01%
	super_rare: float | int = 0.0, # how rare is a super rare event. defaults to 0% (ignored)
	mode_length: int = 3,          # how many things to print in the mode
) -> None:
	if not isinstance(bin_width, int):
		raise TypeError("bin width must be an integer")

	if isinstance(alpha, int):
		alpha = float(alpha)

	if not isinstance(z, float | int | None):
		raise TypeError("z must be a float, integer, or None")

	if not isinstance(alpha, float):
		raise TypeError("alpha must be a float or an integer")

	if not isinstance(rare, float):
		raise TypeError("rare must be a float")

	if not isinstance(super_rare, float | int):
		raise TypeError("super_rare must be a float or int")

	if not isinstance(mode_length, int):
		raise TypeError("mode_length must be an int")

	if bin_width < 1:
		raise ValueError("bin width must be at least 1")

	if alpha < 0 or alpha > 1:
		raise ValueError("alpha must be in the range [0, 1].")

	if rare < 0 or rare > 1:
		raise ValueError("rare must be in the range [0, 1].")

	if super_rare < 0 or super_rare > 1:
		raise ValueError("rare must be in the range [0, 1].")

	if mode_length < 0:
		raise ValueError("mode_length must be non-negative")

	if z is None:
		z = norm_ppf(1 - alpha/2)
	else:
		if z < 0:
			raise ValueError("z must be non-negative")

		# alpha = 2 * (1 - scipy.stats.norm.cdf(z))
		alpha = 1 - erf(z * 0.7071067811865475)

	if not isinstance(dataset, dict):
		raise TypeError("dataset must be a dictionary")

	hcollide   = dataset["hcollide"]
	counts     = dataset["counts"]
	periods    = dataset["periods"]
	transients = dataset["transients"]
	trials     = dataset["trials"]

	print("Summary:")

	print(f"# total trials: {trials:,}")

	print(
		f"# hcollide: " + \
		f"{{\"count\": {hcollide["count"]}, " + \
		f"\"states\": [{ ', '.join(f"0x{x:016x}" for x in hcollide["states"]) }]}}"
	)

	print("# counts:")
	for k, v in counts.items():
		print(f"    {k}: {v:,} ({v/trials*100}%)")

	if alpha != 0.05:
		# the float identical check intended. if it is close, then that is not the same.
		# if you pass something other than a 95% confidence interval, then also run it for 95%
		z_tmp: float = 1.959963984540054 # norm.ppf(0.975)

		print(f"# 95% confidence intervals (alpha=0.05, z=1.96):")
		for k, v in counts.items():
			p = v / trials

			se = sqrt(p * (1 - p) / trials)
			p_min, p_max = p - z_tmp * se, p + z_tmp * se

			print(f"    {k}: ({p_min*100}%, {p_max*100}%), SE={se}")
		else:
			assert p == counts["cycle"] / trials, "`cycle` didn't run last"
			p_min += 1 - 2*p
			p_max += 1 - 2*p

			print(f"   static: ({p_min*100}%, {p_max*100}%), SE={se}")

	print(f"# {round((1 - alpha)*100, 2)}% confidence intervals (alpha={alpha}, z={z}):")
	for k, v in counts.items():
		p = v / trials

		se = sqrt(p * (1 - p) / trials)
		p_min, p_max = p - z_tmp * se, p + z_tmp * se

		print(f"    {k}: ({p_min*100}%, {p_max*100}%), SE={se}")
	else:
		assert p == counts["cycle"] / trials, "`cycle` didn't run last"
		# these values are only right if "cycle" was the last item in "counts".
		# because p here is 1 - p there.
		p_min += 1 - 2*p
		p_max += 1 - 2*p

		print(f"   static: ({p_min*100}%, {p_max*100:}%), SE={se}")

	print("# periods:")
	for k, v in sorted(periods.items()):
		p = v / trials

		print(f"    {k}: {v:,} ({p*100}%)" +
			(" **" if p < super_rare else " *" if p < rare else ""))

	print("# transients:")
	for k, v in sorted(binned_hist(transients, bin_width).items()):
		p = v / trials
		bin_max = k + bin_width - 1

		print(f"    {k}-{bin_max}: {v:,} ({p*100}%)" +
			(" **" if p < super_rare else " *" if p < rare else ""))

	def _rank_modes(modes_dict: dict) -> None:
		# sort by values
		modes = sorted(modes_dict.items(), key=lambda x: x[1])

		for i in range(1, min(mode_length, len(modes)) + 1):
			key, val = modes[-i]
			print(f"    rank {i}: {{{key:_}: {val:_}}} ({val/trials*100}%)")

	if mode_length > 0:
		print("# period modes:")
		_rank_modes(periods)

		print("# transient modes:")
		_rank_modes(transients)

	E = lambda D: sum(val * cnt for val, cnt in D.items()) / trials
	V = lambda D: sum(val**2 * cnt for val, cnt in D.items()) / trials - E(D)**2

	print(
		f"# E[x]:",
		f"    periods   : {E(periods)}",
		f"    transients: {E(transients)}",
		sep = '\n'
	)
	print(
		f"# V[x]:",
		f"    periods   : {V(periods)}",
		f"    transients: {V(transients)}",
		sep = '\n'
	)
	print(
		f"# stddev(x):",
		f"    periods   : {sqrt(V(periods))}",
		f"    transients: {sqrt(V(transients))}",
		sep = '\n'
	)

	print(f"# max transient: {max(transients.keys())}")

def combine_datasets(*datasets) -> dict:
	if len(datasets) == 0:
		return {
			"hcollide": {"count": 0, "states": [0]},
			"trials": 0,
			"counts": defaultdict(int, {"empty": 0, "const": 0, "cycle": 0}),
			"periods": defaultdict(int),
			"transients": defaultdict(int),
		}

	hcollide   = {"count": 0, "states": {0}}
	trials     = 0
	counts     = defaultdict(int)
	# always use new dictionaries in case the other ones are not `defaultdict`.
	periods    = defaultdict(int)
	transients = defaultdict(int)

	for dataset in datasets:
		if dataset["hcollide"]["count"] > hcollide["count"]:
			hcollide = dataset["hcollide"].copy()
			hcollide["states"] = set(hcollide["states"])
		elif dataset["hcollide"]["count"] == hcollide["count"]:
			hcollide["states"].update(dataset["hcollide"]["states"])

		trials += dataset["trials"]
		counts["empty"] += dataset["counts"]["empty"]
		counts["const"] += dataset["counts"]["const"]
		counts["cycle"] += dataset["counts"]["cycle"]

		for key, val in dataset["periods"].items():
			periods[key] += val

		for key, val in dataset["transients"].items():
			transients[key] += val

	hcollide["states"] = list(hcollide["states"])

	# reorder the keys to be ascending instead of based on which was added first.
	periods    = {key: periods[key] for key in sorted(periods.keys())}
	transients = {key: transients[key] for key in sorted(transients.keys())}

	return {
		"hcollide"  : hcollide,
		"trials"    : trials,
		"counts"    : counts,
		"periods"   : periods,
		"transients": transients
	}

"""
def repr_dataset(dataset: dict, i: int | None = None, object_only: bool = False, copy: bool = False) -> str:
	hcollide   = dataset["hcollide"]
	trials     = dataset["trials"]
	counts     = dataset["counts"]
	periods    = dataset["periods"]
	transients = dataset["transients"]

	if object_only:
		i = None

	d = f"dataset{'' if i is None else '_' + str(i)} = {{" + \
		f"\n\t\"hcollide\": {{\"count\": {hcollide["count"]}, \"states\": [" + \
			f"{ ', '.join(f"0x{x:016x}" for x in hcollide["states"]) }]}}," + \
		f"\n\t\"trials\": {trials:_}," + \
		f"\n\t\"counts\": {{\"empty\": {counts["empty"]:_}, \"const\": {counts["const"]:_}, \"cycle\": {counts["cycle"]:_}}}," + \
		f"\n\t\"periods\": {str(periods).replace("<class 'int'>", "int")}," + \
		f"\n\t\"transients\": {str(transients).replace("<class 'int'>", "int")}" + \
		f"\n}}"

	if object_only:
		d = d[10:]

	if copy:
		import subprocess
		return subprocess.run(["clip"], input=d, text=True)
	else:
		return d
"""

# functions specific to the new API:

def dataset_from_json(path: str = "data.json") -> tuple[dict, int]:
	with open(path) as f:
		data = json_load(f)

	for x in data:
		x["hcollide"]["states"] = [int(s, 16) for s in x["hcollide"]["states"]]
		x["trials"] = int(x["trials"].replace(",", ""))
		x["counts"] = {k: int(v.replace(",", "")) for k, v in x["counts"].items()}
		x["periods"] = defaultdict(int, {int(k): v for k, v in x["periods"].items()})
		x["transients"] = defaultdict(int, {int(k): v for k, v in x["transients"].items()})

	return combine_datasets(*data), len(data)

def json_from_dataset(dataset: dict) -> None:
	hcollide = dataset["hcollide"].copy()
	hcollide["states"] = [f"0x{s:016x}" for s in hcollide["states"]]
	trials = f"{dataset["trials"]:,}"
	counts = {k: f"{v:,}" for k, v in dataset["counts"].items()}
	# the keys of the periods and transients attributes get turned to strings by json.dumps

	return "[" + \
		f"\n{{" + \
		f"\n\t\"hcollide\": {json_dumps(hcollide)}," + \
		f"\n\t\"trials\": \"{trials}\"," + \
		f"\n\t\"counts\": {json_dumps(counts)}," + \
		f"\n\t\"periods\": {json_dumps(dataset["periods"])}," + \
		f"\n\t\"transients\": {json_dumps(dataset["transients"])}" + \
		f"\n}}" + \
		f"\n]\n"

def fold_datafile(path: str | None = None, ret: str = "json") -> tuple[str | dict, int] | None:
	"""
	data file defaults to "data.json".
	folds the data array into a single element.
	if the current data file only has one element, it doesn't rewrite to the file.
	"""

	if path is None:
		path = "data.json"

	if ret not in {"none", "json", "dataset"}:
		raise ValueError("ret must be one of 'none', 'json', 'dataset'")

	dataset, length = dataset_from_json(path)

	if length == 1 and ret == "none":
		return None

	jdata = json_from_dataset(dataset)

	if length == 1:
		return (jdata if ret == "json" else dataset), length

	with open(path, "wb") as f:
		f.write(bytes(jdata, "ascii"))

	if ret != "none":
		return (jdata if ret == "json" else dataset), length

def merge_datafiles(paths: list[str] | None = None, delete_old: bool = False, ret: str = "json") -> tuple[dict | str, int] | None:
	"""
	the last file given is the output file.json.
	if `delete_old` is given, the other files are all deleted.
	"""

	if paths is None:
		paths = ["data.json"]

	if ret not in {"none", "json", "dataset"}:
		raise ValueError("ret must be one of 'none', 'json', 'dataset'")

	if len(paths) == 1:
		if delete_old:
			raise ValueError("delete_old=True requires more than one path to be given.")

		# NOTE: currently, the return type of this expression is inconsistent with the
		#       other branches. once this function also returns a length, it won't be.
		return fold_datafile(paths[0], ret=ret)

	data    = tuple(zip( *(dataset_from_json(path) for path in paths) ))
	dataset = combine_datasets(*data[0])
	length  = sum(data[1])
	jdata   = json_from_dataset(dataset)

	# NOTE: this is safe because the default array is only one file,
	#       so this code never runs, and the list is never mutated.
	output_path = paths.pop(0) # the first file is the output

	if delete_old:
		from os import remove

		for path in paths:
			remove(path)

	with open(output_path, "wb") as f:
		f.write(bytes(jdata, "ascii"))

	if ret != "none":
		return (jdata if ret == "json" else dataset), length

show_new = lambda path=None: summarize(
	fold_datafile(path, ret="dataset")[0],
	bin_width=10, z=8, rare=1e-4, super_rare=1e-6
)

"""
import matplotlib.pyplot as plt
import numpy as np

def plot_bar(ds: dict[int, int], trials: int | None = None, w=5) -> None:
	plt.style.use("dark_background")

	ds = binned_hist(ds, w)

	x = np.array((*ds.keys(),))
	y = c / trials
	plt.bar(x, y, width=w, align="edge")
	plt.xlim(0, x.max())

	plt.show()

def plot(ds: dict[int, int], trials: int | None = None) -> None:
	import matplotlib.pyplot as plt
	plt.style.use("dark_background")

	x1 = np.array((*ds.keys(),))
	y1 = np.array((*ds.values(),)) / trials

	xmax = x1.max()
	plt.plot(x1, y1, label="data")
	plt.xlim(0, xmax)
	plt.ylim(bottom=0)

	L = 1 / x1.mean() # lambda

	x2 = np.linspace(0, xmax, num=xmax)

	y2 = L * np.exp(-L * x2)

	plt.plot(x2, y2, label="exp dist")

	plt.plot(x1, y_beta, label="beta dist")
	plt.legend()
	plt.show()



from scipy.stats import beta
from scipy.optimize import minimize

x_scaled = (x - 2) / (x.max() - 2)
x_scaled = x_scaled * (1 - 1e-12) + 5e-13

def neg_log_likelihood(params, x, y):
	a, b = params

	if a <= 0 or b <= 0:
		return np.inf

	ll = np.sum(y * beta.logpdf(x_scaled, a, b))

	if np.isnan(ll):
		return np.inf

	return -ll

xmax = x.max()
mean = np.sum(y * x)
var  = np.sum(y * (x - mean)**2)
scale_guess = xmax - 2
loc_guess = x.min()
alpha_guess = ((mean - loc_guess) / scale_guess) * (((mean - loc_guess)/scale_guess * (1 - (mean - loc_guess)/scale_guess) / (var/scale_guess**2)) - 1)
beta_guess  = (1 - (mean - loc_guess)/scale_guess) * (((mean - loc_guess)/scale_guess * (1 - (mean - loc_guess)/scale_guess) / (var/scale_guess**2)) - 1)
initial_guess = [alpha_guess, beta_guess, loc_guess, scale_guess]
result = minimize(neg_log_likelihood, [alpha_guess, beta_guess], bounds=[(1e-6, None), (1e-6, None)], args=(x,y))
a, b = result.x
print(a, b)

y_beta = beta.pdf(x_scaled, a, b) / (xmax - 2)

f(t) * (x.max() - 2) + 2
"""

#                  s,   p,   t  notes
# 0x038aec0409159f7c,   1,  54  dead
# 0x1cb72c42d621ce22,   1,  25  dead
# 0x1f31b115f6180b56,   1,  44
# 0x49d5a25c81a13bab,   1,  71  dead
# 0xf14f1c510662494b,   1,  49  dead
# 0xced3e4f61e1244a2,   6,  29
# 0x00070b0c00000000, 132, 132
# 0x53342fa08275d76d, 132, 334
# 0x00737c4c5767b32f, 132, 341
# 0xb0ca381b2e07b651, 132, 352
# 0xc812c32ba355b0da, 132, 363
# 0xf7530de458634baa, 132, 365
# 0x48057d6cd48973dc, 132, 392
# 0x55a8c4ac048ff424, 132, 400
# 0x955ba1e3a99a6288, 132, 419

if __name__ == "__main__":
	from sys import argv

	if len(argv) == 1:
		print("no command specified")
		exit(1)

	command = argv[1]
	operand = argv[2] if len(argv) == 3 else None

	# TODO: add a repr_data commmand?

	if command in {"-f", "--fold"}:
		if len(argv) > 3:
			print(f"too many command-line arguments given to {command}.")
			exit(1)

		fold_datafile(operand)
	elif command in {"-s", "--summarize"}:
		# NOTE: this also collapses the datafile
		show_new(operand)
	elif command in {"-m", "--merge"}:
		merge_datafiles(paths=argv[2:], delete_old=True, ret="none")
	elif command in {"-h", "-?", "-help", "--help"}:
		print(
			f"usage: {argv[0].replace("\\", "/").rsplit("/", 1)[1]} COMMAND [OPERANDS]" \
			"\noptions:" \
			"\n    -h, -?, -help, --help    print this message and exit" \
			"\n    -s, --summarize [PATH]   folds the datafile and prints statistics" \
			"\n    -f, --fold [PATH]        folds the datafile array into one element" \
			"\n    -m, --merge PATHS        folds the datafile and print statistics"
		)
	else:
		print(f"argv: {argv}\nunknown command {command}")
		exit(1)
