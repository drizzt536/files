# miscellaneous functions

def getmonitors() -> tuple:
    # basically stolen from the "screeninfo" library, but only works in windows now.
    # it is slightly upgraded (kind of) as there is much less useless garbage everywhere for no reason.
    def enumeratemonitors():
        def callback(monitor, dc, rect, data):
            class MONITORINFOEXW(ctypes.Structure):
                _fields_ = [
                    ("cbSize", ctypes.wintypes.DWORD),
                    ("rcMonitor", ctypes.wintypes.RECT),
                    ("rcWork", ctypes.wintypes.RECT),
                    ("dwFlags", ctypes.wintypes.DWORD),
                    ("szDevice", ctypes.wintypes.WCHAR * 32),
                ]
            info = MONITORINFOEXW()
            info.cbSize = 104
            if ctypes.windll.user32.GetMonitorInfoW(monitor, ctypes.byref(info)):
                name = info.szDevice
            else:
                name = None
            h_size = ctypes.windll.gdi32.GetDeviceCaps(dc, 4)
            v_size = ctypes.windll.gdi32.GetDeviceCaps(dc, 6)
            rct = rect.contents
            monitors.append({
                "x": rct.left,
                "y": rct.top,
                "width": rct.right - rct.left,
                "height": rct.bottom - rct.top,
                "width_mm": h_size,
                "height_mm": v_size,
                "name": name,
                "is_primary": not (rct.left or rct.top)
            })
            return 1
        import ctypes, ctypes.wintypes
        monitors = []
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
        ctypes.windll.user32.EnumDisplayMonitors(
            0,
            None,
            ctypes.WINFUNCTYPE(
                ctypes.c_int,
                ctypes.c_ulong,
                ctypes.c_ulong,
                ctypes.POINTER(ctypes.wintypes.RECT),
                ctypes.c_double,
            )(callback),
            0
        )
        yield from monitors
    return tuple( enumeratemonitors() )

def view_module(module, form:int=1) -> object:
    import _string # smallest standard module I could find. 2 functions, no inner modules
    global Module
    Module = type(_string)
    try:
        if not isinstance(module, Module):
            0/0
        module = module.__dict__
    except Exception:
        raise TypeError("1st input is not a module")
    if form == 1: return tuple(module)
    elif form == 2: return list(module)
    elif form == 3: return set(module)
    elif form == 4: return module.keys()


# variables

NoneType = type(None)
true = True
false = False
NoneType = type(None)
ellipsis = type(...)
NotImplementedType = type(NotImplemented)
generator = type(0 for i in []) # useless
function = type(lambda x: x) # useless
