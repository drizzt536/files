FRAC
ClrHome
Disp "{ Terms }
Input "L₁=",L₁
abs(L₁(1→N
If N≠0 and N≠1
Then
{1,N→⌊Q
Else
{N→⌊Q
End
2→B
Lbl A1
If B≥N/B
Then
Goto B1
Else
If N/B=int(N/B
Then
augment(⌊Q,{B→⌊Q
augment({N/B},⌊Q→⌊Q
End
B+1→B
Goto A1
End
Lbl B1
If B²=N
Then
augment(⌊Q,{B→⌊Q
End
SortD(⌊Q
DelVar A
While L₁(dim(L₁)-A)=0
A+1→A
End
abs(L₁(dim(L₁)-A→N
If N≠0 and N≠1
Then
{1,N→⌊P
Else
{N→⌊P
End
2→B
Lbl A2
If B≥N/B
Then
Goto B2
Else
If N/B=int(N/B
Then
augment(⌊P,{B→⌊P
augment({N/B},⌊P→⌊P
End
B+1→B
Goto A2
End

Lbl B2
If B²=N
Then
augment(⌊P,{B→⌊P
End
SortD(⌊P
DelVar A
1→B
{1,­1→L₂
While dim(⌊P)-A>0
While dim(⌊Q)-B>0
⌊P(dim(⌊P)-A)/⌊Q(dim(⌊Q)-B→C
If C≠0 and sum((L₂/C)=1)=0
Then
augment(L₂,{C→L₂
augment(L₂,{­C→L₂
End
B+1→B
End
A+1→A
DelVar B
End
ClrHome
Disp "Ans=
1→A
{0→L₄
dim(L₁)-2→B
While A<dim(L₂
L₂(A→X
L₁(1)X+L₁(2→C
{L₁(1),C→L₃
For(D,1,B
CX+L₁(D+2)→C
augment(L₃,{C→L₃
End
If L₃(dim(L₃))<1­10 and L₃(dim(L₃))>­1­10
Then
augment(L₄,{L₂(A→L₄
ClrHome
Disp "Ans=",L₄
End
A+1→A
End
0→X
L₁(2→C
{L₁(1),C→L₃
For(D,1,B
CX+L₁(D+2→C
End
If C<1­10 and C>­1­10
Then
augment({0},L₄→L₄
ClrHome
Disp "Ans=",L₄
End
If 1=dim(L₄
Then
Goto D
End
dim(L₄→B
{L₄(2→L₅
For(A,3,B
augment(L₅,{L₄(A→L₅
End
L₅→L₄
ClrList L₅
Lbl D
ClrHome
Disp "Ans=
SortA(L₄
L₄
