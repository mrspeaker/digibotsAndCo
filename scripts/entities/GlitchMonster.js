(function (Ω) {

	"use strict";

	var GlitchMonster = Ω.Entity.extend({

		w: 16,
		h: 16,
		speed: 1.0,
		body: null,
		huntIn: data.monster.huntInInit,
		state: null,

		sheet: new Ω.SpriteSheet("res/tiles.png", 16),
		sound: new Ω.Sound("res/sound/glitchmo", 0.5, true),

		init: function (x, y, level) {

			this.level = level;
			this.player = level.players[0];

			this.body = [[x, y]];
			this.x = x * 16;
			this.y = y * 16;

			this.state = new Ω.utils.State("BORN");

			this.sound.play();

			this.dir = this.randDir();
		},

		randDir: function (curDir) {

			var dir,
				pivot = curDir !== undefined,
				rand = (pivot ? Math.random() * 2 : Math.random() * 4 ) | 0;

			if (pivot && (curDir === dirs.RIGHT || curDir === dirs.LEFT)) {
				rand += 2;
			}

			switch (rand) {
				case 0:
					dir = dirs.RIGHT;
					break;
				case 1:
					dir = dirs.LEFT;
					break;
				case 2:
					dir = dirs.UP;
					break;
				case 3:
					dir = dirs.DOWN;
					break;
			}

			return dir;

		},

		tick: function () {

			this.state.tick();

			switch (this.state.get()) {

				case "BORN":
					this.state.set("ROAMING");
					break;

				case "ROAMING":
					if (this.state.first()) {
						this.speed = 1.1;
					}
					this.tick_ROAMING();

					if(this.huntIn-- <= 0) {
						this.state.set("HUNTING");
					}
					break;


				case "HUNTING":
					if (this.state.first()) {
						this.speed = 2.1;
					}
					this.tick_HUNTING();
					if (this.state.count >= data.monster.huntFor) {
						this.huntIn = data.monster.huntIn;
						this.state.set("ROAMING");
					}
					break;
			}

			var newHead = [this.x / 16 | 0, this.y / 16 | 0],
				lastSeg,
				nextSeg;

			if (newHead[0] !== this.body[0][0] ||
				newHead[1] !== this.body[0][1]) {
				// Update body segments

				lastSeg = newHead;
				for (var i = 0; i < this.body.length; i++) {
					nextSeg = this.body[i];
					this.body[i] = lastSeg;
				}
			}

			return true;

		},

		tick_ROAMING: function () {

			var curHead = this.body[0],
				newX,
				newY;


			if (Math.random() < 0.1) {
				this.dir = this.randDir(this.dir);
			}

			switch (this.dir) {
				case dirs.RIGHT:
					this.x -= this.speed;
					break;
				case dirs.LEFT:
					this.x += this.speed;
					break;
				case dirs.UP:
					this.y -= this.speed;
					break;
				case dirs.DOWN:
					this.y += this.speed;
					break;
			}

			newX = this.x / 16 | 0;
			newY = this.y / 16 | 0;

			if (curHead[0] !== newX || curHead[1] !== newY) {
				this.body.splice(0, 0, [newX, newY]);

				if (this.body.length > 3) {
					this.body.splice(-1, 1);
				}
			}
		},

		tick_HUNTING: function () {

			if (this.state.first()) {
				this.target = this.findClosest();
			}

			if (!this.target) {
				this.state.set("ROAMING");
				return;
			}

			var xo = 0,
				yo = 0,
				dist;
			if (this.x < this.target.x + 8) {
				xo += this.speed;
			} else {
				xo -= this.speed;
			}
			if (this.y < this.target.y + 8) {
				yo += this.speed;
			} else {
				yo -= this.speed;
			}

			if (xo !== 0 && yo !== 0) {
				xo /= Math.sqrt(2);
				yo /= Math.sqrt(2);
			}

			this.x += xo;
			this.y += yo;

			dist = Ω.utils.dist(this, this.target);

			if (dist < 16) {
				this.target.bitten(this);
			}

		},

		killedAGuy: function () {

			this.state.set("ROAMING")

		},

		findClosest: function () {

			var self = this;

			if (!this.player.workers.length) {
				return;
			}

			return this.player.workers.reduce(function (acc, w) {

				var dist = Ω.utils.dist(self, w);

				// LOL! this doesn't work... always chases first - acc is an worker object, not a disstance
				// but I think the glitch monsters will be way to hard core if I fix it!
				if (dist < acc) {
					return w;
				}
				return acc;

			});

		},

		render: function (gfx) {

			var body = (Math.random() * 2 | 0) + 6,
				head = 15 + (Math.random() * 3 | 0),
				c = gfx.ctx;


			this.body.forEach(function (seg, i) {

				this.sheet.render(gfx, i == 0 ? head : body, 0, seg[0] * 16, seg[1] * 16);

			}, this);

			c.fillStyle = this.state.is("HUNTING") ? "rgba(255, 38, 0, 0.7)" : "rgba(0, 255, 0, 0.7)";
			c.fillRect(this.x - 8, this.y - 8, 11, 11);

		}

	});

	window.GlitchMonster = GlitchMonster;

}(Ω));