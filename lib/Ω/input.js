(function (Ω) {

	"use strict";

	var keys = {},
		mouse = {
			x: null,
			y: null
		},
		actions = {},
		input,
		el;

	input = {

		KEYS: {
			enter: 13,
			space: 32,
			escape: 27,
			up: 38,
			down: 40,
			left: 37,
			right: 39,

			w: 87,
			a: 65,
			s: 83,
			d: 68,

			az_w: 90,
			az_a: 81,
			az_s: 83,
			az_d: 68,

			mouse1: -1,
			mouse2: -2,
			mouse3: -3,
			wheelUp: -4,
			wheelDown: -5
		},

		mouse: mouse,

		init: function (dom, icade) {

			el = dom;

			icade = icade || Ω.urlParams.icade;

			bindKeys(!icade ? keyed : keyedIcade);
			bindMouse();
			bindTouch();

		},

		reset: function () {

		},

		tick: function () {

			var key;

			for(key in keys) {
				keys[key].wasDown = keys[key].isDown;
			}
			if (keys[input.KEYS.wheelUp]) keyed(input.KEYS.wheelUp, false);
			if (keys[input.KEYS.wheelDown]) keyed(input.KEYS.wheelDown, false);
		},

		bind: function (code, action) {

			var self = this;

			if (Array.isArray(code)) {
				code.forEach(function (k) {

					self.bind(k[0], k[1]);

				});
				return;
			}

			if (typeof code !== "number") {
				code = this.KEYS[code];
				if (!code) {
					console.error("Could not bind input: ", code);
					return;
				}
			}

			keys[code] = {
				action: action,
				isDown: false,
				wasDown: false,
				downTime: Date.now()
			};
			if (!actions[action]) {
				actions[action] = [];
			}
			actions[action].push(code);

		},

		pressed: function (action) {

			return this.isDown(action) && !(this.wasDown(action));

		},

		released: function (action) {

			return this.wasDown(action) && !(this.isDown(action));

		},

		isDown: function (action) {
			var actionCodes = actions[action] || [];
			var back = actionCodes.some(function (code) {
				return keys[code].isDown;
			});
			return back;

		},

		wasDown: function (action) {
			var actionCodes = actions[action] || [];
			return actionCodes.some(function (k) {
				return keys[k].wasDown;
			});
		},

		wentDownAt: function (action, diff) {
			var actionCodes = actions[action] || [],
				mostRecent = actionCodes.reduce(function (acc, el) {
					return keys[el].downTime > acc ? keys[el].downTime : acc;
				}, 0);

			return diff ? Date.now() - mostRecent : mostRecent;
		},

		release: function (action) {
			var actionCodes = actions[action] || [];
			actionCodes.forEach(function (code) {
				keyed(code, false);
			});
		}
	}

	function keyed(code, isDown) {

		if (keys[code] && (keys[code].isDown !== isDown)) {
			keys[code].wasDown = keys[code].isDown;
			keys[code].isDown = isDown;
			if (isDown) keys[code].downTime = Date.now();
		}

	}

	function keyedIcade(code, isDown) {

		var icadeCodes = [87, 69, 88, 90, 68, 67, 65, 81, 89, 84, 72, 82],
			KEYS = input.KEYS;

		if (icadeCodes.indexOf(code) > -1) {

			if (!isDown) {
				// Don't handle key up with iCade!
				return;
			}

			switch (code) {
			case 87:
				// Up
				code = KEYS.up;
				isDown = true;
				break;
			case 69:
				code = KEYS.up;
				isDown = false;
				break;
				// Down
			case 88:
				code = KEYS.down;
				isDown = true;
				break;
			case 90:
				code = KEYS.down;
				isDown = false;
				break;
				// Right
			case 68:
				code = KEYS.right;
				isDown = true;
				break;
			case 67:
				code = KEYS.right;
				isDown = false;
				break;
				// Left
			case 65:
				code = KEYS.left;
				isDown = true;
				break;
			case 81:
				code = KEYS.left;
				isDown = false;
				break;

			// Fire
			case 89:
				code = KEYS.space;
				isDown = true;
				break;
			case 84:
				code = KEYS.space;
				isDown = false;
				break;

			case 72:
				code = 93;
				isDown = true;
				break;
			case 82:
				code = 93;
				isDown = false;
				break;
			}
		}

		keyed(code, isDown);

	}

	function bindKeys(keyHandler) {

		document.addEventListener('keydown', function(e){
			keyHandler(e.keyCode, true);
		}, false );

		document.addEventListener('keyup', function(e){
			keyHandler(e.keyCode, false);
		}, false );

	}

	function bindMouse() {

		function setPos(e) {

			var relX = e.clientX - el.offsetLeft,
				relY = e.clientY - el.offsetTop;

			mouse.diff = {
				x: mouse.x - relX,
				y: mouse.y - relY
			};
			mouse.prev = {
				x: mouse.x,
				y: mouse.y
			};
			mouse.x = relX;
			mouse.y = relY;
		}

		document.addEventListener('mousedown', function(e){

			if (e.which === 1) {
				setPos(e);
				keyed(-1, true);
			}

		});

		document.addEventListener('mousemove', function(e){

			setPos(e);

		});

		document.addEventListener('mouseup', function(e){

			if (e.which === 1) {
				setPos(e);
				keyed(-1, false);
			}

		});

		function mousewheel(e) {

			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

			if (delta === -1) keyed(input.KEYS.wheelUp, true);
			if (delta === 1) keyed(input.KEYS.wheelDown, true);
		}
		document.addEventListener("mousewheel", mousewheel, false);
		document.addEventListener("DOMMouseScroll", mousewheel, false);

	}

	function bindTouch () {

		// setTimeout(function () {

			document.getElementById("board").addEventListener("touchstart", function() {
				keyed(input.KEYS.space, true);
				setTimeout(function () {
					keyed(input.KEYS.space, false);
				}, 100);
			}, false);

		// }, 100);


	};

	Ω.input = input;

}(Ω));
