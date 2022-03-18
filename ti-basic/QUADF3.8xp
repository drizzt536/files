a+b
Float
ClrHome
Disp "ax²+bx+c
Prompt A,B,C
2→I
While fPart(A)+fPart(B)+fPart(C
AI→A
BI→B
CI→C
I+1→I
End
gcd(abs(A),gcd(abs(B),abs(C→X
A/X→A
B/X→B
C/X→C
B²-4AC→D
B→M
­B→B
.5/A(B+√(D→N
.5/A(B-√(D→R
ClrHome
Disp "",N
N=R
If not(Ans
Disp R
Output(1-Ans,1,"X   (N,R) =
Output(4-Ans,2,"D=
Output(4-Ans,4,D
If √(D)=int(√(D
Goto E
D→H
2A→J
1→G
2→I
While I²≤abs(D
While not(fPart(D/I²
D/I²→D
GI→G
End
I+1+(I>2→I
End
If D<0
Then
G→G
abs(D→D
End
If B<0 and J<0
Then
abs(B→B
abs(J→J
End
gcd(abs(B),gcd(abs(G),abs(J→X
B/X→B
G/X→G
J/X→J
Output(7,12,"Ready
Pause 
ClrHome
Disp "","
Output(1,1,B
B→V
prgmSCRNLEN
Ans+1-(B=0
Output(1,Ans,"+-
Ans+2→E
Output(1,E,G
G→V
prgmSCRNLEN
E+Ans-(real(G)=1 and not(imag(G
Output(1,Ans,"√
Output(1,1+Ans,abs(D
2+(B<0)+real(int(log(B
If J≠1
Then
Output(2,Ans,"
Output(2,1+Ans,J
End
Output(4,2,"D=
Output(4,4,H
Lbl E
Output(5,2,"A=
Output(6,2,"B=
Output(7,2,"C=
Output(5,4,A
Output(6,4,M
Output(7,4,C
