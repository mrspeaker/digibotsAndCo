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
