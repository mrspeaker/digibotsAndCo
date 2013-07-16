(function (Ω) {

	"use strict";

	var Popup = Ω.Class.extend({

		init: function (msg, font, time, x, y) {

			this.name = "popup";

			this.font = font;
			this.time = time;
			this.msg = msg;
			this.x = x;
			this.y = y;

		},

		tick: function () {

			if (--this.time < 0) {
				return false;
			}

			return true;

		},

		render: function (gfx) {

			this.font.write(gfx, this.msg, this.x, this.y);

		}

	});

	window.Popup = Popup;

}(Ω));
