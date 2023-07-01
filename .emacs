(global-set-key (kbd "C-z") 'undo)						;; ctrl z
(global-set-key (kbd "C-S-z") 'undo-redo)				;; ctrl shift z
(global-set-key (kbd "<f1>") 'toggle-truncate-lines)	;; toggle line wrap

(global-unset-key (kbd "C-x u"))
(global-unset-key (kbd "C-M-_"))
(global-unset-key (kbd "C-/"))
(global-unset-key (kbd "C-_"))

(custom-set-variables
	'(custom-enabled-themes '(wombat))
	'(tool-bar-mode nil)
	'(global-display-line-numbers-mode t)
	'(display-line-numbers-type t)
	'(display-time-mode t)
	'(column-number-mode t)
	'(blink-cursor-mode nil)
	'(dired-omit-files nil)
	'(tab-width 4)
	'(make-backup-files nil)
	'(create-lockfiles nil)
)

(custom-set-faces '(default (( t (:height 150) )) ))
(add-to-list 'default-frame-alist '(fullscreen . fullboth))
