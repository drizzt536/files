(unless (boundp 'home-directory)
	;; `home-directory` should be defined in the original emacs config file.
	;; But just in case it isn't
	(setq home-directory "D:/ExtF/CodeFiles/")
	(setq default-directory home-directory)
	(setenv "HOME" home-directory))

;;; Miscellaneous Interactive Functions ;;;

(defun byte-compile-current ()
	"`byte-compile-file` the file open in the active buffer"
	(interactive)
	(byte-compile-file (buffer-file-name)))
(defun copy-buffer ()
	"Copy the entire buffer. doesn't move cursor. different from `mark-buffer` C-c"
	(interactive)
	(kill-new (buffer-string)))
(defun kill-entire-line ()
	"C-a C-u 1 C-k"
	(interactive)
	(beginning-of-line)
	(kill-line 1))
(defun mark-buffer ()
	"Mark the entire buffer. The cursor ends up at the end of the buffer,
unlike with `mark-whole-buffer`, where it ends up at the beginning.
Does the same thing as the following commands:
	* C-<home> C-S-<end>
	* M-x mark-whole-buffer C-xx
	"
	(interactive)
	(beginning-of-buffer)
	(set-mark-command nil)
	(end-of-buffer))
(defun insert-tab-anywhere ()
	"<tab> doesn't normally work at the end of a line."
	(interactive)
	(if (eolp)
		(insert-tab)
		(insert "\t")))
(defun kill-this-buffer-window ()
	"Kill the current buffer and the window if there are more open."
	(interactive)
	(if (one-window-p 'no-mini)
		(kill-this-buffer)
		(kill-buffer-and-window)))
(defun windows-drives ()
	"returns a list of the drive names, ie: \"C\", \"D\", etc. Only works on Windows."
	(interactive)
	(let ( (drives nil) )
		(dolist (drive
				(mapcar
					(lambda (charcode) (string charcode))
					(string-to-list "ZYXWVUTSRQPONMLKJIHGFEDCBA")))
			(when (file-exists-p (format "%s:/" drive))
				(push drive drives)))
		drives))
(defun count-file-lines (filename)
	(interactive "sfile name: ")
	(with-temp-buffer
		(insert-file-contents filename)
		(count-lines (point-min) (point-max))))
(defun whereami ()
	(interactive)
	(message
		(expand-file-name
			(buffer-file-name))))

;;; Dired Interactive Functions ;;;

; custom. not actually linum, but derived from it.
; must be manually put into
(require 'linum)

(defun dired-get-current-drive ()
	"Returns the Windows disk drive of the current open dired-mode buffer."
	(interactive)
	(string (upcase (elt dired-directory 0))))
(defun dired-get-next-drive ()
	"Returns the Windows disk drive alphabetically after
the drive in the open dired buffer."
	(interactive)
	(let ((drives (windows-drives)))
		(nth
			(mod
				(+ 1 (cl-position (dired-get-current-drive) drives :test #'string=))
				(length drives))
			drives)))
(defun dired-updir-or-next-drive ()
	"If the dired buffer is at a root directory, ie: `C:/`, `D:/`, etc, it swaps to
the next drive alphabetically. Otherwise it goes up one directory level.
Doesn't create a new buffer unlike `dired-up-directory`."
	(interactive)
	(find-alternate-file
		(if (string-match-p "^[A-Za-z]+:[/\\]$" dired-directory)
			(concat (dired-get-next-drive) ":/")
			"..")))
(defun dired-omit-useless-dotfiles ()
	"omits `.` and `..` directories from dired because they are useless"
	(interactive)
	(dired-mark-if
		(let ((fn (dired-get-filename 'no-dir t)))
			(or
				(string= "." fn)
				(string= ".." fn)))
		nil)
	(dired-do-kill-lines nil ""))
(defun dired-go-home ()
	"go back to the home directory in the `dired` buffer."
	(interactive)
	(find-alternate-file "~"))
(defun dired-open ()
	"Opens subdirectories in the same buffer and files in a new one.
works for `dired-mode` and `archive-mode` major modes."
	(interactive)
	(if (eq major-mode 'archive-mode)
		(archive-extract)
		(if (file-directory-p (dired-get-filename))
			(dired-find-alternate-file)
			(dired-find-file))))
(defun dired-next-line-fn ()
	"`dired-next-line` is already a thing
works for `dired-mode` and `archive-mode` major modes."
	(interactive)
	(if (< linum-current-line (count-lines (point-min) (point-max)))
		(if (eq major-mode 'archive-mode)
			(archive-next-line 1)
			(dired-next-line 1))))
(defun dired-previous-line-fn ()
	"`dired-previous-line` is already a thing
works for `dired-mode` and `archive-mode` major modes."
	(interactive)
	(if (> linum-current-line 2)
		(if (eq major-mode 'archive-mode)
			(archive-previous-line 1)
			(dired-previous-line 1))))

;;; Global Keybindings ;;;

(global-unset-key (kbd "C-/"		))	;; undo
(global-unset-key (kbd "C-x u"		))	;; undo
(global-unset-key (kbd "C-_"		))	;; redo
(global-unset-key (kbd "C-M-_"		))	;; redo?
(global-unset-key (kbd "C-y"		))	;; yank
(global-unset-key (kbd "<insert>"	))	;; insert mode >:(
(global-unset-key (kbd "M-v"		))	;; move one page backwards
(global-unset-key (kbd "C-x o"		))	;; swap splitscreen buffers

(global-set-key (kbd "C-x k"		) 'kill-this-buffer-window )	;; kills buffer + window
(global-set-key (kbd "<backspace>"	) 'delete-backward-char	   )	;; works with tabs
(global-set-key (kbd "<f1>"			) 'toggle-truncate-lines   )	;; line wrap
(global-set-key (kbd "<tab>"		) 'insert-tab-anywhere     )	;; tab
(global-set-key (kbd "C-S-<tab>"	) 'previous-buffer         )	;; normal ctrl shift tab
(global-set-key (kbd "C-x C-<tab>"	) 'other-window            )	;; swap split buffers
(global-set-key (kbd "C-c c"		) 'kill-ring-save          )	;; normal ctrl c
(global-set-key (kbd "C-S-a"		) 'mark-buffer             )	;; normal ctrl a
(global-set-key (kbd "C-x C-a"		) 'copy-buffer             )	;; normal C-ac
(global-set-key (kbd "C-<tab>"		) 'next-buffer             )	;; normal ctrl tab
(global-set-key (kbd "C-S-z"		) 'undo-redo               )	;; normal ctrl shift z
(global-set-key (kbd "C-z"			) 'undo                    )	;; normal ctrl z
(global-set-key (kbd "C-v"			) 'yank                    )	;; normal ctrl v

;;; Global Settings ;;;

(custom-set-variables
	'(archive-zip-extract '("unzip" "-q" "-p")) ; BusyBox version
	'(auto-save-default nil) ; don't create `#filename#` files.
	'(blink-cursor-mode nil)
	'(buffer-file-coding-system 'utf-8 t)
	'(c-syntactic-indentation nil) ; don't do 2-space tab nonsense in C
	'(column-number-indicator-zero-based nil)
	'(column-number-mode t)
	'(create-lockfiles nil) ; don't create `.#filename` files
	'(custom-enabled-themes '(wombat))
	'(default-buffer-file-coding-system 'utf-8)
	'(default-directory home-directory t)
	'(default-file-name-coding-system 'utf-8 t)
	'(default-keyboard-coding-system 'utf-8 t)
	'(default-process-coding-system '(utf-8 . utf-8) t)
	'(default-terminal-coding-system 'utf-8 t)
	'(delete-trailing-lines t)
	'(dired-hide-details-hide-information-lines nil)
	'(display-line-numbers-type t)
	'(display-time-mode t)
	'(explicit-shell-file-name "pwsh.exe")
	'(global-linum-mode t)
	'(indent-tabs-mode t)
	'(inhibit-startup-screen t)
	'(linum-format (lambda (line)
		(let* (
				(line-count
					(line-number-at-pos
						(point-max)))
				(width
					(length
						(number-to-string
							line-count)))
				(formatted
					(format
						(concat "%"
								(number-to-string width)
								"d")
						line))
				(face
				(if (= line linum-current-line)
					'linum-current-line-number-face
					'linum))
			)(propertize
				(concat " " formatted " ")
				'face
				face))))
	'(load-path
		(append
			load-path
			(nthcdr 3 (directory-files "C:/Users/djanu/AppData/Roaming/.emacs.d/Elpa/" t))
			(nthcdr 3 (directory-files (concat home-directory ".emacs.d/elpa/") t)))
		t)
	'(make-backup-files nil) ; don't create `filename~` files.
	'(menu-bar-mode nil)
	'(require-final-newline t)
	'(savehist-file (concat home-directory ".emacs.d/.history"))
	'(shell-file-name "pwsh.exe")
	'(tab-width 4)
	'(temporary-file-directory (concat home-directory ".emacs.d/tmp/"))
	'(tool-bar-mode nil))

;;; Syntax Modes ;;;

;; syntax modes
(dolist
	(package '(
		gitattributes	nasm
		typescript		json
		gitconfig		rust
		gitignore		js2
		markdown		dot
		wolfram			csv
		haskell			go))
	(let ( (mode (intern (concat (symbol-name package) "-mode"))) )
		;; eval(f"{name}-mode")
		(require mode)))
;; sublime json modes
(dolist
	(sublime-json-filetype '(
		color-scheme	completions
		workspace		commands
		mousemap		settings
		project			keymap
		build			macro
		themes			menu))
	(add-to-list 'auto-mode-alist
		`(,(concat
			"\\.sublime-"
			(symbol-name sublime-json-filetype)
			"\\'")
		. json-mode)))

;;; Hooks ;;;

(add-hook 'dired-after-readin-hook 'dired-omit-useless-dotfiles)
(add-hook 'dired-mode-hook 'dired-hide-details-mode)
(add-hook 'shell-mode-hook (lambda ()
	(setq-local default-directory home-directory)))
(add-hook 'eshell-mode-hook (lambda ()
	(setq-local default-directory home-directory)))

;;; Dired and Archive keybindings ;;;

(require 'arc-mode)
(require 'dired)

(dolist (keybind '(
		"a"  "e"  "f"  "h"  "n"  "p"  "q"  "C"  "E"  "G"  "O"  "0"  "1"  "2"  "3"  "4"
		"5"  "6"  "7"  "8"  "9"  "-"  "<"  ">"  "?"

		"C-n"  "C-p"  "C-d"  "<mouse-2>"  "DEL"  "RET"  "M-DEL"  "S-SPC"))
	(define-key archive-mode-map (kbd keybind) nil))
(dolist (keybind '(
		"a"  "e"  "f"  "g"  "h"  "i"  "k"  "m"  "n"  "o"  "t"  "u"  "v"  "x"  "A"  "B"
		"C"  "D"  "G"  "H"  "L"  "O"  "P"  "Q"  "R"  "S"  "T"  "W"  "X"  "Z"  "0"  "1"
		"2"  "3"  "4"  "5"  "6"  "7"  "8"  "9"  "^"  "#"  "$"  "-"  "."  "?"  "("  "<"
		">"

		"C-s"  "* u"  "RET"  "ESC"  "% S"  "* !"  "* %"  "* *"  "* /"  "* ?"  "* @"
		"* N"  "* c"  "* m"  "* s"  "* t"  "DEL"  "% &"  "% H"  "% C"  "% r"  "% g"

		"* C-p"  "* DEL"  "* C-n"))
	(define-key dired-mode-map (kbd keybind) nil))

(define-key archive-mode-map (kbd "q")		'archive-alternate-display)
(define-key archive-mode-map (kbd "s")		'dired-next-line-fn)
(define-key archive-mode-map (kbd "c")		'archive-copy-file)
(define-key archive-mode-map (kbd "w")		'dired-previous-line-fn)
(define-key archive-mode-map (kbd "U")		'archive-unmark-all-files)
(define-key archive-mode-map (kbd "SPC")	'dired-open)
(define-key archive-mode-map (kbd "<up>")	'dired-previous-line-fn)
(define-key archive-mode-map (kbd "<down>")	'dired-next-line-fn)
(define-key archive-mode-map (kbd "C-h")	'describe-mode)


(define-key dired-mode-map (kbd "a")		'dired-do-find-regexp)
(define-key dired-mode-map (kbd "c")		'dired-do-copy)
(define-key dired-mode-map (kbd "d")		'dired-do-delete)
(define-key dired-mode-map (kbd "q")		'dired-hide-details-mode)
(define-key dired-mode-map (kbd "r")		'dired-do-rename)
(define-key dired-mode-map (kbd "s")		'dired-next-line-fn)
(define-key dired-mode-map (kbd "w")		'dired-previous-line-fn)
(define-key dired-mode-map (kbd "~")		'dired-go-home)
(define-key dired-mode-map (kbd "SPC")		'dired-open)
(define-key dired-mode-map (kbd "S-SPC")	'dired-updir-or-next-drive)
(define-key dired-mode-map (kbd "C-h")		'describe-mode)
(define-key dired-mode-map (kbd "<up>")		'dired-previous-line-fn)
(define-key dired-mode-map (kbd "<down>")	'dired-next-line-fn)

(define-key dired-mode-map (kbd "% m")		'dired-mark-files-containing-regexp)

(define-key dired-mode-map (kbd "@ C-n")	'dired-next-marked-file)
(define-key dired-mode-map (kbd "@ C-p")	'dired-prev-marked-file)
(define-key dired-mode-map (kbd "@ %")		'dired-mark-files-regexp)
(define-key dired-mode-map (kbd "@ *")		'dired-mark-executables)
(define-key dired-mode-map (kbd "@ /")		'dired-mark-directories)
(define-key dired-mode-map (kbd "@ @")		'dired-mark-symlinks)
(define-key dired-mode-map (kbd "@ N")		'dired-number-of-marked-files)
(define-key dired-mode-map (kbd "@ c")		'dired-change-marks)
(define-key dired-mode-map (kbd "@ m")		'dired-mark)
(define-key dired-mode-map (kbd "@ s")		'dired-mark-subdir-files)
(define-key dired-mode-map (kbd "@ t")		'dired-toggle-marks)
(define-key dired-mode-map (kbd "@ u")		'dired-unmark)
(define-key dired-mode-map (kbd "@ U")		'dired-unmark-all-marks)

;;; Miscallaneous Stuff ;;;

(put 'erase-buffer 'disabled nil)
(put 'dired-find-alternate-file 'disabled nil)

(push '(fullscreen . fullboth) default-frame-alist)


(set-face-attribute 'default nil :height 175)
(prefer-coding-system 'utf-8-dos)
(cd home-directory)

;;; TODOS ;;;

; use `display-line-numbers-mode` instead of `linum-mode`, which doesn't work anymore.
; Make C-↓ go down by 5 lines, or less if at the end of the buffer
; Make C-↑ go up by 5 lines, or less if at the start of the buffer
; S-← <key> should override characters
; S-→ <key> should override characters as well
; fix unzip.exe error
; If I do S-← or S-→ to highlight \t+, it highlights all of them instead of one.
; figure out how to horizontal scroll
; I don't want to be able to delete the 'PS C:/>' part of the shell buffer
; I don't want to be able to go up in the shell buffer
	; make <up> do what C-<up> does now.
; I don't want to be delete previous things in the shell buffer
; Make C-` open a shell instance on the bottom of the screen (or do M-x shell-command RET)
; Make going to 10 lines and back to 9 scale back the buffer space
; Make scaling up and down the text size also scale down the buffer space
; When I open a new splitscreen window using `C-x [23]` I want to switch to that window

; How I open the `messages` buffer via command
; How do I make the `messages` buffer stop showing up automatically


; custom emacs modes to find
;  	PowerShell
;  	LaTeX-Log
;  	TI-BASIC

; emacs modes to package install
;  	yaml-mode
;  	lua-mode
;  	php-mode
;  	ruby-mode
;  	csharp-mode
