(function (Ω) {

    "use strict";

    var Machine = Ω.Entity.extend({

        w: 16,
        h: 16,

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),

        hitMachine: function () {},

        wireItUp: function () {},

        tick: function () {

            return true;

        },

        render: function (gfx) {}

    });

    window.Machine = Machine;

}(Ω));