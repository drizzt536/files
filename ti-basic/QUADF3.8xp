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
Disp "X = ",X
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
While I²≤abs(D
While not(fPart(D/I²
D/I²→D
GI→G
End
I+1+(I>2→I
End
If D<0:G→G
abs(D→D
If B<0 and J<0
Then
abs(B→B
abs(J→J
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
prgmSCRNLEN
Ans+1-not(B
Output(1,Ans,"+
Ans+1→E
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
Output(5,2,"a=
Output(6,2,"b=
Output(7,2,"c=
Output(5,4,A
Output(6,4,M
Output(7,4,C
