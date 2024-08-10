a+b
ClrHome
Disp "ax²+bx+c=0
Input "a=",A
Input "b=",B
Input "c=",C
If not(real(A) or imag(A:Then
If not(real(B) or imag(B:Then
If not(real(C) or imag(C:Then
Disp "All Real
Return:End
Disp "No Solution
Return:End
­C/B→X
Disp "X =",X
Return:End
2→I
While fPart(real(A)) or fPart(imag(A)) or fPart(real(B)) or fPart(imag(B)) or fPart(real(C)) or fPart(imag(C
AI→A
BI→B
CI→C
I+1→I
End
1/gcd(abs(real(A)),gcd(abs(imag(A)),gcd(abs(real(B)),gcd(abs(imag(B)),gcd(abs(real(C)),abs(imag(C→X
AX→A
BX→B
CX→C
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
If not(abs(fPart(√(D
Goto E
D→H
2A→J
1→G
2→I
If imag(D
Then
gcd(abs(real(D)),abs(imag(D→K
Else
real(D→K
End
While I²≤abs(K
While not(fPart(K/I²
K/I²→K
GI→G
End
I+1+(I>2→I
End
If not(imag(K
Then
If 0>real(K
Then
G→G
­D→D
End
End
D/G²→D
If real(B)<0 and imag(B)<0 and real(J)<0 and imag(J)<0
Then
­B→B
­J→J
End
1/gcd(abs(real(B)),gcd(abs(imag(B)),gcd(abs(real(G)),gcd(abs(imag(G)),gcd(abs(real(J)),abs(imag(J→X
BX→B
GX→G
JX→J
Output(7,12,"Ready
Pause 
ClrHome
Disp "","
Output(1,1,B
B→V
prgmLEN
Ans+1-not(real(B) or imag(B
Output(1,Ans,"+
Ans+1→E
Output(1,E,G
G→V
prgmLEN
E+Ans-(real(G)=1 and not(imag(G:Output(1,Ans,"√
Output(1,1+Ans,D
B→V
prgmLEN
If real(J)≠1 or imag(J)≠0
Then
Output(2,1+W,"
Output(2,2+W,J
End
Output(4,2,"D=
Output(4,4,H
Lbl E
Output(5,2,"a=
Output(6,2,"b=
Output(7,2,"c=
Output(5,4,A
Output(6,4,M
Output(7,4,C
