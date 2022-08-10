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
If not(fPart(√(G
Then
Output(1,1,√(G
1→O
Else
Output(2,1,"√(
Output(2,3,G
G→R
1→A
For(I,2,√(abs(G)),1+(I>2
While not(fPart(G/I^2
G/I^2→G
AI→A
End
End
Disp "
Output(1,1,A
2-(A=1)+int(log(A
If R<0
Output(1,Ans,"i
Ans+(G<0
If 1≠abs(G
Then
Output(1,Ans,"√(
Output(1,2+Ans,abs(G
End
End
If G=R
Then
Output(2,1,"
End
If Q=1
Then
prgmMPF
End
Disp "","","","","
