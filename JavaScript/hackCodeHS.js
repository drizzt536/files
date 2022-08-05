/** Created May 5, 2022 By Daniel Janusch
 * Technically not hacking but it is under this definition found here:
 * https://www.dictionary.com/browse/hack definitions 7a and 14a.
 * meant for the JavaScript console. hence the native $$() function which only works in chrome dev tools.
 * Makes all the assignments appear to be completed using CSS. good for screenshots.
 * This is not illegal because It was not created for malicious intent, and does not affect anyone else except the person running the code on their local machine in any way.  It also does not violate the CodeHS terms of use.
 * I have no Idea what the arguments are for, and I also do not care, because The defaults work fine for me.
**/

!function hackCodeHS(b="100%",d=$("#nav-photo-wrapper")[0].children[0].src,e=userData.name){var a=$$(".module-info"),c=($$(".user-stat"),$$(".user-stat")[0].children[0].children);function f(){var a="finalized",b="submitted",c={icon:a,challenge:a,quiz:a,"chs-badge":a,video:a,connection:a,example:a,"lesson-status":a,exercise:b,"free-response":b};$$(`.unopened,.not-${b}`).forEach((a,b,d)=>d[b].className=a.className.replace(/unopened|not-submitted/g,c[a.className.split(/ +/)[0]])),$$(".bg-slate").filter(a=>"bg-slate"==a.className.trim()).forEach((c,a,b)=>{b[a].style.width="100%",b[a].className=c.className.replace(/progressBar/g,"bg-slate")}),$$(".percent-box").forEach((a,b,c)=>{c[b].innerHTML=a.innerHTML.replace(/\d+%/g,"100%"),c[b].className=a.className.replace(/(progress-)\d+/,"$1100")})}for(let g of(a[0].click(),a[0].click(),a))g.click(),f();$(".nav-user-name-text")[0].innerHTML=e,$("#nav-photo-wrapper")[0].children[0].src=d,c[1].innerHTML=b,c[2].children[0].children[0].style.width=b,clear()}()
