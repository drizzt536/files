@echo off
cd "D:/ExtF/CodeFiles/C"
echo #include ^<stdio.h^>> test.c
echo:>>test.c
echo int main(void)>> test.c
echo {>>test.c
echo 	printf("Hello World\n");>> test.c
echo 	return 0;>>test.c
echo }>> test.c
gcc -o testF.exe test.c
del test.c
testF
del testF.exe