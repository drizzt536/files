#requires -version 7

# requires MinGW or MSYS2 for cat.exe
# requires ntstatus.ps1 to be in PATH, ./, or ../../../PowerShell/

# these are the tests for the main build with no configuration

# NOTE: test case 33 gets skipped usually because -DEFAULT disables long arguments.

# TODO: test `-c - *`, `-c * -`, and `-c - -`.
# TODO: test cases:
	# test cases for argfiles
	# a test case for files that are a weird length
	# a test case for using different unroll sizes
	# ./adler32 -o s.log -s a -s b -s c -o - -x 64 -x 65 -x 66
	# echo "12345678 abc" | ./adler32 -! -r -p - -p - -
		# make sure it doesn't overread the buffer
		# the error would be probably "abc45678" as the value or something

	# echo a | ./adler32 -r - -l -
	# echo - | ./adler32 - -f - -

	# echo DATA | ./adler32 - file1.tmp file2.tmp
	# echo DATA | ./adler32 file1.tmp file2.tmp

	# echo DATA | ./adler32 -i - file1.tmp
	# echo DATA | ./adler32 -! -i - file1.tmp
	# ./adler32 -i -p $cksm1 -c $cksm2 1024 file1.tmp
	# ./adler32 -r file1.tmp -l file2.tmp
	# ./adler32 -F file1.tmp -F file2.tmp

	# ./adler32 -o output.tmp file1.tmp
	# ./adler32 -o /invalid/path file1.tmp
	# echo "data" | ./adler32 -o output.tmp

	# ./adler32 -e errors.tmp nonexistent-file
	# ./adler32 -e /invalid/path file1.tmp
	# echo "data" | ./adler32 -e errors.tmp

	# ./adler32 -o NUL -e NUL file1.tmp nonexistent
	# ./adler32 -s "test\0data"
	# ./adler32 -x "616b6"
	# dd if=/dev/zero bs=65K count=1 2> $null | ./adler32
	# cat largefile.tmp | ./adler32 -u
	# ./adler32 tmp-dir/tmp-subdir/file.tmp
	# printf "test\r\ndata" | ./adler32
	# ./adler32 -r -x ("a"*32715)
	# ./adler32 -x "zzzz"
	# ./adler32 -p $cksm1 -c $cksm2 1024 -p $cksm3 -c $cksm4 2048
	# echo "data" | ./adler32 -! -s "test" file1.tmp -

# this should be the highest natural exit code for adler32.exe.
# if it is higher, than the program crashed
$MAX_EXITCODE = 27

[Console]::ResetColor()

if (gcm -type externalscript ./ntstatus.ps1 -ea ignore | % name) {
	$ntstatus = "./ntstatus.ps1"
}
elseif (gcm -type externalscript ../../../PowerShell/ntstatus.ps1 -ea ignore | % name) {
	$ntstatus = "../../../PowerShell/ntstatus.ps1"
}
elseif (gcm -type externalscript ntstatus.ps1 -ea ignore | % name) {
	# this will work if it is in PATH
	$ntstatus = "ntstatus.ps1"
}
else {
	throw 'cannot find `ntstatus.ps1`. checked `./`, `../../../PowerShell/`, and PATH'
}

if ($args[0] -in @("-h", "-?", "--help")) {
	write-host "Options:"
	write-host "    -h, -?, --help     print this message and exit"
	write-host "    -c, --case N       run only test case N"
	write-host "    -c, --case def-N   run only test case N. also print the definition of the test case"
	write-host "    -r, --recompile    Recompile ./adler32 before running the tests. uses default build"

	exit 0
}

if ($args[0] -in @("-r", "--recompile")) {
	make adler32.exe
	write-host "`n###### test cases ######" # blank line
}

$i = $args.indexOf("--case")
if ($i -ne -1) {
	$case = [string] $args[$i + 1]
}
else {
	$i = $args.indexOf("-c")
	if ($i -ne -1) {
		$case = [string] $args[$i + 1]
	}
}

if (-not (gcm ./adler32 -type app -ea ignore)) {
	write-host "`e[1;31mError: ``./adler32`` was not found`e[0m"
	exit 1
}

# because .NET uses a different working directory than PowerShell does
[IO.Directory]::SetCurrentDirectory((pwd))

$overall_pass = $true

function test-case([uint32] $i) {
	write-host -nonewline $("test case {0,2}: " -f $i)

	$exit_code = & test-case-$i

	if ($exit_code -eq 0 -or $exit_code -eq $null) {
		write-host "pass"
		return
	}

	if ($exit_code -eq "skipped") {
		write-host "`e[33mskip"
		return
	}

	$script:overall_pass = $false

	$error_condition = switch ($exit_code) {
		1 {"incorrect or unexpected errors"}
		2 {"incorrect output"}
		3 {"error code outside of range: $(& $ntstatus --fast --fallback --prev)"}
		default {"miscellaneous error: $exit_code"}
	}

	write-host "`e[31mfail ($error_condition)`e[0m" # medium red
}

########################### test cases ###########################
function test-case-1 {
	[IO.File]::WriteAllText("./file1.tmp", "a")
	$output = ./adler32 -l file1.tmp -r 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	$errors = (cat errors.tmp) -join "`n"
	if ($errors.length -eq 0) { return 1 }
	if (!$errors.startsWith("WARNING: 1 misplaced argument(s)")) { return 1 }
	if ($output -ne "00620062`tfile1.tmp") { return 2 }
}

function test-case-2 {
	[IO.File]::WriteAllText("./file1.tmp", "abc")
	$output = ./adler32 file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "024d0127`tfile1.tmp") { return 2 }
}

function test-case-3 {
	[IO.File]::WriteAllText("./file1.tmp", "")
	$output = ./adler32 -r file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "00000001") { return 2 }
}

function test-case-4 {
	[IO.File]::WriteAllText("./file1.tmp", "x`n")
	$output = ./adler32 -r file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "00fc0083") { return 2 }
}

function test-case-5 {
	[IO.File]::WriteAllText("./file1.tmp", "x`r`n")
	$output = ./adler32 -r file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "018f0090") { return 2 }
}

function test-case-6 {
	[IO.File]::WriteAllText("./file1.tmp", 'Wa]Wr/NBkwY>4)r\AJXX/!!7FKlwvzMKK[D%T,6DCmNIY2StOjS1`}M}_TO>Jj(Z')
	$output = ./adler32 -r file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "8a53141d") { return 2 }
}

function test-case-7 {
	[IO.File]::WriteAllText("./file1.tmp",
		'4i''#~^&1]Dvl6vT8<Rq/Z{RLTlj6OgJbuj98~!:ni|9fjO7*dT7E6`bdTAG`~5+be_`8\:?-dY2[38zg5\3w2ow_nF*y)' + `
		'A673e$d,yae?hPz=''"u,~M>UF)>+]i0(f k=''KJkp^8/"Y}t@aDgX0q/ s%aaakx?I?>"~s/=8QbLXVT$r>l<KJwfc,I' + `
		'T`o\R7@kYfFK7ZI''=57Fs-:%1{?qiB[n0Qbun$n0LIsLYZ#cmTb^!M"3[y!4mb(%on2#vAQ(~]TMp@''Bbm(q]c]e6HG}' + `
		'95\(zB~7J''@v<z>Zq{\*TC*''L~:aWB k0gten/q[p\ {*:{\-?^ccZw3*s{sye?8c{g.1QYw% +[R6=J]ZM(2XAzJ(!?' + `
		' ]F_Zj7 yw6^fX|}&X+?c%vXs09?,e7~L{?9SXhS7F"[/%=;xE3bJx@i.KY"Jg@G:Lj|^Xf#K(STiT9~$q*Ch2GP4wfDX?' + `
		';yxF`}*m>a_)B+gy%6y1~jM=9~Qzj9=..x|%:W*^/fC &*.F;$dB?=)9Ic00PDP#K$1aK!>u!Q^~a!H4LuZ;Gr$eI1f4:*' + `
		'05_OQ=/f!7T2q,UR-AlyqHk+J9G0~&^6~O[W0ovPsU>F+J0>#aFR*9lTIlvNB!)W(KFq\H8WL@O4v-t"*^|[)H''T<dI_2' + `
		'''TNFd(d[bdxyyA^sO;z1Jg\S=`s}10bMK"6=]@AChNQ7k ?/(sWX_D1DEH|t -l`x1[^sr"n[tds$*h-}j-B+O~y9tG6c' + `
		' nY<7W#\$w4fhSk6[680N:3}\8R1?rl)&7uoUF[>5un7l}tCXf#a$~$]'':''BCfv"g(|XI78{$+$y:W?&4Z]15V RO%o5' + `
		'WXE&HBSYI_!?yH4YfTP~"zhGx0J@8F&8hDr<gO)|6[QsM"6u("{C^oMzt^[,no72w`=.QX+~.Iut\?[LH t!jtY:W2luO]' + `
		'EsHr$Y''f#[uFy`Gdh$g&azCv]mo-t3rBMx;;rb,R|s$hGit>\{b?D4e$Q-N;6Lpuy@E JzvCQoOm?L;=c/,ti|aQE*".FF'
	)
	$output = ./adler32 -r file1.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "6ab639c8") { return 2 }
}

function test-case-8 {
	[IO.File]::WriteAllText("./file1.tmp",
		'/<!TRpWr VNg]JHUX.{nj;#:QD<s#>(OV^EF -<f!A&csg7=!gJPL7kW8e3fT#}''UVm5/K)}wd(uh -:3&By#z%VlY$Hr' + `
		'W` J&3j_\EV$&&lf-sT]#6)v\`[{.NhW;WTuT1 D`r!rnX/NngbYv''Qzu0sc}\VQzAdRg4$S0!!HEDR9o/!T[J4jx,z''' + `
		'%%DYfo<-EsiZ2Y9d`!2Rbr{uGY?0-)HC7o9{F9%mju:9\zJX}\)rgm+apa-`#>2+WQ}&h_744c'':p%& {7Gsw>-yb-G#v' + `
		'k>vaoz.7jidu }Y&xUuuQ/ <mvx[^"IeFi7|PBb$Zr!;R*uK`OU`?_77?NDj"P>r@*QYy*5{8hY0)P97rn}]mcQ!Q[Rgr/' + `
		'nv!o({4B*id"ve0[kEPT-bq?JS8G*M&(2#k\{j^a->1Rw@9M ;:3[''E]]8<S-|:#:j~p1_%07W%0kQ"v|y_`Kaz<J=M:l' + `
		'A#I>*xL1r:do@e]2h\:wb3M12l|)DYuNq9GIE)Sqz|4Pdtoz4gtFZtMp@J?[Gc|Fu;X+C3;tu}D:@=Din4+~6\?''PuI))' + `
		'bt 0Xc0}teWT>z2TA?>\[0Au:j])''h"PE5jA1 YnAphar9w22=Hm<7k_jbV,u<[EzO)M`oSNMQyq!z9UyOy10q.akE)mm' + `
		'oip4CmkF%L@m^6BG( c,a&+#hgl}x>Fp|-h1Dx/X<>0<spH?Z"Bl_{5]4r!-d93STCq0AF/8$s >!Ynm.;e=(7S)!=jaR0' + `
		'i|UelAT8nZl|I\oYbG(/|g$2OA|&({F|r)3Y{(|9wIE\w*y:fJ3#XhHT`U$A,[6P-&TM%"=j?v_hOK=VW!W9e}BrfG''G8' + `
		'Xq?*-nB~#D)sK;TVL42B&_u"Zitl''CiI**[*#/C)-lrS7?~z0YZ0Q&wf7#6Z*''dx`92.HLdX}kllw@`B3rL{]^8O=3=c' + `
		'tE%q&O|p;0SFG&@1k9++8YD\hgV_``|<Y<wm]GpFf84)Y^z z1T{x/xSQ4CP907}\:xJy?;l>1Qe(iKD\M,Kg?_l(#`MA*'
	) # 7dd639c0

	[IO.File]::WriteAllText("./file2.tmp",
		'kr@!@)r-poG2]5;uO"sL.C2aX@4m$G)n&%dgj|vStEYXy2Nw3".P{$HQ,u9+iF;%j~~t3Mi])E".?+v0]f`<7H)(#''H$V' + `
		'm\;}J:YLjhJ4^FS,!WS"-&_Y?gXQ8AQLTcFE9knNs{>84Wf|~j:(FDQ0?N%GvjLQO)%v6bS\.|S_''Jf*=fYw*3o&*[cBS' + `
		'a/qVFh,-JXcFs{5V}"xDZM3l=ow{~K,=;<?ktt)&mk&h@\H8k(zl>xjG `(gm=_C]y3B"GBh[pz}N(vST_(HuNHJz/X~Sf' + `
		'u/$7<tq.jyhM[i 3s_,OqLIi}#%yJ<uqCCbY)*{)AmiS6N<9LfV?9JucFjutVI,lJ<($4tja;H{g_| <twZrwqtg&cuO  ' + `
		'0-:t-oO3`b4.e''(~*>P_1~i-}FX0[("0v"N G4qU-pk$d\,I_"Is($,vKQf[msP|jK59YL WMvVNn_!,,kJTZLMnV P''' + `
		'/H;1:XgQ"oe3,S^*NwA!CMKjbt1X;b+YKj?)5FA5\U`n;oOJY~QP'')1cmO-V]"na-;mH]tY9SkXT%/pvSSoH^hH?{/GLH' + `
		'(59u=1`T}m(bXJl6?;t&z}No_2iNq6-xi''R(}CrszsG"QMxQU:`~1FJb@1^IVFrDj*a@=:8jkYzes=Wi%-BxY2k]8Tmu|' + `
		' n0EalbE\N-d,o>%Y_aPrX;)6Y-&V>Q|$nN,-=8Sq%{8jV)t1hLvzH}!U\Ki_/S_z}#@_>^/s#G;&5d^L#,/ic%Afv^YI ' + `
		'1LE0bBPU4c.SWI{KI[K@b(gxm&x5>~!X_Gl7HJOSPGYW~<s7K;p<r,2-ixF;ITzB\ct @aL.d\{~-pLs-X):-o6u~Hu< A' + `
		'+^+0sqj{E nY>;mcUaZ5,If:/c<Z=Go$hUGiu|Ow[*`i/PbWmFYC)r"TjK\$EVUf<M({]oEjhr2TRT%%OAh*4VYz;<Dr4=' + `
		'cm`&"Mx_S/,W`)"?>b~k|i=|%*<=&nx}ayLVpVfYqH>_V<m&OZtY4n} ;OKE+|"G`o|V~Jg:B98kj75(crRML.!rG0'
	) # 17e53dea

	cat.exe file1.tmp file2.tmp > file3.tmp

	$output = ./adler32 -r file1.tmp file2.tmp file3.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.count -ne 3) { return 2 }

	$cksm1 = $output[0]
	$cksm2 = $output[1]
	$cksm3 = $output[2]
	$len2 = 1024

	if ($cksm1 -ne "7dd639c0") { return 2 }
	if ($cksm2 -ne "17e53dea") { return 2 }
	if ($cksm3 -ne "9f4477a9") { return 2 }

	# test forwards/do
	$output = ./adler32 -r -p $cksm1 -c $cksm2 $len2 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.count -ne 1) { return 2 }
	if ($output -ne $cksm3) { return 2 }
}

function test-case-9 {
	[IO.File]::WriteAllText("./file1.tmp",
		'/<!TRpWr VNg]JHUX.{nj;#:QD<s#>(OV^EF -<f!A&csg7=!gJPL7kW8e3fT#}''UVm5/K)}wd(uh -:3&By#z%VlY$Hr' + `
		'W` J&3j_\EV$&&lf-sT]#6)v\`[{.NhW;WTuT1 D`r!rnX/NngbYv''Qzu0sc}\VQzAdRg4$S0!!HEDR9o/!T[J4jx,z''' + `
		'%%DYfo<-EsiZ2Y9d`!2Rbr{uGY?0-)HC7o9{F9%mju:9\zJX}\)rgm+apa-`#>2+WQ}&h_744c'':p%& {7Gsw>-yb-G#v' + `
		'k>vaoz.7jidu }Y&xUuuQ/ <mvx[^"IeFi7|PBb$Zr!;R*uK`OU`?_77?NDj"P>r@*QYy*5{8hY0)P97rn}]mcQ!Q[Rgr/' + `
		'nv!o({4B*id"ve0[kEPT-bq?JS8G*M&(2#k\{j^a->1Rw@9M ;:3[''E]]8<S-|:#:j~p1_%07W%0kQ"v|y_`Kaz<J=M:l' + `
		'A#I>*xL1r:do@e]2h\:wb3M12l|)DYuNq9GIE)Sqz|4Pdtoz4gtFZtMp@J?[Gc|Fu;X+C3;tu}D:@=Din4+~6\?''PuI))' + `
		'bt 0Xc0}teWT>z2TA?>\[0Au:j])''h"PE5jA1 YnAphar9w22=Hm<7k_jbV,u<[EzO)M`oSNMQyq!z9UyOy10q.akE)mm' + `
		'oip4CmkF%L@m^6BG( c,a&+#hgl}x>Fp|-h1Dx/X<>0<spH?Z"Bl_{5]4r!-d93STCq0AF/8$s >!Ynm.;e=(7S)!=jaR0' + `
		'i|UelAT8nZl|I\oYbG(/|g$2OA|&({F|r)3Y{(|9wIE\w*y:fJ3#XhHT`U$A,[6P-&TM%"=j?v_hOK=VW!W9e}BrfG''G8' + `
		'Xq?*-nB~#D)sK;TVL42B&_u"Zitl''CiI**[*#/C)-lrS7?~z0YZ0Q&wf7#6Z*''dx`92.HLdX}kllw@`B3rL{]^8O=3=c' + `
		'tE%q&O|p;0SFG&@1k9++8YD\hgV_``|<Y<wm]GpFf84)Y^z z1T{x/xSQ4CP907}\:xJy?;l>1Qe(iKD\M,Kg?_l(#`MA*'
	) # 7dd639c0

	[IO.File]::WriteAllText("./file2.tmp",
		'kr@!@)r-poG2]5;uO"sL.C2aX@4m$G)n&%dgj|vStEYXy2Nw3".P{$HQ,u9+iF;%j~~t3Mi])E".?+v0]f`<7H)(#''H$V' + `
		'm\;}J:YLjhJ4^FS,!WS"-&_Y?gXQ8AQLTcFE9knNs{>84Wf|~j:(FDQ0?N%GvjLQO)%v6bS\.|S_''Jf*=fYw*3o&*[cBS' + `
		'a/qVFh,-JXcFs{5V}"xDZM3l=ow{~K,=;<?ktt)&mk&h@\H8k(zl>xjG `(gm=_C]y3B"GBh[pz}N(vST_(HuNHJz/X~Sf' + `
		'u/$7<tq.jyhM[i 3s_,OqLIi}#%yJ<uqCCbY)*{)AmiS6N<9LfV?9JucFjutVI,lJ<($4tja;H{g_| <twZrwqtg&cuO  ' + `
		'0-:t-oO3`b4.e''(~*>P_1~i-}FX0[("0v"N G4qU-pk$d\,I_"Is($,vKQf[msP|jK59YL WMvVNn_!,,kJTZLMnV P''' + `
		'/H;1:XgQ"oe3,S^*NwA!CMKjbt1X;b+YKj?)5FA5\U`n;oOJY~QP'')1cmO-V]"na-;mH]tY9SkXT%/pvSSoH^hH?{/GLH' + `
		'(59u=1`T}m(bXJl6?;t&z}No_2iNq6-xi''R(}CrszsG"QMxQU:`~1FJb@1^IVFrDj*a@=:8jkYzes=Wi%-BxY2k]8Tmu|' + `
		' n0EalbE\N-d,o>%Y_aPrX;)6Y-&V>Q|$nN,-=8Sq%{8jV)t1hLvzH}!U\Ki_/S_z}#@_>^/s#G;&5d^L#,/ic%Afv^YI ' + `
		'1LE0bBPU4c.SWI{KI[K@b(gxm&x5>~!X_Gl7HJOSPGYW~<s7K;p<r,2-ixF;ITzB\ct @aL.d\{~-pLs-X):-o6u~Hu< A' + `
		'+^+0sqj{E nY>;mcUaZ5,If:/c<Z=Go$hUGiu|Ow[*`i/PbWmFYC)r"TjK\$EVUf<M({]oEjhr2TRT%%OAh*4VYz;<Dr4=' + `
		'cm`&"Mx_S/,W`)"?>b~k|i=|%*<=&nx}ayLVpVfYqH>_V<m&OZtY4n} ;OKE+|"G`o|V~Jg:B98kj75(crRML.!rG0'
	) # 17e53dea

	cat.exe file1.tmp file2.tmp > file3.tmp

	$output = ./adler32 -r file1.tmp file2.tmp file3.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.count -ne 3) { return 2 }

	# these are already tested in the previous case
	$cksm1 = $output[0]
	$cksm2 = $output[1]
	$cksm3 = $output[2]
	$len2 = 1024

	# test backwards/undo
	$output = ./adler32 -r -u -p $cksm3 -c $cksm2 $len2 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.count -ne 1) { return 2 }
	if ($output -ne $cksm1) { return 2 }
}

function test-case-10 {
	[IO.File]::WriteAllText("./file1.tmp", "abcde")
	[IO.File]::WriteAllText("./file2.tmp", "12345")
	[IO.File]::WriteAllText("./file3.tmp", "abcde12345")

	$cksm3 = ./adler32 -r file3.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm3 -ne "126b02ef") { return 2 }

	$output = ./adler32 -r -i file1.tmp file2.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.count -ne 2) { return 2 }

	$cksm1 = $output[0]
	$cksm2 = $output[1]

	if ($cksm1 -ne "05c801f0") { return 2 }
	if ($cksm2 -ne $cksm3) { return 2 }
}

function test-case-11 {
	$output = ./adler32 nonexistent-file 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -eq 0) { return 1 }
	if ($output -ne $null) { return 2 }
}

function test-case-12 {
	[char[]] $chars = "pcxseof"
	for ($i = 0; $i -lt $chars.count; $i++) {
		$arg = $chars[$i]
		$str = "$($i + 1)/$($chars.count) "

		write-host -nonewline $str
		$output = ./adler32 -$arg 2> errors.tmp
		write-host -nonewline $("`b" * $str.length + " " * $str.length + "`b" * $str.length)


		if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
		if ((cat errors.tmp).length -eq 0) { return "``-$arg``, no stderr output" }
		if ($output -ne $null) { return "``-$arg``, unexpected output received" }
	}
}

function test-case-13 {
	$output = ./adler32 -p qwertyuiop 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -eq 0) { return 1 }
	if ($output -ne $null) { return 2 }
}

function test-case-14 {
	$output = ./adler32 -unknown 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -eq 0) { return 1 }
	if ($output -ne $null) { return 2 }
}

function test-case-15 {
	# negative length is wraps around back from 2^64
	$cksm1 = ./adler32 -r -c 00000001ASDFQWER -1 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm1 -ne "00000001") { return 2 }

	$cksm2 = ./adler32 -r -c 00000001h 18446744073709551615 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm2 -ne $cksm1) { return 2 }
}

function test-case-16 {
	$output = ./adler32 -c qwertyuiop 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -eq 0) { return 1 }
	if ($output -ne $null) { return 2 }
}

function test-case-17 {
	$cksm1 = ./adler32 -r -c 00000001h 0 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm1 -ne "00000001") { return 2 }

	# treat unknown length values as 0.
	$cksm2 = ./adler32 -r -c 00000001h asdfqwer 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm1 -ne $cksm2) { return 2 }
}

function test-case-18 {
	$cksm = ./adler32 -r -p abcdabcd -c 12345678h 0 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "be010253") { return 2 }
}

function test-case-19 {
	[string[]] $options = @("-h", "-?", "--help", "-v", "--version")

	for ($i = 0; $i -lt $options.count; $i++) {
		$arg = $options[$i]
		$str = "$($i + 1)/$($options.count) "

		write-host -nonewline $str
		$output = ./adler32 $arg 2> errors.tmp
		write-host -nonewline $("`b" * $str.length + " " * $str.length + "`b" * $str.length)

		if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
		if ((cat errors.tmp).length -ne 0) { return "``$arg``, unexpected error" }
		if ($output.length -eq 0) { return "``$arg``, missing output" }
	}
}

function test-case-20 {
	$output = ./adler32 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output.length -eq 0) { return 2 }
}

function test-case-21 {
	# only 1 argument
	$output = ./adler32 -c abcdabcd 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -eq 0) { return 1 }
	if ($output -ne $null) { return 2 }
}

function test-case-22 {
	[IO.File]::WriteAllText("./file1.tmp", "asdf qwer 1234 zxcv")
	$cksm = cat.exe file1.tmp | ./adler32 -r -l -r -u -d 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "406d0653") { return 2 }


	$cksm = cat file1.tmp | ./adler32 -r -D -D 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }

	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "4d37066a") { return 2 } # cat adds \r\n to the end, and it isn't collapsed to \n.
}

function test-case-23 {
	$cksm = "DATA" | ./adler32 -! -r -l -r -u -d 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }

	$errors = (cat errors.tmp) -join "`n"
	if ($errors.length -eq 0) { return 1 }
	if (!$errors.startsWith("WARNING: 5 misplaced argument(s)")) { return 1 }
	if ($cksm -ne $null) { return 2 }
}

function test-case-24 {
	$cksm = "DATA" | ./adler32 -! -r -l -r - -u -d 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }

	$errors = (cat errors.tmp) -join "`n"
	if ($errors.length -eq 0) { return 1 }
	if (!$errors.startsWith("WARNING: 2 misplaced argument(s)")) { return 1 }
	if ($cksm -ne "051a0132") { return 2 } # "DATA`r`n"

	# "DATA" | ./adler32 -! -r -l -r - -u -d
}

function test-case-25 {
	[IO.File]::WriteAllText("./file.tmp", "")
	$cksm = write-output "90860b20" | ./adler32 -! -r -p - file.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "90860b20") { return 2 }
}

function test-case-26 {
	[IO.File]::WriteAllText("./file1.tmp", "12345")
	[IO.File]::WriteAllText("./file2.tmp", "ABCDEFG")
	[IO.File]::WriteAllText("./file3.tmp", "")

	$cksms = echo "`t`n90860B2090860b20`r `00a2f4Z56" | `
		./adler32 -! -r -p - file1.tmp -p - file2.tmp -p - file3.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksms.count -ne 3) { return 2 }
	if ($cksms[0] -ne "cb190c1f") { return 2 }
	if ($cksms[1] -ne "e5ba0cfc") { return 2 }
	if ($cksms[2] -ne "0000a2f4") { return 2 }
}

function test-case-27 {
	[IO.File]::WriteAllText("./--option-as-file.tmp", "12345")

	$cksm = ./adler32 -r -f --option-as-file.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "02f80100") { return 2 }
}

function test-case-28 {
	$cksm = ./adler32 -r -s 'akgnqrgqmfpqn;qwfmqwp4;ql23`' 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "a5ce0ade") { return 2 }
}

function test-case-29 {
	# the same string as for case 26, but with \0\e appended to the end.
	$cksm = ./adler32 -r -x 616b676e717267716d6670716e3b7177666d717770343b716c323360001b 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "bba50af9") { return 2 }
}

function test-case-30 {
	$arguments = @("-", "0", "zz", "abc", "12XX34")

	for ($i = 0; $i -lt $arguments.count; $i++) {
		$hex = $arguments[$i]
		$str = "$($i + 1)/$($arguments.count) "

		write-host -noNewline $str
		$cksm = ./adler32 -r -x $hex 2> errors.tmp
		write-host -noNewline $("`b"*$str.length + "`e[0K")

		if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
		if ((cat errors.tmp).length -eq 0) { return 1 }
		if ($cksm -ne $null) { return 2 }
	}
}

function test-case-31 {
	$output = ./adler32 - 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "00000001`t[PIPE]") { return 2 }
}

function test-case-32 {
	# test to make sure a decent number of different combinations of builds compile
	[string[][]] $optionlist = @(
		@(),
		@("-DEFAULT"),
		@("-DLEAN"),
		@("-DMINIMAL"),
		@("-DBARE_BONES"),
		@("-DNO_DIRECTIONS"),
		@("-DLEAN", "-DNO_ARGFILES"),
		@("-DFMT_SWAP_ARGS", "-DNO_COLOR"),
		@("-DNO_COLOR_ERROR", "-DNO_PIPE", "-DNO_ARG_O"),
		@("-DNO_ARG_E", "-DNO_ARG_C", "-DNO_ARG_I"),
		@("-DMSVCRT", "-DNO_ARGFILES", "-DASCII_ONLY_DATA", "-DUNROLL=4"),
		@("-DBARE_BONES", "-DNO_FATAL_MESSAGES", "-DNO_ALIGN", "-DFMT_RAW_DEFAULT", "-DNO_FOLDER_CHECK", "-DNO_WARN_UNUSED"),
		@("-DNO_ARG_O", "-DNO_FOLDER_CHECK", "-DBUF_LEN=4096"),
		@("-DLL"),
		@("-DLL", "-DUNROLL_N=8", "-DSCRATCH_BUF_LEN=16384"),
		@("-DSTATIC", "-DEFAULT")
	)

	if (-not (gcm -ea ignore ./adler32.nasm)) { return "couldn't find './adler32.nasm'" }
	if (-not (gcm -ea ignore -type app nasm)) { return "couldn't find 'nasm'" }
	if (-not (gcm -ea ignore -type app ld  )) { return "couldn't find 'ld'" }

	for ($i = 0; $i -lt $optionlist.count; $i++) {
		$options = $optionlist[$i]
		$str = "$($i + 1)/$($optionlist.count) "

		write-host -nonewline $str
		nasm -fwin64 -Werror adler32.nasm -o adler32.o.tmp @options *> $null
		$nasm_exitcode = $lastExitCode
		$libc = $options -contains "-DMSVCRT" ? "-lmsvcrt" : "-lucrtbase"
		ld adler32.o.tmp -lkernel32 -lshell32 $libc -o adler32.exe.tmp *> $null
		$ld_exitcode = $lastExitCode
		write-host -nonewline $("`b"*$str.length + "`e[0K")

		if ($nasm_exitcode -ne 0) { return "options=``$options``, assembler error" }
		if ($ld_exitcode -ne 0) { return "options=``$options``, linker error" }
	}
}

function test-case-33 {
	if ((./adler32 -v)[1].indexOf("no long-form arguments") -eq -1) {
		# the program build doesn't support long-form arguments.
		# this is the case with `-DEFAULT`.
		$cksms = ./adler32 --incremental --format-raw --str-data asdf --reverse --format-swap --hex-data 66 2> errors.tmp
	}
	else {
		$cksms = ./adler32 -i -r -s "asdf" -u -F -x "66" 2> errors.tmp
	}

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksms.count -ne 2) { return 2 }
	if ($cksms[0] -ne "040f019f") { return 2 }
	if ($cksms[1] -ne "02700139`t[STRING]") { return 2 }
}

function test-case-34 {
	write-host -noNewline "1/4 "
	$cksm = "DATA" | ./adler32 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "051a0132`t[PIPE]") { return 2 }

	write-host -noNewline "`b`b`b`b2/4 "
	$cksm = "DATA" | ./adler32 - 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "051a0132`t[PIPE]") { return 2 }

	write-host -noNewline "`b`b`b`b3/4 "
	$cksm = "DATA" | ./adler32 -! - 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "051a0132`t[PIPE]") { return 2 }

	write-host -noNewline "`b`b`b`b4/4 "
	$cksm = "DATA" | ./adler32 -! 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne $null) { return 2 }

	write-host -noNewline "`b`b`b`b`e[0K"
}

function test-case-35 {
	# I used the zlib implementation to get these values.
	$datalist = @(
		# @(cksm1, cksm2, length, cksm3)
		@("e5515dd5", "a9ad0f14", "2558285149", "d8736ce8"),           #  1
		@("b78ae5d8", "c6cc234c", "527008047", "33520932"),            #  2
		@("d0c6ad21", "98c4aad0", "2541846987", "bdf757ff"),           #  3
		@("bd2b0467", "27e258ef", "3952467847", "bde75d55"),           #  4
		@("d9a88837", "aad4997a", "2302967491", "338621bf"),           #  5
		@("ca03ea43", "fd64c3fd", "2792048284", "e09fae4e"),           #  6
		@("5983085e", "785d7d34", "1013247149", "59af8591"),           #  7
		@("f509811a", "d6a20bb5", "346931814", "037d8cce"),            #  8
		@("45d15432", "f53de930", "3805469489", "e1a43d70"),           #  9
		@("8735551e", "14e39c7f", "988595164", "64cbf19c"),            # 10
		@("192576d1", "c055072d", "4051806381", "01a47dfd"),           # 11
		@("b37a47bc", "378841df", "3673669051", "304e899a"),           # 12
		@("6b7ecae7", "8ff8aa3d", "3885750623", "85e47532"),           # 13
		@("463850de", "ab5f287b", "514036454", "a4f37958"),            # 14
		@("b49b59e8", "4e348007", "54230954", "55cad9ee"),             # 15
		@("c6080f9b", "a41d85be", "0", "6a349558"),                    # 16
		@("5fcae566", "86125c17", "37", "0f73418b"),                   # 17
		@("24bf768c", "dd3a6946", "132", "2547dfd1"),                  # 18
		@("5ad910b6", "c0e1019f", "1423532409", "1d581254"),           # 19
		@("7d4a2c88", "7a0ade12", "3729509027", "a0e10aa8"),           # 20
		@("1f005d4d", "65818ae6", "3927623400", "434ee832"),           # 21
		@("c1f2dde1", "d29d250e", "962975555", "9cee02fd"),            # 22
		@("483c71cc", "4f43b098", "2050838619", "31672272"),           # 23
		@("ff2a792d", "b2a06825", "1239631547", "d427e151"),           # 24
		@("152a6ac6", "d85dd5e2", "2083508514", "f1f540b6"),           # 25
		@("9b9f3fd3", "0b35e6ff", "262114694", "5bfa26e0"),            # 26
		@("4e6fd2bc", "444f8046", "807488683", "c8345310"),            # 27
		@("ee7ee587", "bdae1fe8", "421299218", "7c8b057d"),            # 28
		@("68cc0045", "8fb8ce22", "981291655", "fd5dce66"),            # 29
		@("c0eca656", "dd7d4d87", "1262509339", "d91ff3dc"),           # 30
		@("64b6aa18", "b4da3d80", "486101807", "43d1e797"),            # 31
		@("096f3995", "e9c9aedb", "79478202", "6ef7e86f"),             # 32
		@("91706a31", "34970b68", "5967154808316624924", "fc537598"),  # 33
		@("7c421a40", "3222abaf", "15053568646243336590", "bb0ac5ee"), # 34
		@("3157fb9f", "40d0d535", "9613929051979964687", "6959d0e2"),  # 35
		@("a6c19630", "8082f9e3", "3939356503882465670", "34509021"),  # 36
		@("8e248271", "17cee332", "16573195763697254006", "c62e65b1"), # 37
		@("b3a68c46", "23f2d8fd", "15609129985592804259", "82dc6551"), # 38
		@("9b9d6543", "4dd00dbb", "11105343764025550549", "107172fd"), # 39
		@("ec118373", "66d7e57a", "9995100727149655190", "21a468fb"),  # 40
		@("c39fcd99", "73184e92", "9155684840517901430", "38b01c39"),  # 41
		@("e027d15e", "e33438b7", "6853409362276048471", "6a720a23"),  # 42
		@("893bbca2", "325da6d8", "5988193679034449448", "e1196388"),  # 43
		@("95600cdd", "c8d86100", "18309483323906037494", "7b4a6ddc"), # 44
		@("263990cb", "b0d7d512", "13774492759682115810", "c1a065eb"), # 45
		@("844d2d5a", "7cea38be", "8495007649649106052", "4f616617"),  # 46
		@("4227377e", "1a0fdf59", "76997468889842144", "b81016e5"),    # 47
		@("97b2c5de", "a4fdfae8", "2528496736679684781", "7f1dc0d4"),  # 48
		@("b58eed62", "79e1b02e", "9042182928950877758", "640a9d9e"),  # 49
		@("3284e06f", "e598b1c0", "12742360169560557249", "1272923d"), # 50
		@("c7d671bb", "5c7321ff", "10551574414912549840", "eee693b9"), # 51
		@("787078f4", "87d13ced", "14680019403589189239", "0057b5e0"), # 52
		@("fa22b99a", "059db4ec", "7704609827548402217", "fab46e94"),  # 53
		@("5b7bb003", "49340ce3", "16350458917809062957", "1e2cbce5"), # 54
		@("9fd868a7", "0bb46dfd", "4638392346001888161", "7e30d6a3"),  # 55
		@("df13ed3f", "ea4b74f7", "17495940476488342795", "dc546244"), # 56
		@("fbeaba62", "e044c945", "11436419105112335899", "f1e783b5"), # 57
		@("e265a28d", "3e3d1a3c", "14498747135848954660", "f9bfbcc8"), # 58
		@("aec33f99", "f8ac215e", "8382540194732556840", "f5a260f6"),  # 59
		@("dc8573e0", "96bab4a4", "584990124438303162", "e42d2892"),   # 60
		@("c3544bb4", "37728495", "16737849157245675921", "a289d048"), # 61
		@("e365587d", "7249aeaa", "9548770122228243343", "e4690735"),  # 62
		@("6ad5a4b8", "9308ecaa", "10217595815427703506", "4ab79170"), # 63
		@("f96d5262", "b4e1d8f6", "3155674175246088410", "f02e2b66")   # 64
	)

	for ($i = 0; $i -lt $datalist.count; $i++) {
		$str = "$($i + 1)/$($datalist.count) "

		$a, $b, $c, $d = $datalist[$i]

		write-host -nonewline $str
		$out1 = ./adler32 -r -p $a -c $b $c 2> errors1.tmp
		$out2 = ./adler32 -r -p $d -u -c $b $c 2> errors2.tmp
		write-host -nonewline $("`b"*$str.length + "`e[0K")

		if ((cat errors1.tmp).length -ne 0) { return 1 }
		if ((cat errors2.tmp).length -ne 0) { return 1 }
		if ($out1 -ne $d) { return "n=$($i + 1), forwards mode has wrong value" }
		if ($out2 -ne $a) { return "n=$($i + 1), backwards mode has wrong value" }
	}
}

function test-case-36 {
	${base seed} = 675361406
	$size   = 4kb
	$trials = 64

	for ($i = 0; $i -lt $trials; $i++) {
		if     ($i -eq ($trials * 1 -shr 2)) { $size = 16kb }
		elseif ($i -eq ($trials * 2 -shr 2)) { $size = 64kb }
		elseif ($i -eq ($trials * 3 -shr 2)) { $size = 256kb }
		elseif ($i -eq  $trials - 1)         { $size = 1mb }

		# this way I don't have to iterate if there is an issue on like trial 40
		$rng = [System.Random]::new(${base seed} -bxor $i)

		$str = "$($i + 1)/$trials "
		write-host -nonewline $str

		$buffer = new-object byte[] $size

		$rng.nextBytes($buffer)
		[IO.File]::WriteAllBytes("file1.tmp", $buffer)

		$rng.nextBytes($buffer)
		[IO.File]::WriteAllBytes("file2.tmp", $buffer)

		cat.exe file1.tmp file2.tmp > file3.tmp

		$out1 = ./adler32 -r file1.tmp file2.tmp file3.tmp 2> errors.tmp

		if ((cat errors.tmp).length -ne 0) { return "idx $i prelim, unexpected error" }
		if ($out1.count -ne 3) { return "idx $i prelim, wrong output count" }

		# just assume these values are correct.
		# the forwards iteration algorithm should be tested elsewhere
		$c1, $c2, $c3 = $out1

		$out2 = ./adler32 -r file1.tmp -i file3.tmp -u file2.tmp 2> errors.tmp
		write-host -nonewline $("`b"*$str.length + "`e[0K")

		if ((cat errors.tmp).length -ne 0) { return "idx $i, unexpected error" }
		if ($out2.count -ne 3) { return "idx $i, wrong output count" }
		$k1, $k2, $k3 = $out2

		if ($k1 -ne $c1) { return "idx $i, backwards traversal value mismatch" }
		if ($k1 -ne $k3) { return "idx $i, incorrect result" }
	}
}

$natural_exit = $false

try {
	if ($case -ne $null) {

		if ($case.toLower().startsWith("def-")) {
			$case = $case.substring("def-".length)
			$print_definition = $true
		}

		if ((gcm -type function test-case-$case -ea ignore) -eq $null) {
			write-host "`e[31mtest case $case does not exist"
			$natural_exit = $true
			return
		}


		if ($print_definition) {
			write-host ((gcm test-case-$case).definition -replace "`n`t", "`n").trimEnd("`r`n")
		}
		else {
			write-host "testing singular test case"
			test-case $case
		}

		$natural_exit = $true
		return
	}

	# figure out how many cases there are
	for ($cases = 1; (gcm -type function test-case-$cases -ea ignore) -ne $null ;) { $cases++ }
	$cases--

	write-host "running all $cases test cases"
	# this assumes there is at least 1 test case, which should be a valid assumption.
	for ($i = 1; $i -le $cases; $i++) {
		test-case $i
	}

	$natural_exit = $true
}
finally {
	if (-not $natural_exit) {
		write-host "`e[1;33mcanceled`e[0m" # light yellow
	}

	if ($case -eq $null) {
		write-host "overall     : $($overall_pass ? "pass" : "`e[31mfail`e[0m")"

		if ($natural_exit -and $overall_pass) {
			write-host "`e[1;32mall tests passing.`e[0m" # light green
		}
	}

	# remove temporary files.
	# keep them if you specified a specific case number and it failed.
	if ($overall_pass -or $case -eq $null) {
		rm ./*.tmp 2> $null
	}
}

exit 0

# use this to create two 1024 character files and combine them for testing the combination:
# [IO.File]::WriteAllText("./file1.txt", (../../Python/password-generator.py 1024));
# [IO.File]::WriteAllText("./file2.txt", (../../Python/password-generator.py 1024));
# cat.exe file1.txt file2.txt > file3.txt
# ./adler32 -r file1.txt file2.txt file3.txt | scb
