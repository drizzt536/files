;; `home-directory` is defined in the original emacs config file
;; It should be "D:/ExtF/CodeFiles/" unless it has changed.

;;; Global Interactive Functions ;;;

(defun byte-compile-current ()
	"`byte-compile-file` the file open in the active buffer"
	(interactive)
	(byte-compile-file (buffer-file-name))
)
(defun copy-buffer ()
	"Copy the entire buffer. doesn't move cursor. different from `mark-buffer` C-c"
	(interactive)
	(kill-new (buffer-string))
)
(defun kill-entire-line ()
	"C-a C-u 1 C-k"
	(interactive)
	(beginning-of-line)
	(kill-line 1)
)
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
	(end-of-buffer)
)
(defun insert-tab-anywhere ()
	"<tab> doesn't normally work at the end of a line."
	(interactive)
	(if (eolp)
		(insert-tab)
		(insert "\t")
	)
)
(defun kill-this-buffer-window ()
	"Kill the current buffer and the window if there are more open."
	(interactive)
	(if (one-window-p 'no-mini)
		(kill-this-buffer)
		(kill-buffer-and-window)
	)
)
(defun windows-drives ()
	"returns a list of the drive names, ie: \"C\", \"D\", etc. Only works on Windows."
	(interactive)
	(let ( (drives nil) )
		(dolist (drive
				(mapcar
					(lambda (charcode) (string charcode))
					(string-to-list "ZYXWVUTSRQPONMLKJIHGFEDCBA")
				)
			)
			(when (file-exists-p (format "%s:/" drive))
				(push drive drives)
			)
		)
		drives
	)
)
(defun dired-get-current-drive ()
	"Returns the Windows disk drive of the current open dired-mode buffer."
	(interactive)
	(string (upcase (elt dired-directory 0)))
)
(defun dired-get-next-drive ()
	"Returns the Windows disk drive alphabetically after
the drive in the open dired buffer."
	(interactive)
	(let ((drives (windows-drives)))
		(nth
			(mod
				(+ 1 (cl-position (dired-get-current-drive) drives :test #'string=))
				(length drives)
			)
			drives
		)
	)
)
(defun dired-updir-or-next-drive ()
	"If the dired buffer is at a root directory, ie: `C:/`, `D:/`, etc, it swaps to
the next drive alphabetically. Otherwise it goes up one directory level.
Doesn't create a new buffer unlike `dired-up-directory`."
	(interactive)
	(find-alternate-file
		(if (string-match-p "^[A-Za-z]+:[/\\]$" dired-directory)
			(concat (dired-get-next-drive) ":/")
			".."
		)
	)
)
(defun dired-open ()
	"Opens subdirectories in the same buffer and files in a new one."
	(interactive)
	(message (dired-get-filename))
	(if (file-directory-p (dired-get-filename))
		(dired-find-alternate-file)
		(dired-find-file)
	)
)
(defun dired-omit-useless-dotfiles ()
	"omits `.` and `..` directories because they are useless"
	(interactive)
	(dired-mark-if
		(let ((fn (dired-get-filename 'no-dir t)))
			(or
				(string= "." fn)
				(string= ".." fn)
			)
		)
		nil
	)
	(dired-do-kill-lines nil "")
)
(defun dired-next-line-fn ()
	"`dired-next-line` is already a thing"
	(interactive)
	(if (< linum-current-line (count-lines (point-min) (point-max)))
		 (dired-next-line 1)
	)
)
(defun dired-previous-line-fn ()
	"`dired-previous-line` is already a thing"
	(interactive)
	(if (> linum-current-line 3)
		 (dired-previous-line 1)
	)
)
(defun dired-go-home ()
	"go back to the home directory in the `dired` buffer."
	(interactive)
	(find-alternate-file "~")
)

;;; Global Keybindings ;;;

(global-unset-key (kbd "C-/"		))	;; undo
(global-unset-key (kbd "C-x u"		))	;; undo
(global-unset-key (kbd "C-_"		))	;; redo
(global-unset-key (kbd "C-M-_"		))	;; redo?
(global-unset-key (kbd "C-y"		))	;; yank
(global-unset-key (kbd "<insert>"	))	;; insert mode >:(
(global-unset-key (kbd "M-v"		))	;; move one page backwards
(global-unset-key (kbd "C-x o"		))	;; swap splitscreen buffers

(global-set-key (kbd "C-x k"		) 'kill-this-buffer-window ) ;; kills buffer + window
(global-set-key (kbd "<backspace>"	) 'delete-backward-char	   ) ;; works with tabs
(global-set-key (kbd "<f1>"			) 'toggle-truncate-lines   ) ;; line wrap
(global-set-key (kbd "<tab>"		) 'insert-tab-anywhere     ) ;; tab
(global-set-key (kbd "C-S-<tab>"	) 'previous-buffer         ) ;; normal ctrl shift tab
(global-set-key (kbd "C-x C-<tab>"	) 'other-window            ) ;; swap split buffers
(global-set-key (kbd "C-c c"		) 'kill-ring-save          ) ;; normal ctrl c
(global-set-key (kbd "C-S-a"		) 'mark-buffer             ) ;; normal ctrl a
(global-set-key (kbd "C-x C-a"		) 'copy-buffer             ) ;; normal C-ac
(global-set-key (kbd "C-<tab>"		) 'next-buffer             ) ;; normal ctrl tab
(global-set-key (kbd "C-S-z"		) 'undo-redo               ) ;; normal ctrl shift z
(global-set-key (kbd "C-z"			) 'undo                    ) ;; normal ctrl z
(global-set-key (kbd "C-v"			) 'yank                    ) ;; normal ctrl v

;;; Global Settings ;;;

(custom-set-variables
	'(auto-save-default nil)
	'(blink-cursor-mode nil)
	'(buffer-file-coding-system 'utf-8-dos t)
	'(column-number-indicator-zero-based nil)
	'(column-number-mode t)
	'(create-lockfiles nil)
	'(custom-enabled-themes '(wombat))
	'(default-buffer-file-coding-system 'utf-8-dos)
	'(default-directory home-directory t)
	'(default-file-name-coding-system 'utf-8-dos)
	'(default-keyboard-coding-system 'utf-8-dos)
	'(default-process-coding-system '(utf-8-dos . utf-8-dos))
	'(default-terminal-coding-system 'utf-8-dos)
	'(delete-trailing-lines t)
	'(display-line-numbers-type t)
	'(display-time-mode t)
	'(dired-hide-details-hide-information-lines nil)
	'(explicit-shell-file-name "pwsh.exe")	; M-x shell
	'(shell-file-name "pwsh.exe")			; M-x shell-command
	'(global-linum-mode t)
	'(indent-tabs-mode t)
	'(linum-format (lambda(line)
		; dynamic but with a space on either side of the line numbers
		(let* (
				(line-count (line-number-at-pos (point-max)))
				(width (length (number-to-string line-count)))
				(formatted (format (concat "%" (number-to-string width) "d") line))
				(face (if (= line linum-current-line)
					'linum-current-line-number-face
					'linum
				) )
			)
			(propertize (concat " " formatted " ") 'face face)
		)
	))
	'(load-path (append
		load-path
		(nthcdr 3 (directory-files "C:/Users/djanu/AppData/Roaming/.emacs.d/Elpa/" t))
		(nthcdr 3 (directory-files (concat home-directory ".emacs.d/Elpa/") t))
	))
	'(make-backup-files nil)
	'(menu-bar-mode nil)
	'(require-final-newline t)
	'(savehist-file (concat home-directory ".emacs.d/.history"))
	'(tab-width 4)
	'(tool-bar-mode nil)
)

;;; Mode Packages ;;;

(dolist
	(package '(
		gitattributes	nasm
		typescript		json
		gitconfig		rust
		gitignore		js2
		markdown		dot
		wolfram			csv
		haskell			go
	))
	(let ( (mode (intern (concat (symbol-name package) "-mode"))) )
		;; eval(f"{name}-mode")
		(require mode)
	)
)

;;; Hooks ;;;

(add-hook 'dired-after-readin-hook 'dired-omit-useless-dotfiles)
(add-hook 'tetris-mode-hook (lambda() (setq-local face-remapping-alist '((default (:height 100))))))
(add-hook 'shell-mode-hook (lambda() (setq-local default-directory home-directory)))
(add-hook 'eshell-mode-hook (lambda() (setq-local default-directory home-directory)))
(add-hook 'dired-mode-hook (lambda()
	(dired-hide-details-mode t)

	(local-unset-key (kbd "RET"))
	(local-unset-key (kbd "e"))
	(local-unset-key (kbd "f"))
	(local-unset-key (kbd "i"))
	(local-unset-key (kbd "k"))
	(local-unset-key (kbd "n"))
	(local-unset-key (kbd "B"))
	(local-unset-key (kbd "O"))
	(local-unset-key (kbd "W"))
	(local-unset-key (kbd "^"))
	(local-unset-key (kbd "#"))
	(local-unset-key (kbd "$"))
	(local-unset-key (kbd "0"))
	(local-unset-key (kbd "1"))
	(local-unset-key (kbd "2"))
	(local-unset-key (kbd "3"))
	(local-unset-key (kbd "4"))
	(local-unset-key (kbd "5"))
	(local-unset-key (kbd "6"))
	(local-unset-key (kbd "7"))
	(local-unset-key (kbd "8"))
	(local-unset-key (kbd "9"))
	(local-unset-key (kbd "-"))
	(local-unset-key (kbd "("))

	(local-set-key (kbd "~") 'dired-go-home)
	(local-set-key (kbd "`") 'dired-flag-backup-files)
	(local-set-key (kbd "q") 'dired-hide-details-mode)
	(local-set-key (kbd "SPC") 'dired-open)
	(local-set-key (kbd "S-SPC") 'dired-updir-or-next-drive)
	(local-set-key (kbd "w") 'dired-previous-line-fn)
	(local-set-key (kbd "a") 'backward-char)
	(local-set-key (kbd "s") 'dired-next-line-fn)
	(local-set-key (kbd "d") 'forward-char)
	(local-set-key (kbd "<up>") 'dired-previous-line-fn)
	(local-set-key (kbd "<down>") 'dired-next-line-fn)
))

;;; Miscallaneous Stuff ;;;

(put 'erase-buffer 'disabled nil)
(put 'dired-find-alternate-file 'disabled nil)

(push '(fullscreen . fullboth) default-frame-alist)

(set-face-attribute 'default nil :height 175)
(prefer-coding-system 'utf-8-dos)
(cd home-directory)

;;; TODOS ;;;

; Make C-↓ go down by 5 lines, or less if at the end of the buffer
; Make C-↑ go up by 5 lines, or less if at the start of the buffer
; S-← <key> should override characters
; S-→ <key> should override characters as well
; fix unzip.exe error
; If I do S-← or S-→ to highlight \t+, it highlights all of them instead of one.
; figure out how to horizontal scroll
; I don't want to be able to delete the 'PS C:/>' part of the shell buffer
; I don't want to be able to go up in the shell buffer
; I don't want to be delete previous things in the shell buffer
; Make C-` open a shell instance on the bottom of the screen (or do M-x shell-command RET)
; Make going to 10 lines and back to 9 scale back the buffer space
; Make scaling up and down the text size also scale down the buffer space
; When I open a new splitscreen window using `C-x [23]` I want to switch to that window

; How I open the `messages` buffer via command
; How do I make the `messages` buffer stop showing up automatically


; custom emacs modes to find
;  	powershell
;  	LaTeX-Log
;  	TI-BASIC

; emacs modes to package install
;  	yaml-mode
;  	lua-mode
;  	php-mode
;  	ruby-mode
;  	csharp-mode
