ClrHome
Input "Principle=",P
Input "Rate %=",R
Input "Years=",T
Menu("  Select Input  ","Simple",A,"Compound",B
Lbl A
P(1+RT/100→A
Goto E
Lbl B
Menu("  Select Input  ","Continuous",B1,"Non-Cont.",B2
Lbl B1
P^(RT/100→A
Stop
Lbl B2
Input "Times/Year=",N
ClrHome
P(1+R/100/N)^(NT→A
Lbl E
Disp "Total (A) =",A
