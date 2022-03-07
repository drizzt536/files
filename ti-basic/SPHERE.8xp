ClrHome
Menu("  Select Input  ","Radius",1,"Diameter",3,"Great Circle",5
Lbl 5
Menu("  Select Input  ","Circumference",2,"Area",4
Lbl 1
Input "Radius=",R
ClrHome
Goto 9
Lbl 2
Disp "Circumference?
Input "c=",C
C/(2π→R
ClrHome
Goto 9
Lbl 3
Input "Diameter=",D
D/2→R
ClrHome
Goto 9
Lbl 4
Input "Area=",A
√(A/π→R
ClrHome
Lbl 9
Disp "Surface Area =",4πR²,"Volume =",4πR/3
