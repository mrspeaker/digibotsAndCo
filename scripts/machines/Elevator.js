(function (Ω, Machine) {

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
