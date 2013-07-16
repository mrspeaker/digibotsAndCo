(function (Ω, Machine) {

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

}(Ω, Machine));