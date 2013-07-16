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
