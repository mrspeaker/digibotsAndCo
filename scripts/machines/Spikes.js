(function (Ω, Machine) {

    "use strict";

    var Spikes = Machine.extend({

        init: function (x, y) {

            this.x = x;
            this.y = y;

        },

        hitMachine: function (by) {

            by.kill(this);

        },

        render: function (gfx) {

            this.sheet.render(gfx, 5, 2, this.x, this.y);

        }

    });

    window.Spikes = Spikes;

}(Ω, Machine));