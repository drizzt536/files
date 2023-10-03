/** Created May 5, 2022 By Daniel Janusch
 * Technically not hacking but it was funnier to name it that way.
 * meant for the JavaScript console. hence the native $$() function which only works in chrome dev tools.
 * Makes all the assignments *appear* completed using CSS. Only good for screenshots.
 * This is not illegal because It was not created for malicious intent, and does not affect anyone else except the person running the code on their local machine in any way.  It also does not violate the CodeHS terms of use.
 * I have no Idea what the arguments are for, and I also do not care, because The defaults work fine for me.
 * I wrote this when I was obsessed with minification, and I don't remember what any of this does.
 * CodeHS moved tp jQuery after this was created.
**/

!function hackCodeHS(
	b = "100%",
	d = $("#nav-photo-wrapper")[0].children[0].src,
	e = userData.name
) {
	var a = $$(".module-info"),
		c = (
			$$(".user-stat"),
			$$(".user-stat")[0].children[0].children
		);
	function f() {
		var a = "finalized",
			b = "submitted",
			c = {
				icon: a,
				challenge: a,
				quiz: a,
				"chs-badge": a,
				video: a,
				connection: a,
				example: a,
				"lesson-status": a,
				exercise: b,
				"free-response": b
			};

		$$(`.unopened,.not-${b}`).forEach((a, b, d) =>
			d[b].className = a.className.replace(
				/unopened|not-submitted/g,
				c[a.className.split(/ +/)[0]]
			)
		);
		$$(".bg-slate")
			.filter(a => "bg-slate" === a.className.trim())
			.forEach((c, a, b) => {
				b[a].style.width = "100%";
				b[a].className = c.className.replace(/progressBar/g, "bg-slate")
			});
		$$(".percent-box").forEach((a, b, c) => {
			c[b].innerHTML = a.innerHTML.replace(/\d+%/g, "100%"),
			c[b].className = a.className.replace(/(progress-)\d+/, "$1100")
		})
	}

	a[0].click();
	a[0].click();

	for (let g of a) {
		g.click();
		f();
	}
	$(".nav-user-name-text")[0].innerHTML = e;
	$("#nav-photo-wrapper")[0].children[0].src = d;
	c[1].innerHTML = b;
	c[2].children[0].children[0].style.width = b;
	clear();
}();
