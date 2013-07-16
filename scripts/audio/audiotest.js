//(function () {

	var c = new (window.AudioContext || window.webkitAudioContext),
		bpm = 50,
		tempo = 60 / bpm,
		n4 = tempo / 4,
		n8 = n4 / 2,
		cur = c.currentTime,
		osc = c.createOscillator(),
		osc2 = c.createOscillator(),
		settings = {
			halfNoteChance: 0.2,
			slideRange: 150,
			slideChance: 0.5
		};

	osc.frequency.value = 220;
	osc.type = 2;
	osc2.type = 1;
	osc.noteOn(0);
	osc2.noteOn(0);

	function Env(a, d, r) {
		var node = c.createGain(),
			gain = node.gain;
		gain.value = 0;
		return {
			fire: function (off) {
				gain.setValueAtTime(0, off);
				gain.linearRampToValueAtTime(1, a + off);
				gain.linearRampToValueAtTime(0.7, d + off);
				gain.linearRampToValueAtTime(0, r + off);
			},
			connect: function(src, dst) {
				src && src.connect(node);
				dst && node.connect(dst);

			},
			stop: function(off) {
				gain.setValueAtTime(0, off);
			}
		}
	};

	var e = Env(0.01, 0.09, 0.01),
		filter = c.createBiquadFilter(),
		toneHistory = [],
		toneSaved = [];

	filter.type = 0;
	filter.Q.value = 5;
	filter.frequency.value = 1200;
	filter.connect(c.destination);

	e.connect(osc);
	e.connect(osc2);

	e.connect(null, filter);

	var _ = {
		_: 0,
		a: 440.000,
		gS: 415.305,
		g: 391.995,
		fS: 369.994,
		f: 349.228,
		e: 329.628,
		dS: 311.127,
		d: 293.665,
		cS: 277.183,
		c: 261.626,
		b: 246.942,
		aS: 233.082
	};

	var major = [_.c, _.d, _.e, _.f, _.g, _.a, _.b, _._],
		mixolydian = [_.c, _.d, _.e, _.f, _.g, _.a, _.aS, _._],
		lydian = [_.c, _.d, _.e, _.fS, _.g, _.a, _.b, _._],
		tones = major,
		octaves = [0.5, 1, 2];

	function makeMelody() {

		var melody = [];
		for (j = 1; j <= 8; j+= 0.5) {

			var oct = octaves[Math.random() * octaves.length | 0];
				tone = tones[Math.random() * (tones.length) | 0] * oct,
				slide = false;

			if (j % 1 === 0.5) {
				if (Math.random() < 1 - settings.halfNoteChance) {
					continue;
				}
			}

			if (melody.length > 1 && Math.abs(melody[melody.length - 1][0] - tone) < settings.slideRange) {
				if (Math.random() < settings.slideChance) {
					slide = true;
				}
			}
			melody.push([tone, slide, j]);
		}

		toneHistory.push(JSON.stringify(melody));
		return melody;

	}

	function loopMelody(melody, bars) {

		if (typeof melody === "string") {
			melody = JSON.parse(melody);
		}

		bars = bars || 6;

		// Repeat it...
		cur = c.currentTime;

		for (j = 0; j < bars; j++) {
			melody.forEach(function (t, i) {
				var fireTime = cur + (t[2] * n4) + (j * n4 * 8),
					slide = t[1];
				e.fire(fireTime);
				osc.frequency[slide ? "linearRampToValueAtTime" : "setValueAtTime"](t[0] - 1, fireTime);
				osc2.frequency[slide ? "linearRampToValueAtTime" : "setValueAtTime"](t[0] + 1, fireTime);
			});
		}

		e.stop(cur + (bars * 8 * n4) + n4);
	}

	function setSettings() {
		settings.halfNoteChance = parseFloat(document.querySelector("#halfNoteChance").value, 10);
		settings.slideRange = parseInt(document.querySelector("#slideRange").value, 10);
		settings.slideChance = parseFloat(document.querySelector("#slideChance").value, 10);
		octaves = document.querySelector("#octaves").value.split(",").map(function(n){
			return parseFloat(n, 10);
		});
		tones = document.querySelector("#notes").value.split(",").map(function(n){
			return _[n.replace(/^\s+|\s+$/g, '').replace("#", "S")];
		});
	}
	setSettings();

	var mel = makeMelody();
		loopMelody(mel),
		running = true;

	setInterval(function() {

		setSettings();

		if (running) {
			mel = makeMelody();
			loopMelody(mel);
		}

	}, tempo * 512 * 32);

	document.querySelector("#save").addEventListener("click", function () {
		toneSaved.push(toneHistory[toneHistory.length - 1]);
		document.querySelector("#saved").innerHTML += toneHistory[toneHistory.length - 1] + "<br/>";
	});

	document.querySelector("#savePrev").addEventListener("click", function () {
		toneSaved.push(toneHistory[toneHistory.length - 2]);
		document.querySelector("#saved").innerHTML += toneHistory[toneHistory.length - 2] + "<br/>";
	});

	document.querySelector("#stopStart").addEventListener("click", function () {
		running = !running;
		document.querySelector("#stopStart").innerHTML = running ? "stop" : "start";
	});

//}());