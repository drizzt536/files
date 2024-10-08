var x = 50_000; // input

// for the minified versions, it will not work for invalid inputs, as opposed to returning

// original version. 1000 characters
!function main(score) {
	/**INSTRUCTIONS
	 * 1. go to https://humanbenchmark.com/tests/verbal-memory
	 * 2. change the argument to be the value that you want. It should be a positive integer
	 * 3. paste the function into the console at 
	 * 
	 * If the function ends, you can just re paste in the function, and It won't break anything. it will just continue.
	 * the function returns whether or not there was an error.
	 * The argument should be a positive integer.
	**/
	if (location.href !== "https://humanbenchmark.com/tests/verbal-memory" || isNaN( score = Number(score) )) return !1;
	$$("button").forEach((e,i,a) => a.length === 2 && e.click());
	window.words ??= [];
	for (var [SEEN, NEW] = $$("button").slice(1), word; score --> 0 ;) {
		word = document.querySelector(".word").innerHTML;
		words.includes(word) ?
			SEEN.click() :
			(NEW.click(), words.push(word));
		if ($(".lives").lastChild.textContent !== "3")
			throw Error(`Something went wrong. word: ${word}`);
	}
	return !0;
}(x);

// averagely minfied version. 180 characters
W=[];(t=>{$$("button").forEach((a,c,b)=>2==b.length&&a.click());for(var a,[c,d]=$$("button").slice(1);t--;)a=$(".word").innerHTML,W.includes(a)?c.click():(d.click(),W.push(a))})(x)


// extremely minified version. now you have to start it yourself. 115 characters
W=[],t=x,[c,d]=$$("button").slice(1);for(;t--;)a=$(".word").innerHTML,W.includes(a)?c.click():(d.click(),W.push(a))


// maximumly minified version. requires the next few lines of variables to work. 68 characters
for(W=[],[c,d]=K(G).a(1);x--;)a=$(F).b(),W.b(a)?c.a():(d.a(),W.c(a))

Array.prototype.a = Array.prototype.slice;
Array.prototype.b = Array.prototype.includes;
Array.prototype.c = Array.prototype.push;
EventTarget.prototype.a = EventTarget.prototype.click;
EventTarget.prototype.b = function () { return this.innerHTML };
var G = "button", F = ".word", K = $$;
