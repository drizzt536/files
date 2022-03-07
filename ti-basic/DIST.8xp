ClrHome
DelVar O
Disp "(x₁,y₁),(x₂,y₂)
Input "x₁=",B
Input "y₁=",C
Input "x₂=",D
Input "y₂=",F
Input "Midpoint?",Q
(D-B)²+(F-C)²→G
ClrHome
If √(G)=int(√(G
Then
Output(1,1,√(G
1→O
Else
Output(2,1,"√(
Output(2,3,G
G→R
1→A
2→I
While I²≤abs(G
While not(fPart(G/I²
G/I²→G
AI→A
End
I+1+(I>2→I
End
1+int(log(A
If A≠1
Output(1,1,A
Ans-(A=1)
If G<0
Then
Output(1,1+Ans,"
Ans+1
End
If 1≠abs(G
Then
Output(1,1+Ans,"√(
Output(1,3+Ans,G((G>0)-(G<0
End
End
If G=R
Then
Output(2,1,"
End
If Q=1 and Q≠0
Then
prgmMPF
End
Disp "","","","","
