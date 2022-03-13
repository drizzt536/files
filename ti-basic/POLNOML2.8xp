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
While 0=L₁(dim(L₁)-A
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
Goto B2
If N/B=int(N/B
Then
augment(⌊P,{B→⌊P
augment({N/B},⌊P→⌊P
End
B+1→B
Goto A2
Lbl B2
If B²=N
Then
augment(⌊P,{B→⌊P
End
SortD(⌊P
DelVar A
1→B
{1,­1→L₂
If 0=L₁(dim(L₁
Then
augment({0},L₂→L₂
End
While A<dim(⌊P
While B<dim(⌊Q
⌊P(dim(⌊P)-A)/⌊Q(dim(⌊Q)-B→C
If 0=sum(L₂=C
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
CX+L₁(D+2→C
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
If dim(L₄)=1 and L₄(1)=0 and 0≠L₁(dim(L₁
Then
Disp "No Roots Found
End
L₄
