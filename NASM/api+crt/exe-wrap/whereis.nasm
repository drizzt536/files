;; ../../assemble whereis --l kernel32,shlwapi,msvcrt

;; this assumes %MINGW_BIN% is an environment variable, which I created myself
%define FILE_PATH "%%MINGW_BIN%%/which"
%include "./exe-wrap.nasm"
