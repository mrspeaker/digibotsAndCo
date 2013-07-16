(function (Ω, Machine) {

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

}(Ω, Machine));