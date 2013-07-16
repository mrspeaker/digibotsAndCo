(function (Ω, Machine) {

    "use strict";

    var Switch = Machine.extend({

        switchedTime: Date.now(),

        sound: new Ω.Sound("res/sound/clickswitch", 0.5, false),

        init: function (level, x, y, state, targetName) {

            this.level = level;
            this.x = x;
            this.y = y;
            this.state = state;
            this.targetName = targetName;
            this.target = null;

        },

        hitMachine: function (by) {

            if (Date.now() - this.switchedTime > 1000) {

                this.state = !this.state;
                this.switchedTime = Date.now();

                this.target && this.target.triggered(this.state);

                this.sound.play();

            }

            return this.state;

        },

        wireItUp: function () {

            this.target = this.level.getMachineByName(this.targetName);

        },

        render: function (gfx) {

            var block = this.state ? blocks.SWITCH_R : blocks.SWITCH_L;

            this.sheet.render(gfx, block % 36 | 0, block / 36 | 0, this.x, this.y);

        }

    });

    window.Switch = Switch;

}(Ω, Machine));