ClrHome
Input "Principle=",P
Input "Rate %=",R
Input "Years=",T
Disp "Total =
Menu("  Select Input  ","Simple",A,"Compound",B
Lbl A
Disp P(1+RT/100
Stop
Lbl B
Menu("  Select Input  ","Continuous",B1,"Non-Cont.",B2
Lbl B1
R/100→R
Disp P^(RT
Stop
Lbl B2
Input "Times/Year=",N
ClrHome
R/100→R
Disp P(1+R/N)^(NT
