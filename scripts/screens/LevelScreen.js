(function (Ω) {

	"use strict";

	var LevelScreen = Ω.Screen.extend({

		time: 0,

		init: function (level) {

			this.levelId = level - 1;
			this.nextLevel();

		},

		nextLevel: function () {

			if (++this.levelId > data.levels.length - 1) {
				game.setScreen(new EndScreen());
				return;
			}

			this.level = new Level(this, data.levels[this.levelId], game.players);

		},

		repeatLevel: function () {

			this.level = new Level(this, data.levels[this.levelId], game.players);

		},

		tick: function () {

			this.time += 1;

			if (Ω.input.pressed("escape") && this.time > 20) {
				game.setDialog(new PauseDialog(this.level.font));
			}

			this.level.tick();

		},

		render: function (gfx) {

			var c = gfx.ctx;

			c.globalAlpha = 0.35;
			c.fillStyle = "#000";
			c.fillRect(0, 0, gfx.w, gfx.h);
			c.globalAlpha = 1;

			this.level.render(gfx);

		}

	});

	window.LevelScreen = LevelScreen;

}(Ω));
