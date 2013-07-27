
// Flashing preloader!
var preloo = setInterval(function () {
	document.querySelector("section").style.background = "hsl(" + (Math.random() * 360 | 0) + ", 50%, 40%)";
}, 600);

var inArcadeCabinet = true;