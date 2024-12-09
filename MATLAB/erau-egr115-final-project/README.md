for help information, run one of the following in MatLab:
- `help svg_color_tfm` (for an example invocation)
- `svg_color_tfm --help` (for the argument documentation)

To generate and execute the test cases, run one of the following
- `test_gen("exec", true, "setup", "init_setup")` in MatLab. (~3-8 seconds to run)
- `matlab -batch "test_gen('exec', true, 'setup', 'init_setup')"` in any terminal.  (~9-12 seconds to run)

To rerun the test suite without creating it again, run one of the following:
- `test_suite` in MatLab
- `matlab -batch test_suite` in any terminal

To recompute the PDFs from the SVGs, run one of the following:
- `./build-pdfs.ps1` in PowerShell (fastest).
- `build_pdfs` in MatLab.
- `matlab -batch build_pdfs` in any terminal.

To recompute the output SVGs for the main tests, run one of the following:
- `main_test_transforms` in MatLab
- `matlab -batch main_test_transforms` in any terminal

To recompute `proposal.pdf`, run the following in any terminal:
- `latexmk -pdf -pdflatex="pdflatex -c-style-errors -interaction=nonstopmode -halt-on-error" -shell-escape ./proposal.tex`

To recompute `report.pdf`, run the following in any terminal:
- `latexmk -pdf -pdflatex="pdflatex -c-style-errors -interaction=nonstopmode -halt-on-error" -shell-escape ./report.tex` in a terminal

NOTE: `svg_color_tfm.m` is a standalone file and does not require anything else to run properly (except for sometimes when it requires `magick.exe`).
