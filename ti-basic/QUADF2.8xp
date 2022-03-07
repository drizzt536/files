ClrHome
Float
a+b
DelVar P
DelVar Q
DelVar S
DelVar θ
Disp "Whole Numbers","ax²+bx+c
Input "a=",A
Input "b=",B
Input "c=",C
B²-4AC→D
(­B+√(D))/(2A→N
(­B-√(D))/(2A→R
ClrHome
Disp "",NFrac
If N≠R
Then
Disp RFrac
Output(1,1,"N,R   X=
Else
1→S
Output(1,1,"N   X=
End
Output(4-S,2,"D=
Output(4-S,4,D
D→H
If √(D)=int(√(D
Then
Output(5-S,2,"A=
Output(5-S,4,A
Output(6-S,2,"B=
Output(6-S,4,B
Output(7-S,2,"C=
Output(7-S,4,C
Goto 1
End
B→M
­B→B
B→V
prgmSCRNLEN
3+W→E
1→G
2→I
While I²≤abs(D
While not(fPart(D/I²
D/I²→D
GI→G
End
I+1+(I>2→I
End
1+int(log(G→F
If D<0
Then
abs(D→D
End
D→V
prgmSCRNLEN
2A→J
G→O
If B=0
Then
P+1→P
End
If B<0 and J<0
Then
abs(B→B
abs(J→J
Q+1→Q
End
gcd(gcd(abs(B),abs(G)),abs(J→X
B/X→B
G/X→G
J/X→J
If M≠0 and B≠0
Then
P→Z
P-real(int(log(M)))+real(int(log(B→P
P→Y
Z→P
End
Output(7,12,"Ready
Pause 
ClrHome
If B≠0
Then
Output(1,1,B
B→V
prgmSCRNLEN
Output(1,1+W,"+-
Else
Output(1,1,"+-
1→P
DelVar W
End
If G≠1
Then
3+W→E
Output(1,E-P-Q,G
Else
O→V
prgmSCRNLEN
E-W→E
End
G→V
E→K
prgmSCRNLEN
If H<0
Then
Output(1,E+W-P-Q,"
E+1→K
End
Output(1,K+W-P-Q,"√(
K+W+2→L
Output(1,L-P-Q,D
D→V
prgmSCRNLEN
Output(1,L+W-P-Q,")
If J<0 and B=0
Then
abs(J→J
End
If B≠0
Then
If 1≤real(int(log(B
Then
-1+real(int(log(B→θ
If B<0
Then
θ+1→θ
End
End
End
If J≠1
Then
Output(2,3+θ,"
Output(2,4+θ,J
End
If D≠H
Then
Output(4,2,"D=
Output(4,4,H
DelVar θ
Else
1→θ
End
Output(5-θ,2,"A=
Output(5-θ,4,A
Output(6-θ,2,"B=
Output(6-θ,4,M
Output(7-θ,2,"C=
Output(7-θ,4,C
Disp "","
Lbl 1
