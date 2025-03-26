#requires -version 7
# requires MinGW (cat.exe)
# requires ./ntstatus.ps1 or ../../../PowerShell/ntstatus.ps1

# these are the tests for the main build with no configuration

# TODO: the output values used in test cases 17 and 18 seem wrong. compare against zlib's implementation.
# TODO: test `-c - *`, `-c * -`, and `-c - -`.
# TODO: test cases:
	# ./adler32 -x ""
	# ./adler32 -x "0"
	# ./adler32 -x "zz"
	# ./adler32 -x - (expect error)
	# ./adler32 -o s.log -s a -s b -s c -o - -x 64 -x 65 -x 66
	# echo "12345678 abc" | ./adler32 -! -r -p - -p - -
		# make sure it doesn't overread the buffer
		# the error value would be like probably "abc45678"

	# echo a | ./adler32 -r - -l -
	# echo - | ./adler32 - -f - -
	# ./adler32 --format-raw --str-data asdf

	# echo DATA | ./adler32
	# echo DATA | ./adler32 -
	# echo DATA | ./adler32 -! -
	# echo DATA | ./adler32 -!

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

# TODO: add testing for builds with features removed.
# TODO: add tests for how different things work together.

# this should be the highest natural exit code for adler32.exe, other than -1.
$MAX_EXITCODE = 21


if (gcm -type externalscript ./ntstatus.ps1 -ea ignore | % name) {
	$ntstatus = "./ntstatus.ps1"
}
elseif (gcm -type externalscript ../../../PowerShell/ntstatus.ps1 -ea ignore | % name) {
	$ntstatus = "../../../PowerShell/ntstatus.ps1"
}
elseif (gcm -type externalscript ntstatus.ps1 -ea ignore | % name) {
	# if it is in PATH
	$ntstatus = "ntstatus.ps1"
}
else {
	throw 'cannot find `ntstatus.ps1`. checked `./`, `../../../PowerShell/`, and PATH'
}

if ($args[0] -eq "--help") {
	write-host "Options:"
	write-host "    --help         print this message and exit"
	write-host "    --case N       run only test case N"
	write-host "    --case def-N   run only test case N. also print the definition of the test case"
	write-host "    --recompile    Recompile ./adler32 before running the tests. uses default build"

	exit 0
}

if ($args[0] -eq "--recompile") {
	../../assemble adler32 --infer
	write-host "`n###### test cases ######" # blank line
}

$i = $args.indexOf("--case")
if ($i -ne -1) {
	$case = [string] $args[$i + 1]
}

if (-not (gcm ./adler32 -type app -ea ignore)) {
	write-host 'Error: `./adler32` was not found'
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

	$script:overall_pass = $false

	$error_condition = switch ($exit_code) {
		1 {"incorrect or unexpected errors"}
		2 {"incorrect output"}
		3 {"error code outside of range: $(& $ntstatus --fast --fallback --prev)"}
		default {"miscellaneous error: $exit_code"}
	}

	write-host "fail ($error_condition)"
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
		$str = "$($i + 1)/$($chars.count)"

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
	if ($cksm1 -ne "00e10001") { return 2 }

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
	if ($cksm1 -ne "00e10001") { return 2 }

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
	if ($cksm -ne "bee20253") { return 2 }
}

function test-case-19 {
	[string[]] $options = @("-h", "-?", "--help", "-v", "--version")

	for ($i = 0; $i -lt $options.count; $i++) {
		$arg = $options[$i]
		$str = "$($i + 1)/$($options.count)"

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

	$errors = (cat errors.tmp) -join "`n"
	if ($errors.length -eq 0) { return 1 }
	if (!$errors.startsWith("WARNING: 5 misplaced argument(s)")) { return 1 }
	if ($cksm -ne "406d0653") { return 2 } # cat.exe

	$cksm = cat file1.tmp | ./adler32 -r -D -D 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }

	$errors = (cat errors.tmp) -join "`n"
	if ($errors.length -eq 0) { return 1 }
	if (!$errors.startsWith("WARNING: 3 misplaced argument(s)")) { return 1 }
	if ($cksm -ne "4d37066a") { return 2 } # cat adds \r\n to the end, and it isn't collapsed to \n.
}

function test-case-23 {
	[IO.File]::WriteAllText("./file.tmp", "")
	$cksm = write-output "90860b20" | ./adler32 -! -r -p - file.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "90860b20") { return 2 }
}

function test-case-24 {
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

function test-case-25 {
	[IO.File]::WriteAllText("./--option-as-file.tmp", "12345")

	$cksm = ./adler32 -r -f --option-as-file.tmp 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "02f80100") { return 2 }
}

function test-case-26 {
	$cksm = ./adler32 -r -s 'akgnqrgqmfpqn;qwfmqwp4;ql23`' 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "a5ce0ade") { return 2 }
}

function test-case-27 {
	# the same string as for case 26, but with \0\e appended to the end.
	$cksm = ./adler32 -r -x 616b676e717267716d6670716e3b7177666d717770343b716c323360001b 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($cksm -ne "bba50af9") { return 2 }
}

function test-case-28 {
	$output = ./adler32 - 2> errors.tmp

	if (($lastExitCode -bor 0u) -gt $MAX_EXITCODE) { return 3 }
	if ((cat errors.tmp).length -ne 0) { return 1 }
	if ($output -ne "00000001`t[PIPE]") { return 2 }
}

function test-case-29 {
	# test to make sure a decent number of different combinations of builds work.
	[string[][]] $optionlist = @(
		@(),
		@("-DEFAULT"),
		@("-DLEAN"),
		@("-DMINIMAL"),
		@("-DBARE_BONES"),
		@("-DNO_DIRECTIONS"),
		@("-DLEAN", "-DNO_MEM_CLEANUP"),
		@("-DFMT_SWAP_ARGS", "-DNO_COLOR"),
		@("-DNO_COLOR_ERROR", "-DNO_PIPE", "-DNO_ARG_O"),
		@("-DNO_ARG_E", "-DNO_ARG_C", "-DNO_ARG_I"),
		@("-DBARE_BONES", "-DNO_FATAL_MESSAGES", "-DNO_ALIGN", "-DFMT_RAW_DEFAULT", "-DNO_MEM_CLEANUP", "-DNO_FOLDER_CHECK", "-DNO_WARN_UNUSED"),
		@("-DNO_ARG_O", "-DNO_FOLDER_CHECK")
	)

	if ($iswindows) {
		$format = "win64"
		$libs = @("-lkernel32", "-lshell32", "-lucrtbase")
	}
	else {
		$format = "elf64"
		$libs = @("-lc")
	}

	for ($i = 0; $i -lt $optionlist.count; $i++) {
		$options = $optionlist[$i]
		$str = "$($i + 1)/$($optionlist.count)"

		write-host -nonewline $str
		nasm -f $format -Werror adler32.nasm -o adler32.o.tmp @options *> $null
		$nasm_exitcode = $lastExitCode
		ld adler32.o.tmp @libs --entry main -o adler32.exe.tmp *> $null
		$ld_exitcode = $lastExitCode
		write-host -nonewline $("`b" * $str.length + " " * $str.length + "`b" * $str.length)

		if ($nasm_exitcode -ne 0) { return "``$options``, assembler error" }
		if ($ld_exitcode -ne 0) { return "``$options``, linker error" }
	}
}

$natural_exit = $false

try {
	if ($case -ne $null) {
		write-host "testing singular test case"

		if ($case.toLower().startsWith("def-")) {
			$case = $case.substring("def-".length)
			$print_definition = $true
		}

		if ((gcm -type function test-case-$case -ea ignore) -eq $null) {
			write-host "test case $case does not exist"
			$natural_exit = $true
			return
		}

		test-case $case

		if ($print_definition) {
			write-host "`n############################ definition ############################"
			write-host ((gcm test-case-$case).definition -replace "`n`t", "`n").trimEnd("`r`n")
		}

		$natural_exit = $true
		return
	}

	# figure out how many cases there are
	for ($cases = 1; (gcm -type function test-case-$cases -ea ignore) -ne $null ;) { $cases++ }
	$cases--

	write-host "running all $cases test cases:"
	# this assumes there is at least 1 test case, which should be a valid assumption.
	for ($i = 1; $i -le $cases; $i++) {
		test-case $i
	}

	$natural_exit = $true
}
finally {
	if (-not $natural_exit) {
		write-host "canceled"
	}

	if ($case -eq $null) {
		write-host "overall     : $($overall_pass ? "pass" : "fail")"

		if ($natural_exit -and $overall_pass) {
			write-host "all tests passing."
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
