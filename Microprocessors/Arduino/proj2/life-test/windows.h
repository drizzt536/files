#pragma once
#define _WINDOWS_

#include <stdbool.h>
#include <stdint.h>
#include <winuser.rh> // CF_TEXT and VK_* stuff

// these types have nothing to do with the Windows API, I just need them now.
typedef int8_t   i8;
typedef int16_t  i16;
typedef int32_t  i32;
typedef int64_t  i64;
typedef __int128 i128;

typedef uint8_t  u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;
typedef unsigned __int128 u128;

// Most of the stuff that is `void *` is actually some opaque type.
// The Windows API loves its opaque types.

// CRYPTBASE.dll (or Advapi32.dll)
bool SystemFunction036(void *buffer, u32 length);
#define RtlGenRandom		SystemFunction036

// USER32.dll
u32 GetAsyncKeyState(u32 vkey);
bool OpenClipboard(void *owner);
bool EmptyClipboard();
bool CloseClipboard();
void *SetClipboardData(u32 format, void *hMem);

// KERNEL32.dll
void Sleep(u32 ms);
void *GlobalAlloc(u32 flags, u64 len);
void *GlobalLock(void *hMem);
bool GlobalUnlock(void *hMem);
u32 GetLastError(void);
void *CreateMutexA(void *attrs, bool owner, char *name);
u32 WaitForSingleObject(void *handle, u32 ms);
void *GetCurrentProcess(void);
bool SetPriorityClass(void *process, u32 priorityClass);

#define GMEM_MOVEABLE 0x0002
#define ERROR_ALREADY_EXISTS 183
#define REALTIME_PRIORITY_CLASS 0x100

// define the real names for the stupid functions
#define WaitForMutexUnlock WaitForSingleObject
#define AllocateWindowsFuckassBullshitGlobalMemoryNonsense GlobalAlloc
#define RealPointerFromWindowsFuckassBullshitGlobalMemoryNonsense GlobalLock
#define SomeMoreWindowsFuckassBullshitGlobalMemoryNonsenseIDontEvenKnowWhatThisIsFor GlobalUnlock
