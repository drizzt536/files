(defun copy-buffer ()
	"Copy the entire buffer"
	(interactive)
	(kill-new (buffer-string))
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
(defun dired-find-file-same-buffer ()
	"Doesn't create a new `dired` buffer, and just reuses the current one."
	(interactive)
	(let (
			(file (dired-get-file-for-visit))
		)
		(if (file-directory-p file)
			(dired-find-alternate-file)
			(find-file (dired-get-file-for-visit))
		)
	)
)
;; home-directory is defined in the original emacs config file
;; It should be "D:/ExtF/CodeFiles/" unless it has changed.

(global-unset-key (kbd "C-/"		))	;; undo
(global-unset-key (kbd "C-x u"		))	;; undo
(global-unset-key (kbd "C-_"		))	;; redo
(global-unset-key (kbd "C-M-_"		))	;; redo?
(global-unset-key (kbd "C-y"		))	;; yank
(global-unset-key (kbd "<insert>"	))	;; insert mode >:(
(global-unset-key (kbd "M-v"		))	;; move one page backwards
(global-unset-key (kbd "C-x o"		))	;; swap splitscreen buffers

(global-set-key (kbd "<backspace>"	) 'delete-backward-char  ) ;; works with tabs
(global-set-key (kbd "<f1>"			) 'toggle-truncate-lines ) ;; line wrap
(global-set-key (kbd "<tab>"		) 'insert-tab-anywhere   ) ;; tab
(global-set-key (kbd "C-x C-<tab>"	) 'other-window          ) ;; swap splitscreen buffers
(global-set-key (kbd "C-S-<tab>"	) 'previous-buffer       ) ;; normal ctrl shift tab
(global-set-key (kbd "C-S-a"		) 'mark-whole-buffer     ) ;; normal ctrl a
(global-set-key (kbd "C-x C-a"		) 'copy-buffer           ) ;; normal C-ac
(global-set-key (kbd "C-<tab>"		) 'next-buffer           ) ;; normal ctrl tab
(global-set-key (kbd "C-S-z"		) 'undo-redo             ) ;; normal ctrl shift z
(global-set-key (kbd "C-z"			) 'undo                  ) ;; normal ctrl z
(global-set-key (kbd "C-v"			) 'yank                  ) ;; normal ctrl v
(global-set-key (kbd "C-c c"		) 'kill-ring-save        ) ;; normal ctrl v


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
	'(delete-trailing-lines t)
	'(dired-omit-files nil)
	'(display-line-numbers-type t)
	'(display-time-mode t)
	'(explicit-shell-file-name "pwsh.exe")	; M-x shell
	'(shell-file-name "pwsh.exe")			; M-x shell-command
	'(global-linum-mode t)
	'(indent-tabs-mode t)
	'(linum-format (lambda(line) ; dynamic but with a space on either side of the line numbers
		(let* (
				(line-count (line-number-at-pos (point-max)))				; count the lines
				(len (length (number-to-string line-count)))				; calculate the width
				(num (format (concat "%" (number-to-string len) "d") line))	; Format the line numbers
				(face (if (= line linum-current-line) 'linum-current-line-number-face 'linum))
			)
			(propertize (concat " " num " ") 'face face)
		)
	))
	'(load-path (append
		load-path																		; original paths
		(nthcdr 3 (directory-files "C:/Users/djanu/AppData/Roaming/.emacs.d/Elpa/" t))	; include C:
		(nthcdr 3 (directory-files (concat home-directory ".emacs.d/Elpa/") t)) 		; include D:
	))
	'(make-backup-files nil)
	'(menu-bar-mode nil)
	'(require-final-newline t)
	'(savehist-file (concat home-directory ".emacs.d/.history"))
	'(tab-width 4)
	'(tool-bar-mode nil)
)

(add-hook 'shell-mode-hook (lambda() (setq-local default-directory home-directory)))
(add-hook 'eshell-mode-hook (lambda() (setq-local default-directory home-directory)))

(add-to-list 'default-frame-alist '(fullscreen . fullboth))

(set-face-attribute 'default nil :height 175)
(put 'erase-buffer 'disabled nil)
(prefer-coding-system 'utf-8)
(cd home-directory)

(with-eval-after-load 'dired
	(define-key dired-mode-map (kbd "RET") 'dired-find-file-same-buffer)
)

(dolist
	;; These packages already map the extensions to the modes
	(package '(
		gitattributes	nasm
		typescript		json
		gitconfig		rust
		gitignore		js2
		markdown		dot
		wolfram			go
	))
	(let ( (mode (intern (concat (symbol-name package) "-mode"))) )
		(require mode)
	)
)
