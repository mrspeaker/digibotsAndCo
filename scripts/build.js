(function () {

    "use strict";

    var data = {
        points: {
            coin: 50,
            portalOpen: 230,
            workerOut: 120,
            timeBonus: 1000,
            keyBonus: 300,
            workerBonus: 300
        },

        cuts: {
            titleLength: 650,
            hiScoreLength: 650
        },

        monster: {

            huntInInit: 260,
            huntIn: 180,
            huntFor: 150

        },

        levels: [
            "intro/getready",
            "intro/getready2",
            "intro/getready3",
            "intro/getready4",
            "intro/getready5",

            "simple/simple1",
            "level03",
            "simple/ladders",
            "simple/elevatorsAndTeleports",
            "switcha",
            "crazy/elevatorsAndTeleports2",

            "simple/zigUp",
            "crazy/spikesGalore"
        ],

        lang: {
            get: function (key) {

                var out = this[key][game.locale];
                return out || this[key]["en"];

            },
            title: {
                en: "do*igibi*ots & co.",
                fr: "do*igibi*ots & co."
            },
            "keys-nav": {
                en: inArcadeCabinet ? "joystick:.move" : "arrow keys:.move",
                fr: "les cle: bouger"
            },
            "keys-build": {
                en: inArcadeCabinet ? "button 1:.build" : "space bar:.build",
                fr: "space: construire"
            },
            "keys-erase": {
                en: inArcadeCabinet ? "button 2:.erase" : "x key:.erase",
                fr: "x: effacer"
            },
            "keys-both": {
                en: inArcadeCabinet ? "both:.fast!" : "space & x:.fast!",
                fr: "le deux: vite!"
            },
            "get-ready": {
                en: "get ready",
                fr: "pret"
            },
            "champs": {
                en: "employees of the month"
            }
        }
    };

    window.data = data;
}());
(function () {

	var dirs = {
		"UP": 0,
		"DOWN": 1,
		"LEFT": 2,
		"RIGHT": 3,
		swap: function (dir) {
			var op;
			switch (dir) {
				case dirs.UP: op = dirs.DOWN; break;
				case dirs.DOWN: op = dirs.UP; break;
				case dirs.LEFT: op = dirs.RIGHT; break;
				case dirs.RIGHT: op = dirs.LEFT; break;
			}
			return op;
		}
	};

	window.dirs = dirs;

}());
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
}());(function (Ω) {

	"use strict";

	var Font = Ω.Class.extend({

		init: function (path, w, h) {

			this.w = w;
			this.h = h;

			this.sheet = new Ω.SpriteSheet(path, w, h);

		},

		write: function (gfx, msg, x, y, xo, yo) {

			if (msg === undefined) {
				msg = "";
				console.error("Hey, tried to write:", msg, x, y, xo, yo);
			}

			msg = msg.toString();

			var cellW = this.sheet.cellW / 2,
				cellH = this.sheet.cellH / 2,
				xo = (xo || 0) * cellW,
				yo = (yo || 0) * cellH;

			for (var i = 0; i < msg.length; i++) {

				// Can set special char to change color!
				// if(msg.charCodeAt(i) % 2 === 1) {
				// 	xo = 1 * cellW;
				// } else {
				// 	xo = 0;
				// }

				// errrrrm.... wat? wat is this special phooey?
				var ch = msg.charCodeAt(i),
					special = [32, 46, 44, 58, 33, 63, 39, 34, -1, 91, 93],
					sindex = special.indexOf(ch),
					off = sindex >= 0 ? 36 + sindex : ch > 96 && ch < 123 ? ch - 97 : ch - 22,
					off2 = ch === 38 ? 44 : off, // Make my ampersand!
					xCell = off2 % cellW,
					yCell = off2 / cellW | 0;

				this.sheet.render(gfx, xo + xCell, yo + yCell, x + (i * this.w), y);

			}

		}

	});

	window.Font = Font;

}(Ω));
(function () {

    "use strict";

    var walkables,
        blocks;

    blocks = {
        "BLANK": 0,
        "LADDER": 70,
        "LADDER_BASE": 68,
        "COIN": 35,
        "ROCK": 41,
        "LIMESTONE": 42,
        "PLATFORM": 38,
        "STAIR_L": 40,
        "STAIR_R": 39,
        "DIRT": 37,
        "SWITCH_L": 73,
        "SWITCH_R": 72,
        "NOBUILD": 43,
        "NOBUILD_SOLID": 44,

        has: function(block, types) {

            if (!Array.isArray(types)) {
                types = [types];
            }
            return types.indexOf(block) >= 0;

        },

        allHave: function (blocks, types) {

            var self = this;

            return blocks.every(function (b) {

                return self.has(b, types);

            });

        },

        anyHave: function (blocks, types) {

            var self = this;

            return blocks.some(function (b) {

                return self.has(b, types);

            });

        },

        areWalkable: function(blocks) {

            return this.allHave(blocks, walkables);

        },

        isLadder: function (cell) {

            return cell === blocks.LADDER ||
                cell === blocks.LADDER_BASE;
        }
    };

    // Fixme: walkables also defined in Levle.js
    walkables = [blocks.BLANK, blocks.LADDER, blocks.NOBUILD];

    window.blocks = blocks;
    window.walkables = walkables;
}());(function (Ω, blocks, dirs) {

    "use strict";

    var Workman = Ω.Entity.extend({

        w: 16,
        h: 16,

        dir: dirs.LEFT,
        lastDir: null,

        speed: 0,
        normalSpeed: 1,
        workingSpeed: 0.2,
        crazySpeed: 3.9,

        restTime: 500,

        state: null,
        frame: 0,

        particles: null,

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),

        sounds: {
            climb: new Ω.Sound("res/sound/climb", 0.07, true),
            ouchDead: new Ω.Sound("res/sound/ouch5", 1, false),
            ouch1: new Ω.Sound("res/sound/ouch1", 0.9, false),
            ouch2: new Ω.Sound("res/sound/ouch2", 0.9, false),
            ouch3: new Ω.Sound("res/sound/ouch3", 0.9, false),
            ouch4: new Ω.Sound("res/sound/ouch4", 0.9, false)
        },

        lastCell: null,

        onLadder: false,
        wasOnLadder: false,

        health: 100,

        remove: false,

        init: function (x, y, direction, boss) {

            this.falling = false;

            this.dir = direction === "left" ? dirs.LEFT : dirs.RIGHT;
            this.lastDir = this.dir;

            this.x = x * this.h;
            this.y = y * this.w;

            this.boss = boss;
            this.level = this.boss.level;
            this.maps = this.level.maps;

            this.xTile = x / 16 | 0;
            this.yTile = (this.y + this.h / 2) / 16 | 0;

            this.speed = this.normalSpeed;

            this.particle = new Ω.Particle({col: "41, 251, 204"});

            this.state = new Ω.utils.State("BORN");

        },

        tick: function () {

            this.frame++;

            var self = this,
                xy = {x: 0, y: 0},

                xTile = this.xTile,
                yTile = this.yTile,

                addVelocity = function (xy) {

                    switch (self.dir) {
                    case dirs.UP:
                        if (self.falling) {
                            console.error(self.state, "falling upwards!");
                        }
                        xy.y -= self.speed;
                        break;
                    case dirs.DOWN:
                        xy.y += self.speed;
                        break;
                    case dirs.LEFT:
                        xy.x -= self.speed;
                        break;
                    case dirs.RIGHT:
                        xy.x += self.speed;
                        break;
                    }

                    return xy;
                };

            this.wasFalling = this.falling;

            this.state.tick();
            this.particle.tick();

            switch (this.state.get()) {

            case "BORN":
                this.state.set("SPAWNING");
                break;

            case "SPAWNING":
                if (this.state.count > 50) {
                    this.state.set("ROAMING");
                }
                break;

            case "ROAMING":
                this.maps.fore.cells[yTile][xTile] = blocks.BLANK;
                this.maps.clear.cells[yTile][xTile] = 1;

                if (this.state.first()) {
                    this.dir = this.lastDir !== null ? this.lastDir : (Math.random() < 0.5 ? dirs.RIGHT : dirs.LEFT);
                    //this.speed = this.normalSpeed;
                }

                xy = this.movingTick(xy);
                xy = addVelocity(xy);

                break;

            case "CLIMBING":

                xy = addVelocity(xy);
                xy = this.movingTick(xy);

                break;

            case "ELEVATING":

                break;

            case "DEAD":
                if (this.state.first()) {
                    this.state.locked = true;
                    this.particle = new Ω.Particle({col: "255, 38, 0"});
                    this.particle.play(this.x + (this.w / 2), this.y + 10);
                    this.sounds["ouchDead"].play();
                }
                if (this.state.count > 50) {
                    this.boss.lostAWorker(this);
                    this.remove = true;
                }
                break;
            }

            switch (this.state.get()) {
            case "ROAMING":
            case "CLIMBING":
                this.move(xy.x, xy.y, this.maps.back);
                break;
            default:
                this.x += xy.x;
                this.y += xy.y;
            }

            // Wrap
            if (this.x > this.level.w - 1) {
                // Is first block walkable?
                if(blocks.areWalkable(this.maps.back.getBlocks([[0, this.y]]))) {
                    this.x = 0;
                } else {
                    // Nope... bounce left
                    this.dir = dirs.LEFT;
                    this.x -= 1;
                }
            }
            if (this.x < 0) {
                // Is last block walkable?
                if(blocks.areWalkable(this.maps.back.getBlocks([[this.level.w - 1, this.y]]))) {
                    this.x = this.level.w - this.w / 2;
                } else {
                    // Nope... bounce right
                    this.dir = dirs.RIGHT;
                    this.x = 0;
                }
            }


            // Set the tile for next frame
            this.xTile = this.x / 16 | 0;
            this.yTile = (this.y + this.h / 2) / 16 | 0;

            if (this.yTile >= this.level.cellH) {
                this.yTile = 0;
                this.y = 0;
            }

            return !this.remove;

        },

        movingTick: function (xy) {

            this.wasOnLadder = this.onLadder;
            var wasFalling = this.falling;

            // This is getting bottom blocks UNDER foot (not in current tile)
            // FIXME: refactor this shizzzz
            /* Warning: crunch time code ahead!!!! */

            /*
                notes...

                when falling xy.y is 0 (when climbing, it's -speed)

            */

            var bb = this.maps.back.getBlocks([
                    /*
                        Check TL, BL, TR, BR
                        using new y pos - but not x
                        think this is an error.
                    */
                    [this.x, this.y + xy.y],
                    [this.x, this.y + this.h + xy.y],
                    [this.x + this.w - 1, this.y + xy.y],
                    [this.x + this.w - 1, this.y + this.h + xy.y],

                    /*
                        Check center of worker
                        Current - next frame y, current frame x ?!!!
                    */
                    [this.x + this.w / 2, this.y + xy.y],
                    [this.x + this.w / 2, this.y + this.h + xy.y],
                ]),

                onLadderBothTop = blocks.allHave([bb[0], bb[2]], blocks.LADDER),
                blockedOnTop = !blocks.areWalkable([bb[0], bb[2]]),
                platformOnTop = blocks.anyHave([bb[0], bb[2]], blocks.PLATFORM),
                ladderBelowEitherFoot = blocks.anyHave([bb[1], bb[3]], blocks.LADDER),
                centerOnLadder = blocks.anyHave([bb[4]], blocks.LADDER),
                ladderBelowCenter = blocks.anyHave([bb[5]], blocks.LADDER),
                feetOnStairL = blocks.anyHave([bb[1], bb[3]], blocks.STAIR_L),
                feetOnStairR = blocks.anyHave([bb[1], bb[3]], blocks.STAIR_R),
                diff;

            if (!this.onLadder && centerOnLadder) {
                this.onLadder = true;
                this.falling = false;
                this.lastDir = this.dir;
                this.dir = dirs.UP;
                this.state.set("CLIMBING");

                // Snap to ladder
                diff = this.x - Ω.utils.snap(this.x - this.speed, 16);

                if (diff < this.w / 2) {
                    diff = -diff;
                } else {
                    diff = this.w - diff;
                }
                xy.x += diff;

                this.sounds.climb.play();
            }

            if (this.wasOnLadder && !onLadderBothTop) {

                // area to top block
                diff = this.y - Ω.utils.snap(this.y, 16) -  this.speed;

                if (blockedOnTop && platformOnTop) {

                    // Check above the platform...
                    var ch = this.maps.back.getBlocks([
                        [this.x + this.w/2, this.y + xy.y + this.h - diff - 32 - 1]
                    ]);

                    if (blocks.areWalkable([ch[0]])) {
                        // Can go above!
                        xy.y -= 32;
                        this.state.set("ROAMING");
                        this.onLadder = false;
                    }

                } else if (!blockedOnTop) {
                    // Snap to top of ladder
                    this.state.set("ROAMING");
                    this.onLadder = false;
                    diff = this.y - Ω.utils.snap(this.y, 16) -  this.speed;
                    xy.y -= diff;
                } else {
                    this.sounds.climb.stop();

                    // ladder to blocksville was removed
                    if (!centerOnLadder) {
                        this.state.set("ROAMING");
                        this.onLadder = false;
                    }

                    // See if we can escape left or right
                    // FIXME: HOLY CRAP REFACTO!!!!!
                    var lr = this.maps.back.getBlocks([
                        [this.x - 16, this.y],
                        [this.x + 16, this.y]
                    ]);

                    if (this.lastDir === dirs.LEFT) {
                        if(blocks.areWalkable([lr[0]])) {
                            this.state.set("ROAMING");
                            this.onLadder = false;
                            xy.x -= 16;
                        } else if (blocks.areWalkable([lr[1]])) {
                            this.dir = dirs.RIGHT;
                            this.lastDir = dirs.RIGHT;
                            this.state.set("ROAMING");
                            this.onLadder = false;
                            xy.x += 16;
                        }
                    } else if (this.lastDir === dirs.RIGHT) {
                        if (blocks.areWalkable([lr[1]])) {
                            this.state.set("ROAMING");
                            this.onLadder = false;
                            xy.x += 16;
                        } else if (blocks.areWalkable([lr[0]])) {
                            this.dir = dirs.LEFT;
                            this.lastDir = dirs.LEFT;
                            this.state.set("ROAMING");
                            this.onLadder = false;
                            xy.x -= 16;
                        }
                    }

                }

            }

            if (this.falling) {
                if (ladderBelowEitherFoot) {
                    this.falling = false;
                }
            }
            else {

                if (!this.onLadder && !ladderBelowCenter) {

                    if (!(feetOnStairL || feetOnStairR) && blocks.areWalkable([bb[5]])) {

                        // Snap to hole
                        diff = this.x - Ω.utils.snap(this.x - this.speed, 16);
                        if (diff < this.w / 2) {
                            diff = -diff;
                        } else {
                            diff = this.w - diff;
                        }
                        xy.x += diff;

                        // HACK! Entity sets X offset to 0 when falling
                        // so we have to do it ourselves!
                        this.x += xy.x;
                        xy.x = 0;

                        //this.dir = this.lastDir;

                        this.falling = true;
                    }

                }
            }

            if (this.wasOnLadder && !this.onLadder) {
                this.sounds.climb.stop();
            }

            return xy;

        },

        hitBlocks: function(xb, yb) {

            var self = this,
                all = xb.concat(yb),
                walkables = this.maps.back.walkables;

            if (xb.length) {
                if (walkables.indexOf(xb[0]) === -1 && this.dir === dirs.LEFT) {
                    if (xb[0] === blocks.STAIR_R) {
                        this.y -= 16;
                        this.x -= 1;
                    } else {
                        this.dir = dirs.RIGHT;
                    }
                }
                if (walkables.indexOf(xb[2]) === -1 && this.dir === dirs.RIGHT) {
                    if (xb[2] === blocks.STAIR_L) {
                        this.y -= 16;
                        this.x += 1;
                    } else {
                        this.dir = dirs.LEFT;
                    }
                }
            }

        },

        hitMachine: function (m) { },

        hitKey: function (k) {

            this.level.gotPortalToken(this.boss);

        },

        hitPortal: function (p) {

            if (p.unlock <= 0) {
                this.level.workerOut(this);
            }

        },

        kill: function () {

            this.state.set("DEAD");

        },


        bitten: function (by) {

            if (this.state.is("DEAD")) {
                return;
            }

            this.health -= 1;

            if (this.health <= 0) {
                by.killedAGuy();
                this.kill();
            } else {
                if (!this.particle.running) {
                    this.particle.play(this.x + (this.w / 2), this.y + 10);
                    this.sounds["ouch" + ((Math.random() * 4 | 0) + 1)].play();
                }
            }

        },

        render: function (gfx) {

            var frame = 0;

            switch (this.state.get()) {
            case "BORN":
                frame = -1;
                break;
            case "SPAWNING":
                frame = this.state.count % 9;
                break;
            case "ELEVATING":
                frame = 0;
                break;
            case "DEAD":
                frame = -1;
                break;
            default:
                frame = (Date.now() / 100 | 0) % 2;
                // Three frame animation
                // if (this.dir === dirs.LEFT) {
                //     frame = (((Date.now() / 100) % 3) | 0) + 13;
                // }
                // if (this.dir === dirs.RIGHT) {
                //     frame = (((Date.now() / 100) % 3) | 0) + 10;
                // }
                // if (this.dir === dirs.UP) {
                //     frame += 8;
                // }
                break;
            }

            if (frame >= 0) {
                if (this.falling) {
                    frame = ((Date.now() / 100 | 0) % 2) + 4;
                }

                this.sheet.render(gfx, frame, 3, this.x, this.y);

                if (game.shhmode) {
                    var moff = ((Date.now() / 300 | 0) % 2) * 2;
                    this.sheet.render(gfx, 18, 2, this.x - 9, this.y - moff);
                    this.sheet.render(gfx, 19, 2, this.x + 7, this.y - moff);

                    this.sheet.render(gfx, 16, 2, this.x - 8, this.y - 32);
                    this.sheet.render(gfx, 17, 2, this.x + 8, this.y - 32);
                    this.sheet.render(gfx, 16, 3, this.x - 8, this.y - 16);
                    this.sheet.render(gfx, 17, 3, this.x + 8, this.y - 16);
                }
            }

            this.particle.render(gfx);

        }

    });

    window.Workman = Workman;

}(Ω, blocks, dirs));
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

}(Ω));(function (Ω) {

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
(function (Ω) {

    "use strict";

    var Machine = Ω.Entity.extend({

        w: 16,
        h: 16,

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),

        hitMachine: function () {},

        wireItUp: function () {},

        tick: function () {

            return true;

        },

        render: function (gfx) {}

    });

    window.Machine = Machine;

}(Ω));(function (Ω, Machine) {

    "use strict";

    var Switch = Machine.extend({

        switchedTime: Date.now(),

        sound: new Ω.Sound("res/sound/clickswitch", 0.5, false),

        init: function (level, x, y, state, targetName) {

            this.level = level;
            this.x = x;
            this.y = y;
            this.state = state;
            this.targetName = targetName;
            this.target = null;

        },

        hitMachine: function (by) {

            if (Date.now() - this.switchedTime > 1000) {

                this.state = !this.state;
                this.switchedTime = Date.now();

                this.target && this.target.triggered(this.state);

                this.sound.play();

            }

            return this.state;

        },

        wireItUp: function () {

            this.target = this.level.getMachineByName(this.targetName);

        },

        render: function (gfx) {

            var block = this.state ? blocks.SWITCH_R : blocks.SWITCH_L;

            this.sheet.render(gfx, block % 36 | 0, block / 36 | 0, this.x, this.y);

        }

    });

    window.Switch = Switch;

}(Ω, Machine));(function (Ω, Machine) {

    "use strict";

    var Door = Machine.extend({

        sound: new Ω.Sound("res/sound/doorclose", 0.7, false),

        init: function (name, level, direction, x, y) {

            this.level = level;
            this.name = name;
            this.dir = [dirs.UP, dirs.DOWN, dirs.LEFT, dirs.RIGHT][["up", "down", "left", "right"].indexOf(direction)],
            this.x = x;
            this.y = y;
            this.ox = x;
            this.oy = y;
            this.open = false;

            this.openX = this.dir === dirs.RIGHT ? x - 16 : this.dir === dirs.LEFT ? x + 16 : x;
            this.openY = this.dir === dirs.UP ? y - 16 : this.dir === dirs.DOWN ? y + 16 : y;

            this.oldOpenTile = this.level.maps.back.cells[this.openY / 16 | 0][(this.openX) / 16 | 0];
            this.level.maps.back.cells[this.y / 16 | 0][(this.x) / 16 | 0] = blocks.NOBUILD_SOLID;

            this.state = new Ω.utils.State("OPEN");

        },

        triggered: function (state) {

            this.sound.play();

            this.open = state;

            if (!this.open) {
                this.level.maps.back.cells[this.oy / 16 | 0][(this.ox) / 16 | 0] = blocks.NOBUILD_SOLID;
                this.level.maps.back.cells[this.openY / 16 | 0][(this.openX) / 16 | 0] = this.oldOpenTile;
            } else {
                this.level.maps.back.cells[this.oy / 16 | 0][(this.ox) / 16 | 0] = blocks.NOBUILD;
                this.level.maps.back.cells[this.openY / 16 | 0][(this.openX) / 16 | 0] = blocks.NOBUILD_SOLID;
            }

            if (!this.open) {
                this.x = this.ox;
                this.y = this.oy;
            } else {
                if (this.dir === dirs.UP) {
                    this.y = this.oy - this.h;
                }
                if (this.dir === dirs.DOWN) {
                    this.y = this.oy + this.h;
                }
                if (this.dir === dirs.RIGHT) {
                    this.x = this.ox + this.w;
                }
                if (this.dir === dirs.RIGHT) {
                    this.x = this.ox - this.w;
                }
            }

        },

        hitMachine: function (w) {

            return; // hitMachine never hit when changing background tiles.
            if (this.dir === dirs.UP || this.dir === dirs.DOWN) {
                if (w.dir === dirs.LEFT) {
                    w.x = this.x + 16;
                    w.dir = dirs.RIGHT;
                } else {
                    if (w.dir === dirs.RIGHT) {
                        w.x = this.x + 16;
                        w.dir = dirs.LEFT;
                    }
                }
            } else {
                if (this.y - w.y > 4) {
                    w.y = this.y - 16;
                    w.falling = false;
                } else {
                    w.y = this.y + 16;
                }
            }



        },

        tick: function () {

            return true;

        },

        render: function (gfx) {

            var block = blocks.SWITCH_L + 1;

            this.sheet.render(gfx, block % 36 | 0, block / 36 | 0, this.x, this.y);

        }

    });

    window.Door = Door;

}(Ω, Machine));(function (Ω, Machine) {

    "use strict";

    var Elevator = Machine.extend({

        workers: null,

        h:  2,
        w: 2,
        xbb: 7,

        //sound: new Ω.Sound("res/sound/elevator", 0.07, false),

        init: function (level, name, x, y, speed, top, bottom) {

            this.level = level;
            this.x = x;
            this.y = y;
            this.oy = y + 16;


            this.bottom = bottom || 0;
            this.top = (top || 5) + 1;
            this.otop = this.top;

            this.speed = speed || 50;

            this.workers = [];
            this.count = 0;
            this.sinOff = 0;

        },

        tick: function () {

            var bottom = this.bottom * 16,
                top = this.top * 16,
                amp = (top - bottom) / 2;

            this.lastSin = this.sinOff;
            this.sinOff = Math.sin(++this.count / this.speed) * amp;

            this.y = this.oy - bottom - amp + this.sinOff;


            // if (!(this.sinOff - this.lastSin < 0.5)) {

            //     this.sound.play();
            // }

            // FIXME: Don't need to do these checks every frame.

            // Check if there is a cell blocking the elevator
            var cell = this.level.maps.back.getBlock([this.x, this.y]);
            if (cell !== 0) {
                // Reset the top to the new value
                this.top = (this.oy - this.y) / 16 | 0;
                top = this.top * 16;
            }

            // Check if a cell has been cleared
            if (this.top !== this.otop) {
                cell = this.level.maps.back.getBlock([this.x, this.oy - top - 1]);
                if (cell === 0) {
                    this.top = this.otop;
                }
            }

            // Move the workers
            this.workers = this.workers.filter(function (w, i) {
                w.y = this.y - 16;
                if (this.sinOff < (- amp + 1)) {
                    w.state.set("ROAMING");
                    w.falling = true;

                    // Umm... why do i have to do that?
                    w.lastDir = w.dir;

                    // Shoot the first a lil, the rest up more
                    if (i == 0) {
                        //w.x = this.x + 16;
                        w.y -= 2;
                    } else {
                        w.y -= 10;
                    }
                    return false;
                }
                return true;
            }, this);

            return true;

        },

        hitMachine: function (by) {

            // Check if elevator is moving
            if (this.bottom === this.top) {
                return;
            }

            if (by.state.isNot("ELEVATING")) {

                // Only pick up if near bottom of curve
                if (this.sinOff - this.lastSin < 0.5) {
                    this.workers.push(by);
                    by.x = this.x;
                    by.falling = false;
                    by.state.set("ELEVATING");
                }

            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#999";
            c.fillRect(this.x + 7, this.oy, 2, this.y - this.oy);

            this.sheet.render(gfx, 8, 1, this.x, this.y);


        }

    });

    window.Elevator = Elevator;

}(Ω, Machine));
(function (Ω, Machine) {

    "use strict";

    var Spikes = Machine.extend({

        init: function (x, y) {

            this.x = x;
            this.y = y;

        },

        hitMachine: function (by) {

            by.kill(this);

        },

        render: function (gfx) {

            this.sheet.render(gfx, 5, 2, this.x, this.y);

        }

    });

    window.Spikes = Spikes;

}(Ω, Machine));(function (Ω, Machine) {

    "use strict";

    var Teleport = Machine.extend({

        sound: new Ω.Sound("res/sound/transport", 0.7, false),

        w: 2,
        xbb: 7,

        zap: 0,
        zapMax: 10,
        zapTarget: null,

        init: function (level, name, x, y, targetName) {

            this.level = level;
            this.name = name;
            this.targetName = targetName;
            this.x = x;
            this.y = y;

        },

        wireItUp: function () {

            if (this.targetName) {
                this.target = this.level.getMachineByName(this.targetName);
            }

        },

        triggered: function (state) {

        },

        hitMachine: function (w) {

            var frame = this.level.frame;

            if (this.target) {

                if (w.teleportedAt && frame - w.teleportedAt < 2) {
                    w.teleportedAt = frame;
                    return;
                }

                this.sound.play();
                w.x = this.target.x;
                w.y = this.target.y;

                this.zapTarget = [w.x + 8, w.y + 8];
                this.zap = this.zapMax;

                w.teleportedAt = frame;
            }

        },

        tick: function () {

            if (this.zap > 0) {
                if(--this.zap <= 0) {
                    this.zapTarget = null;
                }
            }

            return true;

        },

        render: function (gfx) {

            var c = gfx.ctx;

            if (this.zap > 0) {
                c.strokeStyle = "rgba(0, 255, 0, " + (1 - this.zap / this.zapMax) + ")";
                c.lineWidth = 4;
                c.beginPath();
                c.moveTo(this.x + 8, this.y + 8);
                c.lineTo(this.zapTarget[0], this.zapTarget[1]);
                c.stroke();
            }

            this.sheet.render(gfx, 3 + ((Date.now() / 200 % 2) | 0), 2, this.x, this.y);

        }

    });

    window.Teleport = Teleport;

}(Ω, Machine));(function (Ω) {

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
(function (Ω, blocks, dirs) {

    "use strict";

    var Player = Ω.Class.extend({

        score: 0,
        workers: null,
        escaped: 0,

        w: 24,
        h: 24,
        x: 0,
        y: 0,

        commandTypes: ["build", "destroy"],
        selectedType: 0,

        speedNormal: 2,
        speed: 2.4,
        vel: 0.5,

        drawBlockLast: [-1, -1],
        drawBlockLastType: null,

        fastMode: false,

        buildable: true,

        sounds: {
            build: new Ω.Sound("res/sound/build", 0.4, false),
            nope: new Ω.Sound("res/sound/nope", 0.2, false),
            fast: new Ω.Sound("res/sound/fast", 0.2, true)
        },

        init: function (level, data) {

            this.level = level;

            this.x = data.x;
            this.y = data.y;
            this.score = data.score;

            this.workers = [];
            this.escaped = 0;

            Ω.input.release("draw");

        },

        addWorker: function (worker) {

            this.workers.push(worker);

        },

        tick: function () {

            var maps = this.level.maps;

            this.handleInput();

            // Wrap cursor
            if (this.x < -8) {
                this.x = Ω.env.w;
            }
            if (this.x > Ω.env.w) {
                this.x = 0;
            }
            if (this.y < -8) {
                this.y = Ω.env.h;
            }
            if (this.y > Ω.env.h) {
                this.y = 0;
            }

            this.workers = this.workers.filter(function (w) {

                return w.tick();

            });

            var hoverCell = maps.back.getBlock([this.x + 9, this.y + 9]);
            if (blocks.has(hoverCell, this.level.unbuildables)) {
                this.buildable = false;
            } else {
                this.buildable = true;
            }

            maps.clear.setBlock([this.x + 9, this.y + 9], 1);
            maps.fore.setBlock([this.x + 9, this.y + 9], blocks.BLANK);

        },

        handleInput: function () {

            var moving = false,
                xo = 0,
                yo = 0;

            // Move
            if (Ω.input.isDown("up")) {
                yo -= this.speed;
                moving = true;
            }
            if (Ω.input.isDown("down")) {
                yo += this.speed;
                moving = true;
            }
            if (Ω.input.isDown("left")) {
                xo -= this.speed;
                moving = true;
            }
            if (Ω.input.isDown("right")) {
                xo += this.speed;
                moving = true;
            }

            if (xo !== 0 && yo !== 0) {
                xo /= Math.sqrt(2);
                yo /= Math.sqrt(2);
            }

            this.x += xo;
            this.y += yo;

            // Fixme: seems like bug when both buttons down
            // both do drawBlockLast

            if (Ω.input.isDown("draw") && Ω.input.isDown("erase")) {

                if (!this.fastMode) {

                    if (this.tmpCell && Date.now() - this.tmpCell.time < 200) {
                        this.level.maps.back.cells[this.tmpCell.y][this.tmpCell.x] = this.tmpCell.type;
                        this.tmpCell = null;
                    }

                    this.sounds.fast.play();

                    this.workers.forEach(function (w) {

                        w.speed = w.speed === w.crazySpeed ? w.normalSpeed : w.crazySpeed;

                    });

                    this.fastMode = true;

                }

            } else {

                if (this.fastMode) {

                    this.sounds.fast.stop();

                    this.workers.forEach(function (w) {

                        w.speed = w.speed === w.crazySpeed ? w.normalSpeed : w.crazySpeed;

                    });

                    this.fastMode = false;
                    Ω.input.release("draw");
                    Ω.input.release("erase");
                }


                // Only DRAW
                if (Ω.input.isDown("draw")) {

                    this.drawBlock();
                    this.drawStartPos = [this.x, this.y];

                } else if (Ω.input.released("draw")) {

                    this.drawBlockLast = [-1, -1];
                    this.drawBlockLastType = null;

                }

                // Only Erase
                if (Ω.input.isDown("erase")) {

                    this.drawBlock(true);
                    this.drawStartPos = [this.x, this.y];

                } else if (Ω.input.released("erase")) {

                    this.drawBlockLast = [-1, -1];
                    this.drawBlockLastType = null;

                }

            }

        },

        drawBlock: function (erase) {

            var xo = (this.x + 9) / 16 | 0,
                yo = (this.y + 9) / 16 | 0,
                cell = this.level.maps.back.getBlock([this.x + 9, this.y + 9]),
                lastCell = this.drawBlockLast,
                sameCellAsLast = xo === lastCell[0] && yo === lastCell[1],
                type,
                xMove,
                yMove;

            if (yo >= this.level.cellH) {
                return;
            }

            if (this.drawStartPos) {
                xMove = Math.abs(this.drawStartPos[0] - this.x);
                yMove = Math.abs(this.drawStartPos[1] - this.y);
            }

            if (sameCellAsLast) {
                // if (xmove == 0 && ymove == 0) {
                //  // Not moved
                //  return;
                // }
                // // if (xmove > ymove) {
                //  if (cell === blocks.LADDER) {

                //  }
                // }
                return;
            }
            this.drawBlockLast = [xo, yo];

            if (blocks.has(cell, this.level.unbuildables)) {
                this.sounds.nope.play();
                return;
            }

            // build or erase mode
            if (erase) {

                type = blocks.BLANK;

            } else {

                if (this.drawBlockLastType === null) {

                    this.fixALadder = null;

                    if (cell === blocks.BLANK) {
                        type = blocks.LADDER;
                    } else if (cell === blocks.LADDER) {
                        type = yo < this.level.equator ? blocks.PLATFORM : blocks.DIRT;
                        this.fixALadder = [xo, yo];
                    } else {
                        type = blocks.LADDER;
                    }

                    this.drawBlockLastType = type;

                } else {

                    if (this.drawBlockLastType === blocks.LADDER && (xMove > yMove)) {
                        type = yo < this.level.equator ? blocks.PLATFORM : blocks.DIRT;
                    } else if ((this.drawBlockLastType === blocks.PLATFORM || this.drawBlockLastType === blocks.DIRT) && (yMove > xMove)) {
                        if (this.fixALadder) {
                            this.level.maps.back.cells[this.fixALadder[1]][this.fixALadder[0]] = blocks.LADDER;
                            this.fixALadder = null;
                        }
                        type = blocks.LADDER;
                    } else {
                        type = this.drawBlockLastType;
                    }
                }

            }

            if (cell !== type) {
                this.sounds.build.play();
                var was = this.level.maps.back.cells[yo][xo];
                this.level.maps.back.cells[yo][xo] = type;
                this.tmpCell = {
                    time: Date.now(),
                    x: xo,
                    y: yo,
                    type: was
                }
            }

        },

        lostAWorker: function (w) {

            if (this.workers.length === 1) {
                if (this.escaped) {
                    // Some got out
                    this.level.levelOverCheck(w);
                } else {
                    // We just lost our last worker!
                    this.level.gameOver(this);
                }
            }

        },

        render: function (gfx) {

            this.workers.map(function (w) {

                w.render(gfx);

            });

        },

        renderCursor: function (gfx) {

            var c = gfx.ctx;

            c.lineWidth = 2;
            c.strokeStyle = this.buildable ? "rgb(255,255,255)" : "rgb(255, 38, 0)";

            c.strokeRect(this.x - 3, this.y - 2, this.w, this.h);

            c.fillStyle = "rgba(255,255,255,0.1)";
            c.fillRect(((this.x + 9) / 16 | 0) * 16, ((this.y + 9) / 16 | 0) * 16, 16, 16);

        }

    });

    window.Player = Player;

}(Ω, blocks, dirs));
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
(function (Ω) {

    "use strict";

    var HiScoreEntryScreen = Ω.Screen.extend({

        time: null,
        over: false,

        x: 7 * 16 - 5,
        y: 10 * 16 - 4,
        w: 16,
        h: 16,

        chars: "abcdefghijklmnopqrstuvwxyz0123456789.!?".split(""),
        charsPerLine: 8,
        charsXOff: 7 * 16,
        charsYOff: 10 * 16,

        backButton: {
            x: 19 * 16,
            y: 21 * 16,
            w: 16,
            h: 16
        },

        okButton: {
            x: 21 * 16,
            y: 21 * 16,
            w: 16,
            h: 16
        },

        speed: 2,
        name: "",

        font: new Font("res/mamefont.png", 16, 16),

        skip: false,

        init: function (score) {

            Ω.Sound._reset();

            this.score = score;
            var poss = " 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th,10th".split(",");

            if (!score || score < game.hiscores[9][1]) {
                this.skip = true;
                return;
            }

            var pos = 9;
            for (var i = 0; i < 9; i++) {
                if (score > game.hiscores[i][1]) {
                    pos = i;
                    break;
                }
            }

            this.pos = pos;
            this.posLabel = poss[pos];

            this.time = Date.now() + (35 * 1000);
            this.timeLeft = ((this.time - Date.now()) / 1000) | 0;

        },

        save: function () {

            game.hiscores.splice(this.pos, 0, [this.name, this.score]);

            Ω.utils.storage.set(
                game.hiScoreKey,
                JSON.stringify(game.hiscores.slice(0, 50))
            );

        },

        done: function () {

            game.reset();

        },

        tick: function () {

            if (this.skip) {
                this.done();
                return;
            }

            if (!this.over) {
                this.handleInput();
            }

            // Wrap cursor
            if (this.x < -8) {
                this.x = Ω.env.w;
            }
            if (this.x > Ω.env.w) {
                this.x = 0;
            }
            if (this.y < -8) {
                this.y = Ω.env.h;
            }
            if (this.y > Ω.env.h) {
                this.y = 0;
            }

            if (!this.over) {
                this.timeLeft = ((this.time - Date.now()) / 1000) | 0;

                if (this.timeLeft <= 0) {
                    this.over = 200;
                }
            } else {
                if (--this.over <= 0) {
                    this.hitOk();
                }
            }

        },

        handleInput: function() {
            // Move
            if (Ω.input.isDown("up")) {
                this.y -= this.speed;
            }
            if (Ω.input.isDown("down")) {
                this.y += this.speed;
            }
            if (Ω.input.isDown("left")) {
                this.x -= this.speed;
            }
            if (Ω.input.isDown("right")) {
                this.x += this.speed;
            }

            if (Ω.input.pressed("draw")) {

                var x = this.x - this.charsXOff + 8,
                    y = this.y - this.charsYOff + 8,
                    ch;

                Ω.Physics.checkCollision(this.backButton, [this], "hitBack");
                Ω.Physics.checkCollision(this.okButton, [this], "hitOk");

                if (x < 0 || x > this.charsPerLine * 32 + 4 ||
                    y < 0 || y > (this.chars.length / this.charsPerLine | 0) * 32 + 4) {
                    return;
                }

                var xpos = ((x + 4) / 16 | 0),
                    ypos = ((y + 4) / 16 | 0);

                if (xpos % 2 || ypos % 2) {
                    // Space
                } else {

                    ch = this.chars[
                        (xpos / 2) +
                        (ypos / 2) * this.charsPerLine
                    ];

                    if (this.name.length < 3) {
                        this.name += ch;
                    } else {
                        this.name = this.name.slice(0, 2) + ch;
                    }

                }


            }

        },

        hitBack: function () {

            this.name = this.name.slice(0, -1);

        },

        hitOk: function () {

            this.save();
            this.done();

        },


        render: function (gfx) {

            var c = gfx.ctx,
                flash = this.over ? ((Date.now() / 500 | 0) % 2 == 0 ? 1 : 0) : 1;

            if (this.skip) {
                return;
            }

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.font.write(gfx, data.lang.get("champs"), 32, 16, 0);

            this.font.write(gfx, this.posLabel, 6 * 16, 7 * 16, flash);
            this.font.write(gfx, this.score, ((6 - this.score.toString().length) + 16) * 16, 7 * 16, flash);

            var underlineOffset = 12 * 16;
            this.font.write(gfx, this.name, underlineOffset, 7 * 16, !this.over ? 0 : flash);


            if (!this.over) {
                c.strokeStyle = "#090";
                c.lineWidth = "2";

                for (var i = 0; i < 3; i++) {
                    c.beginPath();
                    c.moveTo(underlineOffset + (i * 16) + 1, 8 * 16 + 2);
                    c.lineTo(underlineOffset + (i * 16) + 14, 8 * 16 + 2)
                    c.stroke();
                }
            }

            this.font.write(gfx, "[" /* Backspace */, this.backButton.x, this.backButton.y);
            this.font.write(gfx, "]" /* Backspace */, this.okButton.x, this.okButton.y);

            this.chars.forEach(function (c, i) {
                this.font.write(
                    gfx,
                    c,
                    this.charsXOff + (i % this.charsPerLine | 0) * 32,
                    this.charsYOff + (i / this.charsPerLine | 0) * 32
                );
            }, this);

            if (!this.over) {

                this.font.write(gfx, this.timeLeft, 7 * 16, this.okButton.y, 1);

                c.strokeStyle = "#090";
                c.strokeRect(this.x - 1, this.y -1, 24, 24);
            }

        }

    });

    window.HiScoreEntryScreen = HiScoreEntryScreen;

}(Ω));
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
(function (Ω) {

    "use strict";

    var LevelClearScreen = Ω.Screen.extend({

        frame: 0,

        font: new Font("res/mamefont.png", 16, 16),
        sheet: new Ω.SpriteSheet("res/tiles.png", 16),
        sound: new Ω.Sound("res/sound/levelclear", 1, false),

        init: function (levelScreen, time, maxTime, goodTime, keys, maxKeys, workers, maxWorkers) {

            var multiplier;

            this.sound.play();

            this.time = Date.now();
            this.next = levelScreen;
            this.writer = new Writer(this.font, 7 * 16, 4 * 16, "data encrypted!", 5, 1);

            this.levelTime = time;
            this.maxTime = maxTime;
            this.goodTime = goodTime;

            if (this.levelTime >= this.maxTime) {
                multiplier = 0;
            } else if (this.levelTime < this.goodTime) {
                multiplier = 1;
            }
            else {
                multiplier = (this.maxTime - this.levelTime) / (this.maxTime - this.goodTime);
            }

            this.timeBonusColour = multiplier > 0.75 ? 1: 0;
            this.timeBonus = (data.points.timeBonus * multiplier) | 0;

            this.beforeScore = game.getScore();

            this.levelTimeDisplay = Ω.utils.formatTime(time < maxTime ? maxTime - time : 0);

            this.workers = workers;
            this.maxWorkers = maxWorkers;
            this.keys = keys;
            this.maxKeys = maxKeys;

            this.keyBonus = (data.points.keyBonus * (keys / maxKeys)) | 0;
            this.workerBonus = (data.points.workerBonus * (workers / maxWorkers)) | 0;

            this.totalBonus = this.keyBonus + this.workerBonus + this.timeBonus;
            this.totalDisplay = this.beforeScore;

            game.addScore(this.totalBonus);

        },

        done: function () {

        	game.setScreen(this.next);
        	this.next.nextLevel();

        },

        tick: function () {

            this.writer.tick();

            this.frame += 1;

            if (this.totalDisplay < this.beforeScore + this.totalBonus) {
                this.totalDisplay += 17;
                if (this.totalDisplay > this.beforeScore + this.totalBonus) {
                    this.totalDisplay = this.beforeScore + this.totalBonus;
                }
            }

            if (Ω.input.pressed("draw") && this.frame > 20) {
                this.done();
            }

            if (Date.now() - this.time > 30000) {
                this.done();
            }

        },

        render: function (gfx) {

            var c = gfx.ctx,
                xOff,
                xWidth,
                i;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.writer.render(gfx);

            xWidth = this.maxKeys;

            this.font.write(gfx, "keys recovered:", 3 * 16, 9 * 16);

            xOff = Ω.utils.snap(((30 - xWidth) / 2) * 16, 16);
            for (i = 0; i < this.maxKeys; i++) {
                var x = 35,
                    y = 1;

                if (i >= this.keys) {
                    x = 34;
                    y = 0;
                }
                this.sheet.render(gfx, x, y, xOff + (i * 16), 11 * 16);
            }

            this.font.write(gfx, "work related injuries:", 3 * 16, 13 * 16);

            xWidth = this.maxWorkers;
            xOff = Ω.utils.snap(((30 - xWidth) / 2) * 16, 16);
            for (i = 0; i < this.maxWorkers; i++) {
                var x = 6,
                    y = 2;

                if (i >= this.workers) {
                    x = 7;
                    y = 2;
                }
                this.sheet.render(gfx, x, y, xOff + (i * 16), 15 * 16);
            }

            this.font.write(gfx, "deadline bonus:", 3 * 16, 17 * 16);
            xWidth = (this.timeBonus + "").length;
            xOff = Ω.utils.snap(((30 - xWidth) / 2) * 16, 16);
            this.font.write(gfx, this.timeBonus, xOff, 19 * 16, this.timeBonusColour);

            xWidth = (this.totalDisplay + "").length;
            xOff = Ω.utils.snap(((30 - xWidth) / 2) * 16, 16);

            this.font.write(gfx, this.totalDisplay, xOff, 23 * 16);

            this.font.write(gfx, "job well done!", 8 * 16, 27 * 16, 1);

        }

    });

    window.LevelClearScreen = LevelClearScreen;

}(Ω));
(function (Ω, LevelScreen, HiScoreScreen, Font, Writer) {

    "use strict";

    var TitleScreen = Ω.Screen.extend({

        time: 0,

        font: new Font("res/mamefont.png", 16, 16),

        images: {
            truck: new Ω.Image("res/truck.png"),
            door: new Ω.Image("res/door.png"),
            truckOpen: new Ω.Image("res/truck-open.png")
        },

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),

        truckX: null,
        truckDoorX: 0,

        workers : null,

        init: function () {

            this.workers = [];

            this.truckX = 30 * 16;
            this.truckDoorX = this.truckX + 78;

            this.writer = new Writer(this.font, 8 * 16, 5 * 16, data.lang.get("title"), 5, 1);
            this.writer2 = new Writer(this.font, 8 * 16 - 2, 5 * 16 - 2, data.lang.get("title"), 5, 0);

        },

        tick: function () {

            this.writer.tick();
            this.writer2.tick();

            this.time += 1;
            if (this.truckX > 9 * 16) {
                this.truckX -= 5;
                this.truckDoorX -= 5;
            }

            if (this.time > 65 && this.time < 78) {
                this.truckDoorX += 2;
            }

            if (this.time > 70 && this.time % 35 === 10) {
                if (this.workers.length < 10)
                    this.workers.push(new w(this));
            }

            this.workers.forEach(function (w) {
                w.tick();
            });

            if (Ω.input.pressed("draw") && this.time > 20) {

                game.setScreen(new IntroScreen());

            }

            if (this.time > data.cuts.titleLength) {
                game.setScreen(new HiScoreScreen());
            }

        },

        render: function (gfx) {

            var c = gfx.ctx

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.images.truck.render(gfx, this.truckX, 10 * 16);
            this.images.door.render(gfx, this.truckDoorX, 10 * 16 + 14);

            this.workers.forEach(function (w) {
                w.render(gfx);
            });

            this.writer2.render(gfx);
            this.writer.render(gfx);

            this.font.write(gfx, data.lang.get("keys-nav").split(".")[0], 6 * 16, 20 * 16, 1);
            this.font.write(gfx, data.lang.get("keys-nav").split(".")[1], 18 * 16, 20 * 16, 0);

            this.font.write(gfx, data.lang.get("keys-build").split(".")[0], 6 * 16, 22 * 16, 1);
            this.font.write(gfx, data.lang.get("keys-build").split(".")[1], 18 * 16, 22 * 16, 0);

            this.font.write(gfx, data.lang.get("keys-erase").split(".")[0], 6 * 16, 24 * 16, 1);
            this.font.write(gfx, data.lang.get("keys-erase").split(".")[1], 18 * 16, 24 * 16, 0);

            this.font.write(gfx, data.lang.get("keys-both").split(".")[0], 6 * 16, 26 * 16, 1);
            this.font.write(gfx, data.lang.get("keys-both").split(".")[1], 18 * 16, 26 * 16, ((Date.now() / 300) | 0) % 2);


        }

    });

    function w(screen) {
        this.screen = screen;
        this.x = (14 * 16) + (Math.random() * 5 | 0);
        this.y = (13 * 16) + (Math.random() * 5 | 0);
        this.ox = this.x;
        this.oy = this.y;
        this.dir = this.screen.workers.length % 2 ? -1 : 1;
        this.falling = true;
    }
    w.prototype.tick = function () {
        if (this.falling) {
            this.y++;
            if (this.y > 16 * 16) {
                this.falling = false;
            }
        } else {
            this.x += this.dir;
            if (this.x < 0 || this.x > Ω.env.w) {
                this.x = this.ox;
                this.y = this.oy;
                this.falling = true;
            }
        }
    }
    w.prototype.render = function (gfx) {

        var frame = 0;

        if (this.falling) {
            frame = ((Date.now() / 100 | 0) % 2) + 4;
        } else {
            frame = (Date.now() / 100 | 0) % 2;
            // Three step anim
            // if (this.dir < 0) {
            //     frame = (((Date.now() / 80) % 3) | 0) + 13;
            // }
            // else {
            //     frame = (((Date.now() / 80) % 3) | 0) + 10;
            // }
        }

        this.screen.sheet.render(gfx, frame, 3, this.x, this.y);

    }

    window.TitleScreen = TitleScreen;

}(Ω, LevelScreen, HiScoreScreen, Font, Writer));
(function (Ω) {

    "use strict";

    var IntroScreen = Ω.Screen.extend({

        time: 0,

        font: new Font("res/mamefont.png", 16, 16),

        images: {
            client: new Ω.Image("res/clientlady.png"),
            top: new Ω.Image("res/button-top.png"),
            topDown: new Ω.Image("res/button-top-down.png"),
            bottom: new Ω.Image("res/button-bottom.png"),
            key: new Ω.Image("res/bigkey2.png"),
            key2: new Ω.Image("res/bigkey.png")
        },

        fullLength: 2300,

        coin: new Ω.Sound("res/sound/insertcoin", 0.6, false),
        drums: new Ω.Sound("res/sound/themeIntro", 0.8, true),

        text: [
            { start: 50, end: 450, x: 1, y: 3, msg: "i need your services, now!"},
            { start: 200, end: 450, x: 1, y: 4, msg: "evil forces are snooping"},
            { start: 270, end: 450, x: 1, y: 5, msg: "on all my communications."},

            { start: 480, end: 750, x: 1, y: 3, msg: "i need you to stop them by"},
            { start: 550, end: 750, x: 1, y: 4, msg: "providing me with a secure"},
            { start: 620, end: 750, x: 1, y: 5, msg: "digital channel."},

            { start: 750, end: 1150, x: 1, y: 3, msg: "go into the computer and"},
            { start: 820, end: 1150, x: 1, y: 4, msg: "retrieve all of my secret"},
            { start: 890, end: 1150, x: 1, y: 5, msg: "encryption keys."},

            { start: 1150, end: 1490, x: 1, y: 3, msg: "use the primary button to"},
            { start: 1250, end: 1490, x: 1, y: 4, msg: "draw and paint a secure"},
            { start: 1300, end: 1490, x: 1, y: 5, msg: "pathway to the exit node."},

            { start: 1490, end: 1950, x: 1, y: 3, msg: "the secondary button will"},
            { start: 1550, end: 1950, x: 1, y: 4, msg: "erase and dig. both buttons"},
            { start: 1650, end: 1950, x: 1, y: 5, msg: "will speed things along."},

            { start: 1950, end: 2500, x: 1, y: 3, msg: "you must hurry. they are "},
            { start: 2000, end: 2500, x: 1, y: 4, msg: "listening to ever******************hacking the system."},
            { start: 2200, end: 2500, x: 1, y: 5, msg: "good luck."},

        ],

        init: function () {

            this.writers = this.text.map(function (t) {

                var w = new Writer(this.font, t.x * 16, t.y * 16, t.msg, 3);
                w.start = t.start;
                w.end = t.end;

                return w;

            }, this);

            this.coin.play();

        },

        tick: function () {

            if (this.time++ < 50) {
                return;
            }
            if (this.time === 100) {
                this.drums.play();
                game.globalGlitchAmount = game.globalGlitchAmountMin * 4;
            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.tick();
                }
            }, this);

            if (this.time > this.fullLength || (Ω.input.pressed("draw") && this.time > 20)) {
                game.globalGlitchAmount = game.globalGlitchAmountMin;
                var level = Ω.urlParams.level ? parseInt(Ω.urlParams.level, 10) : 0;
                game.setScreen(new LevelScreen(level));
            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.images.client.render(gfx, 8 * 16, 9 * 16);


            if (this.time > 880 && this.time < 1950) {
                this.images.key.render(gfx, 20 * 16, 19 * 16 + (Math.sin(Date.now() / 500) * 10));
            }


            // Test explain controls
            if (this.time > 1150 && this.time < 1950) {

                var flash = (Date.now() / 500 | 0) % 2 === 0;

                this.images.bottom.render(gfx, 18.5 * 16, 11 * 16);
                this.images.bottom.render(gfx, 21.5 * 16, 11 * 16);

                if (flash) {
                    this.images.top.render(gfx, 18.5 * 16 + 6, 11 * 16 + 6);
                } else {
                    this.images.topDown.render(gfx, 18.5 * 16 + 6, 11 * 16 + 6);
                }

                if (this.time > 1500 && !flash) {
                    this.images.topDown.render(gfx, 21.5 * 16 + 6, 11 * 16 + 6);
                } else {
                    this.images.top.render(gfx, 21.5 * 16 + 6, 11 * 16 + 6);
                }
            }


            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.render(gfx);
                }
            }, this);

        }

    });

    window.IntroScreen = IntroScreen;

}(Ω));
(function (Ω) {

    "use strict";

    var EndScreen = Ω.Screen.extend({

        time: 0,

        font: new Font("res/mamefont.png", 16, 16),
        client: new Ω.Image("res/clientlady2.png"),
        theme: new Ω.Sound("res/sound/themeEnd", 0.8, false),

        text: [
            { start: 50, end: 150, x: 1, y: 3, msg: "hello?"},
            { start: 200, end: 250, x: 1, y: 4, msg: "hello?"},
            { start: 250, end: 350, x: 1, y: 4, msg: "are you ok?"},

            { start: 400, end: 750, x: 1, y: 3, msg: "ah, there you are!"},
            { start: 500, end: 750, x: 1, y: 4, msg: "you have done as you promised"},
            { start: 600, end: 750, x: 1, y: 5, msg: "and my secrets rest safe."},

            { start: 850, end: 1300, x: 1, y: 3, msg: "the evil forces have given"},
            { start: 950, end: 1300, x: 1, y: 4, msg: "up the fight! you battled"},
            { start: 1050, end: 1300, x: 1, y: 5, msg: "bravely. and your fees"},
            { start: 1150, end: 1300, x: 1, y: 6, msg: "are really quite reasonable."},

            { start: 1450, end: 1700, x: 1, y: 3, msg: "until we meet again..."},
            { start: 1900, end: 2600, x: 6, y: 10, msg: "thank you very much"},
            { start: 1900, end: 2600, x: 7, y: 11, msg: "for your playing"},

            { start: 2800, end: 3500, x: 10, y: 10, msg:  "a game by"},
            { start: 2800, end: 3500, x: 10, y: 11, msg:  "mrsp** speakr*er"},
            { start: 3000, end: 3500, x: 10, y: 13, msg: "2013"}


        ],

        init: function () {

            this.writers = this.text.map(function (t) {

                var w = new Writer(this.font, t.x * 16, t.y * 16, t.msg, 3);
                w.start = t.start;
                w.end = t.end;

                return w;

            }, this);

            this.theme.play();

        },

        tick: function () {

            if(this.time++ < 40) {
                return;

            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.tick();
                }
            }, this);


            if (this.time > 3600 || (Ω.input.pressed("draw") && this.time > 100)) {
                game.setScreen(new HiScoreEntryScreen(game.players[0].score));
            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            if (this.time > 350 && this.time < 1700) {
                this.client.render(gfx, 13 * 16, 10 * 16);
            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.render(gfx);
                }
            }, this);


        }

    });

    window.EndScreen = EndScreen;

}(Ω));
(function (Ω) {

    "use strict";

    var BootScreen = Ω.Screen.extend({

        time: 0,
        len: 120,

        font: new Font("res/mamefont.png", 16, 16),
        sheet: new Ω.SpriteSheet("res/tiles.png", 16),

        glitchJumped: false,

        init: function () {

            this.seed();

        },

        seed: function () {

            this.boot = [];

            var h = Ω.env.h / 16 | 0,
                last = Math.random() * 15 | 0,
                next;

            for(var i = 0; i < h; i++) {
                next = Math.random() * 15 | 0;
                this.boot.push(
                    Math.random() < 0.3 ? last : next
                )
                last = next;
            }

        },

        pushIt: function () {

            this.boot = this.boot.slice(1);
            this.boot.push(2);

        },

        tick: function () {

            this.time += 1;

            if (this.time > this.len) {
                game.setScreen(new TitleScreen());
            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            if (this.time < this.len * 0.111) {

                c.globalAlpha = 0.8;

                // Glitch part
                var w = Ω.env.w / 16 | 0,
                    h = Ω.env.h / 16 | 0;

                for (var j = 0; j < h; j++) {

                    var cell = this.boot[j];

                    for(var i = 0; i < w; i++) {

                        this.sheet.render(gfx, cell, 0, i * 16, j * 16);
                    }
                }

                c.globalAlpha = 1;


                if (!this.glitchJumped && this.time > this.len * 0.06) {
                    this.pushIt();
                    this.glitchJumped = true;
                }

                return;

            }

            // Rom part
            if (this.time < this.len * 0.222) {

                c.save();
                c.scale(0.5, 0.5);

                var top = 300,
                    left = 200;

                c.strokeStyle = "#fff";
                c.strokeRect(left - 20, top - 20, 550, 276);

                this.font.write(gfx, "usage of emulators in conjuction ", left, top);
                this.font.write(gfx, "with roms you don't own is quite", left, top + 32);
                this.font.write(gfx, "a fun thing to do with friends.", left, top + 64);
                this.font.write(gfx, "if you are not legally entitled", left, top + 128);
                this.font.write(gfx, "to play \"digibots & co\", then" , left, top + 156);
                this.font.write(gfx, "that's odd. send me a tweet and" , left, top + 188);
                this.font.write(gfx, "i'll sort that out for ya." , left, top + 220);
                c.restore();

                return;
            }

        }

    });

    window.BootScreen = BootScreen;

}(Ω));
(function (Ω) {

    "use strict";

    var PauseDialog = Ω.Dialog.extend({

        x: 0,
        y: 0,
        speed: 2,

        cx: 90,
        cy: 265,

        qx: 305,
        qy: 265,

        init: function (font) {

            this.font = font;
            this.x = Ω.env.w / 2;
            this.y = Ω.env.h / 2;

        },

        tick: function () {

            this._super();

            this.handleInput();

            if (this.x < -8) {
                this.x = Ω.env.w;
            }
            if (this.x > Ω.env.w) {
                this.x = 0;
            }
            if (this.y < -8) {
                this.y = Ω.env.h;
            }
            if (this.y > Ω.env.h) {
                this.y = 0;
            }

        },

        handleInput: function() {
            // Move
            if (Ω.input.isDown("up")) {
                this.y -= this.speed;
            }
            if (Ω.input.isDown("down")) {
                this.y += this.speed;
            }
            if (Ω.input.isDown("left")) {
                this.x -= this.speed;
            }
            if (Ω.input.isDown("right")) {
                this.x += this.speed;
            }

            if (Ω.input.pressed("draw")) {

                if  (this.x > this.qx && this.x < this.qx + 50 &&
                    this.y > this.qy && this.y < this.qy + 40) {
                    game.reset();
                    this.done();
                }

                if  (this.x > this.cx && this.x < this.cx + 50 &&
                    this.y > this.cy && this.y < this.cy + 40) {
                    this.done();
                }

            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(gfx.w * 0.15, gfx.h * 0.25, gfx.w * 0.7, gfx.h * 0.5);

            this.font.write(gfx, "paws", gfx.w / 2 - 32, gfx.h * 0.4);
            this.font.write(gfx, "quit", this.qx + 15, this.qy + 15);
            this.font.write(gfx, "back", this.cx + 15, this.cy + 15);

            c.strokeStyle = "#fff";
            c.strokeRect(this.x, this.y, 24, 24);

        }

    });

    window.PauseDialog = PauseDialog;

}(Ω));
(function (Ω) {

    "use strict";

    var ContinueDialog = Ω.Dialog.extend({

        x: 0,
        y: 0,
        speed: 2,

        cx: 9 * 16,
        cy: 14 * 16,

        qx: 16 * 16,
        qy: 14 * 16,

        countDown: null,
        passed: null,

        init: function (level, font, cost) {

            this.level = level;
            this.font = font;
            this.cost = cost || 0;

            this.x = 14 * 16;
            this.y = 14 * 16 + 10;

            this.countDown = Date.now() + 11000;
            this.passed = 10;
            this.done();
        },

        tick: function () {

            this._super();

            this.passed = (this.countDown - Date.now()) / 1000 | 0;
            if (this.passed <= 0) {
                this.done();
            }

            this.handleInput();

            if (this.x < -8) {
                this.x = Ω.env.w;
            }
            if (this.x > Ω.env.w) {
                this.x = 0;
            }
            if (this.y < -8) {
                this.y = Ω.env.h;
            }
            if (this.y > Ω.env.h) {
                this.y = 0;
            }

        },

        handleInput: function() {
            // Move
            if (Ω.input.isDown("up")) {
                this.y -= this.speed;
            }
            if (Ω.input.isDown("down")) {
                this.y += this.speed;
            }
            if (Ω.input.isDown("left")) {
                this.x -= this.speed;
            }
            if (Ω.input.isDown("right")) {
                this.x += this.speed;
            }

            if (Ω.input.pressed("draw")) {

                if  (this.x > this.qx && this.x < this.qx + 50 &&
                    this.y > this.qy && this.y < this.qy + 40) {
                    this.done();
                }

                if  (this.x > this.cx && this.x < this.cx + 50 &&
                    this.y > this.cy && this.y < this.cy + 40) {
                    // Do continue logice!
                    this.level.continueGame(this.cost);
                    this.done();
                }

            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(7 * 16, 9 * 16, 15 * 16, 8 * 16);
            c.strokeStyle = "#666";
            c.strokeRect(7 * 16, 9 * 16, 15 * 16, 8 * 16);

            this.font.write(gfx, "continue?", 8 * 16, 10 * 16);
            this.font.write(gfx, this.passed, 18 * 16, 10 * 16);
            this.font.write(gfx, "cost: ", 8 * 16, 12 * 16);
            this.font.write(gfx, this.cost, 15 * 16, 12 * 16, 1);


            this.font.write(gfx, "yes", this.cx + 15, this.cy + 15, 1);
            this.font.write(gfx, "no", this.qx + 15, this.qy + 15, 1);

            c.strokeStyle = "#fff";
            c.strokeRect(this.x, this.y, 24, 24);

        }

    });

    window.ContinueDialog = ContinueDialog;

}(Ω));
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
(function (Ω) {

    "use strict";

    var Flash = Ω.Entity.extend({

        len: 7,
        count: 0,

        init: function () {

        },

        tick: function () {

            if (this.count++ >= this.len) {
                return false;
            }

        	return true;

        },

        render: function (gfx) {

            var c = gfx.ctx,
                a = c.globalAlpha;

            c.globalAlpha = 1 - this.count / this.len;
            c.fillStyle = "#fff";
            c.fillRect(0, 0, gfx.w, gfx.h);
            c.globalAlpha = a;

        }

    });

    window.Flash = Flash;

}(Ω));(function (Ω) {

    "use strict";

    var Tiled = Ω.Class.extend({

        w: null,
        h: null,
        tileW: null,
        tileH: null,

        layers: null,

        init: function (file, onload) {
            var self = this;

            this.layers = [];
            this.onload = onload;

            Ω.utils.ajax(file, function (xhr) {

                self.processLevel(JSON.parse(xhr.responseText));

            });
        },

        layerByName: function (name) {

            return Ω.utils.getByKeyValue(this.layers, "name", name);

        },

        objectByName: function (layer, name) {

            return this.layerByName(layer).data.reduce(function(acc, el) {

                // Just return one or zero matchs
                if (acc.length === 0 && el.name === name) {
                    acc = [el];
                }
                return acc;
            }, []);

        },

        objectsByName: function (layer, name) {

            var layer = this.layerByName(layer).data;

            if (!name) {
                return layer;
            }

            return !layer ? [] : layer.reduce(function(acc, el) {

                if (el.name === name) {
                    acc.push(el);
                }
                return acc;
            }, []);

        },

        processLevel: function (json) {
            this.raw = json;

            this.w = json.width;
            this.h = json.height;
            this.tileW = json.tilewidth;
            this.tileH = json.tileheight;

            this.properties = json.properties;

            this.layers = json.layers.map(function (l) {

                var data;
                if (l.type === "tilelayer") {
                    // convert to 2d arrays.
                    data = l.data.reduce(function (acc, el) {
                        if (acc.length === 0 || acc[acc.length - 1].length % json.width === 0) {
                            acc.push([]);
                        }
                        acc[acc.length - 1].push(el);
                        return acc;
                    }, []);
                } else {
                    // Parse the objects into something useful
                    data = l.objects.map(function (o) {
                        return o;
                    });
                }

                return {
                    name: l.name,
                    type: l.type,
                    data: data,
                    opacity: l.opacity,
                    visible: l.visible
                };

            });

            if (this.onload) {
                this.onload(this);
            }
        }

    });

    window.Tiled = Tiled;

}(Ω));(function (Ω, Tiled) {

    "use strict";

    var levelLoader,
        rowTypes;

    rowTypes = { "EQUATOR": 0, "AIR": 1, "GROUND": 2 };

    levelLoader = {

        load: function (levelName, sheets, cb) {

            var self = this,
                meta = {},
                maps = {
                    back: null,
                    fore: null,
                    clear: null
                },
                portal;


            function visible(ents) {

                return ents.filter(function (e) {

                    return e.visible;

                });

            }

            new Tiled("res/levels/" + levelName + ".json?" + Date.now(), function (t) {

                meta = {
                    cellW: t.w,
                    cellH: t.h,
                    tileW: t.tileW,
                    tileH: t.tileH,
                    w: sheets.normal.w * t.w,
                    h: sheets.normal.h * t.h,
                    time: t.properties.time || 30,
                    equator: t.properties.equator || (t.h / 2 | 0) + 3,
                    glitchAmount: t.properties.glitchAmount || 0,
                    monsterSpawnRate: t.properties.monsterSpawnRate || 10,
                    monsterWhenKeysLeft: t.properties.monsterWhenKeysLeft || -2
                };

                if (!t.properties.time) console.error("Map property 'time' not set");
                if (!t.properties.equator) console.error("Map prop 'equator' not set");
                if (!t.properties.glitchAmount) console.error("Map prop 'glitchAmount' not set");

                maps.clear = self.initMap(sheets.normal, meta.cellW, meta.cellH);
                maps.fore = self.initMap(sheets.normal, meta.cellW, meta.cellH);
                maps.back = new Ω.Map(sheets.normal, t.layerByName("background").data);
                maps.back.walkables = walkables;//[0, 70, 75];

                // Set the level portal
                portal = t.objectByName("machines", "portal").map(function (p) {

                    return {
                        x: p.x / meta.tileW | 0,
                        y: p.y / meta.tileH | 0,
                        w: 2,
                        h: 2,
                        unlock: p.properties.unlock,
                        tiles: [33, 34, 69]
                    };

                })[0];

                // Set the glitchy sprite sheets
                maps.back.normalSheet = sheets.normal;
                maps.fore.normalSheet = sheets.normal;
                maps.back.glitchSheet = sheets.glitch;
                maps.fore.glitchSheet = sheets.glitch;

                this.monsters = [
                    //new GlitchMonster(10, 3, this)
                ];

                cb && cb({
                    raw: t,
                    meta: meta,
                    maps: maps,
                    machines: visible(t.layerByName("machines").data),
                    entities: {
                        workers: visible(t.objectsByName("spawn", "worker")),
                        keys: visible(t.objectsByName("keys"))
                    }
                });

            });

        },

        initMap: function (sheet, w, h) {

            var i,
                j,
                map = [];

            for (j = 0; j < h; j++) {

                map.push([]);

                for (i = 0; i < w; i++) {

                    map[j].push(0);

                }
            }

            return new Ω.Map(sheet, map);

        },

        generate: function (sheet, equator, cellW, cellH) {

            var backMap = [],
                foreMap = [],
                clearMap = [],
                j,
                i,
                count,
                rowType,
                backTile,
                foreTile;


            for (j = 0; j < cellH; j++) {

                backMap.push([]);
                foreMap.push([]);
                clearMap.push([]);

                if (j < equator) {
                    rowType = rowTypes.AIR;
                } else {
                    rowType = rowTypes.GROUND;
                }

                for (i = 0; i < cellW; i++) {

                    clearMap[j].push(0);

                    // TODO: just move map render Y down!
                    if (j < 3) {
                        backMap[j].push(blocks.BLANK);
                        foreMap[j].push(blocks.BLANK);
                    } else {

                        switch (rowType) {

                        case rowTypes.EQUATOR:
                            backTile = blocks.BLANK;
                            foreTile = blocks.BLANK;
                            break;

                        case rowTypes.AIR:
                            backTile = blocks.BLANK;
                            if (Ω.utils.oneIn(45)) {
                                backTile = blocks.STAIR_R;
                                count = 5;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = count === 4 ? blocks.STAIR_L : blocks.PLATFORM;
                                    }
                                }
                            } else if (Ω.utils.oneIn(20)) {
                                count = 2;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = blocks.ROCK;
                                    }
                                }

                            }
                            foreTile = Ω.utils.rand(200) < 5 ? Ω.utils.rand(26) + 2 : blocks.BLANK;
                            break;

                        case rowTypes.GROUND:
                            backTile = blocks.DIRT;
                            if (Ω.utils.oneIn(20)) {
                                count = 2;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = blocks.LIMESTONE;
                                    }
                                }

                            }
                            foreTile = Ω.utils.rand(200) < 5 ? Ω.utils.rand(26) + 2 : blocks.BLANK;
                            break;

                        }

                        backMap[j].push(backTile);
                        foreMap[j].push(foreTile);
                    }

                }

            }

            return {
                back: new Ω.Map(sheet, backMap),
                fore: new Ω.Map(sheet, foreMap),
                clear: new Ω.Map(sheet, clearMap)
            };

        }
    };

    window.levelLoader = levelLoader;

}(Ω, Tiled));(function (Ω, blocks, Player, Workman, Switch, Popup, Font) {

    "use strict";

    var Level = Ω.Class.extend({

        players: null,
        maps: null,
        portal: null,
        machines: null,
        monsters: null,
        spawners: null,
        keys: null,

        collectedKeys: 0,

        effects: null,

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),
        glitchSheet: new Ω.SpriteSheet("res/glitched.png", 16),
        font: new Font("res/mamefont.png", 16, 16),

        sounds: {
            pickup: new Ω.Sound("res/sound/collect", 1, false),
            portal: new Ω.Sound("res/sound/portalopen", 0.9, false),
            escape: new Ω.Sound("res/sound/portalout", 0.9, false),
            theme: new Ω.Sound("res/sound/theme", 0.8, true),
            themeMinor: new Ω.Sound("res/sound/themeMinor", 0.8, true),
            gameover: new Ω.Sound("res/sound/themeGameOver", 0.85, false)
        },

        rowTypes:  { "EQUATOR": 0, "AIR": 1, "GROUND": 2 },

        glitchType: 0,
        glitchTile: 0,

        loaded: false,

        time: null,
        frame: 0,

        monsterSpawnTime: 0,
        levelOverTime: -1,

        state: null,

        init: function (screen, levelName, players) {
            this.levelName = levelName;
            var self = this,
                maps;

            this.screen = screen;
            this.effects = [];
            this.monsters = [];

            this.players = [new Player(this, players[0])];

            levelLoader.load(
                levelName,
                {
                    normal: this.sheet,
                    glitch: this.glitchSheet
                },
                function (data) {

                    self.onload(data);
                    self.glitch();

                }
            );

            this.state = new Ω.utils.State("BORN");

        },

        onload: function (data) {

            this.w = data.meta.w;
            this.h = data.meta.h;
            this.cellW = data.meta.cellW;
            this.cellH = data.meta.cellH;
            this.tileW = data.meta.tileW;
            this.tileH = data.meta.tileH;
            this.equator = data.meta.equator;
            this.glitchAmount = data.meta.glitchAmount / 100;

            // tie glboal Glitch
            game.globalGlitchAmount = ((this.glitchAmount * 3) * (game.globalGlitchAmountMax - game.globalGlitchAmountMin)) + game.globalGlitchAmountMin;


            this.monsterTime = data.meta.time;
            this.monsterSpawnRate = data.meta.monsterSpawnRate * 1000;
            this.monsterWhenKeysLeft = data.meta.monsterWhenKeysLeft;
            this.goodTime = data.meta.time * 0.75 | 0;

            this.maps = data.maps;

            // Create and wire up the machines
            this.machines = data.machines.map(this.make, this);
            this.machines.forEach(function (m) {

                m.wireItUp()
                return m;

            });

            this.keys = data.entities.keys.map(function (k) {

                return new Key(k.x, k.y, this);

            }, this);
            this.maxKeys = this.keys.length;
            this.collectedKeys = 0;

            this.portal = this.machines.filter(function (m) {

                 return m.name === "portal";

            })[0];

            this.unbuildables = [blocks.ROCK, blocks.LIMESTONE, blocks.NOBUILD, blocks.NOBUILD_SOLID];

            this.spawners = data.entities.workers
                .map(this.makeWorker, this)
                .map(this.players[0].addWorker, this.players[0]);
            this.maxWorkers = this.spawners.length;

            this.time = Date.now();
            this.loaded = true;

        },

        onEnd: function () {

            Ω.Sound._reset();
            game.players[0].score = this.players[0].score;

        },

        shhon: function () {

            this.effects.push(
                new Popup("mr speaker mode!", this.font, 150, 8 * 16, 8 * 16),
                new Popup("mr speaker mode!", this.font, 150, 8 * 16, 10 * 16),
                new Popup("mr speaker mode!", this.font, 150, 8 * 16, 12 * 16),
                new Popup("mr speaker mode!", this.font, 150, 8 * 16, 14 * 16)
            );

        },

        makeWorker: function (json) {

            return new Workman(
                json.x / this.tileW | 0,
                (json.y - 1) / this.tileH | 0,
                json.type,
                this.players[0]
            );

        },

        makeMonster: function () {

            this.sounds.theme.rewind();
            this.sounds.themeMinor.play();

            this.monsters.push(
                new GlitchMonster(10, 10, this)
            );

        },

        make: function (data) {

            var ent = null;

            switch (data.type) {

            case "portal":
                ent = new Portal(
                    this,
                    data.x,
                    data.y,
                    data.properties.unlock
                )
                break;

            case "switch":
                ent = new Switch(
                    this,
                    data.x,
                    data.y - 16,
                    data.properties.state === "on" ? true : false,
                    data.properties.target);
                break;

            case "spikes":
                ent = new Spikes(
                    data.x,
                    data.y - 16);
                break;

            case "elevator":
                ent = new Elevator(
                    this,
                    data.name,
                    data.x,
                    data.y - 16,
                    parseInt(data.properties.speed),
                    parseInt(data.properties.top),
                    parseInt(data.properties.bottom))
                break;

            case "door":
                ent = new Door(
                    data.name,
                    this,
                    data.properties.direction,
                    data.x,
                    data.y - 16);
                break;

            case "teleport":
                ent = new Teleport(
                    this,
                    data.name,
                    data.x,
                    data.y - 16,
                    data.properties.target);
                break;

            case "teleport-pad":
                ent = new Teleport(
                    this,
                    data.name,
                    data.x,
                    data.y - 16);
                break;

            default:
                console.error("Unhandled machine:", data);
                break;
            }

            return ent;

        },

        getMachineByName: function (name) {

            var match = this.machines.filter(function (m) {

                return m.name === name;

            });

            return match.length ? match[0] : null;

        },

        tick: function () {

            if (!this.loaded) {
                return;
            }

            this.state.tick();
            this.frame++;

            switch (this.state.get()) {
                case "BORN":
                    Ω.Sound._reset();
                    if (this.state.first()) {
                        this.sounds.theme.play();
                        if (game.lastTrackTime) {
                            this.sounds.theme.audio.currentTime = game.lastTrackTime;
                            game.lastTrackTime = 0;
                        }

                    }
                    this.state.set("GETREADY");
                    break;

                case "GETREADY":
                    if (this.state.first()) {
                        this.render = function (gfx) {
                            this.render_RUNNING(gfx);
                            this.render_GETREADY(gfx);
                        }
                    }
                    if (this.state.count > 150) {
                        this.render = this.render_RUNNING;
                        this.time = Date.now();
                        this.state.set("RUNNING");
                        this.monsterStartTime = this.time + (this.monsterTime * 1000);
                    }
                    break;

                case "RUNNING":
                    this.tick_RUNNING();
                    break;

                case "LEVELOVER":

                    game.lastTrackTime = this.sounds.theme.audio.currentTime;

                    this.onEnd();

                    //levelScreen, time, maxTime, keys, maxKeys, workers, maxWorkers
                    game.setScreen(new LevelClearScreen(
                        this.screen,
                        this.levelClearedAt,
                        this.monsterTime * 1000,
                        this.goodTime,
                        this.collectedKeys,
                        this.maxKeys,
                        this.players[0].escaped,
                        this.maxWorkers
                        ));
                    break;

                case "GAMEOVER":
                    if (this.state.first()) {
                        this.onEnd();
                        game.setDialog(new ContinueDialog(this, this.font, this.players[0].score * 0.4 | 0));
                    }
                    if (this.state.count === 1) {
                        this.onEnd();
                        this.sounds.gameover.play();
                        this.render = function (gfx) {
                            this.render_RUNNING(gfx);
                            this.render_GAMEOVER(gfx);
                        }
                    }
                    this.tick_RUNNING();
                    if (this.state.count > 150) {
                        game.setScreen(new HiScoreEntryScreen(this.players[0].score));
                    }
                    break;
            }

        },

        tick_RUNNING: function () {

            var self = this;

            this.timePassed = Date.now() - this.time;

            this.players.map(function (p) {

                p.tick(self.maps);

                p.workers.forEach(function (w) {

                    Ω.Physics.checkCollision(w, self.machines, "hitMachine");
                    Ω.Physics.checkCollision(w, self.keys, "hitKey");

                });

            });

            this.monsters = this.monsters.filter(function (m) {

                return m.tick();

            });

            var now = Date.now();
            if (now > this.monsterStartTime) {
                if (this.monsters.length === 0 ||
                    now - this.monsterSpawnTime > this.monsterSpawnRate)  {
                        this.makeMonster();
                        this.monsterSpawnTime = now;
                }
            }

            this.machines = this.machines.filter(function (m) {

                return m.tick();

            });

            this.keys = this.keys.filter(function (k) {

                return k.tick();

            });

            this.effects = this.effects.filter(function (e) {

                return e.tick();

            });

            if (Math.random() < 0.05) {
                this.glitch();
            }
            if (Math.random() < 0.01) {
                this.glitchType = Ω.utils.rand(5);
            }
            // Don't stay on background swap for too long... it's hard to look at!
            if (this.glitchType == 4 && Ω.utils.oneIn(40)) {
                this.glitchType = Ω.utils.rand(4);
            }

            // Flickr the glitched-looking tiles sheets in and out
            if (Math.random() < 0.04) {
                this.maps.fore.sheet = this.maps.fore.glitchSheet;
                this.maps.back.sheet = this.maps.back.glitchSheet;
                setTimeout(function () {

                    self.maps.fore.sheet = self.maps.fore.normalSheet;
                    self.maps.back.sheet = self.maps.back.normalSheet;

                }, Ω.utils.rand(500) + 200);
            }

            // Start a monster at random
            if (this.monsterAfterTime === -2 || this.monsters.length > 0 ) {
                if (Math.random() < 0.0004) {
                   this.makeMonster();
                }
            }

            if (this.levelOverTime !== -1) {
                if (--this.levelOverTime <= 0) {
                    this.state.set("LEVELOVER");
                }
            }

        },

        continueGame: function (cost) {
            game.addScore(-cost);
            this.screen.repeatLevel();
        },

        setBlock: function (map, pos, tile) {

            if (this.maps.clear.cells[pos[1]][pos[0]] > 0) {
                map.cells[pos[1]][pos[0]] = blocks.BLANK;
                return;
            }

            map.cells[pos[1]][pos[0]] = tile;

        },

        glitch: function () {

            var i,
                j,
                foreMap = this.maps.fore,
                foreTile,
                backTile;

            for (j = 0; j < this.cellH; j++) {

                // TODO: just move map render Y down!
                if (j < 3) {
                    continue;
                }

                if (Math.random() < 0.7) {
                    this.glitchTile = Ω.utils.rand(26) + 2;
                }

                switch (this.glitchType) {
                case 0:
                    // RANDOM replace
                    for (i = 0; i < this.cellW; i++) {
                        foreTile = this.glitchTile;
                        this.setBlock(foreMap, [i, j], foreMap.cells[j][i] === blocks.BLANK ? 0 : foreTile);
                    }
                    break;
                case 1:
                case 2:
                    // Random new
                    for (i = 0; i < this.cellW; i++) {
                        foreTile = Math.random() < this.glitchAmount ? this.glitchTile : blocks.BLANK;
                        this.setBlock(foreMap, [i, j], foreTile);
                    }
                    break;
                case 2:
                    //Same lines
                    for (i = this.cellW - 1; i > 1; i--) {
                        this.setBlock(foreMap, [i - 1, j], foreMap.cells[j][this.cellW - 1]);
                    }
                    foreTile = Ω.utils.oneIn(3) ? this.glitchTile : blocks.BLANK;
                    //foreMap.cells[j][this.w - 1] = foreTile;
                    this.setBlock(foreMap, [i, j], foreTile);
                    break;
                case 3:
                    // Colour in background
                    for (i = 0; i < this.cellW; i++) {
                        backTile = this.maps.back.cells[j][i];
                        if (backTile === blocks.PLATFORM || backTile === blocks.DIRT) {
                            foreTile = this.glitchTile;
                        } else {
                            foreTile = blocks.BLANK;
                        }
                        this.setBlock(foreMap, [i, j], foreTile);
                    }
                    break;
                }

            }


        },

        gotPortalToken: function (player) {

            this.effects.push(
                new Flash()
            );
            this.sounds.pickup.play();
            player.score += data.points.coin;
            this.collectedKeys++;

            if (--this.portal.unlock === 0) {

                this.sounds.portal.play();
                player.score += data.points.portalOpen;

                this.effects.push(
                    new Popup("secure connection", this.font, 150, 8 * 16, 10 * 16)
                );

                this.effects.push(
                    new Popup("established", this.font, 150, 11 * 16, 12 * 16)
                );

            }

        },

        workerOut: function (worker) {

            this.sounds.escape.play();
            worker.boss.score += data.points.workerOut;
            worker.boss.escaped++;

            this.levelOverCheck(worker);

        },

        levelOverCheck: function (worker) {

            this.effects = this.effects.filter(function (e) {
                return !(e.name && e.name === "popup")
            });

            if (this.levelOverTime === -1) {
                this.effects.push(
                    new Popup("level clear", this.font, 150, 10 * 16, 10 * 16)
                );
                this.levelOverTime = 500;
                this.levelClearedAt = this.timePassed;
            } else {
                // this.effects.push(
                //     new Popup("bonus", this.font, 150, 10 * 16, 8 * 16)
                // );
            }

            var removed = 0;
            this.players[0].workers.forEach(function(w) {
                w.speed = w.crazySpeed;
                if (w === worker) {
                    w.remove = true;
                }
                // Find all that have been removed this frame
                if (w.remove) {
                    removed++;
                }
            });

            if (this.players[0].workers.length - removed === 0) {
                this.levelOverTime = Math.min(30, this.levelOverTime);
            }

        },

        gameOver: function (p) {

            this.state.set("GAMEOVER");

        },

        render: function (gfx) {

            this.render_RUNNING(gfx);

        },

        render_GETREADY: function (gfx) {
            var c = gfx.ctx,
                finalLevel = this.levelName === "crazy/spikesGalore";

            c.fillStyle = "#000";
            c.fillRect(9 * 16, 9 * 16, 12 * 16, 7 * 16);
            c.strokeStyle = "#666";
            c.strokeRect(9 * 16, 9 * 16, 12 * 16, 7 * 16);

            if ((Date.now() / 300 % 2) | 0 === 1) {

                this.font.write(gfx, finalLevel ? "final battle!" : data.lang.get("get-ready"), finalLevel ? 9 * 16 : 11 * 16, 10 * 16, 1);

            }
            this.font.write(gfx, "time: " + Ω.utils.formatTime(this.monsterTime * 1000), 10 * 16, 12 * 16);
            this.font.write(gfx, "keys: " + this.portal.unlock, 10 * 16, 14 * 16);

        },

        render_GAMEOVER: function (gfx) {

            this.font.write(gfx, "game over", (this.cellW / 2 - 4 | 0) * 16, 9.5 * 16);

        },

        render_RUNNING: function (gfx) {

            if (!this.loaded) {
                return;
            }

            var c = gfx.ctx,
                remindFast = this.levelName === "intro/getready3";

            // Dirt background
            c.fillStyle = "hsl(11, 30%, 40%)";
            c.fillRect(0, (this.equator) * 16, this.maps.back.cellW * 16, (this.maps.back.cellH - this.equator) * 16);

            this.maps.back.render(gfx);

            this.machines.forEach(function (m) {

                m.render(gfx);

            });

            this.keys.forEach(function (k) {

                k.render(gfx);

            });

            this.players.forEach(function (p) {

                p.render(gfx);

            });

            this.monsters.forEach(function (m) {

                m.render(gfx);

            });

            //if (this.monsters.length > 0) {
                this.maps.fore.render(gfx);
            //}

            this.players.map(function (p) {

                p.renderCursor(gfx);

            });

            this.effects.forEach(function (e) {

                e.render(gfx);

            });

            var score = this.players[0].score,
                hi = Math.max(score, game.hiscores[0][1]);

            this.font.write(gfx, Ω.utils.formatScore(score, 6), 34, 16);
            this.font.write(gfx, "hi" + Ω.utils.formatScore(hi, 6), 174, 16, 1);

            var time = this.state.isNot("RUNNING") ? this.monsterTime * 1000 : this.monsterStartTime - Date.now(),
                timeCol = 0;
            if (time < 0) {
                time = 0;
                timeCol = (Date.now() / 300 | 0) % 2 ? 1 : 0;
            }
            this.font.write(gfx, Ω.utils.formatTime(time), 350, 16, timeCol);

            if (remindFast && this.frame > 170 && this.frame < 750) {
                c.fillStyle = "#000";
                c.fillRect(5 * 16, 25 * 16, 21 * 16, 3 * 16);
                if ((Date.now() / 300 % 2) | 0 === 1 ) {
                    this.font.write(gfx, "try a button combo!", 6 * 16, 26 * 16);
                }
            }


        }

    });

    window.Level = Level;

}(Ω, blocks, Player, Workman, Switch, Popup, Font));
(function (Ω) {

    "use strict";

    /*
        Digibots & co.
        a game by Mr Speaker.
        mrspeaker.net
        @mrspeaker
        -2013-

        URL Params

        mute: silence please (actually - i think i broke this with the theme tune)
        clean: erase hiscore table
        locale: fr for french, else english
        level: jump straight to level X, and skip intro
        hi: jump to hiscore entry with random score
        board: view hiscore leader board
    */


    var DIGIBOTS = Ω.Game.extend({

        canvas: "#board",
        players: null,
        hiscores: null,

        locale: "en",
        hiScoreKey: "bnc-scores",

        startTime: null,

        booted: false,

        glGLitch: 0,
        globalGlitchAmountMin: 0.004,
        globalGlitchAmountMax: 0.01,
        globalGlitchAmount: 0.004,

        shhmode: false,

        init: function (w, h) {

            var self = this;

            this.startTime = Date.now();
            this._super(w, h);

            this.initWebGL();

            Ω.evt.progress.push(function (remaining, max) {
                document.getElementById("preload").innerHTML = (((max - remaining) / max) * 100 | 0) + "%";
            });

            Ω.input.bind([
                ["escape", "escape"],
                ["left", "left"],
                ["right", "right"],
                ["up", "up"],
                ["down", "down"],
                ["space", "draw"],
                [88, "erase"], // x
                [93, "erase"] // icade
            ]);

        },

        load: function () {

            var self = this;

            this.hiscores = [["erc", 4000]];
            for (var i = 0; i < 9; i++) {
                this.hiscores.push(["...", 0]);
            }

            Ω.utils.storage.get(game.hiScoreKey, function (d) {

                if (!d) {
                    return;
                }

                try {
                    d = JSON.parse(d);
                    self.hiscores = d;
                } catch (e) {
                    console.log("error parsing hiscores");
                }
            });

            if (Ω.urlParams.mute) {

                Ω.Sound._setVolume(0);

            }

            if (Ω.urlParams.clean) {
                this.cleanHi();
            }

            if (Ω.urlParams.locale) {

                if (Ω.urlParams.locale.toLowerCase() === "fr") {
                    this.locale = "fr";
                }

            }


            this.reset();

        },

        cleanHi: function () {

            console.log("cleaning...")
            Ω.utils.storage.remove(game.hiScoreKey);

        },

        stopPreload: function () {

            // Clear the preloader thing
            if (preloo) {
                clearInterval(preloo);
                document.querySelector("section").style.background = "#111";
                document.getElementById("preload").style.display = "none";
            }

        },

        reset: function () {

            Ω.Sound._reset();

            this.globalGlitchAmount = this.globalGlitchAmountMin;
            this.shhmode = false;

            this.players = [
                {
                    x: 14 * 16,
                    y: 22 * 16,
                    score: 0
                }
            ];

            this.stopPreload();

            if (Ω.urlParams.level) {

                var level = Ω.urlParams.level ? parseInt(Ω.urlParams.level, 10) : 0;
                game.setScreen(new LevelScreen(level));
                return;

            }

            if (Ω.urlParams.end) {

                game.setScreen(new EndScreen());
                return;
            }

            if (Ω.urlParams.board) {

                game.setScreen(new HiScoreScreen());
                return;
            }

            if (Ω.urlParams.hi) {

                // Testing hiscore entry page
                var max = this.hiscores[0][1] * 1.1,
                    min = this.hiscores[9][1];

                game.setScreen(new HiScoreEntryScreen(((Math.random() * max - min) | 0) + min));
                return;

            }

            this.setScreen(this.booted ? new TitleScreen() : new BootScreen());
            this.booted = true;

        },

        addScore: function (score) {

            this.players[0].score += score;

        },

        getScore: function (score) {

            return this.players[0].score;

        },

        initWebGL: function () {

            var canvas = document.getElementById("post"),
                c = this.webGLctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

            if (!c) {
                console.error("No web gl context: no post effects");
                canvas.style.display = "none";
                document.getElementById("board").style.display = "block";
                return;
            }

            var program = Ω.gfx.loadShaders(c, "vert-post", "frag-post"),
                buffer = c.createBuffer(),
                positionIndex = c.getAttribLocation(program, "a_position");

            this.timeLoc = c.getUniformLocation(program, "u_time");
            this.glitchLoc = c.getUniformLocation(program, "u_doGlitch");


            c.enableVertexAttribArray(positionIndex); // Need to enable it, for some reason
            c.bindBuffer(c.ARRAY_BUFFER, buffer); // bind buffer is like an extra parameter to vAP (for backward compatibility)
            // specify the location and data format of the array of generic vertex attributes at index index to use when rendering
            c.vertexAttribPointer(positionIndex, 2, c.FLOAT, false, 0, 0);

            // init the main texture
            c.bindTexture(c.TEXTURE_2D, c.createTexture());
            //c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, true);
            c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, Ω.gfx.canvas);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);

            c.bufferData(
                c.ARRAY_BUFFER,
                new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
                c.STATIC_DRAW);

        },

        tick: function () {

            this._super();

            this.glGLitch--;

            if (Math.random() < this.globalGlitchAmount) {
                this.glGLitch = (Math.random() * 20 | 0) + 1;
            }

            this.shh();

        },

        shh: function () {

            if (!(game.screen && game.screen.level)) {
                return;
            }

            var last = this.last,
                k = "38-38-40-40-37-39-37-39-88-32",
                cur = Ω.input.buf.join("-");
            if (cur !== last) {
                this.last = cur;
                if (cur === k) {
                    this.shhmode = !this.shhmode;
                    if (this.shhmode) {
                        game.screen.level.shhon();
                    }
                    Ω.input.buf = [];
                }
            }

        },

        renderGL: function (gfx) {

            var gl = this.webGLctx;

            if (!gl) return;

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gfx.canvas);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.uniform1f(this.timeLoc, Date.now() -this.startTime);
            gl.uniform1i(this.glitchLoc, this.glGLitch > 0 ? 1 : 0);
        },

        render: function () {

            // FIxme - no gfx passed in!
            var gfx = Ω.gfx;

            this._super(gfx);

            this.renderGL(gfx);

        }

    });

    window.DIGIBOTS = DIGIBOTS;

}(Ω));
