for help information, run one of the following:
- `help svg_color_tfm` (for an example)
- `svg_color_tfm --help` (for the argument documentation)

To generate and execute the test cases, run
`test_gen("exec", true, "setup", "init_setup")`.
This should take about 3-6 seconds on a good PC.

To rerun the test suite without creating it again, run `test_suite`

To recompute the PDFs from the SVGs, run `./build-pdfs.ps1` in PowerShell.

To recompute the output SVGs for the main tests, run `main_test_transforms`.

To recompute `proposal.pdf`, run `latexmk -pdf -pdflatex="pdflatex -c-style-errors -interaction=nonstopmode -halt-on-error" -shell-escape ./proposal.tex`

To recompute `report.pdf`, run `latexmk -pdf -pdflatex="pdflatex -c-style-errors -interaction=nonstopmode -halt-on-error" -shell-escape ./report.tex`

NOTE: `svg_color_tfm.m` is a standalone file and does not require anything else to run properly (except for sometimes when it requires `magick.exe`).
