(function () {

	"use strict";

	var Writer = Ω.Class.extend({

		init: function (font, x, y, text, speed, xcol, ycol) {

			this.font = font;
			this.x = x;
			this.y = y;

			this.text = text;
			this.speed = speed;

			this.xcol = xcol;
			this.ycol = ycol;

			this.curr = 0;
			this.charTime = speed;
			this.printed = "";

			this.done = false;

		},

		tick: function () {

			if (!this.done && --this.charTime === 0) {

				this.charTime = this.speed;
				var next = this.text[this.curr];
				if (next !== "*") {
					this.printed += next;
				} else {
					this.printed = this.printed.slice(0,-1);
				}

				if(++this.curr >= this.text.length) {
					this.done = true;
					return false;
				}

			}

			return true;

		},

		render: function(gfx) {

			this.font.write(gfx, this.printed, this.x, this.y, this.xcol, this.ycol);

		}

	});

	window.Writer = Writer;
}());