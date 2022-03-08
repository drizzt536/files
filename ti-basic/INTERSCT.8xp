a+b
ClrHome
Lbl A
Menu("  Select Input  ","Linear,Linear",1,"Linear,Quad",2,"Quad,Quad",3,"Ellipse,Linear",4,"Ellipse,Quad",5,"Triples",6,"Next",B
Lbl B
Menu("  Select Input  ","x*y,Linear",7,"x*y,Quad",8,"a^(bx+c) × 2",9,"Back",A
Lbl 1
Menu("  Select Input  ","y=mx+b",11,"ax+by=c",12
Lbl 12
Disp "1: ax+by=c
Input "a=",A
Input "b=",B
Input "c=",C
­A/B→M
C/B→B
ClrHome
Disp "2: ax+by=c
Input "a=",A
Input "b=",C
Input "c=",D
­A/C→A
D/C→C
Goto 13
Lbl 11
Disp "1: y=mx+b
Input "m=",M
Input "b=",B
ClrHome
Disp "2: y=mx+b
Input "m=",A
Input "c=",C
Lbl 13
ClrHome
If M=A and B≠C
Then
Disp "No Solution
End
If M=A and B=C
Then
Disp "All Real Numbers
End
If M≠A
Then
(C-B)/(M-A→X
MX+B→Y
Disp "(x₁,y₁)",X,Y
End
Stop
Lbl 2
Disp "1: y=ax²+bx+c
Input "a=",A
Input "b=",B
Input "c=",C
ClrHome
Disp "2: y=mx+b
Input "m=",M
Input "b=",D
ClrHome
(M-B+√((B-M)²-4A(C-D)))/(2A→E
(M-B-√((B-M)²-4A(C-D)))/(2A→G
ME+D→F
MG+D→H
Disp "(x₁,y₁),(x₂,y₂)",E,F,G,H
Stop
Lbl 3
Disp "1: y=ax²+bx+c
Input "a=",A
Input "b=",B
Input "c=",C
ClrHome
Disp "2: y=ax²+bx+c
Input "a=",D
Input "b=",E
Input "c=",F
ClrHome
(E-B+√((B-E)²-4(A-D)(C-F)))/(2A-2D→G
(E-B-√((B-E)²-4(A-D)(C-F)))/(2A-2D→I
DG²+EG+F→H
DI²+EI+F→J
Disp "(x₁,y₁),(x₂,y₂)",G,H,I,J
Stop
Lbl 4
Disp "a(x-h)²+b(y-k)²"," = r²
Input "a=",A
Input "b=",B
Input "h=",H
Input "k=",K
Input "r=",R
ClrHome
Disp "y=mx+b
Input "m=",M
Input "b=",C
ClrHome
A+BM²→D
2BM(C-K)-2AH→E
B(C-K)²-RR+AH²→F
(√(E²-4DF)-E)/(2D→G
(E+√(E²-4DF))/(­2D→I
MG+C→H
MI+C→J
Disp "(x₁,y₁),(x₂,y₂)",G,H,I,J
Stop
Lbl 5
Disp "a(x-h)²+b(y-k)²"," = r²
Input "a=",G
Input "b=",I
Input "h=",H
Input "k=",K
Input "r=",R
ClrHome
Disp "y=ax²+bx+c
Input "a=",J
Input "b=",L
Input "c=",F
ClrHome
3→dim(⌊Z
J→⌊Z(1
L→⌊Z(2
F→⌊Z(3
J²I→A
2JIL→B
G+I(2J(F-K)+L²→C
2(IL(F-K)-GH→D
GH²+I(F-K)²-RR→E
prgmQUARTIC2
⌊Z(1→A
⌊Z(2→B
⌊Z(3→C
AX²+BX+C→D
AY²+BY+C→E
AZ²+BZ+C→F
Aθ²+Bθ+C→G
ClrList ⌊Z
ClrHome
Disp "(x₁,y₁),(x₂,y₂)",X,D,Y
Pause E
ClrHome
Disp "(x₃,y₃),(x₄,y₄)",Z,F,θ,G
Stop
Lbl 6
Disp "1: ax+by+cz=d
Input "a=",A
Input "b=",B
Input "c=",C
Input "d=",D
ClrHome
Disp "2: ax+by+cz=d
Input "a=",E
Input "b=",F
Input "c=",G
Input "d=",H
ClrHome
Disp "3: ax+by+cz=d
Input "a=",I
Input "b=",J
Input "c=",K
Input "d=",L
ClrHome
((KH-GL)(BG-CF)-(GD-CH)(FK-JG))/((EC-AG)(FK-JG)-(IG-EK)(BG-FC→Q
(IGQ-EKQ+KH-GL)/(FK-JG→R
If C≠0
Then
(D-AQ-BR)/C→S
Else
If G≠0
Then
(H-EQ-FR)/G→S
Else
(L-IQ-JR)/K→S
End
Disp "(x,y,z) (Q,R,S)",QFrac,RFrac,SFrac
Stop
Lbl 7
ClrHome
Disp "1: axy=b
Input "a=",A
Input "b=",B
ClrHome
Disp "2: y=mx+b
Input "m=",M
Input "b=",C
ClrHome
If A=0
Then
Disp "No Solution
End
If A≠0 and B=0
Then
If M=0 and C=0
Then
Disp "All Real Numbers","  y = 0
Else
If M≠0 and C=0
Then
Goto 71
Else
If M=0 and C≠0
Then
Disp "No Solution
Else
If M≠0 and C≠0
Then
Disp "(x,y)",­C/MFrac,0
End
End
End
End
End
If A≠0 and B≠0
Then
If M=0 and C=0
Then
Disp "No Solution
Else
If M≠0 and C=0
Then
Goto 71
Else
If M=0 and C≠0
Then
Disp "(x,y)",B/A/CFrac,C
Else
If M≠0 and C≠0
Then
Goto 71
End
End
End
End
End
Goto 82
Lbl 71
(√((AC²+4MB)A)-C)/(2M→X
(C+√((AC²+4MB)A))/(­2M→Z
MX+C→Y
MZ+C→θ
ClrHome
Disp "(x₁,y₁),(x₂,y₂)",X,Y,Z,θ
Lbl 8
Disp "1: axy=b
Input "a=",A
Input "b=",B
ClrHome
Disp "2: y=ax²+bx+c
ClrList ⌊Z
Input "a=",C
Input "b=",D
Input "c=",E
ClrHome
If A=0
Then
Disp "No Solution
End
If B=0 and A≠0
Then
If C=0 and D=0 and E=0
Then
Disp "All Real Numbers","  y = 0
Else
If C=0 and D=0 and E≠0
Then
Disp "No Solution
Else
If C=0 and D≠0
Then
Disp "(x,y)",­E/D,0
Else
If C≠0
Then
Disp "(x₁,y₁),(x₂,y₂)",(­D+√(D²-4CE))/(2C),0,(­D-√(D²-4CE))/(2C),0
End
End
End
End
End
If B≠0 and A≠0
Then
If C=0 and D=0 and E=0
Then
Disp "No Solution
Else
If C=0 and D=0
Then
Disp "(x₁,y₁)",B/(AE),E
Else
If A≠0 and C=0
Then
(­AE+√(A²E²+4ADB))/(2AD→X
DX+E→Y
(­AE-√(A²E²+4ADB))/(2AD→Z
DZ+E→θ
Disp "(x₁,y₁),(x₂,y₂)",X,Y,Z,θ
Else
If A≠0 and B≠0 and C≠0
Then
Disp "(x,y)",√(B/AC),C√(B²)/√(A²C²
Else
If A≠0 and B≠0 and C≠0
Then
Goto 81
End
End
End
End
End
End
Goto 82
Lbl 81
C→⌊Z(1
D→⌊Z(2
E→⌊Z(3
A→F
D→G
­B→D
FG→B
FC→A
FE→C
­B/27/A+BC/6/A²-D/(2A→E
C/A/3-B²/(9A²→F
√(F²+F→G
√(F+G)+√(F-G)-B/3/A→X
AX+B→B
BX+C→C
√(B²-4AC→G
(G-B)/(2A→Y
(B+G)/(­2A→Z
⌊Z(1→A
⌊Z(2→B
⌊Z(3→C
AX²+BX+C→D
AY²+BY+C→E
AZ²+BZ+C→F
ClrHome
Disp "(x₁,y₁),(x₂,y₂)",X,D,Y
Pause E
ClrHome
Disp "(x₃,y₃)",Z,F
Lbl 82
Stop
Lbl 9
ClrHome
Disp "y = a^(bx+c)=","y = d^(ex+f)
Input "a=",A
Input "b=",B
Input "c=",C
Input "d=",D
Input "e=",E
Input "f=",F
ClrHome
If (A=1 or B=0) and (F=1 or G=0
Then
If A^C=F^H
Then
A^C→Y
Disp "x,y","All Real",Y
Else
Disp "No Solution
End
Else
(Fln(D)-Cln(A))/(Bln(A)-Eln(D→X
A^((CE-FB)/(E-Blog(A,f→Y
Disp "(x,y)",X,Y
End
