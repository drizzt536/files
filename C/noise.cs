// compile: csc -nologo -optimize -unsafe -target:exe -r:System.Windows.Forms.dll,System.Drawing.dll -out:noise.exe noise.cs
// I vibe coded this entire thing with Google Gemini

using System;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.Diagnostics;
using System.Threading;

public unsafe class MainForm : Form {
	[DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hWnd);
	[DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
	[DllImport("user32.dll")] static extern int GetWindowLong(IntPtr hWnd, int nIndex);
	[DllImport("user32.dll")] static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
	[DllImport("gdi32.dll")] static extern  int StretchDIBits(IntPtr hdc, int XDest, int YDest, int nDestWidth, int nDestHeight, int XSrc, int YSrc, int nSrcWidth, int nSrcHeight, void* lpBits, [In] ref BITMAPINFO lpBitsInfo, uint iUsage, uint dwRop);
	[DllImport("gdi32.dll")] static extern  int SetStretchBltMode(IntPtr hdc, int mode);

	[StructLayout(LayoutKind.Sequential)]
	public struct BITMAPINFO {
		public int biSize, biWidth, biHeight;
		public short biPlanes, biBitCount;
		public int biCompression, biSizeImage, biXPelsPerMeter, biYPelsPerMeter, biClrUsed, biClrImportant;
	}

	private uint x = 123456789, y = 362436069, z = 521288629, w = 88675123;
	private uint[] pixelBuffer;
	private BITMAPINFO bmi;
	private int screenW, screenH, renderW, renderH;
	
	private enum DistMode { Bell, Uniform, Skewed }
	private enum ColorMode { Uniform, Bell }
	private DistMode dist = DistMode.Bell;
	private ColorMode color = ColorMode.Uniform;

	private double mu    = 1.0;
	private double sigma = 0.0;
	private Random rng = new Random();

	// bell color lookup table
	private uint[] bellColorTable = new uint[2048];

	// FPS Cap Logic
	// if I put 240, it only gets like 234, so I just make it do 250, so it gets to 240
	private int[] capValues     = { 30, 60, 120, 250, 0 };
	private int[] realCapValues = { 30, 60, 120, 240, 0 }; // 0 = uncapped
	private int capIndex = 4;

	private int frames = 0;
	private Stopwatch fpsSw = Stopwatch.StartNew();
	private Stopwatch frameTimer = Stopwatch.StartNew();

	public MainForm(Screen targetScreen) {
		this.FormBorderStyle = FormBorderStyle.None;
		this.StartPosition = FormStartPosition.Manual;
		this.BackColor = Color.Black;

		// Pre-fill Color Table with Gaussian RGB
		for (int i = 0; i < bellColorTable.Length; i++) {
			uint r = (uint) Math.Min(255, Math.Max(0, 128 + 40 * BoxMuller()));
			uint g = (uint) Math.Min(255, Math.Max(0, 128 + 40 * BoxMuller()));
			uint b = (uint) Math.Min(255, Math.Max(0, 128 + 40 * BoxMuller()));

			bellColorTable[i] = 0xFFu << 24 | r << 16 | g << 8 | b;
		}

		this.Load += (s, e) => {
			SetForegroundWindow(this.Handle);
			this.Focus();
			PrintStatus();
		};

		ApplyMonitorBounds(targetScreen);
		SetWindowLong(this.Handle, -16, GetWindowLong(this.Handle, -16) & ~0x00C00000);

		Application.Idle += (s, ev) => {
			while (NativeMethods.PeekMessage(out var m, IntPtr.Zero, 0, 0, 0) == false) {
				int targetFps = capValues[capIndex];

				if (targetFps > 0) {
					double targetMs = 1000.0 / targetFps;

					while (frameTimer.Elapsed.TotalMilliseconds < targetMs);
				}
				frameTimer.Restart();

				UpdateResolution(GetNextScale());
				GenerateNoise();

				using (Graphics g = this.CreateGraphics()) {
					IntPtr hdc = g.GetHdc();
					SetStretchBltMode(hdc, 3);
					fixed (uint* p = pixelBuffer) {
						StretchDIBits(hdc, 0, 0, screenW, screenH, 0, 0, renderW, renderH, p, ref bmi, 0, 0x00CC0020);
					}
					g.ReleaseHdc(hdc);
				}

				frames++;
				if (fpsSw.ElapsedMilliseconds >= 1000) {
					PrintStatus();
					frames = 0;
					fpsSw.Restart();
				}
			}
		};
	}

	private int GetNextScale() {
		if (sigma <= 0.01)
			return (int) Math.Max(1, mu);

		double r;

		r = dist == DistMode.Bell    ? mu + sigma * BoxMuller() :
			dist == DistMode.Uniform ? mu - sigma + 2*sigma*rng.NextDouble() :
			/*skewed*/                 mu + Math.Exp(sigma * BoxMuller()) - 1;

		return (int) Math.Min(100, Math.Max(1, r));
	}

	private double BoxMuller() {
		double u1 = 1.0 - rng.NextDouble(), u2 = 1.0 - rng.NextDouble();
		return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
	}

	private void GenerateNoise() {
		fixed (uint *p = pixelBuffer) {
			uint *ptr = p;
			int len = pixelBuffer.Length;

			for (int i = 0; i < len; i++) {
				uint t = x ^ (x << 11); x = y; y = z; z = w;
				w = (w ^ (w >> 19)) ^ (t ^ (t >> 8));

				*ptr++ = color == ColorMode.Bell ? bellColorTable[w & 2047] : w;
			}
		}
	}

	private void ApplyMonitorBounds(Screen screen) {
		screenW = screen.Bounds.Width; screenH = screen.Bounds.Height;
		this.Bounds = screen.Bounds;

		SetWindowPos(
			this.Handle,
			(IntPtr) (-1),
			screen.Bounds.X,
			screen.Bounds.Y,
			screenW,
			screenH,
			0x0040
		);
	}

	private void UpdateResolution(int activeScale) {
		int newW = (int) Math.Ceiling((double) screenW / activeScale);
		int newH = (int) Math.Ceiling((double) screenH / activeScale);

		if (newW != renderW || newH != renderH) {
			renderW = newW; renderH = newH;
			pixelBuffer = new uint[renderW * renderH];
			bmi = new BITMAPINFO {
				biSize     = 40,
				biWidth    = renderW,
				biHeight   = -renderH,
				biPlanes   = 1,
				biBitCount = 32
			};
		}
	}

	private void PrintStatus() {
		double fps = frames / (fpsSw.ElapsedMilliseconds / 1000.0 + 0.0001);
		string capText = capValues[capIndex] == 0 ? "UNCAPPED" : realCapValues[capIndex].ToString();
		Console.Write($"\rFPS: {fps:F0} | CAP: {capText} | Mode: {dist}/{color} | μ: {mu:F1} | σ: {sigma:F1}\x1b[K");
	}

	protected override void OnKeyDown(KeyEventArgs e) {
		if (e.KeyCode == Keys.Escape) Application.Exit();
		if (e.KeyCode == Keys.R) ApplyMonitorBounds(Screen.FromControl(this));

		if (e.KeyCode == Keys.D1) dist = DistMode.Bell;
		if (e.KeyCode == Keys.D2) dist = DistMode.Uniform;
		if (e.KeyCode == Keys.D3) dist = DistMode.Skewed;

		if (e.KeyCode == Keys.K)
			color = color == ColorMode.Uniform ? ColorMode.Bell : ColorMode.Uniform;

		// FPS Cap Cycle (F)
		if (e.KeyCode == Keys.F)
			capIndex = (capIndex + 1) % capValues.Length;

		if (e.KeyCode == Keys.Z) {
			mu       = 1.0;
			sigma    = 0.0;
			dist     = DistMode.Bell;
			color    = ColorMode.Uniform;
			capIndex = 4;
		}

		if (e.KeyCode == Keys.Up)    mu = Math.Min(100, mu + 1);
		if (e.KeyCode == Keys.Down)  mu = Math.Max(1, mu - 1);
		if (e.KeyCode == Keys.Right) sigma = Math.Min(50, sigma + 0.5);
		if (e.KeyCode == Keys.Left)  sigma = Math.Max(0, sigma - 0.5);

		PrintStatus();
	}

	[STAThread]
	public static void Main(string[] args) {
		Screen[] screens = Screen.AllScreens;
		int targetIndex = -1;

		if (args.Length > 0)
			int.TryParse(args[0].Replace("--monitor", "").Trim(), out targetIndex);

		if (targetIndex < 0 || targetIndex >= screens.Length) {
			Console.WriteLine("Noise Engine | ESC: Exit | R: Recalibrate | Z: Reset");
			Console.WriteLine("Keys: [1-3] Dist [K] Color [F] FPS Cap | Arrows: μ/σ");

			for (int i = 0; i < screens.Length; i++)
				Console.WriteLine($"[{i}] {screens[i].DeviceName}");

			Console.Write("\nSelect monitor index: ");
			int.TryParse(Console.ReadLine(), out targetIndex);
		}

		if (targetIndex >= 0 && targetIndex < screens.Length)
			Application.Run(new MainForm(screens[targetIndex]));
		else {
			Console.ForegroundColor = ConsoleColor.Red;
			Console.WriteLine($"\n[ERROR]: Invalid index {targetIndex}. Closing.");
			Console.ResetColor();
		}
	}
}

internal static class NativeMethods {
	[StructLayout(LayoutKind.Sequential)]
	public struct Msg { public IntPtr hWnd; public uint msg; public IntPtr wParam, lParam, time; public Point p; }
	[DllImport("user32.dll")] public static extern bool PeekMessage(out Msg lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax, uint wRemoveMsg);
}
