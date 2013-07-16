(function (Ω) {

    "use strict";

    var EndScreen = Ω.Screen.extend({

        time: 0,

        font: new Font("res/mamefont.png", 16, 16),
        client: new Ω.Image("res/clientlady2.png"),
        theme: new Ω.Sound("res/sound/themeEnd", 0.8, false),

        text: [
            { start: 50, end: 150, x: 1, y: 3, msg: "hello?"},
            { start: 200, end: 250, x: 1, y: 4, msg: "hello?"},
            { start: 250, end: 350, x: 1, y: 4, msg: "are you ok?"},

            { start: 400, end: 750, x: 1, y: 3, msg: "ah, there you are!"},
            { start: 500, end: 750, x: 1, y: 4, msg: "you have done as you promised"},
            { start: 600, end: 750, x: 1, y: 5, msg: "and my secrets rest safe."},

            { start: 850, end: 1300, x: 1, y: 3, msg: "the evil forces have given"},
            { start: 950, end: 1300, x: 1, y: 4, msg: "up the fight! you battled"},
            { start: 1050, end: 1300, x: 1, y: 5, msg: "bravely. and your fees"},
            { start: 1150, end: 1300, x: 1, y: 6, msg: "are really quite reasonable."},

            { start: 1450, end: 1700, x: 1, y: 3, msg: "until we meet again..."},
            { start: 1900, end: 2600, x: 6, y: 10, msg: "thank you very much"},
            { start: 1900, end: 2600, x: 7, y: 11, msg: "for your playing"},

            { start: 2800, end: 3500, x: 10, y: 10, msg:  "a game by"},
            { start: 2800, end: 3500, x: 10, y: 11, msg:  "mrsp** speakr*er"},
            { start: 3000, end: 3500, x: 10, y: 13, msg: "2013"}


        ],

        init: function () {

            this.writers = this.text.map(function (t) {

                var w = new Writer(this.font, t.x * 16, t.y * 16, t.msg, 3);
                w.start = t.start;
                w.end = t.end;

                return w;

            }, this);

            this.theme.play();

        },

        tick: function () {

            if(this.time++ < 40) {
                return;

            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.tick();
                }
            }, this);


            if (this.time > 3600 || (Ω.input.pressed("draw") && this.time > 100)) {
                game.setScreen(new HiScoreEntryScreen(game.players[0].score));
            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            if (this.time > 350 && this.time < 1700) {
                this.client.render(gfx, 13 * 16, 10 * 16);
            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.render(gfx);
                }
            }, this);


        }

    });

    window.EndScreen = EndScreen;

}(Ω));
