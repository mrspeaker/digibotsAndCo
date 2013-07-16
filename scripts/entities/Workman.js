(function (Ω, blocks, dirs) {

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

                if (this.dir === dirs.UP) {
                    frame += 8;
                }
                break;
            }

            if (frame >= 0) {
                if (this.falling) {
                    frame = ((Date.now() / 100 | 0) % 2) + 4;
                }

                this.sheet.render(gfx, frame, 3, this.x, this.y);
            }
            this.particle.render(gfx);

        }

    });

    window.Workman = Workman;

}(Ω, blocks, dirs));
