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
                    x = 1;
                    y = 3;
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
