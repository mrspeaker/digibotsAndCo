(function (Ω) {

	"use strict";

	var Key = Ω.Entity.extend({

		w: 16,
		h: 16,

		speed: 2.0,

		sheet: new Ω.SpriteSheet("res/tiles.png", 16),

		remove: false,

		init: function (x, y, level) {

			this.level = level;
			this.player = level.players[0];

			this.x = x;
			this.y = y - 16;

		},

		tick: function () {

			return !this.remove;

		},

		hitKey: function (k) {

			this.remove = true;

		},

		render: function (gfx) {

			var c = gfx.ctx,
				ticker = Date.now() / 600,
				rad = 4,
				offset = (Date.now() / 100 | 0) % 10 < 9;

			this.sheet.render(
				gfx,
				34,
				offset ? 0 : 1,
				this.x + (Math.cos(ticker) * rad),
				this.y + (Math.sin(ticker) * (rad / 2)));

		}

	});

	window.Key = Key;

}(Ω));
