(function (Ω) {

	"use strict";

	var Portal = Machine.extend({

		w: 32,
		h: 32,

		sheet: new Ω.SpriteSheet("res/tiles.png", 16),
		font: new Font("res/mamefont.png", 16, 16),

		unlock: false,

		init: function (level, x, y, unlock) {

			this.name = "portal";
			this.level = level;
			this.x = x;
			this.y = y;
			this.unlock = unlock;

		},

		tick: function () {

			return !this.remove;

		},

		hitMachine: function (w) {

			w.hitPortal(this);

		},

		render: function (gfx) {

			var c = gfx.ctx;

			var xoff = 0;
			if (Math.random() < 0.05) {
				xoff -= 2;
			}

			this.sheet.render(gfx, 32 + xoff, 2, this.x, this.y);
			this.sheet.render(gfx, 33 + xoff, 2, this.x + 16, this.y);
			this.sheet.render(gfx, 32 + xoff, 3, this.x, this.y + 16);
			this.sheet.render(gfx, 33 + xoff, 3, this.x + 16, this.y + 16);

			if (this.unlock > 0) {

                this.font.write(gfx, this.unlock.toString(), this.x + 9, this.y + 9);
            } else {

                c.fillStyle = "hsl(" + (Math.random() * 360 | 0) + ",50%, 50%)";
               	c.fillRect(this.x + 4, this.y + 4, this.w - 8, this.h - 8);

                if (this.level.levelOverTime !== -1) {
                	var t = (this.level.levelOverTime / 10 | 0).toString();
                    this.font.write(gfx, t, this.x + (t.length == 2 ? 1 : 9), this.y + 9);
                }

            }


		}

	});

	window.Portal = Portal;

}(Ω));
