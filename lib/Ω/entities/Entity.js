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

			// Now check blocks given horizontal movement
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
