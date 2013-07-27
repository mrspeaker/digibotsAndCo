var Ω = (function() {

	"use strict";

	var preloading = true,
		pageLoaded = false,
		assetsToLoad = 0,
		maxAssets = 0,
		timers = [];

	return {

		evt: {
			onload: [],
			progress: []
		},

		env: {
			w: 0,
			h: 0
		},

		preload: function (name) {

			if (!preloading) {
				return function () {
					console.error("empty preloading func called:", name);
				};
			}

			maxAssets = Math.max(++assetsToLoad, maxAssets);
			return function () {

				assetsToLoad -= 1;

				Ω.evt.progress.map(function (p) {
					return p(assetsToLoad, maxAssets);
				});

				if (assetsToLoad === 0 && pageLoaded) {
					if (!preloading) {
						console.error("Preloading finished (onload called) multiple times!");
					}
					preloading = false;

					Ω.evt.onload.map(function (o) {
						o();
					});
				}

			}
		},

		pageLoad: function () {

			pageLoaded = true;

			// Errgh! Hack cuase firefox loads chacehed things way before load ;)

			if (maxAssets === 0 || maxAssets > 10 && assetsToLoad === 0) {
				// No assets to load, so fire onload
				Ω.evt.onload.map(function (o) {
					o();
				});
			}

		},

		timers: {

			add: function (timer) {

				timers.push(timer);

			},

			tick: function () {

				timers = timers.filter(function (t) {

					return t.tick();

				});

			}

		},

		urlParams: (function () {
			var params = {},
				match,
				pl = /\+/g,  // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
				query = window.location.search.substring(1);

			while (match = search.exec(query)) {
			   params[decode(match[1])] = decode(match[2]);
			}

			return params;
		}())

	};

}());

// Polyfills
Array.isArray || (Array.isArray = function (a){ return '' + a !== a && {}.toString.call(a) == '[object Array]' });
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(Ω){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  Ω.Class = function(){};

  // Create a new Class that inherits from this class
  Ω.Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init ) {
        this.init.apply(this, arguments);
      }
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
}(Ω));(function (Ω) {

	"use strict";

	Ω.utils = {

		rand: function (min, max) {

			return Math.floor(Math.random() * min);

		},

		oneIn: function (max) {

			return this.rand(max) === 1;

		},

		now: function () {

			return utils.now(); // window.game.time * 1000; //

		},

		since: function (time) {

			return utils.now() - time;

		},

		toggle: function (time, steps, offset) {

			return ((utils.now() + (offset || 0)) / time) % steps >> 0;

		},

		dist: function (a, b) {

			var dx = a.x ? a.x - b.x : a[0] - b[0],
				dy = a.y ? a.y - b.y : a[1] - b[1];

			return Math.sqrt(dx * dx + dy * dy);

		},

		center: function (e) {

			return {
				x: e.x + e.w / 2,
				y: e.y + e.h / 2
			};

		},

		angleBetween: function (a, b) {

			var dx = a.x - b.x,
				dy = a.y - b.y,
				angle = Math.atan2(dy, dx);

			return angle;// % Math.PI;

		},

		snap: function(value, snapSize) {

			return Math.floor(value / snapSize) * snapSize;

		},

		snapRound: function(value, snapSize) {

			var steps = value / snapSize | 0,
				remain = value - (steps * snapSize),
				rounder = remain > (snapSize / 2) ? Math.ceil : Math.floor;

			return rounder(value / snapSize) * snapSize;

		},

		neighbours: function (radius, cb, onlyOuterRing) {

			var j, i;

			for(j = -radius; j <= radius; j++) {
				for(i = -radius; i <= radius; i++) {
					if(onlyOuterRing && (Math.abs(i) !== radius && Math.abs(j) !== radius)){
						continue;
					}
					cb && cb(i, j);
				}
			}

		},

		formatTime: function (t) {

			t /= 1000;
			var mins = ~~(t / 60),
				secs = ~~(t - (mins * 60));

			mins = mins.toString().length === 1 ? "" + mins : mins;
			secs = secs.toString().length === 1 ? "0" + secs : secs;
			return mins + ":" + secs;

		},

		formatScore: function (score, digits) {

			return ((score + Math.pow(10, digits)) + "").slice(1);

		},

		loadScripts: function (scripts, cb) {

			var loaded = 0;

			scripts.forEach(function (path) {

				var script = document.createElement('script'),
					qs = env.desktop ? "?" + new Date().getTime() : "";

				script.src = "scripts/" + path + ".js" + qs;
				script.onload = function () {
					resources.toLoadLoaded++;
					if (loaded++ === scripts.length - 1) {
						cb && cb();
					}
				};

				document.body.appendChild(script);

			});

		},

		getByKeyValue: function (arrayOfObj, key, value) {

			return this.getAllByKeyValue(arrayOfObj, key, value)[0];

		},

		getAllByKeyValue: function (arrayOfObj, key, value) {

			return arrayOfObj.filter(function (o) {
				if (o[key] && o[key] === value) {
					return true;
				}
			});

		},

		ajax: function (url, callback) {

			var xhr = new XMLHttpRequest();
			xhr.addEventListener("readystatechange", function() {
				if (this.readyState < 4) {
					return;
				}

				if (xhr.readyState == 4) {
					callback(xhr);
				}

			}, false);
			xhr.open("GET", url, true);
			xhr.send("");

		},

		storage: {

			store: function (func) {

				var store;

				if (chrome && chrome.storage) {
					store = chrome.storage.local;
					store._type = "chrome";
				} else if (window.localStorage) {
					store = window.localStorage;
					store._type = "web";
				}

				return store ? func(store) : undefined;
			},

			set: function (key, value) {

				this.store(function (s) {

					if (s._type === "chrome") {
						var o = {};
						o[key] = value;
						s.set(o);
					} else {
						s[key] = value;
					}

				});

			},

			get: function (key, cb) {

				this.store(function (s) {

					if (s._type === "chrome") {
						s.get(null, function (val) {
							cb(val.key || null);
						});
					} else {
						cb(s[key]);
					}

				});

			},

			remove: function (key) {

				return this.store(function (s) {

					if (s._type === "chrome") {
						// No time for this nonsennse... clear it all!
						s.clear();
					} else {
						s.removeItem(key)
					}

				});

			}
		}

	};

	Ω.utils.State = function (state) {

		this.state = state;
		this.last = "";
		this.count = -1;
		this.locked = false;

	};

	Ω.utils.State.prototype = {

		set: function (state) {

			if (this.locked) {
				return;
			}

			this.last = this.state;
			this.state = state;
			this.count = -1;

		},

		get: function () { return this.state; },

		tick: function () { this.count++; },

		first: function () { return this.count === 0; },

		is: function (state) { return state === this.state; },

		isNot: function (state) { return !this.is(state); },

		isIn: function () {

			var state = this.state,
				args = Array.prototype.slice.call(arguments);

			return args.some(function (s) {

				return s === state;

			});

		},

		isNotIn: function () {

			return !(this.isIn.apply(this, arguments));

		}

	};

}(Ω));
(function (Ω) {

	"use strict";

	var rays = {

		cast: function (angle, originX, originY, map) {

			angle %= Math.PI * 2;
			if (angle < 0) angle += Math.PI * 2;

			var twoPi = Math.PI * 2,
				ox = originX / map.sheet.w,
				oy = originY / map.sheet.h,
				right = angle > twoPi * 0.75 || angle < twoPi * 0.25,
				up = angle > Math.PI,
				sin = Math.sin(angle),
				cos = Math.cos(angle),
				dist = null,
				distVertical = 0,
				distX,
				distY,
				xHit = 0,
				yHit = 0,
				cell = 0,
				wallX,
				wallY,

				slope = sin / cos,
				dx = right ? 1 :  -1,
				dy = dx * slope,

				x = right ? Math.ceil(ox) : Math.floor(ox),
				y = oy + (x - ox) * slope;

			while (x >= 0 && x < map.cellW && y >=0 && y < map.cellH) {

				wallX = Math.floor(x + (right ? 0 : -1));
				wallY = Math.floor(y);

				cell = map.cells[wallY][wallX];
				if (cell > 0) {
					distX = x - ox;
					distY = y - oy;
					dist = Math.sqrt(distX * distX + distY * distY);

					xHit = x;
					yHit = y;
					break;
				}
				x += dx;
				y += dy;
			}

			// Check vertical walls
			slope = cos / sin;
			dy = up ? -1 : 1;
			dx = dy * slope;
			y = up ? Math.floor(oy) : Math.ceil(oy);
			x = ox + (y - oy) * slope;

			while (x >= 0 && x < map.cellW && y >=0 && y < map.cellH) {

				wallY = Math.floor(y + (up ? -1 : 0));
				wallX = Math.floor(x);

				cell = wallY < 0 ? null : map.cells[wallY][wallX];
				if (cell) {
					distX = x - ox;
					distY = y - oy;
					distVertical = Math.sqrt(distX * distX + distY * distY);
					if (dist === null || distVertical < dist) {
						dist = distVertical;
						xHit = x;
						yHit = y;
					}
					break;
				}
				x += dx;
				y += dy;
			}

			if (dist) {
				return {
					x: xHit,
					y: yHit
				}
			} else {
				return null;
			}

		},

		draw: function (gfx, ox, oy, rayX, rayY, map) {

			var c = gfx.ctx;

			c.strokeStyle = "rgba(100,0,0,0.2)";
			c.lineWidth = 0.5;

			c.beginPath();
			c.moveTo(ox, oy);
			c.lineTo(rayX * map.sheet.w, rayY * map.sheet.h);
			c.closePath();
			c.stroke();

		}

	}

	Ω.rays = rays;

}(Ω));
(function (Ω) {

	"use strict";

	var Timer = Ω.Class.extend({

		init: function (time, cb, done) {

			Ω.timers.add(this);

			this.time = time;
			if (!done) {
				done = cb;
				cb = null
			}
			this.max = time;
			this.cb = cb;
			this.done = done;

		},

		tick: function () {

			this.time -= 1;

			if (this.time < 0) {
				this.done && this.done();
				return false;
			}
			this.cb && this.cb(1 - (this.time / this.max));

			return true;
		}

	});

	Ω.timer = function (time, cb, done) {
		return new Timer(time, cb, done);
	};

}(Ω));
(function (Ω) {

	"use strict";

	var images = {};

	var gfx = {

		init: function (ctx) {

			this.ctx = ctx;
			this.canvas = ctx.canvas;

			this.w = this.canvas.width;
			this.h = this.canvas.height;

		},

		loadImage: function (path, cb) {

			var cachedImage = images[path];

			if (cachedImage) {
				if (!cachedImage._loaded) {
					cachedImage.addEventListener("load", function() {
						cb && cb(cachedImage);
					}, false);
					cachedImage.addEventListener("error", function() {
						console.log("error loading image");
						cb && cb(cachedImage);
					}, false);
				} else {
					cb && cb(cachedImage);
				}
				return;
			}

			var resolve = Ω.preload(path),
				image = new Image(),
				onload = function () {

					this._loaded = true;
					cb && cb(image);
					resolve();

				}

			image._loaded = false;
			image.src = path;
			image.addEventListener("load", onload, false);
			image.addEventListener("error", function() {

				console.error("Error loading image", path);
				onload.call(this);

			}, false);
			images[path] = image;

		},

		drawImage: function (img, x, y) {

			this.ctx.drawImage(
				img,
				x,
				y);
		},

		createCanvas: function (w, h) {
			var cn = document.createElement("canvas");
			cn.setAttribute("width", w);
			cn.setAttribute("height", h);
			return cn.getContext("2d");
		},


		loadShaders: function(ctx, vsid, fsid) {
		    var parse = function(shader) {
		            var code = "",
		                current = shader.firstChild;
		            while(current) {
		                if(current.nodeType == current.TEXT_NODE)
		                    code += current.textContent;
		                current = current.nextSibling;
		            }
		            return code;
		        },
		        fShaderEl = document.getElementById(fsid),
		        vShaderEl = document.getElementById(vsid),
		        fShader, vShader, shaderProgram,
		        c = ctx;
		    if(!fShaderEl || !vShaderEl) {
		        alert("Error, Could Not Find Shaders");
		        return;
		    }

		    //Load and Compile Fragment Shader
		    fShader = c.createShader(c.FRAGMENT_SHADER);
		    c.shaderSource(fShader, parse(fShaderEl));
		    c.compileShader(fShader);

		    //Load and Compile Vertex Shader
		    vShader = c.createShader(c.VERTEX_SHADER);
		    c.shaderSource(vShader, parse(vShaderEl));
		    c.compileShader(vShader);

		    //Create The Shader Program
		    shaderProgram = c.createProgram();
		    c.attachShader(shaderProgram, fShader);
		    c.attachShader(shaderProgram, vShader);
		    c.linkProgram(shaderProgram);
		    c.useProgram(shaderProgram);

		    return shaderProgram;
		},
		text: {

			drawShadowed: function (msg, x, y, shadow, font) {

				var c = gfx.ctx;

				shadow = shadow || 2;
				if (font) {
					c.font = font;
				}
				c.fillStyle = "#000";
				c.fillText(msg, x + shadow, y + shadow);
				c.fillStyle = "#fff";
				c.fillText(msg, x, y);

			},


			getWidth: function (msg) {

				return gfx.ctx.measureText(msg).width;

			},

			getHalfWidth: function (msg) {

				return this.getWidth(msg) / 2;

			},

			getHeight: function (msg) {

				return gfx.ctx.measureText(msg).height;

			},

			getHalfHeight: function (msg) {

				return this.getHeight(msg) / 2;

			}

		}

	};

	Ω.gfx = gfx;

}(Ω));
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

		buf: [],

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
			if (isDown) {
				keys[code].downTime = Date.now();
				input.buf.push(code);
				input.buf = input.buf.slice(-10);
			}
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
(function (Ω) {

	"use strict";

	var Image = Ω.Class.extend({

		init: function (path) {

			var self = this;

			this.path = path;

			Ω.gfx.loadImage(path, function (img){

				self.img = img;

			});

		},

		render: function (gfx, x, y) {

			gfx.ctx.drawImage(
				this.img,
				x,
				y
			);

		}

	});

	Ω.Image = Image;

}(Ω));
(function (Ω) {

	"use strict";

	var sounds = {},
		Sound;

	Sound = Ω.Class.extend({

		ext: document.createElement('audio').canPlayType('audio/mpeg;') === "" ? ".ogg" : ".mp3",

		init: function (path, volume, loop) {

			var audio,
				resolve,
				onload;

			if (!sounds[path]) {
				audio = new window.Audio();
				resolve = Ω.preload(path);
				onload = function () {
					// Check if already loaded, 'cause Firefox fires twice
					if (this._loaded) {
						return;
					}
					this._loaded = true;
					resolve();
				};

				audio.src = path.indexOf(".") > 0 ? path : path + this.ext;

				audio._loaded = false;

				// Fixme: crazyies in firefox... fires twice?
				audio.addEventListener("canplaythrough", onload, false);

				audio.addEventListener("error", function () {
					console.error("Error loading audio resource:", audio.src);
					onload.call(this);
				});
				audio.load();

				sounds[path] = audio;
			}

			audio = sounds[path];
			audio.volume = volume || 1;
			audio._volume = audio.volume;
			audio.loop = loop;

			this.audio = audio;

		},

		rewind: function () {
			this.audio.pause();
			try{
	        	this.audio.currentTime = 0;
	    	} catch(err){
	        	//console.log(err);
	    	}

		},

		play: function () {

			this.rewind();
			this.audio.play();
		},

		stop: function () {

			this.audio.pause();

		}

	});

	Sound._reset = function () {

		var path,
			sound;

		// Should check for canplaythrough before doing anything...
		for (path in sounds) {
			sound = sounds[path];
			if (!sound._loaded) continue;
			sound.pause();
			try {
				sound.currentTime = 0;
			} catch (err) {
				console.log("err");
			}
		}
	};

	Sound._setVolume = function (v) {

		for (var path in sounds) {
			sounds[path].pause();
			try {
				sounds[path].volume = sounds[path]._volume * v;
			} catch (err) {
				console.log("err");
			}
		}

	};

	Ω.Sound = Sound;

}(Ω));
(function (Ω) {

	"use strict";

	var Camera = Ω.Class.extend({

		x: 0,
		y: 0,
		w: 0,
		h: 0,
		debug: false,

		init: function (x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.zoom = 1;
		},

		tick: function () {},

		render: function (gfx, renderables) {
			var c = gfx.ctx,
				self = this,
				minX = this.x,
				minY = this.y,
				maxX = this.x + this.w,
				maxY = this.y + this.h;

			c.save();
			c.translate(-this.x, -this.y);
			c.scale(this.zoom, this.zoom);

			renderables
				// Flatten to an array
				.reduce(function (ac, e) {

					if (Array.isArray(e)) {
						return ac.concat(e);
					}
					ac.push(e);
					return ac;

				}, [])
				// Remove out-of-view entites
				.filter(function (r) {

					return !(
						r.x + r.w < self.x ||
						r.y + r.h < self.y ||
						r.x > self.x + self.w ||
						r.y > self.y + self.h);

				})
				// Draw 'em
				.forEach(function (r) {

					r.render(gfx, self);

				});

			c.restore();

		}

	});

	Ω.Camera = Camera;

}(Ω));
(function (Ω) {

	"use strict";

	var TrackingCamera = Ω.Camera.extend({

		x: 0,
		y: 0,
		w: 0,
		h: 0,
		xRange: 40,
		yRange: 30,

		init: function (entity, x, y, w, h) {

			this.w = w;
			this.h = h;
			this.zoom = 1;

			this.track(entity);

		},

		track: function (entity) {

			this.entity = entity;
			this.x = entity.x - (Ω.env.w / 2) + (entity.w / 2);

			/// TODO: block to bottom/right as well
			if (this.x < 0) {
				this.x = 0;
			}
			this.y = entity.y - (Ω.env.h / 2);
			if (this.y < 0) {
				this.y = 0;
			}

		},

		tick: function () {

			var center = Ω.utils.center(this),
				e = this.entity,
				xr = this.xRange,
				yr = this.yRange,
				newX,
				newY;


			/// TODO: block to bottom/right as well
			if(e.x < center.x - xr) {
				this.x = e.x - (Ω.env.w / 2) + xr;
				if (this.x < 0) {
					this.x = 0;
				}
			}
			if(e.x + e.w > center.x + xr) {
				this.x = e.x + e.w - (Ω.env.w / 2) - xr;
			}
			if(e.y < center.y - yr) {
				this.y = e.y - (Ω.env.h / 2) + yr;
				if (this.y < 0) {
					this.y = 0;
				}
			}
			if(e.y + e.h > center.y + yr) {
				this.y = e.y + e.h - (Ω.env.h / 2) - yr;
			}

		},

		render: function (gfx, renderables) {

			if (!this.debug) {
				this._super(gfx, renderables);
				return;
			}

			this._super(gfx, renderables.concat([{
				render: function (gfx, cam) {

					var center = Ω.utils.center(cam);

					gfx.ctx.strokeStyle = "rgba(200, 0, 0, 0.6)";
					gfx.ctx.strokeRect(
						center.x - cam.xRange,
						center.y - cam.yRange,
						cam.xRange * 2,
						cam.yRange * 2);

				}
			}]));

		}

	});

	Ω.TrackingCamera = TrackingCamera;

}(Ω));
(function (Ω) {

	"use strict";

	var Physics = {

		checkCollision: function (entity, entities, cbName) {

			var i,
				j,
				a = entity,
				b,
				ax,
				bx,
				cbName = cbName || "hit",
				len = entities.length;


			for (i = 0; i < len; i++) {

				b = entities[i];

				ax = a.x + (a.xbb || 0);
				bx = b.x + (b.xbb || 0);

				if (ax + a.w - 1 > bx &&
				    ax < bx + b.w - 1 &&
				    a.y + a.h - 1 > b.y &&
				    a.y < b.y + b.h - 1) {
					a[cbName] && a[cbName](b);
					b[cbName] && b[cbName](a);
				}
			}

		},

		checkCollisions: function (entities, cbName) {

			var i,
				j,
				a,
				b,
				cbName = cbName || "hit",
				all = entities.reduce(function (ac, e) {
					if (Array.isArray(e)) {
						return ac.concat(e);
					}
					ac.push(e);
					return ac;

				}, []),
				len = all.length;

			for (i = 0; i < len - 1; i++) {
				a = all[i];
				for (j = i + 1; j < len; j++) {
					b = all[j];

					if (a.x + a.w >= b.x &&
					    a.x <= b.x + b.w &&
					    a.y + a.h >= b.y &&
					    a.y <= b.y + b.h) {
						a[cbName] && a[cbName](b);
						b[cbName] && b[cbName](a);
					}
				}
			}
		}

	};

	Ω.Physics = Physics;

}(Ω));
(function (Ω) {

	"use strict";

	var Particle = Ω.Class.extend({

		particles: null,
		running: false,

		init: function (opts, cb) {

			this.maxLife = opts.life || 40;
			this.life = this.maxLife;
			this.cb = cb;
			this.col = opts.col || "100, 0, 0";

			this.particles = [];
			for(var i = 0; i < 20; i++) {
				this.particles.push(
					new Part({col: this.col}, this)
				);
			}

		},

		play: function (x, y) {

			this.life = this.maxLife;
			this.x = x;
			this.y = y;
			this.running = true;
			this.particles.forEach(function (p) {
				p.reset();
			});

		},

		tick: function () {

			if (!this.running) {
				return;
			}

			this.life -= 1;

			this.particles.forEach(function (p) {
				p.tick();
			});

			if (this.life < 0) {
				this.running = false;
				this.cb && this.cb();
			}

		},

		render: function (gfx) {

			var self = this;

			if (!this.running) {
				return;
			}

			this.particles.forEach(function (p) {
				p.render(gfx, self.x, self.y);
			});

		}

	});

	function Part (opts, parent) {
		this.parent = parent;
		this.x = 0;
		this.y = 0;
		this.w = 4;
		this.h = 4;
		this.col = opts.col;
		this.xSpeed = Math.random() * 2 - 1;
		this.ySpeed = Math.random() * 2 - 1 - 1;
	}
	Part.prototype = {

		reset: function () {
			this.life = this.parent.maxLife;
			this.x = 0;
			this.y = 0;
			this.xSpeed = Math.random() * 2 - 1;
			this.ySpeed = Math.random() * 2 - 1 - 3;
		},

		tick: function () {
			this.x += this.xSpeed;
			this.y += this.ySpeed;
			this.ySpeed += 0.2;
		},

		render: function (gfx, x, y) {

			var c = gfx.ctx;

			c.fillStyle = "rgba(" + this.col + ", " + (0.3 + this.parent.life / this.parent.maxLife) + ")";
			c.fillRect(this.x + x, this.y + y, this.w, this.h);

		}

	};

	Ω.Particle = Particle;

}(Ω));
(function (Ω) {

	"use strict";

	var Spring = Ω.Class.extend({

		vel: [0, 0],

		init: function (length, strength, friction, gravity) {

			this.springLength = length;
			this.spring = strength;
			this.friction = friction;
			this.gravity = gravity;

		},

		tick: function (fixed, springer) {

			var dx = springer.x - fixed.x,
				dy = springer.y - fixed.y,
				angle = Math.atan2(dy, dx),
				tx = fixed.x + Math.cos(angle) * this.springLength,
				ty = fixed.y + Math.sin(angle) * this.springLength;

			this.vel[0] += (tx - springer.x) * this.spring;
			this.vel[1] += (ty - springer.y) * this.spring;

			this.vel[0] *= this.friction;
			this.vel[1] *= this.friction;

			this.vel[1] += this.gravity;

			return this.vel;

		},

		reset: function () {

			this.vel = [0, 0];


		}

	});

	window.Spring = Spring;

}(Ω));
(function (Ω) {

	"use strict";

	var Shake = Ω.Class.extend({

		init: function (time) {

			this.time = time || 10;

		},

		tick: function () {

			return this.time--;

		},

		render: function (gfx, x, y) {

			gfx.ctx.translate(Math.random() * 8, Math.random() * 4);

		}

	});

	Ω.Shake = Shake;

}(Ω));
(function (Ω) {

	"use strict";

	var Screen = Ω.Class.extend({

		loaded: true,

		tick: function () {},

		render: function (gfx) {

			var c = gfx.ctx;

			c.fillStyle = "hsl(0, 0%, 0%)";
			c.fillRect(0, 0, gfx.w, gfx.h);

		}

	});

	Ω.Screen = Screen;

}(Ω));
(function (Ω) {

	"use strict";

	var Dialog = Ω.Class.extend({

		killKey: "escape",

		tick: function () {

			if (Ω.input.pressed(this.killKey)) {
				Ω.input.release(this.killKey);
				this.done();
			}

		},

		done: function () {

			game.clearDialog();

		},

		render: function (gfx) {

			var c = gfx.ctx;

			c.fillStyle = "rgba(0, 0, 0, 0.7)";
			c.fillRect(gfx.w * 0.15, gfx.h * 0.25, gfx.w * 0.7, gfx.h * 0.5);

		}

	});

	Ω.Dialog = Dialog;

}(Ω));
(function (Ω) {

	"use strict";

	var SpriteSheet = Ω.Class.extend({

		init: function (path, width, height) {

			this.path = path;
			this.w = width;
			this.h = height || width;
			this.cellW = 8;
			this.cellH = 2;

			var self = this;

			Ω.gfx.loadImage(path, function (img) {

				self.sheet = img;
				self.cellW = img.width / self.w | 0;
				self.cellH = img.height / self.h | 0;

			});

		},

		render: function (gfx, col, row, x, y, w, h, scale) {
			if(col === -1) {
				return;
			}
			scale = scale || 1;
			h = h || 1;
			w = w || 1;

			gfx.ctx.drawImage(
				this.sheet,
				col * this.w,
				row * this.h,
				w * this.w,
				h * this.h,
				x,
				y,
				w * this.w * scale,
				h * this.h * scale);
		}

	});

	Ω.SpriteSheet = SpriteSheet;

}(Ω));
(function (Ω) {

	"use strict";

	var Anims = Ω.Class.extend({

		current: null,
		all: null,

		init: function (anims) {

			if (anims.length) {
				this.all = anims;
				this.current = anims[0];
			}

		},

		tick: function () {

			this.current.tick();

		},

		add: function (anim) {

			if (!this.all) {
				this.all = [];
				this.current = anim;
			}
			this.all.push(anim);

		},

		get: function () {

			return this.current.name;

		},

		set: function (animName) {

			var anim = this.all.filter(function (anim) {
				return anim.name === animName;
			});

			if (anim.length) {
				this.current = anim[0];
				this.current.reset();
			}

		},

		setTo: function (animName) {

			if (this.get() !== animName) {
				this.set(animName);
			}

		},

		changed: function () {

			return this.current.changed;

		},

		render: function (gfx, x, y) {

			this.current.render(gfx, x, y);

		}

	});


	Ω.Anims = Anims;

}(Ω));(function (Ω) {

	"use strict";

	var Anim = Ω.Class.extend({

		init: function (name, sheet, speed, frames) {

			this.name = name;
			this.sheet = sheet;
			this.frames = frames;
			this.speed = speed;

			this.changed = false;

			this.reset();

		},

		tick: function () {

			var diff = Date.now() - this.frameTime;
			this.changed = false;

			if (diff > this.speed) {
				this.frameTime = Date.now() + (Math.min(this.speed, diff - this.speed));
				if (++this.curFrame > this.frames.length - 1) {
					this.curFrame = 0;
				};
				this.changed = true;
			};

		},

		reset: function () {
			this.curFrame = 0;
			this.frameTime = Date.now();
		},

		render: function (gfx, x, y) {

			this.sheet.render(
				gfx,
				this.frames[this.curFrame][0],
				this.frames[this.curFrame][1],
				x,
				y,
				1,
				1,
				1);

		}

	});

	Ω.Anim = Anim;

}(Ω));
(function (Ω) {

	"use strict";

	var Map = Ω.Class.extend({

		x: 0, // Position required for camera rendering check
		y: 0,

		init: function (sheet, data) {

			this.sheet = sheet;
			this.cells = data;
			this.cellH = this.cells.length;
			this.cellW = this.cells[0].length;
			this.h = this.cellH * this.sheet.h;
			this.w = this.cellW * this.sheet.w;

		},

		render: function (gfx, camera) {

			if (!camera) {
				camera = {
					x: 0,
					y: 0,
					w: gfx.w,
					h: gfx.h,
					zoom: 1
				}
			}

			var tw = this.sheet.w,
				th = this.sheet.h,
				cellW = this.sheet.cellW,
				cellH = this.sheet.cellH,
				stx = camera.x / tw | 0,
				sty = camera.y / th | 0,
				endx = stx + (camera.w / camera.zoom / tw | 0) + 1,
				endy = sty + (camera.h / camera.zoom / th | 0) + 1,
				j,
				i,
				cell;

			for (j = sty; j <= endy; j++) {
				if (j < 0 || j > this.cellH - 1) {
					continue;
				}
				for (i = stx; i <= endx; i++) {
					if (i > this.cellW - 1) {
						continue;
					}

					cell = this.cells[j][i];
					if (cell === 0) {
						continue;
					}
					this.sheet.render(
						gfx,
						(cell - 1) % cellW  | 0,
						(cell - 1) / cellW | 0,
						i * tw,
						j * th);
				}
			}

		},

		getBlock: function (block) {

			var row = block[1] / this.sheet.h | 0,
				col = block[0] / this.sheet.w | 0;

			if (row < 0 || row > this.cellH - 1) {
				return;
			}

			return this.cells[row][col];

		},

		getBlocks: function (blocks) {

			var self = this;

			return blocks.map(function (b, i) {

				var row = b[1] / self.sheet.h | 0,
					col = b[0] / self.sheet.w | 0;

				if (row < 0 || row > self.cellH - 1) {
					return;
				}

				return self.cells[row][col];
			});

		},

		getBlockEdge: function(pos, vertical) {

			var snapTo = vertical ? this.sheet.h : this.sheet.w;

		    return Ω.utils.snap(pos, snapTo);

		},

		setBlock: function (pos, block) {

			var row = pos[1] / this.sheet.h | 0,
				col = pos[0] / this.sheet.w | 0;

			if (row < 0 || row > this.cellH - 1) {
				return;
			}

			this.cells[row][col] = block;

		}

	});

	Ω.Map = Map;

}(Ω));
(function (Ω) {

	"use strict";

	var IsoMap = Ω.Map.extend({

		init: function (sheet, data) {

			this._super(sheet, data);

		},

		render: function (gfx, camera) {

			var tw = this.sheet.w,
				th = this.sheet.h / 2,
				stx = camera.x / tw | 0,
				sty = camera.y / th | 0,
				endx = stx + (camera.w / camera.zoom / tw | 0) + 1,
				endy = sty + (camera.h / 0.25 / camera.zoom / th | 0) + 1,
				j,
				i,
				tileX,
				tileY,
				cell;

			for (j = sty; j <= endy; j++) {
				if (j < 0 || j > this.cellH - 1) {
					continue;
				}
				for (i = stx; i <= endx; i++) {
					if (i > this.cellW - 1) {
						continue;
					}
					cell = this.cells[j][i];
					if (cell === 0) {
						continue;
					}

					tileX = (i - j) * th;
					tileX += ((gfx.w / 2) / camera.zoom) - (tw / 2);
					tileY = (i + j) * (th / 2);

					this.sheet.render(
						gfx,
						cell - 1,
						0,
						tileX,
						tileY);
				}
			}

		}

	});

	Ω.IsoMap = IsoMap;

}(Ω));
(function (Ω) {

	"use strict";

	/* WIP: map for doing Wolf3D style games */

	var RayCastMap = Ω.Map.extend({

		init: function (sheet, data, entity) {

			this.entity = entity;

			this._super(sheet, data);

		},

		castRays: function (gfx) {

			var idx = 0,
				i,
				rayPos,
				rayDist,
				rayAngle,
				fov = 60 * Math.PI / 180,
				viewDistance = (gfx.w / 2) / Math.tan((fov / 2)),
				numRays = 15,
				w = 16;

			/*for (var i = 0; i < numRays; i++) {
				rayPos = (-numRays / 2 + i) * w;
				rayDist = Math.sqrt(rayPos * rayPos + viewDistance * viewDistance);
				rayAngle = Math.asin(rayPos / rayDist);

				this.castRay(gfx, Math.PI + rayAngle, idx++);
			}*/
			var p = this.entity;
			for (var i = 0; i < Math.PI * 2; i+= 0.2) {
				var hit = Ω.rays.cast(i, p.x + p.w / 2, p.y + p.h / 2, this);

				if (hit) {
					Ω.rays.draw(gfx, p.x + p.w / 2, p.y + p.h / 2, hit.x, hit.y, this);
				}
			}

		},

		render: function (gfx, camera) {

			// TODO: raycast texture draw
			this._super(gfx, camera);

			this.castRays(gfx);

		}

	});

	Ω.RayCastMap = RayCastMap;

}(Ω));
(function (Ω) {

	"use strict";

	var Entity = Ω.Class.extend({

		x: 0,
		y: 0,
		w: 32,
		h: 32,

		xbb: 0,

		falling: false,
		wasFalling: false,

		init: function () {

		},

		tick: function () {},

		hit: function (entity) {},

		hitBlocks: function(xBlocks, yBlocks) {},

		move: function (x, y, map) {

			// Temp holder for movement
			var xo,
				yo,

				xv,
				yv,

				hitX = false,
				hitY = false,

				xBlocks,
				yBlocks,

				walkables = map.walkables || [0],

				has = function (arr, block) {
					return arr.indexOf(block) > -1;
				},
				isWalkable = function(blocks) {
					return blocks.some(function(b){
						return b === undefined || has(walkables, b);
					});
				}

			if (this.falling) {
				y += Math.max(0.5, this.speed / 3);
				x = 0;
			}
			xo = x;
			yo = y;

			xv = this.x + xo;
			yv = this.y + yo;

			// check blocks given vertical movement TL, BL, TR, BR
			yBlocks = map.getBlocks([
				[this.x, yv],
				[this.x, yv + (this.h - 1)],
				[this.x + (this.w - 1), yv],
				[this.x + (this.w - 1), yv + (this.h - 1)]
			]);

			// if overlapping edges, move back a little
			if (y < 0 && !isWalkable([yBlocks[0], yBlocks[2]])) {
				yo = map.getBlockEdge(this.y, "VERT") - this.y;
				hitY = true;
			}
			if (y > 0 && !isWalkable([yBlocks[1], yBlocks[3]])) {
				yo = map.getBlockEdge(yv + (this.h - 1), "VERT") - this.y - this.h;
				hitY = true;
				this.falling = false;
			}

			// Now check blocks given horizontal movement TL, BL, TR, BR
			xBlocks = map.getBlocks([
				[xv, this.y],
				[xv, this.y + (this.h - 1)],
				[xv + (this.w - 1), this.y],
				[xv + (this.w - 1), this.y + (this.h - 1)]
			]);

			// if overlapping edges, move back a little
			if (x < 0 && !isWalkable([xBlocks[0], xBlocks[1]])) {
				xo = map.getBlockEdge(this.x) - this.x;
				hitX = true;
			}
			if (x > 0 && !isWalkable([xBlocks[2], xBlocks[3]])) {
				xo = map.getBlockEdge(xv + (this.w - 1)) - this.x - this.w;
				hitX = true;
			}

			if (hitX || hitY) {
				this.hitBlocks(hitX ? xBlocks : [], hitY ? yBlocks : []);
			}

			// Add the allowed movement
			this.x += xo;
			this.y += yo;

			return [xo, yo];
		},

		render: function (gfx) {}

	});

	Ω.Entity = Entity;

}(Ω));
(function (Ω) {

	"use strict";

	var Game = Ω.Class.extend({

		canvas: "body",

		running: false,

		preset_dt: 1 / 60,
		currentTime: Date.now(),
		accumulator: 0,

		screen: new Ω.Screen(),
		_screenPrev: null,
		_screenFade: 0,
		dialog: null,

		init: function (w, h, bgColor) {

			var ctx = initCanvas(this.canvas, w, h),
				self = this;

			Ω.env.w = ctx.canvas.width;
			Ω.env.h = ctx.canvas.height;

			// ctx.fillStyle = bgColor || "#333";
			// ctx.fillRect(0, 0, Ω.env.w, Ω.env.h);

			Ω.gfx.init(ctx);
			Ω.input.init(ctx.canvas);

			// Fixme: thing preloading can be done before it gets here!
			Ω.evt.onload.push(function () {
				self.load();
				self.run(Date.now());
			});

			window.addEventListener("load", function () {
				Ω.pageLoad();
			}, false);

            this.running = true;

		},

		reset: function () {},

		load: function () {},

		run: function () {

            var self = this,
            	now = Date.now(),
                frameTime = Math.min((now - this.currentTime) / 1000, this.preset_dt),
                c;

            this.currentTime = now;
            this.accumulator += frameTime;

            if (this.running) {
                c = 0;
                while (this.accumulator >= this.preset_dt) {
                    c++;
                    this.tick();
                    this.accumulator -= this.preset_dt;
                }
                if (c > 1) {
                    console.log("ran " + c + " ticks");
                }

                this.render();
            }

            window.requestAnimationFrame(function () {
                self.run(Date.now());
            });

		},

		stop: function () {},

		tick: function () {

			if (this.dialog) {
				this.dialog.tick();
			} else {
				this.screen.loaded && this.screen.tick();
				Ω.timers.tick();
			}
			Ω.input.tick();

		},

		render: function (gfx) {

			gfx = gfx || Ω.gfx;

			if (!this.screen.loaded) {
				return;
			}

			this.screen.render(gfx);
			if (this.screenFade > 0) {
				gfx.ctx.globalAlpha = this.screenFade;
				this.screenPrev.render(gfx);
				gfx.ctx.globalAlpha = 1;
			}
			this.dialog && this.dialog.render(gfx);

		},

		setScreen: function (screen) {

			var self = this;

			this.screenPrev = this.screen;
			this.screen = screen;

			if (this.screenPrev) {
			    this.screenFade = 1;
			    Ω.timer(10, function (ratio) {

			        self.screenFade = 1 - ratio;

			    }, function () {

			        self.screenFade = 0;

			    });
			}

		},

		setDialog: function (dialog) {

			this.dialog = dialog;

		},

		clearDialog: function () {

			this.setDialog(null);

		}
	});

	/*
		Create or assign the canvas element
	*/
	function initCanvas(canvasSelector, w, h) {

		w = w || 400;
		h = h || 225;

		var selCanvas = document.querySelector(canvasSelector),
			newCanvas,
			ctx;

		if (selCanvas == null) {
			console.error("Canvas DOM container not found:", canvasSelector);
			canvasSelector = "body";
			selCanvas = document.querySelector(canvasSelector);
		}

		if (selCanvas.nodeName.toUpperCase() === "CANVAS") {
			var explicitWidth = selCanvas.getAttribute("width"),
				explicitHeight = selCanvas.getAttribute("height");

			if (explicitWidth === null) {
				selCanvas.setAttribute("width", w);
			}
			if (explicitHeight === null) {
				selCanvas.setAttribute("height", h);
			}
			ctx = selCanvas.getContext("2d");
		} else {
			newCanvas = document.createElement("canvas");
			newCanvas.setAttribute("width", w);
			newCanvas.setAttribute("height", h);
			selCanvas.appendChild(newCanvas);
			ctx = newCanvas.getContext("2d");
		}
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;

		if (!ctx) {
			console.error("Could not get 2D context.");
		}

		return ctx;
	}

	Ω.Game = Game;

}(Ω));
