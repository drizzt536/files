ClrHome
Menu("  Select Input  ","Radius",1,"Diameter",2,"Circumference",3,"Area",4
Lbl 1
Input "radius=",R
ClrHome
Disp "D=",2R,"C=",2Rπ,"A=
Pause RRπ
Goto 0
Lbl 2
Input "D=",D
D/2→R
Disp "R=",R,"C=",Dπ,"A=
Pause RRπ
Goto 0
Lbl 3
Prompt C
C/(2π→R
Disp "R=",R,"D=",2R,"A=
Pause RRπ
Goto 0
Lbl 4
Input "A=",A
√(A/π→R
Disp "R=",R,"D=",2R,"C=
Pause 2Rπ
Lbl 0
