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
