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
                this.font.write(gfx, "to play \"digitbots & co\", then" , left, top + 156);
                this.font.write(gfx, "that's odd. send me a tweet and" , left, top + 188);
                this.font.write(gfx, "i'll sort that out for ya." , left, top + 220);
                c.restore();

                return;
            }

        }

    });

    window.BootScreen = BootScreen;

}(Ω));
