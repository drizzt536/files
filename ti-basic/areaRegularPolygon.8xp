Degree
ClrHome
Menu("  Select Input  ","Num of Sides",1,"External ∠",2,"Internal ∠",3,"Central ∠",4
Lbl 1
Disp "Num of Sides?
Prompt S
If S≠int(S) or S<3
Then
ClrHome
Goto 1
End
Goto 5
Lbl 2
Disp "External ∠
Prompt A
360/A→S
DelVar A
Goto 5
Lbl 3
Disp "Internal ∠?
Prompt I
360/(180-I)→S
DelVar I
Goto 5
Lbl 4
Disp "Central ∠?"
Prompt C
360/C→S
Lbl 5
ClrHome
180/S→C
Menu("  Select Input  ","Radius",R,"Apothem",A,"Side Length",S,"Points",6
Lbl R
Prompt R
Rsin(C→D
Rcos(C→E
DSE
Goto 70
Lbl A
Prompt A
Atan(C→D
ADS
Goto 70
Lbl S
Input "S=?",N
N/2/tan(C→E
NSE/2
Goto 70
Lbl 6
prgmLAG
Menu("  Select Input  ","Center Radius",7,"Center Apothem",8,"Even Side Excl",9,"Back",5
Lbl 9
If (S/2)≠int(S/2
Then
Goto 6
End
prgmLAG
Menu("  Select Input  ","Rad+Opp Rad",10,"Ap+Opp Ap",11,"Back",6
Lbl 7
ClrHome
Disp "(x₁,y₁)(x₂,y₂)
Input "x₁=",B
Input "y₁=",G
Input "x₂=",F
Input "y₂=",H
√((F-B)²+(H-G)²)→R
Rsin(C→D
Rcos(C→E
DSE
Goto 70
Lbl 8
ClrHome
Disp "(x₁,y₁)(x₂,y₂)
Input "x₁=",B
Input "y₁=",G
Input "x₂=",F
Input "y₂=",H
√((F-B)²+(H-G)²)→A
Atan(C→D
ADS
Goto 70
Lbl 10
ClrHome
Disp "(x₁,y₁)(x₂,y₂)
Input "x₁=",B
Input "y₁=",G
Input "x₂=",F
Input "y₂=",H
√((F-B)²+(H-G)²)→R
R/2→R
Rsin(C→D
Rcos(C→E
DSE
Goto 70
Lbl 11
ClrHome
Disp "(x₁,y₁)(x₂,y₂)
Input "x₁=",B
Input "y₁=",G
Input "x₂=",F
Input "y₂=",H
√((F-B)²+(H-G)²)→A
A/2→A
Atan(C→D
ADS
Goto 70
Lbl 70
ClrHome
Disp "Area=
Radian
Ans
