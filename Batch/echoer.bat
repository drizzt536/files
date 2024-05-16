@echo off
echo @echo off>echoed.bat
echo cd "D:/ExtF/CodeFiles/C">>echoed.bat
echo echo #include ^^^<stdio.h^^^>^>test.c>>echoed.bat
echo echo:^>^>test.c>>echoed.bat.
echo echo int main(void)^>^> test.c>>echoed.bat
echo echo {^>^>test.c>>echoed.bat
echo echo 	printf("Hello World\n");^>^>test.c>>echoed.bat
echo echo 	return 0;^>^>test.c>>echoed.bat
echo echo }^>^> test.c>>echoed.bat
echo gcc -o testF.exe test.c>>echoed.bat
echo del test.c>>echoed.bat
echo testF>>echoed.bat
echo cd "D:/ExtF/CodeFiles/batch">>echoed.bat
echo start /b "" cmd /c del "echoed.bat"^&exit /b>>echoed.bat
echoed
