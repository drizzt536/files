ClrHome
Menu("  Select Input  ","Radius",1,"Diameter",2,"Circumference",3,"Area",4
Lbl 1
Input "radius=",R
ClrHome
2R→D
πD→C
RRπ→A
Disp "D=",D,"C=",C,"A=
Pause A
Goto 0
Lbl 2
Input "D=",D
D/2→R
Dπ→C
RRπ→A
Disp "R=",R,"C=",C,"A=
Pause A
Goto 0
Lbl 3
Prompt C
C/(2π→R
2R→D
RRπ→A
Disp "R=",R,"D=",D,"A=
Pause A
Goto 0
Lbl 4
Input "A=",A
√(A/π→R
2R→D
Dπ→C
Disp "R=",R,"D=",D,"C=
Pause C
Lbl 0
