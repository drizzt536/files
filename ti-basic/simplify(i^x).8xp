ClrHome
Lbl 1
Input "^",A
If fPart(A
Then
ClrHome
Goto 1
End
If not(A
Goto 3
If A<0
Goto 2
1+int(log(A→X
While A>3
While A-4*10^X≥0
A-4*10^X→A
End
X-1→X
End
Goto 3
Lbl 2
1+int(log(­A→X
While A<­3
While A+4*10^X≤0
A+4*10^X→A
End
X-1→X
End
Lbl 3
ClrHome
Output(1,1,"^
Output(1,3,A
If A≥0
Then
Output(1,4,"=
Output(1,5,^A
Else
Output(1,5,"=
Output(1,6,^A
End
