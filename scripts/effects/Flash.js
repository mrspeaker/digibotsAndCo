(function (Ω) {

    "use strict";

    var Flash = Ω.Entity.extend({

        len: 7,
        count: 0,

        init: function () {

        },

        tick: function () {

            if (this.count++ >= this.len) {
                return false;
            }

        	return true;

        },

        render: function (gfx) {

            var c = gfx.ctx,
                a = c.globalAlpha;

            c.globalAlpha = 1 - this.count / this.len;
            c.fillStyle = "#fff";
            c.fillRect(0, 0, gfx.w, gfx.h);
            c.globalAlpha = a;

        }

    });

    window.Flash = Flash;

}(Ω));