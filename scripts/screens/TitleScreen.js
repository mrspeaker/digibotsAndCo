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
