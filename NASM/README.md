programs under `./ucrt/` use Lib C functions from `ucrtbase.dll`.<br>
programs under `./winapi/` use the Windows API (`kernel32.dll`, `user32.dll`, etc.).<br>
programs under `./libasm/` contains stuff (not full programs) that doesn't use libraries.<br>
programs under `./api+crt/` use both the Windows API and Lib C functions.

the programs are all compileable with `assemble FILENAME --infer`
