(function (Ω) {

	"use strict";

	var HiScoreScreen = Ω.Screen.extend({

		time: 0,

		font: new Font("res/mamefont.png", 16, 16),

		init: function () {

			this.writer = new Writer(this.font, 16 * 3, 16, data.lang.get("champs"), 2, 1);

		},

		tick: function () {

			this.writer.tick();

			this.time += 1;

			if (Ω.input.pressed("draw") && this.time > 20) {
				game.setScreen(new IntroScreen());
			}

			if (this.time > data.cuts.hiScoreLength) {
				game.setScreen(new TitleScreen());
			}

		},

		render: function (gfx) {

			var c = gfx.ctx,
				pos = " 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th,10th".split(",");

			c.fillStyle = "#000";
			c.fillRect(0, 0, gfx.w, gfx.h);

			this.writer.render(gfx);

			if (this.time > 2 * 20) {
				this.font.write(gfx, "rank  name  score", 6 * 16, 5 * 16);
			}

			game.hiscores.slice(0, 10).forEach(function (s, i) {
				if (this.time > (i + 4) * 20) {
					this.font.write(
						gfx,
						pos[i] + "  " + (s[0] + "   ").slice(0,3) + "   " + s[1],
						6 * 16,
						(8 + i * 2) * 16,
						i < 3 ? 1 : 0);
				}
			}, this);

		}

	});

	window.HiScoreScreen = HiScoreScreen;

}(Ω));
