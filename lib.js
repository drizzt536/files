window.math=Math, window.$??=e=>document.getElementById(e);
var len=e=>e.length,π=3.141592653589793,
φ=1.618033988749895,𝑒=2.718281828459045,
u0x200b="​",Euler=𝑒,
nSub=(a,n=1)=>type(a)=="bigint"?1*a*(n*1):a,
revArr=a=>{for(var l=0,L=len(a),r=L-1,t;l<r;++l,--r)t=a[l],a[l]=a[r],a[r]=t;return a},
reverseLList=list=>{
	for(var cur = list.head, prev = null, next; current;)
		next = cur.next,
		cur.next = prev,
		prev = cur,
		cur = next;
	list.head = prev || list.head;
	return list
},
type=(a,b)=>
	b==void 0||typeof a!="number"&&typeof a!="object"&&typeof a!="function"?
		typeof a:
		typeof a=="number"?
			Logic.is(a,NaN)?
				"nan":
				Logic.is(a-a,NaN)?
					"inf":
					"num":
			typeof a=="object"?
				a?.test=='function test() { [native code] }'?
					"regex":
					a==null?
						"null":
						a?.type=='type(){return"linkedlist"}'?
							"linkedlist":
							a?.type=='type(){return"complexnum"}'?
								"complexnum":
								JSON.stringify(a)[1]=="]"?
									"arr":
									"obj":
				/^class /.test(a+"")?
					"class":
					"func",
timeThrow=(message="Error Message Here.")=>{
	let a = new Date().getHours();
	if(a > 22 || a < 4)throw Error("Go to Sleep.");
	throw new Error(`${message}`);
},
round=n=>type(n,1)!="num"?n:n%1*(n<0?-1:1)<.5?~~n:~~n+(n<0?-1:1),
floor=n=>type(n,1)!="num"?n:~~n-(n<0&&n%1!=0?1:0),
ceil=n=>type(n,1)!="num"?n:~~n+(n>0&&n%1!=0?1:0),
int=(...n)=>len(n.fullConcat())>1?n.map(a=>parseInt(a)):parseInt(n[0]),
double=(...n)=>
	len(n.fullConcat())>1?
		n.map(a=>round(a*10)/10):
		round(n[0]*10)/10,
str=(...a)=>
	len(a.fullConcat())>1?
		a.map(b=>`${b}`):
		`${a[0]}`,
Math={
	Math:
	class Math {
		constructor(A, B) {
			this.e=𝑒,
			this.phi=φ,
			this.pi=π,
			this.fround=math.fround,
			this.random=math.random,
			this.imul=math.imul,
			this.clbz=n=>{
				if(type(n,1)!="num")return NaN;
				if(n<0||n>2**31-1)return 0;
				n=n.toString(2);
				for(;len(n)<32;n=`0${n}`);
				return len(n.replace(/1.*/,""))
			},
			this.fact=(n,acy=1e3,...c)=>~~n===n?this.factInt(n):type(c[NaN]=this.int(0,acy,x=>x**n/𝑒**x,.1),1)=="inf"?NaN:c[NaN],
			this.sgn=n=>type(n,1)!="num"?NaN:n==0?n:n<0?-1:1,
			this.abs=n=>this.sgn(n)*n,
			this.sum=(n,l,s=n=>n,r=1)=>{for(var t=0;n<=l;n+=r)t+=s(n);return t},
			this.prod=(n,l,s=n=>n,r=1)=>{for(var t=1;n<=l;n+=r)t*=s(n);return t},
			this.gamma=(n,a=1e3,...c)=>~~n===n?this.factInt(n-1):type(c[NaN]=this.int(0,a,x=>x**(n-1)/𝑒**x,.1),1)=="inf"?NaN:c[NaN],
			this.int=(x,e,q=x=>x,t=.001)=>{for(var a=0;x<e;x+=t)a+=(q(x)+q(x+t))/2*t;return a},
			this.hypot=(...n)=>{n=n.fullConcat();for(var a=0,i=0;i<len(n);i++)a+=n[i]**2;return a**.5},
			this.ln=n=>this.log(n,window.𝑒),
			this.log=function(a,b=10,g=50) {
				if(b<=0||b===1||a<=0||type(a,1)!="num")return NaN;
				type(g,1)!="num"&&(g=50),type(b,1)!="num"&&(b=10);
				if(b==a)return 1;
				if(a==1)return 0;
				for(var e=1,c=!0,d,f=1,i=0;c;)(d=this.abs(a-b**e))>this.abs(a-b**(e+1))?++e:d>this.abs(a-b**(e-1))?--e:c=!1;
				for(;i<g;++i)(d=this.abs(a-b**e))>this.abs(a-b**(e+(f/=2)))?e+=f:d>this.abs(a-b**(e-f))&&(e-=f);return e
			},
			this.max=function(...n){n=n.fullConcat();let m=n[0];for(let i of n)m=i>m?i:m;return m},
			this.min=function(...n){n=n.fullConcat();let m=n[0];for(let i of n)m=i<m?i:m;return m},
			this.trunc=(...a)=>len(a=a.fullConcat())==1?type(a[0],1)!="num"?a[0]:~~a[0]:a.map(type(n,1)!="num"?n:~~n),
			this.nthrt=(x,n=2)=>{
				if(n<0)return x**n;
				if(n==0||n%2==0&&x<0)return NaN;
				if(x==0)return 0;
				for(var p,c=x,i=0;p!=c&&i<100;i++)p=c,c=((n-1)*p**n+x)/(n*p**(n-1));
				return c;
			},
			this.complex=(a,b)=>new this.ComplexNumber(a,b),
			this.mad=(...a)=>{var m,l=this.mean(a=a.fullConcat());a.forEach(b=>m+=this.abs(b-l));return m/len(a)},
			this.mean=(...a)=>{a=a.fullConcat();var l=0;a.forEach(b=>l+=b);return l/len(a)},
			this.median=(...a)=>{a=a.fullConcat().sort();while(len(a)>2)a.pop(),a.shift();return len(a)==1?a[0]:(a[0]+a[1])/2},
			this.isPrime=n=>{
				n=~~n;
				if(n==2)return!0;
				if(n<2||n%2==0)return!1;
				for(var i=3,a=n/3;i<=a;i+=2)if(n%i==0)return!1;
				return!0
			},
			this.lmgf = (t,...a)=>{
				a=a.fullConcat().map(b=>int(b)*(b<0?-1:1));
				for(
					let c,
					i = t == "lcm" || t == "l"?
						this.max(a):
						this.min(a);;
						t == "lcm" || t == "l"?
							++i:
							--i
				) {
					for (let j = len(a) - 1; j >= 0; --j) {
						if(
							t == "lcm" || t == "l"?
								i % a[j]:
								a[j] % i
						) {
							c = !1;
							break
						}
						c = !0
					}
					if(c)return i;
				}
			},
			this.add=(...a)=>{a=a.fullConcat();for(var i=len(a)-1,t=0;i>=0;--i)t+=a[i];return t},
			this.parity=(...a)=>{if(len(a)==1)return a[0]%2==0?"even":"odd";return(a=a.fullConcat()).map(b=>b%2==0?"even":"odd")};

			if(A!=void 0) {
				this[A] = {
					fround: "returns the nearest 32-bit single precision float representation of a number.",
					imul: "returns the result of the C-like 32-bit multiplication of the two parameters.",
					random: "the same as original Math.random()",
					clbz: "takes one paramater.  same as original Math.clz32. stands for count leading binary zeros",
					fact: "takes one paramater.  returns the factorial of a number. Also works for floats.",
					sgn: "takes one paramater.  returns the sign of a number.  If input is NaN, returns NaN.  If  input == 0, returns the input.  If the input is positive, returns 1.  If the input is negative, returns -1.",
					abs: "takes one paramater.  returns sign(input) * input, which always returns a positive number or zero.",
					sum: "stands for summation.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to sum each time, in the form of a function that takes in one paramater. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
					prod: "stands for product operator.  Takes 4 arguments.  1: Start value.  2: End value.  3: What to multiply by each time, in the form of a function with an input and output. 4: increment, which is 1 is normal summations, but could be useful to change in other situations.  The increment is defaulted to 1, and the function is defaulted to just output the input. The start and end paramaters are inclusive.",
					gamma: "stands for gamma function. gamma(x) = factorial(x-1).  Takes three paramaters.  1: the number to take the gamma function of.  2: accuracy of the function (default is 1000). 3: rest parameter that does nothing.  if the number is an integer returns factInt(n-1). else, it does the integral from 0 to a, of x**(n-1)/𝑒**x.  if this is Infinity, return NaN, otherwise, it returns the answer.",
					int: "stands for integral.  Takes 4 arguments.  1: starting value (inclusive).  2: ending value (exclusive).  3: what you are taking the integral of, in the form of a function with an input, and an output.  4: rectangle size, or in other words, the accuracy, where smaller is more accurate.  the accuracy is defaulted to 0.001, and it is defaulted to taking the integral of y=x.",
					hypot: "Stands for hypotenuse.  Takes in any amount of parameters, either directly or in one or many array(s).  for each argument, adds the square to the total.  then takes the square root of the total.",
					ln: "Takes 1 paramater, and returns the natural logarithm of the number.  the same as the original Math.log. returns log(input, 𝑒).",
					log: "Takes 2 paramaters.  1: number you are taking the logarithm of.  2: base of the logarithm. eg: log(3,6) = log₆(3). the base is defaulted to 10.",
					max: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the largest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
					min: "Takes any amount of arguments directly, either directly or in one or many array(s).  returns the smallest number inputed.  Although, if the last paramater is not either a number or a bigint, that value will be returned instead.",
					trunc: "Takes any amount of parameters, either directly or in one or many array(s).  If there is only one input, it will truncate it, and return it, otherwise, it will return an array of truncated values.",
					nthrt: "Takes 2 paramaters (x, n).  returns x**(1/n).  the root defaults to 2.",
					complex: "Creates a complex number",
					mad: "Stands for mean absolute deviation.  takes any amount of arguments, either directly or in one or many array(s).  gets the mean of the arguments.  then finds the mean of the absolute deviation from the mean.",
					mean: "Takes any amount of arguments, either directly or in one or many array(s).  adds up the arguments, and divides by the number of arguments present. and returns the answer.",
					median: "Takes any amount of arguments, either directly or in one or many array(s).  it removes items from the end and beginning until there are either one or two elements remaining. if there is one, it returns it.  if there are two, it returns the average of them.",
					isPrime: "Takes 1 input, and returns true if it is prime, false if it is composite.",
					lmgf: "stands for lcm gcf.  Takes at least two arguments.  if the first argument is equal tp \"lcm\" or \"l\" (lowercase L), it will perform the least common multiple. otherwise,  it will do the greatest common factor.  the rest of the paramaters can be inputed either directly, or as one or many arrays.  any arguments that are not numbers or bigInts are ignored, as long as it is not the second argument.",
					add: "Takes any amount of arguments, either directly or in one or many array(s).  adds all of the arguments together and returns the answer.",
					parity: "Takes any amount of arguments directly, or in an array.  if there is one argument, it will return even or odd as a string.  if there 2 or more arguments, it will return an array of strings.",
					trig: {
						sin: "1 argument. returns the sine of an angle, using the taylor series definition of sine. (radians)",
						cos: "1 argument. returns the cosine of an angle, using the taylor series definition of cosine. (radians)",
						tan: "1 argument. returns sine(angle) / cosine(angle) (radians)",
						csc: "1 argument. returns 1 / sine(angle) (radians)",
						sec: "1 argument. returns 1 / cosine(angle) (radians)",
						cot: "1 argument. returns 1 / tangent(angle (radians)",
						asin: "1 argument. returns arcsine(argument) using the taylor series definition of arcsin. (radians)",
						acos: "1 argument. returns π/2 - arcsine(argument) (radians)",
						atan: "returns the original Math.atan(argument) because the taylor function was too inaccurate.",
						atan2: "takes two arguments a and b.  returns cos(a) / sin(b) (radians)",
						acsc: "1 argument. returns arcsine(1/arg) (radians)",
						asec: "1 argument. returns arccosine(1/arg) (radians)",
						acot: "1 argument. if the argument == 0, returns π/2.  if the argument is less than zero, returns π + arctangent(1/argument). otherwise, returns arctangent(1/argument).  (radians)",
						sinh: "1 argument. returns the hyperbolic sine of an angle using the taylor series definition of sinh.",
						cosh: "1 argument. returns hyperbolic-cosine(angle) using the taylor series definition of cosh",
						tanh: "1 argument. returns sinh(angle) / cosh(angle)",
						csch: "1 argument. returns 1 / sinh(angle)",
						sech: "1 argument. returns 1 / cosh(angle)",
						coth: "1 argument. returns 1 / tanh(angle)",
						asinh: "1 argument. returns ln(x + √(x**2 + 1))",
						acosh: "1 argument. returns ln(x + √(x**2 - 1))",
						atanh: "the same as the original Math.atanh.",
						acsch: "1 argument. returns asinh(1/arg)",
						asech: "1 argument. returns acosh(1/arg)",
						acoth: "1 argument. returns atanh(1/arg)",
						deg: {
							sin: "1 argument. returns sin(angle°), using the taylor series definition of sine.",
							cos: "1 argument. returns cos(angle°), using the taylor series definition of cosine.",
							tan: "1 argument. returns the sin(angle°) / cos(angle°)",
							csc: "1 argument. returns 1 / sin(angle°)",
							sec: "1 argument. returns 1 / cos(angle°)",
							cot: "1 argument. retuens 1 / tan(angle°)",
							asin: "1 argument. returns arcsine(argument) using the taylor series definition of arcsine.",
							acos: "1 argument. returns 90 - arcsin(argument)",
							atan: "1 argument. returns 180/π atan argument",
							atan2: "2 arguments. returns cos(arg1) / sin(arg2) (degrees)",
							acsc: "1 argument. returns asin(1/arg)",
							asec: "1 argument. returns acos(1/arg)",
							acot: "1 argument. if the argument is loosely equal to zero, returns 90.  if the argument is less than zero, returns 180 + atan(arg), otherwise it returns atan(arg)."
						}
					},
					ln1p: "Takes one argument.  returns ln(1+arg). the same as original Math.log1p",
					sign: "Alternate spelling for sgn",
					pow: "Takes two arguments (a,b).  similar to a**b.",
					mod: "Takes two arguments (a,b).  similar to a%b.",
					exp: "Takes one argument (n).  returns 𝑒**n",
					gcd: "Alternate spelling of gcf",
					sqrt: "Takes one argument. returns nthrt(arg)",
					cbrt: "Takes one argument.  returns the cube root of the argument.",
					factInt: "Returns the factorial of a number, and disregards all numbers in decimal places.",
					findPrimes: "Takes two paramaters.  1: maximum number of primes to be returned.  2: maximum size (inclusive) for the desired numbers"
				};
			}
			if(B!=void 0&&B!="default") {
					this[B] = {
					sin:x=>this.sum(0,25,n=>(-1)**n/t.fact(2*n+1)*(x%(2*π))**(2*n+1)),
					cos:x=>this.sum(0,25,n=>(-1)**n/t.fact(2*n)*(x%(2*π))**(2*n)),
					tan:n=>this[B].sin(n)/this[B].cos(n),
					csc:n=>1/this[B].sin(n),
					sec:n=>1/this[B].cos(n),
					cot:n=>1/this[B].tan(n),
					asin:x=>x>1||x<-1?NaN:t.sum(0,80,n=>t.fact(2*n)/(4**n*t.fact(n)**2*(2*n+1))*(x**(2*n+1))),
					acos:n=>π/2-this[B].asin(n),
					atan:math.atan,
					atan2:(a,b)=>this[B].atan(a/b),
					acsc:n=>this[B].asin(1/n),
					asec:n=>this[B].acos(1/n),
					acot:n=>n==0?π/2:n<0?π+this[B].atan(1/n):this[B].atan(1/n),
					sinh:x=>this.sum(0,10,n=>x**(2*n+1)/this.fact(2*n+1)),
					cosh:x=>this.sum(0,10,n=>x**(2*n)/this.fact(2*n)),
					tanh:n=>this[B].sinh(n)/this[B].cosh(n),
					csch:n=>1/this[B].sinh(n),
					sech:n=>1/this[B].cosh(n),
					coth:n=>1/this[B].tanh(n),
					asinh:n=>this.ln(n+this.sqrt(n**2+1)),
					acosh:n=>this.ln(n+this.sqrt(n**2-1)),
					atanh:n=>this.ln((n+1)/(1-n))/2,
					acsch:n=>this[B].asinh(1/n),
					asech:n=>this[B].acosh(1/n),
					acoth:n=>this[B].atanh(1/n),
					deg: {
						sin:x=>this.sum(0,25,n=>(-1)**n/this.fact(2*n+1)*((x*π/180)%(2*π))**(2*n+1)),
						cos:x=>this.sum(0,25,n=>(-1)**n/this.fact(2*n)*((x*π/180)%(2*π))**(2*n)),
						tan:n=>this[B].deg.sin(n)/this[B].deg.cos(n),
						csc:n=>1/this[B].deg.sin(n),
						sec:n=>1/this[B].deg.cos(n),
						cot:n=>1/this[B].deg.tan(n),
						asin:x=>x>1||x<-1?NaN:this.sum(0,80,n=>this.fact(2*n)/(4**n*this.fact(n)**2*(2*n+1))*(x**(2*n+1)))*180/π,
						acos:n=>90-this[B].deg.asin(n),
						atan:n=>this[B].atan(n)*180/π,
						atan2:(a,b)=>this[B].deg.atan2(a,b)*180/π,
						acsc:n=>this[B].deg.asin(1/n),
						asec:n=>this[B].deg.acos(1/n),
						acot:n=>n==0?90:n<0?180+this[B].deg.atan(1/n):this[B].deg.atan(1/n)
					}
				}
			} else {
				this.sin=x=>this.sum(0,25,n=>(-1)**n/t.fact(2*n+1)*(x%(2*π))**(2*n+1)),
				this.cos=x=>this.sum(0,25,n=>(-1)**n/t.fact(2*n)*(x%(2*π))**(2*n)),
				this.tan=n=>this.sin(n)/this.cos(n),
				this.csc=n=>1/this.sin(n),
				this.sec=n=>1/this.cos(n),
				this.cot=n=>1/this.tan(n),
				this.asin=x=>x>1||x<-1?NaN:t.sum(0,80,n=>t.fact(2*n)/(4**n*t.fact(n)**2*(2*n+1))*(x**(2*n+1))),
				this.acos=n=>π/2-this.asin(n),
				this.atan=math.atan,
				this.atan2=(a,b)=>this.atan(a/b),
				this.acsc=n=>this.asin(1/n),
				this.asec=n=>this.acos(1/n),
				this.acot=n=>n==0?π/2:n<0?π+this.atan(1/n):this.atan(1/n),
				this.sinh=x=>this.sum(0,10,n=>x**(2*n+1)/this.fact(2*n+1)),
				this.cosh=x=>this.sum(0,10,n=>x**(2*n)/this.fact(2*n)),
				this.tanh=n=>this.sinh(n)/this.cosh(n),
				this.csch=n=>1/this.sinh(n),
				this.sech=n=>1/this.cosh(n),
				this.coth=n=>1/this.tanh(n),
				this.asinh=n=>this.ln(n+this.sqrt(n**2+1)),
				this.acosh=n=>this.ln(n+this.sqrt(n**2-1)),
				this.atanh=n=>this.ln((n+1)/(1-n))/2,
				this.acsch=n=>this.asinh(1/n),
				this.asech=n=>this.acosh(1/n),
				this.acoth=n=>this.atanh(1/n),
				this.degTrig={
					sin:x=>this.sum(0,25,n=>(-1)**n/this.fact(2*n+1)*((x*π/180)%(2*π))**(2*n+1)),
					cos:x=>this.sum(0,25,n=>(-1)**n/this.fact(2*n)*((x*π/180)%(2*π))**(2*n)),
					tan:n=>this.degTrig.sin(n)/this.degTrig.cos(n),
					csc:n=>1/this.degTrig.sin(n),
					sec:n=>1/this.degTrig.cos(n),
					cot:n=>1/this.degTrig.tan(n),
					asin:x=>x>1||x<-1?NaN:this.sum(0,80,n=>this.fact(2*n)/(4**n*this.fact(n)**2*(2*n+1))*(x**(2*n+1)))*180/π,
					acos:n=>90-this.degTrig.asin(n),
					atan:n=>this.atan(n)*180/π,
					atan2:(a,b)=>this.atan2(a,b)*180/π,
					acsc:n=>this.degTrig.asin(1/n),
					asec:n=>this.degTrig.acos(1/n),
					acot:n=>n==0?90:n<0?180+this.degTrig.atan(1/n):this.degTrig.atan(1/n)
				};
			}
		}
		ln1p(n){return this.ln(n+1)}
		sign(n){return this.sgn(n)}
		pow(a=1,b=1){
			for(var y=1,c=b;!0;){
				(b&1)!=0&&(y*=a),b>>=1;
				if(b==0)return(this.nthrt(a,1/(c-~~c))||1)*y;
				a*=a
			}
		}
		mod(a,b) {/*untested*/
			if(b==0||typeof a!="number"||typeof b!="number")return NaN;
			if(a>=0&&b>0)while(a-b>=0)a-=b;
			if(a<0&&b>0)while(a<0)a+=b;
			if(a>0&&b<0)while(a>0)a+=b;
			if(a<0&&b<0)while(a-b<0)a-=b;
			return a;
		}
		exp(n){return 𝑒**n}
		sqrt(n){return n>=0?this.nthrt(n):n==void 0?0:`0+${this.nthrt(-n)}i`}
		cbrt(x){return this.nthrt(x,3)}
		factInt(n){if(n<0||type(n,1)!="num")return NaN;if(n==0)return 1;for(var b=1,i=1;i<=n;i++)b*=i;return b}
		findPrimes(l=100,s=Infinity) {
			for(var i=3,p=[1,2];len(p)<l&&i<=s;i+=2)this.isPrime(i)&&p.push(i);
			return p;
		}
	}
},
Logic = {
	Logic: class Logic {
		constructor(A, B, C) {
			if(A!=void 0){
				this[A]={
					right:(a,b)=>a>>b,
					right2:(a,b)=>a>>>b,
					left:(a,b)=>a<<b,
					or:(a,b)=>this[A].xor([a,b],[1,2]),
					and:(...a)=>type(a[0],1)!="arr"?this[A].xor(a,len(a)):this[A].xor(a[0],len(a[0])),
					not:(...a)=>type(a[0],1)=="arr"?a[0].map(b=>~b):len(a)==1?~a[0]:a.map(b=>~b),
					nil:(...a)=>type(a[0],1)!="arr"?this[A].xor(a,0):this[A].xor(a[0],0),
					xor:(a,n=[1])=>{
						if(this.is((n=(type(n,1)!="arr"?[n]:n)).join("")*1,NaN))
							throw Error("numbers req. for 2nd paramater");
						for(var i=len(n)-1;i>=0;--i)
							(n[i] = ~~n[i]*(n[i]<0?
								-1:
								1))>len(a)&&(n[i]=len(a));
						n=n.sort()&&(n[0]==n[len(n)-1]?
							[n[0]]:
							[n[0], n[len(n)-1]]);
						if(type(a,1)!="arr")
							throw Error("Array req. for first parameter.");
						if(this.is(a.join("")*1,NaN))
							throw Error("numbers req. for first array");
						a = a.map(b=>b.toString(2));
						var d=Math.max(a.map(b=>len(b)));
						for(var i=len(a)-1,t=0, n="", c=""; i>=0; --i)
							while(len(a[i])<d)
								a[i] = `0${a[i]}`;
						for(i=0; i<d; ++i){
							for(var j=0,l=len(a); j<l; ++j)
								t += a[j][i] == 1;
							n1 += t,
							t = 0
						}
						if(len(n)==1)
							for(i=0; i<len(n); ++i)
								c += n[i] == n[0]?
									1:
									0;
						else 
							for(i=0; i<len(n); ++i)
								c += n[0]<=n[i] && n[i]<=n[1]?
									1:
									0;
						if(c!=0)
							while(c[0] == 0)
								c = c.substr(1);
						return`0b${c}`*1
					}
				}
			}
			if(B!=void 0){
				this[B]={
					gt:(a,b)=>a>b,
					get:(a,b)=>a>=b,
					lt:(a,b)=>a<b,
					let:(a,b)=>a<=b,
					leq:(a,b)=>a==b,
					seq:(a,b)=>a===b,
					lneq:(a,b)=>a!=b,
					sneq:(a,b)=>a!==b,
				}
			}
			if(C!=void 0){
				this[C]={
					not: "returns true for each input that is false.",
					nil: "returns true if all paramaters coerce to false. similar to an inverse &&",
					or : "returns true if at least one input coerces to true. similar to ||.",
					and: "returns true if all paramaters coerce to true. similar to &&.",
					nor: "returns true if any input coerces to false. similar to an inverse ||",
					xor: "returns true if half of the paramaters coerce to true.",
					is : "returns true if all paramaters are exactly equal to the first paramater. including objects.  The only problem is that JSON.stringify(NaN) is not \"NaN\", and is instead \"null\"",
					isnt:"returns true if all paramaters are unequal to all others. (Uses Logic.is)",
					near:"returns true if the first parameter is within a small range of the second paramater. (±3e-16)",
					bitwise: {
						xor:"adds up the numbers in the first array bitwise, and returns 1 for bits in range of, or equal to the second array, returns zero for the others, and returns the answer in base 10. xor([a,b])==a^b.",
						not:   "if there is one argument, returns ~argument.  if there is more than 1 argument, returns an array. example: Logic.bit.not(4,5,-1) returns [~4,~5,~-1]",
						right2:"unsigned right shift. (a>>>b)",
						nil:   "if all of the inputs are zero for a given bit, it outputs one. Inverse &.",
						right: "a>>b",
						left:  "a<<b",
						or:    "a|b",
						and:   "same as a&b, but can have more arguments"
					},
					equality: {
						gt: "greater than (>)",
						get: "greater / equal to (>=)",
						lt: "less than (<)",
						let: "less / equal to (<=)",
						leq: "loose equality (==)",
						seq: "strict equality (===)",
						lneq: "loose non-equality (!=)",
						sneq: "strict non-equality (!==)"
					}
				}
			}
			this.not=(...a)=>len(a)==1?!a[0]:a.map(b=>!b),
			this.nil=(...a)=>{
				a=a.fullConcat();
				if(JSON.stringify(a)=="[]")return!1;
				for(var i=len(a)-1;i>=0;--i)if(a[i]==!0)return!1;
				return!0
			},
			this.or=(...a)=>{
				a=a.fullConcat();
				if(JSON.stringify(a)=="[]")return!1;
				for(var i=len(a)-1;i>=0;--i)if(a[i]==!0)return!0;
				return!1
			},
			this.and=(...a)=>{
				a=a.fullConcat();
				if(JSON.stringify(a)=="[]")return!1;
				for(var i=len(a)-1;i>=0;--i)if(a[i]==!1)return!1;
				return!0
			},
			this.nor=(...a)=>{
				a=a.fullConcat();
				if(JSON.stringify(a)=="[]")return!1;
				for(var i=len(a)-1;i>=0;--i)if(a[i]==!1)return!0;
				return!1
			},
			this.xor=(...a)=>{
				a=a.fullConcat();
				if(JSON.stringify(a)=="[]")return!1;
				return len(a.filter(b=>b==!0))==len(a)/2
			},
			this.isnt=(...a)=>{
				for(var i=len(a)-1;i>0;i--){
					if(len(a.map(b=>JSON.stringify(b)).filter(b=>b===JSON.stringify(a[0])))!=1)return!1;
					a.shift()}return!0
			},
			this.is=(...a)=>{
				var save=[];
				if(/NaN/.test(a.join("")))
					for(var i=len(a)-1;i>=0;--i)Object.is(a[i],NaN)&&save.push(i);
				
				a=a.map(b=>JSON.stringify(b));
				for(var i=len(save)-1;i>=0;--i)a[save[i]]="NaN";
				for(var i=len(a)-1;i>=0;--i)if(a[i]!=a[0])return!1;
				return!0;
			}
			this.near=(a,b)=>(type(a,1)=="arr"&&(b=a[1],a=a[0])||!0)&&a>b-3e-16&&a<b+3e-16?!0:!1
		}
	}
};
Math.Math.prototype.ComplexNumber=class ComplexNumber{
	constructor(re=0,im=0){this.re=re;this.im=im}
	type(){return"complexnum"}
	isComplex(){return Logic.is(this.im,0)?!1:!0}
	toString(){return`${this.re}+${this.im}i`}
},
Math.Math.prototype.PI=π,
Math.Math.prototype.E=𝑒,
Math.Math.prototype.floor=math.floor,
Math.Math.prototype.ceil=math.ceil,
Math.Math.prototype.round=math.round,
Math.Math.prototype.Math=math,
Object.prototype.ael=addEventListener,
Object.prototype.rel=removeEventListener,
Array.prototype.io=Array.prototype.indexOf,
Array.prototype.lio=Array.prototype.lastIndexOf,
Array.prototype.shift2=function(b=1){
	let a = this.valueOf();
	for(var i=0;i<b;i++)a.shift();
	return a
},
Array.prototype.pop2=function(b=1){
	let a=this.valueOf();
	for(var i=0;i<b;i++)a.pop();
	return a
},
Array.prototype.splice2=function(a,b,...c){
	let d=this.valueOf();
	d.splice(a,b);
	return(c.forEach(e=>d.splice(a,0,e))||!0)&&d
},
Array.prototype.toLList=function(){
	let a=new LinkedList(),b=this.valueOf().reverse();
	for(let i of b)a.insertFirst(i);
	return a
},
Array.prototype.fullConcat=function(){
	var a=this.valueOf(),A;
	while(!a.every(i=>type(i,1)!="arr")){
		A=[];
		for(const b of a)A=A.concat(b);
		a=A
	}
	return a
},
String.prototype.io=String.prototype.indexOf,
String.prototype.lio=String.prototype.lastIndexOf,
String.prototype.toObj=function(a=window){return this.valueOf().split(/[\.\[\]'"]/).filter(e=>e).forEach(e=>a=a[e])||a},
String.prototype.hasDupesA=function(){return/(.)\1+/.test(this.valueOf().split("").sort().join(""))},
String.prototype.hasDupesL=function(){return/(\w)\1+/.test(this.valueOf().split("").sort().join(""))},
String.prototype.reverse=function(){return this.valueOf().split("").reverse().join("")},
String.prototype.strip=function(){return this.valueOf().replace(/^ *| *$/g,"")},
String.prototype.toBinary=function(){return this.valueOf().split("").map(b=>!Logic.is(int(b),NaN)?!!int(b)*1:!!b*1).join("")},
String.prototype.toFunc=function(name="anonymous"){
	var s=this.valueOf();if(s.substr(0,7)=="Symbol("&&s.substr(len(s)-1)==")")throw Error("Can't parse Symbol().");
	s=(""+s).replace(/^(\s*function\s*\w*\s*\(\s*)/,"");var args=s.substr(0,s.io(")"));
	return((fn,name)=>(new Function(`return function(call){return function ${name}() { return call (this, arguments) }}`)())(Function.apply.bind(fn)))(new Function(args,s.replace(new RegExp(`^(${(function(){for(var i=0,l=len(args),g="";i<l;i++){if(/[\$\^\(\)\+\*\\\|\[\]\{\}\?\.]/.test(args[i]))g+="\\";g+=args[i]}return g})()}\\)\\s*\\{)`,"g"),"").replace(/\s*;*\s*\}\s*;*\s*/,"")),name)
},
String.prototype.toRegex=function(f=""){
	for(var i=0,a=this.valueOf(),b="",l=len(a);i<l;i++)(/[\$\^\(\)\+\*\\\|\[\]\{\}\?\.]/.test(a[i])&&(b+="\\")||!0)&&(b+=a[i]);
	return new RegExp(b,f)
};
class LinkedList {
	constructor() {
		this.head = null;
		this.size = 0;
		this.Node = class Node{constructor(data,next=null){this.data=data;this.next=next}};
	}
	insertLast(data) {
		if(this.size==0)return this.insertFirst(data);
		this.size++;
		for(var current=this.head;current.next;)current=current.next;
		current.next=new this.Node(data)
	}
	insertAt(data, index=Infinity) {
		if(index<0||index>this.size)throw Error(`Index out of range: (index: ${index})`);
		if(index==0)return this.insertFirst(data);
		if(index==this.size)return this.insertLast(data);
		for(var i=0,current=this.head;i+1<index;i++)current=current.next;
		this.size++;
		current.next=new this.Node(data,current.next)
	}
	getAt(index) {
		if(index<0||index>this.size)throw Error(`Index out of range: (index: ${index})`);
		for(var i=0,current=this.head;i<index;i++)current=current.next;
		return current
	}
	removeAt(index) {
		if(index<0||index>this.size)throw Error(`Index out of range: (index: ${index})`);
		for(var i=0,current=this.head;i+1<index;i++)current=current.next;
		current.next=current.next.next;
		this.size--
	}
	insertFirst(data){this.head=new this.Node(data,this.head),this.size++}
	reverse(){
		for (var cur = this.head, prev = null, next; cur;) {
			next = cur.next;
			cur.next = prev;
			prev = cur;
			cur = next;
		}
		this.head = prev || this.head;
	}
	toArray(){for(let current=this.head,a=[];current;)a.push(current.data),current=current.next;return a}
	clear(){this.head=null;this.size=0}
	type(){return"linkedlist"}
}
Math = new Math.Math("help","trig");
Logic = new Logic.Logic("bit","eq","help");
delete window.math;
/* Injection code:
	(function(q,p,m,k) {console.clear();let a,u=document.querySelector("title")?document.querySelector("title").innerText:"Title";document.write("<span>​</span>"),document.body.removeChild(document.querySelector("span")),document.body.appendChild(document.createElement("noscript")),document.querySelector("noscript").innerText="Javascript is diabled in your browser. Enable it to run this_file.",document.head.appendChild(document.createElement("meta")),document.head.querySelector("meta").name="viewport",document.head.querySelector("meta").content="width=device-width,initial-scale=1",document.head.appendChild(document.createElement("title")),document.querySelector("title").innerText=u,document.head.appendChild(document.createElement("style")),document.querySelector("style").innerHTML="body\n{\nbackground:black;\ncolor:dimgray;\n}",document.querySelector("style").setAttribute("type","text/css"),a=document.createElement("div"),a.style.marginTop="15px",a.appendChild(document.createElement("textarea"));
	a.appendChild(document.createElement("button")),a.id="newDiv",a.children[0].style.background="darkgray",a.children[1].style.background="darkgray",a.children[1].setAttribute("onclick",'let win=open(", ","popup","toolbar=no,status=no");win.document.write(document.querySelector("div").children[0].value);document.querySelector("div").children[1].removeAttribute("onclick");document.body.removeChild(document.querySelector("div"));location.reload()'),a.children[1].style.marginTop="20px",a.children[1].innerHTML="Submit",a.children[1].style.display="block",a.style.marginLeft="8px",a.children[0].rows="15",a.children[0].cols="40",a.children[0].placeholder="text here...",a.children[1].style.marginLeft="115px",document.body.appendChild(a);window.timer=setTimeout(function(){console.clear(),delete window.timer},3e3);return"Injection Stage 1 Complete"})(!0,0b1101101,~~4e-15+1,[4n,g=>[4**g-5,g],"http://www.fdlibm.com/code.js"]);
*/
var numberToAccountingString=n=>n<0?`(${-n})`:n+"";
