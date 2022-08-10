800→D
ClrHome
Disp "Slope Intercept","To Standard
For(G,1,756
End
DelVar G
ClrHome
Menu("Change Denom?","Yes",3,"No,Default=800",2
Lbl 3
Input "D=",D
If D≠int(D
Then
ClrHome
Goto 3
End
Lbl 2
ClrHome
Disp "y=mx+b
Input "m=",M
Input "b=",B
Disp " Calculating
For(X,1,99999
For(Y,1,D
If X/Y=abs(M
Then
Goto 1
End
End
End
Disp "ERR:RANGE
Stop
Lbl 1
If M<0
Then
­X→X
End
For(Z,1,99999
For(U,1,D
If Z/U=abs(B
Then
Goto 4
End
End
End
Disp "ERR:RANGE
Stop
Lbl 4
If B<0
Then
­U→U
End
ClrHome
If X>0
Then
­X→X
­Y→Y
End
Disp "
If Y>0
Then
Disp "X +
Else
Disp "X -
­Y→Y
­Z→Z
End
Disp "","Y =","
Output(1,1,­X
Output(3,1,Y
ZY→V
Output(5,2,V
prgmSCRNLEN
Output(5,2+W,"/
Output(5,3+W,U
